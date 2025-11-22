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
    onLanguageSelect: (lang: Language) => void;
    onEnterApp: (language: Language, location: UserLocation) => void;
}

const imageSrc = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830';

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const defaultLanguage: Language = 'id';
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const { requestInstall, isInstalled, isIOS, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();

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

    const handleEnterApp = async () => {
        if (isDetectingLocation) return;
        setIsDetectingLocation(true);
        
        try {
            const userLocation = await locationService.requestLocationWithFallback();
            await onEnterApp(defaultLanguage, userLocation);
            try { 
                await requestInstall(); 
            } catch {}
        } catch (error) {
            console.error('❌ Failed to get location:', error);
            
            const defaultLocation: UserLocation = {
                address: 'Jakarta, Indonesia',
                lat: -6.2088,
                lng: 106.8456
            };
            
            try {
                await onEnterApp(defaultLanguage, defaultLocation);
                try { 
                    await requestInstall(); 
                } catch {}
            } catch (enterError) {
                console.error('❌ Failed to call onEnterApp:', enterError);
            }
        } finally {
            setTimeout(() => {
                setIsDetectingLocation(false);
            }, 100);
        }
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
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/40 to-black/60 pointer-events-none" />
            <div className="relative z-20 flex-grow flex flex-col items-center justify-center text-white px-4 text-center w-full min-h-screen">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-white">Inda</span><span className="text-orange-400">street</span>
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-white mb-6">
                    Massage Hub
                </p>
                
                <div className="w-full max-w-sm sm:max-w-md px-2 space-y-3 sm:space-y-4">
                    <Button
                        type="button"
                        onClick={handleEnterApp}
                        variant="primary"
                        disabled={isDetectingLocation}
                        className="!py-2.5 sm:!py-4 !text-base sm:!text-lg font-bold relative z-10"
                    >
                        <div className="flex items-center justify-center gap-2">
                            {isDetectingLocation ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Detecting location...
                                </>
                            ) : (
                                <>
                                    View Massage Therapist
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </>
                            )}
                        </div>
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
