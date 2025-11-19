import React from 'react';
import { marketplaceService, type MarketplaceProduct, type MarketplaceSeller } from '../lib/marketplaceService';

const AdminMarketplaceModerationPage: React.FC = () => {
  const [items, setItems] = React.useState<(MarketplaceProduct & { seller?: MarketplaceSeller })[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const list = await marketplaceService.listAllProducts();
      setItems(list);
    } catch (e: any) { setError(e?.message || 'Failed to load products'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    await marketplaceService.setProductActive(id, active);
    await load();
  };

  return (
    <div className="bg-white shadow-sm border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">Marketplace Moderation</h2>
        <button onClick={load} className="text-sm text-orange-600 hover:underline">Refresh</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">No marketplace products found.</div>
      ) : (
        <div className="divide-y">
          {items.map(p => (
            <div key={p.$id} className="py-3 flex items-center gap-3">
              <img src={(p.images && p.images[0]) || p.image || ''} alt={p.name} className="w-14 h-14 object-cover rounded bg-gray-100" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{p.name}</div>
                <div className="text-xs text-gray-500 truncate">{p.seller?.tradingName || p.sellerId}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${p.isActive === false ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{p.isActive === false ? 'Inactive' : 'Active'}</span>
              <button onClick={() => toggle(p.$id, !(p.isActive === false))} className="ml-2 text-sm px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200">
                {p.isActive === false ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMarketplaceModerationPage;
