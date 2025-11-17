import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';
import { affiliateAnalyticsService } from '../lib/affiliateAnalyticsService';

const PromoterBookingStatsPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [agentCode, setAgentCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);
  const [totals, setTotals] = useState<{ pending: number; approved: number; paid: number; amountPending: number; amountApproved: number; amountPaid: number }>({ pending: 0, approved: 0, paid: 0, amountPending: 0, amountApproved: 0, amountPaid: 0 });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { 
        const me = await account.get(); 
        const id = (me as any).$id || '';
        if (mounted) setUserId(id);
        try {
          if (id) {
            const prof = await promoterService.getProfile(id);
            if (mounted) {
              setIsActive(!!((prof as any).isActive ?? (prof as any).active));
              setAgentCode((prof as any).agentCode || id);
            }
          }
        } catch { if (mounted) setIsActive(true); }
      } catch { if (mounted) { setUserId(''); setAgentCode(''); setIsActive(true); } }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!agentCode) { setRows([]); setTotals({ pending: 0, approved: 0, paid: 0, amountPending: 0, amountApproved: 0, amountPaid: 0 }); return; }
      setLoading(true);
      try {
        const atts = await affiliateAnalyticsService.getAttributionsByCode(agentCode);
        if (!mounted) return;
        setRows(atts);
        const sums = { pending: 0, approved: 0, paid: 0, amountPending: 0, amountApproved: 0, amountPaid: 0 } as any;
        for (const a of atts) {
          const status = String(a.commissionStatus || 'pending').toLowerCase();
          const amt = Number(a.commissionAmount || 0);
          if (status === 'pending') { sums.pending++; sums.amountPending += amt; }
          else if (status === 'approved') { sums.approved++; sums.amountApproved += amt; }
          else if (status === 'paid') { sums.paid++; sums.amountPaid += amt; }
        }
        setTotals(sums);
      } catch { setRows([]); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [agentCode]);

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

      <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
        {!isActive && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">
            Your promoter account is deactivated.
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Booking Stats</h2>
          <p className="text-sm text-gray-600">Promotor ID: <span className="font-mono">{agentCode || 'N/A'}</span></p>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-600">No bookings attributed yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-2xl font-bold text-gray-900">{totals.pending}</div>
                <div className="text-xs text-gray-500">Rp {totals.amountPending.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500">Approved</div>
                <div className="text-2xl font-bold text-gray-900">{totals.approved}</div>
                <div className="text-xs text-gray-500">Rp {totals.amountApproved.toLocaleString()}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-xs text-gray-500">Paid</div>
                <div className="text-2xl font-bold text-gray-900">{totals.paid}</div>
                <div className="text-xs text-gray-500">Rp {totals.amountPaid.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl divide-y">
              {rows.map((r: any) => (
                <div key={r.$id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">Booking #{r.bookingId || r.$id}</div>
                    <div className="text-xs text-gray-500">Provider: {r.providerName || r.providerId} • {new Date(r.$createdAt || r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">Rp {(Number(r.commissionAmount || 0)).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{String(r.commissionStatus || 'pending').toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PromoterBookingStatsPage;
