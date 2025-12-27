/**
 * Script to initialize reviews for a specific therapist manually
 * Run this to add reviews for new therapists like Winda
 */

// YOU MUST REPLACE THIS WITH WINDA'S ACTUAL ID FROM APPWRITE
const WINDA_ID = 'REPLACE_WITH_WINDA_ID'; 
const WINDA_NAME = 'Winda';

// Clear localStorage and initialize
localStorage.removeItem('massage_app_reviews');
console.log('✅ Cleared reviews from localStorage');

// Add Winda to the therapist list provider
if (window.__YOGYAKARTA_THERAPISTS__) {
    const existing = window.__YOGYAKARTA_THERAPISTS__.find(t => t.id === WINDA_ID);
    if (!existing) {
        window.__YOGYAKARTA_THERAPISTS__.push({ id: WINDA_ID, name: WINDA_NAME });
        console.log(`✅ Added ${WINDA_NAME} to therapist list`);
    }
} else {
    window.__YOGYAKARTA_THERAPISTS__ = [
        { id: '692467a3001f6f05aaa1', name: 'Budi' },
        { id: '69499239000c90bfd283', name: 'ww' },
        { id: '694a02cd0036089583db', name: 'ww' },
        { id: '694ed78e002b0c06171e', name: 'Wiwid' },
        { id: WINDA_ID, name: WINDA_NAME }
    ];
    console.log(`✅ Created therapist list with ${WINDA_NAME}`);
}

console.log('📋 Current therapist list:', window.__YOGYAKARTA_THERAPISTS__);
console.log('🔄 Reloading page to reinitialize reviews...');

// Reload to reinitialize
window.location.reload();
