/**
 * 🔒 LOCAL-FIRST CHAT WINDOW EXAMPLE
 * 
 * Example implementation of chat window using localStorage-first architecture
 * 
 * @author Expert Full-Stack Developer
 * @date 2026-01-28
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  addChatMessage, 
  getChatMessages, 
  initializeChatSession,
  endChatSession,
  updateBookingDraft,
  getBookingDraft,
  confirmBooking,
  isBookingReadyToConfirm,
  getBookingButtonState,
  getSyncStatusUI
} from '../../utils/localFirstHelpers';
import { useAutoSave } from '../../hooks/useAutoSave';
import { ChatMessage } from '../../services/localStorage/chatLocalStorage';
import { BookingDraft } from '../../services/localStorage/bookingLocalStorage';

interface ChatWindowProps {
  therapistId: string;
  therapistName: string;
  therapistImage?: string;
  customerId: string;
  customerName: string;
  onClose: () => void;
}

export function LocalFirstChatWindow({
  therapistId,
  therapistName,
  therapistImage,
  customerId,
  customerName,
  onClose
}: ChatWindowProps) {
  // ============================================================================
  // STATE MANAGEMENT (from localStorage)
  // ============================================================================
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatRoomId = `chat_${customerId}_${therapistId}`;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // AUTO-SAVE SETUP (30-60 seconds)
  // ============================================================================
  
  const { triggerSync, getSyncStatus } = useAutoSave({
    enabled: true,
    interval: 45, // Auto-save every 45 seconds
    syncOnUnmount: true,
    syncOnWindowClose: true,
    onSyncSuccess: () => {
      console.log('✅ Auto-save successful');
    },
    onSyncError: (error) => {
      console.error('❌ Auto-save failed:', error);
    }
  });

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  
  useEffect(() => {
    console.log('🚀 [ChatWindow] Initializing local-first chat');
    
    // Initialize chat session
    initializeChatSession({
      chatRoomId,
      therapistId,
      therapistName,
      customerId,
      customerName
    });

    // Load messages from localStorage
    loadMessages();

    // Load booking draft from localStorage
    loadBookingDraft();

    // Cleanup on unmount
    return () => {
      console.log('👋 [ChatWindow] Cleaning up');
      endChatSession();
    };
  }, []);

  // ============================================================================
  // LOAD FROM LOCALSTORAGE
  // ============================================================================

  const loadMessages = () => {
    console.log('📥 [ChatWindow] Loading messages from localStorage');
    const storedMessages = getChatMessages(chatRoomId);
    setMessages(storedMessages);
    
    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const loadBookingDraft = () => {
    console.log('📥 [ChatWindow] Loading booking draft from localStorage');
    const draft = getBookingDraft();
    setBookingDraft(draft);
  };

  // ============================================================================
  // MESSAGE OPERATIONS (localStorage only, no backend calls)
  // ============================================================================

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    try {
      // Add message to localStorage (instant)
      await addChatMessage({
        chatRoomId,
        senderId: customerId,
        senderType: 'user',
        senderName: customerName,
        message: newMessage.trim()
      });

      // Update UI immediately from localStorage
      loadMessages();
      setNewMessage('');

      console.log('✅ [ChatWindow] Message added to localStorage');
      
      // NO BACKEND CALL HERE
      // Sync will happen automatically via auto-save

    } catch (error) {
      console.error('❌ [ChatWindow] Failed to add message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // BOOKING OPERATIONS (localStorage only until confirmation)
  // ============================================================================

  const handleUpdateDuration = (duration: number) => {
    console.log('⏱️ [ChatWindow] Updating duration:', duration);

    // Update localStorage only (no backend call)
    const updated = updateBookingDraft({
      chatRoomId,
      therapistId,
      therapistName,
      customerId,
      customerName,
      duration,
      serviceType: `${duration} minute massage`,
      bookingType: 'immediate',
      providerType: 'therapist',
      totalPrice: duration === 60 ? 450000 : duration === 90 ? 650000 : 850000,
      locationZone: 'Jakarta' // You can detect this from user location
    });

    // Update UI immediately from localStorage
    setBookingDraft(updated);

    console.log('✅ [ChatWindow] Duration updated in localStorage');
    // NO BACKEND CALL
  };

  const handleUpdateCustomerInfo = (field: 'customerName' | 'customerPhone', value: string) => {
    console.log(`📝 [ChatWindow] Updating ${field}:`, value);

    // Update localStorage only
    const updated = updateBookingDraft({
      [field]: value
    });

    setBookingDraft(updated);
    
    // NO BACKEND CALL
  };

  const handleConfirmBooking = async () => {
    console.log('✅ [ChatWindow] Confirming booking...');
    setIsLoading(true);

    try {
      // THIS is the ONLY backend call - on confirmation
      const result = await confirmBooking();

      if (result.success) {
        console.log('✅ [ChatWindow] Booking confirmed:', result.bookingId);
        
        // Show success message
        await addChatMessage({
          chatRoomId,
          senderId: 'system',
          senderType: 'system',
          senderName: 'System',
          message: `🎉 Booking confirmed! ID: ${result.bookingId}`,
          messageType: 'system'
        });

        // Reload messages
        loadMessages();
        
        // Clear booking draft
        setBookingDraft(null);

      } else {
        console.error('❌ [ChatWindow] Booking confirmation failed:', result.error);
        alert(`Booking failed: ${result.error}`);
      }

    } catch (error: any) {
      console.error('❌ [ChatWindow] Confirmation error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // UI STATE
  // ============================================================================

  const bookingButtonState = getBookingButtonState();
  const syncStatus = getSyncStatusUI();

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            {therapistImage && (
              <img 
                src={therapistImage} 
                alt={therapistName}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
            )}
            <div>
              <h3 className="font-bold">{therapistName}</h3>
              <p className="text-xs text-orange-100">
                {syncStatus.isSyncing ? 'Syncing...' : 
                 syncStatus.needsSync ? `${syncStatus.unsyncedCount} unsynced` : 
                 'All synced ✅'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex ${msg.senderId === customerId ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] p-3 rounded-2xl ${
                  msg.senderId === customerId
                    ? 'bg-orange-500 text-white rounded-br-none'
                    : msg.senderType === 'system'
                    ? 'bg-blue-100 text-blue-800 rounded-bl-none'
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                  {!msg.synced && ' • Pending'}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Booking Form (localStorage only) */}
        {!bookingDraft?.status || bookingDraft.status === 'draft' ? (
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <h4 className="font-bold text-gray-800">Quick Booking</h4>
            
            {/* Duration Selection */}
            <div className="flex gap-2">
              {[60, 90, 120].map(duration => (
                <button
                  key={duration}
                  onClick={() => handleUpdateDuration(duration)}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition ${
                    bookingDraft?.duration === duration
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300'
                  }`}
                >
                  {duration} min
                </button>
              ))}
            </div>

            {/* Customer Info */}
            {bookingDraft?.duration && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={bookingDraft?.customerName || ''}
                  onChange={(e) => handleUpdateCustomerInfo('customerName', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp Number"
                  value={bookingDraft?.customerPhone || ''}
                  onChange={(e) => handleUpdateCustomerInfo('customerPhone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={!bookingButtonState.enabled || isLoading}
              className={`w-full py-3 rounded-lg font-bold transition ${
                bookingButtonState.enabled
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? '⏳ Processing...' : bookingButtonState.label}
            </button>

            {/* Validation Errors */}
            {bookingDraft && !bookingDraft.isValid && (
              <div className="text-xs text-red-600 space-y-1">
                {bookingDraft.validationErrors.map((error, i) => (
                  <p key={i}>• {error}</p>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Message Input */}
        <div className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
              className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
