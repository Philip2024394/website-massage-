const sdk = require('node-appwrite');
require('dotenv').config();

const client = new sdk.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new sdk.Databases(client);

async function checkJogjaTherapists() {
    try {
        const response = await databases.listDocuments(
            process.env.VITE_APPWRITE_DATABASE_ID,
            'therapists_collection_id',
            [sdk.Query.limit(100)]
        );
        
        console.log(`\n📊 Total therapists in database: ${response.total}\n`);
        
        // Check for Jogja therapists
        const jogjaTherapists = response.documents.filter(t => {
            const loc = (t.location || '').toLowerCase();
            const city = (t.city || '').toLowerCase();
            const coords = t.coordinates;
            
            // Jogja coordinates: lat: -7.7956, lng: 110.3695
            const hasJogjaCoords = coords && 
                (coords.includes('-7.7956') || coords.includes('-7.79'));
            
            return loc.includes('jogja') || 
                   loc.includes('yogya') || 
                   city.includes('jogja') || 
                   city.includes('yogya') ||
                   hasJogjaCoords;
        });
        
        console.log(`🏙️ Therapists in Yogyakarta/Jogja: ${jogjaTherapists.length}\n`);
        
        jogjaTherapists.forEach((t, i) => {
            console.log(`${i + 1}. ${t.name || 'No name'}`);
            console.log(`   📍 Location: ${t.location || 'Not set'}`);
            console.log(`   🏙️ City: ${t.city || 'Not set'}`);
            console.log(`   🗺️ Coordinates: ${t.coordinates || 'Not set'}`);
            console.log(`   🌏 Country Code: ${t.countryCode || 'Not set'}`);
            console.log(`   ✅ isLive: ${t.isLive}`);
            console.log(`   📡 Status: ${t.status || 'Not set'}\n`);
        });
        
        // Also check Indonesia therapists
        const idTherapists = response.documents.filter(t => t.countryCode === 'ID');
        console.log(`🇮🇩 Total Indonesia (ID) therapists: ${idTherapists.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkJogjaTherapists();
