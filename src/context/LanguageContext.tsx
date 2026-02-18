import React, { createContext, useContext } from 'react';

export type SupportedLanguage = 'en' | 'id' | 'ms' | 'th' | 'tl' | 'vi' | 'de';

export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  countryCode?: string; // Store the selected country
}

const defaultValue: LanguageContextValue = {
  language: 'en', // Default to English
  setLanguage: () => {}
};

export const LanguageContext = createContext<LanguageContextValue>(defaultValue);

export const LanguageProvider: React.FC<React.PropsWithChildren<{ value: LanguageContextValue }>> = ({ value, children }) => {
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguageContext(): LanguageContextValue {
  return useContext(LanguageContext);
}

// Helper: Map country code to its native language (landing country selection drives app/dashboard language)
export const getCountryLanguage = (countryCode: string): SupportedLanguage => {
  const countryLanguageMap: Record<string, SupportedLanguage> = {
    'ID': 'id',   // Indonesia → Indonesian (option for English in app)
    'MY': 'ms',   // Malaysia → Malay (option for English)
    'SG': 'en',   // Singapore → English
    'TH': 'th',   // Thailand → Thai (option for English)
    'PH': 'tl',   // Philippines → Tagalog (option for English)
    'VN': 'vi',   // Vietnam → Vietnamese (option for English)
    'GB': 'en',   // United Kingdom → English
    'US': 'en',   // United States → English
    'AU': 'en',   // Australia → English
    'DE': 'de',   // Germany → German (option for English)
  };
  return countryLanguageMap[countryCode] || 'en';
};

// Helper: Get country flag emoji
export const getCountryFlag = (countryCode: string): string => {
  const flagMap: Record<string, string> = {
    'ID': '🇮🇩',
    'MY': '🇲🇾',
    'SG': '🇸🇬',
    'TH': '🇹🇭',
    'PH': '🇵🇭',
    'VN': '🇻🇳',
    'GB': '🇬🇧',
    'US': '🇺🇸',
  };
  return flagMap[countryCode] || '🌐';
};

// Helper: Get language name
export const getLanguageName = (lang: SupportedLanguage, inNativeLanguage: boolean = false): string => {
  if (inNativeLanguage) {
    const nativeNames: Record<SupportedLanguage, string> = {
      'en': 'English',
      'id': 'Bahasa Indonesia',
      'ms': 'Bahasa Melayu',
      'th': 'ภาษาไทย',
      'tl': 'Tagalog',
      'vi': 'Tiếng Việt',
      'de': 'Deutsch',
    };
    return nativeNames[lang];
  }
  
  const englishNames: Record<SupportedLanguage, string> = {
    'en': 'English',
    'id': 'Indonesian',
    'ms': 'Malay',
    'th': 'Thai',
    'tl': 'Tagalog',
    'vi': 'Vietnamese',
    'de': 'German',
  };
  return englishNames[lang];
};

