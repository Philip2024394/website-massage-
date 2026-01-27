import { useState } from 'react';

export const useTherapistModals = () => {
  const [showBusyModal, setShowBusyModal] = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [showLoginRequiredModal, setShowLoginRequiredModal] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showPriceListModal, setShowPriceListModal] = useState(false);

  return {
    showBusyModal,
    setShowBusyModal,
    showReferModal,
    setShowReferModal,
    showLoginRequiredModal,
    setShowLoginRequiredModal,
    showBookingConfirmation,
    setShowBookingConfirmation,
    showBookingForm,
    setShowBookingForm,
    showReviewModal,
    setShowReviewModal,
    showSharePopup,
    setShowSharePopup,
    showPriceListModal,
    setShowPriceListModal,
  };
};
