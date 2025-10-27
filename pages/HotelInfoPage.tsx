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

interface HotelInfoPageProps {
    onNavigate: (page: string) => void;
}

const HotelInfoPage: React.FC<HotelInfoPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-gray-800">Inda</span><span className="text-orange-500">Street</span>
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

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20places%20indonisea%20hotels.png?updatedAt=1761571807411)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">🏨 For Hotels & Villas</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Connect with 500+ verified massage therapists to elevate your guest experience
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Why Partner with IndaStreet */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Hotels & Villas Choose IndaStreet</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">✓</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Professionals</h3>
                                <p className="text-gray-600">
                                    All therapists are certified and verified. Browse credentials, specializations, and client reviews.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">💰</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">100% Free for Hotels</h3>
                                <p className="text-gray-600">
                                    No registration fees, no booking commissions. Pay therapists directly at rates you negotiate.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-3xl">⚡</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Communication</h3>
                                <p className="text-gray-600">
                                    WhatsApp integration for quick bookings. Most therapists respond within 15-30 minutes.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How It Works for Hotels */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Get Started</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">1</div>
                                <h4 className="font-bold text-gray-900 mb-2">Register Property</h4>
                                <p className="text-sm text-gray-600">Create free account with hotel/villa details and spa facilities</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">2</div>
                                <h4 className="font-bold text-gray-900 mb-2">Browse Therapists</h4>
                                <p className="text-sm text-gray-600">Search by specialty, location, availability, and ratings</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">3</div>
                                <h4 className="font-bold text-gray-900 mb-2">Contact via WhatsApp</h4>
                                <p className="text-sm text-gray-600">Direct messaging for booking inquiries and rate negotiation</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">4</div>
                                <h4 className="font-bold text-gray-900 mb-2">Book & Manage</h4>
                                <p className="text-sm text-gray-600">Track bookings and build relationships with trusted therapists</p>
                            </div>
                        </div>
                    </div>

                    {/* Features for Hotels */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Platform Features</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">🔍</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Advanced Search</h4>
                                <p className="text-sm text-gray-600">Filter by massage type, certification, language, experience level, and availability</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">⭐</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Verified Reviews</h4>
                                <p className="text-sm text-gray-600">Read authentic reviews from other hotels and clients before booking</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">📅</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Real-Time Availability</h4>
                                <p className="text-sm text-gray-600">See therapist availability calendars and book for specific dates/times</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">👔</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Hire Full-Time Staff</h4>
                                <p className="text-sm text-gray-600">Access "Therapist For Contract" to find professionals seeking permanent employment</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">📊</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Booking Dashboard</h4>
                                <p className="text-sm text-gray-600">Manage all bookings, therapist contacts, and service history in one place</p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Direct Negotiation</h4>
                                <p className="text-sm text-gray-600">Set your own rates with therapists - no platform fees or commissions</p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Information */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Transparent Pricing</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="border-l-4 border-green-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">✓ Free for Hotels</h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• No registration fees</li>
                                    <li>• No monthly subscriptions</li>
                                    <li>• No booking commissions</li>
                                    <li>• Unlimited therapist searches</li>
                                    <li>• Unlimited WhatsApp contacts</li>
                                    <li>• Free dashboard access</li>
                                </ul>
                            </div>

                            <div className="border-l-4 border-blue-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">💼 Optional: Hire Full-Time</h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• Browse "Therapist For Contract" listings for free</li>
                                    <li>• See qualifications, experience, certifications</li>
                                    <li>• Pay IDR 300,000 one-time fee to unlock contact info</li>
                                    <li>• No placement fees or recurring charges</li>
                                    <li>• Conduct your own interviews and negotiations</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Hotel Success Stories */}
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Hotels Are Saying</h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">🏨</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Seminyak Beach Resort</h4>
                                        <p className="text-sm text-gray-600">5-Star Hotel</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "IndaStreet transformed our spa services. We found 3 amazing therapists in our first week. Guest satisfaction scores increased 25%!"
                                </p>
                                <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">🏡</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Ubud Luxury Villa</h4>
                                        <p className="text-sm text-gray-600">Boutique Property</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "No booking fees means we can offer competitive prices to guests. Found a permanent therapist through the platform - best hire ever!"
                                </p>
                                <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                                        <span className="text-2xl">🏖️</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Canggu Beachfront Hotel</h4>
                                        <p className="text-sm text-gray-600">4-Star Resort</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic text-sm">
                                    "WhatsApp booking is genius! We get same-day therapists for urgent requests. Platform is super easy to use."
                                </p>
                                <div className="mt-4 text-yellow-500">⭐⭐⭐⭐⭐</div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Elevate Your Spa Services?</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Join 50+ hotels and villas already partnering with IndaStreet
                        </p>
                        <button 
                            onClick={() => onNavigate('registrationChoice')}
                            className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
                        >
                            Register Your Hotel/Villa
                        </button>
                        <p className="mt-6 text-sm">
                            Questions? <button onClick={() => onNavigate('contact')} className="underline font-bold">Contact our team</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelInfoPage;
