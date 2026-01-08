/**
 * FloatingChatWindow Component
 * 
 * Purpose: Main standalone chat window that floats on the page
 * Data Flow: Appwrite → Hooks → UI Components → User Interaction → Appwrite
 * 
 * Features:
 * - Draggable window
 * - Minimizable/Maximizable
 * - Orange header (brand color)
 * - Real-time message updates
 * - Booking countdown timer
 * - Notification system
 * - Persists position across reloads
 * - Fully standalone - no dependency on main app state
 * 
 * Usage:
 * ```tsx
 * import { FloatingChatWindow } from './chat/FloatingChatWindow';
 * 
 * <FloatingChatWindow
 *   userId="user123"
 *   userName="John Doe"
 *   userRole="customer"
 * />
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { useChatRooms } from './hooks/useChatRooms';
import { useChatMessages } from './hooks/useChatMessages';
import { useNotifications } from './hooks/useNotifications';
import { BookingBanner } from './BookingBanner';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface FloatingChatWindowProps {
  userId: string;
  userName: string;
  userRole: 'customer' | 'therapist';
  initialPosition?: { x: number; y: number };
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({
  userId,
  userName,
  userRole,
  initialPosition = { x: window.innerWidth - 420, y: window.innerHeight - 620 }
}) => {
  console.log('🚀 [FloatingChatWindow] Initialized with:', { userId, userName, userRole });

  // Window state
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Refs
  const windowRef = useRef<HTMLDivElement>(null);

  // Hooks
  const {
    chatRooms,
    activeChatRoom,
    loading: roomsLoading,
    error: roomsError,
    setActiveChatRoom
  } = useChatRooms(userId, userRole);

  const {
    messages,
    loading: messagesLoading,
    sending,
    error: messagesError,
    sendMessage
  } = useChatMessages(
    activeChatRoom?.$id || null,
    userId,
    userName,
    userRole
  );

  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications();

  // Auto-open chat if there are active rooms
  useEffect(() => {
    if (chatRooms.length > 0 && !isOpen) {
      console.log('📬 [FloatingChatWindow] Auto-opening chat - active rooms found');
      setIsOpen(true);
    }
  }, [chatRooms.length]);

  // Show notification for new messages
  useEffect(() => {
    if (messages.length === 0) return;

    const latestMessage = messages[messages.length - 1];
    
    // Only notify for messages from others
    if (latestMessage.senderId !== userId && latestMessage.senderType !== userRole) {
      addNotification(
        'info',
        'New Message',
        `${latestMessage.senderName}: ${latestMessage.content.substring(0, 50)}${latestMessage.content.length > 50 ? '...' : ''}`
      );
    }
  }, [messages.length]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 600, e.clientY - dragOffset.y));
      
      setPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem('chat-window-position', JSON.stringify(position));
  }, [position]);

  // Load position from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem('chat-window-position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (err) {
        console.warn('⚠️ [FloatingChatWindow] Could not parse saved position');
      }
    }
  }, []);

  // Handle send message
  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
      
      // Show success notification
      addNotification('success', 'Message Sent', 'Your message was delivered', { duration: 2000 });
    } catch (err) {
      addNotification('error', 'Send Failed', 'Could not send message. Please try again.');
      throw err;
    }
  };

  // Floating chat button (when minimized or closed)
  if (!isOpen || isMinimized) {
    const unreadCount = chatRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

    return (
      <>
        {/* Floating button */}
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-110 flex items-center justify-center z-50"
          title="Open chat"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.582 8-8 8a8.955 8.955 0 01-3.878-.9L3 21l1.9-6.122A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>

        {/* Notifications (show even when closed) */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
                notification.type === 'info' ? 'bg-blue-50 border-blue-500' :
                notification.type === 'success' ? 'bg-green-50 border-green-500' :
                notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-red-50 border-red-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{notification.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Main chat window
  return (
    <>
      <div
        ref={windowRef}
        className="fixed bg-white rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-300"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '400px',
          height: '600px',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header - ORANGE COLOR */}
        <div className="drag-handle bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white cursor-grab active:cursor-grabbing">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💬</div>
              <div>
                <h3 className="font-semibold">Chat</h3>
                <p className="text-xs text-white/80">
                  {chatRooms.length} active {chatRooms.length === 1 ? 'conversation' : 'conversations'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Minimize button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Minimize"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="p-2 hover:bg-white/20 rounded transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-[calc(100%-64px)]">
          {/* Loading state */}
          {roomsLoading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
                <p className="text-gray-500 text-sm">Loading chats...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {roomsError && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-2">⚠️</div>
                <p className="text-red-600 font-medium">Error Loading Chats</p>
                <p className="text-gray-500 text-sm mt-1">{roomsError}</p>
              </div>
            </div>
          )}

          {/* No active rooms */}
          {!roomsLoading && !roomsError && chatRooms.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-600 font-medium">No Active Chats</p>
                <p className="text-gray-400 text-sm mt-2">
                  Your chat will appear here after booking
                </p>
              </div>
            </div>
          )}

          {/* Active chat room */}
          {!roomsLoading && activeChatRoom && (
            <>
              {/* Booking Banner */}
              <BookingBanner
                therapistName={activeChatRoom.therapistName}
                therapistPhoto={activeChatRoom.therapistPhoto}
                bookingDate={activeChatRoom.bookingDate}
                bookingTime={activeChatRoom.bookingTime}
                serviceDuration={activeChatRoom.serviceDuration}
                serviceType={activeChatRoom.serviceType}
              />

              {/* Messages */}
              <ChatMessages
                messages={messages}
                loading={messagesLoading}
                currentUserId={userId}
                userRole={userRole}
              />

              {/* Input */}
              <ChatInput
                onSend={handleSendMessage}
                sending={sending}
                placeholder={`Message ${activeChatRoom.therapistName}...`}
              />
            </>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ${
              notification.type === 'info' ? 'bg-blue-50 border-blue-500' :
              notification.type === 'success' ? 'bg-green-50 border-green-500' :
              notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
              'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{notification.title}</div>
                <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
