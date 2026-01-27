import { account, databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { Query } from 'appwrite';
import { logger } from '../utils/logger';
import { ID } from 'appwrite';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { buildHotelsPayload } from './hotelsSchema';
import { sessionCache } from './sessionCache';
import { checkRateLimit, formatRateLimitError, handleAppwriteError } from './rateLimitUtils';

export interface AuthResponse {
    success: boolean;
    userId?: string;
    documentId?: string;
    error?: string;
}

// Hotel Authentication (repaired)
export const hotelAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('🏨 Starting hotel signup for:', email);
            const user = await account.create(ID.unique(), email, password);
            console.log('✅ Appwrite user created:', user.$id);
            try {
                const hotelId = ID.unique();
                const { sanitized, diff } = buildHotelsPayload({ id: hotelId, email, type: 'hotel', userId: user.$id });
                if (diff.unknown.length || diff.missingRequired.length) {
                    console.warn('⚠️ Hotel payload sanitized. Unknown:', diff.unknown, 'Missing filled:', diff.missingRequired);
                    const STRICT = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_HOTELS_STRICT_SCHEMA === '1')
                        || (typeof process !== 'undefined' && process.env?.VITE_HOTELS_STRICT_SCHEMA === '1');
                    if (STRICT) {
                        throw new Error(`Hotel payload schema issues. Unknown: ${diff.unknown.join(', ')} Missing: ${diff.missingRequired.join(', ')}`);
                    }
                }
                const hotelDoc = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.HOTELS,
                    hotelId,
                    sanitized
                );
                console.log('✅ Hotel document created:', hotelDoc.$id);
                return { success: true, userId: user.$id, documentId: hotelDoc.$id };
            } catch (dbError: any) {
                console.warn('⚠️ Hotel collection error, but user created:', dbError.message);
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
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before hotel login');
            } catch (err: any) {
                console.log('ℹ️ No existing session to clear:', err?.message || 'unknown reason');
            }
            const session = await account.createEmailPasswordSession(email, password);
            console.log('✅ Session created:', session.$id);
            const user = await account.get();
            console.log('✅ User retrieved:', user.$id);
            try {
                const hotels = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.HOTELS
                );
                const hotel = hotels.documents.find((doc: any) => doc.email === email || doc.userId === user.$id);
                if (!hotel) {
                    console.warn('⚠️ Hotel document not found, but allowing login');
                    return { success: true, userId: user.$id, error: 'Hotel document not found but login allowed' };
                }
                console.log('✅ Hotel document found:', hotel.$id);
                return { success: true, userId: user.$id, documentId: hotel.$id };
            } catch (dbError: any) {
                console.warn('⚠️ Hotel collection query failed, but allowing login:', dbError.message);
                return { success: true, userId: user.$id, error: 'Hotel collection unavailable but login allowed' };
            }
        } catch (error: any) {
            console.error('Hotel sign in error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Admin Authentication (collection disabled, auth-only)
export const adminAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('👤 Admin signup start:', email);
            const user = await account.create(ID.unique(), email, password);
            console.log('✅ Admin user created:', user.$id);
            return { success: true, userId: user.$id };
        } catch (error: any) {
            console.error('Admin signup error:', error);
            return { success: false, error: error.message };
        }
    },
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('👤 Admin signin start:', email);
            try { await account.deleteSession('current'); } catch {}
            const session = await account.createEmailPasswordSession(email, password);
            console.log('✅ Admin session created:', session.$id);
            const user = await account.get();
            return { success: true, userId: user.$id };
        } catch (error: any) {
            console.error('Admin signin error:', error);
            return { success: false, error: error.message };
        }
    }
};

// Therapist Authentication
const INCLUDE_USER_ID = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_INCLUDE_USER_ID === '1') || (typeof process !== 'undefined' && process.env?.VITE_INCLUDE_USER_ID === '1');
const DEBUG_AUTH = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEBUG_AUTH === '1') || (typeof process !== 'undefined' && process.env?.VITE_DEBUG_AUTH === '1');

