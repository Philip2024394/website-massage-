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

interface Top10MassageTechniquesPageProps {
    onNavigate?: (page: string) => void;
}

const Top10MassageTechniquesPage: React.FC<Top10MassageTechniquesPageProps> = ({ onNavigate }) => {
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
                            <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:bg-gray-200 p-2 rounded-full">
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
                                        <p className="text-xs text-gray-500">Browse more articles</p>
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
                    <span className="ml-1">Top 10 Essential Massage Techniques</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-purple-100 text-purple-700 px-4 py-1 rounded-full text-sm font-bold uppercase">
                            Techniques
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Top 10 Massage Techniques Every Professional Should Master
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Made Surya</span>
                        <span>•</span>
                        <span>Oct 15, 2025</span>
                        <span>•</span>
                        <span>12 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/bali%20messages.png?updatedAt=1761560397225" 
                        alt="Professional massage techniques and therapy methods in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        To succeed as a professional massage therapist in Indonesia's competitive wellness market, mastering a diverse range of techniques is essential. These 10 fundamental massage modalities will make you a versatile, sought-after therapist capable of serving various client needs.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">1. Traditional Balinese Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> The foundation of Indonesian massage therapy, combining acupressure, reflexology, and aromatherapy.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Long flowing strokes, skin rolling, palm and thumb pressure, gentle stretching. Uses locally-sourced essential oils like frangipani, sandalwood, and coconut.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Stress relief, improved circulation, cultural authenticity that tourists seek.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">2. Swedish Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> The most requested massage globally, especially by Western clients visiting Bali.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Five basic strokes - effleurage (gliding), petrissage (kneading), tapotement (rhythmic tapping), friction, and vibration.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Relaxation, muscle tension relief, promoting overall wellness.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">3. Deep Tissue Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> High demand from active tourists, yoga practitioners, and clients with chronic pain.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Slow, deliberate strokes with deep finger and elbow pressure targeting inner muscle layers and connective tissue.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Chronic muscle pain, sports injuries, postural problems, repetitive strain.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">4. Hot Stone Therapy</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Premium service offering higher rates, popular in luxury spas across Ubud and Seminyak.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Heated volcanic stones placed on body energy points, combined with massage strokes using the stones as tools.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Deep muscle relaxation, stress reduction, improved circulation.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">5. Aromatherapy Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Bali's abundance of natural essential oils makes this a signature offering.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Gentle Swedish techniques combined with therapeutic-grade essential oils selected for specific benefits (lavender for relaxation, eucalyptus for respiratory health, lemongrass for energy).
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Emotional balance, stress relief, holistic wellness.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">6. Reflexology</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Quick 30-60 minute sessions perfect for hotel guests with limited time.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Applying pressure to specific points on feet, hands, and ears that correspond to different organs and body systems.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Overall health improvement, stress relief, digestive issues.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">7. Thai Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Popular among yoga enthusiasts and wellness retreat participants.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Passive stretching and gentle pressure along energy lines. Performed on a mat with client fully clothed.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Flexibility improvement, energy flow, muscle tension, alignment.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">8. Prenatal Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Specialized skill commanding premium rates with growing demand from wellness retreats.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Modified massage techniques safe for pregnancy, special positioning with cushions, focus on lower back, hips, and legs.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Reducing pregnancy discomfort, swelling, stress relief for expecting mothers.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">9. Sports Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Caters to Bali's active tourism market - surfers, divers, hikers, yoga practitioners.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Combination of Swedish and deep tissue focused on areas of stress. Can be pre-event (stimulating) or post-event (restorative).
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Athletic performance, injury prevention, muscle recovery.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">10. Lymphatic Drainage Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Why it's essential:</strong> Increasingly popular for detox programs and wellness retreats in Ubud.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Key techniques:</strong> Gentle, rhythmic strokes following the lymphatic system pathways to encourage natural drainage.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Best for:</strong> Detoxification, reducing swelling, boosting immune system, post-surgery recovery.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Building Your Skill Set</h2>
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-8 rounded-r-lg">
                        <h3 className="font-bold text-lg mb-3">Training Recommendations:</h3>
                        <ul className="space-y-2 text-gray-800">
                            <li>✓ Start with Balinese and Swedish as foundations</li>
                            <li>✓ Add deep tissue to serve active clients</li>
                            <li>✓ Obtain prenatal certification for specialized market</li>
                            <li>✓ Practice combinations for custom experiences</li>
                            <li>✓ Continuously update skills with workshops</li>
                            <li>✓ Build portfolio showcasing your specializations</li>
                        </ul>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Mastering these 10 essential massage techniques positions you as a versatile, professional therapist capable of serving diverse clientele in Indonesia's booming wellness industry. Each technique opens new opportunities for higher rates, broader client bases, and partnerships with premium spas and hotels.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Remember, quality always trumps quantity. Perfect each technique through practice, continuing education, and client feedback before adding the next to your repertoire.
                    </p>
                </div>

                <div className="mt-12 p-6 bg-gray-100 rounded-xl">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">About the Author</h3>
                    <p className="text-gray-700">
                        <strong>Made Surya</strong> is a certified massage therapy instructor with 20 years of experience training therapists across Indonesia. He holds certifications in 15 massage modalities and runs a training center in Ubud.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Showcase Your Massage Skills</h3>
                    <p className="text-xl mb-6">Connect with clients looking for your specialized techniques</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Join IndaStreet
                    </button>
                </div>
            </article>
        </div>
    );
};

export default Top10MassageTechniquesPage;
