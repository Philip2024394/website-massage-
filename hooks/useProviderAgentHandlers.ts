import type { Therapist, Place, Agent } from '../types';
import type { Page, LoggedInProvider } from '../types/pageTypes';
import { therapistService, placeService, agentService, adminMessageService } from '../lib/appwriteService';

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
    setPlaces
}: UseProviderAgentHandlersProps) => {

    const handleTherapistStatusChange = async (status: string, handleSaveTherapist: any) => {
        if (!loggedInProvider || loggedInProvider.type !== 'therapist') return;
        
        try {
            // Update status in backend
            const therapist = therapists.find(t => t.id === loggedInProvider.id);
            if (therapist) {
                await handleSaveTherapist({
                    ...therapist,
                    status: status as any
                });
            }
        } catch (error) {
            console.error('Error updating therapist status:', error);
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
                reviewCount: existingTherapist?.reviewCount || 0,
                isLicensed: (therapistData as any).isLicensed || false,
                licenseNumber: (therapistData as any).licenseNumber || '',
                analytics: compactJsonString(therapistData.analytics, 'analytics', '{"impressions":0,"views":0,"profileViews":0,"whatsappClicks":0}'),
                hotelVillaServiceStatus: existingTherapist?.hotelVillaServiceStatus || 'NotOptedIn',
                hotelDiscount: existingTherapist?.hotelDiscount || 0,
                villaDiscount: existingTherapist?.villaDiscount || 0,
                serviceRadius: existingTherapist?.serviceRadius || 10,
                // Preserve system fields
                email: existingTherapist?.email || `therapist${therapistId}@indostreet.com`,
                password: existingTherapist?.password || '',
                isLive: existingTherapist?.isLive || false,
                activeMembershipDate: existingTherapist?.activeMembershipDate || new Date().toISOString().split('T')[0],
                createdAt: existingTherapist?.createdAt || new Date().toISOString()
            };
            
            console.log('💾 Saving therapist data:', {
                name: updateData.name,
                profilePicture: updateData.profilePicture?.substring(0, 50) + '...',
                mainImage: updateData.mainImage?.substring(0, 50) + '...',
                location: updateData.location
            });
            
            // If profile exists, preserve important fields
            if (existingTherapist) {
                console.log('✏️ Updating existing profile, preserving isLive, email, rating, reviewCount, activeMembershipDate');
                await therapistService.update(therapistId, updateData);
            } else {
                console.log('➕ Creating new profile with isLive=false (requires admin activation)');
                const createData = {
                    ...updateData,
                    isLive: false,
                    email: `therapist${therapistId}@indostreet.com`,
                };
                await therapistService.create(createData);
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
                    isLive: false,
                    rating: 0,
                    reviewCount: 0,
                    activeMembershipDate: new Date().toISOString().split('T')[0],
                    email: `therapist${therapistId}@indostreet.com`,
                };
                updatedTherapists.push(newTherapist as any);
            }
            
            setTherapists(updatedTherapists);
            console.log('🔄 Updated therapists state with new data');
            
            showToast('Profile saved successfully! All your changes have been saved.', 'success');
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
                    // Last resort: use the provider ID as document ID
                    placeDocumentId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
                    console.log('🔍 Using provider ID as document ID:', placeDocumentId);
                }
            }
            
            console.log('💾 Updating place document with ID:', placeDocumentId);
            console.log('💾 Update data:', updateData);
            await placeService.update(placeDocumentId, updateData);
            console.log('✅ Place profile saved successfully');
            
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
            
            setPlaces(updatedPlaces);
            console.log('🔄 Updated places state with new data');
            
            showToast('Profile saved successfully! All your changes have been saved.', 'success');
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
