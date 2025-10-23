import React, { useState } from 'react';
import { useBackground } from '../src/shared/hooks/useBackground';

interface HotelLoginPageProps {
    onHotelLogin: () => void;
    onBack: () => void;
    t: any;
}

const HotelLoginPage: React.FC<HotelLoginPageProps> = ({ onHotelLogin, onBack, t }) => {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { backgroundStyle, backgroundClass } = useBackground('hotel');

    const handleInputChange = (field: string, value: string) => {
        setCredentials(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!credentials.username || !credentials.password) {
            setError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Mock authentication - replace with actual hotel authentication logic
            if (credentials.username === 'hotel123' && credentials.password === 'indostreet2024') {
                onHotelLogin();
            } else {
                setError('Invalid hotel credentials');
            }
        } catch (err) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
                <div 
            className={`min-h-screen flex flex-col justify-center p-4 relative ${backgroundClass}`}
            style={backgroundStyle}
        >
            {/* Header */}
            <div className="bg-white shadow-sm p-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-800">
                        <span className="text-white">Indo</span><span className="text-orange-500">street</span> - Hotel Portal
                    </h1>
                    <div></div>
                </div>
            </div>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
                        </h1>
                        <h2 className="text-xl font-semibold text-white mb-2">Hotel Login</h2>
                        <p className="text-white/80">Access your hotel management dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Hotel Username
                            </label>
                            <input
                                type="text"
                                value={credentials.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder="hotel123"
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
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder="indostreet2024"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-md border border-red-400/30">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20"
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-white/70">
                            Demo: hotel123 / indostreet2024
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelLoginPage;