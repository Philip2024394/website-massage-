import { useState, useEffect, useRef } from 'react';
import { messagingService } from '../lib/appwriteService';
import { translationService } from '../lib/translationService';

interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    content?: string;
    message?: string;
    sentAt?: string;
    messageType?: 'text' | 'system' | 'booking';
    isRead: boolean;
}

interface ChatWindowProps {
    // Provider info
    providerId: string;
    providerRole: 'therapist' | 'place';
    providerName: string;
    providerPhoto?: string;
    providerStatus?: 'available' | 'busy' | 'offline';
    providerRating?: number;
    pricing?: { '60': number; '90': number; '120': number };
    discountPercentage?: number;
    discountActive?: boolean;
    
    // Booking details (for scheduled bookings)
    bookingId?: string;
    chatRoomId?: string;
    customerName?: string;
    customerWhatsApp?: string;
    
    // Booking mode
    mode?: 'immediate' | 'scheduled';
    
    // UI props
    isOpen: boolean;
    onClose: () => void;
}

/**
 * ChatWindow - Simple chat with registration flow
 * 
 * Flow:
 * 1. User clicks "Book Now" - Chat window opens with registration form
 * 2. User fills name, WhatsApp, selects duration (60/90/120 min)
 * 3. Clicks "Activate Chat" - Creates conversation and sends welcome message
 * 4. Chat becomes active - User can minimize but NOT close
 * 5. When therapist responds, minimized chat auto-expands
 */
