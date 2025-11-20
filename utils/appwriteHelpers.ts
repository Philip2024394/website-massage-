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
export const parseCoordinates = (input: any): { lat: number; lng: number } => {
  try {
    // String JSON like '{"lat":-8.6,"lng":115.2}'
    if (typeof input === 'string') {
      const parsed = JSON.parse(input);
      return parseCoordinates(parsed);
    }
    // Already an object with lat/lng
    if (input && typeof input === 'object') {
      // Appwrite GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }
      if (
        (input.type === 'Point' || input.$type === 'Point') &&
        Array.isArray(input.coordinates) &&
        input.coordinates.length === 2 &&
        typeof input.coordinates[0] === 'number' &&
        typeof input.coordinates[1] === 'number'
      ) {
        const [lng, lat] = input.coordinates;
        return { lat, lng };
      }
      // Object with {lat, lng}
      if (typeof input.lat === 'number' && typeof input.lng === 'number') {
        return { lat: input.lat, lng: input.lng };
      }
      // Some apis use {latitude, longitude}
      if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
        return { lat: input.latitude, lng: input.longitude };
      }
      // Array [lat, lng]
      if (
        Array.isArray(input) && input.length === 2 &&
        typeof input[0] === 'number' && typeof input[1] === 'number'
      ) {
        return { lat: input[0], lng: input[1] };
      }
    }
  } catch {}
  return { lat: 0, lng: 0 };
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