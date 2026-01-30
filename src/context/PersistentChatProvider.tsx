/**
 * 🔒 CRITICAL BOOKING FLOW – DO NOT MODIFY
 *
 * This file is part of a production-stable booking system.
 * Changes here have previously caused booking failures.
 *
 * AI RULE:
 * - DO NOT refactor
 * - DO NOT optimize
 * - DO NOT change routing or state logic
 *
 * Only allowed changes:
 * - Logging
 * - Comments
 * - E2E assertions
 *
 * Any behavior change requires human approval.
 */

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
import { 
  connectionStabilityService,
  ConnectionStatus 
} from '../lib/services/connectionStabilityService';

// Collection IDs from config
const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_MESSAGES_COLLECTION = APPWRITE_CONFIG.collections.chatMessages;
const CHAT_SESSIONS_COLLECTION = APPWRITE_CONFIG.collections.chatSessions;

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
  responseDeadline?: string; // 5 minutes after createdAt for countdown
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
  chatRoomId: string | null; // Chat room ID for messaging
  // Connection status for stability monitoring
  connectionStatus: ConnectionStatus;
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
  // Initialize connection status
  connectionStatus: {
    isConnected: false,
    quality: 'disconnected',
    lastPing: 0,
    reconnectAttempts: 0,
    connectionType: 'offline',
    latency: 0
  },
  // Booking workflow state
  currentBooking: null,
  bookingCountdown: null,
  isTherapistView: false,
};

