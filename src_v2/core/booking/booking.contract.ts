/**
 * ============================================================================
 * 📋 BOOKING CONTRACT - STEP 13 CORE EXTRACTION
 * ============================================================================
 * 
 * MANDATORY: This contract defines the exact shape of booking data.
 * 
 * PURPOSE:
 * - Validates payload before any Appwrite operations
 * - Fails early if data doesn't match requirements
 * - Stops AI + UI from sending garbage data
 * - Enforces consistent booking structure
 * 
 * RULES:
 * - If data doesn't match → fail early
 * - No exceptions or "helpful" modifications
 * - Deterministic validation only
 * 
 * ============================================================================
 */

// REQUIRED FIELDS - Must be present
export interface BookingContractRequired {
  customerName: string;
  customerPhone: string;
  serviceType: 'massage' | 'facial' | 'spa';
  duration: 60 | 90 | 120;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

// OPTIONAL FIELDS - May be present
export interface BookingContractOptional {
  customerWhatsApp?: string;
  serviceDescription?: string;
  preferredDateTime?: Date;
  flexible?: boolean;
  preferredProvider?: {
    id: string;
    type: 'therapist' | 'place';
    name: string;
  };
  specialRequests?: string;
  accessibilityNeeds?: string[];
  source?: 'web' | 'whatsapp' | 'chat' | 'admin';
  chatSessionId?: string;
  affiliateCode?: string;
  budget?: {
    min: number;
    max: number;
    currency: 'IDR' | 'USD';
  };
}

// COMPLETE BOOKING CONTRACT
export interface BookingContract extends BookingContractRequired, BookingContractOptional {}

// VALIDATION ERROR TYPES
export interface ValidationError {
  field: string;
  message: string;
  expected: string;
  received: any;
}

// CONTRACT VALIDATION RESULT
export interface ContractValidationResult {
  valid: boolean;
  errors: ValidationError[];
  sanitizedData?: BookingContract;
}

/**
 * MANDATORY CONTRACT VALIDATOR
 * 
 * This function enforces the exact payload shape.
 * If validation fails, booking creation fails immediately.
 * 
 * NO EXCEPTIONS. NO "HELPFUL" MODIFICATIONS.
 */
export function validateBookingContract(payload: unknown): ContractValidationResult {
  const errors: ValidationError[] = [];

  // Type guard
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      errors: [{
        field: 'root',
        message: 'Payload must be an object',
        expected: 'object',
        received: typeof payload
      }]
    };
  }

  const data = payload as Record<string, any>;

  // REQUIRED FIELD VALIDATION
  const requiredValidations: Array<{
    field: keyof BookingContractRequired;
    validator: (value: any) => { valid: boolean; message?: string; expected: string; };
  }> = [
    {
      field: 'customerName',
      validator: (value) => ({
        valid: typeof value === 'string' && value.trim().length >= 2,
        message: 'Must be a string with at least 2 characters',
        expected: 'string (min 2 chars)'
      })
    },
    {
      field: 'customerPhone',
      validator: (value) => ({
        valid: typeof value === 'string' && /^\+?[\d\s\-\(\)]{8,}$/.test(value),
        message: 'Must be a valid phone number',
        expected: 'string (valid phone format)'
      })
    },
    {
      field: 'serviceType',
      validator: (value) => ({
        valid: ['massage', 'facial', 'spa'].includes(value),
        message: 'Must be one of: massage, facial, spa',
        expected: "'massage' | 'facial' | 'spa'"
      })
    },
    {
      field: 'duration',
      validator: (value) => ({
        valid: [60, 90, 120].includes(value),
        message: 'Must be one of: 60, 90, 120',
        expected: '60 | 90 | 120'
      })
    },
    {
      field: 'location',
      validator: (value) => {
        if (!value || typeof value !== 'object') {
          return {
            valid: false,
            message: 'Location must be an object',
            expected: 'object with address'
          };
        }
        
        if (!value.address || typeof value.address !== 'string' || value.address.trim().length < 5) {
          return {
            valid: false,
            message: 'Location must have address string (min 5 chars)',
            expected: 'object with address: string (min 5 chars)'
          };
        }

        // Validate coordinates if present
        if (value.coordinates) {
          const coords = value.coordinates;
          if (
            typeof coords !== 'object' ||
            typeof coords.lat !== 'number' ||
            typeof coords.lng !== 'number' ||
            coords.lat < -90 || coords.lat > 90 ||
            coords.lng < -180 || coords.lng > 180
          ) {
            return {
              valid: false,
              message: 'Invalid coordinates format or range',
              expected: 'coordinates: { lat: number (-90 to 90), lng: number (-180 to 180) }'
            };
          }
        }

        return { valid: true, expected: 'object with address' };
      }
    }
  ];

  // Execute required validations
  for (const { field, validator } of requiredValidations) {
    const result = validator(data[field]);
    if (!result.valid) {
      errors.push({
        field,
        message: result.message || 'Invalid value',
        expected: result.expected,
        received: data[field]
      });
    }
  }

  // OPTIONAL FIELD VALIDATION (only if present)
  if (data.customerWhatsApp && typeof data.customerWhatsApp !== 'string') {
    errors.push({
      field: 'customerWhatsApp',
      message: 'Must be a string if provided',
      expected: 'string | undefined',
      received: data.customerWhatsApp
    });
  }

  if (data.preferredDateTime && !(data.preferredDateTime instanceof Date)) {
    errors.push({
      field: 'preferredDateTime',
      message: 'Must be a Date object if provided',
      expected: 'Date | undefined',
      received: data.preferredDateTime
    });
  }

  if (data.flexible !== undefined && typeof data.flexible !== 'boolean') {
    errors.push({
      field: 'flexible',
      message: 'Must be a boolean if provided',
      expected: 'boolean | undefined',
      received: data.flexible
    });
  }

  if (data.source && !['web', 'whatsapp', 'chat', 'admin'].includes(data.source)) {
    errors.push({
      field: 'source',
      message: 'Invalid source value',
      expected: "'web' | 'whatsapp' | 'chat' | 'admin' | undefined",
      received: data.source
    });
  }

  // Return validation result
  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  // Create sanitized data with only contract fields
  const sanitizedData: BookingContract = {
    // Required fields
    customerName: data.customerName.trim(),
    customerPhone: data.customerPhone.trim(),
    serviceType: data.serviceType,
    duration: data.duration,
    location: {
      address: data.location.address.trim(),
      ...(data.location.coordinates && {
        coordinates: {
          lat: data.location.coordinates.lat,
          lng: data.location.coordinates.lng
        }
      })
    },
    
    // Optional fields (only include if present)
    ...(data.customerWhatsApp && { customerWhatsApp: data.customerWhatsApp.trim() }),
    ...(data.serviceDescription && { serviceDescription: data.serviceDescription.trim() }),
    ...(data.preferredDateTime && { preferredDateTime: data.preferredDateTime }),
    ...(data.flexible !== undefined && { flexible: data.flexible }),
    ...(data.preferredProvider && { preferredProvider: data.preferredProvider }),
    ...(data.specialRequests && { specialRequests: data.specialRequests.trim() }),
    ...(data.accessibilityNeeds && { accessibilityNeeds: data.accessibilityNeeds }),
    ...(data.source && { source: data.source }),
    ...(data.chatSessionId && { chatSessionId: data.chatSessionId }),
    ...(data.affiliateCode && { affiliateCode: data.affiliateCode }),
    ...(data.budget && { budget: data.budget })
  };

  return {
    valid: true,
    errors: [],
    sanitizedData
  };
}

/**
 * TYPE GUARD: Check if data matches BookingContract
 */
export function isValidBookingContract(data: unknown): data is BookingContract {
  const result = validateBookingContract(data);
  return result.valid;
}

export default {
  validateBookingContract,
  isValidBookingContract
};