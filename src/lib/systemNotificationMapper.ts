/**
 * SYSTEM NOTIFICATION MAPPER
 * Maps booking statuses to standardized system banners and messages
 * 
 * CRITICAL: All text here is user-facing and must be exact as specified
 * DO NOT modify text without approval
 * 
 * VERSION 2.0 - Extended with Push Notification Support
 * - Added pushTitle, pushBody, pushPriority, targetRole to all statuses
 * - Integrates with Web Push API (service worker)
 * - Maintains backward compatibility (existing banner/chatMessage unchanged)
 */

export type BannerSeverity = 'info' | 'success' | 'warning' | 'error' | 'critical';
export type PushPriority = 'low' | 'normal' | 'high' | 'critical';
export type TargetRole = 'customer' | 'therapist' | 'both' | 'admin';

export interface SystemBanner {
  severity: BannerSeverity;
  icon: string;
  title: string;
  message: string;
  dismissible: boolean;
  persistent: boolean;
}

export interface SystemMessage {
  text: string;
  shouldSendToChat: boolean;
}

export interface PushNotificationConfig {
  pushTitle: string;
  pushBody: string;
  pushPriority: PushPriority;
  targetRole: TargetRole;
  shouldSendPush: boolean;
}

export interface SystemNotification {
  banner: SystemBanner | null;
  chatMessage: SystemMessage | null;
  pushNotification: PushNotificationConfig | null; // NEW: Push notification config
}

/**
 * Get system notification configuration for a booking status
 * Includes banner, chat message, AND push notification configs
 */
export const getSystemNotification = (status: string): SystemNotification => {
  const notifications: Record<string, SystemNotification> = {
    'waiting_for_location': {
      banner: {
        severity: 'warning',
        icon: '📍',
        title: 'Location verification required',
        message: 'Please share your live location within 5 minutes to continue this booking. This protects therapists from fake bookings.',
        dismissible: false,
        persistent: true
      },
      chatMessage: null,
      pushNotification: {
        pushTitle: '📍 Location Verification Required',
        pushBody: 'Share your live location within 5 minutes to continue booking',
        pushPriority: 'critical',
        targetRole: 'customer',
        shouldSendPush: true
      }
    },

    'location_shared': {
      banner: {
        severity: 'info',
        icon: '✅',
        title: 'Location verified',
        message: 'Waiting for therapist to accept your booking. Please keep chat open.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Location verified. Waiting for therapist to accept.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '📍 New Booking Request',
        pushBody: 'Customer location verified. Tap to view details.',
        pushPriority: 'high',
        targetRole: 'therapist',
        shouldSendPush: true
      }
    },

    'therapist_accepted': {
      banner: {
        severity: 'success',
        icon: '🧑‍⚕️',
        title: 'Therapist accepted your booking',
        message: 'They are preparing and may message you shortly.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Therapist has accepted the booking.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '✅ Booking Accepted',
        pushBody: 'Your therapist has accepted! They will contact you shortly.',
        pushPriority: 'high',
        targetRole: 'customer',
        shouldSendPush: true
      }
    },

    'on_the_way': {
      banner: {
        severity: 'success',
        icon: '🚗',
        title: 'Therapist is on the way',
        message: 'Please ensure access and be available.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Therapist is on the way to your location.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '🚗 Therapist On The Way',
        pushBody: 'Your therapist is heading to your location now.',
        pushPriority: 'normal',
        targetRole: 'customer',
        shouldSendPush: true
      }
    },

    'cancelled_no_location': {
      banner: {
        severity: 'error',
        icon: '❌',
        title: 'Booking cancelled',
        message: 'Live location was not shared within the required time.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Booking cancelled due to missing location verification.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '❌ Booking Cancelled',
        pushBody: 'Location verification timeout. Booking automatically cancelled.',
        pushPriority: 'critical',
        targetRole: 'both',
        shouldSendPush: true
      }
    },

    'rejected_location': {
      banner: {
        severity: 'error',
        icon: '❌',
        title: 'Booking rejected',
        message: 'Therapist reported the location as invalid or unsafe.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Therapist rejected the booking due to location issues.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '❌ Booking Rejected',
        pushBody: 'Therapist cannot service this location. Check chat for details.',
        pushPriority: 'critical',
        targetRole: 'customer',
        shouldSendPush: true
      }
    },

    'cancelled_by_user': {
      banner: {
        severity: 'info',
        icon: 'ℹ️',
        title: 'Booking cancelled by customer',
        message: '',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Customer cancelled the booking.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: 'ℹ️ Booking Cancelled',
        pushBody: 'Customer cancelled their booking request.',
        pushPriority: 'normal',
        targetRole: 'therapist',
        shouldSendPush: true
      }
    },

    'cancelled_by_admin': {
      banner: {
        severity: 'critical',
        icon: '⚠️',
        title: 'Booking cancelled by administrator',
        message: 'Cancelled for safety or policy reasons.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Admin cancelled this booking.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '⚠️ Admin Action Required',
        pushBody: 'Administrator cancelled this booking. Check chat for details.',
        pushPriority: 'critical',
        targetRole: 'both',
        shouldSendPush: true
      }
    },

    'completed': {
      banner: {
        severity: 'success',
        icon: '✅',
        title: 'Booking completed',
        message: 'Thank you for using our service!',
        dismissible: true,
        persistent: false
      },
      chatMessage: {
        text: 'Booking completed successfully.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '✅ Booking Completed',
        pushBody: 'Thank you! Rate your experience to help others.',
        pushPriority: 'low',
        targetRole: 'both',
        shouldSendPush: true
      }
    },

    'cancelled_location_denied': {
      banner: {
        severity: 'error',
        icon: '🚫',
        title: 'Booking cancelled',
        message: 'GPS permission was denied. Location sharing is required for security.',
        dismissible: false,
        persistent: true
      },
      chatMessage: {
        text: 'Booking cancelled: GPS permission denied.',
        shouldSendToChat: true
      },
      pushNotification: {
        pushTitle: '🚫 GPS Permission Required',
        pushBody: 'Booking cancelled. GPS access is required for all bookings.',
        pushPriority: 'critical',
        targetRole: 'customer',
        shouldSendPush: true
      }
    },

    // PENDING status (new booking created)
    'pending': {
      banner: {
        severity: 'info',
        icon: '⏳',
        title: 'Booking pending',
        message: 'Verifying booking details...',
        dismissible: false,
        persistent: true
      },
      chatMessage: null,
      pushNotification: {
        pushTitle: '⏳ New Booking Received',
        pushBody: 'Preparing to verify customer location...',
        pushPriority: 'normal',
        targetRole: 'therapist',
        shouldSendPush: false // Don't push on pending, wait for location_shared
      }
    }
  };

  return notifications[status] || { banner: null, chatMessage: null, pushNotification: null };
};

