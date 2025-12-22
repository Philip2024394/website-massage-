/**
 * Booking Reminder Service
 * Sends automated reminders to members to send thank you discounts after bookings
 */

import { databases, DATABASE_ID } from '../config';
import { messagingService } from '../../appwriteService';
import { Query } from 'appwrite';

export const BOOKINGS_COLLECTION_ID = 'bookings_collection_id';

interface Booking {
    $id: string;
    bookingId: string;
    bookingDate: string; // datetime
    startTime: string; // datetime
    duration: number; // days (1-365)
    status: string;
    paymentMethod: string;
    providerId: string;
    providerType: string; // therapist, massage-place, facial-place
    providerName: string;
    therapistId?: string;
    therapistName?: string;
    customerName?: string;
    userName?: string;
    hotelGuestName?: string;
    totalCost?: number;
    completed?: string;
    pending?: string; // Using this to track reminder sent
}

/**
 * Check if booking is completed and 1 hour past finish time
 */
export function shouldSendThankYouReminder(booking: Booking): boolean {
    // Only send for completed/paid bookings
    if (booking.status !== 'completed' && booking.paymentMethod === 'Unpaid') {
        return false;
    }

    // Don't send if already sent (using pending field as tracker)
    if (booking.pending?.includes('reminder_sent')) {
        return false;
    }

    // Calculate booking end time + 1 hour
    // Note: duration is in days, startTime is datetime
    const startDateTime = new Date(booking.startTime);
    // For massage bookings, assume 1-2 hour sessions
    // Add 2 hours to start time for massage completion + 1 hour wait
    const reminderTime = new Date(startDateTime.getTime() + 3 * 60 * 60000); // +3 hours

    // Check if current time is past reminder time
    return new Date() >= reminderTime;
}

/**
 * Send thank you discount reminder to member
 */
export async function sendThankYouReminder(
    memberId: string,
    memberType: 'therapist' | 'massage-place' | 'facial-place',
    memberName: string,
    customerId: string,
    customerName: string,
    bookingId: string
): Promise<void> {
    try {
        // Generate conversation ID
        const conversationId = messagingService.generateConversationId(
            { id: memberId, role: memberType === 'therapist' ? 'therapist' : 'place' },
            { id: 'admin', role: 'admin' }
        );

        // Send system notification message
        await messagingService.sendMessage({
            conversationId,
            senderId: 'system',
            senderType: 'admin', // Use admin type for system messages
            senderName: 'Team Indastreet',
            receiverId: memberId,
            receiverType: memberType === 'therapist' ? 'therapist' : 'place',
            receiverName: memberName,
            content: JSON.stringify({
                type: 'thankYouReminder',
                message: '💝 Sending a thank you discount will increase your loyalty and return customers!',
                action: 'sendDiscount',
                customerId,
                customerName,
                bookingId
            })
        });

        // Mark reminder as sent in booking (append to pending field)
        const booking = await databases.getDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            bookingId
        );
        
        const pendingValue = booking.pending ? `${booking.pending},reminder_sent` : 'reminder_sent';
        
        await databases.updateDocument(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            bookingId,
            { pending: pendingValue }
        );

        console.log(`✅ Thank you reminder sent to ${memberName} for booking ${bookingId}`);
    } catch (error) {
        console.error('Error sending thank you reminder:', error);
    }
}

/**
 * Process all bookings and send reminders where needed
 * Run this function periodically (e.g., every 30 minutes via cron job)
 */
export async function processThankYouReminders(): Promise<number> {
    try {
        // Get bookings from last 7 days that are completed/paid
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const response = await databases.listDocuments(
            DATABASE_ID,
            BOOKINGS_COLLECTION_ID,
            [
                Query.greaterThan('bookingDate', sevenDaysAgo.toISOString()),
                Query.limit(100)
            ]
        );

        let sentCount = 0;

        for (const booking of response.documents as unknown as Booking[]) {
            if (shouldSendThankYouReminder(booking)) {
                // Get member ID from providerId or therapistId
                const memberId = booking.therapistId || booking.providerId;
                if (!memberId) continue;

                // Determine member type - check providerType field or use booking type
                const memberType = booking.providerType === 'therapist' ? 'therapist' : 
                                 (booking as any).service === 'facial' ? 'facial-place' : 'massage-place';

                // Get customer name from available fields
                const customerName = booking.customerName || booking.userName || booking.hotelGuestName || 'Customer';
                const customerId = (booking as any).userId || (booking as any).hotelGuestId || 'guest';

                await sendThankYouReminder(
                    memberId,
                    memberType as 'therapist' | 'massage-place' | 'facial-place',
                    booking.providerName || booking.therapistName || 'Member',
                    customerId,
                    customerName,
                    booking.$id
                );

                sentCount++;
            }
        }

        console.log(`✅ Processed ${response.documents.length} bookings, sent ${sentCount} reminders`);
        return sentCount;
    } catch (error) {
        console.error('Error processing thank you reminders:', error);
        return 0;
    }
}

/**
 * Send immediate thank you reminder after payment
 * Call this when customer completes payment
 */
export async function sendImmediateThankYouReminder(
    bookingId: string,
    memberId: string,
    memberType: 'therapist' | 'massage-place' | 'facial-place',
    memberName: string,
    customerId: string,
    customerName: string
): Promise<void> {
    try {
        // Send reminder immediately after payment
        await sendThankYouReminder(
            memberId,
            memberType,
            memberName,
            customerId,
            customerName,
            bookingId
        );
    } catch (error) {
        console.error('Error sending immediate thank you reminder:', error);
    }
}
