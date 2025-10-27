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

const BalineseMassagePage: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-orange-500">IndaStreet</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
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
                                <span className="text-black">inda</span>
                                <span className="text-orange-500">Street</span>
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
                                    onClick={() => window.location.href = '/'} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-orange-600 to-green-600 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 right-10 text-9xl">🌺</div>
                    <div className="absolute bottom-10 left-10 text-8xl">🌿</div>
                </div>
                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-6xl font-bold mb-6">Traditional Balinese Massage 🌺</h1>
                    <p className="text-2xl text-orange-100 mb-4">
                        1,000-Year-Old Healing Tradition from the Island of the Gods
                    </p>
                    <p className="text-lg text-orange-100 mb-8">
                        Deep tissue acupressure • Aromatherapy oils • Reflexology • Full body relaxation
                    </p>
                    <button 
                        onClick={() => {/* Navigate to therapists */}}
                        className="px-8 py-4 bg-white text-orange-700 font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg"
                    >
                        Find Balinese Massage Therapist
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* What Is Balinese Massage */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What is Balinese Massage?</h2>
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            Balinese massage is a traditional Indonesian therapy that has been practiced for over 
                            1,000 years. It combines gentle stretching, acupressure, reflexology, and aromatherapy 
                            to stimulate the flow of blood, oxygen, and energy (qi) throughout the body.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            Unlike Swedish massage which focuses on relaxation, or deep tissue which targets specific 
                            problem areas, Balinese massage is a holistic full-body treatment designed to bring balance 
                            to mind, body, and spirit.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-orange-50 rounded-xl p-6">
                                <div className="text-4xl mb-3">💆</div>
                                <h3 className="font-bold text-gray-900 mb-2">Acupressure</h3>
                                <p className="text-gray-600 text-sm">
                                    Pressure applied to specific points releases blocked energy and promotes healing
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-6">
                                <div className="text-4xl mb-3">🌸</div>
                                <h3 className="font-bold text-gray-900 mb-2">Aromatherapy</h3>
                                <p className="text-gray-600 text-sm">
                                    Essential oils like frangipani, sandalwood, and coconut enhance relaxation
                                </p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-6">
                                <div className="text-4xl mb-3">🦶</div>
                                <h3 className="font-bold text-gray-900 mb-2">Reflexology</h3>
                                <p className="text-gray-600 text-sm">
                                    Foot and hand massage stimulates organs and systems throughout the body
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Health Benefits</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">😌</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Reduces Stress & Anxiety</h3>
                                    <p className="text-gray-600">
                                        Promotes deep relaxation through calming techniques and aromatherapy, 
                                        lowering cortisol levels and inducing mental tranquility.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">💪</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Relieves Muscle Tension</h3>
                                    <p className="text-gray-600">
                                        Deep tissue pressure and stretching releases knots and tightness in muscles, 
                                        improving flexibility and reducing chronic pain.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">❤️</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Improves Blood Circulation</h3>
                                    <p className="text-gray-600">
                                        Long flowing strokes and acupressure stimulate blood flow, delivering oxygen 
                                        and nutrients throughout the body for better health.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">😴</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enhances Sleep Quality</h3>
                                    <p className="text-gray-600">
                                        Relaxation techniques and aromatherapy oils calm the nervous system, 
                                        helping you fall asleep faster and sleep more deeply.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">✨</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Boosts Energy Levels</h3>
                                    <p className="text-gray-600">
                                        Stimulating acupressure points unblocks energy pathways (meridians), 
                                        leaving you feeling refreshed and revitalized.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-2xl">🌟</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Improves Skin Health</h3>
                                    <p className="text-gray-600">
                                        Massage stimulates lymphatic drainage removing toxins, while nourishing 
                                        oils hydrate and rejuvenate skin for a healthy glow.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* What to Expect */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What to Expect During Your Session</h2>
                    <div className="bg-gradient-to-br from-orange-500 to-green-600 rounded-2xl p-8 md:p-12 text-white">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                                    1
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Consultation (5-10 minutes)</h3>
                                    <p className="text-orange-100">
                                        Your therapist will ask about health conditions, areas of tension, pressure 
                                        preferences, and any injuries or sensitivities to ensure a safe, personalized treatment.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                                    2
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Preparation (5 minutes)</h3>
                                    <p className="text-orange-100">
                                        You'll undress to your comfort level (underwear typically stays on) and lie face-down 
                                        on the massage table covered with towels. Calming music and aromatherapy diffusers create ambiance.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                                    3
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Full Body Massage (50-60 minutes)</h3>
                                    <p className="text-orange-100">
                                        The therapist uses warm aromatic oils and applies long flowing strokes, gentle stretches, 
                                        acupressure, and palm pressure across your back, legs, arms, hands, feet, neck, and scalp. 
                                        You'll be asked to turn over halfway through.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xl">
                                    4
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Relaxation Period (5-10 minutes)</h3>
                                    <p className="text-orange-100">
                                        After the massage, you'll have time to rest, slowly sit up, and reorient yourself. 
                                        Your therapist may offer herbal tea and provide aftercare advice.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Techniques Used */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Traditional Techniques</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">👐</div>
                            <h3 className="font-bold text-gray-900 mb-2">Palm Rolling</h3>
                            <p className="text-gray-600 text-sm">
                                Deep pressure applied with palms to stimulate muscles and circulation
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">👍</div>
                            <h3 className="font-bold text-gray-900 mb-2">Thumb Pressure</h3>
                            <p className="text-gray-600 text-sm">
                                Precise acupressure using thumbs on energy meridian points
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">🤲</div>
                            <h3 className="font-bold text-gray-900 mb-2">Skin Rolling</h3>
                            <p className="text-gray-600 text-sm">
                                Lifting and kneading skin to release fascia and improve flexibility
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">🧘</div>
                            <h3 className="font-bold text-gray-900 mb-2">Gentle Stretching</h3>
                            <p className="text-gray-600 text-sm">
                                Assisted yoga-like stretches to increase range of motion
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Typical Pricing in Bali</h2>
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-4 px-4 text-gray-700">Duration</th>
                                        <th className="text-left py-4 px-4 text-gray-700">Independent Therapist</th>
                                        <th className="text-left py-4 px-4 text-gray-700">Spa/Salon</th>
                                        <th className="text-left py-4 px-4 text-gray-700">Hotel/Resort</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-4 font-semibold">60 minutes</td>
                                        <td className="py-4 px-4 text-green-600 font-bold">IDR 150,000 - 250,000</td>
                                        <td className="py-4 px-4">IDR 250,000 - 350,000</td>
                                        <td className="py-4 px-4">IDR 400,000 - 650,000</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-4 font-semibold">90 minutes</td>
                                        <td className="py-4 px-4 text-green-600 font-bold">IDR 200,000 - 350,000</td>
                                        <td className="py-4 px-4">IDR 350,000 - 500,000</td>
                                        <td className="py-4 px-4">IDR 550,000 - 900,000</td>
                                    </tr>
                                    <tr className="border-b border-gray-100">
                                        <td className="py-4 px-4 font-semibold">120 minutes</td>
                                        <td className="py-4 px-4 text-green-600 font-bold">IDR 280,000 - 450,000</td>
                                        <td className="py-4 px-4">IDR 450,000 - 650,000</td>
                                        <td className="py-4 px-4">IDR 750,000 - 1,200,000</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-gray-500 mt-6">
                            * Prices vary by location, therapist experience, and whether service is at spa or in-villa. 
                            IndaStreet connects you directly with independent therapists offering the best value.
                        </p>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-16 bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Is Balinese massage painful?</h3>
                            <p className="text-gray-600">
                                No. While it uses deeper pressure than Swedish massage, it should not be painful. 
                                Therapists adjust pressure based on your comfort level. Communicate if anything feels too intense.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What should I wear?</h3>
                            <p className="text-gray-600">
                                Most people undress to underwear and are covered with towels throughout. You can also wear 
                                loose comfortable clothing if preferred. Discuss with your therapist beforehand.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">How often should I get Balinese massage?</h3>
                            <p className="text-gray-600">
                                For general wellness, once every 2-4 weeks is ideal. For chronic pain or stress, weekly 
                                sessions are recommended. Many people get monthly massages for maintenance.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Can I get Balinese massage if I'm pregnant?</h3>
                            <p className="text-gray-600">
                                Prenatal massage is safe after the first trimester with a therapist trained in pregnancy 
                                massage. Certain acupressure points are avoided. Always inform your therapist if you're pregnant.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Experience Authentic Balinese Massage</h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Book certified Balinese massage therapists across Indonesia
                    </p>
                    <button 
                        onClick={() => {/* Navigate to therapists */}}
                        className="px-12 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg text-lg"
                    >
                        Find Therapists Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalineseMassagePage;
