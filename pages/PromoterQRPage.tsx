import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';

const PromoterQRPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [copied, setCopied] = useState(false);
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
            if (mounted) setIsActive(!!((prof as any).isActive ?? (prof as any).active));
          }
        } catch { if (mounted) setIsActive(true); }
      } catch {
        if (mounted) { setUserId(''); setIsActive(true); }
      }
    })();
    return () => { mounted = false; };
  }, []);

  const shareUrl = useMemo(() => {
    try {
      const origin = globalThis.location?.origin || '';
      const code = userId || '';
      if (!origin || !code) return '';
      return `${origin}/?aff=${encodeURIComponent(code)}`;
    } catch {
      return '';
    }
  }, [userId]);

  const qrSrc = useMemo(() => {
    if (!shareUrl) return '';
    const data = encodeURIComponent(shareUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${data}`;
  }, [shareUrl]);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const handleShare = async () => {
    try {
      if ((navigator as any).share && shareUrl) {
        await (navigator as any).share({ title: 'Indastreet', text: 'Book with my promoter link', url: shareUrl });
      } else {
        await handleCopy();
        alert('Link copied to clipboard');
      }
    } catch {}
  };

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

      <main className="max-w-xl mx-auto p-4 md:p-6 pb-24">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Share Your Promoter QR</h2>
          <p className="text-sm text-gray-600">Anyone scanning this QR will carry your code.</p>
          <p className="text-sm text-gray-600">Affiliate code: <span className="font-mono">{userId || 'N/A'}</span></p>
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
            {!!qrSrc && (<img src={qrSrc} alt="Promoter QR" className={`w-64 h-64 ${!isActive ? 'opacity-50' : ''}`} />)}
            <div className="mt-4 w-full">
              <div className="bg-gray-50 text-gray-700 text-sm rounded px-3 py-2 break-all select-all">{shareUrl}</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              <button onClick={handleCopy} disabled={!isActive} className={`px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-slate-800 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}`}>{copied ? 'Copied' : 'Copy'}</button>
              <a href={isActive ? (qrSrc || '#') : '#'} download={`indastreet-promoter-qr.png`} className={`px-3 py-2 rounded-lg text-sm text-center ${qrSrc && isActive ? 'bg-black text-white' : 'bg-gray-300 text-gray-600 pointer-events-none'}`}>Download</a>
              <button onClick={handleShare} disabled={!isActive} className={`px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-orange-500 text-white' : 'bg-gray-400 text-white cursor-not-allowed'}`}>Share</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PromoterQRPage;
