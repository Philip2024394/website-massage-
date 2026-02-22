/**
 * Facial / Skin Clinic Profile Page – Matches therapist profile design
 * Connected to Appwrite facial_places collection and facial places dashboard.
 * Up to 5 gallery thumbnails with header + description per item (saved in galleryImages).
 */
const MAX_GALLERY_ITEMS = 5;

import React, { useState, useMemo, useEffect } from 'react';
import {
    Clock, MapPin, Phone, Star, CheckCircle, X, Calendar, MessageCircle,
    ChevronLeft, ChevronRight, Sparkles
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import { PricesButton } from '../components/PricesButton';
import UniversalHeader from '../components/shared/UniversalHeader';
import { VERIFIED_BADGE_IMAGE_URL, APP_CONSTANTS } from '../constants/appConstants';
import { parsePricing, parseMassageTypes } from '../utils/appwriteHelpers';
import { getBookingWhatsAppNumber, buildWhatsAppUrl } from '../utils/whatsappBookingMessages';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface Place {
    id?: string | number;
    $id?: string;
    name: string;
    description?: string;
    mainImage?: string;
    profilePicture?: string;
    images?: string[];
    location?: string;
    address?: string;
    whatsappNumber?: string;
    email?: string;
    price60?: number | string;
    price90?: number | string;
    price120?: number | string;
    pricing?: string | Record<string, number>;
    operatingHours?: string;
    rating?: number;
    reviewCount?: number;
    facialTypes?: string | string[];
    facialServices?: string | string[];
    status?: string;
    isVerified?: boolean;
    languages?: string[] | string;
    galleryImages?: Array<{ imageUrl: string; caption?: string; header?: string; description?: string }>;
    discountPercentage?: number;
    discountEndTime?: string;
    amenities?: string[];
    certifications?: string[];
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    ktpPhotoUrl?: string;
    [key: string]: any;
}

interface FacialPlaceProfilePageNewProps {
    place: Place | null;
    placeId?: string; // When place is null, fetch by ID from Appwrite (e.g. direct URL / shared link)
    facialPlaces?: Place[]; // Fallback: resolve from list when placeId in URL
    onBack: () => void;
    onBook?: () => void;
    onQuickBookWithChat?: () => void;
    userLocation?: { lat: number; lng: number } | null;
    loggedInCustomer?: any;
    language?: 'en' | 'id';
    onLanguageChange?: (lang: string) => void;
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onFacialPlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const DEFAULT_GALLERY = [
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Our Space', description: 'A welcoming environment for premium facial and skin treatments.' },
    { imageUrl: 'https://ik.imagekit.io/7grri5v7d/facial%202.png', header: 'Treatment Room', description: 'Clean, professional setup for your comfort and safety.' },
];

const FacialPlaceProfilePageNew: React.FC<FacialPlaceProfilePageNewProps> = ({
    place: placeProp,
    placeId,
    facialPlaces = [],
    onBack,
    onBook,
    onQuickBookWithChat,
    onNavigate,
    onMassageJobsClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onFacialPlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
    language = 'en',
    onLanguageChange
}) => {
    const [place, setPlace] = useState<Place | null>(placeProp);
    const [loading, setLoading] = useState(!placeProp && !!(placeId || (typeof window !== 'undefined' && window.location.pathname.match(/\/profile\/facial\/([^/]+)/))));
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<{ imageUrl: string; caption?: string; header?: string; description?: string } | null>(null);
    const [showPriceModal, setShowPriceModal] = useState(false);

    // Sync when prop place is provided
    useEffect(() => {
        if (placeProp) {
            setPlace(placeProp);
            setLoading(false);
        }
    }, [placeProp]);

    // When no place but we have placeId or URL id, fetch from facialPlaces or Appwrite
    useEffect(() => {
        if (place || !loading) return;
        const idFromUrl = typeof window !== 'undefined' && window.location.pathname.match(/\/profile\/facial\/([^/-]+)/);
        const id = placeId || (idFromUrl && idFromUrl[1]);
        if (!id) {
            setLoading(false);
            return;
        }
        const fromList = facialPlaces.find((p: any) => (p.$id || p.id || '').toString() === id);
        if (fromList) {
            setPlace(fromList);
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const { facialPlaceService } = await import('../lib/services/facialPlaceService');
                const fetched = await facialPlaceService.getById(id);
                if (!cancelled && fetched) setPlace(fetched);
            } catch (_) {
                if (!cancelled) setPlace(null);
            }
            if (!cancelled) setLoading(false);
        })();
        return () => { cancelled = true; };
    }, [placeId, facialPlaces, place, loading]);

    const rawPricing = place?.pricing ?? (place ? { 60: place.price60, 90: place.price90, 120: place.price120 } : {});
    const pricing = useMemo(() => {
        const p = parsePricing(typeof rawPricing === 'string' ? rawPricing : null);
        if (typeof rawPricing === 'object' && rawPricing !== null) {
            return {
                '60': Number((rawPricing as any)['60'] ?? (rawPricing as any).price60 ?? place.price60) || p['60'],
                '90': Number((rawPricing as any)['90'] ?? (rawPricing as any).price90 ?? place.price90) || p['90'],
                '120': Number((rawPricing as any)['120'] ?? (rawPricing as any).price120 ?? place.price120) || p['120'],
            };
        }
        return { '60': p['60'], '90': p['90'], '120': p['120'] };
    }, [rawPricing, place?.price60, place?.price90, place?.price120]);

    const hasPricing = pricing['60'] > 0 || pricing['90'] > 0 || pricing['120'] > 0;
    const heroImages = useMemo(() => {
        if (!place) return ['https://ik.imagekit.io/7grri5v7d/facial%202.png'];
        const list: string[] = [];
        if (place.mainImage) list.push(place.mainImage);
        if (place.profilePicture && place.profilePicture !== place.mainImage) list.push(place.profilePicture);
        if (Array.isArray(place.images)) place.images.forEach((url: string) => url && list.push(url));
        if (list.length === 0) list.push('https://ik.imagekit.io/7grri5v7d/facial%202.png');
        return list;
    }, [place?.mainImage, place?.profilePicture, place?.images, place]);

    const galleryBlocks = useMemo(() => {
        if (!place) return [];
        const raw = place.galleryImages;
        if (Array.isArray(raw) && raw.length > 0) {
            return raw.slice(0, MAX_GALLERY_ITEMS).map((item: any) => ({
                imageUrl: item.imageUrl || item.url,
                header: item.header || item.caption || item.title || 'Gallery',
                description: item.description || item.caption || '',
            }));
        }
        return DEFAULT_GALLERY.slice(0, MAX_GALLERY_ITEMS).map((d, i) => ({
            ...d,
            header: d.header + (i > 0 ? ` ${i + 1}` : ''),
        }));
    }, [place?.galleryImages, place]);

    const facialTypesList = useMemo(() => {
        if (!place) return [];
        const parsed = parseMassageTypes(place.facialTypes);
        return Array.isArray(parsed) ? parsed : [];
    }, [place?.facialTypes, place]);

    const otherServices = useMemo(() => {
        if (!place) return ['Consultation', 'Skin Analysis', 'Aftercare'];
        const amen = place.amenities;
        if (Array.isArray(amen) && amen.length > 0) return amen;
        return ['Consultation', 'Skin Analysis', 'Aftercare'];
    }, [place?.amenities, place]);

    const hasBankAndKtp = !!(place?.bankName && place?.accountName && place?.accountNumber && place?.ktpPhotoUrl);
    const rating = Number(place?.rating) || 4.8;
    const reviewCount = Number(place?.reviewCount) || 0;
    const verified = !!(place?.isVerified || place?.verifiedBadge || (place?.bankName && place?.ktpPhotoUrl));

    const formatPrice = (n: number) => {
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return String(n);
    };

    const adminNumber = APP_CONSTANTS.DEFAULT_CONTACT_NUMBER ?? '';
    const bookingPhone = place ? getBookingWhatsAppNumber(
        { country: (place as any).country, countryCode: (place as any).countryCode, whatsappNumber: place.whatsappNumber, contactNumber: place.whatsappNumber },
        adminNumber
    ) : '';

    const handleBookNow = () => {
        if (!place) return;
        if (onQuickBookWithChat) {
            onQuickBookWithChat();
        } else if (onBook) {
            onBook();
        } else if (bookingPhone) {
            const msg = `Hi! I'd like to book a treatment at ${place.name}. When are you available?`;
            window.open(buildWhatsAppUrl(bookingPhone, msg) || `https://wa.me/${bookingPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        }
    };

    const handleSchedule = () => {
        if (!place) return;
        if (hasBankAndKtp && onQuickBookWithChat) {
            onQuickBookWithChat();
        } else if (bookingPhone) {
            const msg = `Hi! I'd like to schedule a treatment at ${place.name}. What times do you have?`;
            window.open(buildWhatsAppUrl(bookingPhone, msg) || `https://wa.me/${bookingPhone}?text=${encodeURIComponent(msg)}`, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Loading clinic profile...</p>
                </div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-6 max-w-sm text-center">
                    <p className="text-gray-700 mb-4">Clinic not found.</p>
                    <button type="button" onClick={onBack} className="px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600">Go back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-slate-50">
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={onBack}
                showHomeButton
            />

            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={onNavigate}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onVillaPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onNavigate ? () => onNavigate('place-signup') : undefined}
                    onFacialPortalClick={onFacialPlacePortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    therapists={therapists}
                    places={places}
                    language={language}
                />
            </React19SafeWrapper>

            <div className="pt-[60px] max-w-4xl mx-auto pb-28">
                {/* Hero slider */}
                <div className="relative h-56 sm:h-64 overflow-hidden rounded-b-2xl bg-slate-200 border-t-4 border-t-amber-400">
                    {heroImages.map((src, i) => (
                        <div
                            key={i}
                            className="absolute inset-0 transition-opacity duration-300"
                            style={{ opacity: heroIndex === i ? 1 : 0 }}
                        >
                            <img src={src} alt={`${place.name} ${i + 1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                    {heroImages.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => setHeroIndex((prev) => (prev === 0 ? heroImages.length - 1 : prev - 1))}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-800" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setHeroIndex((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
                            >
                                <ChevronRight className="w-5 h-5 text-slate-800" />
                            </button>
                            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                                {heroImages.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setHeroIndex(i)}
                                        className={`w-2 h-2 rounded-full transition-colors ${heroIndex === i ? 'bg-amber-500' : 'bg-white/70'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Name, rating, verified + focus note (facial treatment massage / skin clinic) */}
                <div className="px-4 -mt-8 relative z-10">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-4">
                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {verified && (
                                        <img src={VERIFIED_BADGE_IMAGE_URL} alt="Verified" className="w-6 h-6 flex-shrink-0" />
                                    )}
                                    <h1 className="text-xl font-bold text-slate-900 uppercase truncate">{place.name}</h1>
                                </div>
                                <p className="text-xs text-amber-600 font-medium mt-1.5">
                                    {language === 'id' ? 'Fokus: Facial treatment massage & perawatan kulit' : 'Our focus: Facial treatment massage & skin care'}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-sm">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                                        <span className="font-semibold text-slate-800">{rating.toFixed(1)}</span>
                                        <span className="text-slate-500">({reviewCount})</span>
                                    </div>
                                    {place.status && (
                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                                            {String(place.status)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Clinic photos – home service (team, treatments, equipment); click to open lightbox */}
                {(heroImages.length > 0 || galleryBlocks.length > 0) && (
                    <section className="mt-4 px-4">
                        <h2 className="text-sm font-semibold text-slate-700 mb-1">
                            {language === 'id' ? 'Foto klinik' : 'Clinic photos'}
                        </h2>
                        <p className="text-xs text-slate-500 mb-2">
                            {language === 'id' ? 'Layanan ke rumah – tim & perawatan kami' : 'Home service – our team & treatments'}
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            {heroImages.map((src, i) => (
                                <button
                                    key={`hero-${i}`}
                                    type="button"
                                    onClick={() => setSelectedImage({ imageUrl: src, header: place.name, description: '' })}
                                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 focus:border-amber-400"
                                >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                            {galleryBlocks.map((block, index) => (
                                <button
                                    key={`gallery-${index}`}
                                    type="button"
                                    onClick={() => setSelectedImage(block)}
                                    className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 focus:border-amber-400"
                                >
                                    <img src={block.imageUrl} alt={block.header} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Gallery blocks – clinic photos with captions (home service: team, treatments, equipment) */}
                <section className="mt-6 px-4 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        {language === 'id' ? 'Galeri foto klinik' : 'Clinic photos'}
                    </h2>
                    <p className="text-xs text-slate-500 -mt-1">
                        {language === 'id' ? 'Layanan facial ke rumah – tim dan perawatan' : 'Home service facial – our team & treatments'}
                    </p>
                    {galleryBlocks.map((block, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden"
                        >
                            <button
                                type="button"
                                onClick={() => setSelectedImage(block)}
                                className="block w-full aspect-[4/3] overflow-hidden"
                            >
                                <img
                                    src={block.imageUrl}
                                    alt={block.header}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 text-base mb-2">{block.header}</h3>
                                {block.description ? (
                                    <p className="text-slate-600 text-sm leading-relaxed">{block.description}</p>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </section>

                {/* Facial treatment types (main menu – facial treatment massage focus) */}
                <section className="mt-8 px-4">
                    <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">
                            {language === 'id' ? 'Jenis Perawatan Facial' : 'Facial Treatment Types'}
                        </h2>
                        <p className="text-xs text-gray-600 mb-3 font-medium">
                            {language === 'id' ? 'Facial treatment massage & perawatan kulit' : 'Facial treatment massage & skin care'}
                        </p>
                        {facialTypesList.length > 0 ? (
                            <ul className="space-y-2">
                                {facialTypesList.map((name, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-800">
                                        <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                        <span className="text-sm font-medium text-gray-900">{name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-800 text-sm font-medium">
                                {language === 'id' ? 'Berbagai layanan facial dan perawatan kulit.' : 'Various facial and skin care services.'}
                            </p>
                        )}
                    </div>
                </section>

                {/* Other services */}
                <section className="mt-6 px-4">
                    <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-4">
                        <h2 className="text-lg font-bold text-gray-900 mb-3">
                            {language === 'id' ? 'Layanan Lainnya' : 'Other Services'}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {otherServices.map((s, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-slate-200 text-gray-900 rounded-full text-sm font-semibold"
                                >
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing 60/90/120 – treatment packages */}
                {hasPricing && (
                    <section className="mt-6 px-4">
                        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">
                                {language === 'id' ? 'Harga perawatan' : 'Treatment pricing'}
                            </h2>
                            <div className="grid grid-cols-3 gap-2">
                                {pricing['60'] > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPriceModal(true)}
                                        className="p-3 rounded-xl border-2 border-slate-300 bg-slate-100 hover:border-orange-400 hover:bg-orange-50 transition-colors text-center"
                                    >
                                        <p className="text-xs text-gray-700 font-semibold">60 min</p>
                                        <p className="text-base font-bold text-gray-900 mt-1">IDR {formatPrice(pricing['60'])}</p>
                                    </button>
                                )}
                                {pricing['90'] > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPriceModal(true)}
                                        className="p-3 rounded-xl border-2 border-orange-400 bg-orange-100 text-center"
                                    >
                                        <p className="text-xs text-orange-800 font-semibold">90 min</p>
                                        <p className="text-base font-bold text-orange-900 mt-1">IDR {formatPrice(pricing['90'])}</p>
                                    </button>
                                )}
                                {pricing['120'] > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPriceModal(true)}
                                        className="p-3 rounded-xl border-2 border-slate-300 bg-slate-100 hover:border-orange-400 hover:bg-orange-50 transition-colors text-center"
                                    >
                                        <p className="text-xs text-gray-700 font-semibold">120 min</p>
                                        <p className="text-base font-bold text-gray-900 mt-1">IDR {formatPrice(pricing['120'])}</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {/* Description */}
                {place.description && (
                    <section className="mt-6 px-4">
                        <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-4">
                            <h2 className="text-lg font-bold text-gray-900 mb-2">
                                {language === 'id' ? 'Tentang' : 'About'}
                            </h2>
                            <p className="text-gray-800 text-sm leading-relaxed font-medium">{place.description}</p>
                        </div>
                    </section>
                )}

                {/* Location & contact */}
                <section className="mt-6 px-4">
                    <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-4 space-y-3">
                        {(place.location || place.address) && (
                            <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-800 font-medium">{place.location || place.address}</span>
                            </div>
                        )}
                        {place.operatingHours && (
                            <div className="flex items-start gap-2 text-sm">
                                <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-800 font-medium">{place.operatingHours}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Book Now | Schedule | Prices – same as therapist */}
                <div className="mt-6 px-4 flex gap-2">
                    <button
                        type="button"
                        onClick={handleBookNow}
                        className="flex-1 flex items-center justify-center gap-2 font-bold py-3 px-2 rounded-full bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-md min-h-[48px]"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Book</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleSchedule}
                        disabled={!hasBankAndKtp}
                        title={!hasBankAndKtp ? (language === 'id' ? 'Jadwal butuh verifikasi klinik' : 'Schedule requires clinic verification') : undefined}
                        className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 px-2 rounded-full min-h-[48px] shadow-md ${
                            hasBankAndKtp
                                ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-95'
                                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Schedule</span>
                    </button>
                    <PricesButton
                        onClick={() => setShowPriceModal(true)}
                        className="flex-1 flex items-center justify-center min-h-[48px] py-3 px-2 rounded-full shadow-md"
                        ariaLabel="Prices"
                    />
                </div>
            </div>

            {/* Fixed bottom bar: WhatsApp + Book Now */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg p-4 safe-area-padding">
                <div className="max-w-4xl mx-auto flex gap-2">
                    {bookingPhone && (
                        <a
                            href={buildWhatsAppUrl(bookingPhone, `Hi! I'd like to inquire about ${place.name}`) || `https://wa.me/${bookingPhone}?text=${encodeURIComponent(`Hi! I'd like to inquire about ${place.name}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold text-center hover:bg-green-600 flex items-center justify-center gap-2"
                        >
                            <Phone className="w-5 h-5" />
                            WhatsApp
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={handleBookNow}
                        className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 flex items-center justify-center gap-2"
                    >
                        <Calendar className="w-5 h-5" />
                        {language === 'id' ? 'Pesan Sekarang' : 'Book Now'}
                    </button>
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                    <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.header || selectedImage.caption || 'Gallery'}
                            className="w-full h-auto rounded-xl"
                        />
                        {(selectedImage.header || selectedImage.description) && (
                            <div className="mt-4 text-white text-center">
                                {selectedImage.header && <p className="font-bold text-lg">{selectedImage.header}</p>}
                                {selectedImage.description && <p className="text-sm mt-1 opacity-90">{selectedImage.description}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Price modal */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowPriceModal(false)}>
                    <div
                        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-slate-900 mb-4">{place.name} – Pricing</h3>
                        <div className="space-y-3">
                            {pricing['60'] > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">60 min</span>
                                    <span className="font-bold text-slate-900">IDR {formatPrice(pricing['60'])}</span>
                                </div>
                            )}
                            {pricing['90'] > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">90 min</span>
                                    <span className="font-bold text-slate-900">IDR {formatPrice(pricing['90'])}</span>
                                </div>
                            )}
                            {pricing['120'] > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">120 min</span>
                                    <span className="font-bold text-slate-900">IDR {formatPrice(pricing['120'])}</span>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPriceModal(false)}
                            className="mt-4 w-full py-2.5 bg-slate-200 text-slate-800 rounded-xl font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacialPlaceProfilePageNew;
