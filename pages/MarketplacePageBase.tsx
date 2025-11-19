import React, { useEffect, useState, useCallback } from 'react';
import { marketplaceService, type MarketplaceProduct } from '../lib/marketplaceService';
import { useLanguageContext } from '../context/LanguageContext';
import MarketplaceProductCard from '../components/MarketplaceProductCard';
import type { UserLocation } from '../types';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import FlagIcon from '../components/FlagIcon';
import { COUNTRIES, COUNTRY_DEFAULT_COORDS } from '../countries';

// Map of country codes to their flag colors (primary colors from flags)
const COUNTRY_FLAG_COLORS: Record<string, string[]> = {
  ID: ['#FF0000', '#FFFFFF'],
  MY: ['#CC0000', '#000080', '#FFD700'],
  SG: ['#FF0000', '#FFFFFF'],
  AU: ['#00008B', '#FF0000', '#FFFFFF'],
  GB: ['#012169', '#C8102E', '#FFFFFF'],
  US: ['#B22234', '#3C3B6E', '#FFFFFF'],
  FR: ['#0055A4', '#FFFFFF', '#EF4135'],
  DE: ['#000000', '#DD0000', '#FFCE00'],
  IT: ['#009246', '#FFFFFF', '#CE2B37'],
  ES: ['#C60B1E', '#FFC400'],
  JP: ['#BC002D', '#FFFFFF'],
  CN: ['#DE2910', '#FFDE00'],
  KR: ['#003478', '#CD2E3A', '#FFFFFF'],
  IN: ['#FF9933', '#FFFFFF', '#138808'],
  BR: ['#009B3A', '#FFDF00', '#002776'],
  MX: ['#006847', '#FFFFFF', '#CE1126'],
  CA: ['#FF0000', '#FFFFFF'],
  TH: ['#A51931', '#F4F5F8', '#2D2A4A'],
  PH: ['#0038A8', '#CE1126', '#FCD116', '#FFFFFF'],
  VN: ['#DA251D', '#FFCD00'],
  NL: ['#AE1C28', '#FFFFFF', '#21468B'],
  BE: ['#000000', '#FDDA24', '#EF3340'],
  CH: ['#FF0000', '#FFFFFF'],
  AT: ['#ED2939', '#FFFFFF'],
  SE: ['#006AA7', '#FECC00'],
  NO: ['#BA0C2F', '#00205B', '#FFFFFF'],
  DK: ['#C60C30', '#FFFFFF'],
  FI: ['#003580', '#FFFFFF'],
  PL: ['#FFFFFF', '#DC143C'],
  TR: ['#E30A17', '#FFFFFF'],
  GR: ['#0D5EAF', '#FFFFFF'],
  PT: ['#006600', '#FF0000', '#FFD700'],
  AR: ['#74ACDF', '#FFFFFF', '#F6B40E'],
  CL: ['#D52B1E', '#0039A6', '#FFFFFF'],
  CO: ['#FCD116', '#003893', '#CE1126'],
  PE: ['#D91023', '#FFFFFF'],
  ZA: ['#007A4D', '#FFB612', '#DE3831'],
  EG: ['#CE1126', '#FFFFFF', '#000000'],
  SA: ['#006C35', '#FFFFFF'],
  AE: ['#00732F', '#FF0000', '#000000', '#FFFFFF'],
  NZ: ['#00247D', '#CC142B', '#FFFFFF']
};

const getFlagColors = (countryCode: string): string[] => {
  return COUNTRY_FLAG_COLORS[countryCode] || ['#FF9933', '#FFFFFF', '#138808'];
};

type Props = {
  onBack: () => void;
  t: any;
  userLocation?: UserLocation | null;
  onNavigate?: (page: string) => void;
  onSetUserLocation?: (location: UserLocation) => void;
};

