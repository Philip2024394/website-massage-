/**
 * 🔒 CORE SYSTEM LOCK - PROTECTION INDEX
 * =====================================
 * 
 * This file tracks all protected components in the
 * massage therapist platform core system.
 * 
 * ⚠️  DO NOT MODIFY THIS FILE OR ANY LISTED COMPONENTS
 * 🔒 All listed files contain business-critical functionality
 */

export const CORE_SYSTEM_PROTECTION = {
  status: 'ACTIVE_AND_ENFORCED',
  lockDate: '2026-02-08',
  version: '2.0',
  protectionLevel: 'MAXIMUM',
  
  // 🔒 CORE BUSINESS LOGIC FILES (MAXIMUM PROTECTION)
  coreFiles: {
    defaultMenuService: {
      path: 'src/services/defaultMenuService.ts',
      protection: 'MAXIMUM',
      critical: [
        '50 unique massage service definitions',
        '5-category distribution system',
        'Service interface and type definitions',
        'Badge assignment and popularity scoring'
      ]
    },
    
    enhancedMenuDataService: {
      path: 'src/services/enhancedMenuDataService.ts', 
      protection: 'HIGH',
      critical: [
        'Badge generation algorithm',
        'Menu state management',
        'Auto-hiding logic for default services',
        'localStorage persistence'
      ]
    },
    
    useEnhancedMenuData: {
      path: 'src/hooks/useEnhancedMenuData.ts',
      protection: 'HIGH', 
      critical: [
        'Menu data loading and state management',
        'Badge session consistency',
        'Default/real menu switching logic',
        'Real-time data synchronization'
      ]
    },
    
    therapistMenuManager: {
      path: 'src/components/therapist/TherapistMenuManager.tsx',
      protection: 'MAXIMUM',
      critical: [
        'Single active window slider behavior',
        'Countdown timer functionality',
        'Live booking system integration',
        'Service interaction patterns'
      ]
    },
    
    seoSystemArchitecture: {
      path: 'src/components/therapist/profile/**',
      protection: 'MAXIMUM',
      critical: [
        'Unique title, meta, H1 per therapist profile',
        'Location schema (LocalBusiness) implementation',
        'Micro-location targeting and keyword uniqueness',
        'Canonical URLs and indexing directives',
        'Anti-hashtag SEO strategy enforcement'
      ]
    }
  },
  
  // 🚨 CRITICAL FUNCTIONALITY UNDER PROTECTION
  protectedSystems: {
    defaultMenuSystem: {
      serviceCount: 50,
      categoryDistribution: '5 categories × 10 services each',
      businessImpact: 'REVENUE_CRITICAL',
      userImpact: 'ALL_THERAPISTS'
    },
    
    badgeSystem: {
      badgeTypes: ['New', 'Popular', 'Just Scheduled', 'Best Price'],
      sessionConsistency: 'ENFORCED',
      businessImpact: 'UX_CRITICAL',
      userImpact: 'ALL_CUSTOMERS'
    },
    
    sliderBehavior: {
      activeWindowRule: 'SINGLE_WINDOW_ONLY',
      countdownTimers: 'AUTO_COLLAPSE_ENABLED',
      businessImpact: 'UX_CRITICAL',
      userImpact: 'ALL_USERS'
    },
    
    bookingSystem: {
      integration: 'APPWRITE_LIVE',
      defaultServices: 'FULLY_BOOKABLE',
      businessImpact: 'REVENUE_CRITICAL',
      userImpact: 'ALL_CUSTOMERS'
    },
    
    seoSystemArchitecture: {
      profileUniqueness: 'ENFORCED',
      locationTargeting: 'MICRO_LOCATION_REQUIRED',
      schemaMarkup: 'LOCALBUSINESS_MANDATORY',
      hashtagStrategy: 'HASHTAGS_PROHIBITED_FOR_SEO',
      businessImpact: 'ORGANIC_TRAFFIC_CRITICAL',
      userImpact: 'ALL_THERAPIST_PROFILES'
    }
  },
  
  // ✅ SAFE MODIFICATION AREAS  
  uiModificationAllowed: {
    colors: 'SAFE',
    spacing: 'SAFE', 
    animations: 'SAFE',
    layouts: 'SAFE',
    badgeStyling: 'SAFE',
    dashboardNotices: 'SAFE'
  },
  
  // 🛡️ ENFORCEMENT MECHANISMS
  protection: {
    documentationFiles: [
      'CORE_SYSTEM_LOCK.md',
      'LOCK_QUICK_REFERENCE.md'
    ],
    fileHeaderComments: 'ADDED_TO_ALL_CRITICAL_FILES',
    businessJustification: 'DOCUMENTED',
    modificationGuidelines: 'CLEARLY_DEFINED'
  }
};

/**
 * 🚨 VIOLATION CHECK FUNCTION
 * Use this to verify if a modification violates the lock
 */
export function checkModificationAllowed(filePath: string, modificationType: string): boolean {
  const coreFiles = Object.values(CORE_SYSTEM_PROTECTION.coreFiles);
  const isProtectedFile = coreFiles.some(file => filePath.includes(file.path));
  
  if (isProtectedFile && !['STYLING_ONLY', 'UI_ONLY'].includes(modificationType)) {
    console.warn(`🚨 CORE SYSTEM LOCK VIOLATION: ${filePath}`);
    console.warn('See CORE_SYSTEM_LOCK.md for modification guidelines');
    return false;
  }
  
  return true;
}

export default CORE_SYSTEM_PROTECTION;