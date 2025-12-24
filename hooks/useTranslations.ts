/**
 * Translation Hook
 * Easy-to-use hook for accessing translations in any component
 * 
 * Usage:
 * const { t } = useTranslations();
 * <h1>{t('homepage.header.title')}</h1>
 */

import { useLanguageContext } from '../context/LanguageContext';
import { translationsService } from '../lib/appwrite/services/translation.service';
import { useState, useEffect } from 'react';

interface TranslationCache {
  [lang: string]: {
    [key: string]: string;
  };
}

// Global cache to avoid refetching
let globalCache: TranslationCache | null = null;
let cachePromise: Promise<TranslationCache> | null = null;

export function useTranslations() {
  const { language } = useLanguageContext();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTranslations() {
      try {
        // Use global cache if available
        if (globalCache) {
          const lang = language === 'gb' ? 'en' : language;
          setTranslations(globalCache[lang] || {});
          setLoading(false);
          return;
        }

        // If already fetching, wait for that promise
        if (cachePromise) {
          globalCache = await cachePromise;
          const lang = language === 'gb' ? 'en' : language;
          setTranslations(globalCache[lang] || {});
          setLoading(false);
          return;
        }

        // Fetch from Appwrite
        setLoading(true);
        cachePromise = translationsService.getAll();
        const allTranslations = await cachePromise;
        
        if (allTranslations) {
          globalCache = allTranslations;
          const lang = language === 'gb' ? 'en' : language;
          setTranslations(allTranslations[lang] || {});
          console.log(`✅ Loaded ${Object.keys(allTranslations[lang] || {}).length} translations for ${lang}`);
        } else {
          console.warn('⚠️  No translations found in Appwrite');
          setError('No translations available');
        }
      } catch (err) {
        console.error('❌ Failed to load translations:', err);
        setError('Failed to load translations');
      } finally {
        setLoading(false);
        cachePromise = null;
      }
    }

    loadTranslations();
  }, [language]);

  /**
   * Get translation by key
   * @param key - Translation key (e.g., 'homepage.header.title')
   * @param fallback - Fallback text if translation not found
   * @returns Translated text or fallback
   */
  const t = (key: string, fallback?: string): string => {
    const value = translations[key];
    
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    
    // If fallback provided, use it
    if (fallback) {
      return fallback;
    }
    
    // Extract last part of key as fallback (e.g., 'homepage.header.title' → 'title')
    const parts = key.split('.');
    return parts[parts.length - 1];
  };

  /**
   * Get multiple translations at once
   * @param keys - Array of translation keys
   * @returns Object with key-value pairs
   */
  const getMultiple = (keys: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = t(key);
    });
    return result;
  };

  /**
   * Check if a translation key exists
   * @param key - Translation key
   * @returns true if translation exists
   */
  const has = (key: string): boolean => {
    return translations[key] !== undefined;
  };

  /**
   * Get all translations for a section
   * @param section - Section name (e.g., 'homepage', 'booking')
   * @returns Object with all translations in that section
   */
  const getSection = (section: string): Record<string, string> => {
    const sectionPrefix = `${section}.`;
    const result: Record<string, string> = {};
    
    Object.entries(translations).forEach(([key, value]) => {
      if (key.startsWith(sectionPrefix)) {
        // Remove section prefix from key
        const shortKey = key.substring(sectionPrefix.length);
        result[shortKey] = value;
      }
    });
    
    return result;
  };

  return {
    t,
    getMultiple,
    has,
    getSection,
    loading,
    error,
    language: language === 'gb' ? 'en' : language,
    allTranslations: translations,
  };
}

/**
 * Alternative quick translation without hook
 * Use this in non-component contexts
 * 
 * @param language - Language code ('en', 'id')
 * @param key - Translation key
 * @param fallback - Fallback text
 */
export async function getTranslation(
  language: string,
  key: string,
  fallback?: string
): Promise<string> {
  try {
    if (!globalCache) {
      globalCache = await translationsService.getAll();
    }
    
    const translations = globalCache?.[language] || {};
    return translations[key] || fallback || key;
  } catch (error) {
    console.error('Failed to get translation:', error);
    return fallback || key;
  }
}

/**
 * Clear translation cache (useful for testing)
 */
export function clearTranslationCache() {
  globalCache = null;
  cachePromise = null;
  console.log('🗑️  Translation cache cleared');
}
