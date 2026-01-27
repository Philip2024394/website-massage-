/**
 * useAutoTranslation Hook
 * Fetches translations from Appwrite with auto-translation fallback
 */

import { useState, useEffect } from 'react';
import { autoTranslationService, type LanguageCode } from '../services/autoTranslationService';

interface UseAutoTranslationResult {
  t: (key: string, defaultText?: string) => string;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  loading: boolean;
  error: string | null;
}

export function useAutoTranslation(initialLanguage: LanguageCode = 'en'): UseAutoTranslationResult {
  const [language, setLanguage] = useState<LanguageCode>(initialLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all translations for the selected language
  useEffect(() => {
    loadTranslations();
  }, [language]);

  const loadTranslations = async () => {
    setLoading(true);
    setError(null);

    try {
      const allTranslations = await autoTranslationService.getAllTranslationsForLanguage(language);
      setTranslations(allTranslations);
    } catch (err) {
      console.error('Error loading translations:', err);
      setError('Failed to load translations');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get translation by key
   * If translation doesn't exist and defaultText is provided, auto-translate and save it
   */
  const t = (key: string, defaultText?: string): string => {
    // Return cached translation if it exists
    if (translations[key]) {
      return translations[key];
    }

    // If no default text provided, return the key itself
    if (!defaultText) {
      return key;
    }

    // Auto-translate in the background (non-blocking)
    autoTranslationService.getOrTranslate(key, defaultText)
      .then((translationEntry) => {
        // Update local cache with new translation
        setTranslations(prev => ({
          ...prev,
          [key]: translationEntry[language] || defaultText
        }));
      })
      .catch((err) => {
        console.error(`Auto-translation failed for key "${key}":`, err);
      });

    // Return default text immediately while translation is happening
    return defaultText;
  };

  return {
    t,
    language,
    setLanguage,
    loading,
    error
  };
}

export default useAutoTranslation;
