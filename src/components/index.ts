/**
 * 🎯 COMPONENT EXPORTS
 * 
 * Centralized exports for commonly used components
 */

// Core Components
export { default as Button } from './Button';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ErrorBoundary } from './ErrorBoundary';

// Countdown Components
export { default as Countdown } from './Countdown';
export { BookingCountdown } from './BookingCountdown';
export {
  TherapistArrivalCountdown,
  SessionTimer,
  PaymentTimer,
  BookingProgressTimer,
  SimpleUsageExamples
} from './CountdownExamples';

// Booking Components
export { default as BookingPopup } from './BookingPopup';
export { default as ScheduleBookingPopup } from './ScheduleBookingPopup';
export { default as BookingMenuSlider } from './BookingMenuSlider';

// Chat Components
export { default as PersistentChatWindow } from './PersistentChatWindow';
export { ModernChatWindow } from './ModernChatWindow';

// Card Components
export { default as TherapistCard } from './TherapistCard';
export { default as TherapistHomeCard } from './TherapistHomeCard';
export { default as MassagePlaceCard } from './MassagePlaceCard';

// Modal Components
export { ReviewModal } from './ReviewModal';
export { default as SocialSharePopup } from './SocialSharePopup';
export { default as AnonymousReviewModal } from './AnonymousReviewModal';

// UI Components
export { default as ToggleSwitch } from './ToggleSwitch';
export { default as CustomCheckbox } from './CustomCheckbox';
export { default as PasswordInput } from './PasswordInput';

// Layout Components
// export { default as Header } from './Header'; // TODO: Header.tsx is empty
export { default as Footer } from './Footer';
export { default as TopNav } from './TopNav';

// PWA Components
export { default as PWAInstallBanner } from './PWAInstallBanner';
export { default as UniversalPWAInstall } from './UniversalPWAInstall';

// Location Components
export { default as LocationSelector } from './LocationSelector';
export { default as CitySwitcher } from './CitySwitcher';