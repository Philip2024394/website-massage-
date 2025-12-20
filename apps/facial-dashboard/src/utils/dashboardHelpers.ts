/**
 * Dashboard Helper Functions
 * Utility functions for validation, formatting, and data processing
 * Max size: 10KB (Facebook/Amazon standard)
 */

/**
 * Validate required fields for place profile
 */
export const validatePlaceProfile = (data: {
  name: string;
  description: string;
  mainImage: string;
  profilePicture: string;
  contactNumber: string;
  ownerWhatsApp: string;
  location: string;
  pricing: { '60': number; '90': number; '120': number };
  selectedCity: string;
}): { isValid: boolean; missingFields: string[] } => {
  const missingFields: string[] = [];

  if (!data.name || data.name.trim() === '') {
    missingFields.push('Spa Name');
  }

  if (!data.description || data.description.trim() === '') {
    missingFields.push('Description');
  }

  if (!data.mainImage) {
    missingFields.push('Main Banner Image');
  }

  if (!data.profilePicture) {
    missingFields.push('Profile Picture (Logo)');
  }

  if (!data.contactNumber || data.contactNumber.trim() === '') {
    missingFields.push('Contact Number');
  }

  if (!data.ownerWhatsApp || data.ownerWhatsApp.trim() === '') {
    missingFields.push('Owner WhatsApp');
  }

  if (!data.location || data.location.trim() === '') {
    missingFields.push('Location');
  }

  if (data.pricing['60'] === 0 && data.pricing['90'] === 0 && data.pricing['120'] === 0) {
    missingFields.push('At least one pricing option');
  }

  if (!data.selectedCity || data.selectedCity === 'all') {
    missingFields.push('City/Location');
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Format gallery images for Appwrite storage
 */
export const formatGalleryForStorage = (galleryImages: Array<{
  imageUrl: string;
  caption: string;
  description: string;
}>): string => {
  // Filter out empty images and format as JSON string
  const validImages = galleryImages.filter(img => img.imageUrl && img.imageUrl.trim() !== '');
  return JSON.stringify(validImages);
};

/**
 * Parse gallery images from Appwrite response
 */
export const parseGalleryFromStorage = (galleryData: any): Array<{
  imageUrl: string;
  caption: string;
  description: string;
}> => {
  try {
    let parsedGallery: any[] = [];
    
    if (typeof galleryData === 'string') {
      parsedGallery = JSON.parse(galleryData);
    } else if (Array.isArray(galleryData)) {
      parsedGallery = galleryData;
    }

    const loadedGallery = parsedGallery.map((item: any) => ({
      imageUrl: item.imageUrl || '',
      caption: item.caption || '',
      description: item.description || '',
    }));

    // Ensure we always have 6 slots
    while (loadedGallery.length < 6) {
      loadedGallery.push({ imageUrl: '', caption: '', description: '' });
    }

    return loadedGallery.slice(0, 6);
  } catch (e) {
    console.error('Error parsing gallery images:', e);
    return Array(6).fill({ imageUrl: '', caption: '', description: '' });
  }
};

/**
 * Format phone number for WhatsApp link
 */
export const formatWhatsAppNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If starts with 0, replace with country code (62 for Indonesia)
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // If doesn't start with country code, add it
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};

/**
 * Calculate discount end time
 */
export const calculateDiscountEndTime = (durationHours: number): string => {
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + durationHours);
  return endTime.toISOString();
};

/**
 * Check if discount is still active
 */
export const isDiscountActive = (discountEndTime: string): boolean => {
  if (!discountEndTime) return false;
  return new Date(discountEndTime) > new Date();
};

/**
 * Format price for display in various formats
 */
export const formatPriceDisplay = (price: number, format: 'short' | 'full' | 'k' = 'full'): string => {
  if (price === 0) return 'Free';
  
  switch (format) {
    case 'short':
      return `Rp ${Math.floor(price / 1000)}k`;
    case 'k':
      return `${Math.floor(price / 1000)}k`;
    case 'full':
    default:
      return `Rp ${price.toLocaleString('id-ID')}`;
  }
};

/**
 * Sanitize coordinates for storage
 */
export const sanitizeCoordinates = (coords: { lat: number; lng: number }): string => {
  return JSON.stringify({
    lat: Number(coords.lat) || 0,
    lng: Number(coords.lng) || 0,
  });
};

/**
 * Parse coordinates from storage
 */
export const parseCoordinates = (coordsData: any): { lat: number; lng: number } => {
  try {
    if (typeof coordsData === 'string') {
      return JSON.parse(coordsData);
    }
    return coordsData || { lat: 0, lng: 0 };
  } catch (e) {
    console.error('Error parsing coordinates:', e);
    return { lat: 0, lng: 0 };
  }
};

/**
 * Generate slug from name
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Check if time is valid business hours format
 */
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(time);
};
