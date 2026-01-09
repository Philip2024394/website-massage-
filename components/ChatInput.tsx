/**
 * ============================================================================
 * 📱 CHAT INPUT - WhatsApp/Messenger-style Input Bar
 * ============================================================================
 * 
 * Features:
 * ✅ Persistent fixed positioning at bottom
 * ✅ Rounded input field with proper styling
 * ✅ Send button with paper-plane icon
 * ✅ Enter sends, Shift+Enter new line
 * ✅ Emoji picker integration
 * ✅ Auto-expanding textarea
 * ✅ Typing indicator triggers
 * ✅ Never unmounts or disappears
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';

// ============================================================================
// TYPES
// ============================================================================

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  sending?: boolean;
}

// ============================================================================
// CHAT INPUT COMPONENT
// ============================================================================

export function ChatInput({ 
  onSend, 
  onTyping, 
  disabled = false, 
  placeholder = "Type a message…",
  sending = false 
}: ChatInputProps) {
  // ========================================================================
  // STATE MANAGEMENT
  // ========================================================================
  
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // ========================================================================
  // TYPING INDICATOR MANAGEMENT
  // ========================================================================
  
  const handleTypingStart = useCallback(() => {
    onTyping(true);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  }, [onTyping]);
  
  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTyping(false);
  }, [onTyping]);
  
  // ========================================================================
  // MESSAGE INPUT HANDLING
  // ========================================================================
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Trigger typing indicator
    if (value.trim() && !isComposing) {
      handleTypingStart();
    } else if (!value.trim()) {
      handleTypingStop();
    }
    
    // Auto-resize textarea
    adjustTextareaHeight();
  }, [handleTypingStart, handleTypingStop, isComposing]);
  
  /**
   * Auto-resize textarea based on content
   */
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max 5 lines approximately
      
      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  }, []);
  
  // ========================================================================
  // KEYBOARD EVENTS
  // ========================================================================
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle composition events (for international keyboards)
    if (e.nativeEvent.isComposing || isComposing) {
      return;
    }
    
    // Enter sends message, Shift+Enter adds new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [isComposing]);
  
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);
  
  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);
  
  // ========================================================================
  // MESSAGE SENDING
  // ========================================================================
  
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || disabled || sending) {
      return;
    }
    
    try {
      // Clear input immediately for better UX
      setMessage('');
      handleTypingStop();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      
      // Send message
      await onSend(trimmedMessage);
      
      // Focus back to input
      textareaRef.current?.focus();
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessage(trimmedMessage);
    }
  }, [message, disabled, sending, onSend, handleTypingStop]);
  
  // ========================================================================
  // EMOJI HANDLING
  // ========================================================================
  
  const handleEmojiSelect = useCallback((emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPosition = textarea.selectionStart;
      const textBefore = message.slice(0, cursorPosition);
      const textAfter = message.slice(textarea.selectionEnd);
      
      const newMessage = textBefore + emoji + textAfter;
      setMessage(newMessage);
      
      // Set cursor position after emoji
      setTimeout(() => {
        const newCursorPosition = cursorPosition + emoji.length;
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
        adjustTextareaHeight();
      }, 0);
    }
    
    setShowEmojiPicker(false);
  }, [message, adjustTextareaHeight]);
  
  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);
  
  // ========================================================================
  // CLICK OUTSIDE HANDLER
  // ========================================================================
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  // ========================================================================
  // CLEANUP ON UNMOUNT
  // ========================================================================
  
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      handleTypingStop();
    };
  }, [handleTypingStop]);
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  return (
    <div className="relative">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker
            onEmojiSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}
      
      {/* Input Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-end gap-3">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={toggleEmojiPicker}
          disabled={disabled}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            disabled 
              ? 'text-gray-400 cursor-not-allowed' 
              : showEmojiPicker
              ? 'bg-orange-100 text-orange-600'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
          title="Add emoji"
        >
          <Smile className="w-5 h-5" />
        </button>
        
        {/* Input Field */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            disabled={disabled || sending}
            placeholder={sending ? 'Sending...' : placeholder}
            className={`w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors text-sm leading-5 ${
              disabled || sending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              minHeight: '44px',
              maxHeight: '120px'
            }}
            rows={1}
          />
          
          {/* Character Count (optional, for very long messages) */}
          {message.length > 400 && (
            <div className="absolute -top-6 right-2 text-xs text-gray-500">
              {message.length}/1000
            </div>
          )}
        </div>
        
        {/* Send Button */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!message.trim() || disabled || sending}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            !message.trim() || disabled || sending
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
          }`}
          title={sending ? 'Sending...' : 'Send message'}
        >
          {sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}