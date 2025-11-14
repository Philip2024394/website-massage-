import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';

interface GuestProfilePageProps {
    onBack: () => void;
    onRegisterClick?: () => void; // 🎯 NEW: Function to open registration drawer/page
    t: any;
    // AppDrawer navigation props (optional - will use defaults if not provided)
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const UserIcon = ({ className = 'w-16 h-16' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const ArrowIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const GuestProfilePage: React.FC<GuestProfilePageProps> = ({ 
    onBack, 
    onRegisterClick,
    t,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onNavigate,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Brand and Burger Menu */}
            <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    {/* Brand Name */}
                    <h1 className="text-xl sm:text-2xl font-bold">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    
                    {/* Burger Menu */}
                    <button 
                        onClick={() => setIsMenuOpen(true)} 
                        title="Menu"
                        className="text-orange-500 hover:text-orange-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <BurgerMenuIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            {/* AppDrawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
                t={t}
            />

            {/* Content */}
            <div className="flex flex-col items-center justify-center px-6 py-20">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <UserIcon className="w-24 h-24 text-gray-300" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Create Your Account
                    </h2>
                    
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                        To access your profile and manage your bookings, please create an account.
                    </p>
                    
                    {/* Instruction Box */}
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
                        <div className="flex items-center justify-center mb-4">
                            <div className="bg-orange-500 rounded-full p-3">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-3 text-lg">How to Get Started:</h3>
                        
                        <div className="space-y-4 text-left">
                            <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                    1
                                </span>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Click the "Register Now" button below</span> for quick access
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                    2
                                </span>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Or select the menu icon in the top right corner</span> of any page
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                    3
                                </span>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Choose your account type</span> and complete the registration
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Register Now Button - Primary action */}
                    {onRegisterClick && (
                        <button
                            onClick={onRegisterClick}
                            className="w-full max-w-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg mb-4 flex items-center justify-center gap-3"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Register Now</span>
                        </button>
                    )}
                    
                    {/* Go Back Button - Secondary action */}
                    <button
                        onClick={onBack}
                        className="w-full max-w-xs bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 border"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Go Back to Home</span>
                    </button>
                    
                    <div className="mt-12 bg-white rounded-lg shadow-sm p-6 max-w-sm mx-auto">
                        <h3 className="font-semibold text-gray-900 mb-3">Benefits of Creating an Account:</h3>
                        <ul className="text-left text-sm text-gray-600 space-y-2">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Book and manage appointments</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Save favorite therapists and places</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Track your booking history</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Get personalized recommendations</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Receive exclusive offers</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestProfilePage;
