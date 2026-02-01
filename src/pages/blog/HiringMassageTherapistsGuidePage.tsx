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

interface HiringMassageTherapistsGuidePageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const HiringMassageTherapistsGuidePage: React.FC<HiringMassageTherapistsGuidePageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        const cleanup = setupBlogArticleSEO({
            title: 'Complete Guide to Hiring Professional Massage Therapists',
            description: 'Employer\'s guide to hiring qualified massage therapists: screening, interviews, certification verification, salary expectations, and retention strategies.',
            url: 'https://www.indastreetmassage.com/blog-hiring-massage-therapists',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massages.png?updatedAt=1761561725353',
            datePublished: '2024-11-20T08:00:00Z',
            dateModified: '2025-12-29T12:00:00Z',
            author: 'Agung Prasetyo',
            keywords: ['hiring massage therapists', 'spa recruitment', 'therapist hiring guide', 'wellness staffing', 'therapist interview'],
            breadcrumbs: [
                { name: 'Home', url: 'https://www.indastreetmassage.com/' },
                { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
                { name: 'Hiring Massage Therapists Guide', url: 'https://www.indastreetmassage.com/blog-hiring-massage-therapists' }
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
                    <span className="ml-1">Hiring Massage Therapists Guide</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Industry</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Hiring Qualified Massage Therapists: A Hotel Manager's Guide
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Komang Dewi</span>
                        <span>•</span>
                        <span>Sep 28, 2025</span>
                        <span>•</span>
                        <span>9 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/massage%20sfatt%20indonisea.png?updatedAt=1761560942135" 
                        alt="Hiring qualified massage therapists for hotels and spas in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        For hotel and spa managers in Indonesia's competitive wellness tourism market, hiring skilled massage therapists directly impacts guest satisfaction, reviews, and revenue. This comprehensive guide walks you through every step of recruiting, vetting, and retaining top massage professionals.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. Define Your Spa Service Requirements</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Before posting job openings, clarify exactly what your property needs:
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Service Menu Analysis:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Signature Treatments:</strong> Traditional Balinese, Swedish, deep tissue, hot stone, aromatherapy</li>
                        <li><strong>Specialty Services:</strong> Prenatal massage, sports therapy, reflexology, couples treatments</li>
                        <li><strong>Guest Demographics:</strong> International tourists, business travelers, wellness retreats, families</li>
                        <li><strong>Service Volume:</strong> Expected bookings per day/week/season</li>
                        <li><strong>Operating Hours:</strong> Daily schedule, peak seasons, on-call availability</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Example:</strong> A 5-star resort in Seminyak might prioritize therapists certified in traditional Balinese massage with English communication skills, while a wellness retreat in Ubud might seek specialists in holistic therapies and yoga-integrated treatments.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. Set Competitive Compensation Packages</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Top therapists have options. Competitive packages attract and retain quality professionals.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Indonesia Compensation Benchmarks (2025):</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Base Salary (Bali Hotels):</strong> IDR 4,000,000-7,000,000/month depending on experience</li>
                        <li><strong>Commission Structure:</strong> 15-25% of treatment revenue or tip-sharing models</li>
                        <li><strong>Benefits Package:</strong> Health insurance (BPJS), meals, transportation, uniform, annual bonus</li>
                        <li><strong>Performance Incentives:</strong> Bonuses for high guest ratings, upselling retail products, training certifications</li>
                        <li><strong>Professional Development:</strong> Paid training, certification courses, skill advancement opportunities</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Pro Tip:</strong> Transparent compensation structures build trust. Clearly communicate all earning potential during interviews.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. Essential Qualifications to Verify</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Protect your guests and property by thoroughly vetting candidate credentials.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Required Certifications:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Massage Therapy License:</strong> Government-issued certification from recognized Indonesian institutions</li>
                        <li><strong>Health Certificate:</strong> Current medical clearance for physical work</li>
                        <li><strong>Training Documentation:</strong> Proof of 500+ hours massage education (minimum standard)</li>
                        <li><strong>CPR/First Aid:</strong> Valid certification for emergency response</li>
                        <li><strong>Specialty Certifications:</strong> Hot stone, prenatal, aromatherapy, sports massage (as needed)</li>
                    </ul>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Background Verification:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Police clearance certificate (SKCK)</li>
                        <li>Reference checks from previous employers (minimum 3)</li>
                        <li>Professional conduct history review</li>
                        <li>Social media presence audit for professionalism</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. Conduct Effective Skill Assessments</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Credentials confirm training—practical assessments prove ability.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Multi-Stage Evaluation Process:</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Stage 1: Initial Interview</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Professional background and experience review</li>
                        <li>Communication skills assessment (especially English for international properties)</li>
                        <li>Cultural fit and service philosophy alignment</li>
                        <li>Availability and scheduling flexibility discussion</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Stage 2: Practical Demonstration</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>30-60 minute massage on spa manager or evaluator</li>
                        <li>Assessment criteria: technique quality, pressure consistency, flow, body mechanics, professionalism</li>
                        <li>Observe setup procedures, hygiene practices, communication during treatment</li>
                        <li>Evaluate post-treatment recommendations and upselling ability</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Stage 3: Guest Simulation</strong>
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Role-play scenario with common guest requests or complaints</li>
                        <li>Test problem-solving and customer service skills</li>
                        <li>Evaluate cultural sensitivity with international guests</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. Leverage Digital Hiring Platforms</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Modern recruitment tools streamline the hiring process and expand your talent pool.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Platform Benefits:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>IndaStreet:</strong> Access Indonesia's largest verified massage therapist network with detailed profiles, certifications, ratings, and availability</li>
                        <li><strong>Pre-Screened Candidates:</strong> Background checks, credential verification, and guest reviews already completed</li>
                        <li><strong>Trial Periods:</strong> Book therapists for trial shifts before full employment commitments</li>
                        <li><strong>Flexible Hiring:</strong> Options for full-time staff, part-time contractors, or on-demand seasonal coverage</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. Onboarding and Training Excellence</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Even experienced therapists need property-specific orientation.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Comprehensive Onboarding Program:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Week 1:</strong> Property tour, systems training (booking, POS, inventory), uniform/equipment orientation, team introductions</li>
                        <li><strong>Week 2:</strong> Treatment menu deep dive, product knowledge, upselling strategies, shadowing senior therapists</li>
                        <li><strong>Week 3:</strong> Supervised guest treatments with feedback, customer service protocols, handling special requests</li>
                        <li><strong>Week 4:</strong> Independent treatments with quality checks, performance review, 30-day goal setting</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. Create Retention-Focused Work Environment</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Hiring is expensive. Retention is more cost-effective than constant recruitment.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Retention Strategies:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Career Development:</strong> Clear advancement paths (therapist → senior therapist → spa supervisor → spa manager)</li>
                        <li><strong>Continuing Education:</strong> Annual training budget for certifications, workshops, industry conferences</li>
                        <li><strong>Work-Life Balance:</strong> Reasonable schedules, adequate breaks between treatments, rotating shifts</li>
                        <li><strong>Recognition Programs:</strong> Employee of the month, performance bonuses, guest praise sharing</li>
                        <li><strong>Team Culture:</strong> Regular team meetings, social events, open communication channels</li>
                        <li><strong>Ergonomic Support:</strong> Quality massage tables, tools, anti-fatigue mats, therapist self-care programs</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. Monitor Performance Metrics</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Data-driven management identifies top performers and improvement opportunities.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Key Performance Indicators (KPIs):</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Guest Satisfaction Scores:</strong> Target 4.5+ stars average</li>
                        <li><strong>Rebook Rate:</strong> Percentage of guests requesting same therapist on return visits</li>
                        <li><strong>Retail/Upsell Performance:</strong> Additional services or products sold</li>
                        <li><strong>Attendance and Punctuality:</strong> Reliability metrics</li>
                        <li><strong>Treatment Time Efficiency:</strong> Staying on schedule without rushing</li>
                        <li><strong>Guest Complaints:</strong> Track issues and resolution effectiveness</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">9. Handle Legal and Compliance Requirements</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Protect your business with proper employment documentation.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Essential Legal Documents:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Written employment contracts with clear terms</li>
                        <li>BPJS healthcare and employment registration</li>
                        <li>Tax compliance (NPWP requirements)</li>
                        <li>Liability insurance for spa operations</li>
                        <li>Professional conduct and ethics agreements</li>
                        <li>Confidentiality and non-compete clauses (where applicable)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">10. Red Flags to Watch For</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Avoid problematic hires by recognizing warning signs early.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Warning Signs During Hiring:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Inability to produce certification documents or evasive answers about credentials</li>
                        <li>Frequent job changes with vague reasons for leaving</li>
                        <li>Negative references from previous employers</li>
                        <li>Poor personal hygiene or unprofessional appearance at interview</li>
                        <li>Unrealistic salary demands without commensurate experience</li>
                        <li>Inability to demonstrate basic techniques during practical assessment</li>
                        <li>Pushy or inappropriate behavior during evaluation process</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Hiring exceptional massage therapists requires strategic planning, thorough vetting, competitive compensation, and ongoing investment in your team's success. Properties that excel at recruitment and retention build reputations for outstanding spa experiences—driving guest satisfaction, positive reviews, and increased revenue.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Whether you manage a boutique villa in Canggu, a luxury resort in Nusa Dua, or a wellness retreat in Ubud, platforms like IndaStreet connect you with Indonesia's top verified massage professionals—streamlining hiring while ensuring quality standards.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Find Qualified Therapists for Your Property</h3>
                    <p className="text-xl mb-6">Connect with verified massage professionals on IndaStreet</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Start Hiring Today
                    </button>
                </div>
            </article>
        </div>
    );
};

export default HiringMassageTherapistsGuidePage;
