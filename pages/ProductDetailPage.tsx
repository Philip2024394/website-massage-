import React, { useEffect, useState } from 'react';
import { marketplaceService, type MarketplaceProduct, type MarketplaceSeller } from '../lib/marketplaceService';
import { getCountryConfig } from '../lib/countryConfig';
import { convertCurrency, formatCurrency } from '../lib/currencyConversion';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';

type Props = {
  onBack: () => void;
  onNavigate?: (page: string) => void;
};

const ProductDetailPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [seller, setSeller] = useState<MarketplaceSeller | null>(null);
  const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; src: string } | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
  const coverImage = (product.image || '').trim() ? (product.image as string) : '';
  const allImages: string[] = [coverImage, ...thumbImages].filter(Boolean);
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
    <div className="h-screen bg-gray-50 overflow-y-scroll pb-32">
      {/* Marketplace Header (no country selector) */}
      <header className="bg-white p-4 sm:p-5 shadow-lg sticky top-0 z-[9997] border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              <span className="text-black">Inda</span>
              <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Street</span>
              <span className="block text-xs sm:text-sm font-normal text-gray-500 mt-0.5">Marketplace {viewerCountryCode}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => onNavigate?.('marketplace')} 
              title="Go to Marketplace" 
              className="p-2.5 sm:p-3 hover:bg-orange-50 rounded-full transition-all duration-300 text-orange-500 border-2 border-transparent hover:border-orange-200 shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
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
        onNavigate={onNavigate || (() => {})}
      />
      <main className="max-w-5xl mx-auto p-4 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl p-4 shadow-sm min-h-fit">
          {/* Media title row: product name left, sold count right */}
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-900 truncate pr-2">{product.name}</div>
            <div className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
              {(() => {
                const raw = (product as any)?.unitsSold ?? (product as any)?.soldCount ?? (product as any)?.sales ?? '0';
                const sold = parseInt(raw?.toString() || '0', 10);
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Sold: <strong>{isNaN(sold) ? 0 : sold}</strong></span>;
              })()}
            </div>
          </div>
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
            <div className="flex-1 relative">
              {/* Media count badge */}
              {(allImages.length > 0 || hasVideo) && (
                <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                  {allImages.length > 0 && (<span>{allImages.length} photos</span>)}
                  {hasVideo && (<span>{allImages.length>0 ? ' • ' : ''}1 video</span>)}
                </div>
              )}
              {/* Condition badge - bottom right */}
              {product.condition && (
                <div className="absolute bottom-2 right-2 z-10 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-md shadow-md border border-gray-200">
                  {product.condition}
                </div>
              )}
              {!activeMedia ? (
                <div className="w-full h-80 bg-gray-100 rounded-lg" />
              ) : activeMedia.type === 'image' ? (
                <button
                  onClick={() => {
                    const idx = allImages.findIndex(i => i === activeMedia.src);
                    setLightboxIndex(idx >= 0 ? idx : 0);
                    setIsLightboxOpen(true);
                  }}
                  className="block w-full h-80"
                  title="Click to enlarge"
                >
                  <img src={activeMedia.src} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                </button>
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

          {/* Description Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg text-gray-900">Description</h2>
              {product.condition && (
                <div className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 border border-gray-300 text-gray-700">
                  Condition: {product.condition}
                </div>
              )}
            </div>
            {product.description && (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {product.description.slice(0, 3000)}
              </p>
            )}
          </div>
        </section>
        <section className="bg-white rounded-xl p-4 shadow-sm">
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

      {/* Image Lightbox */}
      {isLightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
              className="px-3 py-1.5 rounded-md bg-white/90 hover:bg-white text-gray-900 font-semibold"
            >
              Close
            </button>
          </div>
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + allImages.length) % allImages.length); }}
              className="absolute left-4 md:left-8 text-white/90 hover:text-white text-3xl select-none"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}
          <div className="max-w-[90vw] max-h-[85vh] p-2" onClick={(e) => e.stopPropagation()}>
            <img src={allImages[lightboxIndex]} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
          </div>
          {allImages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % allImages.length); }}
              className="absolute right-4 md:right-8 text-white/90 hover:text-white text-3xl select-none"
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
