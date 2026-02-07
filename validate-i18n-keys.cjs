#!/usr/bin/env node

// I18n validation script - verifies all translation keys are properly defined
const fs = require('fs');
const path = require('path');

console.log('🔍 I18N TRANSLATION KEY VALIDATION');
console.log('===================================');

// Load translation files
const enPath = path.join(__dirname, 'src/translations/en.json');
const idPath = path.join(__dirname, 'src/translations/id.json');

try {
  const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const idTranslations = JSON.parse(fs.readFileSync(idPath, 'utf8'));

  // Keys that were reported as missing
  const missingKeys = [
    'therapistDashboard.fileUploadSuccess',
    'therapistDashboard.fileUploadError',
    'therapistDashboard.removeLetterError',
    'therapistDashboard.submitApplicationError',
    'therapistDashboard.paymentSuccess',
    'therapistDashboard.paymentError',
    'therapistDashboard.pending',
    'therapistDashboard.rejected',
    'therapistDashboard.uploadLetter',
    'therapistDashboard.uploadLetterDesc',
    'therapistDashboard.uploadInProgress',
    'therapistDashboard.selectFile',
    'therapistDashboard.supportedFormats',
    'therapistDashboard.processing',
    'therapistDashboard.payNow'
  ];

  console.log(`📋 Checking ${missingKeys.length} allegedly missing keys...\n`);

  let foundCount = 0;
  let missingCount = 0;

  missingKeys.forEach(key => {
    const [section, subKey] = key.split('.');
    const enValue = enTranslations[section]?.[subKey];
    const idValue = idTranslations[section]?.[subKey];

    if (enValue && idValue) {
      console.log(`✅ ${key}: FOUND`);
      console.log(`   EN: "${enValue}"`);
      console.log(`   ID: "${idValue}"`);
      foundCount++;
    } else {
      console.log(`❌ ${key}: MISSING`);
      if (!enValue) console.log(`   Missing in EN translations`);
      if (!idValue) console.log(`   Missing in ID translations`);
      missingCount++;
    }
    console.log('');
  });

  console.log('📊 SUMMARY:');
  console.log(`✅ Found: ${foundCount}`);
  console.log(`❌ Missing: ${missingCount}`);
  
  if (missingCount === 0) {
    console.log('\n🎉 ALL KEYS ARE PROPERLY DEFINED!');
    console.log('The i18n-ally extension warnings are likely a cache/configuration issue.');
  }

  // Touch translation files to force reload
  const now = new Date();
  fs.utimesSync(enPath, now, now);
  fs.utimesSync(idPath, now, now);
  console.log('\n🔄 Translation files refreshed for i18n-ally extension');

} catch (error) {
  console.error('❌ Error reading translation files:', error.message);
}