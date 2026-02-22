/**
 * ChatInput Component
 * 
 * Purpose: Message input with send functionality
 * Data Flow: User input → Validation → sendMessage → Appwrite
 * 
 * Features:
 * - Auto-expanding textarea
 * - Enter to send (Shift+Enter for new line)
 * - Send button with loading state
 * - Character limit indicator
 * - Quick action buttons
 * - Disabled state when sending
 */

import React, { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  sending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  sending,
  disabled = false,
  placeholder = 'Type your message...'
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxLength = 1000;
  const remainingChars = maxLength - message.length;

  // Auto-resize textarea
  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  // Handle message change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      adjustHeight();
    }
  };

  // Handle send
  const handleSend = async () => {
    if (!message.trim() || sending || disabled) return;

    try {
      await onSend(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('❌ [ChatInput] Failed to send message:', err);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action buttons
  const quickActions = [
    { emoji: '👍', text: 'Thank you!' },
    { emoji: '👌', text: 'Okay' },
    { emoji: '⏰', text: 'What time?' },
    { emoji: '📍', text: 'Share location' }
  ];

  const handleQuickAction = (text: string) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t bg-white">
      {/* Quick Actions */}
      <div className="px-4 pt-2 flex gap-2 horizontal-scroll-safe pb-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => handleQuickAction(action.text)}
            disabled={disabled || sending}
            className="flex-shrink-0 text-xs px-2 py-1 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={action.text}
          >
            <span className="mr-1">{action.emoji}</span>
            {action.text}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4">
        <div className="flex gap-2 items-end">
          {/* Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || sending}
              className="w-full p-3 pr-16 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className={`absolute bottom-2 right-2 text-xs ${
                remainingChars < 50 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {remainingChars}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled || sending}
            className="flex-shrink-0 w-11 h-11 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm"
            title="Send message"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Helper text */}
        <div className="mt-2 text-xs text-gray-400 text-center">
          Press Enter to send • Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};
