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

interface AromatherapyMassageOilsPageProps {
    onNavigate?: (page: string) => void;
    onBack?: () => void;
    t?: any;
}

const AromatherapyMassageOilsPage: React.FC<AromatherapyMassageOilsPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        const cleanup = setupBlogArticleSEO({
            title: 'Complete Guide to Aromatherapy Massage Oils & Essential Oils',
            description: 'Professional guide to massage oils: best carrier oils, essential oil blends, therapeutic benefits, safety guidelines, and sourcing premium aromatherapy products.',
            url: 'https://www.indastreetmassage.com/blog-aromatherapy-massage-oils',
            image: 'https://ik.imagekit.io/7grri5v7d/bali%20massage.png?updatedAt=1761561435844',
            datePublished: '2024-11-27T08:00:00Z',
            dateModified: '2025-12-29T12:00:00Z',
            author: 'Kadek Ayu',
            keywords: ['aromatherapy oils', 'massage oils', 'essential oils massage', 'carrier oils', 'aromatherapy massage'],
            breadcrumbs: [
                { name: 'Home', url: 'https://www.indastreetmassage.com/' },
                { name: 'Blog', url: 'https://www.indastreetmassage.com/blog' },
                { name: 'Aromatherapy Massage Oils', url: 'https://www.indastreetmassage.com/blog-aromatherapy-massage-oils' }
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
                    <span className="ml-1">Aromatherapy Massage Oils</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Techniques</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Aromatherapy Essentials: Choosing the Right Oils for Massage
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Putu Sari</span>
                        <span>•</span>
                        <span>Sep 10, 2025</span>
                        <span>•</span>
                        <span>8 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/massage%20jogja%20indonisea%20spa.png?updatedAt=1761561397701" 
                        alt="Essential oils and aromatherapy for massage therapy in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Aromatherapy transforms ordinary massage into multi-sensory healing experiences. The right essential oils enhance relaxation, relieve pain, reduce anxiety, and elevate your professional services. This complete guide covers oil selection, blending techniques, therapeutic properties, and safe application for massage therapists.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Understanding Essential Oils</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Essential oils are concentrated plant extracts capturing the essence of flowers, leaves, bark, roots, and resins. One drop contains potent therapeutic compounds affecting physical, emotional, and mental wellbeing.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Key Properties:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Volatile:</strong> Evaporate quickly, releasing aromatic molecules</li>
                        <li><strong>Lipophilic:</strong> Dissolve in oils and fats, not water</li>
                        <li><strong>Concentrated:</strong> 50-100x more potent than dried herbs</li>
                        <li><strong>Therapeutic:</strong> Anti-inflammatory, analgesic, antimicrobial, mood-altering properties</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Top 10 Essential Oils for Massage Therapy</h2>
                    
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Lavender (Lavandula angustifolia)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Relaxation, anxiety relief, sleep improvement, wound healing, pain reduction
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Stress relief massage, evening treatments, headache relief, muscle relaxation
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 2-3 drops per 10ml carrier oil<br/>
                        <strong>Note:</strong> Middle note, floral, herbaceous aroma
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Eucalyptus (Eucalyptus globulus)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Respiratory relief, muscle pain, anti-inflammatory, mental clarity, immune support
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Sports massage, cold/flu season, sinus congestion, deep tissue work
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 1-2 drops per 10ml carrier oil (strong scent)<br/>
                        <strong>Note:</strong> Top note, fresh, camphoraceous
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Peppermint (Mentha piperita)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Cooling sensation, pain relief, mental alertness, headache treatment, muscle soreness
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Athletic recovery, tension headaches, hot stone massage cooling finish, morning treatments
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 1 drop per 10ml carrier oil (very potent)<br/>
                        <strong>Caution:</strong> Avoid near eyes, can be stimulating
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Frankincense (Boswellia carterii)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Meditation support, skin rejuvenation, anti-inflammatory, emotional grounding, immune function
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Spiritual wellness, facial massage, mature skin, anxiety relief, holistic healing
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 2-3 drops per 10ml carrier oil<br/>
                        <strong>Note:</strong> Base note, woody, resinous, sacred scent
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Chamomile (Matricaria chamomilla)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Anti-inflammatory, skin soothing, sleep support, digestive aid, emotional calming
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Sensitive skin, prenatal massage, children's massage, inflammation conditions
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 2 drops per 10ml carrier oil<br/>
                        <strong>Note:</strong> Gentle, safe for most clients
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Ylang-Ylang (Cananga odorata)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Blood pressure reduction, aphrodisiac properties, mood elevation, stress relief
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Romantic couples massage, evening relaxation, luxury spa treatments, emotional release
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 1-2 drops per 10ml (intense floral scent)<br/>
                        <strong>Note:</strong> Base note, exotic, sweet
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Rosemary (Rosmarinus officinalis)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Mental clarity, memory enhancement, circulation boost, muscle pain relief, hair growth stimulation
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Morning treatments, scalp massage, athletic performance preparation, focus enhancement
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 2 drops per 10ml carrier oil<br/>
                        <strong>Caution:</strong> Avoid in pregnancy, epilepsy, high blood pressure
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Sandalwood (Santalum album)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Grounding, meditation support, skin hydration, anxiety relief, aphrodisiac
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Yoga integration massage, spiritual wellness, dry skin, emotional healing
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 2-3 drops per 10ml carrier oil<br/>
                        <strong>Note:</strong> Base note, woody, warm—traditional in Indonesian healing
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Lemongrass (Cymbopogon citratus)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Muscle pain relief, antimicrobial, digestive support, mood uplift, insect repellent
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Sports massage, outdoor/tropical settings, energizing treatments, Thai massage
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 1-2 drops per 10ml (can irritate sensitive skin)<br/>
                        <strong>Note:</strong> Top note, fresh, citrus-herbal
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Jasmine (Jasminum officinale)</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Therapeutic Benefits:</strong> Aphrodisiac, mood elevation, skin rejuvenation, emotional uplift, hormone balance
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Best For:</strong> Luxury treatments, couples massage, facial treatments, emotional healing sessions
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Dilution:</strong> 1 drop per 10ml (expensive and potent)<br/>
                        <strong>Note:</strong> Base note, intensely floral—Indonesia's national flower (melati)
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Carrier Oils: The Foundation</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Essential oils must be diluted in carrier oils for safe skin application.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Best Carrier Oils for Massage:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Sweet Almond Oil:</strong> Light, absorbs well, affordable, good glide—most popular choice</li>
                        <li><strong>Coconut Oil (Fractionated):</strong> Traditional Indonesian choice, moisturizing, long shelf life</li>
                        <li><strong>Jojoba Oil:</strong> Mimics skin sebum, non-greasy, excellent for facial massage</li>
                        <li><strong>Grapeseed Oil:</strong> Light texture, fast absorption, budget-friendly for high-volume practices</li>
                        <li><strong>Avocado Oil:</strong> Rich, nourishing, good for dry skin, slower absorption</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Creating Custom Aromatherapy Blends</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Blending Principles:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Note Balance:</strong> Combine top (light/fresh), middle (floral/herbaceous), and base (grounding/woody) notes</li>
                        <li><strong>Therapeutic Synergy:</strong> Select oils with complementary healing properties</li>
                        <li><strong>Scent Harmony:</strong> Test blends before client application—some combinations clash</li>
                        <li><strong>Standard Dilution:</strong> 2-3% for general massage (6-9 drops total per 30ml carrier oil)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Popular Blend Recipes:</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Stress Relief Blend</strong><br/>
                        30ml sweet almond oil base<br/>
                        4 drops lavender<br/>
                        2 drops frankincense<br/>
                        2 drops ylang-ylang
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Sports Recovery Blend</strong><br/>
                        30ml grapeseed oil base<br/>
                        3 drops eucalyptus<br/>
                        2 drops rosemary<br/>
                        2 drops peppermint
                    </p>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                        <strong>Romantic Couples Blend</strong><br/>
                        30ml coconut oil base<br/>
                        3 drops sandalwood<br/>
                        2 drops jasmine<br/>
                        2 drops ylang-ylang
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Safety Guidelines and Contraindications</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Essential Safety Rules:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Always Dilute:</strong> Never apply pure essential oils directly to skin</li>
                        <li><strong>Patch Test:</strong> Test new oils on small skin area 24 hours before full treatment</li>
                        <li><strong>Pregnancy Caution:</strong> Avoid rosemary, clary sage, cinnamon, clove in prenatal massage</li>
                        <li><strong>Medical Conditions:</strong> Consult healthcare providers for epilepsy, high blood pressure, hormone-sensitive conditions</li>
                        <li><strong>Photosensitivity:</strong> Citrus oils (lemon, lime, grapefruit) increase sun sensitivity—avoid before sun exposure</li>
                        <li><strong>Storage:</strong> Dark glass bottles, cool place, away from sunlight (oils degrade with heat/light)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Sourcing Quality Oils in Indonesia</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Purchasing Tips:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>100% Pure:</strong> Avoid synthetic fragrances labeled "fragrance oil" or "perfume oil"</li>
                        <li><strong>Therapeutic Grade:</strong> Look for "pure essential oil" or "aromatherapy grade"</li>
                        <li><strong>Dark Glass Bottles:</strong> Quality oils come in amber or cobalt glass to protect from light</li>
                        <li><strong>Botanical Name:</strong> Label should include Latin scientific name (e.g., Lavandula angustifolia)</li>
                        <li><strong>Country of Origin:</strong> Know where the plant was sourced</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Indonesia Sources:</strong> Bali wellness shops, Ubud aromatherapy stores, online platforms, bulk suppliers for professional practices
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Cost:</strong> IDR 50,000-300,000 per 10ml bottle (jasmine and sandalwood most expensive)
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Mastering aromatherapy elevates your massage practice from mechanical technique to holistic healing art. Essential oils add therapeutic value, enhance client satisfaction, and justify premium pricing—transforming ordinary treatments into memorable sensory experiences.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Start with 5-6 versatile oils (lavender, eucalyptus, peppermint, frankincense, sweet almond carrier), learn proper blending, prioritize safety, and watch your aromatherapy massage services become client favorites.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Enhance Your Massage Practice with Aromatherapy</h3>
                    <p className="text-xl mb-6">Join IndaStreet and offer premium treatments</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Register as Therapist
                    </button>
                </div>
            </article>
        </div>
    );
};

export default AromatherapyMassageOilsPage;
