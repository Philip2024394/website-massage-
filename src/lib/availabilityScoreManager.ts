/**
 * Availability Scoring System
 * 
 * PURPOSE: Tracks therapist responsiveness and impacts search visibility
 * 
 * SCORING RULES:
 * - Accept within 5 min: +5 points
 * - Miss deadline (5 min): -10 points
 * - Decline with reason: No penalty
 * - Multiple misses: Exponential visibility penalty
 * 
 * SCORE EFFECTS:
 * - 80-100: Top search results, "Highly Responsive" badge
 * - 60-79: Normal visibility
 * - 40-59: Lower search ranking, warning shown
 * - 0-39: Very low visibility, "Improve Responsiveness" flag
 */

import { databases } from '../../lib/appwrite.config';
import { ID, Query } from 'appwrite';

const APPWRITE_CONFIG = {
  databaseId: '68f76ee1000e64ca8d05',
  therapistsCollectionId: 'therapists',
  availabilityScoresCollectionId: 'availability_scores'
};

interface AvailabilityScore {
  $id?: string;
  therapistId: string;
  score: number; // 0-100
  totalRequests: number;
  acceptedCount: number;
  declinedCount: number;
  missedCount: number;
  avgResponseTime: number; // seconds
  lastUpdated: string;
  badges: string[]; // e.g., "highly-responsive", "quick-responder"
  penalties: number; // Count of consecutive misses
}

interface BookingResponse {
  bookingId: string;
  therapistId: string;
  action: 'accept' | 'decline' | 'missed';
  responseTime: number; // milliseconds from notification to action
  declineReason?: string;
  timestamp: string;
}

export class AvailabilityScoreManager {
  
  /**
   * Record booking response and update availability score
   */
  static async recordResponse(response: BookingResponse): Promise<AvailabilityScore> {
    try {
      // Get current score or create new
      let scoreDoc = await this.getScore(response.therapistId);
      
      if (!scoreDoc) {
        scoreDoc = await this.initializeScore(response.therapistId);
      }

      // Calculate points based on action and time
      let pointsChange = 0;
      const responseSeconds = response.responseTime / 1000;

      if (response.action === 'accept') {
        // Accept within 5 minutes: +5 points
        if (responseSeconds <= 300) {
          pointsChange = 5;
          // Bonus for very fast responses (within 1 minute)
          if (responseSeconds <= 60) {
            pointsChange = 7;
          }
        } else {
          // Late accept: +2 points (better than miss)
          pointsChange = 2;
        }
        scoreDoc.acceptedCount += 1;
        scoreDoc.penalties = 0; // Reset penalty counter on accept
        
      } else if (response.action === 'decline') {
        // Decline with reason: No penalty, just track
        scoreDoc.declinedCount += 1;
        scoreDoc.penalties = Math.max(0, scoreDoc.penalties - 1); // Slight penalty reduction
        
      } else if (response.action === 'missed') {
        // Missed deadline: -10 points
        pointsChange = -10;
        scoreDoc.missedCount += 1;
        scoreDoc.penalties += 1;
        
        // Exponential penalty for consecutive misses
        if (scoreDoc.penalties >= 3) {
          pointsChange = -20; // Harsh penalty for pattern
        }
      }

      // Update score (0-100 range)
      scoreDoc.score = Math.max(0, Math.min(100, scoreDoc.score + pointsChange));
      scoreDoc.totalRequests += 1;

      // Update average response time
      scoreDoc.avgResponseTime = 
        (scoreDoc.avgResponseTime * (scoreDoc.totalRequests - 1) + responseSeconds) / 
        scoreDoc.totalRequests;

      // Update badges
      scoreDoc.badges = this.calculateBadges(scoreDoc);
      scoreDoc.lastUpdated = new Date().toISOString();

      // Save to database
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.availabilityScoresCollectionId,
        scoreDoc.$id,
        {
          score: scoreDoc.score,
          totalRequests: scoreDoc.totalRequests,
          acceptedCount: scoreDoc.acceptedCount,
          declinedCount: scoreDoc.declinedCount,
          missedCount: scoreDoc.missedCount,
          avgResponseTime: scoreDoc.avgResponseTime,
          badges: scoreDoc.badges,
          penalties: scoreDoc.penalties,
          lastUpdated: scoreDoc.lastUpdated
        }
      );

      // Update therapist's visibility in main collection
      await this.updateTherapistVisibility(response.therapistId, scoreDoc.score);

      console.log(`📊 Availability score updated for ${response.therapistId}: ${scoreDoc.score} (${pointsChange > 0 ? '+' : ''}${pointsChange})`);

      return scoreDoc;

    } catch (error) {
      console.error('Failed to record availability response:', error);
      throw error;
    }
  }

  /**
   * Get current availability score for therapist
   */
  static async getScore(therapistId: string): Promise<AvailabilityScore | null> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.availabilityScoresCollectionId,
        [Query.equal('therapistId', therapistId)]
      );

      if (response.documents.length > 0) {
        return response.documents[0] as any;
      }

      return null;
    } catch (error) {
      console.error('Failed to get availability score:', error);
      return null;
    }
  }

  /**
   * Initialize new availability score
   */
  static async initializeScore(therapistId: string): Promise<AvailabilityScore> {
    const newScore: Partial<AvailabilityScore> = {
      therapistId,
      score: 80, // Start at 80 (gives benefit of doubt)
      totalRequests: 0,
      acceptedCount: 0,
      declinedCount: 0,
      missedCount: 0,
      avgResponseTime: 0,
      badges: ['new'],
      penalties: 0,
      lastUpdated: new Date().toISOString()
    };

    const doc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.availabilityScoresCollectionId,
      ID.unique(),
      newScore
    );

    return doc as any;
  }

  /**
   * Calculate badges based on performance
   */
  private static calculateBadges(score: AvailabilityScore): string[] {
    const badges: string[] = [];

    // Responsiveness badges
    if (score.score >= 90) {
      badges.push('highly-responsive');
    } else if (score.score >= 80) {
      badges.push('responsive');
    }

    // Speed badges
    if (score.avgResponseTime <= 60) {
      badges.push('lightning-fast');
    } else if (score.avgResponseTime <= 180) {
      badges.push('quick-responder');
    }

    // Reliability badges
    if (score.totalRequests >= 20) {
      const acceptanceRate = (score.acceptedCount / score.totalRequests) * 100;
      if (acceptanceRate >= 80) {
        badges.push('reliable');
      }
    }

    // Warning flags
    if (score.score < 40) {
      badges.push('needs-improvement');
    }

    if (score.penalties >= 3) {
      badges.push('penalty-active');
    }

    return badges;
  }

  /**
   * Update therapist's search visibility based on score
   */
  private static async updateTherapistVisibility(therapistId: string, score: number): Promise<void> {
    try {
      // Calculate visibility multiplier (0.1 to 1.5)
      let visibilityMultiplier = 1.0;

      if (score >= 90) {
        visibilityMultiplier = 1.5; // 50% boost in search
      } else if (score >= 80) {
        visibilityMultiplier = 1.2; // 20% boost
      } else if (score >= 60) {
        visibilityMultiplier = 1.0; // Normal
      } else if (score >= 40) {
        visibilityMultiplier = 0.6; // 40% penalty
      } else {
        visibilityMultiplier = 0.3; // 70% penalty
      }

      // Update therapist document
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.therapistsCollectionId,
        therapistId,
        {
          availabilityScore: score,
          searchVisibilityMultiplier: visibilityMultiplier,
          lastScoreUpdate: new Date().toISOString()
        }
      );

    } catch (error) {
      console.error('Failed to update therapist visibility:', error);
    }
  }

  /**
   * Handle booking expiration (5-minute timeout)
   */
  static async handleExpiration(bookingId: string, therapistId: string, notificationTime: number): Promise<void> {
    const responseTime = Date.now() - notificationTime;
    
    await this.recordResponse({
      bookingId,
      therapistId,
      action: 'missed',
      responseTime,
      timestamp: new Date().toISOString()
    });

    console.log(`⏰ Booking ${bookingId} expired - availability score penalized`);
  }

  /**
   * Get therapist performance summary
   */
  static async getPerformanceSummary(therapistId: string): Promise<{
    score: number;
    rank: string;
    badges: string[];
    stats: {
      totalRequests: number;
      acceptanceRate: number;
      avgResponseTime: number;
      consecutiveMisses: number;
    };
    recommendations: string[];
  }> {
    const scoreDoc = await this.getScore(therapistId);
    
    if (!scoreDoc) {
      return {
        score: 80,
        rank: 'New',
        badges: ['new'],
        stats: {
          totalRequests: 0,
          acceptanceRate: 0,
          avgResponseTime: 0,
          consecutiveMisses: 0
        },
        recommendations: ['Accept your first booking to establish your rating']
      };
    }

    const acceptanceRate = scoreDoc.totalRequests > 0 
      ? (scoreDoc.acceptedCount / scoreDoc.totalRequests) * 100 
      : 0;

    const rank = 
      scoreDoc.score >= 90 ? 'Elite' :
      scoreDoc.score >= 80 ? 'Excellent' :
      scoreDoc.score >= 60 ? 'Good' :
      scoreDoc.score >= 40 ? 'Fair' : 'Needs Improvement';

    const recommendations: string[] = [];
    if (scoreDoc.avgResponseTime > 180) {
      recommendations.push('Try to respond within 3 minutes for better scores');
    }
    if (acceptanceRate < 70) {
      recommendations.push('Consider accepting more bookings to improve visibility');
    }
    if (scoreDoc.penalties >= 2) {
      recommendations.push('⚠️ Avoid missing deadlines - it significantly impacts your score');
    }
    if (scoreDoc.score >= 90) {
      recommendations.push('🌟 Excellent! Keep maintaining your high responsiveness');
    }

    return {
      score: scoreDoc.score,
      rank,
      badges: scoreDoc.badges,
      stats: {
        totalRequests: scoreDoc.totalRequests,
        acceptanceRate,
        avgResponseTime: scoreDoc.avgResponseTime,
        consecutiveMisses: scoreDoc.penalties
      },
      recommendations
    };
  }
}
