/**
 * ChatMessages Component
 * 
 * Purpose: Displays chat messages with auto-scroll and read receipts
 * Data Flow: useChatMessages hook → Message list → UI rendering
 * 
 * Features:
 * - Displays messages from user, therapist, and system
 * - Different styling for each sender type
 * - Auto-scroll to latest message
 * - Timestamp formatting
 * - Read receipts
 * - Loading states
 */

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './hooks/useChatMessages';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  userRole: 'customer' | 'therapist';
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  loading,
  currentUserId,
  userRole
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return '';
    }
  };

  // Check if message is from current user
  const isOwnMessage = (message: ChatMessage) => {
    return message.senderId === currentUserId || message.senderType === userRole;
  };

  // Get message style based on sender
  const getMessageStyle = (message: ChatMessage) => {
    if (message.senderType === 'system') {
      return {
        container: 'justify-center',
        bubble: 'bg-gray-100 text-gray-700 border border-gray-200 text-xs max-w-sm',
        alignment: 'text-center'
      };
    }

    if (isOwnMessage(message)) {
      return {
        container: 'justify-end',
        bubble: 'bg-orange-500 text-white',
        alignment: 'text-right'
      };
    }

    return {
      container: 'justify-start',
      bubble: 'bg-blue-100 text-blue-900',
      alignment: 'text-left'
    };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
          <p className="text-gray-500 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-gray-500 text-sm">No messages yet</p>
          <p className="text-gray-400 text-xs mt-1">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((message) => {
        const style = getMessageStyle(message);
        
        return (
          <div key={message.$id} className={`flex ${style.container}`}>
            <div className={`max-w-xs lg:max-w-md`}>
              {/* Sender name (if not own message and not system) */}
              {!isOwnMessage(message) && message.senderType !== 'system' && (
                <div className="text-xs text-gray-500 mb-1 px-1">
                  {message.senderName}
                </div>
              )}

              {/* Message bubble */}
              <div className={`${style.bubble} rounded-lg px-4 py-2 shadow-sm`}>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                
                {/* Timestamp and read receipt */}
                <div className={`flex items-center gap-1 mt-1 text-xs opacity-70 ${style.alignment}`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {isOwnMessage(message) && message.senderType !== 'system' && (
                    <span>
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};
