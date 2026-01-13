import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MASSAGE_TYPES_CATEGORIZED, getMassageTypeImage, getMassageTypeDetails } from '../constants';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import { Page } from '../types/pageTypes';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface MassageTypesPageProps {
    _onBack?: () => void;
    onNavigate?: (page: Page) => void;
    onFindTherapists?: (massageType: string) => void;
    onFindPlaces?: (massageType: string) => void;
    t?: any;
    // AppDrawer props
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
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

const MassageTypesPage: React.FC<MassageTypesPageProps> = ({ 
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
    const t = propT || hookT; // Use prop t if provided, otherwise use hook
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Check if we came from shared therapist profile
    const [showBackButton, setShowBackButton] = useState(false);
    const [returnUrl, setReturnUrl] = useState<string | null>(null);
    
    useEffect(() => {
        const source = sessionStorage.getItem('massageTypes_source');
        const returnUrl = sessionStorage.getItem('massageTypes_return_url');
        
        if (source === 'shared_therapist_profile' && returnUrl) {
            setShowBackButton(true);
            setReturnUrl(returnUrl);
        } else {
            setShowBackButton(false);
            setReturnUrl(null);
        }
    }, []);
    
    const handleBackClick = () => {
        if (returnUrl) {
            // Clear the session storage
            sessionStorage.removeItem('massageTypes_source');
            sessionStorage.removeItem('massageTypes_return_url');
            // Navigate back to shared profile
            window.location.href = returnUrl;
        } else {
            // Fallback to home
            onNavigate?.('home');
        }
    };
    
    // Flatten all massage types from categories
    const allMassageTypes: string[] = MASSAGE_TYPES_CATEGORIZED.flatMap(category => category.types);
    
    // Base ratings that will be used for each massage type (cycle through these values)
    const baseRatings = [4.2, 4.5, 4.7, 4.8];
    
    // Get translated massage content
    const getTranslatedMassageContent = (name: string) => {
        const translations = t?.massageTypes?.[name];
        const details = getMassageTypeDetails(name);
        
        if (translations) {
            return {
                description: translations.shortDescription,
                fullDescription: translations.fullDescription,
                benefits: translations.benefits,
                duration: translations.duration,
                intensity: translations.intensity,
                bestFor: translations.bestFor
            };
        }
        
        // Fallback to English from constants
        return {
            description: details?.shortDescription || getMassageDescription(name),
            fullDescription: details?.fullDescription || getMassageDescription(name),
            benefits: details?.benefits || [],
            duration: details?.duration || '60 minutes',
            intensity: details?.intensity || 'Moderate',
            bestFor: details?.bestFor || []
        };
    };
    
    // Initialize massage types with popularity ratings
    const [massageTypes, setMassageTypes] = useState<MassageType[]>(
        allMassageTypes.map((name, index) => {
            const imageUrl = getMassageTypeImage(name);
            const content = getTranslatedMassageContent(name);
            // Create a consistent placeholder color based on the massage type name
            const placeholderColor = ['f97316', 'ea580c', 'fb923c', 'fdba74'][name.length % 4];
            return {
                name,
                description: content.description,
                fullDescription: content.fullDescription,
                benefits: content.benefits,
                duration: content.duration,
                intensity: content.intensity,
                bestFor: content.bestFor,
                // Use our image URL if available, otherwise use consistent placeholder
                image: imageUrl || `https://via.placeholder.com/400x200/${placeholderColor}/FFFFFF?text=${encodeURIComponent(name)}`,
                popularity: baseRatings[index % baseRatings.length], // Assign base rating from array
                expanded: false
            };
        })
    );

    // Update massage types when translations change (language switch)
    useEffect(() => {
        setMassageTypes(prevTypes => 
            prevTypes.map(type => {
                const content = getTranslatedMassageContent(type.name);
                return {
                    ...type,
                    description: content.description,
                    fullDescription: content.fullDescription,
                    benefits: content.benefits,
                    duration: content.duration,
                    intensity: content.intensity,
                    bestFor: content.bestFor
                };
            })
        );
    }, [t]); // Re-run when translations change

    // Add slight fluctuations to ratings as user spends time on each card
    useEffect(() => {
        const interval = setInterval(() => {
            setMassageTypes(prevTypes => 
                prevTypes.map(type => {
                    // Small random fluctuation between -0.1 and +0.1
                    const fluctuation = (Math.random() - 0.5) * 0.2;
                    let newRating = type.popularity + fluctuation;
                    
                    // Keep rating within reasonable bounds (4.0 - 5.0)
                    newRating = Math.max(4.0, Math.min(5.0, newRating));
                    
                    // Round to 1 decimal place
                    newRating = Math.round(newRating * 10) / 10;
                    
                    return { ...type, popularity: newRating };
                })
            );
        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    const handlePopularityClick = (index: number) => {
        // Clicking adds a small boost to the rating
        const updatedTypes = [...massageTypes];
        let newRating = updatedTypes[index].popularity + 0.1;
        
        // Keep within bounds
        newRating = Math.min(5.0, newRating);
        newRating = Math.round(newRating * 10) / 10;
        
        updatedTypes[index] = { ...updatedTypes[index], popularity: newRating };
        setMassageTypes(updatedTypes);
    };

    const toggleExpanded = (index: number) => {
        const updatedTypes = [...massageTypes];
        updatedTypes[index] = { ...updatedTypes[index], expanded: !updatedTypes[index].expanded };
        setMassageTypes(updatedTypes);
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
                        {showBackButton ? (
                            <button 
                                onClick={handleBackClick} 
                                title="Back to Therapist Profile"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                                <span className="font-medium hidden sm:inline">
                                    {language === 'id' ? 'Kembali' : 'Back'}
                                </span>
                            </button>
                        ) : (
                            <button 
                                onClick={() => onNavigate?.('home')} 
                                title="Home"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                            >
                                <ArrowLeft className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
                                <span className="font-medium hidden sm:inline">
                                    {language === 'id' ? 'Beranda' : 'Home'}
                                </span>
                            </button>
                        )}
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* App Drawer - Same as HomePage */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={t}
                    language={language}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate ? (page: string) => onNavigate(page as Page) : undefined}
                    therapists={therapists}
                    places={places}
                />
            </React19SafeWrapper>

            <main className="p-4 pb-20 overflow-x-hidden max-w-full">
                <div className="flex flex-col gap-4 max-w-full">
                    {massageTypes.map((massage, index) => (
                        <div 
                            key={massage.name}
                            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 max-w-full"
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
                                        {massage.intensity} {t?.home?.pressure || 'Pressure'}
                                    </span>
                                </div>

                                {/* Read More Button */}
                                {massage.fullDescription && (
                                    <button 
                                        onClick={() => toggleExpanded(index)}
                                        className="text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors mb-3 flex items-center gap-1"
                                    >
                                        {massage.expanded ? `− ${t?.home?.readLess || 'Read Less'}` : `+ ${t?.home?.readMore || 'Read More'}`}
                                    </button>
                                )}

                                {/* Expanded Content for SEO */}
                                {massage.expanded && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-4">
                                        {/* Full Description */}
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-2">{t?.home?.aboutMassage || 'About'} {massage.name}</h4>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                {massage.fullDescription}
                                            </p>
                                        </div>

                                        {/* Benefits */}
                                        {massage.benefits && massage.benefits.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">{t?.home?.keyBenefits || 'Key Benefits'}</h4>
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
                                                <h4 className="text-sm font-bold text-gray-900 mb-2">{t?.home?.bestFor || 'Best For'}</h4>
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
                                    {/* Find Therapists - Left */}
                                    <button 
                                        onClick={() => onFindTherapists?.(massage.name)}
                                        className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
                                    >
                                        {t?.home?.findTherapists || 'Find Therapists'} →
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
                                        {t?.home?.findMassagePlaces || 'Find Massage Places'} →
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Directory footer: Brand + Terms & Privacy */}
                <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                    <div className="font-bold text-base">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </div>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => onTermsClick && onTermsClick()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                            Terms
                        </button>
                        <span className="text-sm text-gray-400">•</span>
                        <button onClick={() => onPrivacyClick && onPrivacyClick()} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">
                            Privacy
                        </button>
                    </div>
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
