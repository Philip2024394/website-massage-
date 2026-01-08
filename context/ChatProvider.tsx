/**
 * 🎪 STANDALONE CHAT PROVIDER
 * - Subscribes to Appwrite chat rooms on mount
 * - Maintains chat state independently of app state
 * - Guarantees chat visibility when booking has chatRoomId
 * 
 * CRITICAL: This replaces the fragile event-based chat system
 * with a solid Appwrite-first architecture
 */

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { client, databases, DATABASE_ID } from '../lib/appwrite';

// Chat room collection ID - adjust to your actual collection
const CHAT_ROOMS_COLLECTION_ID = 'chatRooms'; // TODO: Update with actual collection ID

interface ChatRoom {
  $id: string;
  bookingId?: string;  // Optional - may not exist yet during booking flow
  providerId: string;
  providerName: string;
  providerImage: string | null;
  customerId?: string;  // Optional - filled after booking confirmed
  customerName?: string;  // Optional - collected in chat
  customerWhatsApp?: string;  // Optional - collected in chat
  status: 'waiting' | 'active' | 'completed' | 'booking-in-progress';  // Added booking-in-progress
  pricing: Record<string, number>;
  createdAt: string;
  $createdAt?: string; // Appwrite's automatic timestamp
  expiresAt: string | null;
  lastMessageAt?: string;
  unreadCount?: number;
  duration?: number;  // Selected duration
}

interface BookingChatData {
  therapistId: string;
  therapistName: string;
  therapistImage?: string;
  duration: number;  // In minutes (60, 90, 120)
  pricing: Record<string, number>;
}

interface ChatContextValue {
  activeChatRooms: ChatRoom[];
  isLoading: boolean;
  subscriptionActive: boolean;
  openChatRoom: (chatRoomId: string) => void;
  closeChatRoom: (chatRoomId: string) => void;
  minimizeChatRoom: (chatRoomId: string) => void;
  isMinimized: (chatRoomId: string) => boolean;
  getChatRoom: (chatRoomId: string) => ChatRoom | null;
  refreshChatRooms: () => Promise<void>;
  openBookingChat: (data: BookingChatData) => void;  // NEW: Opens chat for booking
}

const ChatContext = createContext<ChatContextValue | null>(null);

// Export the context for use in other files
export { ChatContext };

