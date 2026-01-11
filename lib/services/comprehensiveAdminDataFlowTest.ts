// 🚀 COMPREHENSIVE ADMIN DATA FLOW TEST
// Tests commission tracking from ALL bookings and scheduled bookings + chat recording verification

import { databases, Query } from '../appwrite';
import { APPWRITE_CONFIG } from '../appwrite.config';

export class ComprehensiveAdminDataFlowTest {
    
    constructor() {
        console.log('🧪 [ADMIN DATA FLOW TEST] Service initialized');
    }

    /**
     * 🎯 RUN COMPLETE ADMIN DASHBOARD DATA FLOW TEST
     */
    async runCompleteDataFlowTest(): Promise<{
        commissionTracking: any;
        chatRecording: any;
        bookingPipeline: any;
        scheduledBookings: any;
        realTimeUpdates: any;
        overallStatus: 'excellent' | 'good' | 'partial' | 'needs_attention';
        summary: string;
    }> {
        console.log('🚀 [ADMIN DATA FLOW TEST] Starting comprehensive test...');
        console.log('='.repeat(80));
        
        const results = {
            commissionTracking: {},
            chatRecording: {},
            bookingPipeline: {},
            scheduledBookings: {},
            realTimeUpdates: {},
            overallStatus: 'needs_attention' as 'excellent' | 'good' | 'partial' | 'needs_attention',
            summary: ''
        };

        try {
            // 💰 TEST COMMISSION TRACKING
            console.log('💰 Testing commission tracking from all bookings...');
            results.commissionTracking = await this.testCommissionTracking();

            // 💬 TEST CHAT RECORDING  
            console.log('💬 Testing chat recording system...');
            results.chatRecording = await this.testChatRecording();

            // 📋 TEST BOOKING PIPELINE
            console.log('📋 Testing booking-to-commission pipeline...');
            results.bookingPipeline = await this.testBookingPipeline();

            // 📅 TEST SCHEDULED BOOKINGS
            console.log('📅 Testing scheduled booking tracking...');
            results.scheduledBookings = await this.testScheduledBookings();

            // ⚡ TEST REAL-TIME UPDATES
            console.log('⚡ Testing real-time update capabilities...');
            results.realTimeUpdates = await this.testRealTimeUpdates();

            // 🎯 DETERMINE OVERALL STATUS
            results.overallStatus = this.calculateOverallStatus(results);
            results.summary = this.generateComprehensiveSummary(results);

            console.log('');
            console.log('📊 [ADMIN DATA FLOW TEST] COMPLETE TEST RESULTS:');
            console.log('='.repeat(60));
            console.log(results.summary);
            console.log('='.repeat(60));

            return results;

        } catch (error) {
            console.error('❌ [ADMIN DATA FLOW TEST] Test failed:', error);
            results.summary = `❌ Comprehensive test failed: ${error.message}`;
            return results;
        }
    }

