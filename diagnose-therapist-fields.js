// Quick diagnostic script to check therapist collection fields
// Run this in browser console when on therapist status page

console.log('🔍 THERAPIST COLLECTION DIAGNOSTIC');
console.log('================================');

// Check if therapistService is available
if (typeof window !== 'undefined' && window.therapistService) {
    console.log('✅ therapistService found');
    
    // Try to get therapist data
    window.therapistService.getAll().then(therapists => {
        console.log(`📊 Found ${therapists.length} therapists`);
        
        if (therapists.length > 0) {
            const firstTherapist = therapists[0];
            console.log('👤 First therapist sample:', firstTherapist);
            
            // Check for status fields
            console.log('\n🔍 STATUS FIELD CHECK:');
            const statusFields = {
                'isOnline': firstTherapist.isOnline,
                'status': firstTherapist.status,
                'availability': firstTherapist.availability,
                'isLive': firstTherapist.isLive
            };
            
            let missingFields = [];
            
            Object.entries(statusFields).forEach(([field, value]) => {
                if (value !== undefined) {
                    console.log(`✅ ${field}: ${JSON.stringify(value)}`);
                } else {
                    console.log(`❌ ${field}: MISSING!`);
                    missingFields.push(field);
                }
            });
            
            if (missingFields.length > 0) {
                console.log('\n🚨 MISSING FIELDS FOUND:');
                console.log('You need to add these to your Appwrite collection:');
                
                missingFields.forEach(field => {
                    let type = 'string';
                    let defaultValue = 'null';
                    
                    if (field === 'isOnline' || field === 'isLive') {
                        type = 'boolean';
                        defaultValue = 'false';
                    } else if (field === 'status' || field === 'availability') {
                        type = 'enum (Available, Busy, Offline)';
                        defaultValue = 'Offline';
                    }
                    
                    console.log(`• ${field} (${type}) - default: ${defaultValue}`);
                });
                
                console.log('\n📋 HOW TO FIX:');
                console.log('1. Go to Appwrite Console → therapists_collection_id');
                console.log('2. Click "Add Attribute"');
                console.log('3. Add each missing field with correct type');
                console.log('4. Set default values as shown above');
            } else {
                console.log('\n🎉 ALL STATUS FIELDS EXIST!');
                
                // Test status update
                console.log('\n🧪 Testing status update...');
                window.therapistService.update(firstTherapist.$id || firstTherapist.id, {
                    status: 'Available',
                    isOnline: true
                }).then(result => {
                    console.log('✅ STATUS UPDATE SUCCESS!', result);
                }).catch(error => {
                    console.error('❌ STATUS UPDATE FAILED:', error);
                });
            }
        }
        
    }).catch(error => {
        console.error('❌ Failed to get therapists:', error);
        
        if (error.message.includes('Collection with the requested ID could not be found')) {
            console.log('\n🚨 COLLECTION NOT FOUND!');
            console.log('The collection ID "therapists_collection_id" doesn\'t exist.');
            console.log('You need to find the real collection ID from Appwrite console.');
        }
    });
} else {
    console.log('❌ therapistService not found');
    console.log('Make sure you\'re on the therapist status page');
}