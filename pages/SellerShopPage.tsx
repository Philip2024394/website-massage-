import React from 'react';
import { marketplaceService, type MarketplaceSeller, type MarketplaceProduct } from '../lib/marketplaceService';

interface Props {
  onNavigate?: (page: string) => void;
  onBack: () => void;
}

const SellerShopPage: React.FC<Props> = ({ onNavigate, onBack }) => {
  const [seller, setSeller] = React.useState<MarketplaceSeller | null>(null);
  const [products, setProducts] = React.useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let sellerId = '';
        try { sellerId = sessionStorage.getItem('marketplace_selected_seller') || ''; } catch {}
        if (!sellerId) {
          try { sellerId = localStorage.getItem('marketplace_selected_seller') || ''; } catch {}
        }
        if (!sellerId) { onNavigate?.('marketplace'); return; }
        const s = await marketplaceService.getSellerById(sellerId);
        if (!s) { onNavigate?.('marketplace'); return; }
        setSeller(s);
        const list = await marketplaceService.listProductsBySeller(sellerId);
        setProducts(list);
      } finally { setLoading(false); }
    })();
  }, []);

  const waNumber = seller?.whatsapp || '';
  const waLink = waNumber ? `https://wa.me/${waNumber.replace(/\D/g,'')}?text=${encodeURIComponent(`Hello, I'm interested in your products on IndaStreet.`)}` : undefined;
  const emailLink = seller?.ownerEmail ? `mailto:${seller.ownerEmail}` : undefined;
  const siteUrl = seller?.websiteUrl ? (/^https?:\/\//i.test(seller.websiteUrl) ? seller.websiteUrl : `https://${seller.websiteUrl}`) : undefined;
  const paymentBadges: string[] = (() => {
    try {
      const raw = seller?.acceptedPayments as any;
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  })();
  const [specOpenId, setSpecOpenId] = React.useState<string | null>(null);
  const paymentIcon = (name: string) => {
    switch (name) {
      case 'Stripe': return <span aria-hidden>🟦</span>;
      case 'PayPal': return <span aria-hidden>🟨</span>;
      case 'Escrow': return <span aria-hidden>🛡️</span>;
      case 'Bank Transfer': return <span aria-hidden>🏦</span>;
      default: return <span aria-hidden>💳</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Back</button>
          <h1 className="text-xl font-bold text-gray-900">{seller?.tradingName || 'Shop'}</h1>
          <div className="ml-auto flex items-center gap-2">
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">WhatsApp</a>}
            {emailLink && <a href={emailLink} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Email</a>}
            {siteUrl && <a href={siteUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-white border text-sm hover:bg-gray-50">Website</a>}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {loading ? (
          <div className="text-center text-gray-500">Loading…</div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500">No products yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {products.map(p => (
              <div key={p.$id} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
                {(p.images && p.images[0]) || p.image ? (
                  <img src={(p.images && p.images[0]) || p.image || ''} alt={p.name} className="w-full h-40 object-cover" loading="lazy"/>
                ) : (
                  <div className="w-full h-40 bg-gray-100" />
                )}
                <div className="p-3">
                  <div className="font-semibold text-gray-900 line-clamp-2">{p.name}</div>
                  {p.description && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</div>}
                  <div className="mt-2 text-orange-600 font-bold">{p.price}</div>
                  <div className="mt-2 flex items-center gap-2">
                    {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700">WhatsApp</a>}
                    {emailLink && <a href={emailLink} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700">Email</a>}
                    {siteUrl && <a href={siteUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-white border text-sm hover:bg-gray-50">Website</a>}
                    {p.videoUrl && (
                      <a href={/^https?:\/\//i.test(p.videoUrl) ? p.videoUrl : `https://${p.videoUrl}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg bg-white border text-sm hover:bg-gray-50">Video</a>
                    )}
                    {p.whatYouWillReceive && p.whatYouWillReceive.trim() && (
                      <button onClick={() => setSpecOpenId(p.$id)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm hover:bg-gray-50">What You Will Receive</button>
                    )}
                  </div>
                  {paymentBadges.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 flex-wrap">
                      {paymentBadges.map(pb => (
                        <span key={pb} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center gap-1">{paymentIcon(pb)} {pb}</span>
                      ))}
                      {siteUrl && (
                        <a href={siteUrl} target="_blank" rel="noreferrer" className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center gap-1">🌐 Website</a>
                      )}
                      {p.videoUrl && (
                        <a href={/^https?:\/\//i.test(p.videoUrl) ? p.videoUrl : `https://${p.videoUrl}`} target="_blank" rel="noreferrer" className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 inline-flex items-center gap-1">▶ Video</a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {specOpenId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSpecOpenId(null)} />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-[90%] max-h-[80vh] overflow-auto p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">What You Will Receive</h3>
                <button onClick={() => setSpecOpenId(null)} className="text-gray-500 hover:text-gray-800">Close</button>
              </div>
              <div className="whitespace-pre-wrap text-sm text-gray-800">{products.find(x=>x.$id===specOpenId)?.whatYouWillReceive}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerShopPage;
