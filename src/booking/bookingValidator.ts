/**
 * Elite Booking Validator Module
 * 
 * Check required fields, timestamps, and data integrity.
 * Provides comprehensive validation for booking drafts.
 * 
 * @module bookingValidator
 */

import { logger } from '../utils/logger';
import type { BookingDraft, BookingDraftData } from './bookingDraft';
import { enterpriseMonitoringService } from '../services/enterpriseMonitoringService';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidation {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

const FIELD_VALIDATIONS: Record<keyof BookingDraftData, FieldValidation> = {
  customerName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  whatsappNumber: {
    required: true,
    minLength: 8,
    maxLength: 15,
    pattern: /^[0-9]+$/
  },
  countryCode: {
    required: true,
    pattern: /^\+[0-9]{1,4}$/
  },
  addressLine1: {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  addressLine2: {
    required: false,
    maxLength: 200
  },
  hotelVillaName: {
    required: false,
    maxLength: 100
  },
  roomNumber: {
    required: false,
    maxLength: 20
  },
  therapistId: {
    required: true,
    minLength: 1
  },
  massageType: {
    required: false
  },
  duration: {
    required: false,
    custom: (value: number) => value > 0 && value <= 480 // Max 8 hours
  },
  scheduledTime: {
    required: false,
    custom: (value: Date | string) => {
      const date = value instanceof Date ? value : new Date(value);
      return date > new Date(); // Must be in future
    }
  },
  discountCode: {
    required: false,
    maxLength: 50,
    pattern: /^[A-Z0-9-]+$/
  },
  specialInstructions: {
    required: false,
    maxLength: 500
  },
  sessionId: {
    required: false
  },
  placeId: {
    required: false
  }
};

/**
 * Validate booking draft
 */
export function validateBookingDraft(draft: BookingDraft): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  logger.info(`🔍 Validating booking draft: ${draft.id}`);
  
  // Validate each field
  Object.entries(FIELD_VALIDATIONS).forEach(([field, validation]) => {
    const value = draft.data[field as keyof BookingDraftData];
    const fieldErrors = validateField(field as keyof BookingDraftData, value, validation);
    
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
    }
  });
  
  // Check for warnings
  if (!draft.data.scheduledTime) {
    warnings.push('Scheduled time is not set');
  }
  
  if (!draft.data.massageType) {
    warnings.push('Massage type is not specified');
  }
  
  if (!draft.data.hotelVillaName && !draft.data.addressLine2) {
    warnings.push('Location details are minimal');
  }
  
  // Check version and timestamp
  if (draft.version < 1) {
    errors.push('Invalid draft version');
  }
  
  const draftAge = Date.now() - new Date(draft.timestamp).getTime();
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  if (draftAge > MAX_AGE) {
    warnings.push(`Draft is ${Math.floor(draftAge / (24 * 60 * 60 * 1000))} days old`);
  }
  
  const isValid = errors.length === 0;
  
  if (isValid) {
    logger.info(`✅ Booking draft is valid: ${draft.id}`, {
      warnings: warnings.length
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_validation_passed',
      value: 1,
      unit: 'count'
    });
  } else {
    logger.error(`❌ Booking draft validation failed: ${draft.id}`, {
      errors,
      warnings
    });
    
    enterpriseMonitoringService.recordBusinessMetric({
      name: 'booking_validation_failed',
      value: 1,
      unit: 'count'
    });
  }
  
  return {
    isValid,
    errors,
    warnings
  };
}

/**
 * Validate single field
 */
export function validateField(
  field: keyof BookingDraftData,
  value: any,
  validation: FieldValidation
): string[] {
  const errors: string[] = [];
  
  // Required check
  if (validation.required && (value === undefined || value === null || value === '')) {
    errors.push(`${field} is required`);
    return errors;
  }
  
  // Skip further validation if not required and empty
  if (!validation.required && (value === undefined || value === null || value === '')) {
    return errors;
  }
  
  // Length validation
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`${field} must be at least ${validation.minLength} characters`);
    }
    
    if (validation.maxLength && value.length > validation.maxLength) {
      errors.push(`${field} must not exceed ${validation.maxLength} characters`);
    }
  }
  
  // Pattern validation
  if (validation.pattern && typeof value === 'string') {
    if (!validation.pattern.test(value)) {
      errors.push(`${field} has invalid format`);
    }
  }
  
  // Custom validation
  if (validation.custom && !validation.custom(value)) {
    errors.push(`${field} failed custom validation`);
  }
  
  return errors;
}

/**
 * Validate phone number specifically
 */
