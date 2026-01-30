/**
 * 🔒 BOOKING SYSTEM DEFENSIVE GUARD
 * 
 * Tier-1 Production System Protection
 * - Validates ALL booking operations before execution
 * - Prevents schema violations at runtime
 * - Isolates booking system from external changes
 * - Zero-risk defensive boundaries
 * 
 * ENGINEERING PRINCIPLES:
 * - Single Source of Truth for booking validation
 * - Fail-fast with detailed error reporting
 * - Contract-based isolation from app changes
 * - Production-grade error handling
 */

// ===== VERIFIED APPWRITE SCHEMA CONTRACT =====
/**
 * 🔍 SCHEMA VERIFIED AGAINST LIVE APPWRITE DATABASE
 * 
 * This schema was tested by creating actual documents in Appwrite.
 * Collection: "bookings" 
 * Database: 68f76ee1000e64ca8d05
 * 
 * ✅ SUCCESS: Document creation works with these fields
 * ❌ REJECTED: Unknown fields cause errors
 */
export const BOOKING_CONTRACT = {
  REQUIRED_FIELDS: [
    'userId',
    'status', 
    'therapistId',
    'serviceDuration',
    'location',
    'price',
    'customerName',
    'customerWhatsApp'
  ] as const,
  
  FIELD_TYPES: {
    userId: 'string',
    status: 'string', // ENUM: idle, registering, searching, pending_accept, active, cancelled, completed
    therapistId: 'string',
    serviceDuration: 'string', // "60", "90", "120" 
    location: 'string',
    price: 'number',
    customerName: 'string',
    customerWhatsApp: 'string'
  } as const,
  
  VALID_STATUS_VALUES: [
    'idle',
    'registering', 
    'searching',
    'pending_accept', 
    'active',
    'cancelled',
    'completed'
  ] as const,
  
  CONSTRAINTS: {
    userId: { maxLength: 100, pattern: /^[A-Za-z0-9_-]+$/ },
    status: { enum: ['idle', 'registering', 'searching', 'pending_accept', 'active', 'cancelled', 'completed'] },
    therapistId: { maxLength: 100, pattern: /^[A-Za-z0-9_-]+$/ },
    serviceDuration: { enum: ['60', '90', '120'] },
    location: { maxLength: 500, minLength: 3 },
    price: { min: 100000, max: 2000000 },
    customerName: { maxLength: 200, minLength: 2 },
    customerWhatsApp: { pattern: /^\+62\d{9,13}$/, maxLength: 20 }
  } as const
} as const;

// ===== VALIDATION RESULT TYPES =====
export interface BookingValidationResult {
  readonly valid: boolean;
  readonly data?: BookingPayload;
  readonly errors?: ReadonlyArray<BookingValidationError>;
}

export interface BookingValidationError {
  readonly field: string;
  readonly code: string;
  readonly message: string;
  readonly received?: unknown;
  readonly expected?: string;
}

export interface BookingPayload {
  readonly [key: string]: unknown;
}

// ===== DEFENSIVE GUARD CLASS =====
export class BookingSystemGuard {
  private static instance: BookingSystemGuard;
  
  private constructor() {
    // Singleton pattern - only one guard instance
  }
  
  public static getInstance(): BookingSystemGuard {
    if (!BookingSystemGuard.instance) {
      BookingSystemGuard.instance = new BookingSystemGuard();
    }
    return BookingSystemGuard.instance;
  }
  
