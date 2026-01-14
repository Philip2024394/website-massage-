// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { messagingService } from '../../../../lib/appwriteService';
import { showToast } from '../../../../utils/showToastPortal';
import type { Place } from '../../../../types.ts';

interface FacialPlaceChatProps {
  place: Place | null;
  onBack: () => void;
}

interface Message {
  $id: string;
  conversationId: string;
  senderId: string;
  senderType: 'facial-place' | 'admin' | 'customer';
  senderName: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const FacialPlaceChat: React.FC<FacialPlaceChatProps> = ({ place, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate conversation ID (facial-place-{placeId}-admin)
  const conversationId = place ? `facial-place-${place.$id || place.id}-admin` : '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!place || !conversationId) return;

    try {
      console.log('📥 Fetching messages for facial place:', place.$id || place.id);
      
      const fetchedMessages = await messagingService.getConversation(conversationId);
      
      setMessages(fetchedMessages.map((msg: any) => ({
        $id: msg.$id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        senderType: msg.senderType,
        senderName: msg.senderName,
        message: msg.message,
        timestamp: msg.timestamp || msg.$createdAt,
        read: msg.read || false
      })));
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (place && conversationId) {
      fetchMessages();
      
      // Poll for new messages every 5 seconds
      pollingIntervalRef.current = setInterval(fetchMessages, 5000);
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [place, conversationId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !place || !conversationId) return;

    setSending(true);
    try {
      await messagingService.sendMessage({
        conversationId,
        senderId: String(place.$id || place.id),
        senderName: place.name || 'Facial Place',
        recipientId: 'admin',
        recipientName: 'Admin',
        recipientType: 'admin',
        content: newMessage.trim(),
        type: 'text',
      });

      console.log('✅ Message sent successfully');
      setNewMessage('');
      await fetchMessages(); // Refresh messages immediately
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      showToast('❌ Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Place data not found</p>
        </div>
      </div>
    );
  }

  // Check if premium (chat is premium feature)
  const isPremium = (place as any).membershipTier === 'premium';

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">💬 Customer Support Chat</h1>
                  <p className="text-sm text-gray-600">Chat with admin support</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Premium Required Banner */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg p-12 text-center text-white">
            <div className="bg-white/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Premium Feature</h2>
            <p className="text-lg mb-6 opacity-90">
              Customer support chat is available for Premium members only
            </p>
            <div className="bg-white/10 rounded-xl p-6 mb-6 text-left max-w-md mx-auto">
              <h3 className="font-bold text-xl mb-3">With Premium Chat you get:</h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Direct support from admin team</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Fast response times</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Booking assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-2xl">✅</span>
                  <span>Technical support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Upgrade to Premium
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">💬 Customer Support Chat</h1>
                <p className="text-sm text-gray-600">Chat with admin support team</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-700">Premium</span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-hidden flex flex-col">
        <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <p className="text-gray-600 text-sm">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg font-semibold mb-2">No messages yet</p>
                  <p className="text-gray-500 text-sm">Start a conversation with the admin team</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwnMessage = msg.senderType === 'facial-place';
                  return (
                    <div
                      key={msg.$id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {!isOwnMessage && (
                          <p className="text-xs text-gray-600 mb-1 ml-3">{msg.senderName}</p>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right mr-3' : 'ml-3'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-end gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="flex-1 resize-none border-2 border-gray-300 rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none transition-colors text-sm min-h-[44px] max-h-32"
                rows={1}
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center gap-2"
              >
                {sending ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Admin typically responds within a few hours
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacialPlaceChat;
