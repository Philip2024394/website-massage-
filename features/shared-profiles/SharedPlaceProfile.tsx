/**
 * Shared Place Profile Page (for massage places)
 * Uses the same clean pattern as therapist profiles
 */

import React, { useEffect } from 'react';
import { SharedProfileLayout } from './SharedProfileLayout';
import { useSharedProfile } from './hooks/useSharedProfile';
import MassagePlaceCard from '../../components/MassagePlaceCard';
import type { Place, UserLocation } from '../../types';
import { generatePlaceShareURL, generateShareText } from './utils/shareUrlBuilder';
import { analyticsService } from '../../services/analyticsService';

interface SharedPlaceProfileProps {
    places: Place[];
    selectedPlace?: Place | null;
    userLocation?: UserLocation | null;
    loggedInCustomer?: any;
    handleQuickBookWithChat?: (provider: Place, type: 'therapist' | 'place') => Promise<void> | void;
    onNavigate?: (page: any) => void;
    language?: 'en' | 'id' | 'gb';
}

export const SharedPlaceProfile: React.FC<SharedPlaceProfileProps> = ({
    places,
    selectedPlace,
    userLocation,
    loggedInCustomer,
    handleQuickBookWithChat,
    onNavigate,
    language = 'en'
}) => {
    const { provider: place, loading, error, providerId } = useSharedProfile({
        providers: places,
        providerType: 'place',
        selectedProvider: selectedPlace
    });

    // Track analytics
    useEffect(() => {
        if (place && providerId) {
            const sessionId = sessionStorage.getItem('shared_link_session_id') || 
                              crypto.randomUUID?.() || 
                              `session_${Date.now()}`;
            sessionStorage.setItem('shared_link_session_id', sessionId);

            analyticsService.trackSharedLinkView(
                Number(providerId),
                sessionId
            ).catch(err => console.log('Analytics tracking skipped:', err));
        }
    }, [place, providerId]);

    // Update metadata
    useEffect(() => {
        if (!place) return;

        const title = `${place.name} | Professional Massage Spa | IndaStreet`;
        const description = `Book massage services at ${place.name}${place.city ? ` in ${place.city}` : ''}. Professional spa, verified therapists, secure booking.`;
        const shareUrl = generatePlaceShareURL(place);

        document.title = title;

        const metaTags = [
            { name: 'description', content: description },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: shareUrl },
            { property: 'og:type', content: 'business.business' },
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
    }, [place]);

    return (
        <SharedProfileLayout
            providerName={place?.name || ''}
            providerType="place"
            city={place?.city}
            error={error}
            loading={loading}
        >
            {place && (
                <div className="max-w-4xl mx-auto">
                    <MassagePlaceCard
                        place={place}
                        userLocation={userLocation}
                        onSelectPlace={() => {}}
                        onRate={() => {}}
                        onIncrementAnalytics={() => {}}
                        onNavigate={onNavigate}
                        isCustomerLoggedIn={Boolean(loggedInCustomer)}
                        t={() => ''}
                    />

                    {/* Share section */}
                    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            📤 Share This Spa
                        </h3>
                        <p className="text-gray-600 mb-4 text-sm">
                            Share {place.name} with friends and family
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    const url = generatePlaceShareURL(place);
                                    const text = generateShareText(place.name, 'place', place.city);
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
                                }}
                                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                            >
                                📱 WhatsApp
                            </button>
                            <button
                                onClick={() => {
                                    const url = generatePlaceShareURL(place);
                                    navigator.clipboard?.writeText(url);
                                    alert('Link copied to clipboard!');
                                }}
                                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                            >
                                📋 Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SharedProfileLayout>
    );
};

export default SharedPlaceProfile;
