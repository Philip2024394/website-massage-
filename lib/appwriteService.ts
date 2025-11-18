// Main image URLs for therapist cards on HOME PAGE (stored in Appwrite)
import type { MonthlyAgentMetrics } from '../types';
const THERAPIST_MAIN_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4181001758526d84/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4182001d05a11a19/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4183001a3a6fd0de/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4184001bba3a3a9d/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418500198158d9d3/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe41860014a143394d/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418700130b19a410/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4188000e00025cea/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4189000abe1fd8d6/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418a0008edd3281a/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418b0007ac3e55ba/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c0001a5b36c2c/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418c0039995990e9/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418d00337f9be339/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418e0034947bfaa6/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe418f0031bcb56ded/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4190002fc09e44fe/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4191002e5db0dfef/view?project=68f23b11000d25eb3664',
];

// Live menu image URLs for hotel/villa therapist cards (7 images - stored in Appwrite)
const LIVE_MENU_THERAPIST_IMAGES = [
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4192003445db55a5/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4193002fea8ca8b3/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4194002b1ef92ede/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe419500258663d862/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4196001f02b409df/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe419700157b08b70c/view?project=68f23b11000d25eb3664',
    'https://syd.cloud.appwrite.io/v1/storage/buckets/68f76bdd002387590584/files/68fe4198000f867f6e47/view?project=68f23b11000d25eb3664',
];

// Helper functions to assign main images without repeats until pool is exhausted
const IMAGE_POOL_STORAGE_KEY = 'therapist_main_image_pool_v2';
const IMAGE_POOL_HASH_KEY = 'therapist_main_image_pool_hash_v2';

const hashImageList = (list: string[]): string => {
    // Simple stable hash
    const data = list.join('|');
    let h = 0;
    for (let i = 0; i < data.length; i++) {
        h = (h << 5) - h + data.charCodeAt(i);
        h |= 0;
    }
    return String(h);
};

const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const getNonRepeatingMainImage = (index: number): string => {
    // If no window (e.g., server or script), fall back to deterministic cycle
    if (typeof window === 'undefined') {
        return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
    }

    try {
        const storedHash = localStorage.getItem(IMAGE_POOL_HASH_KEY);
        const currentHash = hashImageList(THERAPIST_MAIN_IMAGES);
        let pool: string[] | null = null;

        if (storedHash === currentHash) {
            const raw = localStorage.getItem(IMAGE_POOL_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length === THERAPIST_MAIN_IMAGES.length) {
                    pool = parsed as string[];
                }
            }
        }

        if (!pool) {
            pool = shuffle(THERAPIST_MAIN_IMAGES);
            localStorage.setItem(IMAGE_POOL_STORAGE_KEY, JSON.stringify(pool));
            localStorage.setItem(IMAGE_POOL_HASH_KEY, currentHash);
        }

        return pool[index % pool.length];
    } catch (_e) {
        // If localStorage blocked, gracefully fallback
        return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
    }
};

// Helper function to get random live menu image
export const getRandomLiveMenuImage = (): string => {
    return LIVE_MENU_THERAPIST_IMAGES[Math.floor(Math.random() * LIVE_MENU_THERAPIST_IMAGES.length)];
};

// --- Image Upload Service ---
export const imageUploadService = {
    async uploadProfileImage(base64Image: string): Promise<string> {
        try {
            console.log('📤 uploadProfileImage started, base64 length:', base64Image.length);
            
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
            if (!base64Data) {
                throw new Error('Invalid base64 image format');
            }
            
            console.log('🔄 Converting base64 to blob...');
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            console.log('📦 Blob created, size:', blob.size);
            
            // Create a File object
            const fileName = `profile_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            console.log('📁 File created:', fileName, 'Size:', file.size);
            console.log('☁️ Uploading to Appwrite Storage...');
            console.log('Bucket ID:', APPWRITE_CONFIG.bucketId);
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            console.log('✅ File uploaded successfully! File ID:', response.$id);
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            console.log('🔗 Generated URL:', fileUrl);
            
            return fileUrl;
        } catch (error) {
            console.error('❌ Error uploading profile image:', error);
            if (error instanceof Error) {
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
            }
            throw error;
        }
    }
};

// --- Custom Links Service for Drawer ---
export const customLinksService = {
    async uploadIcon(base64Image: string): Promise<string> {
        try {
            // Convert base64 to blob
            const base64Data = base64Image.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });
            
            // Create a File object
            const fileName = `icon_${Date.now()}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });
            
            // Upload to Appwrite Storage
            const response = await storage.createFile(
                APPWRITE_CONFIG.bucketId,
                ID.unique(),
                file
            );
            
            // Return the file view URL
            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${response.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
            return fileUrl;
        } catch (error) {
            console.error('Error uploading icon:', error);
            throw error;
        }
    },
    
    async create(link: { name: string; url: string; icon: string }): Promise<any> {
        try {
            // Upload icon to storage first if it's a base64 image
            let iconUrl = link.icon;
            if (link.icon.startsWith('data:image')) {
                iconUrl = await this.uploadIcon(link.icon);
            }
            
            // Generate a unique customLinkId as an integer
            const customLinkId = Date.now();
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks,
                'unique()',
                {
                    name: link.name,
                    title: link.name,
                    url: link.url,
                    icon: iconUrl,
                    customLinkId,
                    createdAt: new Date().toISOString()
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
            return response;
        } catch (error) {
            console.error('Error creating custom link:', error);
            throw error;
        }
    },
    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching custom links:', error);
            return [];
        }
    },
    async delete(id: string): Promise<void> {
        try {
            // First, try to update permissions before deleting (in case they weren't set properly)
            try {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.customLinks,
                    id,
                    {},
                    [
                        Permission.read(Role.any()),
                        Permission.update(Role.any()),
                        Permission.delete(Role.any())
                    ]
                );
            } catch (permError) {
                console.log('Could not update permissions, attempting direct delete:', permError);
            }
            
            // Now delete the document
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks,
                id
            );
        } catch (error) {
            console.error('Error deleting custom link:', error);
            throw error;
        }
    },
    
    async update(id: string, link: { name: string; url: string; icon: string }): Promise<any> {
        try {
            // Upload icon to storage first if it's a new base64 image
            let iconUrl = link.icon;
            if (link.icon.startsWith('data:image')) {
                iconUrl = await this.uploadIcon(link.icon);
            }
            
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.customLinks,
                id,
                {
                    name: link.name,
                    title: link.name,
                    url: link.url,
                    icon: iconUrl,
                },
                [
                    Permission.read(Role.any()),
                    Permission.update(Role.any()),
                    Permission.delete(Role.any())
                ]
            );
            return response;
        } catch (error) {
            console.error('Error updating custom link:', error);
            throw error;
        }
    }
};
// Appwrite service - Real implementation
import { Client, Databases, Account, Query, Storage, ID, Permission, Role } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { rateLimitedDb } from './rateLimitService';
import type { AgentVisit } from '../types';


// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);
const account = new Account(client);
const storage = new Storage(client);

export const appwriteClient = client;
export const appwriteDatabases = databases;
export const appwriteAccount = account;