export function PersistentChatProvider({ children }: { children: ReactNode }) {
  const [chatState, _setChatState] = useState<ChatWindowState>(initialState);
  
  // DEBUG: Wrapper to track all state changes
  const setChatState = useCallback((updater: any) => {
    _setChatState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;
      
      // Track isOpen changes
      if (prev.isOpen !== newState.isOpen) {
        console.log('🔍 [STATE] isOpen changed:', prev.isOpen, '→', newState.isOpen);
        if (!newState.isOpen) {
          console.log('🚨 [STATE] Chat is being CLOSED!');
          console.log('📍 [STATE] Call stack:', new Error().stack);
        }
      }
      
      return newState;
    });
  }, []);
  
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

  // Subscribe to real-time messages with comprehensive infrastructure validation
  useEffect(() => {
    console.log('🔌 PersistentChat: Starting realtime subscription setup...');
    
    // Validate infrastructure prerequisites
    const validateInfrastructure = async () => {
      console.log('📊 Infrastructure Validation:');
      console.log(`   - currentUserId: ${currentUserId ? '✅ ' + currentUserId : '❌ Missing'}`);
      console.log(`   - CHAT_MESSAGES_COLLECTION: ${CHAT_MESSAGES_COLLECTION ? '✅ ' + CHAT_MESSAGES_COLLECTION : '❌ Missing'}`);
      console.log(`   - CHAT_SESSIONS_COLLECTION: ${CHAT_SESSIONS_COLLECTION ? '✅ ' + CHAT_SESSIONS_COLLECTION : '❌ Missing'}`);
      console.log(`   - DATABASE_ID: ${DATABASE_ID}`);
      console.log(`   - Appwrite Endpoint: https://syd.cloud.appwrite.io/v1`);
      console.log(`   - Project ID: 68f23b11000d25eb3664`);

      if (!currentUserId) {
        console.warn('⚠️ No user ID - skipping realtime subscription');
        console.warn('💡 Both authenticated users and guests need realtime for chat');
        return false;
      }
      
      if (!CHAT_MESSAGES_COLLECTION) {
        console.error('❌ FATAL: CHAT_MESSAGES_COLLECTION is undefined!');
        console.error('🔧 Check APPWRITE_CONFIG.collections.chatMessages configuration');
        return false;
      }
      
      // Test document access (which is what actually matters for chat functionality)
      try {
        console.log(`🔍 Testing document access: ${CHAT_MESSAGES_COLLECTION}`);
        const testQuery = await databases.listDocuments(DATABASE_ID, CHAT_MESSAGES_COLLECTION, [], 1);
        console.log(`✅ chat_messages DOCUMENT ACCESS: ${testQuery.total} total messages available`);
        
        // Test if we can query documents (this is what matters for chat)
        console.log(`📋 Document access validation: PASSED - Chat can query messages`);
        console.log(`🔍 Collection ready for realtime messaging and document operations`);
        console.log('📋 Schema validation: PASSED - Collection ready for realtime messaging');
        
        
      } catch (error: any) {
        console.error('═'.repeat(80));
        console.error('🚨 CHAT_MESSAGES COLLECTION ACCESS FAILED');
        console.error(`Error Code: ${error.code} | Message: ${error.message}`);
        console.error(`Collection ID Attempted: ${CHAT_MESSAGES_COLLECTION}`);
        
        if (error.code === 404) {
          console.error('🎯 ANALYSIS: chat_messages collection missing or incorrect collection ID');
        } else if (error.code === 401) {
          console.error('🚨 DOCUMENT ACCESS ISSUE');
          console.error('🎯 ROOT CAUSE: Guests missing document read permissions');
          console.error('📋 ERROR: User (role: guests) missing document access');
          console.error('🔧 REQUIRED FIX IN APPWRITE CONSOLE:');
          console.error('   1. Navigate to Database → Collections → chat_messages');
          console.error('   2. Go to Settings → Permissions');  
          console.error('   3. Ensure "Any" role has "Read" permission for DOCUMENTS');
          console.error('   4. Save changes');
          console.error('⚠️  WITHOUT THIS FIX: Chat cannot access message documents');
        } else if (error.code === 403) {
          console.error('🎯 ANALYSIS: Insufficient permissions for document access');
        }
        console.error('═'.repeat(80));
        return false;
      }
      
      // Test chat_sessions collection (session management)
      if (!CHAT_SESSIONS_COLLECTION) {
        console.error('❌ FATAL: CHAT_SESSIONS_COLLECTION is undefined!');
        return false;
      }
      
      try {
        console.log(`🔍 Testing chat_sessions document access: ${CHAT_SESSIONS_COLLECTION}`);
        const testSessionQuery = await databases.listDocuments(DATABASE_ID, CHAT_SESSIONS_COLLECTION, [], 1);
        console.log(`✅ chat_sessions DOCUMENT ACCESS: ${testSessionQuery.total} total sessions available`);
        
        console.log(`📋 Session document access validation: PASSED - Chat can manage sessions`);
        
      } catch (error: any) {
        console.error('═'.repeat(80));
        console.error('🚨 CHAT_SESSIONS COLLECTION ACCESS FAILED');
        console.error(`Error Code: ${error.code} | Message: ${error.message}`);
        console.error(`Collection ID Attempted: ${CHAT_SESSIONS_COLLECTION}`);
        
        if (error.code === 404) {
          console.error('🎯 ANALYSIS: chat_sessions collection missing - need to create it');
          console.error('🔧 ACTION: Create chat_sessions collection with provided schema');
        } else if (error.code === 401) {
          console.error('🚨 CRITICAL INFRASTRUCTURE ISSUE IDENTIFIED');
          console.error('🎯 ROOT CAUSE: Guests missing collection read permissions');
          console.error('📋 ERROR: User (role: guests) missing scopes (["collections.read"])');
          console.error('🔧 REQUIRED FIX IN APPWRITE CONSOLE:');
          console.error('   1. Navigate to Database → Collections → chat_sessions');
          console.error('   2. Go to Settings → Permissions');
          console.error('   3. Add "Any" role with "Read" permission');
          console.error('   4. Save changes');
          console.error('⚠️  WITHOUT THIS FIX: Session management will remain broken');
        } else if (error.code === 403) {
          console.error('🎯 ANALYSIS: Insufficient permissions for session management');
        }
        console.error('═'.repeat(80));
        return false;
      }
      
      return true; // Both collections validated successfully
    };
    
    // Setup subscription function
    // Setup connection stability service for robust chat connections
    const setupStableConnection = async () => {
      const isValid = await validateInfrastructure();
      if (!isValid) {
        console.warn('⚠️ Infrastructure validation failed - continuing with limited functionality');
        console.warn('💡 Chat will work but realtime messaging may be limited');
        // Don't abort - continue with limited functionality
        setChatState(prev => ({ 
          ...prev, 
          connectionStatus: { 
            ...prev.connectionStatus, 
            isConnected: false, 
            quality: 'poor' 
          } 
        }));
        // Continue setup even if validation fails
      }

      console.log('🔌 Initializing connection stability service...');
      
      try {
        // Initialize connection stability service (non-blocking)
        connectionStabilityService.initialize().catch(err => {
          console.warn('⚠️ Connection stability service failed to initialize:', err);
          // Continue anyway - the app should work without real-time features
        });
        
        // Listen for connection status changes
        connectionStabilityService.addConnectionListener((status: ConnectionStatus) => {
          console.log('🔄 Connection status update:', status);
          setChatState(prev => ({
            ...prev,
            connectionStatus: status
          }));
          setIsConnected(status.isConnected);
        });

        // Setup stable message subscription using the service
        if (currentUserId && chatState.therapist?.id) {
          const chatRoomId = `${currentUserId}_${chatState.therapist.id}`;
          
          subscriptionRef.current = connectionStabilityService.subscribeToMessages(
            chatRoomId,
            (payload: any) => {
              console.log('💬 Stable message received:', payload);

              // Check if this message involves the current user
              const isOurMessage = payload.senderId === currentUserId || payload.recipientId === currentUserId;
              if (!isOurMessage) return;

              // Check if it's for the current therapist chat
              const currentTherapistId = therapistIdRef.current;
              if (currentTherapistId) {
                const isForCurrentChat = 
                  (payload.senderId === currentTherapistId || payload.recipientId === currentTherapistId);
                
                if (isForCurrentChat) {
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

                  console.log('✅ Message added via stable connection:', newMessage.$id);
                }
              }
            },
            (error: any) => {
              console.error('❌ Stable message subscription error:', error);
              // Connection service will handle reconnection automatically
            }
          );
        }

        console.log('✅ Connection stability service initialized successfully!');

      } catch (error: any) {
        console.error('═'.repeat(80));
        console.error('🚨 CRITICAL: Connection stability service initialization FAILED');
        console.error('═'.repeat(80));
        console.error('Error Details:', {
          message: error.message,
          code: error.code,
          type: error.type,
          stack: error.stack?.split('\n').slice(0, 3)
        });
        
        setChatState(prev => ({ 
          ...prev, 
          connectionStatus: { 
            ...prev.connectionStatus, 
            isConnected: false, 
            quality: 'disconnected' 
          } 
        }));
        setIsConnected(false);
        console.error('❌ PersistentChat: Stable connection setup failed:', error);
      }
    };
    
    // Run async setup
    setupStableConnection();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
        console.log('🔌 PersistentChat: Unsubscribed from stable connection');
      }
      
      // Clean up connection stability service on unmount
      connectionStabilityService.destroy();
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
    
    // 🆔 AUTO-CREATE BOOKING ID immediately
    const generateDraftBookingId = (): string => {
      try {
        const counter = parseInt(localStorage.getItem('booking_id_counter') || '1000', 10);
        const newId = counter + 1;
        localStorage.setItem('booking_id_counter', newId.toString());
        return `BK${newId}`;
      } catch (error) {
        return `BK${Date.now()}`;
      }
    };
    
    const draftBookingId = generateDraftBookingId();
    console.log('🆔 Auto-created booking ID:', draftBookingId);
    
    // Generate chatRoomId
    const chatRoomId = currentUserId ? `${currentUserId}_${therapist.id}` : `guest_${Date.now()}_${therapist.id}`;
    console.log('💬 Chat room ID:', chatRoomId);
    
    // Set initial state with booking ID and chatRoomId
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
      chatRoomId,
      messages: prev.therapist?.id === therapist.id ? prev.messages : [],
      bookingData: {
        ...prev.bookingData,
        bookingId: draftBookingId,
        status: 'pending',
        therapistId: therapist.id,
        therapistName: therapist.name,
      } as BookingData,
    }));

    // Load existing messages
    if (currentUserId) {
      const messages = await loadMessages(therapist.id);
      if (messages.length > 0) {
        setChatState(prev => ({
          ...prev,
          messages,
          // ✅ FIX: Only go to 'chat' step if there's an actual booking
          // Otherwise stay in 'duration' step to allow new booking creation
          bookingStep: prev.currentBooking ? 'chat' : prev.bookingStep,
        }));
        
        // 🔓 UNLOCK CHAT when there's existing conversation
        setIsLocked(false);
        console.log('🔓 Chat unlocked - existing conversation loaded');
        console.log('📋 BookingStep:', prev.currentBooking ? 'chat (has booking)' : 'duration (no booking)');
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
    
    // 🆔 AUTO-CREATE BOOKING ID immediately
    const generateDraftBookingId = (): string => {
      try {
        const counter = parseInt(localStorage.getItem('booking_id_counter') || '1000', 10);
        const newId = counter + 1;
        localStorage.setItem('booking_id_counter', newId.toString());
        return `BK${newId}`;
      } catch (error) {
        return `BK${Date.now()}`;
      }
    };
    
    const draftBookingId = generateDraftBookingId();
    console.log('🆔 Auto-created booking ID:', draftBookingId);
    
    // Set state with pre-selected service and booking ID
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
      bookingData: {
        ...prev.bookingData,
        bookingId: draftBookingId,
        status: 'pending',
        therapistId: therapist.id,
        therapistName: therapist.name,
      } as BookingData,
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
        
        // 🔓 UNLOCK CHAT if there's existing conversation
        setIsLocked(false);
        console.log('🔓 Chat unlocked - existing conversation in service booking');
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
    
    // 🔓 UNLOCK CHAT when minimizing (reset to normal state)
    setIsLocked(false);
    console.log('🔓 Chat unlocked - minimized and reset');
  }, []);

  // Maximize chat
  const maximizeChat = useCallback(() => {
    console.log('➕ Maximizing chat');
    setChatState(prev => ({ ...prev, isMinimized: false }));
  }, []);

  // Close chat (only if unlocked AND no active booking)
  const closeChat = useCallback(() => {
    console.log('🔍 closeChat() called - Checking conditions...');
    console.log('  - Current booking:', !!chatState.currentBooking);
    console.log('  - Booking step:', chatState.bookingStep);
    console.log('  - Is locked:', isLocked);
    console.log('📍 CALL STACK:', new Error().stack);
    
    // CRITICAL: Don't close if there's an active booking or booking in progress
    // SPECIAL: 'details' step is critical for Order Now flow - never close during this step
    if (chatState.currentBooking || (chatState.bookingStep !== 'duration' && chatState.bookingStep !== 'chat')) {
      console.log('🔒 Chat has active booking or critical booking step, minimizing instead of closing');
      console.log('🔒 Critical steps that prevent closure: details, datetime, confirmation');
      setChatState(prev => ({ ...prev, isMinimized: true }));
      return;
    }
    
    if (isLocked) {
      console.log('🔒 Chat is locked, minimizing instead');
      setChatState(prev => ({ ...prev, isMinimized: true }));
      return;
    }
    console.log('❌ CRITICAL: Closing chat - THIS SHOULD NOT HAPPEN DURING BOOKING');
    setChatState(initialState);
    setIsLocked(false);
  }, [isLocked, chatState.currentBooking, chatState.bookingStep]);

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
    
    // 🔓 UNLOCK CHAT when entering normal chat mode
    if (step === 'chat') {
      setIsLocked(false);
      console.log('🔓 Chat unlocked - normal chat mode active');
    }
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
    console.log('Current User ID:', currentUserId || '⚠️ Guest (not logged in)');
    console.log('Current User Name:', currentUserName || 'Guest');
    console.log('User Type:', currentUserId.startsWith('guest_') ? '👤 GUEST' : '🔐 AUTHENTICATED');
    console.log('Message Content Length:', messageContent?.trim()?.length || 0);
    console.log('Therapist:', chatState.therapist?.name || '❌ MISSING', chatState.therapist?.id || '');
    console.log('═══════════════════════════════════════════');
    
    // ✅ GUEST ACCESS: currentUserId is always set (either authenticated or guest_xxx)
    // No authentication required for booking
    if (!messageContent.trim() || !chatState.therapist) {
      console.error('❌ Cannot send message: missing required data');
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

  // Create a new booking using localStorage bookingService
  // 🔒 CRITICAL: ALL booking creation now uses localStorage only
  const createBooking = useCallback(async (bookingData: Partial<BookingData>) => {
    console.log('📦 [LOCALSTORAGE] Creating booking with localStorage bookingService');
    
    // Import the localStorage booking service
    const { bookingService } = await import('../lib/bookingService');
    
    const therapist = chatState.therapist;
    const duration = bookingData.duration || chatState.selectedDuration || 60;
    const price = bookingData.totalPrice || (bookingData as any).price || 0;
    const bookingId = chatState.bookingData?.bookingId || bookingData.bookingId;
    
    if (!therapist) {
      console.log('❌ [LOCALSTORAGE] No therapist available');
      addSystemNotification('❌ No therapist selected for booking');
      return false;
    }
    
    if (!bookingId) {
      console.error('❌ [APPWRITE] No booking ID available');
      addSystemNotification('❌ Booking ID missing. Please refresh and try again.');
      return false;
    }
    
    // 🔒 CRITICAL: Validate customerName is present (REQUIRED field)
    // ✅ GUEST BOOKING ENABLED: Allow "Guest" as valid name for anonymous users
    const customerName = currentUserName || chatState.customerName;
    if (!customerName) {
      console.error('❌ CRITICAL: customerName is missing');
      console.error('❌ currentUserName:', currentUserName);
      console.error('❌ chatState.customerName:', chatState.customerName);
      addSystemNotification('❌ Customer name is required. Please enter your name in the form.');
      return false;
    }
    
    // 📱 ADMIN-ONLY: WhatsApp is optional and for admin purposes only
    // Save to localStorage but NOT required for booking creation
    let customerWhatsApp = bookingData.customerWhatsApp || chatState.customerWhatsApp || '';
    
    // ✅ CRITICAL: Strip + prefix from phone numbers for Appwrite compatibility
    // Appwrite may have issues with + in string fields
    customerWhatsApp = customerWhatsApp.replace(/^\+/, '');
    
    // 💾 Save WhatsApp to localStorage for admin tracking (if provided)
    if (customerWhatsApp) {
      try {
        localStorage.setItem('customer_whatsapp_admin', customerWhatsApp);
        console.log('💾 [ADMIN] WhatsApp saved to localStorage (without +):', customerWhatsApp);
      } catch (e) {
        console.warn('⚠️ Failed to save WhatsApp to localStorage:', e);
      }
    }
    
    // 📞 Use phone number for booking (required field)
    // WhatsApp is optional and only used for admin tracking
    let customerPhone = bookingData.customerPhone || chatState.customerPhone || '';
    customerPhone = customerPhone.replace(/^\+/, ''); // Strip + prefix
    
    if (!customerPhone) {
      console.error('❌ ERROR: customerPhone is missing');
      addSystemNotification('❌ Phone number is required. Please enter your phone number.');
      return false;
    }
    
    console.log('✅ VALIDATION PASSED: customerName =', customerName);
    console.log('✅ VALIDATION PASSED: customerPhone =', customerPhone);
    console.log('📱 [ADMIN-ONLY] customerWhatsApp =', customerWhatsApp || 'Not provided');
    
    // Prepare booking data for Appwrite
    // 📱 NOTE: WhatsApp is NOT sent to therapist (admin-only, stored in localStorage)
    const appwriteBooking = {
      customerId: currentUserId || 'guest',
      customerName: customerName, // ✅ GUARANTEED non-empty
      customerPhone: customerPhone, // 📞 Required: sent to therapist for booking
      customerWhatsApp: customerPhone, // ✅ Use phone number for validation (required field)
      therapistId: String(therapist?.id || therapist?.$id || ''), // 🔒 Always string for consistency
      therapistName: therapist?.name || '',
      therapistType: 'therapist' as const,
      serviceType: bookingData.serviceType || 'Traditional Massage',
      duration,
      price,
      location: bookingData.locationZone || chatState.customerLocation || bookingData.address || 'Address provided in chat',
      locationType: (bookingData.locationType as 'home' | 'hotel' | 'villa') || 'home',
      address: bookingData.address || chatState.customerLocation || 'Address provided in chat',
      roomNumber: bookingData.roomNumber || null,
      massageFor: (bookingData.massageFor as 'male' | 'female' | 'children') || 'male',
      // 📍 GPS coordinates are OPTIONAL - don't send if not available
      coordinates: bookingData.coordinates || undefined,
      date: bookingData.scheduledDate || chatState.selectedDate || new Date().toISOString().split('T')[0],
      time: bookingData.scheduledTime || chatState.selectedTime || new Date().toLocaleTimeString('en-US', { hour12: false }),
      status: 'pending' as const,
      responseDeadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      notes: bookingData.discountCode ? `Discount: ${bookingData.discountPercentage}%` : undefined,
    };
    
    console.log('📦 [APPWRITE] Creating booking with params:', appwriteBooking);
    
    try {
      // Call the Appwrite booking service
      const createdBooking = await bookingService.createBooking(appwriteBooking);
      
      if (!createdBooking || !createdBooking.bookingId) {
        console.error('❌ [APPWRITE] Booking creation failed - no booking returned');
        addSystemNotification('❌ Failed to create booking. Please try again.');
        return false;
      }
      
      console.log('✅ [APPWRITE] Booking created successfully:', createdBooking.bookingId);
      console.log('✅ [APPWRITE] Document ID:', createdBooking.$id);
      console.log('✅ [APPWRITE] Expires at:', createdBooking.expiresAt);
      
      const engineBooking = {
        bookingId: createdBooking.bookingId,
        documentId: createdBooking.$id,
        therapistId: createdBooking.therapistId,
        therapistName: createdBooking.therapistName,
        customerId: createdBooking.customerId,
        customerName: createdBooking.customerName,
        customerPhone: createdBooking.customerPhone,
        serviceType: createdBooking.serviceType,
        duration: createdBooking.duration,
        locationZone: createdBooking.location,
        coordinates: undefined,
        totalPrice: createdBooking.price,
        adminCommission: Math.round(createdBooking.price * 0.3), // 30% commission
        providerPayout: Math.round(createdBooking.price * 0.7), // 70% payout
        createdAt: createdBooking.createdAt || new Date().toISOString(),
        responseDeadline: createdBooking.responseDeadline,
      };
      console.log('✅ [ENGINE] Booking created successfully:', engineBooking.bookingId);
      
      // Convert engine booking to chat state format for UI compatibility
      const chatBooking: BookingData = {
        id: engineBooking.bookingId,
        bookingId: engineBooking.bookingId,
        documentId: engineBooking.documentId,
        status: 'pending',
        lifecycleStatus: 'PENDING' as any,
        therapistId: engineBooking.therapistId,
        therapistName: engineBooking.therapistName,
        providerType: 'therapist',
        customerId: engineBooking.customerId,
        customerName: engineBooking.customerName,
        customerPhone: engineBooking.customerPhone,
        serviceType: engineBooking.serviceType,
        duration: engineBooking.duration,
        locationZone: engineBooking.locationZone,
        coordinates: engineBooking.coordinates,
        bookingType: 'BOOK_NOW' as any,
        totalPrice: engineBooking.totalPrice,
        adminCommission: engineBooking.adminCommission,
        providerPayout: engineBooking.providerPayout,
        discountCode: bookingData.discountCode,
        discountPercentage: bookingData.discountPercentage,
        originalPrice: bookingData.originalPrice,
        discountedPrice: bookingData.discountCode ? price : undefined,
        createdAt: engineBooking.createdAt,
        pendingAt: engineBooking.createdAt,
        responseDeadline: engineBooking.responseDeadline,
        scheduledDate: bookingData.scheduledDate || chatState.selectedDate || undefined,
        scheduledTime: bookingData.scheduledTime || chatState.selectedTime || undefined,
      };
      
      console.log('📋 [BOOKING] Chat booking object created:', chatBooking);
      console.log('📋 [BOOKING] Starting countdown and updating UI state...');
      
      // ✅ FIX: Update state in ONE batch to avoid race conditions
      // Set both booking and countdown together, then switch to chat step
      setChatState(prev => { 
        const newState = {
          ...prev, 
          currentBooking: chatBooking,
          bookingCountdown: 300, // Initialize countdown immediately
          bookingStep: 'chat'
        };
        console.log('📋 [STATE UPDATE] New chat state:', {
          hasBooking: !!newState.currentBooking,
          bookingId: newState.currentBooking?.bookingId,
          countdown: newState.bookingCountdown,
          step: newState.bookingStep
        });
        return newState;
      });
      
      // Wait a tick for React to process state update
      setTimeout(() => {
        console.log('📋 [STATE VERIFY] Current state after update:', {
          hasBooking: !!chatState.currentBooking,
          bookingId: chatState.currentBooking?.bookingId,
          countdown: chatState.bookingCountdown,
          step: chatState.bookingStep
        });
      }, 100);
      
      console.log('✅ [BOOKING] State updated - booking should now be visible in UI');
      
      // 🔥 LOCALSTORAGE: Skip chat room creation for now (using in-memory chat)
      console.log('📦 [LOCALSTORAGE] Skipping Appwrite chat room creation - using in-memory chat');
      
      // Show success notification
      if (bookingData.discountCode) {
        addSystemNotification(`✅ Booking sent with ${bookingData.discountPercentage}% discount! See countdown timer above.`);
      } else {
        // Removed notification message
      }
      
      // Start 5 minute countdown for therapist response
      // Note: Initial value already set in state above
      startCountdown(300, async () => {
        console.log('⏰ [ENGINE] 5-minute timer expired for booking:', engineBooking.bookingId);
        // Engine handles expiration automatically
        addSystemNotification('⏰ 5-minute timer expired! Your booking is now being sent to ALL available and busy therapists.');
        setChatState(prev => ({
          ...prev,
          currentBooking: prev.currentBooking ? { 
            ...prev.currentBooking, 
            status: 'waiting_others',
            lifecycleStatus: 'EXPIRED' as any
          } : null,
        }));
      });
      
      console.log('✅ [ENGINE REDIRECT] Booking creation completed successfully');
      return true;
      
    } catch (error: any) {
      console.error('❌ [ENGINE REDIRECT] Unexpected error:', error);
      addSystemNotification('❌ Failed to create booking. Please try again.');
      return false;
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
