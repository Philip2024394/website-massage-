/**
 * Adapter: maps Appwrite Place (facial_places) to FacialClinic shape
 * so the facial card view profile diverts to the new Facial Skin Clinic page.
 * When place is missing (e.g. direct URL or refresh), fetches by placeId from Appwrite.
 */
import React, { useMemo, useState, useEffect } from 'react';
import FacialClinicProfilePage from './FacialClinicProfilePage';
import { parsePricing, parseMassageTypes } from '../utils/appwriteHelpers';
import { facialPlaceService } from '../lib/appwrite/services/facial.service';

type Place = {
    id?: string | number;
    $id?: string;
    name: string;
    description?: string;
    mainImage?: string;
    profilePicture?: string;
    galleryImages?: Array<{ imageUrl: string; caption?: string; header?: string; description?: string }>;
    /** Max 5: licenses or certs for service – dashboard can add; each has imageUrl, header, description */
    licenseCertImages?: Array<{ imageUrl: string; header?: string; description?: string }>;
    location?: string;
    address?: string;
    city?: string;
    whatsappNumber?: string;
    contactNumber?: string;
    price60?: number | string;
    price90?: number | string;
    price120?: number | string;
    pricing?: string | Record<string, number>;
    operatingHours?: string;
    openingTime?: string;
    closingTime?: string;
    rating?: number;
    reviewCount?: number;
    facialTypes?: string | string[];
    facialServices?: string | string[];
    amenities?: string[];
    certifications?: string[];
    discountPercentage?: number;
    discountEndTime?: string;
    [key: string]: any;
};

export interface FacialPlaceToClinicAdapterProps {
    place: Place | null;
    placeId?: string;
    facialPlaces?: Place[];
    onBack: () => void;
    onBook?: () => void;
    onNavigate?: (page: string) => void;
    therapists?: any[];
    places?: any[];
    userLocation?: { lat: number; lng: number; address?: string } | null;
    language?: string;
    onLanguageChange?: (lang: string) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onFacialPortalClick?: () => void;
    onFacialPlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
}

const DEFAULT_HERO = 'https://ik.imagekit.io/7grri5v7d/antic%20aging.png?updatedAt=1764966155682';

function placeToClinic(place: Place | null): ReturnType<typeof buildClinic> | null {
    if (!place) return null;
    return buildClinic(place);
}

function buildClinic(p: Place) {
    const pricing = parsePricing(p.pricing);
    const price60 = Number(p.price60 ?? pricing['60'] ?? 0);
    const price90 = Number(p.price90 ?? pricing['90'] ?? 0);
    const price120 = Number(p.price120 ?? pricing['120'] ?? 0);
    const facialTypeNames = parseMassageTypes(p.facialTypes);
    const hours = p.operatingHours || (p.openingTime && p.closingTime ? `${p.openingTime} - ${p.closingTime}` : '') || '09:00 - 21:00';
    const mainImageUrl = (p.mainImage || p.profilePicture || '').trim() || DEFAULT_HERO;

    const treatments = facialTypeNames.length > 0
        ? facialTypeNames.map((name, i) => ({
            id: `t-${i}-${(p.$id || p.id || '').toString()}`,
            name,
            description: `${name} – professional facial treatment.`,
            image: (p.galleryImages && p.galleryImages[0]?.imageUrl) || mainImageUrl,
            prices: { min60: price60, min90: price90, min120: price120 },
            category: 'treatment',
            popular: i < 2,
        }))
        : [{
            id: 't-default',
            name: 'Facial treatment',
            description: 'Professional facial and skin care.',
            image: mainImageUrl,
            prices: { min60: price60, min90: price90, min120: price120 },
            category: 'treatment',
            popular: true,
        }];

    const gallery = (p.galleryImages || []).slice(0, 12).map((item, i) => ({
        id: `g-${i}`,
        url: (item.imageUrl || '').trim() || mainImageUrl,
        caption: item.caption || item.header || item.description || '',
        category: 'interior' as const,
    }));
    if (gallery.length === 0) {
        gallery.push({
            id: 'g-hero',
            url: mainImageUrl,
            caption: p.name,
            category: 'interior',
        });
    }

    const clinicInfoPhotos = (p.galleryImages || []).slice(0, 5).map((img) => ({
        imageUrl: (img.imageUrl || '').trim() || mainImageUrl,
        header: img.header || 'Clinic photo',
        description: img.description || img.caption || '',
    }));

    const licenseCertImages = (p.licenseCertImages || (p as any).licenseImages || (p as any).certificationImages || []).slice(0, 5).map((img: any) => ({
        imageUrl: (img.imageUrl || img.url || '').trim() || mainImageUrl,
        header: img.header || img.title || 'License / Certification',
        description: img.description || img.details || img.caption || '',
    }));

    return {
        id: String(p.$id ?? p.id ?? ''),
        name: p.name || 'Facial & Skin Clinic',
        tagline: p.description?.slice(0, 80) || 'Premium facial and skin care.',
        description: p.description || 'Professional facial treatments and skin care in a relaxing environment.',
        heroImage: mainImageUrl,
        logo: mainImageUrl,
        location: p.location || p.address || p.city || '',
        address: p.address || p.location || '',
        phone: (p.contactNumber as string) || (p.whatsappNumber as string) || '',
        whatsapp: (p.whatsappNumber as string) || (p.contactNumber as string) || '',
        email: (p as any).email || '',
        website: (p as any).websiteurl || (p as any).website || undefined,
        rating: Number(p.rating) || 4.8,
        reviewCount: Number(p.reviewCount) || 0,
        totalTreatments: 0,
        yearsInBusiness: 0,
        certifications: Array.isArray(p.certifications) ? p.certifications : [],
        operatingHours: { weekdays: hours, weekend: hours },
        treatments,
        team: [],
        gallery,
        clinicInfoPhotos: clinicInfoPhotos.length > 0 ? clinicInfoPhotos : undefined,
        licenseCertImages: licenseCertImages.length > 0 ? licenseCertImages : undefined,
        bookingsCount: (p as any).bookingsCount ?? (() => {
            try {
                const a = (p as any).analytics;
                if (a && typeof a === 'object' && typeof (a as any).bookings === 'number') return (a as any).bookings;
                if (typeof a === 'string') { const parsed = JSON.parse(a); return parsed?.bookings ?? 0; }
            } catch (_) {}
            return 0;
        })(),
        amenities: Array.isArray(p.amenities) ? p.amenities : [],
        specialOffers: (p.discountPercentage && p.discountPercentage > 0)
            ? {
                title: 'Special offer',
                description: `${p.discountPercentage}% off.`,
                discount: p.discountPercentage,
                validUntil: p.discountEndTime || '',
            }
            : undefined,
    };
}

