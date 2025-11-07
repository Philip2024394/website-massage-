import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../types/pageTypes';

interface SimpleLanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const SimpleLanguageContext = createContext<SimpleLanguageContextType | undefined>(undefined);

export const useSimpleLanguage = () => {
    const context = useContext(SimpleLanguageContext);
    if (!context) {
        throw new Error('useSimpleLanguage must be used within SimpleLanguageProvider');
    }
    return context;
};

interface SimpleLanguageProviderProps {
    children: ReactNode;
}

export const SimpleLanguageProvider: React.FC<SimpleLanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        // Check localStorage for consistency with app state
        try {
            const storedLanguage = localStorage.getItem('app_language');
            return (storedLanguage === 'id' || storedLanguage === 'en') ? storedLanguage as Language : 'en';
        } catch {
            return 'en'; // Default to English for consistency
        }
    });

    const handleSetLanguage = (lang: Language) => {
        console.log('🌍 SimpleLanguageContext: Setting language to:', lang);
        setLanguage(lang);
    };

    return (
        <SimpleLanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
            {children}
        </SimpleLanguageContext.Provider>
    );
};