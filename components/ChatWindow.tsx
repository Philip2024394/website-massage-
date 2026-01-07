/**
 * Production-grade ChatWindow component for massage booking system
 * Implements complete chat-driven booking flow with enterprise security and UX
 * 
 * ARCHITECTURE:
 * - Client → Appwrite Functions → Database (secure backend operations)
 * - Guest user support with validation
 * - Real-time chat with proper state management
 * - Comprehensive error handling and fallbacks
 * 
 * FLOW:
 * 1. Chat Activation → System message: "Checking availability..."
 * 2. Service Confirmation → Display service card with Confirm/Cancel
 * 3. Search Timer → Countdown with auto-retry and Cancel option
 * 4. Therapist Found → Display therapist card with Accept/Decline
 * 5. User Confirmation → Accept therapist (not dispatched until accepted)
 * 6. Booking Confirmed → Active chat with therapist
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  BookingStatus, 
  BookingUIState, 
  ChatMessage, 
  TherapistMatch, 
  ServiceDuration,
  CreateBookingRequest,
  Booking
} from '../types/booking.types'
import { bookingService, BookingService } from '../services/booking.service'
import { useBookingSearch } from '../hooks/useBookingSearch'
import { 
  SystemMessage, 
  ServiceConfirmationCard, 
  TherapistCard, 
  SearchStatus, 
  BookingConfirmed 
} from './SystemMessage'
import { 
  captureLiveLocation, 
  saveBookingLocation, 
  updateBookingWithLocation, 
  updateChatRoomLocation,
  cancelBookingLocationDenied,
  scheduleLocationTimeout,
  formatAccuracy,
  isAccuracyAcceptable
} from '../lib/locationVerificationService'
import { sendSystemMessage } from '../lib/chatService'
import { databases, client } from '../lib/appwrite'
import { APPWRITE_CONFIG } from '../lib/appwrite.config'
import { 
  getSystemNotification, 
  getBannerClasses, 
  isUrgentStatus,
  getStatusLabel,
  SystemBanner,
  shouldSendPush,
  getTargetRole,
  getPushPriority
} from '../lib/systemNotificationMapper'
import { playBookingStatusSound } from '../lib/soundNotificationService'
import { 
  initializePushNotifications,
  enablePushNotifications,
  isTabVisible,
  triggerLocalNotification,
  isPushSupported,
  getPermissionState
} from '../lib/pushNotificationService'

interface ChatWindowProps {
  providerId: string
  providerName: string
  providerPhoto?: string
  providerStatus?: 'available' | 'busy' | 'offline'
  providerRating?: number
  providerLocation?: string // Location/city of the provider
  pricing: { '60': number; '90': number; '120': number }
  selectedService?: { duration: string }
  customerName?: string
  customerWhatsApp?: string
  bookingId?: string  // ✅ AUDIT FIX: Enables chat ↔ booking traceability
  chatRoomId?: string // ✅ NEW: Accept existing chat room from booking flow
  isOpen: boolean
  onClose: () => void
}

/**
 * Main ChatWindow component with production-grade booking flow
 */
