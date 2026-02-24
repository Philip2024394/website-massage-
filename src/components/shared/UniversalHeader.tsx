import React from 'react';
import { MapPin } from 'lucide-react';
import BurgerMenuIcon from '../icons/BurgerMenuIcon';
import PageContainer from '../layout/PageContainer';
import { useCityContext } from "../../context/CityContext";
import { getCountryLanguage, getCountryFlag, type SupportedLanguage } from '../../context/LanguageContext';

interface UniversalHeaderProps {
    // Language props
    language?: string;
    onLanguageChange?: (lang: SupportedLanguage | string) => void;
    showLanguageSelector?: boolean;
    countryCode?: string; // Add country code to determine which languages to show
    
    // Menu props  
    onMenuClick?: () => void;
    showMenuButton?: boolean;
    
    // Navigation props
    onHomeClick?: () => void;
    showHomeButton?: boolean;
    
    // Location props
    showCityInfo?: boolean;
    
    // Branding props
    title?: string;
    showBrand?: boolean;
    
    // Styling props
    className?: string;
    containerClassName?: string;
    sticky?: boolean;
}

/**
 * Universal Header Component
 * 
 * Provides consistent header across all app pages with:
 * - IndaStreet branding
 * - Language selector (Indonesian 🇮🇩 / English 🇬🇧)  
 * - Burger menu
 * - Optional home button
 * - Responsive design
 * - Accessible interactions
 * 
 * Usage Examples:
 * 
 * // Basic header with all features
 * <UniversalHeader 
 *   language={language}
 *   onLanguageChange={setLanguage}
 *   onMenuClick={() => setMenuOpen(true)}
 * />
 * 
 * // Minimal header (just brand and menu)
 * <UniversalHeader 
 *   onMenuClick={() => setMenuOpen(true)}
 *   showLanguageSelector={false}
 * />
 * 
 * // Header with home button
 * <UniversalHeader 
 *   language={language}
 *   onLanguageChange={setLanguage}
 *   onMenuClick={() => setMenuOpen(true)}
 *   onHomeClick={() => navigate('home')}
 *   showHomeButton={true}
 * />
 */
