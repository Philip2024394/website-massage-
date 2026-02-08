// Test Appwrite connection and fetch therapists
// Run this in browser console to debug backend connection

console.log('🧪 [CONNECTION TEST] Testing Appwrite backend connection...');

// Test environment variables
console.log('📋 Environment Variables:');
console.log('  ENDPOINT:', import.meta?.env?.VITE_APPWRITE_ENDPOINT || 'MISSING');
console.log('  PROJECT:', import.meta?.env?.VITE_APPWRITE_PROJECT_ID || 'MISSING');  
console.log('  DATABASE:', import.meta?.env?.VITE_APPWRITE_DATABASE_ID || 'MISSING');
console.log('  THERAPISTS_COLLECTION:', import.meta?.env?.VITE_THERAPISTS_COLLECTION_ID || 'MISSING');

// Test direct Appwrite connection
const testConnection = async () => {
    try {
        console.log('🔗 Testing direct Appwrite connection...');
        
        // Try to import Appwrite client
        const { databases } = await import('/src/lib/appwrite/config.js');
        console.log('✅ Appwrite client imported successfully');
        
        // Test database connection
        const databaseId = import.meta?.env?.VITE_APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
        const therapistCollection = import.meta?.env?.VITE_THERAPISTS_COLLECTION_ID || 'therapists';
        
        console.log('🔍 Testing with:', { databaseId, therapistCollection });
        
        const response = await databases.listDocuments(databaseId, therapistCollection, []);
        
        console.log('✅ SUCCESS! Therapists found:', response.documents.length);
        console.log('👥 Sample therapists:', response.documents.slice(0, 3).map(t => ({
            id: t.$id,
            name: t.name,
            location: t.location,
            status: t.status || t.availability
        })));
        
        return response.documents;
        
    } catch (error) {
        console.error('❌ CONNECTION ERROR:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            type: error.type,
            stack: error.stack
        });
        
        // Provide specific error guidance
        if (error.code === 401) {
            console.error('🔑 AUTHENTICATION ISSUE - Check project ID and endpoint');
        } else if (error.code === 404) {
            console.error('🗃️ COLLECTION NOT FOUND - Check collection ID');
        } else if (error.code === 400) {
            console.error('⚙️ BAD REQUEST - Check database ID and query parameters');
        }
        
        return null;
    }
};

// Test therapist service
const testTherapistService = async () => {
    try {
        console.log('🏥 Testing therapist service...');
        
        const { therapistService } = await import('/src/lib/appwrite/services/therapist.service.js');
        console.log('✅ Therapist service imported');
        
        const therapists = await therapistService.getTherapists();
        console.log('✅ Therapist service SUCCESS:', therapists?.length || 0, 'therapists');
        
        return therapists;
        
    } catch (error) {
        console.error('❌ THERAPIST SERVICE ERROR:', error);
        return null;
    }
};

// Run tests
window.testBackendConnection = async () => {
    console.log('🚀 [BACKEND TEST] Starting comprehensive backend test...');
    
    const directResult = await testConnection();
    const serviceResult = await testTherapistService();
    
    const summary = {
        directConnection: !!directResult,
        therapistService: !!serviceResult,
        therapistCount: (directResult?.length || 0) + (serviceResult?.length || 0),
        recommendation: ''
    };
    
    if (summary.directConnection && summary.therapistService) {
        summary.recommendation = '✅ Backend working - check React state management';
    } else if (summary.directConnection && !summary.therapistService) {
        summary.recommendation = '⚙️ Fix therapist service implementation';
    } else if (!summary.directConnection) {
        summary.recommendation = '🔧 Fix Appwrite configuration and collection IDs';
    }
    
    console.log('📊 [BACKEND TEST] Summary:', summary);
    return summary;
};

// Auto-run test
console.log('💡 Running automatic backend test...');
window.testBackendConnection();