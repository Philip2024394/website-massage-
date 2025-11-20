import React from 'react';
import { marketplaceService, type MarketplaceSeller, type MarketplaceProduct } from '../lib/marketplaceService';
import { COUNTRIES } from '../countries';
import { Star, Home } from 'lucide-react';

interface Props {
  onNavigate?: (page: string) => void;
  onBack: () => void;
}

const SellerShopPage: React.FC<Props> = ({ onNavigate, onBack }) => {
  const [seller, setSeller] = React.useState<MarketplaceSeller | null>(null);
  const [products, setProducts] = React.useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    
    (async () => {
      setLoading(true);
      try {
        let sellerId = '';
        try { sellerId = sessionStorage.getItem('marketplace_selected_seller') || ''; } catch {}
        if (!sellerId) {
          try { sellerId = localStorage.getItem('marketplace_selected_seller') || ''; } catch {}
        }
        if (!sellerId) { 
          if (mounted) onNavigate?.('marketplace'); 
          return; 
        }
        const s = await marketplaceService.getSellerById(sellerId);
        if (!s) { 
          if (mounted) onNavigate?.('marketplace'); 
          return; 
        }
        if (mounted) {
          setSeller(s);
          const list = await marketplaceService.listProductsBySeller(sellerId);
          setProducts(list);
        }
      } finally { 
        if (mounted) setLoading(false); 
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, [onNavigate]);

  const waNumber = seller?.whatsapp || '';
  const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello, I'm interested in your products on IndaStreet.`)}` : undefined;
  const emailLink = seller?.ownerEmail ? `mailto:${seller.ownerEmail}` : undefined;
  const siteUrl = seller?.websiteUrl ? (/^https?:\/\//i.test(seller.websiteUrl) ? seller.websiteUrl : `https://${seller.websiteUrl}`) : undefined;
  
  const countryName = React.useMemo(() => {
    const cc = (seller?.countryCode || '').toUpperCase();
    return COUNTRIES.find(c => c.code === cc)?.name || cc || 'Unknown';
  }, [seller?.countryCode]);

  const currencySymbol = React.useMemo(() => {
    const cc = (seller?.countryCode || '').toUpperCase();
    const currencyMap: Record<string, string> = {
      'ID': 'Rp',
      'US': '$',
      'AU': 'A$',
      'GB': '£',
      'EU': '€',
      'JP': '¥',
      'CN': '¥',
      'SG': 'S$',
      'MY': 'RM',
      'TH': '฿',
      'VN': '₫',
      'PH': '₱',
      'IN': '₹',
      'KR': '₩',
    };
    return currencyMap[cc] || '$';
  }, [seller?.countryCode]);

  const trendingProducts = React.useMemo(() => {
    return products.slice(0, 3);
  }, [products]);

  const viewProduct = (productId: string) => {
    try {
      sessionStorage.setItem('marketplace_selected_product', productId);
    } catch {}
    onNavigate?.('productDetail');
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Removed background image and screen cover for clean solid backdrop */}
      
      {/* Round Home Button - Fixed Top Left */}
      <button
        onClick={() => onNavigate?.('marketplace')}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-orange-600 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-110 transition-all hover:bg-orange-700"
        aria-label="Home"
      >
        <Home className="w-6 h-6 text-white" />
      </button>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-20 relative z-10">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading…</div>
        ) : (
          <>
            {/* Seller Info Section */}
            <div className="mb-8 sm:mb-12 relative z-20">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-xl mb-4 relative z-20">
                  {seller?.profileImage ? (
                    <img src={seller.profileImage} alt={seller.tradingName || seller.storeName || 'Seller'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {((seller?.tradingName || seller?.storeName || 'S').charAt(0) || 'S').toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Shop Name */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{seller?.tradingName || seller?.storeName || 'Shop Name'}</h2>
                
                {/* Location with Flag */}
                <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                  <div className="w-6 h-6 rounded-full overflow-hidden shadow-md border border-gray-200">
                    <img 
                      src={`https://flagcdn.com/w40/${(seller?.countryCode || '').toLowerCase()}.png`} 
                      alt={countryName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-semibold">{countryName}</span>
                </div>

                {/* Contact Buttons */}
                <div className="flex items-center justify-center gap-3 relative z-20">
                  {waLink && (
                    <a href={waLink} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-green-500 text-white hover:bg-green-600 transition-all hover:scale-110 shadow-lg flex items-center justify-center" title="WhatsApp">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </a>
                  )}
                  {emailLink && (
                    <a href={emailLink} className="w-12 h-12 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-all hover:scale-110 shadow-lg flex items-center justify-center" title="Email">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  )}
                  {siteUrl && (
                    <a href={siteUrl} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-all hover:scale-110 shadow-lg flex items-center justify-center" title="Website">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Product Cards Section - Round Design */}
            <div className="relative z-20">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">All Products</h2>
              
              {products.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200">No products available yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {products.map(product => (
                    <div 
                      key={product.$id} 
                      className="flex flex-col items-center group cursor-pointer relative z-30"
                      onClick={() => viewProduct(product.$id)}
                    >
                      {/* Round Product Image with Star Rating and Curved Text on Left Side */}
                      <div className="relative w-full aspect-square mb-3 z-30">
                        <div
                          className={
                            `w-full h-full rounded-full overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300 ring-4 ring-white relative z-30 bg-white ` +
                            (!((product.images && product.images[0]) || product.image) ? 'bg-gradient-to-br from-gray-200 to-gray-300' : '')
                          }
                        >
                          {(product.images && product.images[0]) || product.image ? (
                            <img
                              src={(product.images && product.images[0]) || product.image || ''}
                              alt={product.name}
                              className="w-full h-full object-cover object-center relative z-30"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-400" />
                          )}
                        </div>
                        
                        {/* Star Rating Badge - Top Right Edge */}
                        <div className="absolute top-0 right-0 bg-white rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-md border border-orange-200 z-40">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-[10px] sm:text-xs font-bold text-gray-900">{(product.rating || 4.5).toFixed(1)}</span>
                        </div>

                        {/* Curved Product Name - Left Inner Arc */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-40" viewBox="0 0 110 100" aria-hidden="true">
                          <defs>
                            <path
                              id={`curve-${product.$id}`}
                              d="M 55,5 A 45,45 0 0,0 55,95" /* Left side arc matching circle (center 55,50 radius 45) */
                              fill="none"
                            />
                          </defs>
                          <text className="text-[6px] sm:text-[7px] font-bold text-gray-900 group-hover:text-orange-600 transition-colors tracking-wide" style={{ letterSpacing: '0.15em' }}>
                            <textPath href={`#curve-${product.$id}`} startOffset="50%" textAnchor="middle">
                              {product.name.toUpperCase()}
                            </textPath>
                          </text>
                        </svg>
                      </div>

                      {/* View Button with Price */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewProduct(product.$id);
                        }}
                        className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-xs sm:text-sm font-bold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg hover:shadow-xl relative z-30 flex flex-col items-center gap-0.5"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs sm:text-sm font-semibold">{currencySymbol}</span>
                          <span className="text-sm sm:text-base font-bold">{product.price}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-semibold">View</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default SellerShopPage;
