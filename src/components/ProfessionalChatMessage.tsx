/**
 * Professional Chat Message Component with Status Indicators
 * Shows message status (sent, delivered, read) and typing indicators
 */

import React, { useState, useEffect } from 'react';
import { Check, CheckCheck, Eye, Clock, AlertCircle } from 'lucide-react';
import { professionalChatService, MessageStatus, TypingStatus } from '../services/professionalChatNotificationService';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'booking' | 'payment';
  status?: MessageStatus['status'];
  isOwn: boolean;
}

interface ProfessionalChatMessageProps {
  message: ChatMessage;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onStatusUpdate?: (messageId: string, status: MessageStatus['status']) => void;
}

export const ProfessionalChatMessage: React.FC<ProfessionalChatMessageProps> = ({
  message,
  showAvatar = true,
  showTimestamp = true,
  onStatusUpdate
}) => {
  const [messageStatus, setMessageStatus] = useState<MessageStatus | null>(null);

  useEffect(() => {
    // Listen for message status updates
    const handleStatusUpdate = (event: CustomEvent) => {
      const status = event.detail as MessageStatus;
      if (status.messageId === message.id) {
        setMessageStatus(status);
        onStatusUpdate?.(message.id, status.status);
      }
    };

    window.addEventListener('messageStatusUpdate', handleStatusUpdate as EventListener);
    
    // Get initial status
    const status = professionalChatService.getMessageStatus(message.id);
    if (status) setMessageStatus(status);

    return () => {
      window.removeEventListener('messageStatusUpdate', handleStatusUpdate as EventListener);
    };
  }, [message.id, onStatusUpdate]);

  const getStatusIcon = () => {
    if (!message.isOwn || !messageStatus) return null;

    switch (messageStatus.status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400 animate-spin" title="Sending..." />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" title="Sent" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-500" title="Delivered" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" title="Read" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" title="Failed to send" />;
      default:
        return null;
    }
  };

  const getMessageTypeStyle = () => {
    switch (message.type) {
      case 'system':
        return 'bg-gray-100 border border-gray-200 text-gray-700 text-center';
      case 'booking':
        return 'bg-blue-50 border border-blue-200 text-blue-800';
      case 'payment':
        return 'bg-green-50 border border-green-200 text-green-800';
      default:
        return message.isOwn 
          ? 'bg-blue-500 text-white' 
          : 'bg-white border border-gray-200 text-gray-800';
    }
  };

  const getMessageTypeIcon = () => {
    switch (message.type) {
      case 'booking':
        return '📅';
      case 'payment':
        return '💰';
      case 'system':
        return '🔔';
      default:
        return '';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        {showAvatar && !message.isOwn && (
          <div className="flex items-end mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {message.senderName.charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-xs text-gray-600 font-medium">
              {message.senderName}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`rounded-2xl px-4 py-3 shadow-sm ${getMessageTypeStyle()}`}>
          {/* Message Type Icon */}
          {getMessageTypeIcon() && (
            <div className="text-lg mb-1">{getMessageTypeIcon()}</div>
          )}
          
          {/* Message Content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Message Footer */}
          <div className="flex items-center justify-between mt-2">
            {/* Timestamp */}
            {showTimestamp && (
              <span className={`text-xs ${
                message.isOwn 
                  ? message.type === 'text' ? 'text-blue-100' : 'text-gray-500'
                  : 'text-gray-500'
              }`}>
                {formatTimestamp(message.timestamp)}
              </span>
            )}

            {/* Status Icon for Own Messages */}
            {message.isOwn && (
              <div className="ml-2">
                {getStatusIcon()}
              </div>
            )}
          </div>
        </div>

        {/* Failed Message Retry */}
        {messageStatus?.status === 'failed' && message.isOwn && (
          <div className="text-right mt-1">
            <button
              onClick={() => {
                // Retry sending message
                professionalChatService.updateMessageStatus(message.id, 'sending', 'recipient');
              }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Tap to retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Typing Indicator Component
 */
interface TypingIndicatorProps {
  chatId: string;
  currentUserId: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  chatId,
  currentUserId
}) => {
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);

  useEffect(() => {
    const handleTypingUpdate = (event: CustomEvent) => {
      const typingStatus = event.detail as TypingStatus;
      if (typingStatus.chatId === chatId) {
        // Update typing users list
        const users = professionalChatService.getTypingUsers(chatId)
          .filter(user => user.userId !== currentUserId);
        setTypingUsers(users);
      }
    };

    window.addEventListener('typingStatusUpdate', handleTypingUpdate as EventListener);
    
    return () => {
      window.removeEventListener('typingStatusUpdate', handleTypingUpdate as EventListener);
    };
  }, [chatId, currentUserId]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].userName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`;
    } else {
      return `${typingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[70%]">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-600">{getTypingText()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalChatMessage;