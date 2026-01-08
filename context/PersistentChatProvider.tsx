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

// Therapist info for chat
export interface ChatTherapist {
  id: string;
  name: string;
  image?: string;
  pricing?: Record<string, number>;
  whatsapp?: string;
  status?: string;
  duration?: number;
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
}

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
  sendMessage: (messageContent: string) => Promise<void>;
  updateTherapist: (updates: Partial<ChatTherapist>) => void;
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
};

export function PersistentChatProvider({ children }: { children: ReactNode }) {
  const [chatState, setChatState] = useState<ChatWindowState>(initialState);
  const [isLocked, setIsLocked] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentUserName, setCurrentUserName] = useState<string>('Guest');
  const subscriptionRef = useRef<(() => void) | null>(null);
  const therapistIdRef = useRef<string | null>(null);

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

  // Minimize chat
  const minimizeChat = useCallback(() => {
    console.log('➖ Minimizing chat');
    setChatState(prev => ({ ...prev, isMinimized: true }));
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

  // Send message - SAVES TO APPWRITE
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!currentUserId || !messageContent.trim() || !chatState.therapist) {
      console.warn('Cannot send message: missing user, content, or therapist');
      return;
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
      
      throw error;
    }
  }, [currentUserId, currentUserName, chatState.therapist, chatState.customerName]);

  // Update therapist
  const updateTherapist = useCallback((updates: Partial<ChatTherapist>) => {
    setChatState(prev => ({
      ...prev,
      therapist: prev.therapist ? { ...prev.therapist, ...updates } : null,
    }));
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
