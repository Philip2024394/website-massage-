// Shared constants across all applications
export const APP_CONFIG = {
  NAME: 'IndoStreet',
  VERSION: '1.0.0',
  API_VERSION: 'v1',
  ENVIRONMENT: (import.meta as any).env?.MODE || 'development',
} as const;

export const API_ENDPOINTS = {
  BASE_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api',
  AUTH: '/auth',
  USERS: '/users',
  BOOKINGS: '/bookings',
  SERVICES: '/services',
  THERAPISTS: '/therapists',
  PLACES: '/places',
  HOTELS: '/hotels',
  VILLAS: '/villas',
  AGENTS: '/agents',
  NOTIFICATIONS: '/notifications',
  REVIEWS: '/reviews',
  PAYMENTS: '/payments',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  CLIENT: 'client',
  THERAPIST: 'therapist',
  PLACE: 'place',
  HOTEL: 'hotel',
  VILLA: 'villa',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SERVICE_CATEGORIES = {
  RELAXATION: 'relaxation',
  THERAPEUTIC: 'therapeutic',
  SPORTS: 'sports',
  BEAUTY: 'beauty',
  WELLNESS: 'wellness',
} as const;

export const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  SYSTEM: 'system',
  PROMOTION: 'promotion',
  REVIEW: 'review',
} as const;

export const HOTEL_VILLA_DISCOUNT = {
  MIN_DISCOUNT: 20,
  MAX_DISCOUNT: 60,
  DEFAULT_HOTEL_DISCOUNT: 25,
  DEFAULT_VILLA_DISCOUNT: 30,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

export const APP_ROUTES = {
  // Common routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  
  // Admin routes
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    SERVICES: '/admin/services',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
  },
  
  // Agent routes
  AGENT: {
    BASE: '/agent',
    DASHBOARD: '/agent/dashboard',
    REFERRALS: '/agent/referrals',
    EARNINGS: '/agent/earnings',
    PROFILE: '/agent/profile',
  },
  
  // Client routes
  CLIENT: {
    BASE: '/client',
    DASHBOARD: '/client/dashboard',
    SEARCH: '/client/search',
    BOOKINGS: '/client/bookings',
    HISTORY: '/client/history',
    FAVORITES: '/client/favorites',
  },
  
  // Therapist routes
  THERAPIST: {
    BASE: '/therapist',
    DASHBOARD: '/therapist/dashboard',
    BOOKINGS: '/therapist/bookings',
    SCHEDULE: '/therapist/schedule',
    EARNINGS: '/therapist/earnings',
    PROFILE: '/therapist/profile',
    HOTEL_VILLA: '/therapist/hotel-villa',
  },
  
  // Place routes
  PLACE: {
    BASE: '/place',
    DASHBOARD: '/place/dashboard',
    SERVICES: '/place/services',
    BOOKINGS: '/place/bookings',
    STAFF: '/place/staff',
    PROFILE: '/place/profile',
    HOTEL_VILLA: '/place/hotel-villa',
  },
  
  // Hotel routes
  HOTEL: {
    BASE: '/hotel',
    DASHBOARD: '/hotel/dashboard',
    PROVIDERS: '/hotel/providers',
    MENU: '/hotel/menu',
    BOOKINGS: '/hotel/bookings',
    GUESTS: '/hotel/guests',
  },
  
  // Villa routes
  VILLA: {
    BASE: '/villa',
    DASHBOARD: '/villa/dashboard',
    PROVIDERS: '/villa/providers',
    MENU: '/villa/menu',
    BOOKINGS: '/villa/bookings',
    GUESTS: '/villa/guests',
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'indostreet_auth_token',
  USER_DATA: 'indostreet_user_data',
  THEME: 'indostreet_theme',
  LANGUAGE: 'indostreet_language',
  LAST_ROUTE: 'indostreet_last_route',
} as const;

export const COLORS = {
  PRIMARY: '#f97316', // Orange
  SECONDARY: '#0ea5e9', // Blue
  SUCCESS: '#10b981', // Green
  WARNING: '#f59e0b', // Yellow
  ERROR: '#ef4444', // Red
  GRAY: '#6b7280',
  WHITE: '#ffffff',
  BLACK: '#000000',
} as const;

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;