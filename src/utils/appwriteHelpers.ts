// Utility functions for Appwrite string-based data conversion

import type { Pricing, Analytics } from '../types';

/** Known Appwrite/SDK error code that can cause crash if not handled (e.g. connection/serialization) */
export const APPWRITE_CRASH_ERROR_CODE = 536870904;

/**
 * Safely get a user-facing error message from an unknown error.
 * Never throws - use in catch blocks to avoid double-throw crashes.
 */
export function getSafeErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  try {
    if (err == null) return fallback;
    if (typeof (err as Error).message === 'string' && (err as Error).message.trim()) return (err as Error).message.trim();
    if (typeof err === 'string' && err.trim()) return err.trim();
    const code = (err as { code?: number | string })?.code;
    if (code === APPWRITE_CRASH_ERROR_CODE || code === '536870904') return 'Connection or service error. Please try again.';
    return fallback;
  } catch {
    return fallback;
  }
}

// Pricing helpers
export const parsePricing = (pricingInput: string | Record<string, number> | null | undefined): Pricing => {
  try {
    if (pricingInput == null) {
      return { "60": 0, "90": 0, "120": 0 };
    }
    if (typeof pricingInput === 'object' && !Array.isArray(pricingInput)) {
      return {
        "60": Number((pricingInput as Record<string, number>)["60"]) || 0,
        "90": Number((pricingInput as Record<string, number>)["90"]) || 0,
        "120": Number((pricingInput as Record<string, number>)["120"]) || 0,
      };
    }
    const pricingString = String(pricingInput ?? '');
    if (!pricingString || pricingString.trim() === '') {
      return { "60": 0, "90": 0, "120": 0 };
    }
    const result = JSON.parse(pricingString);
    return result;
  } catch (error) {
    console.warn('⚠️ parsePricing failed, using fallback:', error);
    return { "60": 0, "90": 0, "120": 0 };
  }
};

export const stringifyPricing = (pricing: Pricing): string => {
  return JSON.stringify(pricing);
};

// Analytics helpers
export const parseAnalytics = (analyticsString: string): Analytics => {
  try {
    return JSON.parse(analyticsString);
  } catch {
    return { 
      impressions: 0, 
      views: 0, 
      profileViews: 0,
      whatsapp_clicks: 0, 
      whatsappClicks: 0,
      phone_clicks: 0, 
      directions_clicks: 0, 
      bookings: 0 
    };
  }
};

export const stringifyAnalytics = (analytics: Analytics): string => {
  return JSON.stringify(analytics);
};

// Coordinates helpers
export const parseCoordinates = (coordinatesString: string): { lat: number; lng: number } => {
  try {
    return JSON.parse(coordinatesString);
  } catch {
    return { lat: 0, lng: 0 };
  }
};

export const stringifyCoordinates = (coordinates: { lat: number; lng: number }): string => {
  return JSON.stringify(coordinates);
};

// Massage types helpers
export const parseMassageTypes = (massageTypesString: string | string[] | any): string[] => {
  // Handle null, undefined, or empty values
  if (!massageTypesString) {
    return [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(massageTypesString)) {
    return massageTypesString;
  }
  
  // If it's a string, try to parse it
  if (typeof massageTypesString === 'string') {
    try {
      const parsed = JSON.parse(massageTypesString);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }
  
  return [];
};

export const stringifyMassageTypes = (massageTypes: string[]): string => {
  return JSON.stringify(massageTypes);
};

// Languages helpers
export const parseLanguages = (languagesString: string | string[] | null | undefined): string[] => {
  // Handle null, undefined, or empty values
  if (!languagesString) {
    console.log('🌐 parseLanguages: No input, returning empty array');
    return [];
  }
  
  // If it's already an array, return it
  if (Array.isArray(languagesString)) {
    console.log('🌐 parseLanguages: Input is already array:', languagesString);
    return languagesString;
  }
  
  // If it's a string, try to parse it
  if (typeof languagesString === 'string') {
    // Handle empty string
    if (languagesString.trim() === '') {
      console.log('🌐 parseLanguages: Empty string, returning empty array');
      return [];
    }
    
    try {
      const parsed = JSON.parse(languagesString);
      if (Array.isArray(parsed)) {
        console.log('🌐 parseLanguages: Successfully parsed JSON array:', parsed);
        return parsed;
      } else {
        console.warn('🌐 parseLanguages: Parsed JSON is not array:', parsed);
        return [];
      }
    } catch (error) {
      console.warn('🌐 parseLanguages: JSON parse failed, trying comma split:', error);
      // Fallback: try splitting by comma (in case it's comma-separated)
      const splitResult = languagesString.split(',').map(l => l.trim()).filter(l => l.length > 0);
      console.log('🌐 parseLanguages: Comma split result:', splitResult);
      return splitResult;
    }
  }
  
  console.warn('🌐 parseLanguages: Unexpected input type:', typeof languagesString, languagesString);
  return [];
};

export const stringifyLanguages = (languages: string[]): string => {
  return JSON.stringify(languages);
};