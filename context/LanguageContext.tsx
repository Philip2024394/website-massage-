import React, { createContext, useContext } from 'react';

export interface LanguageContextValue {
  language: 'en' | 'id';
  setLanguage: (lang: 'en' | 'id') => void;
}

const defaultValue: LanguageContextValue = {
  language: 'id',
  setLanguage: () => {}
};

export const LanguageContext = createContext<LanguageContextValue>(defaultValue);

export const LanguageProvider: React.FC<React.PropsWithChildren<{ value: LanguageContextValue }>> = ({ value, children }) => {
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguageContext(): LanguageContextValue {
  return useContext(LanguageContext);
}
