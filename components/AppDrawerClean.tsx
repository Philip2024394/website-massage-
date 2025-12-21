import React from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon, Home, Heart, Briefcase, Info, BookOpen, Phone, MapPin, HelpCircle, Users, Building, UserPlus, Sparkles } from 'lucide-react';

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
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onFacialPortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onNavigate?: (page: string) => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onQRCodeClick?: () => void;
  therapists?: any[];
  places?: any[];
}

// Default translations for drawer
const drawerTranslations = {
  en: {
    partners: 'Partners',
    joinIndaStreet: 'Join IndaStreet',
    massageJobs: 'Massage Jobs',
    howItWorks: 'How It Works',
    aboutUs: 'About Us',
    companyProfile: 'Company Profile',
    contact: 'Contact',
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
    joinIndaStreet: 'Gabung IndaStreet',
    massageJobs: 'Lowongan Pijat',
    howItWorks: 'Cara Kerja',
    aboutUs: 'Tentang Kami',
    companyProfile: 'Profil Perusahaan',
    contact: 'Kontak',
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
}) => {
  if (!isHome || !isOpen) return null;

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
    console.log('🔍 Drawer navigation:', { hasCallback: !!callback, fallbackPage, hasOnNavigate: !!onNavigate });
    
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
        onNavigate(fallbackPage);
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
        <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-white shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ zIndex: 99999 }}>
          <div className="p-6 flex justify-between items-center border-b border-black">
            <h2 className="font-bold text-2xl">
              <span className="text-black">Inda</span>
              <span className="text-orange-500">Street</span>
            </h2>
            <button onClick={onClose} className="p-2 rounded-full transition-colors" aria-label="Close menu">
              <CloseIcon className="w-6 h-6 text-black" />
            </button>
          </div>

          <nav className="flex-grow overflow-y-auto p-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <button onClick={() => handleItemClick(undefined, 'indastreet-partners')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Home className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.partners}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'partnership-application')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.joinIndaStreet}</span>
                </button>
                <button onClick={() => handleItemClick(onMassageJobsClick, 'browseJobs')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
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
                <div className="space-y-2">
                  <button onClick={() => { 
                    const authUrl = (import.meta as any).env?.VITE_AUTH_APP_URL || (window.location.origin.includes('localhost') ? 'http://localhost:3001' : window.location.origin);
                    window.location.href = `${authUrl}/signup`; 
                    onClose(); 
                  }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Sign Up</span>
                  </button>
                  <button onClick={() => handleItemClick(undefined, 'website-management')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Home className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{dt.websitePartners}</span>
                  </button>
                </div>

                {/* Join Provider Section */}
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <h3 className="text-xs font-bold text-orange-600 uppercase tracking-wider px-3 mb-3">{dt.joinAsProvider}</h3>
                  <button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const authUrl = getAuthAppUrl();
                    // Send user to unified create-account page with therapist portal preselected
                    window.location.href = `${authUrl}/?portals=all&action=signup&portal=massage_therapist`;
                    onClose();
                  }} className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <UserPlus className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-sm text-white font-bold">{dt.joinTherapist}</span>
                  </button>
                  <button onClick={() => {
                    const authUrl = getAuthAppUrl();
                    window.location.href = `${authUrl}/?portals=all&action=signup&portal=massage_place`;
                    onClose();
                  }} className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <Building className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-sm text-white font-bold">{dt.joinMassageSpa}</span>
                  </button>
                  <button onClick={() => {
                    const authUrl = getAuthAppUrl();
                    window.location.href = `${authUrl}/?portals=all&action=signup&portal=facial_place`;
                    onClose();
                  }} className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                    <Sparkles className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-sm text-white font-bold">{dt.joinSkinClinic}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-300">
                <div className="flex flex-col items-center gap-3 px-4 py-2">
                  <button 
                    onClick={() => {
                      const authUrl = getAuthAppUrl();
                      // Unified sign-in page showing all portal dashboards
                      window.location.href = `${authUrl}/?portals=all&action=signin`;
                      onClose();
                    }}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    Sign In
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
