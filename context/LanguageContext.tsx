import React, { createContext, useContext } from 'react';

export type SupportedLanguage = 'en' | 'id' | 'ms' | 'th' | 'tl' | 'vi';

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

// Helper: Map country code to its native language
export const getCountryLanguage = (countryCode: string): SupportedLanguage => {
  const countryLanguageMap: Record<string, SupportedLanguage> = {
    'ID': 'id', // Indonesia → Indonesian
    'MY': 'ms', // Malaysia → Malay
    'SG': 'en', // Singapore → English
    'TH': 'th', // Thailand → Thai
    'PH': 'tl', // Philippines → Tagalog
    'VN': 'vi', // Vietnam → Vietnamese
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
  };
  return englishNames[lang];
};

