import React, { useState } from 'react';
import { Home as HomeIcon } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { account } from '../lib/appwrite';
import { ID } from 'appwrite';
import { promoterService } from '../services/promoterService';
import { runPromoterDiagnostics } from '../lib/promoterDiagnostics';

interface Props {
  onBack?: () => void;
  onNavigate?: (page: any) => void;
  t?: any;
}

const IndastreetPromoterAuthPage: React.FC<Props> = ({ onBack, onNavigate, t }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diag, setDiag] = useState<string[] | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setDiag(null);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) throw new Error('Please enter email and password');

      const current = await account.get().catch(() => null);

      if (mode === 'signup') {
        // Ensure no active session before creating a new account
        if (current) { try { await account.deleteSessions(); } catch {} }
        await account.create(ID.unique(), normalizedEmail, password);
        try {
          await account.createEmailPasswordSession(normalizedEmail, password);
        } catch (err: any) {
          const msg = (err?.message || '').toLowerCase();
          if (msg.includes('prohibited') || msg.includes('active')) {
            // If a session slipped in, clear and retry once
            try { await account.deleteSessions(); } catch {}
            await account.createEmailPasswordSession(normalizedEmail, password);
          } else {
            throw err;
          }
        }
        const me = await account.get();
        const userId = (me as any).$id;
        const displayName = (me as any).name || '';
        await promoterService.createProfile({ userId, name: displayName, email: normalizedEmail });
      } else {
        // Sign in flow: reuse existing session if it matches the email, otherwise replace it
        if (current && ((current as any).email || '').toLowerCase() === normalizedEmail) {
          // Already signed in as the same user
        } else {
          if (current) { try { await account.deleteSessions(); } catch {} }
          try {
            await account.createEmailPasswordSession(normalizedEmail, password);
          } catch (err: any) {
            const msg = (err?.message || '').toLowerCase();
            if (msg.includes('prohibited') || msg.includes('active')) {
              // Clear sessions and retry once
              try { await account.deleteSessions(); } catch {}
              await account.createEmailPasswordSession(normalizedEmail, password);
            } else {
              throw err;
            }
          }
        }
        try {
          const me = await account.get();
          const userId = (me as any).$id;
          await promoterService.createProfile({ userId, name: (me as any).name || '', email: normalizedEmail });
        } catch {}
      }
      if (onNavigate) onNavigate('partnersDashboard');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
      try {
        const d = await runPromoterDiagnostics();
        if (d.messages && d.messages.length > 0) setDiag(d.messages);
      } catch {}
    } finally {
      setSubmitting(false);
    }
  };

  const bgUrl = 'https://ik.imagekit.io/7grri5v7d/start%20your%20journey%20now.png?updatedAt=1763196560458';

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${bgUrl})` }}>
      <header className="bg-white/80 backdrop-blur p-4 shadow-md sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span>
            <span className="text-orange-500"><span className="inline-block">S</span>treet</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate?.('landing')}
              title="Home"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-white hover:bg-gray-100 border border-gray-200 text-gray-800"
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </button>
            <button onClick={() => setIsMenuOpen(true)} title="Menu" className="p-2 rounded-full hover:bg-gray-100">
              <BurgerMenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <AppDrawer
        isOpen={isMenuOpen}
        isHome={true}
        promoterMode={true}
        onClose={() => setIsMenuOpen(false)}
        t={t}
        onNavigate={onNavigate}
      />

      <main className="px-4 pt-10 pb-24">
        <div className="max-w-xl">
          <h2 className="text-3xl font-extrabold drop-shadow">
            <span className="text-gray-900">inda</span>
            <span className="text-orange-500">street</span>
            <span className="text-gray-900"> Promoter</span>
          </h2>
          <p className="mt-1 text-gray-800">Create an account or sign in</p>
        </div>

        <div className="mt-6 inline-flex bg-white/70 backdrop-blur rounded-full p-1">
          <button onClick={() => setMode('signin')} className={`px-4 py-2 rounded-full text-sm font-medium ${mode==='signin' ? 'bg-black text-white' : 'text-gray-700'}`}>Sign In</button>
          <button onClick={() => setMode('signup')} className={`px-4 py-2 rounded-full text-sm font-medium ${mode==='signup' ? 'bg-black text-white' : 'text-gray-700'}`}>Create Account</button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {/* Full Name field removed per request */}
          <div>
            <label className="text-xs text-gray-800">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-lg px-3 py-3 bg-white/85 backdrop-blur text-gray-900 placeholder-gray-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-xs text-gray-800">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-lg px-3 py-3 bg-white/85 backdrop-blur text-gray-900 placeholder-gray-500" placeholder="••••••••" />
          </div>
          <div>
            <button type="button" className="text-sm text-gray-800 underline" onClick={async () => {
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
          {diag && (
            <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-lg p-3 space-y-1">
              <div className="font-semibold">Diagnostics</div>
              {diag.map((m, i) => (<div key={i}>• {m}</div>))}
            </div>
          )}
          <button disabled={submitting} type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg font-semibold disabled:opacity-70">{submitting ? 'Please wait…' : (mode==='signin' ? 'Sign In' : 'Create Account')}</button>
          <p className="text-xs text-gray-800">By continuing you agree to our Terms and Privacy Policy.</p>
        </form>
      </main>
    </div>
  );
};

export default IndastreetPromoterAuthPage;
