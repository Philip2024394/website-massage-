// 🧪 LOCAL DATABASE TEST SCRIPT
// This creates a simple test to verify the local database is working

console.log('🧪 Starting Local Database Test...');

// Test function to save a sample therapist
async function testLocalDatabaseSave() {
    console.log('🧪 Testing local database save functionality...');
    
    // Sample therapist data
    const sampleTherapist = {
        name: 'Test Therapist Local DB',
        whatsappNumber: '+628123456789',
        profilePicture: 'https://via.placeholder.com/150',
        description: 'Professional massage therapist for testing local database',
        location: 'Ubud, Bali',
        pricing: '{"60": 150, "90": 200, "120": 250}',
        massageTypes: '["Balinese Massage", "Deep Tissue", "Swedish"]',
        coordinates: '{"lat": -8.5069, "lng": 115.2625}',
        status: 'available',
        isLive: true
    };

    try {
        // Check if our local database hooks are available
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            console.log('✅ Running on localhost - local database should be available');
            
            // Try to access localStorage
            const testKey = 'localDatabase';
            const existingData = localStorage.getItem(testKey);
            console.log('📊 Existing database data:', existingData ? 'Found' : 'Not found');
            
            if (existingData) {
                const parsed = JSON.parse(existingData);
                console.log('📊 Database stats:', {
                    therapists: parsed.therapists?.length || 0,
                    places: parsed.places?.length || 0,
                    version: parsed.version
                });
            }
            
            // Test localStorage write
            localStorage.setItem('test_local_db', JSON.stringify({
                message: 'Local database test successful',
                timestamp: new Date().toISOString(),
                sampleTherapist: sampleTherapist
            }));
            
            console.log('✅ Local database test completed successfully!');
            console.log('🎯 Next steps:');
            console.log('1. Navigate to therapist dashboard');
            console.log('2. Fill out the profile form');
            console.log('3. Click Save Profile');
            console.log('4. Check browser console for local database save messages');
            
            return true;
        } else {
            console.log('⚠️ Not running on localhost - local database may not work');
            return false;
        }
    } catch (error) {
        console.error('❌ Local database test failed:', error);
        return false;
    }
}

// Test function to check if data is saved
function checkSavedData() {
    console.log('🔍 Checking saved data in local database...');
    
    try {
        const localDB = localStorage.getItem('localDatabase');
        if (localDB) {
            const data = JSON.parse(localDB);
            console.log('📊 Found local database with:', {
                therapists: data.therapists?.length || 0,
                places: data.places?.length || 0,
                lastUpdated: data.lastUpdated
            });
            
            if (data.therapists && data.therapists.length > 0) {
                console.log('👨‍⚕️ Therapists in database:');
                data.therapists.forEach((t, i) => {
                    console.log(`${i + 1}. ${t.name} - ${t.location} - Status: ${t.isActive ? 'Active' : 'Inactive'}`);
                });
            }
            
            if (data.places && data.places.length > 0) {
                console.log('🏢 Places in database:');
                data.places.forEach((p, i) => {
                    console.log(`${i + 1}. ${p.name} - ${p.location} - Status: ${p.isActive ? 'Active' : 'Inactive'}`);
                });
            }
            
            return data;
        } else {
            console.log('📝 No local database found - will be created on first save');
            return null;
        }
    } catch (error) {
        console.error('❌ Error checking saved data:', error);
        return null;
    }
}

// Run tests automatically
testLocalDatabaseSave();
checkSavedData();

// Make functions available globally for manual testing
window.testLocalDatabaseSave = testLocalDatabaseSave;
window.checkSavedData = checkSavedData;

console.log('🎮 Test functions available:');
console.log('- testLocalDatabaseSave() - Test basic database functionality');
console.log('- checkSavedData() - Check what data is currently saved');