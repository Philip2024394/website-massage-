// 🔒 PERSISTENT CHAT WINDOW PROVIDER
// Facebook Messenger-style chat that NEVER disappears once opened.
// Usage: Wrap App with PersistentChatProvider and render PersistentChatWindow at root

import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';

// TYPES
export interface ChatTherapist {
  id: string;
  name: string;
  image?: string;
  status?: string;
  pricing: Record<string, number>;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'booking';
}

export interface ChatWindowState {
  isOpen: boolean;
  isMinimized: boolean;
  therapist: ChatTherapist | null;
  messages: ChatMessage[];
  bookingStep: 'duration' | 'details' | 'confirmation' | 'chat';
  selectedDuration: number | null;
  customerName: string;
  customerWhatsApp: string;
  customerLocation: string;
  coordinates: { lat: number; lng: number } | null;
}

interface PersistentChatContextValue {
  chatState: ChatWindowState;
  isLocked: boolean;
  openChat: (therapist: ChatTherapist, mode?: 'book' | 'schedule' | 'price') => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  closeChat: () => void;
  lockChat: () => void;
  unlockChat: () => void;
  setBookingStep: (step: ChatWindowState['bookingStep']) => void;
  setSelectedDuration: (duration: number) => void;
  setCustomerDetails: (details: { name: string; whatsApp: string; location: string; coordinates?: { lat: number; lng: number } }) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateTherapist: (updates: Partial<ChatTherapist>) => void;
}

// CONTEXT
const PersistentChatContext = createContext<PersistentChatContextValue | null>(null);

// PROVIDER
const initialState: ChatWindowState = {
  isOpen: false,
  isMinimized: false,
  therapist: null,
  messages: [],
  bookingStep: 'duration',
  selectedDuration: null,
  customerName: '',
  customerWhatsApp: '',
  customerLocation: '',
  coordinates: null,
};

export function PersistentChatProvider({ children }: { children: ReactNode }) {
  const [chatState, setChatState] = useState<ChatWindowState>(initialState);
  const [isLocked, setIsLocked] = useState(false);
  const messageIdCounter = useRef(0);
  
  const openChat = useCallback((therapist: ChatTherapist, mode: 'book' | 'schedule' | 'price' = 'book') => {
    console.log('[PersistentChat] Opening chat for:', therapist.name, 'mode:', mode);
    
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: false,
      therapist,
      bookingStep: mode === 'price' ? 'duration' : 'duration',
      messages: prev.therapist?.id === therapist.id ? prev.messages : [],
    }));
    
    setIsLocked(true);
  }, []);
  
  const minimizeChat = useCallback(() => {
    console.log('[PersistentChat] Minimizing chat');
    setChatState(prev => ({ ...prev, isMinimized: true }));
  }, []);
  
  const maximizeChat = useCallback(() => {
    console.log('[PersistentChat] Maximizing chat');
    setChatState(prev => ({ ...prev, isMinimized: false }));
  }, []);
  
  const closeChat = useCallback(() => {
    if (isLocked) {
      console.log('[PersistentChat] Cannot close - chat is locked');
      return;
    }
    console.log('[PersistentChat] Closing chat');
    setChatState(initialState);
  }, [isLocked]);
  
  const lockChat = useCallback(() => setIsLocked(true), []);
  const unlockChat = useCallback(() => setIsLocked(false), []);
  
  const setBookingStep = useCallback((step: ChatWindowState['bookingStep']) => {
    setChatState(prev => ({ ...prev, bookingStep: step }));
  }, []);
  
  const setSelectedDuration = useCallback((duration: number) => {
    setChatState(prev => ({ ...prev, selectedDuration: duration }));
  }, []);
  
  const setCustomerDetails = useCallback((details: { name: string; whatsApp: string; location: string; coordinates?: { lat: number; lng: number } }) => {
    setChatState(prev => ({
      ...prev,
      customerName: details.name,
      customerWhatsApp: details.whatsApp,
      customerLocation: details.location,
      coordinates: details.coordinates || prev.coordinates,
    }));
  }, []);
  
  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    messageIdCounter.current += 1;
    const newMessage: ChatMessage = {
      ...message,
      id: 'msg_' + messageIdCounter.current + '_' + Date.now(),
      timestamp: new Date(),
    };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  }, []);
  
  const updateTherapist = useCallback((updates: Partial<ChatTherapist>) => {
    setChatState(prev => ({
      ...prev,
      therapist: prev.therapist ? { ...prev.therapist, ...updates } : null,
    }));
  }, []);
  
  useEffect(() => {
    (window as any).__PERSISTENT_CHAT__ = {
      state: chatState,
      isLocked,
      openChat,
      minimizeChat,
      maximizeChat,
      closeChat,
    };
  }, [chatState, isLocked, openChat, minimizeChat, maximizeChat, closeChat]);
  
  const value: PersistentChatContextValue = {
    chatState,
    isLocked,
    openChat,
    minimizeChat,
    maximizeChat,
    closeChat,
    lockChat,
    unlockChat,
    setBookingStep,
    setSelectedDuration,
    setCustomerDetails,
    addMessage,
    updateTherapist,
  };
  
  return (
    <PersistentChatContext.Provider value={value}>
      {children}
    </PersistentChatContext.Provider>
  );
}

// HOOK
export function usePersistentChat() {
  const context = useContext(PersistentChatContext);
  if (!context) {
    throw new Error('usePersistentChat must be used within PersistentChatProvider');
  }
  return context;
}

export { PersistentChatContext };
