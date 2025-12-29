import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Building2, Sparkles } from 'lucide-react';
import { membershipSignupService, type PortalType } from '../lib/services/membershipSignup.service';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../translations';

interface SignupPageProps {
  onNavigate?: (page: string) => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  // Normalize 'gb' to 'en' for translations
  const normalizedLang = language === 'gb' ? 'en' : language;
  const t = translations[normalizedLang].auth;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<PortalType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    termsAccepted: false,
  });

  // Extract role from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role') as PortalType;
    
    if (roleParam && ['therapist', 'massage_place', 'facial_place'].includes(roleParam)) {
      setRole(roleParam);
    } else {
      // If no valid role, redirect to home
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.href = '/';
      }
    }
  }, [onNavigate]);

  const getRoleDisplay = (role: PortalType) => {
    switch (role) {
      case 'massage_therapist':
        return { name: 'Massage Therapist', icon: User };
      case 'massage_place':
        return { name: 'Massage Spa', icon: Building2 };
      case 'facial_place':
        return { name: 'Facial Clinic', icon: Sparkles };
      default:
        return { name: 'Provider', icon: User };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role) {
      setError('Role not specified');
      return;
    }

    if (!formData.termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Creating account with role:', role);
      
      // Create account with automatic Pro plan (30% commission)
      const result = await membershipSignupService.createAccountSimplified({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        portalType: role
      });

      console.log('✅ Account created successfully:', result);
      
      // Redirect directly to appropriate dashboard based on role
      redirectToDashboard();

    } catch (error) {
      console.error('❌ Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const redirectToDashboard = () => {
    // Redirect to appropriate dashboard based on role
    switch (role) {
      case 'massage_therapist':
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
  };

  if (!role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const roleDisplay = getRoleDisplay(role);
  const IconComponent = roleDisplay.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Join as {roleDisplay.name}</h1>
          <p className="mt-2 text-sm text-gray-600">Create your account to get started</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter your full name"
              />
            </div>

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
                  placeholder="Create a password"
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

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="/terms" className="text-orange-600 hover:text-orange-500">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-orange-600 hover:text-orange-500">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !formData.termsAccepted}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate('login');
                  } else {
                    window.location.href = '/login';
                  }
                }}
                className="font-medium text-orange-600 hover:text-orange-500"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;