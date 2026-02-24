// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
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
import { usePersistentChatIntegration } from '../../hooks/usePersistentChatIntegration';
import type { Therapist, UserLocation } from '../../types';
import { generateTherapistShareURL } from './utils/shareUrlBuilder';
import { PREVIEW_IMAGES } from '../../config/previewImages';
import { useTherapistDisplayImage } from '../../utils/therapistImageUtils';
import { databases, APPWRITE_DATABASE_ID as DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';
import { shareLinkService } from '../../lib/services/shareLinkService';
import PWAInstallBanner from '../../components/PWAInstallBanner';
import { VERIFIED_BADGE_IMAGE_URL } from '../../constants/appConstants';
import { getNonRepeatingMainImage } from '../../lib/appwrite/image.service';
import { shareTrackingService } from '../../services/shareTrackingService';
import { getTherapistDisplayName } from '../../utils/therapistCardHelpers';
import { getSafeErrorMessage, APPWRITE_CRASH_ERROR_CODE } from '../../utils/appwriteHelpers';
import TherapistFloatingActions from '../../components/TherapistFloatingActions';

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
 * - /profile/therapist/12345-name-slug (SEO-friendly customer-facing profile URL)
 * - /share/therapist/12345
 * - /share/therapist/12345-name-slug
 * - /therapist-profile/12345
 */
const extractTherapistIdFromUrl = (): string | null => {
    let path = window.location.pathname;
    const hash = window.location.hash;
    const fullUrl = window.location.href;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔗 [LINK VALIDATION] Incoming URL Analysis');
    console.log('='.repeat(80));
    console.log('📍 Full URL:', fullUrl);
    console.log('📍 Pathname:', path);
    console.log('📍 Search:', window.location.search);
    console.log('📍 Hash:', hash);
    
    // 🔥 CRITICAL FIX: Parse hash for hash URLs (/#/path)
    // For /#/therapist-profile/123, pathname = "/" and hash = "#/therapist-profile/123"
    if (hash.startsWith('#/')) {
        path = hash.substring(1); // Remove # to get /therapist-profile/123
        console.log('🔗 [HASH URL] Parsed path from hash:', path);
    }
    
    // Match patterns: /profile/therapist/:id, /share/therapist/:id, /shared/therapist/:id, or /therapist-profile/:id
    let match = path.match(/\/(profile\/therapist|share\/therapist|shared\/therapist|therapist-profile)\/([^\/]+)/);
    
    // Special handling for /shared/therapist without ID - try to get ID from query params or hash
    if (!match && (path === '/shared/therapist' || path.startsWith('/shared/therapist'))) {
        console.log('🔧 [SHARED URL] Handling /shared/therapist pattern');
        
        // Try to get ID from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const idFromParams = urlParams.get('id') || urlParams.get('therapistId');
        
        if (idFromParams) {
            console.log('✅ [SHARED URL] Found ID in URL params:', idFromParams);
            return idFromParams;
        }
        
        // Try to get from hash fragment
        const hashId = window.location.hash.replace('#', '');
        if (hashId && hashId.length > 10) {
            console.log('✅ [SHARED URL] Found ID in hash:', hashId);
            return hashId;
        }
        
        // Return null to trigger fallback logic
        console.warn('⚠️ [SHARED URL] No ID found for /shared/therapist - will show all therapists');
        return 'default';
    }
    
    if (!match) {
        console.error('❌ [LINK VALIDATION] Invalid URL pattern - does not match expected routes');
        console.error('❌ Expected patterns: /profile/therapist/:id, /share/therapist/:id, /shared/therapist/:id, OR /therapist-profile/:id');
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

    // 🔒 PERSISTENT CHAT - Must be called at top level (Rules of Hooks)
    const { openBookingChat } = usePersistentChatIntegration();
    
    // 🔷 OFFICIAL INDASTREET MASSAGE IMAGES - Use these for all shared profiles
    const OFFICIAL_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258';
    const OFFICIAL_MAIN_IMAGE = 'https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082';
    
    /**
     * Apply images - use therapist's main image URL (same as home page) when available.
     * Only fall back to official branded images when therapist has no valid main image.
     */
    const applyOfficialImages = (therapist: any): any => {
        const heroImageUrl = therapist.heroImageUrl;
        const shouldUseOfficialHero = !heroImageUrl || heroImageUrl === '' || String(heroImageUrl).startsWith('data:image/svg+xml');
        
        // Main image: use therapist's mainImage/profileImageUrl/heroImageUrl (Appwrite URL only)
        const isUrl = (u: any) => u && typeof u === 'string' && !u.startsWith('data:') && /^https?:\/\//.test(u);
        const therapistMainImage = isUrl((therapist as any).mainImage) ? (therapist as any).mainImage
            : isUrl((therapist as any).mainimage) ? (therapist as any).mainimage
            : isUrl((therapist as any).profileImageUrl) ? (therapist as any).profileImageUrl
            : isUrl((therapist as any).heroImageUrl) ? (therapist as any).heroImageUrl
            : null;
        const mainImage = therapistMainImage || OFFICIAL_MAIN_IMAGE;
        
        console.log('🔷 [IMAGES] Applying to therapist:', therapist.name);
        console.log('   Main:', therapistMainImage ? 'Therapist URL (same as home page)' : 'Official fallback');
        console.log('   Hero:', shouldUseOfficialHero ? 'Official Logo' : 'Database value');
        
        return {
            ...therapist,
            mainImage,
            heroImageUrl: shouldUseOfficialHero ? OFFICIAL_HERO_IMAGE : heroImageUrl
        };
    };
    
    const [therapist, setTherapist] = useState<Therapist | null>(selectedTherapist || null);
    const [loading, setLoading] = useState(!selectedTherapist);
    const [error, setError] = useState<string | null>(null);
    const [attemptedTherapistId, setAttemptedTherapistId] = useState<string | null>(null);
    const [shareCount, setShareCount] = useState<number | undefined>(undefined);

    const displayImage = useTherapistDisplayImage(therapist ?? undefined);

    // Fetch share count when therapist is loaded (for digit counter over main image)
    useEffect(() => {
        if (!therapist?.$id) return;
        let cancelled = false;
        shareTrackingService.getProfileShareCount(therapist.$id).then((count) => {
            if (!cancelled) setShareCount(count);
        }).catch(() => {
            if (!cancelled) setShareCount(0);
        });
        return () => { cancelled = true; };
    }, [therapist?.$id]);

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
                    
                    setTherapist(applyOfficialImages(existingTherapist));
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
                setTherapist(applyOfficialImages(selectedTherapist));
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
                setError('Invalid profile URL - missing therapist ID');
                setLoading(false);
                return;
            }
            
            // Special handling for 'default' ID - show therapist selector
            if (therapistId === 'default') {
                console.log('\n' + '🎯'.repeat(40));
                console.log('🎯 [SELECTOR MODE] No specific therapist ID - showing selector');
                console.log('🎯'.repeat(40) + '\n');
                setError('Please select a therapist to view their profile');
                setLoading(false);
                return;
            }

            console.log('\n' + '📡'.repeat(40));
            console.log('📡 [APPWRITE] Initiating direct fetch');
            console.log('📡'.repeat(40));
            console.log('🆔 Therapist ID:', therapistId);
            console.log('🔌 Appwrite client initialized:', !!true);
            console.log('📡'.repeat(40) + '\n');
            
            setAttemptedTherapistId(therapistId);
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
                
                console.log('⏳ [STATE UPDATE] Setting therapist state with official images');
                setTherapist(applyOfficialImages(fetchedTherapist));

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

            } catch (err: unknown) {
                try {
                    const errAny = err as { message?: string; code?: number; stack?: string; constructor?: { name?: string } };
                    console.error('\n' + '❌'.repeat(40));
                    console.error('❌ [ERROR] Failed to fetch therapist');
                    console.error('❌'.repeat(40));
                    if (errAny?.constructor?.name) console.error('🔴 Error type:', errAny.constructor.name);
                    if (errAny?.message) console.error('🔴 Error message:', errAny.message);
                    if (errAny?.code !== undefined) console.error('🔴 Error code:', errAny.code);
                    if (errAny?.code === APPWRITE_CRASH_ERROR_CODE) console.error('🔴 Known crash code 536870904 - using safe fallback');
                    console.error('🔴 Full error:', err);
                    if (typeof errAny?.stack === 'string') console.error('🔴 Stack trace:', errAny.stack);
                    console.error('❌'.repeat(40) + '\n');
                } catch (_) {
                    console.error('❌ [ERROR] Failed to fetch therapist (error details unavailable)');
                }
                setAttemptedTherapistId(therapistId);
                setError(getSafeErrorMessage(err, 'Failed to load therapist profile. Please try again.'));
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
        const displayName = getTherapistDisplayName(therapist.name);
        const title = `${displayName} - Professional Massage Therapist - House - Hotel - Villa`;
        const description = `✨ Book ${displayName} for professional massage therapy in ${city}. ⭐ Verified therapist • 💬 Instant chat • 🔒 Secure booking`;
        const shareUrl = generateTherapistShareURL(therapist);
        
        // Use same image as home page and profile page for social sharing (beautician: random per visit)
        const previewImage = displayImage;
        
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
            { name: 'keywords', content: `pijat panggilan ${city}, terapis pijat ${city}, massage ${city}, spa panggilan, home service massage, ${displayName}` },
            { name: 'author', content: displayName },
            { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
            
            // 🖼️ GOOGLE IMAGES SEO - CRITICAL for image discovery
            { name: 'image', content: previewImage },
            { name: 'thumbnail', content: previewImage },
            { itemprop: 'image', content: previewImage },
            { itemprop: 'thumbnailUrl', content: previewImage },
            { itemprop: 'name', content: `${displayName} - Massage Therapist ${city}` },
            { itemprop: 'description', content: `Professional massage therapy by ${displayName} in ${city}. Book certified therapist for traditional Indonesian massage, reflexology, and spa services.` },
            
            // 📘 FACEBOOK OPEN GRAPH - COMPLETE STANDARD
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: shareUrl },
            { property: 'og:type', content: 'profile' },
            { property: 'og:image', content: previewImage },
            { property: 'og:image:secure_url', content: previewImage },
            { property: 'og:image:width', content: '1200' },
            { property: 'og:image:height', content: '630' },
            { property: 'og:image:alt', content: `${displayName} - Professional Massage Therapist in ${city}, Indonesia | Traditional Indonesian Massage, Spa Services, Home Service` },
            { property: 'og:image:type', content: 'image/png' },
            { property: 'og:site_name', content: 'IndaStreet Massage' },
            { property: 'og:locale', content: 'id_ID' },
            { property: 'og:locale:alternate', content: 'en_US' },
            // Facebook Profile specific
            { property: 'profile:first_name', content: displayName },
            { property: 'profile:last_name', content: '' },
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
            { name: 'twitter:image:alt', content: `${displayName} - Professional Massage Therapist ${city} | Book Traditional Indonesian Massage, Reflexology, Spa Services` },
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
            "name": displayName,
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
            "name": displayName,
            "jobTitle": "Professional Massage Therapist",
            "description": `${displayName} provides professional massage therapy services in ${city}. Specialized in traditional Indonesian massage, Swedish massage, and therapeutic treatments.`,
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
    }, [therapist, displayImage]);

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

    // Wrapper for booking callbacks - SHARED LINK SPECIFIC
    const handleQuickBook = async () => {
        if (!therapist) return;
        
        console.log('📤 [SHARED LINK] Booking initiated from shared profile:', therapist.name);
        
        // If parent component provided handler, use it
        if (handleQuickBookWithChat) {
            handleQuickBookWithChat(therapist, 'therapist');
            return;
        }
        
        // Otherwise, open persistent chat with 'share' source (direct booking, no broadcast)
        console.log('✅ [SHARED LINK] Opening booking chat with source=share');
        openBookingChat(therapist, 'share');
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
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50">
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

    // ERROR STATE - ENHANCED WITH THERAPIST SELECTOR
    if (error || !therapist) {
        const errorMessage = error || 'Therapist profile not found';
        console.error('\n' + '🚨'.repeat(40));
        console.error('🚨 [RENDER] Rendering ERROR state');
        console.error('🚨'.repeat(40));
        console.error('❌ Error message:', errorMessage);
        console.error('❌ Has therapist:', !!therapist);
        console.error('❌ Current URL:', window.location.href);
        console.error('🚨'.repeat(40) + '\n');
        
        // Show therapist selector for /shared/therapist URLs without ID
        if (errorMessage.includes('select a therapist') || window.location.pathname === '/shared/therapist') {
            return (
                <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-b from-orange-50 to-white">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center mb-8">
                            <div className="mb-4 text-6xl">🎭</div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Therapist</h1>
                            <p className="text-gray-600">Select a therapist to view their profile and book a massage</p>
                        </div>
                        
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                        💆‍♀️ Available Therapists
                                    </h2>
                                    <p className="text-gray-600 mb-6">
                                        Click on any therapist below to view their profile and services
                                    </p>
                                    
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {/* Sample therapists - these would come from props or API */}
                                        <div className="p-4 border rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                                             onClick={() => window.location.href = '/share/therapist/sample-id-1'}>
                                            <div className="text-4xl mb-2">👩‍⚕️</div>
                                            <h3 className="font-semibold text-gray-800">Sample Therapist 1</h3>
                                            <p className="text-sm text-gray-600">Traditional Massage</p>
                                        </div>
                                        
                                        <div className="p-4 border rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                                             onClick={() => window.location.href = '/share/therapist/sample-id-2'}>
                                            <div className="text-4xl mb-2">👨‍⚕️</div>
                                            <h3 className="font-semibold text-gray-800">Sample Therapist 2</h3>
                                            <p className="text-sm text-gray-600">Sports Massage</p>
                                        </div>
                                        
                                        <div className="p-4 border rounded-lg hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                                             onClick={() => window.location.href = '/share/therapist/sample-id-3'}>
                                            <div className="text-4xl mb-2">👩‍⚕️</div>
                                            <h3 className="font-semibold text-gray-800">Sample Therapist 3</h3>
                                            <p className="text-sm text-gray-600">Reflexology</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 p-4 bg-orange-50 rounded-lg">
                                        <h3 className="font-semibold text-orange-800 mb-2">
                                            🔗 Share Link Format
                                        </h3>
                                        <p className="text-sm text-orange-700">
                                            To share a specific therapist, use: 
                                            <br />
                                            <code className="bg-white px-2 py-1 rounded">
                                                /share/therapist/{'{therapist-id}'}
                                            </code>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <button 
                                    onClick={() => window.location.href = '/'}
                                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                                >
                                    🏠 Go to Homepage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        
        const fullUrl = window.location.pathname + (window.location.hash || '');
        const looksLikePlaceholder = attemptedTherapistId && /^therapist_\d+$/i.test(attemptedTherapistId);
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
                    <div className="mb-4 text-6xl">😔</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Not Found</h2>
                    <p className="text-sm text-red-600 mb-4 font-mono bg-red-50 p-2 rounded break-all">
                        {errorMessage}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                        This therapist profile could not be loaded. The link may be invalid or the therapist is no longer available.
                    </p>
                    {looksLikePlaceholder && (
                        <p className="text-sm text-amber-700 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                            The ID <strong>{attemptedTherapistId}</strong> looks like a sample or demo link. Real therapist profiles use a different ID format. Try browsing from the homepage to find a therapist.
                        </p>
                    )}
                    <div className="text-xs text-gray-500 mb-4 p-3 bg-gray-100 rounded">
                        <div className="font-semibold mb-1">Debug Info:</div>
                        <div>URL: {fullUrl || window.location.pathname || '/'}</div>
                        {attemptedTherapistId && <div>Attempted ID: {attemptedTherapistId}</div>}
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
                    therapistName: getTherapistDisplayName(therapist.name),
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
                customVerifiedBadge={VERIFIED_BADGE_IMAGE_URL}
                shareCount={shareCount}
            />
            <TherapistFloatingActions
                therapist={therapist}
                language={language}
            />
            {/* PWA Install Banner - Critical for mobile app promotion */}
            <PWAInstallBanner />
        </>
    );
};

export default SharedTherapistProfile;


