import type { Booking, Therapist, Place, User } from '../types';
import { BookingStatus } from '../types';
import type { Language, Page } from '../types/pageTypes';

interface LoggedInCustomer {
    $id: string;
    name: string;
    profilePhoto?: string;
}

interface UseBookingHandlersProps {
    language: Language;
    user: User | null;
    loggedInCustomer: LoggedInCustomer | null;
    isHotelLoggedIn: boolean;
    isVillaLoggedIn: boolean;
    providerForBooking: { provider: Therapist | Place; type: 'therapist' | 'place' } | null;
    bookings: Booking[];
    setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
    setActiveChatRoom: (room: any) => void;
    setChatBooking: (booking: Booking) => void;
    setIsChatWindowVisible: (visible: boolean) => void;
    setPage: (page: Page) => void;
    setLoyaltyEvent: (event: any) => void;
    setShowRegisterPrompt: (show: boolean) => void;
    setRegisterPromptContext: (context: string) => void;
    t: any; // Translation object
}

export const useBookingHandlers = ({
    language,
    user,
    loggedInCustomer,
    isHotelLoggedIn,
    isVillaLoggedIn,
    providerForBooking,
    bookings,
    setBookings,
    setActiveChatRoom,
    setChatBooking,
    setIsChatWindowVisible,
    setPage,
    setLoyaltyEvent,
    setShowRegisterPrompt,
    setRegisterPromptContext,
    t
}: UseBookingHandlersProps) => {

    const handleShowRegisterPromptForChat = () => {
        setRegisterPromptContext('chat');
        setShowRegisterPrompt(true);
    };

    const handleCreateBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'userId' | 'userName'>) => {
        // Determine current user info (support hotel/villa/customer/regular user)
        const currentUserId = loggedInCustomer?.$id || user?.id || (isHotelLoggedIn ? 'hotel-user' : (isVillaLoggedIn ? 'villa-user' : 'guest'));
        const currentUserName = loggedInCustomer?.name || user?.name || (isHotelLoggedIn ? 'Hotel Guest' : (isVillaLoggedIn ? 'Villa Guest' : 'Guest'));
        
        const newBooking: Booking = {
            ...bookingData,
            id: Date.now(),
            status: BookingStatus.Pending,
            userId: currentUserId,
            userName: currentUserName,
        };
        setBookings(prev => [...prev, newBooking]);

        // Track booking completion in analytics (lazy loaded)
        import('../services/analyticsService')
            .then(({ analyticsService }) => {
                // Calculate amount from service duration
                const defaultPricing = { '60': 200000, '90': 300000, '120': 400000 };
                const amount = defaultPricing[newBooking.service as '60' | '90' | '120'] || 200000;
                
                return analyticsService.trackBookingCompleted(
                    newBooking.id,
                    newBooking.providerId,
                    newBooking.providerType as 'therapist' | 'place',
                    amount,
                    user?.id.toString()
                );
            })
            .catch(err => console.error('Analytics tracking error:', err));

        // 🔔 DUAL NOTIFICATION SYSTEM:
        // 1. WhatsApp (secret backend notification - user never sees)
        // 2. Chat window (visible to user with real-time messaging)
        
        console.log('🚀 Starting chat room creation...');
        
        try {
            // Import chat services
            const { createChatRoom, sendSystemMessage } = await import('../lib/chatService');
            const { playBookingNotificationSequence } = await import('../lib/soundService');
            
            console.log('✅ Chat services imported');
            
            // Get provider details
            const provider = providerForBooking?.provider;
            const providerType = providerForBooking?.type || 'therapist';
            
            if (!provider) {
                console.warn('❌ No provider found for booking');
                alert(t.bookingPage.bookingSuccessTitle + '\n' + t.bookingPage.bookingSuccessMessage.replace('{name}', newBooking.providerName));
                setPage('home');
                return;
            }

            console.log('📋 Provider details:', { 
                id: provider.id, 
                name: provider.name, 
                type: providerType 
            });

            // Create chat room with 25-minute expiry
            const expiresAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
            
            console.log('🔧 Creating chat room...');
            
            const chatRoom = await createChatRoom({
                bookingId: newBooking.id,
                customerId: currentUserId,
                customerName: currentUserName,
                customerLanguage: language,
                customerPhoto: loggedInCustomer?.profilePhoto || '',
                therapistId: provider.id as number,
                therapistName: provider.name,
                therapistLanguage: (provider as any).language || 'id',
                therapistType: providerType,
                therapistPhoto: (provider as any).profilePicture || (provider as any).mainImage || '',
                expiresAt
            });

            console.log('✅ Chat room created:', chatRoom.$id);

            // Send initial system message
            await sendSystemMessage(chatRoom.$id!, {
                en: '✓ Booking request sent! Therapist has 25 minutes to respond.',
                id: '✓ Permintaan booking terkirim! Terapis punya 25 menit untuk merespon.'
            });

            console.log('✅ System message sent');

            // Play notification sound sequence
            // 1. WhatsApp sent sound (0ms)
            // 2. Chat window opened sound (800ms later)
            await playBookingNotificationSequence();

            console.log('✅ Notification sounds played');

            // Open chat window
            setActiveChatRoom(chatRoom);
            setChatBooking(newBooking);
            setIsChatWindowVisible(true);

            console.log('✅ Chat window state set. Should be visible now!');
            console.log('State values:', { 
                hasChatRoom: !!chatRoom, 
                hasBooking: !!newBooking,
                chatRoomId: chatRoom.$id 
            });

            // Go back to home (chat window will overlay)
            setPage('home');

        } catch (error) {
            console.error('❌ Error creating chat room:', error);
            // Fallback to old behavior if chat fails
            alert(t.bookingPage.bookingSuccessTitle + '\n' + t.bookingPage.bookingSuccessMessage.replace('{name}', newBooking.providerName));
            setPage('home');
        }
    };

    const handleUpdateBookingStatus = async (bookingId: number, newStatus: BookingStatus) => {
        // Find the booking being updated
        const booking = bookings.find(b => b.id === bookingId);
        
        // Update booking status
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        
        // 🪙 LOYALTY COINS: Award coins when booking is completed
        if (newStatus === BookingStatus.Completed && booking && loggedInCustomer) {
            try {
                console.log('🪙 Awarding loyalty coins for completed booking...');
                
                // Import awardCoins service
                const { awardCoins } = await import('../lib/loyaltyService');
                
                const event = await awardCoins(
                    loggedInCustomer.$id || (loggedInCustomer as any).userId,
                    booking.providerId,
                    booking.providerType,
                    booking.providerName,
                    booking.id
                );
                
                // Show celebration popup with falling coins!
                setLoyaltyEvent(event);
                
                console.log('✅ Loyalty coins awarded:', event);
            } catch (error) {
                console.error('❌ Error awarding loyalty coins:', error);
                // Don't block the status update if coin awarding fails
            }
        }
    };

    return {
        handleCreateBooking,
        handleUpdateBookingStatus,
        handleShowRegisterPromptForChat
    };
};
