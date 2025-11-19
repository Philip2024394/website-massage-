import type { Booking, Therapist, Place, User } from '../types';
import { BookingStatus } from '../types';
import type { Language, Page } from '../types/pageTypes';

// Helper function to convert Language to chat-compatible language
const getChatLanguage = (lang: Language): 'en' | 'id' => {
    return ['en', 'id'].includes(lang as 'en' | 'id') ? lang as 'en' | 'id' : 'en';
};

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

        // � PROFESSIONAL DUAL MESSAGING SYSTEM:
        // 1. WhatsApp notification to provider (private, instant backup)
        // 2. Chat window for customer (visible, interactive, with translation)
        
        console.log('🚀 Starting professional booking notification system...');
        
        try {
            // Import all required services
            const { createChatRoom, sendSystemMessage } = await import('../lib/chatService');
            const { playBookingNotificationSequence } = await import('../lib/soundService');
            const { whatsappService, getProviderWhatsApp, getProviderLanguage } = await import('../lib/whatsappService');
            
            console.log('✅ All services imported successfully');
            
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

            // 📱 STEP 1: Send WhatsApp notification to provider (backup/instant notification)
            const providerWhatsApp = getProviderWhatsApp(provider, providerType);
            const providerLanguage = getProviderLanguage(provider);
            
            if (providerWhatsApp) {
                console.log('📱 Sending WhatsApp notification to provider...');
                
                const whatsappResult = await whatsappService.sendBookingNotification(
                    providerWhatsApp,
                    providerLanguage,
                    getChatLanguage(language),
                    {
                        customerName: currentUserName,
                        service: `${newBooking.service} minute massage`,
                        datetime: new Date(newBooking.startTime).toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
                        duration: `${newBooking.service} minutes`,
                        location: (newBooking as any).location || 'Customer Location'
                    }
                );

                if (whatsappResult.success) {
                    console.log('✅ WhatsApp notification sent successfully!', whatsappResult.messageId);
                } else {
                    console.warn('⚠️ WhatsApp notification failed:', whatsappResult.error);
                }
            } else {
                console.warn('⚠️ No WhatsApp number found for provider');
            }

            // 💬 STEP 2: Create multilingual chat room with auto-translation  
            // Updated: 10-minute response window instead of 25 minutes
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            
            console.log('🔧 Creating multilingual chat room...');
            
            const chatRoom = await createChatRoom({
                bookingId: newBooking.id,
                customerId: currentUserId,
                customerName: currentUserName,
                customerLanguage: getChatLanguage(language),
                customerPhoto: loggedInCustomer?.profilePhoto || '',
                therapistId: provider.id as number,
                therapistName: provider.name,
                therapistLanguage: providerLanguage,
                therapistType: providerType,
                therapistPhoto: (provider as any).profilePicture || (provider as any).mainImage || '',
                expiresAt
            });

            console.log('✅ Multilingual chat room created:', chatRoom.$id);

            // Send enhanced system message with 10-minute countdown
            const systemMessages = {
                en: `✓ Booking request sent to ${provider.name}! 
💬 Chat in your preferred language - messages will be automatically translated.
📱 Provider notified via WhatsApp and chat.
⏰ Provider has 10 minutes to respond.
🔔 If no response, we'll find the next available therapist nearby.`,
                id: `✓ Permintaan booking terkirim ke ${provider.name}! 
💬 Chat dalam bahasa pilihan Anda - pesan akan diterjemahkan otomatis.
📱 Provider telah diberitahu via WhatsApp dan chat.
⏰ Provider punya 10 menit untuk merespon.
🔔 Jika tidak ada respon, kami akan cari terapis tersedia terdekat.`
            };

            await sendSystemMessage(chatRoom.$id!, systemMessages);
            console.log('✅ Enhanced multilingual system message sent');

            // 🔊 STEP 3: Play professional notification sound sequence
            await playBookingNotificationSequence();
            console.log('✅ Professional notification sounds played');

            // 🖥️ STEP 4: Open chat window with auto-translation
            setActiveChatRoom(chatRoom);
            setChatBooking(newBooking);
            setIsChatWindowVisible(true);

            console.log('✅ Chat window opened with translation support!');
            console.log('🌐 Languages: Customer =', language, ', Provider =', providerLanguage);
            console.log('State values:', { 
                hasChatRoom: !!chatRoom, 
                hasBooking: !!newBooking,
                chatRoomId: chatRoom.$id 
            });

            // Return to home with chat overlay
            setPage('home');

            // 🔔 STEP 5: Start continuous notifications for therapist
            const { startContinuousNotifications } = await import('../lib/continuousNotificationService');
            startContinuousNotifications(newBooking.id.toString());

            // ⏰ STEP 6: Start 10-minute countdown with auto-reassignment
            const { startBookingCountdown } = await import('../lib/countdownTimerService');
            const { getCustomerLocation, findNearbyTherapists, findNearbyPlaces } = await import('../lib/nearbyProvidersService');
            
            startBookingCountdown(
                newBooking.id.toString(),
                10, // 10 minutes
                (countdownState) => {
                    // Update countdown in chat (this would need chat service update)
                    console.log(`⏰ Countdown: ${countdownState.formattedTime}`);
                },
                async () => {
                    // 10 minutes expired - apply penalties and find nearby providers
                    console.log('🔄 10 minutes expired - applying penalties and finding nearby providers...');
                    
                    try {
                        // Stop continuous notifications for original provider
                        const { stopContinuousNotifications } = await import('../lib/continuousNotificationService');
                        stopContinuousNotifications(newBooking.id.toString());
                        
                        // 🚨 APPLY AUTOMATIC PENALTY to non-responsive therapist
                        if (providerType === 'therapist') {
                            try {
                                const { applyNonResponsePenalty } = await import('../lib/therapistPenaltyService');
                                
                                console.log('⚠️ Applying penalty to non-responsive therapist:', provider.id);
                                
                                await applyNonResponsePenalty(
                                    provider.id,
                                    newBooking.id,
                                    currentUserName
                                );
                                
                                console.log('✅ Penalty applied successfully to therapist:', provider.id);
                                
                                // Send penalty notification to customer's chat
                                const penaltyNotificationMessage = {
                                    en: `⚠️ **SYSTEM NOTICE** ⚠️
                                    
🚨 ${provider.name} has been automatically penalized for not responding within 10 minutes:
• ⭐ 1-star review added to their profile
• 🪙 200 coins deducted from their account
• 📢 Warning issued to maintain service standards

🔄 Now finding alternative therapists for you...`,

                                    id: `⚠️ **PEMBERITAHUAN SISTEM** ⚠️
                                    
🚨 ${provider.name} telah dikenai penalti otomatis karena tidak merespon dalam 10 menit:
• ⭐ Review 1 bintang ditambahkan ke profil mereka
• 🪙 200 koin dikurangi dari akun mereka  
• 📢 Peringatan diberikan untuk menjaga standar layanan

🔄 Sekarang mencari terapis alternatif untuk Anda...`
                                };
                                
                                await sendSystemMessage(chatRoom.$id!, penaltyNotificationMessage);
                                
                            } catch (penaltyError) {
                                console.error('❌ Error applying penalty:', penaltyError);
                                // Continue with reassignment even if penalty fails
                            }
                        }
                        
                        // Get customer location
                        const customerLocation = await getCustomerLocation();
                        
                        // Find nearby providers (15km radius)
                        let nearbyProviders: (Therapist | Place)[] = [];
                        if (providerType === 'therapist') {
                            nearbyProviders = await findNearbyTherapists(provider.id, customerLocation, 15);
                        } else {
                            nearbyProviders = await findNearbyPlaces(provider.id, customerLocation, 15);
                        }
                        
                        if (nearbyProviders.length > 0) {
                            // Send reassignment message
                            const reassignmentMessage = {
                                en: `⏰ ${provider.name} did not respond in 10 minutes.
🔄 We have found ${nearbyProviders.length} nearby providers.
📱 Sending booking request to all nearby providers...
🎯 First to accept will be your therapist!
⚡ This ensures faster service for you.

ℹ️ Previous therapist may be in transit or mobile phone not available.
🙏 We apologize and have selected the best suited therapists nearby.
👨‍💼 - Admin Team IndoStreet`,
                                id: `⏰ ${provider.name} tidak merespon dalam 10 menit.
🔄 Kami telah menemukan ${nearbyProviders.length} provider terdekat.
📱 Mengirim permintaan booking ke semua provider terdekat...
🎯 Yang pertama menerima akan menjadi terapis Anda!
⚡ Ini memastikan layanan lebih cepat untuk Anda.

ℹ️ Terapis sebelumnya mungkin sedang dalam perjalanan atau HP tidak tersedia.
🙏 Kami mohon maaf dan telah memilih terapis terbaik terdekat.
👨‍💼 - Tim Admin IndoStreet`
                            };
                            
                            await sendSystemMessage(chatRoom.$id!, reassignmentMessage);
                            
                            // Send WhatsApp to all nearby providers
                            for (const nearbyProvider of nearbyProviders) {
                                const nearbyWhatsApp = getProviderWhatsApp(nearbyProvider, providerType);
                                const nearbyLanguage = getProviderLanguage(nearbyProvider);
                                
                                if (nearbyWhatsApp) {
                                    await whatsappService.sendBookingNotification(
                                        nearbyWhatsApp,
                                        nearbyLanguage,
                                        getChatLanguage(language),
                                        {
                                            customerName: currentUserName,
                                            service: `${newBooking.service} minute massage`,
                                            datetime: new Date(newBooking.startTime).toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
                                            duration: `${newBooking.service} minutes`,
                                            location: (newBooking as any).location || 'Customer Location'
                                        }
                                    );
                                }
                            }
                            
                            console.log(`✅ Booking request sent to ${nearbyProviders.length} nearby providers`);
                            
                        } else {
                            // No nearby providers found
                            const noProvidersMessage = {
                                en: `⏰ ${provider.name} did not respond in 10 minutes.
🔍 Unfortunately, no nearby providers found within 15km.
📞 Please try calling ${provider.name} directly: ${(provider as any).whatsappNumber || 'Number not available'}
🙏 We apologize for the inconvenience.
👨‍💼 - Admin Team IndoStreet`,
                                id: `⏰ ${provider.name} tidak merespon dalam 10 menit.
🔍 Sayangnya, tidak ada provider terdekat dalam radius 15km.
📞 Silakan coba hubungi ${provider.name} langsung: ${(provider as any).whatsappNumber || 'Nomor tidak tersedia'}
🙏 Kami mohon maaf atas ketidaknyamanan ini.
👨‍💼 - Tim Admin IndoStreet`
                            };
                            
                            await sendSystemMessage(chatRoom.$id!, noProvidersMessage);
                        }
                        
                    } catch (error) {
                        console.error('❌ Error in auto-reassignment:', error);
                        
                        const errorMessage = {
                            en: `⏰ ${provider.name} did not respond in 10 minutes.
❌ Error finding nearby providers. Please try again or contact support.
👨‍💼 - Admin Team IndoStreet`,
                            id: `⏰ ${provider.name} tidak merespon dalam 10 menit.
❌ Error mencari provider terdekat. Silakan coba lagi atau hubungi support.
👨‍💼 - Tim Admin IndoStreet`
                        };
                        
                        await sendSystemMessage(chatRoom.$id!, errorMessage);
                    }
                }
            );

            // 🔔 STEP 7: Set up 5-minute reminder (halfway point)
            setTimeout(async () => {
                if (newBooking.status === BookingStatus.Pending) {
                    console.log('⏰ Sending 5-minute reminder...');
                    if (providerWhatsApp) {
                        await whatsappService.sendBookingReminder(
                            providerWhatsApp,
                            providerLanguage,
                            currentUserName,
                            5 // 5 minutes left
                        );
                    }
                }
            }, 5 * 60 * 1000); // 5 minutes later

        } catch (error) {
            console.error('❌ Error in professional booking system:', error);
            // Graceful fallback
            alert(t.bookingPage.bookingSuccessTitle + '\n' + t.bookingPage.bookingSuccessMessage.replace('{name}', newBooking.providerName));
            setPage('home');
        }
    };

    const handleUpdateBookingStatus = async (bookingId: number, newStatus: BookingStatus) => {
        // Find the booking being updated
        const booking = bookings.find(b => b.id === bookingId);
        
        // Update booking status
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
        
        // 🔔 STOP CONTINUOUS NOTIFICATIONS: When booking is accepted/confirmed
        if (newStatus === BookingStatus.Confirmed || newStatus === BookingStatus.OnTheWay) {
            try {
                const { stopContinuousNotifications } = await import('../lib/continuousNotificationService');
                const { stopBookingCountdown } = await import('../lib/countdownTimerService');
                
                stopContinuousNotifications(bookingId.toString());
                stopBookingCountdown(bookingId.toString());
                
                console.log('✅ Stopped continuous notifications and countdown for accepted booking:', bookingId);
            } catch (error) {
                console.error('❌ Error stopping notifications:', error);
            }
        }
        
        // Loyalty coins disabled: no-op on booking completion
        // Previously awarded coins on BookingStatus.Completed
    };

    return {
        handleCreateBooking,
        handleUpdateBookingStatus,
        handleShowRegisterPromptForChat
    };
};
