/**
 * ============================================================================
 * 🏗️ CORE TYPES - SHARED TYPE DEFINITIONS
 * ============================================================================
 * 
 * All shared types used across features and services.
 * 
 * ============================================================================
 */

// Re-export types from services for convenience
export type { BookingRequest, BookingResponse, BookingStatus } from '../services/BookingService';
export type { ChatMessage, ChatSession } from '../services/ChatService';
export type { TherapistProfile } from '../services/TherapistService';
export type { Notification } from '../services/PaymentService';

// Core API types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// User types
export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  avatar?: string;
  type: 'customer' | 'therapist' | 'place' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client extends User {
  type: 'customer';
  preferences: {
    massageType?: string[];
    preferredGender?: 'male' | 'female' | 'any';
    specialNeeds?: string[];
    language?: string;
  };
  bookingHistory: string[]; // booking IDs
  favoriteTherapists: string[]; // therapist IDs
}

export interface Therapist extends User {
  type: 'therapist';
  professional: {
    licenseNumber?: string;
    experience: number;
    specializations: string[];
    certifications: string[];
  };
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    serviceRadius: number;
  };
  rating: number;
  reviewCount: number;
  rates: Record<string, number>;
  verified: boolean;
}

// Service types
export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  duration: number; // minutes
  basePrice: number;
  currency: 'IDR' | 'USD';
  available: boolean;
  features: string[];
  requirements?: string[];
}

export enum ServiceCategory {
  MASSAGE = 'massage',
  FACIAL = 'facial', 
  SPA = 'spa',
  WELLNESS = 'wellness'
}

export interface ServiceRequest {
  serviceId: string;
  duration: number;
  location: LocationData;
  preferences: Record<string, any>;
  specialRequests?: string;
}

// Location types
export interface LocationData {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  city?: string;
  district?: string;
  postalCode?: string;
  landmarks?: string[];
  accessInstructions?: string;
}

// Booking types (extended)
export interface Booking {
  id: string;
  bookingId: string; // human-readable ID
  customerId: string;
  customerName: string;
  customerPhone: string;
  
  serviceType: string;
  duration: number;
  location: LocationData;
  
  providerId?: string;
  providerType?: 'therapist' | 'place';
  providerName?: string;
  
  status: BookingStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  pricing: {
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
  };
  
  payment: {
    method?: 'cash' | 'transfer' | 'ewallet' | 'card';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
  };
  
  chatSessionId?: string;
  notes?: string;
  rating?: number;
  review?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// System types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: boolean;
    storage: boolean;
    functions: boolean;
    chat: boolean;
    payments: boolean;
  };
  lastCheck: Date;
  uptime: number; // seconds
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  userType: string;
  changes: Record<string, { from: any; to: any }>;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}

// Feature flag types
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage: number;
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Export all types
export type {
  User,
  Client, 
  Therapist,
  Service,
  ServiceRequest,
  LocationData,
  Booking,
  SystemHealth,
  AuditLog,
  FeatureFlag,
  ValidationResult,
  ValidationError,
  ValidationWarning
};