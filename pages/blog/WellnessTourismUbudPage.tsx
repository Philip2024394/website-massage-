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

interface WellnessTourismUbudPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const WellnessTourismUbudPage: React.FC<WellnessTourismUbudPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const cleanup = setupBlogArticleSEO({
            title: 'The Rise of Wellness Tourism in Ubud: Opportunities for Therapists',
            description: 'Ubud wellness boom analysis: yoga retreat economy, digital nomad market, therapist opportunities, and how to capitalize on Bali\'s wellness tourism growth.',
            url: 'https://www.indastreetmassage.com/blog-wellness-tourism-ubud',
            image: 'https://ik.imagekit.io/7grri5v7d/bali%20massage.png?updatedAt=1761561435844',
            datePublished: '2024-12-01T08:00:00Z',
            dateModified: '2025-12-29T12:00:00Z',
            author: 'Made Surya',
            keywords: ['Ubud wellness tourism', 'Ubud massage', 'Bali wellness', 'yoga retreat Ubud', 'wellness tourism Bali'],
            breadcrumbs: [
                { name: 'Home', url: 'https://www.indastreetmassage.com/' },
                { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
                { name: 'Wellness Tourism in Ubud', url: 'https://www.indastreetmassage.com/blog-wellness-tourism-ubud' }
            ]
        });
        return cleanup;
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <span className="ml-1">Wellness Tourism Ubud</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Industry</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        The Rise of Wellness Tourism in Ubud: Opportunities for Therapists
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Wayan Surya</span>
                        <span>•</span>
                        <span>Aug 20, 2025</span>
                        <span>•</span>
                        <span>8 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/udun%20massage%20indonisea.png?updatedAt=1761562212712" 
                        alt="Wellness tourism growth in Ubud Bali opportunities for massage therapists" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Ubud has evolved from a quiet cultural village into the wellness capital of Southeast Asia. With yoga retreats, meditation centers, healing sanctuaries, and holistic spas at every turn, this jungle town attracts millions seeking transformation, rejuvenation, and spiritual growth. For massage therapists, Ubud offers unmatched opportunities—if you understand the market and position yourself strategically.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Why Ubud Became the Wellness Capital</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Historical Context:</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Ubud's transformation from rice paddies and art galleries to global wellness hub happened through perfect convergence:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Spiritual Heritage:</strong> Hindu temples, sacred forests, traditional healing (balian) traditions for centuries</li>
                        <li><strong>Elizabeth Gilbert Effect:</strong> "Eat, Pray, Love" (2006) spotlighted Ubud as spiritual healing destination—tourism exploded</li>
                        <li><strong>Yoga Boom:</strong> First yoga studios opened 1990s; now 200+ yoga schools, retreats, and teacher trainings</li>
                        <li><strong>Digital Nomad Influx:</strong> Fast WiFi + affordable long-term rentals attracted remote workers seeking work-life balance</li>
                        <li><strong>Holistic Ecosystem:</strong> Organic cafes, sound healing, cacao ceremonies, plant medicine—complete wellness infrastructure</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Ubud's Wellness Tourism by Numbers (2025)</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Market Statistics:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>2.8 million wellness tourists annually</strong> visit Ubud specifically for wellness purposes</li>
                        <li><strong>Average stay: 8-12 days</strong> (vs 3-4 days beach tourists)</li>
                        <li><strong>Average spending: $145 per day</strong> on wellness activities, accommodations, food</li>
                        <li><strong>1,200+ wellness businesses:</strong> Spas, yoga studios, retreats, healing centers</li>
                        <li><strong>3,500+ massage therapists</strong> registered in Ubud district</li>
                        <li><strong>68% female visitors</strong> (ages 28-55)</li>
                        <li><strong>Top source countries:</strong> USA (28%), Australia (18%), Germany (12%), UK (10%)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">What Makes Ubud Wellness Market Unique</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Client Demographics Differ from Beach Areas:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Intentional Seekers:</strong> Not casual spa-goers—serious about healing, transformation, wellness lifestyle</li>
                        <li><strong>Longer Stays:</strong> 1-4 week retreats vs single massage bookings</li>
                        <li><strong>Higher Education:</strong> 75% have bachelor's degrees or higher</li>
                        <li><strong>Holistic Mindset:</strong> Integrate massage with yoga, meditation, plant-based diet, energy work</li>
                        <li><strong>Willing to Invest:</strong> See wellness as priority, not luxury—spend accordingly</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Service Expectations:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Authentic Traditional Healing:</strong> Balinese massage, jamu, healing rituals with cultural integrity</li>
                        <li><strong>Energetic Awareness:</strong> Understanding of chakras, meridians, subtle body—not just physical manipulation</li>
                        <li><strong>Spiritual Sensitivity:</strong> Respect for clients' spiritual journeys, holding sacred space</li>
                        <li><strong>Holistic Integration:</strong> Connect massage to broader wellness practices</li>
                        <li><strong>Eco-Consciousness:</strong> Natural products, sustainable practices, ethical business</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Top Wellness Neighborhoods in Ubud</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Penestanan & Campuhan Ridge</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Character:</strong> Hillside yoga shalas, luxury wellness resorts, forest trails</li>
                        <li><strong>Clientele:</strong> High-end retreat participants, yoga teacher training students</li>
                        <li><strong>Pricing:</strong> IDR 600,000-1,200,000 per 90-minute session</li>
                        <li><strong>Opportunity:</strong> In-villa services for luxury properties, partnership with retreat centers</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Nyuh Kuning (Art Village)</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Character:</strong> Creative community, affordable long-term rentals, relaxed vibe</li>
                        <li><strong>Clientele:</strong> Digital nomads, artists, long-term wellness travelers</li>
                        <li><strong>Pricing:</strong> IDR 400,000-700,000 per 90-minute session</li>
                        <li><strong>Opportunity:</strong> Monthly wellness memberships, package deals for long-term residents</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Central Ubud (Jalan Raya)</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Character:</strong> Tourist hub, hotels, restaurants, shops, spa competition</li>
                        <li><strong>Clientele:</strong> Short-term tourists, day-trippers from coastal areas</li>
                        <li><strong>Pricing:</strong> IDR 350,000-600,000 per 90-minute session (more competitive)</li>
                        <li><strong>Opportunity:</strong> Volume business, walk-in traffic, hotel partnerships</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Tegallalang (Rice Terrace Area)</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Character:</strong> Scenic rural setting, boutique retreats, Instagram-famous views</li>
                        <li><strong>Clientele:</strong> Honeymooners, luxury wellness travelers, spiritual seekers</li>
                        <li><strong>Pricing:</strong> IDR 650,000-1,000,000 per 90-minute session</li>
                        <li><strong>Opportunity:</strong> Nature-based healing, outdoor treatments, couples retreats</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Most Requested Services in Ubud</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Top Treatment Preferences:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Traditional Balinese Massage (38%):</strong> Authenticity matters—clients want cultural experience</li>
                        <li><strong>Energy Healing Integration (22%):</strong> Reiki-infused massage, chakra balancing, pranic healing</li>
                        <li><strong>Deep Tissue/Trigger Point (18%):</strong> Yoga practitioners need muscle release</li>
                        <li><strong>Prenatal Massage (12%):</strong> Growing "babymoon" market</li>
                        <li><strong>Sound Healing + Massage (10%):</strong> Tibetan bowls, gongs during treatments</li>
                        <li><strong>Cacao Ceremony + Massage (8%):</strong> Heart-opening ritual before bodywork</li>
                        <li><strong>Multi-Day Packages (25%):</strong> 3-7 session series vs one-off bookings</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Income Potential in Ubud's Wellness Market</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Earning Models:</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Retreat Center Employment:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Base Salary:</strong> IDR 5,000,000-9,000,000/month</li>
                        <li><strong>Tips:</strong> IDR 100,000-300,000 per session (generous international guests)</li>
                        <li><strong>Benefits:</strong> Meals, accommodation, yoga classes, professional development</li>
                        <li><strong>Potential Total:</strong> IDR 10,000,000-18,000,000/month</li>
                    </ul>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Freelance Therapist:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Session Rate:</strong> IDR 500,000-900,000 per 90-minute treatment</li>
                        <li><strong>Average Bookings:</strong> 20-30 sessions/week (high season)</li>
                        <li><strong>Platform Fees:</strong> 15-20% (IndaStreet, booking sites)</li>
                        <li><strong>Potential Monthly Income:</strong> IDR 16,000,000-30,000,000 (experienced, well-reviewed)</li>
                    </ul>

                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Specialized Niche Services:</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Prenatal Specialists:</strong> IDR 700,000-1,200,000 per session (premium niche)</li>
                        <li><strong>Energy Healing Integration:</strong> IDR 800,000-1,500,000 (combines modalities)</li>
                        <li><strong>Private Retreat Facilitator:</strong> IDR 25,000,000-40,000,000/month (lead retreats)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">How to Succeed in Ubud's Competitive Market</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Essential Strategies:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Authentic Training:</strong> Traditional Balinese certification from respected local masters (not 2-day tourist courses)</li>
                        <li><strong>Energy Work Skills:</strong> Learn Reiki, chakra balancing, or other subtle body modalities</li>
                        <li><strong>English Fluency:</strong> 90% of wellness tourists are native English speakers</li>
                        <li><strong>Spiritual Awareness:</strong> Understand yoga philosophy, meditation, holistic wellness concepts</li>
                        <li><strong>Professional Presence:</strong> Strong online presence (Instagram essential), complete IndaStreet profile</li>
                        <li><strong>Retreat Center Partnerships:</strong> Network with retreat organizers—recurring group bookings</li>
                        <li><strong>Community Integration:</strong> Attend sound baths, cacao ceremonies, full moon gatherings—clients are there</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Challenges and How to Navigate Them</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Common Obstacles:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>High Competition:</strong> 3,500+ therapists
                            <br/><strong>Solution:</strong> Specialize (prenatal, energy healing, trauma-informed), build strong reviews</li>
                        <li><strong>Seasonal Fluctuations:</strong> July-August, December-January peak; May-June, November slow
                            <br/><strong>Solution:</strong> Offer packages to locals/expats, save during peak months</li>
                        <li><strong>Price Pressure:</strong> Some therapists charge IDR 200,000-300,000 (unsustainably low)
                            <br/><strong>Solution:</strong> Don't compete on price—compete on quality, experience, specialization</li>
                        <li><strong>Cultural Appropriation Concerns:</strong> Non-Balinese therapists offering "traditional Balinese massage"
                            <br/><strong>Solution:</strong> Train authentically, respect traditions, acknowledge lineage, don't fake cultural credentials</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Future Outlook: 2025-2030</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Growth Projections:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Psychedelic Wellness Integration:</strong> Legal psilocybin retreats emerging—pre/post integration massage services</li>
                        <li><strong>Long-Term Digital Nomads:</strong> New visa policies bring 6-12 month stays—monthly wellness memberships</li>
                        <li><strong>Men's Wellness Growth:</strong> Previously 70% female market, now men's retreats expanding (30% growth 2024-2025)</li>
                        <li><strong>Medical Tourism Crossover:</strong> Post-surgery recovery retreats combining medical care + holistic healing</li>
                        <li><strong>Climate Migration:</strong> Western health professionals relocating to Bali—premium market segment</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Ubud's wellness tourism boom shows no signs of slowing. For massage therapists willing to invest in authentic training, develop spiritual awareness, specialize strategically, and integrate into the conscious community, opportunities are extraordinary.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        This isn't just a market—it's a movement. Clients come to Ubud seeking transformation, and skilled therapists facilitating healing journeys are essential to that experience. Position yourself as more than massage provider—become a trusted guide on their wellness path.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Whether you're established in Ubud or considering relocation, platforms like IndaStreet connect you with the conscious wellness travelers who value quality, authenticity, and holistic healing—the clients who will sustain your thriving practice in Bali's spiritual heart.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Join Ubud's Wellness Community</h3>
                    <p className="text-xl mb-6">Connect with conscious clients on IndaStreet</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Start Your Ubud Journey
                    </button>
                </div>
            </article>
        </div>
    );
};

export default WellnessTourismUbudPage;