export function validatePhoneNumber(countryCode: string, number: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate country code
  if (!countryCode || !countryCode.startsWith('+')) {
    errors.push('Invalid country code format');
  }
  
  // Validate number
  if (!number || number.length < 8 || number.length > 15) {
    errors.push('Phone number must be 8-15 digits');
  }
  
  if (!/^[0-9]+$/.test(number)) {
    errors.push('Phone number must contain only digits');
  }
  
  // Check for common invalid patterns
  if (/^0+$/.test(number)) {
    errors.push('Phone number cannot be all zeros');
  }
  
  if (/^1{8,}$/.test(number)) {
    warnings.push('Phone number looks suspicious (all ones)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate address
 */
export function validateAddress(data: Pick<BookingDraftData, 'addressLine1' | 'addressLine2' | 'hotelVillaName' | 'roomNumber'>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!data.addressLine1 || data.addressLine1.trim().length < 5) {
    errors.push('Address line 1 must be at least 5 characters');
  }
  
  // Check if hotel/villa name is provided but no room number
  if (data.hotelVillaName && !data.roomNumber) {
    warnings.push('Room number not specified for hotel/villa');
  }
  
  // Check if room number is provided but no hotel/villa name
  if (data.roomNumber && !data.hotelVillaName) {
    warnings.push('Hotel/villa name not specified for room number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate scheduled time
 */
export function validateScheduledTime(scheduledTime: Date | string | undefined): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!scheduledTime) {
    warnings.push('Scheduled time is not set');
    return { isValid: true, errors, warnings };
  }
  
  const date = scheduledTime instanceof Date ? scheduledTime : new Date(scheduledTime);
  
  if (isNaN(date.getTime())) {
    errors.push('Invalid scheduled time format');
    return { isValid: false, errors, warnings };
  }
  
  const now = new Date();
  const minTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
  const maxTime = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  
  if (date < minTime) {
    errors.push('Scheduled time must be at least 30 minutes from now');
  }
  
  if (date > maxTime) {
    warnings.push('Scheduled time is more than 30 days from now');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get validation errors for specific fields
 */
export function getFieldErrors(draft: BookingDraft, fields: Array<keyof BookingDraftData>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  
  fields.forEach(field => {
    const validation = FIELD_VALIDATIONS[field];
    const value = draft.data[field];
    const errors = validateField(field, value, validation);
    
    if (errors.length > 0) {
      fieldErrors[field] = errors;
    }
  });
  
  return fieldErrors;
}

/**
 * Check if draft is ready for submission
 */
export function isReadyForSubmission(draft: BookingDraft): boolean {
  const validation = validateBookingDraft(draft);
  
  // Must be valid with no errors
  if (!validation.isValid) {
    return false;
  }
  
  // Must have essential information
  const hasEssentials = 
    draft.data.customerName &&
    draft.data.whatsappNumber &&
    draft.data.addressLine1 &&
    draft.data.therapistId;
  
  return !!hasEssentials;
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(draft: BookingDraft): number {
  const requiredFields = Object.entries(FIELD_VALIDATIONS)
    .filter(([_, validation]) => validation.required)
    .map(([field]) => field as keyof BookingDraftData);
  
  const optionalFields = Object.entries(FIELD_VALIDATIONS)
    .filter(([_, validation]) => !validation.required)
    .map(([field]) => field as keyof BookingDraftData);
  
  let requiredFilled = 0;
  let optionalFilled = 0;
  
  requiredFields.forEach(field => {
    const value = draft.data[field];
    if (value !== undefined && value !== null && value !== '') {
      requiredFilled++;
    }
  });
  
  optionalFields.forEach(field => {
    const value = draft.data[field];
    if (value !== undefined && value !== null && value !== '') {
      optionalFilled++;
    }
  });
  
  // Weight required fields more heavily (70%) vs optional (30%)
  const requiredWeight = 0.7;
  const optionalWeight = 0.3;
  
  const requiredScore = (requiredFilled / requiredFields.length) * requiredWeight;
  const optionalScore = (optionalFilled / optionalFields.length) * optionalWeight;
  
  return Math.round((requiredScore + optionalScore) * 100);
}

/**
 * Get required fields that are missing
 */
export function getMissingRequiredFields(draft: BookingDraft): string[] {
  const missing: string[] = [];
  
  Object.entries(FIELD_VALIDATIONS).forEach(([field, validation]) => {
    if (validation.required) {
      const value = draft.data[field as keyof BookingDraftData];
      if (value === undefined || value === null || value === '') {
        missing.push(field);
      }
    }
  });
  
  return missing;
}

/**
 * Sanitize draft data (remove invalid characters, trim whitespace)
 */
export function sanitizeDraft(draft: BookingDraft): BookingDraft {
  const sanitized = { ...draft };
  
  // Trim string fields
  if (typeof sanitized.data.customerName === 'string') {
    sanitized.data.customerName = sanitized.data.customerName.trim();
  }
  
  if (typeof sanitized.data.whatsappNumber === 'string') {
    sanitized.data.whatsappNumber = sanitized.data.whatsappNumber.replace(/[^0-9]/g, '');
  }
  
  if (typeof sanitized.data.addressLine1 === 'string') {
    sanitized.data.addressLine1 = sanitized.data.addressLine1.trim();
  }
  
  if (typeof sanitized.data.addressLine2 === 'string') {
    sanitized.data.addressLine2 = sanitized.data.addressLine2.trim();
  }
  
  if (typeof sanitized.data.discountCode === 'string') {
    sanitized.data.discountCode = sanitized.data.discountCode.toUpperCase().trim();
  }
  
  logger.info(`🧹 Sanitized booking draft: ${draft.id}`);
  
  return sanitized;
}
