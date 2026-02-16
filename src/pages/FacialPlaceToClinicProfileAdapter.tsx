/**
 * Adapter: maps Appwrite Place (facial_places) to FacialClinic shape
 * so the facial card view profile diverts to the new Facial Skin Clinic page.
 */
import React, { useMemo } from 'react';
import FacialClinicProfilePage from './FacialClinicProfilePage';
import { parsePricing, parseMassageTypes } from '../utils/appwriteHelpers';

type Place = {
    id?: string | number;
    $id?: string;
    name: string;
    description?: string;
    mainImage?: string;
    profilePicture?: string;
    galleryImages?: Array<{ imageUrl: string; caption?: string; header?: string; description?: string }>;
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
}

const DEFAULT_HERO = 'https://ik.imagekit.io/7grri5v7d/facial%202.png?updatedAt=1761918521382';

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

    const treatments = facialTypeNames.length > 0
        ? facialTypeNames.map((name, i) => ({
            id: `t-${i}-${(p.$id || p.id || '').toString()}`,
            name,
            description: `${name} – professional facial treatment.`,
            image: (p.galleryImages && p.galleryImages[0]?.imageUrl) || p.mainImage || p.profilePicture || DEFAULT_HERO,
            prices: { min60: price60, min90: price90, min120: price120 },
            category: 'treatment',
            popular: i < 2,
        }))
        : [{
            id: 't-default',
            name: 'Facial treatment',
            description: 'Professional facial and skin care.',
            image: p.mainImage || p.profilePicture || DEFAULT_HERO,
            prices: { min60: price60, min90: price90, min120: price120 },
            category: 'treatment',
            popular: true,
        }];

    const gallery = (p.galleryImages || []).slice(0, 12).map((item, i) => ({
        id: `g-${i}`,
        url: item.imageUrl || '',
        caption: item.caption || item.header || item.description || '',
        category: 'interior' as const,
    }));
    if (gallery.length === 0 && (p.mainImage || p.profilePicture)) {
        gallery.push({
            id: 'g-hero',
            url: p.mainImage || p.profilePicture || DEFAULT_HERO,
            caption: p.name,
            category: 'interior',
        });
    }

    return {
        id: String(p.$id ?? p.id ?? ''),
        name: p.name || 'Facial & Skin Clinic',
        tagline: p.description?.slice(0, 80) || 'Premium facial and skin care.',
        description: p.description || 'Professional facial treatments and skin care in a relaxing environment.',
        heroImage: p.mainImage || p.profilePicture || DEFAULT_HERO,
        logo: p.profilePicture || p.mainImage || DEFAULT_HERO,
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
}) => {
    const resolvedPlace = useMemo(() => {
        if (placeProp) return placeProp;
        if (placeId && facialPlaces.length) {
            return facialPlaces.find((p: any) => (p.$id || p.id || '').toString() === placeId) || null;
        }
        return null;
    }, [placeProp, placeId, facialPlaces]);

    const clinic = useMemo(() => placeToClinic(resolvedPlace), [resolvedPlace]);

    if (!clinic) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Clinic not found.</p>
                <button type="button" onClick={onBack} className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-lg">Back</button>
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
        />
    );
};

export default FacialPlaceToClinicProfileAdapter;