export const therapistService = {
    async create(therapist: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                'unique()',
                therapist
            );
            return response;
        } catch (error) {
            console.error('Error creating therapist:', error);
            throw error;
        }
    },
    async getTherapists(): Promise<any[]> {
        return this.getAll();
    },
    async getAll(): Promise<any[]> {
        try {
            console.log('📋 Fetching all therapists from collection:', APPWRITE_CONFIG.collections.therapists);
            const response = await rateLimitedDb.listDocuments(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists
            );
            console.log('✅ Fetched therapists:', response.documents.length);
            
            // Add random main images and normalize status to therapists
            const therapistsWithImages = response.documents.map((therapist: any, index: number) => {
                const assignedMainImage = therapist.mainImage || getNonRepeatingMainImage(index);
                
                // Normalize status from database (lowercase) to enum format (capitalized)
                const normalizeStatus = (status: string) => {
                    if (!status) return 'Offline';
                    const lowercaseStatus = status.toLowerCase();
                    if (lowercaseStatus === 'available') return 'Available';
                    if (lowercaseStatus === 'busy') return 'Busy';
                    if (lowercaseStatus === 'offline') return 'Offline';
                    return status; // Return as-is if unknown
                };
                
                console.log(`🎭 [Therapist Images] ${therapist.name || 'Unknown'} (ID: ${therapist.id || therapist.$id}):`);
                console.log(`   - Original mainImage: ${therapist.mainImage || 'None'}`);
                console.log(`   - Assigned mainImage: ${assignedMainImage}`);
                console.log(`   - Profile picture: ${therapist.profilePicture || 'None'}`);
                console.log(`   - Status normalized: ${therapist.status} -> ${normalizeStatus(therapist.status)}`);
                
                // Extract busy timer data from description if present
                let extractedBusyTimer = null;
                let cleanDescription = therapist.description || '';
                
                const timerMatch = cleanDescription.match(/\[TIMER:(.+?)\]/);
                if (timerMatch) {
                    try {
                        extractedBusyTimer = JSON.parse(timerMatch[1]);
                        // Remove timer data from description for display
                        cleanDescription = cleanDescription.replace(/\[TIMER:.+?\]/, '').trim();
                    } catch (e) {
                        console.warn('Failed to parse timer data for therapist:', therapist.name);
                    }
                }

                return {
                    ...therapist,
                    mainImage: assignedMainImage,
                    status: normalizeStatus(therapist.status),
                    availability: normalizeStatus(therapist.availability || therapist.status),
                    description: cleanDescription,
                    busyUntil: extractedBusyTimer?.busyUntil || null,
                    busyDuration: extractedBusyTimer?.busyDuration || null
                };
            });
            
            return therapistsWithImages;
        } catch (error) {
            console.error('❌ Error fetching therapists:', error);
            console.error('Database ID:', APPWRITE_CONFIG.databaseId);
            console.error('Collection ID:', APPWRITE_CONFIG.collections.therapists);
            return [];
        }
    },
    async getById(id: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            return response;
        } catch (error) {
            console.error('Error fetching therapist:', error);
            return null;
        }
    },
    async getByEmail(email: string): Promise<any[]> {
        try {
            // Check if collection is disabled
            if (!APPWRITE_CONFIG.collections.therapists) {
                console.warn('⚠️ Therapist collection is disabled - returning empty array');
                return [];
            }

            console.log('🔍 Searching for therapist by email:', email);
            const response = await rateLimitedDb.listDocuments(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('email', email)]
            );
            console.log('📋 Found therapists with email:', response.documents.length);
            
            // Normalize status for each therapist found
            const normalizeStatus = (status: string) => {
                if (!status) return 'Offline';
                const lowercaseStatus = status.toLowerCase();
                if (lowercaseStatus === 'available') return 'Available';
                if (lowercaseStatus === 'busy') return 'Busy';
                if (lowercaseStatus === 'offline') return 'Offline';
                return status; // Return as-is if unknown
            };
            
            const normalizedTherapists = response.documents.map((therapist: any) => {
                // Extract busy timer data from description if present
                let extractedBusyTimer = null;
                let cleanDescription = therapist.description || '';
                
                const timerMatch = cleanDescription.match(/\[TIMER:(.+?)\]/);
                if (timerMatch) {
                    try {
                        extractedBusyTimer = JSON.parse(timerMatch[1]);
                        // Remove timer data from description for display
                        cleanDescription = cleanDescription.replace(/\[TIMER:.+?\]/, '').trim();
                    } catch (e) {
                        console.warn('Failed to parse timer data for therapist:', therapist.name);
                    }
                }

                return {
                    ...therapist,
                    status: normalizeStatus(therapist.status),
                    availability: normalizeStatus(therapist.availability || therapist.status),
                    description: cleanDescription,
                    busyUntil: extractedBusyTimer?.busyUntil || null,
                    busyDuration: extractedBusyTimer?.busyDuration || null
                };
            });
            
            return normalizedTherapists;
        } catch (error) {
            console.error('❌ Error finding therapist by email:', error);
            
            // Provide detailed error context
            if (error && typeof error === 'object') {
                const err = error as any;
                if (err.code === 404) {
                    console.error('🔍 Collection not found:', APPWRITE_CONFIG.collections.therapists);
                }
            }
            
            return [];
        }
    },
    async getCurrentUser(): Promise<any> {
        try {
            return await account.get();
        } catch (error) {
            console.warn('⚠️ User not authenticated or session expired');
            // Don't log full error details for auth - it's expected when not logged in
            return null;
        }
    },
    async update(id: string, data: any): Promise<any> {
        try {
            // Check if therapist collection is disabled
            if (!APPWRITE_CONFIG.collections.therapists) {
                console.warn('⚠️ Therapist collection is disabled - using mock update');
                return { 
                    ...data, 
                    $id: id, 
                    $updatedAt: new Date().toISOString(),
                    _mockUpdate: true 
                };
            }

            console.log('🔍 Attempting to update therapist:', {
                id,
                databaseId: APPWRITE_CONFIG.databaseId,
                collectionId: APPWRITE_CONFIG.collections.therapists,
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                data
            });
            
            console.log('📊 Appwrite client configuration:', {
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                databaseExists: !!APPWRITE_CONFIG.databaseId,
                collectionExists: !!APPWRITE_CONFIG.collections.therapists
            });
            
            // First, get the current document to preserve all existing data
            console.log('📋 Fetching current document to preserve all fields...');
            const currentDocument = await rateLimitedDb.getDocument(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            
            console.log('📋 Current document data:', currentDocument);
            
            // Start with current document data and update only the provided fields
            const mappedData: any = {
                // Core required fields - preserve from current document
                name: currentDocument.name,
                email: currentDocument.email,
                profilePicture: currentDocument.profilePicture || '',
                description: currentDocument.description || '',
                whatsappNumber: currentDocument.whatsappNumber || '',
                location: currentDocument.location || '',
                specialization: currentDocument.specialization || '',
                yearsOfExperience: currentDocument.yearsOfExperience || 0,
                isLicensed: currentDocument.isLicensed || false,
                hourlyRate: currentDocument.hourlyRate || 100,
                isLive: currentDocument.isLive || false,
                status: currentDocument.status || 'Available',
                availability: currentDocument.availability || 'Available',
                
                // Required pricing fields - preserve from current document (convert to strings)
                price60: String(currentDocument.price60 || 100),
                price90: String(currentDocument.price90 || 150),
                price120: String(currentDocument.price120 || 200),
                
                // Optional fields - preserve if they exist
                ...(currentDocument.pricing && { pricing: currentDocument.pricing }),
                ...(currentDocument.massageTypes && { massageTypes: currentDocument.massageTypes }),
                ...(currentDocument.coordinates && { coordinates: currentDocument.coordinates }),
                
                // Discount fields - preserve from current document
                discountPercentage: currentDocument.discountPercentage || 0,
                discountDuration: currentDocument.discountDuration || 0,
                discountEndTime: currentDocument.discountEndTime || null,
                isDiscountActive: currentDocument.isDiscountActive || false,
            };
            
            // Now update with the provided data
            if (data.status) {
                mappedData.status = data.status.toLowerCase(); // Database expects lowercase for status
                // Convert status to proper capitalized format for availability field
                const statusCapitalized = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
                mappedData.availability = statusCapitalized; // Database expects capitalized for availability
            }
            
            // Handle explicit availability field (ensure it's capitalized)
            if (data.availability) {
                // Ensure availability is properly capitalized
                const availabilityValue = data.availability;
                if (typeof availabilityValue === 'string') {
                    // If it's lowercase, convert to proper case
                    if (availabilityValue.toLowerCase() === 'available') {
                        mappedData.availability = 'Available';
                    } else if (availabilityValue.toLowerCase() === 'busy') {
                        mappedData.availability = 'Busy';
                    } else if (availabilityValue.toLowerCase() === 'offline') {
                        mappedData.availability = 'Offline';
                    } else {
                        mappedData.availability = availabilityValue; // Use as-is if already correct
                    }
                }
            }
            
            // Update other fields only if provided
            if (data.name) mappedData.name = data.name;
            if (data.email) mappedData.email = data.email;
            if (data.profilePicture) mappedData.profilePicture = data.profilePicture;
            if (data.description) mappedData.description = data.description;
            if (data.whatsappNumber) mappedData.whatsappNumber = data.whatsappNumber;
            if (data.location) mappedData.location = data.location;
            if (data.pricing) mappedData.pricing = data.pricing;
            if (data.price60 !== undefined) mappedData.price60 = String(data.price60);
            if (data.price90 !== undefined) mappedData.price90 = String(data.price90);
            if (data.price120 !== undefined) mappedData.price120 = String(data.price120);
            if (data.massageTypes) mappedData.massageTypes = data.massageTypes;
            if (data.languages) mappedData.languages = data.languages;
            if (data.coordinates) mappedData.coordinates = data.coordinates;
            if (data.isLive !== undefined) mappedData.isLive = data.isLive;
            if (data.hourlyRate) mappedData.hourlyRate = data.hourlyRate;
            if (data.specialization) mappedData.specialization = data.specialization;
            if (data.yearsOfExperience) mappedData.yearsOfExperience = data.yearsOfExperience;
            if (data.isLicensed !== undefined) mappedData.isLicensed = data.isLicensed;
            
            // Handle discount fields - preserve from current document if not provided
            if (data.discountPercentage !== undefined) mappedData.discountPercentage = data.discountPercentage;
            if (data.discountDuration !== undefined) mappedData.discountDuration = data.discountDuration;
            if (data.discountEndTime !== undefined) mappedData.discountEndTime = data.discountEndTime;
            if (data.isDiscountActive !== undefined) mappedData.isDiscountActive = data.isDiscountActive;
            
            console.log('💰 Discount fields being updated:', {
                discountPercentage: data.discountPercentage,
                discountDuration: data.discountDuration,
                discountEndTime: data.discountEndTime,
                isDiscountActive: data.isDiscountActive,
                mappedData: {
                    discountPercentage: mappedData.discountPercentage,
                    discountDuration: mappedData.discountDuration,
                    discountEndTime: mappedData.discountEndTime,
                    isDiscountActive: mappedData.isDiscountActive
                }
            });
            
            // Handle busy timer fields - store in existing description field as JSON for now
            if (data.busyUntil !== undefined || data.busyDuration !== undefined) {
                try {
                    // Get current description to preserve it
                    let currentDesc = currentDocument.description || '';
                    let busyTimerData = null;
                    
                    // Try to extract existing timer data from description
                    const timerMatch = currentDesc.match(/\[TIMER:(.+?)\]/);
                    if (timerMatch) {
                        try {
                            busyTimerData = JSON.parse(timerMatch[1]);
                            // Remove old timer data from description
                            currentDesc = currentDesc.replace(/\[TIMER:.+?\]/, '').trim();
                        } catch (e) {
                            console.warn('Failed to parse existing timer data');
                        }
                    }
                    
                    // Update timer data
                    if (data.busyUntil !== undefined || data.busyDuration !== undefined) {
                        busyTimerData = {
                            busyUntil: data.busyUntil ?? busyTimerData?.busyUntil ?? null,
                            busyDuration: data.busyDuration ?? busyTimerData?.busyDuration ?? null
                        };
                        
                        // Only add timer data if busyUntil exists
                        if (busyTimerData.busyUntil) {
                            mappedData.description = currentDesc + (currentDesc ? ' ' : '') + `[TIMER:${JSON.stringify(busyTimerData)}]`;
                        } else {
                            mappedData.description = currentDesc;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to handle busy timer data:', e);
                }
            }
            
            // Remove Appwrite metadata fields
            const { $id: _$id, $createdAt: _$createdAt, $updatedAt: _$updatedAt, $permissions: _$permissions, $databaseId: _$databaseId, $collectionId, ...cleanMappedData } = mappedData;
            
            console.log('📋 Final mapped data for Appwrite schema (with all required fields):', cleanMappedData);
            console.log('🔍 Status/Availability values being sent:', {
                status: cleanMappedData.status,
                availability: cleanMappedData.availability,
                originalStatus: data.status,
                originalAvailability: data.availability
            });
            
            const response = await rateLimitedDb.updateDocument(
                databases,
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id,
                cleanMappedData
            );
            
            console.log('✅ Therapist updated successfully:', response.$id);
            return response;
        } catch (error) {
            console.error('❌ Error updating therapist:', error);
            console.error('🔧 Collection ID (confirmed valid):', APPWRITE_CONFIG.collections.therapists);
            console.error('🔧 Database ID:', APPWRITE_CONFIG.databaseId);
            console.error('🔧 Document ID:', id);
            console.error('🔧 Original data:', data);
            
            // Provide more detailed error information
            if (error && typeof error === 'object') {
                const err = error as any;
                if (err.code === 404) {
                    console.error('🔍 Collection or document not found');
                    console.error('💡 Suggestion: Verify the collection and document exist');
                } else if (err.code === 401) {
                    console.error('🔐 Authentication error - user may not be logged in');
                } else if (err.code === 403) {
                    console.error('🚫 Permission denied - check collection permissions');
                }
            }
            
            // Return a graceful fallback instead of throwing to prevent UI crashes
            console.warn('🛡️ Returning graceful fallback to prevent UI crash');
            return { 
                ...data, 
                $id: id, 
                $updatedAt: new Date().toISOString(),
                _fallback: true,
                _error: (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    },
    async delete(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
        } catch (error) {
            console.error('Error deleting therapist:', error);
            throw error;
        }
    },
    async search(query: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.search('name', query)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error searching therapists:', error);
            return [];
        }
    }
};

export const placeService = {
    async create(place: any): Promise<any> {
        try {
            if (!APPWRITE_CONFIG.collections.places || APPWRITE_CONFIG.collections.places === '') {
                console.warn('⚠️ Places collection disabled - cannot create place');
                throw new Error('Places collection not configured');
            }
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                'unique()',
                place
            );
            return response;
        } catch (error) {
            console.error('Error creating place:', error);
            throw error;
        }
    },
    async getByProviderId(providerId: string): Promise<any | null> {
        // Find a place document by the provider's id field (stored in the document attributes)
        try {
            // Try matching both as string and number to be safe
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [
                    // Appwrite equal can take an array of values
                    Query.equal('id', [providerId, Number(providerId)])
                ]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error finding place by provider id:', error);
            return null;
        }
    },
    async getPlaces(): Promise<any[]> {
        console.log('🔥 placeService.getPlaces() CALLED!');
        return this.getAll();
    },
    async getAll(): Promise<any[]> {
        try {
            console.log('📋 Fetching all PLACES from Appwrite collection:', APPWRITE_CONFIG.collections.places);
            console.log('🔧 Database ID:', APPWRITE_CONFIG.databaseId);
            console.log('🌐 Endpoint:', APPWRITE_CONFIG.endpoint);
            console.log('📦 Project ID:', APPWRITE_CONFIG.projectId);
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places
            );
            
            console.log('✅ Fetched PLACES from Appwrite:', response.documents.length);
            response.documents.forEach((p: any) => {
                console.log(`  🏨 ${p.name} - isLive: ${p.isLive}, ID: ${p.$id}`);
            });
            
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching places from Appwrite:', error);
            console.error('❌ Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: (error as any)?.code || 'Unknown code',
                type: (error as any)?.type || 'Unknown type'
            });
            
            if (error instanceof Error && error.message.includes('Collection with the requested ID could not be found')) {
                console.error('💡 Collection ID may be incorrect. Check lib/appwrite.config.ts');
            }
            
            return [];
        }
    },
    async getById(id: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                id
            );
            return response;
        } catch (error) {
            console.error('Error fetching place:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating place:', error);
            throw error;
        }
    },
    async delete(id: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                id
            );
        } catch (error) {
            console.error('Error deleting place:', error);
            throw error;
        }
    },
    async getByEmail(email: string): Promise<any[]> {
        try {
            console.log('🔍 Searching for massage place by email:', email);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('email', email)]
            );
            console.log('📋 Found massage places with email:', response.documents.length);
            return response.documents;
        } catch (error) {
            console.error('Error finding massage place by email:', error);
            return [];
        }
    },
    async getCurrentUser(): Promise<any> {
        try {
            return await account.get();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }
};

