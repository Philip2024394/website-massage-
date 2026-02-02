/**
 * 🔒 SCHEMA DRIFT LOCK - Prevents Field Name Mismatches
 * 
 * Purpose: Ensure all booking data matches Appwrite schema exactly
 * Problem Solved: therapistId vs providerId mismatch that broke realtime subscriptions
 * 
 * This validator MUST be called before any booking document is saved.
 * If validation fails, booking creation MUST fail loudly.
 */

import type { Booking } from '../../types';

/**
 * Appwrite Booking Schema (Authoritative)
 * 
 * Source: docs/APPWRITE_THERAPIST_BOOKINGS_COLLECTION_SCHEMA.md
 */
interface AppwriteBookingSchema {
    // Core identification
    bookingId: string;                          // Required
    bookingDate: string;                        // Required (datetime)
    
    // Provider information (CRITICAL: use providerId, NOT therapistId)
    providerId: string;                         // Required
    providerType: 'therapist' | 'place';        // Required
    providerName: string;                       // Required
    
    // Customer information
    userId?: string;                            // Optional
    userName?: string;                          // Optional
    
    // Service details
    service: '60' | '90' | '120';              // Required
    startTime: string;                          // Required (datetime)
    duration: number;                           // Required
    totalCost?: number;                         // Optional
    paymentMethod?: string;                     // Optional
    
    // Lifecycle status
    status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Expired' | 'Reassigned'; // Required
    providerResponseStatus: 'AwaitingResponse' | 'Confirmed' | 'OnTheWay' | 'Declined' | 'TimedOut'; // Required
    
    // Timestamps
    confirmedAt?: string;                       // Optional (datetime)
    completedAt?: string;                       // Optional (datetime)
    cancelledAt?: string;                       // Optional (datetime)
    responseDeadline?: string;                  // Optional (datetime)
    
    // Other
    cancellationReason?: string;                // Optional
    broadcast?: boolean;                        // Optional
    affiliateCode?: string;                     // Optional
    createdAt: string;                          // Required (datetime)
    updatedAt?: string;                         // Optional (datetime)
}

/**
 * Schema Validation Errors
 */
export class SchemaValidationError extends Error {
    constructor(
        public field: string,
        public expected: string,
        public received: any,
        public severity: 'critical' | 'warning' = 'critical'
    ) {
        super(
            `🔴 SCHEMA VALIDATION FAILED: Field '${field}' - ` +
            `Expected ${expected}, received ${received ? typeof received : 'undefined'}`
        );
        this.name = 'SchemaValidationError';
    }
}

/**
 * Validate booking data against Appwrite schema
 * 
 * @throws SchemaValidationError if validation fails
 */
export function validateBookingSchema(data: any): AppwriteBookingSchema {
    const errors: SchemaValidationError[] = [];

    // ✅ CRITICAL: Check providerId (not therapistId)
    if (!data.providerId) {
        errors.push(new SchemaValidationError(
            'providerId',
            'string (required)',
            data.providerId,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check providerType
    if (!data.providerType || !['therapist', 'place'].includes(data.providerType)) {
        errors.push(new SchemaValidationError(
            'providerType',
            "'therapist' | 'place'",
            data.providerType,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check providerName
    if (!data.providerName || typeof data.providerName !== 'string') {
        errors.push(new SchemaValidationError(
            'providerName',
            'string (required)',
            data.providerName,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check status - Use valid Appwrite enum values
    const validStatuses = ['idle', 'registering', 'searching', 'pending_accept', 'active', 'cancelled', 'completed'];
    if (!data.status || !validStatuses.includes(data.status)) {
        errors.push(new SchemaValidationError(
            'status',
            validStatuses.join(' | '),
            data.status,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check providerResponseStatus
    const validResponseStatuses = ['AwaitingResponse', 'Confirmed', 'OnTheWay', 'Declined', 'TimedOut'];
    if (!data.providerResponseStatus || !validResponseStatuses.includes(data.providerResponseStatus)) {
        errors.push(new SchemaValidationError(
            'providerResponseStatus',
            validResponseStatuses.join(' | '),
            data.providerResponseStatus,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check service duration
    const validServices = ['60', '90', '120'];
    if (!data.service || !validServices.includes(String(data.service))) {
        errors.push(new SchemaValidationError(
            'service',
            "'60' | '90' | '120'",
            data.service,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check bookingId
    if (!data.bookingId || typeof data.bookingId !== 'string') {
        errors.push(new SchemaValidationError(
            'bookingId',
            'string (required)',
            data.bookingId,
            'critical'
        ));
    }

    // ✅ CRITICAL: Check timestamps
    if (!data.createdAt) {
        errors.push(new SchemaValidationError(
            'createdAt',
            'string (ISO datetime, required)',
            data.createdAt,
            'critical'
        ));
    }

    // If there are critical errors, throw immediately
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
        const errorMessage = '🔴 SCHEMA VALIDATION FAILED - BOOKING CANNOT BE SAVED\n\n' +
            'The following required fields are missing or invalid:\n' +
            criticalErrors.map(e => `  • ${e.field}: ${e.message}`).join('\n') +
            '\n\n' +
            '⚠️ This prevents schema drift and ensures realtime subscriptions work correctly.\n' +
            '⚠️ Booking creation MUST be rejected to prevent silent failures.\n';
        
        throw new Error(errorMessage);
    }

    return data as AppwriteBookingSchema;
}

/**
 * Map legacy booking data to Appwrite schema
 * 
 * Handles backward compatibility:
 * - therapistId → providerId
 * - therapistType → providerType
 * - therapistName → providerName
 */
export function mapToAppwriteSchema(data: Partial<Booking>): Partial<AppwriteBookingSchema> & Record<string, any> {
    return {
        ...data,
        // Map legacy fields to schema fields
        providerId: (data as any).therapistId || (data as any).providerId,
        providerType: ((data as any).therapistType as any) || (data as any).providerType || 'therapist',
        providerName: (data as any).therapistName || (data as any).providerName,
        
        // Ensure providerResponseStatus is set
        providerResponseStatus: (data as any).providerResponseStatus || 'AwaitingResponse',
        
        // Ensure status is capitalized correctly
        status: capitalizeStatus((data as any).status as any) as any,
        
        // Keep legacy fields for backward compatibility
        therapistId: (data as any).therapistId,
        therapistName: (data as any).therapistName,
        therapistType: (data as any).therapistType
    };
}

/**
 * Capitalize status to match schema enum
 */
function capitalizeStatus(status?: string): string {
    if (!status) return 'Pending';
    
    const statusMap: Record<string, string> = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'expired': 'Expired',
        'reassigned': 'Reassigned'
    };
    
    return statusMap[status.toLowerCase()] || status;
}

/**
 * Validate that a booking document from Appwrite matches schema
 * 
 * Used to verify existing documents during queries/subscriptions
 */
export function validateAppwriteDocument(doc: any): boolean {
    try {
        validateBookingSchema(doc);
        return true;
    } catch (error) {
        console.error('🔴 Schema validation failed for Appwrite document:', error);
        return false;
    }
}

/**
 * Get schema validation report (non-throwing)
 * 
 * Returns list of validation errors without throwing
 */
export function getSchemaValidationReport(data: any): {
    valid: boolean;
    errors: Array<{ field: string; message: string; severity: string }>;
} {
    const errors: Array<{ field: string; message: string; severity: string }> = [];
    
    try {
        validateBookingSchema(data);
        return { valid: true, errors: [] };
    } catch (error) {
        if (error instanceof SchemaValidationError) {
            errors.push({
                field: error.field,
                message: error.message,
                severity: error.severity
            });
        }
        return { valid: false, errors };
    }
}
