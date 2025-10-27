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

interface PartnershipInquiriesPageProps {
    onNavigate: (page: string) => void;
}

const PartnershipInquiriesPage: React.FC<PartnershipInquiriesPageProps> = ({ onNavigate }) => {
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

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/hotel%20staffs.png?updatedAt=1761578921097)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">Partnership Opportunities</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Join IndaStreet and grow your wellness business across Indonesia
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Partnership Types */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/hotel%20and%20villa.png?updatedAt=1761578465491" 
                                    alt="Hotel & Villa Partners"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Hotel & Villa Partners</h3>
                            <p className="text-gray-600 mb-4">
                                Enhance your guest experience with our exclusive wellness services and QR code menu system.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>✓ Commission-based model</li>
                                <li>✓ Guest satisfaction boost</li>
                                <li>✓ Easy integration</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/indostreet%203.png?updatedAt=1761578364603" 
                                    alt="Therapist Partners"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Therapist Partners</h3>
                            <p className="text-gray-600 mb-4">
                                Expand your client base and connect with hotels, villas, and direct customers.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>✓ Flexible scheduling</li>
                                <li>✓ Multiple income streams</li>
                                <li>✓ Professional support</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-4 flex items-center justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/indostreet%201.png?updatedAt=1761578176120" 
                                    alt="Corporate Partners"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Corporate Partners</h3>
                            <p className="text-gray-600 mb-4">
                                Provide wellness benefits to your employees with our corporate wellness programs.
                            </p>
                            <ul className="text-sm text-gray-600 space-y-2">
                                <li>✓ Custom packages</li>
                                <li>✓ Employee wellbeing</li>
                                <li>✓ Flexible billing</li>
                            </ul>
                        </div>
                    </div>

                    {/* Benefits Section */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Partner with IndaStreet?</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-bold text-purple-600 mb-4">📈 Growing Network</h3>
                                <p className="text-gray-600 mb-4">
                                    Join Indonesia's fastest-growing wellness marketplace with customers across Bali, Jakarta, Yogyakarta, and beyond.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-teal-600 mb-4">💰 Transparent Pricing</h3>
                                <p className="text-gray-600 mb-4">
                                    Clear commission structure with no hidden fees. You set your prices, we help you grow.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-blue-600 mb-4">🛠️ Easy Technology</h3>
                                <p className="text-gray-600 mb-4">
                                    Simple dashboard, QR code integration, and real-time analytics to manage your business.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-orange-600 mb-4">🤝 Dedicated Support</h3>
                                <p className="text-gray-600 mb-4">
                                    Our partnership team provides ongoing support, training, and marketing assistance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Success Stories */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partner Success Stories</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/hotel_staff-removebg-preview.png?updatedAt=1761577900471" 
                                            alt="Sunset Villa Bali"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Sunset Villa Bali</h4>
                                        <p className="text-sm text-gray-600">Luxury Villa Partner</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">
                                    "IndaStreet's QR menu system increased our guest satisfaction scores by 35% and generated IDR 22 million in commissions in just 6 months!"
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/indastreet_person-removebg-preview.png?updatedAt=1761577698634" 
                                            alt="Made Wayan"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">Made Wayan</h4>
                                        <p className="text-sm text-gray-600">Professional Therapist</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 italic">
                                    "Joining IndaStreet doubled my monthly bookings. The platform is easy to use and the hotel partnerships provide steady income."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Start Your Partnership Journey</h2>
                        <p className="text-gray-600 text-center mb-8">
                            Fill out the form below or email us at <a href="mailto:indastreet.id@gmail.com" className="text-orange-600 font-bold">indastreet.id@gmail.com</a>
                        </p>
                        
                        <div className="max-w-2xl mx-auto">
                            <form className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Business Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="Your business name"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                            placeholder="+62 xxx xxx xxxx"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Partnership Type *</label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
                                        <option value="">Select partnership type</option>
                                        <option value="hotel">Hotel / Villa</option>
                                        <option value="therapist">Therapist / Massage Provider</option>
                                        <option value="corporate">Corporate Wellness</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Message *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                                        placeholder="Tell us about your business and partnership goals..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors shadow-lg"
                                >
                                    Submit Partnership Inquiry
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnershipInquiriesPage;