// ================================
// Agent Shares Analytics Service
// ================================
type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy';

export const agentShareAnalyticsService = {
    async trackShareInitiated(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
        platform: SharePlatform;
    }): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                ID.unique(),
                {
                    eventType: 'agent_share_initiated',
                    agentCode: params.agentCode,
                    providerType: params.providerType,
                    providerId: String(params.providerId),
                    platform: params.platform,
                    createdAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.warn('Failed to track share initiated', e);
        }
    },
    async trackShareClick(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
        platform?: SharePlatform;
        userAgent?: string;
    }): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                ID.unique(),
                {
                    eventType: 'agent_share_click',
                    agentCode: params.agentCode,
                    providerType: params.providerType,
                    providerId: String(params.providerId),
                    platform: params.platform || 'copy',
                    userAgent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
                    createdAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.warn('Failed to track share click', e);
        }
    },
    async getCountsByPlatform(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
    }): Promise<Record<SharePlatform, number>> {
        try {
            const res = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                [
                    Query.equal('eventType', 'agent_share_click'),
                    Query.equal('agentCode', params.agentCode),
                    Query.equal('providerType', params.providerType),
                    Query.equal('providerId', String(params.providerId)),
                    Query.limit(200)
                ]
            );
            const counts: Record<SharePlatform, number> = {
                whatsapp: 0,
                facebook: 0,
                twitter: 0,
                linkedin: 0,
                telegram: 0,
                copy: 0
            };
            for (const d of res.documents as any[]) {
                const p = (d.platform || 'copy') as SharePlatform;
                if (counts[p] !== undefined) counts[p]++;
            }
            return counts;
        } catch (e) {
            console.warn('Failed to fetch share click counts', e);
            return { whatsapp: 0, facebook: 0, twitter: 0, linkedin: 0, telegram: 0, copy: 0 };
        }
    }
};

// Convenience lookups by agentCode for recruits
export const recruitLookupService = {
    async therapistsByAgentCode(agentCode: string): Promise<any[]> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('agentCode', agentCode), Query.limit(100)]
            );
            return docs.documents;
        } catch (e) {
            console.warn('Failed to list therapists by agentCode', e);
            return [];
        }
    },
    async placesByAgentCode(agentCode: string): Promise<any[]> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('agentCode', agentCode), Query.limit(100)]
            );
            return docs.documents;
        } catch (e) {
            console.warn('Failed to list places by agentCode', e);
            return [];
        }
    }
};

export const userService = {
    async create(user: any): Promise<any> {
        // Users are created via authService, this stores additional user profile data
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                'unique()',
                user
            );
            return response;
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    },
    async getCustomerByEmail(email: string): Promise<any | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.equal('email', email), Query.limit(1)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error fetching customer by email:', error);
            throw error;
        }
    },
    async updateCustomerById(docId: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                docId,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating customer by id:', error);
            throw error;
        }
    },
    async updateCustomerByEmail(email: string, data: any): Promise<any> {
        try {
            const existing = await userService.getCustomerByEmail(email);
            if (existing) {
                return await userService.updateCustomerById(existing.$id, data);
            }
            // If not exists, create minimal doc
            return await userService.create({ email, ...data });
        } catch (error) {
            console.error('Error updating customer by email:', error);
            throw error;
        }
    },
    async getByUserId(userId: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.users,
                [Query.equal('userId', userId)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error fetching user by userId:', error);
            throw error;
        }
    },
    async getByEmail(email: string): Promise<any> {
        try {
            // Search across all user collections
            const therapistResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('email', email)]
            );
            if (therapistResponse.documents.length > 0) {
                return therapistResponse.documents[0];
            }
            
            const placeResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('email', email)]
            );
            if (placeResponse.documents.length > 0) {
                return placeResponse.documents[0];
            }
            // Also check users collection for customers
            const customer = await userService.getCustomerByEmail(email);
            if (customer) return customer;
            
            return null;
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        // This is generic - should know which collection to update
        // For now, implement as a pass-through
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists, // default to therapists
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
};

export const agentService = {
    async create(agent: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                'unique()',
                agent
            );
            return response;
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    },
    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching agents:', error);
            return [];
        }
    },
    async getByCode(code: string): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                [Query.equal('code', code)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('Error fetching agent by code:', error);
            throw error;
        }
    },
    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating agent:', error);
            throw error;
        }
    }
};

// ================================
// Admin Agent Overview Aggregations
// ================================
export const adminAgentOverviewService = {
    /** Count therapists referencing an agentCode */
    async countTherapistsByAgentCode(agentCode: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('agentCode', agentCode)]
            );
            return docs.total; // Appwrite provides total
        } catch (error) {
            console.error('Error counting therapists by agentCode:', error);
            return 0;
        }
    },
    /** Count places referencing an agentCode */
    async countPlacesByAgentCode(agentCode: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('agentCode', agentCode)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting places by agentCode:', error);
            return 0;
        }
    },
    /** Count visits logged for agent */
    async countVisits(agentId: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                [Query.equal('agentId', agentId)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting visits:', error);
            return 0;
        }
    },
    /** Get latest monthly metrics snapshot */
    async getLatestMonthlySnapshot(agentId: string): Promise<MonthlyAgentMetrics | null> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'monthly_agent_metrics_collection_id',
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('month'),
                    Query.limit(1)
                ]
            );
            const doc = docs.documents[0];
            if (!doc) return null;
            return {
                $id: doc.$id,
                agentId: doc.agentId,
                agentCode: doc.agentCode,
                month: doc.month,
                newSignUpsCount: doc.newSignUpsCount,
                recurringSignUpsCount: doc.recurringSignUpsCount,
                targetMet: doc.targetMet,
                streakCount: doc.streakCount,
                commissionRateApplied: doc.commissionRateApplied,
                calculatedAt: doc.calculatedAt
            };
        } catch (error) {
            console.error('Error fetching latest monthly snapshot:', error);
            return null;
        }
    },
    /** Derive commission due placeholder (base + recurring) */
    calculateCommissionDue(snapshot: MonthlyAgentMetrics | null): number {
        if (!snapshot) return 0;
        const baseRate = snapshot.commissionRateApplied || 20; // percent
        const recurringRate = snapshot.targetMet ? 10 : 0;
        // Placeholder monetary assumption: each signup worth fixed 100 unit (replace with real booking revenue later)
        const assumedValuePerSignup = 100;
        const base = (snapshot.newSignUpsCount * assumedValuePerSignup) * (baseRate / 100);
        const recurring = (snapshot.recurringSignUpsCount * assumedValuePerSignup) * (recurringRate / 100);
        return Math.round(base + recurring);
    },
    /** List overview rows for all agents */
    async listAgentOverviews(): Promise<Array<{
        agentId: string; name: string; agentCode: string; tier?: string; visits: number; therapistSignups: number; placeSignups: number; monthNew: number; monthRecurring: number; targetMet: boolean; streakCount: number; commissionDue: number; payoutReady: boolean;
    }>> {
        try {
            const agents = await agentService.getAll();
            const rows: Array<any> = [];
            for (const a of agents) {
                const agentId = a.$id || a.agentId;
                const [therapistCount, placeCount, visitCount, snapshot] = await Promise.all([
                    this.countTherapistsByAgentCode(a.agentCode),
                    this.countPlacesByAgentCode(a.agentCode),
                    this.countVisits(agentId),
                    this.getLatestMonthlySnapshot(agentId)
                ]);
                const commissionDue = this.calculateCommissionDue(snapshot);
                rows.push({
                    agentId,
                    name: a.name,
                    agentCode: a.agentCode,
                    tier: a.tier,
                    visits: visitCount,
                    therapistSignups: therapistCount,
                    placeSignups: placeCount,
                    monthNew: snapshot?.newSignUpsCount || 0,
                    monthRecurring: snapshot?.recurringSignUpsCount || 0,
                    targetMet: !!snapshot?.targetMet,
                    streakCount: snapshot?.streakCount || 0,
                    commissionDue,
                    payoutReady: !!(a.bankAccountNumber && a.bankName && a.bankAccountName)
                });
            }
            return rows;
        } catch (error) {
            console.error('Error building agent overviews:', error);
            return [];
        }
    }
};

