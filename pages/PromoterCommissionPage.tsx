import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { membershipReferralService } from '../lib/membershipReferralService';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';
import { getCode as getCapturedAffiliateCode } from '../lib/affiliateAttribution';

function formatMonth(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function computeEligibility(monthlyCounts: Record<string, number>) {
  const sortedMonths = Object.keys(monthlyCounts).sort();
  const currentKey = sortedMonths[sortedMonths.length - 1];
  const currentCount = currentKey ? monthlyCounts[currentKey] : 0;
  const target = 20;
  const recurringActive = currentCount >= target;

  // Check last 3 full months streak
  const last3 = sortedMonths.slice(-3);
  const streak3 = last3.length === 3 && last3.every(k => monthlyCounts[k] >= target);
  return { currentKey, currentCount, recurringActive, streak3, target };
}

const PromoterCommissionPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<Record<string, number>>({});
  const [approvedTotal, setApprovedTotal] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [payoutWindowTotal, setPayoutWindowTotal] = useState<number>(0);
  const [payoutWindowLabel, setPayoutWindowLabel] = useState<string>('');

  const affiliateCode = useMemo(() => getCapturedAffiliateCode() || (globalThis as any).my_affiliate_code || '', []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        try {
          const me = await account.get();
          const prof = await promoterService.getProfile((me as any).$id);
          const active = (prof as any).isActive ?? (prof as any).active;
          if (mounted) setIsActive(active !== false);
        } catch {
          if (mounted) setIsActive(true);
        }
        const refs = await membershipReferralService.getByAffiliateCode(affiliateCode);
        const byMonth: Record<string, number> = {};
        for (const r of refs) {
          const dt = new Date((r as any).$createdAt || r.createdAt || Date.now());
          const key = formatMonth(dt);
          byMonth[key] = (byMonth[key] || 0) + 1;
        }
        const total = await membershipReferralService.getApprovedTotal(affiliateCode);
        // Compute current Friday payout window pinned to Asia/Jakarta (UTC+7): Sat 00:00 to Fri 23:59:59
        const toJakarta = (d: Date) => {
          const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
          return new Date(utcMs + 7 * 60 * 60000);
        };
        const fromJakartaToUtcIso = (dJak: Date) => new Date(dJak.getTime() - 7 * 60 * 60000).toISOString();
        const nowJak = toJakarta(new Date());
        const dayJak = nowJak.getDay(); // 0=Sun..6=Sat in Jakarta time
        const daysSinceSat = (dayJak + 1) % 7; // Sat=0
        const startJak = new Date(nowJak);
        startJak.setHours(0,0,0,0);
        startJak.setDate(startJak.getDate() - daysSinceSat);
        const endJak = new Date(startJak);
        endJak.setDate(startJak.getDate() + 6);
        endJak.setHours(23,59,59,999);
        const startIso = fromJakartaToUtcIso(startJak);
        const endIso = fromJakartaToUtcIso(endJak);
        const windowTotal = await membershipReferralService.getApprovedTotalInWindow(affiliateCode, startIso, endIso);
        const label = `${startJak.toLocaleDateString(undefined, { timeZone: 'Asia/Jakarta' })} – ${endJak.toLocaleDateString(undefined, { timeZone: 'Asia/Jakarta' })}`;
        if (mounted) {
          setMonthly(byMonth);
          setApprovedTotal(total);
          setPayoutWindowTotal(windowTotal);
          setPayoutWindowLabel(label);
        }
      } catch {
        if (mounted) setMonthly({});
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [affiliateCode]);

  const { currentKey, currentCount, recurringActive, streak3, target } = computeEligibility(monthly);

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 shadow-md sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-gray-100" aria-label="Back">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 rounded-full hover:bg-gray-100">
            <BurgerMenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <AppDrawer isOpen={isMenuOpen} isHome={true} onClose={() => setIsMenuOpen(false)} t={t} onNavigate={onNavigate} promoterMode={true} />

      <main className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
        {!isActive && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">
            Your promoter account is currently deactivated. Payouts and referral tools are temporarily unavailable. Please contact support.
          </div>
        )}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Commission</h2>
          <p className="text-sm text-gray-600">Affiliate code: <span className="font-mono">{affiliateCode || 'N/A'}</span></p>
        </div>

        <section className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Commission Structure</h3>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>20% commission on all new sign-ups you refer.</li>
            <li>10% commission on recurring memberships when you hit {target}+ new members in the current calendar month.</li>
            <li>Bonus 3% in the 4th month if you achieve {target}+ new members for 3 months in a row.</li>
            <li>If you fail to hit {target} new members in a month, recurring commission is deactivated until you meet the target again.</li>
          </ul>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">This Month</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Month</div>
              <div className="font-semibold text-gray-900">{currentKey || 'N/A'}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">New Members</div>
              <div className="text-2xl font-bold text-orange-600">{currentCount || 0}</div>
            </div>
          </div>
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${recurringActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
              Recurring Commission: {recurringActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Streak Bonus</h3>
          <p className="text-sm text-gray-700">
            {streak3 ? '✅ You have a 3-month streak. You will get +3% in month 4.' : 'Build a 3-month streak of 20+ new members to earn +3% in month 4.'}
          </p>
        </section>

        <section className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Payouts</h3>
          <p className="text-sm text-gray-700 mb-2">Payout requests open on Fridays. Transfers complete within 48 hours.</p>
          <div className="text-sm text-gray-700 mb-3">Approved total ready to pay: <span className="font-semibold">Rp {approvedTotal.toLocaleString()}</span></div>
          <div className="text-sm text-gray-700 mb-3">This Friday payout window ({payoutWindowLabel}): <span className="font-semibold">Rp {payoutWindowTotal.toLocaleString()}</span></div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={async () => {
                try {
                  const today = new Date();
                  const isFriday = today.getDay() === 5; // 5=Friday
                  if (!isFriday) {
                    alert('Payout requests are only accepted on Fridays.');
                    return;
                  }
                  if (!isActive) {
                    alert('Your promoter account is deactivated.');
                    return;
                  }
                  const me = await account.get();
                  const userId = (me as any).$id;
                  await promoterService.requestPayout({ userId, affiliateCode: affiliateCode || '' });
                  alert('Payout request submitted. Transfer in 48 hours.');
                } catch (e) {
                  alert('Failed to submit payout request');
                }
              }}
              className={`px-4 py-2 rounded-lg text-white ${isActive ? 'bg-emerald-600' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!isActive}
            >Request Payout</button>
            <button
              onClick={async () => {
                try {
                  if (!isActive) {
                    alert('Your promoter account is deactivated.');
                    return;
                  }
                  const refs = await membershipReferralService.getByAffiliateCode(affiliateCode);
                  const rows = refs.map((r: any) => ({
                    id: r.$id,
                    affiliateCode: r.affiliateCode || affiliateCode,
                    createdAt: r.$createdAt || r.createdAt,
                    commissionAmount: r.commissionAmount || 0,
                    commissionStatus: r.status || 'pending',
                  }));
                  const header = 'id,affiliateCode,createdAt,commissionAmount,commissionStatus\n';
                  const csv = header + rows.map(r => `${r.id},${r.affiliateCode},${r.createdAt},${r.commissionAmount},${r.commissionStatus}`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `promoter_attributions_${affiliateCode}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert('Failed to export CSV');
                }
              }}
              className={`px-4 py-2 text-white rounded-lg ${isActive ? 'bg-gray-800' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!isActive}
            >Export CSV</button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('promoterBankAccount')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >Bank Account</button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PromoterCommissionPage;
