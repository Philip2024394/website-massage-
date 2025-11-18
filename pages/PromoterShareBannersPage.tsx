import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Download, Share2, MessageCircle } from 'lucide-react';
import { account } from '../lib/appwrite';
import { promoterService } from '../services/promoterService';

// Lightweight promoter share banners page
// Shows 5/10/15/20% banners and generates share links with affiliate code

const BANNERS = [
  { id: '5', percent: 5,  imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532' },
  { id: '10', percent: 10, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896' },
  { id: '15', percent: 15, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221' },
  { id: '20', percent: 20, imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034' }
];

// Standard marketing banners provided (watermark needed)
const STANDARD_BANNERS: string[] = [
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%205.png?updatedAt=1763209023834',
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%206.png?updatedAt=1763209046899',
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%207.png?updatedAt=1763209069417',
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%208.png?updatedAt=1763209088368',
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%209.png?updatedAt=1763209107741',
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%2010.png?updatedAt=1763209130500',
  'https://ik.imagekit.io/7grri5v7d/marketing%20banners%2011.png?updatedAt=1763209151620'
];

const defaultCaption = (
  percent: number,
  link: string,
  code: string
) => `🎉 ${percent}% OFF massage with IndaStreet!

Use my promoter code: ${code}
Book here: ${link}

Limited time · Terms apply.`;

const PromoterShareBannersPage: React.FC<{ onBack?: () => void; t?: (k: string) => string }> = ({ onBack }) => {
  const [manualCode, setManualCode] = useState('');
  const [profileCode, setProfileCode] = useState('');
  const [capturedCode, setCapturedCode] = useState('');

  // Load promoter profile code (agentCode) for the logged-in user
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await account.get();
        const id = (me as any)?.$id || '';
        if (!id) return;
        try {
          const prof = await promoterService.getProfile(id);
          const agent = (prof as any)?.agentCode || '';
          if (mounted && agent) setProfileCode(String(agent));
        } catch {}
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Load captured affiliate code (from attribution storage/URL)
  useEffect(() => {
    try {
      // dynamic require to avoid SSR issues
      const mod: any = require('../lib/affiliateAttribution');
      const code = (mod && typeof mod.getCode === 'function') ? mod.getCode() : '';
      if (code) setCapturedCode(code);
    } catch {}
  }, []);

  const affiliateCode = useMemo(() => {
    // Priority: manual override -> profile agentCode -> captured attribution
    return (manualCode.trim() || profileCode || capturedCode || '').toUpperCase();
  }, [manualCode, profileCode, capturedCode]);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const buildLink = (percent: number) => {
    const url = new URL(origin || 'https://indastreetmassage.com');
    if (affiliateCode) url.searchParams.set('aff', affiliateCode);
    url.searchParams.set('discount', String(percent));
    return url.toString();
  };

  const copyToClipboard = async (text: string) => {
    try { await navigator.clipboard.writeText(text); alert('Copied to clipboard'); }
    catch { alert('Copy failed. Please copy manually.'); }
  };

  const handleDownload = async (src: string, filename: string) => {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { try { document.body.removeChild(a); } catch {} URL.revokeObjectURL(url); }, 100);
    } catch {
      alert('Download failed. Long-press the image to save.');
    }
  };

  // Draw watermark text at bottom and download
  const downloadWithWatermark = async (src: string, filename: string, text = 'www.indastreetmassage.com') => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const loaded: Promise<HTMLImageElement> = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
      img.src = src;
      const image = await loaded;

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Draw image
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Compute font size relative to width
      const fontSize = Math.max(18, Math.round(canvas.width * 0.035));
      const padding = Math.max(10, Math.round(canvas.height * 0.02));

      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';

      // Measure text box
      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const boxHeight = Math.round(fontSize * 1.8);
      const boxY = canvas.height - boxHeight;

      // Background strip (semi-transparent)
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, boxY, canvas.width, boxHeight);

      // Text with subtle shadow
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      ctx.fillText(text, canvas.width / 2, canvas.height - padding);

      canvas.toBlob((blob) => {
        if (!blob) return alert('Failed to export image');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { try { document.body.removeChild(a); } catch {} URL.revokeObjectURL(url); }, 100);
      }, 'image/png');
    } catch {
      alert('Watermarking failed. Try plain download or different browser.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-3 p-3">
          <button onClick={onBack} className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50">Back</button>
          <h1 className="text-lg font-bold">Share Discount Banners</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-base font-semibold mb-2">Your Promoter Code</h2>
          <p className="text-sm text-gray-600 mb-3">We attach this code to links for proper attribution.</p>
          <div className="flex gap-2 items-center">
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              placeholder={affiliateCode || 'PROMO123'}
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={() => copyToClipboard(affiliateCode || manualCode || '')}
              className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Tip: Paste your code wherever you share.</p>
        </div>

        {/* Discount banners (with affiliate code links) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {BANNERS.map(b => {
            const link = buildLink(b.percent);
            const caption = defaultCaption(b.percent, link, affiliateCode || manualCode || '');
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow overflow-hidden border">
                <img src={b.imageUrl} alt={`${b.percent}% OFF banner`} className="w-full h-56 object-cover" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{b.percent}% OFF</h3>
                    <span className="text-xs text-gray-500">Auto-attached code</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyToClipboard(link)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" /> Copy Link
                    </button>
                    <button
                      onClick={() => handleDownload(b.imageUrl, `indastreet-${b.percent}-percent.png`)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                    <button
                      onClick={() => copyToClipboard(caption)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 col-span-2"
                    >
                      <Copy className="w-4 h-4" /> Copy Caption
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(caption)}`, '_blank')}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 col-span-2"
                    >
                      <MessageCircle className="w-4 h-4" /> Share to WhatsApp
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[11px] text-gray-500 break-all">{link}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Standard marketing banners with website text watermark */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-base font-semibold mb-2">Standard Banners (with website text)</h2>
          <p className="text-sm text-gray-600 mb-4">Downloads will include “www.indastreetmassage.com” at the bottom.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {STANDARD_BANNERS.map((url, i) => (
              <div key={url} className="bg-white rounded-xl border overflow-hidden">
                <div className="relative">
                  <img src={url} alt={`Marketing banner ${i + 1}`} className="w-full h-56 object-cover" />
                  {/* Preview overlay text */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-xs sm:text-sm text-center px-2 py-1">
                    www.indastreetmassage.com
                  </div>
                </div>
                <div className="p-3">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => downloadWithWatermark(url, `indastreet-banner-${i + 1}.png`)}
                      className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 col-span-2"
                    >
                      <Download className="w-4 h-4" /> Download with website text
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center">
          Images provided for social sharing. Discounts subject to availability; terms apply.
        </div>
      </div>
    </div>
  );
};

export default PromoterShareBannersPage;
