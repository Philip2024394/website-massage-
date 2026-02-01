/**
 * LANDING PAGE GUARD - ROUTE PROTECTION
 */

import { useEffect } from 'react';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';

/**
 * Landing Page Guard - Edge-only protection system
 * All validation happens here BEFORE landing page loads
 * This prevents issues from reaching the immutable landing page
 */

interface LandingPageGuardConfig {
  enableGPSCheck: boolean;
  enableDeviceCheck: boolean;
  enableNetworkCheck: boolean;
  fallbackCity: string;
}

const defaultConfig: LandingPageGuardConfig = {
  enableGPSCheck: true,
  enableDeviceCheck: true,
  enableNetworkCheck: true,
  fallbackCity: 'sydney'
};

export class LandingPageGuard {
  private config: LandingPageGuardConfig;

  constructor(config: Partial<LandingPageGuardConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Pre-load validation - runs before landing page renders
   * All checks happen at the edge, not in the page
   */
  async validateBeforeLoad(): Promise<{
    canProceed: boolean;
    issues: string[];
    fallbackData?: any;
  }> {
    const issues: string[] = [];
    let fallbackData = {};

    try {
      // 1. Device capability check
      if (this.config.enableDeviceCheck) {
        const deviceCheck = await this.checkDeviceCapabilities();
        if (!deviceCheck.supported) {
          issues.push('Device compatibility issues detected');
        }
      }

      // 2. Network connectivity check
      if (this.config.enableNetworkCheck) {
        const networkCheck = await this.checkNetworkConnectivity();
        if (!networkCheck.connected) {
          issues.push('Network connectivity issues');
          fallbackData = { offline: true };
        }
      }

      // 3. GPS/Location service check
      if (this.config.enableGPSCheck) {
        const locationCheck = await this.checkLocationServices();
        if (!locationCheck.available) {
          issues.push('Location services unavailable');
          fallbackData = { 
            ...fallbackData, 
            useIPLocation: true,
            fallbackCity: this.config.fallbackCity
          };
        }
      }

      return {
        canProceed: true, // Always allow proceeding, but with fallbacks
        issues,
        fallbackData
      };

    } catch (error) {
      console.error('Landing page guard validation failed:', error);
      return {
        canProceed: true, // Fail open to prevent blocking users
        issues: ['Validation system error'],
        fallbackData: { 
          offline: true, 
          fallbackCity: this.config.fallbackCity 
        }
      };
    }
  }

  private async checkDeviceCapabilities(): Promise<{ supported: boolean; details: any }> {
    try {
      const deviceInfo = await deviceService.getDeviceInfo();
      return {
        supported: true,
        details: deviceInfo
      };
    } catch (error) {
      return {
        supported: false,
        details: { error: error.message }
      };
    }
  }

  private async checkNetworkConnectivity(): Promise<{ connected: boolean; details: any }> {
    try {
      // Simple connectivity check
      const online = navigator.onLine;
      const performanceInfo = {
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
        downlink: (navigator as any).connection?.downlink || 'unknown'
      };

      return {
        connected: online,
        details: performanceInfo
      };
    } catch (error) {
      return {
        connected: false,
        details: { error: error.message }
      };
    }
  }

  private async checkLocationServices(): Promise<{ available: boolean; details: any }> {
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        return {
          available: false,
          details: { reason: 'Geolocation not supported' }
        };
      }

      // Test location service availability
      const locationTest = await locationService.testLocationAvailability();
      return {
        available: locationTest.available,
        details: locationTest
      };
    } catch (error) {
      return {
        available: false,
        details: { error: error.message }
      };
    }
  }

  /**
   * Emergency fallback data provider
   * Used when main systems fail
   */
  getEmergencyFallbackData() {
    return {
      location: {
        city: this.config.fallbackCity,
        coordinates: null,
        source: 'fallback'
      },
      device: {
        type: 'unknown',
        mobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent)
      },
      features: {
        gps: false,
        notifications: false,
        install: false
      }
    };
  }
}

/**
 * React hook for landing page guard
 * Use this in AppRouter before rendering landing page
 */
export function useLandingPageGuard(config?: Partial<LandingPageGuardConfig>) {
  const guard = new LandingPageGuard(config);

  useEffect(() => {
    // Pre-load validation
    guard.validateBeforeLoad().then(result => {
      if (result.issues.length > 0) {
        console.warn('Landing page guard detected issues:', result.issues);
        console.log('Fallback data prepared:', result.fallbackData);
      }
    });
  }, []);

  return {
    validateBeforeLoad: () => guard.validateBeforeLoad(),
    getEmergencyFallback: () => guard.getEmergencyFallbackData()
  };
}

export default LandingPageGuard;