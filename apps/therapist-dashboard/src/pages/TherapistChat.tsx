// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, CheckCircle, Crown, Lock } from 'lucide-react';
import { messagingService } from '../../../../lib/appwriteService';

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
    if (isPremium) {
      fetchMessages();
      // Set up real-time subscription
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [therapist, isPremium]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!isPremium) return;
    
    setLoading(true);
    try {
      // Generate conversation ID for therapist-admin chat
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );
      
      // Fetch conversation messages from Appwrite
      const data = await messagingService.getConversation(conversationId);
      
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
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isPremium) return;
    
    setSending(true);
    try {
      // Generate conversation ID for therapist-admin chat
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );
      
      // Send message to Appwrite (also creates notification for admin)
      await messagingService.sendMessage({
        conversationId,
        senderId: String(therapist.$id || therapist.id),
        senderType: 'therapist',
        senderName: therapist.name || 'Therapist',
        receiverId: 'admin',
        receiverType: 'user', // Use 'user' type for admin
        receiverName: 'Support Team',
        content: newMessage.trim(),
      });
      
      setNewMessage('');
      // Refresh messages to show the new one
      await fetchMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Customer Support</h1>
              <p className="text-xs text-gray-500">
                {isPremium ? 'Premium Support - Response within 2 hours' : 'Upgrade to Premium for support access'}
              </p>
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">PREMIUM</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-sm mx-auto w-full p-4">
        {!isPremium ? (
          /* Upgrade Prompt for Non-Premium */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Feature</h2>
              <p className="text-gray-600">
                Customer support chat is available exclusively for Premium members
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Upgrade to Premium</h3>
                  <p className="text-sm text-gray-600">Rp 250.000/MONTH</p>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>24/7 Customer Support Chat</strong>
                    <p className="text-gray-600">Direct chat with support team, 2-hour response time</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Best Times Analytics</strong>
                    <p className="text-gray-600">Know exactly when to be available for maximum bookings</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Verified Badge</strong>
                    <p className="text-gray-600">Blue checkmark on your profile for trust and credibility</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Discount Badges</strong>
                    <p className="text-gray-600">Set 5%, 10%, 15%, or 20% discount badges to attract customers</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Priority Search Placement</strong>
                    <p className="text-gray-600">Appear at the top of search results for more visibility</p>
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Technical Support</strong>
                    <p className="text-gray-600">Help with profile optimization, photos, translations</p>
                  </div>
                </li>
              </ul>

              <button 
                onClick={() => window.location.href = '/membership'}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                View Membership Plans
              </button>
            </div>

            <div className="text-center text-sm text-gray-500">
              Questions about Premium? Email us at <a href="mailto:indastreet.id@gmail.com" className="text-orange-600 font-semibold">indastreet.id@gmail.com</a>
            </div>
          </div>
        ) : (
          /* Chat Interface for Premium Members */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[600px]">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">No messages yet</p>
                  <p className="text-sm text-gray-500 mt-2">
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
                              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center border-2 border-orange-200">
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
            <div className="border-t p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
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
              <p className="text-xs text-gray-500 mt-2">
                💬 Our support team typically responds within 2 hours during business hours
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistChat;
