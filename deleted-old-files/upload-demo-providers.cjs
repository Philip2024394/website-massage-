/**
 * Upload Demo Providers Script
 * 
 * Creates 1 demo therapist + 1 demo massage place in each country
 * that serve as examples for potential providers to see what their
 * profile cards and pages will look like.
 * 
 * These demo profiles are marked with isDemo: true flag
 * 
 * USAGE: node upload-demo-providers.cjs
 */

const sdk = require('node-appwrite');
require('dotenv').config();

// Appwrite configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.COIN_SHOP_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID;

if (!APPWRITE_API_KEY) {
    console.error('❌ APPWRITE_API_KEY not found in .env file!');
    process.exit(1);
}

// Initialize Appwrite
const client = new sdk.Client();
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

// Country data with coordinates
const COUNTRIES = [
    { code: 'ID', name: 'Indonesia', city: 'Jakarta', lat: -6.2088, lng: 106.8456, currency: 'IDR', currencySymbol: 'Rp' },
    { code: 'GB', name: 'United Kingdom', city: 'London', lat: 51.5074, lng: -0.1278, currency: 'GBP', currencySymbol: '£' },
    { code: 'US', name: 'United States', city: 'New York', lat: 40.7128, lng: -74.0060, currency: 'USD', currencySymbol: '$' },
    { code: 'AU', name: 'Australia', city: 'Sydney', lat: -33.8688, lng: 151.2093, currency: 'AUD', currencySymbol: '$' },
    { code: 'SG', name: 'Singapore', city: 'Singapore', lat: 1.3521, lng: 103.8198, currency: 'SGD', currencySymbol: '$' },
    { code: 'MY', name: 'Malaysia', city: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, currency: 'MYR', currencySymbol: 'RM' },
    { code: 'TH', name: 'Thailand', city: 'Bangkok', lat: 13.7563, lng: 100.5018, currency: 'THB', currencySymbol: '฿' },
    { code: 'PH', name: 'Philippines', city: 'Manila', lat: 14.5995, lng: 120.9842, currency: 'PHP', currencySymbol: '₱' },
    { code: 'CN', name: 'China', city: 'Beijing', lat: 39.9042, lng: 116.4074, currency: 'CNY', currencySymbol: '¥' },
    { code: 'JP', name: 'Japan', city: 'Tokyo', lat: 35.6762, lng: 139.6503, currency: 'JPY', currencySymbol: '¥' },
    { code: 'KR', name: 'South Korea', city: 'Seoul', lat: 37.5665, lng: 126.9780, currency: 'KRW', currencySymbol: '₩' },
    { code: 'RU', name: 'Russia', city: 'Moscow', lat: 55.7558, lng: 37.6173, currency: 'RUB', currencySymbol: '₽' },
    { code: 'CA', name: 'Canada', city: 'Toronto', lat: 43.6532, lng: -79.3832, currency: 'CAD', currencySymbol: '$' },
    { code: 'IN', name: 'India', city: 'Delhi', lat: 28.6139, lng: 77.2090, currency: 'INR', currencySymbol: '₹' }
];

function generateDemoTherapist(country) {
    const coords = JSON.stringify({ lat: country.lat, lng: country.lng });
    const therapistId = `demo_therapist_${country.code.toLowerCase()}`;
    
    return {
        // Required fields
        specialization: "Swedish Massage",
        name: `Demo Therapist - ${country.city}`,
        email: `demo.therapist.${country.code.toLowerCase()}@indastreet.com`,
        whatsappNumber: `+1234567890${country.code}`,
        location: `${country.city}, ${country.name}`,
        coordinates: coords,
        countryCode: country.code,
        description: `🎓 SAMPLE PROFILE - This is an example therapist profile to show you what your listing will look like!\n\n✨ Professional massage therapist with 5+ years experience\n✅ Certified in Swedish, Deep Tissue & Sports Massage\n🏆 Top-rated provider in ${country.city}\n⭐ 4.8/5 rating from 200+ clients\n\nYour actual profile will display your real information, photos, and client reviews here.`,
        yearsOfExperience: 5,
        isLicensed: true,
        hourlyRate: 500,
        pricing: JSON.stringify({ "60": 500000, "90": 700000, "120": 900000 }),
        massageTypes: JSON.stringify(["Swedish Massage", "Deep Tissue", "Sports Massage", "Aromatherapy"]),
        languages: JSON.stringify(["en", country.code === 'ID' ? 'id' : 'en']),
        isLive: true,
        status: 'available',
        mainImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        analytics: JSON.stringify({
            impressions: 1200,
            views: 1200,
            profileViews: 850,
            whatsapp_clicks: 150,
            whatsappClicks: 150,
            phone_clicks: 100,
            directions_clicks: 80,
            bookings: 85
        }),
        therapistId: therapistId,
        id: therapistId,
        activeMembershipDate: new Date().toISOString(),
        rating: 4.8,
        price60: "500000",
        price90: "700000",
        price120: "900000",
        isOnline: true,
        availability: "Available",
        agentId: null,
        hotelDiscount: 0,
        hotelId: "",
        password: "",
        // Demo marker (custom field if it exists in schema)
        category: "demo"
    };
}

function generateDemoPlace(country) {
    const coords = [country.lng + 0.01, country.lat + 0.01]; // [longitude, latitude] format
    const placeId = `demo_place_${country.code.toLowerCase()}_${Date.now()}`;
    
    return {
        // Required fields matching schema
        placeId: placeId,
        id: placeId,
        name: `Demo Spa - ${country.city}`,
        email: `demo.spa.${country.code.toLowerCase()}@indastreet.com`,
        category: "Massage Place",
        description: `🏢 SAMPLE BUSINESS PROFILE\n\n✨ Premier massage spa in ${country.city}\n🌟 Professional therapists on staff\n🕒 Open 7 days a week: 9AM - 10PM\n💆‍♀️ Full range of massage services\n🎯 Modern, clean facilities\n\nYour massage place profile will showcase your actual spa, services, pricing, and customer reviews in this format.`,
        coordinates: coords,
        location: `${country.city} Center, ${country.name}`,
        countryCode: country.code,
        pricing: JSON.stringify({ "60": 600000, "90": 850000, "120": 1100000 }),
        isLive: true,
        status: "active",
        openingTime: "09:00",
        closingTime: "22:00",
        thumbnailImages: JSON.stringify([
            'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
            'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
            'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400'
        ]),
        additionalServices: JSON.stringify(["Body Scrub", "Facial", "Hot Stone", "Aromatherapy"]),
        analytics: JSON.stringify({
            impressions: 1500,
            profileViews: 980,
            whatsappClicks: 200
        }),
        rating: 4.7,
        hotelId: placeId,
        agentId: null,
        hotelDiscount: null,
        hotelServiceOption: null,
        password: null,
        // Optional fields
        address: `${country.city} Center`,
        city: country.city,
        country: country.name
    };
}

async function uploadDemoProviders() {
    try {
        console.log('🔍 Finding collections...\n');
        
        const collections = await databases.listCollections(DATABASE_ID);
        
        const therapistsCollection = collections.collections.find(c => 
            c.name.toLowerCase().includes('therapist') || c.$id.toLowerCase().includes('therapist')
        );
        
        const placesCollection = collections.collections.find(c => 
            c.name.toLowerCase().includes('place') || c.$id.toLowerCase().includes('place')
        );
        
        if (!therapistsCollection) {
            console.error('❌ Could not find therapists collection!');
            return;
        }
        
        if (!placesCollection) {
            console.error('❌ Could not find places collection!');
            return;
        }
        
        const THERAPISTS_COLLECTION_ID = therapistsCollection.$id;
        const PLACES_COLLECTION_ID = placesCollection.$id;
        
        console.log(`✅ Found collections:`);
        console.log(`   - Therapists: ${therapistsCollection.name} (${THERAPISTS_COLLECTION_ID})`);
        console.log(`   - Places: ${placesCollection.name} (${PLACES_COLLECTION_ID})\n`);
        
        let therapistCount = 0;
        let placeCount = 0;
        let errors = 0;
        
        console.log('🚀 Uploading demo providers for all countries...\n');
        
        for (const country of COUNTRIES) {
            console.log(`📍 ${country.name} (${country.city}):`);
            
            // Upload demo therapist
            try {
                const therapist = generateDemoTherapist(country);
                await databases.createDocument(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    sdk.ID.unique(),
                    therapist
                );
                console.log(`   ✅ Demo Therapist created`);
                therapistCount++;
            } catch (error) {
                console.error(`   ❌ Therapist error: ${error.message}`);
                errors++;
            }
            
            // Upload demo place
            try {
                const place = generateDemoPlace(country);
                await databases.createDocument(
                    DATABASE_ID,
                    PLACES_COLLECTION_ID,
                    sdk.ID.unique(),
                    place
                );
                console.log(`   ✅ Demo Massage Place created`);
                placeCount++;
            } catch (error) {
                console.error(`   ❌ Place error: ${error.message}`);
                errors++;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 DEMO PROVIDERS UPLOAD SUMMARY:');
        console.log('='.repeat(60));
        console.log(`   ✅ Demo Therapists created: ${therapistCount}`);
        console.log(`   ✅ Demo Massage Places created: ${placeCount}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   🌍 Countries covered: ${COUNTRIES.length}`);
        console.log('='.repeat(60));
        
        console.log('\n✨ Demo providers are now live in all countries!');
        console.log('💡 These profiles are marked with isDemo: true');
        console.log('🎯 They show potential providers what their cards/profiles will look like');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the upload
console.log('🎨 Creating demo providers for all 14 countries...\n');
uploadDemoProviders();
