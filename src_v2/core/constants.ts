/**
 * ============================================================================
 * 📋 CORE CONSTANTS - APPLICATION CONSTANTS
 * ============================================================================
 * 
 * All application constants in one place.
 * 
 * ============================================================================
 */

// API endpoints
export const API_ENDPOINTS = {
  BOOKINGS: '/api/bookings',
  THERAPISTS: '/api/therapists', 
  CHAT: '/api/chat',
  PAYMENTS: '/api/payments',
  NOTIFICATIONS: '/api/notifications',
  UPLOAD: '/api/upload'
} as const;

// Database configuration
export const DATABASE_IDS = {
  MAIN: '68f76ee1000e64ca8d05'
} as const;

// Collection IDs
export const COLLECTION_IDS = {
  BOOKINGS: 'bookings',
  THERAPISTS: 'therapists_collection_id',
  PLACES: 'places_collection_id',
  MESSAGES: 'chat_messages',
  CHAT_SESSIONS: 'chat_sessions',
  USERS: 'users_collection_id',
  NOTIFICATIONS: 'notifications',
  REVIEWS: 'reviews'
} as const;

// Storage buckets
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile_images',
  DOCUMENTS: 'documents',
  CHAT_ATTACHMENTS: 'chat_attachments'
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Validation errors
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_LENGTH: 'INVALID_LENGTH',
  
  // Booking errors
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_CREATION_FAILED: 'BOOKING_CREATION_FAILED',
  INVALID_BOOKING_STATUS: 'INVALID_BOOKING_STATUS',
  THERAPIST_NOT_AVAILABLE: 'THERAPIST_NOT_AVAILABLE',
  
  // Chat errors
  CHAT_SESSION_NOT_FOUND: 'CHAT_SESSION_NOT_FOUND',
  MESSAGE_SEND_FAILED: 'MESSAGE_SEND_FAILED',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  
  // System errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// Booking statuses
export const BOOKING_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress', 
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
} as const;

// Service types
export const SERVICE_TYPES = {
  MASSAGE: 'massage',
  FACIAL: 'facial',
  SPA: 'spa',
  WELLNESS: 'wellness'
} as const;

// Service durations (in minutes)
export const SERVICE_DURATIONS = {
  SHORT: 60,
  MEDIUM: 90,
  LONG: 120
} as const;

// User types
export const USER_TYPES = {
  CUSTOMER: 'customer',
  THERAPIST: 'therapist',
  PLACE: 'place',
  ADMIN: 'admin'
} as const;

// User statuses
export const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  OFFLINE: 'offline'
} as const;

// Chat message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system_notification',
  BOOKING_UPDATE: 'booking_update'
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed', 
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_COMPLETED: 'booking_completed',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_REQUEST: 'review_request',
  SYSTEM: 'system'
} as const;

// Notification channels
export const NOTIFICATION_CHANNELS = {
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
  SMS: 'sms'
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  TRANSFER: 'transfer',
  EWALLET: 'ewallet',
  CARD: 'card'
} as const;

// Payment statuses
export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid', 
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const;

// Business constants
export const BUSINESS_CONSTANTS = {
  // Timing
  BOOKING_RESPONSE_TIME_MINUTES: 10,
  SESSION_TIMEOUT_MINUTES: 30,
  BOOKING_REMINDER_HOURS: 2,
  
  // Limits
  MAX_BOOKING_ADVANCE_DAYS: 30,
  MAX_DAILY_BOOKINGS_PER_THERAPIST: 8,
  MAX_CHAT_MESSAGE_LENGTH: 1000,
  MAX_SPECIAL_REQUESTS_LENGTH: 500,
  
  // Pricing
  DEFAULT_TAX_RATE: 0.11, // 11%
  DEFAULT_SERVICE_FEE: 0.05, // 5%
  MINIMUM_BOOKING_AMOUNT: 100000, // IDR
  
  // Geography
  DEFAULT_SERVICE_RADIUS_KM: 25,
  BALI_CENTER_LAT: -8.3405,
  BALI_CENTER_LNG: 115.0920,
  
  // Contact
  DEFAULT_WHATSAPP: '+6281234567890',
  SUPPORT_EMAIL: 'support@massageplatform.com',
  EMERGENCY_CONTACT: '+6281234567899'
} as const;

// Regex patterns
export const REGEX_PATTERNS = {
  PHONE: /^(\+62|62|0)[0-9]{8,13}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BOOKING_ID: /^BK[0-9A-Z]{10}$/,
  COORDINATE: /^-?[0-9]+\.?[0-9]*$/
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_REAL_TIME_CHAT: true,
  ENABLE_PAYMENT_INTEGRATION: false,
  ENABLE_REVIEW_SYSTEM: true,
  ENABLE_PUSH_NOTIFICATIONS: false,
  ENABLE_ADMIN_DASHBOARD: true,
  ENABLE_ANALYTICS: false
} as const;

// Cache keys
export const CACHE_KEYS = {
  THERAPISTS: 'therapists',
  PLACES: 'places',
  USER_PROFILE: 'user_profile',
  BOOKING_HISTORY: 'booking_history',
  CHAT_SESSIONS: 'chat_sessions'
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000,  // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000,  // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const;

console.log('📋 [CORE] Constants loaded');