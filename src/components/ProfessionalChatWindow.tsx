/**
 * Enhanced Professional Chat Window
 * Integrates all professional features: status indicators, typing, badges, sounds
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Phone, Play, Menu, X, Check, Plus } from 'lucide-react';
import { ProfessionalChatMessage, TypingIndicator } from './ProfessionalChatMessage';
import { NotificationBadge } from './NotificationBadge';
import { UserStatusIndicator, UserStatusManager } from './UserStatusIndicator';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system' | 'booking' | 'payment';
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  isOwn: boolean;
}

interface ProfessionalChatWindowProps {
  chatId: string;
  currentUserId: string;
  currentUserName: string;
  recipientId: string;
  recipientName: string;
  recipientType?: 'customer' | 'therapist' | 'admin';
  messages: ChatMessage[];
  onSendMessage: (content: string, type?: string) => void;
  onMessageStatusUpdate?: (messageId: string, status: string) => void;
  onClose?: () => void;
  isMinimized?: boolean;
  showHeader?: boolean;
}

export const ProfessionalChatWindow: React.FC<ProfessionalChatWindowProps> = ({
  chatId,
  currentUserId,
  currentUserName,
  recipientId,
  recipientName,
  recipientType = 'customer',
  messages,
  onSendMessage,
  onMessageStatusUpdate,
  onClose,
  isMinimized = false,
  showHeader = true
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle new message notifications
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && !lastMessage.isOwn && soundEnabled) {
      // Play message received sound for incoming messages
      professionalChatService.playChatEffect('message_received');
      
      // Update notification badge
      professionalChatService.incrementNotificationBadge(chatId);
    }
  }, [messages, soundEnabled, chatId]);

  // Clear badge when chat is focused
  useEffect(() => {
    if (!isMinimized) {
      professionalChatService.clearNotificationBadge(chatId);
    }
  }, [isMinimized, chatId]);

  const handleTyping = (content: string) => {
    setNewMessage(content);

    // Start typing indicator
    if (!isTyping && content.length > 0) {
      setIsTyping(true);
      professionalChatService.setTypingStatus(currentUserId, currentUserName, chatId, true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      professionalChatService.setTypingStatus(currentUserId, currentUserName, chatId, false);
    }, 1000);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage('');
    setIsTyping(false);
    professionalChatService.setTypingStatus(currentUserId, currentUserName, chatId, false);

    // Create message with initial sending status
    const messageId = `msg_${Date.now()}_${Math.random()}`;
    professionalChatService.updateMessageStatus(messageId, 'sending', recipientId);

    // Send message
    onSendMessage(content, 'text');

    // Simulate message delivery statuses
    setTimeout(() => {
      professionalChatService.updateMessageStatus(messageId, 'sent', recipientId);
    }, 500);

    setTimeout(() => {
      professionalChatService.updateMessageStatus(messageId, 'delivered', recipientId);
    }, 1500);

    // Mark as read after recipient sees it (simulated)
    setTimeout(() => {
      professionalChatService.updateMessageStatus(messageId, 'read', recipientId);
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getRecipientTypeColor = () => {
    switch (recipientType) {
      case 'therapist':
        return 'from-green-500 to-green-600';
      case 'admin':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-purple-500 to-purple-600';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg cursor-pointer z-40"
           onClick={onClose}>
        <div className="p-3 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {recipientName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sm">{recipientName}</div>
            <UserStatusIndicator userId={recipientId} size="sm" />
          </div>
          <NotificationBadge chatId={chatId} size="sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      {showHeader && (
        <div className={`bg-gradient-to-r ${getRecipientTypeColor()} text-white p-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold">
              {recipientName.charAt(0).toUpperCase()}
            </div>
            
            {/* User Info */}
            <div>
              <div className="font-semibold">{recipientName}</div>
              <UserStatusIndicator 
                userId={recipientId} 
                showText={true} 
                size="sm" 
                className="text-white"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <NotificationBadge chatId={chatId} size="sm" color="red" />
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </button>

            <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
              <Phone className="w-4 h-4" />
            </button>

            <button className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors">
              <Play className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.map(message => (
          <ProfessionalChatMessage
            key={message.id}
            message={message}
            showAvatar={false}
            showTimestamp={true}
            onStatusUpdate={onMessageStatusUpdate}
          />
        ))}
        
        {/* Typing Indicator */}
        <TypingIndicator chatId={chatId} currentUserId={currentUserId} />
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows={1}
              style={{ maxHeight: '60px' }}
            />
          </div>

          {/* Emoji Button */}
          <button 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-gray-600" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Status Manager for current user */}
        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <UserStatusManager
            currentUserId={currentUserId}
            currentUserName={currentUserName}
          />
          <div>
            {soundEnabled ? '🔊' : '🔇'} Sound {soundEnabled ? 'on' : 'off'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalChatWindow;