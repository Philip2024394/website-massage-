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
    
    // Append to body safely
    if (document.body) {
        document.body.appendChild(toast);
        
        // Fade out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                // Check if element still exists and has parent before removing
                if (toast && toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
};

interface UseProviderAgentHandlersProps {
    loggedInProvider: LoggedInProvider | null;
    loggedInAgent: Agent | null;
    impersonatedAgent: Agent | null;
    therapists: Therapist[];
    setLoggedInAgent: (agent: Agent | null) => void;
    setImpersonatedAgent: (agent: Agent | null) => void;
    setAdminMessages: (messages: any[]) => void;
    setPage: (page: Page) => void;
}

export const useProviderAgentHandlers = ({
    loggedInProvider,
    loggedInAgent,
    impersonatedAgent,
    therapists,
    setLoggedInAgent,
    setImpersonatedAgent,
    setAdminMessages,
    setPage
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
            } catch (error) {
                console.log('📝 No existing profile found, will create new one');
            }
            
            const updateData: any = {
                ...therapistData,
                profilePicture: profilePicture,
                mainImage: therapistData.mainImage || '',
                id: therapistId,
                therapistId: therapistId,
                hotelId: '',
                pricing: typeof therapistData.pricing === 'string' ? therapistData.pricing : JSON.stringify(therapistData.pricing),
                analytics: typeof therapistData.analytics === 'string' ? therapistData.analytics : JSON.stringify(therapistData.analytics),
                specialization: 'Massage Therapist',
                yearsOfExperience: (therapistData as any).yearsOfExperience || 0,
                isLicensed: (therapistData as any).isLicensed || false,
                availability: '[]',
                hourlyRate: 100,
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
            showToast('Profile saved successfully! All your changes have been saved.', 'success');
        } catch (error: any) {
            console.error('❌ Save error:', error);
            showToast('Error saving profile: ' + (error.message || 'Unknown error. Please try again.'), 'error');
        }
    };
    
    const handleSavePlace = async (placeData: Omit<Place, 'id' | 'isLive' | 'rating' | 'reviewCount' | 'email'>) => {
        if (!loggedInProvider) return;
        
        try {
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
            
            // Use string ID for Appwrite
            const placeId = typeof loggedInProvider.id === 'string' ? loggedInProvider.id : loggedInProvider.id.toString();
            await placeService.update(placeId, updateData);
            console.log('✅ Place profile saved successfully');
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
            const agentId = loggedInAgent.$id || loggedInAgent.id.toString();
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
            const agentId = loggedInAgent.$id || loggedInAgent.id.toString();
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
