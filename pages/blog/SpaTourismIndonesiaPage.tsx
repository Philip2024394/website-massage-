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

interface SpaTourismIndonesiaPageProps {
    onNavigate?: (page: string) => void;
}

const SpaTourismIndonesiaPage: React.FC<SpaTourismIndonesiaPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-orange-500">IndaStreet</span>
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
            
            {isMenuOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-orange-500">IndaStreet</span>
                            </h2>
                            <button onClick={() => setIsMenuOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button onClick={() => { onNavigate?.('home'); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md border-l-4 border-orange-500 group">
                                    <span className="text-2xl">🏠</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                                <button onClick={() => { onNavigate?.('blog'); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md border-l-4 border-purple-500 group">
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">All Blog Posts</h3>
                                        <p className="text-xs text-gray-500">View all articles</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <article className="max-w-4xl mx-auto px-4 py-12">
                <nav className="mb-8 text-sm text-gray-600">
                    <button onClick={() => onNavigate?.('home')} className="hover:text-orange-600">Home</button> / 
                    <button onClick={() => onNavigate?.('blog')} className="hover:text-orange-600 ml-1">Blog</button> / 
                    <span className="ml-1">Spa Tourism Indonesia</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Industry</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Spa Tourism in Indonesia: Growth Opportunities for Therapists
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Kadek Ayu</span>
                        <span>•</span>
                        <span>Sep 15, 2025</span>
                        <span>•</span>
                        <span>6 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/massage%20jogja%20indonisea.png?updatedAt=1761561233215" 
                        alt="Spa tourism growth and opportunities in Indonesia for massage therapists" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Indonesia's wellness tourism industry is booming—with millions of international visitors seeking spa treatments, traditional healing, and holistic wellness experiences annually. For massage therapists, this represents unprecedented opportunities to build thriving careers serving a growing, high-value market.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Indonesia's Wellness Tourism Market Size</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        The numbers tell a compelling growth story:
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2025 Market Statistics:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>16.3 million international tourists</strong> visited Indonesia in 2024 (Ministry of Tourism)</li>
                        <li><strong>68% of visitors</strong> engage in wellness activities during their stay</li>
                        <li><strong>$4.2 billion annual revenue</strong> from spa and wellness tourism</li>
                        <li><strong>Average spend: $287 per visitor</strong> on wellness services</li>
                        <li><strong>12.5% annual growth rate</strong>—fastest-growing tourism segment</li>
                        <li><strong>45,000+ registered massage therapists</strong> across Indonesia (up from 32,000 in 2020)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Top Wellness Tourism Destinations</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Bali—The Wellness Capital</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>6.2 million international visitors annually</strong></li>
                        <li><strong>Ubud:</strong> Yoga retreats, meditation centers, holistic healing—2,500+ wellness businesses</li>
                        <li><strong>Seminyak:</strong> Luxury spa resorts, beachfront treatments, high-end clientele</li>
                        <li><strong>Canggu:</strong> Digital nomad wellness scene—co-working + massage packages</li>
                        <li><strong>Nusa Dua:</strong> 5-star hotel spas serving premium international guests</li>
                        <li><strong>Average treatment price:</strong> IDR 400,000-900,000 (90-minute massage)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Yogyakarta—Cultural Wellness Hub</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>1.8 million wellness tourists annually</strong></li>
                        <li>Traditional Javanese healing (jamu, bekam, pijat)</li>
                        <li>Growing boutique hotel spa market</li>
                        <li><strong>Average treatment price:</strong> IDR 250,000-500,000</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Jakarta—Corporate Wellness Market</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>2.3 million business travelers annually</strong></li>
                        <li>Hotel spa services, in-room massage, executive stress relief</li>
                        <li>Growing corporate wellness program demand</li>
                        <li><strong>Average treatment price:</strong> IDR 500,000-1,200,000 (premium market)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Lombok—Emerging Wellness Destination</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>850,000 tourists annually</strong> (rapid growth post-infrastructure development)</li>
                        <li>Gili Islands wellness resorts, yoga retreats, beachfront spas</li>
                        <li>Less competition than Bali—opportunity for early movers</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">What Wellness Tourists Want</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Understanding client preferences maximizes booking opportunities:
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Top Requested Services:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Traditional Balinese Massage (42%):</strong> Authentic cultural experience</li>
                        <li><strong>Aromatherapy Massage (28%):</strong> Relaxation with essential oils</li>
                        <li><strong>Hot Stone Therapy (18%):</strong> Deep muscle relief</li>
                        <li><strong>Couples Massage (15%):</strong> Honeymoon and romantic travel</li>
                        <li><strong>Prenatal Massage (12%):</strong> Babymoon tourism segment</li>
                        <li><strong>Sports/Deep Tissue (11%):</strong> Active travelers (surfers, hikers, divers)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Client Demographics:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Age 28-45 (55%):</strong> Millennial wellness seekers</li>
                        <li><strong>Age 46-65 (30%):</strong> Baby boomers with disposable income</li>
                        <li><strong>Female (68%):</strong> Primary wellness service consumers</li>
                        <li><strong>Top Source Markets:</strong> Australia (23%), China (15%), USA (12%), Europe (18%)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Income Opportunities for Therapists</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Employment Models:</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>1. Hotel/Spa Employment</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Base Salary:</strong> IDR 4,000,000-8,000,000/month (Bali luxury properties)</li>
                        <li><strong>Commission:</strong> 15-20% of treatment revenue</li>
                        <li><strong>Tips:</strong> IDR 50,000-200,000 per treatment (international guests)</li>
                        <li><strong>Benefits:</strong> Health insurance, meals, transportation, accommodation (some resorts)</li>
                        <li><strong>Potential Monthly Income:</strong> IDR 8,000,000-15,000,000</li>
                    </ul>

                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>2. Freelance/Independent Practice</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Service Rate:</strong> IDR 400,000-900,000 per 90-minute session</li>
                        <li><strong>Average Bookings:</strong> 15-25 clients/week (busy season)</li>
                        <li><strong>Platform Fees:</strong> 15-20% (IndaStreet, booking platforms)</li>
                        <li><strong>Potential Monthly Income:</strong> IDR 12,000,000-25,000,000 (experienced therapists)</li>
                    </ul>

                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>3. Mobile Spa Services</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>In-Villa Treatments:</strong> IDR 600,000-1,200,000 (includes travel premium)</li>
                        <li><strong>Hotel In-Room:</strong> IDR 500,000-1,000,000</li>
                        <li><strong>Retreat Centers:</strong> Contract work IDR 8,000,000-12,000,000/month</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">How Therapists Can Capitalize on Growth</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Strategic Actions:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Specialize in High-Demand Services:</strong> Traditional Balinese, hot stone, couples massage</li>
                        <li><strong>Learn English Communication:</strong> 80% of wellness tourists speak English</li>
                        <li><strong>Build Online Presence:</strong> Google My Business, Instagram, IndaStreet profile with photos and reviews</li>
                        <li><strong>Target Peak Seasons:</strong> July-August, December-January (European holidays), Chinese New Year</li>
                        <li><strong>Offer Package Deals:</strong> Multi-day wellness programs, couples packages, group retreats</li>
                        <li><strong>Partner with Hotels/Villas:</strong> Become preferred provider for guest services</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Challenges and Solutions</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Common Obstacles:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Challenge:</strong> High competition in popular areas
                            <br/><strong>Solution:</strong> Differentiate through specialties, exceptional service, strong reviews</li>
                        <li><strong>Challenge:</strong> Seasonal income fluctuations
                            <br/><strong>Solution:</strong> Build local client base, offer corporate packages, save during peak seasons</li>
                        <li><strong>Challenge:</strong> Difficult to access tourists directly
                            <br/><strong>Solution:</strong> Join platforms like IndaStreet for instant market access</li>
                        <li><strong>Challenge:</strong> Price competition
                            <br/><strong>Solution:</strong> Focus on quality and experience, not competing on lowest price</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Future Outlook: 2025-2030</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Indonesia's wellness tourism sector shows no signs of slowing:
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Projected Growth Drivers:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>New Bali Airport Expansion:</strong> Capacity increase from 25M to 35M passengers annually</li>
                        <li><strong>Labuan Bajo Development:</strong> Komodo region emerging as luxury wellness destination</li>
                        <li><strong>Digital Nomad Visas:</strong> Long-stay wellness clients (6-12 months)</li>
                        <li><strong>Chinese Market Recovery:</strong> Pre-pandemic China sent 2.5M visitors—now rebounding</li>
                        <li><strong>Domestic Wellness Tourism:</strong> Growing Indonesian middle class seeking spa experiences</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Indonesia's spa tourism boom creates extraordinary opportunities for skilled massage therapists. With millions of wellness tourists seeking authentic healing experiences, proper positioning, quality service, and strategic marketing can build lucrative, sustainable careers.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Whether you're an established professional or entering the field, platforms like IndaStreet connect you directly with Indonesia's growing wellness tourism market—helping you capture your share of this $4.2 billion industry.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Join Indonesia's Wellness Tourism Boom</h3>
                    <p className="text-xl mb-6">Connect with tourists and hotels on IndaStreet</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Start Your Wellness Career
                    </button>
                </div>
            </article>
        </div>
    );
};

export default SpaTourismIndonesiaPage;
