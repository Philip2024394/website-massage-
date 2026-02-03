/**
 * Violation Percentage Tracking Service
 * Tracks user violations and implements percentage-based warnings and restrictions
 */

export interface ViolationRecord {
  id: string;
  userId: string;
  chatId: string;
  violationType: 'phone_number' | 'split_phone_attempt' | 'spam' | 'profanity' | 'inappropriate';
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  details: string;
  resolved: boolean;
}

export interface UserViolationProfile {
  userId: string;
  totalMessages: number;
  totalViolations: number;
  violationPercentage: number;
  riskLevel: 'safe' | 'warning' | 'danger' | 'critical';
  chatDeactivated: boolean;
  lastViolationTime: Date | null;
  violationHistory: ViolationRecord[];
  warningHistory: string[];
  restrictions: {
    chatDisabled: boolean;
    bookingRestricted: boolean;
    accountFlagged: boolean;
  };
}

export interface ViolationThresholds {
  warningLevel: number;      // 40% - Show orange warning
  dangerLevel: number;       // 60% - Show red warning  
  criticalLevel: number;     // 90% - Deactivate chat
  maxRecentAttempts: number; // 10 - Max attempts in 24h
}

class ViolationPercentageService {
  private userProfiles = new Map<string, UserViolationProfile>();
  private violationRecords = new Map<string, ViolationRecord[]>();
  
  private thresholds: ViolationThresholds = {
    warningLevel: 40,
    dangerLevel: 60, 
    criticalLevel: 90,
    maxRecentAttempts: 10
  };

