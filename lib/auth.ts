import { account, databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { ID } from 'appwrite';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';

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
            try {
                const admin = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.ADMINS || 'admins_collection_id',
                    ID.unique(),
                    {
                        // Required fields per schema
                        username: email.split('@')[0], // Required
                        password: '', // Password handled by Appwrite auth
                        email, // Required
                        role: 'regular', // Required - default to regular admin
                        createdAt: new Date().toISOString(), // Required
                        userId: user.$id, // Store reference to Appwrite user
                        
                        // Optional fields
                        lastLogin: null,
                    }
                );
                return { success: true, userId: user.$id, documentId: admin.$id };
            } catch (dbError: any) {
                console.warn('⚠️ Admins collection not found, user created but no admin document');
                return { success: true, userId: user.$id, error: 'Admin collection not configured' };
            }
        } catch (error: any) {
            console.error('Admin sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before admin login');
            } catch (err) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }

            // Create session
            await account.createEmailPasswordSession(email, password);
            
            // Get user
            const user = await account.get();
            
            // Get admin document - with improved error handling
            try {
                const admins = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.ADMINS || 'admins_collection_id'
                );
                
                const admin = admins.documents.find((doc: any) => doc.userId === user.$id);
                
                if (!admin) {
                    console.warn('⚠️ Admin document not found for user, but allowing login');
                    return { success: true, userId: user.$id, error: 'Admin document not found but login allowed' };
                }
                
                return { success: true, userId: user.$id, documentId: admin.$id };
            } catch (dbError: any) {
                console.warn('⚠️ Admins collection query failed, but allowing login anyway:', dbError.message);
                // Allow admin access even if collection query fails
                return { success: true, userId: user.$id, error: 'Admin collection query failed but login allowed' };
            }
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
            console.log('🔵 [Therapist Sign-Up] Starting...', { email });
            
            // Clear any existing session first
            try {
                await account.deleteSession('current');
                console.log('✅ [Therapist Sign-Up] Cleared existing session');
            } catch {
                console.log('ℹ️ [Therapist Sign-Up] No active session to delete');
            }
            
            console.log('🔵 [Therapist Sign-Up] Creating Appwrite account...');
            const user = await account.create(ID.unique(), email, password);
            console.log('✅ [Therapist Sign-Up] Appwrite account created:', user.$id);
            const therapistId = ID.unique();
            
            console.log('🔵 [Therapist Sign-Up] Creating therapist document...', {
                therapistId,
                collectionId: COLLECTIONS.THERAPISTS,
                databaseId: DATABASE_ID
            });
            
            const therapist = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS,
                therapistId,
                {
                    // Required fields per schema
                    id: therapistId, // Required by Appwrite schema - document ID
                    email,
                    name: email.split('@')[0],
                    whatsappNumber: '',
                    location: '',
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    status: 'Offline',
                    isLive: false,
                    hourlyRate: 100, // Required by Appwrite schema (50-500 range)
                    therapistId: therapistId, // Required by Appwrite schema
                    hotelId: '', // Required by Appwrite schema - empty for independent therapists
                    isLicensed: false, // Required by Appwrite schema - license verification
                    specialization: 'General Massage', // Required by actual Appwrite collection
                    availability: 'full-time', // Required by actual Appwrite collection
                    
                    // Optional fields with defaults per schema
                    description: '',
                    profilePicture: '',
                    mainImage: getRandomTherapistImage(therapistId), // Random Appwrite image for professional display
                    yearsOfExperience: 0,
                    massageTypes: '',
                    languages: '',
                    coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                }
            );
            
            console.log('✅ [Therapist Sign-Up] Therapist document created:', therapist.$id);
            console.log('🎉 [Therapist Sign-Up] SUCCESS! Returning response...');
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            console.error('❌ [Therapist Sign-Up] ERROR:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response,
                fullError: error
            });
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('🔵 [Therapist Sign-In] Starting...', { email });
            
            // Clear any existing session first
            try {
                await account.deleteSession('current');
                console.log('✅ [Therapist Sign-In] Cleared existing session');
            } catch {
                console.log('ℹ️ [Therapist Sign-In] No active session to delete');
            }
            
            console.log('🔵 [Therapist Sign-In] Creating email/password session...');
            await account.createEmailPasswordSession(email, password);
            console.log('✅ [Therapist Sign-In] Session created');
            
            console.log('🔵 [Therapist Sign-In] Getting user account...');
            const user = await account.get();
            console.log('✅ [Therapist Sign-In] User account retrieved:', user.$id);
            
            console.log('🔵 [Therapist Sign-In] Searching for therapist document...', {
                collectionId: COLLECTIONS.THERAPISTS,
                searchEmail: email
            });
            const therapists = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS
            );
            
            console.log(`🔍 [Therapist Sign-In] Found ${therapists.total} total therapists`);
            
            const therapist = therapists.documents.find((doc: any) => doc.email === email);
            
            if (!therapist) {
                console.error('❌ [Therapist Sign-In] Therapist document not found for email:', email);
                console.log('Available emails in collection:', therapists.documents.map((d: any) => d.email));
                throw new Error('Therapist not found');
            }
            
            console.log('✅ [Therapist Sign-In] Therapist document found:', therapist.$id);
            console.log('🎉 [Therapist Sign-In] SUCCESS! Returning response...');
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            console.error('❌ [Therapist Sign-In] ERROR:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response,
                fullError: error
            });
            return { success: false, error: error.message };
        }
    },
};