  /**
   * PRIMARY VALIDATION - All booking data MUST pass through this
   * @param data Raw booking data from any source
   * @returns Validation result with sanitized data or detailed errors
   */
  public validateBookingPayload(data: unknown): BookingValidationResult {
    const errors: BookingValidationError[] = [];
    
    // Type guard - must be object
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        errors: [{
          field: 'root',
          code: 'INVALID_TYPE',
          message: 'Booking data must be an object',
          received: typeof data
        }]
      };
    }
    
    const payload = data as Record<string, unknown>;
    const validatedData: Record<string, unknown> = {};
    
    // Validate required fields
    for (const field of BOOKING_CONTRACT.REQUIRED_FIELDS) {
      const value = payload[field];
      
      if (value === null || value === undefined || value === '') {
        errors.push({
          field,
          code: 'REQUIRED_FIELD_MISSING',
          message: `Field '${field}' is required`,
          received: value
        });
        continue;
      }
      
      // Type validation
      const expectedType = BOOKING_CONTRACT.FIELD_TYPES[field];
      const actualType = typeof value;
      
      if (actualType !== expectedType) {
        errors.push({
          field,
          code: 'INVALID_TYPE',
          message: `Field '${field}' must be ${expectedType}`,
          received: actualType,
          expected: expectedType
        });
        continue;
      }
      
      // Constraint validation
      const constraints = BOOKING_CONTRACT.CONSTRAINTS[field as keyof typeof BOOKING_CONTRACT.CONSTRAINTS];
      if (constraints) {
        const constraintError = this.validateConstraints(field, value, constraints);
        if (constraintError) {
          errors.push(constraintError);
          continue;
        }
      }
      
      validatedData[field] = value;
    }
    
    // Return result
    if (errors.length > 0) {
      return { valid: false, errors };
    }
    
    return { 
      valid: true, 
      data: validatedData as BookingPayload 
    };
  }
  
  /**
   * NAVIGATION PROTECTION - Prevents external interference with booking flow
   */
  public protectBookingFlow(): () => void {
    const originalSetPage = (window as any).__appSetPage;
    const originalDispatchEvent = window.dispatchEvent;
    
    // Override global navigation during booking
    (window as any).__bookingInProgress = true;
    (window as any).__appSetPage = (page: string) => {
      console.warn(`🔒 [BOOKING GUARD] Navigation to '${page}' blocked during booking flow`);
      return false;
    };
    
    window.dispatchEvent = (event: Event) => {
      if (event.type === 'navigateToLanding') {
        console.warn('🔒 [BOOKING GUARD] Landing page navigation blocked during booking');
        return true; // Block event
      }
      return originalDispatchEvent.call(window, event);
    };
    
    // Return cleanup function
    return () => {
      (window as any).__bookingInProgress = false;
      if (originalSetPage) {
        (window as any).__appSetPage = originalSetPage;
      }
      if (originalDispatchEvent) {
        window.dispatchEvent = originalDispatchEvent;
      }
      console.log('✅ [BOOKING GUARD] Navigation protection removed');
    };
  }
  
  /**
   * APPWRITE COLLECTION VERIFICATION
   * Ensures correct collection ID is being used
   */
  public verifyAppwriteConfig(): boolean {
    // This would check actual Appwrite connection in production
    const collectionId = process.env.VITE_APPWRITE_BOOKINGS_COLLECTION_ID;
    
    if (!collectionId) {
      console.error('🚨 [BOOKING GUARD] Missing VITE_APPWRITE_BOOKINGS_COLLECTION_ID');
      return false;
    }
    
    if (collectionId !== 'bookings' && collectionId !== 'bookings_collection_id') {
      console.error('🚨 [BOOKING GUARD] Unknown collection ID:', collectionId);
      return false;
    }
    
    return true;
  }
  
  // ===== PRIVATE HELPERS =====
  
  private validateConstraints(
    field: string, 
    value: unknown, 
    constraints: any
  ): BookingValidationError | null {
    
    if (constraints.maxLength && typeof value === 'string' && value.length > constraints.maxLength) {
      return {
        field,
        code: 'MAX_LENGTH_EXCEEDED',
        message: `Field '${field}' exceeds maximum length of ${constraints.maxLength}`,
        received: value.length,
        expected: `<= ${constraints.maxLength}`
      };
    }
    
    if (constraints.minLength && typeof value === 'string' && value.length < constraints.minLength) {
      return {
        field,
        code: 'MIN_LENGTH_NOT_MET',
        message: `Field '${field}' must be at least ${constraints.minLength} characters`,
        received: value.length,
        expected: `>= ${constraints.minLength}`
      };
    }
    
    if (constraints.min && typeof value === 'number' && value < constraints.min) {
      return {
        field,
        code: 'MIN_VALUE_NOT_MET',
        message: `Field '${field}' must be at least ${constraints.min}`,
        received: value,
        expected: `>= ${constraints.min}`
      };
    }
    
    if (constraints.max && typeof value === 'number' && value > constraints.max) {
      return {
        field,
        code: 'MAX_VALUE_EXCEEDED',
        message: `Field '${field}' must be at most ${constraints.max}`,
        received: value,
        expected: `<= ${constraints.max}`
      };
    }
    
    if (constraints.enum && !constraints.enum.includes(value)) {
      return {
        field,
        code: 'INVALID_ENUM_VALUE',
        message: `Field '${field}' must be one of: ${constraints.enum.join(', ')}`,
        received: value,
        expected: constraints.enum.join(' | ')
      };
    }
    
    if (constraints.pattern && typeof value === 'string' && !constraints.pattern.test(value)) {
      return {
        field,
        code: 'PATTERN_MISMATCH',
        message: `Field '${field}' does not match required format`,
        received: value
      };
    }
    
    return null;
  }
}

// ===== SINGLETON EXPORT =====
export const bookingGuard = BookingSystemGuard.getInstance();