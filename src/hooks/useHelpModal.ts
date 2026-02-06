/**
 * ============================================================================
 * 🆘 USE HELP MODAL HOOK
 * ============================================================================
 * 
 * Manage contextual help modal state and seen tracking
 * 
 * Features:
 * - Open/close help modals by key
 * - Track which helps have been seen
 * - Prevent spamming users with repeated auto-opens
 * - localStorage persistence
 * 
 * Usage:
 * ```tsx
 * const { openHelp, closeHelp, isHelpOpen, currentHelpKey } = useHelpModal();
 * 
 * <HelpIcon onClick={() => openHelp('onlineStatus')} />
 * 
 * <TherapistHelpModal
 *   isOpen={isHelpOpen}
 *   onClose={closeHelp}
 *   helpKey={currentHelpKey}
 *   content={dashboardHelp[currentHelpKey]}
 * />
 * ```
 * ============================================================================
 */

import { useState, useCallback } from 'react';

interface HelpSeenData {
  [helpKey: string]: {
    timestamp: number;
    count: number;
  };
}

export const useHelpModal = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [currentHelpKey, setCurrentHelpKey] = useState<string>('');

  /**
   * Open help modal by key
   */
  const openHelp = useCallback((helpKey: string) => {
    setCurrentHelpKey(helpKey);
    setIsHelpOpen(true);
  }, []);

  /**
   * Close help modal
   */
  const closeHelp = useCallback(() => {
    setIsHelpOpen(false);
    // Don't clear currentHelpKey immediately to prevent flash during animation
    setTimeout(() => setCurrentHelpKey(''), 300);
  }, []);

  /**
   * Check if a specific help has been seen
   */
  const hasSeenHelp = useCallback((helpKey: string): boolean => {
    try {
      const seenHelps: HelpSeenData = JSON.parse(
        localStorage.getItem('therapist_help_seen') || '{}'
      );
      return !!seenHelps[helpKey];
    } catch (error) {
      console.error('Error reading help seen data:', error);
      return false;
    }
  }, []);

  /**
   * Get how many times a help has been seen
   */
  const getHelpSeenCount = useCallback((helpKey: string): number => {
    try {
      const seenHelps: HelpSeenData = JSON.parse(
        localStorage.getItem('therapist_help_seen') || '{}'
      );
      return seenHelps[helpKey]?.count || 0;
    } catch (error) {
      console.error('Error reading help seen count:', error);
      return 0;
    }
  }, []);

  /**
   * Clear all help seen data (for testing)
   */
  const clearHelpSeen = useCallback(() => {
    localStorage.removeItem('therapist_help_seen');
  }, []);

  return {
    isHelpOpen,
    currentHelpKey,
    openHelp,
    closeHelp,
    hasSeenHelp,
    getHelpSeenCount,
    clearHelpSeen
  };
};

export default useHelpModal;
