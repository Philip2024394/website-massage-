/**
 * 🔒 HARD BUSINESS RULES (NON-NEGOTIABLE)
 * 
 * These rules are enforced by the E2E testing system.
 * ANY violation = deployment BLOCKED.
 * 
 * Severity: SEV-1 (Revenue Critical)
 */

export const REVENUE_PROTECTION_RULES = {
    /**
     * ❌ FAIL: Booking acceptance WITHOUT commission record
     * Impact: Money lost, no platform revenue
     */
    ACCEPTANCE_REQUIRES_COMMISSION: {
        rule: 'Every booking acceptance MUST create exactly one commission record',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Commission record WITHOUT booking acceptance
     * Impact: Ghost charges, database corruption
     */
    COMMISSION_REQUIRES_ACCEPTANCE: {
        rule: 'Commission records MUST have matching booking acceptance',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Commission amount != booking price
     * Impact: Wrong money calculation
     */
    COMMISSION_AMOUNT_MATCH: {
        rule: 'Commission.amount MUST equal booking.price',
        tolerance: '0.01% variance',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Duplicate commission for same booking
     * Impact: Double charging
     */
    NO_DUPLICATE_COMMISSIONS: {
        rule: 'Maximum 1 commission per booking',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Orphan commission records
     * Impact: Money leak, data inconsistency
     */
    NO_ORPHAN_COMMISSIONS: {
        rule: 'All commissions MUST reference valid booking',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Acceptance accepted twice
     * Impact: Race condition, potential double charge
     */
    IDEMPOTENCY_ENFORCEMENT: {
        rule: 'Booking can only be accepted once',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Acceptance after timeout
     * Impact: Timer broken, user experience fail
     */
    NO_LATE_ACCEPTANCE: {
        rule: 'Acceptance blocked after 2-minute timer expires',
        tolerance: '±1 second',
        blockDeployment: true,
        severity: 'SEV-1'
    }
};

export const USER_EXPERIENCE_RULES = {
    /**
     * ❌ FAIL: Chat room not created after booking
     * Impact: No communication, broken flow
     */
    BOOKING_CREATES_CHAT: {
        rule: 'Chat room MUST be created within 2 seconds of booking',
        tolerance: '±1 second',
        blockDeployment: true,
        severity: 'SEV-2'
    },

    /**
     * ❌ FAIL: Notification not delivered
     * Impact: Therapist never sees booking
     */
    NOTIFICATION_DELIVERY: {
        rule: 'Therapist notification MUST be created within 3 seconds',
        tolerance: '±1 second',
        blockDeployment: true,
        severity: 'SEV-2'
    },

    /**
     * ❌ FAIL: UI state doesn't match database
     * Impact: User sees wrong information
     */
    UI_DATABASE_CONSISTENCY: {
        rule: 'UI state MUST match database state within 1 second',
        tolerance: '1 second',
        blockDeployment: true,
        severity: 'SEV-2'
    },

    /**
     * ❌ FAIL: Countdown timer wrong
     * Impact: Timer inaccurate, user confusion
     */
    TIMER_ACCURACY: {
        rule: 'Countdown timer MUST match database timestamp ±1 second',
        tolerance: '1 second',
        blockDeployment: true,
        severity: 'SEV-2'
    },

    /**
     * ❌ FAIL: Realtime updates not working
     * Impact: Dashboard doesn't update, refresh required
     */
    REALTIME_UPDATES: {
        rule: 'Realtime subscriptions MUST fire within 500ms',
        tolerance: '500ms',
        blockDeployment: true,
        severity: 'SEV-2'
    },

    /**
     * ❌ FAIL: System message not sent
     * Impact: Chat empty, no booking confirmation
     */
    SYSTEM_MESSAGE_DELIVERY: {
        rule: 'System message MUST appear in chat room',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-2'
    }
};

export const AUDIT_INTEGRITY_RULES = {
    /**
     * ❌ FAIL: Missing audit log entry
     * Impact: No trace, compliance violation
     */
    AUDIT_COMPLETENESS: {
        rule: 'All booking events MUST be logged in audit trail',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    },

    /**
     * ❌ FAIL: Audit timestamp mismatch
     * Impact: Wrong timeline, investigation impossible
     */
    AUDIT_TIMESTAMP_ACCURACY: {
        rule: 'Audit log timestamps MUST match event timestamps ±5 seconds',
        tolerance: '5 seconds',
        blockDeployment: false,
        severity: 'SEV-3'
    },

    /**
     * ❌ FAIL: Missing acceptance event in logs
     * Impact: No proof of acceptance
     */
    ACCEPTANCE_LOGGED: {
        rule: 'Booking acceptance MUST create audit log entry',
        tolerance: '0 violations',
        blockDeployment: true,
        severity: 'SEV-1'
    }
};

export const PERFORMANCE_RULES = {
    /**
     * ⚠️ WARNING: Slow UI rendering
     * Impact: Poor user experience
     */
    UI_RENDERING_TIME: {
        rule: 'UI components MUST render within 2 seconds',
        tolerance: '±1 second',
        blockDeployment: false,
        severity: 'SEV-3'
    },

    /**
     * ⚠️ WARNING: Slow notification delivery
     * Impact: Delayed therapist awareness
     */
    NOTIFICATION_LATENCY: {
        rule: 'Notifications SHOULD be delivered within 1 second',
        tolerance: '3 seconds',
        blockDeployment: false,
        severity: 'SEV-3'
    }
};

/**
 * Get all blocking rules that will fail deployment
 */
export function getBlockingRules(): string[] {
    const allRules = [
        ...Object.entries(REVENUE_PROTECTION_RULES),
        ...Object.entries(USER_EXPERIENCE_RULES),
        ...Object.entries(AUDIT_INTEGRITY_RULES),
        ...Object.entries(PERFORMANCE_RULES)
    ];

    return allRules
        .filter(([_, config]) => config.blockDeployment)
        .map(([name]) => name);
}

/**
 * Get rule severity
 */
export function getRuleSeverity(ruleName: string): string {
    const allRules = {
        ...REVENUE_PROTECTION_RULES,
        ...USER_EXPERIENCE_RULES,
        ...AUDIT_INTEGRITY_RULES,
        ...PERFORMANCE_RULES
    };

    return allRules[ruleName as keyof typeof allRules]?.severity || 'UNKNOWN';
}

/**
 * Check if rule failure should block deployment
 */
export function shouldBlockDeployment(ruleName: string): boolean {
    const allRules = {
        ...REVENUE_PROTECTION_RULES,
        ...USER_EXPERIENCE_RULES,
        ...AUDIT_INTEGRITY_RULES,
        ...PERFORMANCE_RULES
    };

    return allRules[ruleName as keyof typeof allRules]?.blockDeployment || false;
}
