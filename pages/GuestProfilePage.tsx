import React from 'react';

interface GuestProfilePageProps {
    onBack: () => void;
    t: any;
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

const GuestProfilePage: React.FC<GuestProfilePageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
                <button onClick={onBack} className="mr-4">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900">Profile</h1>
            </div>

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
                                    <span className="font-semibold">Select the icon in the top right corner</span> of the header
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                    2
                                </span>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Choose from the displayed buttons</span> to create your account
                                </p>
                            </div>
                            
                            <div className="flex items-start">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                                    3
                                </span>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Complete the registration</span> and start enjoying all features
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <button
                        onClick={onBack}
                        className="w-full max-w-xs bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Go Back to Home</span>
                        <ArrowIcon className="w-5 h-5" />
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