export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
    // Language props
    language = 'en',
    onLanguageChange,
    showLanguageSelector = true,
    countryCode,
    
    // Menu props
    onMenuClick,
    showMenuButton = true,
    
    // Navigation props  
    onHomeClick,
    showHomeButton = false,
    
    // Location props
    showCityInfo = false,
    
    // Branding props
    title,
    showBrand = true,
    
    // Styling props
    className = '',
    containerClassName = '',
    sticky = true
}) => {
    // Get city info from context
    const { city: contextCity, countryCode: contextCountryCode, autoDetected, detectionMethod, setCity, setCountry, clearCountry } = useCityContext();
    
    // Use countryCode from props or context
    const activeCountryCode = countryCode || contextCountryCode || 'ID';

    const headerClasses = `
        bg-white shadow-md w-full max-w-full z-[9997]
        ${sticky ? 'fixed top-0 left-0 right-0' : ''}
        ${className}
    `.trim();

    const handleLanguageToggle = () => {
        if (!onLanguageChange) return;
        
        const currentLang = language || 'id';
        
        // Language rules: non-English locales get option to view in English (Indonesia ↔ EN, Vietnam ↔ EN, etc.)
        const englishOnlyCountries = ['US', 'GB', 'AU', 'SG'];
        if (englishOnlyCountries.includes(activeCountryCode)) {
            console.log('🌐 English-only country, no language toggle');
            return; // No toggle for English-only countries
        }
        
        // For all other countries (ID, VN, TH, MY, PH, DE): toggle between native and English
        const countryLanguage = getCountryLanguage(activeCountryCode);
        const newLanguage = currentLang === 'en' ? countryLanguage : 'en';
        
        console.log('🌐 UniversalHeader Language Toggle:');
        console.log('  - Country:', activeCountryCode);
        console.log('  - Current:', currentLang);
        console.log('  - Country Language:', countryLanguage);
        console.log('  - New:', newLanguage);
        
        onLanguageChange(newLanguage);
    };
    
    // Show English option for non-English locales (ID, VN, TH, MY, PH, DE)
    const showLanguageToggle = !['US', 'GB', 'AU', 'SG'].includes(activeCountryCode);
    
    // Determine which flags to show
    const showCountryFlag = language !== 'en';
    const flagToShow = showCountryFlag ? getCountryFlag(activeCountryCode) : '🇬🇧';
    const toggleTooltip = language === 'en' 
        ? `Switch to ${getCountryLanguage(activeCountryCode) === 'id' ? 'Indonesian' : 
            getCountryLanguage(activeCountryCode) === 'de' ? 'German' :
            getCountryLanguage(activeCountryCode) === 'ms' ? 'Malay' :
            getCountryLanguage(activeCountryCode) === 'th' ? 'Thai' :
            getCountryLanguage(activeCountryCode) === 'tl' ? 'Tagalog' :
            getCountryLanguage(activeCountryCode) === 'vi' ? 'Vietnamese' : 'Local language'}`
        : 'Switch to English';

    return (
        <header className={headerClasses}>
            <PageContainer className={`py-2 sm:py-3 max-w-full ${containerClassName}`}>
                <div className="flex justify-between items-center max-w-full">
                    
                    {/* Left side: Brand */}
                    {showBrand && (
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                                <span className="text-black">Inda</span>
                                <span className="text-amber-500">Street</span>
                            </h1>
                            
                            {/* City Display */}
                            {showCityInfo && contextCity && (
                                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                                    <MapPin className="w-3 h-3" />
                                    <span>{contextCity}, {activeCountryCode}</span>
                                </div>
                            )}
                            
                            {title && (
                                <span className="text-sm text-gray-500 ml-2 hidden sm:inline">
                                    {title}
                                </span>
                            )}
                        </div>
                    )}
                    
                    {/* Center: Title only (if no brand) */}
                    {!showBrand && title && (
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-1 text-center">
                            {title}
                        </h1>
                    )}
                    
                    {/* Right side: Action buttons */}
                    <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                        
                        {/* Home Button */}
                        {showHomeButton && onHomeClick && (
                            <button 
                                onClick={onHomeClick}
                                title="Home" 
                                className="hover:bg-amber-50 rounded-full transition-colors text-gray-600 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </button>
                        )}

                        {/* Language Selector - Facebook-style Flag Toggle */}
                        {/* Only show for bilingual countries (DE, ID) - hide for English-only countries */}
                        {showLanguageSelector && onLanguageChange && showLanguageToggle && (
                            <div className="flex items-center">
                                {/* Simple flag toggle version */}
                                <button 
                                    onClick={handleLanguageToggle}
                                    className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-amber-50 rounded-full transition-colors flex-shrink-0 border-0 outline-none" 
                                    style={{ border: 'none', textDecoration: 'none' }}
                                    title={toggleTooltip}
                                >
                                    <span className="text-xl sm:text-2xl leading-none" style={{ textDecoration: 'none', border: 'none' }}>
                                        {flagToShow}
                                    </span>
                                </button>
                                
                                {/* Alternative: Facebook-style pill toggle (uncomment to use) */}
                                {/* 
                                <div className="hidden lg:flex items-center gap-1 bg-gray-100 rounded-full p-1">
                                    <button
                                        onClick={() => onLanguageChange('id')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                            language === 'id' 
                                                ? 'bg-white shadow-sm text-gray-900 scale-105' 
                                                : 'text-gray-600 hover:bg-white/50'
                                        }`}
                                        title="Bahasa Indonesia"
                                    >
                                        <span className="text-sm">🇮🇩</span>
                                        <span className="hidden sm:inline">ID</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => onLanguageChange('en')}
                                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                            language === 'en' || language === 'gb'
                                                ? 'bg-white shadow-sm text-gray-900 scale-105' 
                                                : 'text-gray-600 hover:bg-white/50'
                                        }`}
                                        title="English"
                                    >
                                        <span className="text-sm">🇬🇧</span>
                                        <span className="hidden sm:inline">EN</span>
                                    </button>
                                </div>
                                */}
                            </div>
                        )}

                        {/* Burger Menu Button - Enhanced for Facebook/Amazon Standards */}
                        {showMenuButton && onMenuClick && (
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('🍔 UniversalHeader burger menu clicked!');
                                    onMenuClick();
                                }}
                                title="Open navigation menu" 
                                aria-label="Open navigation menu"
                                aria-expanded="false"
                                role="button"
                                type="button"
                                className="
                                    hover:bg-amber-50 active:bg-amber-100 rounded-full 
                                    transition-all duration-200 text-amber-500 flex-shrink-0 
                                    flex items-center justify-center touch-manipulation
                                    /* Mobile: 56px touch targets for optimal thumb interaction */
                                    min-w-[56px] min-h-[56px] w-14 h-14
                                    /* Tablet: 48px balanced for hybrid interaction */
                                    md:min-w-[48px] md:min-h-[48px] md:w-12 md:h-12
                                    /* Desktop: 44px optimized for mouse/trackpad */
                                    lg:min-w-[44px] lg:min-h-[44px] lg:w-11 lg:h-11
                                    /* Performance optimizations */
                                    will-change-transform contain-layout contain-style
                                "
                                style={{
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation'
                                } as React.CSSProperties}
                            >
                                <BurgerMenuIcon className="
                                    /* Responsive icon sizing */
                                    w-6 h-6 md:w-5 md:h-5 lg:w-6 lg:h-6
                                    transition-transform duration-200
                                    group-hover:scale-105 group-active:scale-95
                                " />
                            </button>
                        )}
                    </div>
                </div>
            </PageContainer>
        </header>
    );
};

export default UniversalHeader;