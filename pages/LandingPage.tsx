import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import { locationService } from '../services/locationService';
import { deviceService } from '../services/deviceService';
import PageNumberBadge from '../components/PageNumberBadge';
import PWAInstallIOSModal from '../components/PWAInstallIOSModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import type { UserLocation } from '../types';
import type { Language } from '../types/pageTypes';

interface LandingPageProps {
    onLanguageSelect?: (lang: Language) => void;
    onEnterApp?: (language: Language, location: UserLocation) => void;
    handleEnterApp?: (lang: Language, location: UserLocation) => Promise<void>;
    handleLanguageSelect?: (lang: Language) => Promise<void>;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830';

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, handleEnterApp, onLanguageSelect, handleLanguageSelect }) => {
    console.log('🎬 LandingPage component mounted');
    const [imageLoaded, setImageLoaded] = useState(false);
    const defaultLanguage: Language = 'id';
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const { requestInstall, isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();
    const isMountedRef = React.useRef(true);
    
    // Use either prop name for backward compatibility
    const enterAppCallback = handleEnterApp || onEnterApp;
    const selectLanguage = handleLanguageSelect || onLanguageSelect;

    // Track component mount status
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Auto-detect location on component mount for mobile devices
    useEffect(() => {
        const autoDetectLocation = async () => {
            const deviceInfo = deviceService.getDeviceInfo();
            
            if (deviceInfo.type === 'mobile' && deviceInfo.supportsGPS) {
                try {
                    await locationService.requestLocationWithFallback();
                } catch (error) {
                    console.warn('⚠️ Failed to pre-load location:', error);
                }
            }
        };
        
        const timer = setTimeout(autoDetectLocation, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => setImageLoaded(true);
        img.onerror = () => setImageLoaded(true);
    }, []);

    const handleEnterClick = async () => {
        if (isDetectingLocation) return;
        if (!isMountedRef.current) return;
        
        // Check if enterApp callback exists
        if (!enterAppCallback) {
            console.error('❌ No enterApp callback provided to LandingPage');
            alert('Error: Navigation function not available. Please refresh the page.');
            return;
        }
        
        // Don't change button text during navigation to prevent removeChild errors
        // Just disable the button and navigate immediately
        setIsDetectingLocation(true);
        
        try {
            const userLocation = await locationService.requestLocationWithFallback();
            if (!isMountedRef.current) return;
            await enterAppCallback(defaultLanguage, userLocation);
            // Note: PWA install prompt removed to prevent user gesture error
        } catch (locationError) {
            console.error('❌ Failed to get location:', locationError);
            
            const defaultLocation: UserLocation = {
                address: 'Jakarta, Indonesia',
                lat: -6.2088,
                lng: 106.8456
            };
            
            try {
                if (!isMountedRef.current) return;
                await enterAppCallback(defaultLanguage, defaultLocation);
                // Note: PWA install prompt removed to prevent user gesture error
            } catch (enterError) {
                console.error('❌ Failed to call enterApp:', enterError);
                alert(`Error entering app: ${enterError instanceof Error ? enterError.message : 'Unknown error'}`);
                setIsDetectingLocation(false);
            }
        }
        // Component will unmount during navigation, no need to reset state
    };

    return (
        <div className="relative min-h-screen w-full flex overflow-hidden bg-gray-900">
            <PageNumberBadge pageNumber={1} pageName="LandingPage" />
            <div
                className="absolute inset-0 z-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out"
                style={{
                    backgroundImage: `url('${imageSrc}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    opacity: imageLoaded ? 1 : 0,
                }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/60 pointer-events-none" />
            <div 
                className="relative z-20 flex-grow flex flex-col items-center justify-center text-white px-4 text-center w-full min-h-screen transition-opacity duration-700 ease-in-out"
                style={{ opacity: imageLoaded ? 1 : 0 }}
            >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-2">
                    Indonesia's Massage Hub
                </p>
                
                <div className="w-full max-w-sm sm:max-w-md px-2 space-y-3 sm:space-y-4 mt-4">
                    <Button
                        type="button"
                        onClick={handleEnterClick}
                        variant="primary"
                        disabled={isDetectingLocation}
                        className="!py-2.5 sm:!py-4 !text-base sm:!text-lg font-bold relative z-10"
                    >
                        <span className="flex items-center justify-center gap-2">
                            <span>View Massage Therapist</span>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </Button>
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
