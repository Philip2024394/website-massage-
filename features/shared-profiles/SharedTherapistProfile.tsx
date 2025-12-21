/**
 * Shared Therapist Profile Page
 * Clean, simple, guaranteed to work
 * Replaces the complex SharedTherapistProfilePage.tsx
 */

import React, { useEffect } from 'react';
import { SharedProfileLayout } from './SharedProfileLayout';
import { useSharedProfile } from './hooks/useSharedProfile';
import TherapistCard from '../../components/TherapistCard';
import type { Therapist, UserLocation } from '../../types';
import { generateTherapistShareURL, generateShareText } from './utils/shareUrlBuilder';
import { analyticsService } from '../../services/analyticsService';
import { PREVIEW_IMAGES } from '../../config/previewImages';

// 📱 WHATSAPP PREVIEW TEXT CUSTOMIZATION
// Edit these templates to change how your links appear in WhatsApp
const PREVIEW_TEMPLATES = {
    title: (name: string, city: string) => `${name} • ${city} Massage Therapist`,
    description: (name: string, city: string) => `🌿 Professional massage by ${name} • ${city} ⭐ Verified & Trusted 💬 Instant Booking 🔒 Secure Payment 📱 Book Now!`,
    // Alternative templates (uncomment to use):
    // title: (name: string, city: string) => `Book ${name} - Premium Massage in ${city}`,
    // description: (name: string, city: string) => `⭐ ${name} offers authentic Balinese massage in ${city}. Verified therapist, instant booking, secure payment. Book your wellness session now! 🌺`,
};

interface SharedTherapistProfileProps {
    therapists: Therapist[];
    selectedTherapist?: Therapist | null;
    userLocation?: UserLocation | null;
    loggedInCustomer?: any;
    handleQuickBookWithChat?: (provider: Therapist, type: 'therapist' | 'place') => Promise<void> | void;
    onNavigate?: (page: any) => void;
    language?: 'en' | 'id' | 'gb';
}

