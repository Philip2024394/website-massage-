/**
 * 🤖 AI FAILURE ANALYZER - Root Cause Detection Engine
 * 
 * This system analyzes test failures and provides:
 * - Root cause identification
 * - Severity classification
 * - Business impact assessment
 * - Fix recommendations
 * - Auto-patch suggestions (future)
 * 
 * Purpose: Transform "test failed" into actionable intelligence
 * 
 * Approach: Pattern matching + Context correlation + Knowledge base
 */

import { ActorState } from '../actors/BaseActor';
import { RevenueViolation } from '../verification/RevenueGuard';
import { getRuleSeverity, shouldBlockDeployment } from '../config/business-rules';

export interface FailureContext {
    error: Error;
    testName: string;
    customer?: ActorState;
    therapist?: ActorState;
    admin?: ActorState;
    databaseState?: Record<string, any>;
    uiState?: Record<string, any>;
    networkLog?: string[];
    realtimeEvents?: any[];
    auditLogs?: any[];
}

export interface RootCauseDiagnosis {
    rootCause: string;
    category: 'REVENUE' | 'DATABASE' | 'UI' | 'NETWORK' | 'REALTIME' | 'BUSINESS_LOGIC' | 'INFRASTRUCTURE';
    severity: 'SEV-1' | 'SEV-2' | 'SEV-3' | 'SEV-4';
    confidence: number; // 0-100%
    businessImpact: string;
    affectedUsers: string[];
    recommendation: string;
    fixSteps: string[];
    codeSnippet?: string;
    shouldBlockDeployment: boolean;
    relatedFailures?: string[];
    timestamp: string;
}

export class FailureAnalyzer {
    /**
     * ========================================================
     * MAIN ANALYSIS ENGINE
     * ========================================================
     */
    static async analyze(error: Error, context: FailureContext): Promise<RootCauseDiagnosis> {
        console.log('\n🤖 [AI Analyzer] Starting failure analysis...');
        console.log(`Error: ${error.message}`);

        const diagnosis = await this.diagnose(error, context);

        console.log(`\n🔍 Root Cause: ${diagnosis.rootCause}`);
        console.log(`📊 Severity: ${diagnosis.severity}`);
        console.log(`💥 Impact: ${diagnosis.businessImpact}`);
        console.log(`🚨 Block Deployment: ${diagnosis.shouldBlockDeployment ? 'YES' : 'NO'}`);
        console.log(`💡 Fix: ${diagnosis.recommendation}`);

        return diagnosis;
    }

