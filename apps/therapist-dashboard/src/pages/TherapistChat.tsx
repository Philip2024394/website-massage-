// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, CheckCircle, Crown, Lock, Menu, X, CreditCard, Headphones, Gift, Star, Flag, AlertTriangle } from 'lucide-react';
import { messagingService } from '../../../../lib/appwriteService';
import DiscountBannerSelector from '../../../../components/DiscountBannerSelector';
import { createDiscountCode } from '../../../../lib/appwrite/services/discountCodes.service';
import { flagMessage } from '../../../../lib/appwrite/services/flaggedMessages.service';

interface Message {
  $id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string; // Avatar URL or emoji
  senderType: 'therapist' | 'admin' | 'user' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  isReview?: boolean; // New field for review messages
  reviewRating?: number; // Star rating for reviews
  discountBanner?: string; // URL for discount banner
  discountCode?: string; // Discount code
  isThankYouReminder?: boolean; // System reminder to send discount
  reminderData?: {
    customerId: string;
    customerName: string;
    bookingId: string;
  };
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
  const [showMenu, setShowMenu] = useState(false);
  const [showDiscountSelector, setShowDiscountSelector] = useState(false);
  const [showBannerPreview, setShowBannerPreview] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<{percentage: number, url: string, name: string} | null>(null);
  const [phoneNumberWarning, setPhoneNumberWarning] = useState(false);
  const [chatLanguage, setChatLanguage] = useState<'id' | 'en'>('id');
  const [translatedMessages, setTranslatedMessages] = useState<{[key: string]: string}>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Phone number detection patterns
  const detectPhoneNumber = (text: string): boolean => {
    // Indonesian phone patterns: +62, 08, 628, WhatsApp, wa.me, phone, tel
    const patterns = [
      /\+?62\s?\d{3,}/gi,           // +62 followed by digits
      /\b0?8\d{9,}/g,                // 08xxxxxxxxx Indonesian mobile
      /\b628\d{9,}/g,                // 628xxxxxxxxx
      /(whatsapp|wa\.me|phone|tel|mobile|contact|hp)/gi,  // Keywords
      /\d{3}[-\s]?\d{3}[-\s]?\d{4}/g,  // xxx-xxx-xxxx format
      /\d{10,}/g                     // 10+ consecutive digits
    ];
    return patterns.some(pattern => pattern.test(text));
  };

  // Auto-remove phone numbers from text
  const removePhoneNumbers = (text: string): string => {
    let cleaned = text;
    cleaned = cleaned.replace(/\+?62\s?\d{3,}/gi, '[REMOVED]');
    cleaned = cleaned.replace(/\b0?8\d{9,}/g, '[REMOVED]');
    cleaned = cleaned.replace(/\b628\d{9,}/g, '[REMOVED]');
    cleaned = cleaned.replace(/\d{10,}/g, '[REMOVED]');
    cleaned = cleaned.replace(/\d{3}[-\s]?\d{3}[-\s]?\d{4}/g, '[REMOVED]');
    return cleaned;
  };