export const authService = {
    async getCurrentUser(): Promise<any> {
        try {
            return await account.get();
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },
    async login(email: string, password: string): Promise<any> {
        try {
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before login');
            } catch {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }
            
            await account.createEmailPasswordSession(email, password);
            return await account.get();
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },
    async register(
        email: string,
        password: string,
        name: string,
        options?: { autoLogin?: boolean }
    ): Promise<any> {
        try {
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before registration');
            } catch {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }
            
            const response = await account.create('unique()', email, password, name);
            // Auto-login after registration unless explicitly disabled
            const shouldAutoLogin = options?.autoLogin !== false;
            if (shouldAutoLogin) {
                await account.createEmailPasswordSession(email, password);
            }
            return response;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    },
    async logout(): Promise<void> {
        try {
            await account.deleteSession('current');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    },
    async createAnonymousSession(): Promise<any> {
        // Anonymous sessions are disabled/not supported on this environment (Appwrite Cloud)
        // Avoid 501/401 noise and continue as guest.
        console.log('ℹ️ Skipping anonymous session creation (disabled in this environment)');
        return null;
    }
};

// --- Translations Service ---
export const translationsService = {
    async getAll(): Promise<any> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations
            );
            
            // Convert array of documents to translations object
            if (response.documents.length === 0) return null;
            
            // Initialize with all supported languages
            const translations: any = {
                en: {}, id: {}, zh: {}, ja: {}, ko: {}, es: {}, fr: {}, de: {}, 
                it: {}, pt: {}, ru: {}, ar: {}, hi: {}, th: {}, vi: {}, nl: {}, 
                tr: {}, pl: {}, sv: {}, da: {}
            };
            
            response.documents.forEach((doc: any) => {
                const { language, Key, value } = doc; // Use the generic schema attributes
                try {
                    // Initialize language object if it doesn't exist
                    if (!translations[language]) {
                        translations[language] = {};
                    }
                    // Parse JSON value if it's a string that looks like JSON
                    const parsedValue = typeof value === 'string' && value.startsWith('{') 
                        ? JSON.parse(value) 
                        : value;
                    translations[language][Key] = parsedValue;
                } catch {
                    // Initialize language object if it doesn't exist
                    if (!translations[language]) {
                        translations[language] = {};
                    }
                    translations[language][Key] = value;
                }
            });
            
            return translations;
        } catch (error) {
            console.error('Error fetching translations:', error);
            return null;
        }
    },

    async set(language: string, key: string, value: any): Promise<void> {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        
        try {
            console.log(`🔄 Setting translation: ${language}.${key} = "${stringValue.substring(0, 100)}${stringValue.length > 100 ? '...' : ''}"`);

            // For large values, split them into smaller parts
            if (stringValue.length > 900) {
                console.log(`📦 Large translation detected (${stringValue.length} chars), splitting into chunks...`);
                await this.setLargeTranslation(language, key, stringValue);
                return;
            }

            // Check if a document with this language+key combination already exists
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                [
                    Query.equal('language', language),
                    Query.equal('Key', key)
                ]
            );
            
            // Prepare data for both schema formats
            const baseData = {
                language: language,
                Key: key,
                value: stringValue, // Keep full value in the generic field (65000 char limit)
                lastUpdated: new Date().toISOString(),
                autoTranslated: true
            };
            
            // Add individual language columns with safe values
            const languageData: any = { ...baseData };
            
            // Set required language fields - use short summary for large content
            const safeValue = stringValue.length > 900 ? `${stringValue.substring(0, 900)}...` : stringValue;
            languageData.en = language === 'en' ? safeValue : '';
            languageData.id = language === 'id' ? safeValue : '';
            
            // Set optional language fields only if they match the current language
            if (language === 'zh') languageData.zh = safeValue;
            if (language === 'ja') languageData.ja = safeValue;
            if (language === 'ko') languageData.ko = safeValue;
            if (language === 'ru') languageData.ru = safeValue;
            if (language === 'fr') languageData.fr = safeValue;
            
            if (existingDocs.documents.length > 0) {
                // Update existing document
                const docId = existingDocs.documents[0].$id;
                const existingDoc = existingDocs.documents[0];
                
                // Preserve existing language values and only update the current language
                languageData.en = language === 'en' ? safeValue : (existingDoc.en || '');
                languageData.id = language === 'id' ? safeValue : (existingDoc.id || '');
                if (language === 'zh') languageData.zh = safeValue;
                if (language === 'ja') languageData.ja = safeValue;
                if (language === 'ko') languageData.ko = safeValue;
                if (language === 'ru') languageData.ru = safeValue;
                if (language === 'fr') languageData.fr = safeValue;
                
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    docId,
                    languageData
                );
                console.log(`✅ Updated existing: ${language}.${key}`);
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    ID.unique(),
                    languageData
                );
                console.log(`✅ Created new: ${language}.${key}`);
            }
        } catch (error: any) {
            console.error('❌ Error setting translation:', error);
            throw error;
        }
    },

    async setLargeTranslation(language: string, key: string, value: string): Promise<void> {
        try {
            // Store the full value in the generic schema (which has 65000 char limit)
            const mainData: any = {
                language: language,
                Key: key,
                value: value, // Full content goes here
                lastUpdated: new Date().toISOString(),
                autoTranslated: true,
                // Set required individual columns to a summary
                en: language === 'en' ? `${value.substring(0, 900)}...` : '',
                id: language === 'id' ? `${value.substring(0, 900)}...` : ''
            };

            // Add the specific language column if it's one of the optional ones
            if (language === 'zh') mainData.zh = `${value.substring(0, 900)}...`;
            if (language === 'ja') mainData.ja = `${value.substring(0, 900)}...`;
            if (language === 'ko') mainData.ko = `${value.substring(0, 900)}...`;
            if (language === 'ru') mainData.ru = `${value.substring(0, 900)}...`;
            if (language === 'fr') mainData.fr = `${value.substring(0, 900)}...`;

            // Check if document exists
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                [
                    Query.equal('language', language),
                    Query.equal('Key', key)
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    existingDocs.documents[0].$id,
                    mainData
                );
                console.log(`✅ Updated large translation: ${language}.${key} (${value.length} chars)`);
            } else {
                // Create new
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    ID.unique(),
                    mainData
                );
                console.log(`✅ Created large translation: ${language}.${key} (${value.length} chars)`);
            }
        } catch (error: any) {
            console.error('❌ Error setting large translation:', error);
            throw error;
        }
    },

    async syncFromLocal(translations: any): Promise<void> {
        try {
            const languages = Object.keys(translations);
            
            for (const lang of languages) {
                const keys = Object.keys(translations[lang]);
                
                for (const key of keys) {
                    await this.set(lang, key, translations[lang][key]);
                    console.log(`Synced ${lang}.${key}`);
                }
            }
            
            console.log('Translation sync complete!');
        } catch (error) {
            console.error('Error syncing translations:', error);
            throw error;
        }
    }
};

// --- Review Service ---
export const reviewService = {
    async create(review: {
        providerId: number;
        providerType: 'therapist' | 'place';
        providerName: string;
        rating: number;
        comment?: string;
        whatsapp: string;
        status: 'pending' | 'approved' | 'rejected';
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                ID.unique(),
                {
                    ...review,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Review created successfully:', response.$id);
            return response;
        } catch (error) {
            console.error('❌ Error creating review:', error);
            throw error;
        }
    },

    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            return [];
        }
    },

    async getByProvider(providerId: number, providerType: 'therapist' | 'place'): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('providerType', providerType),
                    Query.equal('status', 'approved')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider reviews:', error);
            return [];
        }
    },

    async updateStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                reviewId,
                { status }
            );
            console.log(`✅ Review ${reviewId} ${status}`);
            return response;
        } catch (error) {
            console.error(`Error updating review status to ${status}:`, error);
            throw error;
        }
    },

    async delete(reviewId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                reviewId
            );
            console.log('✅ Review deleted:', reviewId);
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }
};

// ============================================================================
// BOOKING SERVICE - Real-time booking with Appwrite backend
// ============================================================================
export const bookingService = {
    async create(booking: {
        providerId: string;  // Changed to string to match Appwrite
        providerType: 'therapist' | 'place';
        providerName: string;
        userId?: string;
        userName?: string;
        service: '60' | '90' | '120';
        startTime: string;
        duration?: number;  // Duration in minutes
        totalCost?: number;
        paymentMethod?: string;
        hotelId?: string;
        hotelGuestName?: string;
        hotelRoomNumber?: string;
    }): Promise<any> {
        try {
            // Capture affiliate code at booking-time (client-side localStorage)
            let affiliateCode: string | null = null;
            try {
                const mod = await import('./affiliateAttribution');
                affiliateCode = (mod.getCode && mod.getCode()) || null;
            } catch {}

            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                console.warn('⚠️ Bookings collection disabled - simulating booking creation');
                const mockBooking = {
                    $id: `mock_booking_${Date.now()}`,
                    bookingId: `mock_booking_${Date.now()}`,
                    bookingDate: new Date().toISOString(),
                    providerId: booking.providerId,
                    providerType: booking.providerType,
                    providerName: booking.providerName,
                    service: booking.service,
                    startTime: booking.startTime,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    hotelId: booking.hotelId || null,
                    hotelGuestName: booking.hotelGuestName || null,
                    hotelRoomNumber: booking.hotelRoomNumber || null,
                    status: 'Pending',
                    duration: booking.duration || parseInt(booking.service),
                    totalCost: booking.totalCost || 0,
                    paymentMethod: booking.paymentMethod || 'Unpaid'
                };
                console.log('✅ Mock booking created:', mockBooking.$id);
                // Record attribution if code exists
                if (affiliateCode) {
                    try {
                        const { recordAttribution } = await import('./affiliateService');
                        await recordAttribution({
                            bookingId: mockBooking.$id,
                            providerId: booking.providerId,
                            providerType: booking.providerType,
                            providerName: booking.providerName,
                            affiliateCode,
                            totalCost: booking.totalCost || 0
                        });
                    } catch (e) {
                        console.warn('Attribution recording failed (mock):', e);
                    }
                }
                return mockBooking;
            }
            
            const bookingId = ID.unique();
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    bookingId: bookingId,
                    bookingDate: new Date().toISOString(),
                    providerId: booking.providerId,
                    providerType: booking.providerType,
                    providerName: booking.providerName,
                    service: booking.service,
                    startTime: booking.startTime,
                    userId: booking.userId || null,
                    userName: booking.userName || null,
                    hotelId: booking.hotelId || null,
                    hotelGuestName: booking.hotelGuestName || null,
                    hotelRoomNumber: booking.hotelRoomNumber || null,
                    status: 'Pending',
                    duration: booking.duration || parseInt(booking.service),
                    totalCost: booking.totalCost || 0,
                    paymentMethod: booking.paymentMethod || 'Unpaid'
                }
            );
            console.log('✅ Booking created successfully:', response.$id);
            // Record attribution if affiliate code present
            if (affiliateCode) {
                try {
                    const { recordAttribution } = await import('./affiliateService');
                    await recordAttribution({
                        bookingId: response.$id,
                        providerId: booking.providerId,
                        providerType: booking.providerType,
                        providerName: booking.providerName,
                        affiliateCode,
                        totalCost: booking.totalCost || 0
                    });
                } catch (e) {
                    console.warn('Attribution recording failed:', e);
                }
            }
            
            // Create notification for provider
            await notificationService.create({
                providerId: parseInt(booking.providerId),
                message: `New booking request from ${booking.userName || booking.hotelGuestName || 'Guest'} for ${booking.service} minutes`,
                type: 'booking_request',
                bookingId: response.$id
            });
            
            return response;
        } catch (error) {
            console.error('❌ Error creating booking:', error);
            throw error;
        }
    },

    async getById(bookingId: string): Promise<any> {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId
            );
            return response;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    async getAll(): Promise<any[]> {
        try {
            if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
                console.warn('⚠️ Bookings collection disabled - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            return [];
        }
    },

    async getByUser(userId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            return [];
        }
    },

    async getByProvider(providerId: string, providerType: 'therapist' | 'place'): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('providerType', providerType),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider bookings:', error);
            return [];
        }
    },

    async updateStatus(
        bookingId: string, 
        status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'
    ): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                { status }
            );
            console.log(`✅ Booking ${bookingId} status updated to ${status}`);
            return response;
        } catch (error) {
            console.error(`Error updating booking status to ${status}:`, error);
            throw error;
        }
    },

    async updatePayment(
        bookingId: string,
        paymentMethod: string,
        totalCost: number
    ): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId,
                {
                    paymentMethod,
                    totalCost
                }
            );
            console.log(`✅ Booking ${bookingId} payment updated`);
            return response;
        } catch (error) {
            console.error('Error updating booking payment:', error);
            throw error;
        }
    },

    async getPending(providerId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('status', 'Pending')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pending bookings:', error);
            return [];
        }
    },

    async getByHotel(hotelId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.equal('hotelId', hotelId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching hotel bookings:', error);
            return [];
        }
    },

    async delete(bookingId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                bookingId
            );
            console.log('✅ Booking deleted:', bookingId);
        } catch (error) {
            console.error('Error deleting booking:', error);
            throw error;
        }
    },

    async cancel(bookingId: string, reason?: string): Promise<void> {
        try {
            const nowIso = new Date().toISOString();
            try {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    bookingId,
                    {
                        status: 'Cancelled',
                        cancelledAt: nowIso,
                        // Attempt to persist reason if attribute exists
                        cancellationReason: reason || null
                    }
                );
            } catch (updateErr) {
                console.warn('⚠️ Full cancel update failed, retrying without reason:', (updateErr as any)?.message);
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    bookingId,
                    {
                        status: 'Cancelled',
                        cancelledAt: nowIso
                    }
                );
            }

            try {
                await notificationService.create({
                    type: 'booking_cancelled',
                    message: `Booking ${bookingId} was cancelled${reason ? `: ${reason}` : ''}.`,
                    bookingId
                });
            } catch (notifyErr) {
                console.warn('⚠️ Failed to send cancellation notification:', (notifyErr as any)?.message);
            }

            console.log('✅ Booking cancelled:', bookingId);
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    }
};

