/**
 * useTherapistCardModals - Enhanced Modal state management for TherapistCard
 * 
 * Now integrates with the Modal Manager system to ensure only one interactive
 * window is open at a time, with smooth transitions and priority-based management.
 * 
 * Features:
 * - Centralized modal state through Modal Manager
 * - Automatic closure when "Book Now" is clicked
 * - Smooth transitions between modals
 * - Backwards compatibility with existing code
 */

import { useState, useCallback, useMemo } from 'react';
import { useBookingModalManager, type ModalType } from './useModalManager';

export function useTherapistCardModals() {
    // Use the enhanced modal manager
    const modalManager = useBookingModalManager();
    
    // Local state for non-managed modals
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Create backwards-compatible getters and setters
    const modalGetters = useMemo(() => ({
        showBusyModal: modalManager.isModalActive('busy'),
        showReferModal: modalManager.isModalActive('refer'),
        showLoginRequiredModal: modalManager.isModalActive('login-required'),
        showBookingPopup: modalManager.isModalActive('booking-popup'),
        showScheduleBookingPopup: modalManager.isModalActive('schedule-booking'),
        showReviewModal: modalManager.isModalActive('review'),
        showSharePopup: modalManager.isModalActive('share'),
        showPriceListModal: modalManager.isModalActive('price-list'),
        showJoinPopup: modalManager.isModalActive('join'),
    }), [modalManager]);

    // Enhanced setters that use modal manager
    const modalSetters = useMemo(() => ({
        setShowBusyModal: (show: boolean) => {
            if (show) modalManager.openModal('busy');
            else modalManager.closeModal('busy');
        },
        setShowReferModal: (show: boolean) => {
            if (show) modalManager.openModal('refer');
            else modalManager.closeModal('refer');
        },
        setShowLoginRequiredModal: (show: boolean) => {
            if (show) modalManager.openModal('login-required');
            else modalManager.closeModal('login-required');
        },
        setShowBookingPopup: (show: boolean) => {
            if (show) modalManager.openBookingModal(); // Uses enhanced booking modal opener
            else modalManager.closeModal('booking-popup');
        },
        setShowScheduleBookingPopup: (show: boolean) => {
            if (show) modalManager.openScheduleModal(); // Uses enhanced schedule modal opener
            else modalManager.closeModal('schedule-booking');
        },
        setShowReviewModal: (show: boolean) => {
            if (show) modalManager.openModal('review');
            else modalManager.closeModal('review');
        },
        setShowSharePopup: (show: boolean) => {
            if (show) modalManager.openModal('share');
            else modalManager.closeModal('share');
        },
        setShowPriceListModal: (show: boolean) => {
            // 🎯 GOLD STANDARD: Guard against state changes during transitions
            if (modalManager.isTransitioning) {
                console.warn('⚠️ Price modal state change blocked during transition');
                return;
            }
            if (show) modalManager.openPriceListModal();
            else modalManager.closeModal('price-list');
        },
        setShowJoinPopup: (show: boolean) => {
            if (show) modalManager.openModal('join');
            else modalManager.closeModal('join');
        }
    }), [modalManager]);

    // Enhanced Book Now handler that ensures proper modal management
    const handleBookNowClick = useCallback(async (options: {
        modalType?: ModalType;
        onAfterClose?: () => void;
    } = {}) => {
        console.log('🎯 Book Now clicked - managing modal states...');
        
        // Close any active sliders/modals with animation
        await modalManager.closeAllModals();
        
        // Small delay for smooth UX
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Execute post-close callback
        options.onAfterClose?.();
        
        // Open booking modal if specified
        if (options.modalType) {
            await modalManager.openModal(options.modalType);
        }
        
        console.log('✅ Book Now modal management complete');
    }, [modalManager]);

    return {
        // Backwards-compatible modal state
        ...modalGetters,
        ...modalSetters,
        termsAccepted,
        setTermsAccepted,
        
        // Enhanced functionality
        modalManager,
        handleBookNowClick,
        
        // Direct access to modal manager methods for advanced use
        closeAllModals: modalManager.closeAllModals,
        switchModal: modalManager.switchModal,
        canOpenModal: modalManager.canOpenModal,
        isTransitioning: modalManager.isTransitioning
    };
}
