import React, { useState } from 'react';
import { authService, userService } from '../lib/appwriteService';
import { LogIn, UserPlus, MapPin } from 'lucide-react';

interface CustomerAuthPageProps {
  onSuccess: (user: any, isNewUser?: boolean) => void;
  onBack: () => void;
  userLocation: { address: string; lat: number; lng: number; } | null;
}

const CustomerAuthPage: React.FC<CustomerAuthPageProps> = ({ onSuccess, onBack, userLocation }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
      const userProfile = await userService.getByUserId(currentUser.$id);

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
    e.preventDefault();
    setError('');

    // ⚠️ LOCATION REQUIRED CHECK
    if (!userLocation || !userLocation.address) {
      setShowLocationWarning(true);
      setError('');
      return;
    }

    // Validation
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Register with Appwrite
      const user = await authService.register(email, password, email.split('@')[0]);
      console.log('✅ Registration successful:', user);

      // Create user profile WITH LOCATION
      await userService.create({
        userId: user.$id,
        name: email.split('@')[0], // Use email prefix as default name
        email,
        location: userLocation.address, // Save user's location
        coordinates: JSON.stringify({ lat: userLocation.lat, lng: userLocation.lng }),
        createdAt: new Date().toISOString(),
        totalBookings: 0,
        membershipLevel: 'free'
      });

      // Play success sound
      const audio = new Audio('/sounds/success-notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});

      // Auto-login after registration
      const currentUser = await authService.getCurrentUser();
      const userProfile = await userService.getByUserId(currentUser.$id);

      onSuccess({ ...currentUser, ...userProfile }, true); // true = isNewUser
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/massage%20image%208.png?updatedAt=1760187222991')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Home Button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all z-20 border border-orange-400"
        aria-label="Go to home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      {/* Glass Effect Login Container */}
      <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-white">Inda</span>
            <span className="text-orange-400">Street</span>
          </h1>
          <p className="text-white/90 font-medium">Customer Account</p>
        </div>

        <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              mode === 'login' ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-md transition-all ${
              mode === 'register' ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-red-500/20 text-red-100 border border-red-400/30">
            {error}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all mt-6 disabled:opacity-50"
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
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all mt-6 disabled:opacity-50"
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
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <h3 className="font-bold text-white mb-2">🎁 Member Benefits:</h3>
            <ul className="text-sm text-white/90 space-y-1">
              <li>✅ Book appointments with calendar</li>
              <li>✅ Track your booking history</li>
              <li>✅ Save favorite therapists</li>
              <li>✅ Get exclusive member discounts</li>
              <li>✅ Loyalty rewards program</li>
            </ul>
          </div>
        )}
      </div>

      {/* Location Warning Modal */}
      {showLocationWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl max-w-md w-full p-8 relative border border-white/20">
            {/* Icon */}
            <div className="w-20 h-20 bg-orange-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-orange-400" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-4">
              Location Required
            </h2>

            {/* Message */}
            <p className="text-white/90 text-center mb-2 leading-relaxed">
              You must set your location before registering an account.
            </p>
            <p className="text-white/70 text-sm text-center mb-6">
              This helps us show you nearby therapists and provide accurate service.
            </p>

            {/* Location Display */}
            {userLocation && userLocation.address ? (
              <div className="bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-100 font-semibold mb-1">📍 Current Location:</p>
                <p className="text-sm text-green-200">{userLocation.address}</p>
              </div>
            ) : (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-100 font-semibold mb-1">⚠️ No Location Set</p>
                <p className="text-xs text-red-200">Please use "Set My Location" button on the home page</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLocationWarning(false);
                  onBack(); // Go back to home page where they can set location
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MapPin className="w-5 h-5" />
                Go Set My Location
              </button>
              <button
                onClick={() => setShowLocationWarning(false)}
                className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white py-3 rounded-lg hover:bg-white/30 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerAuthPage;
