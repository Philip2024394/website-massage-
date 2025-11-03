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
    const [language, setLanguage] = useState<Language>('id'); // Default to Indonesian

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