// ============================================================================
// NOTIFICATION SERVICE - Push notifications and in-app alerts
// ============================================================================
export const notificationService = {
    async create(notification: {
        providerId?: number;
        message: string;
        type?: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'review_received' | 'promotion' | 'system' | 'whatsapp_contact' | 'place_profile_pending' | 'place_profile_approved' | 'place_profile_rejected';
        bookingId?: string;
        // New admin notification fields
        title?: string;
        recipientType?: 'admin' | 'place' | 'therapist' | 'user';
        recipientId?: string;
        data?: any;
        priority?: 'low' | 'medium' | 'high';
        isRead?: boolean;
    }): Promise<any> {
        try {
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.warn('⚠️ Notifications collection disabled - simulating notification creation');
                const mockNotification = {
                    $id: `mock_notification_${Date.now()}`,
                    ...notification,
                    isRead: notification.isRead || false,
                    createdAt: new Date().toISOString()
                };
                console.log('✅ Mock notification created:', mockNotification.$id);
                return mockNotification;
            }
            
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                ID.unique(),
                {
                    ...notification,
                    isRead: notification.isRead || false,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Notification created:', response.$id);
            
            // TODO: Integrate with push notification service (Firebase/OneSignal)
            // await this.sendPushNotification(notification.providerId, notification.message);
            
            return response;
        } catch (error) {
            console.error('❌ Error creating notification:', error);
            throw error;
        }
    },

    async getAll(): Promise<any[]> {
        try {
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.warn('⚠️ Notifications collection disabled - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching all notifications:', error);
            return [];
        }
    },

    async update(notificationId: string, updateData: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId,
                updateData
            );
            console.log('✅ Notification updated:', notificationId);
            return response;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    },

    async getByProvider(providerId: number): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.equal('providerId', providerId),
                    Query.orderDesc('createdAt'),
                    Query.limit(50)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async getUnread(providerId: number | string): Promise<any[]> {
        try {
            // 🔒 SECURITY FIX: Check if notifications collection is configured
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.log('ℹ️ Notifications collection not configured - returning empty array');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.equal('providerId', providerId),
                    Query.equal('isRead', false),
                    Query.orderDesc('createdAt')
                ]
            );
            return response.documents;
        } catch (error) {
            // Silently handle missing notifications collection or permissions
            if ((error as any)?.message?.includes('Collection with the requested ID could not be found') ||
                (error as any)?.message?.includes('missing scopes') ||
                (error as any)?.message?.includes('Unauthorized')) {
                console.log('ℹ️ Notifications not available - collection disabled or insufficient permissions');
            } else {
                console.error('Error fetching unread notifications:', error);
            }
            return [];
        }
    },

    async markAsRead(notificationId: string): Promise<any> {
        try {
            // 🔒 SECURITY FIX: Check if notifications collection is configured
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.log('ℹ️ Notifications collection not configured - skipping mark as read');
                return null;
            }
            
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId,
                { isRead: true }
            );
            console.log('✅ Notification marked as read:', notificationId);
            return response;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    async markAllAsRead(providerId: number): Promise<void> {
        try {
            const unreadNotifications = await this.getUnread(providerId);
            await Promise.all(
                unreadNotifications.map(notification => 
                    this.markAsRead(notification.$id)
                )
            );
            console.log('✅ All notifications marked as read');
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },

    // Create WhatsApp contact notification
    async createWhatsAppContactNotification(providerId: number, providerName: string): Promise<any> {
        try {
            const notification = await this.create({
                providerId,
                message: `Someone clicked "Chat Now" to contact you on WhatsApp!`,
                type: 'whatsapp_contact'
            });
            
            console.log(`📱 WhatsApp contact notification created for provider ${providerName} (ID: ${providerId})`);
            return notification;
        } catch (error) {
            console.error('Error creating WhatsApp contact notification:', error);
            // Don't throw - we don't want to break the WhatsApp flow if notification fails
            return null;
        }
    },

    async delete(notificationId: string): Promise<void> {
        try {
            // 🔒 SECURITY FIX: Check if notifications collection is configured
            if (!APPWRITE_CONFIG.collections.notifications || APPWRITE_CONFIG.collections.notifications === '') {
                console.log('ℹ️ Notifications collection not configured - skipping delete');
                return;
            }
            
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                notificationId
            );
            console.log('✅ Notification deleted:', notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
};

// ============================================================================
// MESSAGING SERVICE - In-app chat between users and providers
// ============================================================================
export const messagingService = {
    async sendMessage(message: {
        conversationId: string;
        senderId: string;
        senderType: 'user' | 'therapist' | 'place';
        senderName: string;
        receiverId: string;
        receiverType: 'user' | 'therapist' | 'place';
        receiverName: string;
        content: string;
        bookingId?: string;
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'chat_messages', // Add to config
                ID.unique(),
                {
                    ...message,
                    isRead: false,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Message sent:', response.$id);
            
            // Create notification for receiver
            await notificationService.create({
                providerId: parseInt(message.receiverId),
                message: `New message from ${message.senderName}`,
                type: 'system',
                bookingId: message.bookingId
            });
            
            return response;
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    },

    async getConversation(conversationId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages_collection_id',
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return [];
        }
    },

    async getUserConversations(userId: string): Promise<any[]> {
        try {
            // Get all messages where user is sender or receiver
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages_collection_id',
                [
                    Query.or([
                        Query.equal('senderId', userId),
                        Query.equal('receiverId', userId)
                    ]),
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );
            
            // Group by conversationId and get latest message per conversation
            const conversations = new Map();
            response.documents.forEach((msg: any) => {
                if (!conversations.has(msg.conversationId)) {
                    conversations.set(msg.conversationId, msg);
                }
            });
            
            return Array.from(conversations.values());
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            return [];
        }
    },

    async markAsRead(messageId: string): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages_collection_id',
                messageId,
                { isRead: true }
            );
            return response;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }
};

// ============================================================================
// PRICING SERVICE - Dynamic pricing with discounts and packages
// ============================================================================
export const pricingService = {
    async getPricing(
        _providerId: number, // Reserved for future provider-specific pricing
        _providerType: 'therapist' | 'place', // Reserved for future provider-specific pricing
        serviceType: '60' | '90' | '120',
        options?: {
            isHotelGuest?: boolean;
            agentReferral?: boolean;
            promotionCode?: string;
            dayOfWeek?: number; // 0-6, Sunday-Saturday
            timeOfDay?: number; // Hour 0-23
        }
    ): Promise<{
        basePrice: number;
        discounts: Array<{ type: string; amount: number; reason: string }>;
        surcharges: Array<{ type: string; amount: number; reason: string }>;
        finalPrice: number;
        commission: number;
        providerEarnings: number;
    }> {
        try {
            // Base prices (in IDR)
            const basePrices: Record<string, number> = {
                '60': 200000,
                '90': 300000,
                '120': 400000
            };
            
            const basePrice = basePrices[serviceType];
            const discounts: Array<{ type: string; amount: number; reason: string }> = [];
            const surcharges: Array<{ type: string; amount: number; reason: string }> = [];
            
            // Apply hotel guest discount (10%)
            if (options?.isHotelGuest) {
                discounts.push({
                    type: 'hotel_guest',
                    amount: basePrice * 0.10,
                    reason: 'Hotel Guest Discount'
                });
            }
            
            // Apply agent referral discount (5%)
            if (options?.agentReferral) {
                discounts.push({
                    type: 'agent_referral',
                    amount: basePrice * 0.05,
                    reason: 'Agent Referral Discount'
                });
            }
            
            // Weekend surcharge (Friday-Sunday, +15%)
            if (options?.dayOfWeek && [5, 6, 0].includes(options.dayOfWeek)) {
                surcharges.push({
                    type: 'weekend',
                    amount: basePrice * 0.15,
                    reason: 'Weekend Premium'
                });
            }
            
            // Peak hours surcharge (6PM-10PM, +20%)
            if (options?.timeOfDay && options.timeOfDay >= 18 && options.timeOfDay < 22) {
                surcharges.push({
                    type: 'peak_hours',
                    amount: basePrice * 0.20,
                    reason: 'Peak Hours Premium'
                });
            }
            
            // Early bird discount (6AM-9AM, -10%)
            if (options?.timeOfDay && options.timeOfDay >= 6 && options.timeOfDay < 9) {
                discounts.push({
                    type: 'early_bird',
                    amount: basePrice * 0.10,
                    reason: 'Early Bird Special'
                });
            }
            
            // Calculate final price
            const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);
            const totalSurcharges = surcharges.reduce((sum, s) => sum + s.amount, 0);
            const finalPrice = Math.round(basePrice - totalDiscounts + totalSurcharges);
            
            // Platform commission (15%)
            const commission = Math.round(finalPrice * 0.15);
            const providerEarnings = finalPrice - commission;
            
            return {
                basePrice,
                discounts,
                surcharges,
                finalPrice,
                commission,
                providerEarnings
            };
        } catch (error) {
            console.error('Error calculating pricing:', error);
            throw error;
        }
    },

    async createPackage(packageData: {
        name: string;
        description: string;
        providerId: number;
        providerType: 'therapist' | 'place';
        services: Array<{ type: '60' | '90' | '120'; quantity: number }>;
        discountPercentage: number;
        validUntil?: string;
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.packages || 'packages_collection_id', // Add to config
                ID.unique(),
                {
                    ...packageData,
                    isActive: true,
                    createdAt: new Date().toISOString()
                }
            );
            console.log('✅ Package created:', response.$id);
            return response;
        } catch (error) {
            console.error('❌ Error creating package:', error);
            throw error;
        }
    },

    async getActivePackages(providerId: number): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.packages || 'packages_collection_id',
                [
                    Query.equal('providerId', providerId),
                    Query.equal('isActive', true)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching packages:', error);
            return [];
        }
    }
};

