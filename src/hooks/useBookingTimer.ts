/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BOOKING TIMER MANAGER - Facebook/Amazon Standard
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * GUARANTEES:
 * - Zero stale closures (uses refs for latest state)
 * - Single timer authority (one active interval max)
 * - Idempotent start/stop (safe to call multiple times)
 * - Timer never mutates booking state (only dispatches events)
 * - Lifecycle-driven cancellation (auto-stops on inactive)
 * - Refresh-safe with persistence (uses absolute timestamps)
 * 
 * ARCHITECTURE:
 * - Timer reads state, never writes it
 * - Provider owns lifecycle transitions
 * - Timer signals expiration → Provider decides what happens
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { BookingLifecycleStatus } from '../types/booking';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

export type TimerPhase = 'THERAPIST_RESPONSE' | 'CUSTOMER_CONFIRMATION';

/**
 * Timer state for UI display
 */
export interface TimerState {
  isActive: boolean;
  phase: TimerPhase | null;
  remainingSeconds: number;
  startedAt: string | null;
  expiresAt: string | null;
  bookingId: string | null;
}

/**
 * Booking state snapshot (no closures - read from ref)
 */
export interface BookingStateSnapshot {
  bookingId: string | null;
  documentId: string | null;
  lifecycleStatus: BookingLifecycleStatus | null;
  isActive: boolean; // Derived: status in [PENDING, ACCEPTED]
}

/**
 * Persisted timer data (for refresh recovery)
 */
interface PersistedTimerState {
  bookingId: string;
  phase: TimerPhase;
  expiresAt: string; // ISO timestamp
  lifecycleStatus: BookingLifecycleStatus;
}

/**
 * Timer expiration event
 */
export interface TimerExpirationEvent {
  phase: TimerPhase;
  bookingId: string;
  documentId: string | null;
  lifecycleStatus: BookingLifecycleStatus;
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSISTENCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'booking_timer_state';

function persistTimerState(state: PersistedTimerState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('💾 [TimerManager] Persisted timer state:', state);
  } catch (error) {
    console.error('❌ [TimerManager] Failed to persist timer state:', error);
  }
}

function loadPersistedTimerState(): PersistedTimerState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw) as PersistedTimerState;
    console.log('📥 [TimerManager] Loaded persisted timer state:', parsed);
    return parsed;
  } catch (error) {
    console.error('❌ [TimerManager] Failed to load persisted timer state:', error);
    return null;
  }
}

function clearPersistedTimerState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🧹 [TimerManager] Cleared persisted timer state');
  } catch (error) {
    console.error('❌ [TimerManager] Failed to clear persisted timer state:', error);
  }
}

/**
 * Calculate remaining seconds from absolute expiration timestamp
 */
