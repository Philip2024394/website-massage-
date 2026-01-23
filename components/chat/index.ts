/**
 * Chat Components Index
 * Exports all chat-related UI components for the booking system
 */

// Core booking flow components
export { TherapistAcceptanceUI } from './TherapistAcceptanceUI';
export { OnTheWayStatusUI } from './OnTheWayStatusUI';
export { ArrivalConfirmationUI } from './ArrivalConfirmationUI';

// Status and progress components
export { BookingProgressStepper, type BookingProgressStep } from './BookingProgressStepper';
export { ConnectionStatusIndicator } from './ConnectionStatusIndicator';

// Enhanced UI components
export { EnhancedTimerComponent } from './EnhancedTimerComponent';
export { ErrorRecoveryUI, type ErrorType } from './ErrorRecoveryUI';
export { PaymentFlowUI, type PaymentMethod } from './PaymentFlowUI';

// Theme and notification components
export { 
  StatusThemeProvider, 
  useStatusTheme, 
  withStatusTheme, 
  StatusAwareContainer, 
  StatusIcon, 
  StatusText,
  statusThemes,
  getStatusColors
} from './StatusThemeProvider';

export { 
  RealTimeNotificationEnhancer,
  type NotificationPriority,
  type NotificationType,
  type DeliveryMethod
} from './RealTimeNotificationEnhancer';

// Export all theme configurations for external use
export { statusThemes };