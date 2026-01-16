/**
 * SEO Slug Generator for Therapist/Place URLs
 * Generates location-based keyword URLs for maximum SEO power
 * Examples: balimassage-surtiningsih, jakartaspa-wellness
 */

import type { Therapist, Place } from '../types';

// High-volume Indonesian & English massage search keywords by city/region
// Based on actual search data and local SEO research
export const locationKeywords: Record<string, string[]> = {
    // Bali Region (Tourist hotspot)
    'Bali': ['pijat-bali', 'massage-bali', 'pijat-tradisional-bali', 'bali-massage-traditional', 'pijat-panggilan-bali', 'spa-bali', 'pijat-hotel-bali', 'pijat-villa-bali'],
    'Ubud': ['pijat-ubud', 'massage-ubud', 'ubud-traditional-massage', 'pijat-tradisional-ubud'],
    'Seminyak': ['pijat-seminyak', 'massage-seminyak', 'seminyak-spa'],
    'Canggu': ['pijat-canggu', 'massage-canggu', 'canggu-wellness'],
    'Sanur': ['pijat-sanur', 'massage-sanur', 'sanur-traditional'],
    'Nusa Dua': ['pijat-nusa-dua', 'massage-nusa-dua', 'nusadua-spa'],
    'Kuta': ['pijat-kuta', 'massage-kuta', 'kuta-massage'],
    'Denpasar': ['pijat-denpasar', 'massage-denpasar', 'pijat-kota-denpasar'],
    
    // Jakarta (Capital city - highest volume)
    'Jakarta': ['pijat-jakarta', 'massage-jakarta', 'pijat-panggilan-jakarta', 'jasa-pijat-jakarta', 'pijat-di-jakarta', 'pijat-hotel-jakarta', 'pijat-panggilan-hotel-jakarta'],
    'Jakarta Selatan': ['pijat-jakarta-selatan', 'massage-south-jakarta', 'pijat-jaksel'],
    'Jakarta Pusat': ['pijat-jakarta-pusat', 'massage-central-jakarta', 'pijat-jakpus'],
    'Jakarta Barat': ['pijat-jakarta-barat', 'massage-west-jakarta', 'pijat-jakbar'],
    'Jakarta Timur': ['pijat-jakarta-timur', 'massage-east-jakarta', 'pijat-jaktim'],
    'Jakarta Utara': ['pijat-jakarta-utara', 'massage-north-jakarta', 'pijat-jakut'],
    
    // Other Major Cities
    'Bandung': ['pijat-bandung', 'massage-bandung', 'pijat-panggilan-bandung', 'pijat-kota-bandung', 'jasa-pijat-bandung', 'pijat-hotel-bandung'],
    'Surabaya': ['pijat-surabaya', 'massage-surabaya', 'pijat-panggilan-surabaya', 'pijat-kota-surabaya', 'pijat-hotel-surabaya'],
    'Yogyakarta': ['pijat-yogyakarta', 'massage-yogyakarta', 'pijat-panggilan-yogyakarta', 'pijat-jogja', 'massage-jogja'],
    'Semarang': ['pijat-semarang', 'massage-semarang', 'pijat-panggilan-semarang', 'pijat-kota-semarang'],
    'Medan': ['pijat-medan', 'massage-medan', 'pijat-panggilan-medan', 'pijat-kota-medan'],
    'Makassar': ['pijat-makassar', 'massage-makassar', 'pijat-panggilan-makassar', 'pijat-kota-makassar'],
    'Bogor': ['pijat-bogor', 'massage-bogor', 'pijat-panggilan-bogor', 'pijat-kota-bogor', 'jasa-pijat-bogor'],
    'Depok': ['pijat-depok', 'massage-depok', 'pijat-panggilan-depok', 'pijat-kota-depok', 'jasa-pijat-depok'],
    'Tangerang': ['pijat-tangerang', 'massage-tangerang', 'pijat-panggilan-tangerang', 'jasa-pijat-tangerang', 'pijat-bsd', 'pijat-gading-serpong'],
    'Bekasi': ['pijat-bekasi', 'massage-bekasi', 'pijat-panggilan-bekasi', 'jasa-pijat-bekasi'],
    'Malang': ['pijat-malang', 'massage-malang', 'pijat-kota-malang', 'pijat-panggilan-malang'],
    'Palembang': ['pijat-palembang', 'massage-palembang', 'pijat-kota-palembang', 'pijat-panggilan-palembang'],
    'Pekanbaru': ['pijat-pekanbaru', 'massage-pekanbaru', 'pijat-kota-pekanbaru', 'pijat-panggilan-pekanbaru'],
    'Balikpapan': ['pijat-balikpapan', 'massage-balikpapan', 'pijat-kota-balikpapan', 'pijat-panggilan-balikpapan'],
    'Lombok': ['pijat-lombok', 'massage-lombok', 'lombok-traditional-massage', 'pijat-senggigi'],
    'Batam': ['pijat-batam', 'massage-batam', 'pijat-panggilan-batam'],
    'Manado': ['pijat-manado', 'massage-manado', 'pijat-panggilan-manado'],
    'Denpasar Barat': ['pijat-denpasar-barat', 'massage-denpasar-barat'],
    'Jimbaran': ['pijat-jimbaran', 'massage-jimbaran', 'pijat-villa-jimbaran'],
    'Legian': ['pijat-legian', 'massage-legian', 'pijat-panggilan-legian'],
    
    // Generic Indonesia
    'Indonesia': ['pijat-indonesia', 'massage-indonesia', 'pijat-tradisional-indonesia', 'indonesian-massage'],
};

