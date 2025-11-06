import React, { useState } from 'react';
import type { Language } from '../types/pageTypes';
import { vscodeTranslateService } from '../lib/vscodeTranslateService';

interface SimpleLanguageSelectorProps {
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
}

const SimpleLanguageSelector: React.FC<SimpleLanguageSelectorProps> = ({ 
    currentLanguage, 
    onLanguageChange 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'id' as Language, name: 'Bahasa Indonesia', flag: '🇮🇩' },
        { code: 'en' as Language, name: 'English', flag: '🇺🇸' }
    ];

    const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

    const handleLanguageSelect = (lang: Language) => {
        console.log('🌐 SimpleLanguageSelector: Changing language to:', lang);
        
        // Activate VS Code Google Translate for selected language
        vscodeTranslateService.activateOnLanguageChange(lang as 'en' | 'id');
        
        onLanguageChange(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
                <span className="text-xl">{currentLang.flag}</span>
                <span className="font-medium text-gray-700">{currentLang.name}</span>
                <svg 
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageSelect(lang.code)}
                                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left first:rounded-t-lg last:rounded-b-lg ${
                                    lang.code === currentLanguage ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                            >
                                <span className="text-xl">{lang.flag}</span>
                                <span className="font-medium">{lang.name}</span>
                                {lang.code === currentLanguage && (
                                    <svg className="w-5 h-5 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SimpleLanguageSelector;