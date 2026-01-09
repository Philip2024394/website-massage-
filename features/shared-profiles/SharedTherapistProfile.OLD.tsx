/**
 * Shared Therapist Profile Page
 * Clean, simple, guaranteed to work
 * Replaces the complex SharedTherapistProfilePage.tsx
 */

import React, { useEffect } from 'react';
import { SharedProfileLayout } from './SharedProfileLayout';
import { useSharedProfile } from './hooks/useSharedProfile';
import TherapistCard from '../../components/TherapistCard';
import RotatingReviews from '../../components/RotatingReviews';
import SocialMediaLinks from '../../components/SocialMediaLinks';
import type { Therapist, UserLocation } from '../../types';
import { generateTherapistShareURL, generateShareText } from './utils/shareUrlBuilder';
import { analyticsService } from '../../services/analyticsService';
import { PREVIEW_IMAGES } from '../../config/previewImages';

// 📱 WHATSAPP PREVIEW TEXT CUSTOMIZATION
// Edit these templates to change how your links appear in WhatsApp
const PREVIEW_TEMPLATES = {
    title: (name: string, city: string) => `${name} Professional Massage in ${city}`,
    description: (name: string, city: string) => `✨ Book ${name} for professional massage therapy in ${city}. ⭐ Verified therapist • 💬 Instant chat • 🔒 Secure booking •`,
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
        const cityKey = therapist.location?.toLowerCase();
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

    // Show loading state if therapists array is still loading from Appwrite OR if we're still looking for the therapist
    const isDataLoading = loading || (therapists?.length === 0 && !error) || (!therapist && !error && therapists?.length > 0);

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

        const title = PREVIEW_TEMPLATES.title(therapist.name, (therapist.location || 'Bali').split(' ')[0]);
        const description = PREVIEW_TEMPLATES.description(therapist.name, (therapist.location || 'Bali').split(' ')[0]);
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
                "addressLocality": therapist.location || "Bali",
                "addressCountry": "Indonesia"
            },
            "offers": {
                "@type": "Offer",
                "category": "Massage Therapy Services",
                "availability": "https://schema.org/InStock"
            }
        };

        // Add or update structured data script
        let structuredDataScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
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

    // Show loading state first priority
    if (isDataLoading || loading) {
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

    // Show error or not found - only after loading is complete
    if (!loading && !isDataLoading && (error || !therapist)) {
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
            city={therapist.location}
            error={error}
            loading={loading}
            onNavigate={onNavigate}
        >
            {/* Hero Logo */}
            <div className="flex justify-center mb-4 pt-4">
                <img 
                    src={`https://ik.imagekit.io/7grri5v7d/logo%20yoga.png?t=${Date.now()}`}
                    alt="Logo" 
                    className="h-48 w-auto object-contain"
                />
            </div>

            <div className="px-4 space-y-4">

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

                {/* Rotating Reviews Section */}
                <div className="mt-8">
                    <RotatingReviews 
                        location={therapist.location || 'Yogyakarta'} 
                        limit={5}
                        providerId={therapist.$id || therapist.id}
                        providerName={therapist.name}
                        providerType={'therapist'}
                        providerImage={(therapist as any).profilePicture || (therapist as any).mainImage}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>

                {/* SEO-Optimized Footer with Indonesian Keywords */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    {/* Main Brand Section */}
                    <div className="text-center mb-6">
                        <a 
                            href="https://www.indastreetmassage.com" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-2xl font-bold text-orange-500 hover:text-orange-600 transition-colors"
                        >
                            www.indastreetmassage.com
                        </a>
                        <p className="text-gray-600 mt-2">
                            {language === 'en' 
                                ? 'Indonesia\'s Premier Massage Booking Platform'
                                : 'Platform Booking Pijat Terbaik di Indonesia'
                            }
                        </p>
                    </div>

                    {/* Location-Specific Keywords */}
                    <div className="bg-gradient-to-r from-orange-50 to-green-50 rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                            {language === 'en' 
                                ? `Professional Massage Services in ${therapist.location || 'Indonesia'}`
                                : `Jasa Pijat Profesional di ${therapist.location || 'Indonesia'}`
                            }
                        </h3>
                        <div className="flex flex-wrap justify-center gap-2">
                            {(() => {
                                const city = therapist.location || 'Indonesia';
                                const keywords = [
                                    `pijat-${city.toLowerCase().replace(/\s+/g, '-')}`,
                                    `massage-${city.toLowerCase().replace(/\s+/g, '-')}`,
                                    language === 'en' ? `${city} massage therapy` : `terapi pijat ${city}`,
                                    language === 'en' ? `massage near me` : `pijat panggilan`,
                                    language === 'en' ? `home massage service` : `jasa pijat ke rumah`,
                                    language === 'en' ? `professional therapist` : `terapis profesional`,
                                    language === 'en' ? `traditional massage` : `pijat tradisional`,
                                    language === 'en' ? `reflexology` : `pijat refleksi`
                                ];
                                
                                return keywords.map((keyword, index) => (
                                    <span 
                                        key={index}
                                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 shadow-sm"
                                    >
                                        {keyword}
                                    </span>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Service Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">✅</div>
                            <p className="text-xs text-gray-600">
                                {language === 'en' ? 'Verified Therapists' : 'Terapis Terverifikasi'}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">🏠</div>
                            <p className="text-xs text-gray-600">
                                {language === 'en' ? 'Home Service' : 'Layanan ke Rumah'}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">💆</div>
                            <p className="text-xs text-gray-600">
                                {language === 'en' ? 'Multiple Techniques' : 'Berbagai Teknik'}
                            </p>
                        </div>
                        <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                            <div className="text-2xl mb-1">⭐</div>
                            <p className="text-xs text-gray-600">
                                {language === 'en' ? 'Top Rated' : 'Rating Terbaik'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
                        <a 
                            href="https://www.indastreetmassage.com" 
                            className="text-orange-500 hover:text-orange-600 font-medium"
                        >
                            {language === 'en' ? 'Browse All Therapists' : 'Lihat Semua Terapis'}
                        </a>
                        <span className="text-gray-300">|</span>
                        <a 
                            href="https://www.indastreetmassage.com/massage-places" 
                            className="text-orange-500 hover:text-orange-600 font-medium"
                        >
                            {language === 'en' ? 'Massage Spas' : 'Tempat Pijat'}
                        </a>
                        <span className="text-gray-300">|</span>
                        <a 
                            href="https://www.indastreetmassage.com/facial-places" 
                            className="text-orange-500 hover:text-orange-600 font-medium"
                        >
                            {language === 'en' ? 'Facial Clinics' : 'Klinik Facial'}
                        </a>
                    </div>

                    {/* Rich Footer Text for SEO */}
                    <div className="text-center text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
                        <p className="leading-relaxed">
                            {language === 'en' 
                                ? `Book ${therapist.name} and discover professional massage services in ${therapist.location || 'Indonesia'}. IndaStreet Massage connects you with certified therapists offering traditional Indonesian massage, reflexology, aromatherapy, and more. Experience authentic pijat tradisional from verified professionals. Available for home visits and spa locations across Indonesia.`
                                : `Pesan ${therapist.name} dan temukan layanan pijat profesional di ${therapist.location || 'Indonesia'}. IndaStreet Massage menghubungkan Anda dengan terapis bersertifikat yang menawarkan pijat tradisional Indonesia, refleksi, aromaterapi, dan lainnya. Rasakan pijat tradisional autentik dari profesional terverifikasi. Tersedia untuk kunjungan rumah dan lokasi spa di seluruh Indonesia.`
                            }
                        </p>
                    </div>

                    {/* Bottom Brand Line */}
                    <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                        <p>
                            © 2026 IndaStreet Massage • 
                            {language === 'en' 
                                ? ' Professional Massage Booking Platform in Indonesia'
                                : ' Platform Booking Pijat Profesional di Indonesia'
                            }
                        </p>
                        <p className="mt-1">
                            <a 
                                href="https://www.indastreetmassage.com" 
                                className="text-orange-500 hover:underline"
                            >
                                www.indastreetmassage.com
                            </a>
                        </p>
                    </div>
                </div>

                {/* Optional bottom space */}
                <div className="min-h-[32px]" />
            </div>
        </SharedProfileLayout>
    );
};

export default SharedTherapistProfile;
