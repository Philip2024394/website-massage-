import React from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon, Home, Heart, Briefcase, Info, BookOpen, Phone, MapPin, HelpCircle, Users, Building, UserPlus, Sparkles } from 'lucide-react';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHome?: boolean;
  t?: any;
  language?: 'en' | 'id';
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
    if (callback) {
      try {
        callback();
      } catch {}
      onClose();
    } else if (fallbackPage && onNavigate) {
      try {
        onNavigate(fallbackPage);
      } catch {}
      onClose();
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
                <button onClick={() => handleItemClick(undefined, 'joinIndastreet')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.joinIndaStreet}</span>
                </button>
                <button onClick={() => handleItemClick(onMassageJobsClick, 'massageJobs')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.massageJobs}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'how-it-works')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.howItWorks}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'about-us')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Info className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.aboutUs}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'company-profile')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.companyProfile}</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'contact-us')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
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
                <button onClick={() => handleItemClick(() => onNavigate?.('massageTypes'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.massageDirectory}</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('facialTypes'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.facialDirectory}</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('balinese-massage'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.balineseMassage}</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('deep-tissue-massage'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.deepTissueMassage}</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('faq'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">{dt.faq}</span>
                </button>
                <div className="space-y-2">
                  <button onClick={() => { window.location.href = 'http://localhost:3001/signup'; onClose(); }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Sign Up</span>
                  </button>
                  <button onClick={() => handleItemClick(() => onNavigate?.('website-management'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Home className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{dt.websitePartners}</span>
                  </button>
                </div>

                {/* Join Provider Section */}
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 mb-2">{dt.joinAsProvider}</h3>
                  <button onClick={() => {
                    // Pre-select therapist portal type and redirect to auth-app
                    if (typeof localStorage !== 'undefined') {
                      localStorage.setItem('selectedPortalType', 'massage_therapist');
                      localStorage.setItem('selected_membership_plan', 'pro');
                    }
                    onClose();
                    window.location.href = 'http://localhost:3001/signup';
                  }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-green-50 border border-green-200 transition-colors">
                    <UserPlus className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-700 font-medium">{dt.joinTherapist}</span>
                  </button>
                  <button onClick={() => {
                    // Pre-select massage place portal type and redirect to auth-app
                    if (typeof localStorage !== 'undefined') {
                      localStorage.setItem('selectedPortalType', 'massage_place');
                      localStorage.setItem('selected_membership_plan', 'pro');
                    }
                    onClose();
                    window.location.href = 'http://localhost:3001/signup';
                  }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors">
                    <Building className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-700 font-medium">{dt.joinMassageSpa}</span>
                  </button>
                  <button onClick={() => {
                    // Pre-select facial place portal type and redirect to auth-app
                    if (typeof localStorage !== 'undefined') {
                      localStorage.setItem('selectedPortalType', 'facial_place');
                      localStorage.setItem('selected_membership_plan', 'pro');
                    }
                    onClose();
                    window.location.href = 'http://localhost:3001/signup';
                  }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-purple-50 border border-purple-200 transition-colors">
                    <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    <span className="text-sm text-purple-700 font-medium">{dt.joinSkinClinic}</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-300">
                <div className="flex flex-col items-center gap-3 px-4 py-2">
                  <button 
                    onClick={() => handleItemClick(undefined, 'home')} 
                    className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
                  >
                    <span className="text-gray-800">Inda</span>
                    <span className="text-orange-500">Street</span>
                    <span className="text-gray-600 text-xs ml-1">2026</span>
                  </button>
                  <button onClick={() => handleItemClick(() => onNavigate?.('admin-login'))} className="text-xs text-orange-600 hover:text-orange-700 transition-colors font-bold">
                    {dt.admin}
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
