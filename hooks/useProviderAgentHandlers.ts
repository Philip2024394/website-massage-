import type { Therapist, Place, Agent, AvailabilityStatus } from '../types';
import type { Page, LoggedInProvider } from '../types/pageTypes';
import { therapistService, placeService, agentService, adminMessageService, notificationService } from '../lib/appwriteService';

// Toast notification utility for better UX - uses safe DOM manipulation
const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-orange-500';
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠️' : '⚠';
    
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-[9999] transition-opacity duration-300`;
    toast.innerHTML = `<strong>${icon}</strong> ${message}`;
    toast.style.opacity = '1';
    
    // Append to body safely with React-friendly approach
    if (document.body) {
        try {
            document.body.appendChild(toast);
            
            // Fade out and remove with proper cleanup
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    // Use a safer removal approach that avoids React conflicts
                    if (toast && toast.parentNode === document.body) {
                        document.body.removeChild(toast);
                    }
                }, 300);
            }, 4000);
        } catch (error) {
            console.warn('Toast notification could not be displayed:', error);
        }
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
        console.log('🚀 ========== DEBUG: THERAPIST STATUS CHANGE START ==========');
        console.log('📊 Input status:', status, 'Type:', typeof status);
        console.log('🔍 loggedInProvider exists:', !!loggedInProvider);
        console.log('🔍 loggedInProvider type:', loggedInProvider?.type);
        console.log('🔍 loggedInProvider id:', loggedInProvider?.id);
        console.log('🔍 loggedInProvider $id:', (loggedInProvider as any)?.$id);
        
        if (!loggedInProvider || loggedInProvider.type !== 'therapist') {
            console.error('❌ VALIDATION FAILED: No logged in therapist provider');
            console.error('❌ loggedInProvider full object:', JSON.stringify(loggedInProvider, null, 2));
            throw new Error('No logged in therapist provider');
        }
        
        // Declare documentId in broader scope for error handling
        let documentId = '';
        
        try {
            console.log('🔄 STARTING therapist status update to:', status);
            console.log('🔍 Full logged in provider data:', JSON.stringify(loggedInProvider, null, 2));
            
            // Enhanced debugging for ID resolution
            const providerData = loggedInProvider as any;
            console.log('🔍 ID Resolution Debug:');
            console.log('  - providerData.id:', providerData.id, 'Type:', typeof providerData.id);
            console.log('  - providerData.$id:', providerData.$id, 'Type:', typeof providerData.$id);
            console.log('  - providerData.therapistId:', providerData.therapistId, 'Type:', typeof providerData.therapistId);
            
            // Appwrite uses $id as document ID, not the id field
            // Try multiple ID strategies to find the correct document ID
            let documentId = '';
            
            if (providerData.$id) {
                // Appwrite document ID
                documentId = providerData.$id;
                console.log('✅ Using Appwrite document ID ($id):', documentId);
            } else if (providerData.therapistId) {
                // Custom therapistId field
                documentId = providerData.therapistId;
                console.log('✅ Using therapistId field:', documentId);
            } else {
                // Fallback to regular id
                documentId = typeof loggedInProvider.id === 'string' 
                    ? loggedInProvider.id 
                    : loggedInProvider.id.toString();
                console.log('✅ Using fallback id:', documentId);
            }
            
            console.log('📋 Final document ID for update:', documentId);
            
            // Test: Try to get existing therapist first to verify document exists
            try {
                console.log('🔍 Testing: Attempting to fetch existing therapist data...');
                const existingTherapist = await therapistService.getById(documentId);
                console.log('✅ Found existing therapist:', existingTherapist ? 'YES' : 'NO');
                if (existingTherapist) {
                    console.log('📋 Current therapist data:', {
                        name: existingTherapist.name,
                        currentStatus: existingTherapist.status,
                        currentAvailability: existingTherapist.availability
                    });
                }
            } catch (fetchError) {
                console.error('❌ Could not fetch existing therapist:', fetchError);
                throw new Error(`Therapist profile not found with ID: ${documentId}. ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
            }
            
            // Update status directly using therapistService
            console.log('🚀 ATTEMPTING STATUS UPDATE...');
            console.log('📊 Update parameters:');
            console.log('  - Document ID:', documentId);
            console.log('  - Status value:', status);
            console.log('  - Status type:', typeof status);
            
            // Based on your Appwrite data, update both status and availability fields
            const updateData = { 
                status: status as AvailabilityStatus,
                availability: status as AvailabilityStatus  // Some therapists use this field
            };
            console.log('  - Update object:', updateData);
            
            const updateResult = await therapistService.update(documentId, updateData);
            
            console.log('✅ THERAPIST STATUS UPDATE SUCCESS!');
            console.log('✅ Update result:', updateResult);
            console.log('✅ Result $id:', updateResult?.$id);
            console.log('✅ Result status:', updateResult?.status);
            console.log('✅ Result availability:', updateResult?.availability);
            
            // Update local state - map through current therapists and update the matching one
            const updatedTherapists = therapists.map((t: Therapist) => {
                const tId = typeof t.id === 'string' ? t.id : t.id?.toString();
                const tAppwriteId = (t as any).$id;
                
                // Match by either regular ID or Appwrite document ID
                const isMatch = tId === documentId || tAppwriteId === documentId;
                
                if (isMatch) {
                    console.log('🔄 Updating local state for therapist:', t.name, 'from', t.status, 'to', status);
                }
                
                return isMatch 
                    ? { ...t, status: status as AvailabilityStatus }
                    : t;
            });
            
            console.log('📊 Local therapists state updated, count:', updatedTherapists.length);
            setTherapists(updatedTherapists);
            
        } catch (error) {
            console.error('❌ ========== THERAPIST STATUS UPDATE FAILED ==========');
            console.error('❌ Error type:', typeof error);
            console.error('❌ Error object:', error);
            console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
            try {
                console.error('❌ Attempted document ID:', documentId);
            } catch {
                console.error('❌ Document ID not accessible in this scope');
            }
            console.error('❌ Attempted status:', status);
            console.error('❌ loggedInProvider at error time:', JSON.stringify(loggedInProvider, null, 2));
            console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
            console.error('❌ Full error object:', JSON.stringify(error, null, 2));
            
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
            console.log('💾 Saving therapist profile with profilePicture:', profilePicture);
            console.log('📏 ProfilePicture length:', profilePicture.length);
            
            if (profilePicture.length > 512) {
                showToast('Profile picture URL is too long. Saving other data without profile picture.', 'warning');
                // Continue saving other data even if profile picture is invalid
                therapistData.profilePicture = ''; // Clear invalid URL
            }
            
            // First, try to fetch existing therapist data
            let existingTherapist: any = null;
            try {
                existingTherapist = await therapistService.getById(therapistId);
                console.log('📖 Found existing therapist profile:', existingTherapist);
            } catch {
                console.log('📝 No existing profile found, will create new one');
            }

            // Helper function to ensure JSON strings are compact and under 255 chars
            const compactJsonString = (value: any, fieldName: string, fallback: string = '[]'): string => {
                const jsonString = typeof value === 'string' ? value : JSON.stringify(value);
                if (jsonString.length > 255) {
                    console.warn(`⚠️ ${fieldName} string too long (${jsonString.length} chars), using fallback`);
                    return fallback;
                }
                return jsonString;
            };

            // Prepare pricing string with 255-character validation
            let pricingString = typeof therapistData.pricing === 'string' ? therapistData.pricing : JSON.stringify(therapistData.pricing);
            if (pricingString.length > 255) {
                console.warn('⚠️ Therapist pricing string too long, creating compact version');
                try {
                    const parsed = JSON.parse(pricingString);
                    // Create a minimal pricing object with only the essential fields
                    const compactPricing = {
                        "60": parsed["60"] || parsed[60] || 0,
                        "90": parsed["90"] || parsed[90] || 0,
                        "120": parsed["120"] || parsed[120] || 0
                    };
                    pricingString = JSON.stringify(compactPricing);
                    console.log('✅ Created compact therapist pricing:', pricingString);
                } catch {
                    console.error('❌ Failed to create compact pricing, using default');
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
                location: therapistData.location,
                coordinates: compactJsonString(therapistData.coordinates, 'coordinates', '{"lat":0,"lng":0}'),
                status: therapistData.status,
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
                availability: 'full-time', // Required field
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
                isLive: existingTherapist?.isLive || false,
                activeMembershipDate: existingTherapist?.activeMembershipDate || new Date().toISOString().split('T')[0]
                // createdAt: existingTherapist?.createdAt || new Date().toISOString() // Removed - not in collection schema
            };
            
            console.log('💾 Saving therapist data:', {
                name: updateData.name,
                profilePicture: updateData.profilePicture?.substring(0, 50) + '...',
                mainImage: updateData.mainImage?.substring(0, 50) + '...',
                location: updateData.location
            });
            
            // 🔒 ONE CARD PER THERAPIST POLICY
            // Each therapist can only have ONE card but can edit it unlimited times
            if (existingTherapist) {
                console.log('✏️ Updating your existing therapist profile (1 card per therapist policy)');
                console.log('🔄 You can save/edit this card as many times as needed');
                await therapistService.update(therapistId, updateData);
            } else {
                console.log('➕ Creating your therapist profile (you can only create 1 card, but edit it unlimited times)');
                const createData = {
                    ...updateData,
                    isLive: true, // 🔄 CHANGED: Now goes live immediately
                    email: `therapist${therapistId}@indostreet.com`,
                };
                await therapistService.create(createData);
                console.log('📝 Your therapist card has been created. You can now edit and save it as many times as you want.');
            }
            
            console.log('✅ Therapist profile saved successfully');
            
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
                    isLive: true, // 🔄 CHANGED: Now goes live immediately
                    rating: 0,
                    // reviewCount: 0, // Removed - not in collection schema
                    activeMembershipDate: new Date().toISOString().split('T')[0],
                    email: `therapist${therapistId}@indostreet.com`,
                };
                updatedTherapists.push(newTherapist as any);
            }
            
            setTherapists(updatedTherapists);
            console.log('🔄 Updated therapists state with new data');
            
            // Refresh data from database to ensure consistency across the app
            if (refreshData) {
                try {
                    console.log('🔄 Refreshing data from database to sync live site...');
                    await refreshData();
                    console.log('✅ Data refresh completed - live site should show updated info');
                } catch (refreshError) {
                    console.warn('⚠️ Failed to refresh data after save:', refreshError);
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
                console.log('✅ Admin notification created for therapist profile review');
            } catch (notificationError) {
                console.warn('⚠️ Failed to create admin notification:', notificationError);
                // Don't fail the entire save operation if notification fails
            }
            
            showToast('Profile saved successfully! Your profile is now live and visible to customers.', 'success');
        } catch (error: any) {
            console.error('❌ Save error:', error);
            showToast('Error saving profile: ' + (error.message || 'Unknown error. Please try again.'), 'error');
        }
    };
    
    const handleSavePlace = async (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
            console.log('🔧 DEBUG: Starting place profile save...');
            console.log('🔧 DEBUG: loggedInProvider:', loggedInProvider);
            console.log('🔧 DEBUG: places array length:', places.length);
            
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
                console.log('🔍 Found place in current data:', placeDocumentId);
            } else {
                // If not found in current data, try to find by email from session cache
                const sessionData = JSON.parse(localStorage.getItem('app_session') || '{}');
                console.log('🔧 DEBUG: session data:', sessionData);
                if (sessionData.documentId) {
                    placeDocumentId = sessionData.documentId;
                    console.log('🔍 Using document ID from session cache:', placeDocumentId);
                } else {
                    // Try querying Appwrite by provider id attribute
                    console.log('🔎 Looking up place document by provider id...');
                    const remotePlace = await placeService.getByProviderId(String(loggedInProvider.id));
                    if (remotePlace) {
                        placeDocumentId = remotePlace.$id;
                        console.log('✅ Found remote place document by provider id:', placeDocumentId);
                    } else {
                        // As a final fallback, we'll attempt creation below if update fails
                        console.log('⚠️ No existing place document found by provider id');
                    }
                }
            }
            
            // 🔒 ONE CARD PER MASSAGE PLACE POLICY
            // Each massage place can only have ONE card but can edit it unlimited times
            let savedDoc: any | null = null;
            if (placeDocumentId) {
                console.log('✏️ Updating your existing massage place profile (1 card per place policy)');
                console.log('🔄 You can save/edit this card as many times as needed');
                console.log('💾 Update data:', updateData);
                try {
                    savedDoc = await placeService.update(placeDocumentId, updateData);
                    console.log('✅ Massage place profile saved successfully via update');
                } catch (err: any) {
                    const msg = (err && (err.message || err.code || '')) || '';
                    const isNotFound = String(msg).toLowerCase().includes('not found') || String(err?.code || '').includes('404');
                    if (isNotFound) {
                        console.warn('⚠️ Document not found on update, creating new document instead...');
                        savedDoc = await placeService.create({
                            ...updateData,
                            id: loggedInProvider.id,
                            isLive: true, // 🔄 CHANGED: Now goes live immediately
                            rating: 0,
                            // reviewCount: 0, // Removed - not in collection schema
                        });
                        placeDocumentId = savedDoc.$id;
                        // Cache for future saves
                        const session = JSON.parse(localStorage.getItem('app_session') || '{}');
                        localStorage.setItem('app_session', JSON.stringify({ ...session, documentId: placeDocumentId }));
                        console.log('✅ Massage place profile created successfully with new ID:', placeDocumentId);
                    } else {
                        throw err;
                    }
                }
            } else {
                console.log('➕ Creating your massage place profile (you can only create 1 card, but edit it unlimited times)');
                savedDoc = await placeService.create({
                    ...updateData,
                    id: loggedInProvider.id,
                    isLive: true, // 🔄 CHANGED: Now goes live immediately
                    rating: 0,
                    // reviewCount: 0, // Removed - not in collection schema
                });
                placeDocumentId = savedDoc.$id;
                const session = JSON.parse(localStorage.getItem('app_session') || '{}');
                localStorage.setItem('app_session', JSON.stringify({ ...session, documentId: placeDocumentId }));
                console.log('📝 Your massage place card has been created. You can now edit and save it as many times as you want.');
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
            console.log('🔄 Updated places state with new data');
            
            // Refresh data from database to ensure consistency across the app
            if (refreshData) {
                try {
                    console.log('🔄 Refreshing data from database to sync live site...');
                    await refreshData();
                    console.log('✅ Data refresh completed - live site should show updated info');
                } catch (refreshError) {
                    console.warn('⚠️ Failed to refresh data after save:', refreshError);
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
                console.log('✅ Admin notification created for profile approval');
            } catch (notificationError) {
                console.warn('⚠️ Failed to create admin notification:', notificationError);
                // Don't fail the entire save operation if notification fails
            }
            
            showToast('Profile saved successfully! Your profile is now live and visible to customers.', 'success');
        } catch (error: any) {
            console.error('❌ Save error:', error);
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
            console.error('Agent registration error:', error);
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
                console.error('Failed to update last login time', updateError);
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
            console.error('Agent login error:', error);
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
            console.error('Accept terms error:', error);
            showToast('Could not accept terms: ' + (error.message || 'Unknown error'), 'error');
        }
    };

    const handleSaveAgentProfile = async (agentData: Partial<Agent>) => {
        if (!loggedInAgent) return;
    
        try {
            const agentId = loggedInAgent.$id || loggedInAgent.id?.toString() || loggedInAgent.agentId;
            await agentService.update(agentId, agentData);
            
            const updatedAgent = { ...loggedInAgent, ...agentData };
            setLoggedInAgent(updatedAgent);
            localStorage.setItem('loggedInAgent', JSON.stringify(updatedAgent));
            showToast('Profile saved successfully!', 'success');
        } catch (error: any) {
            console.error('Save agent profile error:', error);
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
            console.error('Error sending admin message:', error);
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
            console.error('Error marking messages as read:', error);
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
