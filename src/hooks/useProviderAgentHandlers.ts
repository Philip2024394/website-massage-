import type { Therapist, Place, Agent, AvailabilityStatus } from '../types';
import type { Page, LoggedInProvider } from '../types/pageTypes';
import { therapistService, placesService, agentService, adminMessageService, notificationService } from '../lib/appwriteService';
import { logger } from '../utils/logger';

// Toast notification utility refactored to use dedicated overlay root (portal container)
const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const container = document.getElementById('overlay-root');
    const targetParent = container || document.body;
    if (!targetParent) return;

    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-orange-500';
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : '⚠';

    const toast = document.createElement('div');
    toast.className = `pointer-events-auto mb-3 ml-auto ${bgColor} text-white px-5 py-3 rounded-lg shadow-lg w-fit animate-fade-in`;
    toast.innerHTML = `<strong>${icon}</strong> ${message}`;
    toast.style.opacity = '1';

    // Ensure container has positioning if using overlay-root
    if (targetParent === container && !container!.style.position) {
        container!.style.position = 'fixed';
        container!.style.top = '0';
        container!.style.right = '0';
        container!.style.zIndex = '9999';
        container!.style.padding = '1rem';
        container!.style.display = 'flex';
        container!.style.flexDirection = 'column';
        container!.style.alignItems = 'flex-end';
        container!.style.pointerEvents = 'none';
    }

    try {
        targetParent.appendChild(toast);
        // Fade out and remove
        setTimeout(() => {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast && toast.parentNode === targetParent) {
                    targetParent.removeChild(toast);
                }
            }, 320);
        }, 4000);
    } catch (err) {
        logger.warn('Toast notification failed to append:', err);
    }
};

interface UseProviderAgentHandlersProps {
    loggedInProvider: LoggedInProvider | null;
    loggedInAgent: Agent | null;
    impersonatedAgent: Agent | null;
    therapists: Therapist[];
    places: Place[];
    setLoggedInAgent: (agent: Agent | null) => void;
    setImpersonatedAgent: (agent: Agent | null) => void;
    setAdminMessages: (messages: any[]) => void;
    setPage: (page: Page) => void;
    setTherapists: (therapists: Therapist[]) => void;
    setPlaces: (places: Place[]) => void;
    refreshData?: () => Promise<void>; // Add optional refresh function
}

