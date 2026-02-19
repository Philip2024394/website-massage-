// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState, useEffect } from 'react';
import { FACIAL_TYPES_CATEGORIZED } from '../constants/rootConstants';
import { FACIAL_TYPE_DETAILS, getFacialTypeDetails } from '../constants';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import { Page } from '../types/pageTypes';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import { parseMassageTypes } from '../utils/appwriteHelpers';

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

const TherapistIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    const { t: hookT } = useTranslations(language as 'en' | 'id');
    const t = propT || hookT;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Flatten all facial types from categories
    const allFacialTypes: string[] = FACIAL_TYPES_CATEGORIZED.flatMap(category => category.types);
    
    // Base ratings
    const baseRatings = [4.3, 4.6, 4.7, 4.9];
    
    // Initialize facial types with popularity ratings
    const [facialTypes, setFacialTypes] = useState<FacialType[]>(
        allFacialTypes.map((name, index) => {
            const details = getFacialTypeDetails(name);
            return {
                name,
                description: details?.shortDescription || getFacialDescription(name),
                fullDescription: details?.fullDescription || getFacialFullDescription(name),
                benefits: details?.benefits || getFacialBenefits(name),
                duration: details?.duration || '60-90 minutes',
                intensity: details?.intensity || 'Gentle',
                bestFor: details?.bestFor || getFacialBestFor(name),
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

    // Count places/therapists that offer this facial type (facialTypes / facialtypes)
    const offersFacialType = (facialTypeName: string) => (item: any) => {
        const raw = (item as any).facialTypes ?? (item as any).facialtypes;
        const types = parseMassageTypes(raw);
        return types.some((ft: string) => ft === facialTypeName || ft.trim() === facialTypeName);
    };
    const countOffers = (facialTypeName: string): { therapists: number; places: number } => {
        const therapistCount = (therapists || []).filter(offersFacialType(facialTypeName)).length;
        const placeCount = (places || []).filter(offersFacialType(facialTypeName)).length;
        return { therapists: therapistCount, places: placeCount };
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 w-full max-w-full">
            <UniversalHeader
                language={language}
                onLanguageChange={undefined}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
                title={t?.home?.facialTypes ?? 'Facial Types'}
            />

            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={t}
                    language={language as 'en' | 'id' | 'gb'}
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
                    therapists={therapists}
                    places={places}
                />
            </React19SafeWrapper>

            <main className="p-4 pt-24 pb-20 max-w-full">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {t?.home?.facialTypes ?? 'Facial Types'}
                        </h1>
                        <p className="text-sm text-slate-600 mt-1.5">
                            {language === 'id'
                                ? 'Pilih jenis facial di bawah untuk menemukan terapis atau tempat facial.'
                                : 'Select a facial type below to find therapists or facial places near you.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {facialTypes.map((facial, index) => (
                            <div
                                key={facial.name}
                                className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg hover:border-orange-200/80 transition-all duration-300"
                            >
                                <div className="relative h-52 bg-gray-100">
                                    <img
                                        src={facial.image}
                                        alt={facial.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/f97316/FFFFFF?text=' + encodeURIComponent(facial.name);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4 text-white drop-shadow-md space-y-1">
                                        <h3 className="font-bold text-xl sm:text-2xl leading-tight">
                                            {facial.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/90 line-clamp-2 leading-snug">
                                            {facial.description}
                                        </p>
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                                        <StarIcon className="w-3.5 h-3.5 text-amber-300" />
                                        <span className="font-semibold text-white text-xs">{facial.popularity}</span>
                                    </div>
                                </div>

                                <div className="p-4 sm:p-5">
                                    <div className="mb-2">
                                        <span className="inline-block px-3 py-1.5 bg-orange-500 text-white text-[11px] font-semibold rounded-full shadow-sm">
                                            {facial.duration} • {facial.intensity}
                                        </span>
                                    </div>
                                    {facial.bestFor?.length > 0 && (
                                        <p className="text-xs text-gray-600 mb-3">
                                            <span className="font-semibold text-gray-800">
                                                {language === 'id' ? 'Direkomendasikan untuk: ' : 'Recommended for: '}
                                            </span>
                                            {facial.bestFor.slice(0, 4).join(', ')}
                                        </p>
                                    )}

                                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 mb-3 space-y-1.5">
                                        {(() => {
                                            const { therapists: therapistCount, places: placeCount } = countOffers(facial.name);
                                            return (
                                                <p className="text-xs text-gray-700 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="inline-flex items-center gap-1">
                                                        <TherapistIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                                        {therapistCount} {language === 'id' ? 'terapis' : therapistCount === 1 ? 'therapist' : 'therapists'}
                                                    </span>
                                                    <span className="text-gray-300">·</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <BuildingIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                                        {placeCount} {language === 'id' ? 'tempat facial' : placeCount === 1 ? 'facial place' : 'facial places'}
                                                    </span>
                                                </p>
                                            );
                                        })()}
                                        <p className="text-xs text-gray-600">
                                            {language === 'id' ? 'Harga bervariasi tergantung lokasi' : 'Prices vary depending on location'}
                                        </p>
                                    </div>

                                    {facial.fullDescription && (
                                        <button
                                            onClick={() => toggleExpanded(index)}
                                            className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors mb-3 flex items-center gap-1"
                                        >
                                            {facial.expanded ? `− ${t?.home?.readLess || 'Read Less'}` : `+ ${t?.home?.readMore || 'Read More'}`}
                                        </button>
                                    )}

                                    {facial.expanded && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1.5">{t?.home?.aboutMassage || 'About'} {facial.name}</h4>
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {facial.fullDescription}
                                                </p>
                                            </div>
                                            {facial.benefits?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{t?.home?.keyBenefits || 'Key Benefits'}</h4>
                                                    <ul className="space-y-1">
                                                        {facial.benefits.map((benefit, idx) => (
                                                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                                                                <span className="text-orange-500 mt-0.5">✓</span>
                                                                <span>{benefit}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {facial.bestFor?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{t?.home?.bestFor || 'Best For'}</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {facial.bestFor.map((item, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                                        <button
                                            onClick={() => onFindTherapists?.(facial.name)}
                                            className="w-full py-2.5 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
                                        >
                                            {t?.home?.findTherapists || 'Find Therapists'}
                                        </button>
                                        <button
                                            onClick={() => onFindPlaces?.(facial.name)}
                                            className="w-full py-2 px-4 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <BuildingIcon className="w-4 h-4 text-gray-500" />
                                            {language === 'id' ? 'Temukan Tempat Facial' : 'Find Facial Places'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
        </div>
    );
};

// Helper functions
function getFacialImage(type: string): string {
    const images: { [key: string]: string } = {
        'Anti-Aging Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png',
        'Collagen Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Microdermabrasion': 'https://ik.imagekit.io/7grri5v7d/Microdermabrasion.png',
        'Chemical Peel': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'LED Light Therapy': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Hydrating Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Brightening Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Acne Treatment Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Deep Cleansing Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Sensitive Skin Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
        'Oxygen Facial': 'https://ik.imagekit.io/7grri5v7d/antic%20age%20indonisea.png',
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
