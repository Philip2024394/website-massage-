import React, { useState } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwrite';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { LogIn, UserPlus, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import LocationPopup from '../components/LocationPopup';

interface AgentAuthPageProps {
    onRegister: (name: string, email: string) => Promise<{ success: boolean, message: string }>;
    onLogin: (email: string) => Promise<{ success: boolean, message: string }>;
    onBack: () => void;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const AgentAuthPage: React.FC<AgentAuthPageProps> = ({ onRegister, onLogin, onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLocationPopup, setShowLocationPopup] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Make rate limit reset functions available in browser console for testing
    React.useEffect(() => {
        (window as any).resetAgentRateLimit = () => {
            resetRateLimit('agent-login');
            resetRateLimit('agent-signup');
            console.log('✅ Agent rate limits reset! You can now try logging in again.');
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validate inputs
            if (!email || !password) {
                setError('Please enter both email and password');
                setLoading(false);
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setLoading(false);
                return;
            }

            // Check rate limit
            const operation = isSignUp ? 'agent-signup' : 'agent-login';
            const maxAttempts = isSignUp ? 3 : 5;
            const windowMs = isSignUp ? 600000 : 300000; // 10 min for signup, 5 min for login

            if (!checkRateLimit(operation, maxAttempts, windowMs)) {
                setError(`Too many ${isSignUp ? 'signup' : 'login'} attempts. Please wait before trying again.`);
                setLoading(false);
                return;
            }

            console.log(`🔄 Starting agent ${isSignUp ? 'signup' : 'login'} for:`, email);

            // Delete any existing session
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared');
            } catch {
                console.log('ℹ️ No existing session to clear');
            }

            if (isSignUp) {
                console.log('📝 Starting agent signup flow for:', email);
                const defaultName = email.split('@')[0];

                // Create Appwrite user account
                const newUser = await account.create('unique()', email, password, defaultName);
                console.log('✅ Appwrite user created', { userId: newUser.$id });

                // Create a temporary session to write the agent document, then force logout
                await account.createEmailPasswordSession(email, password);
                const user = await account.get();

                // Generate referral code (uppercase, length 8)
                const rawCode = `AGT${Date.now().toString().slice(-6)}`.toUpperCase();

                // Pruned agent data: only schema-documented base + extension attributes (exclude unsupported `code` key)
                const fullAgentData: Record<string, any> = {
                    // Base required
                    agentId: user.$id,
                    name: defaultName,
                    email,
                    contactNumber: 'To be updated',
                    whatsappNumber: 'To be updated',
                    agentCode: rawCode, // legacy key retained
                    hasAcceptedTerms: true,
                    isActive: true,
                    // Extension required (excluding `code` which is not in current collection)
                    streakMonths: 0,
                    newSignUpsThisMonth: 0,
                    recurringSignUpsThisMonth: 0,
                    complianceAccepted: false,
                    marketingAccepted: false,
                    payoutEnabled: false,
                    createdAt: new Date().toISOString(),
                    // Optional but documented (safe defaults)
                    tier: 'Standard',
                    commissionRate: 20,
                    totalEarnings: 0.0,
                    clients: '[]',
                    isLive: false,
                    activeTherapists: 0,
                    assignedDate: new Date().toISOString(),
                    region: null,
                    successRate: null,
                    lastLogin: null,
                    idCardImage: null
                };

                // Minimal fallback set (guaranteed base schema)
                const minimalAgentData = {
                    // Core required (base schema)
                    agentId: user.$id,
                    name: defaultName,
                    email,
                    contactNumber: 'To be updated',
                    agentCode: rawCode, // legacy key (retain for compatibility)
                    hasAcceptedTerms: true,
                    isActive: true,
                    whatsappNumber: 'To be updated',
                    // Extension required attributes (excluding unsupported `code`)
                    streakMonths: 0,
                    newSignUpsThisMonth: 0,
                    recurringSignUpsThisMonth: 0,
                    complianceAccepted: false,
                    marketingAccepted: false,
                    payoutEnabled: false, // agreements + banking not yet complete
                    createdAt: new Date().toISOString(),
                    // Additional safe defaults (non-required but commonly present)
                    totalEarnings: 0.0,
                    activeTherapists: 0,
                    isLive: false,
                    clients: '[]'
                };

                // Whitelist allowed keys based on AGENT_SCHEMA_ALIGNED.md (excluding extension fields causing errors)
                const allowedKeys = [
                    'agentId','name','email','contactNumber','agentCode','hasAcceptedTerms','isActive',
                    'assignedDate','region','successRate','tier','lastLogin','isLive','activeTherapists',
                    'password','whatsappNumber','commissionRate','createdAt','totalEarnings','clients','idCardImage',
                    // Extension fields confirmed accepted so far (omit unsupported commissionTier and termsAccepted)
                    'streakMonths','newSignUpsThisMonth','recurringSignUpsThisMonth',
                    'complianceAccepted','marketingAccepted','payoutEnabled'
                ];
                const sanitize = (data: Record<string, any>) => Object.fromEntries(
                    Object.entries(data).filter(([k]) => allowedKeys.includes(k))
                );

                let agentDoc;
                try {
                    console.log('🗃️ Attempting full agent document creation (sanitized)...');
                    agentDoc = await databases.createDocument(
                        DATABASE_ID,
                        COLLECTIONS.AGENTS,
                        ID.unique(),
                        sanitize(fullAgentData)
                    );
                    console.log('✅ Full agent document created');
                } catch (docErr: any) {
                    console.warn('⚠️ Full agent create failed, retrying with minimal sanitized schema:', docErr?.message);
                    try {
                        agentDoc = await databases.createDocument(
                            DATABASE_ID,
                            COLLECTIONS.AGENTS,
                            ID.unique(),
                            sanitize(minimalAgentData)
                        );
                        console.log('✅ Minimal agent document created');
                    } catch (fallbackErr: any) {
                        console.error('❌ Fallback agent document creation failed:', fallbackErr);
                        setError(handleAppwriteError(fallbackErr, 'agent document creation'));
                        setLoading(false);
                        return;
                    }
                }

                console.log('✅ Agent account fully set up');

                // Sign out to require explicit sign-in, per requested flow
                try {
                    await account.deleteSession('current');
                    console.log('🔒 Logged out after signup to require sign-in');
                } catch (e) {
                    console.warn('⚠️ Failed to delete session after signup (may already be cleared):', (e as any)?.message);
                }

                // Switch to Sign In tab and prompt the user to continue
                setIsSignUp(false);
                setPassword('');
                resetRateLimit('agent-signup');
                setError('✅ Account created. Please sign in to continue.');
                setLoading(false);
                return;
            } else {
                // Login
                console.log('🔐 Creating session...');
                await account.createEmailPasswordSession(email, password);
                
                // Get user details
                const user = await account.get();
                
                // Find agent record using agentId field
                console.log('🔍 Finding agent record...');
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.AGENTS,
                    []
                );
                
                const agent = response.documents.find((a: any) => a.agentId === user.$id);
                
                if (!agent) {
                    setError('Agent account not found. Please create an account first.');
                    await account.deleteSession('current');
                    setLoading(false);
                    return;
                }
                
                // Save session cache
                saveSessionCache({
                    type: 'agent',
                    id: user.$id,
                    email: user.email,
                    documentId: agent.$id,
                    data: agent
                });
                
                console.log('✅ Agent login successful');
                
                // Show location popup on successful login
                setLoginSuccess(true);
                setShowLocationPopup(true);
                setLoading(false);
                
                // Call the onLogin prop for any additional logic
                const result = await onLogin(email);
                if (!result.success) {
                    console.warn('⚠️ onLogin callback failed:', result.message);
                    // Continue anyway since the core authentication succeeded
                }
                return; // Don't set loading to false here since we're showing popup
            }
        } catch (err: any) {
            console.error('Agent authentication error:', err);
            
            // Handle user already exists case
            if (err.code === 409 || err.message?.includes('already exists')) {
                console.log('🔄 User already exists, switching to sign-in mode');
                setIsSignUp(false);
                setError('This email is already registered. Switched to Sign In mode - please enter your password.');
                setLoading(false);
                return;
            }
            
            setError(handleAppwriteError(err, isSignUp ? 'account creation' : 'login'));
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSet = async (location: { lat: number; lng: number; address: string }) => {
        try {
            // Update the agent's location in Appwrite
            const user = await account.get();
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.AGENTS,
                []
            );
            
            const agent = response.documents.find((a: any) => a.agentId === user.$id);
            
            if (agent) {
                await databases.updateDocument(
                    DATABASE_ID,
                    COLLECTIONS.AGENTS,
                    agent.$id,
                    {
                        location: location.address,
                        coordinates: { lat: location.lat, lng: location.lng },
                        lastLocationUpdate: new Date().toISOString()
                    }
                );
                console.log('✅ Agent location updated successfully');
            }
        } catch (error) {
            console.error('❌ Failed to update agent location:', error);
        } finally {
            setShowLocationPopup(false);
        }
    };

    const handleLocationSkip = () => {
        setShowLocationPopup(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Global Header (parity with hotel layout) */}
            <header className="bg-white p-4 shadow-md z-[9997] flex-shrink-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <button
                        onClick={onBack}
                        className="w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all border border-orange-400"
                        aria-label="Go to home"
                    >
                        <HomeIcon className="w-6 h-6 text-white" />
                    </button>
                </div>
            </header>

            {/* Main Content with Background */}
            <main
                className="flex-1 flex items-start justify-center px-4 py-2 overflow-y-auto relative bg-cover bg-center bg-no-repeat min-h-0 mb-[var(--footer-height,64px)]"
                style={{
                    backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/start%20your%20journey%20now.png?updatedAt=1763196560458)'
                }}
            >
                <div className="max-w-md w-full relative z-10 max-h-full overflow-y-auto pt-4 sm:pt-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Header under global header */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-2 sm:mb-3 text-gray-800 drop-shadow-lg">Agent</h2>
                        <p className="text-gray-600 text-xs sm:text-sm drop-shadow">Earn commissions and grow the network</p>
                    </div>

                    <div className="mb-3 sm:mb-4 min-h-[50px] flex items-center">
                        {error && (
                            <div className={`w-full p-2 sm:p-3 rounded-lg text-sm ${
                                error.includes('✅') || error.includes('Switched to Sign In mode')
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex mb-4 sm:mb-6 bg-white/95 backdrop-blur-sm rounded-lg p-1 border border-white/20 shadow-lg">
                    <button
                        onClick={() => {
                            setIsSignUp(false);
                            setError('');
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                            !isSignUp ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => {
                            setIsSignUp(true);
                            setError('');
                        }}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${
                            isSignUp ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-700 hover:text-orange-500 hover:bg-orange-50/80'
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-800 mb-2 drop-shadow">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5 z-10" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                    placeholder={isSignUp ? 'Create a password (min 8 characters)' : 'Enter your password'}
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
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />}
                                    {isSignUp ? 'Create Agent Account' : 'Sign In as Agent'}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </main>

            {/* Hide scrollbars */}
            <style>{`
                .max-w-md::-webkit-scrollbar { display: none; }
                @media (max-height: 600px) {
                    .space-y-4 > * + * { margin-top: 0.75rem; }
                    .space-y-6 > * + * { margin-top: 1rem; }
                }
            `}</style>

            {/* Location Popup */}
            <LocationPopup
                isOpen={showLocationPopup}
                onLocationSet={handleLocationSet}
                onSkip={handleLocationSkip}
            />
        </div>
    );
};

export default AgentAuthPage;
