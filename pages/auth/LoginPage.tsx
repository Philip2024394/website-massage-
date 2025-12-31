import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { membershipSignupService } from '../../lib/services/membershipSignup.service';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';

interface LoginPageProps {
  onNavigate?: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  // Normalize 'gb' to 'en' for translations
  const normalizedLang = language === 'gb' ? 'en' : language;
  const t = translations[normalizedLang].auth;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Normalize email (trim and lowercase) BEFORE submission
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      console.log('🔑 Signing in user:', normalizedEmail);
      
      // Sign in using existing service with normalized email
      const session = await membershipSignupService.signIn(normalizedEmail, formData.password);
      
      console.log('✅ Sign in successful:', session);
      
      // Get user profile to determine redirect
      const userProfile = await membershipSignupService.getCurrentUserProfile();
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      console.log('👤 User profile:', userProfile);

      // Redirect to appropriate dashboard based on role (no package check needed)
      const role = userProfile.portalType || 'therapist';
      console.log('🎯 Redirecting to dashboard for role:', role);
      
      switch (role) {
        case 'therapist':
          if (onNavigate) {
            onNavigate('therapist');
          } else {
            window.location.href = '/dashboard/therapist';
          }
          break;
        case 'massage_place':
          if (onNavigate) {
            onNavigate('massagePlace');
          } else {
            window.location.href = '/dashboard/massage-place';
          }
          break;
        case 'facial_place':
          if (onNavigate) {
            onNavigate('facialPlace');
          } else {
            window.location.href = '/dashboard/facial-place';
          }
          break;
        default:
          // Default to therapist dashboard
          if (onNavigate) {
            onNavigate('therapist');
          } else {
            window.location.href = '/dashboard/therapist';
          }
      }

    } catch (error) {
      console.error('❌ Sign in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          <div className="text-center space-y-2">
            <button
              type="button"
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              Forgot your password?
            </button>
            
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('home');
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Create one now
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;