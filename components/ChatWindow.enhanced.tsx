import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Client, Databases, ID, Query } from 'appwrite'
import { APPWRITE_CONFIG } from '../lib/appwrite.config'

interface ChatWindowProps {
  providerId: string
  providerName: string
  providerPhoto?: string
  providerStatus?: 'available' | 'busy' | 'offline'
  providerRating?: number
  providerLocation?: string 
  pricing: { '60': number; '90': number; '120': number }
  selectedService?: { duration: string }
  customerName?: string
  customerWhatsApp?: string
  bookingId?: string
  chatRoomId?: string
  isOpen: boolean
  onClose: () => void
  bookingDate?: string
  bookingTime?: string
  serviceDuration?: string
  serviceType?: string
}

interface ChatMessage {
  $id: string
  content: string
  senderType: 'customer' | 'therapist' | 'admin' | 'system'
  senderName: string
  timestamp: string
  chatRoomId: string
  read?: boolean
}

interface BookingDetails {
  therapistName: string
  bookingDate: string
  bookingTime: string
  serviceDuration: string
  serviceType: string
  totalPrice: number
}

/**
 * 🚀 ENHANCED ChatWindow Component - Production Ready
 * 
 * Features:
 * ✅ Orange header with therapist profile image
 * ✅ Live real-time messaging (USER ↔ THERAPIST)
 * ✅ Countdown timer with connection status
 * ✅ Booking details banner
 * ✅ Welcome banner with therapist name
 * ✅ Mobile & Desktop responsive
 * ✅ Notification system
 * ✅ Full Appwrite integration
 * ✅ Console debugging for testing
 */
