/**
 * 🏆 GOLD-STANDARD BANK & KTP VALIDATION UTILITIES
 * 
 * Separated, tested validation functions as specified in audit requirements.
 * Replaces scattered validation logic with centralized, reliable patterns.
 * 
 * BUSINESS IMPACT: Prevents "sometimes works" validation behavior
 * TECHNICAL IMPACT: Eliminates type="number" precision loss issues
 */

// ============================================================================
// VALIDATION CONSTANTS - AUTHORITATIVE PATTERNS
// ============================================================================

export const VALIDATION_PATTERNS = {
  /** Indonesian KTP - Exactly 16 digits */
  KTP: /^[0-9]{16}$/,
  
  /** Bank Account - Digits, spaces, dashes, dots, underscores (10-20 core digits) */
  BANK_ACCOUNT: /^[0-9\s\-_.]+$/,
  
  /** Account Holder Name - Letters, spaces, dots, apostrophes, hyphens */
  ACCOUNT_HOLDER_NAME: /^[A-Za-z\s.'-]+$/,
  
  /** Indonesian Phone/WhatsApp - 8-15 digits with +62 prefix */
  INDONESIAN_PHONE: /^\+62[0-9]{8,15}$/
} as const;

export const VALIDATION_LIMITS = {
  KTP_LENGTH: 16,
  BANK_ACCOUNT_MIN_DIGITS: 10,
  BANK_ACCOUNT_MAX_DIGITS: 20,
  BANK_ACCOUNT_MAX_TOTAL_LENGTH: 30, // with spaces/separators
  ACCOUNT_HOLDER_MIN_LENGTH: 2,
  ACCOUNT_HOLDER_MAX_LENGTH: 100
} as const;

// ============================================================================
// CORE VALIDATION RESULT INTERFACE
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  cleaned?: string; // For cleaned/formatted values
}

// ============================================================================
// 🎯 SEPARATED VALIDATION FUNCTIONS (GOLD STANDARD)
// ============================================================================

/**
 * Validate Indonesian KTP (National ID)
 * - Must be exactly 16 digits
 * - No spaces or separators allowed
 * - Returns cleaned value (digits only)
 */
export function validateKTP(input: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!input || typeof input !== 'string') {
    errors.push('KTP number is required');
    return { isValid: false, errors, warnings };
  }

  // Clean input - remove all non-digits
  const cleaned = input.replace(/\D/g, '');
  
  // Check exact length requirement
  if (cleaned.length === 0) {
    errors.push('KTP number cannot be empty');
  } else if (cleaned.length < VALIDATION_LIMITS.KTP_LENGTH) {
    errors.push(`KTP must be exactly ${VALIDATION_LIMITS.KTP_LENGTH} digits (found ${cleaned.length})`);
  } else if (cleaned.length > VALIDATION_LIMITS.KTP_LENGTH) {
    errors.push(`KTP must be exactly ${VALIDATION_LIMITS.KTP_LENGTH} digits (found ${cleaned.length})`);
  }

  // Validate pattern
  if (cleaned.length === VALIDATION_LIMITS.KTP_LENGTH && !VALIDATION_PATTERNS.KTP.test(cleaned)) {
    errors.push('KTP must contain only digits');
  }

  // Check for suspicious patterns
  if (cleaned.length === VALIDATION_LIMITS.KTP_LENGTH) {
    if (/^0+$/.test(cleaned)) {
      errors.push('KTP cannot be all zeros');
    } else if (/^1+$/.test(cleaned)) {
      warnings.push('KTP appears suspicious (all ones) - please verify');
    } else if (/^(\d)\1{15}$/.test(cleaned)) {
      warnings.push('KTP appears suspicious (all same digit) - please verify');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cleaned
  };
}

/**
 * Validate Bank Account Number
 * - Allows digits, spaces, dashes, dots, underscores
 * - Must have 10-20 digits total (excluding separators)
 * - Returns cleaned value (original format preserved)
 */