export const SharedTherapistProfile: React.FC<SharedTherapistProfileProps> = ({
    therapists,
    selectedTherapist,
    userLocation,
    loggedInCustomer,
    handleQuickBookWithChat,
    onNavigate,
    language = 'en'
}) => {
    // Get optimized preview image for WhatsApp/social media
    const getPreviewImage = (therapist: Therapist) => {
        // 1. Check for therapist-specific image first
        const therapistId = therapist.$id || therapist.id;
        if (therapistId && PREVIEW_IMAGES.therapists[therapistId?.toString()]) {
            return PREVIEW_IMAGES.therapists[therapistId.toString()];
        }

        // 2. Use therapist's profile picture if available and high quality
        if (therapist.profilePicture && therapist.profilePicture !== '') {
            return therapist.profilePicture;
        }

        // 3. City-specific images for local appeal
        const cityKey = therapist.city?.toLowerCase();
        if (cityKey && PREVIEW_IMAGES.cities[cityKey]) {
            return PREVIEW_IMAGES.cities[cityKey];
        }

        // 4. Default fallback image
        return PREVIEW_IMAGES.default;
    };

    // Wrapper for TherapistCard compatibility
    const handleCardQuickBook = (therapist: Therapist) => {
        if (handleQuickBookWithChat) {
            handleQuickBookWithChat(therapist, 'therapist');
        }
    };

    // Debug logging
    useEffect(() => {
        console.log('🔍 [SharedTherapistProfile] Component mounted');
        console.log('  - Therapists array length:', therapists?.length || 0);
        console.log('  - First 3 therapist IDs:', therapists?.slice(0, 3).map(t => ({ id: t.$id || t.id, name: t.name })));
        console.log('  - Selected therapist:', selectedTherapist);
        console.log('  - URL:', window.location.href);
    }, []);

    const { provider: therapist, loading, error, providerId } = useSharedProfile({
        providers: therapists,
        providerType: 'therapist',
        selectedProvider: selectedTherapist
    });

    // Debug the result
    useEffect(() => {
        console.log('🎯 [useSharedProfile] Result:', {
            providerId,
            found: !!therapist,
            therapistName: therapist?.name,
            loading,
            error,
            therapistsArrayLength: therapists?.length || 0
        });
    }, [therapist, providerId, loading, error, therapists]);

    // Show loading state if therapists array is still loading from Appwrite
    const isDataLoading = loading || (therapists?.length === 0 && !error);

    // Track analytics when profile loads
    useEffect(() => {
        if (therapist && providerId) {
            const sessionId = sessionStorage.getItem('shared_link_session_id') || 
                              crypto.randomUUID?.() || 
                              `session_${Date.now()}`;
            sessionStorage.setItem('shared_link_session_id', sessionId);

            // Track view
            analyticsService.trackSharedLinkView(
                Number(providerId),
                sessionId
            ).catch(err => console.log('Analytics tracking skipped:', err));
        }
    }, [therapist, providerId]);

    // Update page metadata for WhatsApp and social media
    useEffect(() => {
        if (!therapist) return;

        const title = PREVIEW_TEMPLATES.title(therapist.name, therapist.city || 'Bali');
        const description = PREVIEW_TEMPLATES.description(therapist.name, therapist.city || 'Bali');
        const shareUrl = generateTherapistShareURL(therapist);
        const previewImage = getPreviewImage(therapist);

        document.title = title;

        // Comprehensive meta tags for WhatsApp, Facebook, Twitter, etc.
        const metaTags = [
            // Basic meta
            { name: 'description', content: description },
            
            // Open Graph (WhatsApp, Facebook, LinkedIn)
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: shareUrl },
            { property: 'og:type', content: 'profile' },
            { property: 'og:image', content: previewImage },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:site_name', content: 'IndaStreet Massage' },
            { property: 'og:locale', content: 'en_US' },
            
            // Twitter Cards
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description },
            { name: 'twitter:image', content: previewImage },
            { name: 'twitter:site', content: '@IndaStreet' },
            
            // WhatsApp specific (uses og: tags but these help)
            { property: 'whatsapp:title', content: title },
            { property: 'whatsapp:description', content: description },
            { property: 'whatsapp:image', content: previewImage },
        ];

        metaTags.forEach(({ name, property, content }) => {
            const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
            let meta = document.querySelector(selector);
            
            if (!meta) {
                meta = document.createElement('meta');
                if (name) meta.setAttribute('name', name);
                if (property) meta.setAttribute('property', property);
                document.head.appendChild(meta);
            }
            
            meta.setAttribute('content', content);
        });

        // Add structured data for better search and social media integration
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": therapist.name,
            "jobTitle": "Professional Massage Therapist",
            "description": description,
            "image": previewImage,
            "url": shareUrl,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": therapist.city || "Bali",
                "addressCountry": "Indonesia"
            },
            "offers": {
                "@type": "Offer",
                "category": "Massage Therapy Services",
                "availability": "https://schema.org/InStock"
            }
        };

        // Add or update structured data script
        let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
        if (!structuredDataScript) {
            structuredDataScript = document.createElement('script');
            structuredDataScript.type = 'application/ld+json';
            document.head.appendChild(structuredDataScript);
        }
        structuredDataScript.textContent = JSON.stringify(structuredData);

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', shareUrl);
    }, [therapist]);

    // Show loading state
    if (isDataLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Show error or not found
    if (error || !therapist) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="mb-4 text-6xl">😔</div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">Profile Not Found</p>
                    <p className="text-sm text-gray-600 mb-4">{error || 'This therapist profile could not be found.'}</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <SharedProfileLayout
            providerName={therapist.name}
            providerType="therapist"
            city={therapist.city}
            error={error}
            loading={loading}
            onNavigate={onNavigate}
        >
            <div className="max-w-xl mx-auto px-4 pt-4 pb-6 space-y-4">
                {/* Hero Logo */}
                <div className="flex justify-center mb-4">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/logo%20yoga.png" 
                        alt="Logo" 
                        className="h-48 w-auto object-contain"
                    />
                </div>

                <TherapistCard
                    therapist={therapist}
                    userLocation={userLocation}
                    isCustomerLoggedIn={Boolean(loggedInCustomer)}
                    onRate={() => {}}
                    onBook={() => {}}
                    onQuickBookWithChat={handleCardQuickBook}
                    onIncrementAnalytics={() => {}}
                    onShowRegisterPrompt={() => {}}
                    onNavigate={onNavigate}
                    onViewPriceList={() => {}}
                    t={() => ''}
                    hideJoinButton={true}
                    customVerifiedBadge="https://ik.imagekit.io/7grri5v7d/therapist_verfied-removebg-preview.png"
                />

                {/* Optional bottom space */}
                <div className="min-h-[32px]" />
            </div>
        </SharedProfileLayout>
    );
};

export default SharedTherapistProfile;
