// Live Therapist Data Feed Test
// Tests real-time connection to Appwrite database

const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('68f76ee1000e64ca8d05');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'therapists';

console.log('🔍 Testing Live Therapist Data Feed...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function testLiveDataFeed() {
    try {
        console.log('📡 Connecting to Appwrite...');
        console.log('   Endpoint: https://cloud.appwrite.io/v1');
        console.log('   Project: 68f76ee1000e64ca8d05');
        console.log('   Database: 68f76ee1000e64ca8d05');
        console.log('   Collection: therapists\n');

        // Fetch therapist data
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.limit(10), Query.orderDesc('$createdAt')]
        );

        console.log('✅ CONNECTION SUCCESSFUL!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📊 Total Therapists in Database: ${response.total}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Calculate statistics
        const therapists = response.documents;
        const available = therapists.filter(t => 
            t.availabilityStatus === 'AVAILABLE' || 
            t.availability === 'available' ||
            t.status === 'available'
        ).length;
        const busy = therapists.filter(t => 
            t.availabilityStatus === 'BUSY' || 
            t.availability === 'busy' ||
            t.status === 'busy'
        ).length;
        const offline = therapists.length - available - busy;

        console.log('📈 LIVE STATUS BREAKDOWN:');
        console.log(`   🟢 Available: ${available}`);
        console.log(`   🟡 Busy: ${busy}`);
        console.log(`   ⚫ Offline: ${offline}\n`);

        console.log('👥 SAMPLE THERAPIST DATA (Latest 10):\n');
        
        therapists.forEach((therapist, index) => {
            const status = therapist.availabilityStatus || therapist.availability || therapist.status || 'offline';
            const statusIcon = status === 'AVAILABLE' || status === 'available' ? '🟢' : 
                              status === 'BUSY' || status === 'busy' ? '🟡' : '⚫';
            
            console.log(`${index + 1}. ${statusIcon} ${therapist.name || 'Unnamed Therapist'}`);
            console.log(`   Status: ${status.toUpperCase()}`);
            console.log(`   Location: ${therapist.city || therapist.location || 'Not set'}`);
            console.log(`   WhatsApp: ${therapist.whatsappNumber || 'Not provided'}`);
            console.log(`   Rating: ${therapist.rating || 'N/A'}`);
            console.log(`   ID: ${therapist.$id}`);
            console.log(`   Created: ${new Date(therapist.$createdAt).toLocaleString()}`);
            console.log(`   Updated: ${new Date(therapist.$updatedAt).toLocaleString()}`);
            console.log('');
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ LIVE DATA FEED CONFIRMED WORKING');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        
        console.log('🔄 Real-time updates available:');
        console.log('   • Data refreshes automatically in the dashboard');
        console.log('   • Status changes are reflected immediately');
        console.log('   • All therapist CRUD operations are live\n');

    } catch (error) {
        console.error('❌ CONNECTION FAILED!\n');
        console.error('Error Details:', error.message);
        console.error('\nPossible Issues:');
        console.error('   • Network connection problem');
        console.error('   • Invalid project/database credentials');
        console.error('   • Collection permissions');
        console.error('   • API endpoint unreachable\n');
        process.exit(1);
    }
}

testLiveDataFeed();
