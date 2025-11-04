import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Smile, Paperclip, MapPin, AlertTriangle, Check } from 'lucide-react';
import { databases, storage, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';
import { validateChatMessage } from '../utils/chatValidation';
import { chatNotificationService } from '../services/chatNotificationService';

interface MemberChatWindowProps {
  userId: string;
  userName: string;
  userType: 'therapist' | 'place' | 'hotel' | 'villa' | 'agent' | 'user';
  onClose: () => void;
}

interface Message {
  $id: string;
  senderId: string;
  senderName: string;
  senderType: string;
  recipientId: string;
  recipientName: string;
  recipientType: string;
  message: string;
  createdAt: string; // Changed from timestamp to match existing Appwrite schema
  read: boolean;
  messageType: 'text' | 'file' | 'location' | 'system';
  fileUrl?: string;
  fileName?: string;
  location?: string; // Changed to JSON string to match existing Appwrite schema
  keepForever?: boolean;
  // Existing Appwrite schema fields
  translatedText?: string;
  originalLanguage?: string;
  translatedLanguage?: string;
  roomId?: string;
  isSystemMessage?: boolean;
  readAt?: string;
}

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_COLLECTION_ID = APPWRITE_CONFIG.collections.chatMessages;

const MemberChatWindow: React.FC<MemberChatWindowProps> = ({
  userId,
  userName,
  userType,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isChatBlocked, setIsChatBlocked] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojis = ['😊', '😂', '❤️', '👍', '👏', '🙏', '✨', '🎉', '😍', '🔥', '💪', '🌟', '✅', '❌', '⏰', '📍', '📎', '💬'];

  useEffect(() => {
    fetchMessages();
    checkIfBlocked();

    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    // Request notification permission
    chatNotificationService.requestPermission();

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkIfBlocked = async () => {
    try {
      // Check if chat is blocked - this would need to query the user's document
      // For now, we'll check system messages in chat
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_COLLECTION_ID,
        [
          Query.equal('recipientId', userId),
          Query.equal('messageType', 'system'),
          Query.orderDesc('createdAt'),
          Query.limit(1)
        ]
      );

      if (response.documents.length > 0) {
        const lastSystemMsg = response.documents[0];
        if (lastSystemMsg.message.includes('suspended')) {
          setIsChatBlocked(true);
        }
      }
    } catch (error) {
      console.error('Error checking block status:', error);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_COLLECTION_ID,
        [
          Query.or([
            Query.and([
              Query.equal('senderId', userId),
              Query.equal('recipientId', 'admin')
            ]),
            Query.and([
              Query.equal('senderId', 'admin'),
              Query.equal('recipientId', userId)
            ])
          ]),
          Query.orderAsc('createdAt'),
          Query.limit(100)
        ]
      );

      const fetchedMessages = response.documents as unknown as Message[];
      
      // Check for new unread messages from admin
      const lastMessage = messages[messages.length - 1];
      const newLastMessage = fetchedMessages[fetchedMessages.length - 1];
      
      if (newLastMessage && lastMessage?.$id !== newLastMessage.$id && newLastMessage.senderId === 'admin' && !newLastMessage.read) {
        // New message from admin - show notification
        chatNotificationService.notifyNewMessage(
          'IndaStreet Team',
          newLastMessage.message,
          '/logo.png'
        );
      }

      setMessages(fetchedMessages);

      // Mark admin messages as read
      const unreadAdminMessages = fetchedMessages.filter(
        msg => msg.senderId === 'admin' && !msg.read
      );

      for (const msg of unreadAdminMessages) {
        try {
          await databases.updateDocument(
            DATABASE_ID,
            CHAT_COLLECTION_ID,
            msg.$id,
            { read: true }
          );
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    if (isChatBlocked) {
      alert('This chat has been suspended. Please contact support for assistance.');
      return;
    }

    // Validate message for phone numbers (user is not exempt like admin)
    const validation = validateChatMessage(newMessage, userType, 'admin');
    if (!validation.valid) {
      setValidationError(validation.error || 'Message cannot be sent');
      setTimeout(() => setValidationError(null), 5000);
      return;
    }

    setSending(true);
    setValidationError(null);

    try {
      const message: Partial<Message> = {
        senderId: userId,
        senderName: userName,
        senderType: userType,
        recipientId: 'admin',
        recipientName: 'IndaStreet Team',
        recipientType: 'admin',
        message: newMessage,
        createdAt: new Date().toISOString(),
        read: false,
        messageType: 'text',
        keepForever: false,
        originalLanguage: 'en',
        roomId: `admin-${userId}`,
        isSystemMessage: false
      };

      await databases.createDocument(
        DATABASE_ID,
        CHAT_COLLECTION_ID,
        ID.unique(),
        message
      );

      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type
      });
      alert(`Failed to send message: ${error.message || 'Please try again.'}`);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (isChatBlocked) {
      alert('This chat has been suspended. Please contact support for assistance.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPG, PNG) and documents (PDF, DOC, DOCX) are allowed');
      return;
    }

    setUploading(true);

    try {
      console.log('📤 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Upload file to Appwrite Storage using existing bucket
      const uploadResponse = await storage.createFile(
        APPWRITE_CONFIG.bucketId,
        ID.unique(),
        file
      );

      console.log('✅ File uploaded successfully:', uploadResponse.$id);

      // Get file URL
      const fileUrl = String(storage.getFileView(APPWRITE_CONFIG.bucketId, uploadResponse.$id));

      console.log('📎 File URL:', fileUrl);

      // Create message with file
      const message: Partial<Message> = {
        senderId: userId,
        senderName: userName,
        senderType: userType,
        recipientId: 'admin',
        recipientName: 'IndaStreet Team',
        recipientType: 'admin',
        message: `📎 Sent a file: ${file.name}`,
        createdAt: new Date().toISOString(),
        read: false,
        messageType: 'file',
        fileUrl: fileUrl,
        fileName: file.name,
        keepForever: false,
        originalLanguage: 'en',
        roomId: `admin-${userId}`,
        isSystemMessage: false
      };

      await databases.createDocument(
        DATABASE_ID,
        CHAT_COLLECTION_ID,
        ID.unique(),
        message
      );

      fetchMessages();
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      alert(`Failed to upload file: ${error.message || 'Please try again.'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleShareLocation = async () => {
    if (isChatBlocked) {
      alert('This chat has been suspended. Please contact support for assistance.');
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    // Request permission and get location
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      try {
        const message: Partial<Message> = {
          senderId: userId,
          senderName: userName,
          senderType: userType,
          recipientId: 'admin',
          recipientName: 'IndaStreet Team',
          recipientType: 'admin',
          message: `📍 Shared location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          createdAt: new Date().toISOString(),
          read: false,
          messageType: 'location',
          location: JSON.stringify({ latitude, longitude }),
          keepForever: false,
          originalLanguage: 'en',
          roomId: `admin-${userId}`,
          isSystemMessage: false
        };

        await databases.createDocument(
          DATABASE_ID,
          CHAT_COLLECTION_ID,
          ID.unique(),
          message
        );

        fetchMessages();
      } catch (error) {
        console.error('Error sharing location:', error);
        alert('Failed to share location. Please try again.');
      }
    } catch (error: any) {
      console.error('Geolocation error:', error);
      if (error.code === 1) {
        alert('Location permission denied. Please enable location access in your browser settings.');
      } else if (error.code === 2) {
        alert('Location unavailable. Please check your device settings.');
      } else if (error.code === 3) {
        alert('Location request timed out. Please try again.');
      } else {
        alert('Failed to get your location. Please try again.');
      }
    }
  };

  const handleEmojiClick = (emoji: string) => {
    console.log('😀 Emoji clicked:', emoji);
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center sm:p-4">
      <div className="bg-white sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl h-full sm:h-screen flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 sm:rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Chat Live</h2>
              <p className="text-sm text-orange-100">IndaStreet Support Team</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-orange-600 rounded-lg p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Auto-Translation Welcome Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200 px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">🌍 Auto-Translation Enabled</p>
              <p className="text-xs text-blue-800 leading-relaxed">
                Welcome! Chats are automatically translated to your customer's language. 
                Now you can chat with tourists in your native language. 
                <span className="block mt-1 italic">Please allow for small translation errors due to language interpretation.</span>
              </p>
              <p className="text-xs text-blue-700 mt-2 font-medium">— Admin Team IndaStreet</p>
            </div>
          </div>
        </div>

        {/* Chat Blocked Warning */}
        {isChatBlocked && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Chat Suspended</p>
              <p className="text-sm">This chat has been suspended. Please contact support for assistance.</p>
            </div>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{validationError}</p>
              <p className="text-xs mt-1">Please use platform messaging only for contact.</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading && messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-2">Start a conversation with the IndaStreet Team</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin = msg.senderId === 'admin';
              const isSystemMessage = msg.messageType === 'system';

              if (isSystemMessage) {
                return (
                  <div key={msg.$id} className="flex justify-center">
                    <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg max-w-md text-center">
                      <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={msg.$id}
                  className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      isAdmin
                        ? 'bg-white text-gray-800 shadow-md'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {/* Sender Name */}
                    <p className={`text-xs font-semibold mb-1 ${isAdmin ? 'text-orange-600' : 'text-orange-100'}`}>
                      {msg.senderName}
                    </p>

                    {/* Message Content */}
                    {msg.messageType === 'file' && msg.fileUrl ? (
                      <div className="space-y-2">
                        <p className="text-sm">{msg.message}</p>
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 text-sm underline ${
                            isAdmin ? 'text-blue-600 hover:text-blue-700' : 'text-white hover:text-orange-100'
                          }`}
                        >
                          <Paperclip className="w-4 h-4" />
                          Download {msg.fileName}
                        </a>
                      </div>
                    ) : msg.messageType === 'location' && msg.location ? (
                      <div className="space-y-2">
                        <p className="text-sm">{msg.message}</p>
                        {(() => {
                          try {
                            const loc = JSON.parse(msg.location);
                            return (
                              <a
                                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-2 text-sm underline ${
                                  isAdmin ? 'text-blue-600 hover:text-blue-700' : 'text-white hover:text-orange-100'
                                }`}
                              >
                                <MapPin className="w-4 h-4" />
                                View on Map
                              </a>
                            );
                          } catch {
                            return <p className="text-xs text-red-500">Invalid location data</p>;
                          }
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-line">{msg.message}</p>
                    )}

                    {/* Timestamp & Read Status */}
                    <div className={`flex items-center gap-2 mt-2 text-xs ${
                      isAdmin ? 'text-gray-500' : 'text-orange-100'
                    }`}>
                      <span>{formatTimestamp(msg.createdAt)}</span>
                      {!isAdmin && msg.read && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4 rounded-b-2xl">
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-9 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-gray-200 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isChatBlocked}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Smile className="w-4 h-4" />
              <span className="hidden sm:inline">Emoji</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || isChatBlocked}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Paperclip className="w-4 h-4" />
              <span className="hidden sm:inline">
                {uploading ? 'Uploading...' : 'File'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              accept="image/jpeg,image/jpg,image/png,application/pdf,.doc,.docx"
              className="hidden"
            />
            <button
              onClick={handleShareLocation}
              disabled={isChatBlocked}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Location</span>
            </button>
          </div>

          {/* Message Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isChatBlocked ? 'Chat suspended' : 'Type your message...'}
              disabled={isChatBlocked || sending}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending || isChatBlocked}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">
                {sending ? 'Sending...' : 'Send'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberChatWindow;
