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

// PERMANENT FIX: Bright orange gradient that's ALWAYS visible (never black!)
const PLACEHOLDER_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlYTU4MGM7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNjMjQxMGM7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwMCIgaGVpZ2h0PSIxMDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';

// Primary remote image and fallback URLs
const IMAGE_SOURCES = [
    'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830',
    'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png',
    'https://ik.imagekit.io/7grri5v7d/tr:w-1920/indastreet%20massage.png'
];

// Language options with flags - Indonesian first, then English, then others
const languages = [
    { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLanguageSelect }) => {
    const DEBUG_LANDING = false; // Disabled - works reliably now
    
    // Check if user already entered - if so, show loading state (prevents bounce back)
    const [hasEntered, setHasEntered] = useState(() => {
        try {
            return sessionStorage.getItem('has_entered_app') === '1';
        } catch {
            return false;
        }
    });
    
    if (DEBUG_LANDING) {
        console.log('🎨 LandingPage: Component rendering');
        console.log('🎨 LandingPage: Props received:', { onEnterApp: !!onEnterApp, onLanguageSelect: !!onLanguageSelect });
        console.log('🎨 LandingPage: onEnterApp type:', typeof onEnterApp);
        console.log('🎨 LandingPage: Current timestamp:', new Date().toISOString());
        console.log('🎨 LandingPage: Has already entered:', hasEntered);
    }
    
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    // Start with actual image URL to prevent orange flash
    const [activeImage, setActiveImage] = useState<string | null>(IMAGE_SOURCES[0]);
    const [bgStyle, setBgStyle] = useState<React.CSSProperties>({
        backgroundImage: `url("${IMAGE_SOURCES[0]}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    });
    // Stabilize initial text render: start visible to avoid flashing
    const [contentVisible, setContentVisible] = useState(true);
    // Require explicit user selection (no prefilled language)
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [locationReady, setLocationReady] = useState(false);
    const { setLanguage: setGlobalLanguage } = useLanguage();
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [detectedCountryCode, setDetectedCountryCode] = useState<string | undefined>(undefined);
    const [detectedCountry, setDetectedCountry] = useState<string | undefined>(undefined);
    // Track auto-enter fallback attempts
    const [autoEnterAttempted, setAutoEnterAttempted] = useState(false);
    // PWA install hook
    const { requestInstall, isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();
    
    // Get translations for the selected language
    const { t, loading: translationsLoading, refresh: refreshTranslations, hasLanguage } = useTranslations(selectedLanguage ?? undefined);

    // Debug logging
    useEffect(() => {
        if (DEBUG_LANDING) {
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
        }
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
                if (DEBUG_LANDING) {
                    console.log('📱 Mobile device detected with GPS, pre-loading location...');
                    console.log('📊 Device details:', {
                        platform: deviceInfo.platform,
                        browser: deviceInfo.browser,
                        connectionType: deviceInfo.connectionType,
                        hasTouch: deviceInfo.hasTouch
                    });
                }
                
                try {
                    // Pre-load location silently in the background
                    await locationService.requestLocationWithFallback();
                    if (DEBUG_LANDING) console.log('✅ Location pre-loaded successfully');
                } catch (error) {
                    if (DEBUG_LANDING) console.warn('⚠️ Failed to pre-load location:', error);
                }
            }
        };
        
        // Delay slightly to ensure page is loaded
        const timer = setTimeout(autoDetectLocation, 1000);
        return () => clearTimeout(timer);
    }, []);

    // PERMANENT FIX: Simple image preloader without flash
    useEffect(() => {
        let cancelled = false;
        let fallbackTimeout: NodeJS.Timeout | null = null;
        const img = new window.Image();
        let triedOnce = false;

        const showFallback = () => {
            if (!cancelled) {
                setBgStyle({
                    backgroundImage: `url("${PLACEHOLDER_BASE64}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                });
                setImageLoaded(true);
                setImageError(true);
            }
        };

        img.onload = () => {
            if (!cancelled) {
                setImageLoaded(true);
                setImageError(false);
                if (fallbackTimeout) clearTimeout(fallbackTimeout);
            }
        };
        img.onerror = () => {
            if (!cancelled && !triedOnce) {
                // Retry once after short delay
                triedOnce = true;
                setTimeout(() => {
                    img.src = IMAGE_SOURCES[1];
                }, 500);
            } else {
                showFallback();
            }
        };
        // Wait longer before showing fallback (2.5s)
        fallbackTimeout = setTimeout(showFallback, 2500);
        img.src = IMAGE_SOURCES[0];
        return () => {
            cancelled = true;
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
        };
    }, []);

    // Show content after initial mounting/render turbulence settles
    useEffect(() => {
        // Immediately show content on mount
        setContentVisible(true);
        // Use RAF for smoother first paint sequencing
        const raf = requestAnimationFrame(() => setContentVisible(true));
        // Failsafe: always show content after 1.5s
        const timeout = setTimeout(() => setContentVisible(true), 1500);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(timeout);
        };
    }, []);

    // Auto-enter removed - user must explicitly click button to continue

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
            
            // Set session flag to mark entry
            try {
                sessionStorage.setItem('has_entered_app', '1');
            } catch {}
            
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
                // Set session flag
                try { sessionStorage.setItem('has_entered_app', '1'); } catch {}
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
        console.log('🔘 View Massage Therapists button clicked!');
        console.log('🔘 isDetectingLocation state:', isDetectingLocation);
        console.log('🔘 onEnterApp available:', !!onEnterApp);
        console.log('🔘 onEnterApp type:', typeof onEnterApp);
        
        if (isDetectingLocation) {
            console.log('🚫 Already detecting location - ignoring click');
            return;
        }
        
        if (!onEnterApp) {
            console.error('❌ onEnterApp is not defined!');
            alert('Error: onEnterApp function is missing. Please refresh the page.');
            return;
        }
        
        console.log('🔄 Starting location detection...');
        setIsDetectingLocation(true);
        
        // Failsafe: auto-reset after 10 seconds if stuck
        const resetTimeout = setTimeout(() => {
            console.warn('⚠️ Location detection timeout - resetting state');
            setIsDetectingLocation(false);
        }, 10000);
        
        try {
            console.log('📍 Requesting location with fallback...');
            const loc = await locationService.requestLocationWithFallback();
            console.log('✅ Device location set:', loc);
            setDetectedCountryCode(loc.countryCode);
            setDetectedCountry(loc.country);
            setLocationReady(true);

            // Determine language (use selected or browser-based default)
            const lang: Language = (selectedLanguage || ((navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en')) as Language;
            console.log('🌍 Using language:', lang);
            
            try {
                sessionStorage.setItem('show_language_prompt', '1');
                sessionStorage.setItem('suggested_language', lang);
                sessionStorage.setItem('has_entered_app', '1');
            } catch {}
            
            // Immediately enter app and navigate to Home with detected location
            console.log('🚀 Calling onEnterApp with location:', loc);
            await onEnterApp(lang, loc);
            console.log('✅ Successfully entered app');
            clearTimeout(resetTimeout);
        } catch (e) {
            console.error('❌ Failed to set device location:', e);
            setLocationReady(false);
            // Fallback: enter app with default Jakarta location
            try {
                const fallback: UserLocation = { address: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 };
                const lang: Language = (selectedLanguage || ((navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en')) as Language;
                try {
                    sessionStorage.setItem('show_language_prompt', '1');
                    sessionStorage.setItem('suggested_language', lang);
                } catch {}
                console.log('🚀 Calling onEnterApp with fallback location');
                await onEnterApp(lang, fallback);
                clearTimeout(resetTimeout);
            } catch (enterErr) {
                console.error('❌ Failed to enter app with fallback location:', enterErr);
                alert('Failed to enter app. Please try refreshing the page.');
                clearTimeout(resetTimeout);
            }
        } finally {
            setIsDetectingLocation(false);
        }
    };

    // Fallback entry without performing a fresh GPS detect
    const handleEnterWithoutGPS = async () => {
        console.log('🔘 Enter Without GPS button clicked!');
        if (isDetectingLocation) {
            console.log('🚫 Already processing - ignoring click');
            return;
        }
        
        console.log('🔄 Entering without GPS detection...');
        setIsDetectingLocation(true);
        
        try {
            let cached: UserLocation | null = null;
            try {
                const raw = localStorage.getItem('app_user_location');
                if (raw) {
                    cached = JSON.parse(raw);
                    console.log('📍 Using cached location:', cached);
                }
            } catch {}
            
            const fallback: UserLocation = cached || { address: 'Jakarta, Indonesia', lat: -6.2088, lng: 106.8456 };
            const lang: Language = (selectedLanguage || ((navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en')) as Language;
            
            console.log('🌍 Using language:', lang);
            console.log('📍 Using location:', fallback);
            
            try {
                sessionStorage.setItem('show_language_prompt', '1');
                sessionStorage.setItem('suggested_language', lang);
                sessionStorage.setItem('has_entered_app', '1');
            } catch {}
            
            console.log('🚀 Calling onEnterApp...');
            if (!onEnterApp) {
                console.error('❌ onEnterApp is not defined!');
                return;
            }
            await onEnterApp(lang, fallback);
            console.log('✅ Successfully entered app');
        } catch (e) {
            console.error('❌ Fallback enter failed:', e);
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

    // Debug current state
    if (DEBUG_LANDING) {
        console.log('🎨 Render state:', { imageLoaded, imageError, activeImage: activeImage?.substring(0, 50) });
        console.log('🎨 Background style:', bgStyle);
    }

    return (
        <div
            className="relative min-h-screen w-full flex overflow-hidden"
            style={{
                ...bgStyle,
                minHeight: '100vh',
                width: '100%',
                backgroundColor: '#2a1514'
            }}
        >
            {/* Debug overlay removed for production clarity */}
            <PageNumberBadge pageNumber={1} pageName="LandingPage" />
            {/* Removed duplicate img layer to prevent double photo rendering */}
            {/* Overlay always mounted; opacity transitions prevent sudden flash */}
            <div
                className="absolute inset-0 z-10 pointer-events-none bg-black/10 transition-opacity duration-300"
                style={{ opacity: imageLoaded && !imageError ? 1 : 0 }}
            />
            <div
                className="relative z-20 flex-grow flex flex-col items-center justify-center text-white px-4 text-center w-full min-h-screen"
                style={{ opacity: contentVisible ? 1 : 0, transition: 'opacity 400ms ease' }}
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-6">
                    Massage Hub
                </p>
                
                <div className="w-full max-w-sm sm:max-w-md px-2 space-y-3 sm:space-y-4">
                    <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3">{t('landing.getStarted') || 'Get Started'}</h2>
                    
                    {/* Single button: sets location then navigates to Home */}
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
