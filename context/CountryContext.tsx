import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from '../types/pageTypes';

export interface CountryContextValue {
  activeCountry: string; // ISO alpha-2 uppercase
  setActiveCountry: (code: string) => void;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

// Map country codes to preferred languages
const COUNTRY_TO_LANGUAGE: Record<string, Language> = {
  'ID': 'id', // Indonesia → Indonesian
  'CN': 'zh-CN', // China → Simplified Chinese
  'RU': 'ru', // Russia → Russian
  'JP': 'ja', // Japan → Japanese
  'KR': 'ko', // Korea → Korean
  'GB': 'en', // United Kingdom → English
  'US': 'en', // United States → English
  'AU': 'en', // Australia → English
  'CA': 'en', // Canada → English
  'SG': 'en', // Singapore → English
  'MY': 'en', // Malaysia → English
  'TH': 'en', // Thailand → English (add 'th' when available)
  'PH': 'en', // Philippines → English
  'IN': 'en', // India → English
};

function getLanguageForCountry(countryCode: string): Language {
  return COUNTRY_TO_LANGUAGE[countryCode.toUpperCase()] || 'en';
}

function readInitialCountry(): string {
  try {
    const raw = localStorage.getItem('app_user_location');
    if (raw) {
      const parsed = JSON.parse(raw);
      const cc = (parsed?.countryCode || '').toString().toUpperCase();
      if (cc.length === 2) return cc;
    }
  } catch {}
  return 'ID';
}

export const CountryProvider: React.FC<{ 
  children: ReactNode; 
  initialCountry?: string;
  onLanguageChange?: (language: Language) => void;
}> = ({ children, initialCountry, onLanguageChange }) => {
  const [activeCountry, setActiveCountry] = useState<string>(initialCountry ? initialCountry.toUpperCase() : readInitialCountry());

  useEffect(() => {
    try {
      const raw = localStorage.getItem('app_user_location');
      if (raw) {
        const parsed = JSON.parse(raw);
        const cc = (parsed?.countryCode || '').toString().toUpperCase();
        if (cc && cc !== activeCountry) {
          setActiveCountry(cc);
        }
      }
    } catch {}
  }, []);

  const handleSetCountry = (code: string) => {
    const cc = (code || '').toUpperCase();
    if (cc.length === 2 && cc !== activeCountry) {
      setActiveCountry(cc);
      // Persist minimal location object (keep previous lat/lng if present)
      try {
        const prevRaw = localStorage.getItem('app_user_location');
        let prev: any = {};
        if (prevRaw) prev = JSON.parse(prevRaw);
        const next = { ...prev, countryCode: cc, country: prev.country || cc };
        localStorage.setItem('app_user_location', JSON.stringify(next));
      } catch {}
      
      // Auto-switch language when country changes
      if (onLanguageChange) {
        const suggestedLanguage = getLanguageForCountry(cc);
        console.log(`🌍 Country changed to ${cc}, auto-switching language to ${suggestedLanguage}`);
        onLanguageChange(suggestedLanguage);
      }
    }
  };

  return (
    <CountryContext.Provider value={{ activeCountry, setActiveCountry: handleSetCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountryContext = (): CountryContextValue => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountryContext must be used within CountryProvider');
  return ctx;
};
