import React, { useState, useEffect, useRef } from 'react';
import { simpleChatService, simpleBookingService } from '../../../../lib/appwriteService';
import { detectPhoneNumber, getBlockedMessage } from '../../../../utils/phoneBlocker';
import PaymentCard from '../../../../components/PaymentCard';

interface Message {
    $id: string;
    $createdAt: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string; // Avatar URL or emoji
    message: string;
    messageType: 'text' | 'system' | 'booking' | 'auto-reply' | 'status-update' | 'fallback' | 'payment-card';
    isRead: boolean;
    countdown?: number; // For auto-reply countdown timer
    statusType?: 'pending' | 'confirmed' | 'completed' | 'cancelled'; // For status updates
    showActions?: boolean; // Show action buttons (cancel/browse)
    metadata?: {
        paymentCard?: {
            bankName: string;
            accountHolderName: string;
            accountNumber: string;
        };
    };
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
        type?: 'immediate' | 'scheduled';
    };
    
    // Payment info
    bankDetails?: {
        bankName: string;
        accountHolderName: string;
        accountNumber: string;
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
    const [bookingStatus, setBookingStatus] = useState<'pending' | 'accepted' | 'rejected' | null>(null);
    const [processingAction, setProcessingAction] = useState(false);
    const [showPaymentCard, setShowPaymentCard] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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

    // Handle credit card icon click - show confirmation dialog
    const handleCreditCardClick = () => {
        if (!bankDetails?.bankName || !bankDetails?.accountHolderName || !bankDetails?.accountNumber) {
            alert('Informasi bank belum lengkap. Silakan isi detail bank di halaman Pengaturan > Informasi Pembayaran.');
            return;
        }
        setShowConfirmDialog(true);
    };

    // Confirm and share payment card with customer
    const confirmSharePaymentCard = async () => {
        setShowConfirmDialog(false);
        
        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
            // Send payment card message that both can see
            await simpleChatService.sendMessage({
                conversationId,
                senderId: providerId,
                senderName: providerName,
                senderRole: 'therapist',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `💳 INFORMASI PEMBAYARAN\n\n🏦 Bank: ${bankDetails.bankName}\n👤 Nama: ${bankDetails.accountHolderName}\n💰 Nomor Rekening: ${bankDetails.accountNumber}\n\n✅ Silakan transfer ke rekening di atas setelah layanan selesai.`,
                messageType: 'payment-card',
                bookingId,
                metadata: {
                    paymentCard: {
                        bankName: bankDetails.bankName,
                        accountHolderName: bankDetails.accountHolderName,
                        accountNumber: bankDetails.accountNumber
                    }
                }
            });
            
            console.log('✅ Payment card shared successfully');
            
            // Refresh messages to show the new payment card
            loadMessages();
            
        } catch (error) {
            console.error('Error sharing payment card:', error);
            alert('Gagal membagikan informasi pembayaran');
        }
    };

    // Share payment card with customer (for auto-share)
    const sharePaymentCard = async () => {
        if (!bankDetails?.bankName || !bankDetails?.accountHolderName || !bankDetails?.accountNumber) {
            return;
        }

        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'Payment System',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `💳 INFORMASI PEMBAYARAN\n\n🏦 Bank: ${bankDetails.bankName}\n👤 Nama: ${bankDetails.accountHolderName}\n💰 Nomor Rekening: ${bankDetails.accountNumber}\n\n✅ Booking dikonfirmasi! Silakan transfer ke rekening di atas setelah layanan selesai.`,
                messageType: 'payment-card',
                bookingId,
                metadata: {
                    paymentCard: {
                        bankName: bankDetails.bankName,
                        accountHolderName: bankDetails.accountHolderName,
                        accountNumber: bankDetails.accountNumber
                    }
                }
            });
            
            console.log('✅ Payment card auto-shared successfully');
        } catch (error) {
            console.error('Error sharing payment card:', error);
        }
    };

    const handleAcceptBooking = async () => {
        if (processingAction) return;

        // Check if bank details are required for scheduled bookings
        if (bookingDetails?.type === 'scheduled' && (!bankDetails?.bankName || !bankDetails?.accountHolderName || !bankDetails?.accountNumber)) {
            alert('Untuk menerima booking terjadwal, Anda harus melengkapi informasi bank terlebih dahulu. Silakan pergi ke halaman Pengaturan > Informasi Pembayaran.');
            return;
        }

        setProcessingAction(true);
        
        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
            // Update booking status in database
            if (bookingId) {
                await simpleBookingService.updateStatus(bookingId, 'confirmed');
            }
            
            // Send confirmation message to customer
            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'System',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `✅ Booking Accepted!\n\n${providerName} has confirmed your booking.\n\nYou can now chat directly to coordinate details.`,
                messageType: 'status-update',
                bookingId,
                metadata: { statusType: 'confirmed' }
            });
            
            setBookingStatus('accepted');
            
            // Auto-share payment card for scheduled bookings
            if (bookingDetails?.type === 'scheduled' && bankDetails?.bankName) {
                setTimeout(async () => {
                    await sharePaymentCard();
                }, 1000); // Small delay after acceptance message
            }
            
            // Notify admin
            await simpleBookingService.notifyAdmin(
                `✅ Booking ${bookingId} accepted by therapist ${providerName}`,
                { bookingId, therapistId: providerId, customerId }
            );
            
            console.log('✅ Booking accepted and saved to database');
            
            // Trigger refresh of bookings list
            window.dispatchEvent(new CustomEvent('refreshBookings'));
            
        } catch (error) {
            console.error('Error accepting booking:', error);
            alert('Failed to accept booking. Please try again.');
        } finally {
            setProcessingAction(false);
        }
    };

    const handleRejectBooking = async () => {
        if (processingAction) return;
        
        // Show warning about ranking impact
        const confirmed = window.confirm(
            '⚠️ Warning: Rejecting Orders Affects Your Ranking\n\n' +
            'Rejecting bookings will lower your position in search results, ' +
            'making it harder for customers to find you.\n\n' +
            'Are you sure you want to reject this booking?'
        );
        
        if (!confirmed) return;
        
        setProcessingAction(true);
        
        try {
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
            // Update booking status
            if (bookingId) {
                await simpleBookingService.updateStatus(bookingId, 'cancelled');
            }
            
            // Send rejection message to customer
            await simpleChatService.sendMessage({
                conversationId,
                senderId: 'system',
                senderName: 'System',
                senderRole: 'admin',
                receiverId: customerId,
                receiverName: customerName,
                receiverRole: 'customer',
                message: `❌ Booking Declined\n\n${providerName} is unable to accept this booking.\n\n🔍 We are searching for an alternative therapist for you.`,
                messageType: 'status-update',
                bookingId,
                metadata: { statusType: 'cancelled' }
            });
            
            setBookingStatus('rejected');
            
            // Notify admin about rejection (will trigger ranking penalty)
            await simpleBookingService.notifyAdmin(
                `❌ Booking ${bookingId} rejected by therapist ${providerName} - Ranking penalty applied`,
                { bookingId, therapistId: providerId, customerId, action: 'rejection_penalty' }
            );
            
            console.log('❌ Booking rejected - ranking penalty triggered');
            
            // Trigger refresh of bookings list
            window.dispatchEvent(new CustomEvent('refreshBookings'));
            
            // Close chat after 3 seconds
            setTimeout(() => {
                onClose();
            }, 3000);
            
        } catch (error) {
            console.error('Error rejecting booking:', error);
            alert('Failed to reject booking. Please try again.');
        } finally {
            setProcessingAction(false);
        }
    };

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
            const originalText = newMessage.trim();
            
            // Check for phone numbers/WhatsApp in message
            const phoneCheck = detectPhoneNumber(originalText);
            if (phoneCheck.isBlocked) {
                setSending(false);
                alert(getBlockedMessage('id')); // Therapist dashboard uses Indonesian
                console.warn('🚫 Message blocked:', phoneCheck.detectedPattern);
                return;
            }
            
            const conversationId = `customer_${customerId}_therapist_${providerId}`;
            
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
                    {/* Payment Card Share Button */}
                    {bankDetails?.bankName && (
                        <button
                            onClick={handleCreditCardClick}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors group"
                            title="Bagikan Informasi Pembayaran"
                        >
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </button>
                    )}
                    
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
                        } else if (msg.messageType === 'payment-card') {
                            messageStyle = 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 text-blue-900';
                            icon = '💳';
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
                                                {msg.messageType === 'booking' ? 'New Booking Request' : 
                                                 msg.messageType === 'auto-reply' ? 'Auto Reply' :
                                                 msg.messageType === 'fallback' ? 'Alternative Options' :
                                                 msg.messageType === 'status-update' ? 'Status Update' :
                                                 msg.messageType === 'payment-card' ? 'Payment Information' : 'System'}
                                            </span>
                                        </div>
                                    )}
                                    <p className="whitespace-pre-wrap break-words text-sm">
                                        {msg.message}
                                    </p>
                                    
                                    {/* Payment card display for payment-card messages */}
                                    {msg.messageType === 'payment-card' && msg.metadata?.paymentCard && (
                                        <div className="mt-4 p-4 bg-white/50 rounded-xl border border-blue-200">
                                            <PaymentCard
                                                bankName={msg.metadata.paymentCard.bankName}
                                                accountHolderName={msg.metadata.paymentCard.accountHolderName}
                                                accountNumber={msg.metadata.paymentCard.accountNumber}
                                                size="small"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Accept/Reject buttons for booking messages */}
                                    {msg.messageType === 'booking' && !bookingStatus && (
                                        <div className="mt-4 space-y-3">
                                            {/* Ranking Warning Notice */}
                                            <div className="bg-amber-100 border-l-4 border-amber-500 p-3 rounded">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-amber-600 mt-0.5">⚠️</span>
                                                    <div className="text-xs text-amber-900">
                                                        <p className="font-bold mb-1">Important Notice</p>
                                                        <p>Rejecting bookings will lower your ranking position in search results, making it harder for customers to find you.</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleAcceptBooking}
                                                    disabled={processingAction}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-xl hover:from-green-600 hover:via-green-700 hover:to-green-800 font-bold transition-all shadow-lg shadow-green-300/50 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {processingAction ? 'Processing...' : 'Accept'}
                                                </button>
                                                <button
                                                    onClick={handleRejectBooking}
                                                    disabled={processingAction}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-br from-red-500 via-red-600 to-red-700 text-white rounded-xl hover:from-red-600 hover:via-red-700 hover:to-red-800 font-bold transition-all shadow-lg shadow-red-300/50 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    {processingAction ? 'Processing...' : 'Reject'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Show status after action */}
                                    {msg.messageType === 'booking' && bookingStatus === 'accepted' && (
                                        <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                                            <p className="text-sm text-green-900 font-bold flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Booking Accepted! You can now chat with the customer.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {msg.messageType === 'booking' && bookingStatus === 'rejected' && (
                                        <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                                            <p className="text-sm text-red-900 font-bold flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Booking Rejected. Searching for alternative therapist for customer.
                                            </p>
                                        </div>
                                    )}
                                    
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
                {bookingStatus !== 'accepted' ? (
                    /* Blocked state - Must accept booking first */
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-gray-900 mb-1">🔒 Accept Booking to Chat</p>
                                <p className="text-sm text-gray-700">
                                    You must accept the booking request above before you can chat with the customer.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Enabled state - Can chat after accepting */
                    <>
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
                        
                        {/* Payment Card Share Button */}
                        {bankDetails?.bankName && (
                            <div className="mt-2">
                                <button
                                    onClick={() => setShowPaymentCard(!showPaymentCard)}
                                    className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1"
                                >
                                    💳 {showPaymentCard ? 'Sembunyikan' : 'Bagikan Info Pembayaran'}
                                </button>
                                
                                {showPaymentCard && (
                                    <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="mb-2">
                                            <PaymentCard
                                                bankName={bankDetails.bankName}
                                                accountHolderName={bankDetails.accountHolderName}
                                                accountNumber={bankDetails.accountNumber}
                                                size="small"
                                            />
                                        </div>
                                        <button
                                            onClick={sharePaymentCard}
                                            className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
                                        >
                                            📤 Kirim ke Customer
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-1 px-1">
                            Press Enter to send • Shift+Enter for new line
                        </p>
                        <p className="text-xs text-amber-600 mt-1 px-1">
                            ⚠️ Berbagi nomor telepon atau WhatsApp tidak diperbolehkan
                        </p>
                    </>
                )}
            </div>
            
            {/* Payment Card Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden">
                        {/* Dialog Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 text-center">
                            <div className="text-3xl mb-2">💳</div>
                            <h3 className="text-xl font-bold">Bagikan Info Pembayaran</h3>
                            <p className="text-orange-100 text-sm mt-1">
                                Konfirmasi untuk mengirim detail bank ke customer
                            </p>
                        </div>
                        
                        {/* Dialog Content */}
                        <div className="p-6">
                            {/* Payment Card Preview */}
                            <div className="mb-6 flex justify-center">
                                <div className="transform scale-75">
                                    <PaymentCard
                                        bankName={bankDetails?.bankName || ''}
                                        accountHolderName={bankDetails?.accountHolderName || ''}
                                        accountNumber={bankDetails?.accountNumber || ''}
                                        size="small"
                                    />
                                </div>
                            </div>
                            
                            {/* Warning Notice */}
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="text-amber-600 mt-0.5">ℹ️</div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-amber-900 mb-1">
                                            Informasi yang akan dibagikan:
                                        </p>
                                        <ul className="text-amber-800 space-y-0.5">
                                            <li>• Nama Bank: {bankDetails?.bankName}</li>
                                            <li>• Nama Account: {bankDetails?.accountHolderName}</li>
                                            <li>• Nomor Rekening: {bankDetails?.accountNumber}</li>
                                        </ul>
                                        <p className="mt-3 text-amber-900 font-semibold">
                                            Kartu akan terlihat oleh Anda dan customer di chat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmDialog(false)}
                                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={confirmSharePaymentCard}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
                                >
                                    ✅ Konfirmasi & Kirim
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
