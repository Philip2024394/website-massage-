/**
 * 💰 REVENUE GUARD - Commission Integrity Enforcement
 * 
 * This class enforces ALL revenue-protection business rules.
 * 
 * Purpose: Ensure every booking acceptance creates exactly one commission.
 * Detect: Orphan commissions, duplicate charges, missing commissions.
 * Action: Block deployment on any violation.
 * 
 * Severity: SEV-1 (Revenue Critical)
 */

import { databases, DATABASE_ID, COLLECTIONS, Query } from '../../lib/appwrite';
import { REVENUE_PROTECTION_RULES } from '../config/business-rules';

export interface CommissionRecord {
    $id: string;
    bookingId: string;
    amount: number;
    therapistId: string;
    createdAt: string;
    status?: string;
}

export interface RevenueViolation {
    type: 'MISSING_COMMISSION' | 'ORPHAN_COMMISSION' | 'DUPLICATE_COMMISSION' | 'AMOUNT_MISMATCH' | 'TIMING_VIOLATION';
    severity: 'SEV-1' | 'SEV-2';
    bookingId: string;
    commissionId?: string;
    message: string;
    impact: string;
    recommendation: string;
    timestamp: string;
}

export class RevenueGuard {
    private violations: RevenueViolation[] = [];
    private commissionsCollectionId: string;

    constructor(commissionsCollectionId: string = 'commissions') {
        this.commissionsCollectionId = commissionsCollectionId;
    }

    /**
     * ========================================================
     * CRITICAL CHECK #1: Verify commission created for booking
     * ========================================================
     */
    async verifyCommissionCreated(bookingId: string): Promise<void> {
        console.log(`🔍 [Revenue Guard] Checking commission for booking ${bookingId}...`);

        try {
            const commissions = await databases.listDocuments(
                DATABASE_ID,
                this.commissionsCollectionId,
                [Query.equal('bookingId', bookingId)]
            );

            if (commissions.documents.length === 0) {
                const violation: RevenueViolation = {
                    type: 'MISSING_COMMISSION',
                    severity: 'SEV-1',
                    bookingId,
                    message: `❌ CRITICAL: Booking ${bookingId} accepted but NO commission created`,
                    impact: 'Platform loses revenue on this booking. Money leak detected.',
                    recommendation: 'Check commission creation logic in bookingService.acceptBooking()',
                    timestamp: new Date().toISOString()
                };

                this.violations.push(violation);
                throw new Error(JSON.stringify(violation, null, 2));
            }

            console.log(`✅ [Revenue Guard] Commission exists for booking ${bookingId}`);

        } catch (error: any) {
            if (error.message.includes('Collection with the requested ID could not be found')) {
                throw new Error(`❌ FATAL: Commissions collection '${this.commissionsCollectionId}' does not exist. Create it immediately.`);
            }
            throw error;
        }
    }

    /**
     * ========================================================
     * CRITICAL CHECK #2: Verify commission amount matches booking price
     * ========================================================
     */
    async verifyCommissionAmount(bookingId: string, expectedAmount: number): Promise<void> {
        console.log(`🔍 [Revenue Guard] Verifying commission amount for booking ${bookingId}...`);

        const commissions = await databases.listDocuments(
            DATABASE_ID,
            this.commissionsCollectionId,
            [Query.equal('bookingId', bookingId)]
        );

        if (commissions.documents.length === 0) {
            throw new Error(`Commission not found for booking ${bookingId}`);
        }

        const commission = commissions.documents[0] as unknown as CommissionRecord;
        const actualAmount = commission.amount;
        const tolerance = expectedAmount * 0.0001; // 0.01% tolerance for rounding

        if (Math.abs(actualAmount - expectedAmount) > tolerance) {
            const violation: RevenueViolation = {
                type: 'AMOUNT_MISMATCH',
                severity: 'SEV-1',
                bookingId,
                commissionId: commission.$id,
                message: `❌ CRITICAL: Commission amount ${actualAmount} ≠ Booking price ${expectedAmount}`,
                impact: 'Wrong money calculation. Revenue integrity violated.',
                recommendation: 'Check commission calculation logic',
                timestamp: new Date().toISOString()
            };

            this.violations.push(violation);
            throw new Error(JSON.stringify(violation, null, 2));
        }

        console.log(`✅ [Revenue Guard] Commission amount ${actualAmount} matches booking price ${expectedAmount}`);
    }