export default function ChatWindow({
  providerId,
  providerName,
  providerPhoto,
  providerStatus = 'available',
  providerRating = 4.5,
  providerLocation,
  pricing,
  selectedService,
  customerName: initialCustomerName = '',
  customerWhatsApp: initialCustomerWhatsApp = '',
  bookingId,  // ✅ AUDIT FIX: Now receives bookingId from parent
  chatRoomId: existingChatRoomId, // ✅ NEW: Accept existing chat room
  isOpen,
  onClose
}: ChatWindowProps) {
  console.log('� ChatWindow COMPONENT MOUNTED/RENDERED');
  console.log('💬 Props received:', {
    providerId,
    providerName,
    bookingId,
    existingChatRoomId,
    isOpen
  });

  // ===== CORE STATE MANAGEMENT =====
  
  // User registration state
  const [isRegistered, setIsRegistered] = useState(!!initialCustomerName && !!initialCustomerWhatsApp)
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [customerWhatsApp, setCustomerWhatsApp] = useState(initialCustomerWhatsApp)
  const [customerLocation, setCustomerLocation] = useState('')
  const [customerCoordinates, setCustomerCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [serviceDuration, setServiceDuration] = useState<ServiceDuration>(
    (selectedService?.duration as ServiceDuration) || '60'
  )

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false) // Start expanded when opened from booking

  // Booking state - following your specified flow
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle')
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [currentTherapist, setCurrentTherapist] = useState<TherapistMatch | null>(null)
  const [showServiceConfirmation, setShowServiceConfirmation] = useState(false)
  const [showTherapistSelection, setShowTherapistSelection] = useState(false)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🔒 LOCATION VERIFICATION STATE
  const [requiresLocation, setRequiresLocation] = useState(false)
  const [locationVerified, setLocationVerified] = useState(false)
  const [sharingLocation, setSharingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  // Chat room ID state - use existing room if provided
  const [chatRoomId, setChatRoomId] = useState<string | null>(existingChatRoomId || null)
  const locationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 🎨 WELCOME BANNER STATE
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(() => {
    const dismissed = localStorage.getItem('welcomeBannerDismissed')
    return dismissed !== 'true'
  })

  // ⏱️ COUNTDOWN TIMER STATE (5 minutes = 300 seconds)
  const [countdownTime, setCountdownTime] = useState(300)

  // �‍⚕️ THERAPIST ACCEPTANCE STATE
  const [pendingTherapist, setPendingTherapist] = useState<TherapistMatch | null>(null)
  const [showAcceptanceBanner, setShowAcceptanceBanner] = useState(false)

  // �🔔 SYSTEM NOTIFICATION STATE
  const [bookingStatusState, setBookingStatusState] = useState<string>('pending')
  const [systemBanner, setSystemBanner] = useState<SystemBanner | null>(null)
  const [lastProcessedStatus, setLastProcessedStatus] = useState<string>('')
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null)

  // Refs for cleanup
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isActiveRef = useRef(true)

  // ===== INITIALIZE FROM EXISTING BOOKING =====
  /**
   * When chat opens with existing bookingId & chatRoomId (after booking creation),
   * set the state to 'active' so user doesn't see booking flow UI again
   */
  useEffect(() => {
    if (bookingId && existingChatRoomId && isOpen) {
      console.log('� ChatWindow INITIALIZATION useEffect TRIGGERED');
      console.log('🔄 Initializing chat with existing booking:', bookingId);
      console.log('   Chat Room ID:', existingChatRoomId);
      console.log('   isOpen:', isOpen);
      
      // Mark user as registered (hide registration form with name/WhatsApp/package)
      setIsRegistered(true);
      
      // Set customer info from props if available
      if (initialCustomerName) setCustomerName(initialCustomerName);
      if (initialCustomerWhatsApp) setCustomerWhatsApp(initialCustomerWhatsApp);
      
      // Set booking status to PENDING (show countdown timer and waiting UI)
      console.log('🔥 SETTING bookingStatus to PENDING');
      setBookingStatus('pending');
      
      // Don't show service confirmation or location prompts
      setShowServiceConfirmation(false);
      setRequiresLocation(false);
      setLocationVerified(true); // Mark location as verified since booking is already created
      
      // Set chat room ID
      setChatRoomId(existingChatRoomId);
      
      // Start countdown timer
      console.log('🔥 STARTING COUNTDOWN TIMER - 300 seconds');
      setCountdownTime(300); // 5 minutes
      
      console.log('✅ Chat initialized in PENDING mode - countdown timer should show');
      console.log('   Customer:', initialCustomerName, initialCustomerWhatsApp);
      console.log('   Timer: 5:00 minutes');
    } else {
      console.log('🔥 ChatWindow initialization SKIPPED:', {
        hasBookingId: !!bookingId,
        hasChatRoomId: !!existingChatRoomId,
        isOpen
      });
    }
  }, [bookingId, existingChatRoomId, isOpen, initialCustomerName, initialCustomerWhatsApp]);

  // ===== LOAD EXISTING BOOKING DATA =====
  /**
   * Fetch booking details when opening chat with existing bookingId
   * This populates currentBooking to show booking info banner
   */
  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId || currentBooking) return; // Skip if no bookingId or already loaded
      
      try {
        console.log('📥 Loading booking data:', bookingId);
        const bookingDoc = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          bookingId
        );
        
        // Map to Booking type
        const booking: Booking = {
          id: bookingDoc.$id,
          userId: bookingDoc.userId,
          status: bookingDoc.status,
          serviceDuration: bookingDoc.serviceDuration,
          price: bookingDoc.price,
          location: bookingDoc.location,
          therapistId: bookingDoc.therapistId || undefined,
          createdAt: bookingDoc.$createdAt,
          updatedAt: bookingDoc.$updatedAt
        };
        
        setCurrentBooking(booking);
        
        // Set serviceDuration if available for pricing display
        if (booking.serviceDuration) {
          setServiceDuration(booking.serviceDuration as ServiceDuration);
        }
        
        console.log('✅ Booking data loaded:', booking);
        console.log('✅ Service duration set:', booking.serviceDuration);
      } catch (error) {
        console.error('❌ Error loading booking:', error);
      }
    };
    
    loadBooking();
  }, [bookingId, currentBooking]);

  // ⏱️ COUNTDOWN TIMER EFFECT
  useEffect(() => {
    // Only run countdown when waiting for therapist (booking exists but not active)
    if ((currentBooking || chatRoomId) && bookingStatus !== 'active') {
      const timer = setInterval(() => {
        setCountdownTime((prev) => {
          const newTime = prev > 0 ? prev - 1 : 0;
          
          // When timer hits 0, trigger automatic therapist search
          if (newTime === 0 && prev === 1) {
            console.log('⏰ Timer expired - Searching for available therapists...');
            handleAutoSearchTherapist();
          }
          
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentBooking, chatRoomId, bookingStatus]);

  // Auto search for therapist when timer expires
  const handleAutoSearchTherapist = useCallback(async () => {
    if (!currentBooking || !customerCoordinates) return;
    
    console.log('🔍 Broadcasting booking to all available therapists...');
    setIsSearching(true);
    
    // Add system message about broadcasting to all therapists
    const broadcastMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      conversationId: currentBooking.id,
      senderType: 'system',
      content: 'No response received. Now broadcasting your booking to all available therapists...',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, broadcastMessage]);
    
    try {
      // Broadcast booking to all therapists
      const searchConfig = BookingService.createSearchConfig(
        serviceDuration,
        customerCoordinates
      );
      
      // This will trigger the booking search hook to find therapists
      // The search will send notifications to all available therapists
      console.log('📡 Search broadcast sent to all therapists');
      
      // Restart the search to find any available therapist
      resetSearch();
      
    } catch (error) {
      console.error('❌ Auto-search failed:', error);
      setError('Failed to broadcast booking. Please try again.');
    }
  }, [currentBooking, customerCoordinates, serviceDuration, resetSearch]);

  // ===== BOOKING SEARCH HOOK =====
  
  const searchConfig = currentBooking && customerCoordinates 
    ? BookingService.createSearchConfig(serviceDuration, customerCoordinates)
    : null

  const {
    isSearching,
    countdown,
    searchAttempt,
    cancelSearch,
    resetSearch
  } = useBookingSearch({
    bookingId: currentBooking?.id || null,
    searchConfig,
    onTherapistFound: handleTherapistFound,
    onSearchFailed: handleSearchFailed,
    onSearchCancelled: handleSearchCancelled
  })

  // ===== LOAD EXISTING MESSAGES =====
  /**
   * Load messages from database when chat room already exists
   */
  useEffect(() => {
    const loadExistingMessages = async () => {
      if (!existingChatRoomId || !isOpen) return;

      try {
        console.log('📥 Loading messages for chat room:', existingChatRoomId);
        
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.chatMessages,
          [
            `roomId="${existingChatRoomId}"`,
            `orderBy("$createdAt")`
          ]
        );

        const loadedMessages: ChatMessage[] = response.documents.map((doc: any) => ({
          id: doc.$id,
          conversationId: doc.roomId || existingChatRoomId,
          senderType: doc.senderType || 'system',
          content: doc.message || doc.translatedText || doc.originalText || doc.content || '',
          timestamp: doc.$createdAt
        }));

        setMessages(loadedMessages);
        console.log('✅ Loaded', loadedMessages.length, 'messages from database');
      } catch (error) {
        console.error('❌ Error loading messages:', error);
      }
    };

    loadExistingMessages();
  }, [existingChatRoomId, isOpen]);

  // ===== REAL-TIME MESSAGE SUBSCRIPTION =====
  /**
   * Subscribe to real-time updates for new messages
   */
  useEffect(() => {
    if (!existingChatRoomId || !isOpen) return;

    console.log('🔄 Setting up real-time subscription for chat room:', existingChatRoomId);

    const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatMessages}.documents`;
    
    const unsubscribe = client.subscribe(channel, (response: any) => {
      console.log('🔔 Real-time message update:', response);
      
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        const newMessage = response.payload;
        
        // Only add if it belongs to this chat room (check roomId attribute)
        if (newMessage.roomId === existingChatRoomId) {
          const chatMessage: ChatMessage = {
            id: newMessage.$id,
            conversationId: newMessage.roomId || existingChatRoomId,
            senderType: newMessage.senderType || 'system',
            content: newMessage.message || newMessage.translatedText || newMessage.originalText || newMessage.content || '',
            timestamp: newMessage.$createdAt
          };
          
          setMessages(prev => [...prev, chatMessage]);
          console.log('✅ Added new message via real-time subscription');
        }
      }
    });

    return () => {
      console.log('🧹 Cleaning up real-time subscription');
      unsubscribe();
    };
  }, [existingChatRoomId, isOpen]);

  // ===== BOOKING FLOW HANDLERS =====

  /**
   * 1. CHAT ACTIVATION - Start booking process
   */
  const handleStartBooking = useCallback(async () => {
    try {
      console.log('🚀 Starting booking process...')
      
      // Add initial system message
      const systemMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: 'temp',
        senderType: 'system',
        content: "We're checking availability for therapists near you…",
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, systemMessage])
      setShowServiceConfirmation(true)
      setIsMinimized(false)

    } catch (error) {
      console.error('❌ Failed to start booking:', error)
      setError('Failed to start booking process. Please try again.')
    }
  }, [])

  /**
   * 2. SERVICE CONFIRMATION - User confirms service details
   */
  const handleConfirmService = useCallback(async () => {
    if (!customerCoordinates || !customerLocation) {
      setError('Location is required to proceed')
      return
    }

    try {
      setLoading(true)
      console.log('✅ Confirming service details...')

      // Create booking request
      const bookingRequest: CreateBookingRequest = {
        userId: `guest_${Date.now()}`, // Guest user support
        serviceDuration,
        location: {
          address: customerLocation,
          coordinates: customerCoordinates
        },
        customerDetails: {
          name: customerName,
          whatsapp: customerWhatsApp
        }
      }

      // Create booking via secure API
      const booking = await bookingService.createBooking(bookingRequest)
      
      setCurrentBooking(booking)
      setBookingStatus('searching')
      setShowServiceConfirmation(false)

      // Add search system message
      const searchMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: booking.id,
        senderType: 'system',
        content: "Searching for available therapists near you…",
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, searchMessage])

    } catch (error) {
      console.error('❌ Service confirmation failed:', error)
      setError(error instanceof Error ? error.message : 'Failed to confirm service')
    } finally {
      setLoading(false)
    }
  }, [customerCoordinates, customerLocation, serviceDuration, customerName, customerWhatsApp])

  /**
   * 3. THERAPIST FOUND - Handle therapist match
   */
  function handleTherapistFound(therapist: TherapistMatch) {
    console.log('✅ Therapist found:', therapist.name)
    
    // Show acceptance banner with therapist details
    setPendingTherapist(therapist)
    setShowAcceptanceBanner(true)
    setCurrentTherapist(therapist)
    setBookingStatus('pending_accept')
    
    // Stop the countdown timer
    setCountdownTime(0)

    // Add therapist found system message
    const therapistMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      conversationId: currentBooking?.id || 'temp',
      senderType: 'system',
      content: `${therapist.name} has accepted your booking!`,
      timestamp: new Date().toISOString(),
      messageType: 'therapist_card',
      metadata: { therapist }
    }
    
    setMessages(prev => [...prev, therapistMessage])
  }

  /**
   * 4. USER CONFIRMATION - Accept therapist
   */
  const handleAcceptTherapist = useCallback(async () => {
    if (!currentBooking || !currentTherapist) return

    try {
      setLoading(true)
      console.log('✅ Accepting therapist:', currentTherapist.name)

      // Accept therapist via secure API
      const updatedBooking = await bookingService.acceptTherapist(
        currentBooking.id, 
        currentTherapist.id
      )

      setBookingStatus('active')
      setShowTherapistSelection(false)

      // Add confirmation system message
      const confirmationMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: currentBooking.id,
        senderType: 'system',
        content: `Your booking is confirmed. ${currentTherapist.name} will arrive within 1 hour or less.`,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, confirmationMessage])

    } catch (error) {
      console.error('❌ Therapist acceptance failed:', error)
      setError('Failed to accept therapist. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [currentBooking, currentTherapist])

  /**
   * 5. FIND ANOTHER THERAPIST - Reject and search again
   */
  const handleFindAnother = useCallback(() => {
    console.log('🔄 Finding another therapist...')
    
    setCurrentTherapist(null)
    setShowTherapistSelection(false)
    setBookingStatus('searching')

    // Restart search automatically
    resetSearch()
  }, [resetSearch])

  /**
   * 6. CANCEL BOOKING - Cancel at any stage
   */
  const handleCancelBooking = useCallback(async (reason = 'User cancelled') => {
    try {
      console.log('🛑 Cancelling booking:', reason)

      if (currentBooking) {
        await bookingService.cancelBooking(currentBooking.id, reason)
      }

      // Cancel active searches
      cancelSearch()

      // Reset all state
      setBookingStatus('idle')
      setCurrentBooking(null)
      setCurrentTherapist(null)
      setShowServiceConfirmation(false)
      setShowTherapistSelection(false)
      setError(null)

      // Add cancellation message
      const cancelMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        conversationId: currentBooking?.id || 'temp',
        senderType: 'system',
        content: 'Booking cancelled. You can start a new booking anytime.',
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, cancelMessage])

    } catch (error) {
      console.error('❌ Booking cancellation failed:', error)
      // Continue with UI cleanup even if API fails
    }
  }, [currentBooking, cancelSearch])

  // ===== SEARCH EVENT HANDLERS =====

  function handleSearchFailed(error: string) {
    console.error('❌ Search failed:', error)
    setError(error)
    setBookingStatus('idle')
  }

  function handleSearchCancelled() {
    console.log('🛑 Search cancelled by user')
    setBookingStatus('idle')
  }

  /**
   * Handle rejecting/canceling the pending therapist
   * Allows user to go back to home page to manually select another therapist
   */
  const handleRejectTherapist = useCallback(() => {
    console.log('🚫 User rejected pending therapist')
    
    // Reset acceptance states
    setPendingTherapist(null)
    setShowAcceptanceBanner(false)
    setCurrentTherapist(null)
    setBookingStatus('idle')
    
    // Add system message about rejection
    const rejectMessage: ChatMessage = {
      id: `system_${Date.now()}`,
      conversationId: currentBooking?.id || 'temp',
      senderType: 'system',
      content: 'You declined this therapist. Returning to home page to search again.',
      timestamp: new Date().toISOString()
    }
    
    setMessages(prev => [...prev, rejectMessage])
    
    // Close chat window and redirect to home page after a brief delay
    setTimeout(() => {
      onClose()
      window.location.href = '/'
    }, 1000)
  }, [currentBooking, onClose])

  // ===== LOCATION HANDLING =====

  const handleGetLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    try {
      setLoading(true)
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const { latitude, longitude } = position.coords
      setCustomerCoordinates({ lat: latitude, lng: longitude })

      // Use simple coordinates as fallback location
      setCustomerLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)

    } catch (error) {
      console.error('❌ Location access failed:', error)
      setError('Unable to access your location. Please enter it manually.')
    } finally {
      setLoading(false)
    }
  }, [])

  // ===== MESSAGE HANDLING =====

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sending) return
    
    // For existing chat rooms, allow messaging regardless of booking status
    // For new bookings, require active status
    if (!chatRoomId && bookingStatus !== 'active') return

    try {
      setSending(true)
      
      // ✅ ENSURE AUTHENTICATION: Chat messaging requires valid session
      // Real-time chat operations need authentication for Appwrite permissions
      const { ensureAuthSession } = await import('../lib/authSessionHelper');
      const authResult = await ensureAuthSession('chat message send');
      
      if (!authResult.success) {
        console.error('❌ Cannot send chat message without authentication');
        setError('Unable to authenticate. Please refresh and try again.');
        setSending(false);
        return;
      }
      
      // Add message to UI optimistically
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        conversationId: chatRoomId || currentBooking?.id || 'temp',
        senderType: 'customer',
        senderId: authResult.userId || `guest_${Date.now()}`,
        senderName: customerName || 'Customer',
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, userMessage])
      const messageText = newMessage.trim();
      setNewMessage('')

      // Send message to database if chat room exists
      if (chatRoomId) {
        try {
          await sendSystemMessage(
            chatRoomId,
            messageText,
            'customer',
            authResult.userId || 'guest'
          );
          console.log('✅ Message sent to database');
        } catch (apiError) {
          console.error('❌ Failed to send message to database:', apiError);
          setError('Message failed to send. Please try again.');
        }
      } else {
        console.log('📤 Message queued (no chat room yet):', userMessage);
      }

    } catch (error) {
      console.error('❌ Failed to send message:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }, [newMessage, sending, bookingStatus, chatRoomId, currentBooking, customerName])

  // ===== LOCATION VERIFICATION HANDLING =====

  /**
   * Check if booking requires location verification on mount
   */
  useEffect(() => {
    const checkLocationRequirement = async () => {
      if (!bookingId || !isOpen) return;

      try {
        console.log('🔍 Checking location requirement for booking:', bookingId);
        
        // Fetch booking status
        const booking = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          bookingId
        );

        // Check if waiting for location
        if (booking.status === 'waiting_for_location') {
          console.log('🔒 Location verification required');
          setRequiresLocation(true);
          setLocationVerified(false);

          // Find chat room ID
          const chatRooms = await databases.listDocuments(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.chatRooms,
            [`bookingId="${bookingId}"`]
          );

          if (chatRooms.documents.length > 0) {
            const chatRoom = chatRooms.documents[0];
            setChatRoomId(chatRoom.$id);

            // Send location request system message
            const locationMessage = `🔒 Security Check Required

Please share your LIVE location so the therapist can verify the service address (home, villa, or hotel).

This is a one-time security measure to prevent spam bookings.`;

            await sendSystemMessage(chatRoom.$id, { en: locationMessage, id: locationMessage }, 'system', 'system');

            // Start 5-minute timeout
            const timeout = scheduleLocationTimeout(
              bookingId,
              chatRoom.$id,
              () => {
                console.log('⏰ Location timeout - booking cancelled');
                setLocationError('Booking cancelled: Location not shared within 5 minutes');
                setRequiresLocation(false);
                onClose();
              },
              5
            );

            locationTimeoutRef.current = timeout;
          }
        } else if (booking.status === 'location_shared') {
          console.log('✅ Location already verified');
          setLocationVerified(true);
          setRequiresLocation(false);
        }
      } catch (error) {
        console.error('❌ Failed to check location requirement:', error);
      }
    };

    checkLocationRequirement();

    // Cleanup timeout on unmount
    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [bookingId, isOpen, onClose]);

  /**
   * Handle live location sharing
   */
  const handleShareLocation = useCallback(async () => {
    if (!bookingId || !chatRoomId) {
      setLocationError('Booking information missing');
      return;
    }

    try {
      setSharingLocation(true);
      setLocationError(null);

      console.log('📍 Capturing live GPS location...');

      // Capture GPS location
      const location = await captureLiveLocation();

      console.log('💾 Saving location to database...');

      // Save to Appwrite
      await saveBookingLocation({
        bookingId,
        chatRoomId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        source: 'user'
      });

      // Update booking status
      await updateBookingWithLocation(bookingId, location.accuracy);

      // Update chat room
      await updateChatRoomLocation(chatRoomId, true, location.accuracy);

      // Clear timeout
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = null;
      }

      // Send success system message
      const successMessage = `📍 Location received. Therapist is reviewing the address.

Accuracy: ${formatAccuracy(location.accuracy)}
${!isAccuracyAcceptable(location.accuracy) ? '\n⚠️ Location accuracy is low. Therapist may request verification.' : ''}`;

      await sendSystemMessage(chatRoomId, { en: successMessage, id: successMessage }, 'system', 'system');

      // Update UI state
      setLocationVerified(true);
      setRequiresLocation(false);

      console.log('✅ Location verification complete');

    } catch (error: any) {
      console.error('❌ Location sharing failed:', error);

      if (error.code === error.PERMISSION_DENIED) {
        // User denied GPS permission - auto-cancel booking
        console.log('🚫 User denied GPS permission - cancelling booking');
        
        await cancelBookingLocationDenied(bookingId, chatRoomId);

        const cancelMessage = '🚫 Booking cancelled: GPS permission denied. Location sharing is required for security purposes.';
        await sendSystemMessage(chatRoomId, { en: cancelMessage, id: cancelMessage }, 'system', 'system');

        setLocationError('Booking cancelled: GPS permission required');
        setTimeout(() => onClose(), 3000);
      } else {
        setLocationError('Failed to capture location. Please try again.');
      }
    } finally {
      setSharingLocation(false);
    }
  }, [bookingId, chatRoomId, onClose]);

  // ===== 🔔 BOOKING STATUS POLLING & NOTIFICATIONS =====

  /**
   * Poll booking status every 3 seconds and trigger system notifications
   */
  useEffect(() => {
    const pollBookingStatus = async () => {
      if (!bookingId || !isOpen) return;

      try {
        // Fetch current booking status
        const booking = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          bookingId
        );

        const currentStatus = booking.status;

        // Update status state
        setBookingStatusState(currentStatus);

        // Check if status changed (new notification needed)
        if (currentStatus !== lastProcessedStatus && lastProcessedStatus !== '') {
          console.log(`🔔 Booking status changed: ${lastProcessedStatus} → ${currentStatus}`);

          // Get system notification config
          const notification = getSystemNotification(currentStatus);

          // Update banner
          if (notification.banner) {
            setSystemBanner(notification.banner);
          }

          // Send system message to chat
          if (notification.chatMessage && notification.chatMessage.shouldSendToChat && chatRoomId) {
            try {
              await sendSystemMessage(chatRoomId, {
                en: notification.chatMessage.text,
                id: notification.chatMessage.text
              }, 'system', 'system');
              console.log('✅ System message sent to chat:', notification.chatMessage.text);
            } catch (error) {
              console.error('❌ Failed to send system message:', error);
            }
          }

          // Play sound notification (customer view for now)
          playBookingStatusSound(currentStatus, 'customer');

          // 🆕 SEND PUSH NOTIFICATION (if tab not visible and push enabled)
          if (notification.pushNotification && shouldSendPush(currentStatus)) {
            const { pushTitle, pushBody, pushPriority } = notification.pushNotification;
            
            // Only send push if tab is not visible (user won't see in-app banner)
            if (!isTabVisible()) {
              try {
                await triggerLocalNotification(
                  pushTitle,
                  pushBody,
                  bookingId,
                  pushPriority
                );
                console.log(`🔔 Push notification sent: ${pushTitle}`);
              } catch (error) {
                console.error('❌ Push notification failed:', error);
                // Fail silently - user still sees in-app notification
              }
            } else {
              console.log('🔕 Tab visible, skipping push notification (showing banner instead)');
            }
          }

          // Mark status as processed
          setLastProcessedStatus(currentStatus);
        } else if (lastProcessedStatus === '') {
          // First load - set banner without sound
          const notification = getSystemNotification(currentStatus);
          if (notification.banner) {
            setSystemBanner(notification.banner);
          }
          setLastProcessedStatus(currentStatus);
        }

      } catch (error) {
        console.error('❌ Failed to poll booking status:', error);
      }
    };

    // Initial poll
    pollBookingStatus();

    // Set up polling interval (every 3 seconds)
    statusPollingRef.current = setInterval(pollBookingStatus, 3000);

    // Cleanup
    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
    };
  }, [bookingId, isOpen, lastProcessedStatus, chatRoomId]);

  // ===== AUTO-SCROLL EFFECT =====

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ===== 🔔 PUSH NOTIFICATION INITIALIZATION =====

  /**
   * Initialize push notifications on mount (if supported and permission granted)
   */
  useEffect(() => {
    if (!isOpen) return;

    const initPush = async () => {
      // Check if push is supported
      if (!isPushSupported()) {
        console.log('ℹ️ Push notifications not supported in this browser');
        return;
      }

      // Check current permission
      const permission = getPermissionState();
      
      if (permission === 'granted') {
        // Auto-initialize if already granted
        console.log('✅ Push permission already granted, initializing...');
        try {
          // For now, using 'customer' role - should be dynamic based on user type
          const success = await initializePushNotifications(
            providerId || 'guest',
            'customer'
          );
          
          if (success) {
            console.log('✅ Push notifications initialized successfully');
          }
        } catch (error) {
          console.error('❌ Push initialization failed:', error);
          // Fail silently - app still works without push
        }
      } else if (permission === 'default') {
        console.log('ℹ️ Push permission not requested yet. User can enable via settings.');
        // Don't auto-request on mount - wait for user action
      } else {
        console.log('🚫 Push permission denied by user');
      }
    };

    initPush();
  }, [isOpen, providerId]);

  // ===== SYSTEM ACTIVATION LOG =====

  useEffect(() => {
    if (isOpen) {
      console.log('✅ Chat system notifications & sounds fully active and enforced');
      console.log('✅ Push notifications integrated (Web Push API + systemNotificationMapper)');
    }
  }, [isOpen]);

  // ===== CLEANUP ON UNMOUNT =====

  useEffect(() => {
    return () => {
      isActiveRef.current = false
      cancelSearch()
    }
  }, [cancelSearch])

  // ===== RENDER =====

  console.log('🔍 ChatWindow render check - isOpen prop value:', isOpen);
  console.log('🔍 ChatWindow render check - typeof isOpen:', typeof isOpen);
  
  if (!isOpen) {
    console.log('❌ ChatWindow returning null because isOpen is falsy:', isOpen);
    return null;
  }
  
  console.log('✅ ChatWindow proceeding to render - isOpen is truthy');
  
  // CRITICAL FIX: Defensive checks to prevent white screen
  if (!providerId || !providerName) {
    console.warn('⚠️ ChatWindow rendered without required data:', { providerId, providerName })
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chat...</p>
            <button 
              onClick={onClose}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {isMinimized ? (
        // Minimized State - Small bar
        <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 p-3 flex items-center gap-3 cursor-pointer hover:shadow-xl transition-shadow" onClick={() => setIsMinimized(false)}>
          <img 
            src={currentTherapist?.photo || providerPhoto || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'} 
            alt={currentTherapist?.name || providerName}
            className="w-10 h-10 rounded-full object-cover border-2 border-orange-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'
            }}
          />
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">{currentTherapist?.name || providerName}</div>
            <div className="text-xs text-gray-500">Click to open chat</div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        // Full Chat Window
        <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 w-80 sm:w-96 h-[500px] flex flex-col">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Provider Photo */}
            <div className="relative">
              <img 
                src={currentTherapist?.photo || providerPhoto || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'} 
                alt={currentTherapist?.name || providerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'
                }}
              />
              {/* Online Status Dot */}
              <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                providerStatus === 'available' ? 'bg-green-500' :
                providerStatus === 'busy' ? 'bg-yellow-500' :
                'bg-gray-400'
              }`} title={providerStatus}></div>
            </div>
            
            {/* Provider Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base truncate">{currentTherapist?.name || providerName}</span>
              </div>
              
              {/* Rating and Location */}
              <div className="flex items-center gap-2 text-xs text-orange-100 mt-0.5">
                {/* Star Rating */}
                <div className="flex items-center gap-1">
                  <span className="text-yellow-300">⭐</span>
                  <span className="font-medium">{currentTherapist?.rating || providerRating}</span>
                </div>
                
                {/* Location */}
                {(currentTherapist?.distance || providerLocation) && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span className="truncate">
                        {currentTherapist?.distance 
                          ? `${currentTherapist.distance}km away` 
                          : providerLocation}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Minimize"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Booking Info Banner (if booking data available) */}
        {(selectedService || currentBooking) && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm">
            <div className="flex items-center justify-between text-amber-900">
              <span>📅 Booking #{currentBooking?.id?.slice(-6) || 'NEW'}</span>
              <span>
                {selectedService?.duration || currentBooking?.serviceDuration || '60'} min • 
                Rp {(currentBooking?.price || pricing[selectedService?.duration as ServiceDuration || '60'])?.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        )}

        {/* MESSAGES AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* 🎨 WELCOME BANNER */}
              {showWelcomeBanner && messages.length === 0 && (
                <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl overflow-hidden shadow-lg mb-4">
                  <div className="relative">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/indastreet%20villa.png" 
                      alt="Welcome to IndaStreet"
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <button
                      onClick={() => {
                        setShowWelcomeBanner(false)
                        localStorage.setItem('welcomeBannerDismissed', 'true')
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                      title="Dismiss"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span>🌟</span>
                      <span>Welcome to IndaStreet Massage!</span>
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Book your perfect massage in just a few taps. We'll find the best therapist near you and handle everything from booking to payment.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-orange-600">
                      <span>✓ Verified therapists</span>
                      <span>•</span>
                      <span>✓ Secure booking</span>
                      <span>•</span>
                      <span>✓ Real-time chat</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* BOOKING CONFIRMED - Only show after therapist accepts */}
              {bookingStatus === 'active' && currentTherapist && (
                <BookingConfirmed
                  therapistName={currentTherapist.name}
                  therapistPhoto={currentTherapist.photo}
                  eta={currentTherapist.eta}
                  serviceType={currentBooking?.serviceDuration ? `Massage Therapy` : 'Massage Service'}
                  serviceDuration={currentBooking?.serviceDuration || serviceDuration}
                  price={currentBooking?.price || pricing[serviceDuration]}
                />
              )}

              {/* WAITING FOR THERAPIST - Show before booking is confirmed */}
              {(currentBooking || chatRoomId) && bookingStatus !== 'active' && (
                <>
                  {/* Therapist Welcome Banner - Minimalistic Design */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-4">
                    {/* Profile Section */}
                    <div className="p-8 text-center">
                      {/* Profile Image with Orange Ring */}
                      <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-orange-400 rounded-full blur-md opacity-40"></div>
                        <img 
                          src={currentTherapist?.photo || providerPhoto || 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'} 
                          alt={currentTherapist?.name || providerName}
                          className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-xl"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://ik.imagekit.io/7grri5v7d/avatar%201.png';
                          }}
                        />
                      </div>
                      
                      {/* Welcome Text */}
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Welcome To <span className="text-orange-500">{currentTherapist?.name || providerName}</span>
                      </h2>
                      
                      {/* Connection Status */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
                        We are connecting you now, please wait...
                      </p>
                      
                      {/* Rating Badge */}
                      <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-gray-50 rounded-full border border-gray-200">
                        <span className="text-orange-500 text-lg">⭐</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {currentTherapist?.rating || providerRating}
                        </span>
                        {providerLocation && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs text-gray-500">{providerLocation}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Divider Line */}
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

                    {/* Booking Details Section */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Booking Details</h4>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Service Type */}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-500">Service</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {currentBooking?.serviceDuration ? 'Massage Therapy' : 'Massage Service'}
                          </span>
                        </div>
                        
                        <div className="h-px bg-gray-100"></div>
                        
                        {/* Duration */}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-500">Duration</span>
                          <span className="text-sm font-semibold text-gray-900">
                            {currentBooking?.serviceDuration || serviceDuration} minutes
                          </span>
                        </div>
                        
                        <div className="h-px bg-gray-100"></div>
                        
                        {/* Price */}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-500">Price</span>
                          <span className="text-sm font-bold text-orange-500">
                            {new Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              minimumFractionDigits: 0
                            }).format(currentBooking?.price || pricing[serviceDuration])}
                          </span>
                        </div>
                        
                        <div className="h-px bg-gray-100"></div>
                        
                        {/* Payment Methods */}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-500">Payment</span>
                          <div className="flex gap-2">
                            <span className="text-xs bg-gray-900 text-white px-3 py-1 rounded-full font-medium">
                              Cash
                            </span>
                            <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-medium">
                              Transfer
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Timer - Minimalistic */}
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-4">
                    <div className="p-6 text-center">
                      <div className="text-6xl font-light text-gray-900 mb-3 tracking-tight">
                        {(() => {
                          const minutes = Math.floor(countdownTime / 60);
                          const seconds = countdownTime % 60;
                          return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                        })()}
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Waiting For Connection
                        </p>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your request has been sent
                      </p>
                    </div>
                  </div>
                </>
              )}
              
              {/* 🎯 THERAPIST ACCEPTANCE BANNER - Appears when therapist accepts */}
              {showAcceptanceBanner && pendingTherapist && (
                <div className="bg-white rounded-2xl border-2 border-orange-500 overflow-hidden shadow-lg mb-4 animate-in fade-in duration-300">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 border-b border-orange-200">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <h3 className="font-bold text-gray-900 text-sm">Therapist Found!</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {/* Therapist Profile */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative flex-shrink-0">
                        <img
                          src={pendingTherapist.profileImageUrl || '/images/default-avatar.png'}
                          alt={pendingTherapist.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-orange-300"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">{pendingTherapist.name}</h4>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(pendingTherapist.rating) ? 'text-orange-500' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                          <span className="text-sm font-medium text-gray-700 ml-1">
                            {pendingTherapist.rating.toFixed(1)}
                          </span>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <span>📍</span>
                          <span className="truncate">{pendingTherapist.location}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Arrival Time */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🕐</span>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Estimated Arrival</p>
                            <p className="text-sm font-bold text-gray-900">
                              {pendingTherapist.estimatedArrival || '30-60'} minutes
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="space-y-3">
                      {/* Accept Button */}
                      <button
                        onClick={() => {
                          setShowAcceptanceBanner(false)
                          setBookingStatus('active')
                          console.log('✅ User accepted therapist:', pendingTherapist.name)
                        }}
                        className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Confirm & Start Chat</span>
                      </button>
                      
                      {/* Cancel/Reject Button */}
                      <button
                        onClick={handleRejectTherapist}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-all border border-gray-300 flex items-center justify-center gap-2"
                      >
                        <span>✕</span>
                        <span>Decline & Search Again</span>
                      </button>
                    </div>
                    
                    <p className="text-xs text-center text-gray-400 mt-4">
                      Declining will return you to the home page
                    </p>
                  </div>
                </div>
              )}
              
              {/* 🔔 SYSTEM BANNER (CRITICAL NOTIFICATIONS) */}
              {systemBanner && (
                <div className={getBannerClasses(systemBanner.severity)}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">{systemBanner.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{systemBanner.title}</h3>
                      {systemBanner.message && (
                        <p className="text-sm whitespace-pre-line">{systemBanner.message}</p>
                      )}
                      {isUrgentStatus(bookingStatusState) && (
                        <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                          <span className="animate-pulse">⚠️</span>
                          <span>Immediate attention required</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* ERROR MESSAGE */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-red-800 text-sm">{error}</div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-600 text-xs mt-1 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* 🔒 LOCATION VERIFICATION PROMPT */}
              {requiresLocation && !locationVerified && (
                <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 text-2xl">🔒</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-orange-800 mb-2">Security Check Required</h3>
                      <p className="text-sm text-orange-700 mb-3">
                        Please share your LIVE location so the therapist can verify the service address.
                        This is a one-time security measure to prevent spam bookings.
                      </p>
                      {locationError && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-2 mb-3">
                          <p className="text-xs text-red-700">{locationError}</p>
                        </div>
                      )}
                      <button
                        onClick={handleShareLocation}
                        disabled={sharingLocation}
                        className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {sharingLocation ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Capturing Location...</span>
                          </>
                        ) : (
                          <>
                            <span>📍</span>
                            <span>Share Live Location</span>
                          </>
                        )}
                      </button>
                      <p className="text-xs text-orange-600 mt-2 text-center">
                        ⏱️ You have 5 minutes to share your location
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* REGISTRATION FORM */}
              {!isRegistered && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Your Details</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <input
                      type="tel"
                      placeholder="WhatsApp Number"
                      value={customerWhatsApp}
                      onChange={(e) => setCustomerWhatsApp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Your Location"
                        value={customerLocation}
                        onChange={(e) => setCustomerLocation(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        onClick={handleGetLocation}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        title="Get current location"
                      >
                        📍
                      </button>
                    </div>
                    <select
                      value={serviceDuration}
                      onChange={(e) => setServiceDuration(e.target.value as ServiceDuration)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="60">60 minutes - {formatPrice(pricing['60'])}</option>
                      <option value="90">90 minutes - {formatPrice(pricing['90'])}</option>
                      <option value="120">120 minutes - {formatPrice(pricing['120'])}</option>
                    </select>
                    <button
                      onClick={() => {
                        if (customerName && customerWhatsApp && customerLocation) {
                          setIsRegistered(true)
                          handleStartBooking()
                        }
                      }}
                      disabled={!customerName || !customerWhatsApp || !customerLocation || loading}
                      className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                    >
                      {loading ? 'Starting...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* SERVICE CONFIRMATION CARD */}
              {showServiceConfirmation && (
                <ServiceConfirmationCard
                  duration={serviceDuration}
                  price={pricing[serviceDuration]}
                  location={customerLocation}
                  onConfirm={handleConfirmService}
                  onCancel={handleCancelBooking}
                  isLoading={loading}
                />
              )}

              {/* SEARCH STATUS */}
              {isSearching && (
                <SearchStatus
                  countdown={countdown}
                  searchAttempt={searchAttempt}
                  onCancel={handleCancelBooking}
                />
              )}

              {/* THERAPIST SELECTION */}
              {showTherapistSelection && currentTherapist && (
                <TherapistCard
                  therapist={currentTherapist}
                  onAccept={handleAcceptTherapist}
                  onReject={handleFindAnother}
                  onCancel={handleCancelBooking}
                  isLoading={loading}
                />
              )}

              {/* CHAT MESSAGES */}
              {messages.map(message => (
                <div key={message.id} className="w-full">
                  {message.senderType === 'system' ? (
                    <SystemMessage
                      message={message}
                      onConfirm={message.messageType === 'system_card' ? handleConfirmService : undefined}
                      onCancel={handleCancelBooking}
                      onAcceptTherapist={message.messageType === 'therapist_card' ? handleAcceptTherapist : undefined}
                      onFindAnother={message.messageType === 'therapist_card' ? handleFindAnother : undefined}
                    />
                  ) : (
                    <div className={`flex gap-2 ${
                      message.senderType === 'user' ? 'justify-end' : 'justify-start'
                    } mb-3`}>
                      {message.senderType === 'therapist' && currentTherapist && (
                        <img
                          src={currentTherapist.photo}
                          alt={currentTherapist.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                      )}
                      <div className={`max-w-[70%] rounded-lg px-3 py-2 ${
                        message.senderType === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`text-xs mt-1 ${
                          message.senderType === 'user' ? 'text-orange-200' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* MESSAGE INPUT FOOTER - ALWAYS VISIBLE */}
            <div className="border-t-2 border-gray-200 bg-white rounded-b-lg">
              {bookingStatus === 'active' || chatRoomId ? (
                // Active chat - full input enabled
                <div className="p-3">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && !sending && newMessage.trim() && handleSendMessage()}
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="px-5 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                      title="Send message"
                    >
                      {sending ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span className="hidden sm:inline">Send</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-red-600 font-semibold mt-2 px-1 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Sharing contact info will block your account</span>
                  </p>
                </div>
              ) : (
                // Inactive - show locked state with hint
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">Chat Locked</p>
                      <p className="text-xs text-gray-600">Complete booking to start messaging</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  )
}