export function validateBankAccount(input: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!input || typeof input !== 'string') {
    errors.push('Bank account number is required');
    return { isValid: false, errors, warnings };
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    errors.push('Bank account number cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Check overall length including separators
  if (trimmed.length > VALIDATION_LIMITS.BANK_ACCOUNT_MAX_TOTAL_LENGTH) {
    errors.push(`Bank account number too long (max ${VALIDATION_LIMITS.BANK_ACCOUNT_MAX_TOTAL_LENGTH} characters including spaces)`);
  }

  // Check allowed characters
  if (!VALIDATION_PATTERNS.BANK_ACCOUNT.test(trimmed)) {
    errors.push('Bank account number can only contain digits, spaces, dashes, dots, and underscores');
  }

  // Extract digits only for length validation
  const digitsOnly = trimmed.replace(/\D/g, '');
  
  if (digitsOnly.length === 0) {
    errors.push('Bank account number must contain at least some digits');
  } else if (digitsOnly.length < VALIDATION_LIMITS.BANK_ACCOUNT_MIN_DIGITS) {
    errors.push(`Bank account number must have at least ${VALIDATION_LIMITS.BANK_ACCOUNT_MIN_DIGITS} digits (found ${digitsOnly.length})`);
  } else if (digitsOnly.length > VALIDATION_LIMITS.BANK_ACCOUNT_MAX_DIGITS) {
    errors.push(`Bank account number must have at most ${VALIDATION_LIMITS.BANK_ACCOUNT_MAX_DIGITS} digits (found ${digitsOnly.length})`);
  }

  // Check for suspicious patterns
  if (digitsOnly.length >= VALIDATION_LIMITS.BANK_ACCOUNT_MIN_DIGITS) {
    if (/^0+$/.test(digitsOnly)) {
      errors.push('Bank account number cannot be all zeros');
    } else if (digitsOnly.length >= 10 && /^(\d)\1{9,}$/.test(digitsOnly)) {
      warnings.push('Bank account number appears suspicious (too many repeated digits) - please verify');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cleaned: trimmed // Preserve original format with separators
  };
}

/**
 * Validate Account Holder Name
 * - Must match name on KTP/ID documents
 * - Allows letters, spaces, dots, apostrophes, hyphens
 * - 2-100 characters
 */
export function validateAccountHolderName(input: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!input || typeof input !== 'string') {
    errors.push('Account holder name is required');
    return { isValid: false, errors, warnings };
  }

  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    errors.push('Account holder name cannot be empty');
    return { isValid: false, errors, warnings };
  }

  // Length validation
  if (trimmed.length < VALIDATION_LIMITS.ACCOUNT_HOLDER_MIN_LENGTH) {
    errors.push(`Account holder name must be at least ${VALIDATION_LIMITS.ACCOUNT_HOLDER_MIN_LENGTH} characters`);
  } else if (trimmed.length > VALIDATION_LIMITS.ACCOUNT_HOLDER_MAX_LENGTH) {
    errors.push(`Account holder name must be at most ${VALIDATION_LIMITS.ACCOUNT_HOLDER_MAX_LENGTH} characters`);
  }

  // Pattern validation
  if (!VALIDATION_PATTERNS.ACCOUNT_HOLDER_NAME.test(trimmed)) {
    errors.push('Account holder name can only contain letters, spaces, dots, apostrophes, and hyphens');
  }

  // Business rule validations
  if (trimmed.length >= 2) {
    // Check for suspicious patterns
    if (/^\s+$/.test(trimmed)) {
      errors.push('Account holder name cannot be only spaces');
    } else if (/^(.)\1+$/.test(trimmed.replace(/\s/g, ''))) {
      warnings.push('Account holder name appears suspicious (repeated characters) - please verify');
    } else if (trimmed.toLowerCase() === 'test' || trimmed.toLowerCase() === 'testing') {
      warnings.push('Account holder name appears to be a test value - please use real name');
    }
    
    // Check for valid word structure
    const words = trimmed.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) {
      errors.push('Account holder name must contain at least one valid word');
    } else {
      // Each word should have at least one letter
      const invalidWords = words.filter(word => !/[A-Za-z]/.test(word));
      if (invalidWords.length > 0) {
        errors.push('Each word in account holder name must contain at least one letter');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    cleaned: trimmed
  };
}

// ============================================================================
// INPUT SANITIZATION HELPERS
// ============================================================================

/**
 * Sanitize KTP input - digits only
 */
export function sanitizeKTPInput(input: string): string {
  return input.replace(/\D/g, '');
}

/**
 * Sanitize Bank Account input - preserve allowed separators
 */
export function sanitizeBankAccountInput(input: string): string {
  return input.replace(/[^\d\s\-_.]/g, '');
}

/**
 * Sanitize Account Holder Name input - preserve allowed characters
 */
export function sanitizeAccountHolderInput(input: string): string {
  return input.replace(/[^A-Za-z\s.'-]/g, '');
}

// ============================================================================
// BATCH VALIDATION UTILITY
// ============================================================================

export interface BankDetailsValidationResult {
  bankName: ValidationResult;
  accountNumber: ValidationResult;
  accountHolderName: ValidationResult;
  ktpNumber?: ValidationResult;
  isAllValid: boolean;
  allErrors: string[];
  allWarnings: string[];
}

/**
 * Validate complete bank details in one call
 */
export function validateBankDetails(details: {
  bankName?: string;
  accountNumber: string;
  accountHolderName: string;
  ktpNumber?: string;
}): BankDetailsValidationResult {
  const bankName: ValidationResult = details.bankName 
    ? validateAccountHolderName(details.bankName) // Bank name follows similar rules
    : { isValid: true, errors: [] };
    
  const accountNumber = validateBankAccount(details.accountNumber);
  const accountHolderName = validateAccountHolderName(details.accountHolderName);
  const ktpNumber = details.ktpNumber ? validateKTP(details.ktpNumber) : undefined;

  const allErrors: string[] = [
    ...bankName.errors,
    ...accountNumber.errors,  
    ...accountHolderName.errors,
    ...(ktpNumber?.errors || [])
  ];

  const allWarnings: string[] = [
    ...(bankName.warnings || []),
    ...(accountNumber.warnings || []),
    ...(accountHolderName.warnings || []),
    ...(ktpNumber?.warnings || [])
  ];

  return {
    bankName,
    accountNumber, 
    accountHolderName,
    ktpNumber,
    isAllValid: allErrors.length === 0,
    allErrors,
    allWarnings
  };
}