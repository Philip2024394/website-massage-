// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState, useEffect } from 'react';
import { MASSAGE_TYPES_CATEGORIZED, getMassageTypeImage, getMassageTypeDetails } from '../constants';
import { parseMassageTypes, parsePricing } from '../utils/appwriteHelpers';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import { Page } from '../types/pageTypes';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface MassageTypesPageProps {
    _onBack?: () => void;
    onNavigate?: (page: Page) => void;
    onLanguageChange?: (lang: string) => void;
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

const TherapistIcon = ({ className = 'w-4 h-4' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
    onLanguageChange,
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
    const { language, setLanguage } = useLanguage();
    const { t: hookT } = useTranslations(language as 'en' | 'id');
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

    // Check if therapist or place offers this massage type (massageTypes or massagetypes)
    const offersThisType = (massageTypeName: string) => (item: any) => {
        const raw = (item as any).massageTypes ?? (item as any).massagetypes;
        const types = parseMassageTypes(raw);
        return types.some((t: string) => t === massageTypeName || t.trim() === massageTypeName);
    };

    const countOffers = (massageTypeName: string): { therapists: number; places: number } => {
        const therapistCount = therapists.filter(offersThisType(massageTypeName)).length;
        const placeCount = places.filter(offersThisType(massageTypeName)).length;
        return { therapists: therapistCount, places: placeCount };
    };

    // Collect prices from therapists and places that offer this massage type (from pricing / price60,90,120; stored in thousands → * 1000 for IDR)
    const getPriceRange = (massageTypeName: string): { minIdr: number; maxIdr: number } | null => {
        const idrPrices: number[] = [];
        const addPrices = (pricing: { "60": number; "90": number; "120": number } | null, price60?: string | number, price90?: string | number, price120?: string | number) => {
            if (pricing) {
                [pricing["60"], pricing["90"], pricing["120"]].forEach(v => { if (v > 0) idrPrices.push(Number(v) * 1000); });
            }
            [price60, price90, price120].forEach(v => {
                const n = typeof v === 'string' ? parseInt(v, 10) : v;
                if (n != null && !isNaN(n) && n > 0) idrPrices.push(n * 1000);
            });
        };
        therapists.filter(offersThisType(massageTypeName)).forEach((th: any) => {
            const parsed = parsePricing((th as any).pricing);
            addPrices(parsed, (th as any).price60, (th as any).price90, (th as any).price120);
        });
        places.filter(offersThisType(massageTypeName)).forEach((p: any) => {
            const parsed = parsePricing((p as any).pricing);
            addPrices(parsed, (p as any).price60, (p as any).price90, (p as any).price120);
        });
        if (idrPrices.length === 0) return null;
        return { minIdr: Math.min(...idrPrices), maxIdr: Math.max(...idrPrices) };
    };

    const formatIdr = (idr: number) => idr.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50  w-full max-w-full">
            {/* Universal Header - same as home page */}
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange ?? setLanguage}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={showBackButton ? handleBackClick : () => onNavigate?.('home')}
                showHomeButton={true}
                title="Massage Types"
            />

            {/* App Drawer - Same as HomePage */}
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
                    {/* Page header: title + subtitle with spacing under app header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900">
                            {t?.home?.massageTypes ?? 'Massage Types'}
                        </h1>
                        <p className="text-sm text-slate-600 mt-1.5">
                            {language === 'id'
                                ? 'Pilih jenis pijat di bawah untuk menemukan terapis atau tempat pijat.'
                                : 'Select a massage type below to find therapists or places near you.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {massageTypes.map((massage, index) => (
                            <div
                                key={massage.name}
                                className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden hover:shadow-lg hover:border-orange-200/80 transition-all duration-300"
                            >
                                {/* Image block – app-style hero */}
                                <div className="relative h-52 bg-gray-100">
                                    <img
                                        src={massage.image}
                                        alt={massage.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/f97316/FFFFFF?text=' + encodeURIComponent(massage.name);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4 text-white drop-shadow-md space-y-1">
                                        <h3 className="font-bold text-xl sm:text-2xl leading-tight">
                                            {massage.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-white/90 line-clamp-2 leading-snug">
                                            {massage.description}
                                        </p>
                                    </div>
                                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                                        <StarIcon className="w-3.5 h-3.5 text-amber-300" />
                                        <span className="font-semibold text-white text-xs">{massage.popularity}</span>
                                    </div>
                                </div>

                                {/* Content block – app style: info strip, availability, price note, read more, CTAs */}
                                <div className="p-4 sm:p-5">
                                    {/* Single orange recommendation badge per massage type */}
                                    <div className="mb-2">
                                        <span className="inline-block px-3 py-1.5 bg-orange-500 text-white text-[11px] font-semibold rounded-full shadow-sm">
                                            {language === 'id' ? 'Direkomendasikan: 60 / 90 / 120 menit' : 'Recommended: 60 / 90 / 120 min'}
                                        </span>
                                    </div>
                                    {/* Pressure: normally suited to this type, can be adjusted for comfort */}
                                    <p className="text-xs text-gray-600 mb-3">
                                        {language === 'id' ? (
                                            <>Tekanan biasanya {massage.intensity === 'Light' ? 'ringan' : massage.intensity === 'Deep' ? 'dalam' : massage.intensity === 'Firm' ? 'kuat' : massage.intensity === 'Variable' ? 'bervariasi' : 'sedang'} untuk jenis ini, tetapi dapat disesuaikan dengan kenyamanan Anda.</>
                                        ) : (
                                            <>Pressure is normally {massage.intensity.toLowerCase()} for this type, but can be adjusted to suit your comfort.</>
                                        )}
                                    </p>

                                    {/* Recommended for */}
                                    {massage.bestFor?.length > 0 && (
                                        <p className="text-xs text-gray-600 mb-3">
                                            <span className="font-semibold text-gray-800">
                                                {language === 'id' ? 'Direkomendasikan untuk: ' : 'Recommended for: '}
                                            </span>
                                            {massage.bestFor.slice(0, 4).join(', ')}
                                        </p>
                                    )}

                                    {/* Availability + price note in one info block */}
                                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 mb-3 space-y-1.5">
                                        {(() => {
                                            const { therapists: therapistCount, places: placeCount } = countOffers(massage.name);
                                            return (
                                                <p className="text-xs text-gray-700 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="inline-flex items-center gap-1">
                                                        <TherapistIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                                        {therapistCount} {language === 'id' ? 'terapis' : therapistCount === 1 ? 'therapist' : 'therapists'}
                                                    </span>
                                                    <span className="text-gray-300">·</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <BuildingIcon className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                                                        {placeCount} {language === 'id' ? 'tempat pijat' : placeCount === 1 ? 'massage place' : 'massage places'}
                                                    </span>
                                                </p>
                                            );
                                        })()}
                                        <p className="text-xs text-gray-600">
                                            {(() => {
                                                const range = getPriceRange(massage.name);
                                                if (range) {
                                                    const minStr = formatIdr(range.minIdr);
                                                    const maxStr = formatIdr(range.maxIdr);
                                                    return language === 'id' ? (
                                                        <>Harga bervariasi {minStr} – {maxStr} IDR tergantung lokasi</>
                                                    ) : (
                                                        <>Prices vary {minStr} – {maxStr} IDR depending on location</>
                                                    );
                                                }
                                                return language === 'id' ? (
                                                    <>Harga bervariasi tergantung lokasi</>
                                                ) : (
                                                    <>Prices vary depending on location</>
                                                );
                                            })()}
                                        </p>
                                    </div>

                                    {/* Read more – same dropdown as before */}
                                    {massage.fullDescription && (
                                        <button
                                            onClick={() => toggleExpanded(index)}
                                            className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors mb-3 flex items-center gap-1"
                                        >
                                            {massage.expanded ? `− ${t?.home?.readLess || 'Read Less'}` : `+ ${t?.home?.readMore || 'Read More'}`}
                                        </button>
                                    )}

                                    {massage.expanded && (
                                        <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 mb-1.5">{t?.home?.aboutMassage || 'About'} {massage.name}</h4>
                                                <p className="text-xs text-gray-600 leading-relaxed">
                                                    {massage.fullDescription}
                                                </p>
                                            </div>
                                            {massage.benefits?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{t?.home?.keyBenefits || 'Key Benefits'}</h4>
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
                                            {massage.bestFor?.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900 mb-1.5">{t?.home?.bestFor || 'Best For'}</h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {massage.bestFor.map((item, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* CTAs – app style orange primary */}
                                    <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                                        <button
                                            onClick={() => onFindTherapists?.(massage.name)}
                                            className="w-full py-2.5 px-4 font-semibold text-sm rounded-xl transition-all duration-200 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
                                        >
                                            {t?.home?.findTherapists || 'Find Therapists'}
                                        </button>
                                        <button
                                            onClick={() => onFindPlaces?.(massage.name)}
                                            className="w-full py-2 px-4 border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <BuildingIcon className="w-4 h-4 text-gray-500" />
                                            {t?.home?.findMassagePlaces || 'Find Massage Places'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
