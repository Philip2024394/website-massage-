/**
 * useHomeHandlers - Handlers specific to HomePage functionality
 * Includes booking navigation, analytics, and chat handlers
 */

import { useCallback } from 'react';
import type { Therapist, Place, Booking, User, Analytics } from '../types';
import type { Page, Language } from '../types/pageTypes';
import { BookingStatus } from '../types';

// Helper function to convert Language to chat-compatible language
const getChatLanguage = (lang: Language): 'en' | 'id' => {
    return ['en', 'id'].includes(lang as 'en' | 'id') ? lang as 'en' | 'id' : 'en';
};

interface LoggedInCustomer {
    $id: string;
    name: string;
    profilePhoto?: string;
}

interface UseHomeHandlersProps {
    user: User | null;
    language: Language;
    loggedInCustomer: LoggedInCustomer | null;
    isHotelLoggedIn: boolean;
    isVillaLoggedIn: boolean;
    setPage: (page: Page) => void;
    setProviderForBooking: (provider: { provider: Therapist | Place; type: 'therapist' | 'place' } | null) => void;
    setShowRegisterPrompt: (show: boolean) => void;
    setRegisterPromptContext: (context: 'booking' | 'chat') => void;
    setActiveChatRoom: (room: any) => void;
    setChatBooking: (booking: Booking | null) => void;
    setIsChatWindowVisible: (visible: boolean) => void;
    setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}

