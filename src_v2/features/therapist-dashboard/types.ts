/**
 * ============================================================================
 * THERAPIST DASHBOARD TYPES
 * ============================================================================
 * 
 * Comprehensive type definitions for the therapist dashboard feature.
 * Supports both legacy compatibility and v2 enhancements.
 * 
 * ============================================================================
 */

export interface TherapistProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  joinedDate: string;
  verified: boolean;
  
  // Profile completion tracking
  profileCompletion: {
    overall: number; // percentage
    sections: {
      basicInfo: boolean;
      photos: boolean;
      services: boolean;
      availability: boolean;
      location: boolean;
      verification: boolean;
    };
  };
  
  // Location data
  location?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    serviceRadius: number; // miles
  };
  
  // Professional info
  professional: {
    licenseNumber?: string;
    specializations: string[];
    experience: number; // years
    certifications: string[];
    insurance: boolean;
  };
}

export interface DashboardStats {
  bookings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    pendingPayouts: number;
    totalEarned: number;
  };
  
  ratings: {
    average: number;
    totalReviews: number;
    recentReviews: number; // in last 30 days
    breakdown: {
      [key: number]: number; // star rating -> count
    };
  };
  
  performance: {
    responseTime: number; // average in minutes
    acceptanceRate: number; // percentage
    cancellationRate: number; // percentage
    completionRate: number; // percentage
  };
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'message' | 'profile_update';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'warning' | 'error';
  data?: any; // additional contextual data
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  description: string;
  url: string;
  primary?: boolean;
  count?: number; // for badges
  disabled?: boolean;
}

export interface ServiceOffering {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
  enabled: boolean;
  category: string;
  popularity: number; // ranking
}

export interface TherapistDashboardProps {
  therapistId?: string;
  initialData?: {
    profile?: Partial<TherapistProfile>;
    stats?: Partial<DashboardStats>;
    recentActivity?: RecentActivity[];
  };
  
  // Feature flags
  useV2Dashboard?: boolean;
  enableNewFeatures?: boolean;
  showBetaFeatures?: boolean;
  
  // Event handlers
  onProfileUpdate?: (profile: Partial<TherapistProfile>) => void;
  onServiceToggle?: (serviceId: string, enabled: boolean) => void;
  onQuickAction?: (actionId: string) => void;
  
  // Customization
  theme?: 'light' | 'dark' | 'auto';
  compact?: boolean;
  hideEmptyCards?: boolean;
  defaultTab?: string;
}

export interface DashboardTab {
  id: string;
  label: string;
  icon?: string;
  component: React.ComponentType<any>;
  badgeCount?: number;
  disabled?: boolean;
  premium?: boolean;
}

export interface NotificationSettings {
  newBookings: boolean;
  cancellations: boolean;
  messages: boolean;
  reviews: boolean;
  payments: boolean;
  promotions: boolean;
  system: boolean;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string;
  enabled: boolean;
  maxBookings?: number;
}

export interface TherapistSettings {
  notifications: NotificationSettings;
  availability: AvailabilitySlot[];
  autoAcceptBookings: boolean;
  instantBooking: boolean;
  requireDeposit: boolean;
  depositAmount: number;
  cancellationPolicy: string;
  serviceRadius: number;
  minimumNotice: number; // hours
}

// Legacy compatibility types
export interface LegacyTherapistData {
  [key: string]: any; // flexible for legacy data structure
}

// API response types
export interface TherapistDashboardResponse {
  success: boolean;
  data: {
    profile: TherapistProfile;
    stats: DashboardStats;
    recentActivity: RecentActivity[];
    quickActions: QuickAction[];
    settings: TherapistSettings;
  };
  error?: string;
}

// Component state types
export interface DashboardViewState {
  activeTab: string;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  lastUpdated: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    positive: boolean;
  };
  icon?: string;
  color?: string;
  loading?: boolean;
}

export interface ActivityCardProps {
  activities: RecentActivity[];
  loading?: boolean;
  compact?: boolean;
  maxItems?: number;
}

export interface ProfileCompletionProps {
  profile: TherapistProfile;
  onSectionClick?: (section: string) => void;
  showProgress?: boolean;
}

// Feature flag types
export interface FeatureFlags {
  USE_V2_THERAPIST_DASHBOARD: boolean;
  ENABLE_REAL_TIME_UPDATES: boolean;
  SHOW_BETA_FEATURES: boolean;
  ADVANCED_ANALYTICS: boolean;
}

export type TherapistDashboardFeature = keyof FeatureFlags;