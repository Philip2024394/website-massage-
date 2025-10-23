// Configuration and settings utilities for the main App component
import { translations } from '../translations';

export const validateSupabaseConfig = (config: any): boolean => {
  return !!(config?.url && config?.anonKey);
};

export const getCurrentTranslations = (language: 'en' | 'id') => {
  return translations[language] || translations.en;
};

export const saveAppContactNumber = (contactNumber: string) => {
  try {
    localStorage.setItem('appContactNumber', contactNumber);
  } catch (error) {
    console.error('Error saving contact number:', error);
  }
};

export const getStoredAppContactNumber = (): string => {
  try {
    return localStorage.getItem('appContactNumber') || '6281392000050';
  } catch (error) {
    console.error('Error getting contact number:', error);
    return '6281392000050';
  }
};

export const saveGoogleMapsApiKey = (apiKey: string) => {
  try {
    localStorage.setItem('googleMapsApiKey', apiKey);
  } catch (error) {
    console.error('Error saving Google Maps API key:', error);
  }
};

export const getStoredGoogleMapsApiKey = (): string | null => {
  try {
    return localStorage.getItem('googleMapsApiKey');
  } catch (error) {
    console.error('Error getting Google Maps API key:', error);
    return null;
  }
};

export const saveSupabaseConfig = (config: any) => {
  try {
    localStorage.setItem('supabaseConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving Supabase config:', error);
  }
};

export const getStoredSupabaseConfig = (): any => {
  try {
    const stored = localStorage.getItem('supabaseConfig');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting Supabase config:', error);
    return null;
  }
};