/**
 * Test and sync Mobile Therapist Standards translations
 * This script ensures all translations are properly synced to Appwrite
 */

import { chatTranslationService } from '../services/chatTranslationService.js';

async function testAndSyncTranslations() {
  console.log('🔄 Testing and syncing Mobile Therapist Standards translations...');
  
  try {
    // Test key translations
    const testKeys = [
      'mobile_therapist_standards',
      'professional_in_home_hotel', 
      'therapist_standards',
      'professional_service_location',
      'verified_badge_confidence',
      'identity_verification_safety',
      'identity_verification_description',
      'why_mobile_standards_matter',
      'mobile_standards_intro',
      'professional_certification',
      'equipment_hygiene',
      'communication_professionalism',
      'boundary_respect',
      'flexible_scheduling',
      'custom_treatment_plans',
      'insurance_coverage',
      'continuous_training',
      'verification_process_note',
      'pending_verification_note',
      'therapist_verification_standards',
      'professional_appearance_hygiene',
      'fresh_linens_towels',
      'regulated_oils_products',
      'professionalism_conduct',
      'training_certification',
      'health_safety_protocols',
      'additional_requirements',
      'why_choose_verified',
      'client_safety_tips',
      'questions_about_standards',
      'transparency_commitment',
      'contact_support'
    ];

    // Test each key in both languages
    console.log('📝 Testing translation keys...');
    for (const key of testKeys) {
      const enTranslation = chatTranslationService.getTranslation(key, 'en');
      const idTranslation = chatTranslationService.getTranslation(key, 'id');
      
      if (!enTranslation || !idTranslation) {
        console.warn(`⚠️ Missing translation for key: ${key}`);
      } else {
        console.log(`✅ ${key}: EN(${enTranslation.length} chars) ID(${idTranslation.length} chars)`);
      }
    }

    // Sync all translations to Appwrite
    console.log('\n🔄 Syncing translations to Appwrite...');
    await chatTranslationService.syncAllTranslations();
    
    console.log('✅ Mobile Therapist Standards translations synced successfully!');
    
    // Test language preference functionality
    console.log('\n🔄 Testing language preferences...');
    await chatTranslationService.setLanguagePreference('id');
    const langPref = await chatTranslationService.getLanguagePreference();
    console.log(`✅ Language preference test: ${langPref}`);
    
  } catch (error) {
    console.error('❌ Error testing translations:', error);
  }
}

// Run the test
testAndSyncTranslations().then(() => {
  console.log('\n🎉 Translation test and sync complete!');
}).catch(console.error);