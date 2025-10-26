import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MassageBaliPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedArea, setSelectedArea] = useState<string>('all');

    const areas = [
        { id: 'seminyak', name: 'Seminyak', count: 87, type: 'Luxury Beach Resort' },
        { id: 'ubud', name: 'Ubud', count: 124, type: 'Cultural Wellness Hub' },
        { id: 'canggu', name: 'Canggu', count: 56, type: 'Surf & Wellness' },
        { id: 'sanur', name: 'Sanur', count: 43, type: 'Family-Friendly Beach' },
        { id: 'nusa-dua', name: 'Nusa Dua', count: 92, type: 'Premium Resort Area' },
        { id: 'jimbaran', name: 'Jimbaran', count: 38, type: 'Beachfront Spa' },
    ];

    const massageTypes = [
        {
            name: 'Traditional Balinese Massage',
            price: 'IDR 150,000 - 300,000/hour',
            description: 'Deep tissue massage using acupressure, reflexology, and aromatherapy oils',
            popularity: 'Most Popular',
            icon: '🌺'
        },
        {
            name: 'Hot Stone Massage',
            price: 'IDR 250,000 - 450,000/90min',
            description: 'Smooth volcanic stones heated and placed on body for deep relaxation',
            popularity: 'Luxury Choice',
            icon: '🔥'
        },
        {
            name: 'Aromatherapy Massage',
            price: 'IDR 180,000 - 350,000/hour',
            description: 'Gentle massage with essential oils for relaxation and healing',
            popularity: 'Relaxation Favorite',
            icon: '🌿'
        },
        {
            name: 'Deep Tissue Massage',
            price: 'IDR 200,000 - 400,000/hour',
            description: 'Intensive therapy targeting muscle knots and chronic tension',
            popularity: 'Therapeutic',
            icon: '💪'
        },
    ];

    const featuredTherapists = [
        {
            name: 'Wayan S.',
            specialty: 'Traditional Balinese',
            experience: '12 years',
            rating: 4.9,
            reviews: 234,
            languages: ['English', 'Indonesian', 'Japanese'],
            location: 'Ubud',
            verified: true
        },
        {
            name: 'Kadek M.',
            specialty: 'Hot Stone & Aromatherapy',
            experience: '8 years',
            rating: 4.8,
            reviews: 187,
            languages: ['English', 'Indonesian', 'Chinese'],
            location: 'Seminyak',
            verified: true
        },
        {
            name: 'Made A.',
            specialty: 'Deep Tissue',
            experience: '10 years',
            rating: 5.0,
            reviews: 156,
            languages: ['English', 'Indonesian'],
            location: 'Nusa Dua',
            verified: true
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-green-600 to-blue-600 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 text-8xl">🌺</div>
                    <div className="absolute top-32 right-20 text-6xl">🌴</div>
                    <div className="absolute bottom-20 left-1/4 text-7xl">💆</div>
                    <div className="absolute bottom-10 right-10 text-9xl">🏝️</div>
                </div>
                <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-6xl font-bold mb-6">Massage in Bali 🌺</h1>
                    <p className="text-2xl text-green-100 mb-4">
                        Find Professional Balinese Massage Therapists Across the Island
                    </p>
                    <p className="text-lg text-green-100 mb-8">
                        500+ verified therapists | 200+ hotel partners | Instant booking
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button 
                            onClick={() => navigate('/therapists')}
                            className="px-8 py-4 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors shadow-lg text-lg"
                        >
                            Browse Therapists
                        </button>
                        <button 
                            onClick={() => navigate('/booking')}
                            className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-green-700 transition-colors text-lg"
                        >
                            Book Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">440+</div>
                            <div className="text-gray-600">Therapists in Bali</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">180+</div>
                            <div className="text-gray-600">Hotel Partners</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
                            <div className="text-gray-600">Booking Available</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-orange-600 mb-2">4.9⭐</div>
                            <div className="text-gray-600">Average Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Popular Areas */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Popular Areas in Bali</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {areas.map((area) => (
                            <div 
                                key={area.id}
                                onClick={() => setSelectedArea(area.id)}
                                className={`bg-white rounded-2xl p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                                    selectedArea === area.id ? 'ring-4 ring-green-500' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{area.name}</h3>
                                        <p className="text-sm text-gray-500">{area.type}</p>
                                    </div>
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                        {area.count} therapists
                                    </div>
                                </div>
                                <button className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors">
                                    View Therapists
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Massage Types */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Popular Massage Types in Bali</h2>
                    <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
                        Discover traditional Balinese healing techniques and modern wellness therapies
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        {massageTypes.map((type, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="text-5xl">{type.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{type.name}</h3>
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                                                {type.popularity}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-3 text-sm">{type.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-green-600 font-bold">{type.price}</span>
                                            <button 
                                                onClick={() => navigate('/therapists')}
                                                className="text-blue-600 hover:text-blue-700 font-bold text-sm"
                                            >
                                                Find Therapist →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Therapists */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Featured Bali Therapists</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {featuredTherapists.map((therapist, index) => (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{therapist.name}</h3>
                                        <p className="text-sm text-gray-500">{therapist.location}</p>
                                    </div>
                                    {therapist.verified && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 mb-1">
                                        <span className="font-bold">Specialty:</span> {therapist.specialty}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-1">
                                        <span className="font-bold">Experience:</span> {therapist.experience}
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-yellow-500 font-bold">{therapist.rating} ⭐</span>
                                        <span className="text-gray-500 text-sm">({therapist.reviews} reviews)</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {therapist.languages.map((lang, i) => (
                                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                {lang}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/therapists')}
                                    className="w-full py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-blue-600 transition-colors"
                                >
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Bali Massage */}
                <div className="mb-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl p-12 text-white">
                    <h2 className="text-4xl font-bold mb-8 text-center">Why Bali is the Massage Capital of Asia</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🌺</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Ancient Healing Traditions</h3>
                                <p className="text-green-100">
                                    Balinese massage has been practiced for over 1,000 years, combining acupressure, 
                                    reflexology, and aromatherapy for holistic healing.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">👨‍⚕️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Highly Trained Therapists</h3>
                                <p className="text-green-100">
                                    Bali has specialized massage schools and certification programs producing 
                                    world-class therapists recognized globally.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Affordable Luxury</h3>
                                <p className="text-green-100">
                                    World-class massage experiences at a fraction of the price compared to 
                                    Western countries. Premium treatments from IDR 150,000.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">🏝️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Wellness Tourism Hub</h3>
                                <p className="text-green-100">
                                    Bali attracts 6 million tourists annually seeking wellness experiences, 
                                    creating a thriving massage and spa industry.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How to Book */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">How to Book a Massage in Bali</h2>
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-3xl font-bold text-green-600">1</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Browse Therapists</h3>
                            <p className="text-sm text-gray-600">Search by location, specialty, price, and availability</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-3xl font-bold text-blue-600">2</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Check Reviews</h3>
                            <p className="text-sm text-gray-600">Read verified reviews from real clients</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-3xl font-bold text-purple-600">3</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Contact via WhatsApp</h3>
                            <p className="text-sm text-gray-600">Message therapist directly to arrange booking</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <span className="text-3xl font-bold text-orange-600">4</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Enjoy Your Massage</h3>
                            <p className="text-sm text-gray-600">Relax and experience authentic Balinese therapy</p>
                        </div>
                    </div>
                </div>

                {/* SEO FAQ Section */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">How much does a massage in Bali cost?</h3>
                            <p className="text-gray-600">
                                Traditional Balinese massage typically ranges from IDR 150,000 to 300,000 per hour. 
                                Specialty treatments like hot stone massage cost IDR 250,000 to 450,000. Hotel spa 
                                prices are generally higher (IDR 400,000+) compared to independent therapists.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What is a traditional Balinese massage?</h3>
                            <p className="text-gray-600">
                                Balinese massage is a full-body treatment combining gentle stretching, acupressure, 
                                reflexology, and aromatherapy. It uses long strokes, skin rolling, and palm pressure 
                                to stimulate blood flow, relieve tension, and promote relaxation.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Where can I get a massage in Bali?</h3>
                            <p className="text-gray-600">
                                Popular areas include Ubud (wellness hub), Seminyak (luxury spas), Canggu (surf wellness), 
                                Nusa Dua (resort spas), Sanur (family-friendly), and Jimbaran (beachfront). IndaStreet 
                                connects you with verified therapists across all areas.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Are Bali massage therapists certified?</h3>
                            <p className="text-gray-600">
                                All therapists on IndaStreet are verified and certified. Most have completed formal 
                                training at Bali massage schools and hold certifications in traditional Balinese, 
                                Swedish, deep tissue, and specialized techniques.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Can I book a massage at my hotel or villa?</h3>
                            <p className="text-gray-600">
                                Yes! Many therapists on IndaStreet offer in-room or in-villa services. Simply specify 
                                your location when booking and the therapist will bring all necessary equipment 
                                (massage table, oils, towels) to you.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Final CTA */}
                <div className="mt-16 text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Experience Authentic Balinese Massage?</h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Browse 440+ verified therapists across Bali and book your perfect massage experience today
                    </p>
                    <button 
                        onClick={() => navigate('/therapists')}
                        className="px-12 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg text-lg"
                    >
                        Find Your Therapist Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MassageBaliPage;
