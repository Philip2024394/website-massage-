/**
 * Enhanced Chat Window with Integrated Report and Spam Prevention
 * Combines existing chat functionality with new moderation features
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Phone, VideoIcon, MoreHorizontal, Shield, AlertTriangle, CheckCircle, X, Eye } from 'lucide-react';
import { EnhancedReportButton, MessageFilterAlert } from './EnhancedReportButton';
import { ProfessionalChatMessage } from './ProfessionalChatMessage';
import { chatModerationService, ContentFilterResult } from '../services/chatModerationService';
import { professionalChatService } from '../services/professionalChatNotificationService';

interface EnhancedChatWindowProps {
  chatId: string;
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  userRole: 'customer' | 'therapist' | 'admin';
  onSendMessage?: (message: string) => void;
  messages?: any[];
  className?: string;
}

export const EnhancedChatWindow: React.FC<EnhancedChatWindowProps> = ({
  chatId,
  currentUserId,
  recipientId,
  recipientName,
  recipientAvatar,
  userRole,
  onSendMessage,
  messages = [],
  className = ''
}) => {
  const [messageText, setMessageText] = useState('');
  const [filterAlert, setFilterAlert] = useState<ContentFilterResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showModerationInfo, setShowModerationInfo] = useState(false);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize moderation service for this user/chat
    chatModerationService.initializeUserSession(currentUserId, chatId);
  }, [currentUserId, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    
    // Clear any previous filter alerts when user starts typing
    if (filterAlert) {
      setFilterAlert(null);
    }

    // Update typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      professionalChatService.playTypingSound();
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
    }
  };

  const validateMessage = async (text: string): Promise<ContentFilterResult | null> => {
    try {
      const validation = await chatModerationService.validateMessage({
        text,
        userId: currentUserId,
        chatId,
        recipientId
      });

      if (!validation.allowed) {
        return validation;
      }

      return null;
    } catch (error) {
      console.error('Message validation error:', error);
      return null;
    }
  };

  const handleSendMessage = async (overrideFilter = false) => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);
    
    try {
      // Validate message unless user is overriding
      if (!overrideFilter) {
        const filterResult = await validateMessage(messageText);
        if (filterResult) {
          setFilterAlert(filterResult);
          setIsSending(false);
          
          // Play warning sound
          await professionalChatService.playChatEffect('user_away');
          return;
        }
      }

      // Send message
      await onSendMessage?.(messageText);
      
      // Add to message history for spam detection
      setMessageHistory(prev => [...prev.slice(-9), messageText]);
      
      // Clear input
      setMessageText('');
      setIsTyping(false);
      
      // Play send sound
      await professionalChatService.playChatEffect('message_sent');
      
      // Focus back to input
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Send message error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOverrideFilter = () => {
    handleSendMessage(true);
    setFilterAlert(null);
  };

  const getModerationStats = async () => {
    try {
      const stats = await chatModerationService.getUserModerationStats(currentUserId);
      return stats;
    } catch (error) {
      console.error('Failed to get moderation stats:', error);
      return null;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          {recipientAvatar ? (
            <img 
              src={recipientAvatar} 
              alt={recipientName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
              {recipientName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800">{recipientName}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online</span>
              {isTyping && (
                <div className="flex items-center gap-1 text-blue-500">
                  <span>Typing</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Moderation Info Button */}
          <button
            onClick={() => setShowModerationInfo(!showModerationInfo)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            title="Safety information"
          >
            <Shield className="w-5 h-5" />
          </button>

          {/* Report Button */}
          <EnhancedReportButton
            chatId={chatId}
            currentUserId={currentUserId}
            recipientId={recipientId}
            recipientName={recipientName}
            userRole={userRole}
            onReportSubmitted={(reportId) => {
              console.log('Report submitted:', reportId);
            }}
          />

          {/* More Options */}
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Moderation Info Panel */}
      {showModerationInfo && (
        <div className="bg-blue-50 border-b border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm">
              <h4 className="font-semibold text-blue-800 mb-2">🛡️ Chat Safety Features</h4>
              <div className="space-y-2 text-blue-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Automatic spam and inappropriate content filtering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Phone number sharing protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Rate limiting to prevent abuse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>24/7 admin monitoring and review</span>
                </div>
              </div>
              <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
                <strong>💡 Tip:</strong> Keep conversations professional and use our built-in booking system for payments and scheduling.
              </div>
            </div>
            <button
              onClick={() => setShowModerationInfo(false)}
              className="p-1 text-blue-500 hover:bg-blue-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Alert */}
      {filterAlert && (
        <div className="p-4 border-b border-gray-200">
          <MessageFilterAlert
            filterResult={filterAlert}
            onDismiss={() => setFilterAlert(null)}
            onOverride={filterAlert.severity !== 'high' ? handleOverrideFilter : undefined}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Safe & Secure Chat 🛡️</h3>
            <p className="text-center max-w-sm text-sm">
              Start your conversation! Our system automatically filters inappropriate content 
              and protects your personal information.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ProfessionalChatMessage
              key={message.id || index}
              message={message}
              isOwn={message.senderId === currentUserId}
              showAvatar={true}
              showStatus={true}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-3 pr-12 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSending}
              maxLength={1000}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {messageText.length}/1000
            </div>
          </div>
          
          <button
            onClick={() => handleSendMessage()}
            disabled={!messageText.trim() || isSending}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-xl transition-colors flex items-center justify-center min-w-[48px]"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Safety Notice */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>Protected by automatic content filtering</span>
          </div>
          <div className="flex items-center gap-4">
            <span>End-to-end monitored</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatWindow;