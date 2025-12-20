import { useState, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
// @ts-ignore - service may not be fully implemented
import { messagingService } from '../lib/appwriteService';

export const useChatMessages = (
    chatRoomId: string,
    isRegistered: boolean,
    customerId: string,
    bookingId?: string
) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [lastMessageCount, setLastMessageCount] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio notification
    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3');
    }, []);

    // Load messages function
    const loadMessages = async () => {
        if (!chatRoomId) return;

        try {
            // @ts-expect-error - service method may not exist yet
            const fetchedMessages = await messagingService.getConversationMessages(chatRoomId);
            setMessages(fetchedMessages as Message[]);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    // Load messages after chat activation
    useEffect(() => {
        if (!chatRoomId || !isRegistered) return;

        // Auto-set customer ID for scheduled bookings
        if (bookingId && !customerId) {
            // This would be handled by parent component
        }

        loadMessages();
        
        // Poll for new messages every 3 seconds
        const interval = setInterval(loadMessages, 3000);
        
        return () => clearInterval(interval);
    }, [chatRoomId, isRegistered, bookingId, customerId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Play notification sound for new messages
    const playNotification = () => {
        audioRef.current?.play().catch(() => {});
    };

    return {
        messages,
        lastMessageCount,
        setLastMessageCount,
        messagesEndRef,
        loadMessages,
        playNotification
    };
};
