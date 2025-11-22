/**
 * SEO Helpers for Multi-Region Support
 * Manages hreflang tags, dynamic meta tags, and regional SEO optimization
 */

export interface SEOConfig {
  title: string;
  description: string;
  geoRegion?: string; // e.g., 'ID-BA', 'GB-ENG'
  geoPlacename?: string; // e.g., 'Bali, Indonesia', 'London, UK'
  geoCoordinates?: { lat: number; lng: number };
  ogLocale: string; // e.g., 'id_ID', 'en_GB'
  ogLocaleAlternates?: string[]; // e.g., ['en_US', 'en_GB']
  keywords?: string;
  canonicalUrl: string;
}

/**
 * Update or create hreflang tags for multi-region SEO
 * @param countries - Array of country codes with their URLs
 */
export function updateHreflangTags(countries: Array<{ code: string; url: string; lang: string }>) {
  const head = document.querySelector('head');
  if (!head) return;

  // Remove existing hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

  // Add new hreflang tags
  countries.forEach(({ code, url, lang }) => {
    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = lang;
    link.href = url;
    head.appendChild(link);
  });

  // Add x-default for international fallback
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = countries[0]?.url || window.location.origin;
  head.appendChild(defaultLink);

  console.log('✅ Updated hreflang tags for', countries.length, 'regions');
}

/**
 * Update dynamic meta tags based on active country
 */
export function updateMetaTags(config: SEOConfig) {
  // Update title
  document.title = config.title;

  // Update or create meta tags
  const updateOrCreateMeta = (name: string, content: string, property?: boolean) => {
    const attribute = property ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }
    
    meta.setAttribute('content', content);
  };

  // Basic meta
  updateOrCreateMeta('description', config.description);
  if (config.keywords) updateOrCreateMeta('keywords', config.keywords);

  // Geo meta
  if (config.geoRegion) updateOrCreateMeta('geo.region', config.geoRegion);
  if (config.geoPlacename) updateOrCreateMeta('geo.placename', config.geoPlacename);
  if (config.geoCoordinates) {
    updateOrCreateMeta('geo.position', `${config.geoCoordinates.lat};${config.geoCoordinates.lng}`);
    updateOrCreateMeta('ICBM', `${config.geoCoordinates.lat}, ${config.geoCoordinates.lng}`);
  }

  // Open Graph
  updateOrCreateMeta('og:title', config.title, true);
  updateOrCreateMeta('og:description', config.description, true);
  updateOrCreateMeta('og:locale', config.ogLocale, true);
  updateOrCreateMeta('og:url', config.canonicalUrl, true);

  // OG locale alternates
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
  config.ogLocaleAlternates?.forEach(locale => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:locale:alternate');
    meta.setAttribute('content', locale);
    document.head.appendChild(meta);
  });

  // Twitter
  updateOrCreateMeta('twitter:title', config.title, true);
  updateOrCreateMeta('twitter:description', config.description, true);

  // Canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', config.canonicalUrl);

  console.log('✅ Updated meta tags for:', config.geoPlacename || config.geoRegion || 'default');
}

/**
 * Update structured data (JSON-LD) for regional content
 */
export function updateStructuredData(countryCode: string, seoConfig: SEOConfig) {
  // Remove existing LocalBusiness structured data
  document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '{}');
      if (data['@type'] === 'LocalBusiness') {
        script.remove();
      }
    } catch {}
  });

  // Create new structured data based on country
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'IndaStreet',
    url: seoConfig.canonicalUrl,
    description: seoConfig.description,
    ...(seoConfig.geoCoordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: seoConfig.geoCoordinates.lat,
        longitude: seoConfig.geoCoordinates.lng,
      }
    }),
    ...(seoConfig.geoPlacename && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: seoConfig.geoPlacename.split(',')[0]?.trim(),
        addressCountry: countryCode,
      }
    }),
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(structuredData, null, 2);
  document.head.appendChild(script);

  console.log('✅ Updated structured data for:', countryCode);
}

/**
 * Initialize all SEO helpers for a given country
 */
export function initializeSEO(
  countryCode: string,
  seoConfig: SEOConfig,
  availableCountries: Array<{ code: string; lang: string }>
) {
  const baseUrl = window.location.origin;

  // Build hreflang entries
  const hreflangEntries = availableCountries.map(({ code, lang }) => ({
    code,
    lang,
    url: `${baseUrl}/${code.toLowerCase()}`,
  }));

  updateHreflangTags(hreflangEntries);
  updateMetaTags(seoConfig);
  updateStructuredData(countryCode, seoConfig);
}
