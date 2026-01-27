/**
 * ============================================================================
 * ⌨️  TYPING INDICATOR - Real-time Typing Status Display
 * ============================================================================
 * 
 * Features:
 * ✅ Real-time typing status display
 * ✅ Animated typing dots
 * ✅ Multiple users typing support
 * ✅ Role-based display (User/Therapist)
 * ✅ Smooth animations and transitions
 * ✅ Auto-hide when no one is typing
 */

import React, { useState, useEffect } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface TypingUser {
  userId: string;
  role: 'user' | 'therapist';
  name?: string;
}

interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

// ============================================================================
// TYPING INDICATOR COMPONENT
// ============================================================================

export function TypingIndicator({ typingUsers, className = '' }: TypingIndicatorProps) {
  const [visible, setVisible] = useState(false);

  // Show/hide with animation delay
  useEffect(() => {
    if (typingUsers.length > 0) {
      setVisible(true);
    } else {
      // Delay hiding to prevent flicker
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [typingUsers.length]);

  // Don't render if no typing users and animation complete
  if (!visible && typingUsers.length === 0) {
    return null;
  }

  // Generate display text based on typing users
  const getTypingText = (): string => {
    if (typingUsers.length === 0) return '';
    
    if (typingUsers.length === 1) {
      const user = typingUsers[0];
      const displayName = user.name || (user.role === 'therapist' ? 'Therapist' : 'User');
      return `${displayName} is typing`;
    }
    
    if (typingUsers.length === 2) {
      const names = typingUsers.map(user => 
        user.name || (user.role === 'therapist' ? 'Therapist' : 'User')
      );
      return `${names[0]} and ${names[1]} are typing`;
    }
    
    // More than 2 users
    return `${typingUsers.length} people are typing`;
  };

  return (
    <div className={`typing-indicator ${className}`}>
      <div 
        className={`flex items-center px-4 py-2 transition-all duration-300 ${
          typingUsers.length > 0 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2'
        }`}
      >
        {/* Typing Text */}
        <span className="text-sm text-gray-600 mr-3">
          {getTypingText()}
        </span>

        {/* Animated Dots */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-1">
            <TypingDots />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ANIMATED TYPING DOTS
// ============================================================================

function TypingDots() {
  return (
    <div className="flex items-center space-x-1">
      <div 
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        style={{ animationDelay: '0ms' }}
      />
      <div 
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        style={{ animationDelay: '150ms' }}
      />
      <div 
        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
}

// ============================================================================
// HOOKS FOR TYPING MANAGEMENT
// ============================================================================

/**
 * Hook to manage typing status with debouncing
 */
export function useTypingIndicator(
  onTypingChange: (isTyping: boolean) => void,
  debounceMs: number = 2000
) {
  const [isTyping, setIsTyping] = useState(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  const startTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      onTypingChange(true);
    }

    // Clear existing timeout
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }

    // Set new timeout to stop typing
    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      onTypingChange(false);
      setTimeoutRef(null);
    }, debounceMs);

    setTimeoutRef(newTimeout);
  };

  const stopTyping = () => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      setTimeoutRef(null);
    }
    
    if (isTyping) {
      setIsTyping(false);
      onTypingChange(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [timeoutRef]);

  return {
    isTyping,
    startTyping,
    stopTyping
  };
}

// ============================================================================
// COMPACT TYPING INDICATOR (for minimal spaces)
// ============================================================================

interface CompactTypingIndicatorProps {
  isTyping: boolean;
  userName?: string;
  className?: string;
}

export function CompactTypingIndicator({ 
  isTyping, 
  userName = 'Someone',
  className = '' 
}: CompactTypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className={`flex items-center text-xs text-gray-500 ${className}`}>
      <span className="mr-2">{userName} is typing</span>
      <div className="flex space-x-1">
        <div 
          className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" 
          style={{ animationDelay: '0ms' }}
        />
        <div 
          className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" 
          style={{ animationDelay: '200ms' }}
        />
        <div 
          className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" 
          style={{ animationDelay: '400ms' }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// BUBBLE TYPING INDICATOR (WhatsApp-style)
// ============================================================================

interface BubbleTypingIndicatorProps {
  isTyping: boolean;
  avatar?: string;
  className?: string;
}

export function BubbleTypingIndicator({ 
  isTyping, 
  avatar,
  className = '' 
}: BubbleTypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className={`flex items-end space-x-2 mb-4 ${className}`}>
      {/* Avatar */}
      {avatar && (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
          <img 
            src={avatar} 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      {/* Typing Bubble */}
      <div className="bg-gray-200 rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
        <div className="flex items-center space-x-1">
          <div 
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}