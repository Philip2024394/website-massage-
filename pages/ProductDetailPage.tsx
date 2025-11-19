import React, { useEffect, useState } from 'react';
import { marketplaceService, type MarketplaceProduct, type MarketplaceSeller } from '../lib/marketplaceService';
import { getCountryConfig } from '../lib/countryConfig';
import { convertCurrency, formatCurrency } from '../lib/currencyConversion';

type Props = {
  onBack: () => void;
  onNavigate?: (page: string) => void;
};

const ProductDetailPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [seller, setSeller] = useState<MarketplaceSeller | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let id = '';
        try { id = sessionStorage.getItem('marketplace_selected_product') || ''; } catch {}
        if (!id) {
          try { id = localStorage.getItem('marketplace_selected_product') || ''; } catch {}
        }
        if (!id) throw new Error('No selected product');
        const p = await marketplaceService.getProductById(id);
        if (p) {
          setProduct(p);
          const s = await marketplaceService.getSellerById(p.sellerId);
          setSeller(s);
          const cover = (p.images && p.images[0]) || p.image || null;
          setActiveImage(cover);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const viewerCountryCode = (() => {
    try {
      const raw = localStorage.getItem('app_user_location');
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.countryCode || 'ID';
      }
    } catch {}
    return 'ID';
  })();
  const viewerConfig = getCountryConfig(viewerCountryCode);
  const sellerCurrency = (product?.currency || 'IDR').toUpperCase();
  const viewerCurrency = viewerConfig.currencyCode;
  const productPrice = product?.price || 0;
  const needsConversion = sellerCurrency !== viewerCurrency;
  const convertedPrice = needsConversion ? convertCurrency(productPrice, sellerCurrency, viewerCurrency) : productPrice;

  const paymentMethods: string[] = (() => {
    try {
      const raw = seller?.acceptedPayments;
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  })();

  const siteUrl = (() => {
    const raw = seller?.websiteUrl || '';
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  })();

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Loading…</div>;
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Product not found.</div>;

  const images: string[] = [
    ...(product.image ? [product.image] : []),
    ...((product.images || []).filter(Boolean))
  ].slice(0,5);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Back</button>
          <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{product.name}</h1>
          {seller?.tradingName && <div className="text-sm text-gray-600">{seller.tradingName}</div>}
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl p-4 shadow-sm">
          {activeImage ? (
            <img src={activeImage} alt={product.name} className="w-full h-80 object-cover rounded-lg" />
          ) : (
            <div className="w-full h-80 bg-gray-100 rounded-lg" />
          )}
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => setActiveImage(src)} className={`h-16 rounded overflow-hidden border ${activeImage===src?'border-orange-500':'border-gray-200'}`}>
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="bg-white rounded-xl p-4 shadow-sm">
          {product.description && (
            <div className="mb-3">
              <h2 className="font-semibold mb-1">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
          <div className="mb-4">
            <h2 className="font-semibold mb-2">Price</h2>
            <div className="text-2xl text-orange-600 font-bold mb-1">{formatCurrency(productPrice, sellerCurrency, product.countryCode)}</div>
            {needsConversion && (
              <div className="mb-1">
                <div className="text-sm text-gray-700">
                  Approx. in your currency: <span className="font-semibold">{formatCurrency(convertedPrice, viewerCurrency, viewerCountryCode)}</span>
                </div>
              </div>
            )}
            {needsConversion && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                <strong>Note:</strong> Final price will be charged in {sellerCurrency} ({formatCurrency(productPrice, sellerCurrency, product.countryCode)}). Converted price is approximate and may vary slightly day-to-day due to exchange rate fluctuations.
              </div>
            )}
          </div>
          {paymentMethods.length > 0 && (
            <div className="mb-3">
              <h2 className="font-semibold mb-1">Payments Accepted</h2>
              <div className="flex flex-wrap gap-2">
                {paymentMethods.map(m => (
                  <span key={m} className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">{m}</span>
                ))}
              </div>
            </div>
          )}
          {siteUrl && (
            <div className="mb-3">
              <h2 className="font-semibold mb-1">Website</h2>
              <a href={siteUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">{siteUrl}</a>
            </div>
          )}
          <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-1">Purchase Agreement</h3>
            <p className="text-xs text-gray-700">By proceeding to purchase, you agree to the seller's terms, delivery timelines, and refund policy if applicable. IndaStreet is a marketplace and is not the seller of record.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetailPage;
