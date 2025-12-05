/**
 * Test Google Maps API Key and City Location Functionality
 * This script tests all the Google Maps APIs we need for city location filtering
 */

const GOOGLE_MAPS_API_KEY = 'AIzaSyBzcGi0AcIHpgJTayMdc06ayS_KwMsDqKU';

async function testGoogleMapsAPI() {
    console.log('🔍 Testing Google Maps API Key...');
    
    try {
        // Test 1: Geocoding API (convert city name to coordinates)
        console.log('\n📍 Test 1: Geocoding API - Yogyakarta coordinates');
        const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=Yogyakarta,Indonesia&key=${GOOGLE_MAPS_API_KEY}`
        );
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.status === 'OK' && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            console.log(`✅ Geocoding Success: Yogyakarta = ${location.lat}, ${location.lng}`);
            console.log(`   Formatted Address: ${geocodeData.results[0].formatted_address}`);
        } else {
            console.log(`❌ Geocoding Error: ${geocodeData.status} - ${geocodeData.error_message || 'Unknown error'}`);
        }
        
        // Test 2: Reverse Geocoding (coordinates to city name)
        console.log('\n🔄 Test 2: Reverse Geocoding - Convert coordinates back to city');
        const reverseResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=-7.7956,110.3695&key=${GOOGLE_MAPS_API_KEY}`
        );
        const reverseData = await reverseResponse.json();
        
        if (reverseData.status === 'OK' && reverseData.results.length > 0) {
            const cityResult = reverseData.results.find(result => 
                result.types.includes('locality') || result.types.includes('administrative_area_level_2')
            );
            if (cityResult) {
                console.log(`✅ Reverse Geocoding Success: Found city ${cityResult.formatted_address}`);
            } else {
                console.log(`⚠️ Reverse Geocoding: No city found in results`);
            }
        } else {
            console.log(`❌ Reverse Geocoding Error: ${reverseData.status}`);
        }
        
        // Test 3: Distance Matrix API (calculate distance between cities)
        console.log('\n📏 Test 3: Distance Matrix API - Yogyakarta to Denpasar');
        const distanceResponse = await fetch(
            `https://maps.googleapis.com/maps/api/distancematrix/json?origins=Yogyakarta,Indonesia&destinations=Denpasar,Indonesia&key=${GOOGLE_MAPS_API_KEY}`
        );
        const distanceData = await distanceResponse.json();
        
        if (distanceData.status === 'OK' && distanceData.rows[0].elements[0].status === 'OK') {
            const element = distanceData.rows[0].elements[0];
            console.log(`✅ Distance Matrix Success: ${element.distance.text} (${element.duration.text})`);
        } else {
            console.log(`❌ Distance Matrix Error: ${distanceData.status}`);
        }
        
        // Test 4: Places API (find nearby places - requires Places API)
        console.log('\n📍 Test 4: Places Nearby Search - Massage centers in Yogyakarta');
        const placesResponse = await fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-7.7956,110.3695&radius=5000&type=spa&keyword=massage&key=${GOOGLE_MAPS_API_KEY}`
        );
        const placesData = await placesResponse.json();
        
        if (placesData.status === 'OK') {
            console.log(`✅ Places API Success: Found ${placesData.results.length} massage places near Yogyakarta`);
            if (placesData.results.length > 0) {
                const firstPlace = placesData.results[0];
                console.log(`   Example: ${firstPlace.name} (Rating: ${firstPlace.rating || 'N/A'})`);
            }
        } else {
            console.log(`❌ Places API Error: ${placesData.status} - ${placesData.error_message || 'Unknown error'}`);
        }
        
        console.log('\n🎉 Google Maps API testing completed!');
        console.log('📝 Summary:');
        console.log('   - All APIs should work for city location filtering');
        console.log('   - Geocoding: Convert city names to coordinates');
        console.log('   - Distance Matrix: Calculate distances between therapists and cities');
        console.log('   - Places API: Find nearby massage centers (optional enhancement)');
        
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

// Run the test
testGoogleMapsAPI();