/**
 * useTherapistCardModals - Modal state management for TherapistCard
 * Extracted from TherapistCard.tsx to reduce file size
 */

import { useState } from 'react';

export function useTherapistCardModals() {
    const [showBusyModal, setShowBusyModal] = useState(false);
    const [showReferModal, setShowReferModal] = useState(false);
    const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
    const [showBookingPopup, setShowBookingPopup] = useState(false);
    const [showScheduleBookingPopup, setShowScheduleBookingPopup] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [showPriceListModal, setShowPriceListModal] = useState(false);
    const [showJoinPopup, setShowJoinPopup] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    return {
        showBusyModal,
        setShowBusyModal,
        showReferModal,
        setShowReferModal,
        showLoginRequiredModal,
        setShowLoginRequiredModal,
        showBookingPopup,
        setShowBookingPopup,
        showScheduleBookingPopup,
        setShowScheduleBookingPopup,
        showReviewModal,
        setShowReviewModal,
        showSharePopup,
        setShowSharePopup,
        showPriceListModal,
        setShowPriceListModal,
        showJoinPopup,
        setShowJoinPopup,
        termsAccepted,
        setTermsAccepted
    };
}