    /**
     * ========================================================
     * CRITICAL CHECK #3: Verify no duplicate commissions
     * ========================================================
     */
    async verifyNoDuplicates(bookingId: string): Promise<void> {
        console.log(`🔍 [Revenue Guard] Checking for duplicate commissions...`);

        const commissions = await databases.listDocuments(
            DATABASE_ID,
            this.commissionsCollectionId,
            [Query.equal('bookingId', bookingId)]
        );

        if (commissions.documents.length > 1) {
            const violation: RevenueViolation = {
                type: 'DUPLICATE_COMMISSION',
                severity: 'SEV-1',
                bookingId,
                message: `❌ CRITICAL: ${commissions.documents.length} commissions found for booking ${bookingId}`,
                impact: 'Customer charged multiple times. Potential fraud.',
                recommendation: 'Implement idempotency keys in commission creation',
                timestamp: new Date().toISOString()
            };

            this.violations.push(violation);
            throw new Error(JSON.stringify(violation, null, 2));
        }

        console.log(`✅ [Revenue Guard] No duplicate commissions`);
    }

    /**
     * ========================================================
     * CRITICAL CHECK #4: Scan for orphan commissions
     * ========================================================
     */
    async scanForOrphanCommissions(): Promise<RevenueViolation[]> {
        console.log(`🔍 [Revenue Guard] Scanning for orphan commissions...`);

        const orphans: RevenueViolation[] = [];

        try {
            // Get all commissions
            const allCommissions = await databases.listDocuments(
                DATABASE_ID,
                this.commissionsCollectionId,
                [Query.limit(100)] // Adjust limit as needed
            );

            console.log(`Found ${allCommissions.documents.length} total commissions`);

            // Check each commission has valid booking
            for (const commission of allCommissions.documents) {
                const commissionRecord = commission as unknown as CommissionRecord;
                const bookingId = commissionRecord.bookingId;

                try {
                    const booking = await databases.getDocument(
                        DATABASE_ID,
                        COLLECTIONS.BOOKINGS!,
                        bookingId
                    );

                    // Verify booking is actually accepted
                    if (booking.providerResponseStatus !== 'Accepted') {
                        const violation: RevenueViolation = {
                            type: 'ORPHAN_COMMISSION',
                            severity: 'SEV-1',
                            bookingId,
                            commissionId: commissionRecord.$id,
                            message: `❌ CRITICAL: Commission ${commissionRecord.$id} exists but booking ${bookingId} status = ${booking.providerResponseStatus}`,
                            impact: 'Commission created without valid acceptance. Revenue leak.',
                            recommendation: 'Delete orphan commission and fix acceptance logic',
                            timestamp: new Date().toISOString()
                        };

                        orphans.push(violation);
                        this.violations.push(violation);
                    }

                } catch (error: any) {
                    if (error.code === 404) {
                        const violation: RevenueViolation = {
                            type: 'ORPHAN_COMMISSION',
                            severity: 'SEV-1',
                            bookingId,
                            commissionId: commissionRecord.$id,
                            message: `❌ CRITICAL: Commission ${commissionRecord.$id} references non-existent booking ${bookingId}`,
                            impact: 'Orphan commission record. Database integrity violated.',
                            recommendation: `Delete commission ${commissionRecord.$id}`,
                            timestamp: new Date().toISOString()
                        };

                        orphans.push(violation);
                        this.violations.push(violation);
                    }
                }
            }

            if (orphans.length === 0) {
                console.log(`✅ [Revenue Guard] No orphan commissions found`);
            } else {
                console.error(`❌ [Revenue Guard] Found ${orphans.length} orphan commissions!`);
                orphans.forEach(o => console.error(JSON.stringify(o, null, 2)));
            }

            return orphans;

        } catch (error: any) {
            if (error.message.includes('Collection with the requested ID could not be found')) {
                console.warn(`⚠️ [Revenue Guard] Commissions collection not found, skipping orphan scan`);
                return [];
            }
            throw error;
        }
    }

    /**
     * ========================================================
     * CRITICAL CHECK #5: Verify commission timing
     * ========================================================
     */
    async verifyCommissionTiming(bookingId: string, acceptanceTimestamp: Date): Promise<void> {
        console.log(`🔍 [Revenue Guard] Verifying commission timing...`);

        const commissions = await databases.listDocuments(
            DATABASE_ID,
            this.commissionsCollectionId,
            [Query.equal('bookingId', bookingId)]
        );

        if (commissions.documents.length === 0) {
            throw new Error(`Commission not found for booking ${bookingId}`);
        }

        const commission = commissions.documents[0] as unknown as CommissionRecord;
        const commissionTime = new Date(commission.createdAt);
        const timeDiff = commissionTime.getTime() - acceptanceTimestamp.getTime();

        // Commission should be created within 5 seconds of acceptance
        const MAX_LATENCY = 5000; // 5 seconds

        if (timeDiff > MAX_LATENCY) {
            const violation: RevenueViolation = {
                type: 'TIMING_VIOLATION',
                severity: 'SEV-2',
                bookingId,
                commissionId: commission.$id,
                message: `⚠️ Commission created ${timeDiff}ms after acceptance (>${MAX_LATENCY}ms)`,
                impact: 'Slow commission creation. Potential race conditions.',
                recommendation: 'Optimize commission creation logic',
                timestamp: new Date().toISOString()
            };

            this.violations.push(violation);
            console.warn(JSON.stringify(violation, null, 2));
        } else {
            console.log(`✅ [Revenue Guard] Commission timing acceptable (${timeDiff}ms)`);
        }
    }

