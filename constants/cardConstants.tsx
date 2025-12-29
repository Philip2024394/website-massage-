import React from 'react';
import type { Place } from '../types';
import { generatePlaceSlug } from '../utils/seoSlugGenerator';

/**
 * Constants extracted from MassagePlaceCard and FacialPlaceCard components
 * for code reuse and reduced file sizes.
 */

// Star icon component used in rating displays
export const StarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20">
        <path fill="currentColor" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

// CSS animations for discount effects
export const discountStyles = `
@keyframes discountFade {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
@keyframes priceRimFade {
    0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.6); }
    50% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
}`;

// Helper function to check if discount is active and not expired
export const isDiscountActive = (place: Place): boolean => {
    const placeData = place as any;
    return (
        placeData.isDiscountActive && 
        placeData.discountPercentage && 
        placeData.discountPercentage > 0 &&
        placeData.discountEndTime && 
        new Date(placeData.discountEndTime) > new Date()
    );
};

// Helper function for dynamic spacing based on description length
export const getDynamicSpacing = (longDesc: string, mediumDesc: string, shortDesc: string) => {
    // This is a simple implementation - you can customize based on actual description length
    return shortDesc; // Default to short spacing for massage places
};

// Helper function to generate shareable URL for places
export const generatePlaceShareableURL = (place: Place, baseUrl?: string): string => {
    const origin = (() => {
        const preferred = baseUrl || (typeof window !== 'undefined' ? window.location.origin : undefined);
        if (!preferred) return 'https://www.indastreetmassage.com';
        const lower = preferred.toLowerCase();
        const isLocal = lower.includes('localhost') || lower.includes('127.0.0.1') || /:\d{2,5}$/.test(lower);
        return isLocal ? 'https://www.indastreetmassage.com' : preferred;
    })();

    const slug = generatePlaceSlug(place);
    const placeId = (place as any).id ?? (place as any).$id ?? '';
    const pathSegment = placeId ? `${placeId}-${slug}` : slug;
    return `${origin}/massage-place-profile/${pathSegment}`;
};
