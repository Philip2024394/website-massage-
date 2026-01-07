// Configuration and settings utilities for the main App component
import { translations } from '../translations';

export const validateSupabaseConfig = (config: any): boolean => {
  return !!(config?.url && config?.anonKey);
};

export const getCurrentTranslations = (language: 'en' | 'id' | 'gb') => {
  const normalized = language === 'gb' ? 'en' : language;
  return (translations as any)[normalized] || translations.en;
};

export const saveAppContactNumber = (contactNumber: string) => {
  try {
    localStorage.setItem('appContactNumber', contactNumber);
  } catch (_error) {
    console.error('Error saving contact number:', _error);
  }
};

export const getStoredAppContactNumber = (): string => {
  try {
    return localStorage.getItem('appContactNumber') || '6281392000050';
  } catch (_error) {
    console.error('Error getting contact number:', _error);
    return '6281392000050';
  }
};

export const saveGoogleMapsApiKey = (apiKey: string) => {
  try {
    localStorage.setItem('googleMapsApiKey', apiKey);
  } catch (_error) {
    console.error('Error saving Google Maps API key:', _error);
  }
};

export const getStoredGoogleMapsApiKey = (): string | null => {
  try {
    // Try the configured API key first
    const configuredKey = 'AIzaSyCQkZqabycPDi9F01BAmDYFL6toOGEStgI';
    if (configuredKey) return configuredKey;
    
    // Try environment variable
    const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (envKey) return envKey;
    
    // Fallback to localStorage
    return localStorage.getItem('googleMapsApiKey');
  } catch (_error) {
    console.error('Error getting Google Maps API key:', _error);
    return null;
  }
};

export const saveSupabaseConfig = (config: any) => {
  try {
    localStorage.setItem('supabaseConfig', JSON.stringify(config));
  } catch (_error) {
    console.error('Error saving Supabase config:', _error);
  }
};

export const getStoredSupabaseConfig = (): any => {
  try {
    const stored = localStorage.getItem('supabaseConfig');
    return stored ? JSON.parse(stored) : null;
  } catch (_error) {
    console.error('Error getting Supabase config:', _error);
    return null;
  }
};