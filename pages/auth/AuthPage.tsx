import React, { useState } from 'react';
import { ChevronDown, User, Lock, Mail, CheckSquare, Square } from 'lucide-react';
import HomeIcon from '../../components/icons/HomeIcon';
import { authService, userService, therapistService, placesService } from '../../lib/appwriteService';
import { ID } from '../../lib/appwrite';

interface AuthPageProps {
    onAuthSuccess: (userType: string) => void;
    onBack: () => void;
    t?: any;
    mode?: 'signin' | 'signup' | 'unified';
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess, onBack, t, mode: propMode }) => {
    const [email, setEmail] = useState('');
    const [accountType, setAccountType] = useState('');
    const [password, setPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

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
        { value: 'therapist', label: 'Massage Therapist' },
        { value: 'massage-place', label: 'Massage Place' },
        { value: 'facial-place', label: 'Facial Place' },
    ];

    const validateForm = () => {
        // Clear previous errors
        setError('');
        
        if (!email || !password) {
            setError('Please fill all required fields');
            return false;
        }
        
        // Validate email format - more lenient regex that accepts most valid emails
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.trim())) {
            setError('Please enter a valid email address');
            return false;
        }
        
        // Validate password length (Appwrite requires 8 characters minimum)
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        
        // For signup mode, require account type and terms
        if (mode === 'signup') {
            if (!accountType) {
                setError('Please select an account type');
                return false;
            }
            if (!acceptTerms) {
                setError('Please accept terms & conditions');
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
                setError('Please select an account type');
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
                await therapistService.create({
                    email: profileData.email,
                    name: profileData.name,
                    therapistId: therapistId,
                    id: therapistId,
                    hotelId: '',
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
                await placesService.create({
                    email: profileData.email,
                    name: profileData.name,
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
                    hotelId: '',
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
                    name: profileData.name,
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
            } else if (error.code === 400 || error.message?.includes('Invalid email')) {
                throw new Error('Invalid email format. Please check and try again.');
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
            
            // Check if user already exists in any collection
            const existingUser = await userService.getByEmail(normalizedEmail);
            
            if (mode === 'signin') {
                // Sign in mode - user must exist
                if (!existingUser) {
                    setError('No account found with this email. Please create an account first.');
                    return;
                }
                
                try {
                    const user = await authService.login(normalizedEmail, password);
                    console.log('✅ Sign in successful');
                    
                    // Clear the start_fresh flag to allow session restoration
                    sessionStorage.removeItem('start_fresh');
                    console.log('✅ Cleared start_fresh flag - session can now be restored');
                    
                    // Determine user type from existing record
                    let userType = 'therapist'; // default
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
            } 
            else if (mode === 'signup') {
                // Signup mode - create account (even if user exists, we'll try to create and handle the conflict)
                if (existingUser) {
                    setError('An account with this email already exists. Please sign in instead.');
                    return;
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
                    // Use the detailed error message from createNewAccount
                    setError(error.message || 'Failed to create account. Please try again.');
                }
            }
            else {
                // Unified mode - smart detection
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
        <div className="min-h-screen flex flex-col bg-gray-50">
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
                                Email Address
                            </label>
                            <input 
                                id="email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                                placeholder="your.email@example.com" 
                                required 
                            />
                        </div>

                        {/* Account Type Dropdown - Only show for signup mode */}
                        {mode !== 'signin' && (
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Account Type {mode === 'signup' ? '(Required)' : ''}
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all flex justify-between items-center"
                                    >
                                        <span className={accountType ? 'text-gray-900' : 'text-gray-500'}>
                                            {accountType ? accountTypes.find(t => t.value === accountType)?.label : 'Select account type'}
                                        </span>
                                        <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
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
                                Password
                            </label>
                            <input 
                                id="password" 
                                type="text" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                                placeholder="Enter your password" 
                                required 
                            />
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
                                        <CheckSquare className="w-5 h-5 text-orange-500" />
                                    ) : (
                                        <Square className="w-5 h-5 text-gray-400 border border-gray-300 rounded" />
                                    )}
                                </button>
                                <label className="text-sm text-gray-700 leading-relaxed">
                                    I agree to the{' '}
                                    <button type="button" className="text-orange-500 hover:underline font-medium">
                                        Terms & Conditions
                                    </button>
                                    {' '}and{' '}
                                    <button type="button" className="text-orange-500 hover:underline font-medium">
                                        Privacy Policy
                                    </button>
                                </label>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
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
                                mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Continue'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
