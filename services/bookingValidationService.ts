/**
 * BOOKING VALIDATION SERVICE
 * 
 * Single Source of Truth for ALL booking attribute validation
 * Prevents Appwrite errors by validating BEFORE API calls
 * 
 * Usage:
 * - All booking flows MUST use validateBookingPayload()
 * - NO component should call Appwrite directly
 * - Returns validated payload OR readable error list
 */

import { ID } from '../lib/appwrite';

// ===== SCHEMA DEFINITION (MATCHES APPWRITE bookings_collection_id) =====
export const BOOKING_SCHEMA = {
  // REQUIRED FIELDS - MUST NEVER BE NULL/UNDEFINED
  bookingId: { type: 'string', required: true, maxLength: 36 },
  bookingDate: { type: 'datetime', required: true },
  userId: { type: 'string', required: true, maxLength: 100 },
  status: { type: 'string', required: true, maxLength: 64, default: 'Pending' },
  duration: { type: 'integer', required: true, min: 1, max: 365 },
  providerId: { type: 'string', required: true, maxLength: 255 },
  providerType: { type: 'string', required: true, maxLength: 16 },
  providerName: { type: 'string', required: true, maxLength: 255 },
  service: { type: 'string', required: true, maxLength: 16, enum: ['60', '90', '120'] },
  startTime: { type: 'datetime', required: true },
  price: { type: 'integer', required: true, min: 0, max: 1000 },
  createdAt: { type: 'datetime', required: true },
  responseDeadline: { type: 'datetime', required: true },

  // OPTIONAL FIELDS - CAN BE NULL
  totalCost: { type: 'double', required: false },
  paymentMethod: { type: 'string', required: false, maxLength: 64, default: 'Unpaid' },
  userName: { type: 'string', required: false, maxLength: 255 },
  hotelId: { type: 'string', required: false, maxLength: 32 },
  hotelGuestName: { type: 'string', required: false, maxLength: 255 },
  hotelRoomNumber: { type: 'string', required: false, maxLength: 16 },
  therapistId: { type: 'string', required: false, maxLength: 255 },
  therapistName: { type: 'string', required: false, maxLength: 255 },
  therapistType: { type: 'string', required: false, maxLength: 50 },
  scheduledTime: { type: 'datetime', required: false },
  customerName: { type: 'string', required: false, maxLength: 255 },
  customerWhatsApp: { type: 'string', required: false, maxLength: 50 },
  bookingType: { type: 'string', required: false, maxLength: 50 },
  pending: { type: 'string', required: false, maxLength: 255 },
  confirmed: { type: 'string', required: false, maxLength: 255 },
  expired: { type: 'string', required: false, maxLength: 255 },
  completed: { type: 'string', required: false, maxLength: 255 },
  depositReference: { type: 'string', required: false, maxLength: 120 },
  depositProofUrl: { type: 'string', required: false, maxLength: 500 },
  depositStatus: { type: 'enum', required: false, enum: ['pending', 'verified', 'rejected'] },
  depositUploadedAt: { type: 'datetime', required: false },
  depositReviewedAt: { type: 'datetime', required: false },
  arrivalDetectedAt: { type: 'datetime', required: false },
  arrivalDistanceMeters: { type: 'integer', required: false },
  arrivalDetectedBy: { type: 'enum', required: false, enum: ['gps', 'manual', 'qr'] },
  customerLat: { type: 'double', required: false },
  customerLng: { type: 'double', required: false },
  therapistLat: { type: 'double', required: false },
  therapistLng: { type: 'double', required: false },
  offPlatformFlag: { type: 'boolean', required: false },
  completedAt: { type: 'datetime', required: false }
};

// Whitelist of allowed fields (prevents sending extra attributes)
export const ALLOWED_BOOKING_FIELDS = Object.keys(BOOKING_SCHEMA);

// ===== VALIDATION RESULT =====
export interface ValidationResult {
  valid: boolean;
  payload?: any;
  errors?: string[];
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Normalize WhatsApp number
 * - Remove spaces, dashes, parentheses
 * - Ensure +62 prefix
 * - Validate length (10-15 digits after +)
 */
export function normalizeWhatsApp(whatsapp: string): string {
  if (!whatsapp) return '';
  
  // Remove all non-digit characters except +
  let normalized = whatsapp.replace(/[^\d+]/g, '');
  
  // Remove leading zeros
  normalized = normalized.replace(/^0+/, '');
  
  // Add +62 if missing
  if (!normalized.startsWith('+62') && !normalized.startsWith('62')) {
    normalized = '+62' + normalized;
  } else if (normalized.startsWith('62')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Validate and normalize a single field
 */
function validateField(
  fieldName: string,
  value: any,
  schema: any
): { valid: boolean; normalizedValue?: any; error?: string } {
  // Handle required fields
  if (schema.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }

  // Skip validation for optional null/undefined fields
  if (!schema.required && (value === undefined || value === null || value === '')) {
    return { valid: true, normalizedValue: null };
  }

  // Type validation and normalization
  switch (schema.type) {
    case 'string':
      const strValue = String(value).trim();
      
      // Check max length
      if (schema.maxLength && strValue.length > schema.maxLength) {
        return { 
          valid: false, 
          error: `${fieldName} exceeds maximum length of ${schema.maxLength}` 
        };
      }
      
      // Check enum values
      if (schema.enum && !schema.enum.includes(strValue)) {
        return { 
          valid: false, 
          error: `${fieldName} must be one of: ${schema.enum.join(', ')}` 
        };
      }
      
      return { valid: true, normalizedValue: strValue };

    case 'integer':
      const intValue = Number(value);
      
      if (isNaN(intValue) || !Number.isInteger(intValue)) {
        return { valid: false, error: `${fieldName} must be an integer` };
      }
      
      if (schema.min !== undefined && intValue < schema.min) {
        return { valid: false, error: `${fieldName} must be at least ${schema.min}` };
      }
      
      if (schema.max !== undefined && intValue > schema.max) {
        return { valid: false, error: `${fieldName} must be at most ${schema.max}` };
      }
      
      return { valid: true, normalizedValue: intValue };

    case 'double':
      const doubleValue = Number(value);
      
      if (isNaN(doubleValue)) {
        return { valid: false, error: `${fieldName} must be a number` };
      }
      
      return { valid: true, normalizedValue: doubleValue };

    case 'boolean':
      return { valid: true, normalizedValue: Boolean(value) };

    case 'datetime':
      try {
        const dateStr = value instanceof Date ? value.toISOString() : String(value);
        const date = new Date(dateStr);
        
        if (isNaN(date.getTime())) {
          return { valid: false, error: `${fieldName} is not a valid datetime` };
        }
        
        return { valid: true, normalizedValue: date.toISOString() };
      } catch (e) {
        return { valid: false, error: `${fieldName} is not a valid datetime` };
      }

    case 'enum':
      if (!schema.enum.includes(value)) {
        return { 
          valid: false, 
          error: `${fieldName} must be one of: ${schema.enum.join(', ')}` 
        };
      }
      return { valid: true, normalizedValue: value };

    default:
      return { valid: true, normalizedValue: value };
  }
}

/**
 * MAIN VALIDATION FUNCTION
 * 
 * Validates entire booking payload against schema
 * Returns validated payload OR error list
 */
export function validateBookingPayload(rawData: any): ValidationResult {
  const errors: string[] = [];
  const payload: any = {};

  // Step 1: Validate all fields in schema
  for (const [fieldName, schema] of Object.entries(BOOKING_SCHEMA)) {
    const value = rawData[fieldName];
    const result = validateField(fieldName, value, schema);

    if (!result.valid) {
      errors.push(result.error!);
    } else if (result.normalizedValue !== undefined && result.normalizedValue !== null) {
      payload[fieldName] = result.normalizedValue;
    }
    // Don't include null/undefined optional fields
  }

  // Step 2: Apply defaults for optional fields
  if (!payload.status) payload.status = 'Pending';
  if (!payload.paymentMethod) payload.paymentMethod = 'Unpaid';

  // Step 3: Check for extra fields (warn but don't fail)
  for (const key of Object.keys(rawData)) {
    if (!ALLOWED_BOOKING_FIELDS.includes(key)) {
      console.warn(`[BOOKING_VALIDATION] Unknown field "${key}" will be ignored`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, payload };
}

/**
 * PRE-FLIGHT VALIDATION (before user submits)
 * Checks user input fields for common issues
 */
export function validateUserInput(data: {
  customerName?: string;
  customerWhatsApp?: string;
  duration?: number;
  price?: number;
}): ValidationResult {
  const errors: string[] = [];

  // Validate customer name
  if (!data.customerName || data.customerName.trim().length === 0) {
    errors.push('Please enter your name');
  } else if (data.customerName.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (data.customerName.trim().length > 255) {
    errors.push('Name is too long (max 255 characters)');
  }

  // Validate WhatsApp
  if (!data.customerWhatsApp || data.customerWhatsApp.trim().length === 0) {
    errors.push('Please enter your WhatsApp number');
  } else {
    const normalized = normalizeWhatsApp(data.customerWhatsApp);
    const digitsOnly = normalized.replace(/\D/g, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.push('WhatsApp number must be 8-15 digits');
    }
  }

  // Validate duration
  if (!data.duration || ![60, 90, 120].includes(data.duration)) {
    errors.push('Please select a valid duration (60, 90, or 120 minutes)');
  }

  // Validate price
  if (!data.price || data.price <= 0) {
    errors.push('Invalid price');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Generate booking ID (consistent format)
 */
export function generateBookingId(): string {
  return ID.unique();
}

/**
 * Calculate response deadline (30 minutes from now)
 */
export function calculateResponseDeadline(): Date {
  const deadline = new Date();
  deadline.setMinutes(deadline.getMinutes() + 30);
  return deadline;
}

/**
 * LOG HELPERS
 */
export function logValidation(stage: string, data: any) {
  console.group(`[BOOKING_VALIDATION] ${stage}`);
  console.log(data);
  console.groupEnd();
}

export function logPayload(payload: any) {
  console.group('[BOOKING_PAYLOAD] Final validated payload');
  console.table(payload);
  console.groupEnd();
}

export function logAppwriteResponse(response: any) {
  console.group('[APPWRITE_RESPONSE]');
  console.log('Success:', response.$id);
  console.groupEnd();
}
