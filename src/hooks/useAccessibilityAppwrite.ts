/**
 * ============================================================================
 * 🔌 ACCESSIBILITY APPWRITE INTEGRATION - TASK 8 BRIDGE
 * ============================================================================
 * 
 * Integration layer connecting accessibility components to Appwrite backend:
 * - Real therapist profile data integration
 * - Accessibility settings stored in Appwrite collections
 * - Chat and booking system accessibility integration
 * - Live user preferences and compliance tracking
 * - Analytics and reporting for accessibility usage
 * 
 * Collections Used:
 * - therapists: Therapist accessibility settings and preferences
 * - bookings: Booking accessibility requirements and accommodations
 * - accessibility_settings: User accessibility preferences
 * - accessibility_analytics: Usage tracking and compliance metrics
 * 
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { databases, Query, APPWRITE_CONFIG, ID } from '../lib/appwriteService';
import type { Therapist, Booking } from '../types';
import type { 
  VisualTheme, 
  LiveAnnouncement, 
  ARIAIssue, 
  NavigationEvent,
  FocusableElement,
  ContrastCheck,
  VisualPreferences 
} from './accessibility/types';

// Appwrite collection for accessibility settings
const ACCESSIBILITY_COLLECTION = 'accessibility_settings';
const ACCESSIBILITY_ANALYTICS_COLLECTION = 'accessibility_analytics';

export interface AccessibilitySettings {
  $id?: string;
  therapistId?: string;
  userId?: string;
  userType: 'therapist' | 'customer' | 'admin';
  
  // Visual preferences
  visualTheme: VisualTheme;
  highContrastMode: boolean;
  darkMode: boolean;
  fontSize: number;
  reducedMotion: boolean;
  colorBlindnessFilter?: string;
  
  // Screen reader preferences
  screenReaderEnabled: boolean;
  voiceVolume: number;
  speechRate: number;
  announcements: LiveAnnouncement[];
  
  // Keyboard navigation
  keyboardNavigationEnabled: boolean;
  focusVisible: boolean;
  customShortcuts: KeyboardShortcut[];
  
  // Compliance tracking
  wcagComplianceLevel: 'A' | 'AA' | 'AAA';
  lastComplianceCheck: Date;
  accessibilityIssues: ARIAIssue[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: string[];
  description: string;
  enabled: boolean;
}

export interface AccessibilityAnalytics {
  $id?: string;
  therapistId?: string;
  userId?: string;
  userType: 'therapist' | 'customer';
  
  // Usage metrics
  accessibilityFeaturesUsed: string[];
  screenReaderInteractions: number;
  keyboardNavigationEvents: number;
  complianceScoreHistory: Array<{
    score: number;
    date: Date;
    issues: number;
  }>;
  
  // Feature adoption
  highContrastModeUsage: number;
  voiceAnnouncementsUsed: number;
  customShortcutsCreated: number;
  
  // Performance metrics
  pageLoadTimeWithA11y: number;
  interactionSuccessRate: number;
  
  // Timestamps
  lastAccessed: Date;
  createdAt: Date;
}

/**
 * Hook for managing user accessibility settings with Appwrite integration
 */
