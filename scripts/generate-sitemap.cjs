/**
 * Sitemap Generator with Multi-Region Support
 * Generates sitemap.xml with hreflang annotations for international SEO
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'https://www.indastreetmassage.com';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Supported countries with their language codes
const COUNTRIES = [
  { code: 'id', lang: 'id', name: 'Indonesia' },
  { code: 'gb', lang: 'en', name: 'United Kingdom' },
  { code: 'us', lang: 'en', name: 'United States' },
  { code: 'au', lang: 'en', name: 'Australia' },
  { code: 'sg', lang: 'en', name: 'Singapore' },
  { code: 'my', lang: 'en', name: 'Malaysia' },
  { code: 'th', lang: 'th', name: 'Thailand' },
  { code: 'ph', lang: 'en', name: 'Philippines' },
  { code: 'cn', lang: 'zh', name: 'China' },
  { code: 'jp', lang: 'ja', name: 'Japan' },
  { code: 'kr', lang: 'ko', name: 'South Korea' },
  { code: 'ru', lang: 'ru', name: 'Russia' },
  { code: 'ca', lang: 'en', name: 'Canada' },
  { code: 'in', lang: 'en', name: 'India' },
];

// Static pages that should be included in sitemap
const STATIC_PAGES = [
  { path: '', priority: 1.0, changefreq: 'daily' }, // Home
  { path: '/about', priority: 0.8, changefreq: 'monthly' },
  { path: '/contact', priority: 0.8, changefreq: 'monthly' },
  { path: '/faq', priority: 0.7, changefreq: 'monthly' },
  { path: '/how-it-works', priority: 0.8, changefreq: 'monthly' },
  { path: '/massage-types', priority: 0.7, changefreq: 'monthly' },
  { path: '/service-terms', priority: 0.6, changefreq: 'yearly' },
  { path: '/privacy-policy', priority: 0.6, changefreq: 'yearly' },
];

/**
 * Generate hreflang alternate links for a URL
 */
function generateHreflangLinks(pagePath, indent = '    ') {
  return COUNTRIES.map(({ code, lang }) => {
    const url = `${BASE_URL}/${code}${pagePath}`;
    return `${indent}<xhtml:link rel="alternate" hreflang="${lang}" href="${url}"/>`;
  }).join('\n');
}

/**
 * Generate URL entry with hreflang annotations
 */
function generateUrlEntry(pagePath, priority = 0.8, changefreq = 'monthly') {
  const lastmod = new Date().toISOString().split('T')[0];
  
  return COUNTRIES.map(({ code }) => {
    const url = `${BASE_URL}/${code}${pagePath}`;
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${generateHreflangLinks(pagePath)}
  </url>`;
  }).join('\n');
}

/**
 * Generate complete sitemap.xml
 */
function generateSitemap() {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">`;

  const footer = `</urlset>`;

  // Generate entries for all static pages across all countries
  const urlEntries = STATIC_PAGES.map(page => 
    generateUrlEntry(page.path, page.priority, page.changefreq)
  ).join('\n');

  return `${header}\n${urlEntries}\n${footer}`;
}

/**
 * Write sitemap to file
 */
function writeSitemap() {
  try {
    const sitemap = generateSitemap();
    
    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf8');
    console.log('✅ Sitemap generated successfully:', OUTPUT_PATH);
    console.log(`📄 Total URLs: ${STATIC_PAGES.length * COUNTRIES.length}`);
    console.log(`🌍 Countries: ${COUNTRIES.map(c => c.code.toUpperCase()).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  }
}

// Generate sitemap when run directly
if (require.main === module) {
  writeSitemap();
}

module.exports = { generateSitemap, writeSitemap };
