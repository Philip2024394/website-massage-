const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1cea58a1e69f6ade2b3583f08ceb9409fb527ec6e38f3d04818d6cf1c1492082a3c153af8d386ddec1faea977502b614e896b69950aea277f592e6b93ffdfc2c3e39c649cc01c0e54af8c7e1b76c6d299921280366a5e78b6cf8cb1179a34fb208c295e0ff554f7739efd206dc958779d52a4ac5474d289b1c5fe53cf3f9b313');

const databases = new Databases(client);

async function testTherapistServiceFlow() {
    console.log('🔍 Testing Therapist Service Flow for isVerified property...\n');
    
    try {
        // First, get raw data directly from Appwrite
        console.log('1. 📡 Direct Appwrite fetch:');
        const response = await databases.listDocuments(
            '68f76ee1000e64ca8d05',
            'therapists_collection_id',
            [Query.limit(500)]
        );
        
        const budiRaw = response.documents.find(t => t.name?.toLowerCase().includes('budi'));
        if (budiRaw) {
            console.log('   ✅ Budi found in raw Appwrite data:');
            console.log('   - Name:', budiRaw.name);
            console.log('   - isVerified:', budiRaw.isVerified);
            console.log('   - verifiedAt:', budiRaw.verifiedAt);
        } else {
            console.log('   ❌ Budi not found in raw data');
        }
        
        console.log('   📊 Total therapists:', response.documents.length);
        console.log('   📊 Therapists with isVerified=true:', response.documents.filter(t => t.isVerified === true).length);
        
        // Now simulate the service transformation
        console.log('\n2. 🔄 Service transformation test:');
        const therapistsWithImages = response.documents.map((therapist, index) => {
            // This mimics the transformation in therapist.service.ts
            const normalizeStatus = (status) => {
                if (!status) return 'Busy';
                const lowercaseStatus = status.toLowerCase();
                if (lowercaseStatus === 'available') return 'Available';
                if (lowercaseStatus === 'busy') return 'Busy';
                if (lowercaseStatus === 'offline') return 'Busy';
                return status;
            };

            return {
                ...therapist,
                status: normalizeStatus(therapist.status),
                availability: normalizeStatus(therapist.availability || therapist.status)
                // isVerified should be preserved here
            };
        });
        
        const budiTransformed = therapistsWithImages.find(t => t.name?.toLowerCase().includes('budi'));
        if (budiTransformed) {
            console.log('   ✅ Budi after service transformation:');
            console.log('   - Name:', budiTransformed.name);
            console.log('   - isVerified:', budiTransformed.isVerified);
            console.log('   - verifiedAt:', budiTransformed.verifiedAt);
            console.log('   - Status (normalized):', budiTransformed.status);
        } else {
            console.log('   ❌ Budi lost after transformation');
        }
        
        console.log('   📊 Total after transformation:', therapistsWithImages.length);
        console.log('   📊 Still have isVerified=true:', therapistsWithImages.filter(t => t.isVerified === true).length);
        
        // Test a few more therapists to see their isVerified status
        console.log('\n3. 📋 Sample of therapists with verification status:');
        therapistsWithImages.slice(0, 5).forEach((t, i) => {
            console.log(`   ${i+1}. ${t.name}: isVerified=${t.isVerified}, status=${t.status}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testTherapistServiceFlow();