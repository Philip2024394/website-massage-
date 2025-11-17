import React, { useEffect, useState } from 'react';
import { account, databases, storage, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { promoterService } from '../services/promoterService';
import { AppDrawer } from '../components/AppDrawer';

const PromoterBankAccountPage: React.FC<{ t?: any; onBack?: () => void; onNavigate?: (p: any) => void }> = ({ t, onBack, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [idCardUrl, setIdCardUrl] = useState<string>('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const user = await account.get();
        setMe(user);
        // try to load existing promoter doc
        try {
          const doc = await databases.getDocument(APPWRITE_CONFIG.databaseId, (APPWRITE_CONFIG.collections as any).promoters || 'promoters_collection_id', user.$id);
          setBankName(doc.bankName || '');
          setAccountNumber(doc.accountNumber || '');
          setAccountHolderName(doc.accountHolderName || '');
          setWhatsapp(doc.whatsapp || '');
          setProfileImageUrl(doc.profileImageUrl || '');
          setIdCardUrl(doc.idCardUrl || '');
          setAccepted(!!doc.acceptedTermsAt);
        } catch (_e) {
          // no-op
        }
      } catch (_e) {
        setMe(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const uploadFile = async (file: File): Promise<string> => {
    const res = await storage.createFile(APPWRITE_CONFIG.bucketId, ID.unique(), file);
    return `${APPWRITE_CONFIG.endpoint}/storage/buckets/${APPWRITE_CONFIG.bucketId}/files/${res.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
  };

  const onSelectProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const url = await uploadFile(e.target.files[0]);
    setProfileImageUrl(url);
  };

  const onSelectIdCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const url = await uploadFile(e.target.files[0]);
    setIdCardUrl(url);
  };

  const save = async () => {
    if (!me) { alert('Please sign in first'); onNavigate?.('promoterAuth'); return; }
    if (!accepted) { alert('Please accept Terms & Conditions'); return; }
    if (!bankName || !accountNumber || !accountHolderName) { alert('Please fill bank details'); return; }
    setSaving(true);
    try {
      // ensure profile exists then update with bank fields
      await promoterService.createProfile({ userId: me.$id, name: me.name || '', email: me.email || '' });
      await databases.updateDocument(APPWRITE_CONFIG.databaseId, (APPWRITE_CONFIG.collections as any).promoters || 'promoters_collection_id', me.$id, {
        bankName, accountNumber, accountHolderName, whatsapp, profileImageUrl, idCardUrl, acceptedTermsAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
      alert('Saved bank details');
    } catch (_e) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 p-4">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppDrawer isOpen={isMenuOpen} isHome={true} onClose={() => setIsMenuOpen(false)} t={t} onNavigate={onNavigate} promoterMode={true} />
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center" data-page-header="true">
        <button onClick={onBack} className="mr-4">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Promoter Bank Account</h1>
        <button onClick={() => setIsMenuOpen(true)} className="px-3 py-2 bg-gray-800 text-white rounded-lg text-sm force-show-menu" title="Menu" aria-label="Open menu">Menu</button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {!me && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-3 text-sm">Please sign in to save your bank details.</div>
        )}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-3 text-sm">
          ID name must match bank account name.
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. BCA, BNI, Mandiri" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <input className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="1234567890" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
            <input className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} placeholder="Your Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
            <input className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="e.g. +62…" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Image</label>
            <input type="file" accept="image/*" onChange={onSelectProfileImage} />
            {profileImageUrl && (<img src={profileImageUrl} alt="Profile" className="mt-2 w-24 h-24 object-cover rounded-lg" />)}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Card</label>
            <input type="file" accept="image/*" onChange={onSelectIdCard} />
            {idCardUrl && (<img src={idCardUrl} alt="ID" className="mt-2 w-24 h-24 object-cover rounded-lg" />)}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
            <span>
              I agree to the <button type="button" onClick={() => onNavigate?.('promoterTerms')} className="underline text-blue-700">Terms & Conditions</button>
            </span>
          </label>
          <div className="pt-2">
            <button onClick={save} disabled={saving} className="w-full px-3 py-2 bg-black text-white rounded-lg text-sm">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PromoterBankAccountPage;
