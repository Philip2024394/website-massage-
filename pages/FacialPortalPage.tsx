import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, UserPlus, Home } from 'lucide-react';
import { account } from '../lib/appwrite';
import { showToast } from '../utils/showToastPortal';
import { ID } from 'appwrite';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface FacialPortalPageProps {
  onNavigateHome?: () => void;
  onLoginSuccess?: (userId: string, email: string) => void;
  t?: any;
  // Navigation handlers
  onMassageJobsClick?: () => void;
  onHotelPortalClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onFacialPortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  onNavigate?: (page: string) => void;
}

const FacialPortalPage: React.FC<FacialPortalPageProps> = ({ 
  onNavigateHome,
  onLoginSuccess,
  t,
  onMassageJobsClick,
  onHotelPortalClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onFacialPortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  onNavigate
}) => {
  const [viewMode, setViewMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clear any existing session first
      try {
        const session = await account.getSession('current');
        if (session) {
          await account.deleteSession('current');
        }
      } catch (e) {
        // No active session, which is fine
      }
      
      // Sign in with email and password
      await account.createEmailPasswordSession(email, password);
      
      // Get user account
      const user = await account.get();
      
      showToast('Welcome back! Logging in...', 'success');
      
      // Call onLoginSuccess callback to navigate to dashboard
      if (onLoginSuccess) {
        onLoginSuccess(user.$id, email);
      } else if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'Sign in failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Clear any existing session first
      try {
        const session = await account.getSession('current');
        if (session) {
          await account.deleteSession('current');
        }
      } catch (e) {
        // No active session, which is fine
      }
      
      // Create account
      await account.create(ID.unique(), email, password, name);
      
      // Automatically sign in
      await account.createEmailPasswordSession(email, password);
      
      // Get user account
      const user = await account.get();
      
      showToast('Account created successfully! Welcome!', 'success');
      
      // Call onLoginSuccess callback to navigate to dashboard
      if (onLoginSuccess) {
        onLoginSuccess(user.$id, email);
      } else if (onNavigate) {
        onNavigate('dashboard');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      const errorMessage = error.message || 'Sign up failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
      <PageNumberBadge pageNumber={5} pageName="FacialPortalPage" isLocked={false} />
      
      {/* Global Header */}
      <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-black">Inda</span><span className="text-orange-500">Street</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-600">
            <button onClick={() => setIsMenuOpen(true)} title="Menu">
              <BurgerMenuIcon className="w-6 h-6" />
            </button>
            <button onClick={onNavigateHome} title="Go to Home" className="hover:text-orange-500 transition-colors">
              <Home className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Global App Drawer */}
      <React19SafeWrapper condition={isMenuOpen}>
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          t={t}
          onMassageJobsClick={onMassageJobsClick}
          onHotelPortalClick={onHotelPortalClick}
          onVillaPortalClick={onVillaPortalClick}
          onTherapistPortalClick={onTherapistPortalClick}
          onMassagePlacePortalClick={onMassagePlacePortalClick}
          onFacialPortalClick={onFacialPortalClick}
          onAgentPortalClick={onAgentPortalClick}
          onCustomerPortalClick={onCustomerPortalClick}
          onAdminPortalClick={onAdminPortalClick}
          onNavigate={onNavigate}
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
          backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/facial%20clinic.png?updatedAt=1764957334008)'
        }}
      >
        <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Header - Positioned right under header area */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Facial Spa</h2>
            <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Manage your facial spa bookings and services</p>
          </div>

          <div className="mb-3 sm:mb-4 min-h-[50px] flex items-center">
            {error && (
              <div className={`w-full p-2 sm:p-3 rounded-lg text-sm ${
                error.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {error}
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex mb-4 sm:mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
            <button
              onClick={() => {
                setViewMode('login');
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                viewMode === 'login' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setViewMode('register');
                setError('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                viewMode === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Forms */}
          {viewMode === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Email Address
                </label>
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
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Password
                </label>
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
                  <div className="flex items-center justify-center gap-2">
                    🔑 Sign In to Facial Spa
                  </div>
                )}
              </button>
            </form>
          )}

          {viewMode === 'register' && (
            <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Full Name
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Email Address
                </label>
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
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 8 characters)"
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
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Facial Spa Account
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      </main>
      
      {/* Hide scrollbars */}
      <style>{`
        .max-w-md::-webkit-scrollbar {
          display: none;
        }
        @media (max-height: 600px) {
          .space-y-4 > * + * {
            margin-top: 0.75rem;
          }
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FacialPortalPage;