export const useAccessibilitySettings = (therapistId?: string, userId?: string) => {
  const [settings, setSettings] = useState<AccessibilitySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userKey = therapistId || userId;
  const userType = therapistId ? 'therapist' : 'customer';

  // Load accessibility settings from Appwrite
  const loadSettings = useCallback(async () => {
    if (!userKey) return;

    try {
      setLoading(true);
      console.log('🔧 Loading accessibility settings for:', userKey);

      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        ACCESSIBILITY_COLLECTION,
        [
          Query.equal(therapistId ? 'therapistId' : 'userId', userKey),
          Query.limit(1)
        ]
      );

      if (response.documents.length > 0) {
        const doc = response.documents[0] as any;
        setSettings({
          $id: doc.$id,
          therapistId: doc.therapistId,
          userId: doc.userId,
          userType: doc.userType,
          visualTheme: JSON.parse(doc.visualTheme || '{}'),
          highContrastMode: doc.highContrastMode || false,
          darkMode: doc.darkMode || false,
          fontSize: doc.fontSize || 100,
          reducedMotion: doc.reducedMotion || false,
          colorBlindnessFilter: doc.colorBlindnessFilter,
          screenReaderEnabled: doc.screenReaderEnabled || false,
          voiceVolume: doc.voiceVolume || 0.7,
          speechRate: doc.speechRate || 1.0,
          announcements: JSON.parse(doc.announcements || '[]'),
          keyboardNavigationEnabled: doc.keyboardNavigationEnabled || false,
          focusVisible: doc.focusVisible || true,
          customShortcuts: JSON.parse(doc.customShortcuts || '[]'),
          wcagComplianceLevel: doc.wcagComplianceLevel || 'AA',
          lastComplianceCheck: new Date(doc.lastComplianceCheck),
          accessibilityIssues: JSON.parse(doc.accessibilityIssues || '[]'),
          createdAt: new Date(doc.$createdAt),
          updatedAt: new Date(doc.$updatedAt)
        });
        console.log('✅ Loaded accessibility settings:', response.documents[0].$id);
      } else {
        // Create default settings
        const defaultSettings = await createDefaultSettings();
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('❌ Error loading accessibility settings:', error);
      setError('Failed to load accessibility settings');
    } finally {
      setLoading(false);
    }
  }, [userKey, therapistId, userId]);

  // Create default accessibility settings
  const createDefaultSettings = useCallback(async (): Promise<AccessibilitySettings> => {
    const defaultSettings: Omit<AccessibilitySettings, '$id' | 'createdAt' | 'updatedAt'> = {
      therapistId: therapistId,
      userId: userId,
      userType: userType as 'therapist' | 'customer',
      visualTheme: {
        id: 'default',
        name: 'Default Theme',
        type: 'light',
        colors: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          background: '#ffffff',
          surface: '#f8f9fa',
          text: '#1f2937',
          textSecondary: '#6b7280',
          border: '#e5e7eb',
          focus: '#3b82f6',
          error: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
          info: '#3b82f6'
        },
        accessibility: {
          highContrast: false,
          colorBlindFriendly: true,
          reducedMotion: false,
          largeFonts: false,
          focusVisible: true,
          screenReaderOptimized: true
        },
        compliant: true,
        rating: 85
      },
      highContrastMode: false,
      darkMode: false,
      fontSize: 100,
      reducedMotion: false,
      screenReaderEnabled: false,
      voiceVolume: 0.7,
      speechRate: 1.0,
      announcements: [],
      keyboardNavigationEnabled: false,
      focusVisible: true,
      customShortcuts: [],
      wcagComplianceLevel: 'AA',
      lastComplianceCheck: new Date(),
      accessibilityIssues: []
    };

    try {
      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        ACCESSIBILITY_COLLECTION,
        ID.unique(),
        {
          ...defaultSettings,
          visualTheme: JSON.stringify(defaultSettings.visualTheme),
          announcements: JSON.stringify(defaultSettings.announcements),
          customShortcuts: JSON.stringify(defaultSettings.customShortcuts),
          accessibilityIssues: JSON.stringify(defaultSettings.accessibilityIssues)
        }
      );

      console.log('✅ Created default accessibility settings:', response.$id);
      
      return {
        ...defaultSettings,
        $id: response.$id,
        createdAt: new Date(response.$createdAt),
        updatedAt: new Date(response.$updatedAt)
      };
    } catch (error) {
      console.error('❌ Error creating default settings:', error);
      throw error;
    }
  }, [therapistId, userId, userType]);

  // Save accessibility settings to Appwrite
  const saveSettings = useCallback(async (newSettings: Partial<AccessibilitySettings>) => {
    if (!settings?.$id) return;

    try {
      console.log('💾 Saving accessibility settings...');

      const updateData: any = {};
      
      // Convert objects to JSON strings for Appwrite storage
      if (newSettings.visualTheme) {
        updateData.visualTheme = JSON.stringify(newSettings.visualTheme);
      }
      if (newSettings.announcements) {
        updateData.announcements = JSON.stringify(newSettings.announcements);
      }
      if (newSettings.customShortcuts) {
        updateData.customShortcuts = JSON.stringify(newSettings.customShortcuts);
      }
      if (newSettings.accessibilityIssues) {
        updateData.accessibilityIssues = JSON.stringify(newSettings.accessibilityIssues);
      }

      // Add primitive fields
      Object.keys(newSettings).forEach(key => {
        if (key !== 'visualTheme' && key !== 'announcements' && key !== 'customShortcuts' && key !== 'accessibilityIssues') {
          updateData[key] = (newSettings as any)[key];
        }
      });

      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        ACCESSIBILITY_COLLECTION,
        settings.$id,
        updateData
      );

      // Update local state
      setSettings(prev => prev ? {
        ...prev,
        ...newSettings,
        updatedAt: new Date(response.$updatedAt)
      } : null);

      console.log('✅ Accessibility settings saved successfully');
    } catch (error) {
      console.error('❌ Error saving accessibility settings:', error);
      setError('Failed to save accessibility settings');
    }
  }, [settings]);

  // Initialize settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    reloadSettings: loadSettings
  };
};

