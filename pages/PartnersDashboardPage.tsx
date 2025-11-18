import React, { useEffect, useMemo, useState } from 'react';
import { QrCode, Share2, Link as LinkIcon, ExternalLink, TrendingUp } from 'lucide-react';
import { affiliateAnalyticsService, type CommissionSummary } from '../lib/affiliateAnalyticsService';
import { getCode as getCapturedAffiliateCode } from '../lib/affiliateAttribution';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';

const PartnersDashboardPage: React.FC<{ t?: any; setPage?: (p: any) => void }> = ({ t, setPage }) => {
  const [venueId, setVenueId] = useState('');
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const affiliateCode = useMemo(() => {
    const stored = (globalThis as any).my_affiliate_code as string | undefined;
    return stored || getCapturedAffiliateCode() || 'AFFILIATE';
  }, []);

  const liveMenuUrl = useMemo(() => {
    const aff = affiliateCode ? `&aff=${encodeURIComponent(affiliateCode)}` : '';
    const base = `${globalThis.location.origin}/?page=promoterLiveMenu`;
    const params = `venueId=${encodeURIComponent(venueId || '')}`;
    return `${base}&${params}${aff}`;
  }, [venueId, affiliateCode]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const s = await affiliateAnalyticsService.getSummary(affiliateCode);
        if (mounted) setSummary(s);
      } catch (e) {
        console.warn('Failed loading affiliate summary', e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [affiliateCode]);

  // Allow global header or other triggers to open the drawer
  useEffect(() => {
    const open = () => setIsMenuOpen(true);
    window.addEventListener('toggleDrawer', open as any);
    window.addEventListener('customer_dashboard_open_drawer', open as any);
    return () => {
      window.removeEventListener('toggleDrawer', open as any);
      window.removeEventListener('customer_dashboard_open_drawer', open as any);
    };
  }, []);

  // Auto-open drawer via query param for verification/testing
  useEffect(() => {
    try {
      const sp = new URLSearchParams(globalThis.location.search || '');
      const open = sp.get('openDrawer');
      if (open === '1' || (open || '').toLowerCase() === 'true') {
        setIsMenuOpen(true);
      }
    } catch {}
  }, []);

  // Keyboard shortcut: press "m" to toggle the drawer (debug/assist discovery)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key || '').toLowerCase() === 'm') setIsMenuOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Local header with burger to open side drawer */}
      <header className="bg-white p-4 shadow-md sticky top-0 z-30" data-page-header="true">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <button
            onClick={() => setIsMenuOpen(true)}
            title="Menu"
            aria-label="Open menu"
            className="px-3 py-2 rounded-full hover:bg-gray-100 text-gray-900 border border-gray-200 inline-flex items-center gap-2 force-show-menu"
          >
            <BurgerMenuIcon className="w-6 h-6 text-gray-900" />
            <span className="font-medium">Menu</span>
          </button>
        </div>
      </header>

      <AppDrawer
        isOpen={isMenuOpen}
        isHome={true}
        onClose={() => setIsMenuOpen(false)}
        t={t}
        onNavigate={setPage}
        promoterMode={true}
      />

      <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">indastreet Promoter</h1>
          <p className="text-xs text-gray-500">Share, track, and preview your live menu</p>
        </div>
      </div>

      {/* Affiliate Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Promotor ID</div>
          <div className="font-mono text-lg">{affiliateCode}</div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Tracked Clicks</div>
          <div className="text-2xl font-bold text-orange-600">{summary?.clicks ?? 0}</div>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
          <div className="text-xs text-gray-500">Pending Commission</div>
          <div className="text-2xl font-bold text-orange-600">Rp {(summary?.pendingAmount ?? 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Build Live Menu Link */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Live Menu Builder</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-600">Venue ID</label>
            <input value={venueId} onChange={e => setVenueId(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., 101" />
          </div>
          {/* Venue Type dropdown removed as not required */}
          <div className="flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(liveMenuUrl)} className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <LinkIcon className="w-4 h-4" /> Copy Link
            </button>
            <a href={`https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=${encodeURIComponent(liveMenuUrl)}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
              <QrCode className="w-4 h-4" /> QR
            </a>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2 break-all">{liveMenuUrl}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={() => {
            try {
              const url = new URL(window.location.href);
              url.searchParams.set('page', 'promoterLiveMenu');
              url.searchParams.set('venueId', venueId || '');
              window.history.replaceState({}, '', url.toString());
            } catch {}
            if (setPage) setPage('promoterLiveMenu');
          }} className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Preview in App
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent('Check out our live menu: ' + liveMenuUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Share WhatsApp
          </a>
        </div>
      </div>

      {/* Inline Live Preview */}
      {venueId ? (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600">
            <span>Live Menu Preview</span>
          </div>
          <iframe title="Live Menu Preview" src={liveMenuUrl} style={{ width: '100%', height: '700px', border: '0' }} />
        </div>
      ) : (
        <div className="text-sm text-gray-600">Enter a Venue ID to preview the live menu here.</div>
      )}

      {loading && <div className="text-xs text-gray-500 mt-2">Loading affiliate summary…</div>}
    </div>

    {/* Floating Menu Button (fallback) */}
    <button
      onClick={() => setIsMenuOpen(true)}
      aria-label="Open menu"
      title="Menu"
      className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg bg-black text-white px-4 py-3 flex items-center gap-2 md:hidden force-show-menu"
      style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
    >
      <BurgerMenuIcon className="w-5 h-5 text-white" />
      <span className="text-sm">Menu</span>
    </button>
    </div>
  );
};

export default PartnersDashboardPage;