export const MarketplacePageBase: React.FC<Props> = ({ onBack, t, userLocation, onNavigate, onSetUserLocation }) => {
  const { language } = useLanguageContext();
  const [products, setProducts] = useState<(MarketplaceProduct & { seller?: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCountrySelectorOpen, setIsCountrySelectorOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));

  const currentCountryCode = userLocation?.countryCode || 'ID';
  const currentCountryName = userLocation?.country || 'Indonesia';
  const flagColors = getFlagColors(currentCountryCode);

  const handleSelectCountry = (code: string, name: string) => {
    if (!onSetUserLocation) {
      console.warn('onSetUserLocation not provided to MarketplacePage');
      return;
    }
    const prev = userLocation || undefined;
    const def = COUNTRY_DEFAULT_COORDS[code];
    const lat = def?.lat ?? prev?.lat ?? -6.2088;
    const lng = def?.lng ?? prev?.lng ?? 106.8456;
    const address = def ? `${def.city}, ${name}` : (prev?.address || name);
    onSetUserLocation({ address, lat, lng, countryCode: code, country: name });
    try {
      localStorage.setItem('app_user_location', JSON.stringify({ address, lat, lng, countryCode: code, country: name }));
    } catch {}
    setIsCountrySelectorOpen(false);
    setCountrySearch('');
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const countryCode = userLocation?.countryCode;
      const list = await marketplaceService.listProductsByCountry(countryCode);
      setProducts(list);
      setPage(1);
      setErrorMsg(null);
    } catch (error) {
      console.error('❌ MarketplacePage: Error loading products:', error);
      setErrorMsg('Cannot load marketplace products. Please check Appwrite Read permissions (should allow Anyone).');
    } finally {
      setLoading(false);
    }
  }, [userLocation?.countryCode, userLocation?.lat, userLocation?.lng, language]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      <style>{`
        @keyframes gradientFlow { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .gradient-header { background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%); }
        .hero-gradient { background: linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%); background-size: 200% 200%; animation: gradientFlow 10s ease infinite; }
        .fade-in { animation: fadeIn 0.6s ease-out forwards; }
      `}</style>
      
      <header className="bg-white p-4 sm:p-5 shadow-lg sticky top-0 z-[9997] border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
            <span className="text-black">Inda</span>
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Street</span>
            <span className="block text-xs sm:text-sm font-normal text-gray-500 mt-0.5">Marketplace {currentCountryName}</span>
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsCountrySelectorOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-orange-200 flex items-center justify-center bg-white hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 shadow-md hover:shadow-lg"
              title={userLocation?.country || userLocation?.countryCode || 'Choose country'}
              aria-label="Choose country"
            >
              <FlagIcon code={userLocation?.countryCode || 'ID'} className="text-xl sm:text-2xl" />
            </button>

            <button 
              onClick={() => setIsMenuOpen(true)} 
              title="Menu" 
              className="p-2.5 sm:p-3 hover:bg-orange-50 rounded-full transition-all duration-300 text-orange-500 border-2 border-transparent hover:border-orange-200 shadow-md hover:shadow-lg"
            >
              <BurgerMenuIcon className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </header>

      <AppDrawer 
        isOpen={isMenuOpen} 
        isHome={true} 
        onClose={() => setIsMenuOpen(false)} 
        t={t} 
        onNavigate={onNavigate || (() => {})}
      />

      {isCountrySelectorOpen && (
        <div className="fixed inset-0 z-[9998] flex items-start sm:items-center justify-center bg-black/60">
          <div className="w-full max-w-2xl bg-white rounded-none sm:rounded-2xl shadow-2xl overflow-hidden mt-0 sm:mt-8">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Choose your country</h2>
                  <p className="text-white/80 text-sm">See marketplace products in your selected country</p>
                </div>
                <button
                  onClick={() => setIsCountrySelectorOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="mt-3">
                <input
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-400 bg-white/95 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent"
                />
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {COUNTRIES
                  .filter(c => (c.name || '').toLowerCase().includes(countrySearch.toLowerCase()))
                  .map(c => (
                    <button
                      key={c.code}
                      onClick={() => handleSelectCountry(c.code, c.name)}
                      className={`flex items-center gap-3 border rounded-xl p-3 hover:border-orange-400 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400/50 ${
                        userLocation?.countryCode === c.code ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <FlagIcon code={c.code} className="text-2xl" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Indastreet Marketplace</div>
                        <div className="font-semibold text-gray-900">{c.name}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Premium Hero Section with 3D Effect */}
      <div className="relative w-full h-56 sm:h-72 md:h-96 overflow-hidden hero-gradient shadow-2xl rounded-lg sm:rounded-2xl sm:mx-6 lg:mx-8 sm:mt-6 mb-6 sm:mb-8">
        <div className="absolute inset-0 bg-[url('https://ik.imagekit.io/7grri5v7d/massage%20shops.png')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        
        {/* Decorative Gradient Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-orange-400/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-yellow-400/20 rounded-full blur-3xl"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-8 sm:pt-12 md:pt-16 px-4 sm:px-6 text-center z-10">
          <h2 className="fade-in text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-3 sm:mb-4" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <span className="block text-white drop-shadow-2xl mb-1 sm:mb-2">Massage</span>
            <span className="block text-amber-100 drop-shadow-2xl text-4xl sm:text-5xl md:text-7xl lg:text-8xl">Warehouse</span>
          </h2>
          
          <p className="fade-in text-white/90 text-sm sm:text-base md:text-lg max-w-2xl font-medium drop-shadow-lg px-4" style={{ animationDelay: '0.2s', opacity: 0 }}>
            Discover premium massage equipment, tables, oils & supplies from trusted sellers worldwide
          </p>
        </div>
        
        {/* Start Selling CTA - Bottom Right */}
        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <button
            onClick={() => onNavigate?.('sellerInfo')}
            className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 bg-white text-orange-600 rounded-xl font-semibold shadow-xl border border-white/50 hover:shadow-orange-200 hover:scale-105 transition-all text-xs sm:text-sm"
            title="Learn how to sell on IndaStreet Massage Warehouse"
          >
            <span>Start Selling</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M13.5 4.5L21 12l-7.5 7.5m6-7.5H3" /></svg>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-3 sm:p-6 lg:p-8">

        {showDebug && (
          <div className="mb-3 p-2 rounded border text-xs text-gray-700 bg-white">
            <div>Viewer country: <span className="font-mono">{userLocation?.countryCode || '(none)'}</span></div>
            <div>Viewer coords valid: <span className="font-mono">{(typeof userLocation?.lat === 'number' && !isNaN(userLocation.lat) && typeof userLocation?.lng === 'number' && !isNaN(userLocation.lng)) ? 'yes' : 'no'}</span></div>
            <div>Products loaded: <span className="font-mono">{products.length}</span></div>
            {errorMsg && <div className="text-red-600">Error: {errorMsg}</div>}
            <div className="mt-2 flex gap-2">
              <button onClick={loadProducts} className="inline-flex items-center px-2 py-1 rounded bg-gray-800 text-white">Reload</button>
              <button
                onClick={async () => {
                  const created = await marketplaceService.devCreateTestProduct({
                    countryCode: userLocation?.countryCode,
                    coords: (typeof userLocation?.lat === 'number' && typeof userLocation?.lng === 'number') ? { lat: userLocation.lat, lng: userLocation.lng } : undefined
                  });
                  if (created) {
                    await loadProducts();
                    alert('Test product created. It should now appear in the grid.');
                  } else {
                    alert('Failed to create test product. Ensure you are logged in and seller exists.');
                  }
                }}
                className="inline-flex items-center px-2 py-1 rounded bg-orange-600 text-white"
              >Create Test Product</button>
            </div>
          </div>
        )}

        <div className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-gray-600 leading-tight">
          Browse massage supplies from retail and wholesale suppliers that ship directly to your door.
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Loading amazing products...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <div className="text-red-600 text-lg font-semibold mb-4">{errorMsg}</div>
            <button 
              onClick={loadProducts} 
              className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all duration-300 shadow-lg"
            >
              Retry Loading
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-orange-50 border-2 border-gray-200 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to list products in {currentCountryName}!</p>
            <button 
              onClick={() => onNavigate?.('sellerInfo')} 
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold hover:shadow-xl transition-all duration-300"
            >
              Start Selling Now
            </button>
          </div>
        ) : (
          <>
            {/* Product Grid - Premium Layout (ID showcase) - temporarily disabled for stability */}

            {/* Real Products Grid (live data) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {products.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize).map((p) => {
                const hasValidCoords =
                  typeof userLocation?.lat === 'number' &&
                  typeof userLocation?.lng === 'number' &&
                  !isNaN(userLocation.lat) &&
                  !isNaN(userLocation.lng);

                return (
                  <MarketplaceProductCard
                    key={p.$id}
                    product={p}
                    viewerCountryCode={userLocation?.countryCode}
                    viewerCoords={hasValidCoords ? { lat: userLocation.lat, lng: userLocation.lng } : undefined}
                    onViewDetails={(productId) => {
                      try {
                        sessionStorage.setItem('marketplace_selected_product', productId);
                      } catch {}
                      onNavigate?.('productDetail');
                    }}
                    onView={(sellerId) => {
                      try {
                        sessionStorage.setItem('marketplace_selected_seller', sellerId);
                      } catch {}
                      onNavigate?.('sellerShop');
                    }}
                  />
                );
              })}
            </div>

            {/* Premium Pagination */}
            <div className="mt-10 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  page <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg'
                }`}
              >
                ← Previous
              </button>
              <div className="px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold shadow-lg">
                Page {page} of {pageCount}
              </div>
              <button
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  page >= pageCount
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-900 border-2 border-gray-200 hover:border-orange-400 hover:shadow-lg'
                }`}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MarketplacePageBase;
