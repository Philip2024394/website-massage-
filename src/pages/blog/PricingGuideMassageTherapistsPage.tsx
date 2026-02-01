// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { setupBlogArticleSEO } from '../../utils/seoSchema';

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

interface PricingGuideMassageTherapistsPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const PricingGuideMassageTherapistsPage: React.FC<PricingGuideMassageTherapistsPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        const cleanup = setupBlogArticleSEO({
            title: '2025 Pricing Guide for Massage Therapists in Indonesia',
            description: 'Comprehensive pricing strategies for massage therapists: market rates by city, session pricing, premium services, packages, and maximizing your income.',
            url: 'https://www.indastreetmassage.com/blog-pricing-guide-massage',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massages.png?updatedAt=1761561725353',
            datePublished: '2024-11-28T08:00:00Z',
            dateModified: '2025-12-29T12:00:00Z',
            author: 'Wayan Putra',
            keywords: ['massage pricing', 'therapist rates Indonesia', 'massage fees', 'pricing strategy massage', 'therapist income'],
            breadcrumbs: [
                { name: 'Home', url: 'https://www.indastreetmassage.com/' },
                { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
                { name: 'Pricing Guide for Massage Therapists', url: 'https://www.indastreetmassage.com/blog-pricing-guide-massage' }
            ]
        });
        return cleanup;
    }, []);
    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
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
                        <nav className="flex-grow  p-4">
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
                    <span className="ml-1">Pricing Guide for Therapists</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Career</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Setting Your Rates: Pricing Guide for Freelance Therapists
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Gede Wira</span>
                        <span>•</span>
                        <span>Sep 5, 2025</span>
                        <span>•</span>
                        <span>7 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/jogja%20massage.png?updatedAt=1761561572184" 
                        alt="Pricing strategies for freelance massage therapists in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Setting competitive yet profitable rates is one of the most challenging decisions for freelance massage therapists. Price too low and you undervalue your expertise; price too high and you risk losing clients. This comprehensive guide helps you establish fair pricing based on location, experience, specialty, and market demand across Indonesia.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Indonesia Market Rate Benchmarks (2025)</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Bali Pricing Tiers:</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Entry-Level (0-2 years experience):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>60-minute massage: IDR 250,000-400,000</li>
                        <li>90-minute massage: IDR 350,000-550,000</li>
                        <li>Locations: Kuta, Sanur, local neighborhoods</li>
                    </ul>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Mid-Level (3-5 years experience):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>60-minute massage: IDR 400,000-650,000</li>
                        <li>90-minute massage: IDR 550,000-850,000</li>
                        <li>Locations: Seminyak, Canggu, Ubud wellness areas</li>
                    </ul>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Expert-Level (5+ years, specializations):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>60-minute massage: IDR 650,000-1,000,000</li>
                        <li>90-minute massage: IDR 850,000-1,400,000</li>
                        <li>Locations: Nusa Dua luxury resorts, private villas, high-end wellness retreats</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Other Major Indonesian Cities:</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Jakarta (Corporate Market):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>In-room hotel massage: IDR 500,000-1,200,000</li>
                        <li>Office chair massage (30 min): IDR 300,000-500,000</li>
                        <li>Corporate wellness contracts: IDR 8,000,000-15,000,000/month</li>
                    </ul>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Yogyakarta (Cultural Tourism):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>60-minute traditional Javanese: IDR 200,000-400,000</li>
                        <li>90-minute full body: IDR 300,000-550,000</li>
                        <li>Hotel partnerships: IDR 350,000-600,000</li>
                    </ul>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Lombok & Gili Islands (Emerging Market):</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>60-minute beachside massage: IDR 250,000-500,000</li>
                        <li>Resort partnerships: IDR 400,000-700,000</li>
                        <li>Growth opportunity—less competition than Bali</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Factors That Influence Your Pricing</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Location Premium</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>High-End Areas:</strong> Seminyak, Ubud wellness district, Nusa Dua—charge 30-50% more</li>
                        <li><strong>Tourist Zones:</strong> Proximity to hotels, beaches, attractions—add 20-30%</li>
                        <li><strong>Mobile Service:</strong> In-villa/hotel treatments command 25-40% premium for travel/convenience</li>
                        <li><strong>Local Neighborhoods:</strong> Lower pricing to match local purchasing power</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Experience and Credentials</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Certifications:</strong> Each additional certification (prenatal, sports, aromatherapy) adds 10-15% value</li>
                        <li><strong>Years in Practice:</strong> 5+ years justifies premium pricing</li>
                        <li><strong>Specialty Training:</strong> Traditional Balinese certification, Thai massage, reflexology increases rates</li>
                        <li><strong>Guest Reviews:</strong> 100+ five-star reviews support higher pricing</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Service Type and Complexity</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Basic Relaxation:</strong> Base rate</li>
                        <li><strong>Deep Tissue/Sports:</strong> +15-20% (more physically demanding)</li>
                        <li><strong>Hot Stone Therapy:</strong> +20-30% (equipment, preparation time)</li>
                        <li><strong>Prenatal Massage:</strong> +15-25% (specialized training, liability)</li>
                        <li><strong>Couples Massage:</strong> 1.8x single rate (not 2x—volume discount)</li>
                        <li><strong>Aromatherapy:</strong> +10-15% (essential oil costs)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Session Duration</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>30 minutes:</strong> 50-60% of 60-minute rate (not proportional—setup time same)</li>
                        <li><strong>60 minutes:</strong> Standard base rate</li>
                        <li><strong>90 minutes:</strong> 1.4-1.5x base rate (not 1.5x—efficiency of extended session)</li>
                        <li><strong>120 minutes:</strong> 1.8-2x base rate</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Pricing Strategy Approaches</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Cost-Plus Pricing</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Calculate your costs and add desired profit margin:
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Example 90-Minute Session Breakdown:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Travel/Transportation: IDR 50,000</li>
                        <li>Massage oils/supplies: IDR 30,000</li>
                        <li>Platform fees (15%): IDR 105,000 (if rate is IDR 700,000)</li>
                        <li>Time investment: 2.5 hours total (travel + setup + treatment + breakdown)</li>
                        <li>Desired hourly income: IDR 200,000/hour = IDR 500,000 for time</li>
                        <li><strong>Minimum Rate:</strong> IDR 685,000 (round to IDR 700,000)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Competitive Pricing</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Research what other therapists with similar experience/location charge:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Match Market:</strong> Price within 10% of competitors with similar credentials</li>
                        <li><strong>Premium Positioning:</strong> Price 15-25% above average if you offer superior service/experience</li>
                        <li><strong>Value Positioning:</strong> Price 10-20% below average to build client base (temporary strategy)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Value-Based Pricing</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Price based on the value/results clients receive:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Pain Relief Specialists:</strong> Chronic pain sufferers pay premium for effective treatment</li>
                        <li><strong>Luxury Experience:</strong> Premium atmosphere, exceptional service justifies higher rates</li>
                        <li><strong>Convenience:</strong> Mobile service saves clients time—charge accordingly</li>
                        <li><strong>Unique Offerings:</strong> Rare specializations (craniosacral, myofascial release) command premium</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Package and Discount Strategies</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Client Retention Packages:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>3-Session Package:</strong> 10% discount (locks in repeat business)</li>
                        <li><strong>5-Session Package:</strong> 15% discount (better client commitment)</li>
                        <li><strong>10-Session Package:</strong> 20% discount (ideal for chronic pain management)</li>
                        <li><strong>Monthly Membership:</strong> 2-4 massages/month at discounted rate with auto-billing</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">When to Offer Discounts:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Low Season:</strong> May-June, September-October in Bali—offer 15-20% promotions</li>
                        <li><strong>First-Time Clients:</strong> 10-15% introductory rate to reduce booking hesitation</li>
                        <li><strong>Referral Rewards:</strong> Give existing clients IDR 100,000 credit for successful referrals</li>
                        <li><strong>Group Bookings:</strong> 3+ people receive 10-15% per person discount</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">When NOT to Discount:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Peak tourist season (July-August, December-January, Chinese New Year)</li>
                        <li>When you're fully booked—scarcity increases value</li>
                        <li>Premium specialized services (hot stone, prenatal, sports therapy)</li>
                        <li>If discounting would attract wrong clientele (price-shoppers vs quality-seekers)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Raising Your Rates</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">When to Increase Pricing:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Fully booked 3+ weeks in advance consistently</li>
                        <li>After earning new certifications/specializations</li>
                        <li>Annual inflation adjustment (5-10% per year)</li>
                        <li>50+ five-star reviews accumulated</li>
                        <li>Demand significantly exceeds availability</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">How to Increase Without Losing Clients:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Gradual Increases:</strong> 10-15% every 6-12 months vs 30% overnight</li>
                        <li><strong>Grandfather Existing Clients:</strong> Current regulars keep old rate for 3-6 months</li>
                        <li><strong>Communicate Value:</strong> Explain new certifications, improved service, enhanced experience</li>
                        <li><strong>Offer Packages:</strong> Pre-purchased packages at current rates before increase</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Common Pricing Mistakes to Avoid</h2>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Underpricing:</strong> Charging too little attracts wrong clients, creates burnout, unsustainable income</li>
                        <li><strong>Pricing Exactly Like Competitors:</strong> No differentiation—compete on value, not just price</li>
                        <li><strong>Frequent Discounts:</strong> Conditions clients to wait for sales, devalues your work</li>
                        <li><strong>Complex Pricing:</strong> Too many tiers/options confuse clients—keep it simple</li>
                        <li><strong>Not Adjusting for Inflation:</strong> Your income effectively decreases if rates stay static</li>
                        <li><strong>Ignoring Costs:</strong> Forgetting platform fees, supplies, travel, taxes in calculations</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Strategic pricing balances fair compensation for your expertise with market realities and client affordability. Start with competitive market research, calculate your true costs, consider your experience level, and adjust based on demand.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Remember: premium pricing signals quality. Clients seeking the cheapest massage often aren't your ideal clients. Focus on delivering exceptional value, building strong reputations, and charging rates that sustain thriving careers—not just survival.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Platforms like IndaStreet help you reach clients willing to pay fair rates for professional services, connecting you with quality bookings across Indonesia's booming wellness tourism market.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Build Your Professional Practice</h3>
                    <p className="text-xl mb-6">Set competitive rates and find quality clients on IndaStreet</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Join as Therapist
                    </button>
                </div>
            </article>
        </div>
    );
};

export default PricingGuideMassageTherapistsPage;
