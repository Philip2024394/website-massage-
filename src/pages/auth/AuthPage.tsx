// 🎯 Create account / Sign up – same header as home page (UniversalHeader)
import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, UserCircle, Building2, Sparkles, Briefcase } from 'lucide-react';
import { authService, userService, therapistService, placesService, facialPlaceService } from '../../lib/appwriteService';
import { ID } from '../../lib/appwrite';
import { useTranslations } from '../../lib/useTranslations';
import UniversalHeader from '../../components/shared/UniversalHeader';
import { AppDrawer } from '../../components/AppDrawerClean';
import { React19SafeWrapper } from '../../components/React19SafeWrapper';

interface AuthPageProps {
    onAuthSuccess: (userType: string) => void;
    onBack: () => void;
    t?: any;
    mode?: 'signin' | 'signup' | 'unified';
    defaultRole?: 'therapist' | 'facial-therapist' | 'beauty-therapist' | 'massage-place' | 'facial-place' | 'employer';
    language?: string;
    onLanguageChange?: (lang: string) => void;
    onNavigate?: (page: string) => void;
    therapists?: any[];
    places?: any[];
}

const AuthPage: React.FC<AuthPageProps> = ({
    onAuthSuccess,
    onBack,
    t: externalT,
    mode: propMode,
    defaultRole,
    language: propLanguage,
    onLanguageChange,
    onNavigate,
    therapists = [],
    places = [],
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState(() => {
        if (defaultRole) return defaultRole;
        if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('createAccountRole') === 'employer') {
            sessionStorage.removeItem('createAccountRole');
            return 'employer';
        }
        return '';
    });
    const [password, setPassword] = useState('');
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

    const accountTypes = [
        { value: 'therapist', label: t?.massageTherapist || 'Massage Therapist', Icon: UserCircle },
        { value: 'facial-therapist', label: t?.facialTherapist || 'Facial (Home Service)', Icon: Sparkles },
        { value: 'beauty-therapist', label: t?.beautyTherapist || 'Beauty (Home Service)', Icon: Sparkles },
        { value: 'massage-place', label: t?.massageSpa || 'Massage Place', Icon: Building2 },
        { value: 'facial-place', label: t?.facialClinic || 'Facial Place', Icon: Sparkles },
        { value: 'employer', label: t?.postJob || 'Post Job', Icon: Briefcase },
    ];

    // Handle return from Google OAuth: create profile and redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('oauth') === 'failure') {
            window.history.replaceState({}, '', window.location.pathname);
            setError(t?.googleSignInFailed || 'Google sign-in was cancelled or failed. Try again or use email.');
            return;
        }
        if (params.get('oauth') !== 'success') return;
        const isSignupFlow = mode === 'signup' || mode === 'unified';
        if (!isSignupFlow) return;
        let cancelled = false;
        (async () => {
            try {
                const user = await authService.getCurrentUser();
                if (cancelled || !user) return;
                const storedType = sessionStorage.getItem('oauth_signup_account_type') as string | null;
                const accountTypeToUse = storedType || 'therapist';
                if (storedType) sessionStorage.removeItem('oauth_signup_account_type');
                const email = (user as any).email || '';
                const name = (user as any).name || email.split('@')[0] || 'User';
                const profileData = { email, role: accountTypeToUse, name, userId: (user as any).$id };
                const therapistPayload = {
                    email: profileData.email,
                    name: profileData.name,
                    countryCode: '+62',
                    whatsappNumber: '',
                    specialization: accountTypeToUse === 'therapist' ? 'General Massage' : (accountTypeToUse === 'facial-therapist' ? 'Facial' : 'Beauty'),
                    yearsOfExperience: 0,
                    isLicensed: false,
                    isLive: false,
                    hourlyRate: 100,
                    pricing: JSON.stringify({ '60': 100, '90': 150, '120': 200 }),
                    price60: '100', price90: '150', price120: '200',
                    coordinates: JSON.stringify({ lat: 0, lng: 0 }),
                    location: 'Bali, Indonesia',
                    status: 'available',
                    availability: 'Available',
                    description: '',
                    profilePicture: (user as any).picture || '',
                    mainImage: '',
                    massageTypes: '',
                    languages: '',
                };
                if (accountTypeToUse === 'therapist') {
                    await (therapistService as any).create({ ...therapistPayload, servicesOffered: ['massage'] });
                } else if (accountTypeToUse === 'facial-therapist') {
                    await (therapistService as any).create({ ...therapistPayload, servicesOffered: ['facial'] });
                } else if (accountTypeToUse === 'beauty-therapist') {
                    await (therapistService as any).create({ ...therapistPayload, servicesOffered: ['beautician'] });
                } else if (accountTypeToUse === 'massage-place') {
                    const placeId = ID.unique();
                    await placesService.create({
                        email: profileData.email,
                        name: profileData.name,
                        id: placeId,
                        placeId,
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
                } else if (accountTypeToUse === 'facial-place') {
                    const facialPlaceId = ID.unique();
                    await placesService.create({
                        email: profileData.email,
                        name: profileData.name,
                        facialPlaceId,
                        collectionName: 'facial_places',
                        category: 'spa',
                        description: '',
                        address: 'Bali, Indonesia',
                        lastUpdate: new Date().toISOString(),
                    });
                }
                window.history.replaceState({}, '', window.location.pathname);
                const redirectType = (accountTypeToUse === 'facial-therapist' || accountTypeToUse === 'beauty-therapist') ? 'therapist' : accountTypeToUse;
                if (!cancelled) onAuthSuccess(redirectType);
            } catch (err) {
                console.error('OAuth callback profile creation failed:', err);
                if (!cancelled) setError('Account created but profile setup failed. Please contact support.');
            }
        })();
        return () => { cancelled = true; };
    }, [mode, onAuthSuccess]);

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
        
        // Validate password length only (Appwrite will validate other requirements)
        if (password.length < 8) {
            setError(t?.passwordMinLength || 'Password must be at least 8 characters');
            return false;
        }
        
        // For signup/unified mode, require account type. Terms accepted on first dashboard visit.
        if (mode === 'signup') {
            if (!accountType) {
                setError(t?.pleaseSelectPortalType || 'Please select an account type');
                return false;
            }
        }
        
        if (mode === 'unified') {
            if (!accountType) {
                setError(t?.pleaseSelectPortalType || 'Please select an account type');
                return false;
            }
        }
        
        return true;
    };

    const createNewAccount = async (normalizedEmail: string, password: string, accountType: string) => {
        try {
            console.log('🔵 Step 1: Creating Appwrite auth account for:', normalizedEmail);
            console.log('🔍 Password length:', password.length);
            console.log('🔍 Password has lowercase:', /[a-z]/.test(password));
            console.log('🔍 Password has uppercase:', /[A-Z]/.test(password));
            console.log('🔍 Password has numbers:', /[0-9]/.test(password));
            console.log('🔍 Password preview:', password.substring(0, 3) + '***');
            
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
            
            // Create profile in appropriate collection (employer: auth only, profile in employer dashboard)
            if (accountType === 'employer') {
                console.log('🔵 Employer account – auth created; employer will complete profile in dashboard');
                // No separate employer_profiles create here; employer fills job listing in employer-job-posting page
            } else if (accountType === 'therapist' || accountType === 'facial-therapist' || accountType === 'beauty-therapist') {
                const servicesOffered = accountType === 'therapist' ? ['massage'] : accountType === 'facial-therapist' ? ['facial'] : ['beautician'];
                const specialization = accountType === 'therapist' ? 'General Massage' : accountType === 'facial-therapist' ? 'Facial' : 'Beauty';
                console.log('🔵 Creating therapist profile', { accountType, servicesOffered });
                await (therapistService as any).create({
                    email: profileData.email,
                    name: (profileData as any).name,
                    countryCode: '+62',
                    whatsappNumber: '',
                    specialization,
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
                    servicesOffered,
                });
                console.log('✅ Therapist profile created successfully');
            } else if (accountType === 'massage-place') {
                const placeId = ID.unique();
                console.log('🔵 Creating massage place profile with ID:', placeId);
                await placesService.create({
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
                await placesService.create({
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
            console.log('🔵 Step 3: Waiting for database indexing and session setup...');
            
            // Wait for database to index the new document and for session to be ready
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('✅ Account creation process completed successfully');
            console.log('✅ Ready to navigate to dashboard for account type:', accountType);
            
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
            } else if (error.code === 429 || error.message?.includes('rate limit')) {
                throw new Error('Too many attempts. Please wait a moment and try again.');
            } else {
                // Just pass through the actual error message from Appwrite
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
            // Normalize email and password (trim whitespace)
            const normalizedEmail = email.toLowerCase().trim();
            const trimmedPassword = password.trim();
            
            if (mode === 'signin') {
                // Sign in mode - try to login first, then get user profile
                try {
                    const user = await authService.login(normalizedEmail, trimmedPassword);
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
                            const placeData = await placesService.getByEmail(normalizedEmail);
                            const placeList = Array.isArray(placeData) ? placeData : placeData ? [placeData] : [];
                            if (placeList.length > 0) {
                                console.log('✅ Found massage place profile:', (placeList[0] as any).name);
                                userType = 'massage-place';
                            } else {
                                console.log('⚠️ No massage place found, checking facial places...');
                                const facialData = await facialPlaceService.getByEmail(normalizedEmail);
                                if (facialData) {
                                    console.log('✅ Found facial place profile:', (facialData as any).name);
                                    userType = 'facial-place';
                                }
                            }
                        }
                    } catch (error) {
                        console.warn('⚠️ Error checking therapist/place/facial:', error);
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
                    await createNewAccount(normalizedEmail, trimmedPassword, accountType);
                    
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
                    } else if (error.message?.includes('Password') || error.message?.includes('password')) {
                        // Show the actual error message from Appwrite or provide guidance
                        const errorMsg = error.message || t?.errorPasswordRequirements || 
                            '❌ Password requirements:\n• Must be at least 8 characters\n• Use lowercase letters + numbers\n• Try: "password123" or "abc12345"';
                        setError(errorMsg);
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
                        await createNewAccount(normalizedEmail, trimmedPassword, accountType);
                        
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

    const language = propLanguage || 'en';

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex flex-col bg-gray-50">
            {/* Same header as home page */}
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange as (lang: string) => void}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={onBack}
                showHomeButton={true}
            />
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={onNavigate}
                    onMassageJobsClick={onNavigate ? () => onNavigate('massage-jobs') : undefined}
                    onVillaPortalClick={onNavigate ? () => onNavigate('villa-portal') : undefined}
                    onTherapistPortalClick={onNavigate ? () => onNavigate('therapist-signup') : undefined}
                    onMassagePlacePortalClick={onNavigate ? () => onNavigate('place-signup') : undefined}
                    onAgentPortalClick={onNavigate ? () => onNavigate('auth') : undefined}
                    onCustomerPortalClick={onNavigate ? () => onNavigate('auth') : undefined}
                    onAdminPortalClick={onNavigate ? () => onNavigate('admin-login') : undefined}
                    onTermsClick={onNavigate ? () => onNavigate('terms') : undefined}
                    onPrivacyClick={onNavigate ? () => onNavigate('privacy') : undefined}
                    therapists={therapists}
                    places={places}
                    language={language as 'en' | 'id' | 'gb'}
                />
            </React19SafeWrapper>

            {/* Spacer so content starts below fixed header */}
            <div className="pt-[60px]" aria-hidden />

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
                    
                    {/* Sign up with Google – only in signup mode */}
                    {mode === 'signup' && (
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => {
                                    if (!accountType) {
                                        setError(t?.pleaseSelectPortalType || 'Please select account type first.');
                                        return;
                                    }
                                    setError('');
                                    try {
                                        sessionStorage.setItem('oauth_signup_account_type', accountType);
                                        const base = typeof window !== 'undefined' ? window.location.origin : '';
                                        const path = (typeof window !== 'undefined' ? window.location.pathname : '') || '/signup';
                                        const sep = path.includes('?') ? '&' : '?';
                                        const successUrl = `${base}${path}${sep}oauth=success`;
                                        const failureUrl = `${base}${path}${sep}oauth=failure`;
                                        authService.createGoogleSession(successUrl, failureUrl);
                                    } catch (err: any) {
                                        setError(err?.message || 'Google sign-in could not be started. Try email sign up.');
                                    }
                                }}
                                disabled={isLoading || !accountType}
                                className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-gray-700"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                {t?.signUpWithGoogle || 'Sign up with Google'}
                            </button>
                            <p className="text-center text-sm text-gray-500 mt-2">
                                {t?.fastAndEasy || 'Fast & easy – no password needed'}
                            </p>
                        </div>
                    )}

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
                                        <span className={`flex items-center gap-2 ${accountType ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {accountType ? (() => {
                                                const selected = accountTypes.find(x => x.value === accountType);
                                                const Icon = selected?.Icon;
                                                return Icon ? <><Icon className="w-5 h-5 text-orange-500 flex-shrink-0" /><span>{selected?.label}</span></> : selected?.label;
                                            })() : (t?.selectPortalType || 'Select account type')}
                                        </span>
                                        <span>▼</span>
                                    </button>
                                    
                                    {showDropdown && (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1">
                                            {accountTypes.map((type) => {
                                                const Icon = type.Icon;
                                                return (
                                                    <button
                                                        key={type.value}
                                                        type="button"
                                                        onClick={() => {
                                                            setAccountType(type.value);
                                                            setShowDropdown(false);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-orange-50 focus:outline-none focus:bg-orange-50 transition-colors flex items-center gap-2"
                                                    >
                                                        {Icon && <Icon className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                                                        <span>{type.label}</span>
                                                    </button>
                                                );
                                            })}
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
                                    // Trim leading/trailing spaces automatically
                                    setPassword(e.target.value.trim());
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
                            disabled={isLoading || !email || !password || (mode === 'signup' && !accountType) || (mode === 'unified' && !accountType)}
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

