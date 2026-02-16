import { databases, storage } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';
import { ID, Query } from 'appwrite';

/** Place-shaped object used by home card, profile page, and dashboard (same as main app Place type). */
export interface PlaceLike {
    $id?: string;
    id?: string | number;
    name: string;
    description?: string;
    mainImage?: string;
    profilePicture?: string;
    images?: string[];
    galleryImages?: Array<{ imageUrl: string; caption?: string; header?: string; description?: string }>;
    location?: string;
    address?: string;
    city?: string;
    coordinates?: string | number[] | { lat: number; lng: number };
    whatsappNumber?: string;
    contactNumber?: string;
    price60?: number | string;
    price90?: number | string;
    price120?: number | string;
    pricing?: string | Record<string, number>;
    operatingHours?: string;
    openingTime?: string;
    closingTime?: string;
    rating?: number;
    reviewCount?: number;
    facialTypes?: string | string[];
    facialServices?: string | string[];
    status?: string;
    isLive?: boolean;
    islive?: boolean;
    amenities?: string[];
    [key: string]: any;
}

export interface FacialPlace {
    $id?: string;
    facialPlaceId?: string;
    placeId?: string | number;
    collectionName?: string;
    category?: string;
    name: string;
    description?: string;
    address?: string;
    location?: string;
    city?: string;
    websiteurl?: string;
    ownerWhatsApp?: string;
    whatsappnumber?: string;
    mainimage?: string;
    profilePicture?: string;
    galleryImages?: string;
    galleryimages?: string;
    pricing?: string;
    prices?: string;
    facialservices?: string;
    facialtypes?: string;
    facialTypes?: string;
    openingtime?: string;
    closingtime?: string;
    openclosetime?: string;
    statusonline?: string;
    status?: string;
    islive?: boolean;
    discounted?: boolean;
    discountpercentage?: number;
    discountendtime?: string;
    starrate?: string;
    rating?: number;
    reviewcount?: number;
    distancekm?: string;
    popularityScore?: number;
    averageSessionDuration?: number;
    equipmentList?: string;
    dateadded?: string;
    lastUpdate?: string;
    coordinates?: any;
    [key: string]: any;
}

export interface FacialPlaceImage {
    $id?: string;
    fileId: string;
    facialPlaceId: string;
    imageUrl: string;
    imageType: 'main' | 'profile' | 'gallery';
}

/** Map Appwrite document to Place-like shape for home card, profile, and dashboard. */
function docToPlaceLike(doc: any): PlaceLike {
    let gallery: Array<{ imageUrl: string; caption?: string; header?: string; description?: string }> = [];
    const galleryRaw = doc.galleryImages || doc.galleryimages;
    if (galleryRaw) {
        try {
            const arr = typeof galleryRaw === 'string' ? JSON.parse(galleryRaw) : galleryRaw;
            gallery = (Array.isArray(arr) ? arr : []).map((item: any) => ({
                imageUrl: item.imageUrl || item.url || '',
                caption: item.caption ?? item.header ?? '',
                header: item.header ?? item.caption ?? item.title ?? '',
                description: item.description ?? item.caption ?? '',
            }));
        } catch {
            gallery = [];
        }
    }
    let pricingObj: Record<string, number> = {};
    const pricingRaw = doc.pricing || doc.prices;
    if (pricingRaw) {
        try {
            pricingObj = typeof pricingRaw === 'string' ? JSON.parse(pricingRaw) : pricingRaw;
        } catch {
            pricingObj = {};
        }
    }
    let facialTypesArr: string[] = [];
    const ftRaw = doc.facialTypes || doc.facialtypes;
    if (ftRaw) {
        try {
            facialTypesArr = typeof ftRaw === 'string' ? JSON.parse(ftRaw) : Array.isArray(ftRaw) ? ftRaw : [];
        } catch {
            facialTypesArr = [];
        }
    }
    const coords = doc.coordinates;
    let lat = 0, lng = 0;
    if (Array.isArray(coords) && coords.length >= 2) {
        lng = Number(coords[0]);
        lat = Number(coords[1]);
    } else if (coords && typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
        lat = Number((coords as any).lat);
        lng = Number((coords as any).lng);
    }
    return {
        $id: doc.$id,
        id: doc.$id || doc.placeId || doc.id,
        name: doc.name || 'Facial Clinic',
        description: doc.description || '',
        mainImage: doc.mainimage || doc.mainImage || '',
        profilePicture: doc.profilePicture || doc.mainimage || doc.mainImage || '',
        galleryImages: gallery,
        location: doc.location || doc.address || '',
        address: doc.location || doc.address || '',
        city: doc.city || '',
        coordinates: coords,
        whatsappNumber: doc.whatsappnumber || doc.ownerWhatsApp || doc.whatsappNumber || '',
        contactNumber: doc.whatsappnumber || doc.ownerWhatsApp || '',
        price60: pricingObj['60'] ?? pricingObj[60] ?? doc.price60 ?? 0,
        price90: pricingObj['90'] ?? pricingObj[90] ?? doc.price90 ?? 0,
        price120: pricingObj['120'] ?? pricingObj[120] ?? doc.price120 ?? 0,
        pricing: pricingObj,
        operatingHours: doc.openingtime && doc.closingtime ? `${doc.openingtime} - ${doc.closingtime}` : doc.openclosetime || '',
        openingTime: doc.openingtime || doc.openingTime,
        closingTime: doc.closingtime || doc.closingTime,
        rating: Number(doc.rating ?? doc.starrate ?? doc.reviewcount) || 4.8,
        reviewCount: Number(doc.reviewCount ?? doc.reviewcount) || 0,
        facialTypes: facialTypesArr.length ? facialTypesArr : doc.facialTypes,
        status: doc.status || doc.statusonline || 'Open',
        isLive: doc.islive !== false,
        islive: doc.islive !== false,
        amenities: doc.amenities ? (typeof doc.amenities === 'string' ? JSON.parse(doc.amenities) : doc.amenities) : [],
        lat,
        lng,
        latitude: lat,
        longitude: lng,
        ...doc,
    };
}

