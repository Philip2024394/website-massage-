/**
 * ============================================================================
 * 🔗 USE MODERN CHAT HOOK - Integration Hook for Existing Chat Windows
 * ============================================================================
 * 
 * This hook provides an easy way to integrate the modern chat system
 * into existing chat components with minimal changes.
 * 
 * Features:
 * ✅ Drop-in replacement for existing chat hooks
 * ✅ Backward compatibility with current chat interfaces
 * ✅ Real-time updates with typing indicators
 * ✅ Read receipts and message status
 * ✅ Optimistic updates for better UX
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { modernChatService, ChatMessage } from '../lib/services/modernChatService';
import { TypingUser } from '../components/TypingIndicator';

// ============================================================================
// TYPES
// ============================================================================

interface UseModernChatOptions {
  chatRoomId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'customer' | 'therapist' | 'admin';
  autoMarkAsRead?: boolean;
  enableTyping?: boolean;
  enableOptimisticUpdates?: boolean;
}

interface UseModernChatReturn {
  // Messages
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  
  // Sending
  sendMessage: (content: string) => Promise<void>;
  sending: boolean;
  
  // Typing
  typingUsers: TypingUser[];
  setTyping: (isTyping: boolean) => void;
  
  // Status
  markAsRead: () => Promise<void>;
  retry: () => Promise<void>;
  
  // Connection
  isConnected: boolean;
}

// ============================================================================
// MODERN CHAT HOOK
// ============================================================================

export function useModernChat(options: UseModernChatOptions): UseModernChatReturn {
  const {
    chatRoomId,
    currentUserId,
    currentUserName,
    currentUserRole,
    autoMarkAsRead = true,
    enableTyping = true,
    enableOptimisticUpdates = true
  } = options;

  // ========================================================================
  // STATE
  // ========================================================================
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Refs
  const subscriptionsRef = useRef<{ messages?: () => void; typing?: () => void }>({});
  
  // ========================================================================
  // LOAD MESSAGES
  // ========================================================================
  
  const loadMessages = useCallback(async () => {
    if (!chatRoomId) return;
    
    try {
      setLoading(true);
      setError(null);
      setIsConnected(true);
      
      const messageHistory = await modernChatService.getMessages(chatRoomId);
      setMessages(messageHistory);
      
      // Auto-mark as read if enabled
      if (autoMarkAsRead) {
        await modernChatService.markMessagesAsRead(chatRoomId, currentUserId);
      }
      
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [chatRoomId, currentUserId, autoMarkAsRead]);
  
  // ========================================================================
  // SEND MESSAGE
  // ========================================================================
  
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;
    
    setSending(true);
    let optimisticMessage: ChatMessage | null = null;
    
    // Create optimistic message if enabled
    if (enableOptimisticUpdates) {
      optimisticMessage = modernChatService.createOptimisticMessage({
        chatRoomId,
        content,
        senderId: currentUserId,
        senderName: currentUserName,
        senderType: currentUserRole
      });
      
      setOptimisticMessages(prev => [...prev, optimisticMessage!]);
    }
    
    try {
      await modernChatService.sendMessage({
        chatRoomId,
        content,
        senderId: currentUserId,
        senderName: currentUserName,
        senderType: currentUserRole
      });
      
      // Remove optimistic message (real message will come via subscription)
      if (optimisticMessage) {
        setOptimisticMessages(prev => 
          prev.filter(msg => msg.$id !== optimisticMessage!.$id)
        );
      }
      
      setError(null);
      setIsConnected(true);
      
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.message || 'Failed to send message');
      setIsConnected(false);
      
      // Mark optimistic message as failed
      if (optimisticMessage) {
        setOptimisticMessages(prev =>
          prev.map(msg =>
            msg.$id === optimisticMessage!.$id
              ? { ...msg, status: 'failed' as const }
              : msg
          )
        );
      }
      
      throw err;
    } finally {
      setSending(false);
    }
  }, [
    chatRoomId, 
    currentUserId, 
    currentUserName, 
    currentUserRole, 
    sending, 
    enableOptimisticUpdates
  ]);
  
  // ========================================================================
  // TYPING INDICATOR
  // ========================================================================
  
  const setTyping = useCallback((isTyping: boolean) => {
    if (!enableTyping) return;
    
    modernChatService.setTypingStatus(
      chatRoomId,
      currentUserId,
      currentUserRole === 'therapist' ? 'therapist' : 'user',
      isTyping
    );
  }, [chatRoomId, currentUserId, currentUserRole, enableTyping]);
  
  // ========================================================================
  // MARK AS READ
  // ========================================================================
  
  const markAsRead = useCallback(async () => {
    try {
      await modernChatService.markMessagesAsRead(chatRoomId, currentUserId);
    } catch (err: any) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [chatRoomId, currentUserId]);
  
  // ========================================================================
  // RETRY CONNECTION
  // ========================================================================
  
  const retry = useCallback(async () => {
    await loadMessages();
  }, [loadMessages]);
  
  // ========================================================================
  // SETUP SUBSCRIPTIONS
  // ========================================================================
  
  useEffect(() => {
    if (!chatRoomId) return;
    
    console.log('🔔 Setting up modern chat subscriptions:', chatRoomId);
    
    // Clean up existing subscriptions
    Object.values(subscriptionsRef.current).forEach(unsubscribe => {
      if (unsubscribe) unsubscribe();
    });
    
    // Subscribe to messages
    subscriptionsRef.current.messages = modernChatService.subscribeToMessages(
      chatRoomId,
      (newMessage) => {
        console.log('📨 New message received:', newMessage);
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(msg => msg.$id === newMessage.$id)) {
            return prev;
          }
          return [...prev, newMessage];
        });
        setIsConnected(true);
      },
      (updatedMessage) => {
        console.log('🔄 Message updated:', updatedMessage);
        setMessages(prev =>
          prev.map(msg => msg.$id === updatedMessage.$id ? updatedMessage : msg)
        );
      }
    );
    
    // Subscribe to typing indicators
    if (enableTyping) {
      subscriptionsRef.current.typing = modernChatService.subscribeToTyping(
        chatRoomId,
        currentUserId,
        (typing) => {
          console.log('⌨️  Typing update:', typing);
          const typingUsers = typing.map(t => ({
            userId: t.userId,
            role: t.role,
            name: t.role === 'therapist' ? 'Therapist' : 'User'
          }));
          setTypingUsers(typingUsers);
        }
      );
    }
    
    return () => {
      console.log('🔌 Cleaning up modern chat subscriptions');
      Object.values(subscriptionsRef.current).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
      subscriptionsRef.current = {};
    };
  }, [chatRoomId, currentUserId, enableTyping]);
  
  // ========================================================================
  // LOAD MESSAGES ON MOUNT
  // ========================================================================
  
  useEffect(() => {
    if (chatRoomId) {
      loadMessages();
    }
  }, [loadMessages]);
  
  // ========================================================================
  // RETURN INTERFACE
  // ========================================================================
  
  const allMessages = [...messages, ...optimisticMessages];
  
  return {
    // Messages
    messages: allMessages,
    loading,
    error,
    
    // Sending
    sendMessage,
    sending,
    
    // Typing
    typingUsers,
    setTyping,
    
    // Status
    markAsRead,
    retry,
    
    // Connection
    isConnected
  };
}

// ============================================================================
// LEGACY COMPATIBILITY HOOK
// ============================================================================

/**
 * Drop-in replacement for existing useChatMessages hooks
 */