// ============================================================================
// VERIFICATION SERVICE - Verified badge for therapists/places
// ============================================================================
export const verificationService = {
    async checkEligibility(providerId: number, providerType: 'therapist' | 'place'): Promise<{
        isEligible: boolean;
        reason: string;
        accountAge: number; // in days
        completedBookings: number;
        averageRating: number;
    }> {
        try {
            // Get provider data
            const provider = providerType === 'therapist' 
                ? await therapistService.getById(providerId.toString())
                : await placeService.getById(providerId.toString());
            
            if (!provider) {
                return {
                    isEligible: false,
                    reason: 'Provider not found',
                    accountAge: 0,
                    completedBookings: 0,
                    averageRating: 0
                };
            }
            
            // Calculate account age
            const createdAt = new Date(provider.createdAt || provider.$createdAt);
            const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
            
            // Get completed bookings
            const bookings = await bookingService.getByProvider(providerId.toString(), providerType);
            const completedBookings = bookings.filter((b: any) => b.status === 'Completed').length;
            
            // Get reviews and calculate average rating
            const reviews = await reviewService.getByProvider(providerId, providerType);
            const averageRating = reviews.length > 0
                ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
                : 0;
            
            // Verification criteria
            const minAccountAge = 90; // 3 months
            const minBookings = 10;
            const minRating = 4.0;
            
            const isEligible = 
                accountAge >= minAccountAge &&
                completedBookings >= minBookings &&
                averageRating >= minRating;
            
            let reason = '';
            if (!isEligible) {
                if (accountAge < minAccountAge) {
                    reason = `Account must be ${minAccountAge} days old (currently ${accountAge} days)`;
                } else if (completedBookings < minBookings) {
                    reason = `Need ${minBookings} completed bookings (currently ${completedBookings})`;
                } else if (averageRating < minRating) {
                    reason = `Need ${minRating} average rating (currently ${averageRating.toFixed(1)})`;
                }
            } else {
                reason = 'Eligible for verification badge';
            }
            
            return {
                isEligible,
                reason,
                accountAge,
                completedBookings,
                averageRating
            };
        } catch (error) {
            console.error('Error checking verification eligibility:', error);
            throw error;
        }
    },

    async applyForVerification(providerId: number, providerType: 'therapist' | 'place'): Promise<any> {
        try {
            const eligibility = await this.checkEligibility(providerId, providerType);
            
            if (!eligibility.isEligible) {
                throw new Error(`Not eligible for verification: ${eligibility.reason}`);
            }
            
            // Update provider with verified badge
            const updateData = {
                isVerified: true,
                verifiedAt: new Date().toISOString(),
                verificationBadge: 'verified'
            };
            
            if (providerType === 'therapist') {
                await therapistService.update(providerId.toString(), updateData);
            } else {
                await placeService.update(providerId.toString(), updateData);
            }
            
            console.log(`✅ Provider ${providerId} verified`);
            
            // Create notification
            await notificationService.create({
                providerId,
                message: 'Congratulations! Your profile has been verified with a verified badge.',
                type: 'system'
            });
            
            return { success: true, ...eligibility };
        } catch (error) {
            console.error('Error applying for verification:', error);
            throw error;
        }
    },

    async revokeVerification(providerId: number, providerType: 'therapist' | 'place', reason: string): Promise<void> {
        try {
            const updateData = {
                isVerified: false,
                verifiedAt: null,
                verificationBadge: null,
                verificationRevokedAt: new Date().toISOString(),
                verificationRevokedReason: reason
            };
            
            if (providerType === 'therapist') {
                await therapistService.update(providerId.toString(), updateData);
            } else {
                await placeService.update(providerId.toString(), updateData);
            }
            
            console.log(`✅ Verification revoked for provider ${providerId}`);
            
            // Create notification
            await notificationService.create({
                providerId,
                message: `Your verification badge has been revoked. Reason: ${reason}`,
                type: 'system'
            });
        } catch (error) {
            console.error('Error revoking verification:', error);
            throw error;
        }
    }
};

// Admin Message Service
export const adminMessageService = {
    /**
     * Get messages for an agent
     */
    async getMessages(agentId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.or([
                        Query.equal('senderId', agentId),
                        Query.equal('receiverId', agentId),
                        Query.equal('receiverId', 'admin')
                    ]),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching admin messages:', error);
            return [];
        }
    },

    /**
     * Send a message
     */
    async sendMessage(data: {
        senderId: string;
        senderName: string;
        senderType: 'agent' | 'admin';
        receiverId: string;
        message: string;
    }): Promise<any> {
        try {
            const messageData = {
                ...data,
                isRead: false,
                createdAt: new Date().toISOString()
            };

            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                ID.unique(),
                messageData
            );

            console.log('✅ Message sent:', response.$id);
            return response;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    /**
     * Mark messages as read
     */
    async markAsRead(agentId: string): Promise<void> {
        try {
            // Get unread messages for this agent
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.equal('receiverId', agentId),
                    Query.equal('isRead', false)
                ]
            );

            // Mark each as read
            const updatePromises = response.documents.map(doc =>
                databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    'admin_messages',
                    doc.$id,
                    { isRead: true }
                )
            );

            await Promise.all(updatePromises);
            console.log(`✅ Marked ${response.documents.length} messages as read`);
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    /**
     * Get unread message count
     */
    async getUnreadCount(agentId: string): Promise<number> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'admin_messages',
                [
                    Query.equal('receiverId', agentId),
                    Query.equal('isRead', false)
                ]
            );
            return response.total;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
};

// Hotel/Villa Booking Service
export const hotelVillaBookingService = {
    /**
     * Create a new hotel/villa guest booking
     */
    async createBooking(bookingData: any): Promise<any> {
        try {
            // Capture affiliate code
            let affiliateCode: string | null = null;
            try {
                const mod = await import('./affiliateAttribution');
                affiliateCode = (mod.getCode && mod.getCode()) || null;
            } catch {}

            const booking = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                ID.unique(),
                {
                    userId: bookingData.userId || 'guest',
                    hotelId: bookingData.hotelVillaId || bookingData.hotelId,
                    bookingDateTime: bookingData.startTime || new Date().toISOString(),
                    checkInDate: bookingData.checkInDate || bookingData.startTime || new Date().toISOString(),
                    checkOutDate: bookingData.checkOutDate || bookingData.endTime || new Date().toISOString(),
                    numberOfGuests: bookingData.numberOfGuests || 1,
                    roomType: bookingData.roomType || 'standard',
                    bookingId: bookingData.bookingId || `BK${Date.now()}`,
                    therapistId: bookingData.providerId || '',
                    therapistName: bookingData.providerName || '',
                    hotelName: bookingData.hotelVillaName || bookingData.hotelName || '',
                    hotelLocation: bookingData.hotelLocation || '',
                    guestName: bookingData.guestName || bookingData.userName || '',
                    roomNumber: bookingData.roomNumber || '',
                    duration: bookingData.duration || '60',
                    bookingTime: bookingData.startTime || new Date().toISOString(),
                    status: bookingData.status || 'pending',
                    price: bookingData.price || 0,
                    createdAt: new Date().toISOString(),
                    confirmedAt: null,
                    completedAt: null
                }
            );
            
            console.log('✅ Hotel/Villa booking created:', booking.$id);
            // Record attribution for venue bookings too
            if (affiliateCode) {
                try {
                    const { recordAttribution } = await import('./affiliateService');
                    await recordAttribution({
                        bookingId: booking.$id,
                        providerId: (bookingData.providerId || '').toString(),
                        providerType: 'therapist',
                        providerName: bookingData.providerName || '',
                        affiliateCode,
                        totalCost: bookingData.price || 0,
                        venueContext: {
                            hotelVillaId: bookingData.hotelVillaId || bookingData.hotelId,
                            hotelVillaName: bookingData.hotelVillaName || bookingData.hotelName,
                            hotelVillaType: bookingData.hotelVillaType || 'hotel'
                        }
                    });
                } catch (e) {
                    console.warn('Attribution recording failed (venue):', e);
                }
            }
            return booking;
        } catch (error) {
            console.error('Error creating hotel/villa booking:', error);
            throw error;
        }
    },

    /**
     * Get all bookings for a hotel/villa
     */
    async getBookingsByVenue(venueId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                [
                    Query.equal('hotelId', venueId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching venue bookings:', error);
            return [];
        }
    },

    /**
     * Get all bookings for a provider/therapist
     */
    async getBookingsByProvider(providerId: string, _providerType?: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                [
                    Query.equal('therapistId', providerId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching provider bookings:', error);
            return [];
        }
    },

    /**
     * Get booking by ID
     */
    async getBookingById(bookingId: string): Promise<any> {
        try {
            const booking = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                bookingId
            );
            return booking;
        } catch (error) {
            console.error('Error fetching booking:', error);
            throw error;
        }
    },

    /**
     * Update booking status
     */
    async updateBooking(bookingId: string, updates: any): Promise<any> {
        try {
            const booking = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                bookingId,
                updates
            );
            console.log('✅ Booking updated:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error updating booking:', error);
            throw error;
        }
    },

    /**
     * Provider confirms the booking
     */
    async confirmBooking(bookingId: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'confirmed',
                confirmedAt: new Date().toISOString()
            });
            console.log('✅ Booking confirmed:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error confirming booking:', error);
            throw error;
        }
    },

    /**
     * Provider indicates on the way
     */
    async setOnTheWay(bookingId: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'on_the_way'
            });
            console.log('✅ Provider on the way:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error setting on the way:', error);
            throw error;
        }
    },

    /**
     * Provider declines the booking
     */
    async declineBooking(bookingId: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'declined'
            });
            console.log('✅ Booking declined:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error declining booking:', error);
            throw error;
        }
    },

    /**
     * Complete a booking
     */
    async completeBooking(bookingId: string): Promise<any> {
        try {
            // First get the booking details
            const bookingDetails = await this.getBookingById(bookingId);
            
            const booking = await this.updateBooking(bookingId, {
                status: 'completed',
                completedAt: new Date().toISOString()
            });
            
            // Award coins to customer for completing booking
            if (bookingDetails?.userId) {
                try {
                    // Import coin configuration
                    const { calculateBookingCoins, getLoyaltyTier } = await import('./coinConfig');
                    
                    // Get customer's booking history to determine tier and bonuses
                    const customerBookings = await bookingService.getByUser(bookingDetails.userId);
                    const completedBookings = customerBookings.filter((b: any) => b.status === 'Completed').length;
                    const isFirstBooking = completedBookings === 0; // This will be their first completed booking
                    
                    // Determine loyalty tier
                    const loyaltyTier = getLoyaltyTier(completedBookings + 1); // +1 because this booking is now completed
                    
                    // Calculate total coins to award
                    const coinsToAward = calculateBookingCoins(isFirstBooking, loyaltyTier, false);
                    
                    // Award coins through coin service
                    await coinService.addCoins(
                        bookingDetails.userId,
                        'customer',
                        bookingDetails.userName || 'Customer',
                        coinsToAward,
                        `Booking completed - ${coinsToAward} coins earned`,
                        bookingId
                    );
                    
                    // Check if this is their first booking and complete any pending referral
                    if (isFirstBooking) {
                        try {
                            const { enhancedReferralService } = await import('./referralService');
                            await enhancedReferralService.completeReferral(bookingDetails.userId);
                        } catch (referralError) {
                            console.error('Error processing referral completion:', referralError);
                        }
                    }
                    
                    console.log(`💰 Awarded ${coinsToAward} coins to customer ${bookingDetails.userId} for booking completion`);
                    
                } catch (coinError) {
                    console.error('Error awarding coins for booking completion:', coinError);
                    // Don't fail the booking completion if coin awarding fails
                }
            }

            // Award coins to provider (therapist or massage place)
            if (bookingDetails?.providerId && bookingDetails?.providerType) {
                try {
                    const { providerRewardsService } = await import('./providerRewardsService');
                    const isWeekend = this.isWeekend(new Date());
                    
                    if (bookingDetails.providerType === 'therapist') {
                        await providerRewardsService.awardTherapistBookingCoins(
                            bookingDetails.providerId.toString(),
                            bookingDetails.providerName || 'Therapist',
                            bookingId,
                            bookingDetails.rating,
                            isWeekend,
                            bookingDetails.acceptedWithinMinutes
                        );
                    } else if (bookingDetails.providerType === 'place') {
                        await providerRewardsService.awardPlaceBookingCoins(
                            bookingDetails.providerId.toString(),
                            bookingDetails.providerName || 'Massage Place',
                            bookingId,
                            bookingDetails.rating,
                            parseInt(bookingDetails.service) || 60,
                            bookingDetails.isReturnCustomer
                        );
                    }
                } catch (providerError) {
                    console.error('Error awarding provider coins:', providerError);
                }
            }

            // Award coins to hotel/villa if this is a hotel/villa booking
            if (bookingDetails?.hotelVillaId && bookingDetails?.hotelVillaName) {
                try {
                    const { providerRewardsService } = await import('./providerRewardsService');
                    await providerRewardsService.awardHotelVillaBookingCoins(
                        bookingDetails.hotelVillaId.toString(),
                        bookingDetails.hotelVillaName,
                        bookingDetails.hotelVillaType || 'hotel',
                        bookingId,
                        bookingDetails.wasChatBooking || false
                    );
                } catch (hotelError) {
                    console.error('Error awarding hotel/villa coins:', hotelError);
                }
            }
            
            console.log('✅ Booking completed:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error completing booking:', error);
            throw error;
        }
    },

    /**
     * Helper method to check if date is weekend
     */
    isWeekend(date: Date): boolean {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday or Saturday
    },

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string, reason?: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'cancelled'
            });
            console.log('✅ Booking cancelled:', bookingId, reason ? `- ${reason}` : '');
            return booking;
        } catch (error) {
            console.error('Error cancelling booking:', error);
            throw error;
        }
    },

    /**
     * Find alternative providers within radius
     * Note: venueId reserved for future geolocation filtering
     */
    async findAlternativeProviders(
        _venueId: string,
        excludeIds: string[],
        providerType: 'therapist' | 'place'
    ): Promise<any[]> {
        try {
            const collectionId = providerType === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;

            // Query for available providers
            // Note: Distance filtering would require geolocation implementation
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [
                    Query.equal('status', 'available'),
                    Query.equal('hotelVillaServiceStatus', 'active'),
                    Query.limit(10)
                ]
            );

            // Filter out excluded IDs (since Query.notIn might not be available)
            const providers = response.documents.filter(
                (provider: any) => !excludeIds.includes(provider.$id)
            );

            return providers;
        } catch (error) {
            console.error('Error finding alternative providers:', error);
            return [];
        }
    },

    /**
     * Reassign booking to new provider
     */
    async reassignBooking(bookingId: string, newProviderId: string, newProviderName: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                therapistId: newProviderId,
                therapistName: newProviderName,
                status: 'pending'
            });

            console.log('✅ Booking reassigned:', bookingId, 'to', newProviderName);
            return booking;
        } catch (error) {
            console.error('Error reassigning booking:', error);
            throw error;
        }
    }
};

