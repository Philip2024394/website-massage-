import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

async function getBudiProfile() {
    try {
        console.log('🔍 Fetching Budi\'s complete profile data...\n');
        
        const response = await databases.getDocument(
            '68f76ee1000e64ca8d05', // database ID
            '676703b40009b9dd33de', // therapists collection ID 
            '692467a3001f6f05aaa1'  // Budi's document ID
        );
        
        console.log('=== BUDI\'S COMPLETE PROFILE DATA ===');
        console.log(JSON.stringify(response, null, 2));
        
        console.log('\n=== KEY FIELDS ANALYSIS ===');
        console.log('📧 Email:', response.email || 'NOT SET');
        console.log('🎯 isLive:', response.isLive);
        console.log('📱 WhatsApp:', response.whatsappNumber || 'NOT SET');
        console.log('🏙️ City:', response.city || 'NOT SET');
        console.log('📍 Location:', response.location || 'NOT SET');
        console.log('💼 Status:', response.status || 'NOT SET');
        console.log('✅ Availability:', response.availability || 'NOT SET');
        console.log('🌐 isOnline:', response.isOnline);
        console.log('🖼️ Profile Picture:', response.profilePicture ? 'SET' : 'NOT SET');
        console.log('🖼️ Main Image:', response.mainImage ? 'SET' : 'NOT SET');
        console.log('💆 Massage Types:', response.massageTypes || 'NOT SET');
        console.log('🗣️ Languages:', response.languages || 'NOT SET');
        console.log('📍 Coordinates:', response.coordinates || 'NOT SET');
        console.log('📝 Description:', response.description ? 'SET (' + response.description.length + ' chars)' : 'NOT SET');
        console.log('💰 Price 60min:', response.price60 || 'NOT SET');
        console.log('💰 Price 90min:', response.price90 || 'NOT SET');
        console.log('💰 Price 120min:', response.price120 || 'NOT SET');
        console.log('🎂 Years Experience:', response.yearsOfExperience || 'NOT SET');
        
        console.log('\n=== MASSAGE TYPES FORMAT ===');
        if (response.massageTypes) {
            console.log('Raw value:', response.massageTypes);
            console.log('Type:', typeof response.massageTypes);
            
            // Try to parse as JSON
            try {
                const parsed = JSON.parse(response.massageTypes);
                console.log('Parsed as JSON:', parsed);
                console.log('Is Array:', Array.isArray(parsed));
            } catch (e) {
                console.log('Not JSON format - treating as string');
            }
        }
        
        console.log('\n=== COORDINATES FORMAT ===');
        if (response.coordinates) {
            console.log('Raw value:', response.coordinates);
            console.log('Type:', typeof response.coordinates);
            
            try {
                const parsed = JSON.parse(response.coordinates);
                console.log('Parsed coordinates:', parsed);
            } catch (e) {
                console.log('Not JSON format - treating as string');
            }
        }
        
    } catch (error) {
        console.error('❌ Error fetching Budi\'s profile:', error);
    }
}

getBudiProfile();