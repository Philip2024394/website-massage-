import { useState, useMemo } from 'react';

interface GalleryImage {
    imageUrl: string;
    caption: string;
    description: string;
}

interface Service {
    name: string;
    duration: string;
    price: string;
}

interface Place {
    id?: string | number;
    $id?: string;
    name: string;
    description?: string;
    mainImage?: string;
    location: string;
    whatsappNumber?: string;
    email?: string;
    pricing?: any;
    operatingHours?: string;
    rating?: number;
    reviewCount?: number;
    massageTypes?: any;
    status?: string;
    isLive?: boolean;
    languages?: string[];
    galleryImages?: Array<{ imageUrl: string; caption: string }>;
    profilePicture?: string;
    isVerified?: boolean;
    verifiedAt?: string;
    activeMembershipDate?: string;
    additionalServices?: string[];
}

interface UseMassagePlaceProfileReturn {
    pricing: any;
    priceRange: string;
    services: Service[];
    amenities: string[];
    galleryImages: GalleryImage[];
    isFavorite: boolean;
    expandedImage: GalleryImage | null;
    setIsFavorite: (value: boolean) => void;
    setExpandedImage: (image: GalleryImage | null) => void;
    handleWhatsAppClick: () => void;
    handleCallClick: () => void;
}

/**
 * Custom hook for managing massage place profile data and interactions
 * @param place - The massage place data object
 * @returns Object containing processed data and handler functions
 */
export const useMassagePlaceProfile = (place: Place | null): UseMassagePlaceProfileReturn => {
    // State management
    const [expandedImage, setExpandedImage] = useState<GalleryImage | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);

    // Process pricing data
    const pricing = useMemo(() => {
        if (!place) return {};
        return typeof place.pricing === 'string' ? JSON.parse(place.pricing) : place.pricing || {};
    }, [place]);

    // Calculate price range
    const priceRange = useMemo(() => {
        const priceValues = Object.values(pricing).filter((p): p is number => typeof p === 'number');
        const lowestPrice = priceValues.length > 0 ? Math.min(...priceValues) : 0;
        const highestPrice = priceValues.length > 0 ? Math.max(...priceValues) : 0;
        
        return lowestPrice && highestPrice
            ? `IDR ${lowestPrice.toLocaleString('id-ID')} - ${highestPrice.toLocaleString('id-ID')}`
            : 'Contact for pricing';
    }, [pricing]);

    // Generate services list from pricing
    const services = useMemo((): Service[] => {
        return Object.entries(pricing).map(([duration, price]) => ({
            name: `Massage Session`,
            duration: `${duration} min`,
            price: `IDR ${(price as number).toLocaleString('id-ID')}`
        }));
    }, [pricing]);

    // Amenities - use place's additional services if available, otherwise use defaults
    const amenities = useMemo(() => {
        if (place?.additionalServices) {
            // Handle if additionalServices is a string (from Appwrite) - parse it
            if (typeof place.additionalServices === 'string') {
                try {
                    const parsed = JSON.parse(place.additionalServices);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed;
                    }
                } catch (_e) {
                    console.error('Error parsing additionalServices:', _e);
                }
            }
            // If it's already an array, use it
            if (Array.isArray(place.additionalServices) && place.additionalServices.length > 0) {
                return place.additionalServices;
            }
        }
        return [
            'Professional Therapists',
            'Clean Facility',
            'Comfortable Environment',
            'Quality Service'
        ];
    }, [place?.additionalServices]);

    // Gallery images - use place's gallery if available, otherwise use defaults
    const galleryImages = useMemo((): GalleryImage[] => {
        // If place has custom gallery images, use them
        if (place?.galleryImages && place.galleryImages.length > 0) {
            return place.galleryImages.map(img => ({
                imageUrl: img.imageUrl,
                caption: img.caption,
                description: img.caption // Use caption as description
            }));
        }
        
        // Otherwise use default fallback images
        const mainImage = place?.mainImage || 'https://ik.imagekit.io/7grri5v7d/balineese%20massage%20indonisea.png?updatedAt=1761918521382';
        
        return [
            {
                imageUrl: mainImage,
                caption: 'Main Treatment Area',
                description: `Experience professional massage therapy at ${place?.name || 'our facility'}`
            },
            {
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20rice%20fields.png?updatedAt=1761741529395',
                caption: 'Relaxation Room',
                description: 'Comfortable relaxation area for pre and post-treatment'
            },
            {
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea%20island.png?updatedAt=1761743048054',
                caption: 'Private Treatment Room',
                description: 'Spacious private rooms for your massage sessions'
            },
            {
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/indonisea%20bali%20paddie.png?updatedAt=1761742312003',
                caption: 'Spa Environment',
                description: 'Tranquil and serene environment for ultimate relaxation'
            },
            {
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/jimbaran%20indonisea.png?updatedAt=1761742702514',
                caption: 'Reception Area',
                description: 'Welcome to our professional spa facility'
            },
            {
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonsea.png?updatedAt=1761973275491',
                caption: 'Massage Therapy',
                description: 'Expert massage therapists providing quality service'
            }
        ];
    }, [place?.galleryImages, place?.mainImage, place?.name]);

    // Handler for WhatsApp click
    const handleWhatsAppClick = () => {
        const whatsappNumber = place?.whatsappNumber || '';
        if (whatsappNumber) {
            window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`, '_blank');
        }
    };

    // Handler for call click
    const handleCallClick = () => {
        const phoneNumber = place?.whatsappNumber || '';
        if (phoneNumber) {
            window.location.href = `tel:${phoneNumber}`;
        }
    };

    return {
        pricing,
        priceRange,
        services,
        amenities,
        galleryImages,
        isFavorite,
        expandedImage,
        setIsFavorite,
        setExpandedImage,
        handleWhatsAppClick,
        handleCallClick
    };
};
