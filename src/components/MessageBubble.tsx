/**
 * ============================================================================
 * 💬 MESSAGE BUBBLE - WhatsApp-style Message Display with Read Receipts
 * ============================================================================
 * 
 * Features:
 * ✅ Message bubbles with proper alignment
 * ✅ Read receipts (✓ sent, ✓✓ delivered/read)
 * ✅ Timestamp display
 * ✅ Emoji rendering support
 * ✅ Sender identification
 * ✅ Status indicators (sending, sent, failed)
 * ✅ Mobile-first responsive design
 */

import { logger } from '../utils/logger';

import React, { useMemo } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface MessageBubbleProps {
  message: {
    $id: string;
    content: string;
    senderId: string;
    senderName: string;
    senderType: 'customer' | 'therapist' | 'system' | 'admin';
    timestamp: string;
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
    read: boolean;
    readAt?: string;
  };
  currentUserId: string;
  isOptimistic?: boolean;
  showAvatar?: boolean;
  showSender?: boolean;
  className?: string;
}

// ============================================================================
// MESSAGE BUBBLE COMPONENT
// ============================================================================

export function MessageBubble({
  message,
  currentUserId,
  isOptimistic = false,
  showAvatar = true,
  showSender = true,
  className = ''
}: MessageBubbleProps) {
  // Determine if message is from current user
  const isOwnMessage = message.senderId === currentUserId;
  
  // Format timestamp
  const formattedTime = useMemo(() => {
    const date = new Date(message.timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  }, [message.timestamp]);

  // Get message status icon
  const getStatusIcon = () => {
    if (!isOwnMessage) return null;

    switch (message.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <div className="flex"><Check className="w-3 h-3 text-gray-400" /><Check className="w-3 h-3 text-gray-400 -ml-1" /></div>;
      case 'read':
        return <div className="flex"><Check className="w-3 h-3 text-blue-500" /><Check className="w-3 h-3 text-blue-500 -ml-1" /></div>;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  // Get message bubble styles
  const getBubbleStyles = () => {
    if (message.senderType === 'system') {
      return 'bg-gray-100 text-gray-700 text-center mx-4 rounded-lg px-4 py-2 text-sm';
    }

    if (isOwnMessage) {
      return 'bg-orange-500 text-white rounded-2xl rounded-br-md px-4 py-2 max-w-xs ml-auto';
    }

    return 'bg-gray-200 text-gray-900 rounded-2xl rounded-bl-md px-4 py-2 max-w-xs mr-auto';
  };

  // Check if message contains only emojis
  const isEmojiOnly = (text: string): boolean => {
    const emojiRegex = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]*$/u;
    return emojiRegex.test(text.trim());
  };

  // Handle system messages
  if (message.senderType === 'system') {
    // Check if this is a rejection message
    const isRejectionMessage = message.content.includes('Booking rejected') || 
                               message.content.includes('therapist is busy');
    
    // Check if this is an "on the way" message
    const isOnTheWayMessage = message.content.includes('on the way') || 
                              message.content.includes('On the way') ||
                              message.content.includes('On The Way');
    
    if (isRejectionMessage) {
      return (
        <div className={`flex justify-center mb-4 ${className}`}>
          <div style={{ maxWidth: '100%', textAlign: 'center' }}>
            <img 
              src="https://ik.imagekit.io/7grri5v7d/therapist%20is%20busy.png?updatedAt=1770373381563"
              alt="Therapist is busy - Finding alternative"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      );
    }
    
    if (isOnTheWayMessage) {
      return (
        <div className={`flex justify-center mb-4 ${className}`}>
          <div style={{ maxWidth: '100%', textAlign: 'center' }}>
            <img 
              src="https://ik.imagekit.io/7grri5v7d/therapist%20is%20on%20the%20way.png?updatedAt=1770373549529"
              alt="Therapist is on the way"
              style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      );
    }
    
    return (
      <div className={`flex justify-center mb-4 ${className}`}>
        <div className={getBubbleStyles()}>
          {message.content}
        </div>
      </div>
    );
  }

  // Get avatar initials or image
  const getAvatar = () => {
    if (!showAvatar) return null;

    const initials = message.senderName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const avatarColor = isOwnMessage ? 'bg-orange-500' : 'bg-gray-400';

    return (
      <div className={`w-8 h-8 rounded-full ${avatarColor} text-white text-xs flex items-center justify-center flex-shrink-0 font-medium`}>
        {initials}
      </div>
    );
  };

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'} ${className}`}>
      {/* Avatar for other users (left side) */}
      {!isOwnMessage && showAvatar && (
        <div className="mr-2">
          {getAvatar()}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender Name */}
        {showSender && !isOwnMessage && (
          <div className="text-xs text-gray-600 mb-1 px-1">
            {message.senderName}
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative ${getBubbleStyles()} ${isOptimistic ? 'opacity-70' : ''}`}>
          {/* Message Content */}
          <div className={`${isEmojiOnly(message.content) ? 'text-2xl' : ''}`}>
            {message.content}
          </div>

          {/* Timestamp and Status */}
          <div className={`flex items-center justify-end mt-1 space-x-1 ${
            isOwnMessage ? 'text-orange-200' : 'text-gray-500'
          }`}>
            <span className="text-xs">{formattedTime}</span>
            {getStatusIcon()}
          </div>

          {/* Optimistic indicator */}
          {isOptimistic && (
            <div className="absolute -right-1 -top-1">
              <div className="w-3 h-3 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Read receipt timestamp (for own messages) */}
        {isOwnMessage && message.status === 'read' && message.readAt && (
          <div className="text-xs text-gray-400 mt-1 px-1">
            Read {new Date(message.readAt).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false
            })}
          </div>
        )}

        {/* Failed message retry option */}
        {message.status === 'failed' && (
          <button 
            className="text-xs text-red-500 hover:text-red-700 mt-1 px-1"
            onClick={() => {
              // Handle retry logic - could emit event to parent
              logger.debug('Retry message:', message.$id);
            }}
          >
            Tap to retry
          </button>
        )}
      </div>

      {/* Avatar for own messages (right side) */}
      {isOwnMessage && showAvatar && (
        <div className="ml-2">
          {getAvatar()}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MESSAGE LIST COMPONENT
// ============================================================================

interface MessageListProps {
  messages: MessageBubbleProps['message'][];
  currentUserId: string;
  showAvatars?: boolean;
  showSenders?: boolean;
  className?: string;
}

export function MessageList({
  messages,
  currentUserId,
  showAvatars = true,
  showSenders = true,
  className = ''
}: MessageListProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {messages.map((message, index) => {
        // Check if we should show avatar/sender for this message
        const prevMessage = messages[index - 1];
        const nextMessage = messages[index + 1];
        
        const isFirstInGroup = !prevMessage || prevMessage.senderId !== message.senderId;
        const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;
        
        return (
          <MessageBubble
            key={message.$id}
            message={message}
            currentUserId={currentUserId}
            showAvatar={showAvatars && isLastInGroup}
            showSender={showSenders && isFirstInGroup && message.senderId !== currentUserId}
            className={`${!isLastInGroup ? 'mb-1' : 'mb-4'}`}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// DATE SEPARATOR COMPONENT
// ============================================================================

interface DateSeparatorProps {
  date: string;
  className?: string;
}

export function DateSeparator({ date, className = '' }: DateSeparatorProps) {
  const formattedDate = useMemo(() => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }, [date]);

  return (
    <div className={`flex justify-center my-4 ${className}`}>
      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
        {formattedDate}
      </div>
    </div>
  );
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Group messages by date for rendering date separators
 */
export function groupMessagesByDate(messages: MessageBubbleProps['message'][]) {
  const groups: Array<{ date: string; messages: MessageBubbleProps['message'][] }> = [];
  
  messages.forEach((message) => {
    const messageDate = new Date(message.timestamp).toDateString();
    const lastGroup = groups[groups.length - 1];
    
    if (!lastGroup || lastGroup.date !== messageDate) {
      groups.push({ date: messageDate, messages: [message] });
    } else {
      lastGroup.messages.push(message);
    }
  });
  
  return groups;
}