export default function ChatWindow({
    providerId,
    providerRole,
    providerName,
    providerPhoto,
    providerStatus = 'available',
    providerRating,
    pricing = { '60': 200000, '90': 300000, '120': 400000 },
    discountPercentage,
    discountActive,
    bookingId,
    chatRoomId: initialChatRoomId,
    customerName: initialCustomerName,
    customerWhatsApp: initialCustomerWhatsApp,
    mode = 'immediate',
    isOpen,
    onClose
}: ChatWindowProps) {
    console.log('🟢 ChatWindow received status:', { providerName, providerStatus });
    
    // Registration state
    const [isRegistered, setIsRegistered] = useState(!!initialCustomerName && !!initialCustomerWhatsApp);
    const [customerName, setCustomerName] = useState(initialCustomerName || '');
    const [customerWhatsApp, setCustomerWhatsApp] = useState(initialCustomerWhatsApp || '');
    const [serviceDuration, setServiceDuration] = useState<'60' | '90' | '120'>('60');
    const [registering, setRegistering] = useState(false);
    
    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [chatRoomId, setChatRoomId] = useState(initialChatRoomId || '');
    const [customerId, setCustomerId] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    
    // Booking status tracking
    const [bookingStatus, setBookingStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
    const [pendingBookingId, setPendingBookingId] = useState<string>('');
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    
    // Scheduling state (for scheduled bookings)
    const [schedulingStep, setSchedulingStep] = useState<'duration' | 'time' | 'details'>('duration');
    const [selectedDuration, setSelectedDuration] = useState<60 | 90 | 120 | null>(null);
    const [selectedTime, setSelectedTime] = useState<{hour: number, minute: number, label: string} | null>(null);
    const [timeSlots, setTimeSlots] = useState<{hour: number, minute: number, label: string, available: boolean}[]>([]);
    const [roomNumber, setRoomNumber] = useState('');
    const [isCreatingBooking, setIsCreatingBooking] = useState(false);
    
    // Translation state
    const [userLanguage, setUserLanguage] = useState('en');
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Debug logging
    useEffect(() => {
        console.log('🪟 ChatWindow render state:', {
            isOpen,
            isRegistered,
            isMinimized,
            providerId,
            providerName,
            providerStatus,
            customerName,
            chatRoomId,
            messageCount: messages.length
        });
    }, [isOpen, isRegistered, isMinimized, providerId, providerName, providerStatus, customerName, chatRoomId, messages.length]);

    // Initialize audio notification
    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3');
    }, []);

    // Load messages after chat activation or when chat room is available
    useEffect(() => {
        if (!chatRoomId || !isRegistered) return;

        // Auto-set customer ID for scheduled bookings
        if (bookingId && !customerId) {
            const guestId = 'guest_' + bookingId;
            setCustomerId(guestId);
        }

        loadMessages();
        
        // Poll for new messages every 3 seconds
        const interval = setInterval(loadMessages, 3000);
        
        return () => clearInterval(interval);
    }, [chatRoomId, isRegistered, bookingId, customerId]);


    // Auto-expand when new message arrives (only from therapist)
    useEffect(() => {
        if (messages.length > lastMessageCount && messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            
            // If message is from therapist (not from customer), expand chat
            if (latestMessage.senderId !== customerId && isMinimized && isRegistered) {
                console.log('📬 New message from therapist - expanding chat');
                setIsMinimized(false);
                audioRef.current?.play().catch(() => {});
            }
            
            setLastMessageCount(messages.length);
        }
    }, [messages, lastMessageCount, customerId, isMinimized, isRegistered]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Listen for scheduled booking events
    useEffect(() => {
        const handleScheduledBooking = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { bookingId, therapistId, therapistName } = customEvent.detail;
            
            // Check if this booking is for the current therapist
            if (therapistId === providerId && therapistName === providerName) {
                console.log('📅 Scheduled booking created for this chat:', { bookingId, therapistId });
                
                setBookingStatus('pending');
                setPendingBookingId(bookingId);
                setWaitingForResponse(true);
                
                // Ensure chat stays open and registered (can minimize but not close)
                setIsRegistered(true);
            }
        };

        const handleBookingResponse = (event: Event) => {
            const customEvent = event as CustomEvent;
            const { bookingId, status } = customEvent.detail;
            
            // Check if this is for our pending booking
            if (bookingId === pendingBookingId) {
                console.log('🎯 Booking response received:', { bookingId, status });
                
                setBookingStatus(status === 'accepted' ? 'accepted' : 'rejected');
                setWaitingForResponse(false);
                
                // Clear the pending booking lock from sessionStorage
                const pendingBooking = sessionStorage.getItem('pending_booking');
                if (pendingBooking) {
                    const parsed = JSON.parse(pendingBooking);
                    if (parsed.bookingId === bookingId) {
                        sessionStorage.removeItem('pending_booking');
                        console.log('🔓 Pending booking lock cleared from sessionStorage');
                    }
                }
                
                // Auto-expand chat when therapist responds
                if (isMinimized) {
                    setIsMinimized(false);
                    audioRef.current?.play().catch(() => {});
                }
            }
        };

        // Listen for custom events
        window.addEventListener('scheduledBookingCreated', handleScheduledBooking as EventListener);
        window.addEventListener('bookingResponseReceived', handleBookingResponse as EventListener);
        
        return () => {
            window.removeEventListener('scheduledBookingCreated', handleScheduledBooking as EventListener);
            window.removeEventListener('bookingResponseReceived', handleBookingResponse as EventListener);
        };
    }, [providerId, providerName, pendingBookingId, isMinimized]);

    // Generate time slots for scheduling
    const generateTimeSlots = async () => {
        const slots = [];
        const today = new Date();
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        
        // Generate slots from 8 AM to 9 PM
        for (let hour = 8; hour <= 21; hour++) {
            for (let minute = 0; minute <= 45; minute += 15) {
                // Skip past times
                if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
                    continue;
                }
                
                slots.push({
                    hour,
                    minute,
                    label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
                    available: true // Simplified - could check against existing bookings
                });
            }
        }
        
        setTimeSlots(slots);
    };

    const loadMessages = async () => {
        try {
            console.log('📥 Loading messages for conversation:', chatRoomId);
            const msgs = await messagingService.getConversation(chatRoomId);
            setMessages(msgs as Message[]);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleCreateScheduledBooking = async () => {
        if (!selectedDuration || !selectedTime || !customerName.trim() || !customerWhatsApp.trim()) {
            alert('Please fill in all fields');
            return;
        }

        // Validate WhatsApp number (expecting format after +62)
        const cleanNumber = customerWhatsApp.replace(/[^\d]/g, '');
        if (cleanNumber.length < 8 || cleanNumber.length > 13) {
            alert('Please enter a valid WhatsApp number (8-13 digits after +62)');
            return;
        }
        // Remove leading 0 if present and format with +62
        const formattedWhatsApp = '+62' + cleanNumber.replace(/^0/, '');

        setIsCreatingBooking(true);

        try {
            const { databases, ID, Query } = await import('../lib/appwrite');
            const { APPWRITE_CONFIG } = await import('../lib/appwrite.config');
            const { createChatRoom, sendSystemMessage } = await import('../lib/chatService');

            // Check for existing pending bookings
            const existingBookings = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings || 'bookings',
                [
                    Query.equal('customerWhatsApp', formattedWhatsApp),
                    Query.equal('status', 'Pending'),
                ]
            );

            if (existingBookings.documents.length > 0) {
                const existing = existingBookings.documents[0];
                alert(`You have a pending booking with ${existing.providerName || 'a provider'}. Please wait for their response.`);
                setIsCreatingBooking(false);
                return;
            }

            // Create scheduled booking
            const scheduledTime = new Date();
            scheduledTime.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
            
            const responseDeadline = new Date(Date.now() + 15 * 60 * 1000);
            const numericBookingId = Date.now(); // Use numeric ID for chat room
            const bookingId = `booking_${numericBookingId}`; // String ID for booking document
            const finalPrice = pricing[selectedDuration.toString() as keyof typeof pricing] || 250000;

            const bookingData = {
                bookingId: bookingId,
                bookingDate: new Date().toISOString(),
                status: 'Pending',
                duration: selectedDuration,
                providerId: providerId,
                providerType: providerRole,
                providerName: providerName,
                service: selectedDuration.toString(),
                startTime: scheduledTime.toISOString(),
                price: Math.round(finalPrice / 1000),
                createdAt: new Date().toISOString(),
                responseDeadline: responseDeadline.toISOString(),
                totalCost: finalPrice,
                paymentMethod: 'Unpaid',
                scheduledTime: scheduledTime.toISOString(),
                customerName: customerName,
                customerWhatsApp: customerWhatsApp,
                bookingType: 'scheduled',
                message: `Scheduled ${selectedDuration} minute massage session for ${customerName}`, // Added required message field
            };

            // Use the appwriteService bookingService which handles collection issues
            console.log('📝 Creating booking using appwriteService...');
            
            const { bookingService: appwriteBookingService } = await import('../lib/appwriteService');
            
            const bookingResponse = await appwriteBookingService.create({
                providerId: providerId,
                providerType: providerRole,
                providerName: providerName,
                userName: customerName,
                service: selectedDuration.toString() as '60' | '90' | '120',
                startTime: scheduledTime.toISOString(),
                duration: selectedDuration,
                totalCost: finalPrice,
                paymentMethod: 'Unpaid'
            });
            
            console.log('✅ Booking created successfully:', bookingResponse.$id);

            // Create chat room using the chat service
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);
            
            const chatRoom = await createChatRoom({
                bookingId: numericBookingId,
                customerId: 'guest',
                customerName: customerName,
                customerLanguage: 'en',
                customerPhoto: '',
                therapistId: parseInt(providerId) || 0,
                therapistName: providerName,
                therapistLanguage: 'id',
                therapistType: providerRole,
                therapistPhoto: providerPhoto || '',
                expiresAt: expiresAt.toISOString()
            });

            setChatRoomId(chatRoom.$id || '');
            setCustomerId('guest_' + bookingResponse.$id);
            console.log('✅ Chat room created successfully');

            // Send system message
            const bookingDate = scheduledTime.toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            const message = `🎯 NEW SCHEDULED BOOKING

👤 Customer: ${customerName}
📱 WhatsApp: ${formattedWhatsApp}
📅 Date: ${bookingDate}
⏰ Time: ${selectedTime.label}
⏱️ Duration: ${selectedDuration} minutes
💰 Price: IDR ${Math.round(finalPrice / 1000)}K
📝 Booking ID: ${bookingResponse.$id}

✅ Please confirm availability.

⏰ You have 15 minutes to respond.`;

            // Send system message
            await sendSystemMessage(chatRoom.$id || '', {
                en: message,
                id: message // Use same message for both languages for now
            });
            console.log('✅ System message sent successfully');

            // Clear form fields
            setCustomerName('');
            setCustomerWhatsApp('');
            setSelectedDuration(null);
            setSelectedTime(null);
            
            // Update UI state
            setIsRegistered(true);
            setBookingStatus('pending');
            setPendingBookingId(bookingResponse.$id);
            setWaitingForResponse(true);
            
            // Store booking lock
            const deadline = new Date();
            deadline.setMinutes(deadline.getMinutes() + 15);
            sessionStorage.setItem('pending_booking', JSON.stringify({
                bookingId: bookingResponse.$id,
                therapistId: providerId,
                therapistName: providerName,
                customerWhatsApp: formattedWhatsApp,
                deadline: deadline.toISOString(),
                type: 'scheduled'
            }));

            loadMessages();

        } catch (error) {
            console.error('Error creating scheduled booking:', error);
            
            // Provide more specific error information
            let errorMessage = 'Failed to create booking. ';
            if (error instanceof Error) {
                if (error.message.includes('Collection') || error.message.includes('collection')) {
                    errorMessage += 'Database configuration issue - please contact support.';
                } else if (error.message.includes('unauthorized') || error.message.includes('permission')) {
                    errorMessage += 'Authentication issue - please contact support.';
                } else {
                    errorMessage += `Error: ${error.message}`;
                }
            } else {
                errorMessage += 'Please check your connection and try again.';
            }
            
            alert(errorMessage);
        } finally {
            setIsCreatingBooking(false);
        }
    };

    const handleActivateChat = async () => {
        if (!customerName.trim() || !customerWhatsApp.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setRegistering(true);

        try {
            console.log('🎯 Activating chat with:', { 
                customerName, 
                customerWhatsApp, 
                serviceDuration,
                providerId, 
                providerName,
                pricing
            });
            
            // Use actual therapist pricing
            const basePrice = pricing[serviceDuration];
            
            // Generate customer ID and conversation ID
            const guestId = 'guest_' + Date.now();
            setCustomerId(guestId);

            // Generate conversation ID using messagingService method
            const conversationId = messagingService.generateConversationId(
                { id: guestId, role: 'user' },
                { id: providerId, role: providerRole }
            );
            
            console.log('✅ Conversation ID generated:', conversationId);
            console.log('💰 Service details:', { 
                duration: serviceDuration, 
                price: basePrice
            });
            setChatRoomId(conversationId);

            // Send welcome system message with service details
            const statusText = providerStatus === 'available' ? 'Available' : 
                              providerStatus === 'busy' ? 'Busy' : 
                              providerStatus === 'offline' ? 'Offline' : 'Available';
            
            console.log('📝 Creating welcome message with status:', providerStatus, '→', statusText);
            const discounted = discountActive && discountPercentage && discountPercentage > 0
                ? Math.max(0, Math.round(basePrice * (1 - discountPercentage / 100)))
                : null;
            const priceText = discounted
                ? `Rp ${basePrice.toLocaleString()} → Rp ${discounted.toLocaleString()} (${discountPercentage}% OFF)`
                : `Rp ${basePrice.toLocaleString()}`;
            const welcomeMsg = `Chat activated! You've selected ${serviceDuration} min massage (${priceText}). ${providerName} is currently ${statusText}. Type your message below...`;
            
            // Send as first message in conversation with service metadata
            await messagingService.sendMessage({
                conversationId: conversationId,
                senderId: 'system',
                senderType: 'user',
                senderName: 'System',
                receiverId: guestId,
                receiverType: 'user',
                receiverName: customerName.trim(),
                content: welcomeMsg,
                bookingId: `lead_${serviceDuration}min_${basePrice}`
            });

            // If discount is active, send an explicit lock confirmation message
            if (discountActive && discountPercentage && discountPercentage > 0) {
                const lockedPrice = Math.max(0, Math.round(basePrice * (1 - discountPercentage / 100)));
                const lockMsg = `Offer confirmed and locked: ${discountPercentage}% OFF for ${serviceDuration} min. Locked price: Rp ${lockedPrice.toLocaleString()}. This discount was active at booking time and remains valid for this booking.`;
                await messagingService.sendMessage({
                    conversationId: conversationId,
                    senderId: 'system',
                    senderType: 'user',
                    senderName: 'System',
                    receiverId: guestId,
                    receiverType: 'user',
                    receiverName: customerName.trim(),
                    content: lockMsg,
                    bookingId: `lead_${serviceDuration}min_${basePrice}`
                });

                // Admin copy of lock confirmation
                try {
                    const adminConversationId = messagingService.generateConversationId(
                        { id: guestId, role: 'user' },
                        { id: 'admin', role: 'admin' }
                    );
                    await messagingService.sendMessage({
                        conversationId: adminConversationId,
                        senderId: 'system',
                        senderType: 'user',
                        senderName: 'System',
                        receiverId: 'admin',
                        receiverType: 'user',
                        receiverName: 'Admin',
                        content: `[COPY] ${lockMsg}`,
                        bookingId: `lead_${serviceDuration}min_${basePrice}`
                    });
                } catch (copyErr) {
                    console.warn('⚠️ Failed to send admin copy of lock confirmation:', copyErr);
                }
            }

            // Send a copy to admin monitoring conversation
            try {
                const adminConversationId = messagingService.generateConversationId(
                    { id: guestId, role: 'user' },
                    { id: 'admin', role: 'admin' }
                );
                await messagingService.sendMessage({
                    conversationId: adminConversationId,
                    senderId: 'system',
                    senderType: 'user',
                    senderName: 'System',
                    receiverId: 'admin',
                    receiverType: 'user',
                    receiverName: 'Admin',
                    content: `[COPY] ${welcomeMsg}`,
                    bookingId: `lead_${serviceDuration}min_${basePrice}`
                });
            } catch (copyErr) {
                console.warn('⚠️ Failed to send admin copy of welcome:', copyErr);
            }

            // Mark as registered
            setIsRegistered(true);
            setLastMessageCount(1); // Start with welcome message
            console.log('✅ Chat activated successfully with service:', serviceDuration);

        } catch (error) {
            console.error('❌ Error activating chat:', error);
            console.error('Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                providerId,
                providerRole,
                serviceDuration,
                customerName: customerName.trim(),
                customerWhatsApp: customerWhatsApp.trim()
            });
            alert('Failed to activate chat. Please try again.');
        } finally {
            setRegistering(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending || !chatRoomId) return;

        setSending(true);

        try {
            // Translate message to Indonesian (member's language) before sending
            let messageContent = newMessage.trim();
            if (userLanguage !== 'id') {
                const translated = await translationService.translate(messageContent, 'id', userLanguage);
                console.log('🌐 Message translated:', { original: messageContent, translated: translated.translatedText });
                messageContent = translated.translatedText;
            }

            await messagingService.sendMessage({
                conversationId: chatRoomId,
                senderId: customerId,
                senderType: 'user',
                senderName: customerName,
                receiverId: providerId,
                receiverType: providerRole,
                receiverName: providerName,
                content: messageContent,
                originalContent: newMessage.trim(),
                originalLanguage: userLanguage
            } as any);

            // Send admin copy to admin conversation
            try {
                const adminConversationId = messagingService.generateConversationId(
                    { id: customerId, role: 'user' },
                    { id: 'admin', role: 'admin' }
                );
                await messagingService.sendMessage({
                    conversationId: adminConversationId,
                    senderId: customerId,
                    senderType: 'user',
                    senderName: customerName,
                    receiverId: 'admin',
                    receiverType: 'user',
                    receiverName: 'Admin',
                    content: `[COPY] ${newMessage.trim()}`,
                    bookingId: undefined
                });
            } catch (copyErr) {
                console.warn('⚠️ Failed to send admin copy of message:', copyErr);
            }

            setNewMessage('');
            await loadMessages();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const getStatusBadgeColor = () => {
        switch (providerStatus) {
            case 'available': return 'bg-green-400';
            case 'busy': return 'bg-yellow-400';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = () => {
        const statusMap: Record<string, string> = {
            'available': 'Available',
            'busy': 'Busy',
            'offline': 'Offline'
        };
        const result = statusMap[providerStatus] || 'Available';
        console.log('🎯 getStatusText:', providerStatus, '→', result);
        return result;
    };

    const handleClose = () => {
        // Can only close if NOT registered AND no pending booking (still in registration screen)
        if (!isRegistered && bookingStatus === 'none') {
            onClose();
        } else {
            // Once chat is active OR has pending booking, can only minimize
            setIsMinimized(true);
        }
    };

    if (!isOpen) return null;

    // MINIMIZED VIEW (only show when registered and minimized)
    if (isMinimized && isRegistered) {
        return (
            <div 
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-2xl cursor-pointer hover:shadow-xl transition-all z-50 flex items-center space-x-2 sm:space-x-3"
            >
                <div className="relative">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">
                        {providerName.charAt(0).toUpperCase()}
                    </div>
                    {messages.length > lastMessageCount && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold">{providerName}</span>
                        {typeof providerRating === 'number' && providerRating > 0 && (
                            <span className="text-yellow-300 text-xs font-bold flex items-center">
                                ★ {providerRating.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="text-xs text-white/80">
                        {bookingStatus === 'pending' ? '⏳ Waiting for response...' : 
                         bookingStatus === 'accepted' ? '✅ Booking accepted' :
                         bookingStatus === 'rejected' ? '❌ Booking declined' :
                         'Click to expand'}
                    </div>
                </div>
            </div>
        );
    }

    // Helper: compute price label with optional discount
    const getPriceLabel = (duration: '60'|'90'|'120') => {
        const base = pricing[duration];
        const hasDiscount = !!discountActive && !!discountPercentage && discountPercentage > 0;
        if (!hasDiscount) {
            return `Rp ${base.toLocaleString()}`;
        }
        const discounted = Math.max(0, Math.round(base * (1 - (discountPercentage as number) / 100)));
        return `Rp ${base.toLocaleString()} → Rp ${discounted.toLocaleString()}`;
    };

    // REGISTRATION SCREEN
    if (!isRegistered) {
        return (
            <div className="fixed bottom-2 right-2 left-2 sm:left-auto sm:right-4 sm:bottom-4 w-auto sm:w-96 max-w-full bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
                {/* Header */}
                <div className="bg-orange-600 text-white px-3 py-2 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            {providerPhoto ? (
                                <img src={providerPhoto} alt={providerName} className="w-9 h-9 rounded-full object-cover" style={{border: 'none', boxShadow: 'none', outline: 'none'}} />
                            ) : (
                                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-bold" style={{border: 'none', boxShadow: 'none', outline: 'none'}}>
                                    {providerName?.charAt(0)?.toUpperCase() || 'M'}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col leading-tight">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{providerName}</span>
                                {typeof providerRating === 'number' && providerRating > 0 && (
                                    <span className="text-yellow-300 text-[10px] font-bold flex items-center">
                                        ★ {providerRating.toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs flex items-center gap-1">
                                <span className={`inline-block w-2 h-2 rounded-full relative ${providerStatus === 'available' ? 'bg-green-500' : providerStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-600'}`}>
                                    {(providerStatus === 'available' || providerStatus === 'busy') && (
                                        <span className={`absolute inset-0 rounded-full animate-ping ${
                                            providerStatus === 'available' ? 'bg-green-400' : 'bg-yellow-400'
                                        }`}></span>
                                    )}
                                </span>
                                {providerStatus === 'available' ? 'Online' : providerStatus === 'busy' ? 'Busy' : 'Offline'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full transition-colors flex items-center justify-center border border-white/20"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                        </svg>
                    </button>
                </div>

                {/* Booking Form - Immediate vs Scheduled */}
                <div className="p-4 space-y-4">
                    {mode === 'scheduled' ? (
                        // SCHEDULED BOOKING FLOW
                        <>
                            {schedulingStep === 'duration' && (
                                <>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3">📅 Schedule Your Massage</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Massage Duration
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[60, 90, 120].map((duration) => (
                                                <button
                                                    key={duration}
                                                    type="button"
                                                    onClick={() => setSelectedDuration(duration as 60 | 90 | 120)}
                                                    className={`p-3 rounded-lg border transition-all ${
                                                        selectedDuration === duration
                                                            ? 'border-green-500 bg-green-500 text-white shadow-sm'
                                                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <div className="font-bold">{duration} min</div>
                                                    <div className="text-xs mt-1">{getPriceLabel(duration.toString() as '60' | '90' | '120')}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (selectedDuration) {
                                                generateTimeSlots();
                                                setSchedulingStep('time');
                                            }
                                        }}
                                        disabled={!selectedDuration}
                                        className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next: Select Time
                                    </button>
                                </>
                            )}

                            {schedulingStep === 'time' && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">⏰ Select Time</h3>
                                        <button onClick={() => setSchedulingStep('duration')} className="text-orange-600 text-sm">← Back</button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                                        {timeSlots.map((slot, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedTime(slot)}
                                                disabled={!slot.available}
                                                className={`p-2 text-sm rounded border transition-all ${
                                                    selectedTime?.label === slot.label
                                                        ? 'border-green-500 bg-green-500 text-white'
                                                        : slot.available
                                                        ? 'bg-gray-100 border-gray-200 hover:bg-gray-200'
                                                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                            >
                                                {slot.label}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setSchedulingStep('details')}
                                        disabled={!selectedTime}
                                        className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next: Your Details
                                    </button>
                                </>
                            )}

                            {schedulingStep === 'details' && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">📝 Your Details</h3>
                                        <button onClick={() => setSchedulingStep('time')} className="text-orange-600 text-sm">← Back</button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Your Name *
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="Enter your name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                                disabled={isCreatingBooking}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                                WhatsApp Number *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-gray-500 z-10">+62</span>
                                                <input
                                                    id="whatsapp"
                                                    type="tel"
                                                    value={customerWhatsApp}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^\d]/g, '');
                                                        setCustomerWhatsApp(value);
                                                    }}
                                                    placeholder="8123456789"
                                                    className="w-full pl-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                                    maxLength={13}
                                                    disabled={isCreatingBooking}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h4 className="font-semibold text-sm text-gray-800 mb-1">Booking Summary:</h4>
                                        <p className="text-sm text-gray-600">📅 {selectedTime?.label} • ⏱️ {selectedDuration} min • 💰 {getPriceLabel((selectedDuration?.toString() || '60') as '60' | '90' | '120')}</p>
                                    </div>
                                    <button
                                        onClick={handleCreateScheduledBooking}
                                        disabled={isCreatingBooking || !customerName.trim() || !customerWhatsApp.trim()}
                                        className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {isCreatingBooking ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Creating Booking...</span>
                                            </div>
                                        ) : (
                                            'Create Booking & Start Chat'
                                        )}
                                    </button>
                                </>
                            )}
                        </>
                    ) : (
                        // IMMEDIATE BOOKING FLOW (Original)
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Your Language
                                </label>
                                <select
                                    value={userLanguage}
                                    onChange={(e) => setUserLanguage(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400 bg-white"
                                >
                                    {translationService.getSupportedLanguages().map(lang => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-2 text-xs text-gray-500">
                                    Messages will be translated automatically
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                        disabled={registering}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp Number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500 z-10">+62</span>
                                        <input
                                            id="whatsapp"
                                            type="tel"
                                            value={customerWhatsApp}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^\d]/g, '');
                                                setCustomerWhatsApp(value);
                                            }}
                                            placeholder="8123456789"
                                            className="w-full pl-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                            maxLength={13}
                                            disabled={registering}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Massage Duration
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['60', '90', '120'].map((duration) => (
                                            <button
                                                key={duration}
                                                type="button"
                                                onClick={() => setServiceDuration(duration as '60' | '90' | '120')}
                                                disabled={registering}
                                                className={`p-3 rounded-lg border transition-all ${
                                                    serviceDuration === duration
                                                        ? 'border-green-500 bg-green-500 text-white shadow-sm'
                                                        : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                                } ${registering ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="font-bold">{duration} min</div>
                                                <div className="text-xs mt-1">{getPriceLabel(duration as '60' | '90' | '120')}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleActivateChat}
                                disabled={registering || !customerName.trim() || !customerWhatsApp.trim()}
                                className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                            >
                                {registering ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Activating Chat...</span>
                                    </div>
                                ) : (
                                    'Activate Chat'
                                )}
                            </button>
                        </>
                    )}

                    <p className="text-xs text-center text-gray-500">
                        🔒 Your information is private and will only be shared with {providerName}
                    </p>
                </div>
            </div>
        );
    }

    // ACTIVE CHAT SCREEN
    return (
        <div className="fixed bottom-2 right-2 left-2 sm:left-auto sm:right-4 sm:bottom-4 w-auto sm:w-96 max-w-full h-[400px] sm:h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
            {/* Header */}
            <div className="bg-orange-600 text-white px-3 py-3 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        {providerPhoto ? (
                            <img src={providerPhoto} alt={providerName} className="w-11 h-11 rounded-full object-cover" style={{border: 'none', boxShadow: 'none', outline: 'none'}} />
                        ) : (
                            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center text-white font-bold" style={{border: 'none', boxShadow: 'none', outline: 'none'}}>
                                {providerName?.charAt(0)?.toUpperCase() || 'M'}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">{providerName}</span>
                            {typeof providerRating === 'number' && providerRating > 0 && (
                                <span className="text-yellow-300 text-[11px] font-bold flex items-center">
                                    ★ {providerRating.toFixed(1)}
                                </span>
                            )}
                        </div>
                        <span className="text-xs flex items-center gap-1">
                            <span className={`inline-block w-2 h-2 rounded-full relative ${providerStatus === 'available' ? 'bg-green-500' : providerStatus === 'busy' ? 'bg-yellow-500' : 'bg-red-600'}`}>
                                {(providerStatus === 'available' || providerStatus === 'busy') && (
                                    <span className={`absolute inset-0 rounded-full animate-ping ${
                                        providerStatus === 'available' ? 'bg-green-400' : 'bg-yellow-400'
                                    }`}></span>
                                )}
                            </span>
                            {providerStatus === 'available' ? 'Online' : providerStatus === 'busy' ? 'Busy' : 'Offline'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full transition-colors flex items-center justify-center border border-white/20"
                    title="Minimize"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 12h12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {/* Booking Status Banner */}
                {bookingStatus !== 'none' && (
                    <div className={`sticky top-0 z-10 rounded-lg p-3 text-center text-sm font-medium shadow-sm ${
                        bookingStatus === 'pending' 
                            ? 'bg-yellow-50 border-2 border-yellow-200 text-yellow-800'
                            : bookingStatus === 'accepted'
                            ? 'bg-green-50 border-2 border-green-200 text-green-800'
                            : 'bg-red-50 border-2 border-red-200 text-red-800'
                    }`}>
                        {bookingStatus === 'pending' && waitingForResponse && (
                            <div>
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <div className="animate-spin w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                                    <span>⏳ Waiting for {providerName} to respond to your booking...</span>
                                </div>
                                {/* TEST BUTTONS - Remove in production */}
                                <div className="flex gap-2 justify-center">
                                    <button 
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('bookingResponseReceived', {
                                                detail: { bookingId: pendingBookingId, status: 'accepted' }
                                            }));
                                        }}
                                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                                    >
                                        [TEST] Accept
                                    </button>
                                    <button 
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('bookingResponseReceived', {
                                                detail: { bookingId: pendingBookingId, status: 'rejected' }
                                            }));
                                        }}
                                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                                    >
                                        [TEST] Reject
                                    </button>
                                </div>
                            </div>
                        )}
                        {bookingStatus === 'accepted' && (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>✅ {providerName} accepted your booking! You can now chat freely.</span>
                            </div>
                        )}
                        {bookingStatus === 'rejected' && (
                            <div className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>❌ {providerName} declined your booking. Please try another time or provider.</span>
                            </div>
                        )}
                    </div>
                )}
                
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="font-medium">Chat with {providerName}</p>
                        <p className="text-xs mt-1">
                            {bookingStatus === 'pending' ? 'Your booking has been sent. Waiting for response...' : 'Type your message below'}
                        </p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isOwnMessage = msg.senderId === customerId;
                        const isSystemMessage = msg.senderId === 'system';

                        return (
                            <div
                                key={msg.$id}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] ${
                                    isSystemMessage 
                                        ? 'bg-blue-50 border border-blue-200 text-blue-800 text-center w-full' 
                                        : isOwnMessage
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-white border border-gray-200 text-gray-900'
                                } rounded-lg px-4 py-2 shadow-sm`}>
                                    {!isSystemMessage && (
                                        <div className="text-xs font-semibold mb-1 opacity-70">
                                            {msg.senderName}
                                        </div>
                                    )}
                                    <div className="text-sm whitespace-pre-wrap break-words">
                                        {msg.message || msg.content}
                                    </div>
                                    <div className={`text-xs mt-1 ${
                                        isSystemMessage ? 'text-blue-600' :
                                        isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                                    }`}>
                                        {formatTime(msg.sentAt || msg.$createdAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
                {waitingForResponse && bookingStatus === 'pending' ? (
                    <div className="text-center text-gray-500 py-2">
                        <div className="flex items-center justify-center gap-2 text-sm">
                            <div className="animate-spin w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full"></div>
                            <span>Chat will be enabled after {providerName} accepts your booking</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={bookingStatus === 'rejected' ? 'Booking was declined...' : 'Type your message...'}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                            disabled={sending || bookingStatus === 'rejected'}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || sending || bookingStatus === 'rejected'}
                            className="bg-orange-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                            {sending ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
