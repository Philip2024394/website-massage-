import React, { useState } from 'react';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface QuickSupportPageProps {
    onNavigate: (page: string) => void;
}

const QuickSupportPage: React.FC<QuickSupportPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-orange-500">IndaStreet</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Side Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">inda</span>
                                <span className="text-orange-500">Street</span>
                            </h2>
                            <button 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all" 
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => onNavigate('home')} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/support%20indastreet.png?updatedAt=1761569793668)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">🆘 Quick Support</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Need immediate help? We're here to assist you with instant support and resources.
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Quick Contact Options */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Support</h3>
                            <p className="text-gray-600 mb-4">+62 812 3456 7890</p>
                            <p className="text-sm text-teal-600 font-bold">Available 24/7</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
                            <p className="text-gray-600 mb-4">support@indastreet.com</p>
                            <p className="text-sm text-teal-600 font-bold">Response within 24 hours</p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Visit FAQ</h3>
                            <p className="text-gray-600 mb-4">Common Questions</p>
                            <button 
                                onClick={() => onNavigate('faq')}
                                className="text-orange-600 font-bold hover:text-orange-700"
                            >
                                Browse FAQ →
                            </button>
                        </div>
                    </div>

                    {/* Common Issues */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Support Topics</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-orange-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">👤 Account Issues</h3>
                                <p className="text-gray-600 mb-3">
                                    Having trouble logging in, resetting password, or updating your profile?
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Password reset assistance</li>
                                    <li>• Profile verification help</li>
                                    <li>• Account settings guidance</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-teal-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">💳 Payment & Booking</h3>
                                <p className="text-gray-600 mb-3">
                                    Questions about payments, refunds, or booking modifications?
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Payment methods accepted</li>
                                    <li>• Refund policy information</li>
                                    <li>• Booking cancellation help</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">🏨 For Hotels & Villas</h3>
                                <p className="text-gray-600 mb-3">
                                    Need help with your hotel or villa dashboard and services?
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Dashboard navigation</li>
                                    <li>• QR code menu setup</li>
                                    <li>• Commission tracking</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-purple-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">💆 For Therapists</h3>
                                <p className="text-gray-600 mb-3">
                                    Therapist-specific support for profile and booking management.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Profile optimization tips</li>
                                    <li>• Booking request handling</li>
                                    <li>• Payment processing</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Support */}
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border-2 border-red-200">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-red-800 mb-4">🚨 Need Urgent Help?</h2>
                            <p className="text-gray-700 mb-6">
                                For urgent issues requiring immediate attention, please contact us via WhatsApp for the fastest response.
                            </p>
                            <a 
                                href="https://wa.me/6281234567890"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                            >
                                Chat on WhatsApp Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickSupportPage;
