import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { useTranslations } from '../lib/useTranslations';
import type { UserLocation } from '../types';
import type { Language } from '../types/pageTypes';

interface LandingPageProps {
    onLanguageSelect: (lang: Language) => void;
    onEnterApp: (language: Language, location: UserLocation) => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830';

// Language options with flags - Indonesian first, then English, then others
const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬�' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLanguageSelect }) => {
    console.log('🎨 LandingPage: Component rendering');
    console.log('onEnterApp prop received:', !!onEnterApp);
    
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('id'); // Default to Indonesian
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Get translations for the selected language
    const { t, loading: translationsLoading, refresh: refreshTranslations, hasLanguage } = useTranslations(selectedLanguage);

    // Debug logging
    useEffect(() => {
        console.log('🔍 LandingPage Debug:');
        console.log('  - Selected Language:', selectedLanguage);
        console.log('  - Has Language in Translations:', hasLanguage);
        console.log('  - Translation Loading:', translationsLoading);
        console.log('  - Translation function type:', typeof t);
        console.log('  - Testing landing translation:', t ? t('landing.welcome') : 'No translation function');
        console.log('  - Testing common translation:', t ? t('common.loading') : 'No translation function');
        if (t && typeof t === 'function') {
            console.log('  - ✅ Translation function is available');
        } else {
            console.log('  - ❌ No translation function found');
        }
        console.log('  - Fallback text will be used for missing translations');
    }, [selectedLanguage, hasLanguage, translationsLoading, t]);

    // Effect to refresh translations when language changes
    useEffect(() => {
        if (selectedLanguage) {
            console.log('🌐 Language changed to:', selectedLanguage, 'refreshing translations...');
            refreshTranslations();
        }
    }, [selectedLanguage]); // Remove refreshTranslations from dependencies

    useEffect(() => {
        console.log('🖼️ LandingPage: Attempting to load image:', imageSrc);
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            console.log('✅ LandingPage: Image loaded successfully');
            setImageLoaded(true);
        };
        img.onerror = (error) => {
            console.error(`❌ LandingPage: Failed to load image at: ${imageSrc}`, error);
            console.error('Image might be unavailable, blocked by CORS, or URL is incorrect.');
            setImageLoaded(true);
        };
    }, []);

    const handleEnterApp = () => {
        console.log('🔘 Enter button clicked!');
        console.log('Selected language:', selectedLanguage);
        // Create a default location - user will set it on home page
        const defaultLocation: UserLocation = {
            address: 'Not Set',
            lat: 0,
            lng: 0,
        };
        console.log('Calling onEnterApp with:', selectedLanguage, defaultLocation);
        onEnterApp(selectedLanguage, defaultLocation);
        console.log('✅ onEnterApp called');
    };

    const selectedLang = languages.find(lang => lang.code === selectedLanguage) || languages[0];

    return (
        <div className="fixed inset-0 w-full h-full flex overflow-hidden">
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    opacity: imageLoaded ? 1 : 0,
                }}
            />
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center bg-black bg-opacity-50 text-white px-4 text-center w-full h-full">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">Street</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-6">
                    {t('landing.welcomeDescription')}
                </p>
                
                <div className="w-full max-w-sm sm:max-w-md px-2 space-y-3 sm:space-y-4">
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3">{t('landing.getStarted')}</h2>
                    
                    {/* Language Dropdown */}
                    <div className="relative">
                        <label className="block text-xs sm:text-sm font-medium mb-2 text-left">{t('landing.selectLanguage')}</label>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-black text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-gray-900 transition-colors shadow-lg border border-gray-800"
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xl sm:text-2xl w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-900 rounded-full">
                                    {selectedLang.flag}
                                </span>
                                <span className="font-medium text-sm sm:text-base">{selectedLang.name}</span>
                            </div>
                            <svg
                                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <>
                                {/* Backdrop to close dropdown when clicking outside */}
                                <div 
                                    className="fixed inset-0 z-40" 
                                    onClick={() => {
                                        console.log('Dropdown backdrop clicked - closing dropdown');
                                        setIsDropdownOpen(false);
                                    }}
                                />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50">
                                    {languages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                console.log('Language selected:', lang.name);
                                                const newLanguage = lang.code as Language;
                                                setSelectedLanguage(newLanguage);
                                                
                                                // Also call the parent's language select handler
                                                if (onLanguageSelect) {
                                                    console.log('🌐 Calling onLanguageSelect with:', newLanguage);
                                                    onLanguageSelect(newLanguage);
                                                }
                                                
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-orange-50 transition-colors text-left"
                                        >
                                            <span className="text-xl sm:text-2xl w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 rounded-full">
                                                {lang.flag}
                                            </span>
                                            <span className="text-gray-800 font-medium text-sm sm:text-base">{lang.name}</span>
                                            {lang.code === selectedLanguage && (
                                                <svg className="w-5 h-5 ml-auto text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Enter App Button */}
                    <Button
                        type="button"
                        onClick={(e) => {
                            console.log('🔘 Enter button CLICKED event triggered!');
                            console.log('Event:', e);
                            console.log('Dropdown open?', isDropdownOpen);
                            if (isDropdownOpen) {
                                console.log('⚠️ Dropdown is still open! Closing it first...');
                                setIsDropdownOpen(false);
                            }
                            handleEnterApp();
                        }}
                        variant="primary"
                        className="!py-2.5 sm:!py-4 !text-base sm:!text-lg font-bold relative z-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            {t('landing.enter')}
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
