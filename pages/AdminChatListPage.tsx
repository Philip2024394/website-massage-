import React, { useState, useEffect } from 'react';
import { databases, storage, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';
import { MessageCircle, Search, Ban, Check, Clock, MapPin, Paperclip, Send, Smile, X, AlertTriangle } from 'lucide-react';

interface ChatUser {
    $id: string;
    userId: string;
    userName: string;
    userType: 'therapist' | 'place' | 'user' | 'hotel' | 'villa' | 'agent';
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
    isBlocked?: boolean;
    avatar?: string;
}

interface Message {
    $id?: string;
    senderId: string;
    senderName: string;
    senderType: string;
    recipientId: string;
    recipientName: string;
    recipientType: string;
    message: string;
    createdAt: string; // Using your existing field name
    read: boolean;
    messageType?: 'text' | 'file' | 'location' | 'system';
    fileUrl?: string;
    fileName?: string;
    location?: string; // Using your existing field (stored as JSON string)
    keepForever?: boolean;
    // Your existing translation fields (optional, not used by new chat)
    translatedText?: string;
    originalLanguage?: string;
    translatedLanguage?: string;
    roomId?: string;
    isSystemMessage?: boolean;
    readAt?: string;
}

const AdminChatListPage: React.FC = () => {
    const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);

    const DATABASE_ID = APPWRITE_CONFIG.databaseId;
    const COLLECTIONS = APPWRITE_CONFIG.collections;

    // Common emojis
    const emojis = ['😊', '😂', '❤️', '👍', '👏', '🙏', '✨', '🎉', '😍', '🔥', '💪', '🌟', '✅', '❌', '⏰', '📍', '📎', '💬'];

    useEffect(() => {
        fetchChatUsers();
        // Set up real-time polling for new messages
        const interval = setInterval(() => {
            if (selectedUser) {
                fetchMessages(selectedUser.userId);
            }
            fetchChatUsers(); // Update unread counts
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedUser]);

    const fetchChatUsers = async () => {
        setIsLoading(true);
        try {
            // Fetch all therapists
            const therapistsResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.therapists,
                [Query.limit(100)]
            );

            // Fetch all places
            const placesResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.places,
                [Query.limit(100)]
            );

            // Fetch all users (if you have a users collection)
            // const usersResponse = await databases.listDocuments(...);

            const users: ChatUser[] = [];

            // Add therapists
            therapistsResponse.documents.forEach((doc: any) => {
                users.push({
                    $id: doc.$id,
                    userId: doc.$id,
                    userName: doc.name,
                    userType: 'therapist',
                    unreadCount: 0,
                    isBlocked: doc.chatBlocked || false,
                    avatar: doc.mainImage || doc.image
                });
            });

            // Add places
            placesResponse.documents.forEach((doc: any) => {
                users.push({
                    $id: doc.$id,
                    userId: doc.$id,
                    userName: doc.name,
                    userType: 'place',
                    unreadCount: 0,
                    isBlocked: doc.chatBlocked || false,
                    avatar: doc.mainImage || doc.image
                });
            });

            // Fetch last messages and unread counts for each user
            for (const user of users) {
                try {
                    const messagesResponse = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.chatMessages || 'chat_messages',
                        [
                            Query.or([
                                Query.and([
                                    Query.equal('senderId', user.userId),
                                    Query.equal('recipientId', 'admin')
                                ]),
                                Query.and([
                                    Query.equal('senderId', 'admin'),
                                    Query.equal('recipientId', user.userId)
                                ])
                            ]),
                            Query.orderDesc('timestamp'),
                            Query.limit(1)
                        ]
                    );

                    if (messagesResponse.documents.length > 0) {
                        const lastMsg = messagesResponse.documents[0] as any;
                        user.lastMessage = lastMsg.message;
                        user.lastMessageTime = lastMsg.timestamp;
                    }

                    // Count unread messages from this user
                    const unreadResponse = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.chatMessages || 'chat_messages',
                        [
                            Query.equal('senderId', user.userId),
                            Query.equal('recipientId', 'admin'),
                            Query.equal('read', false)
                        ]
                    );
                    user.unreadCount = unreadResponse.total || 0;
                } catch (error) {
                    console.error('Error fetching messages for user:', user.userId, error);
                }
            }

            // Sort by last message time
            users.sort((a, b) => {
                const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
                const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
                return timeB - timeA;
            });

            setChatUsers(users);
        } catch (error) {
            console.error('Error fetching chat users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMessages = async (userId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.chatMessages || 'chat_messages',
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
                    Query.orderAsc('timestamp'),
                    Query.limit(500)
                ]
            );

            setMessages(response.documents as unknown as Message[]);

            // Mark messages as read
            const unreadMessages = response.documents.filter(
                (msg: any) => msg.senderId === userId && !msg.read
            );

            for (const msg of unreadMessages) {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.chatMessages || 'chat_messages',
                    msg.$id,
                    { read: true }
                );
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedUser || isSending) return;

        // Check if user is blocked
        if (selectedUser.isBlocked) {
            alert('This chat has been suspended. Please unblock to send messages.');
            return;
        }

        setIsSending(true);
        try {
            const message: Message = {
                senderId: 'admin',
                senderName: 'IndaStreet Team',
                senderType: 'admin',
                recipientId: selectedUser.userId,
                recipientName: selectedUser.userName,
                recipientType: selectedUser.userType,
                message: newMessage,
                createdAt: new Date().toISOString(),
                read: false,
                messageType: 'text',
                keepForever: false,
                originalLanguage: 'en', // Required field in your schema
                roomId: `admin-${selectedUser.userId}`, // Required field in your schema
                isSystemMessage: false // Required field in your schema
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.chatMessages || 'chat_messages',
                ID.unique(),
                message
            );

            setNewMessage('');
            fetchMessages(selectedUser.userId);
            fetchChatUsers(); // Update last message
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedUser) return;

        if (selectedUser.isBlocked) {
            alert('This chat has been suspended.');
            return;
        }

        setUploadingFile(true);
        try {
            // Upload to Appwrite Storage
            const uploadResponse = await storage.createFile(
                APPWRITE_CONFIG.bucketId, // Using your existing bucketId
                ID.unique(),
                file
            );

            const fileUrl = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${uploadResponse.$id}/view?project=${APPWRITE_CONFIG.projectId}`;

            const message: Message = {
                senderId: 'admin',
                senderName: 'IndaStreet Team',
                senderType: 'admin',
                recipientId: selectedUser.userId,
                recipientName: selectedUser.userName,
                recipientType: selectedUser.userType,
                message: `📎 Shared a file: ${file.name}`,
                createdAt: new Date().toISOString(),
                read: false,
                messageType: 'file',
                fileUrl: fileUrl,
                fileName: file.name,
                keepForever: false,
                originalLanguage: 'en',
                roomId: `admin-${selectedUser.userId}`,
                isSystemMessage: false
            };

            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.chatMessages || 'chat_messages',
                ID.unique(),
                message
            );

            fetchMessages(selectedUser.userId);
            fetchChatUsers();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleShareLocation = async () => {
        if (!selectedUser || selectedUser.isBlocked) return;

        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    
                    const message: Message = {
                        senderId: 'admin',
                        senderName: 'IndaStreet Team',
                        senderType: 'admin',
                        recipientId: selectedUser.userId,
                        recipientName: selectedUser.userName,
                        recipientType: selectedUser.userType,
                        message: `📍 Shared location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                        createdAt: new Date().toISOString(),
                        read: false,
                        messageType: 'location',
                        location: JSON.stringify({ latitude, longitude }), // Store as JSON string
                        keepForever: false,
                        originalLanguage: 'en',
                        roomId: `admin-${selectedUser.userId}`,
                        isSystemMessage: false
                    };

                    await databases.createDocument(
                        DATABASE_ID,
                        COLLECTIONS.chatMessages || 'chat_messages',
                        ID.unique(),
                        message
                    );

                    fetchMessages(selectedUser.userId);
                    fetchChatUsers();
                } catch (error) {
                    console.error('Error sharing location:', error);
                    alert('Failed to share location');
                }
            }, () => {
                alert('Location permission denied');
            });
        } else {
            alert('Geolocation not supported');
        }
    };

    const handleBlockChat = async (user: ChatUser) => {
        const action = user.isBlocked ? 'unblock' : 'block';
        if (!confirm(`Are you sure you want to ${action} chat with ${user.userName}?`)) return;

        try {
            const collectionId = user.userType === 'therapist' 
                ? COLLECTIONS.therapists 
                : COLLECTIONS.places;

            await databases.updateDocument(
                DATABASE_ID,
                collectionId,
                user.userId,
                { chatBlocked: !user.isBlocked }
            );

            // Send system message if blocking
            if (!user.isBlocked) {
                const systemMessage: Message = {
                    senderId: 'system',
                    senderName: 'System',
                    senderType: 'system',
                    recipientId: user.userId,
                    recipientName: user.userName,
                    recipientType: user.userType,
                    message: '⚠️ This chat has been suspended until further notice. Please contact support.\n\n- IndaStreet Team',
                    createdAt: new Date().toISOString(),
                    read: false,
                    messageType: 'system',
                    keepForever: true,
                    originalLanguage: 'en',
                    roomId: `admin-${user.userId}`,
                    isSystemMessage: true
                };

                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.chatMessages || 'chat_messages',
                    ID.unique(),
                    systemMessage
                );
            }

            fetchChatUsers();
            if (selectedUser?.userId === user.userId) {
                fetchMessages(user.userId);
            }
        } catch (error) {
            console.error('Error blocking/unblocking chat:', error);
            alert('Failed to update chat status');
        }
    };

    const filteredUsers = chatUsers.filter(user =>
        user.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Chat List Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No conversations</div>
                    ) : (
                        filteredUsers.map((user) => (
                            <div
                                key={user.userId}
                                onClick={() => {
                                    setSelectedUser(user);
                                    fetchMessages(user.userId);
                                }}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                    selectedUser?.userId === user.userId ? 'bg-orange-50' : ''
                                } ${user.isBlocked ? 'opacity-60' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.userName} className="w-12 h-12 rounded-full object-cover" />
                                            ) : (
                                                <span className="text-orange-600 font-bold text-lg">
                                                    {user.userName.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        {user.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {user.unreadCount}
                                            </div>
                                        )}
                                        {user.isBlocked && (
                                            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                                <Ban className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-gray-900 truncate">{user.userName}</h3>
                                            {user.lastMessageTime && (
                                                <span className="text-xs text-gray-500">{formatTime(user.lastMessageTime)}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                {user.userType}
                                            </span>
                                            {user.lastMessage && (
                                                <p className="text-sm text-gray-600 truncate flex-1">{user.lastMessage}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            {selectedUser ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="bg-white border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                    {selectedUser.avatar ? (
                                        <img src={selectedUser.avatar} alt={selectedUser.userName} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <span className="text-orange-600 font-bold">
                                            {selectedUser.userName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedUser.userName}</h3>
                                    <p className="text-xs text-gray-500">{selectedUser.userType}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleBlockChat(selectedUser)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                    selectedUser.isBlocked
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                            >
                                {selectedUser.isBlocked ? (
                                    <><Check className="w-4 h-4 inline mr-1" /> Unblock Chat</>
                                ) : (
                                    <><Ban className="w-4 h-4 inline mr-1" /> Block Chat</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => {
                            const isAdmin = msg.senderId === 'admin';
                            const isSystem = msg.senderType === 'system';

                            if (isSystem) {
                                return (
                                    <div key={msg.$id || index} className="flex justify-center">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md text-center">
                                            <AlertTriangle className="w-5 h-5 text-red-600 mx-auto mb-2" />
                                            <p className="text-sm text-red-800 whitespace-pre-line">{msg.message}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={msg.$id || index} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-md ${isAdmin ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200'} rounded-lg p-3 shadow-sm`}>
                                        {!isAdmin && (
                                            <p className="text-xs font-semibold text-gray-600 mb-1">{msg.senderName}</p>
                                        )}
                                        
                                        {msg.messageType === 'location' && msg.location ? (
                                            <div>
                                                <p className="text-sm mb-2">{msg.message}</p>
                                                {(() => {
                                                    try {
                                                        const loc = JSON.parse(msg.location);
                                                        return (
                                                            <a
                                                                href={`https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs underline flex items-center gap-1"
                                                            >
                                                                <MapPin className="w-3 h-3" />
                                                                View on Maps
                                                            </a>
                                                        );
                                                    } catch {
                                                        return <p className="text-xs text-red-500">Invalid location data</p>;
                                                    }
                                                })()}
                                            </div>
                                        ) : msg.messageType === 'file' && msg.fileUrl ? (
                                            <div>
                                                <p className="text-sm mb-2">{msg.message}</p>
                                                <a
                                                    href={msg.fileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs underline flex items-center gap-1"
                                                >
                                                    <Paperclip className="w-3 h-3" />
                                                    Download {msg.fileName}
                                                </a>
                                            </div>
                                        ) : (
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        )}
                                        
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className={`text-xs ${isAdmin ? 'text-orange-100' : 'text-gray-500'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {isAdmin && (
                                                <Check className={`w-3 h-3 ${msg.read ? 'text-blue-200' : 'text-orange-200'}`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Message Input */}
                    {selectedUser.isBlocked ? (
                        <div className="bg-red-50 border-t border-red-200 p-4 text-center">
                            <p className="text-red-800 font-semibold">⚠️ This chat is blocked. Unblock to send messages.</p>
                        </div>
                    ) : (
                        <div className="bg-white border-t border-gray-200 p-4">
                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                                    <div className="flex flex-wrap gap-2">
                                        {emojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => {
                                                    setNewMessage(prev => prev + emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className="text-2xl hover:bg-gray-200 rounded p-1 transition-colors"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Add emoji"
                                >
                                    <Smile className="w-5 h-5 text-gray-500" />
                                </button>
                                
                                <label className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer" title="Attach file">
                                    <Paperclip className="w-5 h-5 text-gray-500" />
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        disabled={uploadingFile}
                                    />
                                </label>

                                <button
                                    onClick={handleShareLocation}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    title="Share location"
                                >
                                    <MapPin className="w-5 h-5 text-gray-500" />
                                </button>

                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    disabled={isSending || uploadingFile}
                                />

                                <button
                                    onClick={handleSendMessage}
                                    disabled={isSending || !newMessage.trim() || uploadingFile}
                                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {uploadingFile && (
                                <p className="text-xs text-gray-500 mt-2">Uploading file...</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Select a conversation to start messaging</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminChatListPage;
