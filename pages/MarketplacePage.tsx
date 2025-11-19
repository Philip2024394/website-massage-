import React, { useEffect, useState } from 'react';
import { marketplaceService, type MarketplaceProduct } from '../lib/marketplaceService';
import { useLanguageContext } from '../context/LanguageContext';
import MarketplaceProductCard from '../components/MarketplaceProductCard';
import type { UserLocation } from '../types';

type Props = {
  onBack: () => void;
  t: any;
  userLocation?: UserLocation | null;
  onNavigate?: (page: string) => void;
};

const MarketplacePage: React.FC<Props> = ({ onBack, t, userLocation }) => {
  const { language } = useLanguageContext();
  const [products, setProducts] = useState<(MarketplaceProduct & { seller?: any })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const countryCode = userLocation?.countryCode;
        const list = await marketplaceService.listProductsByCountry(countryCode);
        setProducts(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [userLocation?.countryCode, language]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Back</button>
          <h1 className="text-xl font-bold text-gray-900">Marketplace</h1>
          <div className="ml-auto text-sm text-gray-500">{userLocation?.country || userLocation?.countryCode || ''}</div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500">No products yet in your country.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map(p => (
              <MarketplaceProductCard key={p.$id} product={p} viewerCountryCode={userLocation?.countryCode} onView={() => { /* future: navigate to product detail */ }} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketplacePage;
