/**
 * Payment processing and management
 * Extracted from monolithic appwriteService.ts for better maintainability
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const paymentService = {
    /**
     * Create a payment record for therapist earnings from booking
     */
    async createPayment(data: {
        bookingId: string;
        therapistId: string;
        customerName: string;
        amount: number;
        serviceDuration: string;
        paymentMethod?: string;
    }): Promise<any> {
        try {
            const commissionRate = 0.30; // 30% admin commission
            const adminCommission = Math.round(data.amount * commissionRate);
            const netEarning = data.amount - adminCommission;

            const paymentId = ID.unique();
            const now = new Date().toISOString();

            return await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.payments,
                paymentId,
                {
                    paymentId: paymentId,
                    bookingId: data.bookingId,
                    transactionDate: now,
                    paymentAmount: data.amount,
                    paymentMethod: data.paymentMethod || 'Cash',
                    currency: 'IDR',
                    status: 'pending',
                    therapistId: data.therapistId,
                    customerName: data.customerName,
                    amount: Math.round(data.amount / 1000), // Amount in thousands for display
                    adminCommission: Math.round(adminCommission / 1000),
                    netEarning: Math.round(netEarning / 1000),
                    serviceDuration: data.serviceDuration,
                    date: now
                }
            );
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    },

    /**
     * Get payments by therapist ID
     */
    async getPaymentsByTherapist(therapistId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.payments,
                [
                    Query.equal('therapistId', therapistId),
                    Query.orderDesc('date'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching payments by therapist:', error);
            return [];
        }
    },

    /**
     * Mark payment as paid
     */
    async markAsPaid(paymentId: string, transactionId: string, paymentMethod: string): Promise<any> {
        try {
            return await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                'payment_records',
                paymentId,
                {
                    paymentStatus: 'paid',
                    paidDate: new Date().toISOString(),
                    transactionId,
                    paymentMethod
                }
            );
        } catch (error) {
            console.error('Error marking payment as paid:', error);
            throw error;
        }
    },

    /**
     * Get payment history for a member
     */
    async getPaymentHistory(memberId: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_records',
                [
                    Query.equal('memberId', memberId),
                    Query.orderDesc('monthNumber'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching payment history:', error);
            return [];
        }
    },

    /**
     * Get all pending payments
     */
    async getPendingPayments(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'payment_records',
                [
                    Query.equal('paymentStatus', 'pending'),
                    Query.limit(1000)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pending payments:', error);
            return [];
        }
    }
};
