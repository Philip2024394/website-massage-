import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';
import { therapistService, placeService } from '../lib/appwriteService';

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
  const [tab, setTab] = useState<'therapists' | 'places'>('therapists');
  const [loading, setLoading] = useState(true);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await account.get();
        const id = (me as any).$id || '';
        if (mounted) setCode(id);
        try {
          if (id) {
            const prof = await promoterService.getProfile(id);
            if (mounted) setIsActive(!!((prof as any).isActive ?? (prof as any).active));
          }
        } catch { if (mounted) setIsActive(true); }
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
        const liveTherapists = (ths || []).filter((t: any) => (t.isLive !== false) && ((t.availability || t.status) === 'Available'));
        const openPlaces = (pls || []).filter((p: any) => (p.isLive !== false) && isPlaceOpen(p));
        setTherapists(liveTherapists);
        setPlaces(openPlaces);
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

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 shadow-md sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 rounded-full hover:bg-gray-100">
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
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => setTab('therapists')} className={`px-4 py-2 rounded-lg text-sm ${tab==='therapists' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}>Therapists Live</button>
          <button onClick={() => setTab('places')} className={`px-4 py-2 rounded-lg text-sm ${tab==='places' ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'}`}>Massage Places Open</button>
        </div>

        {!code && (
          <div className="mb-4 text-sm text-gray-600">Sign in to attach your promoter code to bookings.</div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : tab === 'therapists' ? (
          therapists.length === 0 ? (
            <div className="text-gray-600">No therapists are live right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {therapists.map((t: any) => (
                <div key={t.$id || t.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <img src={t.profilePicture || t.mainImage || 'https://via.placeholder.com/64'} alt={t.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <div className="font-semibold text-gray-900">{t.name}</div>
                      <div className="text-xs text-emerald-600">Available</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => goToProvider('therapist', String(t.$id || t.id))} disabled={!isActive} className={`flex-1 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>View & Book</button>
                    <button onClick={() => {
                      try { (window as any).openBookingPopup?.(t.name, t.whatsappNumber, String(t.$id || t.id), 'therapist'); } catch {}
                    }} disabled={!isActive} className={`flex-1 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-black text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          places.length === 0 ? (
            <div className="text-gray-600">No massage places are open right now.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {places.map((p: any) => (
                <div key={p.$id || p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.profilePicture || p.mainImage || 'https://via.placeholder.com/64'} alt={p.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-xs text-emerald-600">Open now</div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => goToProvider('place', String(p.$id || p.id))} disabled={!isActive} className={`flex-1 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>View & Book</button>
                    <button onClick={() => {
                      try { (window as any).openBookingPopup?.(p.name, p.whatsappNumber, String(p.$id || p.id), 'place'); } catch {}
                    }} disabled={!isActive} className={`flex-1 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-black text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}>Book Now</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default PromoterLiveMenuPage;
