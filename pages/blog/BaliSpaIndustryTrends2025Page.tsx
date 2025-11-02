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

interface BaliSpaIndustryTrends2025PageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const BaliSpaIndustryTrends2025Page: React.FC<BaliSpaIndustryTrends2025PageProps> = ({ onNavigate, onBack: _onBack, t: _t }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* SEO Meta Tags would go in head */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <button 
                        onClick={() => setIsMenuOpen(true)} 
                        title="Menu"
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                    >
                       <BurgerMenuIcon className="w-6 h-6" />
                    </button>
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
                                <span className="text-orange-500">IndaStreet</span>
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
                                    onClick={() => { onNavigate?.('home'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                                <button 
                                    onClick={() => { onNavigate?.('blog'); setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">📚</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">All Blog Posts</h3>
                                        <p className="text-xs text-gray-500">Browse more articles</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            {/* Article Content */}
            <article className="max-w-4xl mx-auto px-4 py-12">
                {/* Breadcrumb */}
                <nav className="mb-8 text-sm text-gray-600">
                    <button onClick={() => onNavigate?.('home')} className="hover:text-orange-600">Home</button> / 
                    <button onClick={() => onNavigate?.('blog')} className="hover:text-orange-600 ml-1">Blog</button> / 
                    <span className="ml-1">Bali Spa Industry Trends 2025</span>
                </nav>

                {/* Header */}
                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-bold uppercase">
                            Industry Trends
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Bali Spa Industry Trends 2025: What Therapists Need to Know
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Dr. Ketut Wijaya</span>
                        <span>•</span>
                        <span>Oct 20, 2025</span>
                        <span>•</span>
                        <span>8 min read</span>
                    </div>
                </header>

                {/* Featured Image */}
                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/bali%20message.png?updatedAt=1761560198622" 
                        alt="Bali spa industry trends and massage therapy in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                {/* Article Content */}
                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        The Bali spa and wellness industry continues to evolve rapidly in 2025, presenting both challenges and opportunities for massage therapists across Indonesia. Understanding these trends is crucial for staying competitive in the thriving wellness tourism market.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. Wellness Tourism Growth in Bali</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Bali remains Southeast Asia's premier wellness destination, attracting millions of international tourists seeking authentic spa experiences. The island's wellness tourism sector has grown by 35% since 2023, with massage therapy services at the forefront of this expansion.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Therapists who specialize in traditional Balinese techniques combined with modern wellness practices are seeing the highest demand from both hotels and independent spas across Ubud, Seminyak, and Canggu.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. Integration of Technology in Spa Services</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Digital platforms like IndaStreet are revolutionizing how therapists connect with clients. Online booking systems, digital portfolios, and customer reviews have become essential tools for building a successful massage therapy career in Bali.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Therapists who maintain active online profiles and receive consistent positive reviews are earning 40-60% more than those relying solely on traditional word-of-mouth marketing.
                    </p>

                                        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. Rising Demand for Holistic Wellness Modalities</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Beyond traditional massage, clients increasingly seek integrated wellness experiences. Popular additions include:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Aromatherapy with locally-sourced Balinese essential oils</li>
                        <li>Sound healing with Tibetan singing bowls</li>
                        <li>Reflexology and chakra balancing</li>
                        <li>Hot stone therapy using volcanic stones</li>
                        <li>CBD-infused massage oils for enhanced relaxation</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. Sustainability and Eco-Conscious Practices</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Environmental consciousness is no longer optional in Bali's spa industry. Clients, especially international visitors, prefer therapists and spas that use organic products, minimize plastic waste, and support local communities.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Therapists who can articulate their commitment to sustainability and use certified organic oils see higher booking rates and premium pricing opportunities.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. Specialized Massage Techniques</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Generic massage services are being replaced by specialized offerings:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Prenatal massage</strong> - High demand from wellness retreats</li>
                        <li><strong>Sports massage</strong> - For yoga practitioners and athletes</li>
                        <li><strong>Deep tissue therapy</strong> - Targeting chronic pain and tension</li>
                        <li><strong>Lymphatic drainage</strong> - Popular for detox programs</li>
                        <li><strong>Traditional Balinese Boreh</strong> - Authentic cultural experience</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. Hotel and Villa Partnerships</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        The hotel-villa spa partnership model is booming in Bali. Properties without in-house spa facilities are partnering with certified therapists through platforms like IndaStreet to offer guests on-demand massage services.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        This arrangement provides steady income for therapists while offering hotels flexible wellness amenities without the overhead of maintaining a full spa facility.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Key Takeaways for Therapists</h2>
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8 rounded-r-lg">
                        <ul className="space-y-3 text-gray-800">
                            <li>✓ Invest in online presence and digital marketing</li>
                            <li>✓ Diversify skills with specialized massage techniques</li>
                            <li>✓ Partner with hotels and villas for consistent bookings</li>
                            <li>✓ Use organic and sustainable products</li>
                            <li>✓ Stay updated on wellness trends and certifications</li>
                            <li>✓ Offer integrated wellness experiences beyond basic massage</li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        The Bali spa industry in 2025 offers unprecedented opportunities for skilled, adaptable massage therapists. By embracing technology, specializing in high-demand techniques, and aligning with sustainable practices, therapists can build thriving careers in Indonesia's wellness capital.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Whether you're an established therapist or just starting your career, understanding these trends will help you stay competitive and maximize your earning potential in Bali's dynamic massage therapy market.
                    </p>
                </div>

                {/* Author Bio */}
                <div className="mt-12 p-6 bg-gray-100 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">About the Author</h3>
                    <p className="text-gray-700">
                        <strong>Dr. Ketut Wijaya</strong> is a wellness industry consultant and former spa director with over 15 years of experience in Bali's hospitality sector. He specializes in spa business development and therapist training programs.
                    </p>
                </div>

                {/* Call to Action */}
                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Ready to Grow Your Massage Therapy Career?</h3>
                    <p className="text-xl mb-6">Join IndaStreet to connect with clients and hotels across Bali</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Get Started Today
                    </button>
                </div>

                {/* Related Articles */}
                <div className="mt-16">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <button onClick={() => onNavigate?.('blog/traditional-balinese-massage')} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Traditional Balinese Massage: History & Techniques</h4>
                            <p className="text-gray-600 text-sm">Deep dive into the 1,000-year-old healing tradition...</p>
                        </button>
                        <button onClick={() => onNavigate?.('blog/spa-tourism-indonesia')} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow text-left">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">Spa Tourism in Indonesia: Growth Opportunities</h4>
                            <p className="text-gray-600 text-sm">How therapists can capitalize on the booming market...</p>
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BaliSpaIndustryTrends2025Page;
