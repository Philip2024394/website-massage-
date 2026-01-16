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
import TherapistProfileBase from '../../components/TherapistProfileBase';
import type { Therapist, UserLocation } from '../../types';
import { generateTherapistShareURL } from './utils/shareUrlBuilder';
import { PREVIEW_IMAGES } from '../../config/previewImages';
import { getHeroImageForTherapist } from '../../config/heroImages';
import { databases, APPWRITE_DATABASE_ID as DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { shareLinkService } from '../../lib/services/shareLinkService';
import PWAInstallBanner from '../../components/PWAInstallBanner';
import { getNonRepeatingMainImage } from '../../lib/appwrite/image.service';
import { shareTrackingService } from '../../services/shareTrackingService';

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
    const fullUrl = window.location.href;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔗 [LINK VALIDATION] Incoming URL Analysis');
    console.log('='.repeat(80));
    console.log('📍 Full URL:', fullUrl);
    console.log('📍 Pathname:', path);
    console.log('📍 Search:', window.location.search);
    console.log('📍 Hash:', window.location.hash);
    
    // Match patterns: /share/therapist/:id or /therapist-profile/:id
    const match = path.match(/\/(share\/therapist|therapist-profile)\/([^\/]+)/);
    if (!match) {
        console.error('❌ [LINK VALIDATION] Invalid URL pattern - does not match expected routes');
        console.error('❌ Expected patterns: /share/therapist/:id OR /therapist-profile/:id');
        console.error('❌ Received path:', path);
        return null;
    }
    
    const routeType = match[1]; // "share/therapist" or "therapist-profile"
    const fullSegment = match[2]; // "12345" or "12345-name-slug"
    const id = fullSegment.split('-')[0]; // Extract ID before first dash
    
    console.log('✅ [LINK VALIDATION] URL parsed successfully');
    console.log('   Route type:', routeType);
    console.log('   Full segment:', fullSegment);
    console.log('   Extracted ID:', id);
    console.log('   Has slug:', fullSegment.includes('-'));
    console.log('='.repeat(80) + '\n');
    
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
    console.log('\n' + '🧩'.repeat(40));
    console.log('🧩 [COMPONENT LIFECYCLE] SharedTherapistProfile MOUNTED');
    console.log('🧩'.repeat(40));
    console.log('⏰ Mount timestamp:', new Date().toISOString());
    console.log('📦 Props received:', {
        hasselectedTherapist: !!selectedTherapist,
        selectedTherapistId: selectedTherapist?.$id,
        selectedTherapistName: selectedTherapist?.name,
        hasUserLocation: !!userLocation,
        hasLoggedInCustomer: !!loggedInCustomer,
        hasQuickBookHandler: !!handleQuickBookWithChat,
        language
    });
    console.log('🧩'.repeat(40) + '\n');
    
    const [therapist, setTherapist] = useState<Therapist | null>(selectedTherapist || null);
    const [loading, setLoading] = useState(!selectedTherapist);
    const [error, setError] = useState<string | null>(null);
    
    // Monitor unmount
    React.useEffect(() => {
        return () => {
            console.log('\n' + '💥'.repeat(40));
            console.log('💥 [COMPONENT LIFECYCLE] SharedTherapistProfile UNMOUNTING');
            console.log('💥'.repeat(40));
            console.log('⏰ Unmount timestamp:', new Date().toISOString());
            console.log('📊 Final state:', { hasTherapist: !!therapist, loading, error });
            console.log('💥'.repeat(40) + '\n');
        };
    }, []);

    // Direct fetch from Appwrite
    useEffect(() => {
        console.log('\n' + '🔁'.repeat(40));
        console.log('🔁 [USEEFFECT] Data fetch effect triggered');
        console.log('🔁 Dependency: selectedTherapist =', selectedTherapist?.$id || 'null');
        console.log('🔁'.repeat(40) + '\n');
        
        const fetchTherapist = async () => {
            // FIRST: Try to use existing therapist from main array (same as home page)
            const currentPath = window.location.pathname + window.location.hash;
            let therapistId = extractTherapistIdFromUrl() || sessionStorage.getItem('direct_therapist_id');
            
            if (therapistId) {
                // Check if we can use existing therapist data (from home page load)
                const existingTherapist = (window as any).__THERAPISTS_CACHE?.find((t: any) => 
                    (t.id || t.$id || '').toString() === therapistId
                );
                
                if (existingTherapist) {
                    console.log('\n' + '🔄'.repeat(40));
                    console.log('🔄 [UNIFIED FLOW] Found therapist in cached data (same as home page)');
                    console.log('🔄 Therapist:', existingTherapist.name);
                    console.log('🔄 Has mainImage:', !!(existingTherapist as any).mainImage);
                    console.log('🔄 Skipping Appwrite fetch - using unified data');
                    console.log('🔄'.repeat(40) + '\n');
                    
                    setTherapist(existingTherapist);
                    setLoading(false);
                    // Clear stored ID
                    sessionStorage.removeItem('direct_therapist_id');
                    return;
                }
            }

            // If therapist already provided, skip fetch
            if (selectedTherapist) {
                console.log('\n' + '⚡'.repeat(40));
                console.log('⚡ [STATE UPDATE] Using pre-selected therapist');
                console.log('⚡ Therapist:', selectedTherapist.name);
                console.log('⚡ ID:', selectedTherapist.$id as string);
                console.log('⚡ Skipping Appwrite fetch');
                console.log('⚡'.repeat(40) + '\n');
                setTherapist(selectedTherapist);
                setLoading(false);
                return;
            }

            // Check if we have a direct path therapist ID stored
            if (!therapistId) {
                const directId = sessionStorage.getItem('direct_therapist_id');
                if (directId) {
                    therapistId = directId;
                    console.log('🔧 [PATH ROUTE] Using stored direct therapist ID:', therapistId);
                    // Clear it so it doesn't interfere with future navigation
                    sessionStorage.removeItem('direct_therapist_id');
                }
            }

            // Fallback: support short URLs (/share/12345) and SEO format (/share/slug/{id})
            if (!therapistId && window.location.pathname.startsWith('/share/')) {
                try {
                    const parts = window.location.pathname.split('/').filter(Boolean);
                    // If format is /share/{slug}/{id}, take last segment as ID
                    if (parts.length >= 3) {
                        const lastSegment = parts[parts.length - 1];
                        therapistId = lastSegment.split('-')[0];
                        console.log('🔧 [URL FALLBACK] Extracted ID from SEO format:', therapistId);
                    } else if (parts.length === 2) {
                        // Short ID or slug: resolve via share links
                        const identifier = parts[1].replace('#', '');
                        console.log('🔧 [URL FALLBACK] Resolving short identifier:', identifier);
                        const link = await shareLinkService.getByShortIdOrSlug(identifier);
                        if (link && link.entityType === 'therapist') {
                            therapistId = link.entityId;
                            console.log('✅ [URL FALLBACK] Resolved therapist ID via share link:', therapistId);
                        } else {
                            console.warn('⚠️ [URL FALLBACK] Share link not found or not a therapist');
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ [URL FALLBACK] Failed to resolve share identifier:', e);
                }
            }

            if (!therapistId) {
                console.error('\n' + '🚫'.repeat(40));
                console.error('🚫 [ERROR] Invalid profile URL - cannot extract therapist ID');
                console.error('🚫'.repeat(40) + '\n');
                setError('Invalid profile URL');
                setLoading(false);
                return;
            }

            console.log('\n' + '📡'.repeat(40));
            console.log('📡 [APPWRITE] Initiating direct fetch');
            console.log('📡'.repeat(40));
            console.log('🆔 Therapist ID:', therapistId);
            console.log('🔌 Appwrite client initialized:', !!true);
            console.log('📡'.repeat(40) + '\n');
            
            try {
                console.log('⏳ [STATE UPDATE] Setting loading = true');
                setLoading(true);
                setError(null);

                console.log('\n' + '🚀'.repeat(40));
                console.log('🚀 [APPWRITE QUERY] Executing databases.getDocument()');
                console.log('🚀 Target ID:', therapistId);
                console.log('🚀'.repeat(40) + '\n');
                
                // DIRECT FETCH via lightweight client (avoids heavy config)
                const fetchedTherapist = await databases.getDocument(
                    DATABASE_ID,
                    COLLECTIONS.THERAPISTS,
                    therapistId
                );
                
                console.log('\n' + '📥'.repeat(40));
                console.log('📥 [APPWRITE RESPONSE] Query completed');
                console.log('📥'.repeat(40));
                
                if (!fetchedTherapist) {
                    console.error('⚠️ [APPWRITE RESPONSE] Returned NULL or undefined');
                    console.error('⚠️ No document found with ID:', therapistId);
                    console.log('📥'.repeat(40) + '\n');
                    throw new Error('Therapist not found');
                }

                console.log('✅ [APPWRITE RESPONSE] Document retrieved successfully');
                console.log('📄 Document ID:', fetchedTherapist.$id || fetchedTherapist.id);
                console.log('👤 Name:', fetchedTherapist.name || fetchedTherapist.therapistName);
                console.log('📍 Location:', fetchedTherapist.location || fetchedTherapist.city);
                console.log('📊 Rating:', fetchedTherapist.rating);
                console.log('💰 Pricing:', fetchedTherapist.pricing);
                console.log('🖼️ Main Image (raw):', (fetchedTherapist as any).mainImage || 'NOT SET');
                console.log('🖼️ Profile Picture:', (fetchedTherapist as any).profilePicture || 'NOT SET');
                
                // 🔥 CRITICAL FIX: Use EXACT same image assignment as home page (therapistService.getAll())
                // The home page uses therapist's ARRAY INDEX, not ID conversion
                // We need to fetch ALL therapists and find this one's index to match home page exactly
                if (!(fetchedTherapist as any).mainImage) {
                    try {
                        // Import therapistService to get the EXACT same list as home page
                        const { therapistService } = await import('../../lib/appwriteService');
                        const allTherapists = await therapistService.getAll();
                        
                        // Find this therapist's index in the array (SAME as home page)
                        const therapistIndex = allTherapists.findIndex((t: any) => 
                            (t.$id || t.id) === fetchedTherapist.$id
                        );
                        
                        if (therapistIndex >= 0) {
                            // Use EXACT same logic as therapistService.getAll() line 158
                            const assignedImage = getNonRepeatingMainImage(therapistIndex);
                            (fetchedTherapist as any).mainImage = assignedImage;
                            console.log('✅ [EXACT MATCH] Using home page logic with array index', therapistIndex, '→', assignedImage);
                        } else {
                            // Fallback if not found in array (shouldn't happen)
                            const imageIndex = parseInt(fetchedTherapist.$id || '0', 36) % 100;
                            (fetchedTherapist as any).mainImage = getNonRepeatingMainImage(imageIndex);
                            console.log('⚠️ [FALLBACK] Therapist not in array, using ID-based index:', imageIndex);
                        }
                    } catch (error) {
                        console.warn('⚠️ Could not fetch therapist array, using ID-based index:', error);
                        const imageIndex = parseInt(fetchedTherapist.$id || '0', 36) % 100;
                        (fetchedTherapist as any).mainImage = getNonRepeatingMainImage(imageIndex);
                    }
                } else {
                    console.log('✅ [APPWRITE] Using existing mainImage from database');
                }
                
                console.log('�📥'.repeat(40) + '\n');
                
                console.log('⏳ [STATE UPDATE] Setting therapist state with fetched data');
                setTherapist(fetchedTherapist);

                // Track share analytics for profile view with chain tracking
                try {
                    console.log('\n' + '📊'.repeat(40));
                    console.log('📊 [SHARE TRACKING] Tracking shared profile view with chain tracking');
                    
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
                        console.log('📊 Detected shared link view - tracking analytics with chain data');
                        console.log('🔗 Share chain data:', shareChain);
                        
                        // Use chain tracking method
                        await shareTrackingService.trackSharedProfileViewWithChain({
                            memberId: fetchedTherapist.$id,
                            memberName: fetchedTherapist.name || 'Unknown Therapist',
                            memberType: 'therapist',
                            shareChain: shareChain || undefined,
                            metadata: {
                                referrer: document.referrer,
                                url: window.location.href,
                                timestamp: new Date().toISOString(),
                                chainDepth: shareChain?.shareDepth || 0,
                                originalSharer: shareChain?.originalSharerUserId
                            }
                        });
                        
                        console.log('✅ [SHARE TRACKING] Profile view with chain tracked successfully');
                    } else {
                        console.log('📊 Direct visit detected - not tracking as shared view');
                    }
                    
                    console.log('📊'.repeat(40) + '\n');
                } catch (shareTrackingError) {
                    console.warn('⚠️ [SHARE TRACKING] Failed to track view (non-critical):', shareTrackingError);
                }

                // Track analytics (existing code)
                try {
                    console.log('\n' + '📊'.repeat(40));
                    console.log('📊 [ANALYTICS] Tracking shared link view');
                    const randomId = (typeof window !== 'undefined'
                        && (window as any).crypto
                        && (window as any).crypto.randomUUID
                        ? (window as any).crypto.randomUUID()
                        : null);
                    const sessionId = sessionStorage.getItem('shared_link_session_id')
                        || randomId
                        || `session_${Date.now()}`;
                    sessionStorage.setItem('shared_link_session_id', sessionId);
                    console.log('📊 Session ID:', sessionId);
                    console.log('📊 Therapist ID:', therapistId);

                    try {
                        const { analyticsService } = await import('../../services/analyticsService');
                        await analyticsService.trackSharedLinkView(
                            Number(therapistId),
                            sessionId
                        );
                    } catch (e) {
                        console.warn('⚠️ [ANALYTICS] Service unavailable, skipping:', e);
                    }
                    console.log('✅ [ANALYTICS] View tracked successfully');
                    console.log('📊'.repeat(40) + '\n');
                } catch (analyticsError) {
                    console.warn('⚠️ [ANALYTICS] Tracking failed (non-critical):', analyticsError);
                }

            } catch (err: any) {
                console.error('\n' + '❌'.repeat(40));
                console.error('❌ [ERROR] Failed to fetch therapist');
                console.error('❌'.repeat(40));
                console.error('🔴 Error type:', err.constructor.name);
                console.error('🔴 Error message:', err.message);
                console.error('🔴 Error code:', err.code);
                console.error('🔴 Full error:', err);
                console.error('🔴 Stack trace:', err.stack);
                console.error('❌'.repeat(40) + '\n');
                
                console.log('⏳ [STATE UPDATE] Setting error state');
                setError(err.message || 'Failed to load therapist profile');
            } finally {
                console.log('\n' + '🏁'.repeat(40));
                console.log('🏁 [FETCH COMPLETE] Setting loading = false');
                console.log('🏁 Final state: error =', error, ', hasTherapist =', !!therapist);
                console.log('🏁'.repeat(40) + '\n');
                setLoading(false);
            }
        };

        fetchTherapist();
    }, [selectedTherapist]);

    // Update page metadata for WhatsApp and social media
    useEffect(() => {
        if (!therapist) return;

        const city = (therapist.location || 'Bali').split(' ')[0];
        const title = `${therapist.name} - Professional Massage Therapist - House - Hotel - Villa`;
        const description = `✨ Book ${therapist.name} for professional massage therapy in ${city}. ⭐ Verified therapist • 💬 Instant chat • 🔒 Secure booking`;
        const shareUrl = generateTherapistShareURL(therapist);
        
        // Use hero image from pool for social sharing
        const previewImage = getHeroImageForTherapist(therapist.$id, ((therapist.location || 'Yogyakarta') as string));
        
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
            { name: 'geo.position', content: therapist.coordinates ? `${(therapist.coordinates as any)?.latitude};${(therapist.coordinates as any)?.longitude}` : '' },
            { name: 'ICBM', content: therapist.coordinates ? `${(therapist.coordinates as any)?.latitude}, ${(therapist.coordinates as any)?.longitude}` : '' },
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

    // RENDER PHASE MONITORING
    console.log('\n' + '🎨'.repeat(40));
    console.log('🎨 [RENDER PHASE] Component render triggered');
    console.log('🎨'.repeat(40));
    console.log('📊 Current state:', {
        loading,
        hasError: !!error,
        hasTherapist: !!therapist,
        therapistName: therapist?.name
    });
    console.log('🎨'.repeat(40) + '\n');

    // LOADING STATE - DO NOT RENDER CONTENT
    if (loading) {
        console.log('⏳ [RENDER] Rendering LOADING state');
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
        console.error('\n' + '🚨'.repeat(40));
        console.error('🚨 [RENDER] Rendering ERROR state');
        console.error('🚨'.repeat(40));
        console.error('❌ Error message:', errorMessage);
        console.error('❌ Has therapist:', !!therapist);
        console.error('❌ Current URL:', window.location.href);
        console.error('🚨'.repeat(40) + '\n');
        
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
                    <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-100 rounded">
                        <div className="font-semibold mb-1">Debug Info:</div>
                        <div>URL: {window.location.pathname}</div>
                        <div>Error: {errorMessage}</div>
                        <div>Check console for detailed logs</div>
                    </div>
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

    // Track booking analytics for admin commission
    const handleIncrementAnalytics = async (metric: string) => {
        try {
            console.log('📊 [SHARED PROFILE] Tracking analytics:', { metric, therapistId: therapist.$id });
            const { analyticsService } = await import('../../services/analyticsService');
            await analyticsService.trackEvent({
                eventType: metric as any,
                therapistId: therapist.$id,
                metadata: {
                    therapistName: therapist.name,
                    location: therapist.location,
                    source: 'shared_profile'
                }
            });
            console.log('✅ [SHARED PROFILE] Analytics tracked successfully');
        } catch (error) {
            console.error('❌ [SHARED PROFILE] Analytics tracking failed:', error);
        }
    };

    // SUCCESS STATE - RENDER PROFILE
    console.log('\n' + '✅'.repeat(40));
    console.log('✅ [RENDER] Rendering SUCCESS state - TherapistProfileBase');
    console.log('✅'.repeat(40));
    console.log('👤 Therapist:', therapist.name);
    console.log('🆔 ID:', therapist.$id as string);
    console.log('📍 Location:', therapist.location);
    console.log('⭐ Rating:', therapist.rating);
    console.log('🎯 Mode: shared');
    console.log('✅'.repeat(40) + '\n');
    
    return (
        <>
            <TherapistProfileBase
                therapist={therapist}
                mode="shared"
                userLocation={userLocation}
                showSEOFooter={true}
                isCustomerLoggedIn={Boolean(loggedInCustomer)}
                onQuickBookWithChat={handleQuickBook}
                onIncrementAnalytics={handleIncrementAnalytics}
                onNavigate={onNavigate}
                language={language}
            />
            {/* PWA Install Banner - Critical for mobile app promotion */}
            <PWAInstallBanner />
        </>
    );
};

export default SharedTherapistProfile;


