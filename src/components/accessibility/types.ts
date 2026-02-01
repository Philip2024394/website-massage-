/**
 * ============================================================================
 * 📋 ACCESSIBILITY TYPES - UNIFIED TYPE DEFINITIONS
 * ============================================================================
 * 
 * Centralized TypeScript interfaces for all accessibility components
 * Used across AccessibilityDashboard, WCAG Checker, Screen Reader Support,
 * Keyboard Navigation, High Contrast Modes, and Appwrite integration
 * 
 * ============================================================================
 */

export interface VisualTheme {
  id: string;
  name: string;
  type: 'high-contrast' | 'dark' | 'light' | 'custom';
  colors: ThemeColors;
  accessibility: AccessibilityFeatures;
  preview?: string;
  compliant: boolean;
  rating: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  focus: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface AccessibilityFeatures {
  highContrast: boolean;
  colorBlindFriendly: boolean;
  reducedMotion: boolean;
  largeFonts: boolean;
  focusVisible: boolean;
  screenReaderOptimized: boolean;
}

export interface LiveAnnouncement {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'assertive';
  type: 'polite' | 'assertive' | 'status' | 'alert';
  timestamp: Date;
  context?: string;
  element?: HTMLElement;
}

export interface ARIAIssue {
  id: string;
  element: string;
  selector: string;
  issue: string;
  severity: 'error' | 'warning' | 'suggestion';
  description: string;
  fix: string;
  codeExample: string;
  wcagReference: string;
}

export interface NavigationEvent {
  id: string;
  type: 'keypress' | 'focus' | 'blur' | 'trap';
  key?: string;
  element: FocusableElement;
  timestamp: Date;
  context: string;
}

export interface FocusableElement {
  id: string;
  tagName: string;
  selector: string;
  tabIndex: number;
  ariaLabel?: string;
  role?: string;
  visible: boolean;
  accessible: boolean;
  rect: DOMRect;
  issues: string[];
}

export interface ContrastCheck {
  foreground: string;
  background: string;
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  score: number;
  recommendation: string;
}

export interface VisualPreferences {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  reducedMotion: boolean;
  highContrast: boolean;
  darkMode: boolean;
  colorBlindnessFilter: string | null;
  customTheme: string | null;
}

export interface WCAGViolation {
  id: string;
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  element?: string;
  selector?: string;
  fix: string;
  codeExample: string;
  helpUrl: string;
  tags: string[];
}

export interface AccessibilityAuditResult {
  id: string;
  timestamp: Date;
  url: string;
  violations: WCAGViolation[];
  passes: WCAGCheck[];
  incomplete: WCAGCheck[];
  score: number;
  level: 'A' | 'AA' | 'AAA';
  summary: {
    total: number;
    violations: number;
    passes: number;
    incomplete: number;
  };
}

export interface WCAGCheck {
  id: string;
  criterion: string;
  level: 'A' | 'AA' | 'AAA';
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'incomplete';
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
}

export interface ScreenReaderProfile {
  id: string;
  name: string;
  vendor: string;
  version: string;
  compatibility: 'full' | 'partial' | 'limited';
  features: ScreenReaderFeature[];
  testResults: TestResult[];
}

export interface ScreenReaderFeature {
  name: string;
  supported: boolean;
  notes?: string;
}

export interface TestResult {
  feature: string;
  status: 'pass' | 'fail' | 'partial';
  details: string;
  timestamp: Date;
}

export interface KeyboardShortcut {
  id: string;
  key: string;
  modifiers: string[];
  description: string;
  element?: string;
  context: 'global' | 'local' | 'modal';
  enabled: boolean;
  conflicts: string[];
}

export interface TabOrder {
  sequence: FocusableElement[];
  issues: TabOrderIssue[];
  score: number;
  recommendations: string[];
}

export interface TabOrderIssue {
  id: string;
  element: FocusableElement;
  type: 'missing-focus' | 'illogical-order' | 'trapped-focus' | 'invisible-element' | 'negative-tabindex';
  severity: 'error' | 'warning' | 'suggestion';
  description: string;
  fix: string;
}

export interface FocusTrap {
  id: string;
  container: string;
  active: boolean;
  firstElement: FocusableElement | null;
  lastElement: FocusableElement | null;
  previousFocus: FocusableElement | null;
  autoRestore: boolean;
}

export interface ColorBlindnessFilter {
  id: string;
  name: string;
  type: 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia' | 'protanomaly' | 'deuteranomaly' | 'tritanomaly' | 'achromatomaly';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  prevalence: string;
  enabled: boolean;
}

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

// Component Props Interfaces
export interface AccessibilityDashboardProps {
  enabled?: boolean;
  therapistId?: string;
  onComplianceChange?: (score: number) => void;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  className?: string;
}

export interface WCAGComplianceCheckerProps {
  enabled?: boolean;
  onViolationDetected?: (violations: WCAGViolation[]) => void;
  onComplianceScore?: (score: number) => void;
  className?: string;
}

export interface ScreenReaderSupportProps {
  enabled?: boolean;
  onAnnouncementChange?: (announcement: LiveAnnouncement) => void;
  onARIAValidation?: (issues: ARIAIssue[]) => void;
  className?: string;
}

export interface KeyboardNavigationProps {
  enabled?: boolean;
  onNavigationChange?: (event: NavigationEvent) => void;
  onFocusChange?: (element: FocusableElement) => void;
  className?: string;
}

export interface HighContrastVisualModesProps {
  enabled?: boolean;
  onThemeChange?: (theme: VisualTheme) => void;
  onContrastChange?: (ratio: number) => void;
  className?: string;
}

// Utility Types
export type AccessibilityFeatureType = 
  | 'high-contrast' 
  | 'screen-reader' 
  | 'keyboard-navigation' 
  | 'reduced-motion' 
  | 'voice-announcements' 
  | 'custom-shortcuts'
  | 'wcag-compliance'
  | 'color-blindness-support';

export type WCAGLevel = 'A' | 'AA' | 'AAA';

export type ImpactLevel = 'minor' | 'moderate' | 'serious' | 'critical';

export type ComplianceStatus = 'pass' | 'fail' | 'incomplete' | 'not-tested';

// Event Types
export interface AccessibilityChangeEvent {
  type: AccessibilityFeatureType;
  enabled: boolean;
  settings?: Partial<AccessibilitySettings>;
  timestamp: Date;
}

export interface ComplianceCheckEvent {
  auditId: string;
  score: number;
  violations: number;
  level: WCAGLevel;
  timestamp: Date;
}

export interface VoiceAnnouncementEvent {
  message: string;
  priority: LiveAnnouncement['priority'];
  type: LiveAnnouncement['type'];
  timestamp: Date;
}

// Integration Types
export interface TherapistAccessibilityProfile {
  therapistId: string;
  therapist: any; // Therapist type from main app
  accessibilitySettings: AccessibilitySettings;
  complianceScore: number;
  lastAudit: Date;
  featuresEnabled: AccessibilityFeatureType[];
}

export interface BookingAccessibilityRequirements {
  bookingId: string;
  requirements: string[];
  accommodations: string[];
  specialInstructions?: string;
  customerAccessibilityNeeds: AccessibilityFeatureType[];
}

export default {};

// Export all types for easy importing
export type {
  VisualTheme,
  ThemeColors,
  AccessibilityFeatures,
  LiveAnnouncement,
  ARIAIssue,
  NavigationEvent,
  FocusableElement,
  ContrastCheck,
  VisualPreferences,
  WCAGViolation,
  AccessibilityAuditResult,
  WCAGCheck,
  ScreenReaderProfile,
  KeyboardShortcut,
  TabOrder,
  FocusTrap,
  ColorBlindnessFilter,
  AccessibilitySettings,
  AccessibilityAnalytics
};