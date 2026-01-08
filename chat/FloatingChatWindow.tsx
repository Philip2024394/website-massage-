/**
 * FloatingChatWindow Component - Appwrite-First Architecture
 * 
 * Purpose: Main standalone chat window that consumes ChatProvider
 * Data Flow: Appwrite → ChatProvider → FloatingChatWindow → UI Components
 * 
 * CRITICAL: This component now uses ChatProvider instead of props
 * - No dependency on App.tsx state
 * - Always renders if chat rooms exist
 * - Automatically appears when Appwrite subscription fires
 * 
 * Features:
 * - Draggable window
 * - Minimizable/Maximizable
 * - Orange header (brand color)  
 * - Real-time message updates via ChatProvider
 * - Multiple chat rooms support
 * - Persists position across reloads
 * - Fully standalone architecture
 * 
 * Usage:
 * ```tsx
 * <ChatProvider>
 *   <FloatingChatWindow />
 * </ChatProvider>
 * ```
 */

import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatProvider';
import { useChatMessages } from './hooks/useChatMessages';
import { useNotifications } from './hooks/useNotifications';
import { BookingBanner } from './BookingBanner';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';

interface FloatingChatWindowProps {
  userId?: string;
  userName?: string;
  userRole?: string;
}

export const FloatingChatWindow: React.FC<FloatingChatWindowProps> = ({ 
  userId = 'guest', 
  userName = 'Guest User', 
  userRole = 'customer' 
}) => {
  console.log('🎪 [FloatingChatWindow] Initialized with ChatProvider');

  // Get chat data from provider
  const {
    activeChatRooms,
    isLoading,
    subscriptionActive,
    openChatRoom,
    closeChatRoom,
    minimizeChatRoom,
    isMinimized: isChatMinimized
  } = useChatContext();

  // Window state
  const [position, setPosition] = useState({ 
    x: window.innerWidth - 420, 
    y: window.innerHeight - 620 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // NEW: Booking form state for booking-in-progress chats
  const [bookingFormData, setBookingFormData] = useState({
    customerName: '',
    customerWhatsApp: '',
    location: ''
  });

  // Refs
  const windowRef = useRef<HTMLDivElement>(null);

  // Select first chat room by default
  useEffect(() => {
    if (activeChatRooms.length > 0 && !selectedChatId) {
      const firstRoom = activeChatRooms[0];
      setSelectedChatId(firstRoom.$id);
      console.log('📬 [FloatingChatWindow] Auto-selected first chat room:', firstRoom.$id);
    }
  }, [activeChatRooms, selectedChatId]);

  // Get current chat room
  const currentChatRoom = activeChatRooms.find(room => room.$id === selectedChatId);

  // Chat messages hook for current room
  const {
    messages,
    loading: messagesLoading,
    sending,
    error: messagesError,
    sendMessage
  } = useChatMessages(
    currentChatRoom?.$id || null,
    currentChatRoom?.customerId || '', // TODO: Get from auth context
    currentChatRoom?.customerName || '', // TODO: Get from auth context  
    'customer' // TODO: Get from auth context
  );

  const {
    notifications,
    addNotification,
    removeNotification
  } = useNotifications();

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

  // NEW: Handle booking confirmation from form
  const handleConfirmBooking = async (chatRoomId: string) => {
    const chatRoom = activeChatRooms.find(r => r.$id === chatRoomId);
    if (!chatRoom || chatRoom.status !== 'booking-in-progress') return;

    // Validate form
    if (!bookingFormData.customerName || !bookingFormData.customerWhatsApp || !bookingFormData.location) {
      addNotification('error', 'Missing Information', 'Please fill in all required fields');
      return;
    }

    // Validate WhatsApp number
    const cleanedWhatsApp = bookingFormData.customerWhatsApp.replace(/\D/g, '');
    if (cleanedWhatsApp.length < 8 || cleanedWhatsApp.length > 15) {
      addNotification('error', 'Invalid WhatsApp', 'Please enter a valid WhatsApp number (8-15 digits)');
      return;
    }

    try {
      console.log('🔥 BOOKING CONFIRMED', bookingFormData);

      // Import necessary services
      const { databases } = await import('../lib/appwrite');
      const { APPWRITE_CONFIG } = await import('../lib/appwrite.config');
      const { ensureAuthSession } = await import('../lib/authSessionHelper');
      const { createChatRoom, sendWelcomeMessage, sendBookingReceivedMessage } = await import('../lib/chatService');
      
      // Ensure authentication
      const authResult = await ensureAuthSession('booking confirmation');
      if (!authResult.success) {
        addNotification('error', 'Authentication Failed', 'Please try again');
        return;
      }

      const userId = authResult.userId!;
      const formattedWhatsApp = `+62${cleanedWhatsApp}`;

      // Calculate price
      const price = chatRoom.pricing[String(chatRoom.duration)] || 0;

      // Prepare booking data
      const bookingData: any = {
        bookingId: `booking_${Date.now()}`,
        bookingDate: new Date().toISOString(),
        userId: String(userId),
        status: 'Pending',
        duration: Number(chatRoom.duration),
        providerId: String(chatRoom.providerId),
        providerType: 'therapist',
        providerName: String(chatRoom.providerName),
        service: String(chatRoom.duration),
        startTime: new Date().toISOString(),
        price: Number(Math.round(price / 1000)),
        createdAt: new Date().toISOString(),
        responseDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        totalCost: price,
        paymentMethod: 'Unpaid',
        scheduledTime: new Date().toISOString(),
        customerName: bookingFormData.customerName,
        customerWhatsApp: formattedWhatsApp,
        customerLocation: bookingFormData.location,
        bookingType: 'immediate',
        therapistId: chatRoom.providerId,
        therapistName: chatRoom.providerName,
        therapistType: 'therapist'
      };

      // Save booking to Appwrite
      const bookingResponse = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings || 'bookings',
        'unique()',
        bookingData
      );

      console.log('✅ Booking saved:', bookingResponse.$id);

      // Create real chat room
      const realChatRoom = await createChatRoom({
        bookingId: bookingResponse.$id,
        customerId: userId,
        customerName: bookingFormData.customerName,
        customerLanguage: 'en',
        customerPhoto: '',
        therapistId: chatRoom.providerId,
        therapistName: chatRoom.providerName,
        therapistLanguage: 'id',
        therapistType: 'therapist',
        therapistPhoto: chatRoom.providerImage || '',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      });

      console.log('✅ Chat room created:', realChatRoom.$id);

      // Send welcome messages
      try {
        await sendWelcomeMessage(realChatRoom.$id, chatRoom.providerName, userId);
        await sendBookingReceivedMessage(realChatRoom.$id, userId);
      } catch (err) {
        console.warn('⚠️ Welcome messages failed:', err);
      }

      // Replace temp chat with real chat
      closeChatRoom(chatRoomId);
      
      addNotification('success', 'Booking Confirmed', 'Chat window will update shortly');
      
      // Reset form
      setBookingFormData({ customerName: '', customerWhatsApp: '', location: '' });

      // The Appwrite subscription will automatically add the new chat room

    } catch (err: any) {
      console.error('❌ Booking confirmation failed:', err);
      addNotification('error', 'Booking Failed', err.message || 'Please try again');
    }
  };

  // Don't render anything if no subscription or loading
  if (!subscriptionActive && !isLoading) {
    console.log('🔌 [FloatingChatWindow] No subscription - not rendering');
    return null;
  }

  if (activeChatRooms.length === 0 && !isLoading) {
    console.log('📭 [FloatingChatWindow] No active chat rooms - not rendering');
    return null;
  }

  console.log('🎯 [FloatingChatWindow] Rendering with rooms:', activeChatRooms.map(r => r.$id));

  return (
    <>
      {/* Render all active chat rooms */}
      {activeChatRooms.map((chatRoom, index) => {
        const isMinimized = isChatMinimized(chatRoom.$id);
        const isSelected = chatRoom.$id === selectedChatId;
        
        return (
          <div
            key={chatRoom.$id}
            ref={isSelected ? windowRef : null}
            className={`
              fixed bg-white rounded-t-2xl shadow-2xl border border-gray-200 z-50
              transition-all duration-300 ease-in-out
              ${isMinimized ? 'h-16' : 'h-[600px]'}
              w-96
            `}
            style={{
              right: `${16 + (index * 20)}px`,
              bottom: '0px',
              transform: isMinimized ? 'translateY(calc(100% - 64px))' : 'translateY(0)'
            }}
          >
            {/* Header */}
            <div 
              className="bg-orange-500 text-white p-4 rounded-t-2xl cursor-move flex items-center justify-between"
              onMouseDown={isSelected ? handleMouseDown : undefined}
            >
              <div className="flex items-center gap-3">
                {/* Profile Image */}
                <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center">
                  {chatRoom.providerImage ? (
                    <img 
                      src={chatRoom.providerImage} 
                      alt={chatRoom.providerName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold">
                      {chatRoom.providerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Chat Info */}
                <div>
                  <h3 className="font-bold text-lg">{chatRoom.providerName}</h3>
                  <p className="text-orange-100 text-sm">
                    {chatRoom.status === 'waiting' && '⏳ Waiting for response'}
                    {chatRoom.status === 'active' && '💬 Active chat'}
                    {chatRoom.status === 'completed' && '✅ Completed'}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Chat Selector (if multiple chats) */}
                {activeChatRooms.length > 1 && (
                  <button
                    onClick={() => setSelectedChatId(chatRoom.$id)}
                    className={`
                      p-2 rounded-full transition-colors text-sm font-bold
                      ${isSelected ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-400'}
                    `}
                  >
                    {index + 1}
                  </button>
                )}

                {/* Minimize/Maximize */}
                <button
                  onClick={() => isMinimized ? openChatRoom(chatRoom.$id) : minimizeChatRoom(chatRoom.$id)}
                  className="p-2 hover:bg-orange-600 rounded-full transition-colors"
                >
                  {isMinimized ? '⬆️' : '⬇️'}
                </button>

                {/* Close */}
                <button
                  onClick={() => closeChatRoom(chatRoom.$id)}
                  className="p-2 hover:bg-orange-600 rounded-full transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Only show content for selected & non-minimized chat */}
            {isSelected && !isMinimized && (
              <div className="flex flex-col h-[calc(100%-80px)]">
                
                {/* BOOKING FORM for booking-in-progress status */}
                {chatRoom.status === 'booking-in-progress' && (
                  <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                    {/* Booking Details Banner */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-4">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-orange-600">📋</span>
                        Booking Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Therapist:</span>
                          <span className="font-medium text-gray-900">{chatRoom.providerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium text-gray-900">{chatRoom.duration} minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-bold text-orange-600">
                            IDR {Math.round((chatRoom.pricing[String(chatRoom.duration)] || 0) / 1000)}K
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4 flex-1">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bookingFormData.customerName}
                          onChange={(e) => setBookingFormData(prev => ({ ...prev, customerName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                            +62
                          </span>
                          <input
                            type="tel"
                            value={bookingFormData.customerWhatsApp}
                            onChange={(e) => setBookingFormData(prev => ({ ...prev, customerWhatsApp: e.target.value.replace(/\D/g, '') }))}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="812345678"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Enter without +62 prefix</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Location <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={bookingFormData.location}
                          onChange={(e) => setBookingFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter your address (Hotel name, Villa, Street address, etc.)"
                          rows={3}
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Therapist will travel to your location</p>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                      onClick={() => handleConfirmBooking(chatRoom.$id)}
                      disabled={!bookingFormData.customerName || !bookingFormData.customerWhatsApp || !bookingFormData.location}
                      className="w-full mt-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                    >
                      Confirm Booking
                    </button>
                  </div>
                )}

                {/* REGULAR CHAT for other statuses */}
                {chatRoom.status !== 'booking-in-progress' && (
                  <>
                    {/* Booking Banner */}
                    <div className="bg-orange-50 border-b border-orange-200 p-4">
                      <div className="space-y-3">
                        {/* Time & Date */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-600">🕐</span>
                          <span className="font-medium text-gray-900">Booking Time:</span>
                          <span className="text-gray-600">{chatRoom.serviceTime} • {chatRoom.serviceDate}</span>
                        </div>

                        {/* Provider */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-600">👤</span>
                          <span className="font-medium text-gray-900">Provider:</span>
                          <span className="text-gray-600">{chatRoom.providerName}</span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-600">⏱️</span>
                          <span className="font-medium text-gray-900">Duration:</span>
                          <span className="text-gray-600">{chatRoom.serviceDuration} min • {chatRoom.serviceType}</span>
                        </div>

                        {/* Travel Time */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-600">🚗</span>
                          <span className="font-medium text-gray-900">Arrival Time:</span>
                          <span className="text-gray-600">30-60 minutes to your location</span>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-orange-600">💳</span>
                          <span className="font-medium text-gray-900">Payment:</span>
                          <span className="text-gray-600">Cash / Bank Transfer</span>
                        </div>
                      </div>
                    </div>

                    {/* Loading state */}
                    {isLoading && (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
                          <p className="text-gray-500 text-sm">Loading messages...</p>
                        </div>
                      </div>
                    )}

                    {/* Messages Error */}
                    {messagesError && (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                          <div className="text-red-500 text-4xl mb-2">⚠️</div>
                          <p className="text-red-600 font-medium">Error Loading Messages</p>
                          <p className="text-gray-500 text-sm mt-1">{messagesError}</p>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    {!isLoading && !messagesError && (
                      <ChatMessages
                        messages={messages}
                        loading={messagesLoading}
                        currentUserId={currentChatRoom?.customerId || ''}
                        userRole="customer" // TODO: Get from auth context
                      />
                    )}

                    {/* Input */}
                    {!isLoading && !messagesError && (
                      <ChatInput
                        onSend={sendMessage}
                        sending={sending}
                        placeholder={`Message ${chatRoom.providerName}...`}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

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
