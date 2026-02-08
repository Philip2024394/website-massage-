/**
 * Production-Grade Input Validation
 * 
 * Prevents injection attacks, XSS, and data corruption
 * Uber/Gojek Standards: Validate all user input before processing
 * 
 * Features:
 * - Email validation (RFC 5322 compliant)
 * - Phone number validation (international formats)
 * - Sanitization for XSS prevention
 * - SQL injection prevention
 * - File upload validation
 * - Business logic validation
 */

import { logger } from './logger.production';

// Common regex patterns
const PATTERNS = {
  email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  phone: /^\+?[1-9]\d{1,14}$/,  // E.164 format
  whatsapp: /^\+?[1-9]\d{7,14}$/, // WhatsApp international format
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  
  // Indonesian specific
  indonesianPhone: /^(\+62|62|0)[8][1-9][0-9]{6,9}$/,
  indonesianPostalCode: /^[0-9]{5}$/,
};

// Dangerous patterns (XSS, SQL injection)
const DANGEROUS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi, // Event handlers like onclick=
  /SELECT\s+.*FROM/gi,
  /INSERT\s+INTO/gi,
  /UPDATE\s+.*SET/gi,
  /DELETE\s+FROM/gi,
  /DROP\s+TABLE/gi,
  /UNION\s+SELECT/gi,
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: any;
}

export class InputValidator {
  /**
   * Validate email address
   */
  static validateEmail(email: string): ValidationResult {
    if (!email || typeof email !== 'string') {
      return { isValid: false, error: 'Email is required' };
    }

    const trimmed = email.trim().toLowerCase();
    
    if (trimmed.length > 254) {
      return { isValid: false, error: 'Email is too long' };
    }

    if (!PATTERNS.email.test(trimmed)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    // Check for dangerous patterns
    if (this.containsDangerousContent(trimmed)) {
      logger.warn('Dangerous content detected in email', { email: trimmed });
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true, sanitized: trimmed };
  }

  /**
   * Validate phone number (international format)
   */
  static validatePhone(phone: string, countryCode?: string): ValidationResult {
    if (!phone || typeof phone !== 'string') {
      return { isValid: false, error: 'Phone number is required' };
    }

    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Indonesian phone validation
    if (countryCode === 'ID' || phone.startsWith('+62') || phone.startsWith('62') || phone.startsWith('0')) {
      if (!PATTERNS.indonesianPhone.test(cleaned)) {
        return { isValid: false, error: 'Invalid Indonesian phone number format' };
      }
      
      const normalized = cleaned.replace(/^0/, '62');
      return { isValid: true, sanitized: '+' + normalized };
    }

    // General international format
    if (!PATTERNS.phone.test(cleaned)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    return { isValid: true, sanitized: cleaned.startsWith('+') ? cleaned : '+' + cleaned };
  }

  /**
   * Validate WhatsApp number
   */
  static validateWhatsApp(whatsapp: string): ValidationResult {
    if (!whatsapp || typeof whatsapp !== 'string') {
      return { isValid: false, error: 'WhatsApp number is required' };
    }

    const cleaned = whatsapp.replace(/[\s\-\(\)]/g, '');

    if (!PATTERNS.whatsapp.test(cleaned)) {
      return { isValid: false, error: 'Invalid WhatsApp number format' };
    }

    return { isValid: true, sanitized: cleaned.startsWith('+') ? cleaned : '+' + cleaned };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): ValidationResult {
    if (!password || typeof password !== 'string') {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long (max 128 characters)' };
    }

    // Check for at least one number, one letter
    if (!/[a-zA-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one letter' };
    }

    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return { isValid: false, error: 'Password is too weak' };
    }

    return { isValid: true, sanitized: password };
  }

  /**
   * Validate text input (names, descriptions, etc.)
   */
  static validateText(text: string, options: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    alphanumericOnly?: boolean;
    allowSpaces?: boolean;
  } = {}): ValidationResult {
    const { required = true, minLength = 0, maxLength = 1000, alphanumericOnly = false, allowSpaces = true } = options;

    if (!text || typeof text !== 'string') {
      if (required) {
        return { isValid: false, error: 'This field is required' };
      }
      return { isValid: true, sanitized: '' };
    }

    const trimmed = text.trim();

    if (required && trimmed.length === 0) {
      return { isValid: false, error: 'This field is required' };
    }

    if (trimmed.length < minLength) {
      return { isValid: false, error: `Minimum ${minLength} characters required` };
    }

    if (trimmed.length > maxLength) {
      return { isValid: false, error: `Maximum ${maxLength} characters allowed` };
    }

    // Check for dangerous content
    if (this.containsDangerousContent(trimmed)) {
      logger.warn('Dangerous content detected in text input', { text: trimmed.substring(0, 50) });
      return { isValid: false, error: 'Invalid input format' };
    }

    // Alphanumeric check
    if (alphanumericOnly) {
      const pattern = allowSpaces ? PATTERNS.alphanumericWithSpaces : PATTERNS.alphanumeric;
      if (!pattern.test(trimmed)) {
        return { isValid: false, error: 'Only letters and numbers are allowed' };
      }
    }

    // Sanitize
    const sanitized = this.sanitizeString(trimmed);

    return { isValid: true, sanitized };
  }

  /**
   * Validate URL
   */
  static validateURL(url: string): ValidationResult {
    if (!url || typeof url !== 'string') {
      return { isValid: false, error: 'URL is required' };
    }

    const trimmed = url.trim();

    if (!PATTERNS.url.test(trimmed)) {
      return { isValid: false, error: 'Invalid URL format' };
    }

    // Only allow https in production
    if (import.meta.env.PROD && !trimmed.startsWith('https://')) {
      return { isValid: false, error: 'Only HTTPS URLs are allowed' };
    }

    return { isValid: true, sanitized: trimmed };
  }

  /**
   * Validate booking data
   */
  static validateBookingData(data: {
    therapistId?: string;
    date?: string;
    time?: string;
    duration?: number;
    address?: string;
    notes?: string;
  }): ValidationResult {
    const errors: string[] = [];

    // Validate therapist ID (UUID format)
    if (data.therapistId && !PATTERNS.uuid.test(data.therapistId)) {
      errors.push('Invalid therapist ID');
    }

    // Validate date (ISO format)
    if (data.date) {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      } else if (date < new Date()) {
        errors.push('Cannot book in the past');
      }
    }

    // Validate duration
    if (data.duration !== undefined) {
      if (typeof data.duration !== 'number' || data.duration < 30 || data.duration > 480) {
        errors.push('Duration must be between 30 and 480 minutes');
      }
    }

    // Validate address
    if (data.address) {
      const addressValidation = this.validateText(data.address, {
        required: true,
        minLength: 10,
        maxLength: 500
      });
      if (!addressValidation.isValid) {
        errors.push(addressValidation.error || 'Invalid address');
      }
    }

    // Validate notes
    if (data.notes) {
      const notesValidation = this.validateText(data.notes, {
        required: false,
        maxLength: 1000
      });
      if (!notesValidation.isValid) {
        errors.push(notesValidation.error || 'Invalid notes');
      }
    }

    if (errors.length > 0) {
      return { isValid: false, error: errors.join(', ') };
    }

    return { isValid: true, sanitized: data };
  }

