// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { User, Lock, Mail, Square } from 'lucide-react';
import HomeIcon from '../../components/icons/HomeIcon';
import { authService, userService, therapistService, placesService } from '../../lib/appwriteService';
import { ID } from '../../lib/appwrite';
import { useTranslations } from '../../lib/useTranslations';

interface AuthPageProps {
    onAuthSuccess: (userType: string) => void;
    onBack: () => void;
    t?: any;
    mode?: 'signin' | 'signup' | 'unified';
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack, t: externalT, mode: propMode }) => {
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Use translations - fallback to empty object if not available
    const translationsResult = useTranslations();
    const t = externalT || translationsResult?.dict?.auth || {};

    // Use prop mode if provided, otherwise fallback to URL detection
    const mode = propMode || (
        window.location.pathname === '/signin' ? 'signin' :
        window.location.pathname === '/signup' ? 'signup' :
        'unified'
    );

    console.log('🔍 AuthPage RENDER - mode detection:', {
        propMode,
        pathname: window.location.pathname,
        finalMode: mode,
        shouldShowDropdown: mode !== 'signin',
        shouldShowTerms: mode !== 'signin'
    });

    const accountTypes = [
        { value: 'therapist', label: t?.massageTherapist || 'Massage Therapist' },
        { value: 'massage-place', label: t?.massageSpa || 'Massage Place' },
        { value: 'facial-place', label: t?.facialClinic || 'Facial Place' },
    ];

    const validateForm = () => {
        // Clear previous errors
        setError('');
        
        if (!email || !password) {
            setError(t?.fillFieldsError || 'Please fill all required fields');
            return false;
        }
        
        // Accept any email input - no format validation
        if (!email || !email.trim()) {
            setError(t?.pleaseEnterValidEmail || 'Please enter an email address');
            return false;
        }
        
        // Validate password length (Appwrite requires 8 characters minimum)
        if (password.length < 8) {
            setError(t?.passwordMinLength || 'Password must be at least 8 characters');
            return false;
        }
        
        // For signup mode, require account type and terms
        if (mode === 'signup') {
            if (!accountType) {
                setError(t?.pleaseSelectPortalType || 'Please select an account type');
                return false;
            }
            if (!acceptTerms) {
                setError(t?.pleaseAcceptTerms || 'Please accept terms & conditions');
                return false;
            }
        }
        
        // For signin mode, only need email and password
        if (mode === 'signin') {
            // Account type not required for signin
        }
        
        // For unified mode (auth page), require everything
        if (mode === 'unified') {
            if (!accountType) {
                setError(t?.pleaseSelectPortalType || 'Please select an account type');
                return false;
            }
            if (!acceptTerms) {
                setError('Please accept terms & conditions');
                return false;
            }
        }
        
        return true;
    };

    const createNewAccount = async (normalizedEmail: string, password: string, accountType: string) => {
        try {
            console.log('🔵 Step 1: Creating Appwrite auth account for:', normalizedEmail);
            
            // 1. Create Appwrite auth account
            const authUser = await authService.register(
                normalizedEmail,
                password,
                normalizedEmail.split('@')[0], // Use email prefix as name
                { autoLogin: true }
            );
            
            console.log('✅ Step 1 Complete: Auth account created with ID:', authUser.$id);
            console.log('🔵 Step 2: Creating profile document for account type:', accountType);
            
            // 2. Create corresponding profile document
            const profileData = {
                email: normalizedEmail,
                role: accountType,
                commission: 30, // Auto-assign 30% commission
                active: true, // Mark as active - no admin approval needed
                approved: true,
                userId: authUser.$id,
                createdAt: new Date().toISOString(),
                name: normalizedEmail.split('@')[0],
            };
            
            // Create profile in appropriate collection
            if (accountType === 'therapist') {
                const therapistId = ID.unique();
                console.log('🔵 Creating therapist profile with ID:', therapistId);
                await (therapistService as any).create({
                    email: profileData.email,
                    name: (profileData as any).name,
                    therapistId: therapistId,
                    id: therapistId,
                    countryCode: '+62',
                    whatsappNumber: '',
                    specialization: 'General Massage',
                    yearsOfExperience: 0,
                    isLicensed: false,
                    isLive: false,
                    hourlyRate: 100,
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    price60: '100',
                    price90: '150',
                    price120: '200',
                    coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                    location: 'Bali, Indonesia',
                    status: 'available',
                    availability: 'Available',
                    description: '',
                    profilePicture: '',
                    mainImage: '',
                    massageTypes: '',
                    languages: '',
                });
                console.log('✅ Therapist profile created successfully');
            } else if (accountType === 'massage-place') {
                const placeId = ID.unique();
                console.log('🔵 Creating massage place profile with ID:', placeId);
                await (placesService as any).create({
                    email: profileData.email,
                    name: (profileData as any).name,
                    id: placeId,
                    placeId: placeId,
                    category: 'massage-place',
                    password: '',
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    status: 'Closed',
                    isLive: false,
                    openingTime: '09:00',
                    closingTime: '21:00',
                    coordinates: [106.8456, -6.2088],
                    location: 'Bali, Indonesia',
                    description: '',
                    whatsappnumber: '',
                    mainimage: '',
                    profilePicture: '',
                    galleryImages: '[]',
                    massagetypes: '[]',
                    languagesspoken: '[]',
                    additionalservices: '[]',
                });
                console.log('✅ Massage place profile created successfully');
            } else if (accountType === 'facial-place') {
                const facialPlaceId = ID.unique();
                console.log('🔵 Creating facial place profile with ID:', facialPlaceId);
                await (placesService as any).create({
                    email: profileData.email,
                    name: (profileData as any).name,
                    facialPlaceId: facialPlaceId,
                    collectionName: 'facial_places',
                    category: 'spa',
                    description: '',
                    address: 'Bali, Indonesia',
                    lastUpdate: new Date().toISOString(),
                });
                console.log('✅ Facial place profile created successfully');
            }
            
            console.log('✅ Step 2 Complete: Profile document created');
            console.log('🔵 Step 3: Waiting for database indexing...');
            
            // Wait a moment for database to index the new document
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log('✅ Account creation process completed successfully');
            
        } catch (error: any) {
            console.error('❌ Account creation failed at step:', error);
            console.error('❌ Error details:', {
                message: error.message,
                code: error.code,
                type: error.type,
                response: error.response
            });
            
            // Provide specific error messages based on error type
            if (error.code === 409 || error.message?.includes('already exists')) {
                throw new Error('An account with this email already exists. Please sign in instead.');
            } else if (error.code === 400 || error.message?.includes('Password')) {
                throw new Error('Password must be at least 8 characters long.');
            } else if (error.code === 429 || error.message?.includes('rate limit')) {
                throw new Error('Too many attempts. Please wait a moment and try again.');
            } else {
                throw new Error(error.message || 'Failed to create account. Please try again.');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            // Normalize email
            const normalizedEmail = email.toLowerCase().trim();
            
            if (mode === 'signin') {
                // Sign in mode - try to login first, then get user profile
                try {
                    const user = await authService.login(normalizedEmail, password);
                    console.log('✅ Sign in successful');
                    console.log('✅ User ID:', user.$id);
                    console.log('✅ User email:', user.email);
                    
                    // Clear the start_fresh flag to allow session restoration
                    sessionStorage.removeItem('start_fresh');
                    console.log('✅ Cleared start_fresh flag - session can now be restored');
                    
                    // DIRECT THERAPIST LOOKUP - Check therapists collection directly
                    console.log('🔍 Looking up therapist by email:', normalizedEmail);
                    let userType = 'therapist'; // default assumption
                    
                    try {
                        const therapistData = await therapistService.getByEmail(normalizedEmail);
                        if (therapistData) {
                            console.log('✅ Found therapist profile:', (therapistData as any).name);
                            userType = 'therapist';
                        } else {
                            console.log('⚠️ No therapist found, checking places...');
                            // Try massage place
                            try {
                                const placeData = await placesService.getByEmail(normalizedEmail);
                                if (placeData) {
                                    console.log('✅ Found place profile:', (placeData as any).name);
                                    userType = 'massage-place';
                                }
                            } catch (e) {
                                console.log('⚠️ Not a massage place either');
                            }
                        }
                    } catch (error) {
                        console.warn('⚠️ Error checking therapist/place:', error);
                    }
                    
                    console.log('✅ Final user type:', userType);
                    onAuthSuccess(userType);
                } catch (error: any) {
                    console.error('❌ Sign in failed:', error);
                    
                    // Provide specific, helpful error messages with translations
                    if (error.message?.includes('Invalid credentials') || error.message?.includes('Invalid email or password')) {
                        setError(t?.errorIncorrectCredentials || '❌ Incorrect email or password. Please check:\n• Email is correct (case-sensitive)\n• Password is correct (case-sensitive)\n• No extra spaces in your input');
                    } else if (error.message?.includes('user') && error.message?.includes('not found')) {
                        setError(t?.errorUserNotFound || '❌ No account found with this email. Please:\n• Check the email spelling\n• Create a new account if you\'re a new user');
                    } else if (error.message?.includes('rate limit') || error.code === 429) {
                        setError(t?.errorRateLimit || '⚠️ Too many login attempts. Please wait a moment before trying again.');
                    } else {
                        const errorMsg = (t?.errorGenericSignIn || '❌ Sign in failed: {error}. Please try again or contact support if the problem persists.').replace('{error}', error.message || 'Unknown error');
                        setError(errorMsg);
                    }
                }
            } 
            else if (mode === 'signup') {
                // Signup mode - check if user already exists first
                try {
                    const existingUser = await userService.getByEmail(normalizedEmail);
                    if (existingUser) {
                        setError(t?.errorEmailAlreadyRegistered || '❌ This email is already registered. Please:\n• Use the Sign In button instead\n• Or use a different email address\n• Contact support if you forgot your password');
                        return;
                    }
                } catch (error) {
                    // User doesn't exist, continue with signup
                    console.log('✅ Email is available for signup');
                }
                
                try {
                    console.log('🔵 Starting account creation process...');
                    // Create new account
                    await createNewAccount(normalizedEmail, password, accountType);
                    
                    console.log('✅ Account created successfully!');
                    
                    // Clear the start_fresh flag to allow session restoration
                    sessionStorage.removeItem('start_fresh');
                    console.log('✅ Cleared start_fresh flag - session can now be restored');
                    
                    onAuthSuccess(accountType);
                } catch (error: any) {
                    console.error('❌ Account creation failed:', error);
                    
                    // Enhanced error messages for signup with translations
                    if (error.message?.includes('already exists')) {
                        setError(t?.errorEmailAlreadyRegistered || '❌ This email is already registered. Please:\n• Use the Sign In button instead\n• Or use a different email address\n• Contact support if you forgot your password');
                    } else if (error.message?.includes('Password')) {
                        setError(t?.errorPasswordRequirements || '❌ Password requirements not met:\n• Must be at least 8 characters long\n• Include letters and numbers\n• No spaces at start or end');
                    } else if (error.message?.includes('rate limit') || error.code === 429) {
                        setError(t?.errorRateLimit || '⚠️ Too many attempts. Please wait a moment before trying again.');
                    } else if (error.message?.includes('email') && error.message?.includes('invalid')) {
                        setError(t?.errorInvalidEmailFormat || '❌ Invalid email format. Please check:\n• Email contains @ symbol\n• Domain is valid (e.g., @gmail.com)\n• No spaces in the email');
                    } else {
                        const errorMsg = (t?.errorAccountCreation || '❌ Account creation failed: {error}. Please:\n• Check your internet connection\n• Verify all fields are correct\n• Try again or contact support').replace('{error}', error.message || 'Unknown error');
                        setError(errorMsg);
                    }
                }
            }
            else {
                // Unified mode - check if user exists first
                let existingUser;
                try {
                    existingUser = await userService.getByEmail(normalizedEmail);
                } catch (error) {
                    existingUser = null;
                }
                
                if (existingUser) {
                    // User exists - attempt sign in
                    console.log('📧 User exists, attempting sign in');
                    try {
                        const user = await authService.login(normalizedEmail, password);
                        console.log('✅ Sign in successful');
                        
                        // Clear the start_fresh flag to allow session restoration
                        sessionStorage.removeItem('start_fresh');
                        console.log('✅ Cleared start_fresh flag - session can now be restored');
                        
                        // Get the user type from existing record
                        let userType = accountType; // Use selected type as fallback
                        
                        // Check which collection the user belongs to
                        if (existingUser.role || existingUser.userType) {
                            const role = existingUser.role || existingUser.userType;
                            if (role === 'therapist') userType = 'therapist';
                            else if (role === 'massage_place' || role === 'massage-place') userType = 'massage-place';
                            else if (role === 'facial_place' || role === 'facial-place') userType = 'facial-place';
                        }
                        
                        onAuthSuccess(userType);
                    } catch (error: any) {
                        console.error('❌ Sign in failed:', error);
                        setError('Incorrect password. Please try again.');
                    }
                } else {
                    // User doesn't exist - create new account
                    console.log('🆕 Creating new account');
                    
                    try {
                        await createNewAccount(normalizedEmail, password, accountType);
                        
                        console.log('✅ Account created successfully!');
                        
                        // Clear the start_fresh flag to allow session restoration
                        sessionStorage.removeItem('start_fresh');
                        console.log('✅ Cleared start_fresh flag - session can now be restored');
                        
                        onAuthSuccess(accountType);
                    } catch (error: any) {
                        console.error('❌ Account creation failed:', error);
                        // Use the detailed error message from createNewAccount
                        setError(error.message || 'Failed to create account. Please try again.');
                    }
                }
            }
            
        } catch (error: any) {
            console.error('❌ Auth process failed:', error);
            // Provide more specific error messaging
            if (error.code === 401) {
                setError('Invalid email or password. Please try again.');
            } else if (error.code === 429) {
                setError('Too many login attempts. Please wait a moment and try again.');
            } else if (error.message) {
                setError(error.message);
            } else {
                setError('Authentication failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex flex-col bg-gray-50">
            {/* Global Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Back to Home">
                        <HomeIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            </header>
            
            {/* Auth Form */}
            <div className="w-full max-w-md mx-auto flex items-center justify-center flex-1 py-8">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 w-full">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Authentication'}
                        </h2>
                        <p className="text-gray-600">
                            {mode === 'signin' 
                                ? 'Welcome back! Please sign in to continue' 
                                : mode === 'signup' 
                                ? 'Create your account to get started' 
                                : 'Sign in to your account or create a new one'
                            }
                        </p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline mr-2" />
                                {t?.email || 'Email Address'}
                            </label>
                            <input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError(''); // Clear error when user starts typing
                                }} 
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                    error && error.toLowerCase().includes('email') 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300'
                                }`}
                                placeholder={t?.emailPlaceholder || 'your.email@example.com'} 
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                required 
                            />
                            {error && error.toLowerCase().includes('email') && (
                                <p className="mt-1 text-xs text-red-600">
                                    {t?.hintEmailCaseSensitive || '⚠️ Please check your email address (case-sensitive)'}
                                </p>
                            )}
                        </div>

                        {/* Account Type Dropdown - Only show for signup mode */}
                        {mode !== 'signin' && (
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    {t?.selectPortalType || 'Account Type'} {mode === 'signup' ? '(Required)' : ''}
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all flex justify-between items-center"
                                    >
                                        <span className={accountType ? 'text-gray-900' : 'text-gray-500'}>
                                            {accountType ? accountTypes.find(t => t.value === accountType)?.label : (t?.selectPortalType || 'Select account type')}
                                        </span>
                                        <span>▼</span>
                                    </button>
                                    
                                    {showDropdown && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1">
                                            {accountTypes.map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() => {
                                                        setAccountType(type.value);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:outline-none focus:bg-orange-50 transition-colors"
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                <Lock className="w-4 h-4 inline mr-2" />
                                {t?.password || 'Password'}
                            </label>
                            <input 
                                id="password" 
                                type="text" 
                                value={password} 
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError(''); // Clear error when user starts typing
                                }} 
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                                    error && error.toLowerCase().includes('password') 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300'
                                }`}
                                placeholder={t?.passwordPlaceholder || 'Enter your password'} 
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                required 
                            />
                            {error && error.toLowerCase().includes('password') && (
                                <p className="mt-1 text-xs text-red-600">
                                    {t?.hintPasswordCaseSensitive || '⚠️ Password is case-sensitive. Check uppercase/lowercase letters'}
                                </p>
                            )}
                        </div>

                        {/* Terms Checkbox - Show for signup and unified modes */}
                        {mode !== 'signin' && (
                            <div className="flex items-start space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAcceptTerms(!acceptTerms)}
                                    className="flex-shrink-0 mt-0.5"
                                >
                                    {acceptTerms ? (
                                        <span>☑</span>
                                    ) : (
                                        <Square className="w-5 h-5 text-gray-400 border border-gray-300 rounded" />
                                    )}
                                </button>
                                <label className="text-sm text-gray-700 leading-relaxed">
                                    {t?.iAgreeToThe || 'I agree to the'}{' '}
                                    <button type="button" className="text-orange-500 hover:underline font-medium">
                                        {t?.termsAndConditions || 'Terms & Conditions'}
                                    </button>
                                    {' '}{t?.and || 'and'}{' '}
                                    <button type="button" className="text-orange-500 hover:underline font-medium">
                                        {t?.privacyPolicy || 'Privacy Policy'}
                                    </button>
                                </label>
                            </div>
                        )}

                        {/* Error Message - Prominent display with icon */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium whitespace-pre-line">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !email || !password || (mode === 'signup' && (!accountType || !acceptTerms)) || (mode === 'unified' && (!accountType || !acceptTerms))}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                mode === 'signin' ? (t?.signInButton || 'Sign In') : mode === 'signup' ? (t?.createAccountButton || 'Create Account') : 'Continue'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

