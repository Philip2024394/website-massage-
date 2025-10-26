// Main image URLs for therapist cards on HOME PAGE (keep original)
const THERAPIST_MAIN_IMAGES = [
    'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720',
    'https://ik.imagekit.io/7grri5v7d/massage%20room.png?updatedAt=1760975249566',
    'https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264',
    'https://ik.imagekit.io/7grri5v7d/massage%20agents.png?updatedAt=1760968250776',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2016.png?updatedAt=1760187700624',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2013.png?updatedAt=1760187547313',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2012.png?updatedAt=1760187511503',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2011.png?updatedAt=1760187471233',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2010.png?updatedAt=1760187307232',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%207.png?updatedAt=1760187181168',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%205.png?updatedAt=1760187081702',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%204.png?updatedAt=1760187040909',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%203.png?updatedAt=1760186993639',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%201.png?updatedAt=1760186885261',
];

// Live menu image URLs for hotel/villa therapist cards (7 images - random selection)
const LIVE_MENU_THERAPIST_IMAGES = [
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2015.png?updatedAt=1760187650860',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2012.png?updatedAt=1760187511503',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%2011.png?updatedAt=1760187471233',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%209.png?updatedAt=1760187266868',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%206.png?updatedAt=1760187126997',
    'https://ik.imagekit.io/7grri5v7d/massage%20image%202.png?updatedAt=1760186944882',
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
