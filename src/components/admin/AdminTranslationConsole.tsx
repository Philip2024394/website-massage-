/**
 * Admin Translation Console – Indonesian ↔ English for WhatsApp bookings.
 * Admin-only. Uses MyMemory API (no key required, fast).
 */

import React, { useState } from 'react';

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

async function translate(text: string, from: 'id' | 'en', to: 'en' | 'id'): Promise<string> {
    const trimmed = text.trim();
    if (!trimmed) return '';
    const langpair = from === 'id' ? 'id|en' : 'en|id';
    const url = `${MYMEMORY_API}?q=${encodeURIComponent(trimmed)}&langpair=${langpair}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
        throw new Error(data.responseData?.translatedText || 'Translation failed');
    }
    return data.responseData.translatedText;
}

const QUICK_PHRASES = [
    { label: 'Therapist is on the way', en: 'Therapist is on the way.', id: 'Terapis sedang dalam perjalanan.' },
    { label: 'Please send location', en: 'Please send your location.', id: 'Silakan kirim lokasi Anda.' },
    { label: 'Deposit received', en: 'Deposit received. Thank you.', id: 'Deposit telah diterima. Terima kasih.' },
    { label: 'Booking confirmed', en: 'Your booking is confirmed.', id: 'Pemesanan Anda dikonfirmasi.' },
    { label: 'Therapist unavailable, offer alternative', en: 'This therapist is unavailable. We can offer an alternative.', id: 'Terapis ini tidak tersedia. Kami dapat menawarkan alternatif.' },
];

export const AdminTranslationConsole: React.FC = () => {
    const [idInput, setIdInput] = useState('');
    const [enOutput, setEnOutput] = useState('');
    const [enReply, setEnReply] = useState('');
    const [idReplyOutput, setIdReplyOutput] = useState('');
    const [loadingIdToEn, setLoadingIdToEn] = useState(false);
    const [loadingEnToId, setLoadingEnToId] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranslateToEnglish = async () => {
        setError(null);
        setLoadingIdToEn(true);
        try {
            const result = await translate(idInput, 'id', 'en');
            setEnOutput(result);
        } catch (e: any) {
            setError(e.message || 'Translation failed');
            setEnOutput('');
        } finally {
            setLoadingIdToEn(false);
        }
    };

    const handleTranslateToIndonesian = async () => {
        setError(null);
        setLoadingEnToId(true);
        try {
            const result = await translate(enReply, 'en', 'id');
            setIdReplyOutput(result);
        } catch (e: any) {
            setError(e.message || 'Translation failed');
            setIdReplyOutput('');
        } finally {
            setLoadingEnToId(false);
        }
    };

    const copyToClipboard = () => {
        if (idReplyOutput) {
            navigator.clipboard.writeText(idReplyOutput);
        }
    };

    const applyQuickPhrase = (phrase: { en: string; id: string }) => {
        setEnReply(phrase.en);
        setIdReplyOutput(phrase.id);
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Translation Console</h1>
            <p className="text-sm text-gray-600 mb-4">
                Indonesian ↔ English for WhatsApp. Paste message, translate, then translate your reply and copy.
            </p>
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Indonesian → English */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800 mb-2">Paste WhatsApp message (Indonesian)</h2>
                <textarea
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder="Paste message in Indonesian..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px]"
                    rows={4}
                />
                <button
                    type="button"
                    onClick={handleTranslateToEnglish}
                    disabled={loadingIdToEn || !idInput.trim()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingIdToEn ? 'Translating…' : 'Translate to English'}
                </button>
                <div className="mt-2">
                    <label className="text-xs text-gray-500 block mb-1">English translation</label>
                    <div className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 min-h-[60px]">
                        {enOutput || '—'}
                    </div>
                </div>
            </div>

            {/* English reply → Indonesian */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800 mb-2">Your reply (English)</h2>
                <textarea
                    value={enReply}
                    onChange={(e) => setEnReply(e.target.value)}
                    placeholder="Type your reply in English..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[80px]"
                    rows={3}
                />
                <button
                    type="button"
                    onClick={handleTranslateToIndonesian}
                    disabled={loadingEnToId || !enReply.trim()}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingEnToId ? 'Translating…' : 'Translate to Indonesian'}
                </button>
                <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500 block mb-1">Indonesian version (copy to WhatsApp)</label>
                        <div className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-gray-50 min-h-[60px]">
                            {idReplyOutput || '—'}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={copyToClipboard}
                        disabled={!idReplyOutput}
                        className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* Quick phrases */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-800 mb-2">Quick phrases</h2>
                <p className="text-xs text-gray-500 mb-2">Click to fill reply and Indonesian translation.</p>
                <div className="flex flex-wrap gap-2">
                    {QUICK_PHRASES.map((phrase) => (
                        <button
                            key={phrase.label}
                            type="button"
                            onClick={() => applyQuickPhrase(phrase)}
                            className="px-3 py-1.5 bg-orange-100 text-orange-800 rounded-lg text-xs font-medium hover:bg-orange-200"
                        >
                            {phrase.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminTranslationConsole;
