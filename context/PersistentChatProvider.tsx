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
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { client, databases, ID, account } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';

// Collection IDs from config
const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_MESSAGES_COLLECTION = APPWRITE_CONFIG.collections.chatMessages;

// Booking status for workflow
export type BookingStatus = 
  | 'pending'           // Waiting for therapist response
  | 'waiting_others'    // Therapist timeout, sent to other therapists
  | 'therapist_accepted'// Therapist accepted, waiting user confirmation
  | 'user_confirmed'    // User confirmed, booking active
  | 'cancelled'         // Booking cancelled
  | 'on_the_way'        // Therapist en route
  | 'completed'         // Service completed
  | 'payment_pending'   // Waiting for payment
  | 'payment_received'; // Payment confirmed

// Booking data structure
export interface BookingData {
  id: string;
  status: BookingStatus;
  therapistId: string;
  therapistName: string;
  customerId: string;
  customerName: string;
  duration: number;
  price: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  scheduledDate?: string;
  scheduledTime?: string;
  createdAt: string;
  therapistAcceptedAt?: string;
  userConfirmedAt?: string;
  therapistOnTheWayAt?: string;
  completedAt?: string;
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

// Phone number detection regex - catches various formats
const PHONE_REGEX = /(\+?\d{1,4}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;
const CONTACT_PHRASES = /\b(call me|my number|contact me|whatsapp me|wa me|text me|phone|nomor|hubungi|telp|telepon|hp|handphone)\b/gi;

// Validate message for phone numbers and contact info
export const validateMessage = (message: string): { isValid: boolean; warning: string | null } => {
  // Check for phone number patterns
  const phoneMatches = message.match(PHONE_REGEX);
  if (phoneMatches) {
    // Filter out short numbers that might be prices or other numbers
    const suspiciousNumbers = phoneMatches.filter(match => {
      const digits = match.replace(/\D/g, '');
      return digits.length >= 8; // Phone numbers typically have 8+ digits
    });
    
    if (suspiciousNumbers.length > 0) {
      return {
        isValid: false,
        warning: '⚠️ Sharing personal contact information is strictly prohibited. Account will be deactivated on violation.'
      };
    }
  }
  
  // Check for contact-related phrases
  if (CONTACT_PHRASES.test(message)) {
    return {
      isValid: false,
      warning: '⚠️ Sharing personal contact information is strictly prohibited. Account will be deactivated on violation.'
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
  openChatWithService: (therapist: ChatTherapist, service: SelectedService) => void; // From Menu Harga
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
    
    setIsLocked(true);

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

  // Open chat with pre-selected service from Menu Harga
  // This skips the duration selection and goes directly to confirmation
  const openChatWithService = useCallback(async (therapist: ChatTherapist, service: { serviceName: string; duration: number; price: number }) => {
    console.log('💬 Opening chat with pre-selected service:', therapist.name, service);
    
    // Set state with pre-selected service - skip duration step
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      therapist,
      bookingMode: 'price', // Price mode from Menu Harga
      bookingStep: 'confirmation', // Skip to confirmation since service already selected
      selectedDuration: service.duration,
      selectedDate: null,
      selectedTime: null,
      selectedService: service, // Store the pre-selected service details
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
          // Keep confirmation step even with history - user chose specific service
        }));
      }
    }
  }, [currentUserId, loadMessages]);

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

  // Add local message (legacy compatibility)
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

  // Send message - SAVES TO APPWRITE (with spam detection)
  const sendMessage = useCallback(async (messageContent: string): Promise<{ sent: boolean; warning?: string }> => {
    if (!currentUserId || !messageContent.trim() || !chatState.therapist) {
      console.warn('Cannot send message: missing user, content, or therapist');
      return { sent: false };
    }

    // Validate message for phone numbers and contact info
    const validation = validateMessage(messageContent);
    if (!validation.isValid) {
      console.warn('⚠️ Message blocked - contact info detected');
      return { sent: false, warning: validation.warning || undefined };
    }

    const therapist = chatState.therapist;
    console.log('📤 Sending message to:', therapist.name);

    // Prepare message data
    const messageData = {
      senderId: currentUserId,
      senderName: currentUserName || chatState.customerName || 'Guest',
      senderType: 'customer',
      recipientId: therapist.id,
      recipientName: therapist.name,
      recipientType: 'therapist',
      message: messageContent.trim(),
      content: messageContent.trim(),
      createdAt: new Date().toISOString(),
      read: false,
      messageType: 'text',
      roomId: `${currentUserId}_${therapist.id}`,
      isSystemMessage: false,
    };

    try {
      // Save to Appwrite
      const response = await databases.createDocument(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION,
        ID.unique(),
        messageData
      );

      console.log('✅ Message saved to Appwrite:', response.$id);

      // Add to local state immediately
      const newMessage: ChatMessage = {
        ...messageData,
        $id: response.$id,
        senderType: 'customer',
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
      console.error('❌ Failed to send message:', error);
      
      // Still add locally so user sees their message
      const localMessage: ChatMessage = {
        ...messageData,
        $id: `failed_${Date.now()}`,
        senderType: 'customer',
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, localMessage],
      }));
      
      return { sent: false };
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

  // Create a new booking
  const createBooking = useCallback((bookingData: Partial<BookingData>) => {
    const booking: BookingData = {
      id: `booking_${Date.now()}`,
      status: 'pending',
      therapistId: chatState.therapist?.id || '',
      therapistName: chatState.therapist?.name || '',
      customerId: currentUserId,
      customerName: currentUserName || chatState.customerName || 'Guest',
      duration: bookingData.duration || chatState.selectedDuration || 60,
      price: bookingData.price || 0,
      location: bookingData.location || chatState.customerLocation || '',
      coordinates: bookingData.coordinates || chatState.coordinates || undefined,
      scheduledDate: bookingData.scheduledDate || chatState.selectedDate || undefined,
      scheduledTime: bookingData.scheduledTime || chatState.selectedTime || undefined,
      createdAt: new Date().toISOString(),
    };
    
    setChatState(prev => ({ ...prev, currentBooking: booking }));
    
    // Add notification for user
    addSystemNotification('📨 Your booking request has been sent. Waiting for therapist confirmation...');
    
    // Start 5 minute countdown for therapist response
    startCountdown(300, () => {
      // Therapist didn't respond in time
      addSystemNotification('⏰ No therapist accepted in 5 minutes. Your request is sent to other available therapists.');
      setChatState(prev => ({
        ...prev,
        currentBooking: prev.currentBooking ? { ...prev.currentBooking, status: 'waiting_others' } : null,
      }));
    });
    
    console.log('📋 Booking created:', booking);
  }, [chatState.therapist, chatState.selectedDuration, chatState.customerLocation, chatState.coordinates, chatState.selectedDate, chatState.selectedTime, chatState.customerName, currentUserId, currentUserName, addSystemNotification, startCountdown]);

  // Update booking status
  const updateBookingStatus = useCallback((status: BookingStatus) => {
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? { ...prev.currentBooking, status } : null,
    }));
  }, []);

  // Therapist accepts booking
  const acceptBooking = useCallback(() => {
    stopCountdown();
    
    const therapistName = chatState.therapist?.name || 'Therapist';
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'therapist_accepted',
        therapistAcceptedAt: new Date().toISOString(),
      } : null,
    }));
    
    // Notify user
    addSystemNotification(`✅ Therapist ${therapistName} accepted your booking. You have 1 minute to confirm or the booking is canceled.`);
    
    // Start 1 minute countdown for user confirmation
    startCountdown(60, () => {
      // User didn't confirm in time
      addSystemNotification('❌ Booking canceled due to no confirmation. Please select a new therapist from the homepage.');
      setChatState(prev => ({
        ...prev,
        currentBooking: prev.currentBooking ? { ...prev.currentBooking, status: 'cancelled' } : null,
      }));
    });
  }, [chatState.therapist, stopCountdown, addSystemNotification, startCountdown]);

  // Therapist rejects booking
  const rejectBooking = useCallback(() => {
    stopCountdown();
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
        currentBooking: prev.currentBooking ? { ...prev.currentBooking, status: 'cancelled' } : null,
      }));
    });
  }, [stopCountdown, addSystemNotification, startCountdown]);

  // User confirms booking after therapist accepted
  const confirmBooking = useCallback(() => {
    stopCountdown();
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'user_confirmed',
        userConfirmedAt: new Date().toISOString(),
      } : null,
    }));
    
    const therapistName = chatState.therapist?.name || 'Therapist';
    addSystemNotification(`🎉 Booking confirmed! ${therapistName} will notify you when they are on the way.`);
  }, [chatState.therapist, stopCountdown, addSystemNotification]);

  // Cancel booking
  const cancelBooking = useCallback(() => {
    stopCountdown();
    addSystemNotification('❌ Booking canceled. Please select a new therapist from the homepage.');
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? { ...prev.currentBooking, status: 'cancelled' } : null,
    }));
  }, [stopCountdown, addSystemNotification]);

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

  // Complete booking
  const completeBooking = useCallback(() => {
    const duration = chatState.currentBooking?.duration || 60;
    const totalTime = `${duration + 30}-${duration + 60}`; // Massage time + 30-60 min travel
    
    setChatState(prev => ({
      ...prev,
      currentBooking: prev.currentBooking ? {
        ...prev.currentBooking,
        status: 'completed',
        completedAt: new Date().toISOString(),
      } : null,
    }));
    
    addSystemNotification(`✨ Service completed!\n\n⏱️ Total session: ${totalTime} minutes\n   • Massage: ${duration} min\n   • Travel time: 30-60 min\n\n💳 Payment can be made now. You can pay via cash or bank transfer.`);
  }, [chatState.currentBooking, addSystemNotification]);

  // Share bank card details
  const shareBankCard = useCallback(() => {
    const bankCard = chatState.therapist?.bankCardDetails;
    if (bankCard) {
      addSystemNotification(`💳 Bank Card Details for Payment:\n${bankCard}`);
    } else {
      addSystemNotification('💳 Bank card details not available. Please contact the therapist for payment information.');
    }
  }, [chatState.therapist, addSystemNotification]);

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
