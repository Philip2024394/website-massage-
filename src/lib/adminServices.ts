/**
 * =====================================================================
 * ADMIN SERVICES - Unified Admin Operations
 * =====================================================================
 * 
 * All admin-specific services consolidated here.
 * Imports from the unified appwriteClient.ts - NO DUPLICATE CLIENTS.
 * 
 * Services:
 * - adminTherapistService: Admin CRUD for therapists
 * - adminPlacesService: Admin CRUD for places
 * - adminBookingService: Admin booking management
 * - adminCommissionService: Commission tracking & verification
 * - adminRevenueService: Revenue analytics
 * - adminChatService: Chat monitoring & management
 * - adminReviewsService: Review moderation
 * - adminAnalyticsService: Platform analytics
 * 
 * @version 1.0.0
 * @merged From apps/admin-dashboard
 */

import {
    databases,
    storage,
    account,
    DATABASE_ID,
    COLLECTIONS,
    STORAGE_BUCKETS,
    Query,
    ID,
    type CommissionStatus,
    type BookingLifecycleStatus,
    type Achievement,
    type TherapistAchievement,
    SAMPLE_ACHIEVEMENTS
} from './appwriteClient';

// Re-export types for convenience
export type { CommissionStatus, BookingLifecycleStatus, Achievement, TherapistAchievement };
export { SAMPLE_ACHIEVEMENTS };

// =====================================================================
// ADMIN THERAPIST SERVICE
// =====================================================================

const MAX_THERAPISTS_PAGE = 100; // Appwrite max per request

export const adminTherapistService = {
    getAll: async () => {
        try {
            const all: any[] = [];
            let offset = 0;
            let hasMore = true;
            while (hasMore) {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.THERAPISTS,
                    [Query.limit(MAX_THERAPISTS_PAGE), Query.offset(all.length)]
                );
                all.push(...response.documents);
                hasMore = response.documents.length === MAX_THERAPISTS_PAGE;
            }
            console.log('✅ [ADMIN] Fetched', all.length, 'therapists');
            return all;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching therapists:', error);
            return [];
        }
    },
    
    get: async (id: string) => {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.THERAPISTS, id);
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching therapist:', error);
            return null;
        }
    },
    
    update: async (id: string, data: any) => {
        try {
            const cleanData: Record<string, any> = {};
            const allowedFields = [
                'name', 'description', 'location', 'phone', 'email', 'whatsappNumber',
                'status', 'isVerified', 'profileImage', 'profilePicture', 'images', 'specialties', 'services',
                'availability', 'experience', 'price60', 'price90', 'price120', 'ktpVerified',
                'bankName', 'accountName', 'accountNumber', 'ktpPhotoUrl', 'hotelVillaSafePassStatus',
                'hasSafePassVerification', 'profileWentLiveAt'
            ];
            
            for (const key of allowedFields) {
                if (data[key] !== undefined) {
                    cleanData[key] = data[key];
                }
            }
            
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.THERAPISTS, id, cleanData);
        } catch (error) {
            console.error('❌ [ADMIN] Error updating therapist:', error);
            throw error;
        }
    },
    
    verifyKtp: async (id: string, verified: boolean) => {
        try {
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.THERAPISTS, id, {
                ktpVerified: verified,
                ktpVerifiedAt: verified ? new Date().toISOString() : null
            });
        } catch (error) {
            console.error('❌ [ADMIN] Error verifying KTP:', error);
            throw error;
        }
    }
};

// =====================================================================
// ADMIN PLACES SERVICE
// =====================================================================

export const adminPlacesService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PLACES,
                [Query.limit(100)]
            );
            console.log('✅ [ADMIN] Fetched', response.documents.length, 'places');
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching places:', error);
            return [];
        }
    },
    
    get: async (id: string) => {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.PLACES, id);
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching place:', error);
            return null;
        }
    },
    
    update: async (id: string, data: any) => {
        try {
            const cleanData: Record<string, any> = {};
            const allowedFields = [
                'name', 'description', 'location', 'phone', 'email',
                'website', 'status', 'isVerified', 'profileImage', 'images',
                'services', 'amenities', 'serviceType', 'price60', 'price90', 'price120'
            ];
            
            for (const key of allowedFields) {
                if (data[key] !== undefined) {
                    cleanData[key] = data[key];
                }
            }
            
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.PLACES, id, cleanData);
        } catch (error) {
            console.error('❌ [ADMIN] Error updating place:', error);
            throw error;
        }
    }
};

// =====================================================================
// ADMIN BOOKING SERVICE
// =====================================================================

export const adminBookingService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.BOOKINGS,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ [ADMIN] Fetched', response.documents.length, 'bookings');
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching bookings:', error);
            return [];
        }
    },
    
    get: async (id: string) => {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.BOOKINGS, id);
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching booking:', error);
            return null;
        }
    },
    
    update: async (id: string, data: any) => {
        try {
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.BOOKINGS, id, data);
        } catch (error) {
            console.error('❌ [ADMIN] Error updating booking:', error);
            throw error;
        }
    },
    
    getByStatus: async (status: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.BOOKINGS,
                [Query.equal('status', status), Query.limit(100)]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching bookings by status:', error);
            return [];
        }
    }
};

// =====================================================================
// ADMIN COMMISSION SERVICE
// =====================================================================

