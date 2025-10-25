import React from 'react';

interface GuestAlertsPageProps {
    onBack: () => void;
    t: any;
}

const BellIcon = ({ className = 'w-16 h-16' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const GuestAlertsPage: React.FC<GuestAlertsPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
                <button onClick={onBack} className="mr-4">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900">Alerts</h1>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center px-6 py-20">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <BellIcon className="w-24 h-24 text-gray-300" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Create an Account for Active Alerts
                    </h2>
                    
                    <p className="text-gray-600 mb-8 max-w-sm mx-auto">
                        Sign up or log in to receive notifications about your bookings, special offers, and updates from your favorite therapists and massage places.
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={onBack}
                            className="w-full max-w-xs bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                        >
                            Create Account
                        </button>
                        
                        <button
                            onClick={onBack}
                            className="w-full max-w-xs bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                    
                    <div className="mt-12 bg-white rounded-lg shadow-sm p-6 max-w-sm mx-auto">
                        <h3 className="font-semibold text-gray-900 mb-3">With an account you'll get:</h3>
                        <ul className="text-left text-sm text-gray-600 space-y-2">
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Real-time booking confirmations</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Exclusive deals and offers</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Updates from favorite therapists</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-green-500 mr-2">✓</span>
                                <span>Appointment reminders</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuestAlertsPage;
