import React, { useState } from 'react';
import TherapistCard from '../components/TherapistCard';
import RotatingReviews from '../components/RotatingReviews';
import HomeIcon from '../components/icons/HomeIcon';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CityLocationDropdown from '../components/CityLocationDropdown';
import SocialMediaLinks from '../components/SocialMediaLinks';
import { Building, Sparkles } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';

interface TherapistProfilePageProps {
    therapist: any;
    onBack: () => void;
    distance?: number;
    onQuickBookWithChat?: (therapist: any) => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any;
    loggedInProvider?: { id: number | string; type: 'therapist' | 'place' } | null;
    onBook?: (provider: any, type: 'therapist' | 'place') => void;
    onChatWithBusyTherapist?: (therapist: any) => void;
    onShowRegisterPrompt?: () => void;
    onIncrementAnalytics?: (id: number | string, type: 'therapist' | 'place', metric: string) => void;
    onNavigate?: (route: string, data?: any) => void;
    t?: any;
    // New props for header functionality
    onLanguageChange?: (lang: string) => void;
    language?: string;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    therapists?: any[];
    places?: any[];
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onFacialPortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
}

const TherapistProfilePage: React.FC<TherapistProfilePageProps> = ({
    therapist,
    onBack,
    userLocation,
    loggedInCustomer,
    loggedInProvider,
    onBook,
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onShowRegisterPrompt,
    onIncrementAnalytics,
    onNavigate,
    t,
    onLanguageChange,
    language = 'id',
    selectedCity = 'all',
    onCityChange,
    therapists,
    places,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onFacialPortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick
}) => {
    const [activeTab, setActiveTab] = useState('home');
    const [cityState, setCityState] = useState<string>(selectedCity);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    if (!therapist) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Therapist not found</h2>
                    <button 
                        onClick={onBack} 
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const realDiscount = (therapist.discountPercentage && therapist.discountPercentage > 0 && therapist.discountEndTime) ? {
        percentage: therapist.discountPercentage,
        expiresAt: new Date(therapist.discountEndTime)
    } : null;

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
            {/* Header with Brand and Menu */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="px-4 py-3">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        {/* Brand Name with Back Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (onNavigate) {
                                        onNavigate('home');
                                    } else if (typeof window !== 'undefined') {
                                        window.location.href = '/';
                                    }
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                title="Back"
                            >
                                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span>
                            </h1>
                        </div>
                        
                        {/* Language & Menu */}
                        <div className="flex items-center gap-2 sm:gap-3 text-gray-600 flex-shrink-0">
                            {/* Language Selector */}
                            <button 
                                onClick={() => {
                                    const currentLang = language || 'id';
                                    const newLanguage = currentLang === 'id' ? 'en' : 'id';
                                    onLanguageChange?.(newLanguage);
                                }} 
                                className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0" 
                                title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
                            >
                                <span className="text-xl sm:text-2xl">
                                    {language === 'id' ? '🇮🇩' : '🇬🇧'}
                                </span>
                            </button>

                            <button 
                                onClick={() => setIsMenuOpen(true)} 
                                title="Menu" 
                                className="hover:bg-orange-50 rounded-full transition-colors text-orange-500 flex-shrink-0 min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center"
                            >
                               <BurgerMenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* App Drawer */}
            {isMenuOpen && (
                <AppDrawer
                    isHome={false}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={t || {}}
                    language={(language || 'id') as 'en' | 'id' | 'gb'}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onFacialPortalClick={onFacialPortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    onQRCodeClick={() => onNavigate?.('qr-code')}
                    therapists={therapists || []}
                    places={places || []}
                />
            )}

            {/* Hero Section with Location & Controls */}
            <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
                <div className="px-3 sm:px-4 pt-3 pb-3 max-w-6xl mx-auto">
                    {/* Location Display */}
                    <div className="text-center mb-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                                {cityState === 'all' ? 'All Indonesia' : cityState}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Indonesia's Massage Therapist Hub</p>
                    </div>

                    {/* Toggle Buttons */}
                    <div className="flex bg-gray-200 rounded-full p-1 max-w-md mx-auto mb-3">
                        <button 
                            onClick={() => {
                                setActiveTab('home');
                                onNavigate?.('home');
                            }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'home' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <HomeIcon className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{language === 'id' ? 'Layanan Rumah' : 'Home Service'}</span>
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('places');
                                onNavigate?.('home');
                            }}
                            className={`w-1/2 py-2.5 px-3 sm:px-4 rounded-full flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-semibold transition-colors duration-300 min-h-[44px] ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
                        >
                            <Building className="w-4 h-4 flex-shrink-0" />
                            <span className="whitespace-nowrap">{language === 'id' ? 'Tempat Pijat' : 'Massage Places'}</span>
                        </button>
                    </div>

                    {/* City Dropdown + Facial Button */}
                    <div className="flex flex-row gap-2 items-center max-w-2xl mx-auto">
                        <div className="relative flex-1 min-w-0 max-w-[200px] sm:max-w-none z-20">
                            <CityLocationDropdown
                                selectedCity={cityState}
                                onCityChange={(city) => {
                                    setCityState(city);
                                    onCityChange?.(city);
                                }}
                                placeholder="🇮🇩 All Indonesia"
                                includeAll={true}
                                showLabel={false}
                                className="w-full"
                            />
                        </div>
                        
                        <div className="flex justify-end flex-shrink-0">
                            <button
                                onClick={() => onNavigate?.('facialProviders')}
                                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
                                title={language === 'id' ? 'Facial Indonesia' : 'Facials Indonesia'}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Facial</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Therapist Card */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <TherapistCard
                    therapist={therapist}
                    userLocation={userLocation}
                    onRate={() => {
                        console.log('Rate therapist:', therapist);
                    }}
                    onBook={() => onBook?.(therapist, 'therapist')}
                    onQuickBookWithChat={onQuickBookWithChat ? () => onQuickBookWithChat(therapist) : undefined}
                    onChatWithBusyTherapist={onChatWithBusyTherapist}
                    onShowRegisterPrompt={onShowRegisterPrompt}
                    isCustomerLoggedIn={!!loggedInCustomer}
                    onIncrementAnalytics={(metric) => onIncrementAnalytics?.(therapist.id || therapist.$id, 'therapist', metric)}
                    loggedInProviderId={loggedInProvider?.id}
                    onNavigate={onNavigate}
                    activeDiscount={realDiscount}
                    t={t || {}}
                />

                {/* Rotating Reviews Section */}
                <div className="mt-8">
                    <RotatingReviews 
                        location={therapist.location || 'Yogyakarta'} 
                        limit={5}
                        providerId={(therapist as any).id || (therapist as any).$id}
                        providerName={(therapist as any).name}
                        providerType={'therapist'}
                        providerImage={(therapist as any).profilePicture || (therapist as any).mainImage}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>
            </div>
        </div>
    );
};

export default TherapistProfilePage;