// Service type keywords (Indonesian + English)
export const serviceKeywords = {
    // Call-out service (highest volume in Indonesia)
    callOut: ['pijat-panggilan', 'massage-call', 'pijat-ke-rumah', 'home-massage', 'outcall-massage'],
    
    // Traditional massage (very popular)
    traditional: ['pijat-tradisional', 'traditional-massage', 'pijat-bali', 'balinese-massage', 'pijat-urut'],
    
    // Reflexology
    reflexology: ['pijat-refleksi', 'reflexology', 'pijat-refleksi-kaki', 'foot-reflexology', 'pijat-kaki'],
    
    // Relaxation
    relaxation: ['pijat-relaksasi', 'relaxation-massage', 'pijat-tubuh', 'body-massage', 'pijat-badan'],
    
    // Sports massage
    sports: ['pijat-olahraga', 'sports-massage', 'pijat-olahraga-pro', 'athlete-massage'],
    
    // Health/Therapy
    health: ['pijat-kesehatan', 'health-massage', 'pijat-terapi', 'therapy-massage', 'fisioterapi-pijat'],
    
    // Spa
    spa: ['spa-massage', 'pijat-spa', 'spa-wellness', 'pijat-relaksasi-spa', 'massage-spa'],
    
    // Specific benefits
    backPain: ['pijat-sakit-punggung', 'back-pain-massage', 'pijat-punggung', 'pijat-nyeri-punggung'],
    antiStress: ['pijat-anti-stres', 'stress-relief-massage', 'pijat-relaksasi-tubuh'],
    healing: ['pijat-penyembuhan', 'healing-massage', 'pijat-healing', 'therapeutic-massage'],
    
    // Premium
    premium: ['pijat-premium', 'premium-massage', 'pijat-spa-premium', 'luxury-massage'],
    
    // Professional
    professional: ['pijat-profesional', 'professional-massage', 'terapis-profesional', 'jasa-pijat-profesional'],
    
    // 24/7
    fullTime: ['pijat-24-jam', '24-hour-massage', 'massage-anytime'],
    
    // Affordable
    affordable: ['pijat-murah', 'affordable-massage', 'pijat-terjangkau', 'cheap-massage'],
    
    // Trusted
    trusted: ['pijat-terpercaya', 'trusted-massage', 'jasa-pijat-terpercaya', 'verified-massage']
};

/**
 * Generate SEO-optimized slug from therapist data
 * Format: {location-keyword}-{service-keyword}-{therapist-name} OR {location-keyword}-{therapist-name}
 * Examples: 
 * - pijat-jakarta-surtiningsih
 * - massage-bali-professional-budi
 * - pijat-panggilan-bandung-wellness
 */
export function generateTherapistSlug(therapist: Therapist, includeService: boolean = false): string {
    // Get city from therapist profile
    const city = therapist.city || extractCityFromLocation(therapist.location);
    
    // Get location keywords for the city
    const cityKeywords = locationKeywords[city] || locationKeywords['Indonesia'];
    
    // Use first keyword (highest search volume)
    const locationKeyword = cityKeywords[0];
    
    // Clean therapist name for URL
    const cleanName = therapist.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Remove multiple hyphens
        .trim();
    
    // Optionally add service keyword for more SEO power
    if (includeService) {
        // Determine service type from therapist data
        const massageTypes = therapist.massageTypes ? 
            (typeof therapist.massageTypes === 'string' ? JSON.parse(therapist.massageTypes) : therapist.massageTypes) 
            : [];
        
        let serviceKeyword = 'professional';
        
        if (massageTypes.includes('Traditional')) serviceKeyword = 'tradisional';
        else if (massageTypes.includes('Reflexology')) serviceKeyword = 'refleksi';
        else if (massageTypes.includes('Sports')) serviceKeyword = 'olahraga';
        else if (therapist.membershipTier === 'premium') serviceKeyword = 'premium';
        
        return `${locationKeyword}-${serviceKeyword}-${cleanName}`;
    }
    
    return `${locationKeyword}-${cleanName}`;
}

