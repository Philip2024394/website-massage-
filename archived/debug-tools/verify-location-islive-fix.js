// VERIFICATION SCRIPT FOR LOCATION & isLive FIXES
// Run this in browser console on live site: https://www.indastreetmassage.com

console.log('%c🔍 LOCATION & isLive VERIFICATION TEST', 'font-size:16px; font-weight:bold; color:#2563eb; background:#e0f2fe; padding:8px;');
console.log('Testing fixes for: Location persistence + offline therapist visibility\n');

// Test 1: Check therapist dropdown selection
console.log('%c1️⃣ DASHBOARD TEST (for therapists)', 'font-weight:bold; color:#059669');
console.log('Steps:');
console.log('  a) Go to therapist dashboard');
console.log('  b) Select location (e.g., "Bandung") from dropdown');
console.log('  c) Open console - look for: "📍 Current selectedCity state: Bandung"');
console.log('  d) Click "Save Profile"');
console.log('  e) Look for: "✅ LOCATION SAVE VERIFIED: Bandung"');
console.log('  f) Navigate away (click another menu item)');
console.log('  g) Come back to profile page');
console.log('  h) Location dropdown should still show "Bandung"\n');

// Test 2: Check homepage filtering
console.log('%c2️⃣ HOMEPAGE FILTERING TEST', 'font-weight:bold; color:#059669');
console.log('Steps:');
console.log('  a) Go to homepage: https://www.indastreetmassage.com');
console.log('  b) Open console (F12)');
console.log('  c) Select "Bandung" from location dropdown');
console.log('  d) Look for logs: "✅ Location match for [name]" or "✅ City match for [name]"');
console.log('  e) Check if Aditia appears in therapist cards');
console.log('  f) Try other cities (Yogyakarta, Jakarta, Bali)\n');

// Test 3: Check offline therapist visibility
console.log('%c3️⃣ OFFLINE THERAPIST VISIBILITY TEST', 'font-weight:bold; color:#059669');
console.log('Steps:');
console.log('  a) On homepage, select "Yogyakarta"');
console.log('  b) Check console for therapists with status="offline"');
console.log('  c) Offline therapists should now appear with their cards visible');
console.log('  d) Before fix: offline therapists were hidden');
console.log('  e) After fix: offline therapists show (same as available/busy)\n');

// Test 4: Database verification
console.log('%c4️⃣ DATABASE VERIFICATION', 'font-weight:bold; color:#059669');
console.log('Expected values after therapist saves profile:');
console.log('  - city: "Bandung" (STRING)');
console.log('  - location: "Bandung" (STRING)');
console.log('  - isLive: true (BOOLEAN)');
console.log('  - status: "available" | "busy" | "offline" (STRING)');
console.log('  - coordinates: {"lat":-6.9175,"lng":107.6191} (JSON STRING or null)\n');

// Helper: Check current page therapists
const checkCurrentTherapists = () => {
  const cards = document.querySelectorAll('[class*="card"], [class*="Card"]');
  const therapistNames = [];
  
  cards.forEach(card => {
    const nameEl = card.querySelector('h2, h3, [class*="name"], [class*="Name"]');
    if (nameEl && nameEl.textContent) {
      therapistNames.push(nameEl.textContent.trim());
    }
  });
  
  return therapistNames;
};

console.log('%c📊 CURRENT PAGE THERAPISTS:', 'font-weight:bold; color:#7c3aed');
const therapists = checkCurrentTherapists();
if (therapists.length > 0) {
  console.log(`Found ${therapists.length} therapist cards:`);
  therapists.forEach((name, i) => console.log(`  ${i+1}. ${name}`));
} else {
  console.log('No therapist cards detected on this page.');
  console.log('Navigate to homepage to see therapist listings.');
}

console.log('\n%c✅ VERIFICATION SCRIPT READY', 'font-weight:bold; color:#059669; background:#d1fae5; padding:4px;');
console.log('Follow the steps above and check console logs for each test.\n');
