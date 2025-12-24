import React, { useEffect, useMemo } from 'react';
import TherapistCard from '../components/TherapistCard';
import type { Therapist, UserLocation } from '../types';
import { useTranslations } from '../lib/useTranslations';
import { generateShareableURL } from '../utils/seoSlugGenerator';
import { analyticsService } from '../services/analyticsService';

interface SharedTherapistProfilePageProps {
    therapists: Therapist[];
    selectedTherapist: Therapist | null;
    userLocation?: UserLocation | null;
    loggedInCustomer?: any;
    handleQuickBookWithChat?: (provider: Therapist, type: 'therapist' | 'place') => Promise<void> | void;
    onNavigate?: (page: any) => void;
    language?: 'en' | 'id' | 'gb';
}

const SharedTherapistProfilePage: React.FC<SharedTherapistProfilePageProps> = ({
    therapists,
    selectedTherapist,
    userLocation,
    loggedInCustomer,
    handleQuickBookWithChat,
    onNavigate,
    language,
}) => {
    const normalizedLanguage = language === 'gb' ? 'en' : language;
    const { t } = useTranslations(normalizedLanguage);
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

        const city = therapist.city || 'Indonesia';
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
        
        // Select image: random from pool for Yogyakarta, profile picture for others
        const image = isYogyakarta 
            ? yogyakartaImages[Math.floor(Math.random() * yogyakartaImages.length)]
            : ((therapist as any).profilePicture || (therapist as any).mainImage || 'https://www.indastreetmassage.com/og-default.jpg');

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
                analyticsService.trackSharedLinkView(therapistId, sessionId).catch(() => null);
            }
        } catch (err) {
            console.log('[SharedTherapistProfile] Analytics skip:', err);
        }
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

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-xl mx-auto px-4 pt-4 pb-6 space-y-4">
                {/* Hero Image */}
                <div className="flex justify-center mb-4">
                    <img 
                        src={therapist.mainImage || "https://ik.imagekit.io/7grri5v7d/logo%20yoga.png"} 
                        alt={`${therapist.name} banner`}
                        className="h-48 w-auto object-contain"
                    />
                </div>

                <TherapistCard
                    therapist={therapist}
                    userLocation={userLocation ?? undefined}
                    onRate={noop}
                    onBook={noop}
                    onQuickBookWithChat={handleQuickBook}
                    onIncrementAnalytics={noop as any}
                    onShowRegisterPrompt={noop}
                    onNavigate={handleViewAllTherapists}
                    onViewPriceList={noop}
                    isCustomerLoggedIn={Boolean(loggedInCustomer)}
                    t={t}
                    hideJoinButton={true}
                    customVerifiedBadge="https://ik.imagekit.io/7grri5v7d/therapist_verfied-removebg-preview.png"
                />

                {/* Optional bottom space for custom messaging */}
                <div className="min-h-[32px]" />
            </div>
        </div>
    );
};

export default SharedTherapistProfilePage;
