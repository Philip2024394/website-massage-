import React, { useEffect, useMemo, useState } from 'react';
import { COUNTRIES } from '../countries';
import { marketplaceService } from '../lib/marketplaceService';
import { account } from '../lib/appwrite';

type Props = {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any;
};

const SellerRegistrationPage: React.FC<Props> = ({ onBack, onNavigate, t }) => {
  const [tradingName, setTradingName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('ID');
  const [salesMode, setSalesMode] = useState<'local'|'global'>('local');
  const [shippingRates, setShippingRates] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const countryOptions = useMemo(() => COUNTRIES.map(c => ({ code: c.code, name: c.name })), []);

  useEffect(() => {
    (async () => {
      const me = await account.get().catch(() => null);
      if (!me) onNavigate?.('supplierAuth');
      // Default country to user's saved location if present
      try {
        const raw = localStorage.getItem('app_user_location');
        if (raw) {
          const loc = JSON.parse(raw);
          if (loc && typeof loc.countryCode === 'string' && loc.countryCode.length >= 2) {
            setCountryCode(String(loc.countryCode).toUpperCase());
          }
        }
      } catch {}
    })();
  }, []);

  const addRate = () => {
    const code = prompt('Enter country code (e.g., SG, MY, AU):');
    if (!code) return;
    const norm = code.trim().toUpperCase();
    const price = Number(prompt('Enter delivery fee for ' + norm + ':') || '0');
    if (isNaN(price)) return;
    setShippingRates(prev => ({ ...prev, [norm]: Math.max(0, Math.round(price)) }));
  };

  const removeRate = (code: string) => {
    setShippingRates(prev => {
      const copy = { ...prev };
      delete copy[code];
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!tradingName.trim()) { alert('Enter trading name'); return; }
    if (!countryCode) { alert('Select country'); return; }
    setSubmitting(true);
    try {
      const seller = await marketplaceService.createSeller({
        tradingName: tradingName.trim(),
        whatsapp: whatsapp.trim(),
        contactEmail: email.trim(),
        countryCode,
        salesMode,
        shippingRates: salesMode === 'global' ? shippingRates : {}
      });
      if (!seller) { 
        alert('Failed to create seller - no response from server'); 
        return; 
      }
      try { localStorage.setItem('marketplace_seller_id', seller.$id); } catch {}
      onNavigate?.('sellerDashboard');
    } catch (e: any) {
      console.error('Seller creation error:', e);
      alert(`Failed to create seller: ${e.message || 'Unknown error. Check browser console.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20store.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/50" />
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Back</button>
          <h1 className="text-xl font-bold text-gray-900">Supplier Signup</h1>
        </div>
      </header>
      <main className="relative z-10 max-w-2xl mx-auto p-4">
        <p className="text-sm text-gray-600 mb-4">30-day free trial. Local plan (£10/mo) allows up to 50 products in your country. Global plan (£14.99/mo) enables unlimited products across countries you configure.</p>
        <div className="bg-white/95 backdrop-blur rounded-xl p-4 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Trading Name</label>
            <input value={tradingName} onChange={e => setTradingName(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="Your company or brand" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="e.g., +62 812-xxxx" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email (optional)</label>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="you@brand.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-full border rounded-md px-3 py-2">
              {countryOptions.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sales Mode</label>
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="radio" checked={salesMode==='local'} onChange={() => setSalesMode('local')} /> Local (own country only)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={salesMode==='global'} onChange={() => setSalesMode('global')} /> Global (countries with delivery fee)
              </label>
            </div>
          </div>
          {salesMode === 'global' && (
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Fees by Country</label>
              <div className="space-y-2">
                {Object.entries(shippingRates).length === 0 && (
                  <div className="text-xs text-gray-500">No delivery countries added yet.</div>
                )}
                {Object.entries(shippingRates).map(([code, fee]) => (
                  <div key={code} className="flex items-center justify-between border rounded-md px-3 py-2">
                    <div className="text-sm">{code}: {fee}</div>
                    <button onClick={() => removeRate(code)} className="text-xs text-red-600 hover:underline">Remove</button>
                  </div>
                ))}
                <button onClick={addRate} className="px-3 py-2 bg-gray-100 rounded-md text-sm hover:bg-gray-200">Add Country Fee</button>
              </div>
            </div>
          )}
          <div className="pt-2">
            <button disabled={submitting} onClick={handleSubmit} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">{submitting ? 'Submitting…' : 'Create Seller'}</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerRegistrationPage;