  /**
   * Validate file upload
   */
  static validateFile(file: File, options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}): ValidationResult {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

    if (!file || !(file instanceof File)) {
      return { isValid: false, error: 'Invalid file' };
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: `File type ${file.type} not allowed` };
    }

    // Check file name for dangerous patterns
    if (this.containsDangerousContent(file.name)) {
      return { isValid: false, error: 'Invalid file name' };
    }

    return { isValid: true, sanitized: file };
  }

  /**
   * Check if string contains dangerous content (XSS, SQL injection)
   */
  private static containsDangerousContent(text: string): boolean {
    return DANGEROUS_PATTERNS.some(pattern => pattern.test(text));
  }

  /**
   * Sanitize string by removing dangerous characters
   */
  private static sanitizeString(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate and sanitize object (for API payloads)
   */
  static validateObject(obj: any, schema: { [key: string]: 'string' | 'number' | 'boolean' | 'email' | 'phone' }): ValidationResult {
    if (!obj || typeof obj !== 'object') {
      return { isValid: false, error: 'Invalid object' };
    }

    const sanitized: any = {};
    const errors: string[] = [];

    for (const [key, type] of Object.entries(schema)) {
      const value = obj[key];

      if (value === undefined || value === null) {
        errors.push(`${key} is required`);
        continue;
      }

      switch (type) {
        case 'string':
          const textResult = this.validateText(value);
          if (!textResult.isValid) {
            errors.push(`${key}: ${textResult.error}`);
          } else {
            sanitized[key] = textResult.sanitized;
          }
          break;

        case 'email':
          const emailResult = this.validateEmail(value);
          if (!emailResult.isValid) {
            errors.push(`${key}: ${emailResult.error}`);
          } else {
            sanitized[key] = emailResult.sanitized;
          }
          break;

        case 'phone':
          const phoneResult = this.validatePhone(value);
          if (!phoneResult.isValid) {
            errors.push(`${key}: ${phoneResult.error}`);
          } else {
            sanitized[key] = phoneResult.sanitized;
          }
          break;

        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${key} must be a valid number`);
          } else {
            sanitized[key] = value;
          }
          break;

        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${key} must be a boolean`);
          } else {
            sanitized[key] = value;
          }
          break;
      }
    }

    if (errors.length > 0) {
      return { isValid: false, error: errors.join(', ') };
    }

    return { isValid: true, sanitized };
  }
}

// Export singleton for convenience
export const validator = InputValidator;
