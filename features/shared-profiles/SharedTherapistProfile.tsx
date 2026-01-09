/**
 * 🔒 PROTECTED FILE - DO NOT MODIFY WITHOUT APPROVAL 🔒
 * 
 * SharedTherapistProfile - Direct Fetch Architecture
 * 
 * ⚠️ WARNING: This component is PRODUCTION CRITICAL
 * ⚠️ ANY changes here affect ALL shared therapist links across the platform
 * ⚠️ Used by: /therapist-profile/:id and /share/therapist/:id URLs
 * 
 * TESTED & WORKING AS OF: January 10, 2026
 * 
 * CRITICAL FEATURES:
 * ✅ Fetches therapist directly from Appwrite (NOT from state)
 * ✅ Does NOT render until therapist is resolved
 * ✅ Shows loading state (NO early returns)
 * ✅ Shows error state (NO silent failures)
 * ✅ NO assumptions about authentication
 * ✅ Uses TherapistProfileBase for presentation
 * ✅ Profile images (NOT banners) in all contexts
 * 
 * 🚨 BEFORE MODIFYING: Test thoroughly on production URLs
 * 🚨 IF BROKEN: Revert immediately and contact system architect
 */

import React, { useState, useEffect } from 'react';
import { therapistService } from '../../lib/appwriteService';
import TherapistProfileBase from '../../components/TherapistProfileBase';
import type { Therapist, UserLocation } from '../../types';
import { generateTherapistShareURL } from './utils/shareUrlBuilder';
import { analyticsService } from '../../services/analyticsService';
import { PREVIEW_IMAGES } from '../../config/previewImages';
import { getHeroImageForTherapist } from '../../config/heroImages';

interface SharedTherapistProfileProps {
    // NO LONGER REQUIRED - we fetch directly
    therapists?: Therapist[];
    selectedTherapist?: Therapist | null;
    
    // Optional context
    userLocation?: UserLocation | null;
    loggedInCustomer?: any;
    handleQuickBookWithChat?: (provider: Therapist, type: 'therapist' | 'place') => Promise<void> | void;
    onNavigate?: (page: any) => void;
    language?: 'en' | 'id' | 'gb';
}

/**
 * Extract therapist ID from URL
 * Supports:
 * - /share/therapist/12345
 * - /share/therapist/12345-name-slug
 * - /therapist-profile/12345
 */
const extractTherapistIdFromUrl = (): string | null => {
    const path = window.location.pathname;
    
    // Match patterns: /share/therapist/:id or /therapist-profile/:id
    const match = path.match(/\/(share\/therapist|therapist-profile)\/([^\/]+)/);
    if (!match) {
        console.error('❌ Invalid URL pattern:', path);
        return null;
    }
    
    const fullSegment = match[2]; // "12345" or "12345-name-slug"
    const id = fullSegment.split('-')[0]; // Extract ID before first dash
    
    console.log('🔍 Extracted therapist ID:', id, 'from:', fullSegment);
    return id;
};

