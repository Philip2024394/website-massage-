/**
 * Massage City Places (Indonesia) – vendor signup.
 * Step 1: Create account (Name, Phone, WhatsApp, Business Name, City). No pricing/plans shown.
 * Step 2: Verify phone with OTP (stub: any 6-digit code for now).
 * Then: Auto sign-in and enter dashboard to create listing.
 */

import React, { useState } from 'react';
import { Building2, Phone, MessageCircle, MapPin, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { placeAuth } from '../../lib/auth';
import BurgerMenuIcon from '../../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../../components/AppDrawerClean';

const STORAGE_MCP_ONBOARDING = 'mcp_onboarding'; // keep in sync with config/massageCityPlacesPlans

interface MassageCityPlacesSignupPageProps {
  onNavigate?: (page: string) => void;
  onBack?: () => void;
  onAuthSuccess?: () => void;
}

const MassageCityPlacesSignupPage: React.FC<MassageCityPlacesSignupPageProps> = ({
  onNavigate,
  onBack,
  onAuthSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    businessName: '',
    city: '',
    password: '',
    termsAccepted: false,
  });
  const [otpCode, setOtpCode] = useState('');

  const normalizePhone = (v: string) => v.trim().replace(/\D/g, '');
  const formatWhatsApp = (v: string) => {
    const n = normalizePhone(v);
    if (n.startsWith('62')) return n;
    if (n.startsWith('0')) return '62' + n.slice(1);
    return '62' + n;
  };

  const handleSendOtp = () => {
    setError(null);
    const phone = normalizePhone(formData.phone);
    if (phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    setOtpSent(true);
    setOtpSent(true);
    setOtpCode('');
    // Stub: in production call your SMS/OTP API here
    console.log('[MCP] OTP stub: would send to', formData.phone);
  };

  const handleVerifyAndSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpCode.trim().replace(/\D/g, '');
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const email = `mcp_${formatWhatsApp(formData.whatsapp || formData.phone).replace(/\D/g, '')}@indastreet.place`;
      const password = formData.password;
      const name = formData.name.trim();
      const whatsappNumber = '+' + formatWhatsApp(formData.whatsapp || formData.phone);
      const businessName = formData.businessName.trim() || formData.name.trim();
      const city = formData.city.trim();

      const res = await placeAuth.signUp(email, password, name, whatsappNumber, {
        businessName,
        city,
      });
      if (!res.success) {
        setError(res.error || 'Sign up failed');
        return;
      }
      const signInRes = await placeAuth.signIn(email, password);
      if (!signInRes.success) {
        setError('Account created. Please sign in from the login page.');
        if (onNavigate) onNavigate('place-login');
        return;
      }
      try {
        sessionStorage.setItem(STORAGE_MCP_ONBOARDING, '1');
      } catch (_) {}
      onAuthSuccess?.();
      if (onNavigate) onNavigate('massage-place-dashboard');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = formData.name.trim();
    const phone = normalizePhone(formData.phone);
    const businessName = formData.businessName.trim();
    const city = formData.city.trim();
    if (!name) {
      setError('Please enter your name');
      return;
    }
    if (phone.length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!businessName) {
      setError('Please enter your business name');
      return;
    }
    if (!city) {
      setError('Please enter your city');
      return;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!formData.termsAccepted) {
      setError('Please accept the terms');
      return;
    }
    setStep('otp');
    handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {step === 'otp' ? (
            <button
              type="button"
              onClick={() => setStep('form')}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onBack ? onBack() : onNavigate?.('home'))}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">
            {step === 'form' ? 'Massage City Place – Sign up' : 'Verify your phone'}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Menu"
        >
          <BurgerMenuIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="p-4 pb-8 max-w-md mx-auto">
        {step === 'form' && (
          <>
            <p className="text-gray-600 text-sm mb-6">
              Create your account in a few steps. No payment required yet – list your place first, then choose a plan later.
            </p>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="08123456789"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Same or different number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Spa Name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Jakarta"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-600">I accept the Terms and Conditions</span>
              </label>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Continue – Verify phone
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyAndSignUp} className="space-y-4">
            <p className="text-gray-600 text-sm">
              We sent a 6-digit code to your phone. Enter it below.
              <br />
              <span className="text-amber-600 font-medium">Development: enter any 6 digits to continue.</span>
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-lg tracking-widest focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                placeholder="000000"
              />
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              className="text-sm text-amber-600 hover:underline"
            >
              Resend code
            </button>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Verify and create account
                </>
              )}
            </button>
          </form>
        )}
      </main>

      <AppDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMassageJobsClick={() => {}}
        onTherapistPortalClick={() => {}}
        onVillaPortalClick={() => {}}
        onMassagePlacePortalClick={() => {}}
        onAgentPortalClick={() => {}}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default MassageCityPlacesSignupPage;
export { STORAGE_MCP_ONBOARDING };