export const therapistAuth = {
    async signUp(email: string, password: string, name?: string, whatsappNumber?: string): Promise<AuthResponse> {
        try {
            logger.debug('🔵 [Therapist Sign-Up] Starting...', { email });
            // Environment diagnostics
            const origin = (typeof window !== 'undefined' && window.location ? window.location.origin : 'no-window');
            logger.debug('🛠 [Therapist Sign-Up] Environment', {
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                databaseId: APPWRITE_CONFIG.databaseId,
                therapistsCollection: APPWRITE_CONFIG.collections.therapists,
                origin
            });
            
            // Check rate limit (5 attempts per minute)
            if (!checkRateLimit('therapist-signup', 5, 60000)) {
                const errorMsg = formatRateLimitError('signup');
                console.warn('⚠️ [Therapist Sign-Up] Rate limited');
                return { success: false, error: errorMsg };
            }
            
            // Clear session cache to force fresh check
            sessionCache.clear();
            
            // Clear any existing session first
            try {
                await account.deleteSession('current');
                console.log('✅ [Therapist Sign-Up] Cleared existing session');
            } catch {
                console.log('ℹ️ [Therapist Sign-Up] No active session to delete');
            }
            
            console.log('🔵 [Therapist Sign-Up] Creating Appwrite account...');
            const normalizedEmail = email.toLowerCase().trim();
            const user = await account.create(ID.unique(), normalizedEmail, password);
            logger.debug('✅ [Therapist Sign-Up] Appwrite account created:', user.$id);
            
            // Create session after account creation
            logger.debug('🔵 [Therapist Sign-Up] Creating session...');
            await account.createEmailPasswordSession(normalizedEmail, password);
            logger.debug('✅ [Therapist Sign-Up] Session created');
            
            const therapistId = ID.unique();
            
            logger.debug('🔵 [Therapist Sign-Up] Creating therapist document...', {
                therapistId,
                email: normalizedEmail,
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
                    email: normalizedEmail,
                    name: name || normalizedEmail.split('@')[0],
                    userId: user.$id, // ✅ ALWAYS link therapist to auth user ID
                    whatsappNumber: whatsappNumber || '',
                    countryCode: '+62', // Required by Appwrite schema - Indonesia
                    location: '',
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    price60: '100', // Required string field for 60-minute massage
                    price90: '150', // Required string field for 90-minute massage
                    price120: '200', // Required string field for 120-minute massage
                    status: 'available', // Valid enum: available, busy, offline
                    isLive: false, // ✅ CHANGED: New accounts start as NOT LIVE until profile completed
                    hourlyRate: 100, // Required by Appwrite schema (50-500 range)
                    therapistId: therapistId, // Required by Appwrite schema
                    hotelId: '', // Required by Appwrite schema - empty for independent therapists
                    isLicensed: false, // Required by Appwrite schema - license verification
                    specialization: 'General Massage', // Required by actual Appwrite collection
                    availability: 'Available', // Valid enum: Available, Busy, Offline
                    
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
            
            logger.debug('✅ [Therapist Sign-Up] Therapist document created:', therapist.$id);
            logger.debug('📧 [Therapist Sign-Up] Email stored in document:', therapist.email);
            
            // 🔗 AUTO-GENERATE SHARE LINK for new therapist
            try {
                console.log('🔗 [Therapist Sign-Up] Auto-generating share link...');
                const { shareLinkService } = await import('../lib/services/shareLinkService');
                const therapistName = normalizedEmail.split('@')[0];
                // ⚠️ NO defaultCity - therapist must set location via GPS in dashboard
                // IP-based location intentionally disabled due to inaccuracy in Indonesia.
                const defaultCity = 'unknown'; // Will be updated when therapist sets GPS location
                
                const shareLink = await shareLinkService.createShareLink(
                    'therapist',
                    therapistId,
                    therapistName,
                    defaultCity
                );
                
                console.log('✅ [Therapist Sign-Up] Share link created:', {
                    slug: shareLink.slug,
                    shortId: shareLink.shortId,
                    entityId: shareLink.entityId
                });
            } catch (shareLinkError) {
                console.warn('⚠️ [Therapist Sign-Up] Share link creation failed (non-critical):', shareLinkError);
                // Don't fail the registration if share link creation fails
            }
            
            // Wait a moment to ensure document is fully persisted
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Log out after registration so user must sign in
            try {
                await account.deleteSession('current');
                logger.debug('✅ [Therapist Sign-Up] Session cleared - user must sign in');
            } catch (logoutError) {
                console.warn('⚠️ [Therapist Sign-Up] Could not clear session:', logoutError);
            }
            
            logger.debug('🎉 [Therapist Sign-Up] SUCCESS! Returning response...');
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            if (DEBUG_AUTH) console.error('❌ [Therapist Sign-Up] ERROR:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response,
                fullError: error
            });
            const errorMsg = handleAppwriteError(error, 'signup');
            return { success: false, error: errorMsg };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            const normalizedEmail = email.toLowerCase().trim();
            logger.debug('🔵 [Therapist Sign-In] Starting...', { email: normalizedEmail });
            // Environment diagnostics
            const origin = (typeof window !== 'undefined' && window.location ? window.location.origin : 'no-window');
            logger.debug('🛠 [Therapist Sign-In] Environment', {
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                databaseId: APPWRITE_CONFIG.databaseId,
                therapistsCollection: APPWRITE_CONFIG.collections.therapists,
                origin
            });
            
            // Check rate limit (10 attempts per minute for login)
            if (!checkRateLimit('therapist-login', 10, 60000)) {
                const errorMsg = formatRateLimitError('login');
                console.warn('⚠️ [Therapist Sign-In] Rate limited');
                return { success: false, error: errorMsg };
            }
            
            // Clear session cache to force fresh check
            sessionCache.clear();
            
            // Clear any existing session first
            try {
                await account.deleteSession('current');
                logger.debug('✅ [Therapist Sign-In] Cleared existing session');
            } catch {
                logger.debug('ℹ️ [Therapist Sign-In] No active session to delete');
            }
            
            console.log('🔵 [Therapist Sign-In] Creating email/password session...');
            await account.createEmailPasswordSession(email, password);
            console.log('✅ [Therapist Sign-In] Session created');
            
            console.log('🔵 [Therapist Sign-In] Getting user account...');
            const user = await account.get();
            console.log('✅ [Therapist Sign-In] User account retrieved:', user.$id);
            
            logger.debug('🔵 [Therapist Sign-In] Email lookup with retry');
            const searchEmail = normalizedEmail;
            let therapist: any = null;

            for (let attempt = 1; attempt <= 3; attempt++) {
                if (attempt > 1) {
                    await new Promise(r => setTimeout(r, attempt * 250));
                    logger.debug(`⏱️ [Therapist Sign-In] Email retry attempt ${attempt}`);
                }
                try {
                    const match = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.THERAPISTS,
                        [Query.equal('email', searchEmail)]
                    );
                    if (match.documents.length > 0) {
                        therapist = match.documents[0];
                        logger.debug('✅ [Therapist Sign-In] Email query matched document:', therapist.$id);
                        break;
                    } else {
                        logger.debug(`⚠️ [Therapist Sign-In] Attempt ${attempt}: email not indexed yet`);
                    }
                } catch (attemptErr: any) {
                    if (DEBUG_AUTH) console.warn('⚠️ [Therapist Sign-In] Email lookup error:', attemptErr?.message || attemptErr);
                }
            }

            // Optional broad scan only if absolutely not found
            if (!therapist) {
                logger.debug('🔍 [Therapist Sign-In] Broad scan fallback');
                try {
                    const allDocs = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.THERAPISTS
                    );
                    therapist = allDocs.documents.find((doc: any) => doc.email && doc.email.toLowerCase().trim() === searchEmail) || null;
                    if (therapist) {
                        logger.debug('✅ [Therapist Sign-In] Broad scan found document:', therapist.$id);
                    }
                } catch (broadErr: any) {
                    if (DEBUG_AUTH) console.warn('⚠️ [Therapist Sign-In] Broad scan failed:', broadErr?.message || broadErr);
                }
            }
            
            if (!therapist) {
                if (DEBUG_AUTH) console.error('❌ [Therapist Sign-In] Therapist document not found');
                logger.debug('Search criteria - Email:', email, 'Normalized:', searchEmail);
                throw new Error('Therapist profile not found yet. Wait a moment and retry sign-in. If still missing after 30s, re-register or contact support at indastreet.id@gmail.com: ' + email);
            }
            
            logger.debug('✅ [Therapist Sign-In] Therapist document found:', therapist.$id);
            logger.debug('🎉 [Therapist Sign-In] SUCCESS! Returning response...');
            
            return { success: true, userId: user.$id, documentId: therapist.$id };
        } catch (error: any) {
            if (DEBUG_AUTH) console.error('❌ [Therapist Sign-In] ERROR:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response,
                fullError: error
            });
            const errorMsg = handleAppwriteError(error, 'login');
            return { success: false, error: errorMsg };
        }
    },
};

