import { account, databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID } from 'appwrite';

export interface AuthResponse {
    success: boolean;
    userId?: string;
    documentId?: string;
    error?: string;
}

// Admin Authentication
export const adminAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            // Create Appwrite account
            const user = await account.create(ID.unique(), email, password);
            
            // Create admin document in database
            const admin = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.ADMINS,
                ID.unique(),
                {
                    email,
                    userId: user.$id,
                    createdAt: new Date().toISOString(),
                }
            );
            
            return { success: true, userId: user.$id, documentId: admin.$id };
        } catch (error: any) {
            console.error('Admin sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            // Create session
            await account.createEmailPasswordSession(email, password);
            
            // Get user
            const user = await account.get();
            
            // Get admin document
            const admins = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ADMINS
            );
            
            const admin = admins.documents.find((doc: any) => doc.userId === user.$id);
            
            if (!admin) {
                throw new Error('Admin not found');
            }
            
            return { success: true, userId: user.$id, documentId: admin.$id };
        } catch (error: any) {
            console.error('Admin sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Therapist Authentication
export const therapistAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            // Clear any existing session first
            try {
                await account.deleteSession('current');
            } catch {
                // No active session to delete
            }
            
            const user = await account.create(ID.unique(), email, password);
            const therapistId = ID.unique();
            
            const therapist = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS,
                therapistId,
                {
                    // Required fields
                    id: therapistId,
                    therapistId: therapistId,
                    hotelId: '',
                    email,
                    name: email.split('@')[0],
                    specialization: 'General',
                    yearsOfExperience: 0,
                    isLicensed: false,
                    availability: 'Mon-Sun',
                    location: '',
                    hourlyRate: 100,
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                    
                    // Optional fields with defaults
                    isLive: false,
                    status: 'Offline',
                    profilePicture: '',
                    mainImage: '',
                    description: '',
                    whatsappNumber: '',
                    massageTypes: '',
                    languages: '',
                    analytics: JSON.stringify({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
                    agentId: '',
                    hotelDiscount: 0,
                    password: '',
                    reviewcount: 0,
                    massagetype: '',
                    coodinates: '',
                    lastmembershipupdatedate: '',
                    totalactivemembershipmonths: 0,
                    badgeEligible: false,
                    yearsofexperince: 0,
                    kotelvillaservicestatus: '',
                    villadiscount: 0,
                    distance: 0,
                    rating: 0,
                }
            );
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            console.error('Therapist sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            // Clear any existing session first
            try {
                await account.deleteSession('current');
            } catch {
                // No active session to delete
            }
            
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const therapists = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS
            );
            
            const therapist = therapists.documents.find((doc: any) => doc.email === email);
            
            if (!therapist) {
                throw new Error('Therapist not found');
            }
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            console.error('Therapist sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Place Authentication
export const placeAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            
            const place = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PLACES,
                ID.unique(),
                {
                    email,
                    userId: user.$id,
                    name: email.split('@')[0],
                    isLive: false,
                    rating: 0,
                    reviewCount: 0,
                    pricing: JSON.stringify({ '60': 0, '90': 0, '120': 0 }),
                    whatsappNumber: '',
                    description: '',
                    mainImage: '',
                    thumbnailImages: [],
                    massageTypes: JSON.stringify([]),
                    coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                    location: '',
                    distance: 0,
                    openingTime: '09:00',
                    closingTime: '21:00',
                    activeMembershipDate: '',
                    analytics: JSON.stringify({ impressions: 0, profileViews: 0, whatsappClicks: 0 }),
                    createdAt: new Date().toISOString(),
                }
            );
            
            return { success: true, userId: user.$id, documentId: place.$id };
        } catch (error: any) {
            console.error('Place sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const places = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLACES
            );
            
            const place = places.documents.find((doc: any) => doc.userId === user.$id);
            
            if (!place) {
                throw new Error('Place not found');
            }
            
            return { success: true, userId: user.$id, documentId: place.$id };
        } catch (error: any) {
            console.error('Place sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Hotel Authentication
export const hotelAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            
            const hotel = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.HOTELS,
                ID.unique(),
                {
                    email,
                    userId: user.$id,
                    name: email.split('@')[0],
                    brandLogo: '',
                    customMessage: '',
                    qrCode: '',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                }
            );
            
            return { success: true, userId: user.$id, documentId: hotel.$id };
        } catch (error: any) {
            console.error('Hotel sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const hotels = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.HOTELS
            );
            
            const hotel = hotels.documents.find((doc: any) => doc.userId === user.$id);
            
            if (!hotel) {
                throw new Error('Hotel not found');
            }
            
            return { success: true, userId: user.$id, documentId: hotel.$id };
        } catch (error: any) {
            console.error('Hotel sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Villa Authentication
export const villaAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            
            const villa = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.VILLAS,
                ID.unique(),
                {
                    email,
                    userId: user.$id,
                    name: email.split('@')[0],
                    brandLogo: '',
                    customMessage: '',
                    qrCode: '',
                    isActive: false,
                    createdAt: new Date().toISOString(),
                }
            );
            
            return { success: true, userId: user.$id, documentId: villa.$id };
        } catch (error: any) {
            console.error('Villa sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const villas = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.VILLAS
            );
            
            const villa = villas.documents.find((doc: any) => doc.userId === user.$id);
            
            if (!villa) {
                throw new Error('Villa not found');
            }
            
            return { success: true, userId: user.$id, documentId: villa.$id };
        } catch (error: any) {
            console.error('Villa sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Agent Authentication
export const agentAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            
            const agent = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.AGENTS,
                ID.unique(),
                {
                    email,
                    userId: user.$id,
                    name: email.split('@')[0],
                    whatsapp: '',
                    commission: 0,
                    totalEarnings: 0,
                    providersCount: 0,
                    isActive: false,
                    createdAt: new Date().toISOString(),
                }
            );
            
            return { success: true, userId: user.$id, documentId: agent.$id };
        } catch (error: any) {
            console.error('Agent sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const agents = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AGENTS
            );
            
            const agent = agents.documents.find((doc: any) => doc.userId === user.$id);
            
            if (!agent) {
                throw new Error('Agent not found');
            }
            
            return { success: true, userId: user.$id, documentId: agent.$id };
        } catch (error: any) {
            console.error('Agent sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// Sign Out (common for all)
export const signOut = async (): Promise<boolean> => {
    try {
        await account.deleteSession('current');
        return true;
    } catch (error) {
        console.error('Sign out error:', error);
        return false;
    }
};

// Get Current User
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch (error) {
        return null;
    }
};
