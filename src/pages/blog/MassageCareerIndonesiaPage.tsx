// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { setupBlogArticleSEO } from '../../utils/seoSchema';
import UniversalHeader from '../../components/shared/UniversalHeader';

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

interface MassageCareerIndonesiaPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const MassageCareerIndonesiaPage: React.FC<MassageCareerIndonesiaPageProps> = ({ onNavigate, onBack: _onBack, t: _t }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const cleanup = setupBlogArticleSEO({
            title: 'Building a Successful Massage Therapy Career in Indonesia',
            description: 'Complete guide to starting and growing your massage therapy career in Indonesia: training, certification, pricing strategies, and income expectations for 2025.',
            url: 'https://www.indastreetmassage.com/blog-massage-career-indonesia',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massages.png?updatedAt=1761561725353',
            datePublished: '2024-11-15T08:00:00Z',
            dateModified: '2025-12-29T12:00:00Z',
            author: 'Made Wira',
            keywords: ['massage career Indonesia', 'therapist training', 'massage certification', 'therapist income', 'wellness career'],
            breadcrumbs: [
                { name: 'Home', url: 'https://www.indastreetmassage.com/' },
                { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
                { name: 'Massage Career Indonesia', url: 'https://www.indastreetmassage.com/blog-massage-career-indonesia' }
            ]
        });
        return cleanup;
    }, []);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <UniversalHeader
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton
                showLanguageSelector={false}
            />

            <div className="pt-[60px] sm:pt-16" aria-hidden />

            {isMenuOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} aria-hidden />
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-white shadow-2xl flex flex-col border-l border-gray-200 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">
                                <span className="text-gray-900">Inda</span><span className="text-orange-500">Street</span>
                            </h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                <CloseIcon />
                            </button>
                        </div>
                        <nav className="flex-grow p-4">
                            <div className="space-y-2">
                                <button onClick={() => { onNavigate?.('home'); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-orange-50 border-l-4 border-orange-500 group">
                                    <span className="text-2xl">🏠</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                                <button onClick={() => { onNavigate?.('blog'); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-orange-50 border-l-4 border-orange-500 group">
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600">All Blog Posts</h3>
                                        <p className="text-xs text-gray-500">View all articles</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <article>
                {/* Full-height hero image – app theme: full viewport */}
                <div className="w-full min-h-[100vh] -mt-[60px] sm:-mt-16 relative">
                    <img
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20blogs.png"
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                </div>

                {/* Content card – app theme: white card, rounded, shadow */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-24 relative z-10 pb-12">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="px-4 sm:px-8 py-8 sm:py-10">
                            <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
                                <button onClick={() => onNavigate?.('home')} className="hover:text-orange-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-orange-200">Home</button>
                                <span className="mx-1">/</span>
                                <button onClick={() => onNavigate?.('blog')} className="hover:text-orange-600 transition-colors rounded focus:outline-none focus:ring-2 focus:ring-orange-200">Blog</button>
                                <span className="mx-1">/</span>
                                <span className="text-gray-900 font-medium">Build a Successful Massage Career</span>
                            </nav>

                            <header className="mb-8">
                                <span className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-4">Career Advice</span>
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                    How to Build a Successful Massage Career in Indonesia
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm">
                                    <span>By Wayan Putra</span>
                                    <span>•</span>
                                    <span>Oct 10, 2025</span>
                                    <span>•</span>
                                    <span>10 min read</span>
                                </div>
                            </header>

                            <div className="prose prose-base max-w-none">
                                <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
                        Indonesia's massage therapy industry offers tremendous opportunities for skilled professionals. With growing wellness tourism, increasing local demand, and the rise of digital platforms like IndaStreet, therapists can build thriving careers. Here's your complete roadmap to success.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">1. Get Proper Certification and Training</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Professional certification is your foundation. Indonesian clients and international tourists increasingly demand qualified therapists with recognized credentials.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Essential Certifications:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Traditional Balinese Massage:</strong> Foundation training available in Ubud, Denpasar, and Sanur (4-6 weeks, IDR 3-8 million)</li>
                        <li><strong>Swedish Massage Certification:</strong> International standard technique (2-3 months)</li>
                        <li><strong>Deep Tissue & Sports Massage:</strong> Specialized training for athletic clientele</li>
                        <li><strong>Aromatherapy Massage:</strong> Essential oil therapy certification</li>
                        <li><strong>Prenatal Massage:</strong> High-demand specialty commanding premium rates</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Investment in education pays off quickly. Certified therapists in Bali earn 40-70% more than uncertified practitioners.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">2. Build Your Professional Profile</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Your online presence is your digital storefront. Platforms like IndaStreet allow therapists to showcase skills, certifications, specialties, and client reviews.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Profile Essentials:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Professional photos:</strong> Clean, well-lit images in professional attire</li>
                        <li><strong>Detailed bio:</strong> Training background, specialties, years of experience</li>
                        <li><strong>Service menu:</strong> Clear descriptions of each massage type offered</li>
                        <li><strong>Pricing transparency:</strong> List rates for different session lengths</li>
                        <li><strong>Availability calendar:</strong> Keep schedule updated in real-time</li>
                        <li><strong>Languages spoken:</strong> English, Bahasa Indonesia, Mandarin, Japanese, etc.</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">3. Master Client Acquisition</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Consistent client flow is essential for financial stability. Successful Indonesian therapists use multiple channels:
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Client Sources:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>IndaStreet Platform:</strong> Connect with clients and hotels seeking professional therapists</li>
                        <li><strong>Hotel Partnerships:</strong> Secure contracts with resorts and boutique hotels</li>
                        <li><strong>Social Media:</strong> Instagram, Facebook, TikTok for local reach</li>
                        <li><strong>Google My Business:</strong> Essential for local SEO and tourist bookings</li>
                        <li><strong>Referral Programs:</strong> Offer incentives for client referrals (10-15% discount)</li>
                        <li><strong>Wellness Centers:</strong> Part-time positions at spas and yoga studios</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">4. Set Competitive Pricing</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Pricing strategy impacts your income and client base. Indonesian massage therapy rates vary significantly by location, specialty, and clientele.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">2025 Indonesia Pricing Guidelines:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Bali Tourist Areas (Seminyak, Ubud, Canggu):</strong> IDR 300,000-750,000/hour</li>
                        <li><strong>Jakarta CBD:</strong> IDR 400,000-900,000/hour</li>
                        <li><strong>Yogyakarta, Surabaya:</strong> IDR 200,000-500,000/hour</li>
                        <li><strong>Specialty treatments (Hot Stone, Prenatal):</strong> 30-50% premium</li>
                        <li><strong>Hotel in-room service:</strong> Additional IDR 100,000-200,000</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Start competitively, then increase rates as you build reputation and client base. Review pricing quarterly based on demand and experience level.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">5. Deliver Exceptional Client Experience</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Client retention is more profitable than constant acquisition. Outstanding service turns first-time clients into regulars.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Excellence Checklist:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Punctuality:</strong> Arrive 5-10 minutes early for appointments</li>
                        <li><strong>Hygiene:</strong> Impeccable cleanliness, fresh linens, sanitized equipment</li>
                        <li><strong>Communication:</strong> Consult on pressure preferences, health concerns, focus areas</li>
                        <li><strong>Professionalism:</strong> Maintain boundaries, dress code, confidentiality</li>
                        <li><strong>Follow-up:</strong> Message clients post-session with care tips</li>
                        <li><strong>Amenities:</strong> Quality oils, relaxing music, comfortable temperature</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">6. Collect and Leverage Reviews</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Online reviews are your most powerful marketing tool. Indonesian and international clients heavily rely on testimonials when booking.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Review Strategy:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Request reviews immediately after positive sessions</li>
                        <li>Make it easy: provide direct links to Google, IndaStreet, TripAdvisor</li>
                        <li>Respond professionally to all reviews (positive and negative)</li>
                        <li>Showcase testimonials on social media and website</li>
                        <li>Aim for 20+ reviews within first 3 months</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">7. Expand Your Income Streams</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Successful therapists diversify beyond one-on-one sessions. Multiple revenue streams create financial stability and growth.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Income Diversification:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Workshops & Training:</strong> Teach massage techniques (IDR 500,000-2,000,000/class)</li>
                        <li><strong>Product Sales:</strong> Essential oils, massage tools, wellness products (20-30% margin)</li>
                        <li><strong>Online Consultations:</strong> Virtual wellness coaching sessions</li>
                        <li><strong>Corporate Wellness:</strong> Office chair massage contracts</li>
                        <li><strong>Retreat Partnerships:</strong> Work with yoga retreats and wellness resorts</li>
                        <li><strong>Mobile Spa Services:</strong> Group bookings for events and parties</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">8. Manage Finances Professionally</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Financial management separates successful entrepreneurs from struggling practitioners. Track income, expenses, and plan for growth.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Financial Best Practices:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Register as freelancer or small business (UMKM) for tax benefits</li>
                        <li>Set aside 20-25% of income for taxes</li>
                        <li>Maintain emergency fund (3-6 months expenses)</li>
                        <li>Invest in continuing education (5-10% of annual income)</li>
                        <li>Use accounting software or spreadsheets for tracking</li>
                        <li>Open business bank account separate from personal finances</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">9. Network and Build Relationships</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Indonesia's massage industry thrives on relationships. Networking opens doors to partnerships, referrals, and opportunities.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">Networking Strategies:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Join Indonesian massage therapy associations and groups</li>
                        <li>Attend wellness industry events and trade shows</li>
                        <li>Connect with hotel spa managers and wellness directors</li>
                        <li>Collaborate with yoga instructors, nutritionists, and wellness coaches</li>
                        <li>Participate in community wellness events and health fairs</li>
                        <li>Build relationships with medical practitioners for referrals</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">10. Plan for Long-Term Growth</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Sustainable careers require vision beyond today's bookings. Set goals, measure progress, and evolve with industry trends.
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3">5-Year Career Milestones:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Year 1:</strong> Build client base, establish online presence, earn consistent IDR 10-15 million/month</li>
                        <li><strong>Year 2:</strong> Secure hotel partnerships, add specialty services, reach IDR 20-25 million/month</li>
                        <li><strong>Year 3:</strong> Launch workshops or product line, diversify income streams</li>
                        <li><strong>Year 4:</strong> Mentor junior therapists, consider opening small spa or studio</li>
                        <li><strong>Year 5:</strong> Establish brand authority, multiple locations or franchising opportunities</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-10 mb-4">Conclusion</h2>
                    <p className="text-gray-700 mb-5 leading-relaxed">
                        Building a successful massage therapy career in Indonesia requires dedication, continuous learning, professional ethics, and smart business practices. The industry rewards excellence with financial stability, flexibility, and the satisfaction of improving others' wellbeing.
                    </p>
                    <p className="text-gray-700 mb-8 leading-relaxed">
                        Start with solid training, build your reputation through exceptional service, leverage digital platforms like IndaStreet, and consistently deliver value. Success isn't overnight, but with persistence and strategic planning, you can build a thriving massage therapy practice in Indonesia's booming wellness market.
                    </p>
                            </div>

                            {/* CTA – app theme: orange gradient card */}
                            <div className="mt-10 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 p-6 sm:p-8 text-white text-center border border-orange-200/50 shadow-md">
                                <h3 className="text-lg sm:text-xl font-bold mb-2">Start Your Massage Career Today</h3>
                                <p className="text-white/90 text-sm sm:text-base mb-5 max-w-xl mx-auto">Join IndaStreet to connect with clients and grow your practice.</p>
                                <button
                                    type="button"
                                    onClick={() => onNavigate?.('registrationChoice')}
                                    className="px-5 py-2.5 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-md"
                                >
                                    Create Your Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default MassageCareerIndonesiaPage;
