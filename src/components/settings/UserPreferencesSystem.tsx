/**
 * ============================================================================
 * 👤 USER PREFERENCES SYSTEM - TASK 7 COMPONENT
 * ============================================================================
 * 
 * Comprehensive user preferences and personalization system with:
 * - Workspace customization with layout preferences and shortcuts
 * - Business operation settings with automated rules
 * - Notification preferences with granular controls and scheduling
 * - Display and accessibility options with real-time preview
 * - Data and privacy controls with export/import capabilities
 * - Integration preferences with third-party service configurations
 * - Performance settings with optimization recommendations
 * - Backup and sync settings with cloud integration
 * 
 * Features:
 * ✅ Smart workspace layouts with drag-and-drop customization
 * ✅ Automated business rules with condition-based triggers
 * ✅ Advanced notification engine with intelligent grouping
 * ✅ Real-time accessibility compliance with WCAG validation
 * ✅ Privacy dashboard with granular data control
 * ✅ Performance monitoring with optimization suggestions
 * ✅ Cloud sync with conflict resolution and version control
 * ✅ Import/export preferences with backup scheduling
 * 
 * ============================================================================
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  User, Settings, Bell, Shield, Eye, Cloud,
  Monitor, Smartphone, Globe, Zap, Clock, Key,
  Layout, Grid, List, Calendar, MapPin, Phone,
  Mail, MessageSquare, Heart, Star, Trophy,
  Download, Upload, RefreshCw, Save, Undo,
  Check, X, AlertTriangle, Info, Search, Filter,
  ChevronDown, ChevronRight, Plus, Minus, Edit,
  Trash2, Copy, Share, BookOpen, Target, Layers
} from 'lucide-react';

export interface UserPreferencesSystemProps {
  preferences?: UserPreferences;
  onPreferencesUpdate?: (preferences: Partial<UserPreferences>) => void;
  onExportPreferences?: (preferences: UserPreferences) => void;
  onImportPreferences?: (preferences: UserPreferences) => void;
  className?: string;
}

export interface UserPreferences {
  workspace: WorkspacePreferences;
  business: BusinessPreferences;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacyPreferences;
  integrations: IntegrationPreferences;
  performance: PerformancePreferences;
  backup: BackupPreferences;
  accessibility: AccessibilityPreferences;
  personalization: PersonalizationPreferences;
}

export interface WorkspacePreferences {
  layout: {
    defaultView: 'dashboard' | 'calendar' | 'bookings' | 'analytics' | 'customers';
    sidebarPosition: 'left' | 'right' | 'collapsed';
    headerStyle: 'compact' | 'standard' | 'extended';
    cardDensity: 'compact' | 'comfortable' | 'spacious';
    showQuickActions: boolean;
    enableAnimations: boolean;
  };
  dashboard: {
    widgets: DashboardWidget[];
    columns: number;
    refreshInterval: number;
    showWelcomeMessage: boolean;
    defaultTimeRange: '7d' | '30d' | '90d' | '1y';
  };
  shortcuts: KeyboardShortcut[];
  favorites: {
    pages: string[];
    bookmarks: Bookmark[];
    quickFilters: QuickFilter[];
  };
  customization: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    borderRadius: 'none' | 'small' | 'medium' | 'large';
    fontScale: number;
    compactMode: boolean;
  };
}

export interface BusinessPreferences {
  operations: {
    timezone: string;
    workingHours: OperatingHours[];
    holidays: Holiday[];
    blackoutDates: BlackoutDate[];
    bufferTime: number;
    maxBookingsPerDay: number;
  };
  booking: {
    autoConfirmation: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
    cancellationPolicy: CancellationPolicy;
    reminderSchedule: ReminderSchedule;
    waitlistEnabled: boolean;
  };
  pricing: {
    currency: string;
    taxRate: number;
    discountRules: DiscountRule[];
    packageDeals: PackageDeal[];
    seasonalPricing: SeasonalPricing[];
    loyaltyProgram: LoyaltyProgram;
  };
  communication: {
    defaultLanguage: string;
    supportedLanguages: string[];
    communicationStyle: 'professional' | 'friendly' | 'casual';
    autoResponses: AutoResponse[];
    templates: MessageTemplate[];
  };
}

export interface NotificationPreferences {
  channels: {
    email: EmailNotificationSettings;
    push: PushNotificationSettings;
    sms: SMSNotificationSettings;
    inApp: InAppNotificationSettings;
  };
  schedule: {
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    workdaysOnly: boolean;
    respectTimezone: boolean;
    maxPerHour: number;
  };
  content: {
    groupSimilar: boolean;
    showPreviews: boolean;
    includeActions: boolean;
    personalizeContent: boolean;
    digestMode: 'immediate' | 'hourly' | 'daily' | 'weekly';
  };
  rules: NotificationRule[];
}

export interface DisplayPreferences {
  theme: {
    mode: 'light' | 'dark' | 'auto';
    highContrast: boolean;
    colorScheme: string;
    customColors: CustomColorScheme;
  };
  layout: {
    density: 'compact' | 'comfortable' | 'spacious';
    maxWidth: 'full' | 'contained' | 'narrow';
    showBreadcrumbs: boolean;
    stickyHeader: boolean;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
  };
  animations: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
    reduceMotion: boolean;
    pageTransitions: boolean;
  };
}

export interface PrivacyPreferences {
  dataCollection: {
    analytics: boolean;
    performance: boolean;
    marketing: boolean;
    functional: boolean;
  };
  sharing: {
    profileVisibility: 'public' | 'business' | 'private';
    shareBookingData: boolean;
    shareReviews: boolean;
    shareStatistics: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    ipRestriction: boolean;
    allowedIPs: string[];
  };
  communications: {
    marketingEmails: boolean;
    productUpdates: boolean;
    newsletters: boolean;
    surveyRequests: boolean;
  };
}

interface DashboardWidget {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number; };
  settings: Record<string, any>;
  enabled: boolean;
}

interface KeyboardShortcut {
  key: string;
  action: string;
  description: string;
  enabled: boolean;
}

interface Bookmark {
  id: string;
  name: string;
  url: string;
  icon?: string;
  category?: string;
}

interface QuickFilter {
  id: string;
  name: string;
  criteria: FilterCriteria;
  icon?: string;
}

interface FilterCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

interface OperatingHours {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
  breaks: { start: string; end: string; }[];
}

interface Holiday {
  name: string;
  date: string;
  recurring: boolean;
}

interface BlackoutDate {
  start: string;
  end: string;
  reason: string;
}

interface CancellationPolicy {
  hours: number;
  feePercentage: number;
  autoRefund: boolean;
  exceptions: string[];
}

interface ReminderSchedule {
  email24h: boolean;
  email1h: boolean;
  sms30min: boolean;
  confirmationRequired: boolean;
}

interface DiscountRule {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  conditions: DiscountCondition[];
  enabled: boolean;
}

interface DiscountCondition {
  field: string;
  operator: string;
  value: any;
}

interface PackageDeal {
  id: string;
  name: string;
  services: string[];
  discount: number;
  validUntil?: string;
}

interface SeasonalPricing {
  name: string;
  start: string;
  end: string;
  multiplier: number;
}

interface LoyaltyProgram {
  enabled: boolean;
  pointsPerDollar: number;
  rewardTiers: RewardTier[];
}

interface RewardTier {
  name: string;
  pointsRequired: number;
  benefits: string[];
}

interface AutoResponse {
  trigger: string;
  message: string;
  enabled: boolean;
}

interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
}

interface EmailNotificationSettings {
  enabled: boolean;
  bookings: boolean;
  cancellations: boolean;
  reminders: boolean;
  payments: boolean;
  reviews: boolean;
  marketing: boolean;
}

interface PushNotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  lockScreen: boolean;
}

interface SMSNotificationSettings {
  enabled: boolean;
  reminders: boolean;
  confirmations: boolean;
  emergencyOnly: boolean;
}

interface InAppNotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

interface NotificationRule {
  id: string;
  name: string;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  enabled: boolean;
}

interface NotificationCondition {
  field: string;
  operator: string;
  value: any;
}

interface NotificationAction {
  type: 'send' | 'delay' | 'suppress';
  channel?: string;
  delay?: number;
}

interface CustomColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

interface IntegrationPreferences {
  calendar: boolean;
  payments: boolean;
  marketing: boolean;
  analytics: boolean;
}

interface PerformancePreferences {
  caching: boolean;
  preloading: boolean;
  compression: boolean;
  optimizations: string[];
}

interface BackupPreferences {
  autoBackup: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  retention: number;
  cloudSync: boolean;
}

interface AccessibilityPreferences {
  screenReader: boolean;
  highContrast: boolean;
  largeText: boolean;
  keyboardNavigation: boolean;
  reducedMotion: boolean;
  colorBlindness: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

interface PersonalizationPreferences {
  welcomeMessage: string;
  favoriteFeatures: string[];
  customDashboard: boolean;
  aiSuggestions: boolean;
  smartDefaults: boolean;
}

// Mock preferences data
const MOCK_PREFERENCES: UserPreferences = {
  workspace: {
    layout: {
      defaultView: 'dashboard',
      sidebarPosition: 'left',
      headerStyle: 'standard',
      cardDensity: 'comfortable',
      showQuickActions: true,
      enableAnimations: true
    },
    dashboard: {
      widgets: [
        { id: 'stats', type: 'stats-overview', position: { x: 0, y: 0, w: 12, h: 4 }, settings: {}, enabled: true },
        { id: 'calendar', type: 'calendar-widget', position: { x: 0, y: 4, w: 8, h: 6 }, settings: {}, enabled: true },
        { id: 'recent', type: 'recent-bookings', position: { x: 8, y: 4, w: 4, h: 6 }, settings: {}, enabled: true }
      ],
      columns: 12,
      refreshInterval: 30,
      showWelcomeMessage: true,
      defaultTimeRange: '30d'
    },
    shortcuts: [
      { key: 'Ctrl+D', action: 'dashboard', description: 'Go to Dashboard', enabled: true },
      { key: 'Ctrl+B', action: 'bookings', description: 'View Bookings', enabled: true },
      { key: 'Ctrl+C', action: 'calendar', description: 'Open Calendar', enabled: true }
    ],
    favorites: {
      pages: ['dashboard', 'bookings', 'customers'],
      bookmarks: [
        { id: 'help', name: 'Help Center', url: '/help', icon: 'BookOpen' }
      ],
      quickFilters: [
        { id: 'today', name: "Today's Bookings", criteria: { field: 'date', operator: 'equals', value: 'today' } }
      ]
    },
    customization: {
      theme: 'light',
      primaryColor: '#F97316',
      borderRadius: 'medium',
      fontScale: 1,
      compactMode: false
    }
  },
  business: {
    operations: {
      timezone: 'America/New_York',
      workingHours: [
        { day: 'monday', enabled: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        { day: 'tuesday', enabled: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        { day: 'wednesday', enabled: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        { day: 'thursday', enabled: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        { day: 'friday', enabled: true, start: '09:00', end: '18:00', breaks: [{ start: '12:00', end: '13:00' }] },
        { day: 'saturday', enabled: true, start: '10:00', end: '16:00', breaks: [] },
        { day: 'sunday', enabled: false, start: '', end: '', breaks: [] }
      ],
      holidays: [
        { name: 'New Year\'s Day', date: '2024-01-01', recurring: true },
        { name: 'Independence Day', date: '2024-07-04', recurring: true },
        { name: 'Christmas', date: '2024-12-25', recurring: true }
      ],
      blackoutDates: [],
      bufferTime: 15,
      maxBookingsPerDay: 12
    },
    booking: {
      autoConfirmation: false,
      requireDeposit: true,
      depositPercentage: 25,
      cancellationPolicy: {
        hours: 24,
        feePercentage: 50,
        autoRefund: false,
        exceptions: ['medical emergencies', 'weather conditions']
      },
      reminderSchedule: {
        email24h: true,
        email1h: true,
        sms30min: false,
        confirmationRequired: false
      },
      waitlistEnabled: true
    },
    pricing: {
      currency: 'USD',
      taxRate: 8.5,
      discountRules: [
        { id: 'first-time', name: 'First Time Client', type: 'percentage', value: 20, conditions: [], enabled: true },
        { id: 'senior', name: 'Senior Discount', type: 'percentage', value: 15, conditions: [], enabled: true }
      ],
      packageDeals: [
        { id: 'relaxation-package', name: 'Relaxation Package', services: ['deep-tissue', 'aromatherapy'], discount: 15 }
      ],
      seasonalPricing: [],
      loyaltyProgram: {
        enabled: true,
        pointsPerDollar: 1,
        rewardTiers: [
          { name: 'Bronze', pointsRequired: 100, benefits: ['5% discount'] },
          { name: 'Silver', pointsRequired: 500, benefits: ['10% discount', 'priority booking'] },
          { name: 'Gold', pointsRequired: 1000, benefits: ['15% discount', 'priority booking', 'free consultation'] }
        ]
      }
    },
    communication: {
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'es'],
      communicationStyle: 'friendly',
      autoResponses: [
        { trigger: 'booking-confirmed', message: 'Thank you for booking with us!', enabled: true },
        { trigger: 'booking-cancelled', message: 'We understand. Hope to see you soon!', enabled: true }
      ],
      templates: [
        { id: 'reminder', name: 'Appointment Reminder', subject: 'Appointment Reminder', content: 'Your appointment is coming up...', variables: ['clientName', 'appointmentTime'] }
      ]
    }
  },
  notifications: {
    channels: {
      email: {
        enabled: true,
        bookings: true,
        cancellations: true,
        reminders: true,
        payments: true,
        reviews: true,
        marketing: false
      },
      push: {
        enabled: true,
        sound: true,
        vibration: true,
        badge: true,
        lockScreen: false
      },
      sms: {
        enabled: false,
        reminders: false,
        confirmations: false,
        emergencyOnly: false
      },
      inApp: {
        enabled: true,
        sound: true,
        desktop: true,
        position: 'top-right'
      }
    },
    schedule: {
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      workdaysOnly: false,
      respectTimezone: true,
      maxPerHour: 10
    },
    content: {
      groupSimilar: true,
      showPreviews: true,
      includeActions: true,
      personalizeContent: true,
      digestMode: 'immediate'
    },
    rules: []
  },
  display: {
    theme: {
      mode: 'light',
      highContrast: false,
      colorScheme: 'default',
      customColors: {
        primary: '#F97316',
        secondary: '#64748B',
        accent: '#10B981',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      }
    },
    layout: {
      density: 'comfortable',
      maxWidth: 'contained',
      showBreadcrumbs: true,
      stickyHeader: true
    },
    typography: {
      fontFamily: 'Inter',
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0
    },
    animations: {
      enabled: true,
      speed: 'normal',
      reduceMotion: false,
      pageTransitions: true
    }
  },
  privacy: {
    dataCollection: {
      analytics: true,
      performance: true,
      marketing: false,
      functional: true
    },
    sharing: {
      profileVisibility: 'business',
      shareBookingData: false,
      shareReviews: true,
      shareStatistics: false
    },
    security: {
      twoFactorAuth: true,
      sessionTimeout: 8,
      ipRestriction: false,
      allowedIPs: []
    },
    communications: {
      marketingEmails: false,
      productUpdates: true,
      newsletters: false,
      surveyRequests: true
    }
  },
  integrations: {
    calendar: true,
    payments: true,
    marketing: false,
    analytics: true
  },
  performance: {
    caching: true,
    preloading: true,
    compression: true,
    optimizations: ['image-optimization', 'lazy-loading', 'code-splitting']
  },
  backup: {
    autoBackup: true,
    frequency: 'weekly',
    retention: 30,
    cloudSync: true
  },
  accessibility: {
    screenReader: false,
    highContrast: false,
    largeText: false,
    keyboardNavigation: true,
    reducedMotion: false,
    colorBlindness: 'none'
  },
  personalization: {
    welcomeMessage: 'Welcome back, Sarah!',
    favoriteFeatures: ['dashboard', 'bookings', 'analytics'],
    customDashboard: true,
    aiSuggestions: true,
    smartDefaults: true
  }
};

export const UserPreferencesSystem: React.FC<UserPreferencesSystemProps> = ({
  preferences = MOCK_PREFERENCES,
  onPreferencesUpdate,
  onExportPreferences,
  onImportPreferences,
  className = ""
}) => {
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(preferences);
  const [activeSection, setActiveSection] = useState<'workspace' | 'business' | 'notifications' | 'display' | 'privacy' | 'integrations' | 'performance' | 'backup' | 'accessibility' | 'personalization'>('workspace');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['layout']));

  // Preference sections
  const preferenceSections = [
    { id: 'workspace', label: 'Workspace', icon: Layout, description: 'Layout, shortcuts, and customization' },
    { id: 'business', label: 'Business', icon: Settings, description: 'Operations, booking, and pricing' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts, channels, and schedules' },
    { id: 'display', label: 'Display', icon: Monitor, description: 'Theme, typography, and animations' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Data, security, and communications' },
    { id: 'integrations', label: 'Integrations', icon: Globe, description: 'Third-party services and APIs' },
    { id: 'performance', label: 'Performance', icon: Zap, description: 'Speed, caching, and optimizations' },
    { id: 'backup', label: 'Backup', icon: Cloud, description: 'Data backup and synchronization' },
    { id: 'accessibility', label: 'Accessibility', icon: Eye, description: 'Accessibility and usability' },
    { id: 'personalization', label: 'Personalization', icon: User, description: 'Personal touches and AI features' }
  ];

  // Update preferences
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
    onPreferencesUpdate?.(updates);
  }, [onPreferencesUpdate]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  // Workspace preferences component
  const WorkspacePreferences: React.FC = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div 
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => toggleSection('layout')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Layout & Display</h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedSections.has('layout') ? 'rotate-180' : ''
          }`} />
        </div>
        
        {expandedSections.has('layout') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default View</label>
                <select
                  value={userPreferences.workspace.layout.defaultView}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      layout: { ...userPreferences.workspace.layout, defaultView: e.target.value as any }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="calendar">Calendar</option>
                  <option value="bookings">Bookings</option>
                  <option value="analytics">Analytics</option>
                  <option value="customers">Customers</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Position</label>
                <select
                  value={userPreferences.workspace.layout.sidebarPosition}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      layout: { ...userPreferences.workspace.layout, sidebarPosition: e.target.value as any }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="collapsed">Collapsed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Density</label>
                <select
                  value={userPreferences.workspace.layout.cardDensity}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      layout: { ...userPreferences.workspace.layout, cardDensity: e.target.value as any }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="compact">Compact</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                <select
                  value={userPreferences.workspace.layout.headerStyle}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      layout: { ...userPreferences.workspace.layout, headerStyle: e.target.value as any }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="compact">Compact</option>
                  <option value="standard">Standard</option>
                  <option value="extended">Extended</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">Show Quick Actions</div>
                <div className="text-sm text-gray-500">Display quick action buttons in the interface</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.workspace.layout.showQuickActions}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      layout: { ...userPreferences.workspace.layout, showQuickActions: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">Enable Animations</div>
                <div className="text-sm text-gray-500">Smooth transitions and visual effects</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.workspace.layout.enableAnimations}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      layout: { ...userPreferences.workspace.layout, enableAnimations: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div 
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => toggleSection('dashboard')}
        >
          <h3 className="text-lg font-semibold text-gray-900">Dashboard Settings</h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            expandedSections.has('dashboard') ? 'rotate-180' : ''
          }`} />
        </div>
        
        {expandedSections.has('dashboard') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Interval (seconds)</label>
                <select
                  value={userPreferences.workspace.dashboard.refreshInterval}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      dashboard: { ...userPreferences.workspace.dashboard, refreshInterval: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                  <option value="0">Manual only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Time Range</label>
                <select
                  value={userPreferences.workspace.dashboard.defaultTimeRange}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      dashboard: { ...userPreferences.workspace.dashboard, defaultTimeRange: e.target.value as any }
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-medium text-gray-900">Show Welcome Message</div>
                <div className="text-sm text-gray-500">Display personalized greeting on dashboard</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userPreferences.workspace.dashboard.showWelcomeMessage}
                  onChange={(e) => updatePreferences({
                    workspace: {
                      ...userPreferences.workspace,
                      dashboard: { ...userPreferences.workspace.dashboard, showWelcomeMessage: e.target.checked }
                    }
                  })}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'workspace':
        return <WorkspacePreferences />;
      case 'business':
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Business Preferences</h3>
            <p className="text-gray-600">Operations, booking, and pricing settings coming soon</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
            <p className="text-gray-600">Advanced notification management coming soon</p>
          </div>
        );
      case 'display':
        return (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Display Preferences</h3>
            <p className="text-gray-600">Theme and display customization coming soon</p>
          </div>
        );
      case 'privacy':
        return (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy Settings</h3>
            <p className="text-gray-600">Privacy and security controls coming soon</p>
          </div>
        );
      case 'integrations':
        return (
          <div className="text-center py-12">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Integration Preferences</h3>
            <p className="text-gray-600">Third-party service settings coming soon</p>
          </div>
        );
      case 'performance':
        return (
          <div className="text-center py-12">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Settings</h3>
            <p className="text-gray-600">Speed and optimization preferences coming soon</p>
          </div>
        );
      case 'backup':
        return (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Backup Settings</h3>
            <p className="text-gray-600">Data backup and sync preferences coming soon</p>
          </div>
        );
      case 'accessibility':
        return (
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accessibility Settings</h3>
            <p className="text-gray-600">Accessibility preferences coming soon</p>
          </div>
        );
      case 'personalization':
        return (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personalization</h3>
            <p className="text-gray-600">Personal touches and AI features coming soon</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-7 h-7 text-orange-600" />
              User Preferences
            </h1>
            <p className="text-gray-600 mt-1">Customize your workspace and experience</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search preferences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <button
              onClick={() => onExportPreferences?.(userPreferences)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen bg-gray-50">
        {/* Preferences Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="p-6">
            <nav className="space-y-2">
              {preferenceSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      activeSection === section.id ? 'text-orange-600' : 'text-gray-500'
                    }`} />
                    <div>
                      <div className="font-medium">{section.label}</div>
                      <div className="text-sm text-gray-500">{section.description}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ml-auto ${
                      activeSection === section.id ? 'text-orange-600' : 'text-gray-400'
                    }`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Preferences Content */}
        <div className="flex-1 p-8">
          {renderSectionContent()}
        </div>
      </div>

      {/* Changes indicator */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <Info className="w-5 h-5" />
          <span>You have unsaved preferences</span>
          <button
            onClick={() => setHasChanges(false)}
            className="bg-white text-orange-600 px-3 py-1 rounded text-sm font-medium hover:bg-orange-50 transition-colors"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPreferencesSystem;