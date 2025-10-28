// Main image URLs for therapist cards on HOME PAGE (stored in Appwrite)
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

// Helper function to get main image sequentially for home page
const getRandomMainImage = (index: number): string => {
    return THERAPIST_MAIN_IMAGES[index % THERAPIST_MAIN_IMAGES.length];
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
                }
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
                }
            );
            return response;
        } catch (error) {
            console.error('Error updating custom link:', error);
            throw error;
        }
    }
};
// Appwrite service - Real implementation
import { Client, Databases, Account, Query, Storage, ID } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

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
    async getAll(): Promise<any[]> {
        try {
            console.log('📋 Fetching all therapists from collection:', APPWRITE_CONFIG.collections.therapists);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists
            );
            console.log('✅ Fetched therapists:', response.documents.length);
            
            // Add random main images to therapists that don't have one
            const therapistsWithImages = response.documents.map((therapist, index) => ({
                ...therapist,
                mainImage: therapist.mainImage || getRandomMainImage(index)
            }));
            
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
    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating therapist:', error);
            throw error;
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
    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching places:', error);
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
    }
};

export const userService = {
    async create(user: any): Promise<any> {
        // Users are created via authService, this stores additional user profile data
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists, // or places/agents depending on role
                'unique()',
                user
            );
            return response;
        } catch (error) {
            console.error('Error creating user profile:', error);
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
            await account.createEmailPasswordSession(email, password);
            return await account.get();
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },
    async register(email: string, password: string, name: string): Promise<any> {
        try {
            const response = await account.create('unique()', email, password, name);
            // Auto-login after registration
            await account.createEmailPasswordSession(email, password);
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
        try {
            // Check if already logged in
            const currentUser = await account.get().catch(() => null);
            if (currentUser) return currentUser;
            
            // Create anonymous session for guest access
            await account.createAnonymousSession();
            return await account.get();
        } catch (error) {
            console.error('Error creating anonymous session:', error);
            throw error;
        }
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
            
            const translations: any = { en: {}, id: {} };
            response.documents.forEach((doc: any) => {
                const { key, language, value } = doc;
                try {
                    // Parse JSON value if it's a string
                    const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
                    translations[language][key] = parsedValue;
                } catch (e) {
                    translations[language][key] = value;
                }
            });
            
            return translations;
        } catch (error) {
            console.error('Error fetching translations:', error);
            return null;
        }
    },

    async set(language: string, key: string, value: any): Promise<void> {
        try {
            const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;

            // Just create new document - collection should have unique index on (language + key)
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                ID.unique(),
                {
                    language,
                    key,
                    value: stringValue
                }
            );
        } catch (error: any) {
            // If document exists, update it
            if (error.code === 409) {
                console.log(`Skipping duplicate: ${language}.${key}`);
            } else {
                console.error('Error setting translation:', error);
                throw error;
            }
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

    async getPending(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.reviews,
                [
                    Query.equal('status', 'pending')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pending reviews:', error);
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
    }
};

// ============================================================================
// NOTIFICATION SERVICE - Push notifications and in-app alerts
// ============================================================================
export const notificationService = {
    async create(notification: {
        providerId: number;
        message: string;
        type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'review_received' | 'promotion' | 'system' | 'whatsapp_contact';
        bookingId?: string;
    }): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                ID.unique(),
                {
                    ...notification,
                    isRead: false,
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

    async getUnread(providerId: number): Promise<any[]> {
        try {
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
            console.error('Error fetching unread notifications:', error);
            return [];
        }
    },

    async markAsRead(notificationId: string): Promise<any> {
        try {
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
                APPWRITE_CONFIG.collections.messages || 'messages_collection_id', // Add to config
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
            
            let basePrice = basePrices[serviceType];
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
            const booking = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
                ID.unique(),
                {
                    ...bookingData,
                    status: 'pending',
                    providerResponseStatus: 'awaiting_response',
                    isReassigned: false,
                    fallbackProviderIds: [],
                    createdAt: new Date().toISOString()
                }
            );
            
            console.log('✅ Hotel/Villa booking created:', booking.$id);
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
                    Query.equal('hotelVillaId', venueId),
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
     * Get all bookings for a provider
     */
    async getBookingsByProvider(providerId: string, providerType: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotelBookings,
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
                providerResponseStatus: 'confirmed',
                providerResponseTime: new Date().toISOString(),
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
                providerResponseStatus: 'on_the_way',
                providerResponseTime: new Date().toISOString(),
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
                providerResponseStatus: 'declined',
                providerResponseTime: new Date().toISOString(),
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
            const booking = await this.updateBooking(bookingId, {
                status: 'completed',
                completedAt: new Date().toISOString()
            });
            console.log('✅ Booking completed:', bookingId);
            return booking;
        } catch (error) {
            console.error('Error completing booking:', error);
            throw error;
        }
    },

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId: string, reason?: string): Promise<any> {
        try {
            const booking = await this.updateBooking(bookingId, {
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancellationReason: reason || 'Cancelled by user'
            });
            console.log('✅ Booking cancelled:', bookingId);
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
            // Calculate new confirmation deadline (25 minutes)
            const newDeadline = new Date();
            newDeadline.setMinutes(newDeadline.getMinutes() + 25);

            const booking = await this.updateBooking(bookingId, {
                providerId: newProviderId,
                providerName: newProviderName,
                isReassigned: true,
                providerResponseStatus: 'awaiting_response',
                confirmationDeadline: newDeadline.toISOString(),
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


