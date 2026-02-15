/**
 * Admin Dashboard - Appwrite Configuration
 * Direct connection to Appwrite for admin operations
 */

import { Client, Databases, Query, Storage, Account, ID } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

export const databases = new Databases(client);
export const storage = new Storage(client);
export const account = new Account(client);

export const DATABASE_ID = '68f76ee1000e64ca8d05';

export const COLLECTIONS = {
    therapists: 'therapists_collection_id',
    places: 'places_collection_id',
    bookings: 'bookings_collection_id',
    reviews: 'reviews',
    commissionRecords: 'commission_records',
    chatSessions: 'chat_sessions',
    notifications: 'notifications',
    therapistMatches: 'therapist_matches',
    achievements: 'achievements_collection_id',
    therapistAchievements: 'therapist_achievements_collection_id',
    chatRooms: 'chat_rooms',
    messages: 'messages',
    employerJobPostings: 'employer_job_postings',
    therapistJobListings: 'therapist_job_listings',
    emergency_alerts: 'emergency_alerts'
};

// Legacy APPWRITE_CONFIG for backward compatibility
export const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: DATABASE_ID,
    collections: {
        therapists: COLLECTIONS.therapists,
        places: COLLECTIONS.places,
        bookings: COLLECTIONS.bookings,
        reviews: COLLECTIONS.reviews,
        commissionRecords: COLLECTIONS.commissionRecords,
        chatSessions: COLLECTIONS.chatSessions,
        chatRooms: COLLECTIONS.chatRooms,
        messages: COLLECTIONS.messages,
        notifications: COLLECTIONS.notifications
    }
};

export const STORAGE_BUCKETS = {
    profileImages: 'profile_images',
    ktpDocuments: 'ktp_documents',
    hotelLetters: 'hotel_letters'
};

// Therapist service
export const therapistService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.therapists,
                [Query.limit(100)]
            );
            console.log('✅ Fetched', response.documents.length, 'therapists');
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching therapists:', error);
            return [];
        }
    },
    get: async (id: string) => {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.therapists, id);
        } catch (error) {
            console.error('❌ Error fetching therapist:', error);
            return null;
        }
    },
    update: async (id: string, data: any) => {
        try {
            // Filter out system fields and undefined values
            const cleanData: Record<string, any> = {};
            const allowedFields = ['name', 'description', 'location', 'phone', 'email', 'whatsappNumber', 
                'status', 'isVerified', 'profileImage', 'images', 'specialties', 'services', 
                'availability', 'experience', 'price60', 'price90', 'price120', 'ktpVerified',
                'contactSharingViolations'];
            
            for (const key of allowedFields) {
                if (data[key] !== undefined) {
                    cleanData[key] = data[key];
                }
            }
            
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.therapists, id, cleanData);
        } catch (error) {
            console.error('❌ Error updating therapist:', error);
            throw error;
        }
    }
};

// Places service
export const placesService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.places,
                [Query.limit(100)]
            );
            console.log('✅ Fetched', response.documents.length, 'places');
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching places:', error);
            return [];
        }
    },
    get: async (id: string) => {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.places, id);
        } catch (error) {
            console.error('❌ Error fetching place:', error);
            return null;
        }
    },
    update: async (id: string, data: any) => {
        try {
            const cleanData: Record<string, any> = {};
            const allowedFields = ['name', 'description', 'location', 'phone', 'email', 
                'website', 'status', 'isVerified', 'profileImage', 'images', 'services', 
                'amenities', 'serviceType', 'price60', 'price90', 'price120', 'contactSharingViolations'];
            
            for (const key of allowedFields) {
                if (data[key] !== undefined) {
                    cleanData[key] = data[key];
                }
            }
            
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.places, id, cleanData);
        } catch (error) {
            console.error('❌ Error updating place:', error);
            throw error;
        }
    }
};

// Emergency alerts (therapist/place safety – 3-tap emergency button)
export const emergencyAlertsService = {
    listPending: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.emergency_alerts,
                [Query.equal('status', 'pending'), Query.orderDesc('triggeredAt'), Query.limit(50)]
            );
            return response.documents || [];
        } catch (error) {
            console.error('Error fetching emergency alerts:', error);
            return [];
        }
    },
    listAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.emergency_alerts,
                [Query.orderDesc('triggeredAt'), Query.limit(100)]
            );
            return response.documents || [];
        } catch (error) {
            console.error('Error fetching emergency alerts:', error);
            return [];
        }
    },
    acknowledge: async (alertId: string) => {
        try {
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.emergency_alerts,
                alertId,
                { status: 'acknowledged', acknowledgedAt: new Date().toISOString() }
            );
        } catch (error) {
            console.error('Error acknowledging emergency alert:', error);
            throw error;
        }
    }
};

// Booking service
export const bookingService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.bookings,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ Fetched', response.documents.length, 'bookings');
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching bookings:', error);
            return [];
        }
    },
    get: async (id: string) => {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.bookings, id);
        } catch (error) {
            console.error('❌ Error fetching booking:', error);
            return null;
        }
    },
    update: async (id: string, data: any) => {
        try {
            return await databases.updateDocument(DATABASE_ID, COLLECTIONS.bookings, id, data);
        } catch (error) {
            console.error('❌ Error updating booking:', error);
            throw error;
        }
    }
};

// Commission service
export const commissionService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.commissionRecords,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ Fetched', response.documents.length, 'commission records');
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching commissions:', error);
            return [];
        }
    },
    create: async (data: any) => {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.commissionRecords,
                ID.unique(),
                data
            );
        } catch (error) {
            console.error('❌ Error creating commission:', error);
            throw error;
        }
    }
};

