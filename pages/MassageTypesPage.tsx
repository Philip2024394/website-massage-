import React, { useState } from 'react';
import { MASSAGE_TYPES_CATEGORIZED } from '../constants';

interface MassageTypesPageProps {
    onBack: () => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

interface MassageType {
    name: string;
    description: string;
    image: string;
    popularity: number;
}

const MassageTypesPage: React.FC<MassageTypesPageProps> = ({ onBack }) => {
    // Flatten all massage types from categories
    const allMassageTypes: string[] = MASSAGE_TYPES_CATEGORIZED.flatMap(category => category.types);
    
    // Initialize massage types with popularity ratings
    const [massageTypes, setMassageTypes] = useState<MassageType[]>(
        allMassageTypes.map(name => ({
            name,
            description: getMassageDescription(name),
            image: `https://source.unsplash.com/400x300/?massage,${name.toLowerCase().replace(/\s+/g, '-')}`,
            popularity: Math.floor(Math.random() * 3) + 3 // Random 3-5 stars initially
        }))
    );

    const handlePopularityClick = (index: number) => {
        const currentPopularity = massageTypes[index].popularity;
        const newPopularity = currentPopularity === 5 ? 1 : currentPopularity + 1;
        
        const updatedTypes = [...massageTypes];
        updatedTypes[index] = { ...updatedTypes[index], popularity: newPopularity };
        setMassageTypes(updatedTypes);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack} 
                        className="text-gray-600 hover:text-gray-800"
                        aria-label="Back"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Massage Directory
                    </h1>
                </div>
            </header>

            <main className="p-4">
                <div className="flex flex-col gap-4">
                    {massageTypes.map((massage, index) => (
                        <div 
                            key={massage.name}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="relative">
                                <img 
                                    src={massage.image} 
                                    alt={massage.name}
                                    className="w-full h-40 object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/f97316/FFFFFF?text=' + encodeURIComponent(massage.name);
                                    }}
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                
                                {/* Massage Type Name on Image */}
                                <h3 className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow-lg">
                                    {massage.name}
                                </h3>
                                
                                {/* Popularity Badge */}
                                <button
                                    onClick={() => handlePopularityClick(index)}
                                    className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
                                    aria-label={`${massage.popularity} stars`}
                                >
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                    <span className="font-bold text-gray-800 text-sm">{massage.popularity}</span>
                                </button>
                            </div>
                            
                            {/* Description and Links Below Image */}
                            <div className="p-3">
                                <p className="text-xs text-gray-600 leading-relaxed mb-3">
                                    {massage.description}
                                </p>
                                <div className="flex gap-3 text-xs">
                                    <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                                        Therapists →
                                    </button>
                                    <button className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
                                        Places →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

// Helper function to generate descriptions
function getMassageDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
        'Traditional Massage': 'A classic massage technique using long, flowing strokes to relax muscles and improve circulation.',
        'Sports Massage': 'Designed for athletes to prevent and treat injuries, enhance performance, and aid recovery.',
        'Deep Tissue': 'Intense pressure targeting deep muscle layers to relieve chronic tension and pain.',
        'Swedish Massage': 'Gentle, relaxing massage with smooth gliding strokes to reduce stress and promote wellness.',
        'Thai Massage': 'Ancient healing practice combining acupressure, stretching, and yoga-like movements.',
        'Hot Stone': 'Smooth heated stones placed on body to warm and loosen tight muscles.',
        'Aromatherapy': 'Massage with essential oils to enhance relaxation and emotional well-being.',
        'Reflexology': 'Pressure point therapy on feet, hands, and ears to promote healing throughout the body.',
        'Shiatsu': 'Japanese technique using finger pressure on energy meridians to balance body energy.',
        'Prenatal': 'Specialized massage for pregnant women to relieve discomfort and reduce stress.',
        'Couples Massage': 'Side-by-side massage experience for two people in the same room.',
        'Chair Massage': 'Quick seated massage focusing on neck, shoulders, back, and arms.',
        'Lymphatic Drainage': 'Gentle massage to stimulate lymph flow and remove toxins from the body.',
        'Trigger Point': 'Focused pressure on specific tight areas to release muscle knots and tension.',
        'Myofascial Release': 'Technique targeting fascia to improve flexibility and reduce chronic pain.',
        'Balinese': 'Traditional Indonesian massage combining acupressure, reflexology, and aromatherapy.',
        'Lomi Lomi': 'Hawaiian massage using flowing movements mimicking ocean waves for deep relaxation.',
        'Indian Head': 'Focused massage on head, neck, and shoulders to relieve tension and promote hair health.',
        'Back Massage': 'Concentrated massage therapy targeting the back muscles and spine area.',
        'Foot Massage': 'Therapeutic massage focusing on feet to relieve tension and improve circulation.',
        'Four Hands': 'Two therapists working simultaneously for an immersive relaxation experience.',
        'Cupping': 'Traditional therapy using suction cups to improve blood flow and release muscle tension.',
        'Scrub & Massage': 'Exfoliating body scrub followed by relaxing massage for smooth, rejuvenated skin.',
        'Oil Massage': 'Full body massage using warm therapeutic oils for deep relaxation and nourishment.',
        'Dry Massage': 'Massage performed without oil, focusing on pressure points and muscle manipulation.',
    };

    return descriptions[type] || 'A professional massage therapy technique designed to promote relaxation, reduce stress, and improve overall well-being.';
}

export default MassageTypesPage;
