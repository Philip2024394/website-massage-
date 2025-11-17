import React, { useEffect, useState, useMemo } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';
import { therapistService, placeService } from '../lib/appwriteService';
import TherapistCard from '../components/TherapistCard';
import MassagePlaceCard from '../components/MassagePlaceCard';

function isPlaceOpen(place: any): boolean {
  try {
    const open = (place.openingTime || '09:00').split(':');
    const close = (place.closingTime || '21:00').split(':');
    const now = new Date();
    const openMin = parseInt(open[0], 10) * 60 + parseInt(open[1], 10);
    const closeMin = parseInt(close[0], 10) * 60 + parseInt(close[1], 10);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    if (closeMin > openMin) return nowMin >= openMin && nowMin <= closeMin;
    // overnight window (rare for spas): treat as open if after open or before close
    return nowMin >= openMin || nowMin <= closeMin;
  } catch {
    return false;
  }
}

const PromoterLiveMenuPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'therapists' | 'places'>('therapists');
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedRatingItem, setSelectedRatingItem] = useState<{ item: any; type: 'therapist' | 'place' } | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await account.get();
        const id = (me as any).$id || '';
        try {
          if (id) {
            const prof = await promoterService.getProfile(id);
            const agent = (prof as any).agentCode || id;
            if (mounted) {
              setIsActive(!!((prof as any).isActive ?? (prof as any).active));
              setCode(agent);
            }
          }
        } catch { if (mounted) { setIsActive(true); setCode(id); } }
      } catch { if (mounted) { setCode(''); setIsActive(true); } }
      // Persist code for booking attribution only if active
      try {
        if (code && isActive) {
          const mod = await import('../lib/affiliateAttribution');
          if (mod && typeof mod.setCode === 'function') mod.setCode(code);
        }
      } catch {}
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [ths, pls] = await Promise.all([
          therapistService.getAll(),
          placeService.getAll()
        ]);
        if (!mounted) return;
        // Keep all live therapists (available + busy + others) and all live places (open + closed)
        const liveTherapists = (ths || []).filter((t: any) => t && (t.isLive !== false));
        const livePlaces = (pls || []).filter((p: any) => p && (p.isLive !== false));
        setTherapists(liveTherapists);
        setPlaces(livePlaces);
      } catch {
        if (mounted) { setTherapists([]); setPlaces([]); }
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const goToProvider = (providerType: 'therapist' | 'place', providerId: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('agent', code);
      url.searchParams.set('provider', `${providerType}-${providerId}`);
      // optional platform tag for analytics
      url.searchParams.set('platform', 'copy');
      window.location.href = url.toString();
    } catch {}
  };

  // Sorting logic
  const sortedTherapists = useMemo(() => {
    const rank = (t: any) => {
      const status = String((t.availability || t.status || '')).toLowerCase();
      if (status.includes('available')) return 0;
      if (status.includes('busy')) return 1;
      return 2; // offline or other
    };
    return [...therapists].sort((a,b) => rank(a) - rank(b));
  }, [therapists]);

  const sortedPlaces = useMemo(() => {
    return [...places].sort((a,b) => {
      const aOpen = isPlaceOpen(a) ? 0 : 1;
      const bOpen = isPlaceOpen(b) ? 0 : 1;
      if (aOpen !== bOpen) return aOpen - bOpen;
      return String(a.name).localeCompare(String(b.name));
    });
  }, [places]);

  // Handlers needed by card components (simplified for promoter live menu context)
  const handleRate = (item: any, type: 'therapist' | 'place') => {
    setSelectedRatingItem({ item, type });
    setShowRatingModal(true); // (Rating modal UI not yet implemented here)
  };
  const handleCloseRating = () => { setShowRatingModal(false); setSelectedRatingItem(null); };
  const handleIncrementAnalytics = (_id: any, _type: 'therapist' | 'place', _metric: any) => { /* no-op for now */ };
  const handleNavigate = (page: string) => { try { onNavigate?.(page); } catch {} };
  const isCustomerLoggedIn = false; // promoter view treated as guest viewer

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 shadow-md sticky top-0 z-20" data-page-header="true">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 rounded-full hover:bg-gray-100 force-show-menu">
            <BurgerMenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <AppDrawer isOpen={isMenuOpen} isHome={true} onClose={() => setIsMenuOpen(false)} t={t} onNavigate={onNavigate} promoterMode={true} />

      <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24">
        {!isActive && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">
            Your promoter account is deactivated. Booking links are disabled.
          </div>
        )}
        {/* Hero toggle identical style to HomePage */}
        <div className="flex bg-gray-200 rounded-full p-1 mb-6">
          <button 
            onClick={() => setActiveTab('therapists')} 
            className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'therapists' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
          >
            Home Service
          </button>
          <button 
            onClick={() => setActiveTab('places')} 
            className={`w-1/2 py-2 px-4 rounded-full flex items-center justify-center gap-2 text-sm font-semibold transition-colors duration-300 ${activeTab === 'places' ? 'bg-orange-500 text-white shadow' : 'text-gray-600'}`}
          >
            Massage Places
          </button>
        </div>

        {!code && (
          <div className="mb-4 text-sm text-gray-600">Sign in to attach your promotor ID to bookings.</div>
        )}
        {code && (
          <div className="mb-4 text-xs bg-orange-50 border border-orange-200 text-orange-700 rounded-md px-3 py-2 flex items-center justify-between">
            <span>Promotor ID active: <span className="font-mono font-semibold">{code}</span></span>
            <button
              onClick={() => {
                try {
                  navigator.clipboard.writeText(`${window.location.origin}/live-menu?aff=${code}`);
                } catch {}
              }}
              className="text-[11px] px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
            >Copy Link</button>
          </div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : activeTab === 'therapists' ? (
          sortedTherapists.length === 0 ? (
            <div className="text-gray-600">No therapists are live right now.</div>
          ) : (
            <div className="space-y-4">
              {sortedTherapists.map((therapist: any, index: number) => (
                <TherapistCard
                  key={therapist.$id || `therapist-${therapist.id}-${index}`}
                  therapist={therapist}
                  userLocation={null}
                  onRate={() => handleRate(therapist, 'therapist')}
                  onBook={() => goToProvider('therapist', String(therapist.$id || therapist.id))}
                  onQuickBookWithChat={() => {
                    try { (window as any).openBookingPopup?.(therapist.name, therapist.whatsappNumber, String(therapist.$id || therapist.id), 'therapist'); } catch {}
                  }}
                  onIncrementAnalytics={(metric) => handleIncrementAnalytics(therapist.$id || therapist.id, 'therapist', metric)}
                  onShowRegisterPrompt={() => {}}
                  isCustomerLoggedIn={isCustomerLoggedIn}
                  onNavigate={handleNavigate}
                  activeDiscount={therapist.discountPercentage ? { percentage: therapist.discountPercentage, expiresAt: new Date(therapist.discountEndTime || Date.now()+3600000) } : null}
                  t={{ home: { therapistCard: {} } }}
                />
              ))}
            </div>
          )
        ) : (
          sortedPlaces.length === 0 ? (
            <div className="text-gray-600">No massage places are open right now.</div>
          ) : (
            <div className="space-y-4">
              {sortedPlaces.map((place: any, index: number) => (
                <MassagePlaceCard
                  key={place.$id || `place-${place.id}-${index}`}
                  place={place}
                  onRate={() => handleRate(place, 'place')}
                  onSelectPlace={() => goToProvider('place', String(place.$id || place.id))}
                  onNavigate={handleNavigate}
                  onIncrementAnalytics={(metric) => handleIncrementAnalytics(place.$id || place.id, 'place', metric)}
                  onShowRegisterPrompt={() => {}}
                  isCustomerLoggedIn={isCustomerLoggedIn}
                  activeDiscount={place.discountPercentage ? { percentage: place.discountPercentage, expiresAt: new Date(place.discountEndTime || Date.now()+3600000) } : null}
                  t={{}}
                  userLocation={null}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default PromoterLiveMenuPage;