    /**
     * ========================================================
     * DIAGNOSIS LOGIC - Pattern Matching
     * ========================================================
     */
    private static async diagnose(error: Error, context: FailureContext): Promise<RootCauseDiagnosis> {
        const errorMessage = error.message.toLowerCase();

        // ========================================================
        // REVENUE VIOLATIONS
        // ========================================================
        if (errorMessage.includes('commission') && errorMessage.includes('not found')) {
            return {
                rootCause: 'Commission record not created after booking acceptance',
                category: 'REVENUE',
                severity: 'SEV-1',
                confidence: 95,
                businessImpact: 'Platform loses revenue on every booking. MONEY LEAK DETECTED.',
                affectedUsers: ['All customers', 'Platform (lost revenue)'],
                recommendation: 'Implement commission creation in bookingService.acceptBooking() method',
                fixSteps: [
                    '1. Open lib/bookingService.ts',
                    '2. Find acceptBooking() method',
                    '3. After booking.providerResponseStatus = "Accepted"',
                    '4. Add: await createCommissionRecord(booking)',
                    '5. Verify commission collection exists in Appwrite',
                    '6. Add idempotency key to prevent duplicates'
                ],
                codeSnippet: `
// In lib/bookingService.ts - acceptBooking()
async acceptBooking(bookingId: string) {
    // Update booking status
    await databases.updateDocument(DATABASE_ID, COLLECTIONS.BOOKINGS, bookingId, {
        providerResponseStatus: 'Accepted',
        acceptedAt: new Date().toISOString()
    });

    // 🔒 CRITICAL: Create commission record
    await databases.createDocument(DATABASE_ID, 'commissions', ID.unique(), {
        bookingId,
        amount: booking.price,
        therapistId: booking.therapistId,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
}`,
                shouldBlockDeployment: true,
                relatedFailures: ['ACCEPTANCE_REQUIRES_COMMISSION'],
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // DUPLICATE COMMISSION
        // ========================================================
        if (errorMessage.includes('duplicate') && errorMessage.includes('commission')) {
            return {
                rootCause: 'Multiple commissions created for single booking (idempotency failure)',
                category: 'REVENUE',
                severity: 'SEV-1',
                confidence: 100,
                businessImpact: 'Customers charged multiple times. POTENTIAL FRAUD.',
                affectedUsers: ['Customers (overcharged)', 'Platform (reputation damage)'],
                recommendation: 'Implement idempotency keys in commission creation',
                fixSteps: [
                    '1. Add unique index on commissions.bookingId',
                    '2. Check if commission exists before creating',
                    '3. Use transaction if database supports it',
                    '4. Add retry logic with exponential backoff'
                ],
                codeSnippet: `
// Add idempotency check
const existing = await databases.listDocuments(DATABASE_ID, 'commissions', [
    Query.equal('bookingId', bookingId)
]);

if (existing.documents.length > 0) {
    console.log('Commission already exists, skipping');
    return existing.documents[0];
}

// Create commission...
`,
                shouldBlockDeployment: true,
                relatedFailures: ['NO_DUPLICATE_COMMISSIONS', 'IDEMPOTENCY_ENFORCEMENT'],
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // CHAT ROOM NOT CREATED
        // ========================================================
        if (errorMessage.includes('chat') && (errorMessage.includes('not found') || errorMessage.includes('not created'))) {
            return {
                rootCause: 'Chat room not created after booking confirmation',
                category: 'BUSINESS_LOGIC',
                severity: 'SEV-2',
                confidence: 90,
                businessImpact: 'Customer and therapist cannot communicate. Booking flow broken.',
                affectedUsers: ['Customers', 'Therapists'],
                recommendation: 'Verify chat room creation in booking flow',
                fixSteps: [
                    '1. Check if createChatRoom() is called in booking creation',
                    '2. Verify chat_sessions collection exists',
                    '3. Check for async/await issues',
                    '4. Verify error handling doesn\'t swallow failures',
                    '5. Add retry logic for chat creation'
                ],
                codeSnippet: `
// In lib/bookingService.ts - createBooking()
const booking = await databases.createDocument(...);

// 🔒 CRITICAL: Create chat room
try {
    const chatRoom = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        ID.unique(),
        {
            bookingId: booking.$id,
            customerId: booking.customerId,
            therapistId: booking.therapistId,
            status: 'active'
        }
    );
    console.log('Chat room created:', chatRoom.$id);
} catch (error) {
    console.error('CRITICAL: Failed to create chat room:', error);
    // DO NOT ignore this error!
    throw error;
}`,
                shouldBlockDeployment: true,
                relatedFailures: ['BOOKING_CREATES_CHAT'],
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // NOTIFICATION NOT DELIVERED
        // ========================================================
        if (errorMessage.includes('notification') && errorMessage.includes('not')) {
            return {
                rootCause: 'Therapist notification not created after booking',
                category: 'BUSINESS_LOGIC',
                severity: 'SEV-2',
                confidence: 85,
                businessImpact: 'Therapist never learns about booking. Revenue opportunity missed.',
                affectedUsers: ['Therapists', 'Platform (missed bookings)'],
                recommendation: 'Check notification creation in booking flow',
                fixSteps: [
                    '1. Verify createNotification() is called',
                    '2. Check COLLECTIONS.NOTIFICATIONS exists',
                    '3. Verify userId matches therapist ID',
                    '4. Check for permission issues',
                    '5. Verify notification collection schema'
                ],
                codeSnippet: `
// In lib/bookingService.ts - createBooking()
await databases.createDocument(
    DATABASE_ID,
    COLLECTIONS.NOTIFICATIONS,
    ID.unique(),
    {
        userId: booking.therapistId,
        type: 'new_booking',
        bookingId: booking.$id,
        title: 'New Booking Request',
        message: \`New booking from \${booking.customerName}\`,
        read: false,
        createdAt: new Date().toISOString()
    }
);`,
                shouldBlockDeployment: true,
                relatedFailures: ['NOTIFICATION_DELIVERY'],
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // NETWORK / APPWRITE API FAILURE
        // ========================================================
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
            return {
                rootCause: 'Network failure or Appwrite API timeout',
                category: 'INFRASTRUCTURE',
                severity: 'SEV-3',
                confidence: 70,
                businessImpact: 'Intermittent failures. May self-resolve on retry.',
                affectedUsers: ['All users (intermittent)'],
                recommendation: 'Implement retry logic with exponential backoff',
                fixSteps: [
                    '1. Add retry logic to API calls',
                    '2. Implement exponential backoff',
                    '3. Add circuit breaker pattern',
                    '4. Monitor Appwrite API status',
                    '5. Add fallback error messages'
                ],
                shouldBlockDeployment: false,
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // UI ELEMENT NOT FOUND
        // ========================================================
        if (errorMessage.includes('selector') || errorMessage.includes('element') || errorMessage.includes('not visible')) {
            return {
                rootCause: 'UI element not found or not visible',
                category: 'UI',
                severity: 'SEV-3',
                confidence: 60,
                businessImpact: 'Test may be flaky or UI changed. Low revenue impact.',
                affectedUsers: ['Test infrastructure'],
                recommendation: 'Update test selectors or fix UI rendering',
                fixSteps: [
                    '1. Verify element selector is correct',
                    '2. Check if UI structure changed',
                    '3. Add wait conditions before interacting',
                    '4. Use data-testid attributes for stability',
                    '5. Check console for React errors'
                ],
                shouldBlockDeployment: false,
                relatedFailures: ['UI_RENDERING_TIME'],
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // DATABASE STATE MISMATCH
        // ========================================================
        if (errorMessage.includes('status') && context.databaseState) {
            return {
                rootCause: 'Database state doesn\'t match expected value',
                category: 'DATABASE',
                severity: 'SEV-2',
                confidence: 80,
                businessImpact: 'Data inconsistency detected. May cause user confusion.',
                affectedUsers: ['All users viewing this data'],
                recommendation: 'Check database update logic',
                fixSteps: [
                    '1. Verify database update is called',
                    '2. Check for race conditions',
                    '3. Add database constraints',
                    '4. Implement optimistic locking',
                    '5. Verify async/await pattern'
                ],
                shouldBlockDeployment: true,
                timestamp: new Date().toISOString()
            };
        }

        // ========================================================
        // GENERIC FAILURE (LOW CONFIDENCE)
        // ========================================================
        return {
            rootCause: `Test failure: ${error.message}`,
            category: 'BUSINESS_LOGIC',
            severity: 'SEV-3',
            confidence: 40,
            businessImpact: 'Unknown impact. Manual investigation required.',
            affectedUsers: ['Unknown'],
            recommendation: 'Manual debugging required. Check logs and screenshots.',
            fixSteps: [
                '1. Review test screenshots',
                '2. Check network log',
                '3. Review database state',
                '4. Check browser console',
                '5. Reproduce manually'
            ],
            shouldBlockDeployment: false,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * ========================================================
     * GENERATE EXECUTIVE REPORT
     * ========================================================
     */
    static generateExecutiveReport(diagnosis: RootCauseDiagnosis): string {
        let report = `\n${'='.repeat(70)}\n`;
        report += `🚨 E2E TEST FAILURE ANALYSIS\n`;
        report += `${'='.repeat(70)}\n\n`;

        report += `📍 ROOT CAUSE\n`;
        report += `   ${diagnosis.rootCause}\n\n`;

        report += `📊 SEVERITY: ${diagnosis.severity}\n`;
        report += `🎯 CONFIDENCE: ${diagnosis.confidence}%\n`;
        report += `📂 CATEGORY: ${diagnosis.category}\n\n`;

        report += `💥 BUSINESS IMPACT\n`;
        report += `   ${diagnosis.businessImpact}\n\n`;

        report += `👥 AFFECTED USERS\n`;
        diagnosis.affectedUsers.forEach(user => {
            report += `   • ${user}\n`;
        });

        report += `\n🚨 DEPLOYMENT STATUS: ${diagnosis.shouldBlockDeployment ? '❌ BLOCKED' : '✅ ALLOWED'}\n\n`;

        report += `💡 RECOMMENDED FIX\n`;
        report += `   ${diagnosis.recommendation}\n\n`;

        report += `🔧 FIX STEPS\n`;
        diagnosis.fixSteps.forEach(step => {
            report += `   ${step}\n`;
        });

        if (diagnosis.codeSnippet) {
            report += `\n📝 CODE SNIPPET\n`;
            report += `${diagnosis.codeSnippet}\n`;
        }

        if (diagnosis.relatedFailures && diagnosis.relatedFailures.length > 0) {
            report += `\n🔗 RELATED BUSINESS RULES\n`;
            diagnosis.relatedFailures.forEach(rule => {
                report += `   • ${rule}\n`;
            });
        }

        report += `\n${'='.repeat(70)}\n`;

        return report;
    }

    /**
     * ========================================================
     * GENERATE DEVELOPER REPORT
     * ========================================================
     */
    static generateDeveloperReport(diagnosis: RootCauseDiagnosis, context: FailureContext): string {
        let report = `\n${'='.repeat(70)}\n`;
        report += `🐛 DEVELOPER DEBUG REPORT\n`;
        report += `${'='.repeat(70)}\n\n`;

        report += `TEST: ${context.testName}\n`;
        report += `ERROR: ${context.error.message}\n`;
        report += `STACK: ${context.error.stack}\n\n`;

        if (context.networkLog && context.networkLog.length > 0) {
            report += `📡 NETWORK LOG (last 10 requests)\n`;
            context.networkLog.slice(-10).forEach(log => {
                report += `   ${log}\n`;
            });
            report += `\n`;
        }

        if (context.databaseState) {
            report += `💾 DATABASE STATE\n`;
            report += `${JSON.stringify(context.databaseState, null, 2)}\n\n`;
        }

        if (context.customer) {
            report += `👤 CUSTOMER ACTIONS\n`;
            context.customer.actions.forEach((action, i) => {
                report += `   ${i + 1}. ${action.name} - ${action.success ? '✅' : '❌'} (${action.duration}ms)\n`;
            });
            report += `\n`;
        }

        if (context.therapist) {
            report += `🧑‍⚕️ THERAPIST ACTIONS\n`;
            context.therapist.actions.forEach((action, i) => {
                report += `   ${i + 1}. ${action.name} - ${action.success ? '✅' : '❌'} (${action.duration}ms)\n`;
            });
            report += `\n`;
        }

        report += `${'='.repeat(70)}\n`;

        return report;
    }
}
