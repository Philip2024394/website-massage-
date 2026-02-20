// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Building2, Sparkles } from 'lucide-react';
import { membershipSignupService, type PortalType } from '../../lib/services/membershipSignup.service';
import { useLanguage } from '../../hooks/useLanguage';
import { translations } from '../../translations';
// import { LEGAL_TERMS } from '../../src/legal/terms'; // Commented out - module not found

interface SignupPageProps {
  onNavigate?: (page: string) => void;
  /** When set (e.g. from facial-therapist-signup route), use this role instead of URL */
  initialRole?: PortalType;
}

const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, initialRole: initialRoleProp }) => {
  const { language } = useLanguage();
  // Normalize 'gb' to 'en' for translations
  const normalizedLang = (language as string) === 'gb' ? 'en' : language;
  const t = translations[normalizedLang].auth;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<PortalType | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsappNumber: '', // WhatsApp number without +62 prefix
    termsAccepted: false,
  });

  // Role: from initialRole prop (separate create-account routes) or from URL params
  useEffect(() => {
    if (initialRoleProp && ['therapist', 'massage_therapist', 'facial_therapist', 'beauty_therapist', 'massage_place', 'facial_place'].includes(initialRoleProp)) {
      setRole(initialRoleProp);
      return;
    }
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role') as PortalType;
    
    if (roleParam && ['therapist', 'massage_therapist', 'facial_therapist', 'beauty_therapist', 'massage_place', 'facial_place'].includes(roleParam)) {
      setRole(roleParam);
    } else {
      // If no valid role, redirect to home
      if (onNavigate) {
        onNavigate('home');
      } else {
        window.location.href = '/';
      }
    }
  }, [onNavigate, initialRoleProp]);

  const getRoleDisplay = (role: PortalType) => {
    switch (role) {
      case 'massage_therapist':
      case 'therapist':
        return { name: 'Massage Therapist', icon: User };
      case 'facial_therapist':
        return { name: 'Facial (Home Service)', icon: Sparkles };
      case 'beauty_therapist':
        return { name: 'Beauty (Home Service)', icon: Sparkles };
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

    // Validate WhatsApp number
    if (!formData.whatsappNumber || formData.whatsappNumber.trim() === '') {
      setError('WhatsApp number is required');
      return;
    }

    // Remove any non-digit characters from WhatsApp number
    const cleanedWhatsApp = formData.whatsappNumber.replace(/\D/g, '');
    
    if (cleanedWhatsApp.length < 8 || cleanedWhatsApp.length > 15) {
      setError('Please enter a valid WhatsApp number (8-15 digits)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Creating account with role:', role);
      
      // Normalize email (trim and lowercase) BEFORE submission
      const normalizedEmail = formData.email.trim().toLowerCase();
      
      // Format WhatsApp with +62 prefix
      const formattedWhatsApp = `+62${cleanedWhatsApp}`;
      
      // Create account with automatic Pro plan (30% commission)
      const result = await membershipSignupService.createAccountSimplified({
        name: formData.name,
        email: normalizedEmail,
        password: formData.password,
        whatsappNumber: formattedWhatsApp,
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
    // Separate dashboards: Massage, Facial, Beautician each have their own dashboard
    switch (role) {
      case 'massage_therapist':
      case 'therapist':
        if (onNavigate) {
          onNavigate('massage-therapist-dashboard');
        } else {
          window.location.href = '/#/massage-therapist-dashboard';
        }
        break;
      case 'facial_therapist':
        if (onNavigate) {
          onNavigate('facial-therapist-dashboard');
        } else {
          window.location.href = '/#/facial-therapist-dashboard';
        }
        break;
      case 'beauty_therapist':
        if (onNavigate) {
          onNavigate('beautician-therapist-dashboard');
        } else {
          window.location.href = '/#/beautician-therapist-dashboard';
        }
        break;
      case 'massage_place':
        if (onNavigate) {
          onNavigate('massage-place-dashboard');
        } else {
          window.location.href = '/dashboard/massage-place';
        }
        break;
      case 'facial_place':
        if (onNavigate) {
          onNavigate('facial-place-dashboard');
        } else {
          window.location.href = '/dashboard/facial-place';
        }
        break;
      default:
        if (onNavigate) {
          onNavigate('massage-therapist-dashboard');
        } else {
          window.location.href = '/#/massage-therapist-dashboard';
        }
    }
  };

  if (!role) {
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
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
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
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
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-gray-700 font-medium text-sm">
                  +62
                </span>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => {
                    // Only allow digits
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, whatsappNumber: value }));
                  }}
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="812345678"
                  maxLength={13}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Enter your number without the country code (+62)
              </p>
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

          {/* Terms & Independent Contractor Agreement */}
          <div className="space-y-3">
            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={formData.termsAccepted}
                onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="h-4 w-4 mt-1 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                <span className="font-medium">
                  {normalizedLang === 'id' ? LEGAL_TERMS.CHECKBOX_LABEL.id : LEGAL_TERMS.CHECKBOX_LABEL.en}
                  <span className="text-red-500"> *</span>
                </span>
              </label>
            </div>
            
            {/* Key Terms Summary */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-gray-700">
              <p className="font-semibold text-orange-800 mb-2">
                {normalizedLang === 'id' ? 'Ringkasan Penting:' : 'Key Points:'}
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>{normalizedLang === 'id' ? 'Anda bergabung sebagai kontraktor independen (wiraswasta)' : 'You join as an independent contractor (self-employed)'}</li>
                <li>{normalizedLang === 'id' ? 'IndaStreetMassage hanya platform pemesanan, bukan pemberi kerja' : 'IndaStreetMassage is a booking platform only, not an employer'}</li>
                <li>{normalizedLang === 'id' ? 'Anda bertanggung jawab atas pajak, lisensi, dan kewajiban hukum' : 'You are responsible for taxes, licenses, and legal obligations'}</li>
                <li>{normalizedLang === 'id' ? 'Komisi berlaku untuk semua pemesanan dari platform' : 'Commission applies to all platform-originated bookings'}</li>
                <li>{normalizedLang === 'id' ? 'Pembayaran langsung antara Anda dan pelanggan' : 'Payments are direct between you and customers'}</li>
              </ul>
              <a 
                href="/terms" 
                target="_blank"
                className="inline-block mt-2 text-orange-600 hover:text-orange-700 font-medium"
              >
                {normalizedLang === 'id' ? 'Baca Syarat Lengkap →' : 'Read Full Terms →'}
              </a>
            </div>
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