// ================================
// Agent Visit Service
// ================================

export const agentVisitService = {
    /**
     * Create a new agent visit record
     */
    async createVisit(visit: AgentVisit): Promise<AgentVisit> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                ID.unique(),
                {
                    agentId: visit.agentId.toString(),
                    agentName: visit.agentName,
                    agentCode: visit.agentCode,
                    providerName: visit.providerName,
                    providerType: visit.providerType,
                    whatsappNumber: visit.whatsappNumber,
                    visitDate: visit.visitDate,
                    locationLat: visit.location.lat,
                    locationLng: visit.location.lng,
                    locationAddress: visit.location.address,
                    locationTimestamp: visit.location.timestamp,
                    meetingNotes: visit.meetingNotes,
                    callbackDate: visit.callbackDate || '',
                    membershipAgreed: visit.membershipAgreed,
                    status: visit.status,
                    createdAt: visit.createdAt,
                    updatedAt: visit.updatedAt || ''
                }
            );

            console.log('✅ Agent visit created:', response.$id);
            
            return {
                ...visit,
                $id: response.$id
            };
        } catch (error) {
            console.error('Error creating agent visit:', error);
            throw error;
        }
    },

    /**
     * Get all visits by a specific agent
     */
    async getVisitsByAgent(agentId: string): Promise<AgentVisit[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('createdAt'),
                    Query.limit(100)
                ]
            );

            return response.documents.map((doc: any) => ({
                $id: doc.$id,
                agentId: doc.agentId,
                agentName: doc.agentName,
                agentCode: doc.agentCode,
                providerName: doc.providerName,
                providerType: doc.providerType,
                whatsappNumber: doc.whatsappNumber,
                visitDate: doc.visitDate,
                location: {
                    lat: doc.locationLat,
                    lng: doc.locationLng,
                    address: doc.locationAddress,
                    timestamp: doc.locationTimestamp
                },
                meetingNotes: doc.meetingNotes,
                callbackDate: doc.callbackDate || undefined,
                membershipAgreed: doc.membershipAgreed,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt || undefined
            }));
        } catch (error) {
            console.error('Error fetching agent visits:', error);
            return [];
        }
    },

    /**
     * Get all visits (Admin only)
     */
    async getAllVisits(filters?: {
        agentId?: string;
        providerType?: 'therapist' | 'place';
        membershipAgreed?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<AgentVisit[]> {
        try {
            const queries: string[] = [
                Query.orderDesc('createdAt'),
                Query.limit(500)
            ];

            // Add filters if provided
            if (filters?.agentId) {
                queries.push(Query.equal('agentId', filters.agentId));
            }
            if (filters?.providerType) {
                queries.push(Query.equal('providerType', filters.providerType));
            }
            if (filters?.membershipAgreed && filters.membershipAgreed !== 'all') {
                queries.push(Query.equal('membershipAgreed', filters.membershipAgreed));
            }
            if (filters?.status && filters.status !== 'all') {
                queries.push(Query.equal('status', filters.status));
            }

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                queries
            );

            let visits = response.documents.map((doc: any) => ({
                $id: doc.$id,
                agentId: doc.agentId,
                agentName: doc.agentName,
                agentCode: doc.agentCode,
                providerName: doc.providerName,
                providerType: doc.providerType,
                whatsappNumber: doc.whatsappNumber,
                visitDate: doc.visitDate,
                location: {
                    lat: doc.locationLat,
                    lng: doc.locationLng,
                    address: doc.locationAddress,
                    timestamp: doc.locationTimestamp
                },
                meetingNotes: doc.meetingNotes,
                callbackDate: doc.callbackDate || undefined,
                membershipAgreed: doc.membershipAgreed,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt || undefined
            }));

            // Client-side date filtering (since Appwrite Query might not support date range)
            if (filters?.dateFrom) {
                visits = visits.filter(visit => 
                    new Date(visit.visitDate) >= new Date(filters.dateFrom!)
                );
            }
            if (filters?.dateTo) {
                visits = visits.filter(visit => 
                    new Date(visit.visitDate) <= new Date(filters.dateTo!)
                );
            }

            return visits;
        } catch (error) {
            console.error('Error fetching all visits:', error);
            return [];
        }
    },

    /**
     * Update a visit record
     */
    async updateVisit(visitId: string, data: Partial<AgentVisit>): Promise<AgentVisit> {
        try {
            const updateData: any = {};

            if (data.providerName) updateData.providerName = data.providerName;
            if (data.providerType) updateData.providerType = data.providerType;
            if (data.whatsappNumber) updateData.whatsappNumber = data.whatsappNumber;
            if (data.meetingNotes) updateData.meetingNotes = data.meetingNotes;
            if (data.callbackDate !== undefined) updateData.callbackDate = data.callbackDate || '';
            if (data.membershipAgreed) updateData.membershipAgreed = data.membershipAgreed;
            if (data.status) updateData.status = data.status;

            updateData.updatedAt = new Date().toISOString();

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                visitId,
                updateData
            );

            console.log('✅ Agent visit updated:', visitId);

            return {
                $id: response.$id,
                agentId: response.agentId,
                agentName: response.agentName,
                agentCode: response.agentCode,
                providerName: response.providerName,
                providerType: response.providerType,
                whatsappNumber: response.whatsappNumber,
                visitDate: response.visitDate,
                location: {
                    lat: response.locationLat,
                    lng: response.locationLng,
                    address: response.locationAddress,
                    timestamp: response.locationTimestamp
                },
                meetingNotes: response.meetingNotes,
                callbackDate: response.callbackDate || undefined,
                membershipAgreed: response.membershipAgreed,
                status: response.status,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt || undefined
            };
        } catch (error) {
            console.error('Error updating visit:', error);
            throw error;
        }
    },

    /**
     * Delete a visit record (Admin only)
     */
    async deleteVisit(visitId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                visitId
            );
            console.log('✅ Agent visit deleted:', visitId);
        } catch (error) {
            console.error('Error deleting visit:', error);
            throw error;
        }
    },

    /**
     * Get visit statistics for an agent
     */
    async getAgentStats(agentId: string): Promise<{
        totalVisits: number;
        completedVisits: number;
        pendingVisits: number;
        followupRequired: number;
        membershipsSigned: {
            '1month': number;
            '3month': number;
            '6month': number;
            '1year': number;
        };
    }> {
        try {
            const visits = await this.getVisitsByAgent(agentId);

            const stats = {
                totalVisits: visits.length,
                completedVisits: visits.filter(v => v.status === 'completed').length,
                pendingVisits: visits.filter(v => v.status === 'pending').length,
                followupRequired: visits.filter(v => v.status === 'followup_required').length,
                membershipsSigned: {
                    '1month': visits.filter(v => v.membershipAgreed === '1month').length,
                    '3month': visits.filter(v => v.membershipAgreed === '3month').length,
                    '6month': visits.filter(v => v.membershipAgreed === '6month').length,
                    '1year': visits.filter(v => v.membershipAgreed === '1year').length
                }
            };

            return stats;
        } catch (error) {
            console.error('Error getting agent stats:', error);
            return {
                totalVisits: 0,
                completedVisits: 0,
                pendingVisits: 0,
                followupRequired: 0,
                membershipsSigned: {
                    '1month': 0,
                    '3month': 0,
                    '6month': 0,
                    '1year': 0
                }
            };
        }
    }
};

// ================================
// Monthly Agent Metrics Service
// ================================

export const monthlyAgentMetricsService = {
    /**
     * List monthly metrics snapshots for an agent (latest first)
     */
    async listByAgent(agentId: string, limit: number = 12): Promise<MonthlyAgentMetrics[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'monthly_agent_metrics_collection_id', // collection ID placeholder; ensure config mapping added if needed
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('month'),
                    Query.limit(limit)
                ]
            );
            return response.documents.map((doc: any) => ({
                $id: doc.$id,
                agentId: doc.agentId,
                agentCode: doc.agentCode,
                month: doc.month,
                newSignUpsCount: doc.newSignUpsCount,
                recurringSignUpsCount: doc.recurringSignUpsCount,
                targetMet: doc.targetMet,
                streakCount: doc.streakCount,
                commissionRateApplied: doc.commissionRateApplied,
                calculatedAt: doc.calculatedAt,
            }));
        } catch (error) {
            console.error('Error listing monthly agent metrics:', error);
            return [];
        }
    },
    /**
     * Get the latest snapshot for an agent
     */
    async getLatest(agentId: string): Promise<MonthlyAgentMetrics | null> {
        const list = await this.listByAgent(agentId, 1);
        return list[0] || null;
    }
};

// --- Coin Shop Service ---
import { ShopItem, ShopCoinTransaction, ShopOrder, UserCoins } from '../types';

const COIN_SHOP_DATABASE_ID = '68f76ee1000e64ca8d05';

// Collection IDs
// Coin Shop Collections (update with real IDs once created in Appwrite Console)
// shopItems collection already documented in COIN_SHOP_COLLECTIONS.md with ID 'shopitems'
const SHOP_ITEMS_COLLECTION_ID = 'shopitems';
const COIN_TRANSACTIONS_COLLECTION_ID = 'coin_transactions_collection_id';
const SHOP_ORDERS_COLLECTION_ID = 'shop_orders_collection_id';
const USER_COINS_COLLECTION_ID = 'user_coins_collection_id';