/**
 * Hook for accessibility analytics and usage tracking
 */
export const useAccessibilityAnalytics = (therapistId?: string, userId?: string) => {
  const [analytics, setAnalytics] = useState<AccessibilityAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const userKey = therapistId || userId;
  const userType = therapistId ? 'therapist' : 'customer';

  // Track accessibility feature usage
  const trackFeatureUsage = useCallback(async (feature: string, interaction?: string) => {
    if (!userKey) return;

    try {
      console.log('📊 Tracking accessibility feature usage:', feature);

      // Update or create analytics record
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        ACCESSIBILITY_ANALYTICS_COLLECTION,
        [
          Query.equal(therapistId ? 'therapistId' : 'userId', userKey),
          Query.limit(1)
        ]
      );

      let analyticsId: string;
      let currentAnalytics: AccessibilityAnalytics;

      if (response.documents.length > 0) {
        // Update existing analytics
        const doc = response.documents[0] as any;
        analyticsId = doc.$id;
        
        const featuresUsed = JSON.parse(doc.accessibilityFeaturesUsed || '[]');
        if (!featuresUsed.includes(feature)) {
          featuresUsed.push(feature);
        }

        await databases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          ACCESSIBILITY_ANALYTICS_COLLECTION,
          analyticsId,
          {
            accessibilityFeaturesUsed: JSON.stringify(featuresUsed),
            lastAccessed: new Date().toISOString(),
            [feature === 'screen-reader' ? 'screenReaderInteractions' : feature === 'keyboard-navigation' ? 'keyboardNavigationEvents' : 'lastAccessed']: 
              (doc[feature === 'screen-reader' ? 'screenReaderInteractions' : feature === 'keyboard-navigation' ? 'keyboardNavigationEvents' : 'lastAccessed'] || 0) + 1
          }
        );
      } else {
        // Create new analytics record
        const newAnalytics = {
          therapistId: therapistId,
          userId: userId,
          userType: userType,
          accessibilityFeaturesUsed: JSON.stringify([feature]),
          screenReaderInteractions: feature === 'screen-reader' ? 1 : 0,
          keyboardNavigationEvents: feature === 'keyboard-navigation' ? 1 : 0,
          complianceScoreHistory: JSON.stringify([]),
          highContrastModeUsage: feature === 'high-contrast' ? 1 : 0,
          voiceAnnouncementsUsed: feature === 'voice-announcements' ? 1 : 0,
          customShortcutsCreated: feature === 'custom-shortcuts' ? 1 : 0,
          pageLoadTimeWithA11y: 0,
          interactionSuccessRate: 100,
          lastAccessed: new Date().toISOString()
        };

        await databases.createDocument(
          APPWRITE_CONFIG.databaseId,
          ACCESSIBILITY_ANALYTICS_COLLECTION,
          ID.unique(),
          newAnalytics
        );
      }

      console.log('✅ Accessibility analytics updated');
    } catch (error) {
      console.error('❌ Error tracking accessibility feature usage:', error);
    }
  }, [userKey, therapistId, userId, userType]);

  return {
    analytics,
    loading,
    trackFeatureUsage
  };
};

/**
 * Hook for integrating accessibility with therapist profiles
 */
