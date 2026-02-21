// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState } from 'react';
import { Eye, EyeOff, User, Building, Sparkles, Mail, Lock, CheckCircle, ArrowLeft, Home, AlertCircle } from 'lucide-react';
import { account, ID } from '../../lib/appwrite';
import { therapistAuth, placeAuth } from '../../lib/auth';
import BurgerMenuIcon from '../../components/icons/BurgerMenuIcon';
import PageNumberBadge from '../../components/PageNumberBadge';
import { AppDrawer } from '../../components/AppDrawerClean';

// Email validation regex - safe standard pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AccountType = 'massage_therapist' | 'massage_place' | 'facial_place';

interface CreateAccountPageProps {
  onNavigate?: (page: string) => void;
  onBack?: () => void;
  onNavigateHome?: () => void;
}

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ 
  onNavigate, 
  onBack, 
  onNavigateHome 
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    whatsappNumber: '',
    country: '',
    accountType: null as AccountType | null,
    password: '',
    termsAccepted: false,
    profilePhotoAgreed: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const accountTypes = [
    {
      type: 'massage_therapist' as AccountType,
      title: 'Massage Therapist',
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      description: 'Individual massage therapist'
    },
    {
      type: 'massage_place' as AccountType,
      title: 'Massage Place',
      icon: Building,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 border-orange-200',
      description: 'Massage spa or wellness center'
    },
    {
      type: 'facial_place' as AccountType,
      title: 'Facial Place',
      icon: Sparkles,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 border-purple-200',
      description: 'Facial spa or beauty clinic'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Normalize email (trim and lowercase) BEFORE validation and submission
    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedName = formData.name.trim();
    const normalizedWhatsApp = formData.whatsappNumber.trim().replace(/\D/g, ''); // Remove non-digits

    // Validation
    if (!normalizedEmail) {
      setError('Please enter your email address');
      return;
    }
    
    // Email format validation - safe standard regex
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!normalizedName) {
      setError('Please enter your name');
      return;
    }
    
    if (!normalizedWhatsApp) {
      setError('Please enter your WhatsApp number');
      return;
    }
    
    if (normalizedWhatsApp.length < 9 || normalizedWhatsApp.length > 13) {
      setError('Please enter a valid WhatsApp number (9-13 digits)');
      return;
    }
    
    if (!formData.country || !formData.country.trim()) {
      setError('Please enter your country');
      return;
    }
    if (!formData.accountType) {
      setError('Please select a portal type');
      return;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!formData.termsAccepted) {
      setError('Please accept the Terms and Conditions');
      return;
    }
    if (!formData.profilePhotoAgreed) {
      setError('Please accept the Profile Photo Policy');
      return;
    }

    setLoading(true);

    try {
      let response;
      const whatsAppWithPrefix = '+62' + normalizedWhatsApp;
      
      if (formData.accountType === 'massage_therapist') {
        // Use therapist auth service with normalized email, name, and WhatsApp
        response = await therapistAuth.signUp(normalizedEmail, formData.password, normalizedName, whatsAppWithPrefix);
        
        if (response.success) {
          console.log('✅ Therapist account created successfully! Please sign in...');
          // Show success message and redirect to sign-in page
          setError(null);
          alert('Account created successfully! Please sign in to continue.');
          if (onNavigate) {
            onNavigate('sign-in');
          } else {
            window.location.href = '/login';
          }
          return;
        }
      } else if (formData.accountType === 'massage_place') {
        // Use place auth service for massage place with normalized email, name, and WhatsApp
        response = await placeAuth.signUp(normalizedEmail, formData.password, normalizedName, whatsAppWithPrefix);
        
        if (response.success) {
          console.log('✅ Massage place account created successfully! Please sign in...');
          // Show success message and redirect to sign-in page
          setError(null);
          alert('Account created successfully! Please sign in to continue.');
          if (onNavigate) {
            onNavigate('sign-in');
          } else {
            window.location.href = '/login';
          }
          return;
        }
      } else if (formData.accountType === 'facial_place') {
        // Use place auth service for facial place with normalized email, name, and WhatsApp
        response = await placeAuth.signUp(normalizedEmail, formData.password, normalizedName, whatsAppWithPrefix);
        
        if (response.success) {
          console.log('✅ Facial place account created successfully! Please sign in...');
          // Show success message and redirect to sign-in page
          setError(null);
          alert('Account created successfully! Please sign in to continue.');
          if (onNavigate) {
            onNavigate('sign-in');
          } else {
            window.location.href = '/login';
          }
          return;
        }
      }

      // If we get here, something went wrong
      setError(response?.error || 'Failed to create account: ' + (response?.error || 'Unknown error'));
      
    } catch (err: any) {
      console.error('❌ Account creation error:', err);
      setError('Failed to create account: ' + (err.message || 'An error occurred while creating your account'));
    } finally {
      setLoading(false);
    }
  };

  const selectedAccountType = accountTypes.find(type => type.type === formData.accountType);

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 relative overflow-hidden">
      <PageNumberBadge pageNumber={999} pageName="CreateAccountPage" isLocked={false} />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div 
        className="absolute inset-0 opacity-30" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      {/* Header */}
      <header className="relative z-10 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-2xl font-bold text-white">
            <span>Inda</span><span className="text-orange-200">Street</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          {onNavigateHome && (
            <button 
              onClick={onNavigateHome}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
            >
              <Home className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
          >
            <BurgerMenuIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Join IndaStreet as a service provider</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              {/* WhatsApp Number Input */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-medium">
                    +62
                  </div>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      setFormData({ ...formData, whatsappNumber: value });
                    }}
                    className="block w-full pl-14 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="812345678"
                    required
                    maxLength={13}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter your number without +62 prefix (e.g., 812345678)
                </p>
              </div>

              {/* Country Input */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="block w-full pl-3 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="e.g. Indonesia, Singapore"
                  required
                />
              </div>

              {/* Portal Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Portal Type *
                </label>
                <div className="space-y-3">
                  {accountTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.type}
                        className={`block cursor-pointer p-4 border-2 rounded-lg transition-all ${
                          formData.accountType === type.type
                            ? `${type.bgColor} border-current`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name="accountType"
                            value={type.type}
                            checked={formData.accountType === type.type}
                            onChange={(e) => setFormData({ ...formData, accountType: e.target.value as AccountType })}
                            className="sr-only"
                          />
                          <Icon className={`w-6 h-6 ${type.color} mr-3 flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{type.title}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </div>
                          {formData.accountType === type.type && (
                            <CheckCircle className={`w-5 h-5 ${type.color}`} />
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
              </div>

              {/* Profile Photo Agreement */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <input
                    id="profilePhoto"
                    type="checkbox"
                    checked={formData.profilePhotoAgreed}
                    onChange={(e) => setFormData({ ...formData, profilePhotoAgreed: e.target.checked })}
                    className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="profilePhoto" className="ml-3 block text-sm text-gray-900">
                    <span className="font-semibold">⚠️ Profile Photo Policy:</span> I understand that I must upload a <span className="font-bold text-red-600">real photo of myself</span> as my profile picture. Uploading any other image (cartoon, logo, celebrity, etc.) will result in <span className="font-bold text-red-600">immediate account deactivation</span>. *
                    <button
                      type="button"
                      onClick={() => setShowPhotoModal(true)}
                      className="ml-2 text-orange-600 hover:text-orange-700 underline font-medium"
                    >
                      Read Full Policy
                    </button>
                  </label>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  required
                />
                <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate?.('terms')}
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate?.('privacy')}
                    className="text-orange-600 hover:text-orange-700 underline font-medium"
                  >
                    Privacy Policy
                  </button>
                  , and I understand that posting or commenting on IndaStreet News may require admin approval before appearing publicly. *
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Create Account
                  </div>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate?.('sign-in')}
                  className="text-orange-600 hover:text-orange-700 underline font-medium"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Photo Policy Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] ">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">⚠️ Profile Photo Policy</h2>
              <p className="text-orange-100 mt-1">Important Account Security Notice</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Critical Warning */}
              <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🚫</div>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg mb-2">Account Deactivation Policy</h3>
                    <p className="text-red-800 font-medium">
                      Your account will be <span className="font-bold underline">IMMEDIATELY DEACTIVATED</span> if you upload any photo that is NOT a real picture of yourself.
                    </p>
                  </div>
                </div>
              </div>

              {/* What You MUST Upload */}
              <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                <h3 className="font-bold text-green-900 text-lg mb-3 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6" /> You MUST Upload:
                </h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-xl">✅</span>
                    <span>A clear, recent photo of your face</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">✅</span>
                    <span>A professional photo showing you clearly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">✅</span>
                    <span>Your actual appearance for client identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">✅</span>
                    <span>Real photo that matches your identity (KTP)</span>
                  </li>
                </ul>
              </div>

              {/* What is PROHIBITED */}
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <h3 className="font-bold text-red-900 text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6" /> PROHIBITED - Will Deactivate Account:
                </h3>
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Cartoon or anime images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Celebrity or famous person photos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Company logos or brand images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Stock photos or AI-generated images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Photos of other people (not you)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Blank images, patterns, or abstract art</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-xl">❌</span>
                    <span>Group photos where you cannot be identified</span>
                  </li>
                </ul>
              </div>

              {/* Why This Policy */}
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 text-lg mb-2">Why This Policy Exists:</h3>
                <ul className="space-y-2 text-blue-800 text-sm">
                  <li>• <strong>Client Safety:</strong> Clients need to identify you when you arrive</li>
                  <li>• <strong>Trust & Credibility:</strong> Real photos build customer confidence</li>
                  <li>• <strong>Legal Compliance:</strong> Photo must match government ID (KTP)</li>
                  <li>• <strong>Professional Standards:</strong> IndaStreet maintains quality service</li>
                  <li>• <strong>Security:</strong> Prevents fraud and impersonation</li>
                </ul>
              </div>

              {/* Admin Verification */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-2">🔍 Admin Verification Process:</h3>
                <p className="text-gray-700 text-sm">
                  Our admin team reviews all profile photos. If your photo does not show your real face clearly, your account will be deactivated immediately. You will receive an email notification explaining the reason.
                </p>
              </div>

              {/* Agreement Confirmation */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <p className="text-gray-900 font-semibold">
                  By checking the Profile Photo Policy checkbox, you confirm that:
                </p>
                <ul className="mt-2 space-y-1 text-gray-700 text-sm ml-4">
                  <li>✓ You will upload your real, personal photo</li>
                  <li>✓ The photo clearly shows your face</li>
                  <li>✓ You understand account deactivation consequences</li>
                  <li>✓ You accept this policy as binding</li>
                </ul>
              </div>
            </div>

            {/* Close Button */}
            <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-2xl">
              <button
                onClick={() => setShowPhotoModal(false)}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
              >
                I Understand - Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AppDrawer */}
      <AppDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isHome={true}
        onNavigate={onNavigate}
        therapists={[]}
        places={[]}
      />
    </div>
  );
};

export default CreateAccountPage;