class FacialPlaceService {
    private collectionId = APPWRITE_CONFIG.collections.facial_places;
    private bucketId = APPWRITE_CONFIG.facialPlacesBucketId;
    private databaseId = APPWRITE_CONFIG.databaseId;

    /**
     * Get place by provider/document id (for dashboard load). Returns Place-like shape.
     */
    async getByProviderId(providerId: string): Promise<PlaceLike | null> {
        if (!providerId) return null;
        try {
            const doc = await databases.getDocument(
                this.databaseId,
                this.collectionId,
                providerId
            );
            if (doc && (doc as any).$id) return docToPlaceLike(doc);
        } catch (e: any) {
            if (e?.code !== 404) console.warn('Facial place getByProviderId:', e?.message || e);
        }
        try {
            const resp = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.equal('placeId', providerId), Query.limit(1)]
            );
            if (resp.documents.length > 0) return docToPlaceLike(resp.documents[0]);
        } catch (e2: any) {
            console.warn('Facial place placeId lookup:', e2?.message || e2);
        }
        return null;
    }

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
            
            // 🔗 AUTO-GENERATE SHARE LINK for new facial place
            try {
                console.log('🔗 [Facial Place] Auto-generating share link...');
                const { shareLinkService } = await import('./shareLinkService');
                const facialPlaceName = data.name || 'Facial Place';
                const facialPlaceCity = data.address?.split(',')[0] || 'Bali'; // Extract city from address
                
                const shareLink = await shareLinkService.createShareLink(
                    'facial',
                    document.$id,
                    facialPlaceName,
                    facialPlaceCity
                );
                
                console.log('✅ [Facial Place] Share link created:', {
                    slug: shareLink.slug,
                    shortId: shareLink.shortId,
                    entityId: shareLink.entityId
                });
            } catch (shareLinkError) {
                console.warn('⚠️ [Facial Place] Share link creation failed (non-critical):', shareLinkError);
                // Don't fail the creation if share link creation fails
            }
            
            return document as unknown as FacialPlace;
        } catch (error) {
            console.error('Error creating facial place:', error);
            throw error;
        }
    }

    /**
     * Get all facial places as Place-like array (for home page and profile).
     */
    async getAll(limit = 100): Promise<PlaceLike[]> {
        try {
            const response = await databases.listDocuments(
                this.databaseId,
                this.collectionId,
                [Query.limit(limit), Query.orderDesc('$createdAt')]
            );
            return (response.documents || []).map((doc: any) => docToPlaceLike(doc));
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
     * Get facial place by ID (Place-like for profile page).
     */
    async getById(id: string): Promise<PlaceLike | null> {
        try {
            const document = await databases.getDocument(
                this.databaseId,
                this.collectionId,
                id
            );
            return docToPlaceLike(document);
        } catch (error) {
            console.error('Error fetching facial place by ID:', error);
            return null;
        }
    }

    /**
     * Update facial place. Accepts Place-like or dashboard payload (snake_case or camelCase).
     */
    async update(id: string, data: Partial<FacialPlace> & Record<string, any>): Promise<PlaceLike> {
        try {
            const payload: Record<string, any> = { ...data, lastUpdate: new Date().toISOString() };
            if (payload.galleryImages && typeof payload.galleryImages !== 'string') {
                payload.galleryImages = JSON.stringify(payload.galleryImages);
            }
            if (payload.pricing && typeof payload.pricing !== 'string') {
                payload.pricing = JSON.stringify(payload.pricing);
            }
            if (payload.facialTypes && typeof payload.facialTypes !== 'string' && !Array.isArray(payload.facialTypes)) {
                payload.facialTypes = JSON.stringify(payload.facialTypes || []);
            }
            if (Array.isArray(payload.facialTypes)) {
                payload.facialTypes = JSON.stringify(payload.facialTypes);
            }
            const document = await databases.updateDocument(
                this.databaseId,
                this.collectionId,
                id,
                payload
            );
            return docToPlaceLike(document);
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
