import { databases, storage } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { ID, Query } from 'appwrite';

export interface FacialPlace {
    $id?: string;
    facialPlaceId: string;
    collectionName: string;
    category: string;
    name: string;
    description?: string;
    address?: string;
    websiteurl?: string;
    facialservices?: string; // JSON array
    facialtypes?: string; // JSON array
    prices?: string; // JSON object
    facialtimes?: string; // JSON array
    openclosetime?: string;
    statusonline?: string;
    discounted?: boolean;
    starrate?: string;
    distancekm?: string;
    popularityScore?: number;
    averageSessionDuration?: number;
    equipmentList?: string; // JSON array
    dateadded?: string;
    lastUpdate: string;
}

export interface FacialPlaceImage {
    $id?: string;
    fileId: string;
    facialPlaceId: string;
    imageUrl: string;
    imageType: 'main' | 'profile' | 'gallery';
}

class FacialPlaceService {
    private collectionId = APPWRITE_CONFIG.collections.facial_places;
    private bucketId = APPWRITE_CONFIG.facialPlacesBucketId;
    private databaseId = APPWRITE_CONFIG.databaseId;

    /**
     * Create a new facial place
     */
    async create(data: Omit<FacialPlace, '$id'>): Promise<FacialPlace> {
        try {
            const document = await databases.createDocument(
                this.databaseId,
                this.collectionId,
                ID.unique(),
                {
                    ...data,
                    lastUpdate: new Date().toISOString(),
                }
            );
            return document as unknown as FacialPlace;
        } catch (error) {
            console.error('Error creating facial place:', error);
            throw error;
        }
    }

    /**
     * Get all facial places
     */
    async getAll(limit = 100): Promise<FacialPlace[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.limit(limit), Query.orderDesc('$createdAt')]
            );
            return response.documents as unknown as FacialPlace[];
        } catch (error) {
            console.error('Error fetching facial places:', error);
            return [];
        }
    }

    /**
     * Get facial places by category
     */
    async getByCategory(category: string, limit = 50): Promise<FacialPlace[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('category', category),
                    Query.limit(limit),
                    Query.orderDesc('popularityScore')
                ]
            );
            return response.documents as unknown as FacialPlace[];
        } catch (error) {
            console.error('Error fetching facial places by category:', error);
            return [];
        }
    }

    /**
     * Get online facial places
     */
    async getOnlinePlaces(limit = 50): Promise<FacialPlace[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('statusonline', 'live'),
                    Query.limit(limit),
                    Query.orderDesc('popularityScore')
                ]
            );
            return response.documents as unknown as FacialPlace[];
        } catch (error) {
            console.error('Error fetching online facial places:', error);
            return [];
        }
    }

    /**
     * Get discounted facial places
     */
    async getDiscounted(limit = 20): Promise<FacialPlace[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.equal('discounted', true),
                    Query.equal('statusonline', 'live'),
                    Query.limit(limit),
                    Query.orderDesc('popularityScore')
                ]
            );
            return response.documents as unknown as FacialPlace[];
        } catch (error) {
            console.error('Error fetching discounted facial places:', error);
            return [];
        }
    }

    /**
     * Get facial place by ID
     */
    async getById(id: string): Promise<FacialPlace | null> {
        try {
            const document = await databases.getDocument(
                this.databaseId,
                this.collectionId,
                id
            );
            return document as unknown as FacialPlace;
        } catch (error) {
            console.error('Error fetching facial place by ID:', error);
            return null;
        }
    }

    /**
     * Update facial place
     */
    async update(id: string, data: Partial<FacialPlace>): Promise<FacialPlace> {
        try {
            const document = await databases.updateDocument(
                this.databaseId,
                this.collectionId,
                id,
                {
                    ...data,
                    lastUpdate: new Date().toISOString(),
                }
            );
            return document as unknown as FacialPlace;
        } catch (error) {
            console.error('Error updating facial place:', error);
            throw error;
        }
    }

    /**
     * Delete facial place
     */
    async delete(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                this.databaseId,
                this.collectionId,
                id
            );
        } catch (error) {
            console.error('Error deleting facial place:', error);
            throw error;
        }
    }

    /**
     * Upload image to facial places bucket
     */
    async uploadImage(file: File, facialPlaceId: string): Promise<string> {
        try {
            const response = await storage.createFile(
                this.bucketId,
                ID.unique(),
                file
            );
            
            // Get file URL
            const fileUrl = storage.getFileView(this.bucketId, response.$id);
            return fileUrl.toString();
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    /**
     * Delete image from bucket
     */
    async deleteImage(fileId: string): Promise<void> {
        try {
            await storage.deleteFile(this.bucketId, fileId);
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    /**
     * Search facial places by name or description
     */
    async search(searchTerm: string, limit = 20): Promise<FacialPlace[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [
                    Query.search('name', searchTerm),
                    Query.limit(limit)
                ]
            );
            return response.documents as unknown as FacialPlace[];
        } catch (error) {
            console.error('Error searching facial places:', error);
            return [];
        }
    }

    /**
     * Parse facial services JSON
     */
    parseFacialServices(services?: string): string[] {
        if (!services) return [];
        try {
            return JSON.parse(services);
        } catch {
            return [];
        }
    }

    /**
     * Parse facial types JSON
     */
    parseFacialTypes(types?: string): string[] {
        if (!types) return [];
        try {
            return JSON.parse(types);
        } catch {
            return [];
        }
    }

    /**
     * Parse prices JSON
     */
    parsePrices(prices?: string): { [key: string]: number } {
        if (!prices) return {};
        try {
            return JSON.parse(prices);
        } catch {
            return {};
        }
    }

    /**
     * Parse equipment list JSON
     */
    parseEquipmentList(equipment?: string): string[] {
        if (!equipment) return [];
        try {
            return JSON.parse(equipment);
        } catch {
            return [];
        }
    }
}

export const facialPlaceService = new FacialPlaceService();
