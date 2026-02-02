/**
 * ============================================================================
 * 🔒 STEP 12 FREEZE IMPLEMENTATION - THERAPIST DASHBOARD
 * ============================================================================
 * 
 * This utility validates the freeze status and prevents unauthorized modifications
 * to the frozen therapist dashboard feature.
 * 
 * ============================================================================
 */

export const FREEZE_STATUS = {
  FEATURE: 'therapist-dashboard',
  FROZEN_SINCE: '2026-02-02',
  FREEZE_LEVEL: 'CRITICAL',
  STEP: 12
} as const;

export interface FreezeViolation {
  type: 'MODIFICATION_ATTEMPT' | 'REFACTOR_DETECTED' | 'ARCHITECTURE_CHANGE';
  component: string;
  attempted_action: string;
  timestamp: Date;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class TherapistDashboardFreezeGuard {
  private static violations: FreezeViolation[] = [];

  /**
   * Validates if a modification is allowed under freeze rules
   */
  static validateModification(
    component: string,
    action: string,
    justification?: string
  ): { allowed: boolean; reason: string } {
    
    // Check if it's a critical bug fix
    const criticalKeywords = [
      'security', 'vulnerability', 'crash', 'data-corruption', 
      'memory-leak', 'accessibility-violation', 'production-bug'
    ];
    
    const isCritical = criticalKeywords.some(keyword => 
      (justification || action).toLowerCase().includes(keyword)
    );

    // Check for prohibited modifications
    const prohibitedKeywords = [
      'refactor', 'redesign', 'enhancement', 'feature', 'improvement',
      'optimization', 'cleanup', 'modernize', 'update', 'upgrade'
    ];
    
    const isProhibited = prohibitedKeywords.some(keyword =>
      action.toLowerCase().includes(keyword)
    );

    if (isProhibited && !isCritical) {
      this.logViolation({
        type: 'MODIFICATION_ATTEMPT',
        component,
        attempted_action: action,
        timestamp: new Date(),
        severity: 'HIGH'
      });

      return {
        allowed: false,
        reason: `❌ FREEZE VIOLATION: ${action} is prohibited on frozen component ${component}. Only critical bug fixes allowed.`
      };
    }

    if (isCritical) {
      return {
        allowed: true,
        reason: `⚠️ CRITICAL FIX APPROVED: Ensure this is logged in THERAPIST_DASHBOARD_FREEZE_LOG.md`
      };
    }

    return {
      allowed: true,
      reason: `✅ Modification appears to be maintenance-level and allowed`
    };
  }

  /**
   * Logs freeze violations for review
   */
  private static logViolation(violation: FreezeViolation) {
    this.violations.push(violation);
    console.error(`🚨 FREEZE VIOLATION DETECTED:`, violation);
    
    // In a real implementation, this would:
    // 1. Send to monitoring system
    // 2. Alert architecture team
    // 3. Block deployment if critical
  }

  /**
   * Get all recorded violations
   */
  static getViolations(): FreezeViolation[] {
    return [...this.violations];
  }

  /**
   * Check if component is frozen
   */
  static isFrozen(component: string): boolean {
    const frozenComponents = [
      'therapist-dashboard/View.tsx',
      'therapist-dashboard/ErrorBoundary.tsx',
      'therapist-dashboard/RollbackValidation.tsx',
      'therapist-dashboard/CoreDemo.tsx',
      'therapist-dashboard/FeatureFlagDemo.tsx',
      'therapist-dashboard/index.ts'
    ];

    return frozenComponents.some(frozen => component.includes(frozen));
  }

  /**
   * Generate freeze status report
   */
  static getFreezeReport() {
    return {
      status: FREEZE_STATUS,
      violations: this.violations.length,
      last_check: new Date().toISOString(),
      protection_level: 'ACTIVE',
      allowed_modifications: [
        'Critical security fixes',
        'Production crash fixes',
        'Data corruption fixes',
        'Accessibility compliance',
        'Memory leak fixes'
      ],
      prohibited_modifications: [
        'Code refactoring',
        'UI redesigns',
        'Feature additions',
        'Architecture changes',
        'Performance optimizations (non-critical)',
        'Code style improvements'
      ]
    };
  }
}

// Export freeze validation function for use in build process
export const validateFreezeCompliance = (component: string, action: string, justification?: string) => {
  if (TherapistDashboardFreezeGuard.isFrozen(component)) {
    return TherapistDashboardFreezeGuard.validateModification(component, action, justification);
  }
  
  return { allowed: true, reason: 'Component not under freeze protection' };
};

export default TherapistDashboardFreezeGuard;