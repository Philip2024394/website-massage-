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

interface TherapistInfoPageProps {
    onNavigate: (page: string) => void;
}

const TherapistInfoPage: React.FC<TherapistInfoPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-black">Inda</span><span className="text-orange-500">Street</span>
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
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20places%20indonisea.png?updatedAt=1761571657409)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">🧘 For Therapists</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Join Indonesia's leading wellness marketplace and grow your massage therapy business
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Why Join IndaStreet */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Why Join IndaStreet as a Therapist?</h2>
                        
                        {/* Free Membership Banner */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 mb-8 mx-auto max-w-md">
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <h3 className="text-2xl font-bold text-white">FREE TO JOIN!</h3>
                                </div>
                                <p className="text-white font-semibold text-lg">Get 1 Month Free Membership</p>
                                <p className="text-green-100 text-sm mt-1">Start building your client base at no cost</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">📈</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Grow Your Client Base</h3>
                                <p className="text-gray-600">
                                    Connect with 50+ hotels, villas, and thousands of direct customers across Indonesia.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">💰</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Flexible Pricing</h3>
                                <p className="text-gray-600">
                                    Set your own rates and negotiate directly with clients. No hidden commissions.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">📱</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Management</h3>
                                <p className="text-gray-600">
                                    Manage your profile, bookings, and availability through our simple dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Membership Packages */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Affordable Membership Packages</h2>
                        <p className="text-center text-green-600 font-semibold text-lg mb-8">🎉 First Month FREE for all new members!</p>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-green-500 relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                                    FREE
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">1st Month</h3>
                                    <div className="text-3xl font-bold text-green-600 mb-2">FREE</div>
                                    <div className="text-sm text-gray-500 line-through mb-4">IDR 100K</div>
                                    <p className="text-sm text-gray-600 mb-4">Perfect for getting started</p>
                                    <ul className="text-left text-sm text-gray-600 space-y-2">
                                        <li>✓ Profile verification</li>
                                        <li>✓ Booking dashboard</li>
                                        <li>✓ WhatsApp integration</li>
                                        <li>✓ Search visibility</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-200">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">After 1st Month</h3>
                                    <div className="text-3xl font-bold text-teal-600 mb-4">IDR 100K</div>
                                    <p className="text-sm text-gray-600 mb-4">Continue with monthly</p>
                                    <ul className="text-left text-sm text-gray-600 space-y-2">
                                        <li>✓ Profile verification</li>
                                        <li>✓ Booking dashboard</li>
                                        <li>✓ WhatsApp integration</li>
                                        <li>✓ Search visibility</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-teal-500">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">POPULAR</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">3 Months</h3>
                                    <div className="text-3xl font-bold text-teal-600 mb-2">IDR 250K</div>
                                    <div className="text-sm text-green-600 font-bold mb-4">Save 17%</div>
                                    <p className="text-sm text-gray-600 mb-4">Best value for growth</p>
                                    <ul className="text-left text-sm text-gray-600 space-y-2">
                                        <li>✓ All basic features</li>
                                        <li>✓ Priority support</li>
                                        <li>✓ Featured placement</li>
                                        <li>✓ Analytics dashboard</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-gray-200 relative">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">6 Months</h3>
                                    <div className="text-3xl font-bold text-teal-600 mb-2">IDR 450K</div>
                                    <div className="text-sm text-green-600 font-bold mb-4">Save 25%</div>
                                    <p className="text-sm text-gray-600 mb-4">Long-term commitment</p>
                                    <ul className="text-left text-sm text-gray-600 space-y-2">
                                        <li>✓ All popular features</li>
                                        <li>✓ Premium badge</li>
                                        <li>✓ Marketing support</li>
                                        <li>✓ Priority listings</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow text-white relative">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">BEST DEAL</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-2">1 Year</h3>
                                    <div className="text-3xl font-bold mb-2">IDR 800K</div>
                                    <div className="text-sm font-bold mb-4">Save 33%</div>
                                    <p className="text-sm mb-4">Maximum savings</p>
                                    <ul className="text-left text-sm space-y-2">
                                        <li>✓ All premium features</li>
                                        <li>✓ VIP support</li>
                                        <li>✓ Top search ranking</li>
                                        <li>✓ Exclusive perks</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Get Started</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">1</div>
                                <h4 className="font-bold text-gray-900 mb-2">Create Profile</h4>
                                <p className="text-sm text-gray-600">Sign up and fill in your details, certifications, and specializations</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">2</div>
                                <h4 className="font-bold text-gray-900 mb-2">Get Verified</h4>
                                <p className="text-sm text-gray-600">Upload certifications for admin verification and approval</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">3</div>
                                <h4 className="font-bold text-gray-900 mb-2">Choose Package</h4>
                                <p className="text-sm text-gray-600">Select membership plan and complete payment via bank transfer</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">4</div>
                                <h4 className="font-bold text-gray-900 mb-2">Start Earning</h4>
                                <p className="text-sm text-gray-600">Receive bookings via WhatsApp and grow your business</p>
                            </div>
                        </div>
                    </div>

                    {/* Required Certifications */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Required Certifications</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-teal-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">✓ Accepted Certifications</h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• Traditional Balinese Massage Certificate</li>
                                    <li>• Swedish Massage Certification</li>
                                    <li>• Deep Tissue Therapy</li>
                                    <li>• Aromatherapy Certification</li>
                                    <li>• Reflexology Training</li>
                                    <li>• Sports Massage Qualification</li>
                                    <li>• Thai Massage Certificate</li>
                                    <li>• Any recognized professional qualification</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">📋 Verification Process</h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• Upload clear photos/scans of certificates</li>
                                    <li>• Include certification number if available</li>
                                    <li>• Provide institution name and date</li>
                                    <li>• Admin reviews within 24-48 hours</li>
                                    <li>• Get verified badge on approval</li>
                                    <li>• Profile goes live immediately after payment</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Features & Benefits */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Platform Features</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">📍</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Multi-Location Support</h4>
                                <p className="text-sm text-gray-600">List multiple service areas across Bali, Jakarta, Yogyakarta, and other cities</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">WhatsApp Integration</h4>
                                <p className="text-sm text-gray-600">Direct booking requests sent to your WhatsApp for instant communication</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Analytics Dashboard</h4>
                                <p className="text-sm text-gray-600">Track profile views, booking requests, and performance metrics</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">🎯</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Specialty Tags</h4>
                                <p className="text-sm text-gray-600">Highlight your expertise in specific massage techniques and treatments</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💼</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Job Opportunities</h4>
                                <p className="text-sm text-gray-600">Get discovered by hotels seeking permanent therapist employees</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">🌟</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Client Reviews</h4>
                                <p className="text-sm text-gray-600">Build your reputation with verified client ratings and testimonials</p>
                            </div>
                        </div>
                    </div>

                    {/* Success Stories */}
                    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Therapist Success Stories</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">👩</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Made Wayan</h4>
                                        <p className="text-sm text-gray-600">Traditional Balinese</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "IndaStreet doubled my monthly bookings! I now work with 5 hotels in Seminyak and earn IDR 15 million per month."
                                </p>
                                <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">👨</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Ketut Agus</h4>
                                        <p className="text-sm text-gray-600">Deep Tissue Specialist</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "The platform is so easy to use. WhatsApp bookings are instant and I manage everything from my phone. Best decision!"
                                </p>
                                <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">👩</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Sari Dewi</h4>
                                        <p className="text-sm text-gray-600">Aromatherapy Expert</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "Found my dream job through the platform! A luxury villa hired me full-time. Thank you IndaStreet!"
                                </p>
                                <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-12 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Join 500+ professional therapists already earning more with IndaStreet
                        </p>
                        <button 
                            onClick={() => onNavigate('registrationChoice')}
                            className="px-8 py-4 bg-white text-teal-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
                        >
                            Sign Up as Therapist
                        </button>
                        <p className="mt-6 text-sm">
                            Have questions? <button onClick={() => onNavigate('contact')} className="underline font-bold">Contact our team</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TherapistInfoPage;
