// File deleted as part of unified login refactor.
import React, { useState, useEffect } from 'react';
import { therapistService, placeService } from '../lib/appwriteService';
import { LogIn, UserPlus } from 'lucide-react';


interface ProviderAuthPageProps {
    mode: 'login' | 'register';
    providerType: 'therapist' | 'place';
    onRegister: (email: string, agentCode?: string) => Promise<{success: boolean, message: string}>;
    onLogin: (email: string) => Promise<{success: boolean, message: string}>;
    onSwitchMode: () => void;
    onBack: () => void;
    t: any;
}

const ProviderAuthPage: React.FC<ProviderAuthPageProps> = ({ mode, providerType, onRegister, onLogin, onSwitchMode, onBack, t }) => {
	// Real membership expiry date from Appwrite
	const [membershipExpiry, setMembershipExpiry] = useState<Date | null>(null);
	const [showExpiryPopup, setShowExpiryPopup] = useState(false);
	const [popupDismissed, setPopupDismissed] = useState(false);
	const [email, setEmail] = useState('');

	// Fetch real expiry date from Appwrite after login
	useEffect(() => {
		const fetchExpiry = async () => {
			if (mode === 'login' && email) {
				try {
					let profile = null;
					if (providerType === 'therapist') {
						const allTherapists = await therapistService.getTherapists();
						profile = allTherapists?.find((t: any) => t.email === email);
					} else {
						const allPlaces = await placeService.getPlaces();
						profile = allPlaces?.find((p: any) => p.email === email);
					}
					if (profile && profile.activeMembershipDate) {
						setMembershipExpiry(new Date(profile.activeMembershipDate));
					} else {
						setMembershipExpiry(null);
					}
				} catch {
					setMembershipExpiry(null);
				}
			}
		};
		fetchExpiry();
	}, [mode, email, providerType]);

    // Show popup if within 7 days of expiry and not dismissed
    useEffect(() => {
        if (membershipExpiry && mode === 'login' && !popupDismissed) {
            const now = new Date();
            const diff = (membershipExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            if (diff <= 7 && diff >= 0) {
                setShowExpiryPopup(true);
            } else {
                setShowExpiryPopup(false);
            }
        } else {
            setShowExpiryPopup(false);
        }
    }, [membershipExpiry, mode, popupDismissed]);
    const [password, setPassword] = useState('');
    // Removed agentCode for therapist and place login/register
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (!email || !password) {
            setError(t.fillFieldsError);
            setIsLoading(false);
            return;
        }

        if (mode === 'register') {
            // Mock implementation - replace with your actual authentication logic
            const result = await onRegister(email);
            if (result.success) {
                setSuccessMessage(result.message);
                setEmail('');
                setPassword('');
            } else {
                setError(result.message);
            }
        } else {
            // Mock implementation for login - replace with your actual authentication logic
            const result = await onLogin(email);
            if (!result.success) {
                setError(result.message);
            }
        }
        setIsLoading(false);
    };

    const getTitle = () => {
        if (providerType === 'therapist') {
            return mode === 'register' ? t.registerTherapistTitle : t.loginTherapistTitle;
        }
        return mode === 'register' ? t.registerPlaceTitle : t.loginPlaceTitle;
    }

    const buttonText = mode === 'register' ? t.registerButton : t.loginButton;
    const switchText = mode === 'register' ? t.switchToLogin : t.switchToRegister;

    return (
        <div className="min-h-screen flex flex-col justify-center p-4 relative" style={{ backgroundImage: "url('https://ik.imagekit.io/7grri5v7d/massage%20rooms.png?updatedAt=1761150670027')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            {/* Free Membership Badge */}
            {mode === 'register' && (
                <div className="absolute top-4 right-4 z-20">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-full px-4 py-2 shadow-lg animate-pulse">
                        <p className="text-white font-bold text-sm flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            FREE 1st Month!
                        </p>
                    </div>
                </div>
            )}
            
            {/* Membership Expiry Popup */}
            {showExpiryPopup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-xs w-full flex flex-col items-center">
                        <h2 className="text-lg font-bold text-orange-600 mb-2">Membership Expiring Soon</h2>
                        <p className="text-gray-700 text-center mb-4">Your membership will expire on <span className="font-semibold">{membershipExpiry?.toLocaleDateString()}</span>.<br/>Please contact support to keep your account active.</p>
                        <a
                            href="https://wa.me/6281392000050"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-600 transition mb-2 text-center"
                            onClick={() => { setShowExpiryPopup(false); setPopupDismissed(true); }}
                        >
                            WhatsApp Customer Service
                        </a>
                        <button
                            className="text-xs text-gray-500 hover:underline mt-1"
                            onClick={() => setShowExpiryPopup(false)}
                        >
                            Remind me later
                        </button>
                    </div>
                </div>
            )}
            <button onClick={onBack} className="absolute top-8 left-4 z-20 focus:outline-none" aria-label="Back to Home">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 shadow-lg border-2 border-white transition-all duration-200 hover:bg-orange-600">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </span>
            </button>
            <div className="w-full max-w-sm mx-auto relative z-20 flex items-center justify-center min-h-[30vh] mt-20">
                <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-4 flex flex-col justify-center transition-all duration-300 min-h-[340px] max-h-[440px] w-full max-w-xs">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">
                            <span className="text-white">Indo</span><span className="text-orange-400">Street</span>
                        </h1>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h2 className="text-xl font-semibold text-white text-center mb-6">{getTitle()}</h2>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">{t.emailLabel}</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder={providerType === 'therapist' ? 'therapist@example.com' : 'place@example.com'}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">{t.passwordLabel}</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent backdrop-blur-sm"
                                placeholder="password123"
                            />
                        </div>

                        {/* Agent code field removed for therapist and place registration */}
                        
                        {error && <div className="text-red-400 text-sm text-center bg-red-500/20 p-2 rounded-md border border-red-400/30">{error}</div>}
                        {successMessage && <div className="text-green-400 text-sm text-center bg-green-500/20 p-2 rounded-md border border-green-400/30">{successMessage}</div>}
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-orange-500/80 backdrop-blur-sm text-white py-3 px-4 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium border border-white/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                'Processing...'
                            ) : mode === 'register' ? (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    {buttonText}
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    {buttonText}
                                </>
                            )}
                        </button>
                        
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setError('');
                                    setSuccessMessage('');
                                    onSwitchMode();
                                }}
                                className="text-sm font-medium text-white/80 hover:text-white hover:underline"
                            >
                                {switchText}
                            </button>
                        </div>
                        <div className="text-center mt-4">
                            {mode === 'login' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setError('');
                                        setSuccessMessage('');
                                        onSwitchMode();
                                    }}
                                    className="text-sm font-semibold text-orange-400 hover:text-orange-500 underline"
                                >
                                    Create an account
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProviderAuthPage;
