// Facial Places Directory – front-page directory; View button diverts to that place's profile.
import React, { useState, useEffect } from 'react';
import type { Place, UserLocation, Analytics } from '../types';
import FacialPlaceCard from '../components/FacialPlaceCard';
import PageContainer from '../components/layout/PageContainer';
import { AppDrawer } from '../components/AppDrawerClean';
import CityLocationDropdown from '../components/CityLocationDropdown';
import { findCityByCoordinates } from '../constants/indonesianCities';
import UniversalHeader from '../components/shared/UniversalHeader';
import { MOCK_FACIAL_PLACE } from '../constants/mockFacialPlace';

interface FacialPlacesDirectoryPageProps {
  facialPlaces: Place[];
  userLocation: UserLocation | null;
  selectedCity?: string;
  onSetUserLocation?: (location: UserLocation) => void;
  onSelectPlace: (place: Place) => void;
  onIncrementAnalytics?: (id: number | string, type: 'therapist' | 'place', metric: keyof Analytics) => void;
  onShowRegisterPrompt?: () => void;
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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const FacialPlacesDirectoryPage: React.FC<FacialPlacesDirectoryPageProps> = ({
  facialPlaces,
  userLocation,
  selectedCity,
  onSelectPlace,
  onIncrementAnalytics,
  onShowRegisterPrompt,
  onNavigate,
  t,
  language = 'en',
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
  therapists,
  places,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [localSelectedCity, setLocalSelectedCity] = useState<string>(selectedCity || 'all');

  useEffect(() => {
    if (selectedCity) setLocalSelectedCity(selectedCity);
  }, [selectedCity]);

  useEffect(() => {
    if (userLocation?.lat && userLocation?.lng && localSelectedCity === 'all') {
      const detectedCity = findCityByCoordinates(userLocation.lat, userLocation.lng);
      if (detectedCity) setLocalSelectedCity(detectedCity.name);
    }
  }, [userLocation, localSelectedCity]);

  const filteredFacialPlaces = (() => {
    if (userLocation?.lat && userLocation?.lng && localSelectedCity !== 'all') {
      return facialPlaces.filter(place => {
        let placeCoords = { lat: 0, lng: 0 };
        if (place.coordinates) {
          try {
            placeCoords = typeof place.coordinates === 'string' ? JSON.parse(place.coordinates) : place.coordinates;
          } catch { return false; }
        }
        if (!placeCoords.lat || !placeCoords.lng) return false;
        return calculateDistance(userLocation.lat, userLocation.lng, placeCoords.lat, placeCoords.lng) <= 15;
      });
    }
    if (localSelectedCity !== 'all') {
      const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      return facialPlaces.filter(place => {
        const placeLoc = place.location || (place as any).locationId || '';
        return norm(placeLoc) === norm(localSelectedCity) || place.location === localSelectedCity;
      });
    }
    return facialPlaces;
  })();

  // Always show at least the mock profile when no places (or include mock so directory always has 1 entry)
  const listToShow = filteredFacialPlaces.length > 0 ? filteredFacialPlaces : [MOCK_FACIAL_PLACE as Place];

  const handleCityChange = (city: string) => setLocalSelectedCity(city);

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
      {/* Universal Header */}
      <UniversalHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Sticky directory hero */}
      <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
        <PageContainer className="px-3 sm:px-4 pt-4 sm:pt-5 pb-4">
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {language === 'id' ? 'Direktori Tempat Facial' : 'Facial Places Directory'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {language === 'id' ? 'Pilih tempat lalu klik View untuk melihat profil' : 'Select a place and click View to see its profile'}
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <CityLocationDropdown
                selectedCity={localSelectedCity}
                onCityChange={handleCityChange}
                placeholder={localSelectedCity === 'all'
                  ? (language === 'id' ? '🇮🇩 Seluruh Indonesia' : '🇮🇩 All Indonesia')
                  : '📍 Select city'}
                includeAll={true}
                showLabel={false}
                className="w-full"
              />
            </div>
          </div>
        </PageContainer>
      </div>

      {/* Directory list */}
      <PageContainer className="px-3 sm:px-4 pt-4 pb-24">
        <div className="mb-4 text-center">
          <p className="text-gray-600 text-sm">
            {localSelectedCity === 'all'
              ? (language === 'id' ? `${listToShow.length} tempat facial` : `${listToShow.length} facial places`)
              : (language === 'id' ? `${listToShow.length} tempat di ${localSelectedCity}` : `${listToShow.length} places in ${localSelectedCity}`)}
          </p>
        </div>

        {listToShow.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {language === 'id' ? 'Tidak ada tempat facial. Coba kota lain.' : 'No facial places. Try another city.'}
            </p>
            <button
              onClick={() => setLocalSelectedCity('all')}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              {language === 'id' ? 'Lihat Semua Kota' : 'View All Cities'}
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-full overflow-hidden">
            {listToShow.map((place: Place) => (
              <FacialPlaceCard
                key={place.$id || place.id}
                place={place}
                onRate={() => {}}
                onSelectPlace={onSelectPlace}
                onNavigate={onNavigate}
                onIncrementAnalytics={(metric) => onIncrementAnalytics?.(place.$id || place.id || 0, 'place', metric)}
                onShowRegisterPrompt={onShowRegisterPrompt}
                isCustomerLoggedIn={false}
                t={t}
                userLocation={userLocation ?? undefined}
              />
            ))}
          </div>
        )}

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
        therapists={therapists || []}
        places={places || []}
      />
    </div>
  );
};

export default FacialPlacesDirectoryPage;
