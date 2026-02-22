// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
/**
 * ChatMessages Component - Enhanced with Avatar System
 * 
 * Purpose: Displays chat messages with auto-scroll and read receipts
 * Data Flow: useChatMessages hook → Message list → UI rendering
 * 
 * Features:
 * - Displays messages from user, therapist, and system
 * - Enhanced avatar system with race/gender matching
 * - Therapist profile image on left side (small circle)
 * - Customer avatar on left side (auto-assigned)
 * - Different styling for each sender type
 * - Auto-scroll to latest message
 * - Timestamp formatting
 * - Read receipts
 * - Loading states
 */

import React, { useEffect, useRef } from 'react';
import { ChatMessage } from './hooks/useChatMessages';
import { type AvatarOption } from '../constants/chatAvatars';

interface ChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
  currentUserId: string;
  userRole: 'customer' | 'therapist';
  therapistImage?: string;
  customerAvatar?: AvatarOption;
  therapistName?: string;
  customerName?: string;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  loading,
  currentUserId,
  userRole,
  therapistImage,
  customerAvatar,
  therapistName,
  customerName
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

  // Get avatar for message sender
  const getMessageAvatar = (message: ChatMessage) => {
    if (message.senderType === 'system') {
      return (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
          🤖
        </div>
      );
    }

    if (message.senderType === 'therapist' && therapistImage) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-amber-200 shadow-sm">
          <img 
            src={therapistImage} 
            alt={therapistName || 'Therapist'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.jpg';
            }}
          />
        </div>
      );
    }

    if (message.senderType === 'customer' && customerAvatar) {
      return (
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-200 shadow-sm">
          <img 
            src={customerAvatar.imageUrl} 
            alt={customerAvatar.label}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.jpg';
            }}
          />
        </div>
      );
    }

    // Fallback avatar
    const initials = (message.senderName || 'U').charAt(0).toUpperCase();
    const bgColor = message.senderType === 'therapist' ? 'bg-amber-500' : 'bg-amber-500';
    
    return (
      <div className={`w-8 h-8 rounded-full ${bgColor} text-white flex items-center justify-center text-sm font-semibold shadow-sm`}>
        {initials}
      </div>
    );
  };

  // Get message style based on sender
  const getMessageStyle = (message: ChatMessage) => {
    if (message.senderType === 'system') {
      return {
        container: 'justify-center',
        bubble: 'bg-gray-100 text-gray-700 border border-gray-200 text-xs max-w-sm',
        alignment: 'text-center',
        showAvatar: false
      };
    }

    if (isOwnMessage(message)) {
      return {
        container: 'justify-end flex-row-reverse',
        bubble: 'bg-amber-500 text-white shadow-lg',
        alignment: 'text-right',
        showAvatar: true,
        avatarMargin: 'mr-0 ml-2' // Avatar on right side
      };
    }

    return {
      container: 'justify-start',
      bubble: 'bg-amber-50 text-amber-900 border border-amber-200 shadow-sm',
      alignment: 'text-left',
      showAvatar: true,
      avatarMargin: 'ml-0 mr-2' // Avatar on left side
    };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-2"></div>
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
    <div 
      className="flex-1 p-4 space-y-4 overflow-y-auto" 
      style={{ 
        maxHeight: '60vh',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {messages.map((message) => {
        const style = getMessageStyle(message);
        
        return (
          <div key={message.$id} className={`flex items-end gap-2 ${style.container}`}>
            {/* Avatar - positioned on left for others, right for own messages */}
            {style.showAvatar && (
              <div className={`flex-shrink-0 ${style.avatarMargin}`}>
                {getMessageAvatar(message)}
              </div>
            )}

            <div className="flex flex-col max-w-xs lg:max-w-md">
              {/* Check if this is a rejection/busy message for special rendering */}
              {message.senderType === 'system' && (message.content.includes('Booking rejected') || message.content.includes('therapist is busy')) ? (
                <div style={{ maxWidth: '100%', textAlign: 'center' }}>
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/therapist%20is%20busy.png?updatedAt=1770373381563"
                    alt="Therapist is busy - Finding alternative"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                      borderRadius: '16px'
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-2 opacity-70">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ) : message.senderType === 'system' && (message.content.includes('on the way') || message.content.includes('On the way') || message.content.includes('On The Way')) ? (
                <div style={{ maxWidth: '100%', textAlign: 'center' }}>
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/therapist%20is%20on%20the%20way.png?updatedAt=1770373549529"
                    alt="Therapist is on the way"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                      borderRadius: '16px'
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-2 opacity-70">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              ) : (
                <>
                  {/* Sender name (if not own message and not system) */}
                  {!isOwnMessage(message) && message.senderType !== 'system' && (
                    <div className="text-xs text-gray-500 mb-1 px-1">
                      {message.senderName}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div className={`${style.bubble} rounded-2xl px-4 py-3`}>
                {/* Special rendering for discount/voucher messages */}
                {message.content && /discount code|voucher code|discount/i.test(message.content) && /code[:\s]/i.test(message.content) ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-lg font-bold text-amber-600">🎁 Voucher Code</span>
                    <span className="text-2xl font-mono font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200 mb-2 shadow-sm">
                      {(() => {
                        // Extract code from message.content
                        const match = message.content.match(/code[:\s]*([A-Z0-9\-]+)/i);
                        return match ? match[1] : '—';
                      })()}
                    </span>
                    <button
                      className="mt-2 px-6 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-white font-bold rounded-full shadow-lg animate-pulse focus:outline-none focus:ring-2 focus:ring-amber-300 transition-all text-lg"
                      onClick={() => {
                        // Custom event to open order page and activate discount
                        const code = (() => {
                          const match = message.content.match(/code[:\s]*([A-Z0-9\-]+)/i);
                          return match ? match[1] : '';
                        })();
                        window.dispatchEvent(new CustomEvent('openOrderPageWithDiscount', {
                          detail: {
                            therapistId: message.therapistId || '',
                            discountCode: code
                          }
                        }));
                      }}
                    >
                      Book Now & Use Discount
                    </button>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                )}
                {/* Timestamp and read receipt */}
                <div className={`flex items-center gap-1 mt-2 text-xs opacity-70 ${style.alignment}`}>
                  <span>{formatTime(message.timestamp)}</span>
                  {isOwnMessage(message) && message.senderType !== 'system' && (
                    <span className="text-xs">
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
              </>
              )}
            </div>
          </div>
        );
      })}
      
      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
};