/**
 * Get banner CSS classes based on severity
 */
export const getBannerClasses = (severity: BannerSeverity): string => {
  const baseClasses = 'rounded-lg p-4 mb-4 border-l-4';
  
  const severityClasses: Record<BannerSeverity, string> = {
    info: 'bg-blue-50 border-blue-500 text-blue-900',
    success: 'bg-green-50 border-green-500 text-green-900',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-900',
    error: 'bg-red-50 border-red-500 text-red-900',
    critical: 'bg-red-100 border-red-600 text-red-950 font-semibold'
  };

  return `${baseClasses} ${severityClasses[severity]}`;
};

/**
 * Check if status requires immediate attention
 */
export const isUrgentStatus = (status: string): boolean => {
  const urgentStatuses = [
    'waiting_for_location',
    'cancelled_no_location',
    'rejected_location',
    'cancelled_by_admin'
  ];
  
  return urgentStatuses.includes(status);
};

/**
 * Get human-readable status label
 */
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': 'Pending',
    'waiting_for_location': 'Awaiting Location',
    'location_shared': 'Location Verified',
    'therapist_accepted': 'Accepted',
    'on_the_way': 'In Progress',
    'completed': 'Completed',
    'cancelled_no_location': 'Cancelled (No Location)',
    'cancelled_location_denied': 'Cancelled (GPS Denied)',
    'rejected_location': 'Rejected',
    'cancelled_by_user': 'Cancelled',
    'cancelled_by_admin': 'Cancelled (Admin)'
  };

  return labels[status] || status;
};

/**
 * Get push priority level for a status
 * Used by pushNotificationService to determine vibration pattern
 */
export const getPushPriority = (status: string): PushPriority => {
  const notification = getSystemNotification(status);
  return notification.pushNotification?.pushPriority || 'normal';
};

/**
 * Check if push notification should be sent for this status
 */
export const shouldSendPush = (status: string): boolean => {
  const notification = getSystemNotification(status);
  return notification.pushNotification?.shouldSendPush || false;
};

/**
 * Get target role for push notification
 */
export const getTargetRole = (status: string): TargetRole => {
  const notification = getSystemNotification(status);
  return notification.pushNotification?.targetRole || 'customer';
};
