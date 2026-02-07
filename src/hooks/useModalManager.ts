/**
 * 🎛️ MODAL MANAGER SYSTEM
 * 
 * Centralized modal state management to ensure only one interactive window
 * is open at a time across the booking interface.
 * 
 * Features:
 * - Single source of truth for active modal
 * - Smooth transitions between modals
 * - Automatic closing of active modals before opening new ones
 * - Support for different modal types with priorities
 * - Animation-aware state management
 */

import { useState, useCallback, useRef } from 'react';

export type ModalType = 
  | 'price-list' 
  | 'schedule-booking' 
  | 'booking-popup' 
  | 'review' 
  | 'share' 
  | 'join' 
  | 'busy' 
  | 'refer' 
  | 'login-required'
  | 'safepass'
  | null;

export interface ModalManagerState {
  activeModal: ModalType;
  isTransitioning: boolean;
  previousModal: ModalType;
}

export interface ModalManagerActions {
  openModal: (type: ModalType, options?: { force?: boolean }) => Promise<void>;
  closeModal: (type?: ModalType) => Promise<void>;
  closeAllModals: () => Promise<void>;
  switchModal: (from: ModalType, to: ModalType) => Promise<void>;
  isModalActive: (type: ModalType) => boolean;
  canOpenModal: (type: ModalType) => boolean;
}

const TRANSITION_DELAY = 200; // Animation duration in milliseconds

// Modal priorities (higher number = higher priority)
const MODAL_PRIORITIES: Record<ModalType, number> = {
  'booking-popup': 100,     // Highest priority - main booking flow
  'schedule-booking': 90,   // High priority - scheduled booking
  'price-list': 80,         // High priority - price selection
  'login-required': 70,     // Authentication required
  'busy': 60,              // Status modals
  'review': 50,            // User actions
  'share': 40,             // Social features
  'join': 30,              // Therapist recruitment
  'refer': 20,             // Referral system
  'safepass': 10,          // Information modals
  null: 0
};

export function useModalManager(): ModalManagerState & ModalManagerActions {
  const [state, setState] = useState<ModalManagerState>({
    activeModal: null,
    isTransitioning: false,
    previousModal: null
  });

  const transitionTimeoutRef = useRef<NodeJS.Timeout>();

  const openModal = useCallback(async (type: ModalType, options: { force?: boolean } = {}) => {
    if (!type) return;

    const { force = false } = options;
    const currentPriority = MODAL_PRIORITIES[state.activeModal];
    const newPriority = MODAL_PRIORITIES[type];

    // Check if we can open this modal
    if (!force && state.activeModal && newPriority <= currentPriority) {
      console.log(`🚫 Modal ${type} blocked by higher priority modal ${state.activeModal}`);
      return;
    }

    // If there's already a modal open, close it first
    if (state.activeModal && state.activeModal !== type) {
      console.log(`🔄 Switching from ${state.activeModal} to ${type}`);
      
      // Start transition
      setState(prev => ({
        ...prev,
        isTransitioning: true,
        previousModal: prev.activeModal
      }));

      // Wait for close animation
      await new Promise(resolve => setTimeout(resolve, TRANSITION_DELAY));
      
      // Clear any existing timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    }

    // Open new modal
    setState(prev => ({
      activeModal: type,
      isTransitioning: false,
      previousModal: prev.activeModal
    }));

    console.log(`✅ Modal opened: ${type}`);
  }, [state.activeModal]);

  const closeModal = useCallback(async (type?: ModalType) => {
    // If type is specified, only close if it matches active modal
    if (type && state.activeModal !== type) {
      return;
    }

    if (!state.activeModal) return;

    console.log(`🚪 Closing modal: ${state.activeModal}`);

    // Start transition
    setState(prev => ({
      ...prev,
      isTransitioning: true
    }));

    // Wait for close animation
    await new Promise(resolve => setTimeout(resolve, TRANSITION_DELAY));

    // Complete close
    setState({
      activeModal: null,
      isTransitioning: false,
      previousModal: state.activeModal
    });
  }, [state.activeModal]);

  const closeAllModals = useCallback(async () => {
    if (!state.activeModal) return;

    console.log('🚪 Closing all modals');
    await closeModal();
  }, [closeModal, state.activeModal]);

  const switchModal = useCallback(async (from: ModalType, to: ModalType) => {
    if (state.activeModal !== from) {
      console.warn(`⚠️ Cannot switch: ${from} is not active (current: ${state.activeModal})`);
      return;
    }

    await openModal(to, { force: true });
  }, [state.activeModal, openModal]);

  const isModalActive = useCallback((type: ModalType) => {
    return state.activeModal === type;
  }, [state.activeModal]);

  const canOpenModal = useCallback((type: ModalType) => {
    if (!type) return false;
    if (!state.activeModal) return true;
    
    const currentPriority = MODAL_PRIORITIES[state.activeModal];
    const newPriority = MODAL_PRIORITIES[type];
    
    return newPriority > currentPriority;
  }, [state.activeModal]);

  return {
    ...state,
    openModal,
    closeModal,
    closeAllModals,
    switchModal,
    isModalActive,
    canOpenModal
  };
}

// Utility hooks for specific modal types
export function useBookingModalManager() {
  const modalManager = useModalManager();

  const openBookingModal = useCallback(async () => {
    // Close any existing sliders/modals before opening booking
    await modalManager.closeAllModals();
    await modalManager.openModal('booking-popup');
  }, [modalManager]);

  const openPriceListModal = useCallback(async () => {
    await modalManager.openModal('price-list');
  }, [modalManager]);

  const openScheduleModal = useCallback(async () => {
    // Close price list if open, then open schedule
    if (modalManager.isModalActive('price-list')) {
      await modalManager.switchModal('price-list', 'schedule-booking');
    } else {
      await modalManager.openModal('schedule-booking');
    }
  }, [modalManager]);

  return {
    ...modalManager,
    openBookingModal,
    openPriceListModal,
    openScheduleModal
  };
}