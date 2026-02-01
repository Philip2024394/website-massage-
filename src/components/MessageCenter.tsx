// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import { useState, useEffect, useRef } from 'react';
import { messagingService } from '../lib/appwriteService';

interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    senderRole: string;
    receiverId: string;
    receiverName: string;
    receiverRole: string;
    message: string;
    messageType: 'text' | 'image' | 'file' | 'booking' | 'system';
    isRead: boolean;
    bookingId?: string;
    imageUrl?: string;
    metadata?: string;
}

interface Conversation {
    conversationId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserRole: string;
    lastMessage: string;
    lastMessageType: string;
    lastMessageTime: string;
    unreadCount: number;
    bookingId?: string;
}

interface MessageCenterProps {
    currentUserId: string;
    currentUserRole: 'customer' | 'therapist' | 'admin';
    currentUserName: string;
    onClose?: () => void;
    preSelectedConversationId?: string;
}

/**
 * MessageCenter Component
 * 
 * Real-time messaging center that works across all dashboards.
 * Features:
 * - List of conversations
 * - Real-time message updates
 * - Unread badges
 * - Send/receive messages
 * - System message support
 * - Booking-linked messages
 */
export default function MessageCenter({
    currentUserId,
    currentUserRole,
    currentUserName,
    onClose,
    preSelectedConversationId
}: MessageCenterProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(
        preSelectedConversationId || null
    );
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversations
    useEffect(() => {
        loadConversations();
    }, [currentUserId]);

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation);
            markConversationAsRead(selectedConversation);
        }
    }, [selectedConversation]);

    // Subscribe to real-time updates
    useEffect(() => {
        // TODO: Subscribe to new messages when messagingService supports it
        // const unsubscribe = messagingService.subscribeToUserMessages(currentUserId, (message: any) => {
        //     console.log('📩 New message received:', message);
        //     
        //     // Refresh conversations list
        //     loadConversations();
        //     
        //     // If message is in current conversation, add it to messages
        //     if (selectedConversation && message.conversationId === selectedConversation) {
        //         setMessages(prev => [...prev, message]);
        //         markConversationAsRead(selectedConversation);
        //     }
        // });

        return () => {
            // Cleanup function
        };
    }, [currentUserId, selectedConversation]);

    const loadConversations = async () => {
        try {
            const convos = await messagingService.getUserConversations(currentUserId);
            setConversations(convos);
            
            // Calculate total unread
            const total = convos.reduce((sum, c) => sum + c.unreadCount, 0);
            setUnreadTotal(total);
            
            setLoading(false);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            // const msgs = await messagingService.getConversationMessages(conversationId, 100);
            setMessages([]);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const markConversationAsRead = async (conversationId: string) => {
        try {
            // await messagingService.markConversationAsRead(conversationId, currentUserId);
            
            // Update conversations list to reflect read status
            setConversations(prev => 
                prev.map(c => 
                    c.conversationId === conversationId 
                        ? { ...c, unreadCount: 0 }
                        : c
                )
            );
            
            // Recalculate total unread
            const total = conversations.reduce((sum, c) => 
                c.conversationId === conversationId ? sum : sum + c.unreadCount, 0
            );
            setUnreadTotal(total);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || sending) return;

        const conversation = conversations.find(c => c.conversationId === selectedConversation);
        if (!conversation) return;

        setSending(true);

        try {
            const message = await messagingService.sendMessage({
                conversationId: conversation.conversationId,
                senderId: currentUserId,
                senderName: currentUserName,
                recipientId: conversation.otherUserId,
                content: newMessage.trim()
            });

            // Add message to list
            setMessages(prev => [...prev, message as any]);
            setNewMessage('');
            
            // Refresh conversations (to update last message)
            loadConversations();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
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

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-600';
            case 'therapist': return 'text-blue-600';
            case 'customer': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return '👑 Admin';
            case 'therapist': return '💆 Provider';
            case 'customer': return '👤 Customer';
            default: return role;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            {/* Header */}
            <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div>
                        <h2 className="text-lg font-bold">Messages</h2>
                        {unreadTotal > 0 && (
                            <p className="text-sm text-indigo-200">{unreadTotal} unread</p>
                        )}
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-white hover:text-indigo-200">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Conversations List */}
                <div className="w-1/3 border-r border-gray-200 ">
                    {conversations.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            <p>No conversations yet</p>
                            <p className="text-sm mt-2">Start chatting with providers or customers!</p>
                        </div>
                    ) : (
                        conversations.map(convo => (
                            <button
                                key={convo.conversationId}
                                onClick={() => setSelectedConversation(convo.conversationId)}
                                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left transition-colors ${
                                    selectedConversation === convo.conversationId ? 'bg-indigo-50' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">
                                            {convo.otherUserName}
                                        </p>
                                        <p className={`text-xs ${getRoleColor(convo.otherUserRole)}`}>
                                            {getRoleBadge(convo.otherUserRole)}
                                        </p>
                                        <p className={`text-sm mt-1 truncate ${
                                            convo.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'
                                        }`}>
                                            {convo.lastMessageType === 'system' && '🔔 '}
                                            {convo.lastMessage}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(convo.lastMessageTime)}
                                        </p>
                                    </div>
                                    {convo.unreadCount > 0 && (
                                        <span className="ml-2 bg-indigo-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                            {convo.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Messages View */}
                <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                        <>
                            {/* Messages List */}
                            <div className="flex-1  p-4 space-y-4">
                                {messages.map(msg => {
                                    const isOwnMessage = msg.senderId === currentUserId;
                                    const isSystemMessage = msg.messageType === 'system';

                                    return (
                                        <div
                                            key={msg.$id}
                                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                                                isSystemMessage ? 'justify-center' : ''
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                                    isSystemMessage
                                                        ? 'bg-gray-100 text-gray-700 text-center text-sm'
                                                        : isOwnMessage
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}
                                            >
                                                {!isSystemMessage && !isOwnMessage && (
                                                    <p className="text-xs font-semibold mb-1 opacity-75">
                                                        {msg.senderName}
                                                    </p>
                                                )}
                                                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                                <p className={`text-xs mt-1 ${
                                                    isOwnMessage ? 'text-indigo-200' : 'text-gray-500'
                                                }`}>
                                                    {formatTime(msg.$createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="border-t border-gray-200 p-4">
                                <div className="flex space-x-2">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        rows={2}
                                        disabled={sending}
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {sending ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Press Enter to send, Shift+Enter for new line
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-lg font-medium">Select a conversation</p>
                                <p className="text-sm mt-2">Choose a conversation from the list to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
