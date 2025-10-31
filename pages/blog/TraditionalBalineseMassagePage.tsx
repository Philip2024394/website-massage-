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

interface TraditionalBalineseMassagePageProps {
    onNavigate?: (page: string) => void;
}

const TraditionalBalineseMassagePage: React.FC<TraditionalBalineseMassagePageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-orange-500">Indastreet</span>
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
                                <span className="text-orange-500">Indastreet</span>
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
                    <span className="ml-1">Traditional Balinese Massage</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Techniques</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Traditional Balinese Massage: History, Techniques & Benefits
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By I Nyoman Rai</span>
                        <span>•</span>
                        <span>Sep 20, 2025</span>
                        <span>•</span>
                        <span>11 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382&cache-bust=20251031-2"
                        alt="Traditional Balinese massage techniques and healing in Bali Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        Balinese massage (Pijat Bali) is a 1,000-year-old healing tradition combining acupressure, reflexology, aromatherapy, and gentle stretching. Rooted in Ayurvedic, Chinese, and indigenous Balinese medicine, this deeply therapeutic modality balances energy flow, relieves tension, and promotes holistic wellness.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">The Ancient Origins of Balinese Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Traditional Balinese massage developed over centuries as Bali absorbed influences from Indian traders (Ayurveda), Chinese merchants (acupressure), and indigenous Balinese healing practices (usada).
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Historical Development:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>8th-10th Century:</strong> Hindu-Buddhist kingdoms introduce Ayurvedic principles (doshas, chakras, energy channels)</li>
                        <li><strong>11th-15th Century:</strong> Majapahit Empire spreads Indonesian massage traditions across archipelago</li>
                        <li><strong>Traditional Healers (Balian):</strong> Village healers integrated massage with herbal medicine, prayer, and spiritual healing</li>
                        <li><strong>Family Traditions:</strong> Techniques passed down through generations, each family developing unique signature methods</li>
                        <li><strong>Modern Adaptation:</strong> 1970s tourism boom standardizes techniques for spa industry while preserving traditional foundations</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Core Philosophy: Balancing Life Energy</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Balinese massage operates on the principle that health depends on balanced energy flow (prana or chi) through the body's meridian channels.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Energy System Concepts:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Nadis:</strong> 72,000 subtle energy channels throughout the body</li>
                        <li><strong>Chakras:</strong> Seven major energy centers aligned along the spine</li>
                        <li><strong>Dosha Balance:</strong> Harmonizing Vata (air), Pitta (fire), and Kapha (earth) elements</li>
                        <li><strong>Marma Points:</strong> 107 vital points where physical and subtle bodies intersect</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Blockages in energy flow manifest as pain, illness, emotional disturbance, or fatigue. Balinese massage clears these blockages, restoring natural harmony and vitality.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">The Five Core Techniques</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Authentic Balinese massage integrates multiple therapeutic modalities into one comprehensive treatment:
                    </p>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acupressure (Titik Tekan)</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Sustained pressure applied to specific marma points along energy meridians to release blockages and stimulate healing responses.
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Technique:</strong> Thumbs, fingertips, palms, or elbows apply firm, steady pressure (30-60 seconds per point)</li>
                        <li><strong>Benefits:</strong> Relieves muscle tension, improves circulation, stimulates nervous system, balances organ function</li>
                        <li><strong>Common Points:</strong> Base of skull, between shoulder blades, sacrum, soles of feet, palms</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Long, Flowing Strokes (Urut)</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Gentle to firm gliding strokes following muscle contours and energy pathways, similar to Swedish effleurage but incorporating meridian awareness.
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Technique:</strong> Palms, forearms, and thumbs move in long, continuous strokes from extremities toward heart</li>
                        <li><strong>Benefits:</strong> Increases blood flow, lymphatic drainage, delivers oxygen and nutrients to tissues</li>
                        <li><strong>Rhythm:</strong> Slow, meditative pace induces deep relaxation and parasympathetic activation</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Skin Rolling and Tissue Manipulation</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Lifting, rolling, and kneading connective tissues to release adhesions and improve fascial mobility.
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Technique:</strong> Fingers and thumbs lift skin and superficial fascia, rolling it between digits</li>
                        <li><strong>Benefits:</strong> Breaks down scar tissue, releases trigger points, improves skin elasticity</li>
                        <li><strong>Areas:</strong> Shoulders, back, thighs, calves—anywhere with dense muscle mass</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Reflexology (Pemijatan Kaki dan Tangan)</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Stimulating reflex zones on feet and hands that correspond to organs and body systems throughout the body.
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Technique:</strong> Thumb-walking, finger pressure, and circular motions on specific foot/hand zones</li>
                        <li><strong>Benefits:</strong> Balances internal organs, reduces stress, improves overall body function</li>
                        <li><strong>Focus Areas:</strong> Arches (digestive system), heels (lower back), toes (head and sinuses)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Gentle Stretching (Peregangan)</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Passive yoga-like stretches that lengthen muscles, increase flexibility, and open energy channels.
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Technique:</strong> Therapist gently guides limbs through range-of-motion movements</li>
                        <li><strong>Benefits:</strong> Improves joint mobility, releases muscle tension, enhances energy flow</li>
                        <li><strong>Common Stretches:</strong> Hip rotations, shoulder openers, spinal twists, hamstring stretches</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Aromatherapy Integration</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Essential oils are fundamental to authentic Balinese massage, enhancing therapeutic effects through olfactory stimulation.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Traditional Balinese Oil Blends:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Frangipani (Jepun):</strong> Floral, uplifting, sacred temple flower promoting emotional release</li>
                        <li><strong>Sandalwood (Cendana):</strong> Woody, grounding, calming—used in meditation and spiritual practices</li>
                        <li><strong>Jasmine (Melati):</strong> Sweet, sensual, relaxing—Indonesia's national flower</li>
                        <li><strong>Coconut Oil Base:</strong> Traditional carrier oil with natural moisturizing and antibacterial properties</li>
                        <li><strong>Ylang-Ylang:</strong> Exotic floral scent reducing blood pressure and stress</li>
                    </ul>

                    <div className="relative rounded-2xl overflow-hidden my-12 p-8">
                        <div 
                            className="absolute inset-0 bg-cover bg-center"
                            style={{backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20jogja.png)'}}
                        ></div>
                        <div className="relative">
                            <h2 className="text-2xl font-bold text-white mt-12 mb-6 drop-shadow-lg">The Traditional Balinese Massage Experience</h2>
                            <p className="text-white mb-6 leading-relaxed drop-shadow-md">
                                A full Balinese massage session follows a specific sequence designed to maximize therapeutic benefits:
                            </p>
                            <h3 className="text-xl font-bold text-white mt-8 mb-4 drop-shadow-lg">Session Structure (90-120 minutes):</h3>
                            <ul className="list-disc pl-6 mb-6 text-white space-y-2 drop-shadow-md">
                                <li><strong>Preparation (5 min):</strong> Warm welcome, foot washing ceremony, herbal tea, intention setting</li>
                                <li><strong>Back and Shoulders (30 min):</strong> Deep tissue work on largest muscle groups, acupressure along spine</li>
                                <li><strong>Legs and Feet (20 min):</strong> Releasing tension from standing/walking, reflexology on soles</li>
                                <li><strong>Arms and Hands (15 min):</strong> Opening chest and shoulders, hand reflexology</li>
                                <li><strong>Abdomen (10 min):</strong> Gentle circular massage supporting digestive health</li>
                                <li><strong>Face and Head (15 min):</strong> Relaxing facial massage, scalp stimulation, sinus relief</li>
                                <li><strong>Integration (5 min):</strong> Gentle rocking, energy balancing, grounding</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Health Benefits of Balinese Massage</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Modern research confirms what Balinese healers have known for centuries:
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Physical Benefits:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Relieves chronic muscle pain and tension</li>
                        <li>Improves blood circulation and oxygen delivery</li>
                        <li>Enhances lymphatic drainage and immune function</li>
                        <li>Increases joint flexibility and range of motion</li>
                        <li>Reduces inflammation and speeds injury recovery</li>
                        <li>Lowers blood pressure and heart rate</li>
                    </ul>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Mental & Emotional Benefits:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Profound stress reduction and cortisol decrease</li>
                        <li>Relief from anxiety and depression symptoms</li>
                        <li>Improved sleep quality and insomnia relief</li>
                        <li>Enhanced mental clarity and focus</li>
                        <li>Emotional release and trauma processing</li>
                        <li>Increased body awareness and mindfulness</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Learning Balinese Massage Techniques</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Aspiring therapists can study authentic Balinese massage through various programs:
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Training Options in Bali:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Traditional Apprenticeships:</strong> Study with master therapists (balian) in family lineages</li>
                        <li><strong>Spa Training Schools:</strong> Bliss Spa School Bali, Bodywork Center Ubud (1-4 week intensive courses)</li>
                        <li><strong>Resort Training Programs:</strong> Many luxury properties offer staff training that accepts external students</li>
                        <li><strong>Online Foundations:</strong> Theory and technique videos before in-person practical training</li>
                    </ul>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        <strong>Investment:</strong> Courses range from IDR 3,000,000-15,000,000 depending on duration and certification level.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Balinese Massage vs Other Modalities</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Key Differences:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>vs Swedish:</strong> Incorporates acupressure, stretching, and energy work; deeper spiritual component</li>
                        <li><strong>vs Thai:</strong> Uses more oil; less intense stretching; includes reflexology</li>
                        <li><strong>vs Deep Tissue:</strong> Gentler overall; focuses on energy flow not just muscle tension</li>
                        <li><strong>vs Shiatsu:</strong> Uses oil; broader techniques beyond acupressure alone</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Traditional Balinese massage represents one of the world's most comprehensive healing traditions—a holistic therapy addressing body, mind, and spirit simultaneously. Whether you're a wellness tourist seeking authentic cultural experiences or a therapist wanting to master this versatile modality, Balinese massage offers profound therapeutic value grounded in centuries of wisdom.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Experience this ancient healing art through certified Balinese massage therapists on IndaStreet—connecting tradition with modern convenience across Indonesia.
                    </p>
                </div>

                <div className="mt-12 relative rounded-2xl overflow-hidden p-8 text-white text-center">
                    <div 
                        className="absolute inset-0 bg-cover bg-center"
                        style={{backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/garden%20forest.png)'}}
                    ></div>
                    <div className="relative">
                        <h3 className="text-2xl font-bold mb-4 drop-shadow-lg">Experience Authentic Balinese Massage</h3>
                        <p className="text-xl mb-6 drop-shadow-md">Find certified traditional therapists on IndaStreet</p>
                        <button 
                            onClick={() => onNavigate?.('home')}
                            className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                        >
                            Book Your Session
                        </button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default TraditionalBalineseMassagePage;
