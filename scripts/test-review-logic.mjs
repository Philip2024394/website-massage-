#!/usr/bin/env node
/**
 * Test the review initialization system directly
 */

// Simulate the reviewService behavior
const mockTherapist = {
    $id: '694ed78f9574395fd7b9',
    name: 'Wiwid',
    location: 'Yogyakarta, Indonesia',
    rating: null,
    reviewCount: null,
    reviewcount: null // Check both possible field names
};

console.log('🧪 Testing review initialization logic...\n');

console.log('📊 Initial therapist data:');
console.log(JSON.stringify(mockTherapist, null, 2));

// Test the condition logic
const needsInitialization = !mockTherapist.rating || mockTherapist.rating === 0 || 
                           !mockTherapist.reviewCount || mockTherapist.reviewCount === 0;

console.log(`\n🔍 Needs initialization: ${needsInitialization}`);
console.log(`   !rating: ${!mockTherapist.rating}`);
console.log(`   rating === 0: ${mockTherapist.rating === 0}`);
console.log(`   !reviewCount: ${!mockTherapist.reviewCount}`);
console.log(`   reviewCount === 0: ${mockTherapist.reviewCount === 0}`);

// Simulate generateInitialReviewData
const mockInitialData = {
    rating: (4.7 + Math.random() * 0.3).toFixed(1),
    reviewCount: Math.floor(28 + Math.random() * 7)
};

console.log(`\n⭐ Generated initial data:`, mockInitialData);

if (needsInitialization) {
    const initializedTherapist = {
        ...mockTherapist,
        rating: parseFloat(mockInitialData.rating),
        reviewCount: mockInitialData.reviewCount
    };
    
    console.log('\n✅ After initialization:');
    console.log(JSON.stringify(initializedTherapist, null, 2));
} else {
    console.log('\n❌ No initialization needed (therapist already has review data)');
}

console.log('\n💡 If this test shows initialization should work, but reviews are not showing,');
console.log('   the issue is likely in how the data is being processed in the React components.');