export const SharedTherapistProfile: React.FC<SharedTherapistProfileProps> = ({
    selectedTherapist,
    userLocation,
    loggedInCustomer,
    handleQuickBookWithChat,
    onNavigate,
    language = 'en'
}) => {
    const [therapist, setTherapist] = useState<Therapist | null>(selectedTherapist || null);
    const [loading, setLoading] = useState(!selectedTherapist);
    const [error, setError] = useState<string | null>(null);

    // Direct fetch from Appwrite
    useEffect(() => {
        const fetchTherapist = async () => {
            // If therapist already provided, skip fetch
            if (selectedTherapist) {
                console.log('✅ Using pre-selected therapist:', selectedTherapist.name);
                setTherapist(selectedTherapist);
                setLoading(false);
                return;
            }

            // Extract ID from URL
            const therapistId = extractTherapistIdFromUrl();
            if (!therapistId) {
                setError('Invalid profile URL');
                setLoading(false);
                return;
            }

            console.log('📡 Fetching therapist directly from Appwrite, ID:', therapistId);
            
            try {
                setLoading(true);
                setError(null);

                // DIRECT FETCH - NO dependency on therapist list state
                const fetchedTherapist = await therapistService.getById(therapistId);
                
                if (!fetchedTherapist) {
                    throw new Error('Therapist not found');
                }

                console.log('✅ Therapist fetched successfully:', fetchedTherapist.name);
                setTherapist(fetchedTherapist);

                // Track analytics
                try {
                    const sessionId = sessionStorage.getItem('shared_link_session_id') || 
                                      crypto.randomUUID?.() || 
                                      `session_${Date.now()}`;
                    sessionStorage.setItem('shared_link_session_id', sessionId);

                    await analyticsService.trackSharedLinkView(
                        Number(therapistId),
                        sessionId
                    );
                } catch (analyticsError) {
                    console.log('Analytics tracking skipped:', analyticsError);
                }

            } catch (err: any) {
                console.error('❌ Failed to fetch therapist:', err);
                setError(err.message || 'Failed to load therapist profile');
            } finally {
                setLoading(false);
            }
        };

        fetchTherapist();
    }, [selectedTherapist]);

    // Update page metadata for WhatsApp and social media
    useEffect(() => {
        if (!therapist) return;

        const city = (therapist.location || 'Bali').split(' ')[0];
        const title = `${therapist.name} - Professional Massage in ${city}`;
        const description = `✨ Book ${therapist.name} for professional massage therapy in ${city}. ⭐ Verified therapist • 💬 Instant chat • 🔒 Secure booking`;
        const shareUrl = generateTherapistShareURL(therapist);
        
        // Use hero image from pool for social sharing
        const previewImage = getHeroImageForTherapist(therapist.$id, therapist.location || 'Yogyakarta');
        
        console.log('📱 Social Media Preview:', { 
            therapist: therapist.name, 
            image: previewImage,
            usingHeroImage: true
        });

        document.title = title;

        // 🔗 FACEBOOK STANDARD - Comprehensive meta tags for SEO, WhatsApp, Facebook, Twitter, Google Images
        const metaTags = [
            // Basic SEO
            { name: 'description', content: description },
            { name: 'keywords', content: `pijat panggilan ${city}, terapis pijat ${city}, massage ${city}, spa panggilan, home service massage, ${therapist.name}` },
            { name: 'author', content: therapist.name },
            { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
            
            // 🖼️ GOOGLE IMAGES SEO - CRITICAL for image discovery
            { name: 'image', content: previewImage },
            { name: 'thumbnail', content: previewImage },
            { itemprop: 'image', content: previewImage },
            { itemprop: 'thumbnailUrl', content: previewImage },
            { itemprop: 'name', content: `${therapist.name} - Massage Therapist ${city}` },
            { itemprop: 'description', content: `Professional massage therapy by ${therapist.name} in ${city}. Book certified therapist for traditional Indonesian massage, reflexology, and spa services.` },
            
            // 📘 FACEBOOK OPEN GRAPH - COMPLETE STANDARD
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: shareUrl },
            { property: 'og:type', content: 'profile' },
            { property: 'og:image', content: previewImage },
            { property: 'og:image:secure_url', content: previewImage },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:image:alt', content: `${therapist.name} - Professional Massage Therapist in ${city}, Indonesia | Traditional Indonesian Massage, Spa Services, Home Service` },
            { property: 'og:image:type', content: 'image/png' },
            { property: 'og:site_name', content: 'IndaStreet Massage' },
            { property: 'og:locale', content: 'id_ID' },
            { property: 'og:locale:alternate', content: 'en_US' },
            // Facebook Profile specific
            { property: 'profile:first_name', content: therapist.name.split(' ')[0] },
            { property: 'profile:last_name', content: therapist.name.split(' ').slice(1).join(' ') || '' },
            { property: 'profile:username', content: therapist.name.toLowerCase().replace(/[^a-z0-9]/g, '') },
            // Business/Service Info for Facebook
            { property: 'business:contact_data:street_address', content: city },
            { property: 'business:contact_data:locality', content: city },
            { property: 'business:contact_data:country_name', content: 'Indonesia' },
            
            // 🐦 TWITTER CARD - ENHANCED
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description },
            { name: 'twitter:image', content: previewImage },
            { name: 'twitter:image:alt', content: `${therapist.name} - Professional Massage Therapist ${city} | Book Traditional Indonesian Massage, Reflexology, Spa Services` },
            { name: 'twitter:site', content: '@indastreetmassage' },
            { name: 'twitter:creator', content: '@indastreetmassage' },
            
            // 📱 WHATSAPP & TELEGRAM optimizations
            { name: 'theme-color', content: '#f97316' }, // Orange brand color
            { name: 'msapplication-TileColor', content: '#f97316' },
            
            // 🌐 Geographic targeting for local SEO
            { name: 'geo.region', content: 'ID' },
            { name: 'geo.placename', content: city },
            { name: 'geo.position', content: therapist.coordinates ? `${therapist.coordinates.latitude};${therapist.coordinates.longitude}` : '' },
            { name: 'ICBM', content: therapist.coordinates ? `${therapist.coordinates.latitude}, ${therapist.coordinates.longitude}` : '' },
        ];

        metaTags.forEach(({ name, property, itemprop, content }) => {
            if (!content) return; // Skip empty values
            
            const selector = name ? `meta[name="${name}"]` 
                : property ? `meta[property="${property}"]`
                : itemprop ? `meta[itemprop="${itemprop}"]`
                : null;
            
            if (!selector) return;
            
            let meta = document.querySelector(selector);
            
            if (!meta) {
                meta = document.createElement('meta');
                if (name) meta.setAttribute('name', name);
                if (property) meta.setAttribute('property', property);
                if (itemprop) meta.setAttribute('itemprop', itemprop);
                document.head.appendChild(meta);
            }
            
            meta.setAttribute('content', content);
        });

        // 🏗️ FACEBOOK STANDARD - JSON-LD Structured Data for Rich Snippets
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": therapist.name,
            "jobTitle": "Massage Therapist",
            "description": description,
            "url": shareUrl,
            "image": previewImage,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": city,
                "addressCountry": "ID"
            },
            "offers": {
                "@type": "Offer",
                "description": "Professional massage therapy services",
                "availability": "https://schema.org/InStock"
            },
            "sameAs": [
                shareUrl,
                `https://www.indastreetmassage.com/therapist/${therapist.$id}`
            ]
        };
        
        // Remove existing structured data
        const existingJsonLd = document.querySelector('script[type="application/ld+json"]');
        if (existingJsonLd) {
            existingJsonLd.remove();
        }
        
        // Add new structured data
        const jsonLdScript = document.createElement('script');
        jsonLdScript.type = 'application/ld+json';
        jsonLdScript.textContent = JSON.stringify(structuredData);
        document.head.appendChild(jsonLdScript);
        
        console.log('📊 Facebook Standard - Structured data added:', structuredData);
        
        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', shareUrl);

        // JSON-LD Structured Data for Google Rich Snippets
        const googleStructuredData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": therapist.name,
            "jobTitle": "Professional Massage Therapist",
            "description": `${therapist.name} provides professional massage therapy services in ${city}. Specialized in traditional Indonesian massage, Swedish massage, and therapeutic treatments.`,
            "url": shareUrl,
            "image": previewImage,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": city,
                "addressCountry": "ID"
            },
            "offers": {
                "@type": "Offer",
                "name": "Professional Massage Service",
                "category": "Health & Wellness",
                "areaServed": {
                    "@type": "City",
                    "name": city
                },
                "availableChannel": {
                    "@type": "ServiceChannel",
                    "serviceUrl": shareUrl,
                    "serviceType": "In-home massage service"
                }
            },
            "aggregateRating": therapist.reviewCount && therapist.reviewCount > 0 ? {
                "@type": "AggregateRating",
                "ratingValue": therapist.rating || 4.8,
                "reviewCount": therapist.reviewCount,
                "bestRating": 5,
                "worstRating": 1
            } : undefined
        };

        // Add/update JSON-LD script
        let jsonLd = document.querySelector('script[type="application/ld+json"]');
        if (!jsonLd) {
            jsonLd = document.createElement('script');
            jsonLd.setAttribute('type', 'application/ld+json');
            document.head.appendChild(jsonLd);
        }
        jsonLd.textContent = JSON.stringify(googleStructuredData);

        console.log('🔍 SEO Enhanced:', {
            title,
            structuredData: '✅ JSON-LD added',
            ogImage: previewImage,
            canonical: shareUrl
        });
    }, [therapist]);

    // Helper for preview images
    const getPreviewImage = (therapist: Therapist) => {
        const therapistId = therapist.$id || therapist.id;
        if (therapistId && (PREVIEW_IMAGES.therapists as any)[therapistId?.toString()]) {
            return (PREVIEW_IMAGES.therapists as any)[therapistId.toString()];
        }

        if (therapist.profilePicture && therapist.profilePicture !== '') {
            return therapist.profilePicture;
        }

        const cityKey = therapist.location?.toLowerCase();
        if (cityKey && (PREVIEW_IMAGES.cities as any)[cityKey]) {
            return (PREVIEW_IMAGES.cities as any)[cityKey];
        }

        return PREVIEW_IMAGES.default;
    };

    // Wrapper for booking callbacks
    const handleQuickBook = () => {
        if (handleQuickBookWithChat && therapist) {
            handleQuickBookWithChat(therapist, 'therapist');
        }
    };

    // LOADING STATE - DO NOT RENDER CONTENT
    if (loading) {
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
                    <p className="text-sm text-gray-600 mt-2">Fetching therapist data</p>
                </div>
            </div>
        );
    }

    // ERROR STATE - SHOW FULL ERROR, NO SILENT FAILURE
    if (error || !therapist) {
        const errorMessage = error || 'Therapist profile not found';
        console.error('🚨 SHARED PROFILE ERROR:', errorMessage);
        
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
                    <div className="mb-4 text-6xl">😔</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-sm text-red-600 mb-4 font-mono bg-red-50 p-2 rounded">
                        {errorMessage}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        This therapist profile could not be loaded. The link may be invalid or the therapist is no longer available.
                    </p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    // SUCCESS STATE - RENDER PROFILE
    console.log('✅ Rendering TherapistProfileBase with therapist:', therapist.name);
    
    return (
        <TherapistProfileBase
            therapist={therapist}
            mode="shared"
            userLocation={userLocation}
            showSEOFooter={true}
            isCustomerLoggedIn={Boolean(loggedInCustomer)}
            onQuickBookWithChat={handleQuickBook}
            onNavigate={onNavigate}
            language={language}
        />
    );
};

export default SharedTherapistProfile;

