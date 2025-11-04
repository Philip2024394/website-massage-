import React from 'react';
import { SimpleLanguageProvider, useSimpleLanguage } from './context/SimpleLanguageContext';
import SimpleLanguageSelector from './components/SimpleLanguageSelector';
import SimpleTestPage from './components/SimpleTestPage';
import { useTranslations } from './lib/useTranslations';

const AppContent: React.FC = () => {
    const { language, setLanguage } = useSimpleLanguage();
    const { t, loading } = useTranslations(language);

    console.log('🚀 SimpleApp: Current language:', language);
    console.log('🚀 SimpleApp: Translations loading:', loading);
    console.log('🚀 SimpleApp: Translations keys:', t ? Object.keys(t) : 'No translations');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading translations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Language Selector at the top */}
            <div className="fixed top-4 right-4 z-50">
                <SimpleLanguageSelector 
                    currentLanguage={language}
                    onLanguageChange={setLanguage}
                />
            </div>

            {/* Test Page */}
            <SimpleTestPage 
                language={language}
                translations={t}
            />
        </div>
    );
};

const SimpleApp: React.FC = () => {
    return (
        <SimpleLanguageProvider>
            <AppContent />
        </SimpleLanguageProvider>
    );
};

export default SimpleApp;