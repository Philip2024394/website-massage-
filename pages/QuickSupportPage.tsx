import React from 'react';

interface QuickSupportPageProps {
    onNavigate: (page: string) => void;
}

const QuickSupportPage: React.FC<QuickSupportPageProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <button 
                        onClick={() => onNavigate('home')}
                        className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center gap-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="hidden sm:inline">Home</span>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-white text-gray-800 py-12 px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">🆘 Quick Support</h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                        Need immediate help? We're here to assist you with instant support and resources.
                    </p>
                </div>
            </div>

            {/* Main Content - Direct on page without containers */}
            <main className="p-4 pb-20">
                {/* Quick Contact Options */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us Directly</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">WhatsApp</h3>
                            <p className="text-sm text-gray-600 mb-2 text-center">+62 812 3456 7890</p>
                            <p className="text-xs text-green-600 font-semibold text-center">Available 24/7</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Email</h3>
                            <p className="text-sm text-gray-600 mb-2 text-center">indastreet.id@gmail.com</p>
                            <p className="text-xs text-teal-600 font-semibold text-center">24hr Response</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">FAQ</h3>
                            <p className="text-sm text-gray-600 mb-2 text-center">Common Questions</p>
                            <button 
                                onClick={() => onNavigate('faq')}
                                className="text-xs text-orange-600 font-semibold hover:text-orange-700 w-full"
                            >
                                Browse FAQ →
                            </button>
                        </div>
                    </div>
                </div>

                {/* Common Support Topics */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Support Topics</h2>
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">👤 Account Issues</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Having trouble logging in, resetting password, or updating your profile?
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1 ml-4">
                                <li>• Password reset assistance</li>
                                <li>• Profile verification help</li>
                                <li>• Account settings guidance</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-teal-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">💳 Payment & Booking</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Questions about payments, refunds, or booking modifications?
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1 ml-4">
                                <li>• Payment methods accepted</li>
                                <li>• Refund policy information</li>
                                <li>• Booking cancellation help</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">🏨 For Hotels & Partners</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Need help with your hotel or Indastreet Partners dashboard and services?
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1 ml-4">
                                <li>• Dashboard navigation</li>
                                <li>• QR code menu setup</li>
                                <li>• Commission tracking</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">💆 For Therapists</h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Therapist-specific support for profile and booking management.
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1 ml-4">
                                <li>• Profile optimization tips</li>
                                <li>• Booking request handling</li>
                                <li>• Payment processing</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Emergency Support */}
                <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-red-800 mb-3">🚨 Need Urgent Help?</h2>
                        <p className="text-sm text-gray-700 mb-5">
                            For urgent issues requiring immediate attention, contact us via WhatsApp for the fastest response.
                        </p>
                        <a 
                            href="https://wa.me/6281234567890"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                        >
                            Chat on WhatsApp Now
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer - Fixed positioning */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-6 z-50">
                <div className="px-4">
                    <div className="flex justify-center gap-2 mb-3">
                        <button 
                            onClick={() => onNavigate('home')}
                            className="text-xs text-orange-500 font-medium hover:underline"
                        >
                            Home
                        </button>
                        <span className="text-gray-400">|</span>
                        <button className="text-xs text-orange-500 font-medium hover:underline">
                            Terms
                        </button>
                        <span className="text-gray-400">|</span>
                        <button className="text-xs text-orange-500 font-medium hover:underline">
                            Privacy
                        </button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                        © 2025 IndaStreet Massage
                    </p>
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default QuickSupportPage;
