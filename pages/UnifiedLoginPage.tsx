import React, { useState } from 'react';
import { authService, notificationService } from '../lib/appwriteService';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface UnifiedLoginPageProps {
  onBack?: () => void;
  t?: any;
  // Navigation handlers
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onNavigate?: (page: string) => void;
  // When true, hide role selection and force customer (user) context
  forceCustomer?: boolean;
  // Called after successful customer login to set app state
  onCustomerLoginSuccess?: (customer: any) => void;
}

const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
  onBack,
  t,
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  onNavigate,
  forceCustomer = false,
  onCustomerLoginSuccess
}) => {
  // Customer-only unified auth (exact hotel layout)
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      if (mode === 'register') {
        // Customer registration only
        try {
          await authService.register(email, password, 'User', { autoLogin: false });
          // Notify admin of new user registration (non-blocking)
          try {
            await notificationService.create({
              title: 'New User Registered',
              message: `New customer signup: ${email}`,
              recipientType: 'admin',
              type: 'system',
              priority: 'medium',
              data: { email }
            });
          } catch (notifyErr) {
            console.warn('Failed to create admin notification for registration:', notifyErr);
          }
          try { localStorage.setItem('just_registered', 'true'); } catch {}
          setSuccess('Account created. Please sign in to continue.');
          setMode('login');
        } catch (err: any) {
          console.error('[Auth][Register][User] Error object:', err);
          const type = err?.type || err?.response?.type;
          const msg = err?.message || err?.response?.message || '';
          const message = msg.includes('already exists') || type === 'user_email_already_exists'
            ? 'An account with this email already exists. Please use Login.'
            : type === 'user_invalid_email' || msg.toLowerCase().includes('invalid email')
              ? 'Please enter a valid email address.'
              : type === 'user_invalid_password' || msg.toLowerCase().includes('password')
                ? 'Password must be at least 8 characters.'
                : type === 'auth_provider_disabled'
                  ? 'Email/password sign-up is disabled in server settings.'
                  : msg || 'An error occurred.';
          setError(message);
          if (message.includes('already exists')) setMode('login');
        }
      } else {
        try {
          const current = await authService.login(email, password);
          setSuccess('Logged in! Redirecting to your dashboard...');
          if (onCustomerLoginSuccess && current) {
            try {
              onCustomerLoginSuccess({ id: current.$id, email: current.email, name: current.name });
            } catch {}
          }
          if (onNavigate) onNavigate('customerDashboard');
          else setTimeout(() => { window.location.reload(); }, 500);
        } catch (err: any) {
          console.error('[Auth][Login] Error object:', err);
          const type = err?.type || err?.response?.type;
          const msg = err?.message || err?.response?.message || '';
          if (type === 'user_invalid_credentials' || msg.toLowerCase().includes('invalid credentials')) {
            setError('Incorrect email or password.');
          } else if (type === 'auth_provider_disabled') {
            setError('Email/password login is disabled in server settings.');
          } else {
            setError(msg || 'An error occurred.');
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
      <PageNumberBadge pageNumber={3} pageName="UnifiedLoginPage" isLocked={false} />
      {/* Header */}
      <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-600">
            <button onClick={() => setIsMenuOpen(true)} title="Menu">
              <BurgerMenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Global App Drawer */}
      <React19SafeWrapper condition={isMenuOpen}>
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onMassageJobsClick={onMassageJobsClick}
          onHotelPortalClick={onHotelPortalClick}
          onVillaPortalClick={onVillaPortalClick}
          onTherapistPortalClick={onTherapistPortalClick}
          onMassagePlacePortalClick={onMassagePlacePortalClick}
          onAgentPortalClick={onAgentPortalClick}
          onCustomerPortalClick={onCustomerPortalClick}
          onAdminPortalClick={onAdminPortalClick}
          onTermsClick={onTermsClick}
          onPrivacyClick={onPrivacyClick}
          therapists={[]}
          places={[]}
        />
      </React19SafeWrapper>

      {/* Main Content with Background */}
      <main 
        className="flex-1 flex items-start justify-center px-4 py-2 overflow-hidden relative bg-cover bg-center bg-no-repeat min-h-0"
        style={{
          backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/admin%20login%20dash%20baord.png?updatedAt=1763186156216)'
        }}
      >
        <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Header - Positioned right under header area */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Guest</h2>
            <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Access your bookings and rewards</p>
          </div>

          {/* Status messages */}
          <div className="mb-3 sm:mb-4 min-h-[50px] flex items-center">
            {(error || success) && (
              <div className={`w-full p-2 sm:p-3 rounded-lg text-sm ${
                success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {success || error}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-4 sm:mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                mode !== 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                mode === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          {mode !== 'register' ? (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 8 characters)"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Hide scrollbars */}
      <style>{`
        .max-w-md::-webkit-scrollbar { display: none; }
        @media (max-height: 600px) {
          .space-y-4 > * + * { margin-top: 0.75rem; }
          .space-y-6 > * + * { margin-top: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default UnifiedLoginPage;
