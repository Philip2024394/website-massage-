/**
 * ============================================================================
 * 🛠️ CORE UTILITIES - HELPER FUNCTIONS
 * ============================================================================
 * 
 * Shared utility functions used across all services.
 * 
 * ============================================================================
 */

import { ApiResponse, ErrorResponse, ValidationResult, ValidationError } from './types';

// Formatting utilities
export const formatCurrency = (amount: number, currency: 'IDR' | 'USD' = 'IDR'): string => {
  const formatters = {
    IDR: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }),
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
  };
  
  return formatters[currency].format(amount);
};

export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = new Date(date);
  
  const formatters = {
    short: new Intl.DateTimeFormat('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    long: new Intl.DateTimeFormat('id-ID', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long' 
    }),
    time: new Intl.DateTimeFormat('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    })
  };
  
  return formatters[format].format(d);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} menit`;
  if (mins === 0) return `${hours} jam`;
  return `${hours} jam ${mins} menit`;
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Indonesian phone number validation
  const phoneRegex = /^(\+62|62|0)[0-9]{8,13}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
};

export const validateRequired = (value: any, fieldName: string): ValidationError | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
      code: 'REQUIRED',
      value
    };
  }
  return null;
};

export const validateLength = (
  value: string, 
  fieldName: string, 
  min?: number, 
  max?: number
): ValidationError | null => {
  if (min && value.length < min) {
    return {
      field: fieldName,
      message: `${fieldName} must be at least ${min} characters`,
      code: 'MIN_LENGTH',
      value
    };
  }
  
  if (max && value.length > max) {
    return {
      field: fieldName,
      message: `${fieldName} cannot exceed ${max} characters`,
      code: 'MAX_LENGTH',
      value
    };
  }
  
  return null;
};

// ID generation
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
};

export const generateBookingId = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `BK${timestamp}${random}`;
};

export const generateShortId = (length: number = 6): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Data sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
};

export const sanitizePhone = (phone: string): string => {
  // Normalize Indonesian phone numbers
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '+62' + cleaned.substring(1);
  } else if (cleaned.startsWith('62')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+62' + cleaned;
  }
  
  return cleaned;
};

// Error handling
export const handleError = (error: any, context?: string): ErrorResponse => {
  console.error(`[ERROR] ${context || 'Unknown context'}:`, error);
  
  return {
    success: false,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: {
        context,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }
  };
};

export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  error?: { code: string; message: string; details?: any }
): ApiResponse<T> => {
  return {
    success,
    data,
    error,
    metadata: {
      timestamp: new Date(),
      requestId: generateId('req'),
      version: '2.0.0'
    }
  };
};

// Distance calculation
export const calculateDistance = (
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Time utilities
export const isWithinBusinessHours = (date: Date = new Date()): boolean => {
  const hours = date.getHours();
  return hours >= 8 && hours <= 22; // 8 AM to 10 PM
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const getTimeDifference = (date1: Date, date2: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
};

// Array utilities
export const groupBy = <T, K extends keyof any>(
  array: T[], 
  key: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const group = key(item);
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const uniqueBy = <T, K>(array: T[], key: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter(item => {
    const k = key(item);
    if (seen.has(k)) {
      return false;
    }
    seen.add(k);
    return true;
  });
};

// Retry utility
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

console.log('🛠️ [CORE] Utilities loaded');