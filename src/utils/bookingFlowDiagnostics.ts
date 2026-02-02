/**
 * BOOKING FLOW DIAGNOSTICS
 * Real-time monitoring and error tracking for Order Now booking flow
 * 
 * This utility tracks every step of the booking process to identify
 * where failures occur (Appwrite connection, therapist ID, chat state, etc.)
 */

export interface BookingFlowCheckpoint {
  step: string;
  timestamp: number;
  status: 'started' | 'success' | 'failed';
  data?: any;
  error?: string;
}

export interface BookingFlowReport {
  sessionId: string;
  startTime: number;
  endTime?: number;
  checkpoints: BookingFlowCheckpoint[];
  failurePoint?: string;
  failureReason?: string;
  therapistId?: string;
  customerId?: string;
}

class BookingFlowMonitor {
  private currentSession: BookingFlowReport | null = null;
  private sessions: BookingFlowReport[] = [];

  /**
   * Start monitoring a new booking flow
   */
  startBookingFlow(therapistId?: string, customerId?: string): string {
    const sessionId = `booking_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    this.currentSession = {
      sessionId,
      startTime: Date.now(),
      checkpoints: [],
      therapistId,
      customerId
    };

    console.log('═══════════════════════════════════════════');
    console.log('🔍 [BOOKING MONITOR] Session started:', sessionId);
    console.log('═══════════════════════════════════════════');
    console.log('Therapist ID:', therapistId);
    console.log('Customer ID:', customerId);
    console.log('Start time:', new Date().toLocaleTimeString());
    
    this.checkpoint('initialization', 'started', { therapistId, customerId });
    
    return sessionId;
  }

  /**
   * Record a checkpoint in the booking flow
   */
  checkpoint(step: string, status: 'started' | 'success' | 'failed', data?: any, error?: string): void {
    if (!this.currentSession) {
      console.warn('⚠️ [BOOKING MONITOR] No active session for checkpoint:', step);
      return;
    }

    const checkpoint: BookingFlowCheckpoint = {
      step,
      timestamp: Date.now(),
      status,
      data,
      error
    };

    this.currentSession.checkpoints.push(checkpoint);

    const icon = status === 'success' ? '✅' : status === 'failed' ? '❌' : '🔄';
    console.log(`${icon} [CHECKPOINT] ${step.toUpperCase()}: ${status}`);
    
    if (data) {
      console.log('  Data:', data);
    }
    
    if (error) {
      console.error('  Error:', error);
      this.currentSession.failurePoint = step;
      this.currentSession.failureReason = error;
    }
  }

  /**
   * End the current booking flow session
   */
  endBookingFlow(success: boolean, reason?: string): void {
    if (!this.currentSession) {
      console.warn('⚠️ [BOOKING MONITOR] No active session to end');
      return;
    }

    this.currentSession.endTime = Date.now();
    const duration = this.currentSession.endTime - this.currentSession.startTime;

    console.log('═══════════════════════════════════════════');
    console.log(`${success ? '✅' : '❌'} [BOOKING MONITOR] Session ended: ${success ? 'SUCCESS' : 'FAILED'}`);
    console.log('═══════════════════════════════════════════');
    console.log('Session ID:', this.currentSession.sessionId);
    console.log('Duration:', `${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log('Total checkpoints:', this.currentSession.checkpoints.length);
    
    if (!success && reason) {
      console.error('Failure reason:', reason);
      console.error('Failure point:', this.currentSession.failurePoint);
    }
    
    // Log all checkpoints for analysis
    console.log('\n📋 CHECKPOINT TIMELINE:');
    this.currentSession.checkpoints.forEach((cp, index) => {
      const relativeTime = cp.timestamp - this.currentSession!.startTime;
      const icon = cp.status === 'success' ? '✅' : cp.status === 'failed' ? '❌' : '🔄';
      console.log(`${index + 1}. [+${relativeTime}ms] ${icon} ${cp.step} - ${cp.status}`);
    });

    // Save to sessions history
    this.sessions.push({ ...this.currentSession });
    
    // Keep only last 10 sessions
    if (this.sessions.length > 10) {
      this.sessions = this.sessions.slice(-10);
    }

    this.currentSession = null;
  }

  /**
   * Get diagnostic report for debugging
   */
  getDiagnosticReport(): string {
    if (!this.currentSession) {
      return 'No active booking session';
    }

    const report = [
      '═══════════════════════════════════════════',
      '🔍 BOOKING FLOW DIAGNOSTIC REPORT',
      '═══════════════════════════════════════════',
      `Session ID: ${this.currentSession.sessionId}`,
      `Therapist ID: ${this.currentSession.therapistId || 'NOT SET'}`,
      `Customer ID: ${this.currentSession.customerId || 'NOT SET'}`,
      `Duration: ${Date.now() - this.currentSession.startTime}ms`,
      '',
      'CHECKPOINTS:',
      ...this.currentSession.checkpoints.map((cp, i) => 
        `${i + 1}. [${cp.timestamp - this.currentSession!.startTime}ms] ${cp.step}: ${cp.status}` +
        (cp.error ? ` - ERROR: ${cp.error}` : '')
      ),
      '',
      this.currentSession.failurePoint ? 
        `❌ FAILED AT: ${this.currentSession.failurePoint}` : 
        '✅ NO FAILURES YET',
      this.currentSession.failureReason ? 
        `Reason: ${this.currentSession.failureReason}` : 
        '',
      '═══════════════════════════════════════════'
    ];

    return report.join('\n');
  }

  /**
   * Get recent booking sessions
   */
  getRecentSessions(): BookingFlowReport[] {
    return this.sessions;
  }

  /**
   * Analyze common failure points across sessions
   */
  analyzeFailurePatterns(): any {
    const failurePoints: Record<string, number> = {};
    const failureReasons: Record<string, number> = {};

    this.sessions.forEach(session => {
      if (session.failurePoint) {
        failurePoints[session.failurePoint] = (failurePoints[session.failurePoint] || 0) + 1;
      }
      if (session.failureReason) {
        failureReasons[session.failureReason] = (failureReasons[session.failureReason] || 0) + 1;
      }
    });

    return {
      totalSessions: this.sessions.length,
      failedSessions: this.sessions.filter(s => s.failurePoint).length,
      successSessions: this.sessions.filter(s => !s.failurePoint).length,
      commonFailurePoints: Object.entries(failurePoints).sort((a, b) => b[1] - a[1]),
      commonFailureReasons: Object.entries(failureReasons).sort((a, b) => b[1] - a[1])
    };
  }
}

// Export singleton instance
export const bookingFlowMonitor = new BookingFlowMonitor();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).bookingFlowMonitor = bookingFlowMonitor;
  console.log('🔍 Booking Flow Monitor initialized. Access via window.bookingFlowMonitor');
}
