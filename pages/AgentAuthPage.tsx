import React, { useState } from 'react';
import { account, databases, DATABASE_ID, COLLECTIONS, ID } from '../lib/appwrite';
import { saveSessionCache } from '../lib/sessionManager';
import { checkRateLimit, handleAppwriteError, resetRateLimit } from '../lib/rateLimitUtils';
import { LogIn, UserPlus } from 'lucide-react';

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
                // Create account
                console.log('📝 Creating agent account for:', email);
                const defaultName = email.split('@')[0]; // Generate name from email
                const newUser = await account.create(
                    'unique()',
                    email,
                    password,
                    defaultName
                );

                console.log('✅ Account created successfully!', { userId: newUser.$id });

                // Automatically login after signup
                console.log('🔐 Creating session...');
                await account.createEmailPasswordSession(email, password);
                
                // Get user details
                const user = await account.get();
                
                // Create agent record in database matching your exact schema
                const agentData = {
                    // Required fields per your schema
                    agentId: user.$id,                              // Required: Agent identifier
                    name: defaultName,                              // Required: Agent name from email
                    email: email,                                   // Required: Email address
                    contactNumber: 'To be updated',                 // Required: Contact number
                    agentCode: `AGT${Date.now().toString().slice(-6)}`, // Required: Unique agent code
                    hasAcceptedTerms: true,                         // Required: Terms acceptance
                    isActive: true,                                 // Required: Account status
                    
                    // Optional fields with defaults
                    assignedDate: new Date().toISOString(),         // Assignment date
                    region: null,                                   // Region assignment
                    successRate: null,                              // Success rate (0-1)
                    tier: 'Standard',                               // Agent tier
                    lastLogin: null,                                // Last login timestamp
                    isLive: true,                                   // 🚀 AUTO-ACTIVE: Live status (automatically active)
                    activeTherapists: 0,                            // Active therapist count
                    password: '',                                   // Password (managed by Auth)
                    whatsappNumber: null,                           // WhatsApp number
                    commissionRate: 20,                             // Commission rate (max 23)
                    createdAt: new Date().toISOString(),            // Creation timestamp
                    totalEarnings: 0.0,                             // Total earnings
                    clients: '[]',                                  // Client list JSON
                    idCardImage: null                               // ID card image URL
                };
                
                console.log('📝 Creating agent database record...');
                const agentDoc = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTIONS.AGENTS,
                    ID.unique(),
                    agentData
                );
                
                // Save session cache
                saveSessionCache({
                    type: 'agent',
                    id: user.$id,
                    email: user.email,
                    documentId: agentDoc.$id,
                    data: agentDoc
                });
                
                console.log('✅ Agent account created and logged in successfully!');
                
                // Call the onRegister prop for any additional logic
                const result = await onRegister(defaultName, email);
                if (result.success) {
                    setError('✅ Account created successfully! Redirecting to dashboard...');
                } else {
                    console.warn('⚠️ onRegister callback failed:', result.message);
                    setError('✅ Account created successfully! Redirecting to dashboard...');
                }
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
                
                // Call the onLogin prop for any additional logic
                const result = await onLogin(email);
                if (!result.success) {
                    console.warn('⚠️ onLogin callback failed:', result.message);
                    // Continue anyway since the core authentication succeeded
                }
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

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Home Button */}
            <button
                onClick={onBack}
                className="fixed top-6 left-6 w-12 h-12 bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg flex items-center justify-center transition-all z-20 border border-orange-400"
                aria-label="Go to home"
            >
                <HomeIcon className="w-6 h-6 text-white" />
            </button>

            {/* Glass Effect Login Container */}
            <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10 border border-white/20">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        <span className="text-white">Inda</span>
                        <span className="text-orange-400">Street</span>
                    </h1>
                    <p className="text-white/90 font-medium">Agent Account</p>
                </div>

                <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <button
                        onClick={() => {
                            setIsSignUp(false);
                            setError(''); // Clear error when switching modes
                        }}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            !isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => {
                            setIsSignUp(true);
                            setError(''); // Clear error when switching modes
                        }}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className={`mb-4 p-3 rounded-lg backdrop-blur-sm border ${
                        error.includes('created') || error.includes('Switched to Sign In mode')
                            ? 'bg-blue-500/20 text-blue-100 border-blue-400/30' 
                            : 'bg-red-500/20 text-red-100 border-red-400/30'
                    }`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="agent@example.com"
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter your password"
                            required
                            minLength={8}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 mt-6 shadow-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Processing...'
                        ) : isSignUp ? (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Create Account
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign In
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AgentAuthPage;
