import React from 'react';
import { createPortal } from 'react-dom';
import { X as CloseIcon, Home, Heart, Briefcase, Info, BookOpen, Phone, MapPin, HelpCircle, Users, Building } from 'lucide-react';

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHome?: boolean;
  t?: any;
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

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  isHome = true,
  t,
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
                  <span className="text-sm text-gray-700 font-medium">Partners</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'joinIndastreet')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Join IndaStreet</span>
                </button>
                <button onClick={() => handleItemClick(onMassageJobsClick, 'massageJobs')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Briefcase className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Massage Jobs</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'how-it-works')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">How It Works</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'about-us')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Info className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">About Us</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'company-profile')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Company Profile</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'contact-us')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Phone className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Contact</span>
                </button>
                <button onClick={() => handleItemClick(undefined, 'blog')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Blog</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                <button onClick={() => handleItemClick(undefined, 'massage-bali')} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Massage in Bali</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('massageTypes'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Massage Directory</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('facialTypes'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <BookOpen className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Facial Directory</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('balinese-massage'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Balinese Massage</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('deep-tissue-massage'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">Deep Tissue Massage</span>
                </button>
                <button onClick={() => handleItemClick(() => onNavigate?.('faq'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                  <HelpCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 font-medium">FAQ</span>
                </button>
                <div className="space-y-2">
                  <button onClick={() => { window.open('http://localhost:3001', '_blank'); onClose(); }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Therapist Portal</span>
                  </button>
                  <button onClick={() => { window.open('http://localhost:3002', '_blank'); onClose(); }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Massage Spa Portal</span>
                  </button>
                  <button onClick={() => { window.open('http://localhost:3003', '_blank'); onClose(); }} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Heart className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Facial Spa Portal</span>
                  </button>
                  <button onClick={() => handleItemClick(() => onNavigate?.('website-management'))} className="flex items-center gap-3 w-full py-2 px-3 rounded-lg hover:bg-orange-50 transition-colors">
                    <Home className="w-5 h-5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Website Partners</span>
                  </button>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-300">
                <div className="flex justify-center gap-4 px-4 py-2">
                  <button onClick={() => { window.open('http://localhost:3004', '_blank'); onClose(); }} className="text-xs text-orange-600 hover:text-orange-700 transition-colors font-bold">
                    Admin
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