export const adminCommissionService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ [ADMIN] Fetched', response.documents.length, 'commission records');
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching commissions:', error);
            return [];
        }
    },
    
    create: async (data: any) => {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                ID.unique(),
                data
            );
        } catch (error) {
            console.error('❌ [ADMIN] Error creating commission:', error);
            throw error;
        }
    },
    
    getByBookingId: async (bookingId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [Query.equal('bookingId', bookingId)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching commission by booking:', error);
            return null;
        }
    },
    
    getUnpaid: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                [Query.notEqual('status', 'paid'), Query.limit(100)]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching unpaid commissions:', error);
            return [];
        }
    },
    
    verifyPayment: async (id: string, data: any) => {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.COMMISSION_RECORDS,
                id,
                { ...data, status: 'verified', verifiedAt: new Date().toISOString() }
            );
        } catch (error) {
            console.error('❌ [ADMIN] Error verifying payment:', error);
            throw error;
        }
    }
};

// =====================================================================
// ADMIN REVENUE SERVICE
// =====================================================================

export const adminRevenueService = {
    getStats: async () => {
        try {
            const bookings = await adminBookingService.getAll();
            const completed = bookings.filter((b: any) => b.status === 'completed');
            const totalRevenue = completed.reduce((sum: number, b: any) => sum + (b.totalCost || 0), 0);
            const totalCommission = totalRevenue * 0.30; // 30% commission
            
            return {
                totalRevenue,
                totalCommission,
                totalBookings: completed.length,
                averageBookingValue: completed.length > 0 ? totalRevenue / completed.length : 0,
                pendingCommission: 0,
                overdueCommission: 0
            };
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching revenue stats:', error);
            return { totalRevenue: 0, totalCommission: 0, totalBookings: 0, averageBookingValue: 0 };
        }
    },
    
    getBookings: () => {
        return adminBookingService.getAll();
    },
    
    getLiveStats: async () => ({
        activeBookings: 0,
        pendingPayments: 0,
        todayRevenue: 0
    })
};

// =====================================================================
// ADMIN CHAT SERVICE
// =====================================================================

export const adminChatService = {
    getAllSessions: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CHAT_SESSIONS,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ [ADMIN] Fetched', response.documents.length, 'chat sessions');
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching chat sessions:', error);
            return [];
        }
    },
    
    getMessages: async (conversationId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.MESSAGES,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching messages:', error);
            return [];
        }
    },
    
    getChatRooms: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CHAT_ROOMS,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching chat rooms:', error);
            return [];
        }
    },
    
    getActiveRooms: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.CHAT_ROOMS,
                [Query.equal('status', 'active'), Query.limit(50)]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching active chat rooms:', error);
            return [];
        }
    },
    
    sendAdminMessage: async (data: any) => {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.MESSAGES,
                ID.unique(),
                {
                    ...data,
                    senderRole: 'admin',
                    timestamp: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('❌ [ADMIN] Error sending message:', error);
            throw error;
        }
    }
};

// =====================================================================
// ADMIN REVIEWS SERVICE
// =====================================================================

export const adminReviewsService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.REVIEWS,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ [ADMIN] Fetched', response.documents.length, 'reviews');
            return response.documents;
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching reviews:', error);
            return [];
        }
    },
    
    moderate: async (id: string, action: 'approve' | 'reject', reason?: string) => {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.REVIEWS,
                id,
                {
                    moderationStatus: action === 'approve' ? 'approved' : 'rejected',
                    moderatedAt: new Date().toISOString(),
                    moderationReason: reason || null
                }
            );
        } catch (error) {
            console.error('❌ [ADMIN] Error moderating review:', error);
            throw error;
        }
    }
};

// =====================================================================
// ADMIN ANALYTICS SERVICE
// =====================================================================

export const adminAnalyticsService = {
    getPlatformStats: async () => {
        try {
            const [therapists, places, bookings] = await Promise.all([
                adminTherapistService.getAll(),
                adminPlacesService.getAll(),
                adminBookingService.getAll()
            ]);
            
            return {
                totalTherapists: therapists.length,
                totalPlaces: places.length,
                totalBookings: bookings.length,
                activeTherapists: therapists.filter((t: any) =>
                    t.status === 'active' || t.status === 'available' || t.status === 'busy'
                ).length,
                pendingApprovals: therapists.filter((t: any) => t.status === 'pending').length,
                completedBookings: bookings.filter((b: any) => b.status === 'completed').length
            };
        } catch (error) {
            console.error('❌ [ADMIN] Error fetching platform stats:', error);
            return null;
        }
    },
    
    getRevenueByPeriod: async (startDate: string, endDate: string) => {
        // TODO: Implement date-based revenue analytics
        return { revenue: 0, bookings: 0 };
    }
};

// =====================================================================
// ADMIN SHARE TRACKING SERVICE
// =====================================================================

export const adminShareTrackingService = {
    getAll: async () => [],
    getStats: async () => ({
        totalShares: 0,
        platforms: {},
        topSharedProfiles: []
    })
};

// =====================================================================
// AUDIT LOGGING SERVICE
// =====================================================================

export const adminAuditService = {
    log: async (entry: any) => {
        console.log('📝 [AUDIT LOG]', entry);
        // TODO: Store in Appwrite collection when created
        return entry;
    },
    getAll: async () => {
        console.log('📋 Fetching audit logs...');
        return [];
    }
};

console.log('✅ [ADMIN SERVICES] All admin services initialized');
