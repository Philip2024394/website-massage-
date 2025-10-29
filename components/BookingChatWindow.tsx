/**
 * Booking Chat Window Component
 * Main chat interface with:
 * - Booking details card
 * - Real-time messaging with auto-translation
 * - 25-minute countdown
 * - Accept/Decline buttons for therapist
 * - Admin audit trail (all messages stored in Appwrite)
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatRoom, ChatMessage, ChatRoomStatus, MessageSenderType, Booking } from '../types';
import { 
    getChatMessages, 
    sendMessage, 
    subscribeToMessages,
    subscribeToChatRoom,
    updateChatRoomStatus 
} from '../lib/chatService';
import { therapistService } from '../lib/appwriteService';
import { soundService } from '../lib/soundService';
import ChatBubble from './ChatBubble';
import CountdownTimer from './CountdownTimer';

interface BookingChatWindowProps {
    chatRoom: ChatRoom;
    booking: Booking;
    currentUserId: string;
    currentUserType: 'customer' | 'therapist' | 'place';
    currentUserName: string;
    currentUserLanguage: 'en' | 'id';
    onClose: () => void;
    onAccept?: () => void;
    onDecline?: () => void;
    isFullPage?: boolean; // New prop to control full-page vs overlay mode
}

export const BookingChatWindow: React.FC<BookingChatWindowProps> = ({
    chatRoom: initialChatRoom,
    booking,
    currentUserId,
    currentUserType,
    currentUserName,
    currentUserLanguage,
    onClose,
    onAccept,
    onDecline,
    isFullPage = false
}) => {
    const [chatRoom, setChatRoom] = useState<ChatRoom>(initialChatRoom);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [selectedService, setSelectedService] = useState<'60'|'90'|'120'|null>(booking?.service || null);
    const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isCustomer = currentUserType === 'customer';
    const isTherapist = currentUserType === 'therapist' || currentUserType === 'place';

    // Determine recipient language
    const recipientLanguage = isCustomer 
        ? chatRoom.therapistLanguage 
        : chatRoom.customerLanguage;

    const translations = {
        en: {
            bookingDetails: 'Booking Details',
            pendingConfirmation: 'Pending Confirmation',
            accepted: 'Accepted',
            declined: 'Declined',
            expired: 'Expired',
            service: 'Service',
            dateTime: 'Date & Time',
            duration: 'Duration',
            price: 'Price',
            location: 'Location',
            minutes: 'minutes',
            typePlaceholder: 'Type a message...',
            send: 'Send',
            acceptBooking: 'Accept Booking',
            declineBooking: 'Decline',
            bookingExpiredMessage: 'This booking request has expired.',
            bookingAcceptedMessage: 'Booking accepted! See you soon! 🎉',
            bookingDeclinedMessage: 'Booking declined. Sorry for the inconvenience.',
        },
        id: {
            bookingDetails: 'Detail Booking',
            pendingConfirmation: 'Menunggu Konfirmasi',
            accepted: 'Diterima',
            declined: 'Ditolak',
            expired: 'Habis',
            service: 'Layanan',
            dateTime: 'Tanggal & Waktu',
            duration: 'Durasi',
            price: 'Harga',
            location: 'Lokasi',
            minutes: 'menit',
            typePlaceholder: 'Ketik pesan...',
            send: 'Kirim',
            acceptBooking: 'Terima Booking',
            declineBooking: 'Tolak',
            bookingExpiredMessage: 'Permintaan booking sudah habis waktu.',
            bookingAcceptedMessage: 'Booking diterima! Sampai jumpa! 🎉',
            bookingDeclinedMessage: 'Booking ditolak. Maaf atas ketidaknyamanannya.',
        }
    };

    const t = translations[currentUserLanguage];

    // Load messages on mount
    useEffect(() => {
        loadMessages();
    }, [chatRoom.$id]);

    // Subscribe to real-time messages
    useEffect(() => {
        if (!chatRoom.$id) return;

        const unsubscribeMessages = subscribeToMessages(chatRoom.$id, (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
            
            // Play sound if message is from other person
            if (newMessage.senderId !== currentUserId) {
                soundService.play('messageReceived');
            }
            
            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
        });

        const unsubscribeChatRoom = subscribeToChatRoom(chatRoom.$id, (updatedRoom) => {
            setChatRoom(updatedRoom);
        });

        return () => {
            unsubscribeMessages();
            unsubscribeChatRoom();
        };
    }, [chatRoom.$id, currentUserId]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async () => {
        try {
            setIsLoading(true);
            const msgs = await getChatMessages(chatRoom.$id!);
            setMessages(msgs);
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async () => {
        // Require selecting a service duration for customers before sending any message
        if (currentUserType === 'customer' && !selectedService && !booking?.service) {
            alert('Please select a service duration (60, 90 or 120 minutes) before sending a message.');
            return;
        }

        if (!messageInput.trim() || isSending) return;

        try {
            setIsSending(true);
            
            const senderType = isCustomer 
                ? MessageSenderType.Customer 
                : chatRoom.therapistType === 'therapist' 
                    ? MessageSenderType.Therapist 
                    : MessageSenderType.Place;

            await sendMessage({
                roomId: chatRoom.$id!,
                senderId: currentUserId,
                senderType,
                senderName: currentUserName,
                text: messageInput,
                senderLanguage: currentUserLanguage,
                recipientLanguage
            });

            soundService.play('messageSent');
            setMessageInput('');
            
            // Update chat room status to active if first message from therapist
            if (isTherapist && chatRoom.status === ChatRoomStatus.Pending) {
                await updateChatRoomStatus(chatRoom.$id!, ChatRoomStatus.Active);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleAcceptBooking = async () => {
        try {
            await updateChatRoomStatus(chatRoom.$id!, ChatRoomStatus.Accepted);
            soundService.play('bookingAccepted');
            onAccept?.();
        } catch (error) {
            console.error('Error accepting booking:', error);
        }
    };

    const handleDeclineBooking = async () => {
        try {
            await updateChatRoomStatus(chatRoom.$id!, ChatRoomStatus.Declined);
            soundService.play('bookingDeclined');
            onDecline?.();
        } catch (error) {
            console.error('Error declining booking:', error);
        }
    };

    const handleExpire = () => {
        updateChatRoomStatus(chatRoom.$id!, ChatRoomStatus.Expired);
    };

    // const formatCurrency = (amount: number) => {
    //     return `Rp ${amount.toLocaleString('id-ID')}`;
    // };

    const formatDateTime = (dateTime: string) => {
        return new Date(dateTime).toLocaleString(currentUserLanguage === 'en' ? 'en-US' : 'id-ID', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getStatusBadge = () => {
        const statusConfig = {
            [ChatRoomStatus.Pending]: { label: t.pendingConfirmation, color: 'bg-yellow-100 text-yellow-800' },
            [ChatRoomStatus.Active]: { label: t.pendingConfirmation, color: 'bg-blue-100 text-blue-800' },
            [ChatRoomStatus.Accepted]: { label: t.accepted, color: 'bg-green-100 text-green-800' },
            [ChatRoomStatus.Declined]: { label: t.declined, color: 'bg-red-100 text-red-800' },
            [ChatRoomStatus.Expired]: { label: t.expired, color: 'bg-gray-100 text-gray-800' },
            [ChatRoomStatus.Completed]: { label: 'Completed', color: 'bg-purple-100 text-purple-800' },
            [ChatRoomStatus.Cancelled]: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
        };

        const config = statusConfig[chatRoom.status];
        return (
            <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className={isFullPage ? 
            "bg-white w-full h-full flex flex-col overflow-hidden" : 
            "fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-0 sm:p-4 backdrop-blur-sm"
        }>
            <div className={isFullPage ?
                "bg-white w-full h-full flex flex-col overflow-hidden" :
                "bg-white w-full h-full sm:h-[90vh] sm:max-w-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp"
            }>
                
                {/* Modern Header with Branding - Hidden in full page mode */}
                {!isFullPage && (
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white shadow-lg">
                    {/* Brand Bar */}
                    <div className="px-4 py-2 border-b border-white/20 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                                <span className="text-orange-500 font-bold text-sm">I</span>
                            </div>
                            <h2 className="font-bold text-lg">
                                <span className="text-white">Inda</span>
                                <span className="text-yellow-300">Street</span>
                            </h2>
                        </div>
                        
                        <button 
                            onClick={onClose} 
                            className="text-white/90 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition"
                            title="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Chat Participant Info */}
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Profile Image */}
                            <div className="relative flex-shrink-0">
                                <img 
                                    src={isCustomer ? chatRoom.therapistPhoto : chatRoom.customerPhoto} 
                                    alt={isCustomer ? chatRoom.therapistName : chatRoom.customerName}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(isCustomer ? chatRoom.therapistName || 'T' : chatRoom.customerName)}&background=fff&color=f97316&bold=true`;
                                    }}
                                />
                                {/* Online Status Indicator */}
                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                            </div>
                            
                            {/* Name and Type */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-base truncate">
                                    {isCustomer ? chatRoom.therapistName : chatRoom.customerName}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-white/90">
                                    {isCustomer ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                            </svg>
                                            <span>Professional Therapist</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <span>Guest Customer</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Countdown Timer */}
                        <div className="flex-shrink-0 ml-2">
                            {chatRoom.status === ChatRoomStatus.Pending || chatRoom.status === ChatRoomStatus.Active ? (
                                <CountdownTimer 
                                    expiresAt={chatRoom.expiresAt} 
                                    onExpire={handleExpire}
                                    language={currentUserLanguage}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>
                )}

                {/* Booking Summary Card - Modern Design */}
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h4 className="font-bold text-gray-800">{t.bookingDetails}</h4>
                            </div>
                            {getStatusBadge()}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <span className="text-gray-500 text-xs">{t.service}</span>
                                    <p className="font-semibold text-gray-800">{booking.service} {t.minutes}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <div>
                                    <span className="text-gray-500 text-xs">{t.dateTime}</span>
                                    <p className="font-semibold text-gray-800 text-xs leading-tight">{formatDateTime(booking.startTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Package selector - user must pick a service length before messaging */}
                <div className="p-4 border-b bg-white">
                    <div className="max-w-2xl mx-auto">
                        <div className="text-sm text-gray-600 mb-2">Select a service duration to inquire or book (required before sending messages)</div>
                        <div className="flex gap-3">
                            {(['60','90','120'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={async () => {
                                        setSelectedService(d);
                                        // When a customer selects a duration, mark therapist as provisionally booked (duration + 30min travel)
                                        if (currentUserType === 'customer' && chatRoom.therapistId) {
                                            try {
                                                setIsUpdatingAvailability(true);
                                                const minutes = parseInt(d, 10);
                                                const totalMinutes = minutes + 30; // 30 min travel + service duration
                                                const bookedUntil = new Date(Date.now() + totalMinutes * 60000).toISOString();
                                                await therapistService.update(String(chatRoom.therapistId), { bookedUntil, bookedForMinutes: totalMinutes });
                                            } catch (err) {
                                                console.error('Failed to update therapist availability:', err);
                                            } finally {
                                                setIsUpdatingAvailability(false);
                                            }
                                        }
                                    }}
                                    className={`px-4 py-2 rounded-xl font-semibold transition ${selectedService === d ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                >
                                    {d} min
                                </button>
                            ))}
                        </div>
                        {isUpdatingAvailability && <div className="text-xs text-gray-500 mt-2">Updating therapist availability...</div>}
                    </div>
                </div>

                {/* Messages Area */}
                <div className={isFullPage ?
                    "flex-1 overflow-y-auto p-4 pb-24 bg-gray-50" :
                    "flex-1 overflow-y-auto p-4 bg-gray-50"
                }>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                        <>
                            {messages.map(msg => {
                                const isMessageFromCustomer = msg.senderType === 'customer';
                                return (
                                    <ChatBubble
                                        key={msg.$id}
                                        message={msg}
                                        currentUserId={currentUserId}
                                        currentUserLanguage={currentUserLanguage}
                                        senderPhoto={isMessageFromCustomer ? chatRoom.customerPhoto : chatRoom.therapistPhoto}
                                        recipientPhoto={isMessageFromCustomer ? chatRoom.customerPhoto : chatRoom.therapistPhoto}
                                    />
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Therapist Action Buttons (Accept/Decline) - Modern */}
                {isTherapist && chatRoom.status === ChatRoomStatus.Pending && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-t border-orange-100">
                        <div className="flex gap-3">
                            <button
                                onClick={handleAcceptBooking}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3.5 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {t.acceptBooking}
                            </button>
                            <button
                                onClick={handleDeclineBooking}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3.5 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {t.declineBooking}
                            </button>
                        </div>
                    </div>
                )}

                {/* Modern Input Area */}
                <div className={isFullPage ? 
                    "fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-50" :
                    "p-4 bg-white border-t border-gray-200"
                }>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder={t.typePlaceholder}
                                className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                disabled={chatRoom.status === ChatRoomStatus.Expired || chatRoom.status === ChatRoomStatus.Declined}
                            />
                            {/* Character count or emoji button could go here */}
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageInput.trim() || isSending}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3.5 rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:transform-none flex-shrink-0"
                            title={t.send}
                        >
                            {isSending ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            )}
                        </button>
                    </div>
                    
                    {/* Typing indicator (optional - can be added later) */}
                    {/* <div className="text-xs text-gray-500 mt-2 h-4">
                        {isTyping && <span className="italic">Therapist is typing...</span>}
                    </div> */}
                </div>

            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default BookingChatWindow;
