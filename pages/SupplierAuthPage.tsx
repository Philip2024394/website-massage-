import React, { useState } from 'react';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';
import { marketplaceService } from '../lib/marketplaceService';

type Props = {
  onBack: () => void;
  onNavigate?: (page: string) => void;
  t?: any;
};

const SupplierAuthPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) throw new Error('Enter email and password');
      const current = await account.get().catch(() => null);
      if (mode === 'signup') {
        if (current) { try { await account.deleteSessions(); } catch {} }
        await account.create(ID.unique(), normalizedEmail, password);
        // Do NOT auto-login on signup; require explicit sign-in
        setInfo('Account created. Please sign in to continue.');
        setMode('signin');
        setSubmitting(false);
        return;
      } else {
        if (current && ((current as any).email || '').toLowerCase() === normalizedEmail) {
          // already signed in
        } else {
          if (current) { try { await account.deleteSessions(); } catch {} }
          try { await account.createEmailPasswordSession(normalizedEmail, password); }
          catch { try { await account.deleteSessions(); await account.createEmailPasswordSession(normalizedEmail, password); } catch (e) { throw e; } }
        }
      }
      // After successful sign-in, route to sellerDashboard or sellerRegistration
      const me = await account.get();
      try {
        if (!(me as any).emailVerification) {
          await account.createVerification(window.location.origin + '/verify-email');
          try { localStorage.setItem('marketplace_verification_prompt', '1'); } catch {}
        }
      } catch {}
      const ownerUserId = (me as any).$id as string;
      const existing = await marketplaceService.getSellerByOwnerId(ownerUserId);
      if (existing) {
        try { localStorage.setItem('marketplace_seller_id', existing.$id); } catch {}
        onNavigate?.('sellerDashboard');
      } else {
        onNavigate?.('sellerRegistration');
      }
    } catch (e: any) {
      setError(e?.message || 'Authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20store.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-white/50" />
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={onBack} className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200">Back</button>
          <h1 className="text-xl font-bold text-gray-900">Supplier Account</h1>
        </div>
      </header>
      <main className="relative z-10 max-w-md mx-auto p-4">
        <div className="inline-flex bg-gray-100 rounded-full p-1 mb-4">
          <button onClick={() => setMode('signin')} className={`px-4 py-2 rounded-full text-sm font-medium ${mode==='signin' ? 'bg-black text-white' : 'text-gray-700'}`}>Sign In</button>
          <button onClick={() => setMode('signup')} className={`px-4 py-2 rounded-full text-sm font-medium ${mode==='signup' ? 'bg-black text-white' : 'text-gray-700'}`}>Create Account</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 bg-white/90 backdrop-blur rounded-xl p-4 shadow">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2" placeholder="••••••••" />
          </div>
          <div>
            <button type="button" className="text-xs text-gray-700 underline" onClick={async () => {
              try {
                if (!email) { setError('Enter your email then tap Forgot password'); return; }
                await account.createRecovery(email.trim(), window.location.origin + '/');
                setError('Recovery email sent. Check your inbox.');
              } catch (e: any) {
                setError(e?.message || 'Failed to send recovery email');
              }
            }}>Forgot password?</button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {info && <div className="text-sm text-green-700">{info}</div>}
          <button disabled={submitting} type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold disabled:opacity-70">{submitting ? 'Please wait…' : (mode==='signin' ? 'Sign In' : 'Create Account')}</button>
          <p className="text-xs text-gray-600">By continuing you agree to our Terms and Privacy Policy.</p>
        </form>
      </main>
    </div>
  );
};

export default SupplierAuthPage;
