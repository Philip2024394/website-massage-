import React, { useState } from 'react';
import { authService, userService } from '../lib/appwriteService';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import PageNumberBadge from '../components/PageNumberBadge';

interface CustomerAuthPageProps {
  onSuccess: (user: any, isNewUser?: boolean) => void;
  onBack: () => void;
  userLocation: { address: string; lat: number; lng: number; } | null;
  _userLocation?: { address: string; lat: number; lng: number; } | null;
}

const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({ onSuccess, onBack, _userLocation }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Login with Appwrite
      const session = await authService.login(email, password);
      console.log('✅ Login successful:', session);

      // Get user profile
      const currentUser = await authService.getCurrentUser();
      const userProfile = await userService.getByEmail(currentUser.email);

      if (!userProfile) {
        setError('User profile not found. Please register again.');
        setIsLoading(false);
        return;
      }

      // Play success sound
      const audio = new Audio('/sounds/success-notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      onSuccess({ ...currentUser, ...userProfile });
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    console.log('📝 Register button clicked!');
    e.preventDefault();
    setError('');

    // Location is not required for user registration anymore

    // Validation
    if (!email || !password) {
      console.log('❌ Validation failed: Missing email or password');
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Validation failed: Passwords do not match');
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      console.log('❌ Validation failed: Password too short');
      setError('Password must be at least 8 characters');
      return;
    }

    console.log('✅ Validation passed, setting loading state...');
    setIsLoading(true);

    try {
      console.log('🚀 Starting registration process...');
      
      // Register with Appwrite
      const user = await authService.register(email, password, email.split('@')[0]);
      console.log('✅ Registration successful:', user);

      // Create user profile - Use smaller integer for userId
      const userData = {
        userId: Math.floor(Date.now() / 1000), // Unix timestamp (smaller integer)
        collectionId: 1,
        name: email.split('@')[0],
        email: email,
        phoneNumber: '',
        isActivated: true,
        memberSince: new Date().toISOString()
      };
      
      console.log('📝 Creating user with data:', userData);
      console.log('📝 userId type:', typeof userData.userId);
      console.log('📝 collectionId type:', typeof userData.collectionId);
      
      const userProfileDoc = await userService.create(userData);
      console.log('✅ User profile created:', userProfileDoc);

      // Play success sound
      const audio = new Audio('/sounds/success-notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      // Auto-login after registration
      console.log('🔄 Getting current user...');
      const currentUser = await authService.getCurrentUser();
      console.log('✅ Current user:', currentUser);
      
      console.log('🔄 Getting user profile by email...');
      const userProfile = await userService.getByEmail(currentUser.email);
      console.log('✅ User profile:', userProfile);

      console.log('🔄 Calling onSuccess callback...');
      onSuccess({ ...currentUser, ...userProfile }, true); // true = isNewUser
      console.log('✅ Registration process completed successfully!');
      
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        type: err.type,
        stack: err.stack
      });
      setError(err.message || 'Registration failed. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden fixed inset-0">
      <PageNumberBadge pageNumber={61} pageName="CustomerAuth" isLocked={false} />
      
      {/* Global Header */}
      <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {/* Brand: Inda (black) + street (orange) */}
            <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
          </h1>
          <div className="flex items-center gap-3 text-gray-600">
            {/* Back to Home Button */}
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors" 
              title="Back to Home"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>

            <button onClick={() => {
              console.log('🍔 Burger menu clicked! Current isMenuOpen:', isMenuOpen);
              setIsMenuOpen(true);
            }} title="Menu" style={{ zIndex: 9999, position: 'relative' }}>
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
          onMassageJobsClick={() => {}}
          onHotelPortalClick={() => {}}
          onVillaPortalClick={() => {}}
          onTherapistPortalClick={() => {}}
          onMassagePlacePortalClick={() => {}}
          onAgentPortalClick={() => {}}
          onCustomerPortalClick={() => {}}
          onAdminPortalClick={() => {}}
          onTermsClick={() => {}}
          onPrivacyClick={() => {}}
          therapists={[]}
          places={[]}
        />
      </React19SafeWrapper>

      {/* Main Content */}
      <main 
        className="flex-1 flex items-start justify-center px-4 py-2 overflow-hidden relative bg-cover bg-center bg-no-repeat min-h-0"
        style={{
          backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/admin%20login%20dash%20baord.png?updatedAt=1763186156216)'
        }}
      >
        <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Customer</h2>
            <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Access your bookings and rewards</p>
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

          <div className="flex mb-4 sm:mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                mode === 'login' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                mode === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
              }`}
            >
              Create Account
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
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
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
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
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/20 focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400 transition-all bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 shadow-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
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

              <div className="mt-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg border border-white/30 shadow">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">🎁 Member Benefits:</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ Book appointments with calendar</li>
                  <li>✅ Track your booking history</li>
                  <li>✅ Save favorite therapists</li>
                  <li>✅ Get exclusive member discounts</li>
                  <li>✅ Loyalty rewards program</li>
                </ul>
              </div>
            </form>
          )}
        </div>
      </main>

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

export default CustomerAuthPage;
