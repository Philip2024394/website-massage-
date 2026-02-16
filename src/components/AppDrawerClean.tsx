// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon, Home, Heart, Briefcase, Info, BookOpen, Phone, MapPin, HelpCircle, Users, Building, UserPlus, Sparkles, Hotel } from 'lucide-react';
import { useCityContext } from '../context/CityContext';
import type { Page } from '../types/pageTypes';
import { getSafeDrawerPage, DRAWER_NAV_ITEMS } from '../config/drawerConfig';
import CitySwitcher from './CitySwitcher';

const DRAWER_ICON_MAP = {
  Home,
  Users,
  Briefcase,
  HelpCircle,
  Info,
  Building,
  Phone,
  Hotel,
  BookOpen,
  Heart,
  Sparkles,
} as const;

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
  onNavigate?: (page: Page) => void;
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
    massageJobs: 'Job Positions',
    howItWorks: 'How It Works',
    aboutUs: 'About Us',
    companyProfile: 'Company Profile',
    contact: 'Contact',
    hotelsVillas: 'Hotels & Villas',
    blog: 'Blog',
    indastreetNews: 'Indastreet News',
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
    terms: 'Terms',
    privacy: 'Privacy',
    help: 'Help',
    followUs: 'Follow Us',
  },
  id: {
    partners: 'Mitra',
    joinIndaStreet: 'Gabung Indastreet Hari Ini',
    massageJobs: 'Lowongan Kerja',
    howItWorks: 'Cara Kerja',
    aboutUs: 'Tentang Kami',
    companyProfile: 'Profil Perusahaan',
    contact: 'Kontak',
    hotelsVillas: 'Hotel & Villa',
    blog: 'Blog',
    indastreetNews: 'Indastreet News',
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
    terms: 'Syarat',
    privacy: 'Privasi',
    help: 'Bantuan',
    followUs: 'Ikuti Kami',
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

  /** Admin dashboard is gated by code – only "admin1" allows access from drawer */
  const ADMIN_ACCESS_CODE = 'admin1';

  const handleAdminPortalClick = () => {
    const entered = prompt('Enter admin access code:');
    const code = (entered || '').trim();
    if (code === ADMIN_ACCESS_CODE) {
      handleItemClick(onAdminPortalClick, 'admin');
    } else if (entered !== null) {
      alert('Invalid code. Access denied.');
    }
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
      try { onClose?.(); } catch (e) { console.warn('AppDrawer onClose error', e); }
    } else if (fallbackPage && onNavigate) {
      const pageToUse = getSafeDrawerPage(fallbackPage);
      if (pageToUse === 'home' && fallbackPage !== 'home') {
        console.warn('[AppDrawer] Unknown drawer page, redirecting to home:', fallbackPage);
      }
      try {
        console.log('✅ Navigating to page:', pageToUse);
        onNavigate(pageToUse);
      } catch (error) {
        console.error('❌ Navigation error:', error);
      }
      try { onClose?.(); } catch (e) { console.warn('AppDrawer onClose error', e); }
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
            try {
              onClose?.();
            } catch (err) {
              console.warn('AppDrawer overlay onClose error', err);
            }
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
              onClick={() => {
                try {
                  onClose?.();
                } catch (err) {
                  console.warn('AppDrawer close button error', err);
                }
              }} 
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
              {/* Home – top of drawer for easy access from any page */}
              <button
                onClick={() => handleItemClick(onNavigate ? () => onNavigate('home') : undefined, 'home')}
                className="
                  flex items-center gap-3 w-full rounded-xl text-left
                  bg-slate-100 hover:bg-primary-50 border border-slate-200/80
                  transition-all duration-200 touch-manipulation
                  py-3 px-4 min-h-[48px]
                "
                type="button"
                aria-label="Go to Home page"
                style={{ touchAction: 'manipulation' } as React.CSSProperties}
              >
                <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-white border border-slate-200/80" aria-hidden="true">
                  <Home className="w-5 h-5 text-primary-600" />
                </span>
                <span className="flex-1 min-w-0 text-sm font-semibold text-slate-800 pl-2">
                  {language === 'id' ? 'Beranda' : 'Home'}
                </span>
              </button>

              {/* Authentication Section - Separate Buttons */}
              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="space-y-3">
                  {/* Create Account Button */}
                  <button 
                    onClick={() => handleItemClick(undefined, 'createAccount')} 
                    className="
                      flex items-center gap-3 w-full rounded-xl text-left
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
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                      <UserPlus className="w-5 h-5 text-white" />
                    </span>
                    <span className="flex-1 min-w-0 text-left text-sm text-white font-bold pl-2">Create Account</span>
                  </button>
                  
                  {/* Sign In Button */}
                  <button 
                    onClick={() => handleItemClick(onLoginClick, 'login')} 
                    className="
                      flex items-center gap-3 w-full rounded-xl text-left
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
                    <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                      <Users className="w-5 h-5 text-orange-500" />
                    </span>
                    <span className="flex-1 min-w-0 text-left text-sm text-orange-500 font-bold pl-2">Sign In</span>
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
                    touch-manipulation text-left
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
                  <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </span>
                  <div className="flex-1 min-w-0 text-left pl-2">
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
                
                {Array.isArray(DRAWER_NAV_ITEMS) && (() => {
                  const breakIndex = DRAWER_NAV_ITEMS.findIndex((i) => i.sectionBreak);
                  const first = breakIndex < 0 ? DRAWER_NAV_ITEMS : DRAWER_NAV_ITEMS.slice(0, breakIndex);
                  const second = breakIndex < 0 ? [] : DRAWER_NAV_ITEMS.slice(breakIndex);
                  const renderItem = (item: (typeof DRAWER_NAV_ITEMS)[number]) => {
                    const IconComp = DRAWER_ICON_MAP[item?.icon] ?? Home;
                    const callback =
                      item.id === 'massage-jobs'
                        ? onMassageJobsClick
                        : onNavigate
                          ? () => onNavigate(item.id as Page)
                          : undefined;
                    const label = typeof item.labelOverride === 'string'
                      ? item.labelOverride
                      : (dt && typeof dt === 'object' && item.labelKey && (dt[item.labelKey as keyof typeof dt] ?? item.labelKey)) || item.labelKey || '';
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(callback, item.id)}
                        className="flex items-center w-full py-2.5 px-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                      >
                        <span className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg" aria-hidden="true">
                          <IconComp className="w-5 h-5 text-orange-500" />
                        </span>
                        <span className="flex-1 min-w-0 text-left text-sm text-gray-700 font-medium pl-2">{label}</span>
                      </button>
                    );
                  };
                  return (
                    <>
                      <div className="space-y-2">
                        {first.map(renderItem)}
                      </div>
                      {second.length > 0 && (
                        <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                          {second.map(renderItem)}
                        </div>
                      )}
                    </>
                  );
                })()}

              {/* End of drawer: Social, Admin */}
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
                {/* Follow us – social icons */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">{dt.followUs}</span>
                  <div className="flex items-center justify-center gap-4">
                    <a href="https://www.tiktok.com/@indastreet.team?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-orange-50 transition-colors" aria-label="TikTok">
                      <img src="https://ik.imagekit.io/7grri5v7d/tik%20tok.png" alt="" className="w-8 h-8 object-contain" />
                    </a>
                    <a href="https://www.facebook.com/share/g/1C2QCPTp62/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-orange-50 transition-colors" aria-label="Facebook">
                      <img src="https://ik.imagekit.io/7grri5v7d/facebook.png" alt="" className="w-8 h-8 object-contain" />
                    </a>
                    <a href="https://www.instagram.com/indastreet.id/" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-orange-50 transition-colors" aria-label="Instagram">
                      <img src="https://ik.imagekit.io/7grri5v7d/instagrame.png" alt="" className="w-8 h-8 object-contain" />
                    </a>
                  </div>
                </div>
                {/* Admin Access – footer: code required (admin1) */}
                <button
                  onClick={handleAdminPortalClick}
                  className="w-full text-center py-2 text-sm text-gray-500 hover:text-purple-600 transition-colors"
                >
                  {dt.admin} Portal
                </button>
              </div>
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
