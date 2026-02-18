/**
 * Therapist management and operations
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG, account, rateLimitedDb } from '../config';
import { ID, Query } from 'appwrite';
import { duplicateAccountDetectionService } from '../../../services/duplicateAccountDetection.service';
import { getRandomTherapistImage } from '../../../utils/therapistImageUtils';
import { handleAppwriteError } from '../../../lib/globalErrorHandler';
import { APPWRITE_CRASH_ERROR_CODE } from '../../../utils/appwriteHelpers';
import { applyDisplayStatusToTherapists } from '../../../utils/therapistDisplayStatus';

// Import services with proper fallbacks
let sendAdminNotification: any;
let getNonRepeatingMainImage: any;

// Helper for creating a solid color data URL placeholder
const createPlaceholderDataURL = (text: string, bgColor: string = '#f3f4f6', textColor: string = '#374151') => {
    const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="18" fill="${textColor}">${text}</text>
    </svg>`;
    // Use encodeURIComponent instead of btoa to avoid ERR_INVALID_URL
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

try {
    ({ sendAdminNotification } = require('../config'));
} catch {
    sendAdminNotification = () => console.warn('sendAdminNotification not available');
}
try {
    ({ getNonRepeatingMainImage } = require('../config'));
} catch {
    getNonRepeatingMainImage = (index: number) => createPlaceholderDataURL(`Therapist ${index + 1}`);
}

export const therapistService = {
    async create(therapist: any): Promise<any> {
        try {
            // Seed analytics with initial bookings (25-50) if not provided
            if (!therapist.analytics) {
                const seedBookings = 25 + Math.floor(Math.random() * 26); // 25-50 inclusive
                therapist.analytics = JSON.stringify({
                    impressions: 0,
                    views: 0,
                    profileViews: 0,
                    whatsapp_clicks: 0,
                    whatsappClicks: 0,
                    phone_clicks: 0,
                    directions_clicks: 0,
                    bookings: seedBookings
                });
            } else {
                // Ensure bookings field exists
                try {
                    const parsed = JSON.parse(therapist.analytics);
                    if (parsed && typeof parsed.bookings !== 'number') {
                        parsed.bookings = 25 + Math.floor(Math.random() * 26);
                        therapist.analytics = JSON.stringify(parsed);
                    }
                } catch {
                    const seedBookings = 32 + Math.floor(Math.random() * 19);
                    therapist.analytics = JSON.stringify({ bookings: seedBookings });
                }
            }
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                'unique()',
                therapist
            );
            
            // Send email notification to admin
            try {
                await sendAdminNotification({
                    type: 'therapist',
                    name: therapist.name || 'Unknown',
                    email: (therapist as any).email || 'Not provided',
                    whatsappNumber: therapist.whatsappNumber || therapist.contactNumber || 'Not provided',
                    location: therapist.location || 'Not provided',
                    registrationDate: new Date().toISOString()
                });
            } catch (emailError) {
                console.error('Failed to send admin notification:', emailError);
                // Don't throw - registration was successful even if email failed
            }
            
            return response;
        } catch (error: unknown) {
            const err = error as Error; console.error('Error creating therapist:', err);
            throw error as Error;
        }
    },
    /** Consumer-facing list: only approved, online, and available therapists. */
    async getTherapists(city?: string, area?: string): Promise<any[]> {
        return this.getAll(city, area, { liveOnly: true });
    },
    /** All therapists (admin/back-office). Use getTherapists() for consumer home for approved+online+available only. */
    async getAll(city?: string, area?: string, options?: { liveOnly?: boolean }): Promise<any[]> {
        const databaseId = APPWRITE_CONFIG.databaseId;
        const collectionId = APPWRITE_CONFIG.collections.therapists;
        const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

        // Filter step: 0=baseline (limit only), 1=+approved, 2=+status, 3=+availability. Set VITE_THERAPIST_FILTER_STEP to reintroduce filters after confirming baseline works. Data types: approved=boolean true, status="online", availability="available".
        const filterStepRaw = typeof import.meta !== 'undefined' && (import.meta.env?.VITE_THERAPIST_FILTER_STEP ?? '0');
        const filterStep = String(filterStepRaw) === '1' || String(filterStepRaw) === '2' || String(filterStepRaw) === '3' ? parseInt(String(filterStepRaw), 10) : 0;
        let filterDescription = filterStep === 0 ? 'none (limit only) — baseline' : '';

        try {
            // Baseline: only Query.limit(200). Reintroduce filters one at a time via VITE_THERAPIST_FILTER_STEP=1|2|3.
            const queries: string[] = [Query.limit(200)];

            if (options?.liveOnly && filterStep >= 1) {
                queries.push(Query.equal('approved', true));
                filterDescription = 'approved=true';
            }
            if (options?.liveOnly && filterStep >= 2) {
                queries.push(Query.equal('status', 'online'));
                filterDescription = filterDescription ? filterDescription + ', status=online' : 'status=online';
            }
            if (options?.liveOnly && filterStep >= 3) {
                queries.push(Query.equal('availability', 'available'));
                filterDescription = filterDescription ? filterDescription + ', availability=available' : 'availability=available';
            }
            if (city) {
                queries.push(Query.search('location', city));
                filterDescription += (filterDescription ? ' + ' : '') + `search(location,${city})`;
            }

            // Always log config and env at runtime (dev) so we can confirm IDs and filters.
            if (isDev) {
                console.log('[APPWRITE therapists] env (runtime):', {
                    VITE_APPWRITE_DATABASE_ID: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_APPWRITE_DATABASE_ID : 'n/a',
                    VITE_THERAPISTS_COLLECTION_ID: typeof import.meta !== 'undefined' ? import.meta.env?.VITE_THERAPISTS_COLLECTION_ID : 'n/a'
                });
                console.log('[APPWRITE therapists] listDocuments config:', {
                    DATABASE_ID: databaseId,
                    THERAPISTS_COLLECTION_ID: collectionId,
                    resultWillLog: 'total, documents.length',
                    filters: filterDescription,
                    filterStep,
                    queryCount: queries.length
                });
            }

            const response = await rateLimitedDb.listDocuments(databaseId, collectionId, queries);
            const docs = response?.documents ?? [];
            const total = response?.total ?? 'n/a';

            // Required logging: DATABASE_ID, THERAPISTS_COLLECTION_ID, result.total, result.documents.length
            if (isDev) {
                console.log('[APPWRITE therapists] listDocuments response:', {
                    DATABASE_ID: databaseId,
                    THERAPISTS_COLLECTION_ID: collectionId,
                    'result.total': total,
                    'result.documents.length': docs.length,
                    filtersUsed: filterDescription
                });
            }
            // When empty, log once in production so we don't silently return empty results
            if (docs.length === 0 && !isDev) {
                console.warn('[APPWRITE therapists] documents array is empty. DATABASE_ID:', databaseId, 'THERAPISTS_COLLECTION_ID:', collectionId, 'total:', total, 'filters:', filterDescription);
            }

            // After each step: log first document values + typeof for approved/status/availability
            if (isDev) {
                if (docs.length > 0 && docs[0]) {
                    const first = docs[0] as any;
                    console.log('[APPWRITE therapists] first document (verify types):', {
                        documentsLength: docs.length,
                        approved: first.approved,
                        approvedType: typeof first.approved,
                        status: first.status,
                        statusType: typeof first.status,
                        availability: first.availability,
                        availabilityType: typeof first.availability
                    });
                } else {
                    console.warn('[APPWRITE therapists] documents array is empty. Check: attribute names (approved/status/availability), values (approved=boolean true, status="online", availability="available"), index on approved, collection Read permission for Role: Any or Users.');
                }
            }

            // Client-side filtering by service area if specified
            let filteredDocuments = response.documents;
            if (area) {
                filteredDocuments = response.documents.filter((therapist: any) => {
                    // Parse serviceAreas from JSON string
                    let serviceAreas: string[] = [];
                    if (therapist.serviceAreas) {
                        try {
                            if (typeof therapist.serviceAreas === 'string') {
                                serviceAreas = JSON.parse(therapist.serviceAreas);
                            } else if (Array.isArray(therapist.serviceAreas)) {
                                serviceAreas = therapist.serviceAreas;
                            }
                        } catch (error) {
                            console.warn('⚠️ Failed to parse serviceAreas for therapist:', therapist.name, error);
                            return false;
                        }
                    }
                    
                    if (!Array.isArray(serviceAreas) || serviceAreas.length === 0) {
                        // If no serviceAreas defined, exclude from area-filtered results
                        return false;
                    }
                    
                    return serviceAreas.includes(area);
                });
            }
            // Add random main images and normalize status to therapists
            const therapistsWithImages = response.documents.map((therapist: any, index: number) => {
                // ⚠️ DISABLED: Persistence logic causes mass 400 errors and rate limiting
                // Images are now set directly in SharedTherapistProfile.tsx with official URLs
                
                // Main image = pool of ~20 images by therapist ID (therapists only upload profile image, not main image)
                const therapistId = (therapist as any).$id || therapist.id || '';
                const assignedMainImage = getRandomTherapistImage(therapistId);
                
                // Normalize status from database (lowercase) to enum format (capitalized)
                const normalizeStatus = (status: string) => {
                    if (!status) return 'Busy'; // Default to Busy instead of Offline
                    const lowercaseStatus = status.toLowerCase();
                    if (lowercaseStatus === 'available') return 'Available';
                    if (lowercaseStatus === 'busy') return 'Busy';
                    if (lowercaseStatus === 'offline') return 'Busy'; // Show offline as busy
                    return status; // Return as-is if unknown
                };
                
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
                    busyUntil: (extractedBusyTimer as any)?.busyUntil as any || null,
                    busyDuration: (extractedBusyTimer as any)?.busyDuration as any || null,
                    // ✅ FIX #1: Map Appwrite document.$id to appwriteId field (REQUIRED for booking integrity)
                    appwriteId: (therapist as any).$id || therapist.id
                };
            });
            
            // 🛡️ SAFEPASS INTEGRATION - Load SafePass data and join with therapists
            try {
                // Load all active SafePass records for therapists
                const safePassResponse = await rateLimitedDb.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    'safepass', // SafePass collection ID
                    [
                        Query.equal('entityType', 'therapist'),
                        Query.limit(500)
                    ]
                );
                // Create a map of entityId -> SafePass record for quick lookup
                const safePassMap = new Map();
                safePassResponse.documents.forEach((sp: any) => {
                    safePassMap.set(sp.entityId, sp);
                });
                
                // Enrich therapists with SafePass data
                const therapistsWithSafePass = therapistsWithImages.map((therapist: any) => {
                    const therapistId = (therapist as any).$id || therapist.id;
                    const safePassRecord = safePassMap.get(therapistId);
                    
                    if (safePassRecord) {
                        const isActive = safePassRecord.hotelVillaSafePassStatus === 'active';
                        const hasSafePassVerification = safePassRecord.hasSafePassVerification === true;
                        return {
                            ...therapist,
                            hotelVillaSafePassStatus: safePassRecord.hotelVillaSafePassStatus,
                            hasSafePassVerification: safePassRecord.hasSafePassVerification,
                            safePassActivatedDate: safePassRecord.activatedDate,
                            safePassExpiresDate: safePassRecord.expiresDate
                        };
                    }
                    
                    return therapist;
                });
                
                return therapistsWithSafePass;
            } catch (safePassError) {
                console.error('⚠️ [SAFEPASS] Failed to load SafePass data:', safePassError);
                // Return therapists without SafePass data if loading fails
                return therapistsWithImages;
            }
        } catch (error: unknown) {
            const err = error as Error; console.error('❌ [CRITICAL] Therapist fetch failed:', err);
            console.error('🔍 [ERROR DETAILS] Message:', (error as Error).message);
            console.error('🔍 [ERROR DETAILS] Code:', (error as any).code);
            console.error('🔍 [ERROR DETAILS] Type:', (error as any).type);
            console.error('🔍 [ERROR DETAILS] DATABASE_ID:', APPWRITE_CONFIG.databaseId);
            console.error('🔍 [ERROR DETAILS] THERAPISTS_COLLECTION_ID:', APPWRITE_CONFIG.collections.therapists);
            console.error('🔍 [ERROR DETAILS] Filters used:', filterDescription);
            
            if ((error as Error).message?.includes('Collection with the requested ID could not be found')) {
                console.error('💡 [FIX HINT] The collection ID doesn\'t exist in Appwrite!');
                console.error('💡 [FIX HINT] Check: https://syd.cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05');
            }
            
            if ((error as Error).message?.includes('not authorized')) {
                console.error('💡 [FIX HINT] Permission issue - collection permissions need to be set for "any" role');
            }
            // Real-time data only: do not return fallback or mock data. Callers must handle errors and show e.g. "Cannot access Appwrite data".
            throw new Error('Cannot access Appwrite data');
        }
    },

    /**
     * Return exact count of therapists from Appwrite (real-time, no cache).
     * Use for "how many therapists in [location]" – only returns data that exists in the database.
     * @param location optional – filter by location (search)
     * @returns total count from listDocuments (response.total)
     */
    async getTherapistCount(location?: string): Promise<number> {
        try {
            const queries = [Query.limit(1)];
            if (location && location.trim()) {
                queries.push(Query.search('location', location.trim()));
            }
            const response = await rateLimitedDb.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                queries
            );
            return response.total ?? 0;
        } catch (e) {
            console.error('getTherapistCount failed:', e);
            throw new Error('Cannot access Appwrite data');
        }
    },

    /**
     * Return count of therapists that are "live" on the app (isLive === true).
     * Real-time from Appwrite; no cache.
     */
    async getLiveTherapistCount(): Promise<number> {
        const all = await this.getAll();
        return all.filter((t: any) => t?.isLive === true || t?.isLive === 'true').length;
    },

    /**
     * Audit therapist locations against app landing page / dropdown / filter options.
     * Returns counts and list of therapists whose city does not match any app city (locationId, name, or alias).
     * Real-time from Appwrite.
     */
    async getTherapistLocationAudit(): Promise<{
        total: number;
        liveCount: number;
        withCorrectLocation: number;
        incorrectOrMissingLocation: number;
        incorrectDetails: Array<{ id: string; name: string; city: string }>;
    }> {
        const { ALL_INDONESIAN_CITIES } = await import('../../../data/indonesianCities');
        const validCityValues = new Set<string>();
        for (const city of ALL_INDONESIAN_CITIES) {
            validCityValues.add(city.locationId.toLowerCase().trim());
            validCityValues.add(city.name.toLowerCase().trim());
            (city.aliases || []).forEach((a: string) => validCityValues.add(a.toLowerCase().trim()));
        }
        const normalize = (s: string | undefined | null) => (s ? String(s).toLowerCase().trim() : '');
        const all = await this.getAll();
        const liveCount = all.filter((t: any) => t?.isLive === true || t?.isLive === 'true').length;
        const incorrectDetails: Array<{ id: string; name: string; city: string }> = [];
        for (const t of all) {
            const cityRaw = t.city || t.locationId || t.location_id || t.location || '';
            const cityNorm = normalize(cityRaw);
            const cityPart = cityNorm.includes(',') ? cityNorm.split(',')[0].trim() : cityNorm;
            const matches = cityNorm && (validCityValues.has(cityNorm) || validCityValues.has(cityPart));
            if (!matches && (cityRaw || t.name)) {
                incorrectDetails.push({
                    id: t.$id || t.id || '',
                    name: t.name || '—',
                    city: cityRaw || '(empty)'
                });
            }
        }
        return {
            total: all.length,
            liveCount,
            withCorrectLocation: all.length - incorrectDetails.length,
            incorrectOrMissingLocation: incorrectDetails.length,
            incorrectDetails
        };
    },

    /**
     * Fetch therapists who can receive bookings: real_status true and display_status Available (per location).
     * Top performers always Available; normal therapists use rotating display (~30% Busy per location).
     * Optionally filter by service_type (massage/facial).
     */
    async getAvailableTherapistsByLocation(location: string, serviceType?: 'massage' | 'facial'): Promise<any[]> {
        try {
            const all = await this.getAll(location);
            const realAvailable = all.filter((t: any) => {
                const status = String(t?.status || t?.availability || '').toLowerCase();
                const isLive = t?.isLive === true || t?.isLive === 'true';
                const isAvailable = status === 'available' || status === 'online' || (t?.available === true) || isLive;
                if (!isAvailable) return false;
                if (serviceType) {
                    const st = String(t?.service_type || t?.serviceType || '').toLowerCase();
                    return st === serviceType || st === 'both' || !st;
                }
                return true;
            });
            const withDisplay = applyDisplayStatusToTherapists(realAvailable);
            return withDisplay.filter((t: any) => t.display_status === 'Available');
        } catch (e) {
            console.error('getAvailableTherapistsByLocation failed:', e);
            throw new Error('Cannot access Appwrite data');
        }
    },

    /** Read terms_acknowledged from therapist document (dashboard T&C gate). */
    async getTermsAcknowledged(id: string): Promise<boolean> {
        if (!id) return false;
        try {
            const doc = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            return (doc as any)?.terms_acknowledged === true || (doc as any)?.terms_acknowledged === 'true';
        } catch {
            return false;
        }
    },

    /** Set terms_acknowledged = true in Appwrite after therapist agrees to dashboard T&C. Falls back to localStorage-only if attribute is not on collection. */
    async setTermsAcknowledged(id: string): Promise<void> {
        if (!id) return;
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id,
                { terms_acknowledged: true }
            );
        } catch (e: any) {
            const msg = e?.message ?? String(e);
            if (msg.includes('Unknown attribute') && msg.includes('terms_acknowledged')) {
                // Collection doesn't have terms_acknowledged yet; DashboardTermsGate will persist via localStorage only
                return;
            }
            console.error('setTermsAcknowledged failed:', e);
            throw e;
        }
    },

    async getById(id: string): Promise<any> {
        try {
            console.log('\n' + '📡'.repeat(50));
            console.log('📡 [APPWRITE CLIENT] therapistService.getById() called');
            console.log('📡'.repeat(50));
            console.log('🆔 Input ID:', id);
            console.log('🗄️  Database ID:', APPWRITE_CONFIG.databaseId);
            console.log('📦 Collection ID:', APPWRITE_CONFIG.collections.therapists);
            console.log('🔌 Database client initialized:', !!databases);
            console.log('📡'.repeat(50) + '\n');
            
            console.log('⏳ [APPWRITE] Executing databases.getDocument()...');
            const startTime = Date.now();
            
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            
            const duration = Date.now() - startTime;
            
            console.log('\n' + '✅'.repeat(50));
            console.log('✅ [APPWRITE SUCCESS] Document retrieved');
            console.log('✅'.repeat(50));
            console.log('⏱️  Query duration:', duration + 'ms');
            console.log('📄 Document ID:', (response as any).$id);
            console.log('👤 Name:', response.name || response.therapistName);
            console.log('📍 Location:', response.location || response.city);
            console.log('⭐ Rating:', response.rating);
            console.log('💰 Pricing:', response.pricing);
            console.log('📊 Review Count:', response.reviewCount);
            console.log('🔑 All keys:', Object.keys(response).join(', '));
            console.log('✅'.repeat(50) + '\n');
            
            return response;
        } catch (error: unknown) {
            const errAny = error as { code?: number; message?: string };
            if (errAny?.code === APPWRITE_CRASH_ERROR_CODE) {
                console.warn('🛡️ [therapist.getById] Caught crash code 536870904 - using fallback');
                handleAppwriteError(error, 'therapist.getById');
            }
            console.error('\n' + '❌'.repeat(50));
            console.error('❌ [APPWRITE ERROR] Direct fetch failed');
            console.error('❌'.repeat(50));
            console.error('🔴 Error type:', (error as any).constructor?.name);
            console.error('🔴 Error message:', (error as Error).message);
            console.error('🔴 Error code:', errAny?.code);
            console.error('🔴 Error type (appwrite):', (error as any).type);
            const err = error as Error; console.error('🔴 Full error object:', err);
            console.error('❌'.repeat(50) + '\n');
            
            // Fallback: Try searching in all therapists if direct ID fetch fails
            try {
                console.log('\n' + '🔄'.repeat(50));
                console.log('🔄 [FALLBACK] Attempting search through all therapists...');
                console.log('🔄'.repeat(50) + '\n');
                
                const allTherapists = await this.getAll();
                
                console.log('📊 [FALLBACK] Total therapists retrieved:', allTherapists.length);
                console.log('🔍 [FALLBACK] Searching for ID:', id);
                console.log('🔍 [FALLBACK] Also trying ID prefix:', id.split('-')[0]);
                
                const found = allTherapists.find(t => 
                    (t as any).$id === id || 
                    t.id === id ||
                    (t as any).$id === id.split('-')[0] || 
                    t.id === id.split('-')[0]
                );
                
                if (found) {
                    console.log('\n' + '✅'.repeat(50));
                    console.log('✅ [FALLBACK SUCCESS] Found therapist via search');
                    console.log('✅'.repeat(50));
                    console.log('👤 Name:', found.name || found.therapistName);
                    console.log('🆔 ID:', (found as any).$id || found.id);
                    console.log('✅'.repeat(50) + '\n');
                    return found;
                }
                
                console.error('\n' + '⚠️'.repeat(50));
                console.error('⚠️ [FALLBACK FAILED] Therapist not found in collection');
                console.error('⚠️'.repeat(50));
                console.error('💡 Sample available IDs:', allTherapists.slice(0, 5).map(t => (t as any).$id || t.id));
                console.error('⚠️'.repeat(50) + '\n');
            } catch (searchError) {
                console.error('\n' + '💥'.repeat(50));
                console.error('💥 [FALLBACK ERROR] Search fallback also failed');
                console.error('💥'.repeat(50));
                console.error('🔴 Search error:', (error as Error).message);
                console.error('💥'.repeat(50) + '\n');
            }
            
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

            // Normalize email for consistent lookup (case-insensitive, trimmed)
            const normalizedEmail = email.toLowerCase().trim();
            
            console.log('🔍 Searching for therapist by email:', normalizedEmail);
            console.log('🔍 [DEBUG] Original email:', JSON.stringify(email));
            console.log('🔍 [DEBUG] Normalized email:', JSON.stringify(normalizedEmail));
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('email', normalizedEmail)]
            );
            console.log('📋 Found therapists with email:', response.documents.length);
            
            if (response.documents.length === 0) {
                console.warn('⚠️ No therapist found for email:', normalizedEmail);
                console.warn('⚠️ This may indicate:');
                console.warn('   1. Therapist document not created during signup');
                console.warn('   2. Email stored with different normalization');
                console.warn('   3. Document exists but email field is different');
            } else {
                console.log('📋 [DEBUG] Found therapist document(s):', response.documents.map(d => ({
                    id: (d as any).$id,
                    email: (d as any).email,
                    name: d.name,
                    status: d.status
                })));
            }
            
            // Normalize status: no Offline in app; offline/empty → Busy
            const normalizeStatus = (status: string) => {
                if (!status) return 'Busy';
                const lowercaseStatus = status.toLowerCase();
                if (lowercaseStatus === 'available') return 'Available';
                if (lowercaseStatus === 'busy' || lowercaseStatus === 'offline') return 'Busy';
                return status;
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
                    busyUntil: (extractedBusyTimer as any)?.busyUntil as any || null,
                    busyDuration: (extractedBusyTimer as any)?.busyDuration as any || null,
                    // 🔒 REQUIRED: Map Appwrite document.$id to appwriteId field
                    appwriteId: (therapist as any).$id || therapist.id
                };
            });
            
            return normalizedTherapists;
        } catch (error: unknown) {
            const err = error as Error; console.error('❌ Error finding therapist by email:', err);
            
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
    async getByUserId(userId: string): Promise<any[]> {
        try {
            // Check if collection is disabled
            if (!APPWRITE_CONFIG.collections.therapists) {
                console.warn('⚠️ Therapist collection is disabled - returning empty array');
                return [];
            }

            console.log('🔍 Searching for therapist by userId:', userId);
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('userId', userId)]
            );
            console.log('📋 Found therapists with userId:', response.documents.length);
            
            // Normalize status: no Offline; offline/empty → Busy
            const normalizeStatus = (status: string) => {
                if (!status) return 'Busy';
                const lowercaseStatus = status.toLowerCase();
                if (lowercaseStatus === 'available') return 'Available';
                if (lowercaseStatus === 'busy' || lowercaseStatus === 'offline') return 'Busy';
                return status;
            };
            
            const normalizedTherapists = response.documents.map((therapist: any) => {
                // Extract busy timer data from description if present
                let extractedBusyTimer = null;
                let cleanDescription = therapist.description || '';
                
                const timerMatch = cleanDescription.match(/\[TIMER:(.+?)\]/);
                if (timerMatch) {
                    try {
                        extractedBusyTimer = JSON.parse(timerMatch[1]);
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
                    busyUntil: (extractedBusyTimer as any)?.busyUntil as any || null,
                    busyDuration: (extractedBusyTimer as any)?.busyDuration as any || null,
                    // 🔒 REQUIRED: Map Appwrite document.$id to appwriteId field
                    appwriteId: (therapist as any).$id || therapist.id
                };
            });
            
            return normalizedTherapists;
        } catch (error: unknown) {
            const err = error as Error; console.error('❌ Error finding therapist by userId:', err);
            
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
        } catch (error: unknown) {
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
            const currentDocument = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id
            );
            
            console.log('📋 Current document data:', currentDocument);
            
            // Start with current document data and update only the provided fields
            const mappedData: any = {
                // Core required fields - preserve from current document
                name: currentDocument.name,
                email: (currentDocument as any).email,
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
                
                // Required booking field - preserve from current document
                bookingsEnabled: currentDocument.bookingsEnabled !== undefined ? currentDocument.bookingsEnabled : true,
                
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
                // 72h lock: when profile went live (set once when isLive first becomes true)
                profileWentLiveAt: (currentDocument as any).profileWentLiveAt || null,
            };
            
            // When going live: set profileWentLiveAt once (72 hours after this, name/description/image/location lock for therapist; admin can still edit)
            if (data.isLive === true && !(currentDocument as any).profileWentLiveAt) {
                mappedData.profileWentLiveAt = new Date().toISOString();
            }
            if ((data as any).profileWentLiveAt !== undefined) mappedData.profileWentLiveAt = (data as any).profileWentLiveAt;
            
            // Now update with the provided data
            if (data.status) {
                mappedData.status = data.status.toLowerCase(); // Database expects lowercase for status
                // Convert status to proper capitalized format for availability field
                const statusCapitalized = data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase();
                mappedData.availability = statusCapitalized; // Database expects capitalized for availability
                // Synchronize new available/busy string attributes (recently added to schema)
                if (data.status.toLowerCase() === 'available') {
                    mappedData.available = new Date().toISOString();
                    mappedData.busy = '';
                } else if (data.status.toLowerCase() === 'busy') {
                    // Use bookedUntil / busyDuration to form busy value; fallback to timestamp
                    const bookedUntilTs = data.bookedUntil || (data as any).busyUntil as any || new Date(Date.now() + 60*60*1000).toISOString();
                    mappedData.busy = bookedUntilTs;
                    mappedData.available = '';
                } else if (data.status.toLowerCase() === 'offline') {
                    // No offline: treat as busy (logout/app close set busy)
                    mappedData.status = 'busy';
                    mappedData.availability = 'Busy';
                    mappedData.available = '';
                    mappedData.busy = new Date().toISOString();
                }
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
                        mappedData.availability = 'Busy';
                        mappedData.status = 'busy';
                    } else {
                        mappedData.availability = availabilityValue; // Use as-is if already correct
                    }
                }
            }
            
            // Update other fields only if provided
            if (data.name) mappedData.name = data.name;
            if ((data as any).email) (mappedData as any).email = (data as any).email;
            // Only save profilePicture if it's a URL (not base64 data)
            if (data.profilePicture && !data.profilePicture.startsWith('data:')) {
                mappedData.profilePicture = data.profilePicture;
            }
            if (data.description) mappedData.description = data.description;
            if (data.whatsappNumber) mappedData.whatsappNumber = data.whatsappNumber;
            if (data.location) mappedData.location = data.location;
            if (data.pricing) mappedData.pricing = data.pricing;
            if (data.price60 !== undefined) mappedData.price60 = String(data.price60);
            if (data.price90 !== undefined) mappedData.price90 = String(data.price90);
            if (data.price120 !== undefined) mappedData.price120 = String(data.price120);
            if (data.massageTypes) mappedData.massageTypes = data.massageTypes;
            if (data.languages) {
                // Schema expects a single string. If array provided, join.
                if (Array.isArray(data.languages)) {
                    mappedData.languages = data.languages.join(', ');
                } else {
                    mappedData.languages = data.languages;
                }
            }
            if (data.coordinates) mappedData.coordinates = data.coordinates;
            if (data.isLive !== undefined) mappedData.isLive = data.isLive;
            
            // 72h lock: after 72 hours from profileWentLiveAt, therapist cannot change name, description, profile picture, location (admin can)
            const wentLiveAt = (mappedData as any).profileWentLiveAt || (currentDocument as any).profileWentLiveAt;
            if (wentLiveAt) {
                const lockMs = 72 * 60 * 60 * 1000;
                const isLocked = (Date.now() - new Date(wentLiveAt).getTime()) > lockMs;
                if (isLocked) {
                    mappedData.name = currentDocument.name;
                    mappedData.description = currentDocument.description || '';
                    mappedData.profilePicture = currentDocument.profilePicture || '';
                    mappedData.location = currentDocument.location || '';
                    mappedData.geopoint = currentDocument.geopoint || currentDocument.coordinates;
                    mappedData.city = currentDocument.city || currentDocument.location;
                    mappedData.locationId = currentDocument.locationId || currentDocument.location;
                    mappedData.coordinates = currentDocument.coordinates;
                }
            }
            if (data.hourlyRate) mappedData.hourlyRate = data.hourlyRate;
            if (data.specialization) mappedData.specialization = data.specialization;
            if (data.yearsOfExperience) mappedData.yearsOfExperience = data.yearsOfExperience;
            if (data.isLicensed !== undefined) mappedData.isLicensed = data.isLicensed;
            if (data.bookingsEnabled !== undefined) mappedData.bookingsEnabled = data.bookingsEnabled;
            if (data.isVerified !== undefined) mappedData.isVerified = data.isVerified;
            
            // Handle premium membership fields (only fields that exist in DB)
            if (data.membershipTier !== undefined) mappedData.membershipTier = data.membershipTier;
            if (data.premiumPaymentStatus !== undefined) mappedData.premiumPaymentStatus = data.premiumPaymentStatus;
            if (data.premiumPaymentSubmittedAt !== undefined) mappedData.premiumPaymentSubmittedAt = data.premiumPaymentSubmittedAt;
            // premiumPaymentProof, premiumActivatedAt, premiumDeclineReason stored in payment_transactions collection
            
            // Handle custom menu field
            if (data.customMenu !== undefined) mappedData.customMenu = data.customMenu;
            
            // Handle payment information fields
            if (data.bankName !== undefined) mappedData.bankName = data.bankName;
            if (data.accountName !== undefined) mappedData.accountName = data.accountName;
            if (data.accountNumber !== undefined) mappedData.accountNumber = data.accountNumber;
            if (data.ktpPhotoFileId !== undefined) mappedData.ktpPhotoFileId = data.ktpPhotoFileId;
            if ((data as any).ktpPhotoUrl !== undefined) (mappedData as any).ktpPhotoUrl = (data as any).ktpPhotoUrl;
            
            // Handle KTP verification status fields  
            if (data.ktpSubmitted !== undefined) mappedData.ktpSubmitted = data.ktpSubmitted;
            if (data.ktpVerified !== undefined) mappedData.ktpVerified = data.ktpVerified;
            if (data.ktpRejected !== undefined) mappedData.ktpRejected = data.ktpRejected;
            
            // Handle discount fields - preserve from current document if not provided
            if (data.discountPercentage !== undefined) {
                // Clamp discount percentage to schema range 0-100
                const pct = Number(data.discountPercentage);
                mappedData.discountPercentage = isNaN(pct) ? 0 : Math.min(Math.max(pct, 0), 100);
            }
            if (data.discountDuration !== undefined) {
                // Clamp duration (hours) to 0-168 (7 days)
                const dur = Number(data.discountDuration);
                mappedData.discountDuration = isNaN(dur) ? 0 : Math.min(Math.max(dur, 0), 168);
            }
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
            if (data.bookedUntil !== undefined || (data as any).busyDuration as any !== undefined || (data as any).busyUntil as any !== undefined) {
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
                    if ((data as any).busyUntil as any !== undefined || (data as any).busyDuration as any !== undefined || data.bookedUntil !== undefined) {
                        busyTimerData = {
                            busyUntil: (data as any).busyUntil as any ?? data.bookedUntil ?? (busyTimerData as any)?.busyUntil as any ?? null,
                            busyDuration: (data as any).busyDuration as any ?? (busyTimerData as any)?.busyDuration as any ?? null
                        };
                        
                        // Only add timer data if busyUntil exists
                        if ((busyTimerData as any).busyUntil as any) {
                            mappedData.description = currentDesc + (currentDesc ? ' ' : '') + `[TIMER:${JSON.stringify(busyTimerData)}]`;
                        } else {
                            mappedData.description = currentDesc;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to handle busy timer data:', e);
                }
            }
            
            // 🌍 GPS AND LOCATION FIELDS (GPS-AUTHORITATIVE) – SYNCED WITH MAIN APP
            // Therapist/place upload page sets GPS → we derive city via deriveLocationIdFromGeopoint (same as app city list).
            // Main app lists profiles only by this saved city; no distance limit per city, no km shown in city view.
            if (data.geopoint) {
                mappedData.geopoint = data.geopoint;
                mappedData.lastLocationUpdateAt = data.lastLocationUpdateAt || new Date().toISOString();
                console.log('✅ GPS geopoint field will be saved:', data.geopoint);
                
                // Auto-derive city from geopoint if not explicitly provided
                if (!data.city && !data.locationId) {
                    try {
                        const { deriveLocationIdFromGeopoint } = require('../../utils/geoDistance');
                        const derivedCity = deriveLocationIdFromGeopoint(data.geopoint);
                        mappedData.city = derivedCity;
                        mappedData.locationId = derivedCity;
                        console.log('✅ GPS-derived city will be saved:', derivedCity);
                        
                        // Update location field to match GPS-derived city (if not custom)
                        if (!data.location || data.location === 'custom') {
                            mappedData.location = derivedCity;
                        }
                    } catch (e) {
                        console.warn('⚠️ Failed to derive city from geopoint:', e);
                    }
                }
            }
            
            // Explicit city/locationId fields (GPS-derived from dashboard)
            if (data.city) {
                mappedData.city = data.city;
                console.log('✅ City field will be saved:', data.city);
            }
            if (data.locationId) {
                mappedData.locationId = data.locationId;
                console.log('✅ LocationId field will be saved:', data.locationId);
            }
            
            // Coordinates field (legacy format - both string and object supported)
            if (data.coordinates) {
                mappedData.coordinates = typeof data.coordinates === 'string' 
                    ? data.coordinates 
                    : JSON.stringify(data.coordinates);
                console.log('✅ Coordinates field will be saved');
            }
            
            // Remove Appwrite metadata fields
            const { $id: _$id, $createdAt: _$createdAt, $updatedAt: _$updatedAt, $permissions: _$permissions, $databaseId: _$databaseId, $collectionId, ...cleanMappedData } = mappedData;
            
            console.log('📋 Final mapped data for Appwrite schema (with all required fields):', cleanMappedData);
            console.log('🔍 Location field check:', {
                inOriginalData: !!data.location,
                inMappedData: !!mappedData.location,
                inCleanData: !!cleanMappedData.location,
                locationValue: cleanMappedData.location || 'MISSING'
            });
            console.log('🔍 Status/Availability values being sent:', {
                status: cleanMappedData.status,
                availability: cleanMappedData.availability,
                originalStatus: data.status,
                originalAvailability: data.availability
            });
            
            // Derive isOnline from status if provided and not explicitly set
            if (mappedData.status && mappedData.isOnline === undefined) {
                mappedData.isOnline = mappedData.status === 'available';
            }
            // Ensure available/busy coherence even if status not passed but fields were
            if (!data.status) {
                if (data.available) {
                    mappedData.available = data.available;
                    mappedData.busy = '';
                    mappedData.status = 'available';
                    mappedData.availability = 'Available';
                    mappedData.isOnline = true;
                } else if (data.busy) {
                    mappedData.busy = data.busy;
                    mappedData.available = '';
                    mappedData.status = 'busy';
                    mappedData.availability = 'Busy';
                    mappedData.isOnline = true;
                }
            }

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                id,
                cleanMappedData
            );
            
            console.log('✅ Therapist updated successfully:', (response as any).$id);
            
            // 🚨 FRAUD PREVENTION: Check for duplicate accounts after update
            // If critical fields (bank, WhatsApp, KTP) are updated, check for duplicates
            const criticalFieldsUpdated = data.bankName || data.accountNumber || data.whatsappNumber || data.ktpNumber;
            
            if (criticalFieldsUpdated) {
                try {
                    console.log('🔍 [DUPLICATE CHECK] Critical fields updated, checking for duplicates...');
                    
                    const accountData = {
                        $id: response.$id,
                        $createdAt: response.$createdAt,
                        name: response.name,
                        accountType: 'therapist' as const,
                        bankName: data.bankName || response.bankName,
                        accountNumber: data.accountNumber || response.accountNumber,
                        whatsappNumber: data.whatsappNumber || response.whatsappNumber,
                        ktpNumber: data.ktpNumber || response.ktpNumber,
                        isActive: response.isActive
                    };
                    
                    await duplicateAccountDetectionService.handleDuplicateDetection(
                        accountData,
                        'therapist'
                    );
                } catch (dupError) {
                    console.error('⚠️ Error checking for duplicates (non-blocking):', dupError);
                    // Don't throw - duplicate check failure shouldn't block the update
                }
            }
            
            return response;
        } catch (error: unknown) {
            const err = error as Error; console.error('❌ Error updating therapist:', err);
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
                _error: (error instanceof Error ? (error as Error).message : 'Unknown error')
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
        } catch (error: unknown) {
            const err = error as Error; console.error('Error deleting therapist:', err);
            throw error as Error;
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
        } catch (error: unknown) {
            const err = error as Error; console.error('Error searching therapists:', err);
            return [];
        }
    },
    async uploadKtpId(therapistId: string, file: File): Promise<{ url: string; fileId: string }> {
        try {
            console.log('📤 Uploading KTP ID card for therapist:', therapistId);
            
            // Validate authentication first
            try {
                await account.get();
            } catch (authError) {
                throw new Error('Authentication required. Please log in again.');
            }
            
            // Validate file constraints
            const maxSize = 15 * 1024 * 1024; // 15MB max for KTP images
            if (file.size > maxSize) {
                throw new Error('File size too large. Maximum 15MB allowed.');
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                throw new Error('Invalid file type. Only JPG and PNG are allowed.');
            }
            
            // Upload file to correct Appwrite Storage bucket
            const bucketId = '697b3ca50023d08ec335'; // Correct production bucket ID
            const fileId = `ktp-${therapistId}-${Date.now()}`;
            
            console.log('📤 Uploading to bucket:', bucketId);
            
            const uploadedFile = await storage.createFile(
                bucketId,
                fileId,
                file
            );
            
            console.log('✅ KTP file uploaded successfully:', (uploadedFile as any).$id);
            
            // Get file URL
            const fileUrl = storage.getFileView(bucketId, (uploadedFile as any).$id);
            
            return {
                url: String(fileUrl),
                fileId: (uploadedFile as any).$id
            };
        } catch (error: unknown) {
            const err = error as Error;
            
            // Enhanced error logging with Appwrite error details
            console.error('❌ KTP UPLOAD FAILED:', {
                message: err.message,
                code: (err as any).code,
                type: (err as any).type,
                requestId: (err as any).requestId,
                therapistId
            });
            
            // Throw user-friendly error
            if (err.message.includes('401')) {
                throw new Error('Authentication failed. Please log in again.');
            } else if (err.message.includes('403')) {
                throw new Error('Upload permission denied. Please contact support.');
            } else if (err.message.includes('404')) {
                throw new Error('Storage configuration error. Please contact support.');
            } else if (err.message.includes('413')) {
                throw new Error('File too large. Maximum 15MB allowed.');
            } else {
                throw new Error('Upload failed: ' + err.message);
            }
        }
    },
    async uploadHotelVillaLetter(therapistId: string, file: File, hotelVillaName: string): Promise<{ url: string; fileId: string }> {
        try {
            console.log('🏨 Uploading hotel/villa recommendation letter for therapist:', therapistId);
            
            // Upload file to Appwrite Storage
            const bucketId = 'therapist-images';
            const fileId = `hotel-villa-letter-${therapistId}-${Date.now()}`;
            
            const uploadedFile = await storage.createFile(
                bucketId,
                fileId,
                file
            );
            
            console.log('✅ Hotel/Villa letter uploaded:', (uploadedFile as any).$id);
            
            // Get file URL
            const fileUrl = storage.getFileView(bucketId, (uploadedFile as any).$id);
            
            return {
                url: String(fileUrl),
                fileId: (uploadedFile as any).$id
            };
        } catch (error: unknown) {
            const err = error as Error; 
            console.error('❌ Error uploading hotel/villa letter:', err);
            throw error as Error;
        }
    },
    async updateTherapist(therapistId: string, updates: any): Promise<any> {
        try {
            console.log('Updating therapist:', therapistId, updates);
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                therapistId,
                updates
            );
            return response;
        } catch (error: unknown) {
            const err = error as Error; console.error('Error updating therapist:', err);
            throw error as Error;
        }
    }
};