export function ChatProvider({ children }: { children: ReactNode }) {
  const [activeChatRooms, setActiveChatRooms] = useState<ChatRoom[]>([]);
  const [minimizedChats, setMinimizedChats] = useState<Set<string>>(new Set());
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Track notified chat IDs to avoid duplicate notifications
  const notifiedChatIds = useRef<string[]>([]);

  // Chat room management functions - Define these first before useEffect hooks
  const openChatRoom = (chatRoomId: string) => {
    console.log('🎪 Opening chat room:', chatRoomId);
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatRoomId);
      return newSet;
    });
  };

  const closeChatRoom = (chatRoomId: string) => {
    console.log('🎪 Closing chat room:', chatRoomId);
    setActiveChatRooms(prev => prev.filter(room => room.$id !== chatRoomId));
  };

  const minimizeChatRoom = (chatRoomId: string) => {
    console.log('🎪 Minimizing chat room:', chatRoomId);
    setMinimizedChats(prev => new Set([...prev, chatRoomId]));
  };

  const isMinimized = (chatRoomId: string): boolean => {
    return minimizedChats.has(chatRoomId);
  };

  const getChatRoom = (chatRoomId: string): ChatRoom | null => {
    return activeChatRooms.find(room => room.$id === chatRoomId) || null;
  };

  const refreshChatRooms = async (): Promise<void> => {
    await fetchUserChatRooms();
  };

  // Subscribe to Appwrite chat rooms on mount
  useEffect(() => {
    console.log('🎪 ChatProvider: Starting Appwrite subscription...');
    let unsubscribe: (() => void) | null = null;

    const initializeSubscription = async () => {
      try {
        // Subscribe to chat room changes
        unsubscribe = client.subscribe(
          `databases.${DATABASE_ID}.collections.${CHAT_ROOMS_COLLECTION_ID}.documents`,
          (response) => {
            const payload = response.payload as ChatRoom;
            console.log('💬 Chat room event:', response.events[0], payload.$id);
            
            if (response.events.some(e => e.includes('create'))) {
              console.log('💬 New chat room created:', payload.$id);
              setActiveChatRooms(prev => {
                // Avoid duplicates
                if (prev.find(room => room.$id === payload.$id)) return prev;
                return [...prev, payload];
              });
            }
            
            if (response.events.some(e => e.includes('update'))) {
              console.log('💬 Chat room updated:', payload.$id);
              setActiveChatRooms(prev =>
                prev.map(room => room.$id === payload.$id ? payload : room)
              );
            }
            
            if (response.events.some(e => e.includes('delete'))) {
              console.log('💬 Chat room deleted:', payload.$id);
              setActiveChatRooms(prev => prev.filter(room => room.$id !== payload.$id));
            }
          }
        );

        setSubscriptionActive(true);
        console.log('✅ ChatProvider: Appwrite subscription active');

        // Fetch existing chat rooms for current user
        await fetchUserChatRooms();

      } catch (error) {
        console.error('❌ ChatProvider: Failed to initialize subscription:', error);
        setSubscriptionActive(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();

    // Cleanup on unmount
    return () => {
      if (unsubscribe) {
        console.log('🔌 ChatProvider: Unsubscribing from Appwrite');
        unsubscribe();
        setSubscriptionActive(false);
      }
    };
  }, []);

  // Fetch existing chat rooms for current user
  const fetchUserChatRooms = async () => {
    try {
      console.log('📊 ChatProvider: Loading existing chat rooms...');
      
      // TODO: Get current user ID from auth context
      // For now, we'll fetch all chat rooms and filter client-side
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        [
          // TODO: Add proper query filters based on user role
          // Query.equal('customerId', currentUserId)
          // Query.equal('providerId', currentUserId)
        ]
      );

      const chatRooms = response.documents as ChatRoom[];
      
      // Filter for rooms where user is involved (customer OR provider)
      // TODO: Replace with proper user ID check
      const userChatRooms = chatRooms.filter(room => {
        // For now, return all rooms - will be filtered when user context is available
        return true;
      });

      setActiveChatRooms(userChatRooms);
      console.log(`📊 ChatProvider: Loaded ${userChatRooms.length} active chat rooms`);
      
    } catch (error) {
      console.error('❌ ChatProvider: Failed to fetch chat rooms:', error);
      // Don't throw - app should continue working without chat
      setActiveChatRooms([]);
    }
  };

  // URL-based chat room opening on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatRoomIdFromUrl = urlParams.get('chatRoomId');

    if (chatRoomIdFromUrl && activeChatRooms.length > 0) {
      console.log('🎪 ChatProvider: URL contains chatRoomId, ensuring visibility:', chatRoomIdFromUrl);
      const room = getChatRoom(chatRoomIdFromUrl);
      if (room) {
        openChatRoom(chatRoomIdFromUrl);
      } else {
        console.warn('⚠️ ChatProvider: URL chat room not found in active rooms');
      }
    }
  }, [activeChatRooms]);

  // Auto-open minimized active/waiting chats (visibility guarantee)
  useEffect(() => {
    activeChatRooms.forEach(room => {
      if (room.status === 'waiting' || room.status === 'active') {
        if (isMinimized(room.$id)) {
          console.log('⚠️ ChatProvider: Auto-opening minimized active chat:', room.$id);
          openChatRoom(room.$id);
        }
      }
    });
  }, [activeChatRooms]);

  // Comprehensive visibility guarantee - ensure active chats are always visible
  useEffect(() => {
    if (activeChatRooms.length > 0) {
      // Guarantee: All active/waiting chats should be visible (not minimized)
      const activeChats = activeChatRooms.filter(room => room.status === 'waiting' || room.status === 'active');
      activeChats.forEach(room => {
        if (isMinimized(room.$id)) {
          console.log('🔍 ChatProvider: Force-opening minimized active chat:', room.$id);
          openChatRoom(room.$id);
        }
      });

      // Notification for new chats
      const newChats = activeChatRooms.filter(room => 
        room.status === 'waiting' && 
        !notifiedChatIds.current.includes(room.$id)
      );
      
      newChats.forEach(room => {
        notifiedChatIds.current.push(room.$id);
        // Note: addNotification would need to be imported from notifications hook
        console.log(`🔔 New chat ready: ${room.providerName}`);
      });
    }
  }, [activeChatRooms]);

  // NEW: Open booking chat immediately after duration selection
  const openBookingChat = (data: BookingChatData) => {
    console.log('🎪 CHAT OPENED FROM BOOKING', data);
    
    // Create a temporary chat room object (not saved to Appwrite yet)
    const tempChatRoom: ChatRoom = {
      $id: `temp_${Date.now()}`,
      providerId: data.therapistId,
      providerName: data.therapistName,
      providerImage: data.therapistImage || null,
      status: 'booking-in-progress',
      pricing: data.pricing,
      createdAt: new Date().toISOString(),
      expiresAt: null,
      duration: data.duration,
    };
    
    // Add to active chat rooms
    setActiveChatRooms(prev => [...prev, tempChatRoom]);
    
    // Ensure it's not minimized
    setMinimizedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(tempChatRoom.$id);
      return newSet;
    });
    
    console.log('✅ Booking chat opened:', tempChatRoom.$id);
  };

  const contextValue: ChatContextValue = {
    activeChatRooms,
    isLoading,
    subscriptionActive,
    openChatRoom,
    closeChatRoom,
    minimizeChatRoom,
    isMinimized,
    getChatRoom,
    refreshChatRooms,
    openBookingChat,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to access chat context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}

// Debug hook for development
export function useChatDebug() {
  const context = useChatContext();
  
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__CHAT_DEBUG__ = {
        activeChatRooms: context.activeChatRooms,
        subscriptionActive: context.subscriptionActive,
        isLoading: context.isLoading,
        openChat: context.openChatRoom,
        closeChat: context.closeChatRoom,
        minimizeChat: context.minimizeChatRoom,
        refresh: context.refreshChatRooms,
      };
      
      console.log('🔧 Chat Debug: Available at window.__CHAT_DEBUG__');
    }
  }, [context]);
  
  return context;
}