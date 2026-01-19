/**
 * 🔥 FACEBOOK SHARING FIX - Meta Tag Injection for Social Media Bots
 * 
 * This Edge Function detects Facebook, WhatsApp, Twitter bots and injects
 * the correct meta tags BEFORE the page loads, so crawlers see therapist images.
 * 
 * HOW IT WORKS:
 * 1. Detect bot user-agent (facebookexternalhit, WhatsApp, Twitterbot)
 * 2. Parse therapist ID from URL
 * 3. Fetch therapist data from Appwrite
 * 4. Inject meta tags into HTML
 * 5. Return modified HTML to crawler
 */

// Type declaration for Netlify Edge Functions Context
interface Context {
  next: () => Promise<Response>;
}

// Official images for shared profiles
const OFFICIAL_HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258';
const OFFICIAL_MAIN_IMAGE = 'https://ik.imagekit.io/7grri5v7d/garden%20forest.png?updatedAt=1761334454082';

// Appwrite config
const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '66ea8cb60033f6aa5dd8';
const DATABASE_ID = '66ea8d09000bb8c3ccd9';
const THERAPISTS_COLLECTION = '66ea8efd00039e0fa45f';

/**
 * Detect if the request is from a social media bot
 */
function isSocialBot(userAgent: string): boolean {
  const botPatterns = [
    'facebookexternalhit',
    'Facebot',
    'WhatsApp',
    'Twitterbot',
    'LinkedInBot',
    'TelegramBot',
    'Slackbot',
    'Discordbot',
    'pinterest',
  ];
  
  const ua = userAgent.toLowerCase();
  return botPatterns.some(pattern => ua.includes(pattern.toLowerCase()));
}

/**
 * Extract therapist ID from URL path
 */
function extractTherapistId(pathname: string): string | null {
  // Match: /#/therapist-profile/{id}-{slug} or /therapist-profile/{id}-{slug}
  const match = pathname.match(/therapist-profile\/([a-z0-9]+)-?/i);
  return match ? match[1] : null;
}

/**
 * Fetch therapist data from Appwrite
 */
async function fetchTherapist(therapistId: string) {
  try {
    const url = `${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${THERAPISTS_COLLECTION}/documents/${therapistId}`;
    
    const response = await fetch(url, {
      headers: {
        'X-Appwrite-Project': APPWRITE_PROJECT_ID,
      }
    });
    
    if (!response.ok) {
      console.error('[META-INJECTOR] Appwrite fetch failed:', response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('[META-INJECTOR] Error fetching therapist:', error);
    return null;
  }
}

/**
 * Generate meta tags HTML for therapist
 */
function generateMetaTags(therapist: any, url: string): string {
  const name = therapist.name || therapist.therapistName || 'Professional Therapist';
  const city = (therapist.location || therapist.city || 'Indonesia').split(',')[0].trim();
  const title = `${name} - Professional Massage Therapist - House - Hotel - Villa`;
  const description = `✨ Book ${name} for professional massage therapy in ${city}. ⭐ Verified therapist • 💬 Instant chat • 🔒 Secure booking`;
  
  return `
    <!-- Dynamic Meta Tags for ${name} -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    
    <!-- Facebook Open Graph -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="profile" />
    <meta property="og:image" content="${OFFICIAL_HERO_IMAGE}" />
    <meta property="og:image:secure_url" content="${OFFICIAL_HERO_IMAGE}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${name} - Professional Massage Therapist in ${city}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:site_name" content="IndaStreet Massage" />
    <meta property="og:locale" content="id_ID" />
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${OFFICIAL_HERO_IMAGE}" />
    <meta name="twitter:image:alt" content="${name} - Professional Massage Therapist" />
    
    <!-- Canonical URL -->
    <link rel="canonical" href="${url}" />
  `;
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  
  console.log('[META-INJECTOR] Request:', {
    path: url.pathname,
    hash: url.hash,
    userAgent: userAgent.substring(0, 50),
    isBot: isSocialBot(userAgent)
  });
  
  // Only process for social media bots on therapist profile URLs
  if (!isSocialBot(userAgent)) {
    return context.next();
  }
  
  // Check if it's a therapist profile URL (hash or path)
  const fullPath = url.pathname + url.hash;
  const therapistId = extractTherapistId(fullPath) || extractTherapistId(url.pathname);
  
  if (!therapistId) {
    console.log('[META-INJECTOR] No therapist ID found, passing through');
    return context.next();
  }
  
  console.log('[META-INJECTOR] Bot detected! Fetching therapist:', therapistId);
  
  // Fetch therapist data
  const therapist = await fetchTherapist(therapistId);
  
  if (!therapist) {
    console.error('[META-INJECTOR] Therapist not found:', therapistId);
    return context.next();
  }
  
  // Get the original response
  const response = await context.next();
  let html = await response.text();
  
  // Generate meta tags
  const metaTags = generateMetaTags(therapist, request.url);
  
  // Inject meta tags into <head> before the first <meta> tag
  html = html.replace(
    /<head>/i,
    `<head>\n${metaTags}`
  );
  
  console.log('[META-INJECTOR] ✅ Meta tags injected for:', therapist.name);
  
  return new Response(html, {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers),
      'content-type': 'text/html; charset=utf-8',
      'x-meta-injected': 'true'
    }
  });
};

export const config = {
  path: [
    "/#/therapist-profile/*",
    "/therapist-profile/*"
  ]
};