  // Auto-translate message
  const translateMessage = async (text: string, messageId: string): Promise<string> => {
    // Check if already translated
    if (translatedMessages[messageId]) {
      return translatedMessages[messageId];
    }

    try {
      // Simple translation using Google Translate API (free tier)
      const targetLang = chatLanguage;
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      const translated = data[0].map((item: any) => item[0]).join('');
      
      // Cache translation
      setTranslatedMessages(prev => ({ ...prev, [messageId]: translated }));
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  };

  // Get message text (translated or original)
  const getMessageText = (msg: Message): string => {
    if (translatedMessages[msg.$id]) {
      return translatedMessages[msg.$id];
    }
    return msg.message;
  };
  const isPremium = therapist?.membershipTier === 'premium';

  // Admin profile image
  const adminAvatar = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258';

  useEffect(() => {
    if (isPremium) {
      fetchMessages();
      // Clear unread count when opening chat
      localStorage.setItem(`chat_unread_${therapist.$id}`, '0');
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

  // Auto-translate messages when language changes
  useEffect(() => {
    const translateAllMessages = async () => {
      for (const msg of messages) {
        if (!translatedMessages[msg.$id] && msg.message) {
          await translateMessage(msg.message, msg.$id);
        }
      }
    };
    
    if (messages.length > 0) {
      translateAllMessages();
    }
  }, [chatLanguage, messages]);

  const fetchMessages = async () => {
    if (!isPremium) return;
    
    // Only show loading on first fetch
    if (messages.length === 0) {
      setLoading(true);
    }
    
    try {
      // Generate conversation ID for therapist-admin chat
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );
      
      // Fetch conversation messages from Appwrite
      const data = await messagingService.getConversation(conversationId);
      
      // If no messages, show welcome message
      if (data.length === 0) {
        const welcomeMessage: Message = {
          $id: 'welcome-msg',
          senderId: 'admin',
          senderName: 'Team Indastreet',
          senderAvatar: adminAvatar,
          senderType: 'admin',
          message: "Welcome to IndastreetMassage - Indonesia's premium choice for professional massage therapy! Our support team is on standby to assist with any questions or concerns you may have. We're here to help you succeed!",
          timestamp: new Date().toISOString(),
          read: false
        };
        setMessages([welcomeMessage]);
      } else {
        // Map Appwrite format to UI format
        const mappedMessages: Message[] = data.map((msg: any) => {
          // Check if message is a system reminder (JSON format)
          let parsedContent = null;
          try {
            parsedContent = JSON.parse(msg.content);
          } catch (e) {
            // Not JSON, regular message
          }

          if (parsedContent && parsedContent.type === 'thankYouReminder') {
            // System reminder message
            return {
              $id: msg.$id,
              senderId: 'system',
              senderName: 'Team Indastreet',
              senderAvatar: adminAvatar,
              senderType: 'system',
              message: parsedContent.message,
              timestamp: msg.createdAt,
              read: msg.isRead,
              isThankYouReminder: true,
              reminderData: {
                customerId: parsedContent.customerId,
                customerName: parsedContent.customerName,
                bookingId: parsedContent.bookingId
              }
            };
          }

          // Regular message
          return {
            $id: msg.$id,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderAvatar: msg.senderAvatar || msg.receiverAvatar,
            senderType: msg.senderType === 'therapist' ? 'therapist' : (msg.senderType === 'user' ? 'user' : 'admin'),
            message: msg.content,
            timestamp: msg.createdAt,
            read: msg.isRead
          };
        });
        
        // Only update if messages actually changed (prevents flashing)
        const messagesChanged = JSON.stringify(messages.map(m => m.$id)) !== JSON.stringify(mappedMessages.map(m => m.$id));
        if (messagesChanged || messages.length === 0) {
          setMessages(mappedMessages);
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      if (messages.length === 0) {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isPremium) return;
    
    // Check for phone numbers
    const hasPhoneNumber = detectPhoneNumber(newMessage.trim());
    
    if (hasPhoneNumber) {
      // Auto-remove phone numbers
      const cleanedMessage = removePhoneNumbers(newMessage.trim());
      
      // Show warning
      setPhoneNumberWarning(true);
      setTimeout(() => setPhoneNumberWarning(false), 5000);
      
      // Report to admin
      try {
        await flagMessage(
          'violation-' + Date.now(),
          newMessage.trim(),
          cleanedMessage,
          String(therapist.$id || therapist.id),
          'admin',
          String(therapist.$id || therapist.id),
          'Phone number sharing attempt',
          100,
          ['phone_number'],
          'high'
        );
      } catch (error) {
        console.error('Failed to report violation:', error);
      }
      
      // Send warning message to chat
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );
      
      await messagingService.sendMessage({
        conversationId,
        senderId: 'system',
        senderType: 'system',
        senderName: 'Team Indastreet',
        receiverId: String(therapist.$id || therapist.id),
        receiverType: 'therapist',
        receiverName: therapist.name || 'Therapist',
        content: '⚠️ WARNING: Sharing contact numbers (phone/WhatsApp) is strictly prohibited. Both accounts will be deactivated until further notice if numbers are shared. All bookings must be done through the IndastreetMassage platform. - Team Indastreet',
      });
      
      // Clear input and refresh
      setNewMessage('');
      await fetchMessages();
      setSending(false);
      return;
    }
    
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

  const handleSendDiscount = async (percentage: number, bannerUrl: string) => {
    try {
      // Create discount code in database
      const discountCode = await createDiscountCode(
        therapist.$id || therapist.id,
        therapist.name || 'Therapist',
        'therapist',
        'customer-id', // TODO: Get actual customer ID from conversation
        'Customer', // TODO: Get actual customer name
        percentage,
        bannerUrl,
        'Thank you for your order and payment! Please accept this discount for your next booking 🎁'
      );

      // Generate conversation ID
      const conversationId = messagingService.generateConversationId(
        { id: String(therapist.$id || therapist.id), role: 'therapist' },
        { id: 'admin', role: 'admin' }
      );

      // Send discount banner as message
      await messagingService.sendMessage({
        conversationId,
        senderId: String(therapist.$id || therapist.id),
        senderType: 'therapist',
        senderName: therapist.name || 'Therapist',
        receiverId: 'admin',
        receiverType: 'user',
        receiverName: 'Support Team',
        content: `🎁 ${percentage}% Discount Gift!\n\nThank you for your order and payment! Use code: ${discountCode.code}\n\nValid for 30 days on your next booking.`,
      });

      // Refresh messages
      await fetchMessages();
      alert('Discount banner sent successfully!');
    } catch (error) {
      console.error('Failed to send discount:', error);
      alert('Failed to send discount. Please try again.');
    }
  };

  const handleFlagMessage = async (msg: Message) => {
    const reason = prompt('Why are you reporting this message?\n\n1. Inappropriate content\n2. Spam\n3. Harassment\n4. Other\n\nEnter reason:');
    
    if (!reason) return;
    
    try {
      await flagMessage(
        msg.$id,
        msg.message,
        msg.message,
        msg.senderId,
        String(therapist.$id || therapist.id),
        String(therapist.$id || therapist.id),
        reason,
        50,
        ['user_report'],
        'medium'
      );
      
      alert('Message reported to admin. Thank you for helping keep our community safe.');
    } catch (error) {
      console.error('Failed to flag message:', error);
      alert('Failed to report message. Please try again.');
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[600px] md:h-[700px] max-h-[85vh] overflow-hidden w-full max-w-4xl mx-auto">
            {/* Orange Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Admin Profile Image */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
                  <img 
                    src={adminAvatar} 
                    alt="Support Team"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = '<div class="w-full h-full bg-white flex items-center justify-center"><svg class="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg></div>';
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Support Team</h3>
                  <p className="text-orange-100 text-xs">Online Now</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Close Button */}
                <button 
                  onClick={onBack}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title="Close Chat"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                
                {/* Burger Menu Icon */}
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors relative"
                  title="Menu"
                >
                  <Menu className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-4 top-16 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-72 z-50 max-h-[500px] overflow-y-auto">
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      onBack();
                    }}
                    className="w-full px-4 py-3 hover:bg-orange-50 flex items-center gap-3 text-left transition-colors"
                  >
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Back to Status</p>
                      <p className="text-xs text-gray-500">Return to dashboard</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      // Handle customer service selection (already in this mode)
                    }}
                    className="w-full px-4 py-3 hover:bg-orange-50 flex items-center gap-3 text-left transition-colors border-t border-gray-100"
                  >
                    <Headphones className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Customer Service</p>
                      <p className="text-xs text-gray-500">Chat with support team</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      alert('Payment card feature coming soon! You can add your payment details in the Payment Info section.');
                    }}
                    className="w-full px-4 py-3 hover:bg-orange-50 flex items-center gap-3 text-left transition-colors border-t border-gray-100"
                  >
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Add Payment Card</p>
                      <p className="text-xs text-gray-500">Save your payment method</p>
                    </div>
                  </button>
                  
                  {/* Discount Banners Section */}
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="px-4 py-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Discount Banners</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click to preview & send</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedBanner({
                          percentage: 5,
                          url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532',
                          name: '5% Discount Banner'
                        });
                        setShowBannerPreview(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-green-50 flex items-center gap-3 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-green-200 flex-shrink-0">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532"
                          alt="5% Discount"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">5% Discount Banner</p>
                        <p className="text-xs text-gray-500">Thank you reward</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedBanner({
                          percentage: 10,
                          url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896',
                          name: '10% Discount Banner'
                        });
                        setShowBannerPreview(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-blue-50 flex items-center gap-3 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-blue-200 flex-shrink-0">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896"
                          alt="10% Discount"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">10% Discount Banner</p>
                        <p className="text-xs text-gray-500">Loyalty reward</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedBanner({
                          percentage: 15,
                          url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221',
                          name: '15% Discount Banner'
                        });
                        setShowBannerPreview(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-purple-50 flex items-center gap-3 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-purple-200 flex-shrink-0">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221"
                          alt="15% Discount"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">15% Discount Banner</p>
                        <p className="text-xs text-gray-500">Special offer</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSelectedBanner({
                          percentage: 20,
                          url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034',
                          name: '20% Discount Banner'
                        });
                        setShowBannerPreview(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-3 hover:bg-red-50 flex items-center gap-3 text-left transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-red-200 flex-shrink-0">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034"
                          alt="20% Discount"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">20% Discount Banner</p>
                        <p className="text-xs text-gray-500">Premium reward</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-6 space-y-4"
              style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20chat.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
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
                      {/* Thank You Reminder - System Notification */}
                      {msg.isThankYouReminder ? (
                        <div className="w-full">
                          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 rounded-xl p-4 shadow-md">
                            <div className="flex items-start gap-3">
                              <div className="bg-orange-500 p-2 rounded-full">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-orange-800">Team Indastreet</span>
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                                    Loyalty Tip
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3 font-medium">
                                  {msg.message}
                                </p>
                                <p className="text-xs text-gray-600 mb-3">
                                  Customer: <span className="font-semibold">{msg.reminderData?.customerName}</span>
                                </p>
                                <button
                                  onClick={() => setShowDiscountSelector(true)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
                                >
                                  <Gift className="w-4 h-4" />
                                  Send Reward Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : msg.isReview ? (
                        {/* Review Message - Special Styling */}
                        <div className="w-full">
                          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-4 shadow-md">
                            <div className="flex items-start gap-3">
                              <div className="bg-yellow-400 p-2 rounded-full">
                                <Star className="w-5 h-5 text-white fill-current" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold text-gray-800">New Review Received!</span>
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i}
                                        className={`w-4 h-4 ${i < (msg.reviewRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">{msg.message}</p>
                                <button
                                  onClick={() => setShowDiscountSelector(true)}
                                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all text-sm font-semibold shadow-md"
                                >
                                  <Gift className="w-4 h-4" />
                                  Send Thank You Discount
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Regular Message */}
                          {/* Avatar on left for customer/admin, right for therapist */}
                          {msg.senderType !== 'therapist' && (
                            <div className="flex-shrink-0 self-end mb-1">
                              <img 
                                src={msg.senderAvatar || adminAvatar} 
                                alt={msg.senderName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-sm"
                                onError={(e) => {
                                  // Fallback to default avatar icon
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-300 shadow-sm"><svg class="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/></svg></div>';
                                  }
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="max-w-[70%] flex flex-col">
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-xs font-semibold text-gray-700">
                                {msg.senderName}
                              </span>
                              <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="relative group">
                              <div
                                className={`p-4 rounded-2xl shadow-md ${
                                  msg.senderType === 'therapist'
                                    ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 text-gray-800 border border-amber-200'
                                    : msg.senderType === 'system'
                                    ? 'bg-red-50 text-red-900 border-2 border-red-300'
                                    : 'bg-white text-gray-800 border border-gray-200'
                                }`}
                              >
                                {msg.discountBanner ? (
                                  <div>
                                    <img 
                                      src={msg.discountBanner} 
                                      alt="Discount banner"
                                      className="w-full rounded-lg mb-2"
                                    />
                                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                    {msg.discountCode && (
                                      <div className="mt-2 p-2 bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300 rounded text-center font-mono text-xs font-bold">
                                        {msg.discountCode}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm whitespace-pre-wrap">{getMessageText(msg)}</p>
                                )}
                                
                                {/* Translation indicator */}
                                {translatedMessages[msg.$id] && (
                                  <p className="text-xs opacity-60 mt-1 italic">Translated</p>
                                )}
                              </div>
                              
                              {/* Flag Button - Bottom Right of Bubble */}
                              {msg.senderType !== 'system' && (
                                <button
                                  onClick={() => handleFlagMessage(msg)}
                                  className="absolute -bottom-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  title="Report Message"
                                >
                                  <Flag className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Avatar on right for therapist */}
                          {msg.senderType === 'therapist' && (
                            <div className="flex-shrink-0 self-end mb-1">
                              {therapist?.mainImage ? (
                                <img 
                                  src={therapist.mainImage} 
                                  alt={therapist.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shadow-sm"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center border-2 border-amber-300 shadow-sm">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Orange Footer / Input Area */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4">
              {/* Phone Number Warning */}
              {phoneNumberWarning && (
                <div className="mb-3 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-pulse">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold mb-1">⚠️ PROHIBITED ACTION</p>
                    <p>Phone/WhatsApp numbers are not allowed. Number has been removed and reported to admin. Repeated violations will result in account deactivation.</p>
                  </div>
                  <button
                    onClick={() => setPhoneNumberWarning(false)}
                    className="text-white hover:text-red-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                {/* Language Toggle - ID/EN Flags */}
                <div className="flex bg-white rounded-full shadow-md overflow-hidden">
                  <button
                    onClick={() => {
                      setChatLanguage('id');
                      setTranslatedMessages({}); // Clear cache to retranslate
                    }}
                    className={`px-3 py-2 text-lg transition-all ${
                      chatLanguage === 'id'
                        ? 'bg-orange-500 scale-110'
                        : 'bg-white hover:bg-orange-50'
                    }`}
                    title="Translate to Indonesian"
                  >
                    🇮🇩
                  </button>
                  <button
                    onClick={() => {
                      setChatLanguage('en');
                      setTranslatedMessages({}); // Clear cache to retranslate
                    }}
                    className={`px-3 py-2 text-lg transition-all ${
                      chatLanguage === 'en'
                        ? 'bg-orange-500 scale-110'
                        : 'bg-white hover:bg-orange-50'
                    }`}
                    title="Translate to English"
                  >
                    🇬🇧
                  </button>
                </div>
                
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border-2 border-white/30 bg-white/95 rounded-full focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500"
                  disabled={sending}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-12 h-12 bg-white text-orange-600 rounded-full hover:bg-orange-50 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold flex-shrink-0"
                  title="Send Message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-center mt-2">
                <p className="text-xs text-white/90">
                  ⭐ Premium support - Auto-translate enabled
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Discount Banner Selector Modal */}
        {showDiscountSelector && (
          <DiscountBannerSelector
            onSend={handleSendDiscount}
            onClose={() => setShowDiscountSelector(false)}
            memberName={therapist?.name}
          />
        )}
        
        {/* Banner Preview Modal */}
        {showBannerPreview && selectedBanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-white font-bold text-lg">{selectedBanner.name}</h3>
                <button
                  onClick={() => {
                    setShowBannerPreview(false);
                    setSelectedBanner(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              {/* Banner Preview */}
              <div className="p-6">
                <div className="mb-4">
                  <img 
                    src={selectedBanner.url}
                    alt={selectedBanner.name}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-semibold">Discount:</span> {selectedBanner.percentage}%
                  </p>
                  <p className="text-xs text-gray-600">
                    This will create a unique discount code for the customer and send the banner in the chat.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowBannerPreview(false);
                      setSelectedBanner(null);
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSendDiscount(selectedBanner.percentage, selectedBanner.url, `Thank you! Enjoy ${selectedBanner.percentage}% off your next booking!`);
                      setShowBannerPreview(false);
                      setSelectedBanner(null);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistChat;
