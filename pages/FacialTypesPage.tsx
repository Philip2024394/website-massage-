import React, { useState, useEffect } from 'react';
import { FACIAL_TYPES_CATEGORIZED } from '../constants/rootConstants';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import { Page } from '../types/pageTypes';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface FacialTypesPageProps {
    _onBack?: () => void;
    onNavigate?: (page: Page) => void;
    onFindTherapists?: (facialType: string) => void;
    onFindPlaces?: (facialType: string) => void;
    t?: any;
    // AppDrawer props
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onFacialPortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const StarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const BuildingIcon = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
);

interface FacialType {
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

const FacialTypesPage: React.FC<FacialTypesPageProps> = ({ 
    _onBack, 
    onNavigate,
    onFindTherapists, 
    onFindPlaces, 
    t: propT,
    // AppDrawer props
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onFacialPortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const { language } = useLanguage();
    const { t: hookT } = useTranslations(language);
    const t = propT || hookT;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Flatten all facial types from categories
    const allFacialTypes: string[] = FACIAL_TYPES_CATEGORIZED.flatMap(category => category.types);
    
    // Base ratings
    const baseRatings = [4.3, 4.6, 4.7, 4.9];
    
    // Initialize facial types with popularity ratings
    const [facialTypes, setFacialTypes] = useState<FacialType[]>(
        allFacialTypes.map((name, index) => {
            return {
                name,
                description: getFacialDescription(name),
                fullDescription: getFacialFullDescription(name),
                benefits: getFacialBenefits(name),
                duration: '60-90 minutes',
                intensity: 'Gentle',
                bestFor: getFacialBestFor(name),
                image: getFacialImage(name),
                popularity: baseRatings[index % baseRatings.length],
                expanded: false
            };
        })
    );

    // Add slight fluctuations to ratings
    useEffect(() => {
        const interval = setInterval(() => {
            setFacialTypes(prevTypes => 
                prevTypes.map(type => {
                    const fluctuation = (Math.random() - 0.5) * 0.2;
                    let newRating = type.popularity + fluctuation;
                    newRating = Math.max(4.0, Math.min(5.0, newRating));
                    newRating = Math.round(newRating * 10) / 10;
                    return { ...type, popularity: newRating };
                })
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handlePopularityClick = (index: number) => {
        const updatedTypes = [...facialTypes];
        let newRating = updatedTypes[index].popularity + 0.1;
        newRating = Math.min(5.0, newRating);
        newRating = Math.round(newRating * 10) / 10;
        updatedTypes[index] = { ...updatedTypes[index], popularity: newRating };
        setFacialTypes(updatedTypes);
    };

    const toggleExpanded = (index: number) => {
        const updatedTypes = [...facialTypes];
        updatedTypes[index] = { ...updatedTypes[index], expanded: !updatedTypes[index].expanded };
        setFacialTypes(updatedTypes);
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
            {/* Header matching HomePage */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm w-full max-w-full overflow-hidden">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button 
                            onClick={() => onNavigate?.('home')} 
                            title="Home"
                            className="hover:text-orange-500 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* App Drawer */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={t}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onFacialPortalClick={onFacialPortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate ? (page: string) => onNavigate(page as Page) : undefined}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    therapists={therapists}
                    places={places}
                />
            </React19SafeWrapper>

            <main className="p-4 pb-20 overflow-x-hidden max-w-full">
                <div className="flex flex-col gap-4 max-w-full">
                    {facialTypes.map((facial, index) => (
                        <div 
                            key={facial.name}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-full"
                        >
                            <div className="relative">
                                <img 
                                    src={facial.image} 
                                    alt={facial.name}
                                    className="w-full h-40 object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/ec4899/FFFFFF?text=' + encodeURIComponent(facial.name);
                                    }}
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                
                                {/* Facial Type Name on Image */}
                                <h3 className="absolute bottom-3 left-3 text-white font-bold text-lg drop-shadow-lg">
                                    {facial.name}
                                </h3>
                                
                                {/* Popularity Badge */}
                                <button
                                    onClick={() => handlePopularityClick(index)}
                                    className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
                                    aria-label={`${facial.popularity} stars`}
                                >
                                    <StarIcon className="w-4 h-4 text-yellow-400" />
                                    <span className="font-bold text-gray-800 text-sm">{facial.popularity}</span>
                                </button>
                            </div>
                            
                            {/* Description and Links Below Image */}
                            <div className="p-4">
                                {/* Short Description */}
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                    {facial.description}
                                </p>

                                {/* Quick Info Pills */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                                        {facial.duration}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                        {facial.intensity}
                                    </span>
                                </div>

                                {/* Read More Button */}
                                {facial.fullDescription && (
                                    <button 
                                        onClick={() => toggleExpanded(index)}
                                        className="text-pink-500 font-semibold text-sm hover:text-pink-600 transition-colors mb-3 flex items-center gap-1"
                                    >
                                        {facial.expanded ? '− Read Less' : '+ Read More'}
                                    </button>
                                )}

                                {/* Expanded Content */}
                                {facial.expanded && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-4">
                                        {/* Full Description */}
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">About {facial.name}</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {facial.fullDescription}
                                            </p>
                                        </div>

                                        {/* Benefits */}
                                        {facial.benefits && facial.benefits.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">Key Benefits</h4>
                                                <ul className="space-y-1">
                                                    {facial.benefits.map((benefit, idx) => (
                                                        <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                            <span className="text-pink-500 mt-0.5">✓</span>
                                                            <span>{benefit}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Best For */}
                                        {facial.bestFor && facial.bestFor.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">Best For</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {facial.bestFor.map((item, idx) => (
                                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 text-xs mt-3 pt-3 border-t border-gray-100">
                                    {/* Find Therapists - Left */}
                                    <button 
                                        onClick={() => onFindTherapists?.(facial.name)}
                                        className="flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
                                    >
                                        Find Therapists →
                                    </button>
                                    
                                    {/* Spacer */}
                                    <div className="flex-1"></div>
                                    
                                    {/* Find Facial Spas - Right with circular icon */}
                                    <button 
                                        onClick={() => onFindPlaces?.(facial.name)}
                                        className="flex items-center gap-2 text-pink-500 font-semibold hover:text-pink-600 transition-colors"
                                    >
                                        <span className="flex items-center justify-center w-6 h-6 bg-pink-100 rounded-full">
                                            <BuildingIcon className="w-4 h-4" />
                                        </span>
                                        Find Facial Spas →
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

// Helper functions
function getFacialImage(type: string): string {
    const images: { [key: string]: string } = {
        'Anti-Aging Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png',
        'Collagen Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Microdermabrasion': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
    };
    // Return specific image if available, otherwise return placeholder
    if (images[type]) {
        return images[type];
    }
    const placeholderColor = ['ec4899', 'f472b6', 'fb7185', 'fda4af'][type.length % 4];
    return `https://via.placeholder.com/400x200/${placeholderColor}/FFFFFF?text=${encodeURIComponent(type)}`;
}

function getFacialDescription(type: string): string {
    const descriptions: { [key: string]: string } = {
        'Anti-Aging Facial': 'Targets fine lines, wrinkles, and age spots to rejuvenate and firm your skin.',
        'Collagen Facial': 'Boosts skin elasticity and reduces wrinkles with collagen-rich treatments.',
        'Microdermabrasion': 'Exfoliates dead skin cells revealing smoother, brighter skin underneath.',
        'Chemical Peel': 'Uses acids to remove damaged outer layers for a fresh, youthful glow.',
        'LED Light Therapy': 'Non-invasive treatment using different light wavelengths to treat various skin concerns.',
        'Hydrating Facial': 'Deep moisture treatment for dry, dehydrated skin leaving it plump and radiant.',
        'Brightening Facial': 'Reduces dark spots and evens skin tone for a luminous complexion.',
        'Acne Treatment Facial': 'Deep cleansing treatment targeting breakouts and preventing future acne.',
        'Deep Cleansing Facial': 'Thoroughly cleanses pores removing impurities and excess oil.',
        'Sensitive Skin Facial': 'Gentle treatment designed for delicate, reactive skin types.',
        'Oxygen Facial': 'Infuses pure oxygen for instant glow and plump, healthy-looking skin.',
        'Gold Facial': 'Luxury treatment using gold particles to brighten and firm the skin.',
        'Vitamin C Facial': 'Powerful antioxidant treatment for brightening and protecting skin.',
        'Organic/Natural Facial': 'Uses only natural, chemical-free ingredients for pure skincare.',
        "Men's Facial": 'Tailored facial addressing mens specific skin concerns and needs.',
        'Lulur Facial': 'Traditional Indonesian treatment using turmeric and rice powder for glowing skin.',
        'Javanese Facial': 'Ancient Indonesian beauty ritual combining herbs and massage techniques.',
        'Herbal Facial': 'Natural treatment using medicinal herbs for healing and rejuvenation.',
    };
    return descriptions[type] || 'Professional facial treatment designed to improve skin health and appearance.';
}

function getFacialFullDescription(type: string): string {
    return `${getFacialDescription(type)} This treatment combines advanced techniques with premium products to deliver visible results. Perfect for maintaining healthy, beautiful skin.`;
}

function getFacialBenefits(type: string): string[] {
    const benefits: { [key: string]: string[] } = {
        'Anti-Aging Facial': ['Reduces fine lines', 'Firms skin', 'Improves elasticity', 'Evens skin tone'],
        'Hydrating Facial': ['Deep hydration', 'Plumps skin', 'Reduces dryness', 'Restores moisture barrier'],
        'Brightening Facial': ['Reduces dark spots', 'Evens complexion', 'Adds radiance', 'Prevents pigmentation'],
        'Acne Treatment Facial': ['Clears breakouts', 'Unclogs pores', 'Reduces inflammation', 'Prevents future acne'],
    };
    return benefits[type] || ['Improves skin health', 'Enhances complexion', 'Promotes relaxation', 'Boosts confidence'];
}

function getFacialBestFor(type: string): string[] {
    const bestFor: { [key: string]: string[] } = {
        'Anti-Aging Facial': ['Mature skin', 'Fine lines', 'Wrinkles', 'Loss of firmness'],
        'Hydrating Facial': ['Dry skin', 'Dehydrated skin', 'Tight skin', 'Flaky skin'],
        'Brightening Facial': ['Dull skin', 'Dark spots', 'Uneven tone', 'Sun damage'],
        'Acne Treatment Facial': ['Oily skin', 'Breakouts', 'Clogged pores', 'Acne-prone skin'],
    };
    return bestFor[type] || ['All skin types', 'Special occasions', 'Regular maintenance'];
}

export default FacialTypesPage;