// Place Authentication - Streamlined with only required attributes
export const placeAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            const generatedPlaceId = ID.unique();
            
            console.log('🏢 Creating massage place with required attributes only...');
            
            const placeData = {
                // CORE REQUIRED ATTRIBUTES (verified to exist in Appwrite)
                id: generatedPlaceId,                          // ✅ Required: Document identifier
                placeId: generatedPlaceId,                     // ✅ Required: Place-specific ID field
                name: email.split('@')[0],                     // ✅ Required: Business name
                category: 'massage-place',                     // ✅ Required: Business category
                email,                                         // ✅ Required: Email address
                password: '',                                  // ✅ Required: Managed by Appwrite auth
                pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }), // ✅ Required: Pricing structure
                location: 'Location pending setup',           // ✅ Required: Address
                status: 'Closed',                             // ✅ Required: Open/Closed status
                isLive: false,                                // ✅ Required: Admin approval
                openingTime: '09:00',                         // ✅ Required: Opening time
                closingTime: '21:00',                         // ✅ Required: Closing time
                coordinates: [106.8456, -6.2088],             // ✅ Required: Point format [lng, lat] for Jakarta
                hotelId: '',                                  // ✅ Required: Empty for independent massage places
            };
            
            console.log('📊 Place data (required only):', placeData);
            
            const place = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PLACES,
                generatedPlaceId,
                placeData
            );
            
            return { success: true, userId: user.$id, documentId: place.$id };
        } catch (error: any) {
            console.error('Place sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before place login');
            } catch (err) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }

            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const places = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLACES
            );
            
            const place = places.documents.find((doc: any) => doc.email === email);
            
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
            console.log('🏨 Starting hotel signup for:', email);
            const user = await account.create(ID.unique(), email, password);
            console.log('✅ Appwrite user created:', user.$id);
            
            try {
                const hotel = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.HOTELS,
                    ID.unique(),
                    {
                        // Simplified hotel data - only email and password required
                        name: email.split('@')[0],        // Hotel name from email
                        type: 'hotel',                    // Required - hotel type
                        email,                            // Required - email address
                        password: '',                     // Required - handled by Appwrite auth
                        location: 'Location pending',    // Required - default location
                        contactPerson: email.split('@')[0], // Required - default contact
                        whatsappNumber: '',              // Required - empty default
                        qrCodeEnabled: false,            // Required - default false
                        isActive: true,                  // Required - auto-activate for simplicity
                        createdAt: new Date().toISOString(), // Add creation timestamp
                        userId: user.$id,                // Link to Appwrite user
                        
                        // Optional fields with defaults
                        partnerTherapists: JSON.stringify([]),
                        discountRate: 0,
                    }
                );
                console.log('✅ Hotel document created:', hotel.$id);
                return { success: true, userId: user.$id, documentId: hotel.$id };
            } catch (dbError: any) {
                console.warn('⚠️ Hotel collection error, but user created:', dbError.message);
                // User created successfully even if hotel document fails
                return { success: true, userId: user.$id, error: 'Hotel user created but collection unavailable' };
            }
        } catch (error: any) {
            console.error('Hotel sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('🏨 Starting hotel signin for:', email);
            
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before hotel login');
            } catch (err) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }

            // Create new session
            const session = await account.createEmailPasswordSession(email, password);
            console.log('✅ Session created:', session.$id);
            
            const user = await account.get();
            console.log('✅ User retrieved:', user.$id);
            
            try {
                const hotels = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.HOTELS
                );
                
                const hotel = hotels.documents.find((doc: any) => 
                    doc.email === email || doc.userId === user.$id
                );
                
                if (!hotel) {
                    console.warn('⚠️ Hotel document not found, but allowing login');
                    return { success: true, userId: user.$id, error: 'Hotel document not found but login allowed' };
                }
                
                console.log('✅ Hotel document found:', hotel.$id);
                return { success: true, userId: user.$id, documentId: hotel.$id };
            } catch (dbError: any) {
                console.warn('⚠️ Hotel collection query failed, but allowing login:', dbError.message);
                // Allow login even if database query fails
                return { success: true, userId: user.$id, error: 'Hotel collection unavailable but login allowed' };
            }
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
                COLLECTIONS.HOTELS, // Villas are stored in hotels collection
                ID.unique(),
                {
                    // Required fields per schema
                    name: email.split('@')[0],
                    type: 'villa', // Required - hotel or villa
                    location: '', // Required
                    contactPerson: email.split('@')[0], // Required
                    email, // Required
                    password: '', // Required - handled by Appwrite auth
                    whatsappNumber: '', // Required
                    qrCodeEnabled: false, // Required
                    isActive: false, // Required - admin approval needed
                    createdAt: new Date().toISOString(), // Required
                    
                    // Optional fields
                    partnerTherapists: JSON.stringify([]),
                    discountRate: 0,
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
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before villa login');
            } catch (err) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }

            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const villas = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.HOTELS // Villas are stored in hotels collection
            );
            
            const villa = villas.documents.find((doc: any) => doc.email === email && doc.type === 'villa');
            
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
                    // Required fields per schema
                    name: email.split('@')[0],
                    email,
                    password: '', // Password handled by Appwrite auth
                    whatsappNumber: '',
                    commissionRate: 20, // Default to standard tier
                    tier: 'Standard', // Required field
                    isActive: false, // Required field - admin approval needed
                    createdAt: new Date().toISOString(), // Required field
                    
                    // Optional fields with defaults
                    totalEarnings: 0.0,
                    clients: JSON.stringify([]),
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
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before agent login');
            } catch (err) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }

            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const agents = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AGENTS
            );
            
            const agent = agents.documents.find((doc: any) => doc.email === email);
            
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
