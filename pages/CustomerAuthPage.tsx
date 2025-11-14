import React, { useState } from 'react';
import { authService, userService } from '../lib/appwriteService';
import { LogIn, UserPlus } from 'lucide-react';
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
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <PageNumberBadge pageNumber={61} pageName="CustomerAuth" isLocked={false} />
      
      {/* Global Header */}
      <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {/* Brand: Inda (black) + street (orange) */}
            <span className="text-black">Inda</span><span className="text-orange-500">street</span>
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
      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">Street</span>
          </h1>
          <p className="text-gray-600 font-medium">Customer Account</p>
        </div>

        <div className="flex mb-6 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
              mode === 'login' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
              mode === 'register' ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-gray-900 placeholder-gray-500 shadow-sm"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-gray-900 placeholder-gray-500 shadow-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                '⏳ Logging in...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-gray-900 placeholder-gray-500 shadow-sm"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-gray-900 placeholder-gray-500 shadow-sm"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl p-3 pr-12 focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all text-gray-900 placeholder-gray-500 shadow-sm"
                  placeholder="Re-enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={() => console.log('🖱️ Button clicked directly!')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                '⏳ Creating Account...'
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>
        )}

        {/* Benefits Section */}
        {mode === 'register' && (
          <div className="mt-6 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">🎁 Member Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Book appointments with calendar</li>
              <li>✅ Track your booking history</li>
              <li>✅ Save favorite therapists</li>
              <li>✅ Get exclusive member discounts</li>
              <li>✅ Loyalty rewards program</li>
            </ul>
          </div>
        )}
        </div>
      </main>
    </div>
  );
};

export default CustomerAuthPage;
