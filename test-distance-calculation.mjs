import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313');

const databases = new Databases(client);

// User's GPS location from console
const userLocation = { lat: -7.826874242259642, lng: 110.41974006865114 };

// Haversine distance calculation
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

console.log('🧪 Testing distance calculation for Yogyakarta therapists...\n');
console.log(`👤 User location: ${userLocation.lat}, ${userLocation.lng}\n`);

try {
    const response = await databases.listDocuments(
        '68f76ee1000e64ca8d05',
        'therapists_collection_id',
        [
            Query.contains('location', 'Yogyakarta'),
            Query.limit(100)
        ]
    );

    console.log(`📊 Found ${response.documents.length} Yogyakarta therapists\n`);
    
    const within25km = [];
    const beyond25km = [];
    
    response.documents.forEach((therapist) => {
        const coordsStr = therapist.coordinates;
        let coords;
        
        try {
            coords = JSON.parse(coordsStr);
        } catch (e) {
            console.log(`❌ ${therapist.name}: Invalid coordinates`);
            return;
        }
        
        const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            coords.lat,
            coords.lng
        );
        
        const info = {
            name: therapist.name,
            status: therapist.status,
            distance: distance.toFixed(2)
        };
        
        if (distance <= 25) {
            within25km.push(info);
        } else {
            beyond25km.push(info);
        }
    });
    
    console.log(`\n✅ Within 25km: ${within25km.length} therapists`);
    within25km.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} - ${t.distance}km (${t.status})`);
    });
    
    if (beyond25km.length > 0) {
        console.log(`\n⚠️ Beyond 25km: ${beyond25km.length} therapists`);
        beyond25km.forEach((t, i) => {
            console.log(`  ${i + 1}. ${t.name} - ${t.distance}km (${t.status})`);
        });
    }
    
    console.log(`\n🎯 Expected result: ${within25km.length} therapists should display on homepage`);
    
} catch (error) {
    console.error('❌ Error:', error.message);
}
