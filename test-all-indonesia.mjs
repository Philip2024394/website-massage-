// Debug script to test location-based filtering behavior
console.log('🧪 Testing "All Indonesia" filtering behavior\n');

// Test the isFeaturedSample logic for Budi
function isFeaturedSample(provider, type) {
    if (!provider || typeof provider !== 'object') return false;
    
    // Featured sample therapists (always show in all cities)
    if (type === 'therapist') {
        const featuredTherapistIds = [
            'budi-featured-sample', 
            'featured-sample-therapist',
            'sample-therapist-budi'
        ];
        
        return featuredTherapistIds.some(id => 
            provider.id === id || 
            provider.$id === id ||
            (provider.name && provider.name.toLowerCase().includes('budi'))
        );
    }
    
    return false;
}

// Simulate therapist filtering logic
function testAllIndonesiaFiltering() {
    const selectedCity = 'all';
    
    // Sample therapists (simulating your data)
    const therapists = [
        { name: 'Budi', location: 'Jakarta', id: 'budi-featured-sample' },
        { name: 'Sari', location: 'Yogyakarta', id: 'sari-123' },
        { name: 'Andi', location: 'Yogyakarta', id: 'andi-456' },
        { name: 'Rina', location: 'Yogyakarta', id: 'rina-789' },
        { name: 'Dewa', location: 'Bali', id: 'dewa-101' }
    ];
    
    console.log('Input therapists:', therapists.length);
    
    // Apply filtering logic
    const filteredTherapists = therapists.filter((t) => {
        // Always show featured sample therapists (like Budi) in ALL cities
        if (isFeaturedSample(t, 'therapist')) {
            console.log(`✅ Including featured therapist "${t.name}" in city "${selectedCity}"`);
            return true;
        }
        
        if (selectedCity === 'all') {
            console.log(`✅ Including therapist "${t.name}" - ALL INDONESIA selected`);
            return true;
        }
        
        return false;
    });
    
    console.log('\n📊 Results:');
    console.log(`- Input: ${therapists.length} therapists`);
    console.log(`- Output: ${filteredTherapists.length} therapists`);
    console.log('- Filtered therapists:', filteredTherapists.map(t => t.name));
    
    if (filteredTherapists.length === therapists.length) {
        console.log('✅ SUCCESS: All Indonesia shows all therapists');
    } else {
        console.log('❌ ISSUE: Some therapists filtered out');
    }
}

testAllIndonesiaFiltering();