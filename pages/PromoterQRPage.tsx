import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';
import { qrUsageService } from '../lib/qrUsageService';

const PromoterQRPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [promotorCode, setPromotorCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [usageType, setUsageType] = useState<string>('');
  const [venueName, setVenueName] = useState<string>('');
  const usageNeedsVenue = usageType === 'hotel' || usageType === 'villa';

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
              setPromotorCode((prof as any).agentCode || id);
            }
          }
        } catch { if (mounted) { setIsActive(true); setPromotorCode(id); } }
      } catch {
        if (mounted) { setUserId(''); setIsActive(true); setPromotorCode(''); }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const shareUrl = useMemo(() => {
    try {
      const origin = globalThis.location?.origin || '';
      const code = promotorCode || '';
      if (!origin || !code) return '';
      const params: string[] = [`aff=${encodeURIComponent(code)}`];
      if (usageType) params.push(`usageType=${encodeURIComponent(usageType)}`);
      if (usageNeedsVenue && venueName.trim()) params.push(`venueName=${encodeURIComponent(venueName.trim())}`);
      return `${origin}/live-menu?${params.join('&')}`;
    } catch { return ''; }
  }, [promotorCode, usageType, venueName, usageNeedsVenue]);

  const shortAliasUrl = useMemo(() => {
    try {
      const origin = globalThis.location?.origin || '';
      const code = promotorCode || '';
      if (!origin || !code) return '';
      return `${origin}/r/${encodeURIComponent(code)}`;
    } catch { return ''; }
  }, [promotorCode]);

  const qrSrc = useMemo(() => {
    if (!shareUrl) return '';
    const data = encodeURIComponent(shareUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`;
  }, [shareUrl]);

  const ensureValid = (): boolean => {
    if (!usageType) { alert('Please select where this QR will be used.'); return false; }
    if (usageNeedsVenue && !venueName.trim()) { alert('Please enter the Hotel/Villa name.'); return false; }
    return true;
  };

  const logUsage = async (actionType: string) => {
    try {
      await qrUsageService.logUsage({
        userId,
        affiliateCode: promotorCode,
        usageType,
        venueName: usageNeedsVenue ? venueName.trim() : '',
        actionType,
        shareUrl
      });
    } catch {}
  };

  const handleCopy = async () => {
    if (!ensureValid()) return;
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); await logUsage('copy'); } catch {}
  };

  const handleShare = async () => {
    if (!ensureValid()) return;
    try {
      if ((navigator as any).share && shareUrl) {
        await (navigator as any).share({ title: 'Indastreet', text: 'Book with my promoter link', url: shareUrl });
        await logUsage('share');
      } else {
        await handleCopy();
        alert('Link copied to clipboard');
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white p-4 shadow-md sticky top-0 z-20" data-page-header="true">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 rounded-full hover:bg-gray-100 force-show-menu" aria-label="Menu">
            <BurgerMenuIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <AppDrawer isOpen={isMenuOpen} isHome={true} onClose={() => setIsMenuOpen(false)} t={t} onNavigate={onNavigate} promoterMode={true} />

      <main className="max-w-xl mx-auto p-4 md:p-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Share Your Promoter QR</h2>
          <p className="text-sm text-gray-600">Anyone scanning this QR will carry your code.</p>
          <p className="text-sm text-gray-600">Promotor ID: <span className="font-mono">{promotorCode || 'N/A'}</span></p>
        </div>

        {!userId ? (
          <div className="text-gray-600">Please sign in to load your QR.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center">
            {!isActive && (
              <div className="mb-3 w-full bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">
                Your promoter account is deactivated. Sharing is disabled.
              </div>
            )}
            {!!qrSrc && (
              <div className="flex flex-col items-center">
                <img src={qrSrc} alt="Promoter QR" className={`w-64 h-64 ${!isActive ? 'opacity-50' : ''}`} />
                {usageNeedsVenue && venueName.trim() && (
                  <div className="mt-2 text-sm font-medium text-gray-800" title="Venue Name">{venueName.trim()}</div>
                )}
                {usageType && (
                  <div className="mt-1 text-xs uppercase tracking-wide text-gray-500" title="Usage Type">{usageType}</div>
                )}
              </div>
            )}
            <div className="mt-4 w-full space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Where will this QR be used?</label>
                <select value={usageType} onChange={e => setUsageType(e.target.value)} className="mt-1 w-full border border-gray-300 rounded px-2 py-2 text-sm bg-white">
                  <option value="">Select location</option>
                  <option value="hotel">Hotel</option>
                  <option value="villa">Villa</option>
                  <option value="social">Social Media</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
              {usageNeedsVenue && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">Hotel / Villa Name</label>
                  <input value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="e.g. Ocean View Resort" className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm" maxLength={80} />
                </div>
              )}
              <p className="text-xs text-gray-500">Selecting accurate usage improves reporting & attribution. Hotel/Villa name will be saved.</p>
            </div>
            <div className="mt-4 w-full space-y-2">
              <div className="bg-gray-50 text-gray-700 text-sm rounded px-3 py-2 break-all select-all" title="Canonical share URL">{shareUrl}</div>
              <div className="bg-gray-50 text-gray-500 text-xs rounded px-3 py-2 break-all select-all" title="Short alias URL">{shortAliasUrl}</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              <button onClick={handleCopy} disabled={!isActive} className={`px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-slate-800 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}`}>{copied ? 'Copied' : 'Copy'}</button>
              <a
                href={isActive && ensureValid() ? (qrSrc || '#') : '#'}
                onClick={async (e) => { if (!ensureValid()) { e.preventDefault(); return; } if (isActive) { await logUsage('download'); } }}
                download={`indastreet-promoter-qr.png`}
                className={`px-3 py-2 rounded-lg text-sm text-center ${qrSrc && isActive ? 'bg-black text-white' : 'bg-gray-300 text-gray-600 pointer-events-none'}`}
              >Download</a>
              <button onClick={handleShare} disabled={!isActive} className={`px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}`}>Share</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromoterQRPage;
