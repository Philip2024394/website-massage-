/**
 * Chat utility functions extracted from PersistentChatWindow
 * Following Facebook/Amazon 10-15KB component standards
 */

// Duration options with prices
export const DURATION_OPTIONS = [
  { minutes: 60, label: '1 Hour' },
  { minutes: 90, label: '1.5 Hours' },
  { minutes: 120, label: '2 Hours' },
];

// Format price to IDR
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};

// Format time
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

// Get message timestamp
export const getMessageTimestamp = (timestamp: string): string => {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - messageDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(timestamp);
};

// Validate message content
export const isValidMessage = (message: string): boolean => {
  return message.trim().length > 0 && message.trim().length <= 1000;
};

// Get step display name
export const getStepDisplayName = (step: string): string => {
  const stepNames: Record<string, string> = {
    'therapist-selection': 'Select Therapist',
    'duration-selection': 'Choose Duration', 
    'datetime-selection': 'Pick Date & Time',
    'location-details': 'Location Details',
    'contact-details': 'Contact Information',
    'confirmation': 'Confirmation',
    'payment': 'Payment'
  };
  
  return stepNames[step] || step;
};