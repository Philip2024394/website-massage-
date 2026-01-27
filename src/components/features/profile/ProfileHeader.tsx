import React from 'react';
import BurgerMenuIcon from '../../icons/BurgerMenuIcon';

interface ProfileHeaderProps {
    onHomeClick: () => void;
    language?: string;
    onLanguageChange?: (lang: string) => void;
    onMenuClick?: () => void;
}

/**
 * Reusable Profile Header component
 * Contains branding, language selector, and burger menu
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
    onHomeClick,
    language = 'id',
    onLanguageChange,
    onMenuClick
}) => {
    return (
        <header className="bg-white shadow-md sticky top-0 z-[9997] w-full max-w-full">
            <div className="w-full px-4 py-3 sm:py-4">
                <div className="flex justify-between items-center max-w-full">
                    {/* Brand on the left */}
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    
                    {/* Right side: Home button + Language selector + Burger menu */}
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                        {/* Home Button */}
                        <button 
                            onClick={onHomeClick}
                            title="Home" 
                            className="hover:bg-orange-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>

                        {/* Language Selector - Flag Icon */}
                        {onLanguageChange && (
                            <button 
                                onClick={() => {
                                    const currentLang = language || 'id';
                                    const newLanguage = currentLang === 'id' ? 'en' : 'id';
                                    console.log('🌐 Language Toggle:');
                                    console.log('  - Current:', currentLang);
                                    console.log('  - New:', newLanguage);
                                    onLanguageChange(newLanguage);
                                }} 
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0" 
                                title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                            >
                                <span className="text-xl sm:text-2xl">
                                    {language === 'id' ? '🇮🇩' : '🇬🇧'}
                                </span>
                            </button>
                        )}

                        {/* Burger Menu Icon */}
                        {onMenuClick && (
                            <button 
                                onClick={onMenuClick}
                                title="Menu" 
                                className="hover:bg-orange-50 rounded-full transition-colors text-orange-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                            >
                                <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
