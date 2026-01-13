import React, { useEffect, useMemo, useState } from 'react';
import TherapistCard from '../components/TherapistCard';
import RotatingReviews from '../components/RotatingReviews';
import SocialMediaLinks from '../components/SocialMediaLinks';
import type { Therapist, UserLocation } from '../types';
import { useTranslations } from '../lib/useTranslations';
import { generateShareableURL } from '../utils/seoSlugGenerator';
// Analytics loaded dynamically to avoid hard failures in strict envs
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import { Building, Sparkles } from 'lucide-react';

interface SharedTherapistProfilePageProps {
    therapists: Therapist[];
    selectedTherapist: Therapist | null;
    userLocation?: UserLocation | null;
    loggedInCustomer?: any;
    handleQuickBookWithChat?: (provider: Therapist, type: 'therapist' | 'place') => Promise<void> | void;
    onNavigate?: (page: any) => void;
    language?: 'en' | 'id' | 'gb';
    loggedInProvider?: { id: number | string; type: 'therapist' | 'place' } | null;
    onLanguageChange?: (lang: string) => void;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    places?: any[];
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
}

const SharedTherapistProfilePage: React.FC<SharedTherapistProfilePageProps> = ({
    therapists,
    selectedTherapist,
    userLocation,
    loggedInCustomer,
    handleQuickBookWithChat,
    onNavigate,
    language,
    loggedInProvider,
    onLanguageChange,
    selectedCity = 'all',
    onCityChange,
    places,
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
    onPrivacyClick
}) => {
    const normalizedLanguage = language === 'gb' ? 'en' : language;
    const { t } = useTranslations(normalizedLanguage);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // Extract therapist id from /therapist-profile/:id-slug path
    const therapistId = useMemo(() => {
        const segments = window.location.pathname.split('/').filter(Boolean);
        const slugPart = segments[1] || '';
        const extractedId = slugPart.split('-')[0];
        
        // Debug logging
        console.log('🔧 [SharedTherapistProfile] ID extraction:', {
            fullPath: window.location.pathname,
            segments: segments,
            slugPart: slugPart,
            extractedId: extractedId
        });
        
        return extractedId;
    }, []);

    const therapist = useMemo(() => {
        console.log('🔧 [SharedTherapistProfile] Finding therapist:', {
            selectedTherapist: selectedTherapist ? 'Present' : 'None',
            therapistId: therapistId,
            therapistsCount: therapists?.length || 0,
            therapistsAvailable: therapists ? 'Yes' : 'No'
        });
        
        if (selectedTherapist) return selectedTherapist;
        
        // Try multiple ID formats to find the therapist
        if (therapistId && therapists && therapists.length > 0) {
            // Try exact ID match first
            let found = therapists.find((th) => {
                const thId = (th as any).id ?? (th as any).$id ?? '';
                return thId.toString() === therapistId;
            });
            
            console.log('🔧 [SharedTherapistProfile] Exact ID match:', found ? 'Found' : 'Not found');
            
            // If not found, try matching the full slug segment
            if (!found) {
                const fullSlug = window.location.pathname.split('/')[2] || '';
                found = therapists.find((th) => {
                    const thId = (th as any).id ?? (th as any).$id ?? '';
                    return thId.toString() === fullSlug || fullSlug.startsWith(thId.toString());
                });
                
                console.log('🔧 [SharedTherapistProfile] Full slug match:', found ? 'Found' : 'Not found', { fullSlug });
            }
            
            if (found) {
                console.log('🔧 [SharedTherapistProfile] Therapist found:', found.name);
            } else {
                console.warn('🔧 [SharedTherapistProfile] No therapist found for ID:', therapistId);
                console.log('Available therapist IDs:', therapists.map(th => ({
                    id: (th as any).id ?? (th as any).$id,
                    name: th.name
                })));
            }
            
            return found || null;
        }
        
        console.warn('🔧 [SharedTherapistProfile] No therapistId or therapists array');
        return null;
    }, [selectedTherapist, therapists, therapistId]);

    // SEO/meta: title, description, OG, canonical, JSON-LD (MUST be before early return)
    useEffect(() => {
        if (!therapist) return; // Guard clause

        const city = therapist.location || 'Indonesia';
        const title = `${therapist.name} - Terapis Pijat Panggilan Profesional ${city}`;
        const description = `Terapis pijat profesional ${therapist.name} di ${city}. Layanan pijat panggilan ke hotel, villa, dan rumah. Booking online mudah, harga transparan, terapis berpengalaman dan terpercaya.`;
        const url = generateShareableURL(therapist);
        
        // Yogyakarta/Jogja image pool - randomly select for variety
        const yogyakartaImages = [
            'https://ik.imagekit.io/7grri5v7d/massage%20service%2010.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%209.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%208.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%207.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%206.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%205.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%204.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%203.png',
            'https://ik.imagekit.io/7grri5v7d/massage%20service%202.png'
        ];
        
        // Check if therapist is from Yogyakarta/Jogja
        const isYogyakarta = city.toLowerCase().includes('yogyakarta') || city.toLowerCase().includes('jogja');
        
        // Select image: random from pool for Yogyakarta, main image for others (consistent with TherapistHomeCard)
        const image = isYogyakarta 
            ? yogyakartaImages[Math.floor(Math.random() * yogyakartaImages.length)]
            : ((therapist as any).mainImage || (therapist as any).profilePicture || 'https://www.indastreetmassage.com/og-default.jpg');

        const setTag = (name: string, content: string) => {
            if (!content) return;
            let tag = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('name', name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        const setOg = (property: string, content: string) => {
            if (!content) return;
            let tag = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute('property', property);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        const setLink = (rel: string, href: string) => {
            if (!href) return;
            let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', rel);
                document.head.appendChild(link);
            }
            link.setAttribute('href', href);
        };

        document.title = title;
        setTag('description', description);
        
        // Open Graph tags (Facebook, WhatsApp)
        setOg('og:title', title);
        setOg('og:description', description);
        setOg('og:type', 'website');
        setOg('og:url', url);
        setOg('og:image', image);
        setOg('og:image:width', '1200');
        setOg('og:image:height', '630');
        setOg('og:site_name', 'IndaStreet Massage');
        setOg('og:locale', 'id_ID');
        
        // Twitter Card tags
        setTag('twitter:card', 'summary_large_image');
        setTag('twitter:title', title);
        setTag('twitter:description', description);
        setTag('twitter:image', image);
        setTag('twitter:site', '@indastreet');
        
        setLink('canonical', url);

        // Enhanced JSON-LD structured data with Organization link
        const organizationSchema = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'IndaStreet Massage',
            url: 'https://www.indastreetmassage.com',
            logo: 'https://www.indastreetmassage.com/logo.png',
            sameAs: [
                'https://www.facebook.com/indastreet',
                'https://www.instagram.com/indastreet'
            ]
        };

        const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://www.indastreetmassage.com'
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: city,
                    item: `https://www.indastreetmassage.com/${city.toLowerCase()}`
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: therapist.name,
                    item: url
                }
            ]
        };

        const localBusinessSchema = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': url,
            name: therapist.name,
            description,
            image,
            url,
            telephone: therapist.whatsappNumber,
            areaServed: {
                '@type': 'City',
                name: city,
                containedIn: {
                    '@type': 'Country',
                    name: 'Indonesia'
                }
            },
            serviceType: 'Pijat panggilan profesional',
            priceRange: 'Rp200K - Rp700K',
            aggregateRating: therapist.rating ? { 
                '@type': 'AggregateRating', 
                ratingValue: therapist.rating, 
                reviewCount: therapist.reviewCount || 10,
                bestRating: 5,
                worstRating: 1
            } : undefined,
            address: {
                '@type': 'PostalAddress',
                addressLocality: city,
                addressCountry: 'ID'
            },
            parentOrganization: {
                '@type': 'Organization',
                name: 'IndaStreet Massage',
                url: 'https://www.indastreetmassage.com'
            }
        };

        // Combine all schemas
        const combinedSchema = {
            '@context': 'https://schema.org',
            '@graph': [organizationSchema, breadcrumbSchema, localBusinessSchema]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'therapist-json-ld';
        script.text = JSON.stringify(combinedSchema);
        const existing = document.getElementById('therapist-json-ld');
        if (existing) existing.remove();
        document.head.appendChild(script);

        return () => {
            const current = document.getElementById('therapist-json-ld');
            if (current) current.remove();
        };
    }, [therapist]);

    // Lightweight analytics for shared views (MUST be before early return)
    useEffect(() => {
        if (!therapist) return; // Guard clause

        const trackView = async () => {
            try {
                const therapistId = (therapist as any).id || (therapist as any).$id;
                if (!therapistId) return;

                const sessionKey = 'shared_link_session_id';
                const viewKey = `shared_link_viewed_${therapistId}`;
                const existingSessionId = sessionStorage.getItem(sessionKey);
                const sessionId = existingSessionId || crypto.randomUUID();
                if (!existingSessionId) {
                    sessionStorage.setItem(sessionKey, sessionId);
                }

                const visitData = {
                    therapistId,
                    therapistName: therapist.name,
                    timestamp: new Date().toISOString(),
                    source: 'shared_link',
                    url: window.location.href,
                    sessionId,
                };
                sessionStorage.setItem('shared_link_visit', JSON.stringify(visitData));
                sessionStorage.setItem('visit_source', 'shared_link');

                if (!sessionStorage.getItem(viewKey)) {
                    sessionStorage.setItem(viewKey, '1');
                    try {
                        const { analyticsService } = await import('../services/analyticsService');
                        await analyticsService.trackSharedLinkView(therapistId, sessionId);
                    } catch {
                        // No-op if analytics cannot load (dev/SSR/env issues)
                    }
                }
            } catch (err) {
                console.log('[SharedTherapistProfile] Analytics skip:', err);
            }
        };

        trackView();
    }, [therapist]);

    const handleViewAllTherapists = () => {
        // Store navigation context so massage types page can navigate back
        sessionStorage.setItem('massageTypes_source', 'shared_therapist_profile');
        sessionStorage.setItem('massageTypes_return_url', window.location.href);
        
        if (onNavigate) {
            onNavigate('massage-types');
        } else {
            window.location.href = '/#massage-types';
        }
    };

    const noop = () => {};
    const handleQuickBook = (provider: Therapist) => {
        if (handleQuickBookWithChat) {
            handleQuickBookWithChat(provider, 'therapist');
        }
    };

    if (!therapist) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-800 mb-2">Loading therapist profile...</p>
                    <p className="text-sm text-gray-600 mb-4">
                        Requested ID: {therapistId || 'Unknown'}
                    </p>
                    <div className="space-y-2">
                        <p className="text-xs text-gray-500">
                            {therapists?.length ? `Searching ${therapists.length} therapists...` : 'Loading therapist data...'}
                        </p>
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get hero image - special case for Budi (ID: 152935)
    const getHeroImage = () => {
        const therapistIdStr = therapist.id?.toString() || therapist.$id?.toString() || '';
        
        console.log('🖼️ Hero Image Debug:', {
            therapistName: therapist.name,
            therapistId: therapist.id,
            therapist$id: therapist.$id,
            therapistIdStr: therapistIdStr,
            isBudi: therapistIdStr === '152935'
        });
        
        // Budi's custom hero image
        if (therapistIdStr === '152935') {
            console.log('✅ Showing Budi custom hero image');
            return "https://ik.imagekit.io/7grri5v7d/massage%207.png?updatedAt=1766417587398";
        }
        
        // Default fallback chain
        console.log('⚠️ Not Budi - using fallback');
        return therapist.mainImage || therapist.profilePicture || "https://ik.imagekit.io/7grri5v7d/logo%20yoga.png";
    };

    const heroImageUrl = getHeroImage();
    console.log('🎨 Final hero image URL:', heroImageUrl);

    // Add cache-busting to ensure image updates are visible
    const getCacheBustedUrl = (url: string) => {
        if (!url) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}t=${Date.now()}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
            {/* Universal Header with Menu and Language Switcher */}
            <UniversalHeader 
                language={language || 'id'}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
            />

            {/* App Drawer */}
            {isMenuOpen && (
                <AppDrawer
                    isHome={false}
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    t={t || {}}
                    language={(language || 'id') as 'en' | 'id' | 'gb'}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onFacialPortalClick={onFacialPortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    onQRCodeClick={() => onNavigate?.('qr-code')}
                    therapists={therapists || []}
                    places={places || []}
                />
            )}

            {/* Hero Section with Logo and Orange Navigation Buttons */}
            <div className="bg-white sticky top-[60px] z-10 border-b border-gray-100">
                <div className="px-3 sm:px-4 pt-3 pb-3 max-w-6xl mx-auto">
                    {/* Therapist Main Image */}
                    <div className="flex justify-center mb-3">
                        <img 
                            src={getCacheBustedUrl(heroImageUrl)}
                            alt={`${therapist.name} - Professional Therapist`}
                            className="h-32 w-auto object-contain rounded-lg shadow-md"
                            onError={(e) => {
                                // Fallback to default image if main image fails to load
                                (e.target as HTMLImageElement).src = "https://ik.imagekit.io/7grri5v7d/logo%20yoga.png";
                            }}
                        />
                    </div>

                    {/* Navigation Buttons Row - Same as TherapistProfilePage */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        <div className="flex-shrink-0">
                            <button
                                onClick={() => onNavigate?.('home')}
                                className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm min-h-[44px] shadow-sm"
                                title={language === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}
                            >
                                {language === 'id' ? 'Beranda' : 'Home'}
                            </button>
                        </div>
                        
                        <div className="flex justify-end flex-shrink-0">
                            <button
                                onClick={() => onNavigate?.('massagePlaces')}
                                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
                                title={language === 'id' ? 'Tempat Pijat Indonesia' : 'Massage Spas Indonesia'}
                            >
                                <Building className="w-5 h-5" />
                                <span>{language === 'id' ? 'Tempat Pijat' : 'Massage Places'}</span>
                            </button>
                        </div>
                        
                        <div className="flex justify-end flex-shrink-0">
                            <button
                                onClick={() => onNavigate?.('facialProviders')}
                                className="px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold text-sm min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
                                title={language === 'id' ? 'Facial Indonesia' : 'Facials Indonesia'}
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Facial</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <TherapistCard
                    therapist={therapist}
                    userLocation={userLocation ?? undefined}
                    onRate={noop}
                    onBook={noop}
                    onQuickBookWithChat={handleQuickBook}
                    onIncrementAnalytics={noop as any}
                    onShowRegisterPrompt={noop}
                    onNavigate={onNavigate}
                    onViewPriceList={noop}
                    isCustomerLoggedIn={Boolean(loggedInCustomer)}
                    loggedInProviderId={loggedInProvider?.id}
                    t={t}
                    hideJoinButton={false}
                    avatarOffsetPx={8}
                />

                {/* Rotating Reviews Section */}
                <div className="mt-8">
                    <RotatingReviews 
                        location={therapist.location || 'Yogyakarta'} 
                        limit={5}
                        providerId={(therapist as any).$id || (therapist as any).id}
                        providerName={therapist.name}
                        providerType={'therapist'}
                        providerImage={(therapist as any).mainImage || (therapist as any).profilePicture}
                        onNavigate={onNavigate}
                    />
                </div>

                {/* Social Media Icons */}
                <div className="mt-8">
                    <SocialMediaLinks />
                </div>

                {/* SEO-Optimized Footer with Quick Links */}
                <div className="mt-12 mb-6 flex flex-col items-center gap-2">
                    <div className="font-bold text-lg">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </div>

                    {/* Quick Links Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200 w-full">
                        <h3 className="text-center text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                        <div className="flex flex-wrap justify-center gap-1 max-w-2xl mx-auto">
                            <button
                                onClick={() => onNavigate?.('home')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => onNavigate?.('massage-types')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Massage Types
                            </button>
                            <button
                                onClick={() => onNavigate?.('facial-types')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Facial Types
                            </button>
                            <button
                                onClick={() => onNavigate?.('therapist-signup')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Join as a Therapist Today
                            </button>
                            <button
                                onClick={() => onNavigate?.('place-signup')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Join Massage Place
                            </button>
                            <button
                                onClick={() => onNavigate?.('about-us')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                About Us
                            </button>
                            <button
                                onClick={() => onNavigate?.('contact-us')}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>

                {/* SEO-Optimized Footer with Indonesian Keywords */}
                <div className="mt-6 pt-8 border-t border-gray-200">
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
        </div>
    );
};

export default SharedTherapistProfilePage;
