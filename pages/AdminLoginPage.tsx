import React, { useState } from 'react';
import { account } from '../lib/appwrite';

interface AdminLoginPageProps {
    onAdminLogin: () => void;
    onBack: () => void;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin: _onAdminLogin, onBack, t }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setIsLoading(true);

        try {
            // Validate both email and password are provided
            if (!email || !password) {
                setError('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            // Create session with Appwrite
            await account.createEmailPasswordSession(email, password);
            
            // Store admin session
            localStorage.setItem('adminLoggedIn', 'true');
            
            console.log('✅ Admin login successful');
            _onAdminLogin();
        } catch (err: any) {
            console.error('Admin login error:', err);
            setError(err.message || 'Invalid credentials. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSignUp = async () => {
        setError('');
        setIsLoading(true);

        try {
            if (!email || !password) {
                setError('Please enter both email and password');
                setIsLoading(false);
                return;
            }

            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setIsLoading(false);
                return;
            }

            // Delete any existing session first
            try {
                await account.deleteSession('current');
                console.log('🗑️ Existing session cleared');
            } catch (err) {
                // No session to delete, continue
                console.log('ℹ️ No existing session to clear');
            }

            // Create new admin account
            await account.create(
                'unique()',
                email,
                password,
                'Admin User'
            );

            // Automatically login after signup
            await account.createEmailPasswordSession(email, password);
            
            localStorage.setItem('adminLoggedIn', 'true');
            
            console.log('✅ Admin account created and logged in');
            _onAdminLogin();
        } catch (err: any) {
            console.error('Admin signup error:', err);
            setError(err.message || 'Account creation failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSubmit = () => {
        if (isSignUp) {
            handleSignUp();
        } else {
            handleLogin();
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
                    <p className="text-white/90 font-medium">{t.title}</p>
                </div>

                <div className="flex mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            !isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-2 px-4 rounded-md transition-all ${
                            isSignUp ? 'bg-orange-500 shadow-lg text-white font-semibold' : 'text-white/90 hover:bg-white/5'
                        }`}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-red-500/20 text-red-100 border border-red-400/30">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">Email</label>
                            <input 
                                id="email"
                                type="email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                                placeholder="admin@example.com"
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                required
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">{t.prompt}</label>
                        <input 
                            id="password"
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter password"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            required
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-6 shadow-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                        {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : t.button}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;
