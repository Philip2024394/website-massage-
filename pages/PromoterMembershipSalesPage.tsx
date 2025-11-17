import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { membershipReferralService } from '../lib/membershipReferralService';
import { getCode as getCapturedAffiliateCode } from '../lib/affiliateAttribution';
import { promoterService } from '../services/promoterService';

const PromoterMembershipSalesPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Array<{ month: string; count: number }>>([]);
  const [isActive, setIsActive] = useState(true);

  const affiliateCode = useMemo(() => getCapturedAffiliateCode() || (globalThis as any).my_affiliate_code || '', []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const code = getCapturedAffiliateCode() || (globalThis as any).my_affiliate_code || '';
        if (code) {
          try {
            const prof = await promoterService.getProfile(code);
            if (mounted) setIsActive(!!((prof as any).isActive ?? (prof as any).active));
          } catch { if (mounted) setIsActive(true); }
        }
      } catch {}
      setLoading(true);
      try {
        const refs = await membershipReferralService.getByAffiliateCode(affiliateCode);
        const byMonth: Record<string, number> = {};
        for (const r of refs) {
          const dt = new Date((r as any).$createdAt || r.createdAt || Date.now());
          const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
          byMonth[key] = (byMonth[key] || 0) + 1;
        }
        const sorted = Object.keys(byMonth).sort().map(k => ({ month: k, count: byMonth[k] }));
        if (mounted) setRows(sorted);
      } catch {
        if (mounted) setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [affiliateCode]);

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
            Your promoter account is deactivated.
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Membership Sales</h2>
          <p className="text-sm text-gray-600">Promotor ID: <span className="font-mono">{affiliateCode || 'N/A'}</span></p>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="text-gray-600">No signups recorded yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {rows.map(r => (
              <div key={r.month} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                <div>
                  <div className="text-sm text-gray-500">Month</div>
                  <div className="font-semibold text-gray-900">{r.month}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">New Signups</div>
                  <div className="text-2xl font-bold text-orange-600">{r.count}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PromoterMembershipSalesPage;
