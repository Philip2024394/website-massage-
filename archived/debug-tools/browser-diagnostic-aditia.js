// BROWSER CONSOLE DIAGNOSTIC FOR ADITIA VISIBILITY
// Copy this entire code into your browser console while on https://www.indastreetmassage.com

console.log('%c🔍 ADITIA VISIBILITY DIAGNOSTIC', 'font-size:16px; font-weight:bold; color:#2563eb');
console.log('Running on:', window.location.href);
console.log('Time:', new Date().toLocaleString());

// Check if React state is accessible
if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.warn('⚠️ React DevTools not available - limited diagnostic');
}

// Try to find therapists data in the DOM
console.log('\n1️⃣ Checking therapist cards on page...');
const therapistCards = document.querySelectorAll('[class*="therapist"], [class*="Therapist"]');
console.log(`Found ${therapistCards.length} potential therapist elements`);

// Check if Aditia card exists
const aditiaCard = Array.from(document.querySelectorAll('*')).find(el => 
  el.textContent && el.textContent.includes('Aditia')
);

if (aditiaCard) {
  console.log('✅ Aditia card FOUND on page!');
  console.log('Element:', aditiaCard);
} else {
  console.log('❌ Aditia card NOT FOUND on page');
}

// Check dropdown value
console.log('\n2️⃣ Checking location dropdown...');
const dropdown = document.querySelector('select');
if (dropdown) {
  console.log('Dropdown value:', dropdown.value);
  if (dropdown.value === 'all') {
    console.log('⚠️ WARNING: Dropdown is set to "All Indonesia"');
    console.log('   Try selecting "Bandung" from the dropdown!');
  } else if (dropdown.value.toLowerCase().includes('bandung')) {
    console.log('✅ Bandung is selected');
  }
}

// Check local storage
console.log('\n3️⃣ Checking localStorage...');
const selectedCity = localStorage.getItem('selectedCity');
console.log('selectedCity in localStorage:', selectedCity);

// Instructions
console.log('\n📋 TROUBLESHOOTING STEPS:');
console.log('1. Make sure "Bandung" is selected in the location dropdown (not "All Indonesia")');
console.log('2. Hard refresh the page: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)');
console.log('3. Clear browser cache and cookies for this site');
console.log('4. Wait 2-3 minutes after code deployment for changes to propagate');
console.log('5. Try incognito/private browsing mode to rule out cache issues');

console.log('\n✅ Diagnostic complete!');
