// Facial Home Service page – clone of the facial home service experience.
// Same hero/header as facial providers; content directs users to find home-service facial therapists.
import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import HomeIcon from '../components/icons/HomeIcon';

interface FacialHomeServicePageProps {
  onNavigate?: (page: string) => void;
  t: any;
  language?: 'en' | 'id';
  onLanguageChange?: (lang: string) => void;
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
  therapists?: any[];
  places?: any[];
}

const FacialHomeServicePage: React.FC<FacialHomeServicePageProps> = ({
  onNavigate,
  t,
  language = 'id',
  onLanguageChange,
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
  onPrivacyClick,
  therapists = [],
  places = [],
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
      <UniversalHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Sticky hero – same style as facial providers */}
      <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
        <PageContainer className="px-3 sm:px-4 pt-4 sm:pt-5 pb-4">
          <div className="space-y-4 max-w-6xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Facial Home Service' : 'Facial Home Service'}
            </h1>
            <p className="text-sm text-gray-600">
              {language === 'id'
                ? 'Terapis facial ke rumah Anda'
                : 'Facial therapists to your location'}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => onNavigate?.('facial-places')}
                className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 text-sm"
              >
                {language === 'id' ? 'Tempat Facial' : 'Facial Places'}
              </button>
              <button
                onClick={() => onNavigate?.('home')}
                className="px-4 py-2 rounded-full bg-orange-500 text-white font-medium hover:bg-orange-600 text-sm"
              >
                {language === 'id' ? 'Beranda' : 'Home'}
              </button>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="px-3 sm:px-4 pt-8 pb-24">
        <div className="text-center py-12 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <HomeIcon className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'id' ? 'Terapis Home Service' : 'Home Service Therapists'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'id'
              ? 'Lihat terapis facial di beranda untuk layanan ke rumah Anda.'
              : 'View facial therapists on the home page for at-home service.'}
          </p>
          <button
            onClick={() => {
              try { sessionStorage.setItem('home_initial_tab', 'facials'); } catch (_) {}
              onNavigate?.('home');
            }}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold"
          >
            {language === 'id' ? 'Ke Halaman Utama' : 'Go to Home Page'}
          </button>
        </div>

        <div className="mt-12 mb-6 flex flex-col items-center gap-2">
          <div className="font-bold text-base">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">Street</span>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={() => onTermsClick?.()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">Terms</button>
            <span className="text-sm text-gray-400">•</span>
            <button onClick={() => onPrivacyClick?.()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">Privacy</button>
          </div>
        </div>
      </PageContainer>

      <AppDrawer
        isHome={false}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        t={t}
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
        onQRCodeClick={() => onNavigate?.('qr-code')}
        therapists={therapists}
        places={places}
      />
    </div>
  );
};

export default FacialHomeServicePage;
