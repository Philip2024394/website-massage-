// Utility functions for Appwrite string-based data conversion

import type { Pricing, Analytics } from '../types';

// Pricing helpers
export const parsePricing = (pricingString: string): Pricing => {
  try {
    if (!pricingString || pricingString.trim() === '') {
      console.warn('⚠️ Empty or null pricing string, using default values');
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
export const parseMassageTypes = (massageTypesString: string): string[] => {
  try {
    return JSON.parse(massageTypesString);
  } catch {
    return [];
  }
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