export const useHomeHandlers = ({
    user,
    language,
    loggedInCustomer,
    isHotelLoggedIn,
    isVillaLoggedIn,
    setPage,
    setProviderForBooking,
    setShowRegisterPrompt,
    setRegisterPromptContext,
    setActiveChatRoom,
    setChatBooking,
    setIsChatWindowVisible,
    setBookings
}: UseHomeHandlersProps) => {

    // Analytics handler
    const handleIncrementAnalytics = useCallback((id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => {
        // This should be an RPC call to Appwrite/Supabase to increment the value
        console.log(`Incrementing ${metric} for ${type} ${id}`);
    }, []);

    // ❌ REMOVED: Legacy booking navigation - use local modal in components instead
    const handleNavigateToBooking = useCallback((provider: Therapist | Place, type: 'therapist' | 'place') => {
        // Allow hotel/villa users or regular customers to book
        if (!user && !isHotelLoggedIn && !isVillaLoggedIn && !loggedInCustomer) {
            setRegisterPromptContext('booking');
            setShowRegisterPrompt(true);
            return;
        }
        
        console.warn('⚠️ DEPRECATED: handleNavigateToBooking called but window.openBookingPopup removed.');
        console.log('ℹ️ Use local booking modals in TherapistCard or SharedTherapistProfile instead.');
        console.log('🔄 Fallback: Using booking page');
        
        // Legacy booking system removed - fallback to booking page
        setProviderForBooking({ provider, type });
        setPage('booking');
    }, [user, isHotelLoggedIn, isVillaLoggedIn, loggedInCustomer, setRegisterPromptContext, setShowRegisterPrompt, setProviderForBooking, setPage]);

    // Quick book with chat
    const handleQuickBookWithChat = useCallback(async (provider: Therapist | Place, type: 'therapist' | 'place') => {
        // Allow hotel/villa users or regular customers to book
        if (!user && !isHotelLoggedIn && !isVillaLoggedIn && !loggedInCustomer) {
            setRegisterPromptContext('booking');
            setShowRegisterPrompt(true);
            return;
        }

        // Create a quick booking with default values
        const now = new Date();
        const bookingTime = new Date(now.getTime() + 60 * 60 * 1000); // +1 hour from now
        
        const providerId = typeof provider.id === 'number' ? provider.id : (parseInt(String(provider.id), 10) || 0);
        
        const currentUserId = loggedInCustomer?.$id || user?.id || (isHotelLoggedIn ? 'hotel-user' : (isVillaLoggedIn ? 'villa-user' : 'guest'));
        const currentUserName = loggedInCustomer?.name || user?.name || (isHotelLoggedIn ? 'Hotel Guest' : (isVillaLoggedIn ? 'Villa Guest' : 'Guest'));

        const newBooking: Booking = {
            id: Date.now(),
            providerId: providerId,
            providerName: provider.name,
            providerType: type,
            startTime: bookingTime.toISOString(),
            service: '60' as '60' | '90' | '120',
            status: BookingStatus.Pending,
            userId: currentUserId,
            userName: currentUserName
        };

        // Set the provider for booking context
        setProviderForBooking({ provider, type });

        // Add booking to state
        setBookings(prev => [...prev, newBooking]);

        // Import and create chat room
        try {
            const { createChatRoom } = await import('../lib/chatService');
            const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
            
            const chatRoom = await createChatRoom({
                bookingId: newBooking.id,
                customerId: currentUserId,
                customerName: currentUserName,
                customerLanguage: getChatLanguage(language),
                customerPhoto: loggedInCustomer?.profilePhoto || '',
                therapistId: providerId,
                therapistName: provider.name,
                therapistLanguage: 'en',
                therapistType: type,
                therapistPhoto: '',
                expiresAt
            });

            setActiveChatRoom(chatRoom);
            setChatBooking(newBooking);
            setIsChatWindowVisible(true);
        } catch (error) {
            console.error('Error creating chat room:', error);
        }
    }, [user, language, loggedInCustomer, isHotelLoggedIn, isVillaLoggedIn, setRegisterPromptContext, setShowRegisterPrompt, setProviderForBooking, setBookings, setActiveChatRoom, setChatBooking, setIsChatWindowVisible]);

    // Chat with busy therapist
    const handleChatWithBusyTherapist = useCallback(async (therapist: Therapist) => {
        if (!isHotelLoggedIn && !isVillaLoggedIn && !loggedInCustomer) {
            setRegisterPromptContext('chat');
            setShowRegisterPrompt(true);
            return;
        }

        try {
            console.log('🚀 Creating chat with busy therapist:', therapist.name);

            // Import chat services
            const { createChatRoom } = await import('../lib/chatService');
            
            // Determine current user info
            const currentUserId = loggedInCustomer?.$id || user?.id || (isHotelLoggedIn ? 'hotel-user' : 'villa-user');
            const currentUserName = loggedInCustomer?.name || user?.name || (isHotelLoggedIn ? 'Hotel Guest' : 'Villa Guest');
            
            // Create a temporary booking for the chat context
            const tempBooking: Booking = {
                id: Date.now(),
                providerId: typeof therapist.id === 'number' ? therapist.id : parseInt(String(therapist.id), 10),
                providerName: therapist.name,
                providerType: 'therapist',
                startTime: new Date().toISOString(),
                service: '60' as '60' | '90' | '120',
                status: BookingStatus.Pending,
                userId: currentUserId,
                userName: currentUserName
            };

            // Create chat room
            const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
            const chatRoom = await createChatRoom({
                bookingId: tempBooking.id,
                customerId: currentUserId,
                customerName: currentUserName,
                customerLanguage: getChatLanguage(language),
                customerPhoto: loggedInCustomer?.profilePhoto || '',
                therapistId: tempBooking.providerId,
                therapistName: therapist.name,
                therapistLanguage: 'en',
                therapistType: 'therapist',
                therapistPhoto: '',
                expiresAt
            });

            setActiveChatRoom(chatRoom);
            setChatBooking(tempBooking);
            setIsChatWindowVisible(true);
            
            console.log('✅ Chat room created successfully');
        } catch (error) {
            console.error('Error creating chat with busy therapist:', error);
            alert('Failed to create chat. Please try again.');
        }
    }, [user, language, loggedInCustomer, isHotelLoggedIn, isVillaLoggedIn, setRegisterPromptContext, setShowRegisterPrompt, setActiveChatRoom, setChatBooking, setIsChatWindowVisible]);

    return {
        handleIncrementAnalytics,
        handleNavigateToBooking,
        handleQuickBookWithChat,
        handleChatWithBusyTherapist
    };
};
