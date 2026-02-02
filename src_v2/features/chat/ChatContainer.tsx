import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessageComponent } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import type { ChatMessage } from '../../core/chat';
import { loadChatMessages, subscribeToChatUpdates } from '../../core/chat';

export interface ChatContainerProps {
  bookingId: string;
  currentUserId?: string;
  className?: string;
}

export function ChatContainer({ bookingId, currentUserId, className }: ChatContainerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of THIS container only - not shell scroll
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, []);

  // Load messages for this booking
  const loadMessages = useCallback(async () => {
    if (!bookingId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await loadChatMessages(bookingId);
      
      if (result.success) {
        setMessages(result.messages);
        // Scroll to bottom after loading messages
        setTimeout(scrollToBottom, 100);
      } else {
        setError(result.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, scrollToBottom]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!bookingId) return;

    const unsubscribe = subscribeToChatUpdates(
      bookingId,
      (message, event) => {
        if (event === 'create') {
          setMessages(prev => {
            const exists = prev.some(msg => msg.$id === message.$id);
            if (exists) return prev;
            const newMessages = [...prev, message];
            return newMessages;
          });
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [bookingId]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const handleMessageSent = useCallback(() => {
    // Refresh messages after sending (sendMessage handles the actual sending)
    loadMessages();
  }, [loadMessages]);

  if (error) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-red-500 text-center">
          <p>Chat Error</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={loadMessages}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden'
      }}
    >
      {/* Chat header - fixed height */}
      <div style={{
        height: '60px',
        flexShrink: 0,
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        backgroundColor: '#ffffff'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
          Chat
        </h2>
      </div>

      {/* Chat messages - ONLY scrollable element */}
      <div 
        ref={messagesContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          padding: '16px'
        }}
      >
        {isLoading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px' 
          }}>
            <div style={{ color: '#6b7280' }}>Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '200px' 
          }}>
            <div style={{ color: '#6b7280' }}>No messages yet. Start the conversation!</div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessageComponent
                key={message.$id}
                message={message}
                isCurrentUser={message.senderId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Chat input - fixed height */}
      <div style={{ flexShrink: 0 }}>
        <ChatInput 
          bookingId={bookingId} 
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
}