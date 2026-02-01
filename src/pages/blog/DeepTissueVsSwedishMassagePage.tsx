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

interface DeepTissueVsSwedishMassagePageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const DeepTissueVsSwedishMassagePage: React.FC<DeepTissueVsSwedishMassagePageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        const cleanup = setupBlogArticleSEO({
            title: 'Deep Tissue vs Swedish Massage: Complete Comparison Guide',
            description: 'Expert comparison of deep tissue and Swedish massage: techniques, benefits, pain levels, best for what conditions, and choosing the right massage for your needs.',
            url: 'https://www.indastreetmassage.com/blog-deep-tissue-vs-swedish',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massages.png?updatedAt=1761561725353',
            datePublished: '2024-11-29T08:00:00Z',
            dateModified: '2025-12-29T12:00:00Z',
            author: 'Ketut Wira',
            keywords: ['deep tissue massage', 'Swedish massage', 'massage comparison', 'massage types', 'therapeutic massage'],
            breadcrumbs: [
                { name: 'Home', url: 'https://www.indastreetmassage.com/' },
                { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
                { name: 'Deep Tissue vs Swedish Massage', url: 'https://www.indastreetmassage.com/blog-deep-tissue-vs-swedish' }
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
                    <span className="ml-1">Deep Tissue vs Swedish Massage</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Techniques</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Deep Tissue vs Swedish Massage: When to Use Each Technique
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Made Alit</span>
                        <span>•</span>
                        <span>Aug 30, 2025</span>
                        <span>•</span>
                        <span>9 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/jogja%20massages.png?updatedAt=1761561725353" 
                        alt="Deep tissue vs Swedish massage comparison techniques in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        As a massage therapist, knowing when to recommend deep tissue versus Swedish massage is essential for client satisfaction and treatment effectiveness. While both modalities offer therapeutic benefits, they serve different purposes and suit different client needs. This guide clarifies the key differences, ideal applications, and how to choose the right technique for each situation.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Swedish Massage: The Foundation</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">What is Swedish Massage?</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Swedish massage, developed by Per Henrik Ling in the 1830s, uses five basic strokes to promote relaxation, improve circulation, and relieve muscle tension through gentle to moderate pressure.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Five Core Swedish Techniques:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Effleurage:</strong> Long, gliding strokes toward the heart using palms, thumbs, and fingertips—warms tissues, promotes relaxation</li>
                        <li><strong>Petrissage:</strong> Kneading, rolling, and squeezing muscles—releases deeper tension, improves circulation</li>
                        <li><strong>Friction:</strong> Circular or cross-fiber movements—generates heat, breaks down adhesions</li>
                        <li><strong>Tapotement:</strong> Rhythmic tapping, cupping, or hacking movements—stimulates muscles, energizes</li>
                        <li><strong>Vibration:</strong> Rapid shaking or trembling movements—relaxes muscles, releases tension</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Pressure and Pace:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Pressure Level:</strong> Light to moderate (3-6 on 1-10 scale)</li>
                        <li><strong>Pace:</strong> Slow, flowing, rhythmic—induces relaxation response</li>
                        <li><strong>Oil Use:</strong> Generous application for smooth gliding</li>
                        <li><strong>Session Duration:</strong> Typically 60-90 minutes full-body</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Primary Goals:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Stress reduction and relaxation</li>
                        <li>Improved circulation and lymphatic flow</li>
                        <li>General muscle tension relief</li>
                        <li>Enhanced sleep quality</li>
                        <li>Overall wellness and rejuvenation</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Deep Tissue Massage: Targeted Treatment</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">What is Deep Tissue Massage?</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Deep tissue massage uses slower strokes and sustained pressure on deeper muscle layers, tendons, and fascia to address chronic pain, muscle restrictions, and injury recovery.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Key Techniques:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Stripping:</strong> Deep gliding pressure along muscle fibers using thumbs, knuckles, forearms, or elbows</li>
                        <li><strong>Friction:</strong> Concentrated pressure across muscle grain to break down adhesions and scar tissue</li>
                        <li><strong>Trigger Point Therapy:</strong> Sustained pressure on hyperirritable muscle knots</li>
                        <li><strong>Myofascial Release:</strong> Slow, sustained stretching of connective tissue restrictions</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Pressure and Pace:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Pressure Level:</strong> Firm to very firm (7-9 on 1-10 scale)</li>
                        <li><strong>Pace:</strong> Slower than Swedish—allows tissue layers to respond without guarding</li>
                        <li><strong>Oil Use:</strong> Moderate—needs some friction for deeper work</li>
                        <li><strong>Session Focus:</strong> Often targets specific problem areas rather than full-body</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Primary Goals:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Chronic pain management</li>
                        <li>Muscle injury recovery</li>
                        <li>Breaking down scar tissue and adhesions</li>
                        <li>Improving range of motion</li>
                        <li>Addressing postural problems</li>
                        <li>Sports injury rehabilitation</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Side-by-Side Comparison</h2>
                    <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm text-gray-700 border-collapse">
                            <thead className="bg-orange-100">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Aspect</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Swedish Massage</th>
                                    <th className="border border-gray-300 px-4 py-3 text-left font-bold">Deep Tissue Massage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-3 font-semibold">Pressure</td>
                                    <td className="border border-gray-300 px-4 py-3">Light to moderate</td>
                                    <td className="border border-gray-300 px-4 py-3">Firm to very firm</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-3 font-semibold">Pace</td>
                                    <td className="border border-gray-300 px-4 py-3">Flowing, rhythmic</td>
                                    <td className="border border-gray-300 px-4 py-3">Slow, sustained</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-3 font-semibold">Target Layers</td>
                                    <td className="border border-gray-300 px-4 py-3">Superficial muscle layers</td>
                                    <td className="border border-gray-300 px-4 py-3">Deep muscle layers, fascia</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-3 font-semibold">Primary Goal</td>
                                    <td className="border border-gray-300 px-4 py-3">Relaxation, stress relief</td>
                                    <td className="border border-gray-300 px-4 py-3">Pain relief, injury recovery</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-3 font-semibold">Post-Treatment</td>
                                    <td className="border border-gray-300 px-4 py-3">Immediate relaxation</td>
                                    <td className="border border-gray-300 px-4 py-3">May feel sore 24-48 hours</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-300 px-4 py-3 font-semibold">Frequency</td>
                                    <td className="border border-gray-300 px-4 py-3">Weekly to monthly</td>
                                    <td className="border border-gray-300 px-4 py-3">Bi-weekly during treatment</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">When to Recommend Swedish Massage</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Ideal Client Situations:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>First-Time Massage Clients:</strong> Gentle introduction to bodywork</li>
                        <li><strong>Stress and Anxiety:</strong> Activates parasympathetic nervous system</li>
                        <li><strong>General Muscle Tension:</strong> Daily stress accumulation without injury</li>
                        <li><strong>Wellness Maintenance:</strong> Preventive care, not addressing specific problems</li>
                        <li><strong>Relaxation Seekers:</strong> Spa experience, vacation, self-care</li>
                        <li><strong>Sleep Issues:</strong> Promotes better sleep quality</li>
                        <li><strong>Pregnancy:</strong> Prenatal massage (after first trimester)</li>
                        <li><strong>Elderly Clients:</strong> Gentler approach for fragile tissues</li>
                        <li><strong>Circulation Issues:</strong> Improves blood and lymph flow</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Client Phrases That Signal Swedish:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>"I just want to relax and destress"</li>
                        <li>"I've never had a massage before"</li>
                        <li>"I'm really sensitive to pressure"</li>
                        <li>"I want a full-body pampering experience"</li>
                        <li>"I've been feeling tense but nothing specific hurts"</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">When to Recommend Deep Tissue Massage</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Ideal Client Situations:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Chronic Pain:</strong> Lower back pain, neck pain, shoulder tension lasting weeks/months</li>
                        <li><strong>Sports Injuries:</strong> Muscle strains, overuse injuries, athletic recovery</li>
                        <li><strong>Limited Range of Motion:</strong> Stiffness restricting movement</li>
                        <li><strong>Postural Issues:</strong> Forward head posture, rounded shoulders, muscle imbalances</li>
                        <li><strong>Scar Tissue:</strong> Surgery recovery, old injuries</li>
                        <li><strong>Trigger Points:</strong> Specific muscle knots causing referred pain</li>
                        <li><strong>Repetitive Strain:</strong> Occupational issues (computer work, manual labor)</li>
                        <li><strong>Pre-Event Sports:</strong> Athletic performance optimization</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Client Phrases That Signal Deep Tissue:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>"I have chronic lower back pain"</li>
                        <li>"Swedish massage doesn't go deep enough for me"</li>
                        <li>"I have a specific knot in my shoulder blade"</li>
                        <li>"I'm recovering from a running injury"</li>
                        <li>"My neck and shoulders are always tight from desk work"</li>
                        <li>"I can handle firm pressure—the deeper, the better"</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Common Misconceptions</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Myth 1: "Deeper is Always Better"</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Truth:</strong> Excessive pressure causes muscles to guard and tense, counteracting therapeutic benefits. Effective deep tissue uses appropriate pressure with slow, sustained technique—not brute force.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Myth 2: "Swedish Massage is Only for Relaxation"</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Truth:</strong> Swedish massage offers significant therapeutic benefits: improved circulation, reduced muscle tension, enhanced immune function, and pain relief—just through gentler methods.
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Myth 3: "Deep Tissue Should Hurt"</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Truth:</strong> Some discomfort is normal ("good hurt"), but sharp pain indicates tissue damage. Always communicate with clients about pressure tolerance (1-10 scale, keep it 7 or below).
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Myth 4: "You Can't Combine Both Techniques"</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Truth:</strong> Many therapists integrate both—starting with Swedish to warm tissues, then using deep tissue on problem areas, finishing with Swedish for integration.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Hybrid Approach: Integrating Both Techniques</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Effective Session Structure:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Phase 1 (20 min):</strong> Swedish warm-up—prepare tissues, assess tension patterns</li>
                        <li><strong>Phase 2 (40 min):</strong> Deep tissue focus—address specific problem areas identified</li>
                        <li><strong>Phase 3 (20 min):</strong> Swedish integration—help body assimilate deep work, end relaxed</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Client Communication is Key</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Essential Pre-Session Questions:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>"What's your primary goal for today's session?"</li>
                        <li>"Are you experiencing any specific pain or discomfort?"</li>
                        <li>"Have you had massage before? What type did you prefer?"</li>
                        <li>"How do you respond to firm pressure?"</li>
                        <li>"Are there areas you'd like me to focus on or avoid?"</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Both Swedish and deep tissue massage are valuable therapeutic modalities—they simply serve different purposes. Swedish excels at stress relief, relaxation, and wellness maintenance. Deep tissue targets chronic pain, injuries, and specific muscular problems.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        As a professional therapist, your expertise lies in assessing client needs, recommending appropriate techniques, and often integrating both approaches for optimal results. Mastery of both modalities makes you versatile, effective, and highly sought-after in Indonesia's competitive wellness market.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Whether you specialize in one technique or offer both, platforms like IndaStreet connect you with clients seeking exactly what you provide—from relaxation seekers to chronic pain sufferers across Bali, Jakarta, Yogyakarta, and beyond.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Master Both Techniques, Serve More Clients</h3>
                    <p className="text-xl mb-6">Build your diverse practice on IndaStreet</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Join as Professional Therapist
                    </button>
                </div>
            </article>
        </div>
    );
};

export default DeepTissueVsSwedishMassagePage;
