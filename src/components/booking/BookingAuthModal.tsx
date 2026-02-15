/**
 * Auth modal shown at final booking confirmation when user is not signed in.
 * "Confirm Your Booking" – Sign In or Create Account to continue.
 * No redirect; on success calls onAuthSuccess so booking can proceed.
 */
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { account } from '../../lib/appwrite';
import { createAccountRateLimited, createSessionRateLimited } from '../../lib/rateLimitedAppwrite';
import { ID } from 'appwrite';

const CUSTOMER_LOGGED_IN_EVENT = 'indastreet_customer_logged_in';

export interface BookingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { $id: string; name?: string; email?: string }) => void;
  language?: 'en' | 'id';
}

export function BookingAuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  language = 'en',
}: BookingAuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: 'Confirm Your Booking',
      subtext: 'To protect both clients and professionals, please sign in or create your free IndaStreet account to continue.',
      signIn: 'Sign In',
      createAccount: 'Create Account',
      alreadyHave: 'Already have an account? Sign in to continue.',
      noAccount: "Don't have an account? Create one to continue.",
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      signInButton: 'Sign In & Continue',
      createButton: 'Create Free Account & Continue',
      trust: 'Your information is secure and used only to manage your bookings, deposits, and service communication.',
      cancel: 'Cancel',
    },
    id: {
      title: 'Konfirmasi Pemesanan Anda',
      subtext: 'Untuk melindungi klien dan profesional, silakan masuk atau buat akun IndaStreet gratis untuk melanjutkan.',
      signIn: 'Masuk',
      createAccount: 'Buat Akun',
      alreadyHave: 'Sudah punya akun? Masuk untuk melanjutkan.',
      noAccount: 'Belum punya akun? Buat akun untuk melanjutkan.',
      email: 'Email',
      password: 'Kata Sandi',
      fullName: 'Nama Lengkap',
      signInButton: 'Masuk & Lanjutkan',
      createButton: 'Buat Akun Gratis & Lanjutkan',
      trust: 'Informasi Anda aman dan hanya digunakan untuk mengelola pemesanan, deposit, dan komunikasi layanan.',
      cancel: 'Batal',
    },
  }[language];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createSessionRateLimited(email.trim().toLowerCase(), password);
      const user = await account.get();
      notifyCustomerLoggedIn(user);
      onAuthSuccess(user as any);
    } catch (err: any) {
      setError(err?.message || (language === 'id' ? 'Login gagal. Periksa email dan kata sandi.' : 'Sign in failed. Check email and password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(language === 'id' ? 'Nama wajib diisi.' : 'Name is required.');
      return;
    }
    if (password.length < 8) {
      setError(language === 'id' ? 'Kata sandi minimal 8 karakter.' : 'Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await createAccountRateLimited(email.trim().toLowerCase(), password, name.trim());
      await createSessionRateLimited(email.trim().toLowerCase(), password);
      const user = await account.get();
      notifyCustomerLoggedIn(user);
      onAuthSuccess(user as any);
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already') || msg.includes('exists')) {
        setError(language === 'id' ? 'Email sudah terdaftar. Silakan masuk.' : 'This email is already registered. Please sign in.');
      } else {
        setError(msg || (language === 'id' ? 'Pendaftaran gagal. Coba lagi.' : 'Registration failed. Please try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border-2 border-orange-500 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">{t.title}</h2>
          <p className="text-sm text-gray-600 mt-1">{t.subtext}</p>
        </div>

        <div className="px-6 py-4">
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-4">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${mode === 'signin' ? 'bg-white text-orange-600 shadow' : 'text-gray-600'}`}
            >
              {t.signIn}
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md ${mode === 'signup' ? 'bg-white text-orange-600 shadow' : 'text-gray-600'}`}
            >
              {t.createAccount}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.alreadyHave}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-70"
                >
                  {loading ? '...' : t.signInButton}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder={language === 'id' ? 'Nama lengkap' : 'Full name'}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder={language === 'id' ? 'Min. 8 karakter' : 'Min. 8 characters'}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">{t.noAccount}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-70"
                >
                  {loading ? '...' : t.createButton}
                </button>
              </div>
            </form>
          )}

          <p className="mt-4 text-xs text-gray-500 text-center">{t.trust}</p>
        </div>
      </div>
    </div>
  );
}

/** Notify app and chat that customer just logged in (so state can refresh). */
function notifyCustomerLoggedIn(user: { $id: string; name?: string; email?: string }) {
  try {
    window.dispatchEvent(
      new CustomEvent(CUSTOMER_LOGGED_IN_EVENT, {
        detail: { user: { $id: user.$id, name: user.name, email: user.email } },
      })
    );
  } catch {
    // ignore
  }
}

export default BookingAuthModal;
