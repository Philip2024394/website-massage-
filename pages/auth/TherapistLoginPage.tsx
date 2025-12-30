import React, { useState, useEffect } from 'react';
import { therapistAuth } from '../../lib/auth';
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus, Home, CheckCircle, Star } from 'lucide-react';
import BurgerMenuIcon from '../../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../../components/AppDrawerClean';
import { React19SafeWrapper } from '../../components/React19SafeWrapper';
import PageNumberBadge from '../../components/PageNumberBadge';


interface TherapistLoginPageProps {
    onSuccess: (therapistId: string) => void;
    onBack: () => void;
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
}

const TherapistLoginPage: React.FC<TherapistLoginPageProps> = ({ 
    onSuccess, 
    onBack: _onBack, 
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
    onNavigate
}) => {
    const [viewMode, setViewMode] = useState<'login' | 'register'>('login');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [registerData, setRegisterData] = useState({
        email: '',
        password: ''
    });
    const [selectedPackage, setSelectedPackage] = useState<{ plan: 'pro' | 'plus', selectedAt: string } | null>(null);

    // Load selected package from localStorage
    useEffect(() => {
        const packageStr = localStorage.getItem('packageDetails');
        if (packageStr) {
            try {
                const pkg = JSON.parse(packageStr);
                setSelectedPackage(pkg);
            } catch (e) {
                console.error('Failed to parse package details:', e);
            }
        }
    }, []);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // For now, use email-based auth (phone auth can be added later)
            const email = phoneNumber.includes('@') ? phoneNumber : `${phoneNumber}@therapist.local`;
            const response = await therapistAuth.signIn(email, password);
            
            if (response.success && response.userId) {
                // Note: Daily sign-in tracking for coin rewards has been disabled
                
                // Clear any cached data
                sessionStorage.clear();
                localStorage.removeItem('therapist-cache');
                
                const therapistId = response.documentId || response.userId;
                console.log('✅ [Login Success] Redirecting to therapist dashboard with ID:', therapistId);
                
                // Redirect to therapist dashboard using page state navigation
                if (onNavigate) {
                    onNavigate('therapist');
                } else {
                    console.error('❌ onNavigate prop is missing - cannot redirect to dashboard');
                }
            } else {
                const errorMessage = typeof response.error === 'string' ? response.error : 'Sign in failed. Please try again.';
                throw new Error(errorMessage);
            }
        } catch (err: any) {
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Authentication failed. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('🔵 Starting registration...');
            const response = await therapistAuth.signUp(registerData.email, registerData.password);
            console.log('📊 Registration response:', response);
            
            if (response.success && response.userId) {
                console.log('✅ Registration successful, account created!');
                // Redirect to therapist dashboard after successful registration
                if (onNavigate) {
                    onNavigate('therapist');
                } else {
                    console.error('❌ onNavigate prop is missing - cannot redirect to dashboard');
                }
            } else {
                const errorMessage = typeof response.error === 'string' ? response.error : 'Registration failed. Please try again.';
                throw new Error(errorMessage);
            }
        } catch (err: any) {
            console.error('❌ Registration error:', err);
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Registration failed. Please try again.');
            setError(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden fixed inset-0">
            <PageNumberBadge pageNumber={4} pageName="TherapistLoginPage" isLocked={false} />
            
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
                        <button onClick={_onBack} title="Go to Home" className="hover:text-orange-500 transition-colors">
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
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20therapist%20bew.png?updatedAt=1763136088363)'
                }}
            >
                <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Header - Positioned right under header area */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Therapist</h2>
                        <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Manage your massage services and bookings</p>
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
                                setError(''); // Clear error when switching modes
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
                                setError(''); // Clear error when switching modes
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

                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                    <input
                                        type="email"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                                        🔑 Sign In to Therapist
                                    </div>
                                )}
                            </button>
                        </form>
                    )}

                    {viewMode === 'register' && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-6">

                            {/* Selected Package Display */}
                            {selectedPackage && (
                                <div className={`p-4 rounded-xl border-2 ${selectedPackage.plan === 'pro' ? 'border-orange-200 bg-orange-50' : 'border-purple-200 bg-purple-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <h3 className="font-bold text-gray-900">
                                                {selectedPackage.plan === 'pro' ? 'Pro Plan Selected' : 'Plus Plan Selected'}
                                            </h3>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {selectedPackage.plan === 'pro' ? (
                                                <>
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                                                    <Star className="w-4 h-4 fill-gray-300 text-gray-300" />
                                                </>
                                            ) : (
                                                <>
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700">
                                        {selectedPackage.plan === 'pro' 
                                            ? 'Rp 0/month + 30% commission per booking' 
                                            : 'Rp 250,000/month + 0% commission'}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                    <input
                                        type="email"
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
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
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
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

                            {/* Package Info Message */}
                            {selectedPackage && (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                    <p className="text-sm text-blue-800 font-semibold flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" />
                                        {selectedPackage.plan === 'pro' 
                                            ? 'Pro Plan Selected - No upfront payment needed!' 
                                            : 'Plus Plan Selected - Payment required when you go live'}
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        {selectedPackage.plan === 'pro'
                                            ? 'Start building your profile now. 30% commission applies when you get bookings.'
                                            : 'Complete your profile first. You\'ll upload payment proof when ready to go live.'}
                                    </p>
                                </div>
                            )}

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
                                        {selectedPackage?.plan === 'plus' 
                                            ? 'Create Account & Build Profile' 
                                            : 'Create Therapist Account'}
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

export default TherapistLoginPage;