// Place Authentication - Streamlined with only required attributes
export const placeAuth = {
    async signUp(email: string, password: string, name?: string, whatsappNumber?: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            const generatedPlaceId = ID.unique();
            
            console.log('🏢 Creating massage place with required attributes only...');
            
            const placeData = {
                // CORE REQUIRED ATTRIBUTES (verified to exist in Appwrite)
                id: generatedPlaceId,                          // ✅ Required: Document identifier
                placeId: generatedPlaceId,                     // ✅ Required: Place-specific ID field
                userId: user.$id,                              // ✅ ALWAYS link place to auth user ID
                name: name || email.split('@')[0],             // ✅ Required: Business name
                category: 'massage-place',                     // ✅ Required: Business category
                email,                                         // ✅ Required: Email address
                whatsappNumber: whatsappNumber || '',          // ✅ WhatsApp number with +62 prefix
                password: '',                                  // ✅ Required: Managed by Appwrite auth
                pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }), // ✅ Required: Pricing structure
                status: 'Closed',                             // ✅ Required: Open/Closed status
                isLive: false,                                // ✅ Required: Admin approval
                openingTime: '09:00',                         // ✅ Required: Opening time
                closingTime: '21:00',                         // ✅ Required: Closing time
                coordinates: [106.8456, -6.2088],             // ✅ Required: Point format [lng, lat] for Jakarta
                hotelId: '',                                  // ✅ Required: Empty for independent massage places
                profilePicture: '',                           // ✅ Required: Profile picture (lowercase in DB)
                therapistGender: 'Unisex',                    // ✅ Required: Booking gender preference
            };
            
            console.log('📊 Place data (required only):', placeData);
            
            const place = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PLACES,
                generatedPlaceId,
                placeData
            );
            
            console.log('✅ Place document created:', place.$id);
            
            // 🔗 AUTO-GENERATE SHARE LINK for new massage place
            try {
                console.log('🔗 [Place Sign-Up] Auto-generating share link...');
                const { shareLinkService } = await import('../lib/services/shareLinkService');
                const placeName = email.split('@')[0];
                // ⚠️ NO defaultCity - place must set location via GPS in dashboard
                // IP-based location intentionally disabled due to inaccuracy in Indonesia.
                const defaultCity = 'unknown'; // Will be updated when place sets GPS location
                
                const shareLink = await shareLinkService.createShareLink(
                    'place',
                    generatedPlaceId,
                    placeName,
                    defaultCity
                );
                
                console.log('✅ [Place Sign-Up] Share link created:', {
                    slug: shareLink.slug,
                    shortId: shareLink.shortId,
                    entityId: shareLink.entityId
                });
            } catch (shareLinkError) {
                console.warn('⚠️ [Place Sign-Up] Share link creation failed (non-critical):', shareLinkError);
                // Don't fail the registration if share link creation fails
            }
            
            return { success: true, userId: user.$id, documentId: place.$id };
        } catch (error: any) {
            console.error('Place sign up error:', error);
            return { success: false, error: error.message };
        }
    },
    
    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            // Clear session cache to force fresh check
            sessionCache.clear();
            
            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared before place login');
            } catch (err: any) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear:', err?.message || 'unknown reason');
            }

            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            console.log('✅ Authentication successful for:', email, 'user ID:', user.$id);
            
            try {
                const places = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.PLACES
                );
                
                console.log('📊 Total places in database:', places.documents.length);
                console.log('🔍 Searching for place with email:', email);
                
                const place = places.documents.find((doc: any) => doc.email === email);
                
                if (!place) {
                    console.warn('⚠️ No place profile found for email:', email);
                    console.log('Available place emails:', places.documents.slice(0, 5).map((p: any) => p.email));
                    
                    // Create a place profile if it doesn't exist
                    console.log('🔧 Creating missing place profile...');
                    const generatedPlaceId = ID.unique();
                    
                    const placeData = {
                        id: generatedPlaceId,
                        placeId: generatedPlaceId,
                        userId: user.$id, // ✅ ALWAYS link place to auth user ID
                        name: email.split('@')[0],
                        category: 'massage-place',
                        email,
                        password: '',
                        pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                        status: 'Closed',
                        isLive: false,
                        openingTime: '09:00',
                        closingTime: '21:00',
                        coordinates: [106.8456, -6.2088],
                        hotelId: '',
                        profilePicture: '',
                        therapistGender: 'Unisex',
                    };
                    
                    const newPlace = await databases.createDocument(
                        DATABASE_ID,
                        COLLECTIONS.PLACES,
                        generatedPlaceId,
                        placeData
                    );
                    
                    console.log('✅ Created place profile:', newPlace.$id);
                    return { success: true, userId: user.$id, documentId: newPlace.$id };
                }
                
                console.log('✅ Found place profile:', place.$id);
                return { success: true, userId: user.$id, documentId: place.$id };
            } catch (dbError: any) {
                console.error('Database error during place lookup:', dbError);
                // If database lookup fails, still allow login but with user ID
                console.log('⚠️ Proceeding with auth-only login');
                return { success: true, userId: user.$id, documentId: user.$id };
            }
        } catch (error: any) {
            console.error('Place sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// (Duplicate hotelAuth removed)

// Villa Authentication
export const villaAuth = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            
            const villaId = ID.unique();
            const { sanitized, diff } = buildHotelsPayload({ id: villaId, email, type: 'villa', userId: user.$id });
            if (diff.unknown.length || diff.missingRequired.length) {
                console.warn('⚠️ Villa payload sanitized. Unknown:', diff.unknown, 'Missing filled:', diff.missingRequired);
                const STRICT = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_HOTELS_STRICT_SCHEMA === '1')
                  || (typeof process !== 'undefined' && process.env?.VITE_HOTELS_STRICT_SCHEMA === '1');
                if (STRICT) {
                    throw new Error(`Villa payload schema issues. Unknown: ${diff.unknown.join(', ')} Missing: ${diff.missingRequired.join(', ')}`);
                }
            }
            console.log('🟣 [Villa SignUp] Final payload to createDocument:', sanitized);
            const villaDoc = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.HOTELS,
                villaId,
                sanitized
            );
            return { success: true, userId: user.$id, documentId: villaDoc.$id };
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
            } catch (err: any) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear:', err?.message || 'unknown reason');
            }

            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            
            const villas = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.HOTELS // Villas are stored in hotels collection
            );
            
            // Use explicit any to accommodate createDocument return type differences
            let villa: any = villas.documents.find((doc: any) => doc.email === email && doc.type === 'villa');

            if (!villa) {
                console.warn('⚠️ Villa document missing for email, creating new minimal villa profile.');
                const villaId = ID.unique();
                const minimalPayload: Record<string, any> = {
                    id: villaId,
                    hotelId: villaId,
                    hotelName: `Villa ${email.split('@')[0]}`,
                    name: `Villa ${email.split('@')[0]}`,
                    type: 'villa',
                    email,
                    createdAt: new Date().toISOString(),
                    userId: user.$id,
                    partnerTherapists: JSON.stringify([]),
                    discountRate: 0,
                    hotelAddress: 'Address pending',
                    address: 'Address pending',
                    contactNumber: ''
                };
                try {
                    villa = await databases.createDocument(
                        DATABASE_ID,
                        COLLECTIONS.HOTELS,
                        villaId,
                        minimalPayload
                    );
                    console.log('✅ Created missing villa profile:', villa.$id);
                } catch (createErr: any) {
                    console.error('❌ Failed to create missing villa profile:', createErr?.message || createErr);
                    throw new Error('Villa profile creation failed');
                }
            }

            if (!villa) {
                throw new Error('Villa profile not retrievable after creation');
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
                    userId: user.$id, // ✅ ALWAYS link agent to auth user ID
                    name: email.split('@')[0],
                    email,
                    password: '', // Password handled by Appwrite auth
                    whatsappNumber: '',
                    commissionRate: 20, // Default to standard tier
                    tier: 'Standard', // Required field
                    isActive: false, // Required field - admin approval needed
                    createdAt: new Date().toISOString(), // Required field
                    
                    // Optional fields with defaults
                    totalEarnings: 0,
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
            } catch (err: any) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear:', err?.message || 'unknown reason');
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
    } catch (_error) {
        console.error('Sign out error:', _error);
        return false;
    }
};

// Get Current User
export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null;
    }
};
