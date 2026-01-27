import { databases, storage, ID, Query } from '../appwrite';


export interface ScheduledBookingDeposit {
    id?: string;
    bookingId: string;
    userId: string;
    therapistId: string;
    amount: number;
    status: 'pending' | 'paid' | 'verified' | 'expired';
    paymentMethod: 'bank_transfer';
    paymentProofUrl?: string;
    paymentProofId?: string;
    depositPercentage: number;
    isRefundable: false; // Always non-refundable
    createdAt: Date;
    expiresAt: Date;
    verifiedAt?: Date;
    verifiedBy?: string; // Admin ID
    metadata?: {
        originalBookingDate: string;
        originalBookingTime: string;
        serviceDuration: number;
        totalBookingPrice: number;
        therapistName: string;
        location: string;
    };
}

export interface DateChangeRequest {
    id?: string;
    bookingId: string;
    depositId: string;
    userId: string;
    therapistId: string;
    currentDate: string;
    currentTime: string;
    requestedDate: string;
    requestedTime: string;
    reason: string;
    urgency: 'low' | 'medium' | 'high';
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    submittedAt: Date;
    respondedAt?: Date;
    therapistResponse?: string;
    adminNotes?: string;
}

export interface FlexibleTimeSlot {
    id?: string;
    therapistId: string;
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    isOutsideCalendar: boolean; // Slots not shown in regular calendar
    specialNotes?: string;
    minimumNotice: number; // Hours required for booking
    requiresApproval: boolean;
}

class ScheduledBookingService {
    private readonly DATABASE_ID = 'main-database';
    private readonly SCHEDULED_DEPOSITS_COLLECTION = 'scheduled-booking-deposits';
    private readonly DATE_CHANGE_REQUESTS_COLLECTION = 'date-change-requests';
    private readonly FLEXIBLE_TIMESLOTS_COLLECTION = 'flexible-timeslots';
    private readonly STORAGE_BUCKET = 'payment-proofs';