function EnhancedChatWindow({
  providerId,
  providerName,
  providerPhoto,
  providerStatus = 'available',
  providerRating = 4.5,
  providerLocation,
  pricing,
  selectedService,
  customerName: initialCustomerName = '',
  customerWhatsApp: initialCustomerWhatsApp = '',
  bookingId,
  chatRoomId,
  isOpen,
  onClose,
  bookingDate,
  bookingTime,
  serviceDuration = '60',
  serviceType = 'Home Massage'
}: ChatWindowProps) {
  
  console.log('🚀 ENHANCED CHATWINDOW INITIALIZED');
  console.log('📊 Props:', {
    providerId,
    providerName,
    chatRoomId,
    bookingId,
    bookingDate,
    bookingTime,
    serviceDuration,
    serviceType
  });

  // Appwrite client initialization
  const [client] = useState(() => {
    const appwriteClient = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
    return appwriteClient;
  });

  const [databases] = useState(() => new Databases(client));
  
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [customerName, setCustomerName] = useState(initialCustomerName)
  const [customerWhatsApp, setCustomerWhatsApp] = useState(initialCustomerWhatsApp)
  const [isRegistered, setIsRegistered] = useState(!!initialCustomerName && !!initialCustomerWhatsApp)
  
  // Enhanced features state
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'waiting'>('connecting')
  const [countdownSeconds, setCountdownSeconds] = useState(300) // 5 minutes
  const [unreadCount, setUnreadCount] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [notifications, setNotifications] = useState<string[]>([])
  
  // UI state
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const realtimeRef = useRef<any>(null)

  // Booking details for banner
  const bookingDetails: BookingDetails = {
    therapistName: providerName,
    bookingDate: bookingDate || new Date().toLocaleDateString(),
    bookingTime: bookingTime || new Date().toLocaleTimeString(),
    serviceDuration: serviceDuration,
    serviceType: serviceType,
    totalPrice: pricing[serviceDuration as keyof typeof pricing] || pricing['60']
  };

  // 🕐 COUNTDOWN TIMER LOGIC
  useEffect(() => {
    if (!isOpen) return;

    console.log('⏰ Starting countdown timer');
    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          console.log('⏰ Countdown expired');
          setConnectionStatus('waiting');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      console.log('⏰ Clearing countdown timer');
      clearInterval(timer);
    };
  }, [isOpen]);

  // Format countdown display
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 🔄 REAL-TIME MESSAGING SETUP
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;

    console.log('📡 Setting up real-time messaging for chatRoomId:', chatRoomId);
    
    const setupRealtime = async () => {
      try {
        // Subscribe to real-time updates
        const unsubscribe = client.subscribe(`databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.chatMessages}.documents`, (response) => {
          console.log('📨 REALTIME MESSAGE RECEIVED:', response);
          
          if (response.events.includes('databases.*.collections.*.documents.*.create')) {
            const newMessage = response.payload as ChatMessage;
            
            // Only add messages for this chat room
            if (newMessage.chatRoomId === chatRoomId) {
              console.log('✅ Adding new message to chat:', newMessage);
              setMessages(prev => {
                // Avoid duplicates
                if (prev.find(msg => msg.$id === newMessage.$id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });
              
              // Show notification for messages from others
              if (newMessage.senderType !== 'customer') {
                setUnreadCount(prev => prev + 1);
                addNotification(`New message from ${newMessage.senderName}`);
              }
              
              setConnectionStatus('connected');
            }
          }
        });

        realtimeRef.current = unsubscribe;
        console.log('✅ Real-time subscription active');
        
      } catch (error) {
        console.error('❌ Failed to setup real-time messaging:', error);
        setError('Failed to connect to live chat');
      }
    };

    setupRealtime();

    return () => {
      if (realtimeRef.current) {
        console.log('🔌 Cleaning up real-time subscription');
        realtimeRef.current();
      }
    };
  }, [isOpen, chatRoomId, client]);

  // 📥 LOAD EXISTING MESSAGES
  useEffect(() => {
    if (!isOpen || !chatRoomId) return;

    const loadMessages = async () => {
      try {
        console.log('📥 Loading existing messages for chatRoomId:', chatRoomId);
        
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.chatMessages,
          [
            Query.equal('chatRoomId', chatRoomId),
            Query.orderAsc('timestamp'),
            Query.limit(100)
          ]
        );

        console.log('📥 Loaded messages:', response.documents);
        setMessages(response.documents as ChatMessage[]);
        
        // Send welcome message if no messages exist
        if (response.documents.length === 0) {
          await sendWelcomeMessage();
        }
        
      } catch (error) {
        console.error('❌ Failed to load messages:', error);
        setError('Failed to load chat history');
      }
    };

    loadMessages();
  }, [isOpen, chatRoomId]);

  // 📤 SEND WELCOME MESSAGE
  const sendWelcomeMessage = async () => {
    try {
      console.log('💬 Sending welcome message');
      
      const welcomeMessage = {
        content: `Welcome to your chat with ${providerName}! Your booking has been confirmed and I'll be with you shortly. 🌟`,
        senderType: 'system',
        senderName: 'IndaStreet System',
        timestamp: new Date().toISOString(),
        chatRoomId: chatRoomId,
        read: false
      };

      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        ID.unique(),
        welcomeMessage
      );

      console.log('✅ Welcome message sent');
      
    } catch (error) {
      console.error('❌ Failed to send welcome message:', error);
    }
  };

  // 📤 SEND MESSAGE FUNCTION
  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || loading) return;

    try {
      setLoading(true);
      console.log('📤 Sending message:', newMessage);

      const messageData = {
        content: newMessage.trim(),
        senderType: 'customer',
        senderName: customerName || 'Customer',
        timestamp: new Date().toISOString(),
        chatRoomId: chatRoomId,
        read: false
      };

      // Add message to local state immediately for responsiveness
      const localMessage: ChatMessage = {
        $id: `temp_${Date.now()}`,
        ...messageData,
        senderType: messageData.senderType as "therapist" | "customer" | "admin" | "system"
      };
      setMessages(prev => [...prev, localMessage]);
      setNewMessage('');

      // Send to Appwrite
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.chatMessages,
        ID.unique(),
        messageData
      );

      console.log('✅ Message sent successfully');
      setConnectionStatus('connected');
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove local message on error
      setMessages(prev => prev.filter(msg => !msg.$id.startsWith('temp_')));
    } finally {
      setLoading(false);
    }
  }, [newMessage, customerName, chatRoomId, loading]);

  // 🔔 NOTIFICATION SYSTEM
  const addNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  // ⌨️ KEYBOARD HANDLER
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 📝 CUSTOMER REGISTRATION
  const handleRegister = () => {
    if (customerName.trim() && customerWhatsApp.trim()) {
      setIsRegistered(true);
      addNotification(`Welcome ${customerName}! You're now registered.`);
    }
  };

  // 📍 AUTO-SCROLL TO BOTTOM
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔍 FOCUS MANAGEMENT
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
      
      {/* 🔔 NOTIFICATIONS */}
      {notifications.map((notification, index) => (
        <div key={index} className="absolute top-4 left-4 right-4 bg-orange-100 border border-orange-300 rounded-lg p-2 z-10">
          <p className="text-orange-800 text-sm">{notification}</p>
        </div>
      ))}

      {/* 🧡 ENHANCED HEADER - ORANGE COLOR */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {providerPhoto ? (
                <img 
                  src={providerPhoto} 
                  alt={providerName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30" 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
                  <span className="text-xl font-bold">{providerName.charAt(0)}</span>
                </div>
              )}
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{providerName}</h3>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <span>⭐ {providerRating}</span>
                {providerLocation && <span>📍 {providerLocation}</span>}
              </div>
              <div className="text-xs text-white/80 mt-1">
                {connectionStatus === 'connected' && '🟢 Connected'}
                {connectionStatus === 'connecting' && '🟡 Connecting...'}
                {connectionStatus === 'waiting' && '🔴 Waiting for connection'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded"
              title={isMinimized ? 'Expand chat' : 'Minimize chat'}
            >
              {isMinimized ? '↗️' : '↙️'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded"
              title="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 📊 BOOKING DETAILS BANNER */}
        <div className="mt-3 bg-white/10 rounded-lg p-3">
          <div className="text-sm text-white/90">
            <div className="font-medium mb-1">📅 Booking Details</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Date: {bookingDetails.bookingDate}</div>
              <div>Time: {bookingDetails.bookingTime}</div>
              <div>Service: {bookingDetails.serviceType}</div>
              <div>Duration: {bookingDetails.serviceDuration} min</div>
            </div>
            <div className="mt-2 text-white font-medium">
              Total: Rp {bookingDetails.totalPrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ⏰ COUNTDOWN TIMER */}
        <div className="mt-2 text-center">
          <div className="text-sm text-white/80">
            {connectionStatus === 'waiting' 
              ? '⏳ Waiting for therapist connection...'
              : `⏰ Response timeout: ${formatCountdown(countdownSeconds)}`
            }
          </div>
        </div>
      </div>

      {/* 💬 CHAT BODY */}
      {!isMinimized && (
        <div className="flex flex-col h-96">
          
          {/* 🎊 WELCOME BANNER */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b p-3">
            <p className="text-orange-800 text-sm text-center font-medium">
              🌟 Welcome to your chat with {providerName}! 🌟
            </p>
          </div>

          {/* 📝 REGISTRATION FORM */}
          {!isRegistered && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="text-sm text-gray-600 mb-3">Please provide your details to continue:</div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={customerWhatsApp}
                  onChange={(e) => setCustomerWhatsApp(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                />
                <button
                  onClick={handleRegister}
                  className="w-full bg-orange-500 text-white p-2 rounded-lg text-sm hover:bg-orange-600 transition-colors"
                >
                  Continue Chat
                </button>
              </div>
            </div>
          )}

          {/* 💬 MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.$id}
                className={`flex ${message.senderType === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderType === 'customer'
                      ? 'bg-orange-500 text-white'
                      : message.senderType === 'system'
                      ? 'bg-gray-100 text-gray-800 border'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {message.senderType !== 'customer' && (
                    <div className="text-xs font-medium mb-1 opacity-75">
                      {message.senderName}
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs opacity-75 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* ⌨️ TYPING INDICATOR */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="text-sm text-gray-500">
                    {providerName} is typing...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* ⚠️ ERROR DISPLAY */}
          {error && (
            <div className="bg-red-50 border-t border-red-200 p-3">
              <p className="text-red-600 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ⌨️ MESSAGE INPUT */}
          {isRegistered && (
            <div className="border-t p-4">
              <div className="flex gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  rows={2}
                  disabled={loading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !newMessage.trim()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? '⏳' : '📤'}
                </button>
              </div>
              
              {/* 🎯 QUICK ACTIONS */}
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setNewMessage("What time will you arrive?")}
                  className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100"
                >
                  🕐 Arrival time?
                </button>
                <button
                  onClick={() => setNewMessage("Can we reschedule?")}
                  className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100"
                >
                  📅 Reschedule?
                </button>
                <button
                  onClick={() => setNewMessage("Please call me when you arrive.")}
                  className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded hover:bg-orange-100"
                >
                  📞 Call on arrival
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedChatWindow;