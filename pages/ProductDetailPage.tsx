import React, { useEffect, useState } from 'react';
import { marketplaceService, type MarketplaceProduct, type MarketplaceSeller } from '../lib/marketplaceService';
import { getCountryConfig } from '../lib/countryConfig';
import { convertCurrency, formatCurrency } from '../lib/currencyConversion';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { COUNTRIES } from '../countries';

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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoModalSrc, setVideoModalSrc] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerCountry, setBuyerCountry] = useState('');
  const [buyerWhatsApp, setBuyerWhatsApp] = useState('');
  const [buyerCountryCode, setBuyerCountryCode] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let id = '';
        // 1) URL query param takes priority: ?id=... or ?productId=...
        try {
          const url = new URL(window.location.href);
          id = (url.searchParams.get('id') || url.searchParams.get('productId') || '').trim();
        } catch {}
        // 2) Fallback to sessionStorage/localStorage if not in URL
        if (!id) {
          try { id = sessionStorage.getItem('marketplace_selected_product') || ''; } catch {}
        }
        if (!id) {
          try { id = localStorage.getItem('marketplace_selected_product') || ''; } catch {}
        }
        if (!id) throw new Error('No selected product');
        console.log('📦 Loading product:', id);
        const p = await marketplaceService.getProductById(id);
        console.log('✅ Product loaded:', p);
        if (p) {
          setProduct(p);
          const s = await marketplaceService.getSellerById(p.sellerId);
          console.log('✅ Seller loaded:', s);
          setSeller(s);
          const cover = p.image || (p.images && p.images[0]) || '';
          if (cover) setActiveMedia({ type: 'image', src: cover });
        }
      } catch (error) {
        console.error('❌ Error loading product:', error);
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
      console.log('🔍 Payment methods debug:', { raw, seller: seller?.$id });
      const arr = raw ? JSON.parse(raw) : [];
      const result = Array.isArray(arr) ? arr : [];
      console.log('✅ Parsed payment methods:', result);
      return result;
    } catch (e) { 
      console.warn('❌ Failed to parse payment methods:', e);
      return []; 
    }
  })();

  const siteUrl = (() => {
    const raw = seller?.websiteUrl || '';
    if (!raw) return '';
    return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  })();

  const displayCondition = (() => {
    try {
      const raw = (product as any)?.condition;
      const s = (raw == null ? '' : String(raw)).trim();
      return s || 'New';
    } catch {
      return 'New';
    }
  })();

  const deliveryDaysNum = (() => {
    // Prefer seller-configured per-country days for global mode, fallback to product.deliveryDays, then default 6
    let daysFromSeller: number | null = null;
    try {
      const mode = String(seller?.salesMode || 'local').toLowerCase();
      if (mode === 'global' && seller?.shippingRates) {
        const rates: any = JSON.parse(seller.shippingRates || '{}');
        const viewerCode = (viewerCountryCode || '').toUpperCase();
        const productCode = (product?.countryCode || '').toUpperCase();
        const entry = (rates?.[viewerCode] !== undefined ? rates[viewerCode] : rates?.[productCode]);
        if (entry && typeof entry === 'object' && entry.days != null) {
          const n = parseInt(String(entry.days), 10);
          if (!isNaN(n)) daysFromSeller = n;
        }
      }
    } catch {}
    if (typeof daysFromSeller === 'number' && !isNaN(daysFromSeller)) {
      return Math.max(1, Math.min(60, Math.round(daysFromSeller)));
    }
    const raw = (product as any)?.deliveryDays;
    const days = parseInt((raw || '').toString(), 10);
    return Math.max(1, Math.min(60, isNaN(days) ? 6 : days));
  })();

  const shareData = () => {
    const url = (() => {
      try { return window.location.href; } catch { return ''; }
    })();
    const title = product?.name || 'Product';
    const text = `Check this out: ${title}`;
    return { url, title, text };
  };

  const tryNativeShare = async () => {
    const data = shareData();
    if ((navigator as any)?.share) {
      try { await (navigator as any).share({ title: data.title, text: data.text, url: data.url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(data.url); alert('Link copied to clipboard'); } catch { window.open(data.url, '_blank'); }
  };

  const shareLinks = {
    whatsapp: () => {
      const { url, text } = shareData();
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    },
    facebook: () => {
      const { url } = shareData();
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    },
    twitter: () => {
      const { url, text } = shareData();
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Loading…</div>;
  if (!product) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-600">Product not found.</div>;

  // Up to 4 additional thumbnails (excluding main cover)
  const thumbImages: string[] = ((product.images || []).filter(Boolean)).slice(0, 4);
  // Limit thumbnails to 3 per requirement
  const limitedThumbs: string[] = thumbImages.slice(0, 3);
  const coverImage = (product.image || '').trim() ? (product.image as string) : '';
  const allImages: string[] = [coverImage, ...limitedThumbs].filter(Boolean);
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

  const toYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return id || null;
      }
      if (u.hostname.includes('youtube.com')) {
        const id = u.searchParams.get('v');
        if (id) return id;
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'shorts' && parts[1]) return parts[1];
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
        t={(key: string) => key}
      />
      <main className="max-w-5xl mx-auto p-4 pb-24 grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="min-h-fit">
          {/* Media title row: product name left, seller & sold on right */}
          <div className="flex items-start justify-between mb-2">
            <div className="pr-2 min-w-0">
              <div className="font-semibold text-gray-900 truncate">{product.name}</div>
              <div className="text-xs text-gray-700 mt-1">🚚 {deliveryDaysNum} days delivery</div>
            </div>
            <div className="flex flex-col items-end gap-1 ml-2">
              {seller && (seller.tradingName || seller.storeName) && (
                <button
                  type="button"
                  onClick={() => { if (seller?.$id) { try { sessionStorage.setItem('marketplace_selected_seller', seller.$id); } catch {} onNavigate?.('sellerShop'); } }}
                  className="text-xs text-gray-700 inline-flex items-center gap-1 hover:underline"
                  aria-label="Open seller shop"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-600" aria-hidden="true"><path fill="currentColor" d="M21 7.5V6a1 1 0 0 0-1-1h-3.382a2 2 0 0 0-1.789-1.106h-4.658A2 2 0 0 0 8.382 5H5a1 1 0 0 0-1 1v1.5A2.5 2.5 0 0 0 6.5 10a2.5 2.5 0 0 0 2.4-1.8A2.5 2.5 0 0 0 11.5 10a2.5 2.5 0 0 0 2.6-1.8A2.5 2.5 0 0 0 16.5 10A2.5 2.5 0 0 0 19 7.5ZM5 11v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7h-1.379a3.5 3.5 0 0 1-6.242 0h-1.758a3.5 3.5 0 0 1-6.242 0Z"/></svg>
                  <span className="truncate">{seller.tradingName || seller.storeName}</span>
                </button>
              )}
              <div className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                {(() => {
                  const raw = (product as any)?.unitsSold ?? (product as any)?.soldCount ?? (product as any)?.sales ?? '0';
                  const sold = parseInt(raw?.toString() || '0', 10);
                  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">Sold: <strong>{isNaN(sold) ? 0 : sold}</strong></span>;
                })()}
              </div>
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
              {limitedThumbs.map((src, idx) => (
                <button
                  key={src || String(idx)}
                  onClick={() => setActiveMedia({ type: 'image', src })}
                  className={`h-16 w-20 rounded overflow-hidden border ${activeMedia?.type==='image' && activeMedia?.src===src ? 'border-orange-500' : 'border-gray-200'}`}
                >
                  <img src={src} className="w-full h-full object-cover" />
                </button>
              ))}
              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveMedia({ type: 'video', src: product.videoUrl as string })}
                  className={`h-16 w-20 rounded overflow-hidden border relative hover:opacity-90 transition-opacity ${activeMedia?.type==='video' ? 'border-orange-500' : 'border-gray-200'}`}
                  title="Play video"
                  aria-label="Play video"
                >
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/video%20player.png" 
                    alt="Video player" 
                    className="w-full h-full object-cover"
                  />
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
              {/* Bottom-right overlays: share icons only */}
              <div className="absolute bottom-2 right-2 z-10 flex flex-col items-end gap-2">
                <div className="bg-orange-600 text-white rounded-full shadow-md px-2 py-1 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={tryNativeShare}
                    title="Share"
                    className="p-1 rounded-full hover:bg-orange-500/80"
                    aria-label="Share"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.02-4.11A2.99 2.99 0 1 0 15 5c0 .24.04.47.09.7L8.07 9.81a3 3 0 1 0 0 4.38l7.02 4.11c-.05.22-.09.45-.09.69A3 3 0 1 0 18 16.08Z"/></svg>
                  </button>
                  <a
                    href={shareLinks.whatsapp()}
                    target="_blank"
                    rel="noreferrer"
                    title="Share on WhatsApp"
                    className="p-1 rounded-full hover:bg-orange-500/80"
                    aria-label="Share on WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-4 h-4 text-white"><path fill="currentColor" d="M127.9 24C69.8 24 22.4 71.4 22.4 129.5c0 18.6 4.7 36.6 13.7 52.6L24 232l51.3-12.4c15.5 8.5 33 13 51.6 13c58.1 0 105.5-47.4 105.5-105.5S186 24 127.9 24Zm0 190.7c-17.2 0-33.4-4.6-47.4-13.2l-3.4-2l-30.4 7.4l7.8-29.7l-2.2-3.5c-8.6-14-13.2-30.2-13.2-47.4c0-49.8 40.6-90.4 90.4-90.4s90.4 40.6 90.4 90.4s-40.6 90.4-90.4 90.4Zm52.2-67.2c-2.9-1.4-17.2-8.4-19.9-9.4c-2.7-1-4.7-1.4-6.7 1.4c-2 2.9-7.7 9.4-9.5 11.3c-1.7 2-3.5 2.2-6.4.8c-2.9-1.4-12.4-4.6-23.5-14.6c-8.7-7.8-14.6-17.4-16.3-20.3c-1.7-2.9-.2-4.5 1.3-5.9c1.4-1.4 2.9-3.5 4.3-5.3c1.4-1.7 2-2.9 3-4.9c1-2 .5-3.7-.2-5.2c-.7-1.4-6.7-16.1-9.2-22.1c-2.4-5.8-4.9-5-6.7-5c-1.7 0-3.7 0-5.6 0c-2 0-5.2.7-7.9 3.7c-2.7 3-10.4 10.1-10.4 24.6c0 14.5 10.7 28.5 12.2 30.5c1.4 2 21 32 50.9 44.9c7.1 3.1 12.6 5 16.9 6.4c7.1 2.3 13.5 1.9 18.6 1.1c5.7-.8 17.2-7 19.6-13.8c2.4-6.8 2.4-12.6 1.7-13.8c-.7-1.3-2.7-2-5.6-3.4Z"/></svg>
                  </a>
                  <a
                    href={shareLinks.facebook()}
                    target="_blank"
                    rel="noreferrer"
                    title="Share on Facebook"
                    className="p-1 rounded-full hover:bg-orange-500/80"
                    aria-label="Share on Facebook"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.5 9.9v-7H7.9V12h2.6V9.8c0-2.6 1.5-4 3.8-4c1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z"/></svg>
                  </a>
                  <a
                    href={shareLinks.twitter()}
                    target="_blank"
                    rel="noreferrer"
                    title="Share on X"
                    className="p-1 rounded-full hover:bg-orange-500/80"
                    aria-label="Share on X"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white"><path fill="currentColor" d="M18.146 2H21l-6.52 7.454L22.5 22h-6.273l-4.91-6.41L5.7 22H3l7.005-8.004L1.5 2h6.41l4.442 5.86L18.146 2Zm-2.2 18h1.65L7.12 4H5.36l10.586 16Z"/></svg>
                  </a>
                  <button
                    type="button"
                    onClick={() => { const { url } = shareData(); navigator.clipboard?.writeText(url); alert('Link copied'); }}
                    title="Copy link"
                    className="p-1 rounded-full hover:bg-orange-500/80"
                    aria-label="Copy link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 text-white"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/></svg>
                  </button>
                </div>
              </div>
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
              ) : activeMedia.type === 'video' ? (
                <div className="w-full h-80 bg-black rounded-lg overflow-hidden">
                  {toYouTubeEmbed(activeMedia.src) || activeMedia.src.includes('youtube.com') || activeMedia.src.includes('youtu.be') ? (
                    <iframe
                      className="w-full h-full"
                      src={toYouTubeEmbed(activeMedia.src) || activeMedia.src}
                      title="Product video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video className="w-full h-full" src={activeMedia.src} controls />
                  )}
                </div>
              ) : (
                <div className="w-full h-80 bg-gray-100 rounded-lg" />
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              {/* Seller profile block (replaces Description header) */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                  {seller?.profileImage ? (
                    <img src={seller.profileImage} alt={seller.tradingName || seller.storeName || 'Seller'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">
                      {((seller?.tradingName || seller?.storeName || 'S').slice(0,1) || 'S').toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => { if (seller?.$id) { try { sessionStorage.setItem('marketplace_selected_seller', seller.$id); } catch {} onNavigate?.('sellerShop'); } }}
                    className="font-semibold text-gray-900 truncate text-left hover:underline"
                    aria-label="Open seller shop"
                  >
                    {seller?.tradingName || seller?.storeName || 'Seller'}
                  </button>
                  <div className="text-xs text-gray-600 truncate">
                    {(() => {
                      const cc = (seller?.countryCode || product.countryCode || '').toUpperCase();
                      const country = COUNTRIES.find(c => c.code === cc)?.name || cc || '';
                      const parts: string[] = [];
                      const city = (seller as any)?.city;
                      const address = (seller as any)?.address;
                      if (city && typeof city === 'string') parts.push(city);
                      if (address && typeof address === 'string') parts.push(address);
                      if (country) parts.push(country);
                      return parts.length ? parts.join(', ') : (country || '');
                    })()}
                  </div>
                </div>
              </div>
              <span className="shrink-0 whitespace-nowrap text-gray-700 inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3.5 h-3.5 text-gray-600" aria-hidden="true"><path fill="currentColor" d="M20.59 13.41L12 22l-8.59-8.59A2 2 0 0 1 3 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.41.59l7.18 7.18a2 2 0 0 1 0 2.82ZM7 7a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z"/></svg>
                <span><strong>{displayCondition}</strong></span>
              </span>
            </div>
            
            {/* Description Section */}
            <div className="mt-4 pt-4 border-t border-gray-200 relative">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Description</h3>
                {product?.productColors && product.productColors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Colors:</span>
                    <div className="flex gap-1.5">
                      {product.productColors.map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Background image in lower right corner */}
              <div 
                className="absolute -bottom-4 -right-4 w-40 h-40 bg-no-repeat bg-contain bg-right-bottom opacity-30 pointer-events-none z-0"
                style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20picture.png)' }}
              />
              
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed relative z-10">
                {(() => {
                  // Always show placeholder for design preview
                  const placeholderText = 'This premium product features exceptional quality and craftsmanship designed to meet your needs. Built with durable materials and attention to detail, it offers outstanding performance and reliability. Whether for professional or personal use, this product delivers consistent results and long-lasting value. The ergonomic design ensures comfort during extended use, while the modern aesthetics complement any environment. Each unit undergoes rigorous quality testing to guarantee satisfaction and peace of mind with your purchase.';
                  console.log('📝 Product description (ignored for preview):', product?.description);
                  console.log('📝 Showing placeholder text:', placeholderText.length, 'characters');
                  return placeholderText;
                })()}
              </p>
            </div>
            
            {/* Product Details Section */}
            {(() => {
              try {
                const details = (product as any).productDetails ? JSON.parse((product as any).productDetails) : {};
                const entries = Object.entries(details).filter(([_, value]) => value && String(value).trim());
                
                // Icon mapping for each detail type
                const getIcon = (key: string) => {
                  const icons: Record<string, string> = {
                    'Material': '🧵',
                    'Size': '📏',
                    'Weight': '⚖️',
                    'Color': '🎨',
                    'Warranty': '🛡️',
                    'Brand': '🏷️',
                    'Batteries': '🔋',
                    'Electric': '⚡',
                    'Foam Padding': '🛏️',
                    'Adjustable': '🔧',
                    'Fold Up': '📦',
                    'Height Adjustable': '📐'
                  };
                  return icons[key] || '✓';
                };
                
                // Design preview: Show placeholder if no details
                if (entries.length === 0) {
                  const placeholderDetails = [
                    ['Material', 'Premium Leather'],
                    ['Size', 'Large (120cm x 80cm)'],
                    ['Weight', '15kg'],
                    ['Color', 'Black'],
                    ['Warranty', '2 Years'],
                    ['Brand', 'IndastreetPro']
                  ];
                  return (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {placeholderDetails.map(([key, value]) => (
                          <div key={key} className="flex items-start gap-2 text-sm">
                            <span className="text-lg leading-none">{getIcon(key)}</span>
                            <span className="font-medium text-gray-700 min-w-[120px]">{key}:</span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {entries.map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2 text-sm">
                          <span className="text-lg leading-none">{getIcon(key)}</span>
                          <span className="font-medium text-gray-700 min-w-[120px]">{key}:</span>
                          <span className="text-gray-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } catch {
                return null;
              }
            })()}
          </div>
        </section>
        <section className="min-h-fit">
          <div className="mb-4">
            <div className="border-t border-gray-300 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold">Total Price</h2>
                <span className="text-sm text-gray-600">Available {product?.stockLevel || 0}</span>
              </div>
              <div className="text-2xl text-orange-600 font-bold mb-1">
                {formatCurrency(productPrice, sellerCurrency, product.countryCode)}
                <span className="text-base text-gray-600 ml-2">/ {product?.priceUnit || 'Each'}</span>
                {product?.quantity && <span className="text-base text-gray-600 ml-2">for {product.quantity} pcs</span>}
              </div>
              <div className="text-xs text-gray-600 mb-1">
                Delivery Cost Included • {(product as any)?.importDuty === 'seller' ? 'Seller Pays Import Duty' : 'Buyer Pays Import Duty'}
              </div>
              <div className="border-b border-gray-300 mb-4 mt-4"></div>
            </div>
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 mr-3">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Buyer Accepts Payment</h3>
                  <div className="text-xs text-gray-600 mb-2">Trade Safe With Payment Providers</div>
                  <div className="text-xs text-gray-700 leading-relaxed">
                    {(paymentMethods.length > 0 ? paymentMethods : ['Stripe', 'PayPal', 'Escrow', 'Bank Transfer']).join(' • ')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate?.('safeTradeInfo')}
                  className="hover:opacity-80 transition-opacity flex-shrink-0"
                  aria-label="Learn about Indastreet Safe Trade"
                >
                  <img 
                    src="https://ik.imagekit.io/7grri5v7d/payment.png" 
                    alt="Payment info" 
                    className="w-16 h-16 object-contain"
                  />
                </button>
              </div>
            </div>
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
        </section>

        {/* Contact Seller Buttons - Always show for design preview */}
        <section className="mt-6">
          {seller?.priceRequestType && (
            <div className="mb-3 text-center">
              <span className="inline-block px-4 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-sm font-medium text-orange-700">
                {seller.priceRequestType} Prices on Request
              </span>
            </div>
          )}
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 text-lg">Contact Us</h3>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <span className="text-yellow-500">⭐</span>
              <span className="text-xs">Leave Review</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">Order Today Or Request Additional Information</p>
          
          {/* Terms Agreement Checkbox */}
          <div className="mb-4 flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="terms-agreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="terms-agreement" className="text-sm text-gray-700">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => onNavigate?.('termsOfPurchase')}
                className="text-orange-600 hover:text-orange-700 underline font-medium"
              >
                Terms Of Purchase
              </button>
              {' '}and understand that Indastreet is a directory platform only.
            </label>
          </div>

          <div className="flex gap-3 mb-4">
            {(seller?.ownerEmail || true) && (
              <a
                href={agreedToTerms && seller?.ownerEmail ? `mailto:${seller.ownerEmail}?subject=Inquiry about ${encodeURIComponent(product?.name || 'Product')}&body=Hi,%0D%0A%0D%0AI would like to enquire more information regarding this product:%0D%0A${encodeURIComponent(window.location.href)}%0D%0A%0D%0AThank you` : '#'}
                onClick={async (e) => { 
                  if (!agreedToTerms) {
                    e.preventDefault();
                    alert('Please agree to Terms Of Purchase before contacting the seller');
                    return;
                  }
                  if (!seller?.ownerEmail) { 
                    e.preventDefault(); 
                    alert('Configure email in Seller Dashboard');
                    return;
                  }
                  // Increment sold counter
                  if (product?.$id) {
                    try {
                      await marketplaceService.incrementSoldCounter(product.$id);
                      // Update local state to reflect change immediately
                      const updated = await marketplaceService.getProductById(product.$id);
                      if (updated) setProduct(updated);
                    } catch (e) {
                      console.error('Failed to increment sold counter:', e);
                    }
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  agreedToTerms 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Email Seller
              </a>
            )}
            {(seller?.whatsapp || true) && (
              <button
                type="button"
                onClick={async () => {
                  if (!agreedToTerms) {
                    alert('Please agree to Terms Of Purchase before contacting the seller');
                    return;
                  }
                  if (!seller?.whatsapp) {
                    alert('Configure WhatsApp number in Seller Dashboard');
                    return;
                  }
                  // Increment sold counter
                  if (product?.$id) {
                    try {
                      await marketplaceService.incrementSoldCounter(product.$id);
                      // Update local state to reflect change immediately
                      const updated = await marketplaceService.getProductById(product.$id);
                      if (updated) setProduct(updated);
                    } catch (e) {
                      console.error('Failed to increment sold counter:', e);
                    }
                  }
                  setIsWhatsAppModalOpen(true);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  agreedToTerms 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>
            )}
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

      {/* Video Modal */}
      {isVideoModalOpen && videoModalSrc && (
        <div
          className="fixed inset-0 z-[10001] bg-black/80 flex items-center justify-center"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => { e.stopPropagation(); setIsVideoModalOpen(false); setVideoModalSrc(null); }}
              className="px-3 py-1.5 rounded-md bg-white/90 hover:bg-white text-gray-900 font-semibold"
            >
              Close
            </button>
          </div>
          <div className="w-[90vw] max-w-3xl aspect-video bg-black rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {toYouTubeEmbed(videoModalSrc) || videoModalSrc.includes('youtube.com') || videoModalSrc.includes('youtu.be') ? (
              <iframe
                className="w-full h-full"
                src={toYouTubeEmbed(videoModalSrc) || videoModalSrc}
                title="Product video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video className="w-full h-full" src={videoModalSrc} controls autoPlay />
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Leave a Review</h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <span className={star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review (Optional)
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Share your experience with this product..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsReviewModalOpen(false);
                  setReviewRating(0);
                  setReviewComment('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reviewRating === 0) {
                    alert('Please select a rating');
                    return;
                  }
                  // TODO: Save review to database using reviewService
                  alert('✅ Thank you for your review!');
                  setIsReviewModalOpen(false);
                  setReviewRating(0);
                  setReviewComment('');
                }}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Contact Modal */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={() => setIsWhatsAppModalOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-orange-600">Contact via WhatsApp</h2>
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-gray-600 mb-3">Please provide your details to contact the seller via WhatsApp.</p>
            
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your Country *</label>
                <select
                  value={buyerCountry}
                  onChange={(e) => setBuyerCountry(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Country Code *</label>
                <input
                  type="text"
                  value={buyerCountryCode}
                  onChange={(e) => setBuyerCountryCode(e.target.value)}
                  placeholder="+1"
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Your WhatsApp Number *</label>
                <input
                  type="tel"
                  value={buyerWhatsApp}
                  onChange={(e) => setBuyerWhatsApp(e.target.value)}
                  placeholder="1234567890"
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!buyerName.trim() || !buyerCountry || !buyerCountryCode.trim() || !buyerWhatsApp.trim()) {
                    alert('Please fill in all fields');
                    return;
                  }
                  const sellerWhatsApp = (seller?.whatsapp || '').replace(/[^0-9+]/g, '');
                  const productUrl = window.location.href;
                  const message = `Hi, I would like to enquire more information regarding this product:\\n\\n${productUrl}\\n\\nMy details:\\nName: ${buyerName}\\nCountry: ${buyerCountry}\\nWhatsApp: ${buyerCountryCode}${buyerWhatsApp}`;
                  const whatsappUrl = `https://wa.me/${sellerWhatsApp}?text=${encodeURIComponent(message)}`;
                  window.open(whatsappUrl, '_blank');
                  setIsWhatsAppModalOpen(false);
                  setBuyerName('');
                  setBuyerCountry('');
                  setBuyerCountryCode('');
                  setBuyerWhatsApp('');
                }}
                className="flex-1 px-3 py-1.5 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
