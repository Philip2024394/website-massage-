#!/usr/bin/env node
/**
 * Dynamic Sitemap Generator for IndaStreet Massage
 * Automatically generates sitemap.xml with all therapists, places, cities, and pages
 * Run: node scripts/generate-sitemap.mjs
 */

import { Client, Databases, Query } from 'node-appwrite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Appwrite Configuration - Sydney Region
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_API_KEY = 'standard_39f2b1fe7bcc0c48e9e2ad6fc1a9c29c84c14bb0ae4dd4ce88a68e12e5c85bf6d4974b86a19ea7c88d1c82856ccae09f96abaaca91b2eb0aa7e5a02d79e2269c2f5c2ef8b18c77feeee4d9b66c6eb07c72e4f0e7fc1e4266062e28a3c9c43b3a79e49ee28e41bca065a35d58f1d5cd0bbacf03f75c4c2da90bd74f9b20154c5a';
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';
const PLACES_COLLECTION_ID = 'places_collection_id';
const BASE_URL = 'https://www.indastreetmassage.com';

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Indonesian Cities to Include
const INDONESIAN_CITIES = [
    'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 'Semarang',
    'Medan', 'Denpasar', 'Bali', 'Makassar', 'Palembang',
    'Malang', 'Ubud', 'Seminyak', 'Canggu', 'Sanur', 'Nusa Dua',
    'Solo', 'Bogor', 'Batam', 'Pekanbaru', 'Tangerang', 'Bekasi'
];

// Static Pages Configuration
const STATIC_PAGES = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/home', priority: '0.9', changefreq: 'daily' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/contact', priority: '0.8', changefreq: 'monthly' },
    { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
    { path: '/faq', priority: '0.7', changefreq: 'monthly' },
    { path: '/massage-types', priority: '0.7', changefreq: 'monthly' },
    { path: '/facial-types', priority: '0.8', changefreq: 'weekly' },
    { path: '/massage-jobs', priority: '0.9', changefreq: 'daily' },
    { path: '/employer-job-posting', priority: '0.8', changefreq: 'weekly' },
    { path: '/partners', priority: '0.9', changefreq: 'daily' },
    { path: '/join-indastreet-partners', priority: '0.9', changefreq: 'weekly' },
    { path: '/membership', priority: '0.8', changefreq: 'weekly' },
    { path: '/blog', priority: '0.9', changefreq: 'weekly' },
    { path: '/therapist-info', priority: '0.9', changefreq: 'weekly' },
    { path: '/employer-info', priority: '0.9', changefreq: 'weekly' },
    { path: '/hotel-info', priority: '0.9', changefreq: 'weekly' },
];

// Blog Posts
const BLOG_POSTS = [
    'blog-bali-spa-trends-2025',
    'blog-top-10-massage-techniques',
    'blog-massage-career-indonesia',
    'blog-benefits-regular-massage',
    'blog-hiring-massage-therapists',
    'blog-traditional-balinese-massage',
    'blog-spa-tourism-indonesia',
    'blog-aromatherapy-massage-oils',
    'blog-pricing-guide-massage',
    'blog-deep-tissue-vs-swedish',
    'blog-online-presence-therapist',
    'blog-wellness-tourism-ubud'
];

/**
 * Escape XML special characters
 */
function escapeXml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Create SEO-friendly slug from name and city
 */
function createSlug(name, city) {
    const cleanName = name.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    
    const cleanCity = city ? city.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() : '';
    
    return cleanCity ? `${cleanName}-${cleanCity}` : cleanName;
}

/**
 * Fetch all therapists from Appwrite
 */
async function fetchTherapists() {
    try {
        console.log('📥 Fetching therapists from Appwrite...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );
        console.log(`✅ Fetched ${response.documents.length} therapists`);
        return response.documents;
    } catch (error) {
        console.error('❌ Error fetching therapists:', error.message);
        console.log('⚠️  Continuing with static sitemap generation...');
        return [];
    }
}

/**
 * Fetch all massage places from Appwrite
 */
async function fetchPlaces() {
    try {
        console.log('📥 Fetching massage places from Appwrite...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            PLACES_COLLECTION_ID,
            [Query.limit(500)]
        );
        console.log(`✅ Fetched ${response.documents.length} places`);
        return response.documents;
    } catch (error) {
        console.error('❌ Error fetching places:', error.message);
        console.log('⚠️  Continuing with static sitemap generation...');
        return [];
    }
}

/**
 * Generate XML sitemap
 */
function generateSitemap(therapists, places) {
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;
    
    // Static Pages
    xml += `  <!-- Static Pages -->\n`;
    STATIC_PAGES.forEach(page => {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n\n`;
    });
    
    // Blog Posts
    xml += `  <!-- Blog Posts -->\n`;
    BLOG_POSTS.forEach(slug => {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/${slug}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n\n`;
    });
    
    // City Pages (SEO Landing Pages)
    xml += `  <!-- City Landing Pages -->\n`;
    INDONESIAN_CITIES.forEach(city => {
        const citySlug = city.toLowerCase().replace(/\s+/g, '-');
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/massage-${citySlug}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n\n`;
    });
    
    // Therapist Profiles
    xml += `  <!-- Therapist Profiles (${therapists.length} therapists) -->\n`;
    therapists.forEach(therapist => {
        const therapistId = therapist.$id || therapist.id;
        const name = therapist.name || 'therapist';
        const city = therapist.city || 'indonesia';
        const slug = createSlug(name, city);
        
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/share/${escapeXml(slug)}/${therapistId}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n\n`;
    });
    
    // Massage Place Profiles
    xml += `  <!-- Massage Place Profiles (${places.length} places) -->\n`;
    places.forEach(place => {
        const placeId = place.$id || place.id;
        const name = place.name || 'spa';
        const city = place.city || 'indonesia';
        const slug = createSlug(name, city);
        
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}/place/${escapeXml(slug)}/${placeId}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n\n`;
    });
    
    xml += `</urlset>`;
    return xml;
}

/**
 * Main execution
 */
async function main() {
    console.log('🚀 Starting sitemap generation...\n');
    
    // Fetch data
    const [therapists, places] = await Promise.all([
        fetchTherapists(),
        fetchPlaces()
    ]);
    
    // Generate sitemap
    const sitemap = generateSitemap(therapists, places);
    
    // Calculate total URLs
    const totalUrls = STATIC_PAGES.length + BLOG_POSTS.length + 
                     INDONESIAN_CITIES.length + therapists.length + places.length;
    
    // Save to public/sitemap.xml
    const outputPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemap, 'utf-8');
    
    console.log('\n✅ Sitemap generated successfully!');
    console.log(`📊 Total URLs: ${totalUrls}`);
    console.log(`   - Static pages: ${STATIC_PAGES.length}`);
    console.log(`   - Blog posts: ${BLOG_POSTS.length}`);
    console.log(`   - City pages: ${INDONESIAN_CITIES.length}`);
    console.log(`   - Therapists: ${therapists.length}`);
    console.log(`   - Places: ${places.length}`);
    console.log(`📝 Saved to: ${outputPath}\n`);
    
    // Generate sitemap index for future scaling
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
    
    const indexPath = path.join(__dirname, '..', 'public', 'sitemap-index.xml');
    fs.writeFileSync(indexPath, sitemapIndex, 'utf-8');
    console.log(`📝 Sitemap index saved to: ${indexPath}\n`);
}

// Run
main().catch(console.error);
