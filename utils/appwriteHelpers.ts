// Utility functions for Appwrite string-based data conversion

import type { Pricing, Analytics } from '../types';

// Pricing helpers
export const parsePricing = (pricingString: string): Pricing => {
  try {
    return JSON.parse(pricingString);
  } catch {
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
export const parseLanguages = (languagesString: string): string[] => {
  try {
    return JSON.parse(languagesString);
  } catch {
    return [];
  }
};

export const stringifyLanguages = (languages: string[]): string => {
  return JSON.stringify(languages);
};