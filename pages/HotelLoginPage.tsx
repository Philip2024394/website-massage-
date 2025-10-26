import React, { useState } from 'react';
import Button from '../components/Button';
import { authService } from '../lib/appwriteService';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface HotelLoginPageProps {
    onSuccess: (hotelId: string) => void;
    onBack: () => void;
    t: any;
}

const HomeIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const HotelLoginPage: React.FC<HotelLoginPageProps> = ({ onSuccess, onBack }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hotelName, setHotelName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // First, logout any existing session
            try {
                await authService.logout();
            } catch (err) {
                // Ignore error if no session exists
            }

            if (isSignUp) {
                // Create account
                if (!hotelName.trim()) {
                    setError('Hotel name is required');
                    setLoading(false);
                    return;
                }

                // Register with Appwrite
                await authService.register(email, password, hotelName);
                
                // Get the current user
                const user = await authService.getCurrentUser();
                
                // Generate hotel ID
                const hotelId = Math.floor(Math.random() * 1000000);
                
                // Create hotel record with default values for required fields
                const hotelData = {
                    id: user.$id,
                    userId: user.$id, // Add this for login lookup
                    hotelId: hotelId,
                    hotelName: hotelName,
                    hotelAddress: 'To be updated',
                    totalRooms: 1,
                    availableRooms: 1,
                    pricePerNight: 0,
                    name: hotelName,
                    email: email,
                    address: 'To be updated',
                    contactNumber: 'To be updated',
                    type: 'hotel',
                    amenities: null,
                    phoneNumber: null,
                    profilePicture: null,
                    mainImage: null
                };
                
                const hotelDoc = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    ID.unique(),
                    hotelData
                );
                
                setError('✅ Account created successfully! Redirecting to dashboard...');
                setTimeout(() => {
                    onSuccess(hotelDoc.$id);
                }, 1500);
            } else {
                // Login
                const user = await authService.login(email, password);
                
                // Find hotel record
                const response = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.hotels,
                    []
                );
                
                const hotel = response.documents.find((h: any) => h.userId === user.$id);
                
                if (!hotel) {
                    setError('Hotel account not found. Please create an account first.');
                    await authService.logout();
                    setLoading(false);
                    return;
                }
                
                onSuccess(hotel.$id);
            }
        } catch (err: any) {
            console.error('Authentication error:', err);
            setError(err.message || 'Authentication failed. Please try again.');
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
                    <p className="text-white/90 font-medium">Hotel Portal</p>
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
                    <div className={`mb-4 p-3 rounded-lg backdrop-blur-sm ${error.includes('created') ? 'bg-green-500/20 text-green-100 border border-green-400/30' : 'bg-red-500/20 text-red-100 border border-red-400/30'}`}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                                Hotel Name
                            </label>
                            <input
                                type="text"
                                value={hotelName}
                                onChange={(e) => setHotelName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                                placeholder="Enter your hotel name"
                                required={isSignUp}
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="hotel@indastreet.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/90 mb-2">
                            Password
                        </label>
                        <input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-900 placeholder-gray-500"
                            placeholder="Enter your password"
                            required
                            minLength={8}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 mt-6 shadow-lg"
                    >
                        {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default HotelLoginPage;