/* 
 * COPY AND PASTE THIS INTO BROWSER CONSOLE
 * On either http://localhost:3003 or http://localhost:3000
 * 
 * This will show you the REAL collection IDs from Appwrite
 */

(async () => {
    console.log('🔍 Finding Real Appwrite Collection IDs...\n');
    
    try {
        // Import Appwrite client from CDN
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/appwrite@15.0.0';
        document.head.appendChild(script);
        
        await new Promise(resolve => script.onload = resolve);
        
        const { Client, Databases } = Appwrite;
        
        const client = new Client()
            .setEndpoint('https://syd.cloud.appwrite.io/v1')
            .setProject('68f23b11000d25eb3664');
        
        const databases = new Databases(client);
        
        console.log('✅ Connected to Appwrite');
        console.log('📋 Fetching collections...\n');
        
        const response = await databases.listCollections('68f76ee1000e64ca8d05');
        
        console.log(`Found ${response.total} collections:\n`);
        
        const collections = response.collections.map(c => ({
            Name: c.name,
            ID: c.$id,
            Documents: c.documentSecurity ? 'Enabled' : 'Disabled'
        }));
        
        console.table(collections);
        
        // Find therapist collection
        const therapistCol = response.collections.find(c => 
            c.name.toLowerCase().includes('therapist') ||
            c.$id.toLowerCase().includes('therapist')
        );
        
        if (therapistCol) {
            console.log('\n✅ Found Therapist Collection:');
            console.log('   Name:', therapistCol.name);
            console.log('   ID:', therapistCol.$id);
            console.log('\n📝 UPDATE THIS IN YOUR CODE:');
            console.log('   File: lib/appwrite.config.ts');
            console.log('   Line: 15');
            console.log(`   Change: therapists: '${therapistCol.$id}',`);
            
            // Try to fetch therapists
            try {
                const docs = await databases.listDocuments(
                    '68f76ee1000e64ca8d05',
                    therapistCol.$id
                );
                console.log('\n📊 Collection Stats:');
                console.log('   Total therapists:', docs.total);
                console.log('   Live therapists:', docs.documents.filter(d => d.isLive).length);
                
                if (docs.total > 0) {
                    console.log('\n👥 Therapist List:');
                    console.table(docs.documents.map(d => ({
                        Name: d.name || 'No name',
                        isLive: d.isLive ? '✅' : '❌',
                        City: d.city || 'Not set',
                        Email: d.email || 'Not set'
                    })));
                }
            } catch (error) {
                console.error('❌ Could not fetch therapists:', error.message);
            }
        } else {
            console.error('\n❌ Could not find therapist collection');
            console.log('Available collections:', response.collections.map(c => c.name).join(', '));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Make sure you run this in the browser console');
        console.log('   NOT in a standalone HTML file');
    }
})();
