// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, CheckCircle, Crown, Lock, Clock } from 'lucide-react';
import { messagingService } from '../../lib/appwriteService';
import { showErrorToast } from '../lib/toastUtils';

interface Message {
  $id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string; // Avatar URL or emoji
  senderType: 'therapist' | 'admin' | 'user';
  message: string;
  timestamp: string;
  read: boolean;
}

interface TherapistChatProps {
  therapist: any;
  onBack: () => void;
}

const TherapistChat: React.FC<TherapistChatProps> = ({ therapist, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPremium = therapist?.membershipTier === 'premium';

  useEffect(() => {
    fetchMessages();
    // Set up real-time subscription
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [therapist]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      console.log('[THERAPIST CHAT] Fetching messages...');
      console.log('[THERAPIST CHAT] Therapist:', therapist?.name, therapist?.$id);
      
      // Generate conversation ID for therapist-admin chat
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );
      
      console.log('[THERAPIST CHAT] Conversation ID:', conversationId);
      
      // Fetch conversation messages from Appwrite
      const data = await messagingService.getConversation(conversationId);
      
      console.log('[THERAPIST CHAT] Fetched messages count:', data.length);
      
      // Map Appwrite format to UI format
      const mappedMessages: Message[] = data.map((msg: any) => ({
        $id: msg.$id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar || msg.receiverAvatar, // Get avatar from message
        senderType: msg.senderType === 'therapist' ? 'therapist' : (msg.senderType === 'user' ? 'user' : 'admin'),
        message: msg.content,
        timestamp: msg.createdAt,
        read: msg.isRead
      }));
      
      setMessages(mappedMessages);
    } catch (error: any) {
      console.error('[THERAPIST CHAT] Failed to fetch messages:', error);
      console.error('[THERAPIST CHAT] Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      console.log('[THERAPIST CHAT] Sending message to admin...');
      console.log('[THERAPIST CHAT] Therapist ID:', therapist.$id || therapist.id);
      console.log('[THERAPIST CHAT] Message content:', newMessage.trim());
      
      // Generate conversation ID for therapist-admin chat
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );
      
      console.log('[THERAPIST CHAT] Conversation ID:', conversationId);
      
      // Send message to Appwrite (also creates notification for admin)
      const result = await messagingService.sendMessage({
        conversationId,
        senderId: String(therapist.$id || therapist.id),
        senderName: therapist.name || 'Therapist',
        senderType: 'therapist', // Required: specify sender type for therapist
        recipientId: 'admin',
        recipientName: 'Admin',
        recipientType: 'admin',
        content: newMessage.trim(),
        type: 'text',
      });
      
      console.log('[THERAPIST CHAT] Message sent successfully:', result);
      
      setNewMessage('');
      // Refresh messages to show the new one
      await fetchMessages();
    } catch (error: any) {
      console.error('[THERAPIST CHAT] Failed to send message:', error);
      console.error('[THERAPIST CHAT] Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        response: error?.response
      });
      
      // Show more specific error message
      const errorMessage = error?.message || 'Failed to send message. Please try again.';
      showErrorToast(`Error: ${errorMessage}\n\nPlease check the console for details.`);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const dict = {
    therapistDashboard: {
      thisMonth: 'this month'
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Standardized Status Header */}
      <div className="max-w-sm mx-auto px-4 pt-6 pb-4 w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Chat</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
              <span className="text-xs text-gray-500">bulan ini</span>
            </div>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => console.log('Status change: available')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'bg-green-50 border-green-500'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'available' && therapist?.availability === 'online'
                  ? 'text-green-700'
                  : 'text-gray-600'
              }`}>Tersedia</p>
            </button>

            <button
              onClick={() => console.log('Status change: busy')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.status === 'busy'
                  ? 'bg-amber-50 border-amber-500'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <Clock className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.status === 'busy'
                  ? 'text-amber-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.status === 'busy'
                  ? 'text-amber-700'
                  : 'text-gray-600'
              }`}>Sibuk</p>
            </button>

            <button
              onClick={() => console.log('Status change: offline')}
              className={`p-4 rounded-xl border-2 transition-all ${
                therapist?.availability === 'offline'
                  ? 'bg-red-50 border-red-500'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <XCircle className={`w-6 h-6 mx-auto mb-2 ${
                therapist?.availability === 'offline'
                  ? 'text-red-600'
                  : 'text-gray-400'
              }`} />
              <p className={`text-sm font-semibold ${
                therapist?.availability === 'offline'
                  ? 'text-red-700'
                  : 'text-gray-600'
              }`}>Offline</p>
            </button>
          </div>
        </div>
      </div>
      
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-orange-600 rounded-lg transition-colors text-white"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Customer Support</h1>
              <p className="text-xs text-orange-100">
                {isPremium ? 'Premium Support - Response within 2 hours' : 'Available for all therapists'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-sm mx-auto w-full p-4">
        {/* Chat Interface for All Therapists */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <p className="text-orange-700 font-semibold">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                <p className="text-orange-700 font-semibold">No messages yet</p>
                <p className="text-sm text-orange-600 mt-2">
                  Start a conversation with our support team
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.$id}
                    className={`flex gap-2 ${msg.senderType === 'therapist' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar on left for customer/admin, right for therapist */}
                    {msg.senderType !== 'therapist' && (
                      <div className="flex-shrink-0">
                        {msg.senderAvatar && msg.senderAvatar.startsWith('http') ? (
                          <img 
                            src={msg.senderAvatar} 
                            alt={msg.senderName}
                            className="w-8 h-8 rounded-full object-cover border-2 border-orange-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-300">
                            <span className="text-lg">{msg.senderAvatar || '👤'}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="max-w-[70%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">
                          {msg.senderName}
                        </span>
                        <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                      </div>
                      <div
                        className={`p-4 rounded-2xl ${
                          msg.senderType === 'therapist'
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                    
                    {/* Avatar on right for therapist */}
                    {msg.senderType === 'therapist' && (
                      <div className="flex-shrink-0">
                        {therapist?.mainImage ? (
                          <img 
                            src={therapist.mainImage} 
                            alt={therapist.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-orange-300"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center border-2 border-orange-300">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-orange-200 p-4 bg-white">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-orange-300 rounded-lg focus:border-orange-500 focus:outline-none"
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                <span className="font-semibold">Send</span>
              </button>
            </div>
            <p className="text-xs text-orange-600 mt-2">
              💬 Our support team typically responds within 2 hours during business hours
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistChat;
