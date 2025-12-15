import React, { useState, useEffect, useRef } from 'react';
import { simpleChatService, simpleBookingService } from '../../../../lib/appwriteService';

interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string; // Avatar URL or emoji
    message: string;
    messageType: 'text' | 'system' | 'booking' | 'auto-reply' | 'status-update' | 'fallback';
    isRead: boolean;
    countdown?: number; // For auto-reply countdown timer
    statusType?: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // For status updates
    showActions?: boolean; // Show action buttons (cancel/browse)
}

interface ChatWindowProps {
    // Provider info
    providerId: string;
    providerRole: 'therapist' | 'place';
    providerName: string;
    
    // Customer info (from booking)
    customerId: string;
    customerName: string;
    
    // Booking info
    bookingId?: string;
    bookingDetails?: {
        date?: string;
        duration?: number;
        price?: number;
    };
    
    // UI props
    isOpen: boolean;
    onClose: () => void;
}

// Supported languages with flags (unused - language is globally managed)
// const LANGUAGES = [
//     { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
//     { code: 'en', name: 'English', flag: '🇬🇧' },
//     { code: 'zh', name: '中文', flag: '🇨🇳' },
//     { code: 'ja', name: '日本語', flag: '🇯🇵' },
//     { code: 'ko', name: '한국어', flag: '🇰🇷' },
//     { code: 'ar', name: 'العربية', flag: '🇸🇦' },
//     { code: 'fr', name: 'Français', flag: '🇫🇷' },
//     { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
//     { code: 'es', name: 'Español', flag: '🇪🇸' },
//     { code: 'ru', name: 'Русский', flag: '🇷🇺' },
//     { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
// ];

/**
 * ChatWindow - Lightweight chat for therapist-customer communication
 * 
 * Opens when clicking Chat button on confirmed bookings
 * Shows customer info and allows direct messaging
 * Unread badge counter and notifications
 */
// Countdown Timer Component
const CountdownTimer: React.FC<{ seconds: number }> = ({ seconds: initialSeconds }) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
            ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
    );
};

