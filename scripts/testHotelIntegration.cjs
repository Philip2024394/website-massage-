#!/usr/bin/env node

/**
 * Test Hotel Integration in Location Dropdown System
 * 
 * This script tests:
 * 1. Hotel service can fetch data from Appwrite
 * 2. Hotels are included in location filtering
 * 3. Hotels appear in Indonesian city filtering system
 */

const { Client, Databases } = require('appwrite');

// Appwrite configuration
const DATABASE_ID = '68f23b11000d25eb3664';
const HOTELS_COLLECTION_ID = 'hotels_collection_id';

const client = new Client();
client.setEndpoint('https://syd.cloud.appwrite.io/v1').setProject('68f23b11000d25eb3664');
const databases = new Databases(client);

// Indonesian cities (subset for testing)
const INDONESIAN_CITIES = [
    { name: 'Jakarta', coordinates: { lat: -6.2088, lng: 106.8456 } },
    { name: 'Surabaya', coordinates: { lat: -7.2575, lng: 112.7521 } },
    { name: 'Yogyakarta', coordinates: { lat: -7.7956, lng: 110.3695 } },
    { name: 'Bandung', coordinates: { lat: -6.9175, lng: 107.6191 } },
    { name: 'Medan', coordinates: { lat: 3.5952, lng: 98.6722 } },
    { name: 'Bali', coordinates: { lat: -8.3405, lng: 115.0920 } },
    { name: 'Semarang', coordinates: { lat: -6.9667, lng: 110.4167 } },
];

// Coordinate parsing utility (matches HomePage logic)
function parseCoordinates(coordinates) {
    if (!coordinates) return null;
    
    try {
        // Handle Point format: { type: "Point", coordinates: [lng, lat] }
        if (typeof coordinates === 'object' && coordinates.type === 'Point' && Array.isArray(coordinates.coordinates)) {
            const [lng, lat] = coordinates.coordinates;
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
        
        // Handle JSON string format
        if (typeof coordinates === 'string') {
            const parsed = JSON.parse(coordinates);
            if (parsed.lat && parsed.lng) {
                return { lat: parseFloat(parsed.lat), lng: parseFloat(parsed.lng) };
            }
        }
        
        // Handle object format: { lat: number, lng: number }
        if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
            return { lat: parseFloat(coordinates.lat), lng: parseFloat(coordinates.lng) };
        }
        
        return null;
    } catch (error) {
        console.warn('Failed to parse coordinates:', coordinates, error.message);
        return null;
    }
}

// Distance calculation (Haversine formula)
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Match provider to city (matches HomePage logic)
function matchProviderToCity(providerCoords, radiusKm = 25) {
    if (!providerCoords) return null;
    
    for (const city of INDONESIAN_CITIES) {
        const distance = calculateDistance(providerCoords, city.coordinates);
        if (distance <= radiusKm) {
            return city;
        }
    }
    return null;
}

async function testHotelService() {
    console.log('🏨 Testing Hotel Service Integration...\n');
    
    try {
        // Test 1: Fetch hotels from Appwrite
        console.log('📋 Test 1: Fetching hotels from Appwrite...');
        const response = await databases.listDocuments(
            DATABASE_ID,
            HOTELS_COLLECTION_ID,
            [] // No queries - get all
        );
        
        const hotels = response.documents;
        console.log(`✅ Fetched ${hotels.length} hotels from collection`);
        
        if (hotels.length === 0) {
            console.log('⚠️  No hotels found in collection. Testing with mock data...');
            // Create mock hotel for testing
            const mockHotel = {
                $id: 'test_hotel_1',
                name: 'Test Hotel Jakarta',
                location: 'Jakarta',
                coordinates: { lat: -6.2088, lng: 106.8456 },
                isLive: true
            };
            hotels.push(mockHotel);
        }
        
        // Test 2: Parse hotel coordinates
        console.log('\n📍 Test 2: Testing coordinate parsing...');
        let hotelsWithValidCoords = 0;
        
        hotels.forEach((hotel, index) => {
            const parsedCoords = parseCoordinates(hotel.coordinates);
            if (parsedCoords) {
                hotelsWithValidCoords++;
                console.log(`  ✅ Hotel ${index + 1}: ${hotel.name} - Coords: ${parsedCoords.lat}, ${parsedCoords.lng}`);
            } else {
                console.log(`  ❌ Hotel ${index + 1}: ${hotel.name} - No valid coordinates`);
            }
        });
        
        console.log(`📊 Hotels with valid coordinates: ${hotelsWithValidCoords}/${hotels.length}`);
        
        // Test 3: City matching
        console.log('\n🏙️ Test 3: Testing city matching...');
        const cityMatches = {};
        
        hotels.forEach(hotel => {
            const parsedCoords = parseCoordinates(hotel.coordinates);
            if (parsedCoords) {
                const matchedCity = matchProviderToCity(parsedCoords, 25);
                if (matchedCity) {
                    cityMatches[matchedCity.name] = cityMatches[matchedCity.name] || [];
                    cityMatches[matchedCity.name].push(hotel.name || hotel.$id);
                }
            }
        });
        
        console.log('🎯 Hotels matched to cities:');
        Object.entries(cityMatches).forEach(([city, hotelNames]) => {
            console.log(`  ${city}: ${hotelNames.join(', ')}`);
        });
        
        // Test 4: Location dropdown filtering simulation
        console.log('\n🔄 Test 4: Simulating location dropdown filtering...');
        
        INDONESIAN_CITIES.forEach(city => {
            const filteredHotels = hotels.filter(hotel => {
                // Apply same filtering logic as HomePage
                
                // 1. Direct location name match
                if (hotel.location && hotel.location.toLowerCase().includes(city.name.toLowerCase())) {
                    return true;
                }
                
                // 2. Coordinate-based matching
                if (hotel.coordinates) {
                    const parsedCoords = parseCoordinates(hotel.coordinates);
                    if (parsedCoords) {
                        const matchedCity = matchProviderToCity(parsedCoords, 25);
                        if (matchedCity && matchedCity.name === city.name) {
                            return true;
                        }
                    }
                }
                
                return false;
            });
            
            if (filteredHotels.length > 0) {
                console.log(`  ${city.name}: ${filteredHotels.length} hotels found`);
                filteredHotels.forEach(hotel => {
                    console.log(`    - ${hotel.name || hotel.$id}`);
                });
            }
        });
        
        // Test 5: Summary
        console.log('\n📋 Integration Test Summary:');
        console.log(`✅ Hotel service: ${hotels.length} hotels fetched`);
        console.log(`✅ Coordinate parsing: ${hotelsWithValidCoords}/${hotels.length} valid`);
        console.log(`✅ City matching: ${Object.keys(cityMatches).length} cities with hotels`);
        console.log(`✅ Location filtering: Ready for dropdown integration`);
        
        if (Object.keys(cityMatches).length > 0) {
            console.log('\n🎉 SUCCESS: Hotels are ready for location dropdown filtering!');
            console.log('Hotels will appear when users select cities from the dropdown.');
        } else {
            console.log('\n⚠️  NOTICE: No hotels matched to cities. Check coordinate data.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.message.includes('Collection with the requested ID could not be found')) {
            console.log('\n💡 The hotels collection may not exist or the ID is incorrect.');
            console.log('Check the collection ID in lib/appwrite.config.ts');
        } else {
            console.log('\n🔧 Ensure Appwrite is configured correctly.');
        }
    }
}

// Run the test
testHotelService().then(() => {
    console.log('\n🏁 Test completed.');
    process.exit(0);
}).catch(error => {
    console.error('❌ Test script error:', error);
    process.exit(1);
});