export const useTherapistAccessibility = (therapistId: string) => {
  const { settings, saveSettings, loading } = useAccessibilitySettings(therapistId);
  const { trackFeatureUsage } = useAccessibilityAnalytics(therapistId);
  const [therapist, setTherapist] = useState<Therapist | null>(null);

  // Load therapist data
  useEffect(() => {
    const loadTherapist = async () => {
      try {
        console.log('👨‍⚕️ Loading therapist data for accessibility integration...');
        const response = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.therapists,
          therapistId
        );
        setTherapist(response as Therapist);
        console.log('✅ Therapist data loaded for accessibility integration');
      } catch (error) {
        console.error('❌ Error loading therapist data:', error);
      }
    };

    if (therapistId) {
      loadTherapist();
    }
  }, [therapistId]);

  // Enable accessibility feature for therapist
  const enableAccessibilityFeature = useCallback(async (feature: string, enabled: boolean) => {
    await trackFeatureUsage(feature);
    
    const updates: Partial<AccessibilitySettings> = {};
    switch (feature) {
      case 'high-contrast':
        updates.highContrastMode = enabled;
        break;
      case 'screen-reader':
        updates.screenReaderEnabled = enabled;
        break;
      case 'keyboard-navigation':
        updates.keyboardNavigationEnabled = enabled;
        break;
      case 'reduced-motion':
        updates.reducedMotion = enabled;
        break;
    }

    await saveSettings(updates);
    console.log(`✅ ${feature} ${enabled ? 'enabled' : 'disabled'} for therapist:`, therapistId);
  }, [therapistId, saveSettings, trackFeatureUsage]);

  return {
    therapist,
    accessibilitySettings: settings,
    loading,
    enableAccessibilityFeature,
    trackFeatureUsage
  };
};

/**
 * Hook for accessibility in booking system
 */
export const useBookingAccessibility = (bookingId: string) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [accessibilityRequirements, setAccessibilityRequirements] = useState<string[]>([]);

  // Load booking with accessibility requirements
  useEffect(() => {
    const loadBookingAccessibility = async () => {
      try {
        console.log('📅 Loading booking accessibility requirements...');
        const response = await databases.getDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.bookings,
          bookingId
        );
        
        setBooking(response as Booking);
        
        // Parse accessibility requirements if they exist
        if ((response as any).accessibilityRequirements) {
          setAccessibilityRequirements(JSON.parse((response as any).accessibilityRequirements));
        }
        
        console.log('✅ Booking accessibility data loaded');
      } catch (error) {
        console.error('❌ Error loading booking accessibility:', error);
      }
    };

    if (bookingId) {
      loadBookingAccessibility();
    }
  }, [bookingId]);

  // Update booking accessibility requirements
  const updateAccessibilityRequirements = useCallback(async (requirements: string[]) => {
    if (!bookingId) return;

    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.bookings,
        bookingId,
        {
          accessibilityRequirements: JSON.stringify(requirements),
          updatedAt: new Date().toISOString()
        }
      );

      setAccessibilityRequirements(requirements);
      console.log('✅ Booking accessibility requirements updated');
    } catch (error) {
      console.error('❌ Error updating booking accessibility:', error);
    }
  }, [bookingId]);

  return {
    booking,
    accessibilityRequirements,
    updateAccessibilityRequirements
  };
};

/**
 * Utility function to check if accessibility collections exist in Appwrite
 */
export const checkAccessibilityCollections = async () => {
  try {
    console.log('🔍 Checking accessibility collections in Appwrite...');
    
    // Try to access the accessibility collections
    const settingsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      ACCESSIBILITY_COLLECTION,
      [Query.limit(1)]
    );
    
    const analyticsResponse = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      ACCESSIBILITY_ANALYTICS_COLLECTION,
      [Query.limit(1)]
    );
    
    console.log('✅ Accessibility collections exist and are accessible');
    return {
      settingsCollection: true,
      analyticsCollection: true
    };
  } catch (error) {
    console.warn('⚠️ Accessibility collections may not exist:', error);
    return {
      settingsCollection: false,
      analyticsCollection: false
    };
  }
};

export default {
  useAccessibilitySettings,
  useAccessibilityAnalytics,
  useTherapistAccessibility,
  useBookingAccessibility,
  checkAccessibilityCollections
};