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
  const waNumber = product?.seller?.whatsapp || '';
  const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello, I'm interested in ${product.name} on IndaStreet.`)}` : undefined;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-40 object-cover" loading="lazy"/>
      ) : (
        <div className="w-full h-40 bg-gray-100" />
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          {typeof product.stockLevel === 'number' && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${product.stockLevel > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{product.stockLevel > 0 ? `Stock: ${product.stockLevel}` : 'Out of stock'}</span>
          )}
        </div>
        {product.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-orange-600 font-bold">{priceLabel}</div>
          <div className="text-xs text-gray-500">
            {product.seller?.tradingName || 'Supplier'}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          {waLink && (
            <a href={waLink} target="_blank" rel="noreferrer" className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">WhatsApp</a>
          )}
          <button onClick={() => onView?.(product.$id)} className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm hover:bg-gray-200">View</button>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceProductCard;
