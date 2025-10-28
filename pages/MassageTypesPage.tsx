import React, { useState } from 'react';
import { MASSAGE_TYPES_CATEGORIZED, getMassageTypeImage, getMassageTypeDetails } from '../constants';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CloseIcon from '../components/icons/CloseIcon';

interface MassageTypesPageProps {
    onBack: () => void;
    onFindTherapists?: (massageType: string) => void;
    onFindPlaces?: (massageType: string) => void;
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const UsersIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const BuildingIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

interface MassageType {
    name: string;
    description: string;
    fullDescription: string;
    benefits: string[];
    duration: string;
    intensity: string;
    bestFor: string[];
    image: string;
    popularity: number;
    expanded: boolean;
}

const MassageTypesPage: React.FC<MassageTypesPageProps> = ({ onBack, onFindTherapists, onFindPlaces }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Flatten all massage types from categories
    const allMassageTypes: string[] = MASSAGE_TYPES_CATEGORIZED.flatMap(category => category.types);
    
    // Initialize massage types with popularity ratings
    const [massageTypes, setMassageTypes] = useState<MassageType[]>(
        allMassageTypes.map(name => {
            const imageUrl = getMassageTypeImage(name);
            const details = getMassageTypeDetails(name);
            // Create a consistent placeholder color based on the massage type name
            const placeholderColor = ['f97316', 'ea580c', 'fb923c', 'fdba74'][name.length % 4];
            return {
                name,
                description: details?.shortDescription || getMassageDescription(name),
                fullDescription: details?.fullDescription || getMassageDescription(name),
                benefits: details?.benefits || [],
                duration: details?.duration || '60 minutes',
                intensity: details?.intensity || 'Moderate',
                bestFor: details?.bestFor || [],
                // Use our image URL if available, otherwise use consistent placeholder
                image: imageUrl || `https://via.placeholder.com/400x200/${placeholderColor}/FFFFFF?text=${encodeURIComponent(name)}`,
                popularity: Math.floor(Math.random() * 3) + 3, // Random 3-5 stars initially
                expanded: false
            };
        })
    );

    const handlePopularityClick = (index: number) => {
        const currentPopularity = massageTypes[index].popularity;
        const newPopularity = currentPopularity === 5 ? 1 : currentPopularity + 1;
        
        const updatedTypes = [...massageTypes];
        updatedTypes[index] = { ...updatedTypes[index], popularity: newPopularity };
        setMassageTypes(updatedTypes);
    };

    const toggleExpanded = (index: number) => {
        const updatedTypes = [...massageTypes];
        updatedTypes[index] = { ...updatedTypes[index], expanded: !updatedTypes[index].expanded };
        setMassageTypes(updatedTypes);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header matching HomePage */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
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
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">
                                <span className="inline-block animate-float">S</span>treet
                            </span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Brand Header */}
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
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Menu Content */}
                        <nav className="flex-1 overflow-y-auto px-4 py-2">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => { onBack(); setIsMenuOpen(false); }} 
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white transition-colors text-gray-700 font-medium"
                                >
                                    Home
                                </button>
                            </div>
                        </nav>

                        {/* Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
                            <p className="text-xs text-center text-gray-500">
                                © 2025 IndaStreet Massage
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <main className="p-4 pb-20">
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
                                    loading="lazy"
                                    onError={(e) => {
                                        // If image fails to load, use a placeholder with the massage type name
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
                            <div className="p-4">
                                {/* Short Description */}
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                    {massage.description}
                                </p>

                                {/* Quick Info Pills */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                        {massage.duration}
                                    </span>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                        {massage.intensity} Pressure
                                    </span>
                                </div>

                                {/* Read More Button */}
                                {massage.fullDescription && (
                                    <button 
                                        onClick={() => toggleExpanded(index)}
                                        className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors mb-3 flex items-center gap-1"
                                    >
                                        {massage.expanded ? '− Read Less' : '+ Read More'}
                                    </button>
                                )}

                                {/* Expanded Content for SEO */}
                                {massage.expanded && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-4">
                                        {/* Full Description */}
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">About {massage.name}</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {massage.fullDescription}
                                            </p>
                                        </div>

                                        {/* Benefits */}
                                        {massage.benefits && massage.benefits.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">Key Benefits</h4>
                                                <ul className="space-y-1">
                                                    {massage.benefits.map((benefit, idx) => (
                                                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                            <span className="text-orange-500 mt-0.5">✓</span>
                                                            <span>{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Best For */}
                                        {massage.bestFor && massage.bestFor.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">Best For</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {massage.bestFor.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons - Reorganized */}
                                <div className="flex gap-3 text-xs mt-3 pt-3 border-t border-gray-100">
                                    {/* Find Therapists - Left with circular icon */}
                                    <button 
                                        onClick={() => onFindTherapists?.(massage.name)}
                                        className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                                    >
                                        <span className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full">
                                            <UsersIcon className="w-4 h-4" />
                                        </span>
                                        Find Therapists →
                                    </button>
                                    
                                    {/* Spacer */}
                                    <div className="flex-1"></div>
                                    
                                    {/* Find Massage Places - Right with circular icon */}
                                    <button 
                                        onClick={() => onFindPlaces?.(massage.name)}
                                        className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                                    >
                                        <span className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full">
                                            <BuildingIcon className="w-4 h-4" />
                                        </span>
                                        Find Massage Places →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
            
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
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