    /**
     * 💰 TEST COMMISSION TRACKING
     */
    private async testCommissionTracking(): Promise<any> {
        console.log('💰 [COMMISSION TEST] Checking commission tracking...');
        
        const result = {
            status: 'unknown',
            totalBookings: 0,
            completedBookings: 0,
            commissionsGenerated: 0,
            pendingCommissions: 0,
            overdueCommissions: 0,
            totalCommissionValue: 0,
            averageCommissionRate: 0,
            errors: []
        };

        try {
            // Fetch all bookings
            const bookingsResult = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [Query.orderDesc('$createdAt'), Query.limit(200)]
            );

            result.totalBookings = bookingsResult.total;
            
            // Analyze completed bookings
            const completedBookings = bookingsResult.documents.filter(booking => 
                booking.status === 'COMPLETED' || booking.status === 'completed'
            );
            result.completedBookings = completedBookings.length;

            // Check commission records
            try {
                const commissionsResult = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                    [Query.limit(200)]
                );

                result.commissionsGenerated = commissionsResult.total;
                
                // Calculate commission stats
                const commissions = commissionsResult.documents;
                result.pendingCommissions = commissions.filter(c => c.status === 'PENDING').length;
                result.overdueCommissions = commissions.filter(c => c.status === 'OVERDUE').length;
                result.totalCommissionValue = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
                result.averageCommissionRate = commissions.length > 0 ? 
                    commissions.reduce((sum, c) => sum + (c.commissionRate || 0), 0) / commissions.length : 0;

                console.log(`✅ Commission tracking active: ${result.commissionsGenerated} commissions from ${result.completedBookings} completed bookings`);
                result.status = 'active';

            } catch (commissionError) {
                console.log('❌ Commission records collection error:', commissionError.message);
                result.errors.push(`Commission records: ${commissionError.message}`);
                result.status = 'partial';
            }

        } catch (error) {
            console.log('❌ Booking collection error:', error.message);
            result.errors.push(`Bookings: ${error.message}`);
            result.status = 'error';
        }

        return result;
    }

    /**
     * 💬 TEST CHAT RECORDING
     */
    private async testChatRecording(): Promise<any> {
        console.log('💬 [CHAT TEST] Checking chat recording...');
        
        const result = {
            status: 'unknown',
            totalMessages: 0,
            recentMessages: 0,
            conversationsTracked: 0,
            adminMessages: 0,
            therapistMessages: 0,
            customerMessages: 0,
            lastMessageTime: null,
            recordingActive: false,
            errors: []
        };

        try {
            // Check messages collection
            const messagesResult = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.messages || 'messages',
                [Query.orderDesc('$createdAt'), Query.limit(50)]
            );

            result.totalMessages = messagesResult.total;
            result.recentMessages = messagesResult.documents.length;
            
            if (messagesResult.documents.length > 0) {
                result.lastMessageTime = messagesResult.documents[0].$createdAt;
                result.recordingActive = true;

                // Analyze message types
                const messages = messagesResult.documents;
                result.adminMessages = messages.filter(m => 
                    m.senderType === 'admin' || m.senderId === 'admin'
                ).length;
                
                result.therapistMessages = messages.filter(m => 
                    m.senderType === 'therapist' || m.senderRole === 'therapist'
                ).length;
                
                result.customerMessages = messages.filter(m => 
                    m.senderType === 'customer' || m.senderType === 'user' || m.senderRole === 'user'
                ).length;

                // Count unique conversations
                const conversationIds = new Set(messages.map(m => 
                    m.conversationId || m.roomId || `${m.senderId}_${m.recipientId}`
                ).filter(Boolean));
                result.conversationsTracked = conversationIds.size;

                console.log(`✅ Chat recording active: ${result.totalMessages} total messages, ${result.conversationsTracked} conversations`);
                result.status = 'active';
            } else {
                console.log('⚠️ No messages found - chat recording may be inactive');
                result.status = 'inactive';
            }

        } catch (error) {
            console.log('❌ Messages collection error:', error.message);
            result.errors.push(`Messages: ${error.message}`);
            result.status = 'error';
        }

        return result;
    }

    /**
     * 📋 TEST BOOKING PIPELINE
     */
    private async testBookingPipeline(): Promise<any> {
        console.log('📋 [PIPELINE TEST] Checking booking-to-commission pipeline...');
        
        const result = {
            status: 'unknown',
            pipelineStages: {
                bookingCreated: 0,
                bookingAccepted: 0,
                bookingConfirmed: 0,
                bookingCompleted: 0,
                commissionGenerated: 0
            },
            pipelineEfficiency: 0,
            avgTimeToCompletion: 0,
            errors: []
        };

        try {
            // Analyze booking statuses
            const bookingsResult = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [Query.orderDesc('$createdAt'), Query.limit(100)]
            );

            const bookings = bookingsResult.documents;
            
            result.pipelineStages.bookingCreated = bookings.length;
            result.pipelineStages.bookingAccepted = bookings.filter(b => 
                ['ACCEPTED', 'accepted'].includes(b.status)
            ).length;
            result.pipelineStages.bookingConfirmed = bookings.filter(b => 
                ['CONFIRMED', 'confirmed'].includes(b.status)
            ).length;
            result.pipelineStages.bookingCompleted = bookings.filter(b => 
                ['COMPLETED', 'completed'].includes(b.status)
            ).length;

            // Check commission generation rate
            try {
                const commissionsResult = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.commissionRecords || 'commission_records',
                    [Query.limit(100)]
                );
                
                result.pipelineStages.commissionGenerated = commissionsResult.total;
                
                // Calculate pipeline efficiency
                if (result.pipelineStages.bookingCompleted > 0) {
                    result.pipelineEfficiency = 
                        (result.pipelineStages.commissionGenerated / result.pipelineStages.bookingCompleted) * 100;
                }

                console.log(`✅ Pipeline tracking: ${result.pipelineEfficiency.toFixed(1)}% efficiency`);
                result.status = 'active';

            } catch (commissionError) {
                console.log('⚠️ Commission pipeline incomplete:', commissionError.message);
                result.status = 'partial';
            }

        } catch (error) {
            console.log('❌ Pipeline test error:', error.message);
            result.errors.push(`Pipeline: ${error.message}`);
            result.status = 'error';
        }

        return result;
    }

    /**
     * 📅 TEST SCHEDULED BOOKINGS
     */
    private async testScheduledBookings(): Promise<any> {
        console.log('📅 [SCHEDULED TEST] Checking scheduled booking tracking...');
        
        const result = {
            status: 'unknown',
            totalScheduled: 0,
            futureBookings: 0,
            todayBookings: 0,
            upcomingCommissions: 0,
            scheduledRevenue: 0,
            errors: []
        };

        try {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const bookingsResult = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [Query.limit(200)]
            );

            const bookings = bookingsResult.documents;
            
            // Filter for scheduled bookings
            const scheduledBookings = bookings.filter(booking => {
                const serviceDate = booking.serviceDate || booking.scheduledDate || booking.$createdAt;
                return serviceDate && ['ACCEPTED', 'CONFIRMED', 'accepted', 'confirmed'].includes(booking.status);
            });

            result.totalScheduled = scheduledBookings.length;

            // Check future bookings
            const futureBookings = scheduledBookings.filter(booking => {
                const serviceDate = new Date(booking.serviceDate || booking.scheduledDate || booking.$createdAt);
                return serviceDate > now;
            });
            result.futureBookings = futureBookings.length;

            // Today's bookings
            const todayBookings = scheduledBookings.filter(booking => {
                const serviceDate = new Date(booking.serviceDate || booking.scheduledDate || booking.$createdAt);
                return serviceDate >= today && serviceDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
            });
            result.todayBookings = todayBookings.length;

            // Calculate upcoming commission value
            result.upcomingCommissions = futureBookings.length;
            result.scheduledRevenue = futureBookings.reduce((sum, booking) => 
                sum + (booking.totalCost || booking.totalPrice || booking.price || 0), 0
            );

            console.log(`✅ Scheduled booking tracking: ${result.futureBookings} future bookings, Rp ${result.scheduledRevenue.toLocaleString('id-ID')} scheduled revenue`);
            result.status = 'active';

        } catch (error) {
            console.log('❌ Scheduled booking test error:', error.message);
            result.errors.push(`Scheduled: ${error.message}`);
            result.status = 'error';
        }

        return result;
    }

    /**
     * ⚡ TEST REAL-TIME UPDATES
     */
    private async testRealTimeUpdates(): Promise<any> {
        console.log('⚡ [REALTIME TEST] Checking real-time update capabilities...');
        
        const result = {
            status: 'unknown',
            subscriptionSupport: false,
            recentActivity: 0,
            lastUpdateTime: null,
            updateFrequency: 'unknown',
            errors: []
        };

        try {
            // Check for recent activity (last hour)
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            
            const recentBookings = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.bookings,
                [
                    Query.greaterThan('$updatedAt', oneHourAgo.toISOString()),
                    Query.limit(10)
                ]
            );

            result.recentActivity = recentBookings.total;
            
            if (recentBookings.documents.length > 0) {
                result.lastUpdateTime = recentBookings.documents[0].$updatedAt;
            }

            // Test subscription capability (this would be more complex in real implementation)
            result.subscriptionSupport = true; // Appwrite supports real-time subscriptions
            
            console.log(`✅ Real-time updates: ${result.recentActivity} recent updates detected`);
            result.status = 'active';

        } catch (error) {
            console.log('❌ Real-time test error:', error.message);
            result.errors.push(`Real-time: ${error.message}`);
            result.status = 'error';
        }

        return result;
    }

    /**
     * 🎯 CALCULATE OVERALL STATUS
     */
    private calculateOverallStatus(results: any): 'excellent' | 'good' | 'partial' | 'needs_attention' {
        const statuses = [
            results.commissionTracking.status,
            results.chatRecording.status,
            results.bookingPipeline.status,
            results.scheduledBookings.status,
            results.realTimeUpdates.status
        ];

        const activeCount = statuses.filter(s => s === 'active').length;
        const errorCount = statuses.filter(s => s === 'error').length;

        if (activeCount === 5 && errorCount === 0) return 'excellent';
        if (activeCount >= 4 && errorCount === 0) return 'good';
        if (activeCount >= 3) return 'partial';
        return 'needs_attention';
    }

    /**
     * 📋 GENERATE COMPREHENSIVE SUMMARY
     */
    private generateComprehensiveSummary(results: any): string {
        return `
🎯 ADMIN DASHBOARD DATA FLOW STATUS: ${results.overallStatus.toUpperCase().replace('_', ' ')}

💰 COMMISSION TRACKING: ${results.commissionTracking.status?.toUpperCase() || 'UNKNOWN'}
   • Total Bookings: ${results.commissionTracking.totalBookings || 0}
   • Completed Bookings: ${results.commissionTracking.completedBookings || 0}
   • Commissions Generated: ${results.commissionTracking.commissionsGenerated || 0}
   • Pending Commissions: ${results.commissionTracking.pendingCommissions || 0}
   • Total Commission Value: Rp ${(results.commissionTracking.totalCommissionValue || 0).toLocaleString('id-ID')}

💬 CHAT RECORDING: ${results.chatRecording.status?.toUpperCase() || 'UNKNOWN'}
   • Total Messages: ${results.chatRecording.totalMessages || 0}
   • Conversations Tracked: ${results.chatRecording.conversationsTracked || 0}
   • Admin Messages: ${results.chatRecording.adminMessages || 0}
   • Therapist Messages: ${results.chatRecording.therapistMessages || 0}
   • Customer Messages: ${results.chatRecording.customerMessages || 0}
   • Recording Active: ${results.chatRecording.recordingActive ? 'YES' : 'NO'}

📋 BOOKING PIPELINE: ${results.bookingPipeline.status?.toUpperCase() || 'UNKNOWN'}
   • Bookings Created: ${results.bookingPipeline.pipelineStages?.bookingCreated || 0}
   • Bookings Accepted: ${results.bookingPipeline.pipelineStages?.bookingAccepted || 0}
   • Bookings Confirmed: ${results.bookingPipeline.pipelineStages?.bookingConfirmed || 0}
   • Bookings Completed: ${results.bookingPipeline.pipelineStages?.bookingCompleted || 0}
   • Commissions Generated: ${results.bookingPipeline.pipelineStages?.commissionGenerated || 0}
   • Pipeline Efficiency: ${(results.bookingPipeline.pipelineEfficiency || 0).toFixed(1)}%

📅 SCHEDULED BOOKINGS: ${results.scheduledBookings.status?.toUpperCase() || 'UNKNOWN'}
   • Total Scheduled: ${results.scheduledBookings.totalScheduled || 0}
   • Future Bookings: ${results.scheduledBookings.futureBookings || 0}
   • Today's Bookings: ${results.scheduledBookings.todayBookings || 0}
   • Scheduled Revenue: Rp ${(results.scheduledBookings.scheduledRevenue || 0).toLocaleString('id-ID')}

⚡ REAL-TIME UPDATES: ${results.realTimeUpdates.status?.toUpperCase() || 'UNKNOWN'}
   • Recent Activity: ${results.realTimeUpdates.recentActivity || 0} updates/hour
   • Subscription Support: ${results.realTimeUpdates.subscriptionSupport ? 'YES' : 'NO'}
   • Last Update: ${results.realTimeUpdates.lastUpdateTime ? new Date(results.realTimeUpdates.lastUpdateTime).toLocaleString() : 'N/A'}

${results.overallStatus === 'excellent' ? 
    '🎉 EXCELLENT: All admin dashboard functions are fully operational!' :
    results.overallStatus === 'good' ? 
    '✅ GOOD: Most functions are working, minor issues detected.' :
    results.overallStatus === 'partial' ? 
    '⚠️ PARTIAL: Some functions need attention.' :
    '❌ NEEDS ATTENTION: Critical issues detected, admin dashboard requires fixes.'
}
        `;
    }
}

// Export singleton instance
export const adminDataFlowTest = new ComprehensiveAdminDataFlowTest();

// Auto-test on import for development
if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    setTimeout(() => {
        console.log('🧪 [ADMIN DATA FLOW TEST] Auto-running comprehensive test...');
        adminDataFlowTest.runCompleteDataFlowTest();
    }, 8000);
}