/**
 * Generate SEO-optimized slug from place data
 * Format: {location-keyword}-{place-name}
 * Example: balispa-wellness-center
 */
export function generatePlaceSlug(place: Place): string {
    const city = place.city || extractCityFromLocation(place.location);
    const cityKeywords = locationKeywords[city] || ['indonesiaspa'];
    
    // Prefer spa keyword for places
    const locationKeyword = cityKeywords.find(kw => kw.includes('spa')) || cityKeywords[0];
    
    const cleanName = place.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    return `${locationKeyword}-${cleanName}`;
}

/**
 * Extract city name from location string
 */
function extractCityFromLocation(location: string): string {
    const knownCities = Object.keys(locationKeywords);
    
    for (const city of knownCities) {
        if (location.toLowerCase().includes(city.toLowerCase())) {
            return city;
        }
    }
    
    return 'Indonesia'; // Default fallback
}

/**
 * Generate full shareable URL with SEO slug
 */
export function generateShareableURL(
    therapist: Therapist,
    baseUrl?: string
): string {
    // Always prefer the live site for sharing; fall back to current origin if not localhost
    const origin = (() => {
        const preferred = baseUrl || (typeof window !== 'undefined' ? window.location.origin : undefined);
        if (!preferred) return 'https://www.indastreetmassage.com';
        const lower = preferred.toLowerCase();
        const isLocal = lower.includes('localhost') || lower.includes('127.0.0.1') || /:\d{2,5}$/.test(lower);
        return isLocal ? 'https://www.indastreetmassage.com' : preferred;
    })();

    const slug = generateTherapistSlug(therapist);
    const therapistId = (therapist as any).id ?? (therapist as any).$id ?? '';
    const pathSegment = therapistId ? `${therapistId}-${slug}` : slug;
    return `${origin}/#/therapist-profile/${pathSegment}`;
}

/**
 * Parse slug to extract therapist identifier
 * Returns the therapist name portion for lookup
 * Handles multi-part location keywords like "pijat-panggilan-jakarta"
 */
export function parseSlugToName(slug: string): string {
    // Find which location keyword this slug starts with
    for (const keywords of Object.values(locationKeywords)) {
        for (const keyword of keywords) {
            if (slug.startsWith(keyword + '-')) {
                // Remove the location keyword and return the rest
                return slug.substring(keyword.length + 1); // +1 for the hyphen
            }
        }
    }
    
    // Fallback: if no keyword matched, return as-is
    return slug;
}

/**
 * Check if a URL is using SEO slug format
 */
export function isSEOSlugURL(pathname: string): boolean {
    const slug = pathname.replace(/^\//, '');
    
    // Check if it matches any location keyword pattern
    for (const keywords of Object.values(locationKeywords)) {
        for (const keyword of keywords) {
            if (slug.startsWith(keyword + '-')) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Get all possible SEO slug variations for a therapist (for rotation/AB testing)
 * Returns multiple URL options with different keyword combinations
 */
export function getAllPossibleSlugs(therapist: Therapist): string[] {
    const city = therapist.city || extractCityFromLocation(therapist.location);
    const cityKeywords = locationKeywords[city] || locationKeywords['Indonesia'];
    
    const cleanName = therapist.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    // Generate variations with all location keywords
    const slugs = cityKeywords.map(keyword => `${keyword}-${cleanName}`);
    
    // Add service-enhanced variations for top keywords (first 3)
    const topKeywords = cityKeywords.slice(0, 3);
    topKeywords.forEach(keyword => {
        slugs.push(`${keyword}-professional-${cleanName}`);
        slugs.push(`${keyword}-terpercaya-${cleanName}`);
        slugs.push(`${keyword}-24jam-${cleanName}`);
    });
    
    return slugs;
}

/**
 * Get recommended primary slug (best SEO performance)
 */
export function getPrimarySlug(therapist: Therapist): string {
    return generateTherapistSlug(therapist, false);
}

/**
 * Get alternative slug with service keyword (for variety)
 */
export function getAlternativeSlug(therapist: Therapist): string {
    return generateTherapistSlug(therapist, true);
}
