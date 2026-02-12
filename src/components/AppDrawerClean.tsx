// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon, Home, Heart, Briefcase, Info, BookOpen, Phone, MapPin, HelpCircle, Users, Building, UserPlus, Sparkles, Hotel } from 'lucide-react';
import { useCityContext } from '../context/CityContext';
import CitySwitcher from './CitySwitcher';

// Helper function to get auth app URL for development and production
const getAuthAppUrl = (): string => {
    // Check for environment variable first
    const envUrl = (import.meta as any).env?.VITE_AUTH_APP_URL;
    if (envUrl && envUrl !== 'http://localhost:3001') return envUrl;
    
    // Development mode
    if (window.location.origin.includes('localhost')) {
        return 'http://localhost:3001';
    }
    
    // Production mode - use same domain (auth pages are part of main app)
    return window.location.origin;
};

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHome?: boolean;
  t?: any;
  language?: 'en' | 'id' | 'gb';
  currentLanguage?: 'en' | 'id' | 'gb';
  onLanguageChange?: (lang: string) => void;
  onNavigate?: (page: string) => void;
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
  onQRCodeClick?: () => void;
  onLoginClick?: () => void;
  therapists?: any[];
  places?: any[];
}

// Default translations for drawer
const drawerTranslations = {
  en: {
    partners: 'Partners',
    joinIndaStreet: 'Join Indastreet Today',
    massageJobs: 'Massage Jobs',
    howItWorks: 'How It Works',
    aboutUs: 'About Us',
    companyProfile: 'Company Profile',
    contact: 'Contact',
    hotelsVillas: 'Hotels & Villas',
    blog: 'Blog',
    massageInBali: 'Massage in Bali',
    massageDirectory: 'Massage Directory',
    facialDirectory: 'Facial Directory',
    balineseMassage: 'Balinese Massage',
    deepTissueMassage: 'Deep Tissue Massage',
    faq: 'FAQ',
    providerPortals: 'Provider Portals',
    websitePartners: 'Website Partners',
    joinAsProvider: 'Join as Provider',
    joinTherapist: 'Join Therapist',
    joinMassageSpa: 'Join Massage Spa',
    joinSkinClinic: 'Join Skin Clinic',
    admin: 'Admin',
  },
  id: {
    partners: 'Mitra',
    joinIndaStreet: 'Gabung Indastreet Hari Ini',
    massageJobs: 'Lowongan Pijat',
    howItWorks: 'Cara Kerja',
    aboutUs: 'Tentang Kami',
    companyProfile: 'Profil Perusahaan',
    contact: 'Kontak',
    hotelsVillas: 'Hotel & Villa',
    blog: 'Blog',
    massageInBali: 'Pijat di Bali',
    massageDirectory: 'Direktori Pijat',
    facialDirectory: 'Direktori Facial',
    balineseMassage: 'Pijat Bali',
    deepTissueMassage: 'Pijat Deep Tissue',
    faq: 'FAQ',
    providerPortals: 'Portal Penyedia',
    websitePartners: 'Mitra Website',
    joinAsProvider: 'Gabung sebagai Penyedia',
    joinTherapist: 'Gabung Terapis',
    joinMassageSpa: 'Gabung Spa Pijat',
    joinSkinClinic: 'Gabung Klinik Kulit',
    admin: 'Admin',
  },
};

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  isHome = true,
  t,
  language = 'en',
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onFacialPortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onNavigate,
  onTermsClick,
  onPrivacyClick,
  onQRCodeClick,
  onLoginClick,
}) => {
  const { city } = useCityContext();
  const [showCitySwitcher, setShowCitySwitcher] = useState(false);
  
  console.log('🚪 AppDrawer render check:', { isHome, isOpen, shouldRender: isOpen });
  
  if (!isOpen) return null;

  // Get drawer text based on language
  const dt = drawerTranslations[language] || drawerTranslations.en;

  const translate = (key: string): string => {
    if (t && typeof t === 'function') {
      try {
        const result = t(key);
        if (result !== key) return result;
      } catch {}
    }
    if (t && typeof t === 'object') {
      try {
        const parts = key.split('.');
        let current: any = t;
        for (const p of parts) {
          if (current && typeof current === 'object' && p in current) current = current[p];
          else return key;
        }
        if (typeof current === 'string') return current;
      } catch {}
    }
    return key;
  };

  const handleItemClick = (callback?: () => void, fallbackPage?: string) => {
    console.log('🔍 Drawer navigation:', { 
      hasCallback: !!callback, 
      callbackType: typeof callback,
      fallbackPage, 
      hasOnNavigate: !!onNavigate,
      hasOnTherapistPortalClick: !!onTherapistPortalClick,
      hasOnMassagePlacePortalClick: !!onMassagePlacePortalClick,
      hasOnFacialPortalClick: !!onFacialPortalClick
    });
    
    if (callback) {
      try {
        console.log('✅ Executing callback for navigation');
        callback();
      } catch (error) {
        console.error('❌ Callback error:', error);
      }
      onClose();
    } else if (fallbackPage && onNavigate) {
      try {
        console.log('✅ Navigating to page:', fallbackPage);
        console.log('🔍 onNavigate type:', typeof onNavigate);
        console.log('🔍 Calling onNavigate with:', fallbackPage);
        onNavigate(fallbackPage);
        console.log('✅ onNavigate called successfully');
      } catch (error) {
        console.error('❌ Navigation error:', error);
      }
      onClose();
    } else {
      console.warn('⚠️ No navigation method available:', { callback, fallbackPage, onNavigate: !!onNavigate });
    }
  };

  const content = (
    <>
      <div className="fixed inset-0" role="dialog" aria-modal="true" style={{ zIndex: 99999 }}>
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-hidden="true" 
        />
        <div 
          className={`
            absolute right-0 top-0 bottom-0 bg-white shadow-2xl flex flex-col 
            transition-transform ease-in-out duration-300
            /* Facebook/Amazon responsive drawer sizing */
            w-[75%] max-w-[280px]
            sm:w-[320px] sm:max-w-[320px]
            md:w-[350px] md:max-w-[350px]
            lg:w-[380px] lg:max-w-[380px]
            /* Performance optimizations */
            will-change-transform contain-layout contain-style contain-paint
            /* Hardware acceleration for smooth animations */
            transform-gpu backdrop-blur-sm
            ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          `} 
          style={{ 
            zIndex: 99999,
            contain: 'layout style paint',
            transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(100%, 0, 0)'
          }}
          onClick={(e) => e.stopPropagation()}
          aria-labelledby="drawer-title"
          aria-describedby="drawer-description"
        >
          <div className="p-6 flex justify-between items-center border-b border-black">
            <h2 id="drawer-title" className="font-bold text-2xl">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h2>
            <button 
              onClick={onClose} 
              className="
                rounded-full transition-all duration-200 touch-manipulation
                /* Mobile: 56px touch targets */
                min-w-[56px] min-h-[56px] w-14 h-14 
                /* Tablet: 48px touch targets */
                md:min-w-[48px] md:min-h-[48px] md:w-12 md:h-12
                /* Desktop: 44px touch targets */
                lg:min-w-[44px] lg:min-h-[44px] lg:w-11 lg:h-11
                flex items-center justify-center
                hover:bg-gray-100 active:bg-gray-200
                will-change-transform contain-layout
              " 
              aria-label="Close navigation menu"
              title="Close navigation menu"
              type="button"
              style={{
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              } as React.CSSProperties}
            >
              <CloseIcon className="w-6 h-6 md:w-5 md:h-5 lg:w-6 lg:h-6 text-black transition-transform duration-200" />
            </button>
          </div>

          <nav className="flex-grow p-4" id="drawer-description" aria-label="Main navigation">
            <div className="space-y-3">
              {/* Authentication Section - Separate Buttons */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="space-y-3">
                  {/* Create Account Button */}
                  <button 
                    onClick={() => handleItemClick(undefined, 'createAccount')} 
                    className="
                      flex items-center justify-center gap-3 w-full rounded-xl 
                      bg-gradient-to-r from-orange-500 to-orange-600 
                      hover:from-orange-600 hover:to-orange-700 
                      shadow-lg hover:shadow-xl transform hover:scale-105 
                      transition-all duration-200 touch-manipulation
                      /* Mobile: 56px minimum height for touch */
                      py-4 px-4 min-h-[56px]
                      /* Tablet: 48px minimum height */
                      md:py-3 md:min-h-[48px] 
                      /* Desktop: 44px minimum height */
                      lg:py-3 lg:min-h-[44px]
                      will-change-transform
                    "
                    type="button"
                    aria-label="Create new account"
                    style={{ touchAction: 'manipulation' } as React.CSSProperties}
                  >
                    <UserPlus className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-sm text-white font-bold">Create Account</span>
                  </button>
                  
                  {/* Sign In Button */}
                  <button 
                    onClick={() => handleItemClick(onLoginClick, 'login')} 
                    className="
                      flex items-center justify-center gap-3 w-full rounded-xl 
                      border-2 border-orange-500 bg-white hover:bg-orange-50 
                      shadow-md hover:shadow-lg transform hover:scale-105 
                      transition-all duration-200 touch-manipulation
                      /* Mobile: 56px minimum height for touch */
                      py-4 px-4 min-h-[56px]
                      /* Tablet: 48px minimum height */
                      md:py-3 md:min-h-[48px]
                      /* Desktop: 44px minimum height */
                      lg:py-3 lg:min-h-[44px]
                      will-change-transform
                    "
                    type="button"
                    aria-label="Sign in to your account"
                    style={{ touchAction: 'manipulation' } as React.CSSProperties}
                  >
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-orange-500 font-bold">Sign In</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {/* City Switcher Button */}
                <button 
                  onClick={() => setShowCitySwitcher(!showCitySwitcher)} 
                  className="
                    flex items-center gap-3 w-full rounded-lg bg-teal-50 
                    hover:bg-teal-100 transition-colors border-2 border-teal-200
                    touch-manipulation
                    /* Mobile: 56px minimum height */
                    py-3 px-3 min-h-[56px]
                    /* Tablet: 48px minimum height */
                    md:py-2 md:min-h-[48px]
                    /* Desktop: 44px minimum height */
                    lg:py-2 lg:min-h-[44px]
                  "
                  type="button"
                  aria-expanded={showCitySwitcher}
                  aria-label={`Current city: ${city}. Click to change city`}
                  style={{ touchAction: 'manipulation' } as React.CSSProperties}
                >
                  <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div className="flex-grow text-left">
                    <span className="text-sm text-gray-700 font-medium block">
                      {language === 'id' ? 'Kota Saat Ini' : 'Current City'}
                    </span>
                    <span className="text-xs text-teal-600 font-semibold">{city || (language === 'id' ? 'Semua Indonesia' : 'All Indonesia')}</span>
                  </div>
                </button>
                
                {/* City Switcher Dropdown */}
                {showCitySwitcher && (
                  <div className="ml-4 mb-2">
                    <CitySwitcher onClose={() => setShowCitySwitcher(false)} />
                  </div>
                )}
                
                <button onClick={() => handleItemClick(undefined, 'indastreet-partners')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Home className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.partners}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'partnership-application')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.joinIndaStreet}</span>
                </button>
                <button onClick={() => handleItemClick(onMassageJobsClick, 'massage-jobs')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.massageJobs}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'how-it-works')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.howItWorks}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'about')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Info className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.aboutUs}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'company')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.companyProfile}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'contact')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.contact}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'hotels-and-villas')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Hotel className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.hotelsVillas}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'blog')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.blog}</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <button onClick={() => handleItemClick(undefined, 'massage-bali')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.massageInBali}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'massage-types')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.massageDirectory}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'facial-types')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.facialDirectory}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'balinese-massage')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.balineseMassage}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'deep-tissue-massage')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.deepTissueMassage}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'faq')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.faq}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'verifiedProBadge')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Sparkles className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Massage Therapist Standards</span>
                </button>
                <div className="space-y-2">
                  <button onClick={() => handleItemClick(undefined, 'simple-signup')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Sign Up</span>
                  </button>
                  <button onClick={() => handleItemClick(undefined, 'website-management')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Home className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{dt.websitePartners}</span>
                  </button>
                </div>
              </div>

              {/* Admin Access - Footer Text Link */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <button 
                  onClick={() => handleItemClick(onAdminPortalClick, 'admin')} 
                  className="w-full text-center py-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {dt.admin} Portal
                </button>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }
  return content;
};

export default AppDrawer;
