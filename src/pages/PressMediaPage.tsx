// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
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

interface PressMediaPageProps {
    onNavigate: (page: string) => void;
}

const PressMediaPage: React.FC<PressMediaPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
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

                        <nav className="flex-grow  p-4">
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

            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-red-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20partners%20jogja.png?updatedAt=1761568590477)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">📰 Press & Media</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Media inquiries, press releases, and brand assets for journalists and content creators
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Quick Contact */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Media Contact</h2>
                        <p className="text-gray-600 mb-6">
                            For press inquiries, interviews, and media partnerships, please reach out to our communications team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pb-20 justify-center items-center">
                            <a href="mailto:indastreet.id@gmail.com" className="px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors">
                                Email: indastreet.id@gmail.com
                            </a>
                            <p className="text-gray-600">Response time: Within 24 hours</p>
                        </div>
                    </div>

                    {/* Press Releases */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Latest Press Releases</h2>
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-4 pb-20">
                                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">📢</span>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-orange-600 font-bold mb-1">October 2025</p>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">IndaStreet Expands to 50+ Hotels Across Indonesia</h3>
                                        <p className="text-gray-600 mb-3">
                                            IndaStreet announces major expansion with partnerships across Bali, Jakarta, and Yogyakarta, bringing wellness services to thousands of hotel guests.
                                        </p>
                                        <button className="text-orange-600 font-bold hover:text-orange-700">Read More →</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-4 pb-20">
                                    <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">🏆</span>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-teal-600 font-bold mb-1">September 2025</p>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">IndaStreet Wins "Best Wellness Platform" Award</h3>
                                        <p className="text-gray-600 mb-3">
                                            Recognized for innovation in connecting wellness professionals with hospitality partners and customers across Indonesia.
                                        </p>
                                        <button className="text-orange-600 font-bold hover:text-orange-700">Read More →</button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-4 pb-20">
                                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <span className="text-2xl">💰</span>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-purple-600 font-bold mb-1">August 2025</p>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">IndaStreet Secures Series A Funding</h3>
                                        <p className="text-gray-600 mb-3">
                                            Platform secures funding to accelerate growth and enhance technology infrastructure for wellness marketplace.
                                        </p>
                                        <button className="text-orange-600 font-bold hover:text-orange-700">Read More →</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Company Facts */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">IndaStreet at a Glance</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-orange-600 mb-2">500+</div>
                                <p className="text-gray-700 font-semibold">Registered Therapists</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-teal-600 mb-2">50+</div>
                                <p className="text-gray-700 font-semibold">Hotel Partners</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-600 mb-2">10K+</div>
                                <p className="text-gray-700 font-semibold">Monthly Bookings</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600 mb-2">5</div>
                                <p className="text-gray-700 font-semibold">Cities Covered</p>
                            </div>
                        </div>
                    </div>

                    {/* Brand Assets */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Brand Assets & Press Kit</h2>
                        <p className="text-gray-600 text-center mb-8">
                            Download our official logos, brand guidelines, and media assets for your publications.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl">🎨</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Logo Package</h3>
                                <p className="text-sm text-gray-600 mb-4">PNG, SVG, and vector formats</p>
                                <button className="text-orange-600 font-bold hover:text-orange-700">Download</button>
                            </div>

                            <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl">📸</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Product Screenshots</h3>
                                <p className="text-sm text-gray-600 mb-4">High-resolution app images</p>
                                <button className="text-orange-600 font-bold hover:text-orange-700">Download</button>
                            </div>

                            <div className="border-2 border-gray-200 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    <span className="text-2xl">📄</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Brand Guidelines</h3>
                                <p className="text-sm text-gray-600 mb-4">Complete brand guide PDF</p>
                                <button className="text-orange-600 font-bold hover:text-orange-700">Download</button>
                            </div>
                        </div>
                    </div>

                    {/* Media Inquiries Form */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Submit Media Inquiry</h2>
                        <div className="max-w-2xl mx-auto">
                            <form className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4 pb-20">
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 font-bold mb-2">Publication *</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                            placeholder="Media outlet"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Inquiry Type *</label>
                                    <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none">
                                        <option value="">Select type</option>
                                        <option value="interview">Interview Request</option>
                                        <option value="press-release">Press Release Request</option>
                                        <option value="partnership">Media Partnership</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-bold mb-2">Message *</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                        placeholder="Tell us about your inquiry..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors shadow-lg"
                                >
                                    Submit Inquiry
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PressMediaPage;

