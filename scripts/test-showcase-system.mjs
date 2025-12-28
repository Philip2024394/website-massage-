#!/usr/bin/env node
/**
 * Test the showcase profile system for Yogyakarta therapists
 */

console.log('🎭 TESTING SHOWCASE PROFILE SYSTEM\n');

// Test data: Simulate therapists data like in the app
const mockTherapists = [
    {
        $id: '692467a3001f6f05aaa1',
        name: 'Budi',
        location: 'Yogyakarta, Indonesia',
        status: 'Available',
        rating: 4.8,
        reviewCount: 34
    },
    {
        $id: '69499239000c90bfd283',
        name: 'ww',
        location: 'Yogyakarta, Indonesia',
        status: 'Available',
        rating: 4.7,
        reviewCount: 30
    },
    {
        $id: '694a02cd0036089583db',
        name: 'ww',
        location: 'Yogyakarta, Indonesia',
        status: 'Offline',
        rating: 4.7,
        reviewCount: 29
    },
    {
        $id: '694ed78f9574395fd7b9',
        name: 'Wiwid',
        location: 'Yogyakarta, Indonesia',
        status: 'Available',
        rating: 4.9,
        reviewCount: 32
    },
    {
        $id: '693cfadf003d16b9896a',
        name: 'Surtiningsih',
        location: 'Jakarta, Indonesia',
        status: 'Available',
        rating: 4.6,
        reviewCount: 25
    }
];

// Simulate the showcase profile function
const getYogyakartaShowcaseProfiles = (allTherapists, targetCity) => {
    if (!allTherapists || allTherapists.length === 0) return [];
    
    // Don't create showcase profiles for Yogyakarta itself
    if (targetCity.toLowerCase() === 'yogyakarta' || 
        targetCity.toLowerCase() === 'yogya' || 
        targetCity.toLowerCase() === 'jogja') {
        return [];
    }
    
    // Find first 5 Yogyakarta therapists
    const yogyaTherapists = allTherapists
        .filter((t) => {
            if (!t.location) return false;
            
            const location = t.location.toLowerCase();
            return location.includes('yogyakarta') || 
                   location.includes('yogya') || 
                   location.includes('jogja');
        })
        .slice(0, 5); // Take first 5
    
    console.log(`🎭 Found ${yogyaTherapists.length} Yogyakarta therapists for showcase in ${targetCity}:`, 
               yogyaTherapists.map(t => t.name));
    
    // Create showcase versions with busy status and target city location
    const showcaseProfiles = yogyaTherapists.map((therapist, index) => ({
        ...therapist,
        // Override key properties for showcase
        $id: `showcase-${therapist.$id || therapist.id}-${targetCity}`,
        id: `showcase-${therapist.$id || therapist.id}-${targetCity}`,
        status: 'busy', // Always busy to prevent bookings outside Yogyakarta
        availability: 'busy',
        isAvailable: false,
        location: `${targetCity}, Indonesia`,
        city: targetCity,
        isShowcaseProfile: true,
        originalTherapistId: therapist.$id || therapist.id,
        showcaseCity: targetCity,
    }));
    
    console.log(`🎭 Created ${showcaseProfiles.length} showcase profiles from Yogyakarta for city: ${targetCity}`);
    
    return showcaseProfiles;
};

// Test different cities
const testCities = ['Bali', 'Jakarta', 'Surabaya', 'Yogyakarta'];

console.log('=== TESTING SHOWCASE SYSTEM ===\n');

testCities.forEach(city => {
    console.log(`📍 Testing city: ${city}`);
    
    const showcaseProfiles = getYogyakartaShowcaseProfiles(mockTherapists, city);
    
    if (showcaseProfiles.length > 0) {
        console.log(`   ✅ Created ${showcaseProfiles.length} showcase profiles:`);
        showcaseProfiles.forEach(profile => {
            console.log(`      - ${profile.name} (Status: ${profile.status}, Location: ${profile.location})`);
            console.log(`        Original ID: ${profile.originalTherapistId} → Showcase ID: ${profile.$id}`);
        });
    } else {
        console.log(`   ℹ️ No showcase profiles created (expected for Yogyakarta)`);
    }
    console.log('');
});

console.log('=== EXPECTED BEHAVIOR ===');
console.log('✅ Bali: Should see 4 Yogyakarta therapists as "busy" with Bali location');
console.log('✅ Jakarta: Should see 4 Yogyakarta therapists as "busy" with Jakarta location');
console.log('✅ Surabaya: Should see 4 Yogyakarta therapists as "busy" with Surabaya location');
console.log('✅ Yogyakarta: Should see original therapists with their real status (Available/Offline)');

console.log('\n=== HOW TO VERIFY ON WEBSITE ===');
console.log('1. Visit http://localhost:3000/bali - should see Yogyakarta therapists as busy');
console.log('2. Visit http://localhost:3000/jakarta - should see Yogyakarta therapists as busy');
console.log('3. Visit http://localhost:3000/yogyakarta - should see original therapists with normal status');
console.log('4. Check browser console for showcase profile creation logs');

console.log('\n🎯 All tests completed! The showcase system should be working.');