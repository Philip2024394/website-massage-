#!/usr/bin/env node
/**
 * Initialize reviews for wiwid/ww therapists
 */

import { reviewService } from '../lib/reviewService.ts';

// IDs found for ww/wiwid therapists
const wiwid_therapist_ids = [
    '69499239000c90bfd283', // ww
    '694a02cd0036089583db', // ww  
    '694ed78f9574395fd7b9'  // Wiwid
];

console.log('🔄 Initializing reviews for wiwid therapists...\n');

wiwid_therapist_ids.forEach(id => {
    // Add Wiwid to the special mock reviews like Surtiningsih
    const mockTherapist = {
        $id: id,
        name: id === '694ed78f9574395fd7b9' ? 'Wiwid' : 'ww',
        location: 'Yogyakarta, Indonesia',
        rating: 0,
        reviewCount: 0
    };
    
    // Initialize with review data
    const initializedTherapist = reviewService.initializeProvider(mockTherapist);
    console.log(`✅ Initialized ${mockTherapist.name} (${id})`);
    console.log(`   Rating: ${initializedTherapist.rating}`);
    console.log(`   Review Count: ${initializedTherapist.reviewCount}\n`);
});