import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { messagingService } from '../../../../lib/appwriteService';
import { 
    ChatPersistenceManager, 
    PWABadgeManager, 
    PWANotificationManager,
    isPWAMode 
} from '../lib/pwaFeatures';
import { chatDebouncer, performanceUtils } from '../../../../lib/utils/performance';

/**
 * 💬 Enhanced Floating Chat Component with Sound Notifications
 * Always visible chat icon that minimizes to corner of screen
 * Provides quick access to support chat for therapists with MP3 notifications
 */

// Sound notification manager
class ChatSoundManager {
    private messageAudio: HTMLAudioElement | null = null;
    private enabled: boolean = true;
    
    constructor() {
        // Initialize audio with fallback
        try {
            this.messageAudio = new Audio('/sounds/notification.mp3');
            this.messageAudio.volume = 0.7;
            this.messageAudio.preload = 'auto';
        } catch (error) {
            console.warn('Audio not supported, using fallback notification');
        }
    }
    
    async playMessageSound(): Promise<void> {
        if (!this.enabled) return;
        
        try {
            if (this.messageAudio) {
                this.messageAudio.currentTime = 0;
                await this.messageAudio.play();
            } else {
                // Fallback: Web Audio API beep
                this.playBeepSound();
            }
        } catch (error) {
            console.log('Sound play failed (user interaction required):', error);
            // Try fallback beep
            this.playBeepSound();
        }
    }
    
    private playBeepSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Fallback beep also failed:', error);
        }
    }
    
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}

