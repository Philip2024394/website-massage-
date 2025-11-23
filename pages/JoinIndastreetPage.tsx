import React from 'react';

interface JoinIndastreetPageProps {
    onBack: () => void;
    onNavigateToTherapistLogin: () => void;
    onNavigateToMassagePlaceLogin: () => void;
    t: any;
}

const JoinIndastreetPage: React.FC<JoinIndastreetPageProps> = ({
    onBack,
    onNavigateToTherapistLogin,
    onNavigateToMassagePlaceLogin,
    t
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
                    <button 
                        onClick={onBack}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Join Indastreet</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet_button-removebg-preview.png"
                        alt="Indastreet"
                        className="h-32 mx-auto mb-6"
                    />
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Grow Your Wellness Business with Indastreet
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Join Indonesia's leading wellness marketplace and connect with thousands of customers looking for massage therapy services.
                    </p>
                </div>

                {/* Partner Type Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
                    {/* Therapist Card */}
                    <div 
                        onClick={onNavigateToTherapistLogin}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-teal-500"
                    >
                        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-6 text-white">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Massage Therapist</h3>
                            <p className="text-teal-50">Individual professionals</p>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Get direct bookings from customers</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Manage your availability & schedule</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Build your professional profile</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Zero commission on bookings</span>
                                </li>
                            </ul>
                            <button className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                                Join as Therapist
                            </button>
                        </div>
                    </div>

                    {/* Massage Place Card */}
                    <div 
                        onClick={onNavigateToMassagePlaceLogin}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105 border-2 border-transparent hover:border-purple-500"
                    >
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Massage Spa/Place</h3>
                            <p className="text-purple-50">Wellness centers & spas</p>
                        </div>
                        <div className="p-6">
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Showcase your spa/wellness center</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">List all your services & pricing</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Reach more customers online</span>
                                </li>
                                <li className="flex items-start">
                                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-gray-700">Zero platform fees</span>
                                </li>
                            </ul>
                            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                                Join as Spa/Place
                            </button>
                        </div>
                    </div>
                </div>

                {/* Why Join Section */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Join Indastreet?</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Growing Customer Base</h4>
                                <p className="text-gray-600">Connect with thousands of customers actively searching for wellness services across Indonesia.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Trusted Platform</h4>
                                <p className="text-gray-600">Be part of Indonesia's most trusted wellness marketplace with verified reviews and secure booking system.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Easy to Get Started</h4>
                                <p className="text-gray-600">Simple registration process and user-friendly dashboard. Start receiving bookings within minutes.</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Zero Platform Fees</h4>
                                <p className="text-gray-600">Keep 100% of your earnings. No hidden charges or platform commissions on your bookings.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-orange-500 to-teal-500 rounded-2xl shadow-2xl p-8 text-center text-white">
                    <h3 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h3>
                    <p className="text-xl mb-6 text-white/90">Join thousands of wellness professionals already using Indastreet</p>
                    <p className="text-lg">Select your role above to get started!</p>
                </div>
            </div>
        </div>
    );
};

export default JoinIndastreetPage;