export default function ChatWindow({
    providerId,
    providerRole,
    providerName,
    customerId,
    customerName,
    bookingId,
    bookingDetails,
    isOpen,
    onClose
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [unreadCount] = useState(0);
    const [customerAvatar, setCustomerAvatar] = useState<string | null>(null); // Track customer's avatar
    // Language is now managed globally - therapist dashboard uses Indonesian by default
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    // const therapistLanguage = 'id'; // Therapist dashboard uses Indonesian (unused)

    // Load initial messages
    useEffect(() => {
        if (isOpen) {
            loadMessages();
        }
    }, [isOpen, bookingId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
            // Try to fetch from database first
            const dbMessages = await simpleChatService.getMessages(conversationId);
            
            if (dbMessages.length > 0) {
                // Use database messages
                const formatted = dbMessages.map(msg => ({
                    $id: msg.$id || Date.now().toString(),
                    $createdAt: msg.$createdAt || new Date().toISOString(),
                    senderId: msg.senderId,
                    senderName: msg.senderName,
                    senderAvatar: (msg as any).senderAvatar || (msg as any).receiverAvatar, // Get avatar from message
                    message: msg.message,
                    messageType: msg.messageType as any,
                    isRead: msg.isRead,
                    countdown: msg.messageType === 'auto-reply' ? 300 : undefined,
                    statusType: JSON.parse(msg.metadata || '{}').statusType,
                    showActions: JSON.parse(msg.metadata || '{}').showActions
                }));
                
                // Extract customer avatar from messages (look for first non-system message with avatar)
                const customerMsg = dbMessages.find(msg => 
                    msg.senderId === customerId && ((msg as any).senderAvatar || (msg as any).receiverAvatar)
                );
                if (customerMsg) {
                    setCustomerAvatar((customerMsg as any).senderAvatar || (customerMsg as any).receiverAvatar);
                }
                
                setMessages(formatted);
            } else {
                // First time - create booking messages
                await simpleChatService.sendMessage({
                    conversationId,
                    senderId: 'system',
                    senderName: 'System',
                    senderRole: 'admin',
                    receiverId: customerId,
                    receiverName: customerName,
                    receiverRole: 'customer',
                    message: `Booking request created:\n📅 ${bookingDetails?.date || new Date().toLocaleString()}\n⏱️ Duration: ${bookingDetails?.duration || 60} minutes\n💰 Price: Rp ${bookingDetails?.price?.toLocaleString() || '0'}\n📍 ${providerRole === 'therapist' ? 'Home/Hotel Service' : 'Visit Location'}`,
                    messageType: 'booking',
                    bookingId
                });

                await simpleChatService.sendMessage({
                    conversationId,
                    senderId: 'system',
                    senderName: 'Auto Reply',
                    senderRole: 'admin',
                    receiverId: customerId,
                    receiverName: customerName,
                    receiverRole: 'customer',
                    message: `${providerName} has received your booking requirement and will reply within 5 minutes`,
                    messageType: 'auto-reply',
                    bookingId,
                    metadata: { countdown: 300 }
                });
                
                // Reload messages after creation
                const newMessages = await simpleChatService.getMessages(conversationId);
                const formatted = newMessages.map(msg => ({
                    $id: msg.$id || Date.now().toString(),
                    $createdAt: msg.$createdAt || new Date().toISOString(),
                    senderId: msg.senderId,
                    senderName: msg.senderName,
                    senderAvatar: (msg as any).senderAvatar || (msg as any).receiverAvatar, // Get avatar from message
                    message: msg.message,
                    messageType: msg.messageType as any,
                    isRead: msg.isRead,
                    countdown: msg.messageType === 'auto-reply' ? 300 : undefined
                }));
                setMessages(formatted);
            }

            // Subscribe to real-time updates
            const unsubscribe = simpleChatService.subscribeToMessages(conversationId, (newMsg) => {
                setMessages(prev => {
                    const exists = prev.some(m => m.$id === newMsg.$id);
                    if (!exists) {
                        // Play notification sound for new customer messages (not system messages)
                        if (newMsg.senderId !== 'system' && newMsg.senderId !== providerId) {
                            try {
                                const audio = new Audio('/sounds/message-notification.mp3');
                                audio.volume = 0.7;
                                audio.play().catch(err => console.warn('Failed to play message sound:', err));
                                console.log('🔊 New message notification played');
                            } catch (err) {
                                console.warn('Audio playback error:', err);
                            }
                        }
                        
                        return [...prev, {
                            $id: newMsg.$id || '',
                            $createdAt: newMsg.$createdAt || new Date().toISOString(),
                            senderId: newMsg.senderId,
                            senderName: newMsg.senderName,
                            message: newMsg.message,
                            messageType: newMsg.messageType as any,
                            isRead: newMsg.isRead
                        }];
                    }
                    return prev;
                });
            });

            // Cleanup on unmount
            return () => unsubscribe();

        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // Unused function - kept for future countdown feature
    // const handleCountdownExpiry = async () => {
    //     try {
    //         const conversationId = `customer_${customerId}_therapist_${providerId}`;
    //         
    //         // Send fallback message to database
    //         await simpleChatService.sendMessage({
    //             conversationId,
    //             senderId: 'system',
    //             senderName: 'System',
    //             senderRole: 'admin',
    //             receiverId: customerId,
    //             receiverName: customerName,
    //             receiverRole: 'customer',
    //             message: `${providerName} is currently booked.\n\n🔍 We are searching for the next best match therapist for you.\n\n✨ You will be notified once we find an available therapist.`,
    //             messageType: 'fallback',
    //             bookingId,
    //             metadata: { showActions: true, statusType: 'pending' }
    //         });
    //         
    //         // Notify admin about expired countdown
    //         await simpleBookingService.notifyAdmin(
    //             `⏰ Booking ${bookingId} - Therapist ${providerName} did not respond within 5 minutes`,
    //             { bookingId, therapistId: providerId, customerId }
    //         );
    //         
    //         console.log('✅ Countdown expired - fallback message sent, admin notified');
    //     } catch (error) {
    //         console.error('Error handling countdown expiry:', error);
    //     }
    // };

    const handleCancelBooking = async () => {
        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
            // Send cancel message to database
            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'System',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: '❌ Booking request cancelled by customer',
                messageType: 'status-update',
                bookingId,
                metadata: { statusType: 'cancelled' }
            });
            
            // Update booking status
            if (bookingId) {
                await simpleBookingService.updateStatus(bookingId, 'cancelled');
            }
            
            // Notify admin
            await simpleBookingService.notifyAdmin(
                `❌ Booking ${bookingId} cancelled by customer ${customerName}`,
                { bookingId, therapistId: providerId, customerId }
            );
            
            console.log('✅ Booking cancelled and saved to database');
            
            // Close chat after 2 seconds
            setTimeout(() => {
                onClose();
                // Redirect to directory
                window.location.href = '/therapists';
            }, 2000);
        } catch (error) {
            console.error('Error cancelling booking:', error);
        }
    };

    // Translation function using Google Translate API (unused - kept for future feature)
    // const translateText = async (text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> => {
    //     try {
    //         // TODO: Replace with your Google Cloud API key
    //         const API_KEY = process.env.VITE_GOOGLE_TRANSLATE_API_KEY || 'YOUR_API_KEY';
    //         
    //         // For demo, return text as-is with [Translated] marker
    //         // In production, call actual Google Translate API
    //         if (API_KEY === 'YOUR_API_KEY') {
    //             console.log(`[Translation Demo] ${sourceLang} → ${targetLang}: ${text}`);
    //             return text; // Return original text in demo mode
    //         }
    // 
    //         const response = await fetch(
    //             `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
    //             {
    //                 method: 'POST',
    //                 headers: { 'Content-Type': 'application/json' },
    //                 body: JSON.stringify({
    //                     q: text,
    //                     target: targetLang,
    //                     source: sourceLang === 'auto' ? undefined : sourceLang,
    //                     format: 'text'
    //                 })
    //             }
    //         );
    // 
    //         const data = await response.json();
    //         return data.data.translations[0].translatedText;
    //     } catch (error) {
    //         console.error('Translation error:', error);
    //         return text; // Return original if translation fails
    //     }
    // };

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);

        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            const originalText = newMessage.trim();
            
            // Show translation notice on first non-Indonesian message
            if (false) { // Translation notice disabled - using global language
                await simpleChatService.sendMessage({
                    conversationId,
                    senderId: 'system',
                    senderName: 'Translation Notice',
                    senderRole: 'admin',
                    receiverId: customerId,
                    receiverName: customerName,
                    receiverRole: 'customer',
                    message: `🌐 Auto-translation is enabled.\n\nMessages are being translated.\n\n⚠️ Please note: Translations may have slight inaccuracies.`,
                    messageType: 'system',
                    bookingId
                });
                // Translation notice removed
            }

            // No translation needed - therapist dashboard uses Indonesian
            const translatedForTherapist = originalText;

            // Save message to database
            await simpleChatService.sendMessage({
                conversationId,
                senderId: providerId,
                senderName: providerName,
                senderRole: 'therapist',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: originalText,
                messageType: 'text',
                bookingId,
                metadata: {
                    translated: translatedForTherapist,
                    language: 'id'
                }
            });

            setNewMessage('');
            console.log('✅ Message saved to database');
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    // Function to add booking status update (called externally or via webhook)
    const addStatusUpdate = (status: 'pending' | 'confirmed' | 'completed' | 'cancelled', details?: string) => {
        const statusMessages = {
            pending: '⏳ Your booking is pending confirmation',
            confirmed: '✅ Your booking has been confirmed! The therapist will arrive at the scheduled time.',
            completed: '🎉 Booking completed! Thank you for using our service. Please rate your experience.',
            cancelled: '❌ This booking has been cancelled.'
        };

        const statusUpdate: Message = {
            $id: Date.now().toString(),
            $createdAt: new Date().toISOString(),
            senderId: 'system',
            senderName: 'System',
            message: details || statusMessages[status],
            messageType: 'status-update',
            isRead: false,
            statusType: status
        };

        setMessages(prev => [...prev, statusUpdate]);
        
        // TODO: Save to Appwrite and notify admin
        console.log('Status update:', statusUpdate);
    };
    
    // Expose addStatusUpdate for external use
    (window as any).addBookingStatusUpdate = addStatusUpdate;

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                            {customerAvatar ? (
                                customerAvatar.startsWith('http') ? (
                                    <img 
                                        src={customerAvatar}
                                        alt={customerName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-2xl">{customerAvatar}</span>
                                )
                            ) : (
                                <img 
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customerName)}&background=f97316&color=fff&size=128`}
                                    alt={customerName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.innerHTML = customerName.charAt(0).toUpperCase();
                                    }}
                                />
                            )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold">{customerName}</h3>
                        <p className="text-xs text-orange-100">Customer</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    {/* Language now managed globally */}
                    
                    {/* Unread Badge */}
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold">
                            {unreadCount}
                        </span>
                    )}
                    
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Booking Info Banner */}
            {bookingDetails && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm">
                    <div className="flex items-center justify-between text-amber-900">
                        <span>📅 Booking #{bookingId?.slice(-6)}</span>
                        <span>{bookingDetails.duration || 60} min • Rp {bookingDetails.price?.toLocaleString()}</span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <p className="font-medium">Start chatting with {customerName}</p>
                        <p className="text-xs mt-1">Messages appear here in real-time</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const isOwnMessage = msg.senderId === providerId;
                        const isSystemMessage = msg.messageType === 'system' || msg.messageType === 'booking' || msg.messageType === 'status-update';
                        const isAutoReply = msg.messageType === 'auto-reply';

                        // Determine message styling based on type
                        let messageStyle = '';
                        let icon = '';
                        
                        if (msg.messageType === 'booking') {
                            messageStyle = 'bg-blue-50 border-2 border-blue-200 text-blue-900';
                            icon = '📋';
                        } else if (msg.messageType === 'auto-reply') {
                            messageStyle = 'bg-orange-50 border-2 border-orange-200 text-orange-900';
                            icon = '🤖';
                        } else if (msg.messageType === 'fallback') {
                            messageStyle = 'bg-amber-50 border-2 border-amber-300 text-amber-900';
                            icon = '⚠️';
                        } else if (msg.messageType === 'status-update') {
                            const statusColors = {
                                pending: 'bg-yellow-50 border-2 border-yellow-200 text-yellow-900',
                                confirmed: 'bg-green-50 border-2 border-green-200 text-green-900',
                                completed: 'bg-purple-50 border-2 border-purple-200 text-purple-900',
                                cancelled: 'bg-red-50 border-2 border-red-200 text-red-900'
                            };
                            messageStyle = statusColors[msg.statusType || 'pending'];
                            icon = msg.statusType === 'confirmed' ? '✅' : msg.statusType === 'completed' ? '🎉' : msg.statusType === 'cancelled' ? '❌' : '⏳';
                        } else if (isSystemMessage) {
                            messageStyle = 'bg-gray-200 text-gray-700';
                            icon = 'ℹ️';
                        } else if (isOwnMessage) {
                            messageStyle = 'bg-orange-500 text-white';
                        } else {
                            messageStyle = 'bg-white text-gray-900 shadow-sm';
                        }

                        return (
                            <div
                                key={msg.$id}
                                className={`flex gap-2 items-end ${isOwnMessage && !isSystemMessage && !isAutoReply ? 'justify-end' : isSystemMessage || isAutoReply ? 'justify-center' : 'justify-start'}`}
                            >
                                {/* Customer avatar on left for customer messages (not system/auto) */}
                                {!isOwnMessage && !isSystemMessage && !isAutoReply && (
                                    <div className="flex-shrink-0 mb-1">
                                        {msg.senderAvatar && msg.senderAvatar.startsWith('http') ? (
                                            <img 
                                                src={msg.senderAvatar} 
                                                alt={msg.senderName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-lg">{msg.senderAvatar || '👤'}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                
                                <div
                                    className={`${isSystemMessage || isAutoReply ? 'max-w-[90%]' : 'max-w-[75%]'} rounded-2xl px-4 py-3 ${messageStyle}`}
                                >
                                    {(isSystemMessage || isAutoReply || msg.messageType === 'fallback') && (
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{icon}</span>
                                            <span className="font-bold text-xs uppercase tracking-wide">
                                                {msg.messageType === 'booking' ? 'Booking Info' : 
                                                 msg.messageType === 'auto-reply' ? 'Auto Reply' :
                                                 msg.messageType === 'fallback' ? 'Alternative Options' :
                                                 msg.messageType === 'status-update' ? 'Status Update' : 'System'}
                                            </span>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap break-words text-sm">
                                        {msg.message}
                                    </p>
                                    {isAutoReply && msg.countdown && (
                                        <div className="mt-2 flex justify-center">
                                            <CountdownTimer seconds={msg.countdown} />
                                        </div>
                                    )}
                                    {msg.showActions && (
                                        <div className="mt-4 flex flex-col gap-2">
                                            <button
                                                onClick={handleCancelBooking}
                                                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancel & Browse Directory
                                            </button>
                                            <button
                                                onClick={onClose}
                                                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Wait for Match
                                            </button>
                                        </div>
                                    )}
                                    {!isSystemMessage && !isAutoReply && !msg.showActions && (
                                        <p className={`text-xs mt-1 ${
                                            isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                                        }`}>
                                            {formatTime(msg.$createdAt)}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Provider avatar on right for provider messages */}
                                {isOwnMessage && !isSystemMessage && !isAutoReply && (
                                    <div className="flex-shrink-0 mb-1">
                                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-xs">{providerName.charAt(0).toUpperCase()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg">
                <div className="flex items-end space-x-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
                        rows={2}
                        disabled={sending}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <p className="text-xs text-gray-500 mt-1 px-1">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