  /**
   * Record a new violation for a user
   */
  async recordViolation(violation: Omit<ViolationRecord, 'id' | 'timestamp' | 'resolved'>): Promise<string> {
    const violationId = `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const violationRecord: ViolationRecord = {
      ...violation,
      id: violationId,
      timestamp: new Date(),
      resolved: false
    };

    // Add to violation records
    const userViolations = this.violationRecords.get(violation.userId) || [];
    userViolations.push(violationRecord);
    this.violationRecords.set(violation.userId, userViolations);

    // Update user profile
    await this.updateUserProfile(violation.userId);

    return violationId;
  }

  /**
   * Update user violation profile and percentages
   */
  private async updateUserProfile(userId: string): Promise<UserViolationProfile> {
    // Get user's message history from moderation service
    const moderationStats = await this.getUserModerationStats(userId);
    const violations = this.violationRecords.get(userId) || [];
    
    // Filter recent violations (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViolations = violations.filter(v => v.timestamp > twentyFourHoursAgo);
    
    // Calculate violation percentage
    const totalMessages = moderationStats.messagesCount || 1; // Avoid division by zero
    const violationPercentage = Math.round((violations.length / totalMessages) * 100);
    
    // Determine risk level
    const riskLevel = this.calculateRiskLevel(violationPercentage, recentViolations.length);
    
    // Check if chat should be deactivated
    const chatDeactivated = this.shouldDeactivateChat(violationPercentage, recentViolations.length);
    
    // Get last violation time
    const lastViolationTime = violations.length > 0 
      ? violations[violations.length - 1].timestamp 
      : null;

    // Generate warning history based on percentage thresholds crossed
    const warningHistory = this.generateWarningHistory(violationPercentage, recentViolations.length);

    const profile: UserViolationProfile = {
      userId,
      totalMessages,
      totalViolations: violations.length,
      violationPercentage,
      riskLevel,
      chatDeactivated,
      lastViolationTime,
      violationHistory: violations.slice(-10), // Keep last 10 violations
      warningHistory,
      restrictions: {
        chatDisabled: chatDeactivated,
        bookingRestricted: violationPercentage >= this.thresholds.dangerLevel,
        accountFlagged: violationPercentage >= this.thresholds.warningLevel
      }
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Calculate risk level based on percentage and recent attempts
   */
  private calculateRiskLevel(percentage: number, recentAttempts: number): 'safe' | 'warning' | 'danger' | 'critical' {
    // Critical level - immediate deactivation
    if (percentage >= this.thresholds.criticalLevel || recentAttempts >= this.thresholds.maxRecentAttempts) {
      return 'critical';
    }
    
    // Danger level - red warnings and final warnings
    if (percentage >= this.thresholds.dangerLevel || recentAttempts >= 7) {
      return 'danger';
    }
    
    // Warning level - orange warnings
    if (percentage >= this.thresholds.warningLevel || recentAttempts >= 3) {
      return 'warning';
    }
    
    // Safe level
    return 'safe';
  }

  /**
   * Determine if chat should be deactivated
   */
  private shouldDeactivateChat(percentage: number, recentAttempts: number): boolean {
    return percentage >= this.thresholds.criticalLevel || recentAttempts >= this.thresholds.maxRecentAttempts;
  }

  /**
   * Generate warning messages based on violation levels
   */
  private generateWarningHistory(percentage: number, recentAttempts: number): string[] {
    const warnings: string[] = [];
    
    if (percentage >= this.thresholds.criticalLevel || recentAttempts >= this.thresholds.maxRecentAttempts) {
      warnings.push('🚫 CHAT DEACTIVATED - Multiple serious policy violations detected');
    } else if (percentage >= 75 || recentAttempts >= 7) {
      warnings.push('🚨 FINAL WARNING - One more violation will deactivate your chat permanently');
    } else if (percentage >= this.thresholds.dangerLevel || recentAttempts >= 4) {
      warnings.push('⛔ DANGER - Sharing personal contact information is STRICTLY FORBIDDEN');
    } else if (percentage >= 50 || recentAttempts >= 3) {
      warnings.push('⚠️ HIGH WARNING - Repeated policy violations detected');
    } else if (percentage >= this.thresholds.warningLevel || recentAttempts >= 2) {
      warnings.push('⚠️ WARNING - Policy violation detected');
    }

    return warnings;
  }

  /**
   * Get user's current violation profile
   */
  async getUserViolationProfile(userId: string): Promise<UserViolationProfile> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = await this.updateUserProfile(userId);
    }
    
    return profile;
  }

  /**
   * Get real-time warning message based on current violation status
   */
  async getWarningMessage(userId: string): Promise<{
    message: string;
    severity: 'info' | 'warning' | 'danger' | 'critical';
    percentage: number;
    showPercentage: boolean;
  }> {
    const profile = await this.getUserViolationProfile(userId);
    
    const baseMessages = {
      'critical': {
        message: '🚫 CHAT DEACTIVATED - Multiple serious policy violations detected',
        severity: 'critical' as const,
        showPercentage: true
      },
      'danger': {
        message: '⛔ DANGER - Sharing personal contact information is STRICTLY FORBIDDEN',
        severity: 'danger' as const,
        showPercentage: true
      },
      'warning': {
        message: '⚠️ WARNING - Repeated policy violations detected',
        severity: 'warning' as const,
        showPercentage: true
      },
      'safe': {
        message: '🔒 Platform Safety: Contact sharing will immediately deactivate chat',
        severity: 'info' as const,
        showPercentage: false
      }
    };

    const warningConfig = baseMessages[profile.riskLevel];
    
    return {
      ...warningConfig,
      percentage: profile.violationPercentage
    };
  }

  /**
   * Check if user can send messages
   */
  async canUserSendMessage(userId: string): Promise<{
    canSend: boolean;
    reason?: string;
    restrictionLevel: 'none' | 'warning' | 'restricted' | 'blocked';
  }> {
    const profile = await this.getUserViolationProfile(userId);
    
    if (profile.chatDeactivated) {
      return {
        canSend: false,
        reason: 'Chat has been deactivated due to policy violations',
        restrictionLevel: 'blocked'
      };
    }
    
    if (profile.riskLevel === 'danger') {
      return {
        canSend: true,
        reason: 'User is at high risk - one more violation will result in chat deactivation',
        restrictionLevel: 'restricted'
      };
    }
    
    if (profile.riskLevel === 'warning') {
      return {
        canSend: true,
        reason: 'User has policy violations - monitoring closely',
        restrictionLevel: 'warning'
      };
    }
    
    return {
      canSend: true,
      restrictionLevel: 'none'
    };
  }

  /**
   * Get violation statistics for admin dashboard
   */
  async getSystemViolationStats(): Promise<{
    totalUsers: number;
    usersWithViolations: number;
    averageViolationPercentage: number;
    usersAtRisk: {
      warning: number;
      danger: number;
      critical: number;
    };
    recentViolations: number;
    deactivatedChats: number;
  }> {
    const allProfiles = Array.from(this.userProfiles.values());
    
    const usersWithViolations = allProfiles.filter(p => p.totalViolations > 0).length;
    const averageViolationPercentage = allProfiles.reduce((sum, p) => sum + p.violationPercentage, 0) / allProfiles.length || 0;
    
    const usersAtRisk = {
      warning: allProfiles.filter(p => p.riskLevel === 'warning').length,
      danger: allProfiles.filter(p => p.riskLevel === 'danger').length,
      critical: allProfiles.filter(p => p.riskLevel === 'critical').length
    };
    
    // Recent violations (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentViolations = Array.from(this.violationRecords.values())
      .flat()
      .filter(v => v.timestamp > twentyFourHoursAgo).length;
    
    const deactivatedChats = allProfiles.filter(p => p.chatDeactivated).length;
    
    return {
      totalUsers: allProfiles.length,
      usersWithViolations,
      averageViolationPercentage: Math.round(averageViolationPercentage),
      usersAtRisk,
      recentViolations,
      deactivatedChats
    };
  }

  /**
   * Reset user violations (admin function)
   */
  async resetUserViolations(userId: string, adminId: string): Promise<boolean> {
    try {
      // Clear violation records
      this.violationRecords.delete(userId);
      
      // Reset user profile
      const profile = await this.updateUserProfile(userId);
      profile.chatDeactivated = false;
      profile.restrictions = {
        chatDisabled: false,
        bookingRestricted: false,
        accountFlagged: false
      };
      
      this.userProfiles.set(userId, profile);
      
      // Log admin action
      console.log(`Admin ${adminId} reset violations for user ${userId}`);
      
      return true;
    } catch (error) {
      console.error('Failed to reset user violations:', error);
      return false;
    }
  }

  /**
   * Update violation thresholds (admin configuration)
   */
  updateThresholds(newThresholds: Partial<ViolationThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    
    // Recalculate all user profiles with new thresholds
    for (const userId of this.userProfiles.keys()) {
      this.updateUserProfile(userId);
    }
  }

  /**
   * Get user moderation stats from the main moderation service
   */
  private async getUserModerationStats(userId: string): Promise<any> {
    // This would integrate with your existing chatModerationService
    // For now, return mock data
    return {
      messagesCount: 100,
      spamWarnings: 0,
      lastMessageTime: new Date(),
      rateLimitHits: 0,
      flaggedContent: 0
    };
  }

  /**
   * Export violation data for compliance/audit
   */
  exportViolationData(userId?: string): any {
    if (userId) {
      return {
        profile: this.userProfiles.get(userId),
        violations: this.violationRecords.get(userId) || []
      };
    }
    
    return {
      profiles: Object.fromEntries(this.userProfiles),
      violations: Object.fromEntries(this.violationRecords),
      thresholds: this.thresholds,
      exportTimestamp: new Date().toISOString()
    };
  }
}

export const violationPercentageService = new ViolationPercentageService();