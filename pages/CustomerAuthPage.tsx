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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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
    if (!name || !email || !password || !phone) {
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
      const user = await authService.register(email, password, name);
      console.log('✅ Registration successful:', user);

      // Create user profile WITH LOCATION
      await userService.create({
        userId: user.$id,
        name,
        email,
        phone,
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Home Button - Circular */}
        <button
          onClick={onBack}
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-orange-300 hover:scale-110 transition-all duration-300 flex items-center justify-center z-10 border-4 border-white"
          title="Return to Home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        {/* Logo/Title */}
        <div className="text-center mb-8 mt-4">
          <div className="text-5xl mb-3">👤</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Join IndaStreet'}
          </h1>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Login to book your favorite therapists' 
              : 'Create account to start booking'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
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
              <label className="block text-gray-700 font-semibold mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="+62 812 3456 7890"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Re-enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
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

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="text-orange-500 font-bold hover:underline"
            >
              {mode === 'login' ? 'Register Now' : 'Login Here'}
            </button>
          </p>
        </div>

        {/* Benefits Section */}
        {mode === 'register' && (
          <div className="mt-6 bg-orange-50 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-2">🎁 Member Benefits:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
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
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
            {/* Icon */}
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-orange-500" />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Location Required
            </h2>

            {/* Message */}
            <p className="text-gray-700 text-center mb-2 leading-relaxed">
              You must set your location before registering an account.
            </p>
            <p className="text-gray-600 text-sm text-center mb-6">
              This helps us show you nearby therapists and provide accurate service.
            </p>

            {/* Location Display */}
            {userLocation && userLocation.address ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800 font-semibold mb-1">📍 Current Location:</p>
                <p className="text-sm text-green-700">{userLocation.address}</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 font-semibold mb-1">⚠️ No Location Set</p>
                <p className="text-xs text-red-700">Please use "Set My Location" button on the home page</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLocationWarning(false);
                  onBack(); // Go back to home page where they can set location
                }}
                className="w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" />
                Go Set My Location
              </button>
              <button
                onClick={() => setShowLocationWarning(false)}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300 font-semibold"
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