    // Deposit Management
    async createDepositRequirement(
        bookingId: string,
        userId: string,
        therapistId: string,
        totalPrice: number,
        depositPercentage: number = 50,
        bookingMetadata: any
    ): Promise<ScheduledBookingDeposit> {
        try {
            const amount = Math.round((totalPrice * depositPercentage) / 100);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

            const deposit: Omit<ScheduledBookingDeposit, 'id'> = {
                bookingId,
                userId,
                therapistId,
                amount,
                status: 'pending',
                paymentMethod: 'bank_transfer',
                depositPercentage,
                isRefundable: false,
                createdAt: new Date(),
                expiresAt,
                metadata: bookingMetadata
            };

            const result = await databases.createDocument(
                this.DATABASE_ID,
                this.SCHEDULED_DEPOSITS_COLLECTION,
                ID.unique(),
                deposit
            );

            return {
                id: result.$id,
                ...deposit
            };
        } catch (error) {
            console.error('Error creating deposit requirement:', error);
            throw new Error(`Failed to create deposit requirement: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async uploadPaymentProof(depositId: string, file: File): Promise<string> {
        try {
            // Upload file to storage
            const uploadResult = await storage.createFile(
                this.STORAGE_BUCKET,
                ID.unique(),
                file
            );

            // Update deposit with payment proof
            await databases.updateDocument(
                this.DATABASE_ID,
                this.SCHEDULED_DEPOSITS_COLLECTION,
                depositId,
                {
                    paymentProofId: uploadResult.$id,
                    paymentProofUrl: storage.getFileView(this.STORAGE_BUCKET, uploadResult.$id).href,
                    status: 'paid'
                }
            );

            return uploadResult.$id;
        } catch (error) {
            console.error('Error uploading payment proof:', error);
            throw new Error(`Failed to upload payment proof: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async verifyDeposit(depositId: string, adminId: string, isVerified: boolean): Promise<void> {
        try {
            await databases.updateDocument(
                this.DATABASE_ID,
                this.SCHEDULED_DEPOSITS_COLLECTION,
                depositId,
                {
                    status: isVerified ? 'verified' : 'pending',
                    verifiedAt: isVerified ? new Date() : null,
                    verifiedBy: isVerified ? adminId : null
                }
            );
        } catch (error) {
            console.error('Error verifying deposit:', error);
            throw new Error(`Failed to verify deposit: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getDepositStatus(bookingId: string): Promise<ScheduledBookingDeposit | null> {
        try {
            const result = await databases.listDocuments(
                this.DATABASE_ID,
                this.SCHEDULED_DEPOSITS_COLLECTION,
                [Query.equal('bookingId', bookingId)]
            );

            if (result.documents.length === 0) return null;

            const doc = result.documents[0];
            return {
                id: doc.$id,
                bookingId: doc.bookingId,
                userId: doc.userId,
                therapistId: doc.therapistId,
                amount: doc.amount,
                status: doc.status,
                paymentMethod: doc.paymentMethod,
                paymentProofUrl: doc.paymentProofUrl,
                paymentProofId: doc.paymentProofId,
                depositPercentage: doc.depositPercentage,
                isRefundable: false,
                createdAt: new Date(doc.createdAt),
                expiresAt: new Date(doc.expiresAt),
                verifiedAt: doc.verifiedAt ? new Date(doc.verifiedAt) : undefined,
                verifiedBy: doc.verifiedBy,
                metadata: doc.metadata
            };
        } catch (error) {
            console.error('Error getting deposit status:', error);
            return null;
        }
    }

    // Date Change Request Management
    async submitDateChangeRequest(
        bookingId: string,
        depositId: string,
        userId: string,
        therapistId: string,
        currentDate: string,
        currentTime: string,
        requestedDate: string,
        requestedTime: string,
        reason: string,
        urgency: 'low' | 'medium' | 'high'
    ): Promise<DateChangeRequest> {
        try {
            const request: Omit<DateChangeRequest, 'id'> = {
                bookingId,
                depositId,
                userId,
                therapistId,
                currentDate,
                currentTime,
                requestedDate,
                requestedTime,
                reason,
                urgency,
                status: 'pending',
                submittedAt: new Date()
            };

            const result = await databases.createDocument(
                this.DATABASE_ID,
                this.DATE_CHANGE_REQUESTS_COLLECTION,
                ID.unique(),
                request
            );

            return {
                id: result.$id,
                ...request
            };
        } catch (error) {
            console.error('Error submitting date change request:', error);
            throw new Error(`Failed to submit date change request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async respondToDateChangeRequest(
        requestId: string,
        therapistId: string,
        isApproved: boolean,
        response?: string
    ): Promise<void> {
        try {
            await databases.updateDocument(
                this.DATABASE_ID,
                this.DATE_CHANGE_REQUESTS_COLLECTION,
                requestId,
                {
                    status: isApproved ? 'approved' : 'rejected',
                    respondedAt: new Date(),
                    therapistResponse: response || ''
                }
            );
        } catch (error) {
            console.error('Error responding to date change request:', error);
            throw new Error(`Failed to respond to date change request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getDateChangeRequests(therapistId?: string, userId?: string): Promise<DateChangeRequest[]> {
        try {
            const queries: any[] = [];
            if (therapistId) queries.push(Query.equal('therapistId', therapistId));
            if (userId) queries.push(Query.equal('userId', userId));
            
            const result = await databases.listDocuments(
                this.DATABASE_ID,
                this.DATE_CHANGE_REQUESTS_COLLECTION,
                queries
            );

            return result.documents.map(doc => ({
                id: doc.$id,
                bookingId: doc.bookingId,
                depositId: doc.depositId,
                userId: doc.userId,
                therapistId: doc.therapistId,
                currentDate: doc.currentDate,
                currentTime: doc.currentTime,
                requestedDate: doc.requestedDate,
                requestedTime: doc.requestedTime,
                reason: doc.reason,
                urgency: doc.urgency,
                status: doc.status,
                submittedAt: new Date(doc.submittedAt),
                respondedAt: doc.respondedAt ? new Date(doc.respondedAt) : undefined,
                therapistResponse: doc.therapistResponse,
                adminNotes: doc.adminNotes
            }));
        } catch (error) {
            console.error('Error getting date change requests:', error);
            return [];
        }
    }

    // Flexible Time Slot Management
    async createFlexibleTimeSlot(
        therapistId: string,
        date: string,
        startTime: string,
        endTime: string,
        isOutsideCalendar: boolean = false,
        minimumNotice: number = 24,
        requiresApproval: boolean = false,
        specialNotes?: string
    ): Promise<FlexibleTimeSlot> {
        try {
            const slot: Omit<FlexibleTimeSlot, 'id'> = {
                therapistId,
                date,
                startTime,
                endTime,
                isAvailable: true,
                isOutsideCalendar,
                specialNotes,
                minimumNotice,
                requiresApproval
            };

            const result = await databases.createDocument(
                this.DATABASE_ID,
                this.FLEXIBLE_TIMESLOTS_COLLECTION,
                ID.unique(),
                slot
            );

            return {
                id: result.$id,
                ...slot
            };
        } catch (error) {
            console.error('Error creating flexible time slot:', error);
            throw new Error(`Failed to create flexible time slot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getFlexibleTimeSlots(
        therapistId: string,
        date?: string,
        includeOutsideCalendar: boolean = true
    ): Promise<FlexibleTimeSlot[]> {
        try {
            const queries = [Query.equal('therapistId', therapistId)];
            if (date) queries.push(Query.equal('date', date as any));
            if (!includeOutsideCalendar) queries.push(Query.equal('isOutsideCalendar', false as any));

            const result = await databases.listDocuments(
                this.DATABASE_ID,
                this.FLEXIBLE_TIMESLOTS_COLLECTION,
                queries
            );

            return result.documents.map(doc => ({
                id: doc.$id,
                therapistId: doc.therapistId,
                date: doc.date,
                startTime: doc.startTime,
                endTime: doc.endTime,
                isAvailable: doc.isAvailable,
                isOutsideCalendar: doc.isOutsideCalendar,
                specialNotes: doc.specialNotes,
                minimumNotice: doc.minimumNotice,
                requiresApproval: doc.requiresApproval
            }));
        } catch (error) {
            console.error('Error getting flexible time slots:', error);
            return [];
        }
    }

    async bookFlexibleTimeSlot(slotId: string, bookingId: string): Promise<void> {
        try {
            await databases.updateDocument(
                this.DATABASE_ID,
                this.FLEXIBLE_TIMESLOTS_COLLECTION,
                slotId,
                {
                    isAvailable: false,
                    bookedBy: bookingId,
                    bookedAt: new Date()
                }
            );
        } catch (error) {
            console.error('Error booking flexible time slot:', error);
            throw new Error(`Failed to book flexible time slot: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Admin Functions
    async getPendingDeposits(therapistId?: string): Promise<ScheduledBookingDeposit[]> {
        try {
            const queries = [Query.equal('status', 'paid')];
            if (therapistId) queries.push(Query.equal('therapistId', therapistId as any));

            const result = await databases.listDocuments(
                this.DATABASE_ID,
                this.SCHEDULED_DEPOSITS_COLLECTION,
                queries
            );

            return result.documents.map(doc => ({
                id: doc.$id,
                bookingId: doc.bookingId,
                userId: doc.userId,
                therapistId: doc.therapistId,
                amount: doc.amount,
                status: doc.status,
                paymentMethod: doc.paymentMethod,
                paymentProofUrl: doc.paymentProofUrl,
                paymentProofId: doc.paymentProofId,
                depositPercentage: doc.depositPercentage,
                isRefundable: false,
                createdAt: new Date(doc.createdAt),
                expiresAt: new Date(doc.expiresAt),
                verifiedAt: doc.verifiedAt ? new Date(doc.verifiedAt) : undefined,
                verifiedBy: doc.verifiedBy,
                metadata: doc.metadata
            }));
        } catch (error) {
            console.error('Error getting pending deposits:', error);
            return [];
        }
    }

    async expireOldDeposits(): Promise<number> {
        try {
            const now = new Date();
            const result = await databases.listDocuments(
                this.DATABASE_ID,
                this.SCHEDULED_DEPOSITS_COLLECTION,
                [
                    Query.equal('status', 'pending'),
                    Query.lessThan('expiresAt', now.toISOString())
                ]
            );

            let expiredCount = 0;
            for (const doc of result.documents) {
                await databases.updateDocument(
                    this.DATABASE_ID,
                    this.SCHEDULED_DEPOSITS_COLLECTION,
                    doc.$id,
                    { status: 'expired' }
                );
                expiredCount++;
            }

            return expiredCount;
        } catch (error) {
            console.error('Error expiring old deposits:', error);
            return 0;
        }
    }

    // Notification Helpers
    async sendDepositConfirmation(userId: string, deposit: ScheduledBookingDeposit): Promise<void> {
        // Implementation would depend on your notification system
        console.log(`Sending deposit confirmation to user ${userId} for amount ${deposit.amount}`);
    }

    async sendDateChangeNotification(therapistId: string, request: DateChangeRequest): Promise<void> {
        // Implementation would depend on your notification system
        console.log(`Sending date change request notification to therapist ${therapistId}`);
    }

    async sendDateChangeResponse(userId: string, request: DateChangeRequest): Promise<void> {
        // Implementation would depend on your notification system
        console.log(`Sending date change response to user ${userId}: ${request.status}`);
    }
}

export const scheduledBookingService = new ScheduledBookingService();
