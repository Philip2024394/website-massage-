import React, { useEffect, useState } from 'react';
import { account, databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const sections = [
  {
    title: 'Status & Taxes',
    body: `Promoters act as independent, self‑employed individuals. You are solely responsible for complying with all applicable laws and paying any taxes, fees, or government charges arising from your activities.`
  },
  {
    title: 'Conduct & Platform Ownership',
    body: `You agree to follow and uphold Indastreet's Policy of Conduct at all times. All tools we provide—including the platform, dashboards, marketing assets, banners, and any related materials—are and remain the exclusive property of Indastreet. Your access is licensed, not sold, and may be revoked as described below.`
  },
  {
    title: 'Account Control & Deactivation',
    body: `Indastreet may suspend or deactivate your account without prior notice if we determine, in our sole discretion, a policy breach, misconduct, fraud, or risk to users or the platform.`
  },
  {
    title: 'Transport & Merchandise',
    body: `Indastreet is not responsible for any transportation or logistics relating to your activities. All promotional and advertising merchandise (including ID cards, table stands, banners, and printed materials) remains the property of Indastreet at all times.`
  },
  {
    title: 'ID Cards & Returns',
    body: `If you close your account or it is deactivated, you must return any Indastreet ID cards and related materials upon request.`
  },
  {
    title: 'Inactive Accounts',
    body: `Accounts with no activity for two consecutive months may be closed automatically. Any outstanding platform usage fees may be considered dissolved upon closure, except as required by law.`
  },
  {
    title: 'Commissions & Payments',
    body: `Provider‑commissions (from therapists and massage places/spas) are paid directly from the provider to the promoter. Indastreet does not pay these provider‑commissions. Indastreet is solely responsible for promoter commissions related to Indastreet memberships, as expressly defined by membership terms.`
  }
];

const PromoterTermsPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [me, setMe] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await account.get();
        setMe(user);
        try {
          const doc = await databases.getDocument(APPWRITE_CONFIG.databaseId, (APPWRITE_CONFIG.collections as any).promoters || 'promoters_collection_id', user.$id);
          setAcceptedAt(doc.acceptedTermsAt || null);
        } catch {}
      } catch {}
    })();
  }, []);

  const accept = async () => {
    if (!me) { onNavigate?.('promoterAuth'); return; }
    setSaving(true);
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        (APPWRITE_CONFIG.collections as any).promoters || 'promoters_collection_id',
        me.$id,
        { acceptedTermsAt: new Date().toISOString() }
      );
      setAcceptedAt(new Date().toISOString());
      alert('Terms accepted.');
    } catch {
      alert('Failed to record acceptance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <button onClick={onBack} className="mr-4">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Promoter Terms & Conditions</h1>
        <button onClick={() => onNavigate?.('promoterBankAccount')} className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm">Bank</button>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        <div className="space-y-4">
          {sections.map((s, i) => (
            <section key={i} className="bg-white border border-gray-200 rounded-xl p-4">
              <h2 className="text-base font-semibold text-gray-900 mb-1">{s.title}</h2>
              <p className="text-sm text-gray-700 leading-6">{s.body}</p>
            </section>
          ))}

          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">
            By continuing to use Indastreet, you acknowledge and agree to these Terms & Conditions.
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">{acceptedAt ? `Accepted at: ${new Date(acceptedAt).toLocaleString()}` : 'Not yet accepted'}</div>
            <button onClick={accept} disabled={saving} className="px-3 py-2 bg-black text-white rounded-lg text-sm">{saving ? 'Saving…' : 'I Agree'}</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromoterTermsPage;
