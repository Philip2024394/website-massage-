import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { messagingService } from '../../../../lib/appwriteService';
import { 
    ChatPersistenceManager, 
    PWABadgeManager, 
    PWANotificationManager,
    isPWAMode 
} from '../lib/pwaFeatures';

/**
 * 💬 Persistent Floating Chat Component for PWA
 * Always visible chat icon that minimizes to corner of screen
 * Provides quick access to support chat for therapists
 */

interface FloatingChatProps {
    therapist: any;
    isPWA?: boolean;
}

interface Message {
    $id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ therapist, isPWA = false }) => {
    // Load initial state from PWA persistence
    const savedState = ChatPersistenceManager.getChatState(therapist?.$id || '');
    
    const [isOpen, setIsOpen] = useState(savedState?.isOpen || false);
    const [isMinimized, setIsMinimized] = useState(savedState?.isMinimized ?? true);
    const [unreadCount, setUnreadCount] = useState(savedState?.unreadCount || 0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(false);

    const isPremium = therapist?.membershipTier === 'premium';
    const isInPWAMode = isPWA || isPWAMode();

    // Save state changes to PWA persistence
    useEffect(() => {
        if (therapist?.$id) {
            ChatPersistenceManager.saveChatState(therapist.$id, {
                isOpen,
                isMinimized,
                unreadCount
            });
        }
    }, [isOpen, isMinimized, unreadCount, therapist?.$id]);

    // Update PWA badge with unread count
    useEffect(() => {
        if (isInPWAMode && unreadCount !== undefined) {
            PWABadgeManager.updateBadge(unreadCount);
        }
    }, [unreadCount, isInPWAMode]);

    // Listen for PWA events
    useEffect(() => {
        const handlePWAOpenChat = () => {
            setIsOpen(true);
            setIsMinimized(false);
        };

        const handleVisibilityChange = (event: CustomEvent) => {
            if (event.detail.visible && isPremium) {
                checkUnreadMessages();
            }
        };

        window.addEventListener('pwa-open-chat', handlePWAOpenChat);
        window.addEventListener('pwa-visibility-change', handleVisibilityChange as EventListener);

        return () => {
            window.removeEventListener('pwa-open-chat', handlePWAOpenChat);
            window.removeEventListener('pwa-visibility-change', handleVisibilityChange as EventListener);
        };
    }, [isPremium]);

    // Load messages when chat opens
    useEffect(() => {
        if (isOpen && isPremium) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen, isPremium]);

    // Check for unread messages periodically
    useEffect(() => {
        if (isPremium) {
            checkUnreadMessages();
            const interval = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
            return () => clearInterval(interval);
        }
    }, [isPremium]);

    const fetchMessages = async () => {
        if (!therapist?.$id) return;

        try {
            setLoading(true);
            const conversationId = messagingService.generateConversationId(
                { id: therapist.$id, role: 'therapist' },
                { id: 'admin', role: 'admin' }
            );
            
            const conversation = await messagingService.getConversation(conversationId);
            const formattedMessages: Message[] = conversation.map((msg: any) => ({
                $id: msg.$id,
                senderId: msg.senderId,
                senderName: msg.senderName || (msg.senderId === 'admin' ? 'Support Team' : therapist.name),
                message: msg.content || msg.message,
                timestamp: msg.timestamp || msg.$createdAt,
                read: msg.read || false
            }));

            setMessages(formattedMessages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUnreadMessages = async () => {
        if (!therapist?.$id) return;

        try {
            const conversationId = messagingService.generateConversationId(
                { id: therapist.$id, role: 'therapist' },
                { id: 'admin', role: 'admin' }
            );
            
            const conversation = await messagingService.getConversation(conversationId);
            const unreadMessages = conversation.filter((msg: any) => 
                !msg.read && msg.senderId === 'admin'
            );
            
            const newUnreadCount = unreadMessages.length;
            
            // Show notification for new messages (PWA)
            if (newUnreadCount > unreadCount && isInPWAMode && !isOpen) {
                const latestMessage = unreadMessages[0];
                if (latestMessage) {
                    PWANotificationManager.showChatNotification({
                        title: 'New Support Message',
                        body: latestMessage.content || latestMessage.message || 'You have a new message from support',
                        tag: 'support-chat'
                    });
                }
            }
            
            setUnreadCount(newUnreadCount);
        } catch (error) {
            console.warn('Failed to check unread messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending || !therapist?.$id) return;

        setSending(true);
        try {
            const conversationId = messagingService.generateConversationId(
                { id: therapist.$id, role: 'therapist' },
                { id: 'admin', role: 'admin' }
            );

            await messagingService.sendMessage({
                conversationId,
                senderId: String(therapist.$id),
                senderName: therapist.name || 'Therapist',
                senderRole: 'therapist',
                receiverId: 'admin',
                receiverName: 'Support Team',
                receiverRole: 'admin',
                content: newMessage.trim(),
            });

            setNewMessage('');
            await fetchMessages(); // Refresh to show new message
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const toggleChat = () => {
        if (!isOpen) {
            setIsOpen(true);
            setIsMinimized(false);
            setUnreadCount(0); // Clear unread when opening
        } else {
            if (isMinimized) {
                setIsMinimized(false);
                setUnreadCount(0); // Clear unread when expanding
            } else {
                setIsMinimized(true);
            }
        }
    };

    const closeChat = () => {
        setIsOpen(false);
        setIsMinimized(true);
    };

    // Floating Chat Button (always visible in PWA)
    if (!isOpen) {
        return (
            <div className={`fixed ${isInPWAMode ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
                <button
                    onClick={toggleChat}
                    disabled={!isPremium}
                    className={`
                        relative bg-gradient-to-r from-orange-500 to-amber-500 
                        hover:from-orange-600 hover:to-amber-600 
                        text-white rounded-full shadow-2xl 
                        transition-all transform hover:scale-110 active:scale-95
                        ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}
                        ${isInPWAMode ? 'w-16 h-16 p-4' : 'w-14 h-14 p-4'}
                    `}
                    title={isPremium ? 'Open Support Chat' : 'Premium Feature - Support Chat'}
                >
                    <MessageCircle className={`${isInPWAMode ? 'w-8 h-8' : 'w-6 h-6'}`} />
                    
                    {/* Unread Badge */}
                    {unreadCount > 0 && isPremium && (
                        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-1 animate-pulse">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}

                    {/* Premium Lock Icon */}
                    {!isPremium && (
                        <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            <span className="text-xs">👑</span>
                        </div>
                    )}
                </button>
            </div>
        );
    }

    // Minimized State
    if (isMinimized) {
        return (
            <div className={`fixed ${isInPWAMode ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
                <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 p-2 flex items-center gap-2">
                    <button
                        onClick={toggleChat}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                    >
                        <MessageCircle className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Support Chat</span>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={closeChat}
                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Full Chat Window
    return (
        <div className={`fixed ${isInPWAMode ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
            <div className="bg-white rounded-lg shadow-2xl border-2 border-orange-200 w-80 h-96 flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">Support Chat</span>
                        {isPremium && (
                            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-medium">
                                Premium
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Minimize"
                        >
                            <Minimize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={closeChat}
                            className="p-1 hover:bg-white/20 rounded transition-colors"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {!isPremium ? (
                    // Premium Upgrade Prompt
                    <div className="flex-1 p-4 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                            <span className="text-2xl">👑</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2">Premium Feature</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Upgrade to Premium to access 24/7 customer support chat with 2-hour response time.
                        </p>
                        <button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-amber-600 transition-colors">
                            Upgrade to Premium
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                            {loading && messages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm">Loading messages...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-500 text-sm">
                                    No messages yet. Start a conversation with our support team!
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.$id}
                                        className={`flex ${message.senderId === therapist.$id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-lg ${
                                                message.senderId === therapist.$id
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                                            <p className={`text-xs mt-1 ${
                                                message.senderId === therapist.$id ? 'text-orange-100' : 'text-gray-500'
                                            }`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <div className="border-t p-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                                    disabled={sending}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FloatingChat;