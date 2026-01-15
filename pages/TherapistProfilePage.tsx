import React, { useState } from 'react';
import TherapistProfileBase from '../components/TherapistProfileBase';
import { FloatingChatWindow } from '../chat';
import HomeIcon from '../components/icons/HomeIcon';
import { FloatingChatWindow } from '../chat';
import CityLocationDropdown from '../components/CityLocationDropdown';
import { FloatingChatWindow } from '../chat';
import { Building, Sparkles } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import { FloatingChatWindow } from '../chat';
import UniversalHeader from '../components/shared/UniversalHeader';
import { FloatingChatWindow } from '../chat';

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
    // Shared view mode props
    isSharedView?: boolean; // When true: hide header, show hero logo + SEO footer
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
    isSharedView = false,
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
    
    // 🔥 CRITICAL LOG: Track TherapistProfilePage mount
    console.log('🎯 TherapistProfilePage MOUNTED:', {
        therapistExists: !!therapist,
        therapistId: therapist?.id || therapist?.$id,
        therapistName: therapist?.name,
        currentPath: window.location.pathname
    });
    
    // ⚠️ FAIL LOUDLY - NO SILENT EARLY RETURNS
    if (!therapist) {
        const errorMsg = 'TherapistProfilePage rendered WITHOUT therapist data';
        console.error('🚨', errorMsg);
        throw new Error(errorMsg); // Throw error instead of silent return
    }

    return (
        <div className="bg-gray-50">
            {/* Header - Hidden in shared view */}
            {!isSharedView && (
                <UniversalHeader 
                    language={language}
                    onLanguageChange={onLanguageChange}
                    onMenuClick={() => setIsMenuOpen(true)}
                />
            )}

            {/* App Drawer - Hidden in shared view */}
            {!isSharedView && isMenuOpen && (
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

            {/* Hero Logo - Only shown in shared view */}
            {isSharedView && (
                <div className="bg-white pt-6 pb-4">
                    <div className="flex justify-center">
                        <img 
                            src={`https://ik.imagekit.io/7grri5v7d/logo%20yoga.png?t=${Date.now()}`}
                            alt="IndaStreet Massage Logo" 
                            className="h-32 w-auto object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Hero Section with Location & Controls - Hidden in shared view */}
            {!isSharedView && (
                <div className="bg-white border-b border-gray-100">
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
            )}

            {/* Therapist Profile Content - Use Base Component */}
            <TherapistProfileBase
                therapist={therapist}
                mode="authenticated"
                userLocation={userLocation}
                showHeader={false}
                showSEOFooter={isSharedView}
                onRate={() => console.log('Rate therapist:', therapist)}
                onQuickBookWithChat={onQuickBookWithChat ? () => onQuickBookWithChat(therapist) : undefined}
                onChatWithBusyTherapist={onChatWithBusyTherapist}
                onShowRegisterPrompt={onShowRegisterPrompt}
                onIncrementAnalytics={(metric) => onIncrementAnalytics?.(therapist.id || therapist.$id, 'therapist', metric)}
                isCustomerLoggedIn={!!loggedInCustomer}
                loggedInProviderId={loggedInProvider?.id}
                onNavigate={onNavigate}
                t={t || {}}
                language={language}
            />

            {/* Quick Links Footer - Only for authenticated view */}
            {!isSharedView && (
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                        <div className="font-bold text-lg">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 w-full">
                            <h3 className="text-center text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                            <div className="flex flex-wrap justify-center gap-1 max-w-2xl mx-auto">
                                <button
                                onClick={() => onNavigate?.('home')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => onNavigate?.('massage-types')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Massage Types
                            </button>
                            <button
                                onClick={() => onNavigate?.('facial-types')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Facial Types
                            </button>
                            <button
                                onClick={() => onNavigate?.('therapist-signup')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Join as a Therapist Today
                            </button>
                            <button
                                onClick={() => onNavigate?.('place-signup')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Join Massage Place
                            </button>
                            <button
                                onClick={() => onNavigate?.('about-us')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                About Us
                            </button>
                            <button
                                onClick={() => onNavigate?.('contact-us')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Contact Us
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        {/* Floating Chat Window */}
        <FloatingChatWindow userId={'guest'} userName={'Guest User'} userRole="customer" />

    );
};

export default TherapistProfilePage;
