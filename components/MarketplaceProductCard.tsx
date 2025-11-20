import React from 'react';
import { formatAmountForUser } from '../utils/currency';
import type { MarketplaceProduct, MarketplaceSeller } from '../lib/marketplaceService';

type Props = {
  product: MarketplaceProduct & { seller?: MarketplaceSeller };
  viewerCountryCode?: string;
  viewerCoords?: { lat?: number; lng?: number };
  onView?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
};

const MarketplaceProductCard: React.FC<Props> = ({ product, viewerCountryCode, onView, onViewDetails }) => {
  const priceLabel = formatAmountForUser(product.price || 0, viewerCountryCode);
  
  // Promo percent from schema (string or number)
  const promoPercent = (() => {
    const raw = (product as any).promoPercent;
    const n = typeof raw === 'number' ? raw : parseInt((raw || '0').toString(), 10);
    return Math.max(0, Math.min(90, isNaN(n) ? 0 : n));
  })();
  const hasPromo = promoPercent > 0;
  
  // Star rating (default to 4.5 if not set)
  const rating = product.rating || 4.5;
  
  // Delivery days from schema (string), fallback 6
  const deliveryDays = (() => {
    const raw = (product as any).deliveryDays;
    const n = parseInt((raw || '').toString(), 10);
    return isNaN(n) ? 6 : n;
  })();

  const sellerName = (product as any)?.seller?.tradingName || (product as any)?.seller?.storeName || '';

  const goToDetails = () => {
    try { sessionStorage.setItem('marketplace_selected_product', product.$id); } catch {}
    if (onViewDetails) return onViewDetails(product.$id);
    return onView?.(product.$id);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow shadow-[-4px_0_8px_-2px_rgba(249,115,22,0.3)] w-full max-w-full">
      {/* Landscape Layout: Image Left, Content Right */}
      <div className="flex h-32 sm:h-36 w-full">
        {/* Left: Product Image */}
        <button type="button" onClick={goToDetails} className="flex-shrink-0 w-28 sm:w-32 relative">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl" loading="lazy"/>
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-xl" />
          )}
          {/* Price Badge - Lower Right on Image */}
          <div className="absolute bottom-2 right-2 bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
            {priceLabel}
          </div>
        </button>
        
        {/* Right: Product Info */}
        <div className="flex-1 p-3 flex flex-col">
          {/* Top Row: Product Name and Star Rating */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <button
              type="button"
              onClick={goToDetails}
              className="font-semibold text-base text-gray-900 line-clamp-1 text-left hover:underline flex-1"
              aria-label={`View details for ${product.name}`}
            >
              {product.name}
            </button>
            {/* Star Rating - Simple Style */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-yellow-500 text-sm">★</span>
              <span className="text-gray-900 text-xs font-semibold">{rating.toFixed(1)}</span>
            </div>
          </div>
          
          {/* Description - 2 lines */}
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {product.description || "Premium quality massage product designed for professional and home use. Experience comfort and relaxation."}
          </p>
          
          {/* Promo Badge if available */}
          {hasPromo && (
            <div className="mb-2">
              <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded inline-block">
                -{promoPercent}%
              </div>
            </div>
          )}
          
          {/* Bottom Row: Delivery and Button */}
          <div className="flex items-center justify-between gap-2 mt-auto relative">
            <div className="text-xs text-gray-600">
              🚚 {deliveryDays} days
            </div>
            {/* Clear image behind button - enlarged 30% more */}
            <img 
              src="https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1762514431664" 
              alt="" 
              className="absolute -bottom-3 -right-3 w-28 h-28 sm:w-32 sm:h-32 object-contain opacity-90 pointer-events-none z-0"
              loading="lazy"
            />
            <button
              type="button"
              onClick={goToDetails}
              className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors relative z-10"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductCard;
