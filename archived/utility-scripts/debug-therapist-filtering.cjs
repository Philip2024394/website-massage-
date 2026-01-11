const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_4523bc01a6e8510e7b7c8d71b17ccf81415c02e93a78e1b7ba53b0bf195b7281e88c5cc57f95ce671090e253d76b4526fd3e768c3c002414eaa7f9ba76a508a2841f52d23a869bd4269d3de5cb952b48f3e418eebfedd1022e04c0941c460047f162349c1a8a56d9fbf89bb0e92f5a3566d2c00759b730b6b7077d936c6061944');

const databases = new Databases(client);
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = '68f76ee1000ee9c28b31';

async function analyzeTherapistFiltering() {
    try {
        console.log('🔍 Analyzing therapist filtering logic...\n');
        
        // Fetch therapists directly from Appwrite
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );
        
        const therapists = response.documents;
        console.log(`✅ Total therapists from database: ${therapists?.length || 0}\n`);
        
        if (!therapists || therapists.length === 0) {
            console.log('❌ No therapists to analyze!');
            return;
        }
        
        // Simulate the filtering functions from HomePage
        const normalizeBooleanFlag = (value) => {
            if (typeof value === 'boolean') return value;
            if (typeof value === 'string') {
                const normalized = value.trim().toLowerCase();
                if (normalized === 'true') return true;
                if (normalized === 'false') return false;
            }
            return null;
        };

        const shouldTreatTherapistAsLive = (therapist) => {
            const normalizedLiveFlag = normalizeBooleanFlag(therapist.isLive);
            const normalizedStatus = (therapist.status || therapist.availability || '')
                .toString()
                .trim()
                .toLowerCase();
            
            const statusImpliesLive = normalizedStatus === 'available' || 
                                      normalizedStatus === 'busy' || 
                                      normalizedStatus === 'offline' ||
                                      normalizedStatus === 'online';
            
            if (normalizedLiveFlag === false) return false;
            if (normalizedLiveFlag === true) return true;
            if (statusImpliesLive) return true;
            return normalizedStatus.length === 0;
        };

        const isFeaturedSample = (provider) => {
            if (!provider) return false;
            const name = provider.name?.toLowerCase() || '';
            return name.includes('budi');
        };
        
        // Test filtering
        console.log('=== FILTERING ANALYSIS ===');
        
        let step1_liveFiltered = [];
        let step2_featuredOrLive = [];
        
        therapists.forEach((therapist, index) => {
            const isLive = shouldTreatTherapistAsLive(therapist);
            const isFeatured = isFeaturedSample(therapist);
            
            console.log(`${index + 1}. ${therapist.name}:`);
            console.log(`   - isLive (raw): ${therapist.isLive}`);
            console.log(`   - status: ${therapist.status || 'null'}`);
            console.log(`   - shouldTreatAsLive: ${isLive}`);
            console.log(`   - isFeatured: ${isFeatured}`);
            console.log(`   - PASSES FILTER: ${isLive || isFeatured}`);
            
            if (isLive) step1_liveFiltered.push(therapist);
            if (isLive || isFeatured) step2_featuredOrLive.push(therapist);
            console.log('');
        });
        
        console.log(`📊 FILTER RESULTS:`);
        console.log(`   Total therapists: ${therapists.length}`);
        console.log(`   Pass shouldTreatAsLive: ${step1_liveFiltered.length}`);
        console.log(`   Pass isLive OR isFeatured: ${step2_featuredOrLive.length}`);
        
        if (step2_featuredOrLive.length === 0) {
            console.log('\n❌ PROBLEM FOUND: No therapists pass the filtering logic!');
            console.log('💡 This explains why no therapists are displaying on homepage.');
        } else if (step2_featuredOrLive.length < 5) {
            console.log('\n⚠️ WARNING: Very few therapists pass filtering.');
            console.log('Therapists that WOULD display:', step2_featuredOrLive.map(t => t.name));
        }
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
    }
}

analyzeTherapistFiltering();