// Shop Items Service
export const shopItemService = {
    async getActiveItems(): Promise<ShopItem[]> {
        try {
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                SHOP_ITEMS_COLLECTION_ID,
                [Query.equal('isActive', true)]
            );
            return response.documents as unknown as ShopItem[];
        } catch (error) {
            console.error('Error getting active items:', error);
            return [];
        }
    },

    async getAllItems(): Promise<ShopItem[]> {
        try {
            console.log('Fetching all items from database:', COIN_SHOP_DATABASE_ID);
            console.log('Collection:', SHOP_ITEMS_COLLECTION_ID);
            
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                SHOP_ITEMS_COLLECTION_ID
            );
            
            console.log('Items fetched successfully:', response.documents.length, 'items');
            console.log('Items:', response.documents);
            
            return response.documents as unknown as ShopItem[];
        } catch (error) {
            console.error('Error getting all items:', error);
            return [];
        }
    },

    async createItem(item: Partial<ShopItem>): Promise<ShopItem> {
        try {
            console.log('Creating shop item with data:', item);
            console.log('Using database ID:', COIN_SHOP_DATABASE_ID);
            console.log('Using collection ID:', SHOP_ITEMS_COLLECTION_ID);
            
            const response = await databases.createDocument(
                COIN_SHOP_DATABASE_ID,
                SHOP_ITEMS_COLLECTION_ID,
                ID.unique(),
                {
                    name: item.name,
                    description: item.description,
                    coinPrice: item.coinPrice,
                    imageUrl: item.imageUrl,
                    category: item.category,
                    stockQuantity: item.stockQuantity,
                    isActive: item.isActive ?? true,
                    estimatedDelivery: item.estimatedDelivery || '6-10 days',
                    disclaimer: item.disclaimer || 'Design may vary slightly from displayed image'
                }
            );
            console.log('Shop item created successfully:', response);
            return response as unknown as ShopItem;
        } catch (error: any) {
            console.error('Error creating item:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: (error as any)?.code || 'Unknown code',
                type: (error as any)?.type || 'Unknown type',
                response: (error as any)?.response || 'No response'
            });
            throw error;
        }
    },

    async updateItem(itemId: string, updates: Partial<ShopItem>): Promise<ShopItem> {
        try {
            console.log('Updating shop item:', itemId, 'with data:', updates);
            console.log('Using database ID:', COIN_SHOP_DATABASE_ID);
            console.log('Using collection ID:', SHOP_ITEMS_COLLECTION_ID);
            
            const response = await databases.updateDocument(
                COIN_SHOP_DATABASE_ID,
                SHOP_ITEMS_COLLECTION_ID,
                itemId,
                updates
            );
            console.log('Shop item updated successfully:', response);
            return response as unknown as ShopItem;
        } catch (error: any) {
            console.error('Error updating item:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                code: (error as any)?.code || 'Unknown code',
                type: (error as any)?.type || 'Unknown type',
                response: (error as any)?.response || 'No response'
            });
            throw error;
        }
    },

    async deleteItem(itemId: string): Promise<void> {
        try {
            console.log('Deleting item from Appwrite:', {
                database: COIN_SHOP_DATABASE_ID,
                collection: SHOP_ITEMS_COLLECTION_ID,
                itemId: itemId
            });
            
            await databases.deleteDocument(
                COIN_SHOP_DATABASE_ID,
                SHOP_ITEMS_COLLECTION_ID,
                itemId
            );
            
            console.log('Item deleted successfully from Appwrite');
        } catch (error: any) {
            console.error('Error deleting item from Appwrite:', error);
            console.error('Error details:', {
                code: (error as any)?.code || 'Unknown code',
                message: error instanceof Error ? error.message : 'Unknown error',
                response: (error as any)?.response || 'No response'
            });
            throw error;
        }
    },

    async updateStock(itemId: string, quantity: number): Promise<void> {
        try {
            await this.updateItem(itemId, { stockQuantity: quantity });
        } catch (error) {
            console.error('Error updating stock:', error);
            throw error;
        }
    }
};

// Coin Service
export const coinService = {
    async getUserCoins(userId: string): Promise<UserCoins | null> {
        try {
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                USER_COINS_COLLECTION_ID,
                [Query.equal('userId', userId)]
            );
            
            if (response.documents.length > 0) {
                return response.documents[0] as unknown as UserCoins;
            }
            return null;
        } catch (error) {
            console.error('Error getting user coins:', error);
            return null;
        }
    },

    async initializeUserCoins(userId: string, userType: UserCoins['userType'], userName: string): Promise<UserCoins> {
        try {
            // Check if already exists
            const existing = await this.getUserCoins(userId);
            if (existing) {
                return existing;
            }

            const response = await databases.createDocument(
                COIN_SHOP_DATABASE_ID,
                USER_COINS_COLLECTION_ID,
                ID.unique(),
                {
                    userId,
                    userType,
                    userName,
                    totalCoins: 0,
                    lifetimeEarned: 0,
                    lifetimeSpent: 0
                }
            );
            
            return response as unknown as UserCoins;
        } catch (error) {
            console.error('Error initializing user coins:', error);
            throw error;
        }
    },

    async addCoins(
        userId: string,
        userType: UserCoins['userType'],
        userName: string,
        amount: number,
        description: string,
        relatedId?: string
    ): Promise<ShopCoinTransaction> {
        try {
            // Get or create user coins
            let userCoin = await this.getUserCoins(userId);
            if (!userCoin) {
                userCoin = await this.initializeUserCoins(userId, userType, userName);
            }
            
            const balanceBefore = userCoin.totalCoins;
            const balanceAfter = balanceBefore + amount;
            
            // Create transaction
            const transaction = await databases.createDocument(
                COIN_SHOP_DATABASE_ID,
                COIN_TRANSACTIONS_COLLECTION_ID,
                ID.unique(),
                {
                    userId,
                    userType,
                    userName,
                    transactionType: 'earn',
                    amount,
                    description,
                    relatedId: relatedId || '',
                    balanceBefore,
                    balanceAfter
                }
            );
            
            // Update user coins
            await databases.updateDocument(
                COIN_SHOP_DATABASE_ID,
                USER_COINS_COLLECTION_ID,
                userCoin.$id!,
                {
                    totalCoins: balanceAfter,
                    lifetimeEarned: userCoin.lifetimeEarned + amount
                }
            );
            
            return transaction as unknown as ShopCoinTransaction;
        } catch (error) {
            console.error('Error adding coins:', error);
            throw error;
        }
    },

    async deductCoins(
        userId: string,
        userType: UserCoins['userType'],
        userName: string,
        amount: number,
        description: string,
        relatedId?: string
    ): Promise<ShopCoinTransaction> {
        try {
            const userCoin = await this.getUserCoins(userId);
            if (!userCoin) {
                throw new Error('User coins not found');
            }
            
            if (userCoin.totalCoins < amount) {
                throw new Error('Insufficient coins');
            }
            
            const balanceBefore = userCoin.totalCoins;
            const balanceAfter = balanceBefore - amount;
            
            // Create transaction
            const transaction = await databases.createDocument(
                COIN_SHOP_DATABASE_ID,
                COIN_TRANSACTIONS_COLLECTION_ID,
                ID.unique(),
                {
                    userId,
                    userType,
                    userName,
                    transactionType: 'spend',
                    amount: -amount,
                    description,
                    relatedId: relatedId || '',
                    balanceBefore,
                    balanceAfter
                }
            );
            
            // Update user coins
            await databases.updateDocument(
                COIN_SHOP_DATABASE_ID,
                USER_COINS_COLLECTION_ID,
                userCoin.$id!,
                {
                    totalCoins: balanceAfter,
                    lifetimeSpent: userCoin.lifetimeSpent + amount
                }
            );
            
            return transaction as unknown as ShopCoinTransaction;
        } catch (error) {
            console.error('Error deducting coins:', error);
            throw error;
        }
    },

    async getTransactionHistory(userId: string): Promise<ShopCoinTransaction[]> {
        try {
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                COIN_TRANSACTIONS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt')
                ]
            );
            
            return response.documents as unknown as ShopCoinTransaction[];
        } catch (error) {
            console.error('Error getting transaction history:', error);
            return [];
        }
    }
};

// Shop Order Service
export const shopOrderService = {
    async createOrder(order: Partial<ShopOrder>): Promise<ShopOrder> {
        try {
            // Get order count to generate order number
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                SHOP_ORDERS_COLLECTION_ID
            );
            
            const orderNumber = `ORD-${new Date().getFullYear()}-${String(response.total + 1).padStart(4, '0')}`;
            
            const newOrder = await databases.createDocument(
                COIN_SHOP_DATABASE_ID,
                SHOP_ORDERS_COLLECTION_ID,
                ID.unique(),
                {
                    orderNumber,
                    userId: order.userId,
                    userType: order.userType,
                    userName: order.userName,
                    userEmail: order.userEmail || '',
                    userPhone: order.userPhone || '',
                    shippingAddress: JSON.stringify(order.shippingAddress),
                    items: JSON.stringify(order.items),
                    totalCoins: order.totalCoins,
                    status: 'pending',
                    estimatedDelivery: order.estimatedDelivery || '6-10 days',
                    trackingNumber: '',
                    notes: order.notes || ''
                }
            );

            // Send admin notification for the cash out order
            try {
                const items = JSON.parse(JSON.stringify(order.items || []));
                const itemNames = items.map((item: any) => item.itemName).join(', ');
                
                await adminMessageService.sendMessage({
                    senderId: 'system',
                    senderName: 'Coin Shop System',
                    senderType: 'admin',
                    receiverId: 'admin',
                    message: `🏪 NEW COIN SHOP ORDER
Order #: ${orderNumber}
Customer: ${order.userName} (${order.userType})
Phone: ${order.userPhone}
Items: ${itemNames}
Total Coins: ${order.totalCoins} 🪙
Status: Pending
                    
Please process this order for delivery.`
                });
                console.log('✅ Admin notification sent for order:', orderNumber);
            } catch (notificationError) {
                console.warn('⚠️ Failed to send admin notification for order:', orderNumber, notificationError);
                // Don't throw error as order was created successfully
            }
            
            return newOrder as unknown as ShopOrder;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getOrdersByUser(userId: string): Promise<ShopOrder[]> {
        try {
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                SHOP_ORDERS_COLLECTION_ID,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('$createdAt')
                ]
            );
            
            return response.documents as unknown as ShopOrder[];
        } catch (error) {
            console.error('Error getting user orders:', error);
            return [];
        }
    },

    async getAllOrders(): Promise<ShopOrder[]> {
        try {
            const response = await databases.listDocuments(
                COIN_SHOP_DATABASE_ID,
                SHOP_ORDERS_COLLECTION_ID,
                [Query.orderDesc('$createdAt')]
            );
            
            return response.documents as unknown as ShopOrder[];
        } catch (error) {
            console.error('Error getting all orders:', error);
            return [];
        }
    },

    async updateOrderStatus(orderId: string, status: ShopOrder['status']): Promise<ShopOrder> {
        try {
            const updates: any = { status };
            
            if (status === 'shipped') {
                updates.shippedAt = new Date().toISOString();
            } else if (status === 'delivered') {
                updates.deliveredAt = new Date().toISOString();
            }
            
            const response = await databases.updateDocument(
                COIN_SHOP_DATABASE_ID,
                SHOP_ORDERS_COLLECTION_ID,
                orderId,
                updates
            );
            
            return response as unknown as ShopOrder;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    async addTracking(orderId: string, trackingNumber: string): Promise<ShopOrder> {
        try {
            const response = await databases.updateDocument(
                COIN_SHOP_DATABASE_ID,
                SHOP_ORDERS_COLLECTION_ID,
                orderId,
                { trackingNumber }
            );
            
            return response as unknown as ShopOrder;
        } catch (error) {
            console.error('Error adding tracking:', error);
            throw error;
        }
    }
};



