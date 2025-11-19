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
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
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
          const cover = p.image || (p.images && p.images[0]) || '';
          if (cover) setActiveMedia({ type: 'image', src: cover });
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

  // Up to 4 additional thumbnails (excluding main cover)
  const thumbImages: string[] = ((product.images || []).filter(Boolean)).slice(0, 4);
  const hasVideo = typeof product.videoUrl === 'string' && product.videoUrl.trim().length > 0;

  const toYouTubeEmbed = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}`;
        // handle share links like /shorts/
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'shorts' && parts[1]) return `https://www.youtube.com/embed/${parts[1]}`;
      }
    } catch {}
    return null;
  };

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
          <div className="flex gap-3">
            {/* Left thumbnails column */}
            <div className="flex flex-col gap-2 w-20">
              {/* Main cover thumbnail if exists */}
              {(product.image || '').trim() && (
                <button
                  onClick={() => setActiveMedia({ type: 'image', src: product.image as string })}
                  className={`h-16 w-20 rounded overflow-hidden border ${activeMedia?.type==='image' && activeMedia?.src===product.image ? 'border-orange-500' : 'border-gray-200'}`}
                >
                  <img src={product.image as string} className="w-full h-full object-cover" />
                </button>
              )}
              {thumbImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveMedia({ type: 'image', src })}
                  className={`h-16 w-20 rounded overflow-hidden border ${activeMedia?.type==='image' && activeMedia?.src===src ? 'border-orange-500' : 'border-gray-200'}`}
                >
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
              {hasVideo && (
                <button
                  onClick={() => {
                    const embed = toYouTubeEmbed(product.videoUrl as string);
                    if (embed) setActiveMedia({ type: 'video', src: embed });
                    else setActiveMedia({ type: 'video', src: product.videoUrl as string });
                  }}
                  className={`h-16 w-20 rounded overflow-hidden border ${activeMedia?.type==='video' ? 'border-orange-500' : 'border-gray-200'} relative bg-black text-white`}
                  title="Play video"
                >
                  {/* Simple video thumbnail with play icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-red-600"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                </button>
              )}
            </div>

            {/* Main media viewer */}
            <div className="flex-1">
              {!activeMedia ? (
                <div className="w-full h-80 bg-gray-100 rounded-lg" />
              ) : activeMedia.type === 'image' ? (
                <img src={activeMedia.src} alt={product.name} className="w-full h-80 object-cover rounded-lg" />
              ) : (
                <div className="w-full h-80 rounded-lg overflow-hidden bg-black">
                  {toYouTubeEmbed(activeMedia.src) || activeMedia.src.includes('youtube.com') || activeMedia.src.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full"
                      src={activeMedia.src}
                      title="Product video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video className="w-full h-full" src={activeMedia.src} controls />
                  )}
                </div>
              )}
            </div>
          </div>
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
