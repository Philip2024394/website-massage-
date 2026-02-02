/**
 * ============================================================================
 * 🔒 ARCHITECTURE FREEZE GUARD - STEP 18 ENFORCEMENT
 * ============================================================================
 * 
 * This system prevents core architecture decay by enforcing freeze rules.
 * 
 * FREEZE ZONES:
 * - /src_v2/core/     ← PROTECTED: Only critical bug fixes
 * - /src_v2/shell/    ← PROTECTED: Only critical bug fixes
 * 
 * DEVELOPMENT ZONES:
 * - /src_v2/features/ ← NEW WORK: All features go here
 * - /src_v2/ui/       ← NEW WORK: All UI components go here
 * 
 * ============================================================================
 */

export const FREEZE_STATUS = {
  IMPLEMENTATION_DATE: '2026-02-02',
  FREEZE_LEVEL: 'MAXIMUM',
  STEP: 18,
  ENFORCEMENT: 'ACTIVE'
} as const;

export const FROZEN_DIRECTORIES = [
  '/src_v2/core/',
  '/src_v2/shell/'
] as const;

export const DEVELOPMENT_DIRECTORIES = [
  '/src_v2/features/',
  '/src_v2/ui/'
] as const;

export interface FreezeViolation {
  type: 'CORE_MODIFICATION' | 'SHELL_MODIFICATION' | 'UNAUTHORIZED_CHANGE' | 'ARCHITECTURE_BREACH';
  file: string;
  change: string;
  timestamp: Date;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  justification?: string;
}

export interface CoreExtensionRequest {
  id: string;
  featureName: string;
  requiredCoreChange: string;
  businessJustification: string;
  architecturalImpact: string;
  alternativesConsidered: string[];
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

export class ArchitectureFreezeGuard {
  private static violations: FreezeViolation[] = [];
  private static extensionRequests: CoreExtensionRequest[] = [];

  /**
   * Validates if a file modification violates freeze rules
   */
  static validateFileChange(filePath: string, changeType: string, justification?: string): { 
    allowed: boolean; 
    reason: string;
    violation?: FreezeViolation;
  } {
    
    // Check if file is in frozen directory
    const isInFrozenDir = FROZEN_DIRECTORIES.some(dir => filePath.includes(dir.replace('/', '')));
    
    if (!isInFrozenDir) {
      return { allowed: true, reason: 'File outside freeze zones' };
    }

    // Critical bug fix keywords
    const criticalKeywords = [
      'crash', 'security', 'vulnerability', 'data-corruption', 
      'memory-leak', 'production-down', 'critical-bug', 'hotfix'
    ];
    
    const isCriticalFix = criticalKeywords.some(keyword => 
      (justification || changeType).toLowerCase().includes(keyword)
    );

    // Prohibited change types
    const prohibitedKeywords = [
      'refactor', 'improve', 'optimize', 'cleanup', 'modernize',
      'enhance', 'update', 'upgrade', 'style', 'format'
    ];
    
    const isProhibitedChange = prohibitedKeywords.some(keyword =>
      changeType.toLowerCase().includes(keyword)
    );

    if (isProhibitedChange && !isCriticalFix) {
      const violation: FreezeViolation = {
        type: filePath.includes('core') ? 'CORE_MODIFICATION' : 'SHELL_MODIFICATION',
        file: filePath,
        change: changeType,
        timestamp: new Date(),
        severity: 'HIGH',
        justification
      };

      this.logViolation(violation);

      return {
        allowed: false,
        reason: `🚫 FREEZE VIOLATION: "${changeType}" prohibited on frozen architecture. Only critical bug fixes allowed.`,
        violation
      };
    }

    if (isCriticalFix) {
      return {
        allowed: true,
        reason: `⚠️ CRITICAL FIX APPROVED: Document in ARCHITECTURE_FREEZE_LOG.md`
      };
    }

    // Default: allow with documentation requirement
    return {
      allowed: true,
      reason: `✅ Change appears maintenance-level, ensure proper documentation`
    };
  }

  /**
   * Creates a core extension request for new functionality
   */
  static requestCoreExtension(request: Omit<CoreExtensionRequest, 'id' | 'createdAt' | 'approvalStatus'>): string {
    const extensionRequest: CoreExtensionRequest = {
      ...request,
      id: `ext-${Date.now()}`,
      approvalStatus: 'PENDING',
      createdAt: new Date()
    };

    this.extensionRequests.push(extensionRequest);
    console.log(`🎯 CORE EXTENSION REQUEST: ${extensionRequest.id} created for "${request.featureName}"`);
    
    return extensionRequest.id;
  }

  /**
   * Logs freeze violations for review
   */
  private static logViolation(violation: FreezeViolation) {
    this.violations.push(violation);
    console.error(`🚨 ARCHITECTURE FREEZE VIOLATION:`, violation);
    
    // In production, this would:
    // 1. Block the change
    // 2. Send alert to architecture team
    // 3. Require approval workflow
    // 4. Generate incident report
  }

  /**
   * Check if file is in development zone
   */
  static isInDevelopmentZone(filePath: string): boolean {
    return DEVELOPMENT_DIRECTORIES.some(dir => 
      filePath.includes(dir.replace('/', ''))
    );
  }

  /**
   * Generate architecture compliance report
   */
  static getComplianceReport() {
    return {
      status: FREEZE_STATUS,
      frozenDirectories: FROZEN_DIRECTORIES,
      developmentDirectories: DEVELOPMENT_DIRECTORIES,
      violations: this.violations.length,
      pendingExtensions: this.extensionRequests.filter(req => req.approvalStatus === 'PENDING').length,
      lastCheck: new Date().toISOString(),
      protectionLevel: 'MAXIMUM',
      rules: {
        coreModifications: 'PROHIBITED (except critical bugs)',
        shellModifications: 'PROHIBITED (except critical bugs)', 
        featureAdditions: 'FEATURES DIRECTORY ONLY',
        uiComponents: 'UI DIRECTORY ONLY',
        coreExtensions: 'DESIGN-FIRST APPROVAL REQUIRED'
      },
      developmentProtocol: {
        newFeature: 'CREATE IN /src_v2/features/',
        newUI: 'CREATE IN /src_v2/ui/',
        needsCoreChange: 'SUBMIT EXTENSION REQUEST',
        bugFix: 'ALLOW WITH JUSTIFICATION',
        refactor: 'PROHIBITED'
      }
    };
  }

  /**
   * Get all violations for review
   */
  static getViolations(): FreezeViolation[] {
    return [...this.violations];
  }

  /**
   * Get pending extension requests
   */
  static getPendingExtensions(): CoreExtensionRequest[] {
    return this.extensionRequests.filter(req => req.approvalStatus === 'PENDING');
  }
}

// Export utilities for build/CI integration
export const validateArchitectureChange = (filePath: string, changeType: string, justification?: string) => {
  return ArchitectureFreezeGuard.validateFileChange(filePath, changeType, justification);
};

export const requestCoreExtension = (request: Omit<CoreExtensionRequest, 'id' | 'createdAt' | 'approvalStatus'>) => {
  return ArchitectureFreezeGuard.requestCoreExtension(request);
};

export default ArchitectureFreezeGuard;