export function useChatMessages(
  chatRoomId: string | null,
  currentUserId: string,
  currentUserName: string,
  userRole: 'customer' | 'therapist'
) {
  const modernChat = useModernChat({
    chatRoomId: chatRoomId || '',
    currentUserId,
    currentUserName,
    currentUserRole: userRole,
    autoMarkAsRead: true,
    enableTyping: true,
    enableOptimisticUpdates: true
  });

  return {
    messages: modernChat.messages,
    loading: modernChat.loading,
    sending: modernChat.sending,
    error: modernChat.error,
    sendMessage: modernChat.sendMessage,
    markAsRead: modernChat.markAsRead
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for typing indicator management
 */
export function useTypingIndicator(
  chatRoomId: string,
  currentUserId: string,
  currentUserRole: 'customer' | 'therapist' | 'admin',
  debounceMs: number = 2000
) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      modernChatService.setTypingStatus(
        chatRoomId,
        currentUserId,
        currentUserRole === 'therapist' ? 'therapist' : 'user',
        true
      );
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout to stop typing
    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      modernChatService.setTypingStatus(
        chatRoomId,
        currentUserId,
        currentUserRole === 'therapist' ? 'therapist' : 'user',
        false
      );
    }, debounceMs);
  }, [chatRoomId, currentUserId, currentUserRole, isTyping, debounceMs]);

  const stopTyping = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (isTyping) {
      setIsTyping(false);
      modernChatService.setTypingStatus(
        chatRoomId,
        currentUserId,
        currentUserRole === 'therapist' ? 'therapist' : 'user',
        false
      );
    }
  }, [chatRoomId, currentUserId, currentUserRole, isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      stopTyping();
    };
  }, [stopTyping]);

  return {
    isTyping,
    startTyping,
    stopTyping
  };
}