    /**
     * ========================================================
     * CLEANUP: Clear orphan commissions (use with caution)
     * ========================================================
     */
    async clearOrphanCommissions(): Promise<number> {
        console.log(`🧹 [Revenue Guard] Clearing orphan commissions...`);

        const orphans = await this.scanForOrphanCommissions();
        let cleared = 0;

        for (const orphan of orphans) {
            if (orphan.commissionId) {
                try {
                    await databases.deleteDocument(
                        DATABASE_ID,
                        this.commissionsCollectionId,
                        orphan.commissionId
                    );
                    console.log(`✅ Deleted orphan commission: ${orphan.commissionId}`);
                    cleared++;
                } catch (error) {
                    console.error(`❌ Failed to delete orphan commission ${orphan.commissionId}:`, error);
                }
            }
        }

        console.log(`🧹 Cleared ${cleared} orphan commissions`);
        return cleared;
    }

    /**
     * ========================================================
     * SNAPSHOT: Capture pre-acceptance state
     * ========================================================
     */
    async snapshotPreAcceptanceState(bookingId: string): Promise<{ booking: any; commissions: any[] }> {
        console.log(`📸 [Revenue Guard] Capturing pre-acceptance snapshot...`);

        const booking = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.BOOKINGS!,
            bookingId
        );

        let commissions: any[] = [];
        try {
            const commissionsResult = await databases.listDocuments(
                DATABASE_ID,
                this.commissionsCollectionId,
                [Query.equal('bookingId', bookingId)]
            );
            commissions = commissionsResult.documents;
        } catch (error) {
            // Commissions collection may not exist
        }

        const snapshot = { booking, commissions };
        console.log(`📸 Snapshot captured:`, JSON.stringify(snapshot, null, 2));

        return snapshot;
    }

    /**
     * ========================================================
     * REPORT: Get all violations
     * ========================================================
     */
    getViolations(): RevenueViolation[] {
        return this.violations;
    }

    /**
     * ========================================================
     * REPORT: Check if deployment should be blocked
     * ========================================================
     */
    shouldBlockDeployment(): boolean {
        return this.violations.some(v => v.severity === 'SEV-1');
    }

    /**
     * ========================================================
     * REPORT: Generate executive summary
     * ========================================================
     */
    generateReport(): string {
        const sev1Count = this.violations.filter(v => v.severity === 'SEV-1').length;
        const sev2Count = this.violations.filter(v => v.severity === 'SEV-2').length;

        let report = `\n${'='.repeat(60)}\n`;
        report += `💰 REVENUE GUARD REPORT\n`;
        report += `${'='.repeat(60)}\n\n`;

        if (this.violations.length === 0) {
            report += `✅ ALL REVENUE CHECKS PASSED\n`;
            report += `✅ No violations detected\n`;
            report += `✅ Deployment: APPROVED\n`;
        } else {
            report += `❌ REVENUE VIOLATIONS DETECTED\n\n`;
            report += `   SEV-1 (Critical): ${sev1Count}\n`;
            report += `   SEV-2 (High): ${sev2Count}\n\n`;

            if (sev1Count > 0) {
                report += `❌ DEPLOYMENT: BLOCKED\n`;
                report += `   Action Required: Fix all SEV-1 violations immediately\n\n`;
            }

            report += `\nViolation Details:\n`;
            report += `${'='.repeat(60)}\n`;

            this.violations.forEach((v, i) => {
                report += `\n${i + 1}. ${v.type} [${v.severity}]\n`;
                report += `   Booking ID: ${v.bookingId}\n`;
                if (v.commissionId) report += `   Commission ID: ${v.commissionId}\n`;
                report += `   Message: ${v.message}\n`;
                report += `   Impact: ${v.impact}\n`;
                report += `   Fix: ${v.recommendation}\n`;
            });
        }

        report += `\n${'='.repeat(60)}\n`;

        return report;
    }
}
