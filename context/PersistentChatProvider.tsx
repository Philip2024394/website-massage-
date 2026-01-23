/**
 * 🔒 PERSISTENT CHAT PROVIDER - Facebook Messenger Style
 * Connected to Appwrite for REAL-TIME communication
 * 
 * Features:
 * - Real-time message sync via Appwrite subscriptions
 * - Messages saved to chat_messages collection
 * - Therapist can see and respond to messages instantly
 * - Chat persists across page navigation
 * - Orange minimalistic design UI
 * - STRICT AVAILABILITY ENFORCEMENT (BUSY/CLOSED cannot Book Now)
 * - SECURE BANK CARD SHARING (no manual bank numbers allowed)
 * - 🔒 SERVER-ENFORCED ANTI-CONTACT VALIDATION (TAMPER RESISTANT)
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { client, databases, ID, account } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';
import { 
  bookingLifecycleService, 
  BookingLifecycleStatus, 
  BookingType,
  BookingLifecycleRecord 
} from '../lib/services/bookingLifecycleService';
import { 
  availabilityEnforcementService, 
  TherapistAvailabilityStatus 
} from '../lib/services/availabilityEnforcementService';
import { 
  secureBankCardService, 
  SecureBankCard,
  MaskedBankCard 
} from '../lib/services/secureBankCardService';
import {
  serverEnforcedChatService,
  SendMessageRequest,
  SendMessageResponse,
} from '../lib/services/serverEnforcedChatService';

// Collection IDs from config
const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_MESSAGES_COLLECTION = APPWRITE_CONFIG.collections.chatMessages;

// Re-export lifecycle status for UI components
export { BookingLifecycleStatus, BookingType, TherapistAvailabilityStatus };
// Re-export bank card types
export type { SecureBankCard, MaskedBankCard };
// Booking status for workflow (maps to BookingLifecycleStatus)
export type BookingStatus = 
  | 'pending'           // PENDING - Waiting for therapist response
  | 'waiting_others'    // PENDING - Therapist timeout, sent to other therapists
  | 'therapist_accepted'// ACCEPTED - Therapist accepted, waiting user confirmation
  | 'user_confirmed'    // CONFIRMED - User confirmed, booking active
  | 'cancelled'         // DECLINED - Booking cancelled
  | 'on_the_way'        // CONFIRMED - Therapist en route
  | 'completed'         // COMPLETED - Service completed (commission applies)
  | 'payment_pending'   // COMPLETED - Waiting for payment
  | 'payment_received'  // COMPLETED - Payment confirmed
  | 'expired';          // EXPIRED - Timeout, excluded from commission

// Booking data structure aligned with BookingLifecycleRecord
export interface BookingData {
  id: string;
  bookingId: string;
  documentId?: string; // Appwrite document ID
  status: BookingStatus;
  lifecycleStatus: BookingLifecycleStatus; // Server-authoritative status
  
  // Provider info
  therapistId: string;
  therapistName: string;
  businessId?: string;
  businessName?: string;
  providerType: 'therapist' | 'place' | 'facial';
  
  // Customer info
  customerId: string;
  customerName: string;
  customerPhone?: string;
  
  // Service details
  serviceType: string;
  duration: number;
  locationZone: string;
  coordinates?: { lat: number; lng: number };
  
  // Booking type and pricing
  bookingType: BookingType;
  totalPrice: number;
  adminCommission: number; // 30%
  providerPayout: number;  // 70%
  
  // Discount code applied
  discountCode?: string;
  discountPercentage?: number;
  originalPrice?: number;
  discountedPrice?: number;
  
  // Timestamps
  createdAt: string;
  pendingAt?: string;
  acceptedAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  declinedAt?: string;
  expiredAt?: string;
  
  // Schedule (for SCHEDULED bookings)
  scheduledDate?: string;
  scheduledTime?: string;
  
  // Legacy fields for UI compatibility
  therapistAcceptedAt?: string;
  userConfirmedAt?: string;
  therapistOnTheWayAt?: string;
  paymentMethod?: 'cash' | 'bank_transfer';
  paymentStatus?: 'pending' | 'transferred' | 'received';
}

// Therapist info for chat
export interface ChatTherapist {
  id: string;
  name: string;
  image?: string;
  pricing?: Record<string, number>;
  whatsapp?: string;
  status?: string;
  availabilityStatus?: TherapistAvailabilityStatus | string; // AVAILABLE, BUSY, CLOSED, RESTRICTED
  duration?: number;
  bankCardDetails?: string; // Bank card info for payment
  clientPreferences?: string;
}

// Message structure matching Appwrite schema
export interface ChatMessage {
  $id: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'therapist' | 'admin' | 'system';
  recipientId: string;
  recipientName: string;
  message: string;
  createdAt: string;
  read: boolean;
  messageType: 'text' | 'file' | 'location' | 'system' | 'booking';
  roomId: string;
  isSystemMessage?: boolean;
}

// Legacy message format for compatibility
export interface LegacyMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'booking';
}

// Booking flow step
export type BookingStep = 'duration' | 'datetime' | 'details' | 'confirmation' | 'chat';

// Selected service from Menu Harga
export interface SelectedService {
  serviceName: string;
  duration: number; // 60, 90, or 120
  price: number;
  // Enhanced for scheduled bookings (deposit added AFTER therapist accepts)
  isScheduled?: boolean;
}

// Chat window state
export interface ChatWindowState {
  isOpen: boolean;
  isMinimized: boolean;
  therapist: ChatTherapist | null;
  messages: ChatMessage[];
  bookingStep: BookingStep;
  bookingMode: 'book' | 'schedule' | 'price';
  selectedDuration: number | null;
  selectedDate: string | null;
  selectedTime: string | null;
  customerName: string;
  customerWhatsApp: string;
  customerLocation: string;
  coordinates: { lat: number; lng: number } | null;
  selectedService: SelectedService | null; // Pre-selected from Menu Harga
  // Booking workflow state
  currentBooking: BookingData | null;
  bookingCountdown: number | null; // Seconds remaining for therapist/user action
  isTherapistView: boolean; // True if viewing as therapist
}

// ============================================================================
// 🔒 SERVER-ENFORCED ANTI-CONTACT VALIDATION
// Quick client-side check for UI feedback only
// REAL validation happens on the server (tamper-resistant)
// ============================================================================

// Quick UI validation (for immediate feedback - NOT SECURITY)
// Server does the real validation through serverEnforcedChatService
export const validateMessage = (message: string): { isValid: boolean; warning: string | null } => {
  // Quick check for UI feedback (server validates for real)
  const quickCheck = serverEnforcedChatService.quickValidate(message);
  if (quickCheck.mayBeBlocked) {
    return {
      isValid: false,
      warning: `⚠️ ${quickCheck.reason || 'Contact information detected'}.\n\n🚫 Sharing contact information is strictly prohibited.\nViolations may result in account restriction.`,
    };
  }

  // 🔒 CHECK FOR BANK ACCOUNT NUMBERS (also validated server-side)
  const bankCheck = secureBankCardService.containsBankNumber(message);
  if (!bankCheck.isValid) {
    return {
      isValid: false,
      warning: bankCheck.warning || '🚫 Sharing bank account numbers is not allowed. Use the secure payment system.',
    };
  }
  
  return { isValid: true, warning: null };
};

// Context value
interface PersistentChatContextValue {
  chatState: ChatWindowState;
  isLocked: boolean;
  isConnected: boolean;
  openChat: (therapist: ChatTherapist, mode?: 'book' | 'schedule' | 'price') => void;
  openChatWithService: (therapist: ChatTherapist, service: SelectedService, options?: { isScheduled?: boolean }) => void; // Enhanced Menu Harga integration
  minimizeChat: () => void;
  maximizeChat: () => void;
  closeChat: () => void;
  lockChat: () => void;
  unlockChat: () => void;
  setBookingStep: (step: BookingStep) => void;
  setSelectedDuration: (duration: number) => void;
  setSelectedDateTime: (date: string, time: string) => void;
  setCustomerDetails: (details: { name: string; whatsApp: string; location: string; coordinates?: { lat: number; lng: number } }) => void;
  addMessage: (message: Omit<LegacyMessage, 'id' | 'timestamp'>) => void;
  sendMessage: (messageContent: string) => Promise<{ sent: boolean; warning?: string }>;
  updateTherapist: (updates: Partial<ChatTherapist>) => void;
  // 🔒 Availability enforcement utilities
  canBookNow: (therapistStatus?: string) => boolean;
  canSchedule: (therapistStatus?: string) => boolean;
  getAvailabilityMessage: (therapistStatus?: string, bookingType?: BookingType) => string | null;
  // Booking workflow functions
  createBooking: (bookingData: Partial<BookingData>) => void;
  updateBookingStatus: (status: BookingStatus) => void;
  acceptBooking: () => void;    // Therapist accepts
  rejectBooking: () => void;    // Therapist rejects
  confirmBooking: () => void;   // User confirms therapist
  cancelBooking: () => void;    // Cancel booking
  setOnTheWay: () => void;      // Therapist starts journey
  completeBooking: () => void;  // Service completed
  shareBankCard: () => void;    // Share bank card details
  confirmPayment: (method: 'cash' | 'bank_transfer') => void;
  addSystemNotification: (message: string) => void;
}

const PersistentChatContext = createContext<PersistentChatContextValue | null>(null);

// Initial state
const initialState: ChatWindowState = {
  isOpen: false,
  isMinimized: false,
  bookingMode: 'book',
  selectedDate: null,
  selectedTime: null,
  therapist: null,
  messages: [],
  bookingStep: 'duration',
  selectedDuration: null,
  customerName: '',
  customerWhatsApp: '',
  customerLocation: '',
  coordinates: null,
  selectedService: null, // Pre-selected from Menu Harga
  // Booking workflow state
  currentBooking: null,
  bookingCountdown: null,
  isTherapistView: false,
};

export function PersistentChatProvider({ children }: { children: ReactNode }) {
  const [chatState, setChatState] = useState<ChatWindowState>(initialState);
  const [isLocked, setIsLocked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('Guest');
  const subscriptionRef = useRef<(() => void) | null>(null);
  const therapistIdRef = useRef<string | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep therapist ID ref in sync
  useEffect(() => {
    therapistIdRef.current = chatState.therapist?.id || null;
  }, [chatState.therapist?.id]);

  // Get or create user ID on mount
  useEffect(() => {
    const initUser = async () => {
      try {
        const user = await account.get();
        setCurrentUserId(user.$id);
        setCurrentUserName(user.name || 'Customer');
        console.log('✅ PersistentChat: User authenticated:', user.$id);
      } catch {
        // Create anonymous ID for guests
        let anonId = localStorage.getItem('persistent_chat_user_id');
        if (!anonId) {
          anonId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('persistent_chat_user_id', anonId);
        }
        setCurrentUserId(anonId);
        setCurrentUserName('Guest');
        console.log('👤 PersistentChat: Using anonymous ID:', anonId);
      }
    };
    initUser();
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!currentUserId || !CHAT_MESSAGES_COLLECTION) return;

    console.log('🔌 PersistentChat: Setting up real-time subscription...');

    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${CHAT_MESSAGES_COLLECTION}.documents`,
        (response) => {
          const payload = response.payload as any;
          console.log('💬 Real-time message event:', response.events[0]);

          // Check if this message involves the current user
          const isOurMessage = payload.senderId === currentUserId || payload.recipientId === currentUserId;
          if (!isOurMessage) return;

          // Check if it's for the current therapist chat (use ref to avoid stale closure)
          const currentTherapistId = therapistIdRef.current;
          if (currentTherapistId) {
            const isForCurrentChat = 
              (payload.senderId === currentTherapistId || payload.recipientId === currentTherapistId);
            
            if (isForCurrentChat && response.events.some(e => e.includes('create'))) {
              const newMessage: ChatMessage = {
                $id: payload.$id,
                senderId: payload.senderId,
                senderName: payload.senderName || 'Unknown',
                senderType: payload.senderType || 'customer',
                recipientId: payload.recipientId,
                recipientName: payload.recipientName || '',
                message: payload.message || payload.content || '',
                createdAt: payload.createdAt || payload.$createdAt,
                read: payload.read || false,
                messageType: payload.messageType || 'text',
                roomId: payload.roomId || '',
                isSystemMessage: payload.isSystemMessage || false,
              };

              // Add to messages if not duplicate
              setChatState(prev => {
                if (prev.messages.some(m => m.$id === newMessage.$id)) {
                  return prev;
                }
                return {
                  ...prev,
                  messages: [...prev.messages, newMessage],
                };
              });

              console.log('✅ Message added via real-time:', newMessage.$id);
            }
          }
        }
      );

      subscriptionRef.current = unsubscribe;
      setIsConnected(true);
      console.log('✅ PersistentChat: Real-time subscription active');

    } catch (error) {
      console.error('❌ PersistentChat: Subscription failed:', error);
      setIsConnected(false);
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
        console.log('🔌 PersistentChat: Unsubscribed');
      }
    };
  }, [currentUserId]); // Remove therapist dependency - use ref instead

  // Load existing messages when chat opens
  const loadMessages = useCallback(async (therapistId: string) => {
    if (!currentUserId || !CHAT_MESSAGES_COLLECTION) return [];

    try {
      console.log('📥 Loading chat history with:', therapistId);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION,
        [
          Query.or([
            Query.and([
              Query.equal('senderId', currentUserId),
              Query.equal('recipientId', therapistId)
            ]),
            Query.and([
              Query.equal('senderId', therapistId),
              Query.equal('recipientId', currentUserId)
            ])
          ]),
          Query.orderAsc('createdAt'),
          Query.limit(100)
        ]
      );

      const messages: ChatMessage[] = response.documents.map((doc: any) => ({
        $id: doc.$id,
        senderId: doc.senderId,
        senderName: doc.senderName || 'Unknown',
        senderType: doc.senderType || 'customer',
        recipientId: doc.recipientId,
        recipientName: doc.recipientName || '',
        message: doc.message || doc.content || '',
        createdAt: doc.createdAt || doc.$createdAt,
        read: doc.read || false,
        messageType: doc.messageType || 'text',
        roomId: doc.roomId || '',
        isSystemMessage: doc.isSystemMessage || false,
      }));

      console.log(`📥 Loaded ${messages.length} messages from history`);
      return messages;

    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      return [];
    }
  }, [currentUserId]);

  // Open chat with therapist
  const openChat = useCallback(async (therapist: ChatTherapist, mode: 'book' | 'schedule' | 'price' = 'book') => {
    console.log('💬 Opening chat with:', therapist.name, 'mode:', mode);
    console.log('🔒 Locking chat to prevent accidental closure during booking');
    
    // 🔒 CRITICAL: Lock chat IMMEDIATELY to prevent closure during booking
    setIsLocked(true);
    
    // Set initial state
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      therapist,
      bookingMode: mode,
      bookingStep: 'duration',
      selectedDate: null,
      selectedTime: null,
      selectedService: null, // Reset pre-selected service
      messages: prev.therapist?.id === therapist.id ? prev.messages : [],
    }));

    // Load existing messages
    if (currentUserId) {
      const messages = await loadMessages(therapist.id);
      if (messages.length > 0) {
        setChatState(prev => ({
          ...prev,
          messages,
          bookingStep: 'chat', // Go directly to chat if there's history
        }));
      }
    }
  }, [currentUserId, loadMessages]);

  // Add local message (legacy compatibility) - MOVED HERE to fix initialization order
  const addMessage = useCallback((message: Omit<LegacyMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      $id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: message.senderId,
      senderName: message.senderName,
      senderType: message.senderId === 'system' ? 'system' : 'customer',
      recipientId: chatState.therapist?.id || '',
      recipientName: chatState.therapist?.name || '',
      message: message.message,
      createdAt: new Date().toISOString(),
      read: false,
      messageType: message.type === 'booking' ? 'booking' : message.type === 'system' ? 'system' : 'text',
      roomId: '',
      isSystemMessage: message.type === 'system',
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, [chatState.therapist]);

  // Open chat with pre-selected service from Menu Harga
  // Enhanced to support both immediate and scheduled bookings with deposits
  const openChatWithService = useCallback(async (
    therapist: ChatTherapist, 
    service: { serviceName: string; duration: number; price: number },
    options?: { isScheduled?: boolean; depositRequired?: boolean; depositPercentage?: number }
  ) => {
    console.log('💬 Opening chat with pre-selected service:', therapist.name, service, options);
    
    const isScheduled = options?.isScheduled || false;
    
    // Set state with pre-selected service
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      therapist,
      bookingMode: isScheduled ? 'schedule' : 'price', // Schedule mode for scheduled bookings, price mode for immediate
      bookingStep: isScheduled ? 'datetime' : 'confirmation', // For scheduled: go to datetime selection, for immediate: skip to confirmation
      selectedDuration: service.duration,
      selectedDate: null,
      selectedTime: null,
      selectedService: {
        ...service,
        isScheduled
        // Deposit info will be added AFTER therapist accepts
      }, // Store the pre-selected service details
      messages: prev.therapist?.id === therapist.id ? prev.messages : [],
    }));
    
    setIsLocked(true);

    // Load existing messages
    if (currentUserId) {
      const messages = await loadMessages(therapist.id);
      if (messages.length > 0) {
        setChatState(prev => ({
          ...prev,
          messages,
          // Keep step flow based on booking type
        }));
      }
    }

    // Add system message about the booking type
    const systemMessage = isScheduled 
      ? `📅 Scheduled booking selected: ${service.serviceName} (${service.duration} min) - Total: Rp ${service.price.toLocaleString('id-ID')} (Deposit required after therapist accepts)`
      : `🚀 Immediate booking selected: ${service.serviceName} (${service.duration} min) - Total: Rp ${service.price.toLocaleString('id-ID')}`;
    
    addMessage({
      id: Date.now().toString(),
      text: systemMessage,
      sender: 'system',
      timestamp: new Date(),
      isSystemNotification: true
    });

  }, [currentUserId, loadMessages, addMessage]);

  // Minimize chat - reset booking flow to duration selection
  const minimizeChat = useCallback(() => {
    console.log('➖ Minimizing chat - resetting to duration selection');
    setChatState(prev => ({ 
      ...prev, 
      isMinimized: true,
      // Reset booking flow
      bookingStep: 'duration',
      selectedDuration: null,
      selectedDate: null,
      selectedTime: null,
      selectedService: null,
      customerName: '',
      customerWhatsApp: '',
      customerLocation: '',
      coordinates: null,
    }));
  }, []);

  // Maximize chat
  const maximizeChat = useCallback(() => {
    console.log('➕ Maximizing chat');
    setChatState(prev => ({ ...prev, isMinimized: false }));
  }, []);

  // Close chat (only if unlocked)
  const closeChat = useCallback(() => {
    if (isLocked) {
      console.log('🔒 Chat is locked, minimizing instead');
      setChatState(prev => ({ ...prev, isMinimized: true }));
      return;
    }
    console.log('❌ Closing chat');
    setChatState(initialState);
    setIsLocked(false);
  }, [isLocked]);

  // Lock chat
  const lockChat = useCallback(() => {
    setIsLocked(true);
  }, []);

  // Unlock chat
  const unlockChat = useCallback(() => {
    setIsLocked(false);
  }, []);

  // Set booking step
  const setBookingStep = useCallback((step: BookingStep) => {
    setChatState(prev => ({ ...prev, bookingStep: step }));
  }, []);

  // Set selected duration
  const setSelectedDuration = useCallback((duration: number) => {
    setChatState(prev => ({ ...prev, selectedDuration: duration }));
  }, []);

  // Set selected date and time
  const setSelectedDateTime = useCallback((date: string, time: string) => {
    setChatState(prev => ({ ...prev, selectedDate: date, selectedTime: time }));
  }, []);

  // Set customer details
  const setCustomerDetails = useCallback((details: { 
    name: string; 
    whatsApp: string; 
    location: string; 
    coordinates?: { lat: number; lng: number } 
  }) => {
    setChatState(prev => ({
      ...prev,
      customerName: details.name,
      customerWhatsApp: details.whatsApp,
      customerLocation: details.location,
      coordinates: details.coordinates || null,
    }));
    // Also update the user name for messages
    if (details.name) {
      setCurrentUserName(details.name);
    }
  }, []);

  // Send message - SAVES TO APPWRITE (with spam detection)
  const sendMessage = useCallback(async (messageContent: string): Promise<{ sent: boolean; warning?: string }> => {
    console.log('═══════════════════════════════════════════');
    console.log('🔍 [SEND MESSAGE] Validation Check');
    console.log('═══════════════════════════════════════════');
    console.log('Current User ID:', currentUserId || '❌ MISSING');
    console.log('Current User Name:', currentUserName || '❌ MISSING');
    console.log('Message Content Length:', messageContent?.trim()?.length || 0);
    console.log('Therapist:', chatState.therapist?.name || '❌ MISSING', chatState.therapist?.id || '');
    console.log('═══════════════════════════════════════════');
    
    if (!currentUserId || !messageContent.trim() || !chatState.therapist) {
      console.error('❌ Cannot send message: missing required data');
      console.error('   - currentUserId:', !!currentUserId);
      console.error('   - messageContent:', !!messageContent.trim());
      console.error('   - therapist:', !!chatState.therapist);
      return { sent: false, warning: 'Missing required information to send message' };
    }

    const therapist = chatState.therapist;
    const roomId = `${currentUserId}_${therapist.id}`;
    
    // ============================================================================
    // 🔒 SERVER-ENFORCED MESSAGE VALIDATION (TAMPER RESISTANT)
    // ============================================================================
    // ALL messages go through the backend Appwrite Function.
    // No direct database writes - server validates and saves.
    // Client-side bypass is IMPOSSIBLE.
    // ============================================================================
    
    console.log('📤 [SERVER-ENFORCED] Sending message to:', therapist.name);

    // Quick UI feedback (not security - server does real validation)
    const quickCheck = serverEnforcedChatService.quickValidate(messageContent);
    if (quickCheck.mayBeBlocked) {
      console.log('⚠️ Quick check flagged message - server will validate');
    }

    // Prepare server request
    const serverRequest: SendMessageRequest = {
      senderId: currentUserId,
      senderName: currentUserName || chatState.customerName || 'Guest',
      senderType: 'customer',
      recipientId: therapist.id,
      recipientName: therapist.name,
      recipientType: 'therapist',
      message: messageContent.trim(),
      roomId,
    };

    try {
      // 🔒 Send through SERVER-ENFORCED endpoint
      const response: SendMessageResponse = await serverEnforcedChatService.sendMessage(serverRequest);

      // Handle server response
      if (response.isRestricted) {
        console.warn('🚫 [SERVER] Account restricted');
        return { 
          sent: false, 
          warning: response.message || '🚫 Your account has been restricted due to policy violations.'
        };
      }

      if (response.isViolation) {
        console.warn('⚠️ [SERVER] Violation detected:', response.violationType);
        return { 
          sent: false, 
          warning: response.message || '🚫 Message blocked: Contact information sharing is prohibited.'
        };
      }

      if (!response.success) {
        console.error('❌ [SERVER] Send failed:', response.error);
        return { sent: false, warning: response.message };
      }

      // ✅ Message validated and saved by server
      console.log('✅ [SERVER] Message sent:', response.messageId);

      // Add to local state for immediate UI update
      // (Real-time subscription will confirm)
      const newMessage: ChatMessage = {
        $id: response.messageId || `local_${Date.now()}`,
        senderId: currentUserId,
        senderName: currentUserName || chatState.customerName || 'Guest',
        senderType: 'customer',
        recipientId: therapist.id,
        recipientName: therapist.name,
        message: messageContent.trim(),
        createdAt: new Date().toISOString(),
        read: false,
        messageType: 'text',
        roomId,
        isSystemMessage: false,
      };

      setChatState(prev => {
        // Avoid duplicates
        if (prev.messages.some(m => m.$id === newMessage.$id)) {
          return prev;
        }
        return {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
      });
      
      return { sent: true };

    } catch (error) {
      console.error('❌ [SERVER] Failed to send message:', error);
      return { sent: false, warning: 'Failed to send message. Please try again.' };
    }
  }, [currentUserId, currentUserName, chatState.therapist, chatState.customerName]);

  // Add system notification message
  const addSystemNotification = useCallback((message: string) => {
    const systemMessage: ChatMessage = {
      $id: `system_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: 'system',
      senderName: 'System',
      senderType: 'system',
      recipientId: chatState.therapist?.id || '',
      recipientName: chatState.therapist?.name || '',
      message,
      createdAt: new Date().toISOString(),
      read: true,
      messageType: 'system',
      roomId: '',
      isSystemMessage: true,
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, systemMessage],
    }));
  }, [chatState.therapist]);

  // Start countdown timer for booking actions
  const startCountdown = useCallback((seconds: number, onExpire: () => void) => {
    // Clear existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    setChatState(prev => ({ ...prev, bookingCountdown: seconds }));
    
    countdownTimerRef.current = setInterval(() => {
      setChatState(prev => {
        if (prev.bookingCountdown === null || prev.bookingCountdown <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          onExpire();
          return { ...prev, bookingCountdown: null };
        }
        return { ...prev, bookingCountdown: prev.bookingCountdown - 1 };
      });
    }, 1000);
  }, []);

  // Stop countdown timer
  const stopCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setChatState(prev => ({ ...prev, bookingCountdown: null }));
  }, []);

  // Create a new booking using BookingLifecycleService
  // 🔒 STRICT AVAILABILITY ENFORCEMENT - UI LEVEL
  const createBooking = useCallback(async (bookingData: Partial<BookingData>) => {
    const therapist = chatState.therapist;
    const duration = bookingData.duration || chatState.selectedDuration || 60;
    const price = bookingData.totalPrice || (bookingData as any).price || 0;
    
    // Determine booking type
    const isScheduled = !!(bookingData.scheduledDate || chatState.selectedDate);
    const bookingType = isScheduled ? BookingType.SCHEDULED : BookingType.BOOK_NOW;
    
    // 🔒 STRICT AVAILABILITY CHECK - NO OVERRIDE ALLOWED
    const therapistStatus = therapist?.availabilityStatus || therapist?.status;
    const availabilityCheck = availabilityEnforcementService.canBook(therapistStatus, bookingType);
    
    if (!availabilityCheck.allowed) {
      console.log(`🚫 [AvailabilityEnforcement] Booking blocked: ${availabilityCheck.reason}`);
      addSystemNotification(availabilityCheck.userMessage || 'Booking not available');
      return false; // EXIT - Booking creation failed
    }
    
    // Calculate commission (30% admin, 70% provider) - uses price which is already discounted if applicable
    const { adminCommission, providerPayout } = bookingLifecycleService.calculateCommission(price);
    
    // Create booking via lifecycle service (server-authoritative)
    try {
      const lifecycleBooking = await bookingLifecycleService.createBooking({
        customerId: currentUserId,
        customerName: currentUserName || chatState.customerName || 'Guest',
        customerPhone: chatState.customerWhatsApp || '',
        therapistId: therapist?.id,
        therapistName: therapist?.name,
        providerType: 'therapist',
        serviceType: bookingData.serviceType || 'massage',
        duration,
        locationZone: bookingData.locationZone || chatState.customerLocation || '',
        locationCoordinates: bookingData.coordinates || chatState.coordinates || undefined,
        bookingType,
        totalPrice: price,
        notes: bookingData.scheduledDate ? `Scheduled: ${bookingData.scheduledDate} ${bookingData.scheduledTime || ''}` : undefined,
        therapistStatus, // Pass status for API-level enforcement
        // Include discount info if present
        discountCode: bookingData.discountCode,
        discountPercentage: bookingData.discountPercentage,
        originalPrice: bookingData.originalPrice,
      });
      // Create local booking state aligned with lifecycle
      const booking: BookingData = {
        id: lifecycleBooking.bookingId,
        bookingId: lifecycleBooking.bookingId,
        documentId: lifecycleBooking.$id,
        status: 'pending',
        lifecycleStatus: BookingLifecycleStatus.PENDING,
        therapistId: therapist?.id || '',
        therapistName: therapist?.name || '',
        providerType: 'therapist',
        customerId: currentUserId,
        customerName: currentUserName || chatState.customerName || 'Guest',
        customerPhone: chatState.customerWhatsApp,
        serviceType: bookingData.serviceType || 'massage',
        duration,
        locationZone: bookingData.locationZone || chatState.customerLocation || '',
        coordinates: bookingData.coordinates || chatState.coordinates || undefined,
        bookingType,
        totalPrice: price,
        adminCommission,
        providerPayout,
        // Discount fields
        discountCode: bookingData.discountCode,
        discountPercentage: bookingData.discountPercentage,
        originalPrice: bookingData.originalPrice,
        discountedPrice: bookingData.discountCode ? price : undefined,
        createdAt: lifecycleBooking.createdAt,
        pendingAt: lifecycleBooking.pendingAt,
        scheduledDate: bookingData.scheduledDate || chatState.selectedDate || undefined,
        scheduledTime: bookingData.scheduledTime || chatState.selectedTime || undefined,
      };
      
      setChatState(prev => ({ ...prev, currentBooking: booking }));
      
      // Add notification for user
      if (bookingData.discountCode) {
        addSystemNotification(`📨 Your booking request has been sent with ${bookingData.discountPercentage}% discount applied! Waiting for therapist confirmation...`);
      } else {
        addSystemNotification('📨 Your booking request has been sent. Waiting for therapist confirmation...');
      }
      
      // Start 5 minute countdown for therapist response
      startCountdown(300, async () => {
        // Therapist didn't respond in time - expire booking and broadcast to ALL therapists
        if (lifecycleBooking.$id) {
          await bookingLifecycleService.expireBooking(lifecycleBooking.$id, 'Therapist response timeout');
        }
        addSystemNotification('⏰ 5-minute timer expired! Your booking is now being sent to ALL available and busy therapists. First to accept gets the booking.');
        setChatState(prev => ({
          ...prev,
          currentBooking: prev.currentBooking ? { 
            ...prev.currentBooking, 
            status: 'waiting_others',
            lifecycleStatus: BookingLifecycleStatus.EXPIRED 
          } : null,
        }));
      });
      
      console.log('📋 [BookingLifecycle] Booking created:', booking);
      console.log(`💰 Commission: Admin ${adminCommission} IDR (30%) | Provider ${providerPayout} IDR (70%)`);
      if (bookingData.discountCode) {
        console.log(`🎁 Discount Applied: ${bookingData.discountCode} (${bookingData.discountPercentage}%) - Original: ${bookingData.originalPrice} → Final: ${price}`);
      }
      
      // Return success indicator
      const bookingSuccess = true;
      
      // 🔊 SEND NOTIFICATIONS: Therapist alert with sound + Admin notification
      try {
        // Import notification services dynamically to avoid circular dependencies
        const { notificationService } = await import('../lib/appwriteService');
        const { notificationSoundManager } = await import('../lib/notificationSound');
        
        // Send notification to therapist/provider
        if (therapist?.id) {
          console.log('🔔 Sending notification to therapist:', therapist.id);
          await notificationService.sendNewBookingNotification(
            therapist.id,
            currentUserId,
            currentUserName || chatState.customerName || 'Guest',
            duration,
            price,
            lifecycleBooking.$id || booking.$id || ''
          );
          
          // 🎵 PLAY MUSIC/SOUND for therapist (if they're online)
          notificationSoundManager.play();
          console.log('🎵 Notification sound played for therapist');
        }
        
        // Send notification to admin
        console.log('📧 Sending notification to admin dashboard');
        await notificationService.sendAdminNotification({
          type: 'new_booking',
          bookingId: lifecycleBooking.$id || booking.$id || '',
          therapistId: therapist?.id,
          therapistName: therapist?.name,
          customerId: currentUserId,
          customerName: currentUserName || chatState.customerName || 'Guest',
          duration,
          price,
          commission: adminCommission,
          timestamp: new Date().toISOString()
        });
        console.log('✅ Admin notification sent');
        
      } catch (notificationError) {
        // Don't fail booking if notification fails - just log error
        console.error('⚠️ Failed to send notifications (booking still created):', notificationError);
      }
      
      return bookingSuccess; // Booking created successfully
      
    } catch (error) {
      console.error('❌ [BookingLifecycle] Failed to create booking:', error);
      addSystemNotification('❌ Failed to create booking. Please try again.');
      return false; // Booking creation failed
    }
  }, [chatState.therapist, chatState.selectedDuration, chatState.customerLocation, chatState.coordinates, chatState.selectedDate, chatState.selectedTime, chatState.customerName, chatState.customerWhatsApp, currentUserId, currentUserName, addSystemNotification, startCountdown]);

  // Update booking status
  const updateBookingStatus = useCallback((status: BookingStatus) => {
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? { ...prev.currentBooking, status } : null,
    }));
  }, []);

  // Therapist accepts booking (PENDING → ACCEPTED)
  // 🔒 AUTO-INJECTS BANK CARD DETAILS FOR SCHEDULED BOOKINGS
  const acceptBooking = useCallback(async () => {
    stopCountdown();
    
    const currentBooking = chatState.currentBooking;
    const therapist = chatState.therapist;
    const therapistName = therapist?.name || 'Therapist';
    const isScheduledBooking = currentBooking?.bookingType === BookingType.SCHEDULED;
    
    // Update via lifecycle service (server-authoritative)
    if (currentBooking?.documentId) {
      try {
        await bookingLifecycleService.acceptBooking(currentBooking.documentId);
      } catch (error) {
        console.error('❌ [BookingLifecycle] Failed to accept booking:', error);
      }
    }
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'therapist_accepted',
        lifecycleStatus: BookingLifecycleStatus.ACCEPTED,
        acceptedAt: new Date().toISOString(),
        therapistAcceptedAt: new Date().toISOString(),
      } : null,
    }));
    
    // Notify user
    addSystemNotification(`✅ Therapist ${therapistName} accepted your booking. You have 1 minute to confirm or the booking is canceled.`);
    
    // 🔒 AUTO-INJECT BANK CARD FOR SCHEDULED BOOKINGS
    if (isScheduledBooking && therapist?.bankCardDetails) {
      const bankCard = secureBankCardService.parseBankCardString(therapist.bankCardDetails);
      const bookingAmount = currentBooking?.totalPrice;
      const bankCardMessage = secureBankCardService.formatSystemMessage(bankCard, bookingAmount);
      
      // Inject bank card details as system message
      setTimeout(() => {
        addSystemNotification(bankCardMessage);
        console.log('💳 [SecureBankCard] Auto-injected bank details for scheduled booking');
      }, 500); // Small delay for better UX
    }
    
    // Start 1 minute countdown for user confirmation
    startCountdown(60, async () => {
      // User didn't confirm in time - expire booking
      if (currentBooking?.documentId) {
        await bookingLifecycleService.expireBooking(currentBooking.documentId, 'Customer confirmation timeout');
      }
      addSystemNotification('❌ Booking expired due to no confirmation. Please select a new therapist from the homepage.');
      setChatState(prev => ({
        ...prev,
        currentBooking: prev.currentBooking ? { 
          ...prev.currentBooking, 
          status: 'expired',
          lifecycleStatus: BookingLifecycleStatus.EXPIRED 
        } : null,
      }));
    });
  }, [chatState.therapist, chatState.currentBooking, stopCountdown, addSystemNotification, startCountdown]);

  // Therapist rejects booking (PENDING/ACCEPTED → DECLINED)
  const rejectBooking = useCallback(async () => {
    stopCountdown();
    
    const currentBooking = chatState.currentBooking;
    
    // Update via lifecycle service (server-authoritative)
    if (currentBooking?.documentId) {
      try {
        await bookingLifecycleService.declineBooking(currentBooking.documentId, 'Therapist declined');
      } catch (error) {
        console.error('❌ [BookingLifecycle] Failed to decline booking:', error);
      }
    }
    
    addSystemNotification('❌ Booking rejected. Your request is being sent to other available therapists.');
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? { ...prev.currentBooking, status: 'waiting_others' } : null,
    }));
    
    // Start new 5 minute countdown for other therapists
    startCountdown(300, () => {
      addSystemNotification('⏰ No other therapists available. Please try again later or select a different therapist.');
      setChatState(prev => ({
        ...prev,
        currentBooking: prev.currentBooking ? { 
          ...prev.currentBooking, 
          status: 'cancelled',
          lifecycleStatus: BookingLifecycleStatus.DECLINED 
        } : null,
      }));
    });
  }, [stopCountdown, addSystemNotification, startCountdown]);

  // User confirms booking after therapist accepted (ACCEPTED → CONFIRMED)
  const confirmBooking = useCallback(async () => {
    stopCountdown();
    
    const currentBooking = chatState.currentBooking;
    
    // Update via lifecycle service (server-authoritative)
    if (currentBooking?.documentId) {
      try {
        await bookingLifecycleService.confirmBooking(currentBooking.documentId);
      } catch (error) {
        console.error('❌ [BookingLifecycle] Failed to confirm booking:', error);
      }
    }
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'user_confirmed',
        lifecycleStatus: BookingLifecycleStatus.CONFIRMED,
        confirmedAt: new Date().toISOString(),
        userConfirmedAt: new Date().toISOString(),
      } : null,
    }));
    
    const therapistName = chatState.therapist?.name || 'Therapist';
    addSystemNotification(`🎉 Booking confirmed! ${therapistName} will notify you when they are on the way.`);
  }, [chatState.therapist, chatState.currentBooking, stopCountdown, addSystemNotification]);

  // Cancel booking (any state → DECLINED)
  const cancelBooking = useCallback(async () => {
    stopCountdown();
    
    const currentBooking = chatState.currentBooking;
    
    // Update via lifecycle service (server-authoritative)
    if (currentBooking?.documentId) {
      try {
        await bookingLifecycleService.declineBooking(currentBooking.documentId, 'Cancelled by user');
      } catch (error) {
        console.error('❌ [BookingLifecycle] Failed to cancel booking:', error);
      }
    }
    
    addSystemNotification('❌ Booking canceled. Please select a new therapist from the homepage.');
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? { 
        ...prev.currentBooking, 
        status: 'cancelled',
        lifecycleStatus: BookingLifecycleStatus.DECLINED 
      } : null,
    }));
  }, [chatState.currentBooking, stopCountdown, addSystemNotification]);

  // Therapist is on the way
  const setOnTheWay = useCallback(() => {
    const therapistName = chatState.therapist?.name || 'Therapist';
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'on_the_way',
        therapistOnTheWayAt: new Date().toISOString(),
      } : null,
    }));
    
    addSystemNotification(`🚗 ${therapistName} is on the way!`);
  }, [chatState.therapist, addSystemNotification]);

  // Complete booking (CONFIRMED → COMPLETED) - This is the only state that generates commission
  const completeBooking = useCallback(async () => {
    const currentBooking = chatState.currentBooking;
    const duration = currentBooking?.duration || 60;
    const totalTime = `${duration + 30}-${duration + 60}`; // Massage time + 30-60 min travel
    
    // Update via lifecycle service (server-authoritative)
    // Only COMPLETED bookings count for admin commission
    if (currentBooking?.documentId) {
      try {
        await bookingLifecycleService.completeBooking(currentBooking.documentId);
        console.log(`💰 [BookingLifecycle] Commission recorded - Admin: ${currentBooking.adminCommission} IDR | Provider: ${currentBooking.providerPayout} IDR`);
      } catch (error) {
        console.error('❌ [BookingLifecycle] Failed to complete booking:', error);
      }
    }
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'completed',
        lifecycleStatus: BookingLifecycleStatus.COMPLETED,
        completedAt: new Date().toISOString(),
      } : null,
    }));
    
    addSystemNotification(`✨ Service completed!\n\n⏱️ Total session: ${totalTime} minutes\n   • Massage: ${duration} min\n   • Travel time: 30-60 min\n\n💳 PAYMENT OPTIONS:\n💵 Cash - Pay directly to therapist\n🏦 Bank Transfer - Use bank details in chat\n\n⚠️ IndaStreet suggests using bank details shared in this chat window to prevent any misunderstanding. If bank details not shared, please request therapist to post them in chat.`);
  }, [chatState.currentBooking, addSystemNotification]);

  // 🔒 Share bank card details SECURELY (masked display)
  const shareBankCard = useCallback(() => {
    const bankCardString = chatState.therapist?.bankCardDetails;
    const bookingAmount = chatState.currentBooking?.totalPrice;
    
    if (bankCardString) {
      // Parse and format securely with masked account number
      const bankCard = secureBankCardService.parseBankCardString(bankCardString);
      
      if (bankCard && secureBankCardService.isValidBankCard(bankCard)) {
        const secureMessage = secureBankCardService.formatSystemMessage(bankCard, bookingAmount);
        addSystemNotification(secureMessage);
        console.log('💳 [SecureBankCard] Displayed masked bank card details');
      } else {
        addSystemNotification('💳 Bank card details are not properly configured. Please contact the therapist.');
      }
    } else {
      addSystemNotification('💳 Bank card details not available. Please contact the therapist for payment information.');
    }
  }, [chatState.therapist, chatState.currentBooking, addSystemNotification]);

  // Confirm payment
  const confirmPayment = useCallback((method: 'cash' | 'bank_transfer') => {
    const methodLabel = method === 'cash' ? 'Cash' : 'Bank Transfer';
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        paymentMethod: method,
        paymentStatus: method === 'cash' ? 'received' : 'transferred',
      } : null,
    }));
    
    addSystemNotification(`✅ Payment confirmed via ${methodLabel}. Thank you!`);
  }, [addSystemNotification]);

  // Update therapist
  const updateTherapist = useCallback((updates: Partial<ChatTherapist>) => {
    setChatState(prev => ({
      ...prev,
      therapist: prev.therapist ? { ...prev.therapist, ...updates } : null,
    }));
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // 🔒 AVAILABILITY ENFORCEMENT UTILITIES
  // These allow UI components to check availability before showing Book Now button
  const canBookNow = useCallback((therapistStatus?: string): boolean => {
    const status = therapistStatus || chatState.therapist?.availabilityStatus || chatState.therapist?.status;
    return availabilityEnforcementService.canBookNow(status);
  }, [chatState.therapist]);

  const canSchedule = useCallback((therapistStatus?: string): boolean => {
    const status = therapistStatus || chatState.therapist?.availabilityStatus || chatState.therapist?.status;
    return availabilityEnforcementService.canSchedule(status);
  }, [chatState.therapist]);

  const getAvailabilityMessage = useCallback((therapistStatus?: string, bookingType?: BookingType): string | null => {
    const status = therapistStatus || chatState.therapist?.availabilityStatus || chatState.therapist?.status;
    const type = bookingType || BookingType.BOOK_NOW;
    const result = availabilityEnforcementService.canBook(status, type);
    return result.allowed ? null : (result.userMessage || null);
  }, [chatState.therapist]);

  const contextValue: PersistentChatContextValue = {
    chatState,
    isLocked,
    isConnected,
    openChat,
    openChatWithService, // From Menu Harga with pre-selected service
    minimizeChat,
    maximizeChat,
    closeChat,
    lockChat,
    unlockChat,
    setBookingStep,
    setSelectedDuration,
    setSelectedDateTime,
    setCustomerDetails,
    addMessage,
    sendMessage,
    updateTherapist,
    // 🔒 Availability enforcement utilities
    canBookNow,
    canSchedule,
    getAvailabilityMessage,
    // Booking workflow functions
    createBooking,
    updateBookingStatus,
    acceptBooking,
    rejectBooking,
    confirmBooking,
    cancelBooking,
    setOnTheWay,
    completeBooking,
    shareBankCard,
    confirmPayment,
    addSystemNotification,
  };

  return (
    <PersistentChatContext.Provider value={contextValue}>
      {children}
    </PersistentChatContext.Provider>
  );
}

// Hook to use persistent chat
export function usePersistentChat() {
  const context = useContext(PersistentChatContext);
  if (!context) {
    throw new Error('usePersistentChat must be used within PersistentChatProvider');
  }
  return context;
}

// Export context
export { PersistentChatContext };
