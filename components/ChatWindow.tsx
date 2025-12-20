import { useState, useEffect, useRef } from 'react';
import { messagingService } from '../lib/appwriteService';
import { translationService } from '../lib/translationService';
import { useLanguageContext } from '../context/LanguageContext';
import { chatTranslationService } from '../services/chatTranslationService';
import { commissionTrackingService } from '../lib/services/commissionTrackingService';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { detectPhoneNumber, getBlockedMessage } from '../utils/phoneBlocker';

// Avatar options for customer profile
const AVATAR_OPTIONS = [
    { id: 1, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png', label: 'Avatar 1' },
    { id: 2, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%202.png', label: 'Avatar 2' },
    { id: 3, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%203.png', label: 'Avatar 3' },
    { id: 4, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%204.png', label: 'Avatar 4' },
    { id: 5, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%206.png', label: 'Avatar 6' },
    { id: 6, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%207.png', label: 'Avatar 7' },
    { id: 7, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%208.png', label: 'Avatar 8' },
    { id: 8, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%209.png', label: 'Avatar 9' },
    { id: 9, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2010.png', label: 'Avatar 10' },
    { id: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2011.png', label: 'Avatar 11' },
    { id: 11, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2012.png', label: 'Avatar 12' },
    { id: 12, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2013.png', label: 'Avatar 13' },
    { id: 13, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2014.png', label: 'Avatar 14' },
    { id: 14, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2015.png', label: 'Avatar 15' },
    { id: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/avatar%2016.png', label: 'Avatar 16' }
];

interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
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
    
    // Selected service from price menu
    selectedService?: {
        name: string;
        duration: string;
        price: number;
    };
    
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
    selectedService,
    isOpen,
    onClose
}: ChatWindowProps) {
    console.log('🟢 ChatWindow received status:', { providerName, providerStatus });
    console.log('🎯 ChatWindow received selectedService:', selectedService);
    
    // Get language context
    const { language } = useLanguageContext();
    const chatLang = language === 'gb' ? 'en' : language;
    
    // Combined translation object
    const t = {
        // From chatTranslationService
        activateChat: chatTranslationService.getTranslation('activate_chat', chatLang),
        sendMessage: chatTranslationService.getTranslation('send_message', chatLang),
        closeChat: chatTranslationService.getTranslation('close_chat', chatLang),
        chatWith: chatTranslationService.getTranslation('chat_with', chatLang),
        typeMessage: language === 'id' ? 'Ketik pesan...' : 'Type a message...',
        connectionFailed: chatTranslationService.getTranslation('connection_failed', chatLang),
        welcomeMessage: chatTranslationService.getTranslation('welcome_message', chatLang),
        nameRequired: chatTranslationService.getTranslation('name_required', chatLang),
        whatsappRequired: chatTranslationService.getTranslation('whatsapp_required', chatLang),
        durationRequired: chatTranslationService.getTranslation('duration_required', chatLang),
        
        // Additional scheduling translations
        scheduleYourMassage: language === 'id' ? 'Jadwalkan Pijat Anda' : 'Schedule Your Massage',
        selectDuration: language === 'id' ? 'Pilih Durasi Pijatan' : 'Select Massage Duration',
        nextSelectTime: language === 'id' ? 'Selanjutnya: Pilih Waktu' : 'Next: Select Time',
        selectTime: language === 'id' ? 'Pilih Waktu' : 'Select Time',
        back: language === 'id' ? '← Kembali' : '← Back',
        nextEnterDetails: language === 'id' ? 'Selanjutnya: Masukkan Detail' : 'Next: Enter Details',
        customerDetails: language === 'id' ? 'Detail Pelanggan' : 'Customer Details',
        yourName: language === 'id' ? 'Nama Anda' : 'Your Name',
        whatsappNumber: language === 'id' ? 'Nomor WhatsApp' : 'WhatsApp Number',
        confirmBooking: language === 'id' ? 'Konfirmasi Booking' : 'Confirm Booking',
        bookingConfirmed: language === 'id' ? '✅ Booking Dikonfirmasi!' : '✅ Booking Confirmed!',
        bookingSummary: language === 'id' ? 'Ringkasan Booking:' : 'Booking Summary:',
        depositNotice: language === 'id' ? '30% Deposit booking mungkin diminta' : '30% Booking deposit may be requested',
        therapist: language === 'id' ? 'Terapis:' : 'Therapist:',
        time: language === 'id' ? 'Waktu:' : 'Time:',
        duration: language === 'id' ? 'Durasi:' : 'Duration:',
        totalCost: language === 'id' ? 'Total Biaya:' : 'Total Cost:',
        closeWindow: language === 'id' ? 'Tutup Jendela' : 'Close Window',
        minutes: language === 'id' ? 'menit' : 'minutes',
        pleaseEnterName: language === 'id' ? 'Mohon masukkan nama Anda' : 'Please enter your name',
        pleaseEnterValidWhatsApp: language === 'id' ? 'Mohon masukkan nomor WhatsApp yang valid (contoh: +6281234567890 atau 081234567890)' : 'Please enter a valid WhatsApp number (e.g., +6281234567890 or 081234567890)',
        bookNow: language === 'id' ? 'Booking Sekarang' : 'Book Now',
        send: language === 'id' ? 'Kirim' : 'Send',
        online: language === 'id' ? 'Online' : 'Online',
        offline: language === 'id' ? 'Offline' : 'Offline'
    };
    
    // Registration state
    const [isRegistered, setIsRegistered] = useState(!!initialCustomerName && !!initialCustomerWhatsApp);
    const [customerName, setCustomerName] = useState(initialCustomerName || '');
    const [customerWhatsApp, setCustomerWhatsApp] = useState(initialCustomerWhatsApp || '');
    const [customerLocation, setCustomerLocation] = useState('');
    const [customerCoordinates, setCustomerCoordinates] = useState<{lat: number, lng: number} | null>(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [serviceDuration, setServiceDuration] = useState<'60' | '90' | '120'>(
        selectedService?.duration as '60' | '90' | '120' || '60'
    );
    const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0].imageUrl);
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
    
    // Language now comes from global context only
    
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

    // Language managed globally through context

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

        
        const slots: {hour: number, minute: number, label: string, available: boolean}[] = [];
        const today = new Date();
        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();
        

        
        // Helper function to parse time string (e.g., "08:00" -> 8)
        const parseTimeString = (timeStr: string): number => {
            if (!timeStr) return 0;
            const [hours] = timeStr.split(':');
            return parseInt(hours) || 0;
        };
        
        // Determine time range based on provider type
        let startHour = 6; // Default early start
        let endHour = 23;  // Default late end
        let isPlace = false;
        
        if (providerRole === 'therapist') {
            // Therapists: Extended hours (6 AM to 11 PM for practical booking)
            startHour = 6;
            endHour = 23;
        } else if (providerRole === 'place') {
            // Massage places and facial places: Use business hours or defaults
            isPlace = true;
            // TODO: Fetch actual place data to get openingTime/closingTime
            // For now use default business hours
            startHour = 8;  // Default 8 AM opening
            endHour = 21;   // Default 9 PM closing
        }
        

        
        // Check if place is closed for today
        const placeClosedToday = isPlace && currentHour >= endHour;
        
        // Generate slots for today (if not closed) or tomorrow
        const generateSlotsForDay = (isNextDay: boolean = false) => {

            
            for (let hour = startHour; hour <= endHour; hour++) {
                for (let minute = 0; minute <= 45; minute += 15) {
                    // Skip past times for today only
                    if (!isNextDay && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
                        continue;
                    }
                    
                    const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                    const displayLabel = isNextDay ? `${timeLabel} (Next Day)` : timeLabel;
                    
                    slots.push({
                        hour,
                        minute,
                        label: displayLabel,
                        available: true // Simplified - could check against existing bookings
                    });
                }
            }
        };
        
        if (placeClosedToday) {
            // Place is closed today, show tomorrow's schedule
            generateSlotsForDay(true);
        } else {
            // Show today's remaining slots
            generateSlotsForDay(false);
            
            // For places after midnight (00:00-05:59), also show next day options
            if (isPlace && currentHour < 6) {
                generateSlotsForDay(true);
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
        if (!customerName.trim() || !customerWhatsApp.trim() || !customerLocation.trim()) {
            alert(language === 'id' 
                ? 'Mohon lengkapi nama, WhatsApp, dan lokasi Anda' 
                : 'Please fill in your name, WhatsApp, and location');
            return;
        }

        setRegistering(true);

        try {
            console.log('🎯 Activating chat with:', { 
                customerName, 
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
            
            // Create location link if coordinates available
            const locationLink = customerCoordinates 
                ? `https://www.google.com/maps?q=${customerCoordinates.lat},${customerCoordinates.lng}`
                : null;
            
            const locationText = locationLink 
                ? `📍 Location: ${customerLocation}\n🗺️ View on map: ${locationLink}`
                : `📍 Location: ${customerLocation}`;
            
            // Pro members NEVER get WhatsApp - Plus members get full access
            const welcomeMsg = `Chat activated! You've selected ${serviceDuration} min massage (${priceText}). ${providerName} is currently ${statusText}.\n\n👤 Customer: ${customerName.trim()}\n${locationText}\n⏱️ Duration: ${serviceDuration} minutes\n\nType your message below...`;
            
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

            // Create commission record and send appropriate message to therapist
            try {
                // Fetch therapist data to check membership tier
                const collectionId = providerRole === 'therapist' 
                    ? APPWRITE_CONFIG.collections.therapists 
                    : APPWRITE_CONFIG.collections.facial_places;
                
                if (collectionId && providerId) {
                    const therapist = await databases.getDocument(
                        APPWRITE_CONFIG.databaseId,
                        collectionId,
                        providerId
                    );

                    // Check if therapist is on Pro plan (free tier with 30% commission)
                    // 'free' = Pro plan (30% commission, NO WhatsApp), 'plus' = Plus plan (0% commission, full access)
                    const membershipTier = (therapist as any).membershipTier || 'free';
                    
                    if (membershipTier === 'free') {
                        // PRO MEMBER: Create commission record + send message WITHOUT WhatsApp
                        const finalPrice = discountActive && discountPercentage && discountPercentage > 0
                            ? Math.max(0, Math.round(basePrice * (1 - discountPercentage / 100)))
                            : basePrice;
                        
                        const bookingId = conversationId + '_' + Date.now();
                        const bookingDate = new Date().toISOString();
                        
                        console.log('💰 Creating commission record for Pro member:', {
                            therapistId: providerId,
                            therapistName: providerName,
                            serviceAmount: finalPrice,
                            commissionRate: 30
                        });

                        await commissionTrackingService.createCommissionRecord(
                            providerId,
                            providerName,
                            bookingId,
                            bookingDate,
                            undefined, // scheduledDate (immediate booking)
                            finalPrice
                        );

                        console.log('✅ Commission record created successfully');
                        
                        // Send PRO member message (NO WhatsApp)
                        const proTherapistMsg = `🚨 NEW BOOKING REQUEST\n\n⏱️ YOU HAVE 5 MINUTES TO ACCEPT OR REJECT\n\n👤 Customer: ${customerName.trim()}\n${locationText}\n⏱️ Duration: ${serviceDuration} minutes\n💰 Price: ${priceText}\n\n⚠️ PRO MEMBER NOTICE:\n❌ WhatsApp contact NOT provided (Pro plan)\n✅ Communicate through in-app chat only\n\n⚠️ WARNING: Operating outside Indastreet platform will result in:\n• Immediate account deactivation\n• WhatsApp number permanently blocked\n• No refunds or appeals\n\n💡 Upgrade to Plus (Rp 250K/month) for:\n✓ Customer WhatsApp access\n✓ 0% commission\n✓ No payment deadlines\n✓ Premium features`;
                        
                        // Send to therapist
                        const therapistConversationId = messagingService.generateConversationId(
                            { id: 'system', role: 'system' },
                            { id: providerId, role: providerRole }
                        );
                        
                        await messagingService.sendMessage({
                            conversationId: therapistConversationId,
                            senderId: 'system',
                            senderType: 'user',
                            senderName: 'Indastreet Booking System',
                            receiverId: providerId,
                            receiverType: providerRole,
                            receiverName: providerName,
                            content: proTherapistMsg,
                            bookingId: bookingId
                        });
                    } else {
                        // PLUS MEMBER: No commission, send message WITH WhatsApp
                        console.log('ℹ️ Plus member - full access with WhatsApp');
                        
                        const plusTherapistMsg = `✨ NEW BOOKING (Plus Member)\n\n👤 Customer: ${customerName.trim()}\n📱 WhatsApp: ${customerWhatsApp.trim()}\n${locationText}\n⏱️ Duration: ${serviceDuration} minutes\n💰 Price: ${priceText}\n\n✅ Plus Member Benefits Active:\n✓ 0% commission\n✓ Direct WhatsApp access\n✓ No payment deadlines\n\nYou can contact the customer immediately!`;
                        
                        // Send to therapist
                        const therapistConversationId = messagingService.generateConversationId(
                            { id: 'system', role: 'system' },
                            { id: providerId, role: providerRole }
                        );
                        
                        await messagingService.sendMessage({
                            conversationId: therapistConversationId,
                            senderId: 'system',
                            senderType: 'user',
                            senderName: 'Indastreet Booking System',
                            receiverId: providerId,
                            receiverType: providerRole,
                            receiverName: providerName,
                            content: plusTherapistMsg,
                            bookingId: 'plus_' + Date.now()
                        });
                    }
                }
            } catch (commissionErr) {
                console.error('⚠️ Failed to create commission record:', commissionErr);
                // Don't block chat activation if commission creation fails
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
            // Check for phone numbers/WhatsApp in message
            const phoneCheck = detectPhoneNumber(newMessage.trim());
            if (phoneCheck.isBlocked) {
                setSending(false);
                alert(getBlockedMessage(chatLang));
                console.warn('🚫 Message blocked:', phoneCheck.detectedPattern);
                return;
            }

            // Translate message to Indonesian (member's language) before sending
            let messageContent = newMessage.trim();
            if (chatLang !== 'id') {
                const translated = await translationService.translate(messageContent, 'id', chatLang);
                console.log('🌐 Message translated:', { original: messageContent, translated: translated.translatedText });
                messageContent = translated.translatedText;
                
                // Double-check translated message for phone numbers (in case translation reveals numbers)
                const translatedCheck = detectPhoneNumber(messageContent);
                if (translatedCheck.isBlocked) {
                    setSending(false);
                    alert(getBlockedMessage(chatLang));
                    console.warn('🚫 Translated message blocked:', translatedCheck.detectedPattern);
                    return;
                }
            }

            await messagingService.sendMessage({
                conversationId: chatRoomId,
                senderId: customerId,
                senderType: 'user',
                senderName: customerName,
                senderAvatar: selectedAvatar,
                receiverId: providerId,
                receiverType: providerRole,
                receiverName: providerName,
                content: messageContent,
                originalContent: newMessage.trim(),
                originalLanguage: chatLang
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
        // Return JSX with strikethrough for original price
        return (
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-red-600 line-through font-normal">
                    Rp {base.toLocaleString()}
                </span>
                <span className="text-sm font-bold text-green-600">
                    Rp {discounted.toLocaleString()}
                </span>
            </div>
        );
    };

    // REGISTRATION SCREEN
    if (!isRegistered) {
        return (
            <div className={`fixed bottom-0 sm:bottom-4 left-0 sm:left-auto right-0 sm:right-4 w-full sm:w-96 max-w-full bg-white rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 max-h-[90vh] sm:max-h-[80vh] transform transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                {/* Header */}
                <div className="bg-orange-600 text-white px-4 py-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-shrink-0">
                            {providerPhoto ? (
                                <img 
                                    src={providerPhoto} 
                                    alt={providerName} 
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover aspect-square" 
                                    style={{
                                        border: '2px solid rgba(255,255,255,0.3)', 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
                                        outline: 'none'
                                    }} 
                                />
                            ) : (
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl aspect-square" 
                                     style={{
                                        border: '2px solid rgba(255,255,255,0.3)', 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
                                        outline: 'none'
                                     }}>
                                    {providerName?.charAt(0)?.toUpperCase() || 'M'}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="font-bold text-lg">{providerName}</span>
                            <span className="text-sm flex items-center gap-1 mt-1">
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
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="w-10 h-10 sm:w-8 sm:h-8 bg-black/40 hover:bg-black/60 rounded-full transition-colors flex items-center justify-center border border-white/20 touch-manipulation"
                            title="Close"
                            style={{ minWidth: '40px', minHeight: '40px' }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Booking Form - Immediate vs Scheduled */}
                <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto flex-1 min-h-0">
                    {mode === 'scheduled' ? (
                        // SCHEDULED BOOKING FLOW
                        <>
                            {schedulingStep === 'duration' && (
                                <>
                                    <div className="mb-4 pb-3 border-b border-gray-200">
                                        <h3 className="text-xl font-bold text-gray-800">📅 {t.scheduleYourMassage}</h3>
                                    </div>
                                    
                                    {/* Translation notice only shown when languages differ */}
                                    {chatLang !== 'id' && (
                                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="text-sm text-blue-700">
                                                💬 Messages will be translated automatically
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t.selectDuration}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[60, 90, 120].map((duration) => (
                                                <button
                                                    key={duration}
                                                    type="button"
                                                    onClick={() => setSelectedDuration(duration as 60 | 90 | 120)}
                                                    className={`p-3 rounded-lg border transition-all relative ${
                                                        selectedDuration === duration
                                                            ? 'border-green-500 bg-green-500 text-white shadow-sm'
                                                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <div className="text-xs">{duration} min</div>
                                                    <div className="font-bold mt-1">{getPriceLabel(duration.toString() as '60' | '90' | '120')}</div>
                                                    {/* Star Rating - Top Right */}
                                                    {typeof providerRating === 'number' && providerRating > 0 && (
                                                        <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                                            ★{providerRating.toFixed(1)}
                                                        </div>
                                                    )}
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
                                        {t.nextSelectTime}
                                    </button>
                                </>
                            )}

                            {schedulingStep === 'time' && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">⏰ {t.selectTime}</h3>
                                        <button onClick={() => setSchedulingStep('duration')} className="text-orange-600 text-sm">{t.back}</button>
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
                                        {t.nextEnterDetails}
                                    </button>
                                </>
                            )}

                            {schedulingStep === 'details' && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-lg font-bold text-gray-800">📝 {t.customerDetails}</h3>
                                        <button onClick={() => setSchedulingStep('time')} className="text-orange-600 text-sm">{t.back}</button>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t.yourName} *
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="Type Your Name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                                disabled={isCreatingBooking}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                                {t.whatsappNumber} *
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-black font-bold z-10">+62</span>
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

                                        {/* Avatar Selection for Scheduled Bookings */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {language === 'id' ? 'Pilih Avatar Anda' : 'Choose Your Avatar'}
                                            </label>
                                            <div className="grid grid-cols-5 gap-2">
                                                {AVATAR_OPTIONS.map((avatar) => (
                                                    <button
                                                        key={avatar.id}
                                                        type="button"
                                                        onClick={() => setSelectedAvatar(avatar.imageUrl)}
                                                        disabled={isCreatingBooking}
                                                        className={`relative transition-all hover:scale-105 focus:outline-none ${
                                                            isCreatingBooking ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        <img 
                                                            src={avatar.imageUrl} 
                                                            alt={avatar.label} 
                                                            className={`w-14 h-14 rounded-full object-cover ${
                                                                selectedAvatar === avatar.imageUrl
                                                                    ? 'ring-3 ring-orange-500 ring-offset-1 shadow-lg'
                                                                    : 'hover:ring-2 hover:ring-orange-300 hover:ring-offset-1'
                                                            }`}
                                                        />
                                                        {selectedAvatar === avatar.imageUrl && (
                                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <h4 className="font-semibold text-sm text-gray-800 mb-1">Booking Summary:</h4>
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-sm text-gray-600">📅 {selectedTime?.label} • ⏱️ {selectedDuration} min • 💰</p>
                                            <div className="inline-flex">{getPriceLabel((selectedDuration?.toString() || '60') as '60' | '90' | '120')}</div>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">{t.depositNotice}</p>
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
                            {/* Translation notice only shown when languages differ */}
                            {chatLang !== 'id' && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        💬 Messages will be translated automatically
                                    </p>
                                </div>
                            )}

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
                                        placeholder="Type Your Name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                        disabled={registering}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                                        WhatsApp Number
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-black font-bold z-10">+62</span>
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

                                {/* Location Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {language === 'id' ? 'Lokasi Anda' : 'Your Location'}
                                    </label>
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={customerLocation}
                                                onChange={(e) => setCustomerLocation(e.target.value)}
                                                placeholder={language === 'id' ? 'Masukkan alamat lengkap Anda' : 'Enter your full address'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                                                disabled={registering}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setGettingLocation(true);
                                                try {
                                                    if ('geolocation' in navigator) {
                                                        navigator.geolocation.getCurrentPosition(
                                                            async (position) => {
                                                                const { latitude, longitude } = position.coords;
                                                                setCustomerCoordinates({ lat: latitude, lng: longitude });
                                                                
                                                                // Reverse geocode to get address
                                                                try {
                                                                    const response = await fetch(
                                                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                                                                    );
                                                                    const data = await response.json();
                                                                    if (data.display_name) {
                                                                        setCustomerLocation(data.display_name);
                                                                    }
                                                                } catch (error) {
                                                                    console.error('Failed to get address:', error);
                                                                    setCustomerLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                                                                }
                                                                setGettingLocation(false);
                                                            },
                                                            (error) => {
                                                                console.error('Location error:', error);
                                                                alert(language === 'id' 
                                                                    ? 'Tidak dapat mengakses lokasi. Mohon masukkan alamat secara manual.' 
                                                                    : 'Cannot access location. Please enter address manually.');
                                                                setGettingLocation(false);
                                                            }
                                                        );
                                                    } else {
                                                        alert(language === 'id' 
                                                            ? 'Geolocation tidak didukung oleh browser Anda' 
                                                            : 'Geolocation is not supported by your browser');
                                                        setGettingLocation(false);
                                                    }
                                                } catch (error) {
                                                    console.error('Error getting location:', error);
                                                    setGettingLocation(false);
                                                }
                                            }}
                                            disabled={gettingLocation || registering}
                                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {gettingLocation ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>{language === 'id' ? 'Mendapatkan lokasi...' : 'Getting location...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>{language === 'id' ? 'Gunakan Lokasi Saya' : 'Use My Location'}</span>
                                                </>
                                            )}
                                        </button>
                                        {customerCoordinates && (
                                            <div className="text-xs text-green-600 flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {language === 'id' ? 'Lokasi terdeteksi' : 'Location detected'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Avatar Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {language === 'id' ? 'Pilih Avatar Anda' : 'Choose Your Avatar'}
                                    </label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {AVATAR_OPTIONS.map((avatar) => (
                                            <button
                                                key={avatar.id}
                                                type="button"
                                                onClick={() => setSelectedAvatar(avatar.imageUrl)}
                                                disabled={registering}
                                                className={`relative transition-all hover:scale-105 focus:outline-none ${
                                                    registering ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                <img 
                                                    src={avatar.imageUrl} 
                                                    alt={avatar.label} 
                                                    className={`w-14 h-14 rounded-full object-cover ${
                                                        selectedAvatar === avatar.imageUrl
                                                            ? 'ring-3 ring-orange-500 ring-offset-1 shadow-lg'
                                                            : 'hover:ring-2 hover:ring-orange-300 hover:ring-offset-1'
                                                    }`}
                                                />
                                                {selectedAvatar === avatar.imageUrl && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Selected Service or Duration Selection */}
                                {selectedService ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {language === 'id' ? 'Layanan Terpilih' : 'Selected Service'}
                                        </label>
                                        <div className="flex gap-2">
                                            {/* Change Service Button */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Close chat window
                                                    onClose();
                                                    // Open price menu modal for this therapist
                                                    setTimeout(() => {
                                                        window.dispatchEvent(new CustomEvent('openPriceMenu', {
                                                            detail: { therapistId: providerId }
                                                        }));
                                                    }, 100);
                                                }}
                                                className="flex-shrink-0 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm transition-all"
                                            >
                                                {language === 'id' ? 'Ubah' : 'Change'}
                                            </button>
                                            {/* Selected Service Container */}
                                            <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold text-gray-900">{selectedService.name}</div>
                                                    {typeof providerRating === 'number' && providerRating > 0 && (
                                                        <div className="text-yellow-400 text-sm font-bold">
                                                            ★{providerRating.toFixed(1)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {selectedService.duration} {language === 'id' ? 'menit' : 'minutes'} • Rp. {selectedService.price.toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {language === 'id' ? 'Pilih Durasi Pijatan' : 'Select Massage Duration'}
                                        </label>
                                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                            {['60', '90', '120'].map((duration) => (
                                                <button
                                                    key={duration}
                                                    type="button"
                                                    onClick={() => setServiceDuration(duration as '60' | '90' | '120')}
                                                    disabled={registering}
                                                    className={`p-3 sm:p-4 rounded-lg border transition-all relative touch-manipulation min-h-[64px] sm:min-h-[72px] ${
                                                        serviceDuration === duration
                                                            ? 'border-green-500 bg-green-500 text-white shadow-sm'
                                                            : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                                    } ${registering ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    style={{ minWidth: '80px', minHeight: '64px' }}
                                                >
                                                    {/* Star Rating - Top Right */}
                                                    {typeof providerRating === 'number' && providerRating > 0 && (
                                                        <div className="absolute top-1 right-1 text-yellow-400 text-xs font-bold">
                                                            ★{providerRating.toFixed(1)}
                                                        </div>
                                                    )}
                                                    <div className="text-xs">{duration} min</div>
                                                    <div className="font-bold mt-1">{getPriceLabel(duration as '60' | '90' | '120')}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleActivateChat}
                                disabled={registering || !customerName.trim() || !customerWhatsApp.trim() || !customerLocation.trim()}
                                className="w-full bg-orange-600 text-white py-3 sm:py-2 rounded-lg font-bold hover:bg-orange-700 active:bg-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg touch-manipulation"
                                style={{ minHeight: '48px' }}
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
        <div className={`fixed bottom-2 right-2 left-2 sm:left-auto sm:right-4 sm:bottom-4 w-auto sm:w-96 max-w-full h-[400px] sm:h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 transform transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
            {/* Header */}
            <div className="bg-orange-600 text-white px-4 py-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col leading-tight">
                        <span className="font-bold text-lg">{providerName}</span>
                        <span className="text-sm flex items-center gap-1 mt-1">
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
                <div className="flex items-center gap-2">
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
                                className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} items-end`}
                            >
                                {/* Avatar for provider messages */}
                                {!isOwnMessage && !isSystemMessage && (
                                    <img
                                        src={providerPhoto || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'}
                                        alt={msg.senderName}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                                    />
                                )}
                                
                                <div className={`max-w-[70%] ${
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
                                        {(msg.message || msg.content || '').split('\n').map((line, idx) => {
                                            // Make map links clickable
                                            if (line.includes('google.com/maps')) {
                                                const urlMatch = line.match(/(https:\/\/[^\s]+)/);
                                                if (urlMatch) {
                                                    const url = urlMatch[1];
                                                    const parts = line.split(url);
                                                    return (
                                                        <div key={idx}>
                                                            {parts[0]}
                                                            <a 
                                                                href={url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:text-blue-700 underline font-medium"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {language === 'id' ? 'Lihat di Peta' : 'View on Map'}
                                                            </a>
                                                            {parts[1]}
                                                        </div>
                                                    );
                                                }
                                            }
                                            return <div key={idx}>{line}</div>;
                                        })}
                                    </div>
                                    <div className={`text-xs mt-1 ${
                                        isSystemMessage ? 'text-blue-600' :
                                        isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                                    }`}>
                                        {formatTime(msg.sentAt || msg.$createdAt)}
                                    </div>
                                </div>

                                {/* Avatar for customer messages */}
                                {isOwnMessage && !isSystemMessage && (
                                    <img
                                        src={msg.senderAvatar || selectedAvatar}
                                        alt={customerName}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-orange-500 flex-shrink-0"
                                    />
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
                {bookingStatus === 'pending' || waitingForResponse ? (
                    /* Blocked state - Waiting for therapist to accept booking */
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 mb-1">🔒 Waiting for {providerName} to Accept</p>
                                <p className="text-sm text-gray-700">
                                    {waitingForResponse ? (
                                        <>
                                            Your booking request has been sent. Chat will be enabled once {providerName} accepts your booking.
                                            <br />
                                            <span className="text-xs text-orange-600 mt-1 inline-block">⏳ Please wait for response...</span>
                                        </>
                                    ) : (
                                        'Please send a booking request first to start chatting.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : bookingStatus === 'rejected' ? (
                    /* Rejected state */
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-red-900 mb-1">❌ Booking Declined</p>
                                <p className="text-sm text-red-700">
                                    {providerName} was unable to accept this booking. We are searching for an alternative therapist for you.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Enabled state - Can chat after booking accepted */
                    <>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                                disabled={sending}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || sending}
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
                        <p className="text-xs text-gray-500 mt-2 px-1">
                            Press Enter to send • Shift+Enter for new line
                        </p>
                        <p className="text-xs text-amber-600 mt-1 px-1">
                            ⚠️ Sharing phone numbers or WhatsApp is not allowed
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
