import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/Button';
import { useTranslations } from '../lib/useTranslations';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';
import { vscodeTranslateService } from '../lib/vscodeTranslateService';
import PageNumberBadge from '../components/PageNumberBadge';
import { usePWAInstall } from '../hooks/usePWAInstall';
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
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLanguageSelect }) => {
    console.log('🎨 LandingPage: Component rendering');
    console.log('🎨 LandingPage: Props received:', { onEnterApp: !!onEnterApp, onLanguageSelect: !!onLanguageSelect });
    console.log('onEnterApp prop received:', !!onEnterApp);
    
    const [imageLoaded, setImageLoaded] = useState(false);
    // Require explicit user selection (no prefilled language)
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [mustSelectLanguage, setMustSelectLanguage] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { setLanguage: setGlobalLanguage } = useLanguage();
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    // PWA install hook
    const { requestInstall, isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();
    
    // Get translations for the selected language
    const { t, loading: translationsLoading, refresh: refreshTranslations, hasLanguage } = useTranslations(selectedLanguage ?? undefined);

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
    }, [selectedLanguage, refreshTranslations]);

    // Auto-detect location on component mount for mobile devices
    useEffect(() => {
        const autoDetectLocation = async () => {
            // Pre-load location for mobile devices with device optimization
            const deviceInfo = deviceService.getDeviceInfo();
            
            if (deviceInfo.type === 'mobile' && deviceInfo.supportsGPS) {
                console.log('📱 Mobile device detected with GPS, pre-loading location...');
                console.log('📊 Device details:', {
                    platform: deviceInfo.platform,
                    browser: deviceInfo.browser,
                    connectionType: deviceInfo.connectionType,
                    hasTouch: deviceInfo.hasTouch
                });
                
                try {
                    // Pre-load location silently in the background
                    await locationService.requestLocationWithFallback();
                    console.log('✅ Location pre-loaded successfully');
                } catch (error) {
                    console.warn('⚠️ Failed to pre-load location:', error);
                }
            }
        };
        
        // Delay slightly to ensure page is loaded
        const timer = setTimeout(autoDetectLocation, 1000);
        return () => clearTimeout(timer);
    }, []);

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

    const handleEnterApp = async () => {
        // Prevent multiple rapid clicks
        if (isDetectingLocation) {
            console.log('🚫 Enter button already processing - ignoring duplicate click');
            return;
        }
        
        console.log('🔘 Enter button clicked!');
        console.log('Selected language:', selectedLanguage);
        console.log('onEnterApp function available:', !!onEnterApp);
        
        // Ensure we have the required function
        if (!onEnterApp) {
            console.error('❌ onEnterApp function is not provided!');
            return;
        }

        // Enforce explicit language selection
        if (!selectedLanguage) {
            console.warn('❌ Cannot enter app: language not selected');
            setMustSelectLanguage(true);
            return;
        }
        
        // Get comprehensive device information
        const deviceInfo = deviceService.getDeviceInfo();
        const optimizations = deviceService.getOptimizations();
        
        console.log('🔧 Enhanced device detection:', {
            type: deviceInfo.type,
            platform: deviceInfo.platform,
            browser: deviceInfo.browser,
            screenSize: deviceInfo.screenSize,
            orientation: deviceInfo.orientation,
            hasTouch: deviceInfo.hasTouch,
            supportsGPS: deviceInfo.supportsGPS,
            isHighDPI: deviceInfo.isHighDPI,
            connectionType: deviceInfo.connectionType,
            locationAccuracy: optimizations.locationAccuracy,
            preloadStrategy: optimizations.preloadStrategy
        });
        
        setIsDetectingLocation(true);
        
        try {
            console.log('📍 Detecting user location automatically...');
            
            // Automatically get user's GPS location with device optimization
            const userLocation = await locationService.requestLocationWithFallback();
            
            console.log('✅ Location detected:', userLocation);
            console.log('🚀 About to call onEnterApp with language:', selectedLanguage, 'and location:', userLocation);
            console.log('🚀 Current selectedLanguage state:', selectedLanguage);
            console.log('🚀 Current localStorage language:', localStorage.getItem('app_language'));
            
            // Call the function immediately
            await onEnterApp(selectedLanguage, userLocation);
            console.log('✅ onEnterApp called successfully with language:', selectedLanguage);

            // Attempt PWA install prompt right after successful enter
            try {
                const installResult = await requestInstall();
                console.log('📦 PWA install attempt result:', installResult);
            } catch (installError) {
                console.warn('⚠️ PWA install attempt failed:', installError);
            }
            
        } catch (error) {
            console.error('❌ Failed to get location:', error);
            
            // Fallback to default location if everything fails
            const defaultLocation: UserLocation = {
                address: 'Jakarta, Indonesia',
                lat: -6.2088,
                lng: 106.8456
            };
            
            console.log('📍 Using fallback location:', defaultLocation);
            try {
                await onEnterApp(selectedLanguage, defaultLocation);
                console.log('✅ onEnterApp called successfully with fallback location');
                try {
                    const installResult = await requestInstall();
                    console.log('📦 PWA install attempt result (fallback location):', installResult);
                } catch (installError) {
                    console.warn('⚠️ PWA install attempt failed (fallback location):', installError);
                }
            } catch (enterError) {
                console.error('❌ Failed to call onEnterApp:', enterError);
            }
        } finally {
            // Ensure button is always re-enabled, even if there's an error
            setTimeout(() => {
                setIsDetectingLocation(false);
            }, 100);
        }
    };

    const selectedLang = selectedLanguage
        ? (languages.find(lang => lang.code === selectedLanguage) || languages[0])
        : null;

    return (
        <div className="relative min-h-screen w-full flex overflow-hidden">
            <PageNumberBadge pageNumber={1} pageName="LandingPage" />
            <div
                className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    opacity: imageLoaded ? 1 : 0,
                }}
            />
            {/* Extra gradient overlay for readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/60 pointer-events-none" />
            <div className="relative z-20 flex-grow flex flex-col items-center justify-center text-white px-4 text-center w-full min-h-screen">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-6">
                    Massage Hub
                </p>
                
                <div className="w-full max-w-sm sm:max-w-md px-2 space-y-3 sm:space-y-4">
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3">{t('landing.getStarted') || 'Get Started'}</h2>
                    
                    {/* Language Dropdown */}
                    <div className="relative">
                        <label className="block text-xs sm:text-sm font-medium mb-2 text-left">{t('landing.selectLanguage') || 'Select Language'}</label>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full bg-black text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between hover:bg-gray-900 transition-colors shadow-lg border border-gray-800"
                        >
                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xl sm:text-2xl w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-orange-600 text-white rounded-full">
                                    {selectedLang ? selectedLang.flag : '🟠'}
                                </span>
                                <span className="font-medium text-sm sm:text-base">
                                    {selectedLang ? selectedLang.name : (t('landing.selectLanguage') || 'Select Language')}
                                </span>
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
                                                console.log('🌐 Language selected in dropdown:', lang.name, '→', lang.code);
                                                console.log('🌐 Previous selectedLanguage was:', selectedLanguage);
                                                const newLanguage = lang.code as Language;
                                                setSelectedLanguage(newLanguage);
                                                setMustSelectLanguage(false);
                                                setGlobalLanguage(newLanguage as 'en' | 'id');
                                                
                                                // Save to localStorage for persistence
                                                try {
                                                    localStorage.setItem('app_language', newLanguage);
                                                    console.log('🌐 ✅ Saved to localStorage:', newLanguage);
                                                } catch (error) {
                                                    console.warn('❌ Failed to save language to localStorage:', error);
                                                }
                                                
                                                // Activate VS Code Google Translate for selected language
                                                vscodeTranslateService.activateOnLanguageChange(newLanguage as 'en' | 'id');
                                                
                                                // Also call the parent's language select handler
                                                if (onLanguageSelect) {
                                                    console.log('🌐 ✅ Calling parent onLanguageSelect with:', newLanguage);
                                                    onLanguageSelect(newLanguage);
                                                } else {
                                                    console.warn('🌐 ❌ No onLanguageSelect prop provided!');
                                                }
                                                
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-orange-50 transition-colors text-left"
                                        >
                                            <span className="text-xl sm:text-2xl w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-orange-50 rounded-full">
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
                        {/* Require selection message */}
                        {mustSelectLanguage && (
                            <p className="mt-2 text-xs text-orange-300 text-left">Please select your language to continue.</p>
                        )}
                    </div>

                    {/* Enter App Button */}
                    <Button
                        type="button"
                        onClick={(e) => {
                            console.log('🔘 Enter button CLICKED event triggered!');
                            console.log('Event:', e);
                            console.log('Dropdown open?', isDropdownOpen);
                            
                            // Prevent event bubbling to avoid conflicts
                            e.preventDefault();
                            e.stopPropagation();
                            
                            // Close dropdown if open but don't let it interfere with navigation
                            if (isDropdownOpen) {
                                console.log('⚠️ Dropdown is open, closing it...');
                                setIsDropdownOpen(false);
                            }
                            
                            // Always proceed with navigation regardless of dropdown state
                            console.log('🚀 Proceeding with handleEnterApp...');
                            handleEnterApp();
                        }}
                        variant="primary"
                        disabled={isDetectingLocation || !selectedLanguage}
                        className="!py-2.5 sm:!py-4 !text-base sm:!text-lg font-bold relative z-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            {isDetectingLocation ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('landing.detectingLocation') || 'Detecting location...'}
                                </>
                            ) : (
                                <>
                                    {t('landing.enter') || 'Enter'}
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </div>
                    </Button>
                </div>
                {/* iOS manual Add to Home Screen instructions (minimal inline - full modal planned) */}
                {showIOSInstructions && isIOS && !isInstalled && (
                    <div className="mt-6 max-w-sm mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-left text-sm">
                        <p className="font-semibold mb-2">Add to Home Screen (iOS)</p>
                        <ol className="list-decimal list-inside space-y-1 text-white/90">
                            <li>Tap the Share icon in Safari.</li>
                            <li>Select "Add to Home Screen".</li>
                            <li>Confirm name and tap Add.</li>
                        </ol>
                        <button
                            type="button"
                            onClick={() => setShowIOSInstructions(false)}
                            className="mt-3 text-xs px-3 py-1 rounded bg-black/40 hover:bg-black/60 transition"
                        >Dismiss</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandingPage;
