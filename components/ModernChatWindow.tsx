/**
 * ============================================================================
 * 🚀 MODERN CHAT WINDOW - WhatsApp/Messenger-style Real-time Chat
 * ============================================================================
 * 
 * Complete modern chat implementation with:
 * ✅ Real-time messaging with Appwrite
 * ✅ Typing indicators with debouncing
 * ✅ Read receipts (✓ sent, ✓✓ delivered/read)
 * ✅ Emoji picker integration
 * ✅ Persistent chat input that never disappears
 * ✅ Message status tracking
 * ✅ Optimistic UI updates
 * ✅ Auto-scroll to latest messages
 * ✅ Memory leak prevention
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Minimize, Maximize, Wifi, WifiOff } from 'lucide-react';
import { modernChatService, ChatMessage } from '../lib/services/modernChatService';
import { ChatInput } from './ChatInput';
import { MessageList, groupMessagesByDate, DateSeparator } from './MessageBubble';
import { TypingIndicator, BubbleTypingIndicator, TypingUser } from './TypingIndicator';

// ============================================================================
// TYPES
// ============================================================================

interface ModernChatWindowProps {
  chatRoomId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'customer' | 'therapist' | 'admin';
  recipientId: string;
  recipientName: string;
  recipientRole: 'customer' | 'therapist' | 'admin';
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  className?: string;
}

// ============================================================================
// MODERN CHAT WINDOW COMPONENT
// ============================================================================

export function ModernChatWindow({
  chatRoomId,
  currentUserId,
  currentUserName,
  currentUserRole,
  recipientId,
  recipientName,
  recipientRole,
  isOpen,
  onClose,
  onMinimize,
  isMinimized = false,
  className = ''
}: ModernChatWindowProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastReadMessageRef = useRef<string>('');
  
  // ========================================================================
  // SCROLL TO BOTTOM
  // ========================================================================
  
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  // ========================================================================
  // MESSAGE OPERATIONS
  // ========================================================================
  
  /**
   * Load message history
   */
  const loadMessages = useCallback(async () => {
    if (!chatRoomId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const messageHistory = await modernChatService.getMessages(chatRoomId);
      setMessages(messageHistory);
      
      // Mark messages as read when chat opens
      await modernChatService.markMessagesAsRead(chatRoomId, currentUserId);
      
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [chatRoomId, currentUserId]);
  
  /**
   * Send message with optimistic updates
   */
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;
    
    setSending(true);
    
    // Create optimistic message for instant UI
    const optimisticMessage = modernChatService.createOptimisticMessage({
      chatRoomId,
      content,
      senderId: currentUserId,
      senderName: currentUserName,
      senderType: currentUserRole
    });
    
    // Add optimistic message to UI immediately
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    
    try {
      // Send to server
      const savedMessage = await modernChatService.sendMessage({
        chatRoomId,
        content,
        senderId: currentUserId,
        senderName: currentUserName,
        senderType: currentUserRole
      });
      
      // Remove optimistic message and let real-time subscription handle the real message
      setOptimisticMessages(prev => 
        prev.filter(msg => msg.$id !== optimisticMessage.$id)
      );
      
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark optimistic message as failed
      setOptimisticMessages(prev =>
        prev.map(msg =>
          msg.$id === optimisticMessage.$id
            ? { ...msg, status: 'failed' as const }
            : msg
        )
      );
      
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  }, [chatRoomId, currentUserId, currentUserName, currentUserRole, sending]);
  
  /**
   * Handle typing status changes
   */
  const handleTypingChange = useCallback((isTyping: boolean) => {
    modernChatService.setTypingStatus(
      chatRoomId,
      currentUserId,
      currentUserRole === 'therapist' ? 'therapist' : 'user',
      isTyping
    );
  }, [chatRoomId, currentUserId, currentUserRole]);
  
  // ========================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================================================
  
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;
    
    console.log('🔔 Setting up real-time subscriptions for:', chatRoomId);
    
    // Subscribe to messages
    const unsubscribeMessages = modernChatService.subscribeToMessages(
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
        
        // Auto-scroll on new messages
        setTimeout(scrollToBottom, 100);
      },
      (updatedMessage) => {
        console.log('🔄 Message updated:', updatedMessage);
        setMessages(prev =>
          prev.map(msg => msg.$id === updatedMessage.$id ? updatedMessage : msg)
        );
      }
    );
    
    // Subscribe to typing indicators
    const unsubscribeTyping = modernChatService.subscribeToTyping(
      chatRoomId,
      currentUserId,
      (typing) => {
        console.log('⌨️  Typing update:', typing);
        const typingUsers = typing.map(t => ({
          userId: t.userId,
          role: t.role,
          name: t.role === 'therapist' ? recipientName : 'User'
        }));
        setTypingUsers(typingUsers);
      }
    );
    
    return () => {
      console.log('🔌 Cleaning up chat subscriptions');
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [isOpen, chatRoomId, currentUserId, recipientName, scrollToBottom]);
  
  // ========================================================================
  // LOAD MESSAGES ON MOUNT
  // ========================================================================
  
  useEffect(() => {
    if (isOpen && chatRoomId) {
      loadMessages();
    }
  }, [isOpen, loadMessages]);
  
  // ========================================================================
  // AUTO-SCROLL ON NEW MESSAGES
  // ========================================================================
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessages, scrollToBottom]);
  
  // ========================================================================
  // MARK MESSAGES AS READ WHEN VISIBLE
  // ========================================================================
  
  useEffect(() => {
    if (isOpen && !isMinimized && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.$id !== lastReadMessageRef.current) {
        modernChatService.markMessagesAsRead(chatRoomId, currentUserId);
        lastReadMessageRef.current = lastMessage.$id;
      }
    }
  }, [isOpen, isMinimized, messages, chatRoomId, currentUserId]);
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  if (!isOpen) return null;
  
  // Combine real and optimistic messages
  const allMessages = [...messages, ...optimisticMessages];
  const messageGroups = groupMessagesByDate(allMessages);
  
  return (
    <div className={`fixed bottom-0 right-4 w-80 bg-white rounded-t-lg shadow-2xl border border-gray-200 z-50 ${className}`}>
      {/* Header */}
      <div className="bg-orange-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-1">
            {isConnected ? (
              <Wifi className="w-4 h-4" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-300" />
            )}
          </div>
          
          {/* Recipient Info */}
          <div>
            <h3 className="font-semibold text-sm">{recipientName}</h3>
            <p className="text-orange-200 text-xs capitalize">{recipientRole}</p>
          </div>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center space-x-2">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 rounded hover:bg-orange-600 transition-colors"
            >
              {isMinimized ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-orange-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Chat Body */}
      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div 
            ref={messagesContainerRef}
            className="h-96 overflow-y-auto p-4 bg-gray-50"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                  <p className="text-sm">{error}</p>
                  <button
                    onClick={loadMessages}
                    className="mt-2 px-3 py-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                {messageGroups.length > 0 ? (
                  messageGroups.map((group, groupIndex) => (
                    <div key={group.date}>
                      <DateSeparator date={group.date} />
                      <MessageList
                        messages={group.messages}
                        currentUserId={currentUserId}
                        showAvatars={true}
                        showSenders={true}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                    Start your conversation...
                  </div>
                )}
                
                {/* Typing Indicator */}
                <BubbleTypingIndicator 
                  isTyping={typingUsers.length > 0}
                  className="mt-2"
                />
                
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Typing Status Bar */}
          <TypingIndicator 
            typingUsers={typingUsers}
            className="border-t border-gray-200 bg-white"
          />
          
          {/* Chat Input - Always Persistent */}
          <ChatInput
            onSend={handleSendMessage}
            onTyping={handleTypingChange}
            disabled={!isConnected || !!error}
            sending={sending}
            placeholder="Type a message…"
          />
        </>
      )}
    </div>
  );
}