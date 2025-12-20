const { Client, Databases, Query } = require('node-appwrite');

const config = {
    endpoint: 'https://appwrite.indostreet.com/v1',
    projectId: '68f23b11000d25eb3664',
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapists: 'therapists_collection_id'
    }
};

console.log('🔧 SURTININGSIH PREMIUM UPGRADE - Starting...');
console.log('📋 This will upgrade Surtiningsih to Premium with special 30% commission rate');

const client = new Client()
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey('standard_0a9ff2646235d8dd067b3f7cab00e3fb21977a5d5aca23732d99ee0d07f888ae929c73f6c75fe27f4aba04b47b562b85dd5027dc9d7d564fcd446c8565a9ba5c9b52688286534228f188165d6b24fbb7b88af9b8e1e12d6b2d6dbc21ac964647da055b5806a7e104c0e994e4b528ecab44a29c55cfce99cd98dc454e27136ca0');

const databases = new Databases(client);

async function upgradeSurtiningsih() {
    try {
        console.log('🔍 Searching for therapist: Surtiningsih...');
        
        // Search by name
        const response = await databases.listDocuments(
            config.databaseId,
            config.collections.therapists,
            [
                Query.search('name', 'Surtiningsih')
            ]
        );

        if (response.documents.length === 0) {
            console.log('❌ Therapist "Surtiningsih" not found');
            console.log('📝 Trying to list all therapists to find similar names...');
            
            const allTherapists = await databases.listDocuments(
                config.databaseId,
                config.collections.therapists
            );
            
            const similar = allTherapists.documents.filter(t => 
                t.name && t.name.toLowerCase().includes('surti')
            );
            
            if (similar.length > 0) {
                console.log('🔍 Found similar names:');
                similar.forEach(t => {
                    console.log(`   - ${t.name} (ID: ${t.$id})`);
                });
            } else {
                console.log('❌ No similar names found');
            }
            return;
        }

        const therapist = response.documents[0];
        console.log(`✅ Found therapist: ${therapist.name} (ID: ${therapist.$id})`);
        console.log(`📊 Current status:`);
        console.log(`   - Membership Tier: ${therapist.membershipTier || 'free'}`);
        console.log(`   - Commission Rate: ${therapist.commissionRate || 'not set'}`);
        console.log(`   - Verified: ${therapist.isVerified || false}`);
        console.log(`   - Verification Badge: ${therapist.verificationBadge || 'none'}`);

        console.log('\n🔄 Upgrading to Premium with special terms...');
        
        const updateData = {
            // Premium membership
            membershipTier: 'plus', // Premium tier
            
            // Special commission rate (30% instead of 0% for premium)
            commissionRate: 30, // 30% commission on all bookings
            
            // Verified badge
            isVerified: true,
            verificationBadge: 'verified',
            verifiedAt: new Date().toISOString(),
            
            // Premium features activation
            hasPackages: true,
            
            // Note in description about special arrangement
            specialArrangement: 'Premium member with 30% commission - Admin staff member'
        };

        console.log('📝 Update data:', JSON.stringify(updateData, null, 2));
        
        await databases.updateDocument(
            config.databaseId,
            config.collections.therapists,
            therapist.$id,
            updateData
        );

        console.log('\n✅ SUCCESS! Surtiningsih upgraded to Premium');
        console.log('📋 Premium features activated:');
        console.log('   ✅ Premium membership tier (Plus)');
        console.log('   ✅ Verified badge added to profile');
        console.log('   ✅ 30% commission on all bookings (Book Now + Scheduled)');
        console.log('   ✅ No monthly membership fee');
        console.log('   ✅ All premium analytics and features enabled');
        
        console.log('\n💰 Commission Structure:');
        console.log('   - Book Now bookings: 30% commission');
        console.log('   - Scheduled bookings: 30% commission');
        console.log('   - Monthly fee: IDR 0 (waived for admin staff)');
        
        console.log('\n🎉 Surtiningsih can now access:');
        console.log('   - Real-time analytics');
        console.log('   - Best Times Analytics');
        console.log('   - My Bookings management');
        console.log('   - Premium search placement');
        console.log('   - Verified badge on profile');

    } catch (error) {
        console.error('❌ Error upgrading Surtiningsih:', error);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
}

// Run the upgrade
upgradeSurtiningsih()
    .then(() => {
        console.log('\n✅ Upgrade process completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Upgrade process failed:', error);
        process.exit(1);
    });
