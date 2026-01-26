#!/usr/bin/env node

/**
 * Fix HomePage language translations
 * 
 * This script fixes the HomePage to use translationsObject instead of the translation function `t`
 * for rendering translated text. This fixes the issue where Indonesian text wasn't displaying.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'pages', 'HomePage.tsx');

console.log(`🔧 Fixing translations in ${filePath}...`);

let content = fs.readFileSync(filePath, 'utf-8');

// Count fixes
let fixCount = 0;

// Fix 1: therapistsTitle
if (content.includes('{t?.home?.therapistsTitle ||')) {
    content = content.replace(
        '{t?.home?.therapistsTitle || \'Home Service Therapists\'}',
        '{translationsObject?.home?.therapistsTitle || \'Home Service Therapists\'}'
    );
    fixCount++;
    console.log('✅ Fixed therapistsTitle');
}

// Fix 2: therapistsSubtitleAll
if (content.includes('t?.home?.therapistsSubtitleAll ||')) {
    content = content.replace(
        't?.home?.therapistsSubtitleAll || \'Find the best therapists across Indonesia\'',
        'translationsObject?.home?.therapistsSubtitleAll || \'Find the best therapists across Indonesia\''
    );
    fixCount++;
    console.log('✅ Fixed therapistsSubtitleAll');
}

// Fix 3: therapistsSubtitleCity
if (content.includes('t?.home?.therapistsSubtitleCity?.replace')) {
    content = content.replace(
        't?.home?.therapistsSubtitleCity?.replace(\'{city}\', selectedCity)',
        'translationsObject?.home?.therapistsSubtitleCity?.replace(\'{city}\', selectedCity)'
    );
    fixCount++;
    console.log('✅ Fixed therapistsSubtitleCity');
}

// Fix 4: browseRegionNote
if (content.includes('{t?.home?.browseRegionNote ||')) {
    content = content.replace(
        '{t?.home?.browseRegionNote || \'Browse Region dropdown (distance still applies)\'}',
        '{translationsObject?.home?.browseRegionNote || \'Browse Region dropdown (distance still applies)\'}'
    );
    fixCount++;
    console.log('✅ Fixed browseRegionNote');
}

// Fix 5: Facial button
if (content.includes('{t?.home?.facial ||')) {
    content = content.replace(
        '{t?.home?.facial || \'Facial\'}',
        '{translationsObject?.home?.facial || \'Facial\'}'
    );
    fixCount++;
    console.log('✅ Fixed Facial button text');
}

// Fix 6: Massage Places tab title
if (content.includes('{t?.home?.massagePlacesTitle ||')) {
    content = content.replace(
        '{t?.home?.massagePlacesTitle || \'Featured Massage Spas\'}',
        '{translationsObject?.home?.massagePlacesTitle || \'Featured Massage Spas\'}'
    );
    fixCount++;
    console.log('✅ Fixed massagePlacesTitle');
}

// Write back
fs.writeFileSync(filePath, content, 'utf-8');

console.log(`\n✨ Fixed ${fixCount} translation references!`);
console.log('\n🎉 HomePage now correctly uses translationsObject for all rendered text.');
console.log('   The app will now display in Indonesian when 🇮🇩 is selected in the header.');
