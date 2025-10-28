// File deleted as part of unified login refactor.
import React, { useState } from 'react';
import { account, databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { Query } from 'appwrite';


interface VillaLoginPageProps {
    onVillaLogin: () => void;
    onBack: () => void;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const VillaLoginPage: React.FC<VillaLoginPageProps> = ({ onVillaLogin: _onVillaLogin, onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        villaName: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Removed unused backgroundStyle and backgroundClass after design unification

    const handleInputChange = (field: string, value: string) => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!credentials.email || !credentials.password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Login with Appwrite
            await account.createEmailPasswordSession(credentials.email, credentials.password);
            
            // Verify this account is associated with a villa
            // Villas are stored in the hotels collection with type: 'villa'
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotels,
                [Query.equal('email', credentials.email), Query.equal('type', 'villa')]
            );
            
            const villa = response.documents[0];
            
            if (!villa) {
                // Not a villa account
                await account.deleteSession('current');
                setError('No villa account found with this email');
                setIsLoading(false);
                return;
            }
            
            // Store villa session
            localStorage.setItem('villaLoggedIn', 'true');
            localStorage.setItem('villaData', JSON.stringify(villa));
            
            console.log('✅ Villa login successful:', villa.name);
            _onVillaLogin();
        } catch (err: any) {
            console.error('Villa login error:', err);
            setError(err.message || 'Login failed. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!credentials.email || !credentials.password || !credentials.villaName) {
            setError('Please fill in all fields');
            return;
        }

        if (credentials.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Create Appwrite account
            await account.create(
                'unique()',
                credentials.email,
                credentials.password,
                credentials.villaName
            );

            // Login automatically
            await account.createEmailPasswordSession(credentials.email, credentials.password);
            
            // Create villa profile in database (hotels collection with type: villa)
            const newVilla = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.hotels,
                'unique()',
                {
                    name: credentials.villaName,
                    email: credentials.email,
                    type: 'villa',
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            );
            
            localStorage.setItem('villaLoggedIn', 'true');
            localStorage.setItem('villaData', JSON.stringify(newVilla));
            
            console.log('✅ Villa account created:', newVilla.name);
            _onVillaLogin();
        } catch (err: any) {
            console.error('Villa signup error:', err);
            setError(err.message || 'Account creation failed. Please try again.');
            setIsLoading(false);
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
                    <p className="text-white/90 font-medium">Villa Portal</p>
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

                <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Villa Name
                            </label>
                            <input
                                type="text"
                                value={credentials.villaName}
                                onChange={(e) => handleInputChange('villaName', e.target.value)}
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                                placeholder="Enter villa name"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={credentials.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="villa@email.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={credentials.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter password"
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-6 shadow-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                    >
                        {isLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VillaLoginPage;