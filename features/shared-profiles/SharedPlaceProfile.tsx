/**
 * Shared Place Profile Page (for massage places)
 * Uses the same clean pattern as therapist profiles
 */

import React, { useEffect } from 'react';
import { SharedProfileLayout } from './SharedProfileLayout';
import { useSharedProfile } from './hooks/useSharedProfile';
import MassagePlaceCard from '../../components/MassagePlaceCard';
import SocialMediaLinks from '../../components/SocialMediaLinks';
import type { Place, UserLocation } from '../../types';
import { generatePlaceShareURL, generateShareText } from './utils/shareUrlBuilder';
import { analyticsService } from '../../services/analyticsService';
import { shareTrackingService } from '../../services/shareTrackingService';

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
            const randomId = (typeof window !== 'undefined'
                && (window as any).crypto
                && (window as any).crypto.randomUUID
                ? (window as any).crypto.randomUUID()
                : null);
            const sessionId = sessionStorage.getItem('shared_link_session_id')
                || randomId
                || `session_${Date.now()}`;
            sessionStorage.setItem('shared_link_session_id', sessionId);

            analyticsService.trackSharedLinkView(
                Number(providerId),
                sessionId
            ).catch(err => console.log('Analytics tracking skipped:', err));
            
            // Track share analytics for profile view with chain tracking
            try {
                console.log('📊 [SHARE TRACKING] Tracking place profile view with chain tracking');
                
                // Parse sharing chain data from URL
                const shareChain = shareTrackingService.parseShareChainFromUrl();
                
                // Detect if this is from a shared link based on referrer, URL params, or chain data
                const isFromShare = shareChain ||
                                   document.referrer.includes('wa.me') || 
                                   document.referrer.includes('facebook.com') || 
                                   document.referrer.includes('t.me') || 
                                   document.referrer.includes('twitter.com') ||
                                   window.location.pathname.includes('/share/') ||
                                   window.location.hash.includes('shared=true') ||
                                   window.location.search.includes('si=');
                
                if (isFromShare || window.location.search.includes('shared=1')) {
                    console.log('📊 Place shared link view detected - tracking analytics with chain data');
                    console.log('🔗 Share chain data:', shareChain);
                    
                    // Use chain tracking method
                    shareTrackingService.trackSharedProfileViewWithChain({
                        memberId: place.$id,
                        memberName: place.name || 'Unknown Place',
                        memberType: 'place',
                        shareChain,
                        metadata: {
                            referrer: document.referrer,
                            url: window.location.href,
                            timestamp: new Date().toISOString(),
                            chainDepth: shareChain?.shareDepth || 0,
                            originalSharer: shareChain?.originalSharerUserId
                        }
                    }).catch(err => console.warn('⚠️ Place share tracking failed:', err));
                    
                    console.log('✅ [SHARE TRACKING] Place profile view with chain tracked successfully');
                } else {
                    console.log('📊 Direct place visit detected - not tracking as shared view');
                }
            } catch (shareTrackingError) {
                console.warn('⚠️ [SHARE TRACKING] Failed to track place view:', shareTrackingError);
            }
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

                    {/* Social Media Icons */}
                    <div className="mt-8">
                        <SocialMediaLinks />
                    </div>
                </div>
            )}
        </SharedProfileLayout>
    );
};

export default SharedPlaceProfile;
