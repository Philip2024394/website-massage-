import { account, databases, DATABASE_ID, COLLECTIONS } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config.ts';
import { ID } from 'appwrite';
import { getRandomTherapistImage } from '../utils/therapistImageUtils';
import { getCurrencyForCountry } from '../utils/currency';

export interface AuthResponse {
    success: boolean;
    userId?: string;
    documentId?: string;
    error?: string;
}

// Hotel Authentication removed as part of Hotel/Villa/Agent cleanup

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
export const therapistAuth = {
    async signUp(email: string, password: string, agentCode?: string): Promise<AuthResponse> {
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
            
            // Pull referral agent code from param or captured attribution (if available)
            let capturedCode = '';
            try {
                const mod = await import('./affiliateAttribution');
                capturedCode = (mod.getCode?.() || '').toString();
            } catch {}
            const normalizedAgentCode = (agentCode || capturedCode || '')
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 12);
            const hasReferral = !!normalizedAgentCode;

            // Determine country/currency from current app location (if available)
            let countryCode = 'ID';
            try {
                const raw = localStorage.getItem('app_user_location');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.countryCode) countryCode = String(parsed.countryCode).toUpperCase();
                }
            } catch {}
            const currencyCode = getCurrencyForCountry(countryCode);

            // Prepare a conservative payload. We'll auto-prune unknown attributes on error.
            const basePayload: any = {
                id: therapistId,
                therapistId: therapistId,
                email,
                name: email.split('@')[0],
                whatsappNumber: '',
                location: '',
                pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                price60: '100',
                price90: '150',
                price120: '200',
                // Availability status must match Appwrite enum: (available|busy|offline)
                status: 'available',
                isLive: true,
                hourlyRate: 100,
                hotelId: '',
                isLicensed: false,
                specialization: 'General Massage',
                availability: 'Available',
                description: '',
                profilePicture: '',
                mainImage: getRandomTherapistImage(therapistId),
                yearsOfExperience: 0,
                massageTypes: '',
                languages: '',
                coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                // Referral/Attribution fields (will be pruned if collection doesn't support yet)
                agentCode: normalizedAgentCode,
                referralSource: hasReferral ? 'agent' : 'direct',
                referralStatus: hasReferral ? 'pending' : 'validated',
                referralAt: hasReferral ? new Date().toISOString() : null,
                referredByAgentId: '',
                referralCampaignId: '',
                bookingsCount: 0,
                membershipRenewalsCount: 0,
                agentAttributionLocked: false,
                // Optional geo/currency context
                countryCode,
                currency: currencyCode
            };

            async function createWithPruning(payload: any): Promise<any> {
                // Attempt create; if an unknown attribute is reported, remove it and retry
                const maxAttempts = 10;
                let attempt = 0;
                let current = { ...payload };
                while (attempt < maxAttempts) {
                    try {
                        return await databases.createDocument(
                            DATABASE_ID,
                            COLLECTIONS.THERAPISTS,
                            therapistId,
                            current
                        );
                    } catch (e: any) {
                        const msg: string = e?.message || e?.response?.message || '';
                        const m = /Unknown attribute[:\s]*"?([A-Za-z0-9_\-]+)"?/i.exec(msg);
                        if (m && m[1] && current.hasOwnProperty(m[1])) {
                            const badKey = m[1];
                            console.warn('[Therapist Sign-Up] Removing unknown attribute:', badKey);
                            delete current[badKey];
                            attempt++;
                            continue;
                        }
                        // Fallback: if invalid type errors occur for hourlyRate, cast to string/number variants
                        if (/Invalid type/i.test(msg)) {
                            if (/hourlyRate/i.test(msg)) {
                                current.hourlyRate = Number(current.hourlyRate) || 100;
                                attempt++;
                                continue;
                            }
                            if (/pricing/i.test(msg)) {
                                current.pricing = typeof current.pricing === 'string' ? current.pricing : JSON.stringify(current.pricing);
                                attempt++;
                                continue;
                            }
                        }
                        throw e;
                    }
                }
                // Final attempt without any optionals that are commonly problematic
                const minimal: any = {
                    id: therapistId,
                    therapistId: therapistId,
                    email,
                    name: email.split('@')[0],
                    price60: '100',
                    price90: '150',
                    price120: '200',
                    // Minimal fallback keeps required enum lowercase
                    status: 'available',
                    isLive: true,
                    coordinates: JSON.stringify({ lat: 0, lng: 0 })
                };
                return databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.THERAPISTS,
                    therapistId,
                    minimal
                );
            }

            const therapist = await createWithPruning(basePayload);
            
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
    async signUp(email: string, password: string, agentCode?: string): Promise<AuthResponse> {
        try {
            const user = await account.create(ID.unique(), email, password);
            const generatedPlaceId = ID.unique();
            
            console.log('🏢 Creating massage place with required attributes only...');
            
            // Referral capture for places as well
            let capturedCode = '';
            try {
                const mod = await import('./affiliateAttribution');
                capturedCode = (mod.getCode?.() || '').toString();
            } catch {}
            const normalizedAgentCode = (agentCode || capturedCode || '')
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 12);
            const hasReferral = !!normalizedAgentCode;

            const basePayload: any = {
                id: generatedPlaceId,
                therapistId: generatedPlaceId, // Required field
                name: email.split('@')[0],
                email,
                password: '',
                // Required schema fields
                specialization: 'Massage Place',
                yearsOfExperience: 5,
                isLicensed: true,
                hourlyRate: 100,
                hotelId: generatedPlaceId,
                // Pricing
                pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                price60: '100',
                price90: '150',
                price120: '200',
                location: 'Location pending setup',
                // Normalize: status uses lowercase, availability uses capitalized enum
                status: 'available',
                availability: 'Available',
                isLive: false,
                isOnline: true,
                openingTime: '09:00',
                closingTime: '21:00',
                coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                description: '',
                mainImage: '',
                profilePicture: '',
                whatsappNumber: '',
                massageTypes: '',
                languages: '',
                // Referral/Attribution fields (pruned automatically if schema doesn't allow)
                agentCode: normalizedAgentCode,
                referralSource: hasReferral ? 'agent' : 'direct',
                referralStatus: hasReferral ? 'pending' : 'validated',
                referralAt: hasReferral ? new Date().toISOString() : null,
                referredByAgentId: '',
                referralCampaignId: '',
                bookingsCount: 0,
                membershipRenewalsCount: 0,
                agentAttributionLocked: false,
                // Optional geo/currency context
                countryCode,
                currency: currencyCode
            };

            async function createPlaceWithPruning(payload: any): Promise<any> {
                const maxAttempts = 10;
                let attempt = 0;
                let current = { ...payload };
                while (attempt < maxAttempts) {
                    try {
                        return await databases.createDocument(
                            APPWRITE_CONFIG.databaseId,
                            APPWRITE_CONFIG.collections.places,
                            generatedPlaceId,
                            current
                        );
                    } catch (e: any) {
                        const msg: string = e?.message || e?.response?.message || '';
                        console.error('[Place Sign-Up] Attempt', attempt + 1, 'failed:', msg);
                        console.error('[Place Sign-Up] Current payload keys:', Object.keys(current));
                        console.error('[Place Sign-Up] Coordinates value:', current.coordinates);
                        
                        // Handle missing or invalid coordinates
                        if (/Missing required attribute[:\s]*"?coordinates"?/i.test(msg) || /coordinates/i.test(msg)) {
                            console.warn('[Place Sign-Up] Coordinates error detected, trying alternatives...');
                            
                            // Try sequence of fixes
                            if (current.coordinates === JSON.stringify({ lat: 0, lng: 0 })) {
                                // Try empty string
                                current.coordinates = '';
                                console.warn('[Place Sign-Up] Trying empty string for coordinates');
                                attempt++;
                                continue;
                            } else if (current.coordinates === '') {
                                // Try removing it entirely
                                delete current.coordinates;
                                console.warn('[Place Sign-Up] Removing coordinates entirely');
                                attempt++;
                                continue;
                            } else if (!current.hasOwnProperty('coordinates')) {
                                // Add it back as JSON string
                                current.coordinates = JSON.stringify({ lat: 0, lng: 0 });
                                console.warn('[Place Sign-Up] Adding coordinates back as JSON string');
                                attempt++;
                                continue;
                            }
                        }
                        
                        const m = /Unknown attribute[:\s]*"?([A-Za-z0-9_\-]+)"?/i.exec(msg);
                        if (m && m[1] && current.hasOwnProperty(m[1])) {
                            const badKey = m[1];
                            console.warn('[Place Sign-Up] Removing unknown attribute:', badKey);
                            delete current[badKey];
                            attempt++;
                            continue;
                        }
                        
                        if (/Invalid type/i.test(msg) && /pricing/i.test(msg)) {
                            current.pricing = typeof current.pricing === 'string' ? current.pricing : JSON.stringify(current.pricing);
                            attempt++;
                            continue;
                        }
                        
                        console.error('[Place Sign-Up] All attempts failed, throwing error');
                        throw e;
                    }
                }
                const minimal: any = {
                    id: generatedPlaceId,
                    therapistId: generatedPlaceId,
                    name: email.split('@')[0],
                    email,
                    specialization: 'Massage Place',
                    yearsOfExperience: 5,
                    isLicensed: true,
                    hourlyRate: 100,
                    hotelId: generatedPlaceId,
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    price60: '100',
                    price90: '150',
                    price120: '200',
                    location: 'Location pending',
                    status: 'available',
                    availability: 'Available',
                    isLive: false,
                    isOnline: true,
                    coordinates: JSON.stringify({ lat: 0, lng: 0 })
                };
                return databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.places,
                    generatedPlaceId,
                    minimal
                );
            }

            const place = await createPlaceWithPruning(basePayload);
            
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
            } catch (err: any) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear:', err?.message || 'unknown reason');
            }

            await account.createEmailPasswordSession(email, password);
            const user = await account.get();
            console.log('✅ Authentication successful for:', email, 'user ID:', user.$id);
            
            try {
                const places = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.places
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
                        therapistId: generatedPlaceId,
                        name: email.split('@')[0],
                        email,
                        password: '',
                        specialization: 'Massage Place',
                        yearsOfExperience: 5,
                        isLicensed: true,
                        hourlyRate: 100,
                        hotelId: generatedPlaceId,
                        pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                        price60: '100',
                        price90: '150',
                        price120: '200',
                        location: 'Location pending setup',
                        status: 'available',
                        availability: 'Available',
                        isLive: false,
                        isOnline: true,
                        openingTime: '09:00',
                        closingTime: '21:00',
                        coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                        description: '',
                        mainImage: '',
                        profilePicture: '',
                        whatsappNumber: '',
                        massageTypes: '',
                        languages: ''
                    };
                    
                    const newPlace = await databases.createDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.places,
                        generatedPlaceId,
                        placeData
                    );
                    
                    console.log('✅ Created place profile:', newPlace.$id, 'with place ID:', generatedPlaceId);
                    return { success: true, userId: generatedPlaceId, documentId: newPlace.$id };
                }
                
                console.log('✅ Found existing place profile:', place.$id, 'with place ID:', place.id);
                return { success: true, userId: place.id, documentId: place.$id };
            } catch (dbError: any) {
                console.error('Database error during place lookup:', dbError);
                // If database lookup fails, create a basic place ID from email
                console.log('⚠️ Database lookup failed, generating place ID from email');
                const fallbackPlaceId = email.replace('@', '_').replace(/[^a-zA-Z0-9_]/g, '');
                return { success: true, userId: fallbackPlaceId, documentId: user.$id };
            }
        } catch (error: any) {
            console.error('Place sign in error:', error);
            return { success: false, error: error.message };
        }
    },
};

// (Duplicate hotelAuth removed)

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
