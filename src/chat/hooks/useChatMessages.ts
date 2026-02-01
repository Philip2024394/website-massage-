/**
 * useChatMessages Hook
 * 
 * Purpose: Manages real-time chat messages for a specific chat room
 * Data Flow: Appwrite chat_messages collection → React state → ChatMessages component
 * 
 * Features:
 * - Fetches message history on room change
 * - Real-time subscription to new messages
 * - Sends messages to Appwrite
 * - Auto-scroll to latest message
 * - Typing indicators
 */

import { useState, useEffect, useCallback } from 'react';
import { Client, Databases, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../../lib/appwrite.config';

export interface ChatMessage {
  $id: string;
  $createdAt: string;
  chatRoomId: string;
  content: string;
  senderType: 'customer' | 'therapist' | 'system' | 'admin';
  senderName: string;
  senderId: string;
  timestamp: string;
  read: boolean;
}

interface UseChatMessagesReturn {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
}

export function useChatMessages(
  chatRoomId: string | null,
  currentUserId: string,
  currentUserName: string,
  userRole: 'customer' | 'therapist'
): UseChatMessagesReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

  const databases = new Databases(client);

  // Fetch message history
  const fetchMessages = async () => {
    if (!chatRoomId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📥 [useChatMessages] Fetching messages for room:', chatRoomId);

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.orderAsc('timestamp'),
          Query.limit(100)
        ]
      );

      console.log('✅ [useChatMessages] Fetched messages:', response.documents.length);
      setMessages(response.documents as ChatMessage[]);

    } catch (err: any) {
      console.error('❌ [useChatMessages] Error fetching messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send message to Appwrite
  const sendMessage = useCallback(async (content: string) => {
    if (!chatRoomId || !content.trim()) return;

    try {
      setSending(true);
      setError(null);

      console.log('📤 [useChatMessages] Sending message:', content);

      const messageData = {
        roomId: chatRoomId,
        message: content.trim(),
        content: content.trim(), // Required alias field
        senderType: userRole,
        senderName: currentUserName,
        senderId: currentUserId,
        recipientId: 'system', // Required field
        recipientName: 'System', // Required field
        recipientType: 'system', // Required field
        messageType: 'text', // Required enum
        originalLanguage: 'en', // Required field
        createdAt: new Date().toISOString(),
        read: false,
        isSystemMessage: false,
        conversationId: chatRoomId, // Required field
        receiverId: 'system', // Required field
        receivername: 'System', // Required field
        bookingid: 'none', // Required field
        originalMessageId: 'none', // Required field
        expiresat: new Date(Date.now() + 24*60*60*1000).toISOString(), // 24 hours from now
        archivedBy: 'none', // Required field
        sessionId: chatRoomId // Required field
      };

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        ID.unique(),
        messageData
      );

      console.log('✅ [useChatMessages] Message sent successfully');

    } catch (err: any) {
      console.error('❌ [useChatMessages] Error sending message:', err);
      setError(err.message || 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [chatRoomId, currentUserId, currentUserName, userRole]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        messageId,
        { read: true }
      );

      // Update local state
      setMessages(prev =>
        prev.map(msg =>
          msg.$id === messageId ? { ...msg, read: true } : msg
        )
      );

    } catch (err: any) {
      console.error('❌ [useChatMessages] Error marking message as read:', err);
    }
  }, []);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!chatRoomId) {
      setMessages([]);
      return;
    }

    console.log('🔔 [useChatMessages] Setting up real-time subscription for room:', chatRoomId);

    // Subscribe to chat_messages collection
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatMessages}.documents`,
      (response) => {
        console.log('📨 [useChatMessages] Real-time message event');

        const payload = response.payload as ChatMessage;

        // Only process messages for current room
        if (payload.chatRoomId !== chatRoomId) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('➕ [useChatMessages] New message received');
          
          setMessages(prev => {
            // Avoid duplicates
            if (prev.find(msg => msg.$id === payload.$id)) {
              return prev;
            }
            return [...prev, payload];
          });
        }

        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          console.log('🔄 [useChatMessages] Message updated');
          
          setMessages(prev =>
            prev.map(msg => msg.$id === payload.$id ? payload : msg)
          );
        }
      }
    );

    // Initial fetch
    fetchMessages();

    return () => {
      console.log('🔌 [useChatMessages] Cleaning up real-time subscription');
      unsubscribe();
    };
  }, [chatRoomId]);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    markAsRead
  };
}
