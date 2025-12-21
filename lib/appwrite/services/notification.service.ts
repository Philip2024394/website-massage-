/**
 * Notification Service
 * Handles email notifications, admin alerts, and messaging
 */

import { functions } from '../config';

interface AdminNotificationData {
    type: 'therapist' | 'massage-place';
    name: string;
    email: string;
    whatsappNumber: string;
    location: string;
    registrationDate: string;
}

export const notificationService = {
    /**
     * Send admin notification email for new registrations
     * @param data - Registration data to include in notification
     */
    async sendAdminNotification(data: AdminNotificationData): Promise<void> {
        try {
            const emailBody = `
New ${data.type === 'therapist' ? 'Therapist' : 'Massage Place'} Registration

Name: ${data.name}
Email: ${data.email}
WhatsApp: ${data.whatsappNumber}
Location: ${data.location}
Registration Date: ${new Date(data.registrationDate).toLocaleString()}
            `.trim();

            // Using Web3Forms free email service
            // TODO: Replace with proper email service (SendGrid, AWS SES, etc.) for production
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '46ce7d7f-e9d5-4d49-8f14-0b0e3c3e1f5a', // Web3Forms API key
                    subject: `New ${data.type === 'therapist' ? 'Therapist' : 'Massage Place'} Registration`,
                    from_name: 'IndaStreet Registration System',
                    email: 'indastreet.id@gmail.com',
                    message: emailBody,
                }),
            });

            if (!response.ok) {
                throw new Error(`Email service returned ${response.status}`);
            }

            console.log('✅ Admin notification email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send admin notification email:', error);
            throw error;
        }
    },

    /**
     * Send booking confirmation email
     * @param bookingData - Booking information
     */
    async sendBookingConfirmation(bookingData: {
        customerEmail: string;
        customerName: string;
        therapistName: string;
        bookingDate: string;
        bookingTime: string;
        serviceType: string;
        location: string;
    }): Promise<void> {
        try {
            const emailBody = `
Booking Confirmation - IndaStreet Massage

Dear ${bookingData.customerName},

Your massage booking has been confirmed!

Details:
- Therapist: ${bookingData.therapistName}
- Service: ${bookingData.serviceType}
- Date: ${bookingData.bookingDate}
- Time: ${bookingData.bookingTime}
- Location: ${bookingData.location}

Thank you for choosing IndaStreet!
            `.trim();

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '46ce7d7f-e9d5-4d49-8f14-0b0e3c3e1f5a',
                    subject: 'Booking Confirmation - IndaStreet Massage',
                    from_name: 'IndaStreet Booking System',
                    email: bookingData.customerEmail,
                    message: emailBody,
                }),
            });

            if (!response.ok) {
                throw new Error(`Email service returned ${response.status}`);
            }

            console.log('✅ Booking confirmation email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send booking confirmation email:', error);
            throw error;
        }
    },

    /**
     * Send payment confirmation notification
     * @param paymentData - Payment information
     */
    async sendPaymentConfirmation(paymentData: {
        customerEmail: string;
        customerName: string;
        amount: number;
        transactionId: string;
        serviceType: string;
    }): Promise<void> {
        try {
            const emailBody = `
Payment Confirmation - IndaStreet

Dear ${paymentData.customerName},

Your payment has been processed successfully!

Details:
- Service: ${paymentData.serviceType}
- Amount: Rp ${paymentData.amount.toLocaleString()}
- Transaction ID: ${paymentData.transactionId}
- Date: ${new Date().toLocaleString()}

Thank you for your payment!
            `.trim();

            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '46ce7d7f-e9d5-4d49-8f14-0b0e3c3e1f5a',
                    subject: 'Payment Confirmation - IndaStreet',
                    from_name: 'IndaStreet Payment System',
                    email: paymentData.customerEmail,
                    message: emailBody,
                }),
            });

            if (!response.ok) {
                throw new Error(`Email service returned ${response.status}`);
            }

            console.log('✅ Payment confirmation email sent successfully');
        } catch (error) {
            console.error('❌ Failed to send payment confirmation email:', error);
            throw error;
        }
    },

    // Additional notification methods for database operations
    async create(notification: any): Promise<any> {
        const { databases, APPWRITE_CONFIG } = await import('../config');
        const { ID } = await import('appwrite');
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                ID.unique(),
                notification
            );
            return response;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    async getAll(userId?: string): Promise<any[]> {
        const { databases, APPWRITE_CONFIG } = await import('../config');
        const { Query } = await import('appwrite');
        try {
            const queries = userId ? 
                [Query.equal('userId', userId), Query.orderDesc('createdAt'), Query.limit(100)] :
                [Query.orderDesc('createdAt'), Query.limit(100)];
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                queries
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    async getUnread(userId: string): Promise<any[]> {
        const { databases, APPWRITE_CONFIG } = await import('../config');
        const { Query } = await import('appwrite');
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                [
                    Query.equal('userId', userId),
                    Query.equal('read', false),
                    Query.orderDesc('createdAt')
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching unread notifications:', error);
            return [];
        }
    },

    async update(id: string, data: any): Promise<any> {
        const { databases, APPWRITE_CONFIG } = await import('../config');
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.notifications,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }
    },

    async createWhatsAppContactNotification(data: any): Promise<any> {
        const notification = {
            userId: data.userId,
            type: 'whatsapp_contact',
            title: 'WhatsApp Contact Request',
            body: `${data.customerName} wants to contact you`,
            read: false,
            createdAt: new Date().toISOString(),
            ...data
        };
        return await this.create(notification);
    }
};