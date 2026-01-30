/**
 * 🔗 CHAT DATA FLOW SERVICE
 * 
 * Ensures synchronized communication between user booking chat and therapist booking chat.
 * Provides standardized conversation ID format and data flow management.
 * 
 * CRITICAL: This service maintains consistency between:
 * - PersistentChatProvider (user side) 
 * - TherapistBookingsPage + ChatWindow (therapist side)
 * - Places booking chat windows
 */

import { simpleChatService } from '../simpleChatService';

export interface BookingChatParticipants {
    customerId: string;
    customerName: string;
    providerId: string; // therapist or place ID  
    providerName: string;
    providerType: 'therapist' | 'place';
}

export interface BookingChatMessage {
    messageId: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    senderRole: 'customer' | 'therapist' | 'place' | 'admin' | 'system';
    receiverId: string;
    receiverName: string;
    receiverRole: 'customer' | 'therapist' | 'place' | 'admin' | 'system';
    message: string;
    messageType: 'text' | 'system' | 'booking' | 'auto-reply' | 'status-update' | 'fallback' | 'payment-card';
    bookingId?: string;
    timestamp: string;
    isRead: boolean;
    metadata?: Record<string, any>;
}

/**
 * Chat Data Flow Service
 * Standardizes communication between user and provider chat systems
 */
