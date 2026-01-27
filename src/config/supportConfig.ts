/**
 * Support Contact Configuration
 * Centralized contact information for customer support
 */

export const SUPPORT_CONFIG = {
  // Primary support email
  email: 'indastreet.id@gmail.com',
  
  // WhatsApp support (format: country code + number)
  whatsapp: '+62 XXX-XXXX-XXXX', // Update with actual number when available
  
  // Support response time
  responseTime: '48-72 business hours',
  
  // Business hours (Indonesia time)
  businessHours: {
    weekdays: '9:00 AM - 6:00 PM WIB',
    weekends: '10:00 AM - 4:00 PM WIB',
  },
  
  // Address
  address: 'Jakarta, Indonesia',
  
  // Social media
  social: {
    website: 'https://indastreet.id',
    platform: 'https://indastreetmassage.com',
  },
  
  // Formatted contact strings for common use cases
  contactStrings: {
    email: 'indastreet.id@gmail.com',
    emailLink: 'mailto:indastreet.id@gmail.com',
    whatsappLink: 'https://wa.me/62XXXXXXXXXX', // Update with actual number
    fullContact: 'Email: indastreet.id@gmail.com | WhatsApp: +62 XXX-XXXX-XXXX',
  }
} as const;

/**
 * Helper function to get formatted support contact message
 */
export function getSupportContactMessage(includeWhatsApp: boolean = true): string {
  if (includeWhatsApp) {
    return `Contact support at ${SUPPORT_CONFIG.email} or via WhatsApp at ${SUPPORT_CONFIG.whatsapp}`;
  }
  return `Contact support at ${SUPPORT_CONFIG.email}`;
}

/**
 * Helper function to get full support details
 */
export function getFullSupportDetails(): string {
  return `Email: ${SUPPORT_CONFIG.email} | WhatsApp: ${SUPPORT_CONFIG.whatsapp} | Address: ${SUPPORT_CONFIG.address}`;
}