function calculateRemainingSeconds(expiresAt: string): number {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const remaining = Math.max(0, Math.ceil((expires - now) / 1000));
  return remaining;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

export function useBookingTimer() {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE & REFS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Timer interval authority (single source of truth)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Latest booking state (updated by Provider, read by timer - NO CLOSURE)
  const bookingStateRef = useRef<BookingStateSnapshot>({
    bookingId: null,
    documentId: null,
    lifecycleStatus: null,
    isActive: false
  });
  
  // Timer expiration callback (set by Provider)
  const onExpirationRef = useRef<((event: TimerExpirationEvent) => void) | null>(null);
  
  // Guard against double start on same booking+phase (refresh protection)
  const activeTimerKeyRef = useRef<string | null>(null);
  
  // Timer UI state
  const [timerState, setTimerState] = useState<TimerState>({
    isActive: false,
    phase: null,
    remainingSeconds: 0,
    startedAt: null,
    expiresAt: null,
    bookingId: null
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // INTERNAL: Interval Tick Logic
  // ─────────────────────────────────────────────────────────────────────────
  
  const handleTick = useCallback(() => {
    setTimerState(prev => {
      // ═══════════════════════════════════════════════════════════════════
      // GUARD 1: Read latest booking from ref (ZERO CLOSURE CAPTURE)
      // ═══════════════════════════════════════════════════════════════════
      const latestBooking = bookingStateRef.current;
      
      // ═══════════════════════════════════════════════════════════════════
      // GUARD 2: Timer belongs to different booking?
      // ═══════════════════════════════════════════════════════════════════
      if (latestBooking.bookingId !== prev.bookingId) {
        console.warn(`⚠️ [TimerManager] Booking ID mismatch - auto-stopping timer`);
        console.warn(`   Timer bookingId: ${prev.bookingId}`);
        console.warn(`   Latest bookingId: ${latestBooking.bookingId}`);
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        activeTimerKeyRef.current = null;
        clearPersistedTimerState();
        
        return { 
          isActive: false, 
          phase: null, 
          remainingSeconds: 0, 
          startedAt: null, 
          expiresAt: null, 
          bookingId: null 
        };
      }
      
      // ═══════════════════════════════════════════════════════════════════
      // GUARD 3: Booking no longer active?
      // ═══════════════════════════════════════════════════════════════════
      if (!latestBooking.isActive) {
        console.log(`⚠️ [TimerManager] Booking no longer active - auto-stopping timer`);
        console.log(`   Current lifecycle: ${latestBooking.lifecycleStatus}`);
        
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        activeTimerKeyRef.current = null;
        clearPersistedTimerState();
        
        return { 
          isActive: false, 
          phase: null, 
          remainingSeconds: 0, 
          startedAt: null, 
          expiresAt: null, 
          bookingId: null 
        };
      }
      
      // ═══════════════════════════════════════════════════════════════════
      // COUNTDOWN LOGIC (using absolute timestamp for accuracy)
      // ═══════════════════════════════════════════════════════════════════
      if (!prev.expiresAt) {
        console.error('❌ [TimerManager] No expiresAt timestamp - stopping timer');
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        activeTimerKeyRef.current = null;
        clearPersistedTimerState();
        return { ...prev, isActive: false, phase: null, remainingSeconds: 0 };
      }
      
      const remaining = calculateRemainingSeconds(prev.expiresAt);
      
      if (remaining <= 0) {
        console.log(`⏰ [TimerManager] Timer expired for ${prev.phase}`);
        console.log(`   Booking ID: ${prev.bookingId}`);
        console.log(`   Lifecycle: ${latestBooking.lifecycleStatus}`);
        
        // Stop timer
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        activeTimerKeyRef.current = null;
        clearPersistedTimerState();
        
        // ═══════════════════════════════════════════════════════════════
        // DISPATCH EXPIRATION EVENT (does NOT mutate booking)
        // Provider handles lifecycle transition
        // ═══════════════════════════════════════════════════════════════
        if (onExpirationRef.current && prev.phase) {
          const expirationEvent: TimerExpirationEvent = {
            phase: prev.phase,
            bookingId: latestBooking.bookingId!,
            documentId: latestBooking.documentId,
            lifecycleStatus: latestBooking.lifecycleStatus!
          };
          
          // Use microtask to avoid setState during render
          queueMicrotask(() => {
            onExpirationRef.current?.(expirationEvent);
          });
        } else {
          console.warn('⚠️ [TimerManager] No expiration handler registered');
        }
        
        return { 
          isActive: false, 
          phase: null, 
          remainingSeconds: 0, 
          startedAt: prev.startedAt, 
          expiresAt: prev.expiresAt, 
          bookingId: prev.bookingId 
        };
      }
      
      // Update remaining seconds
      return { ...prev, remainingSeconds: remaining };
    });
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API: Start Timer (Idempotent)
  // ─────────────────────────────────────────────────────────────────────────
  
  const startTimer = useCallback((
    phase: TimerPhase,
    bookingId: string
  ) => {
    console.log(`⏱️ [TimerManager] startTimer called: ${phase} for booking ${bookingId}`);
    
    // ═══════════════════════════════════════════════════════════════════════
    // GUARDRAIL #2: Prevent double start on refresh (idempotent by key)
    // ═══════════════════════════════════════════════════════════════════════
    const timerKey = `${bookingId}:${phase}`;
    if (activeTimerKeyRef.current === timerKey) {
      console.log(`⚠️ [TimerManager] Timer already active for ${timerKey} - ignoring duplicate start`);
      return;
    }
    
    // Stop existing timer first (idempotent)
    if (timerIntervalRef.current) {
      console.log('⏹️ [TimerManager] Stopping existing timer before starting new one');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Calculate duration and expiration timestamp
    const duration = phase === 'THERAPIST_RESPONSE' ? 300 : 60; // 5 min : 1 min
    const now = new Date();
    const expiresAt = new Date(now.getTime() + duration * 1000).toISOString();
    
    console.log(`⏱️ [TimerManager] Starting ${phase} timer:`);
    console.log(`   Duration: ${duration}s`);
    console.log(`   Expires at: ${expiresAt}`);
    console.log(`   Booking ID: ${bookingId}`);
    
    // Update active timer key
    activeTimerKeyRef.current = timerKey;
    
    // Set timer UI state
    setTimerState({
      isActive: true,
      phase,
      remainingSeconds: duration,
      startedAt: now.toISOString(),
      expiresAt,
      bookingId
    });
    
    // Persist timer state for refresh recovery
    const latestBooking = bookingStateRef.current;
    if (latestBooking.lifecycleStatus) {
      persistTimerState({
        bookingId,
        phase,
        expiresAt,
        lifecycleStatus: latestBooking.lifecycleStatus
      });
    }
    
    // Start interval (1 second ticks)
    timerIntervalRef.current = setInterval(handleTick, 1000);
    
    console.log(`✅ [TimerManager] Timer started successfully`);
  }, [handleTick]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API: Stop Timer (Idempotent with Reason Logging)
  // ─────────────────────────────────────────────────────────────────────────
  
  const stopTimer = useCallback((reason: string) => {
    console.log(`⏹️ [TimerManager] stopTimer called: ${reason}`);
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log(`✅ [TimerManager] Timer stopped: ${reason}`);
    } else {
      console.log(`⚠️ [TimerManager] No active timer to stop`);
    }
    
    activeTimerKeyRef.current = null;
    clearPersistedTimerState();
    
    setTimerState({
      isActive: false,
      phase: null,
      remainingSeconds: 0,
      startedAt: null,
      expiresAt: null,
      bookingId: null
    });
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API: Update Booking State Ref (Called by Provider)
  // ─────────────────────────────────────────────────────────────────────────
  
  const updateBookingStateRef = useCallback((snapshot: BookingStateSnapshot) => {
    const prevSnapshot = bookingStateRef.current;
    bookingStateRef.current = snapshot;
    
    // Log significant changes
    if (prevSnapshot.lifecycleStatus !== snapshot.lifecycleStatus) {
      console.log(`🔄 [TimerManager] Booking lifecycle changed: ${prevSnapshot.lifecycleStatus} → ${snapshot.lifecycleStatus}`);
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // Auto-stop timer if booking became inactive
    // ═══════════════════════════════════════════════════════════════════════
    if (!snapshot.isActive && timerState.isActive) {
      console.log(`⚠️ [TimerManager] Booking became inactive - auto-stopping timer`);
      stopTimer('BOOKING_BECAME_INACTIVE');
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // Update persisted state if timer is active (keep in sync)
    // ═══════════════════════════════════════════════════════════════════════
    if (timerState.isActive && timerState.phase && timerState.expiresAt && snapshot.lifecycleStatus) {
      persistTimerState({
        bookingId: snapshot.bookingId!,
        phase: timerState.phase,
        expiresAt: timerState.expiresAt,
        lifecycleStatus: snapshot.lifecycleStatus
      });
    }
  }, [timerState.isActive, timerState.phase, timerState.expiresAt, stopTimer]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API: Set Expiration Handler (Called by Provider)
  // ─────────────────────────────────────────────────────────────────────────
  
  const setExpirationHandler = useCallback((
    handler: (event: TimerExpirationEvent) => void
  ) => {
    onExpirationRef.current = handler;
    console.log('✅ [TimerManager] Expiration handler registered');
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC API: Resume Timer from Persistence (Refresh Recovery)
  // ─────────────────────────────────────────────────────────────────────────
  
  const resumeTimerIfNeeded = useCallback((currentBookingId: string | null) => {
    if (!currentBookingId) {
      console.log('ℹ️ [TimerManager] No booking to resume timer for');
      return;
    }
    
    const persisted = loadPersistedTimerState();
    if (!persisted) {
      console.log('ℹ️ [TimerManager] No persisted timer state found');
      return;
    }
    
    // Verify booking ID matches
    if (persisted.bookingId !== currentBookingId) {
      console.warn(`⚠️ [TimerManager] Persisted timer for different booking - clearing`);
      console.warn(`   Persisted: ${persisted.bookingId}`);
      console.warn(`   Current: ${currentBookingId}`);
      clearPersistedTimerState();
      return;
    }
    
    // Check if timer already expired
    const remaining = calculateRemainingSeconds(persisted.expiresAt);
    if (remaining <= 0) {
      console.log(`⏰ [TimerManager] Persisted timer already expired - triggering expiration`);
      clearPersistedTimerState();
      
      // Trigger expiration event
      if (onExpirationRef.current) {
        const latestBooking = bookingStateRef.current;
        const expirationEvent: TimerExpirationEvent = {
          phase: persisted.phase,
          bookingId: persisted.bookingId,
          documentId: latestBooking.documentId,
          lifecycleStatus: persisted.lifecycleStatus
        };
        
        queueMicrotask(() => {
          onExpirationRef.current?.(expirationEvent);
        });
      }
      return;
    }
    
    // Resume timer
    console.log(`♻️ [TimerManager] Resuming timer from persistence:`);
    console.log(`   Phase: ${persisted.phase}`);
    console.log(`   Remaining: ${remaining}s`);
    console.log(`   Expires at: ${persisted.expiresAt}`);
    
    // Set state to resume
    const now = new Date().toISOString();
    const timerKey = `${persisted.bookingId}:${persisted.phase}`;
    activeTimerKeyRef.current = timerKey;
    
    setTimerState({
      isActive: true,
      phase: persisted.phase,
      remainingSeconds: remaining,
      startedAt: now, // New start time (resumed)
      expiresAt: persisted.expiresAt,
      bookingId: persisted.bookingId
    });
    
    // Start interval
    timerIntervalRef.current = setInterval(handleTick, 1000);
    
    console.log(`✅ [TimerManager] Timer resumed successfully`);
  }, [handleTick]);
  
  // ─────────────────────────────────────────────────────────────────────────
  // LIFECYCLE: Cleanup on Unmount
  // ─────────────────────────────────────────────────────────────────────────
  
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        console.log('🧹 [TimerManager] Cleaned up timer on unmount');
      }
      // DO NOT clear persisted state on unmount (refresh recovery needs it)
    };
  }, []);
  
  // ─────────────────────────────────────────────────────────────────────────
  // RETURN PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────
  
  return {
    // State
    timerState,
    
    // Methods
    startTimer,
    stopTimer,
    updateBookingStateRef,
    setExpirationHandler,
    resumeTimerIfNeeded,
  };
}
