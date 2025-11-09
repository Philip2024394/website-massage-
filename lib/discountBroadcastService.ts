import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { Query } from 'appwrite';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const CHAT_ROOMS_COLLECTION_ID = APPWRITE_CONFIG.collections.chatRooms || '';
const NOTIFICATIONS_COLLECTION_ID = APPWRITE_CONFIG.collections.notifications || '';
const USERS_COLLECTION_ID = APPWRITE_CONFIG.collections.users || '';

/**
 * Broadcast discount notification to all customers who have chatted with the provider
 */
export const broadcastDiscountToCustomers = async (
    providerId: string,
    providerName: string,
    providerType: 'therapist' | 'place',
    percentage: number,
    duration: number
): Promise<{ success: boolean; customerCount: number; error?: string }> => {
    try {
        // 1. Find all unique customers who have chatted with this provider
        const customers = await getCustomersWhoChatted(providerId, providerType);

        if (customers.length === 0) {
            return { success: true, customerCount: 0 };
        }

        // 2. Create notification message
        const message = `🔥 SPECIAL OFFER! ${providerName} is offering ${percentage}% OFF for the next ${duration} hours! Book now before it expires! ⏰`;

        // 3. Send notification to each customer
        const notifications = customers.map(async (customerId) => {
            try {
                await createDiscountNotification(
                    customerId,
                    providerId,
                    providerType,
                    message,
                    percentage,
                    duration
                );
                return true;
            } catch (error) {
                console.error(`Failed to notify customer ${customerId}:`, error);
                return false;
            }
        });

        await Promise.all(notifications);

        return { success: true, customerCount: customers.length };
    } catch (error) {
        console.error('Error broadcasting discount:', error);
        return { 
            success: false, 
            customerCount: 0, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        };
    }
};

/**
 * Get all customers who have chatted with a provider
 */
const getCustomersWhoChatted = async (
    providerId: string,
    providerType: 'therapist' | 'place'
): Promise<string[]> => {
    try {
        // Query chat_rooms collection for all rooms involving this provider
        const response = await databases.listDocuments(
            DATABASE_ID,
            CHAT_ROOMS_COLLECTION_ID,
            [
                Query.equal('providerId', providerId),
                Query.equal('providerType', providerType),
                Query.limit(1000)
            ]
        );

        // Extract unique customer IDs
        const customerIds = new Set<string>();
        response.documents.forEach((room: any) => {
            if (room.customerId) {
                customerIds.add(room.customerId);
            }
        });

        return Array.from(customerIds);
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
};

/**
 * Create a discount notification for a customer
 */
const createDiscountNotification = async (
    customerId: string,
    providerId: string,
    providerType: 'therapist' | 'place',
    message: string,
    percentage: number,
    duration: number
): Promise<void> => {
    try {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + duration);

        await databases.createDocument(
            DATABASE_ID,
            NOTIFICATIONS_COLLECTION_ID,
            'unique()',
            {
                customerId,
                providerId,
                providerType,
                type: 'discount_offer',
                message,
                percentage,
                expiresAt: expiresAt.toISOString(),
                isRead: false,
                createdAt: new Date().toISOString()
            }
        );
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

/**
 * Send in-app notification (alternative to push notifications)
 */
export const sendInAppDiscountNotification = async (
    customerId: string,
    providerName: string,
    percentage: number,
    duration: number
): Promise<void> => {
    try {
        // This can trigger a real-time notification in the app
        // The notification will appear in the NotificationBell component
        console.log(`📢 Notification sent to customer ${customerId}: ${providerName} - ${percentage}% OFF for ${duration}h`);
    } catch (error) {
        console.error('Error sending in-app notification:', error);
    }
};

/**
 * Broadcast via WhatsApp (optional - requires WhatsApp Business API)
 */
export const broadcastViaWhatsApp = async (
    phoneNumbers: string[],
    providerName: string,
    percentage: number,
    duration: number,
    bookingLink: string
): Promise<{ success: boolean; sentCount: number }> => {
    try {
        // This would integrate with WhatsApp Business API
        // For now, it's a placeholder
        
        const message = `🔥 *SPECIAL OFFER*\n\n${providerName} is offering *${percentage}% OFF* for the next *${duration} hours*!\n\n📅 Book now: ${bookingLink}\n\n⏰ Hurry, offer expires soon!`;

        console.log('WhatsApp Broadcast Message:', message);
        console.log('Sending to:', phoneNumbers.length, 'customers');

        // TODO: Integrate with WhatsApp Business API
        // Example: await whatsappAPI.sendBulkMessage(phoneNumbers, message);

        return { success: true, sentCount: phoneNumbers.length };
    } catch (error) {
        console.error('Error broadcasting via WhatsApp:', error);
        return { success: false, sentCount: 0 };
    }
};

/**
 * Get customer phone numbers for WhatsApp broadcast
 */
export const getCustomerPhoneNumbers = async (customerIds: string[]): Promise<string[]> => {
    try {
        const phoneNumbers: string[] = [];

        for (const customerId of customerIds) {
            try {
                const customer = await databases.getDocument(
                    DATABASE_ID,
                    USERS_COLLECTION_ID,
                    customerId
                );

                if (customer.phone) {
                    phoneNumbers.push(customer.phone);
                }
            } catch (error) {
                console.error(`Error fetching customer ${customerId}:`, error);
            }
        }

        return phoneNumbers;
    } catch (error) {
        console.error('Error getting phone numbers:', error);
        return [];
    }
};