const FacialPlaceToClinicProfileAdapter: React.FC<FacialPlaceToClinicAdapterProps> = ({
    place: placeProp,
    placeId,
    facialPlaces = [],
    onBack,
    onBook,
    onNavigate,
    therapists = [],
    places = [],
    userLocation,
    language = 'id',
    onLanguageChange,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onFacialPortalClick,
    onFacialPlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
}) => {
    const [fetchedPlace, setFetchedPlace] = useState<Place | null>(null);
    const [fetchLoading, setFetchLoading] = useState(false);

    const resolvedFromList = useMemo(() => {
        if (placeId && facialPlaces.length)
            return facialPlaces.find((p: any) => (p.$id || p.id || '').toString() === placeId) || null;
        return null;
    }, [placeId, facialPlaces]);

    const resolvedPlace = placeProp || resolvedFromList || fetchedPlace;

    useEffect(() => {
        if (placeProp || resolvedFromList || !placeId) return;
        setFetchedPlace(null);
        setFetchLoading(true);
        facialPlaceService.getByProviderId(placeId)
            .then((p) => { setFetchedPlace(p); })
            .catch(() => { setFetchedPlace(null); })
            .finally(() => { setFetchLoading(false); });
    }, [placeId, placeProp, resolvedFromList]);

    const clinic = useMemo(() => placeToClinic(resolvedPlace), [resolvedPlace]);

    if (fetchLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading clinic...</p>
            </div>
        );
    }

    if (!clinic) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Clinic not found.</p>
                <button type="button" onClick={onBack} className="ml-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600">Back</button>
            </div>
        );
    }

    const handleBookTreatment = (_treatment?: unknown) => {
        if (onBook) onBook();
    };

    return (
        <FacialClinicProfilePage
            clinic={clinic}
            onBack={onBack}
            onBook={handleBookTreatment}
            onNavigate={onNavigate}
            therapists={therapists}
            places={places}
            userLocation={userLocation}
            language={language}
            onLanguageChange={onLanguageChange}
            onMassageJobsClick={onMassageJobsClick}
            onHotelPortalClick={onHotelPortalClick}
            onVillaPortalClick={onVillaPortalClick}
            onTherapistPortalClick={onTherapistPortalClick}
            onMassagePlacePortalClick={onMassagePlacePortalClick}
            onFacialPortalClick={onFacialPortalClick ?? onFacialPlacePortalClick}
            onAgentPortalClick={onAgentPortalClick}
            onCustomerPortalClick={onCustomerPortalClick}
            onAdminPortalClick={onAdminPortalClick}
            onTermsClick={onTermsClick}
            onPrivacyClick={onPrivacyClick}
        />
    );
};

export default FacialPlaceToClinicProfileAdapter;
