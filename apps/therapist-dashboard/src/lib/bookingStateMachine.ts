/**
 * 🔄 Booking State Machine
 * 
 * Enforces valid state transitions for booking workflow
 * Prevents invalid state changes and maintains audit trail
 * Facebook standards compliance: State machine pattern
 */

type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'rejected' | 'cancelled' | 'refunded';

interface StateTransition {
  from: BookingStatus;
  to: BookingStatus;
  timestamp: number;
  therapistId: string;
  reason?: string;
}

class BookingStateMachine {
  // Valid state transitions map
  private validTransitions: Record<BookingStatus, BookingStatus[]> = {
    'pending': ['confirmed', 'rejected', 'cancelled'],
    'confirmed': ['in-progress', 'cancelled'],
    'in-progress': ['completed', 'cancelled'],
    'completed': ['refunded'],
    'rejected': [], // Terminal state
    'cancelled': [], // Terminal state
    'refunded': [] // Terminal state
  };
  
  // Audit trail
  private transitionLog: StateTransition[] = [];
  
  /**
   * Check if a state transition is valid
   */
  canTransition(currentState: BookingStatus, newState: BookingStatus): boolean {
    const allowedTransitions = this.validTransitions[currentState];
    return allowedTransitions?.includes(newState) || false;
  }
  
  /**
   * Validate and execute a state transition
   */
  async transitionBooking(
    bookingId: string,
    currentState: BookingStatus,
    newState: BookingStatus,
    therapistId: string,
    reason?: string
  ): Promise<void> {
    // Validate transition
    if (!this.canTransition(currentState, newState)) {
      throw new Error(
        `Invalid booking state transition: ${currentState} → ${newState}. ` +
        `Allowed transitions from ${currentState}: ${this.validTransitions[currentState]?.join(', ') || 'none'}`
      );
    }
    
    // Log transition for audit
    const transition: StateTransition = {
      from: currentState,
      to: newState,
      timestamp: Date.now(),
      therapistId,
      reason
    };
    
    this.transitionLog.push(transition);
    
    console.log(`✅ Booking ${bookingId} state transition:`, transition);
    
    // Send to admin dashboard for monitoring
    this.sendTransitionToAdmin(bookingId, transition);
  }
  
  /**
   * Get valid next states for a given current state
   */
  getValidNextStates(currentState: BookingStatus): BookingStatus[] {
    return this.validTransitions[currentState] || [];
  }
  
  /**
   * Check if a state is terminal (no further transitions allowed)
   */
  isTerminalState(state: BookingStatus): boolean {
    return this.validTransitions[state]?.length === 0;
  }
  
  /**
   * Get transition history
   */
  getTransitionLog(): StateTransition[] {
    return [...this.transitionLog];
  }
  
  /**
   * Send transition to admin dashboard for audit trail
   */
  private async sendTransitionToAdmin(bookingId: string, transition: StateTransition) {
    try {
      // TODO: Integrate with admin analytics dashboard
      console.log('📊 Booking state transition logged:', {
        bookingId,
        transition
      });
    } catch (error) {
      console.error('Failed to log transition to admin:', error);
      // Don't throw - logging failure shouldn't block state transition
    }
  }
}

// Export singleton instance
export const bookingStateMachine = new BookingStateMachine();

// Export types
export type { BookingStatus, StateTransition };
