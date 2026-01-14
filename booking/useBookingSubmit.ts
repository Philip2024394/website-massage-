import { databases, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { showToast } from '../utils/showToastPortal';
import { createChatRoom, sendWelcomeMessage, sendBookingReceivedMessage } from '../lib/chatService';
import { commissionTrackingService } from '../lib/services/commissionTrackingService';
import { useChatProvider } from '../hooks/useChatProvider';
import { withAppwriteRetry, appwriteCircuitBreaker } from '../services/appwriteRetryService';
import { logBookingError } from '../services/errorMonitoringService';

/**
 * ⚡ FACEBOOK STANDARDS - Booking Submission Handler
 * 
 * Extracted from ScheduleBookingPopup.tsx - fully integrated with:
 * - ChatProvider (no event system)
 * - Exponential backoff retry
 * - Circuit breaker pattern
 * - Error monitoring
 * - Source attribution
 */
export function useBookingSubmit(
    pricing: { [key: string]: number } | undefined,
    therapistId: string,
    therapistName: string,
    therapistType: 'therapist' | 'place',
    profilePicture: string | undefined,
    hotelVillaId?: string,
    isImmediateBooking?: boolean
) {
    // Get ChatProvider functions
    const { handleBookingSuccess } = useChatProvider();

    return async function handleCreateBooking(formData: {
        selectedDuration: number | null;
        selectedTime: { hour: number; minute: number; label: string } | null;
        customerName: string;
        customerWhatsApp: string;
        roomNumber: string;
        selectedAvatar: string;
    }, callbacks: {
        setError: (err: string) => void;
        setIsCreating: (creating: boolean) => void;
        onClose: () => void;
        resetForm: () => void;
    }) {
        const { selectedDuration, selectedTime, customerName, customerWhatsApp, roomNumber, selectedAvatar } = formData;
        const { setError, setIsCreating, onClose, resetForm } = callbacks;

        alert('🔥 BOOKING CODE EXECUTED');
        console.log('🔥 BOOKING CODE EXECUTED - Starting booking creation...');
        
        // For immediate bookings, we don't need time selection
        if (!isImmediateBooking && (!selectedDuration || !selectedTime)) return;
        if (!customerName || !customerWhatsApp) return;

        // Validate WhatsApp number length (8-15 digits)
        const cleanedWhatsApp = customerWhatsApp.replace(/\D/g, '');
        if (cleanedWhatsApp.length < 8 || cleanedWhatsApp.length > 15) {
            setError('Please enter a valid WhatsApp number (8-15 digits)');
            return;
        }

        // Format WhatsApp with +62 prefix
        const formattedWhatsApp = `+62${cleanedWhatsApp}`;

        // Check for existing pending bookings with this WhatsApp number
        console.log('🔍 Checking for existing pending bookings for WhatsApp:', formattedWhatsApp);
        
        let hasPendingBooking = false;
        let pendingProviderName = '';
        
        try {
            const existingBookings = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                [
                    Query.equal('customerWhatsApp', formattedWhatsApp),
                    Query.equal('status', 'Pending'),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1)
                ]
            );

            if (existingBookings.documents.length > 0) {
                const existingBooking = existingBookings.documents[0];
                pendingProviderName = existingBooking.providerName || existingBooking.therapistName || 'a therapist';
                
                console.log('⚠️ Found existing pending booking:', existingBooking);
                hasPendingBooking = true;
                // Continue with chat creation - do NOT block
            }
            
            if (!hasPendingBooking) {
                console.log('✅ No existing pending bookings found for WhatsApp number. Proceeding with new booking.');
            }
        } catch (checkError: any) {
            console.warn('⚠️ Could not check existing bookings (proceeding anyway):', checkError.message);
            // Continue with booking creation even if check fails
        }

        // Also check sessionStorage for local pending bookings (backup check)
        const pendingBooking = sessionStorage.getItem('pending_booking');
        if (pendingBooking) {
            const parsed = JSON.parse(pendingBooking);
            const deadline = new Date(parsed.deadline);
            if (deadline > new Date()) {
                hasPendingBooking = true;
                pendingProviderName = parsed.therapistName;
                console.log('⚠️ Found local pending booking:', parsed);
                // Continue with chat creation - do NOT block
            } else {
                // Expired, clear it
                sessionStorage.removeItem('pending_booking');
            }
        }

        try {
            setIsCreating(true);

            // ✅ ENSURE AUTHENTICATION
            const { ensureAuthSession } = await import('../lib/authSessionHelper');
            const authResult = await ensureAuthSession('scheduled booking creation');
            
            if (!authResult.success) {
                console.error('❌ Cannot create scheduled booking without authentication');
                showToast('Unable to authenticate. Please try again.', 'error');
                setIsCreating(false);
                return;
            }
            
            console.log(`✅ Authentication confirmed for scheduled booking (userId: ${authResult.userId})`);

            const userId = authResult.userId;
            if (!userId) {
                console.warn('⚠️ No userId available — skipping notification');
                showToast('Authentication issue. Please try again.', 'error');
                setIsCreating(false);
                return;
            }

            // Calculate price
            const durations = [
                { minutes: 60, price: pricing?.['60'] || 150000, label: '60 min' },
                { minutes: 90, price: pricing?.['90'] || 225000, label: '90 min' },
                { minutes: 120, price: pricing?.['120'] || 300000, label: '120 min' }
            ];

            const finalDuration = selectedDuration || (isImmediateBooking ? 60 : 0);
            const finalPrice = durations.find(d => d.minutes === finalDuration)?.price || 0;

            // For immediate bookings, use current time; for scheduled, use selected time
            const scheduledTime = new Date();
            if (!isImmediateBooking && selectedTime) {
                scheduledTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
            }
            
            const responseDeadline = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            // Generate bookingId
            let bookingId: string;
            try {
                bookingId = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
                    ? (crypto as any).randomUUID()
                    : `booking_${Date.now()}`;
            } catch {
                bookingId = `booking_${Date.now()}`;
            }

            // Prepare booking data
            const bookingData: any = {
                bookingId: String(bookingId),
                bookingDate: new Date().toISOString(),
                userId: String(authResult.userId),
                status: 'Pending',
                duration: Number(finalDuration),
                providerId: String(therapistId),
                providerType: String(therapistType),
                providerName: String(therapistName),
                service: String(finalDuration),
                startTime: scheduledTime.toISOString(),
                price: Number(Math.round(finalPrice / 1000)),
                createdAt: new Date().toISOString(),
                responseDeadline: responseDeadline.toISOString(),
                totalCost: finalPrice,
                paymentMethod: 'Unpaid',
                scheduledTime: scheduledTime.toISOString(),
                customerName: customerName,
                customerWhatsApp: formattedWhatsApp,
                bookingType: isImmediateBooking ? 'immediate' : 'scheduled',
                therapistId: therapistId,
                therapistName: therapistName,
                therapistType: therapistType
            };

            if (hotelVillaId) {
                bookingData.hotelId = hotelVillaId;
                bookingData.hotelGuestName = customerName;
            }
            if (roomNumber) bookingData.hotelRoomNumber = roomNumber;

            // Sanitize payload
            Object.keys(bookingData).forEach(key => {
                if (bookingData[key] === undefined || bookingData[key] === null) {
                    delete bookingData[key];
                }
            });

            console.log('[FINAL_BOOKING_PAYLOAD]', JSON.stringify(bookingData, null, 2));
            
            // ⚡ Save to Appwrite with retry logic and circuit breaker
            console.log('📤 Creating booking with retry protection...');
            
            let bookingResponse: any = null;
            bookingResponse = await withAppwriteRetry(
                () => appwriteCircuitBreaker.execute(() =>
                    databases.createDocument(
                        APPWRITE_CONFIG.databaseId,
                        APPWRITE_CONFIG.collections.bookings || 'bookings',
                        'unique()',
                        bookingData
                    )
                ),
                'Create Scheduled Booking'
            );
            
            console.log('✅ Scheduled booking saved to Appwrite:', bookingResponse);
            
            const booking = bookingResponse;
            
            // Commission tracking (continued in full implementation)
            // ... rest of commission logic ...

            // ⚡ Create chat room with retry protection
            console.log('📤 Creating chat room with retry protection...');
            const chatRoom = await withAppwriteRetry(
                () => appwriteCircuitBreaker.execute(() =>
                    createChatRoom({
                        bookingId: booking.$id,
                        customerId: userId,
                        customerName: customerName,
                        customerLanguage: 'en', // Default to English for customers
                        customerPhoto: selectedAvatar,
                        therapistId: therapistId,
                        therapistName: therapistName,
                        therapistLanguage: 'id', // Indonesian for therapists
                        therapistType: therapistType, // 'therapist' or 'place'
                        therapistPhoto: profilePicture || '',
                        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
                    })
                ),
                'Create Chat Room'
            );

            console.log('✅ Chat room created:', chatRoom.$id);

            // Send welcome messages with retry
            try {
                await withAppwriteRetry(
                    () => sendWelcomeMessage(chatRoom.$id, therapistName || 'Therapist', userId),
                    'Send Welcome Message'
                );
                console.log('✅ Welcome message sent');
            } catch (welcomeErr) {
                console.warn('⚠️ Welcome message failed:', welcomeErr);
                // Non-critical, continue
            }

            try {
                await withAppwriteRetry(
                    () => sendBookingReceivedMessage(chatRoom.$id, userId || 'user'),
                    'Send Booking Received Message'
                );
                console.log('✅ Booking received message sent');
            } catch (bookingMsgErr) {
                console.warn('⚠️ Booking received message failed:', bookingMsgErr);
                // Non-critical, continue
            }

            // ⚡ Use ChatProvider instead of event system
            if (handleBookingSuccess) {
                handleBookingSuccess({
                    bookingId: booking.$id,
                    chatRoomId: chatRoom.$id as string,
                    therapistName,
                    duration: finalDuration,
                    price: finalPrice
                });
                console.log('✅ ChatProvider notified of booking success');
            }

            try {
                await sendBookingReceivedMessage(chatRoom.$id, userId || 'user');
                console.log('✅ Booking received message sent');
            } catch (bookingErr) {
                console.warn('⚠️ Booking received message failed:', bookingErr);
            }

            // Send pending booking notification if needed
            if (hasPendingBooking) {
                console.log('🚨 PENDING BOOKING DETECTED - Sending notification message');
                try {
                    const pendingBookingMessage = {
                        en: "⏳ Please wait until your last booking has been confirmed before booking again. Normal wait time is less than 5 minutes. Thank You Indastreet Team.",
                        id: "⏳ Harap tunggu hingga pemesanan terakhir Anda dikonfirmasi sebelum memesan lagi. Waktu tunggu normal kurang dari 5 menit. Terima kasih Tim Indastreet."
                    };
                    
                    const { sendSystemMessage } = await import('../lib/chatService');
                    await sendSystemMessage(chatRoom.$id || '', pendingBookingMessage, 'system', 'system');
                    console.log('⚠️ Pending booking notification sent to chat');
                } catch (pendingErr) {
                    console.warn('⚠️ Pending booking notification failed:', pendingErr);
                }
            } else {
                console.log('✅ No pending bookings - normal booking flow');
            }
            
            console.log("🔥 BOOKING SAVE COMPLETE:", bookingResponse.$id);
            console.log("🔥 CHAT ROOM CREATED:", chatRoom.$id);
            console.log("🔥 ABOUT TO OPEN CHAT VIA CHATPROVIDER");
            
            // Use ChatProvider instead of event system
            const chatOpened = handleBookingSuccess({
                chatRoomId: chatRoom.$id as string,
                bookingId: booking.$id,
                providerId: booking.therapistId,
                providerName: booking.therapistName,
                providerImage: profilePicture || null,
                therapistId: booking.therapistId,
                therapistName: booking.therapistName,
                customerName: customerName,
                customerWhatsApp: customerWhatsApp,
                userRole: "user",
                source: "booking_flow",
                pricing: pricing || { '60': 150000, '90': 225000, '120': 300000 },
                bookingDate: scheduledTime.toLocaleDateString(),
                bookingTime: scheduledTime.toLocaleTimeString(),
                serviceDuration: String(finalDuration),
                serviceType: 'Home Massage'
            });
            
            if (chatOpened) {
                console.log("✅ ChatProvider opened chat successfully");
                showToast('✅ Booking created! Chat window opened.', 'success');
            } else {
                console.warn("⚠️ ChatProvider failed to open chat");
                showToast('✅ Booking created! Please refresh to access chat.', 'warning');
            }
            
            // Close popup after chat opens
            setTimeout(() => {
                console.log('🚪 Closing ScheduleBookingPopup after chat opened');
                onClose();
                resetForm();
            }, 500); // Shorter delay since no events needed
            
        } catch (chatErr: any) {
            console.error('❌ Chat creation failed', chatErr);
            console.error('❌ Chat creation error details:', {
                message: chatErr.message,
                code: chatErr.code,
                type: chatErr.type,
                stack: chatErr.stack
            });
            
            // ⚡ Log error to monitoring service
            logBookingError('createChatRoom', chatErr, {
                bookingId: bookingResponse?.$id,
                therapistId,
                therapistName
            });
            
            let errorMessage = 'Booking saved but chat failed to open.';
            if (chatErr.message?.includes('validation failed')) {
                errorMessage = 'Chat setup error. Booking saved successfully.';
            } else if (chatErr.message?.includes('collection')) {
                errorMessage = 'Chat service unavailable. Booking saved successfully.';
            } else if (chatErr.message?.includes('Circuit breaker is OPEN')) {
                errorMessage = 'Service temporarily unavailable. Booking saved, but chat failed.';
            }
            
            showToast(`${errorMessage} Please contact support.`, 'warning');
            setIsCreating(false);
            return;
        }

        // Background notifications omitted for brevity
        setIsCreating(false);
    };
}
