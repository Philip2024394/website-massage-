import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import Button from '../components/Button';
import { useTranslations } from '../lib/useTranslations';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';
import { vscodeTranslateService } from '../lib/vscodeTranslateService';
import PageNumberBadge from '../components/PageNumberBadge';
import PWAInstallIOSModal from '../components/PWAInstallIOSModal';
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
    const [locationReady, setLocationReady] = useState(false);
    const { setLanguage: setGlobalLanguage } = useLanguage();
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [detectedCountryCode, setDetectedCountryCode] = useState<string | undefined>(undefined);
    const [detectedCountry, setDetectedCountry] = useState<string | undefined>(undefined);
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

    // Initialize default language from browser on first load
    useEffect(() => {
        try {
            const saved = localStorage.getItem('app_language') as Language | null;
            const browserLang = (navigator.language || 'en').toLowerCase();
            const auto = (saved || (browserLang.startsWith('id') ? 'id' : 'en')) as Language;
            setSelectedLanguage(auto);
            setGlobalLanguage(auto as 'en' | 'id');
            localStorage.setItem('app_language', auto);
        } catch {}
    }, [setGlobalLanguage]);

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

        // Choose language automatically if not set
        const lang: Language = (selectedLanguage || ((navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en')) as Language;
        
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
            setLocationReady(true);
            
            console.log('✅ Location detected:', userLocation);
            console.log('🚀 About to call onEnterApp with language:', selectedLanguage, 'and location:', userLocation);
            console.log('🚀 Current selectedLanguage state:', selectedLanguage);
            console.log('🚀 Current localStorage language:', localStorage.getItem('app_language'));
            setDetectedCountryCode(userLocation.countryCode);
            setDetectedCountry(userLocation.country);
            
            // Call the function immediately
            await onEnterApp(lang, userLocation);
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
                await onEnterApp(lang, defaultLocation);
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

    const handleSetDeviceLocation = async () => {
        if (isDetectingLocation) return;
        setIsDetectingLocation(true);
        try {
            const loc = await locationService.requestLocationWithFallback();
            console.log('✅ Device location set:', loc);
            setDetectedCountryCode(loc.countryCode);
            setDetectedCountry(loc.country);
            setLocationReady(true);

            // Determine language (use selected or browser-based default)
            const lang: Language = (selectedLanguage || ((navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en')) as Language;
            try {
                sessionStorage.setItem('show_language_prompt', '1');
                sessionStorage.setItem('suggested_language', lang);
            } catch {}
            // Immediately enter app and navigate to Home with detected location
            await onEnterApp(lang, loc);
        } catch (e) {
            console.warn('⚠️ Failed to set device location:', e);
            setLocationReady(false);
            // Fallback: enter app with default Jakarta location
            try {
                const fallback: UserLocation = { address: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 };
                const lang: Language = (selectedLanguage || ((navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en')) as Language;
                try {
                    sessionStorage.setItem('show_language_prompt', '1');
                    sessionStorage.setItem('suggested_language', lang);
                } catch {}
                await onEnterApp(lang, fallback);
            } catch (enterErr) {
                console.error('❌ Failed to enter app with fallback location:', enterErr);
            }
        } finally {
            setIsDetectingLocation(false);
        }
    };

    const countryCodeToFlag = (code?: string) => {
        if (!code || code.length !== 2) return '🌐';
        const cc = code.toUpperCase();
        const A = 0x1F1E6; // Regional Indicator Symbol Letter A
        return String.fromCodePoint(A + (cc.charCodeAt(0) - 65)) + String.fromCodePoint(A + (cc.charCodeAt(1) - 65));
    };

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
                    
                    {/* View Massage Therapists: sets location then navigates to Home */}
                    <Button
                        type="button"
                        onClick={handleSetDeviceLocation}
                        variant="primary"
                        disabled={isDetectingLocation}
                        className="!py-2.5 sm:!py-3 !text-sm sm:!text-base font-semibold w-[240px] sm:w-[260px] mx-auto"
                    >
                        <div className="flex items-center justify-center gap-2">
                            {isDetectingLocation ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('landing.detectingLocation') || 'Detecting location...'}
                                </>
                            ) : (
                                <>
                                    {'View Massage Therapists'}
                                </>
                            )}
                        </div>
                    </Button>

                    {/* Detected location indicator */}
                    {detectedCountryCode && (
                        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-white/90">
                            <span className="text-lg" aria-label={`Detected ${detectedCountry || 'country'}`}>{countryCodeToFlag(detectedCountryCode)}</span>
                            <span>{detectedCountry || detectedCountryCode}</span>
                        </div>
                    )}

                    {/* Removed separate Enter button per request */}
                </div>
                <PWAInstallIOSModal
                    visible={
                        showIOSInstructions && isIOS && !isInstalled &&
                        (() => { try { return !localStorage.getItem('ios_a2hs_dismissed'); } catch { return true; } })()
                    }
                    onClose={() => setShowIOSInstructions(false)}
                />
            </div>
        </div>
    );
};

export default LandingPage;
