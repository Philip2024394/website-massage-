import React from 'react';
import { formatAmountForUser } from '../utils/currency';
import type { MarketplaceProduct, MarketplaceSeller } from '../lib/marketplaceService';

type Props = {
  product: MarketplaceProduct & { seller?: MarketplaceSeller };
  viewerCountryCode?: string;
  viewerCoords?: { lat?: number; lng?: number };
  onView?: (productId: string) => void;
};

const MarketplaceProductCard: React.FC<Props> = ({ product, viewerCountryCode, onView }) => {
  const priceLabel = formatAmountForUser(product.price || 0, viewerCountryCode);
  
  // Calculate promo percentage if promo price exists
  const hasPromo = typeof product.promoPrice === 'number' && product.promoPrice > 0 && product.promoPrice < (product.price || 0);
  const promoPercent = hasPromo ? Math.round((((product.price || 0) - product.promoPrice!) / (product.price || 0)) * 100) : 0;
  
  // Star rating (default to 4.5 if not set)
  const rating = product.rating || 4.5;
  
  // Delivery days (mock for now, can be added to schema)
  const deliveryDays = (product as any).deliveryDays || 6;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Image with Star Rating Overlay */}
      <div className="relative">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-40 object-cover" loading="lazy"/>
        ) : (
          <div className="w-full h-40 bg-gray-100" />
        )}
        {/* Star Rating Badge - Top Left */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 shadow-md">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-gray-900 text-xs font-semibold">{rating.toFixed(1)}</span>
        </div>
      </div>
      
      <div className="p-3">
        {/* Product Name */}
        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
        
        {/* Description - 3 lines */}
        {product.description && (
          <p className="text-xs text-gray-600 line-clamp-3 mb-3">{product.description}</p>
        )}
        
        {/* Price Row: Price on left, Promo on right */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-orange-600 font-bold text-base">{priceLabel}</div>
          {hasPromo && (
            <div className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{promoPercent}%
            </div>
          )}
        </div>
        
        {/* Delivery Days */}
        <div className="text-xs text-gray-600 mb-3">
          🚚 Delivery: {deliveryDays} days
        </div>
        
        {/* View Product Button */}
        <button onClick={() => onView?.(product.$id)} className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 transition-colors">View Product</button>
      </div>
    </div>
  );
};

export default MarketplaceProductCard;