// Reviews service
export const reviewsService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.reviews,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ Fetched', response.documents.length, 'reviews');
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching reviews:', error);
            return [];
        }
    }
};

// Chat sessions service
export const chatService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.chatSessions,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            console.log('✅ Fetched', response.documents.length, 'chat sessions');
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching chat sessions:', error);
            return [];
        }
    }
};

// Analytics service (placeholder - real data would come from analytics collection)
export const analyticsService = {
    getPlatformStats: async () => {
        try {
            const [therapists, places, bookings] = await Promise.all([
                therapistService.getAll(),
                placesService.getAll(),
                bookingService.getAll()
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
            console.error('❌ Error fetching platform stats:', error);
            return null;
        }
    }
};

// Export client for direct access if needed
export { client, Query, ID };

// Messaging service for admin chat
export const messagingService = {
    generateConversationId: (userId1: string, memberId: string, memberCategory: string) => {
        const sortedIds = [userId1, memberId].sort();
        return `conv_${sortedIds[0]}_${sortedIds[1]}_${memberCategory}`;
    },
    getConversation: async (conversationId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.messages,
                [
                    Query.equal('conversationId', conversationId),
                    Query.orderAsc('$createdAt'),
                    Query.limit(100)
                ]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching conversation:', error);
            return [];
        }
    },
    sendMessage: async (data: any) => {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.messages,
                ID.unique(),
                {
                    ...data,
                    timestamp: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('❌ Error sending message:', error);
            throw error;
        }
    },
    markAsRead: async (messageId: string) => {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.messages,
                messageId,
                { isRead: true }
            );
        } catch (error) {
            console.error('❌ Error marking message as read:', error);
        }
    }
};

// Commission tracking service
export const commissionTrackingService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.commissionRecords,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching commission records:', error);
            return [];
        }
    },
    getByBookingId: async (bookingId: string) => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.commissionRecords,
                [Query.equal('bookingId', bookingId)]
            );
            return response.documents[0] || null;
        } catch (error) {
            console.error('❌ Error fetching commission by booking:', error);
            return null;
        }
    }
};

// Payment confirmation service
export const paymentConfirmationService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.commissionRecords,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching payments:', error);
            return [];
        }
    },
    confirm: async (id: string, data: any) => {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.commissionRecords,
                id,
                { ...data, status: 'confirmed', confirmedAt: new Date().toISOString() }
            );
        } catch (error) {
            console.error('❌ Error confirming payment:', error);
            throw error;
        }
    }
};

// Audit logging service (placeholder - logs to console in dev)
export const auditLoggingService = {
    log: async (entry: any) => {
        console.log('📝 Audit Log:', entry);
        return entry;
    },
    getAll: async () => {
        console.log('📋 Fetching audit logs...');
        return [];
    }
};

// Chat rooms service
export const chatRoomsService = {
    getAll: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.chatRooms,
                [Query.limit(100), Query.orderDesc('$createdAt')]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching chat rooms:', error);
            return [];
        }
    },
    getActive: async () => {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.chatRooms,
                [Query.equal('status', 'active'), Query.limit(50)]
            );
            return response.documents;
        } catch (error) {
            console.error('❌ Error fetching active chat rooms:', error);
            return [];
        }
    }
};

// Type exports
export type AuditLogEntry = {
    action: string;
    userId?: string;
    details?: any;
    timestamp: string;
};

// Admin Commission Service (placeholder)
export const adminCommissionService = {
    getAll: async () => {
        return commissionTrackingService.getAll();
    },
    getUnpaid: async () => {
        try {
            const all = await commissionTrackingService.getAll();
            return all.filter((c: any) => c.status !== 'paid');
        } catch (error) {
            return [];
        }
    }
};

// Admin Revenue Tracker Service (placeholder)
export const adminRevenueTrackerService = {
    getRevenueStats: async () => {
        try {
            const bookings = await bookingService.getAll();
            const completed = bookings.filter((b: any) => b.status === 'completed');
            const totalRevenue = completed.reduce((sum: number, b: any) => sum + (b.totalCost || 0), 0);
            return {
                totalRevenue,
                totalBookings: completed.length,
                averageBookingValue: completed.length > 0 ? totalRevenue / completed.length : 0
            };
        } catch (error) {
            return { totalRevenue: 0, totalBookings: 0, averageBookingValue: 0 };
        }
    },
    getLiveStats: async () => ({
        activeBookings: 0,
        pendingPayments: 0,
        todayRevenue: 0
    })
};

// Analytics Service (placeholder)
export const shareTrackingService = {
    getAll: async () => [],
    getStats: async () => ({
        totalShares: 0,
        platforms: {},
        topSharedProfiles: []
    })
};

// Commission Status type
export type CommissionStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

// Booking Lifecycle Status type
export type BookingLifecycleStatus = 'created' | 'accepted' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

// Achievement types (for AdminAchievementManager)
export const ACHIEVEMENT_CATEGORIES = {
    PROFILE: 'profile',
    SERVICE: 'service',
    CUSTOMER: 'customer',
    REVENUE: 'revenue'
};

export interface Achievement {
    $id?: string;
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    requirement: number;
    reward?: string;
    rarity?: string;
}

export interface TherapistAchievement {
    $id?: string;
    id: string;
    therapistId: string;
    achievementId: string;
    earnedAt: string;
    progress: number;
}

export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
    { id: '1', name: 'First Booking', description: 'Complete your first booking', category: 'service', icon: '🎉', requirement: 1 },
    { id: '2', name: 'Rising Star', description: 'Complete 10 bookings', category: 'service', icon: '⭐', requirement: 10 },
    { id: '3', name: 'Top Performer', description: 'Complete 50 bookings', category: 'service', icon: '🏆', requirement: 50 }
];
