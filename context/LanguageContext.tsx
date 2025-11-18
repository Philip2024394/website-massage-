import React, { createContext, useContext } from 'react';
import type { Language } from '../types/pageTypes';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const defaultValue: LanguageContextValue = {
  language: 'en',
  setLanguage: () => {}
};

export const LanguageContext = createContext<LanguageContextValue>(defaultValue);

export const LanguageProvider: React.FC<React.PropsWithChildren<{ value: LanguageContextValue }>> = ({ value, children }) => {
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguageContext(): LanguageContextValue {
  return useContext(LanguageContext);
}