const soundManager = new ChatSoundManager();

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
    const [chatLocked, setChatLocked] = useState(true); // STEP 8: Chat locked by default
    const [bookingStatus, setBookingStatus] = useState<'pending' | 'accepted' | null>(null);

    const isInPWAMode = isPWA || isPWAMode();
    
    // STEP 7: REALTIME LISTENER CHECK - Subscribe to booking status changes
    useEffect(() => {
        if (!therapist?.$id) return;
        
        console.log('[FLOATING CHAT] STEP 7: Setting up realtime listener for therapist:', therapist.$id);
        
        // Import Appwrite client for realtime subscriptions
        import('../../../../lib/appwrite/config').then(({ client, APPWRITE_CONFIG }) => {
            // Subscribe to bookings for this therapist
            const channel = `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.collections.bookings}.documents`;
            console.log('[FLOATING CHAT] Subscription channel:', channel);
            
            const unsubscribe = client.subscribe(channel, (response: any) => {
                console.log('[FLOATING CHAT] ✅ Realtime event received:', {
                    type: response.events,
                    payload: response.payload
                });
                
                // Check if this booking is for this therapist
                if (response.payload?.therapistId === therapist.$id) {
                    const status = response.payload?.status;
                    console.log('[FLOATING CHAT] Booking status for this therapist:', status);
                    
                    // STEP 8: CHAT UNLOCK LOGIC CHECK
                    if (status === 'confirmed') {
                        console.log('[FLOATING CHAT] ✅ Booking confirmed - Unlocking chat');
                        console.log('[FLOATING CHAT] STEP 8: Chat UI will now be unlocked');
                        setChatLocked(false);
                        setBookingStatus('accepted');
                        
                        // Show notification that chat is now available
                        if (isInPWAMode) {
                            PWANotificationManager.showChatNotification({
                                title: 'Chat Unlocked',
                                body: 'Your booking has been confirmed. You can now chat with the customer.',
                                tag: 'chat-unlocked',
                                therapistId: therapist.$id
                            });
                        }
                    }
                }
            });
            
            console.log('[FLOATING CHAT] ✅ Realtime subscription active');
            
            return () => {
                console.log('[FLOATING CHAT] Cleaning up realtime subscription');
                unsubscribe();
            };
        }).catch((error) => {
            console.error('[FLOATING CHAT] ❌ Failed to setup realtime listener:', error);
        });
    }, [therapist?.$id, isInPWAMode]);

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

    // Listen for PWA events and service worker messages
    useEffect(() => {
        const handlePWAOpenChat = (event: CustomEvent) => {
            console.log('🔔 PWA open chat event received:', event.detail);
            setIsOpen(true);
            setIsMinimized(false);
            
            // If there's a specific message ID, scroll to it or highlight it
            if (event.detail?.messageId) {
                console.log('📨 Opening chat for message ID:', event.detail.messageId);
                // You could implement scrolling to specific message here
            }
        };

        const handleNewChatMessage = (event: CustomEvent) => {
            console.log('📨 New chat message event received:', event.detail);
            
            // Refresh messages to include the new one
            if (isOpen) {
                fetchMessages();
            } else {
                // Update unread count
                checkUnreadMessages();
            }
            
            // Show visual indicator if chat is closed
            if (!isOpen) {
                // Could add a pulsing animation or notification badge here
                console.log('💬 New message received while chat was closed');
            }
        };

        const handleVisibilityChange = (event: CustomEvent) => {
            if (event.detail.visible) {
                checkUnreadMessages();
            }
        };

        // Listen for both PWA events and service worker messages
        window.addEventListener('pwa-open-chat', handlePWAOpenChat as EventListener);
        window.addEventListener('newChatMessage', handleNewChatMessage as EventListener);
        window.addEventListener('pwa-visibility-change', handleVisibilityChange as EventListener);

        return () => {
            window.removeEventListener('pwa-open-chat', handlePWAOpenChat as EventListener);
            window.removeEventListener('newChatMessage', handleNewChatMessage as EventListener);
            window.removeEventListener('pwa-visibility-change', handleVisibilityChange as EventListener);
        };
    }, [isOpen]);

    // Load messages when chat opens
    useEffect(() => {
        if (isOpen) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    // Check for unread messages periodically
    useEffect(() => {
        checkUnreadMessages();
        const interval = setInterval(checkUnreadMessages, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

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
            
            // 🔊 SOUND NOTIFICATION: Play MP3 when new message arrives
            if (newUnreadCount > unreadCount && !isOpen) {
                console.log('🔔 New message detected! Playing notification sound...');
                await soundManager.playMessageSound();
                
                // Show browser notification if supported
                if ('Notification' in window && Notification.permission === 'granted') {
                    const latestMessage = unreadMessages[0];
                    new Notification('💬 New Support Message', {
                        body: latestMessage?.content || latestMessage?.message || 'You have a new message from admin support',
                        icon: '/icons/therapist-icon-192.png',
                        badge: '/icons/therapist-icon-96.png',
                        tag: 'therapist-chat',
                        requireInteraction: false,
                        silent: false // Allow sound from notification
                    });
                }
                
                // PWA notification for mobile
                if (isInPWAMode) {
                    const latestMessage = unreadMessages[0];
                    if (latestMessage) {
                        PWANotificationManager.showChatNotification({
                            title: '💬 New Support Message',
                            body: latestMessage.content || latestMessage.message || 'You have a new message from support',
                            tag: 'support-chat',
                            messageId: latestMessage.$id,
                            therapistId: therapist.$id
                        });
                    }
                }
            }
            
            // 📛 BADGE UPDATE: Update red circle counter
            setUnreadCount(newUnreadCount);
            
            // Update PWA badge on app icon
            if (isInPWAMode) {
                PWABadgeManager.updateBadge(newUnreadCount);
            }
            
            console.log(`📨 Unread messages: ${newUnreadCount}`);
            
        } catch (error) {
            console.warn('Failed to check unread messages:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || sending || !therapist?.$id) return;

        try {
            // Set loading state immediately
            setSending(true);
            console.log('[FLOATING CHAT] Message sending started');

            // PERFORMANCE ENHANCEMENT: Debounce message sending to prevent duplicates
            const messageId = `${therapist.$id}-${Date.now()}`;
            
            await chatDebouncer.debounceChatInit(messageId, async () => {
                const conversationId = messagingService.generateConversationId(
                    { id: therapist.$id, role: 'therapist' },
                    { id: 'admin', role: 'admin' }
                );

                await messagingService.sendMessage({
                    conversationId,
                    senderId: String(therapist.$id),
                    senderName: therapist.name || 'Therapist',
                    senderType: 'therapist', // Required: specify sender type for therapist
                    recipientId: 'admin',  // Fixed: was 'receiverId', now matches schema
                    recipientName: 'Admin',
                    recipientType: 'admin',
                    content: newMessage.trim(),
                    type: 'text',
                });

                setNewMessage('');
                await fetchMessages(); // Refresh to show new message
                
                return { success: true };
            }, { debounceTime: 500 }); // 500ms debounce for messages

            console.log('[FLOATING CHAT] Message sent successfully');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            // CRITICAL: Always reset loading state
            setSending(false);
            console.log('[FLOATING CHAT] Message sending completed - loading state reset');
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
                    className={`
                        relative bg-black/20 backdrop-blur-md border border-white/10
                        text-white rounded-2xl shadow-2xl
                        transition-all duration-500 transform 
                        hover:scale-110 hover:bg-black/40 hover:border-white/20
                        active:scale-95 active:bg-black/60
                        ${isInPWAMode ? 'w-16 h-16 p-4' : 'w-14 h-14 p-4'}
                        ${unreadCount > 0 ? 'animate-pulse' : ''}
                        flex items-center justify-center
                        group overflow-hidden
                        before:absolute before:inset-0 before:bg-gradient-to-br 
                        before:from-white/5 before:to-transparent before:rounded-2xl
                        after:absolute after:inset-0 after:bg-gradient-to-t 
                        after:from-black/20 after:to-transparent after:rounded-2xl
                    `}
                    style={{
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: `
                            0 8px 32px rgba(0, 0, 0, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                        `
                    }}
                    title={unreadCount > 0 ? `${unreadCount} new message${unreadCount === 1 ? '' : 's'}` : "Open Support Chat"}
                >
                    <MessageCircle className={`${isInPWAMode ? 'w-8 h-8' : 'w-6 h-6'} relative z-10 drop-shadow-lg`} />
                    
                    {/* Glass shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Enhanced Unread Badge with glass effect */}
                    {unreadCount > 0 && (
                        <div className="absolute -top-3 -right-3 bg-red-500/90 backdrop-blur-sm border border-red-400/50 text-white text-xs font-bold rounded-full min-w-[28px] h-7 flex items-center justify-center px-2 animate-bounce shadow-lg">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-300/30 to-transparent rounded-full"></div>
                            <span className="relative z-10 drop-shadow-sm">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        </div>
                    )}

                    {/* Pulse Ring for New Messages */}
                    {unreadCount > 0 && (
                        <div className="absolute inset-0 rounded-2xl border-4 border-red-400/30 animate-ping opacity-30"></div>
                    )}
                </button>
            </div>
        );
    }

    // Minimized State
    if (isMinimized) {
        return (
            <div className={`fixed ${isInPWAMode ? 'bottom-4 right-4' : 'bottom-6 right-6'} z-50`}>
                <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-3 flex items-center gap-3 min-w-[180px]"
                    style={{
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}>
                    <button
                        onClick={toggleChat}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors flex-1 group"
                    >
                        <div className="relative">
                            <MessageCircle className="w-5 h-5 text-white drop-shadow-lg" />
                            {/* Small badge on icon */}
                            {unreadCount > 0 && (
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500/90 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-xs border border-red-400/50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-300/30 to-transparent rounded-full"></div>
                                    <span className="relative z-10 text-white drop-shadow-sm">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-white">Support Chat</span>
                            {unreadCount > 0 && (
                                <span className="text-xs text-red-300 font-semibold">
                                    {unreadCount} new message{unreadCount === 1 ? '' : 's'}
                                </span>
                            )}
                        </div>
                        
                        {/* Large badge counter */}
                        {unreadCount > 0 && (
                            <span className="bg-red-500/90 backdrop-blur-sm border border-red-400/50 text-white text-sm rounded-full px-3 py-1 min-w-[28px] h-7 flex items-center justify-center font-bold animate-pulse ml-auto shadow-lg">
                                <div className="absolute inset-0 bg-gradient-to-br from-red-300/30 to-transparent rounded-full"></div>
                                <span className="relative z-10 drop-shadow-sm">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            </span>
                        )}
                    </button>
                    <button
                        onClick={closeChat}
                        className="p-2 hover:bg-red-500/20 rounded-full text-white hover:text-red-300 transition-colors"
                        title="Close chat"
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
                {/* STEP 8: Show locked state */}
                {chatLocked && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-75 rounded-lg flex items-center justify-center z-10">
                        <div className="bg-white p-6 rounded-lg text-center max-w-xs">
                            <div className="text-4xl mb-3">🔒</div>
                            <h3 className="font-bold text-gray-800 mb-2">Chat Locked</h3>
                            <p className="text-sm text-gray-600">
                                Chat will unlock when customer accepts your booking.
                                Status: <span className="font-semibold">{bookingStatus || 'pending'}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-3">
                                ✅ STEP 8 validation active
                            </p>
                        </div>
                    </div>
                )}
                
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-t-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium">Support Chat</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="px-2 py-1 hover:bg-white/20 rounded transition-colors text-xs font-bold"
                            title="Minimize"
                        >
                            _
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
            </div>
        </div>
    );
};

export default FloatingChat;