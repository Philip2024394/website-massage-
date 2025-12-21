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
        return slugPart.split('-')[0];
    }, []);

    const therapist = useMemo(() => {
        if (selectedTherapist) return selectedTherapist;
        return therapists.find((th) => ((th as any).id ?? (th as any).$id ?? '').toString() === therapistId) || null;
    }, [selectedTherapist, therapists, therapistId]);

    const handleViewAllTherapists = () => {
        if (onNavigate) {
            onNavigate('providers');
        } else {
            window.location.href = '/';
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
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-800 mb-2">Loading profile…</p>
                    <p className="text-sm text-gray-600">If this takes long, refresh the page.</p>
                </div>
            </div>
        );
    }

    // SEO/meta: title, description, OG, canonical, JSON-LD
    useEffect(() => {
        const title = `${therapist.name} | Pijat Panggilan ${therapist.city || 'Indonesia'} | IndaStreet`;
        const description = `Pijat panggilan profesional di ${therapist.city || 'Indonesia'} bersama ${therapist.name}. Booking mudah, chat cepat, terapis terpercaya.`;
        const url = generateShareableURL(therapist);
        const image = (therapist as any).profilePicture || (therapist as any).mainImage || 'https://www.indastreetmassage.com/og-default.jpg';

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
        setOg('og:title', title);
        setOg('og:description', description);
        setOg('og:type', 'website');
        setOg('og:url', url);
        setOg('og:image', image);
        setLink('canonical', url);

        // JSON-LD structured data
        const ld = {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: therapist.name,
            description,
            image,
            url,
            areaServed: therapist.city || 'Indonesia',
            serviceType: 'Pijat panggilan',
            priceRange: 'Rp200K - Rp700K',
            aggregateRating: therapist.rating ? { '@type': 'AggregateRating', ratingValue: therapist.rating, reviewCount: therapist.reviewCount || 10 } : undefined,
            address: {
                '@type': 'PostalAddress',
                addressLocality: therapist.city || 'Indonesia',
                addressCountry: 'ID'
            }
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'therapist-json-ld';
        script.text = JSON.stringify(ld);
        // Remove existing
        const existing = document.getElementById('therapist-json-ld');
        if (existing) existing.remove();
        document.head.appendChild(script);

        return () => {
            // Leave title/description as-is; remove JSON-LD to avoid duplication when navigating
            const current = document.getElementById('therapist-json-ld');
            if (current) current.remove();
        };
    }, [therapist]);

    // Lightweight analytics for shared views (fire-and-forget, once per session)
    useEffect(() => {
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
                const send = () => analyticsService.trackSharedLinkView(therapistId, sessionId).catch(() => null);
                if ('requestIdleCallback' in window) {
                    (window as any).requestIdleCallback(send, { timeout: 1500 });
                } else {
                    setTimeout(send, 0);
                }
            }
        } catch (err) {
            console.warn('Shared link analytics failed:', err);
        }
    }, [therapist]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-xl mx-auto px-4 pt-4 pb-6 space-y-4">
                {/* Optional top space for custom messaging */}
                <div className="min-h-[24px]" />

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
                />

                {/* Optional bottom space for custom messaging */}
                <div className="min-h-[32px]" />
            </div>
        </div>
    );
};

export default SharedTherapistProfilePage;
