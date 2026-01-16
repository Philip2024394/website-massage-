/**
 * TherapistProfileBase - Pure Presentation Component
 * 
 * ARCHITECTURE:
 * - NO data fetching
 * - NO authentication logic
 * - NO route parameter parsing
 * - NO early returns
 * - ONLY presentation
 * 
 * USAGE:
 * - TherapistProfilePage wraps this with auth + navigation
 * - SharedTherapistProfile wraps this with direct fetch + SEO
 */

import React, { Suspense } from 'react';
import TherapistCard from './TherapistCard';
import RotatingReviews from './RotatingReviews';
import SocialMediaLinks from './SocialMediaLinks';
import ShareActions from '../features/shared-profiles/ShareActions';
import SharedProfileImageGallery from './shared/SharedProfileImageGallery';
import type { Therapist, UserLocation } from '../types';
import { getHeroImageForTherapist, HERO_WELCOME_TEXT } from '../config/heroImages';

interface TherapistProfileBaseProps {
    // REQUIRED: Must be resolved BEFORE mounting this component
    therapist: Therapist;
    
    // UI mode
    mode: 'authenticated' | 'shared';
    
    // Optional features
    userLocation?: UserLocation | null;
    showHeader?: boolean;
    showSEOFooter?: boolean;
    
    // Callbacks (optional - may not exist in shared mode)
    onRate?: () => void;
    onQuickBookWithChat?: () => void;
    onChatWithBusyTherapist?: () => void;
    onShowRegisterPrompt?: () => void;
    onIncrementAnalytics?: (metric: string) => void;
    onNavigate?: (page: string, data?: any) => void;
    
    // Auth context (optional - only in authenticated mode)
    isCustomerLoggedIn?: boolean;
    loggedInProviderId?: number | string;
    
    // Translations
    t?: any;
    language?: 'en' | 'id' | 'gb';
}

/**
 * TherapistProfileBase Component
 * 
 * CRITICAL RULES:
 * 1. NEVER render without therapist
 * 2. NEVER fetch data
 * 3. NEVER parse URLs
 * 4. ONLY present what's given
 */
const TherapistProfileBase: React.FC<TherapistProfileBaseProps> = ({
    therapist,
    mode,
    userLocation,
    showHeader = false,
    showSEOFooter = false,
    onRate,
    onQuickBookWithChat,
    onChatWithBusyTherapist,
    onShowRegisterPrompt,
    onIncrementAnalytics,
    onNavigate,
    isCustomerLoggedIn = false,
    loggedInProviderId,
    t = {},
    language = 'id'
}) => {
    const realDiscount = (therapist.discountPercentage && therapist.discountPercentage > 0 && therapist.discountEndTime) ? {
        percentage: therapist.discountPercentage,
        expiresAt: new Date(therapist.discountEndTime)
    } : null;

    // Hero image logic - only for shared mode
    const therapistHeroImageUrl = mode === 'shared' ? 
        ((therapist as any).heroImageUrl || (therapist as any).mainImage || therapist.profileImage || (therapist as any).profilePicture) : null;
    const fallbackHeroImage = getHeroImageForTherapist(therapist.$id, (therapist.location || "a" as string));
    const heroImageRaw = therapistHeroImageUrl || fallbackHeroImage;
    
    const resolvedHeroImage = typeof heroImageRaw === "string" 
        ? heroImageRaw 
        : heroImageRaw?.url 
        ? heroImageRaw.url 
        : Array.isArray(heroImageRaw) && heroImageRaw[0]?.url 
        ? heroImageRaw[0].url 
        : fallbackHeroImage;
    
    const heroImage = resolvedHeroImage;
    const welcomeText = HERO_WELCOME_TEXT[language] || HERO_WELCOME_TEXT.id;
    
    // SEO-optimized image alt text
    const city = (therapist.location || "a" as string).split(' ')[0];
    const heroImageAlt = `Professional massage therapy in ${city} - ${therapist.name} - Terapis pijat panggilan ${city}`;
    
    // Replace {city} placeholder with actual location
    const heroTitle = welcomeText.title.replace('{city}', city);
    const heroSubtitle = welcomeText.subtitle.replace(/{city}/g, city);

    return (
        <div className="bg-white">
            {/* Hero Banner - Only in shared mode */}
            {mode === 'shared' && (
                <div className="w-full bg-white pt-0 pb-8 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="mb-2">
                            <img 
                                src={heroImage}
                                alt={heroImageAlt}
                                className="w-64 h-64 object-contain mx-auto"
                                loading="eager"
                                fetchPriority="high"
                            />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {heroTitle}
                            </h1>
                            <p className="text-base md:text-lg text-gray-700">
                                {heroSubtitle}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Therapist Card */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Avoid lazy loading for critical shared route reliability */}
                <TherapistCard
                    therapist={therapist}
                    userLocation={userLocation}
                    onRate={onRate || (() => {})}
                    onBook={() => {}}
                    onQuickBookWithChat={onQuickBookWithChat}
                    onChatWithBusyTherapist={onChatWithBusyTherapist}
                    onShowRegisterPrompt={onShowRegisterPrompt}
                    isCustomerLoggedIn={isCustomerLoggedIn}
                    onIncrementAnalytics={onIncrementAnalytics || (() => {})}
                    loggedInProviderId={loggedInProviderId}
                    onNavigate={onNavigate}
                    activeDiscount={realDiscount}
                    t={t}
                    hideJoinButton={mode === 'shared'}
                />

                {/* Random Image Gallery - Only in shared mode */}
                {mode === 'shared' && (
                    <SharedProfileImageGallery 
                        therapistName={therapist.name}
                        count={4}
                    />
                )}

                {/* Rotating Reviews Section */}
                <div className="mt-8">
                    <RotatingReviews 
                        location={therapist.location || ("a" as string)} 
                        limit={5}
                        providerId={(therapist as any).id || (therapist as any).$id}
                        providerName={(therapist as any).name}
                        providerType={'therapist'}
                        providerImage={(therapist as any).profilePicture || (therapist as any).mainImage}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>

                {/* Share Actions: Copy link + share buttons */}
                <div className="mt-6">
                    <ShareActions therapist={therapist} />
                </div>
            </div>
        </div>
    );
};

export default TherapistProfileBase;