export const chatDataFlowService = {
    /**
     * Generate standardized conversation ID 
     * CRITICAL: Must match format used in PersistentChatProvider
     * Format: ${customerId}_${providerId}
     */
    generateConversationId(customerId: string, providerId: string): string {
        return `${customerId}_${providerId}`;
    },

    /**
     * Send booking request message from customer to provider
     * This creates the initial booking request that appears in both chat windows
     */
    async sendBookingRequest(
        participants: BookingChatParticipants,
        bookingDetails: {
            bookingId: string;
            serviceType: string;
            duration: number;
            price: number;
            location: string;
            date: string;
            time: string;
            bookingType: 'immediate' | 'scheduled';
        }
    ): Promise<BookingChatMessage> {
        const conversationId = this.generateConversationId(participants.customerId, participants.providerId);
        
        const bookingMessage = `🎯 New Booking Request

📋 Service: ${bookingDetails.serviceType}
⏱️ Duration: ${bookingDetails.duration} minutes  
💰 Price: IDR ${bookingDetails.price.toLocaleString()}
📍 Location: ${bookingDetails.location}
📅 Date: ${bookingDetails.date}
🕒 Time: ${bookingDetails.time}
🔖 Type: ${bookingDetails.bookingType === 'immediate' ? 'Book Now' : 'Scheduled'}

Booking ID: ${bookingDetails.bookingId}

⏳ Please respond within 5 minutes to confirm this booking request.`;

        const chatMessage = await simpleChatService.sendMessage({
            conversationId,
            senderId: participants.customerId,
            senderName: participants.customerName, 
            senderRole: 'customer',
            receiverId: participants.providerId,
            receiverName: participants.providerName,
            receiverRole: participants.providerType,
            message: bookingMessage,
            messageType: 'booking',
            bookingId: bookingDetails.bookingId,
            metadata: {
                bookingType: bookingDetails.bookingType,
                duration: bookingDetails.duration,
                price: bookingDetails.price,
                location: bookingDetails.location,
                statusType: 'booking_request'
            }
        });

        console.log('✅ [ChatDataFlow] Booking request sent to conversation:', conversationId);
        return this.formatChatMessage(chatMessage);
    },

    /**
     * Send booking acceptance from provider to customer
     * This notifies the customer that their booking has been accepted
     */
    async sendBookingAcceptance(
        participants: BookingChatParticipants,
        bookingId: string
    ): Promise<BookingChatMessage> {
        const conversationId = this.generateConversationId(participants.customerId, participants.providerId);
        
        const acceptanceMessage = `✅ Booking Confirmed!

Your booking has been accepted by ${participants.providerName}.

Booking ID: ${bookingId}

You can now chat directly to coordinate details. Thank you for choosing our service! 🙏`;

        const chatMessage = await simpleChatService.sendMessage({
            conversationId,
            senderId: participants.providerId,
            senderName: participants.providerName,
            senderRole: participants.providerType,
            receiverId: participants.customerId, 
            receiverName: participants.customerName,
            receiverRole: 'customer',
            message: acceptanceMessage,
            messageType: 'status-update',
            bookingId,
            metadata: {
                statusType: 'confirmed',
                actionBy: 'provider'
            }
        });

        console.log('✅ [ChatDataFlow] Booking acceptance sent to conversation:', conversationId);
        return this.formatChatMessage(chatMessage);
    },

    /**
     * Send booking rejection from provider to customer
     * This notifies the customer that their booking has been rejected
     */
    async sendBookingRejection(
        participants: BookingChatParticipants,
        bookingId: string,
        reason?: string
    ): Promise<BookingChatMessage> {
        const conversationId = this.generateConversationId(participants.customerId, participants.providerId);
        
        const rejectionMessage = `❌ Booking Not Available

Unfortunately, ${participants.providerName} cannot accept your booking request.

Booking ID: ${bookingId}

${reason ? `Reason: ${reason}` : ''}

Please try booking with another provider or select a different time. We apologize for any inconvenience.`;

        const chatMessage = await simpleChatService.sendMessage({
            conversationId,
            senderId: participants.providerId,
            senderName: participants.providerName,
            senderRole: participants.providerType,
            receiverId: participants.customerId,
            receiverName: participants.customerName, 
            receiverRole: 'customer',
            message: rejectionMessage,
            messageType: 'status-update',
            bookingId,
            metadata: {
                statusType: 'rejected',
                actionBy: 'provider',
                reason: reason || ''
            }
        });

        console.log('✅ [ChatDataFlow] Booking rejection sent to conversation:', conversationId);
        return this.formatChatMessage(chatMessage);
    },

    /**
     * Subscribe to conversation messages for real-time updates
     * Both user and provider chat windows use this for live sync
     */
    subscribeToConversation(
        customerId: string,
        providerId: string,
        callback: (message: BookingChatMessage) => void
    ): () => void {
        const conversationId = this.generateConversationId(customerId, providerId);
        
        console.log('🔔 [ChatDataFlow] Setting up conversation subscription:', conversationId);
        
        return simpleChatService.subscribeToMessages(conversationId, (rawMessage) => {
            const formattedMessage = this.formatChatMessage(rawMessage);
            callback(formattedMessage);
        });
    },

    /**
     * Get conversation history for both user and provider
     * Ensures both sides see the same messages
     */
    async getConversationHistory(
        customerId: string,
        providerId: string
    ): Promise<BookingChatMessage[]> {
        const conversationId = this.generateConversationId(customerId, providerId);
        
        console.log('📋 [ChatDataFlow] Loading conversation history:', conversationId);
        
        const messages = await simpleChatService.getMessages(conversationId);
        return messages.map(msg => this.formatChatMessage(msg));
    }

    /**
     * Format raw chat message to standardized BookingChatMessage
     */
    private formatChatMessage(rawMessage: any): BookingChatMessage {
        return {
            messageId: rawMessage.$id || rawMessage.messageId,
            conversationId: rawMessage.conversationId,
            senderId: rawMessage.senderId,
            senderName: rawMessage.senderName,
            senderRole: rawMessage.senderRole,
            receiverId: rawMessage.receiverId || rawMessage.recipientId,
            receiverName: rawMessage.receiverName,
            receiverRole: rawMessage.receiverRole,
            message: rawMessage.message || rawMessage.content,
            messageType: rawMessage.messageType || 'text',
            bookingId: rawMessage.bookingId,
            timestamp: rawMessage.$createdAt || rawMessage.createdAt || rawMessage.sentAt,
            isRead: rawMessage.isRead || false,
            metadata: rawMessage.metadata ? (typeof rawMessage.metadata === 'string' ? JSON.parse(rawMessage.metadata) : rawMessage.metadata) : {}
        };
    },

    /**
     * Validate conversation ID format
     * Ensures consistent format across all systems
     */
    validateConversationId(conversationId: string): boolean {
        // Format should be: ${customerId}_${providerId}
        const parts = conversationId.split('_');
        return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
    },

    /**
     * Extract participants from conversation ID
     */
    extractParticipants(conversationId: string): { customerId: string; providerId: string } | null {
        if (!this.validateConversationId(conversationId)) {
            return null;
        }
        
        const [customerId, providerId] = conversationId.split('_');
        return { customerId, providerId };
    }
};

/**
 * Export default for easy importing
 */
export default chatDataFlowService;