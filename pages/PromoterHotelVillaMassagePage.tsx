import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';

const HERO_IMG = 'https://ik.imagekit.io/7grri5v7d/indastreet%20table%201.png';

const PromoterHotelVillaMassagePage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [promotorCode, setPromotorCode] = useState('');
  const [hotelOrVillaName, setHotelOrVillaName] = useState('');
  const [quantity, setQuantity] = useState(20);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    (async () => {
      try { 
        const me = await account.get(); 
        const id = (me as any).$id || '';
        setUserId(id);
        try {
          if (id) {
            const prof = await promoterService.getProfile(id);
            setIsActive(!!((prof as any).isActive ?? (prof as any).active));
            setPromotorCode((prof as any).agentCode || id);
          }
        } catch { setIsActive(true); setPromotorCode(id); }
      } catch { setUserId(''); setIsActive(true); setPromotorCode(''); }
    })();
  }, []);

  const validQty = Math.max(20, Math.floor(Number(quantity) || 0));
  const unitPrice = 10000; // IDR
  const total = validQty * unitPrice;

  const shareUrl = useMemo(() => {
    try {
      const origin = globalThis.location?.origin || '';
      const code = promotorCode || '';
      if (!origin || !code) return '';
      return `${origin}/?aff=${encodeURIComponent(code)}`;
    } catch { return ''; }
  }, [promotorCode]);

  const qrSrc = useMemo(() => {
    if (!shareUrl) return '';
    const data = encodeURIComponent(shareUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${data}`;
  }, [shareUrl]);

  const handleSubmit = async () => {
    if (!userId) { alert('Please sign in first.'); return; }
    if (!isActive) { alert('Your promoter account is deactivated.'); return; }
    if (!hotelOrVillaName.trim()) { alert('Enter hotel or villa name'); return; }
    setSubmitting(true);
    try {
      const doc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROMOTER_TABLE_STAND_ORDERS,
        `${userId}_order_${Date.now()}`,
        {
          userId,
          hotelOrVillaName: hotelOrVillaName.trim(),
          quantity: validQty,
          unitPrice,
          total,
          notes: notes.trim(),
          qrUrl: shareUrl,
          status: 'requested',
          createdAt: new Date().toISOString()
        }
      );
      setSubmittedId((doc as any).$id || '');
      alert('Order submitted. We will contact you to confirm.');
    } catch (e) {
      alert('Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 shadow-md sticky top-0 z-20" data-page-header="true">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 rounded-full hover:bg-gray-100 force-show-menu">
            <BurgerMenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <AppDrawer isOpen={isMenuOpen} isHome={true} onClose={() => setIsMenuOpen(false)} t={t} onNavigate={onNavigate} promoterMode={true} />

      <main className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
        {!isActive && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">
            Your promoter account is deactivated. Ordering materials is disabled.
          </div>
        )}
        <div className="rounded-2xl overflow-hidden border border-gray-200">
          <img src={HERO_IMG} alt="Hotel & Villa Massage" className="w-full h-56 object-cover" />
          <div className="p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Hotel Villa Massage</h2>
            <p className="text-sm text-gray-700">
              Promote Indastreet massage services inside hotels and villas with branded table advertisement stands. Your personal QR code will be printed — guests scan it to book. Their bookings will be attributed to you, and your commission stats will show the hotel or villa name.
            </p>
            <ul className="mt-3 text-sm text-gray-700 list-disc pl-5">
              <li>Price per stand: <strong>IDR 10.000</strong></li>
              <li>Minimum order: <strong>20 units</strong></li>
              <li>QR encodes your promoter link: <span className="font-mono break-all">{shareUrl || 'Sign in to generate'}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Order Details</h3>
            <label className="block text-sm text-gray-700 mb-1">Hotel or Villa Name</label>
            <input value={hotelOrVillaName} onChange={e => setHotelOrVillaName(e.target.value)} placeholder="e.g., Sunset Villa Ubud" className="w-full border rounded-lg px-3 py-2 mb-3" disabled={!isActive} />

            <label className="block text-sm text-gray-700 mb-1">Quantity (min 20)</label>
            <input type="number" min={20} value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-40 border rounded-lg px-3 py-2" disabled={!isActive} />

            <label className="block text-sm text-gray-700 mt-4 mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Design notes, delivery, contact person" className="w-full border rounded-lg px-3 py-2 h-24" disabled={!isActive} />

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">Unit Price: <strong>IDR {unitPrice.toLocaleString()}</strong></div>
              <div className="text-lg font-bold text-gray-900">Total: IDR {total.toLocaleString()}</div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !isActive} className={`mt-4 w-full px-4 py-2 rounded-lg text-white ${(submitting || !isActive) ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}>
              {submitting ? 'Submitting…' : 'Submit Order Request'}
            </button>

            {submittedId && (
              <div className="mt-3 text-sm text-emerald-700">Request submitted. Reference: {submittedId}</div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
            <h3 className="font-semibold text-gray-900 mb-2">Your QR Preview</h3>
            {qrSrc ? <img src={qrSrc} alt="Promoter QR" className={`w-44 h-44 ${!isActive ? 'opacity-50' : ''}`} /> : <div className="text-sm text-gray-600">Sign in to generate</div>}
            <div className="text-xs text-gray-500 mt-2 text-center">This QR links to your promoter URL. We will print this on each table stand.</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromoterHotelVillaMassagePage;
