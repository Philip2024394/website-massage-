/**
 * Seed Cities to Appwrite - One-time setup script
 * Run this once to populate your cities collection
 */

const { Client, Databases } = require('appwrite');

// Appwrite Configuration
const APPWRITE_CONFIG = {
    endpoint: 'https://syd.cloud.appwrite.io/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    citiesCollectionId: 'cities_collection_id'
};

// Initialize Appwrite
const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);

// Cities data matching your Appwrite schema
const CITIES_DATA = [
    {
        cityId: 1,
        cityName: "Denpasar",
        state: "Bali",
        country: "Indonesia",
        coordinates: [115.2126, -8.6705], // Point format: [lng, lat]
        isCapital: false,
        population: 897300,
        name: "Denpasar",
        province: "Bali", 
        category: "🏝️ Bali - Tourist Destinations",
        isMainCity: true,
        isTouristDestination: true,
        aliases: "Denpasar Bali, Bali Capital"
    },
    {
        cityId: 2,
        cityName: "Ubud",
        state: "Bali",
        country: "Indonesia",
        coordinates: [115.2625, -8.5069],
        isCapital: false,
        population: 30000,
        name: "Ubud", 
        province: "Bali",
        category: "🏝️ Bali - Tourist Destinations", 
        isMainCity: false,
        isTouristDestination: true,
        aliases: "Ubud Bali, Cultural Center Bali"
    },
    {
        cityId: 3,
        cityName: "Seminyak",
        state: "Bali",
        country: "Indonesia",
        coordinates: [115.1668, -8.6953],
        isCapital: false,
        population: 15000,
        name: "Seminyak",
        province: "Bali",
        category: "🏝️ Bali - Tourist Destinations",
        isMainCity: false,
        isTouristDestination: true,
        aliases: "Seminyak Beach, Luxury Bali"
    },
    {
        cityId: 4,
        cityName: "Jakarta",
        state: "DKI Jakarta",
        country: "Indonesia",
        coordinates: [106.8456, -6.2088],
        isCapital: true,
        population: 10770000,
        name: "Jakarta",
        province: "DKI Jakarta",
        category: "🏙️ Java - Major Cities",
        isMainCity: true,
        isTouristDestination: false,
        aliases: "Jakarta Indonesia, Capital Indonesia"
    },
    {
        cityId: 5,
        cityName: "Yogyakarta",
        state: "Special Region of Yogyakarta",
        country: "Indonesia",
        coordinates: [110.3695, -7.7956],
        isCapital: false,
        population: 422732,
        name: "Yogyakarta",
        province: "Special Region of Yogyakarta", 
        category: "🏙️ Java - Major Cities",
        isMainCity: true,
        isTouristDestination: true,
        aliases: "Jogja, Yogya, Cultural City"
    },
    {
        cityId: 6,
        cityName: "Canggu",
        state: "Bali",
        country: "Indonesia",
        coordinates: [115.1436, -8.6482],
        isCapital: false,
        population: 8000,
        name: "Canggu",
        province: "Bali",
        category: "🏝️ Bali - Tourist Destinations",
        isMainCity: false,
        isTouristDestination: true,
        aliases: "Canggu Beach, Surf Bali"
    },
    {
        cityId: 7,
        cityName: "Bandung",
        state: "West Java",
        country: "Indonesia",
        coordinates: [107.6191, -6.9175],
        isCapital: false,
        population: 2444160,
        name: "Bandung",
        province: "West Java",
        category: "🏙️ Java - Major Cities",
        isMainCity: true,
        isTouristDestination: false,
        aliases: "Bandung Indonesia, Paris van Java"
    },
    {
        cityId: 8,
        cityName: "Surabaya",
        state: "East Java",
        country: "Indonesia",
        coordinates: [112.7521, -7.2575],
        isCapital: false,
        population: 2874314,
        name: "Surabaya",
        province: "East Java",
        category: "🏙️ Java - Major Cities",
        isMainCity: true,
        isTouristDestination: false,
        aliases: "Surabaya Indonesia, Hero City"
    }
];

async function seedCities() {
    try {
        console.log('🌱 Starting cities seeding to Appwrite...');
        console.log(`📍 Collection: ${APPWRITE_CONFIG.citiesCollectionId}`);
        console.log(`🗂️ Database: ${APPWRITE_CONFIG.databaseId}\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const city of CITIES_DATA) {
            try {
                const response = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.citiesCollectionId,
                    'unique()',
                    {
                        // Required fields
                        cityId: city.cityId,
                        cityName: city.cityName,
                        country: city.country,
                        isMainCity: city.isMainCity,
                        isTouristDestination: city.isTouristDestination,
                        
                        // Optional fields
                        state: city.state || null,
                        coordinates: city.coordinates, // Point format [lat, lng]
                        isCapital: city.isCapital || null,
                        population: city.population || null,
                        name: city.name || null,
                        province: city.province || null,
                        category: city.category || null,
                        aliases: city.aliases || null
                    }
                );

                console.log(`✅ Added: ${city.name} (ID: ${response.$id})`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to add ${city.name}:`, error.message);
                errorCount++;
            }
        }

        console.log(`\n🎉 Seeding Complete!`);
        console.log(`✅ Success: ${successCount} cities`);
        console.log(`❌ Errors: ${errorCount} cities`);

        if (successCount > 0) {
            console.log('\n🔄 Next Steps:');
            console.log('1. Check your Appwrite console to see the cities');
            console.log('2. Update your dropdown to use Appwrite data');
            console.log('3. Test the location system');
        }

    } catch (error) {
        console.error('💥 Critical Error:', error);
    }
}

// Run the seeding
seedCities();