export const useProviderAgentHandlers = ({
    loggedInProvider,
    loggedInAgent,
    impersonatedAgent,
    therapists,
    places,
    setLoggedInAgent,
    setImpersonatedAgent,
    setAdminMessages,
    setPage,
    setTherapists,
    setPlaces,
    refreshData
}: UseProviderAgentHandlersProps) => {

    const handleTherapistStatusChange = async (status: string) => {
        logger.debug('🚀 DEBUG: Therapist status change start', { status, statusType: typeof status });
        logger.debug('Provider validation:', {
            exists: !!loggedInProvider,
            type: loggedInProvider?.type,
            id: loggedInProvider?.id,
            $id: (loggedInProvider as any)?.$id
        });
        
        if (!loggedInProvider || loggedInProvider.type !== 'therapist') {
            logger.error('❌ Validation failed: No logged in therapist provider', loggedInProvider);
            throw new Error('No logged in therapist provider');
        }
        
        // Declare documentId in broader scope for error handling
        let documentId = '';
        
        try {
            logger.debug('Starting therapist status update', { status, provider: loggedInProvider });
            
            // Enhanced debugging for ID resolution
            const providerData = loggedInProvider as any;
            logger.debug('ID resolution debug:', {
                'providerData.id': providerData.id,
                'providerData.$id': providerData.$id,
                'providerData.therapistId': providerData.therapistId
            });
            
            // Appwrite uses $id as document ID, not the id field
            // Try multiple ID strategies to find the correct document ID
            let documentId = '';
            
            if (providerData.$id) {
                documentId = providerData.$id;
                logger.debug('Using Appwrite document ID ($id):', documentId);
            } else if (providerData.therapistId) {
                documentId = providerData.therapistId;
                logger.debug('Using therapistId field:', documentId);
            } else {
                documentId = typeof loggedInProvider.id === 'string' 
                    ? loggedInProvider.id 
                    : loggedInProvider.id.toString();
                logger.debug('Using fallback id:', documentId);
            }
            
            logger.debug('Final document ID for update:', documentId);
            
            // Test: Try to get existing therapist first to verify document exists
            try {
                logger.debug('Fetching existing therapist data for validation...');
                const existingTherapist = await therapistService.getById(documentId);
                if (existingTherapist) {
                    logger.debug('Found existing therapist:', {
                        name: existingTherapist.name,
                        currentStatus: existingTherapist.status,
                        currentAvailability: existingTherapist.availability
                    });
                }
            } catch (fetchError) {
                logger.error('Could not fetch existing therapist:', fetchError);
                throw new Error(`Therapist profile not found with ID: ${documentId}. ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
            }
            
            // Update status directly using therapistService
            logger.debug('Attempting status update...', {
                documentId,
                status,
                statusType: typeof status
            });
            
            // Based on your Appwrite data, update status, availability, and isOnline fields
            // Note: All fields are optional in Appwrite to avoid conflicts with existing documents
            
            // Convert status to proper format for database fields
            const normalizedStatus = status.toLowerCase(); // status field expects lowercase
            const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(); // availability expects capitalized
            
            const updateData = { 
                status: normalizedStatus, // Database expects lowercase: 'available', 'busy', 'offline'
                availability: capitalizedStatus as AvailabilityStatus,  // Backup field expects capitalized: 'Available', 'Busy', 'Offline'
                isOnline: status !== 'Offline'  // Set isOnline based on status (true for Available/Busy, false for Offline)
            };
            logger.debug('Update object:', updateData);
            
            const updateResult = await therapistService.update(documentId, updateData);
            
            logger.debug('Therapist status update success', {
                $id: updateResult?.$id,
                status: updateResult?.status,
                availability: updateResult?.availability
            });
            
            // Update local state - map through current therapists and update the matching one
            const updatedTherapists = therapists.map((t: Therapist) => {
                const tId = typeof t.id === 'string' ? t.id : t.id?.toString();
                const tAppwriteId = (t as any).$id;
                
                // Match by either regular ID or Appwrite document ID
                const isMatch = tId === documentId || tAppwriteId === documentId;
                
                if (isMatch) {
                    logger.debug('Updating local state for therapist:', { name: t.name, from: t.status, to: status });
                }
                
                return isMatch 
                    ? { ...t, status: status as AvailabilityStatus }
                    : t;
            });
            
            logger.debug('Local therapists state updated, count:', updatedTherapists.length);
            setTherapists(updatedTherapists);
            
        } catch (error) {
            logger.error('Therapist status update failed:', {
                error,
                errorType: typeof error,
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack',
                documentId,
                status,
                provider: loggedInProvider
            });
            
            // More specific error message based on error type
            let errorMessage = 'Failed to update status. Please try again.';
            if (error instanceof Error) {
                if (error.message.includes('Collection ID might be invalid')) {
                    errorMessage = 'Database configuration error. Please check collection ID.';
                } else if (error.message.includes('Document not found')) {
                    errorMessage = 'Therapist profile not found. Please refresh and try again.';
                } else if (error.message.includes('permission')) {
                    errorMessage = 'Permission denied. Please check your account access.';
                } else {
                    errorMessage = `Update failed: ${error.message}`;
                }
            }
            
            throw new Error(errorMessage);
        }
    };

    const handleSaveTherapist = async (therapistData: Omit<Therapist, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'activeMembershipDate' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            // Use string ID for Appwrite
            const therapistId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            
            // Validate profilePicture length (max 512 chars for Appwrite)
            const profilePicture = therapistData.profilePicture || '';
            logger.debug('Saving therapist profile', { profilePictureLength: profilePicture.length });
            
            if (profilePicture.length > 512) {
                showToast('Profile picture URL is too long. Saving other data without profile picture.', 'warning');
                // Continue saving other data even if profile picture is invalid
                therapistData.profilePicture = ''; // Clear invalid URL
            }
            
            // First, try to fetch existing therapist data
            let existingTherapist: any = null;
            try {
                existingTherapist = await therapistService.getById(therapistId);
                logger.debug('Found existing therapist profile:', existingTherapist);
            } catch {
                logger.debug('No existing profile found, will create new one');
            }

            // Helper function to ensure JSON strings are compact and under 255 chars
            const compactJsonString = (value: any, fieldName: string, fallback: string = '[]'): string => {
                const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
                if (jsonString.length > 255) {
                    logger.warn(`${fieldName} string too long (${jsonString.length} chars), using fallback`);
                    return fallback;
                }
                return jsonString;
            };

            // Prepare pricing string with 255-character validation
            let pricingString = typeof therapistData.pricing === 'string' ? therapistData.pricing : JSON.stringify(therapistData.pricing);
            if (pricingString.length > 255) {
                logger.warn('Therapist pricing string too long, creating compact version');
                try {
                    const parsed = JSON.parse(pricingString);
                    // Create a minimal pricing object with only the essential fields
                    const compactPricing = {
                        "60": parsed["60"] || parsed[60] || 0,
                        "90": parsed["90"] || parsed[90] || 0,
                        "120": parsed["120"] || parsed[120] || 0
                    };
                    pricingString = JSON.stringify(compactPricing);
                    logger.debug('Created compact therapist pricing:', pricingString);
                } catch {
                    logger.error('Failed to create compact pricing, using default');
                    pricingString = '{"60":0,"90":0,"120":0}';
                }
            }

            // Prepare update data with better data preservation (valid schema attributes only)
            const updateData: any = {
                id: therapistId, // Required unique document identifier
                name: therapistData.name,
                description: therapistData.description,
                whatsappNumber: therapistData.whatsappNumber,
                profilePicture: profilePicture,
                mainImage: therapistData.mainImage || existingTherapist?.mainImage || '',
                yearsOfExperience: (therapistData as any).yearsOfExperience || 0,
                massageTypes: compactJsonString(therapistData.massageTypes, 'massageTypes', '[]'),
                languages: compactJsonString((therapistData as any).languages || [], 'languages', '[]'),
                pricing: pricingString,
                // Individual pricing fields required by database schema (as strings)
                price60: (() => {
                    try {
                        const parsed = JSON.parse(pricingString);
                        return String(parsed["60"] || parsed[60] || 100);
                    } catch {
                        return '100';
                    }
                })(),
                price90: (() => {
                    try {
                        const parsed = JSON.parse(pricingString);
                        return String(parsed["90"] || parsed[90] || 150);
                    } catch {
                        return '150';
                    }
                })(),
                price120: (() => {
                    try {
                        const parsed = JSON.parse(pricingString);
                        return String(parsed["120"] || parsed[120] || 200);
                    } catch {
                        return '200';
                    }
                })(),
                location: therapistData.location,
                coordinates: compactJsonString(therapistData.coordinates, 'coordinates', '{"lat":0,"lng":0}'),
                status: 'available', // AUTO-LIVE SYSTEM: All new therapists start as available
                rating: existingTherapist?.rating || 0,
                // reviewCount removed - not in collection schema
                isLicensed: (therapistData as any).isLicensed || false,
                // licenseNumber: (therapistData as any).licenseNumber || '', // Removed - not in collection schema
                analytics: compactJsonString(therapistData.analytics, 'analytics', '{"impressions":0,"views":0,"profileViews":0,"whatsappClicks":0}'),
                // hotelVillaServiceStatus: existingTherapist?.hotelVillaServiceStatus || 'NotOptedIn', // Removed - not in collection schema
                hotelId: existingTherapist?.hotelId || '', // Required field - empty for independent therapists
                hotelDiscount: existingTherapist?.hotelDiscount || 0,
                // villaDiscount: existingTherapist?.villaDiscount || 0, // Removed - not in collection schema
                // serviceRadius: existingTherapist?.serviceRadius || 10, // Removed - not in collection schema
                // Required Appwrite schema fields
                specialization: (() => {
                    // Use the first massage type as specialization, or default
                    try {
                        const massageTypesArray = JSON.parse(compactJsonString(therapistData.massageTypes, 'massageTypes', '[]'));
                        return massageTypesArray.length > 0 ? massageTypesArray[0] : 'General Massage';
                    } catch {
                        return 'General Massage';
                    }
                })(),
                availability: 'Available', // AUTO-LIVE SYSTEM: All new therapists start as Available
                hourlyRate: (() => {
                    // Calculate hourly rate from pricing (use 60min price or default)
                    try {
                        const pricingObj = JSON.parse(pricingString);
                        const rate = pricingObj["60"] || pricingObj[60] || 100;
                        // Ensure it's within the 50-500 range
                        return Math.max(50, Math.min(500, rate));
                    } catch {
                        return 100; // Safe default
                    }
                })(),
                therapistId: therapistId, // Required unique identifier
                // Preserve system fields
                email: existingTherapist?.email || `therapist${therapistId}@indostreet.com`,
                password: existingTherapist?.password || '',
                // AUTO-LIVE SYSTEM: All new therapists start as live and available
                isLive: true, // Profile is live and visible to customers
                isOnline: true, // Mark as online
                activeMembershipDate: existingTherapist?.activeMembershipDate || new Date().toISOString().split('T')[0],
                
                // 🎯 DISCOUNT SYSTEM FIELDS - Copy exact same pattern as profile fields that work
                discountPercentage: (therapistData as any).discountPercentage !== undefined ? (therapistData as any).discountPercentage : (existingTherapist?.discountPercentage || 0),
                discountDuration: (therapistData as any).discountDuration !== undefined ? (therapistData as any).discountDuration : (existingTherapist?.discountDuration || 0),
                discountEndTime: (therapistData as any).discountEndTime || existingTherapist?.discountEndTime || null,
                isDiscountActive: (therapistData as any).isDiscountActive !== undefined ? (therapistData as any).isDiscountActive : (existingTherapist?.isDiscountActive || false)
                // createdAt: existingTherapist?.createdAt || new Date().toISOString() // Removed - not in collection schema
            };
            
            logger.debug('Saving therapist data:', {
                name: updateData.name,
                profilePicturePreview: updateData.profilePicture?.substring(0, 50),
                mainImagePreview: updateData.mainImage?.substring(0, 50),
                location: updateData.location
            });
            
            logger.debug('Discount field mapping:', {
                input: {
                    discountPercentage: (therapistData as any).discountPercentage,
                    discountDuration: (therapistData as any).discountDuration,
                    discountEndTime: (therapistData as any).discountEndTime,
                    isDiscountActive: (therapistData as any).isDiscountActive
                },
                mapped: {
                    discountPercentage: updateData.discountPercentage,
                    discountDuration: updateData.discountDuration,
                    discountEndTime: updateData.discountEndTime,
                    isDiscountActive: updateData.isDiscountActive
                }
            });
            
            // 🔒 ONE CARD PER THERAPIST POLICY
            // Each therapist can only have ONE card but can edit it unlimited times
            if (existingTherapist) {
                logger.debug('Updating existing therapist profile (1 card per therapist policy)');
                await therapistService.update(therapistId, updateData);
            } else {
                logger.debug('Creating new therapist profile (1 card policy, unlimited edits)');
                const createData = {
                    ...updateData,
                    isLive: true, // 🔄 CHANGED: Now goes live immediately
                    email: `therapist${therapistId}@indostreet.com`,
                };
                await therapistService.create(createData);
                logger.debug('Therapist card created successfully (can be edited unlimited times)');
            }
            
            logger.debug('Therapist profile saved successfully');
            
            // Create default Silver membership if this is a new therapist
            if (!existingTherapist) {
                try {
                    logger.debug('Creating default Silver membership for new therapist...');
                    const { membershipPackageService } = await import('../lib/appwriteService');
                    const userId = loggedInProvider.id as string;
                    await membershipPackageService.createDefaultMembership(userId, therapistId, 'therapist');
                    logger.debug('Default Silver membership created');
                } catch (membershipError) {
                    logger.error('Failed to create membership (non-blocking):', membershipError);
                    // Don't fail profile save if membership creation fails
                }
            }
            
            // Update the therapists state to reflect the changes immediately
            const updatedTherapists = therapists.map(therapist => {
                const therapistAny = therapist as any;
                if (therapist.id === loggedInProvider.id || therapistAny.$id === therapistId) {
                    return {
                        ...therapist,
                        ...updateData,
                        id: therapist.id || therapistId, // Preserve the existing ID structure
                        $id: therapistAny.$id || therapistId // Preserve Appwrite ID if exists
                    };
                }
                return therapist;
            });
            
            // If this is a new therapist (wasn't found in the list), add it
            const therapistExists = therapists.some(t => t.id === loggedInProvider.id || (t as any).$id === therapistId);
            if (!therapistExists) {
                const newTherapist = {
                    ...updateData,
                    id: loggedInProvider.id,
                    $id: therapistId,
                    isLive: true, // � AUTO-ACTIVE: All new therapists go live immediately
                    rating: 0,
                    // reviewCount: 0, // Removed - not in collection schema
                    activeMembershipDate: new Date().toISOString().split('T')[0],
                    email: `therapist${therapistId}@indostreet.com`,
                };
                updatedTherapists.push(newTherapist as any);
            }
            
            setTherapists(updatedTherapists);
            logger.debug('Updated therapists state with new data');
            
            // Refresh data from database to ensure consistency across the app
            if (refreshData) {
                try {
                    logger.debug('Refreshing data from database to sync live site...');
                    await refreshData();
                    logger.debug('Data refresh completed - live site should show updated info');
                } catch (refreshError) {
                    logger.warn('Failed to refresh data after save:', refreshError);
                    // Don't fail the save operation if refresh fails
                }
            }
            
            // Create admin notification for profile review (profile is already live)
            try {
                await notificationService.create({
                    providerId: Number(loggedInProvider.id),
                    message: `${updateData.name || 'A therapist'} has updated their profile and is now live for review`,
                    type: 'system' as const,
                    data: JSON.stringify({
                        therapistId: String(loggedInProvider.id),
                        therapistName: updateData.name || 'Unknown Therapist',
                        email: updateData.email || '',
                        location: updateData.location || '',
                        submittedAt: new Date().toISOString()
                    })
                });
                logger.debug('Admin notification created for therapist profile review');
            } catch (notificationError) {
                logger.warn('Failed to create admin notification:', notificationError);
                // Don't fail the entire save operation if notification fails
            }
            
            showToast('Profile saved successfully! Your profile is now live and visible to customers.', 'success');
        } catch (error: any) {
            logger.error('Save error:', error);
            showToast('Error saving profile: ' + (error.message || 'Unknown error. Please try again.'), 'error');
        }
    };
    
    const handleSavePlace = async (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            logger.debug('Starting place profile save', {
                provider: loggedInProvider,
                placesCount: places.length
            });
            
            const updateData: any = {
                ...placeData,
                pricing: typeof placeData.pricing === 'string' ? placeData.pricing : JSON.stringify(placeData.pricing),
                analytics: typeof placeData.analytics === 'string' ? placeData.analytics : JSON.stringify(placeData.analytics),
            };
            
            // Handle thumbnailImages if present
            if ('thumbnailImages' in placeData) {
                const thumbs = (placeData as any).thumbnailImages;
                updateData.thumbnailImages = Array.isArray(thumbs) ? JSON.stringify(thumbs) : thumbs;
            }
            
            // Find the correct place document ID by looking up the place in the places array
            let placeDocumentId = null;
            
            // First try to find the place in the current places array
            const currentPlace = places.find(place => {
                const placeAny = place as any;
                return place.id === loggedInProvider.id || 
                       placeAny.$id === loggedInProvider.id ||
                       place.id?.toString() === loggedInProvider.id?.toString();
            });
            
            if (currentPlace) {
                placeDocumentId = (currentPlace as any).$id || currentPlace.id;
                logger.debug('Found place in current data:', placeDocumentId);
            } else {
                // If not found in current data, try to find by email from session cache
                const sessionData = JSON.parse(localStorage.getItem('app_session') || '{}');
                logger.debug('Session data:', sessionData);
                if (sessionData.documentId) {
                    placeDocumentId = sessionData.documentId;
                    logger.debug('Using document ID from session cache:', placeDocumentId);
                } else {
                    // Try querying Appwrite by provider id attribute
                    logger.debug('Looking up place document by provider id...');
                    const remotePlace = await placesService.getByProviderId(String(loggedInProvider.id));
                    if (remotePlace) {
                        placeDocumentId = remotePlace.$id;
                        logger.debug('Found remote place document by provider id:', placeDocumentId);
                    } else {
                        // As a final fallback, we'll attempt creation below if update fails
                        logger.warn('No existing place document found by provider id');
                    }
                }
            }
            
            // 🔒 ONE CARD PER MASSAGE PLACE POLICY
            // Each massage place can only have ONE card but can edit it unlimited times
            let savedDoc: any | null = null;
            if (placeDocumentId) {
                logger.debug('Updating existing massage place profile (1 card per place policy)', { updateData });
                try {
                    savedDoc = await placesService.update(placeDocumentId, updateData);
                    logger.debug('Massage place profile saved successfully via update');
                } catch (err: any) {
                    const msg = (err && (err.message || err.code || '')) || '';
                    const isNotFound = String(msg).toLowerCase().includes('not found') || String(err?.code || '').includes('404');
                    if (isNotFound) {
                        logger.warn('Document not found on update, creating new document instead...');
                        savedDoc = await placesService.update(loggedInProvider.id.toString(), {
                            ...updateData,
                            id: loggedInProvider.id,
                            placeId: loggedInProvider.id, // Add missing required field
                            isLive: true, // 🔄 CHANGED: Now goes live immediately
                            rating: 0,
                            // reviewCount: 0, // Removed - not in collection schema
                        });
                        placeDocumentId = savedDoc.$id;
                        // Cache for future saves
                        const session = JSON.parse(localStorage.getItem('app_session') || '{}');
                        localStorage.setItem('app_session', JSON.stringify({ ...session, documentId: placeDocumentId }));
                        logger.debug('Massage place profile created successfully with new ID:', placeDocumentId);
                    } else {
                        throw err;
                    }
                }
            } else {
                logger.debug('Creating massage place profile (1 card policy, unlimited edits)');
                savedDoc = await placesService.update(loggedInProvider.id.toString(), {
                    ...updateData,
                    id: loggedInProvider.id,
                    placeId: loggedInProvider.id, // Add missing required field
                    isLive: true, // 🔄 CHANGED: Now goes live immediately
                    rating: 0,
                    // reviewCount: 0, // Removed - not in collection schema
                });
                placeDocumentId = savedDoc.$id;
                const session = JSON.parse(localStorage.getItem('app_session') || '{}');
                localStorage.setItem('app_session', JSON.stringify({ ...session, documentId: placeDocumentId }));
                logger.debug('Massage place card created successfully (can be edited unlimited times)');
            }
            
            // Create default Silver membership if this is a new place
            if (!savedDoc) {
                try {
                    logger.debug('Creating default Silver membership for new massage place...');
                    const { membershipPackageService } = await import('../lib/appwriteService');
                    const userId = loggedInProvider.id as string;
                    await membershipPackageService.createDefaultMembership(userId, placeDocumentId || '', 'massage_place');
                    logger.debug('Default Silver membership created');
                } catch (membershipError) {
                    logger.error('Failed to create membership (non-blocking):', membershipError);
                    // Don't fail profile save if membership creation fails
                }
            }
            
            // Update the places state to reflect the changes immediately
            const updatedPlaces = places.map(place => {
                const placeAny = place as any;
                if (place.id === loggedInProvider.id || 
                    placeAny.$id === placeDocumentId ||
                    place.id?.toString() === loggedInProvider.id?.toString()) {
                    return {
                        ...place,
                        ...updateData,
                        id: place.id || placeDocumentId, // Preserve the existing ID structure
                        $id: placeAny.$id || placeDocumentId // Preserve Appwrite ID if exists
                    };
                }
                return place;
            });
            // If the place was not in the list at all, add it
            const existsInList = updatedPlaces.some(p => (p as any).$id === placeDocumentId || p.id === loggedInProvider.id);
            const finalPlaces = existsInList ? updatedPlaces : [
                ...updatedPlaces,
                {
                    ...updateData,
                    id: loggedInProvider.id,
                    $id: placeDocumentId,
                    isLive: true, // 🔄 CHANGED: Now goes live immediately
                    rating: 0,
                    // reviewCount: 0, // Removed - not in collection schema
                } as any
            ];
            
            setPlaces(finalPlaces);
            logger.debug('Updated places state with new data');
            
            // Refresh data from database to ensure consistency across the app
            if (refreshData) {
                try {
                    logger.debug('Refreshing data from database to sync live site...');
                    await refreshData();
                    logger.debug('Data refresh completed - live site should show updated info');
                } catch (refreshError) {
                    logger.warn('Failed to refresh data after save:', refreshError);
                    // Don't fail the save operation if refresh fails
                }
            }
            
            // Create admin notification for profile review (profile is already live)
            try {
                await notificationService.create({
                    providerId: Number(loggedInProvider.id),
                    message: `${updateData.name || 'A massage place'} has updated their profile and is now live for review`,
                    type: 'place_profile_pending' as const,
                    data: JSON.stringify({
                        placeId: String(loggedInProvider.id),
                        placeName: updateData.name || 'Unknown Place',
                        email: updateData.email || '',
                        location: updateData.location || '',
                        submittedAt: new Date().toISOString()
                    })
                });
                logger.debug('Admin notification created for profile approval');
            } catch (notificationError) {
                logger.warn('Failed to create admin notification:', notificationError);
                // Don't fail the entire save operation if notification fails
            }
            
            showToast('Profile saved successfully! Your profile is now live and visible to customers.', 'success');
        } catch (error: any) {
            logger.error('Save error:', error);
            showToast('Error saving profile: ' + (error.message || 'Unknown error. Please try again.'), 'error');
        }
    };

    const handleAgentRegister = async (name: string, email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const agentCode = `${name.toLowerCase().replace(/\s+/g, '-').slice(0, 10)}-${Math.random().toString(36).substring(2, 6)}`;
            
            await agentService.create({
                name,
                email,
                agentCode,
                hasAcceptedTerms: false,
                lastLogin: new Date().toISOString()
            });
            
            return { success: true, message: `Registration successful! Your agent code is: ${agentCode}. Please save it for future reference.` };
        } catch (error: any) {
            logger.error('Agent registration error:', error);
            return { success: false, message: error.message || 'Registration failed' };
        }
    };
    
    const handleAgentLogin = async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const agents = await agentService.getAll();
            const agentData = agents.find((a: any) => a.email === email);
            
            if (!agentData) {
                return { success: false, message: 'Invalid email. Please check and try again.' };
            }

            // Update last login
            try {
                await agentService.update(agentData.$id, { lastLogin: new Date().toISOString() });
            } catch (updateError) {
                logger.error('Failed to update last login time', updateError);
            }
        
            setLoggedInAgent(agentData);
            localStorage.setItem('loggedInAgent', JSON.stringify(agentData));

            if (agentData.hasAcceptedTerms) {
                setPage('agentDashboard');
            } else {
                setPage('agentTerms');
            }

            return { success: true, message: '' };
        } catch (error: any) {
            logger.error('Agent login error:', error);
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    const handleAgentAcceptTerms = async () => {
        if (!loggedInAgent) return;

        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id?.toString() || loggedInAgent.agentId;
            await agentService.update(agentId, { hasAcceptedTerms: true });
            
            const updatedAgent = { ...loggedInAgent, hasAcceptedTerms: true };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            setPage('agentDashboard');
        } catch (error: any) {
            logger.error('Accept terms error:', error);
            showToast('Could not accept terms: ' + (error.message || 'Unknown error'), 'error');
        }
    };

    const handleSaveAgentProfile = async (agentData: Partial<Agent>) => {
        if (!loggedInAgent) return;
    
        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id?.toString() || loggedInAgent.agentId;
            
            // Filter out any invalid fields that aren't part of Agent schema
            const { status, availability, ...validAgentData } = agentData as any;
            
            // Log if invalid fields were filtered out
            if (status || availability) {
                logger.warn('Filtered out invalid Agent fields:', { status, availability });
            }
            
            await agentService.update(agentId, validAgentData);
            
            const updatedAgent = { ...loggedInAgent, ...validAgentData };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            showToast('Profile saved successfully!', 'success');
        } catch (error: any) {
            logger.error('Save agent profile error:', error);
            showToast('Error saving profile: ' + (error.message || 'Unknown error'), 'error');
        }
    };

    const handleStopImpersonating = () => {
        setImpersonatedAgent(null);
        setPage('adminDashboard');
    };

    const handleSendAdminMessage = async (message: string) => {
        if (!impersonatedAgent) return;
        
        try {
            const agentId = impersonatedAgent.$id || impersonatedAgent.id?.toString() || '';
            const agentName = impersonatedAgent.name || '';
            
            await adminMessageService.sendMessage({
                senderId: agentId,
                senderName: agentName,
                senderType: 'agent',
                receiverId: 'admin',
                message: message
            });
            
            // Refresh messages
            const messages = await adminMessageService.getMessages(agentId);
            setAdminMessages(messages);
        } catch (error) {
            logger.error('Error sending admin message:', error);
            showToast('Failed to send message. Please try again.', 'error');
        }
    };

    const handleMarkMessagesAsRead = async () => {
        if (!impersonatedAgent) return;
        
        try {
            const agentId = impersonatedAgent.$id || impersonatedAgent.id?.toString() || '';
            const messages = await adminMessageService.getMessages(agentId);
            
            // Mark all unread messages as read
            const unreadMessages = messages.filter((m: any) => !m.isRead && m.receiverType === 'agent');
            
            for (const msg of unreadMessages) {
                await adminMessageService.markAsRead(msg.$id);
            }
            
            // Refresh messages
            const updatedMessages = await adminMessageService.getMessages(agentId);
            setAdminMessages(updatedMessages);
        } catch (error) {
            logger.error('Error marking messages as read:', error);
        }
    };

    return {
        handleTherapistStatusChange,
        handleSaveTherapist,
        handleSavePlace,
        handleAgentRegister,
        handleAgentLogin,
        handleAgentAcceptTerms,
        handleSaveAgentProfile,
        handleStopImpersonating,
        handleSendAdminMessage,
        handleMarkMessagesAsRead
    };
};
