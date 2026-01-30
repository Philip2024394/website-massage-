/**
 * 🔧 CREATE THERAPIST PROFILE FOR E2E TESTING
 * 
 * Purpose: Create therapist profile for therapist@test.com
 * This is needed because the profile requires specific fields
 * 
 * Usage: node scripts/create-therapist-profile.js
 */

import { Client, Databases, ID } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPIST_COLLECTION_ID = 'therapists_collection_id';

// Therapist account details
const THERAPIST_USER_ID = '6971ccc9000f3c39f49c';
const THERAPIST_DATA = {
  id: '6971ccc9000f3c39f49c',
  therapistId: '6971ccc9000f3c39f49c',
  name: 'Test Therapist',
  email: 'therapist@test.com',
  whatsappNumber: '+6281234567890',
  countryCode: '+62',
  location: 'Central Jakarta, Jakarta',
  coordinates: JSON.stringify({ lat: -6.2088, lng: 106.8456 }),
  specialization: 'Swedish Massage',
  massageTypes: JSON.stringify(['Swedish', 'Deep Tissue']),
  languages: JSON.stringify(['Indonesian']), // Only Indonesian as default - therapist can add English/other languages via dashboard
  yearsOfExperience: 5,
  isLicensed: true,
  hourlyRate: 150,
  pricing: JSON.stringify({ 
    '60': 150,
    '90': 200,
    '120': 250
  }),
  price60: '150',
  price90: '200',
  price120: '250',
  status: 'available',
  availability: 'Available',
  isLive: true,
  description: 'Professional massage therapist with 5 years of experience.',
  profilePicture: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
  mainImage: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png'
};

/**
 * Create therapist profile
 */
async function createTherapistProfile() {
  console.log('='.repeat(60));
  console.log('👨‍⚕️ CREATING THERAPIST PROFILE FOR E2E TESTING');
  console.log('='.repeat(60));
  console.log('\nEndpoint:', APPWRITE_ENDPOINT);
  console.log('Project:', APPWRITE_PROJECT_ID);
  console.log('Database:', DATABASE_ID);
  console.log('Collection:', THERAPIST_COLLECTION_ID);
  console.log('User ID:', THERAPIST_USER_ID);
  console.log('');

  const client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const databases = new Databases(client);

  try {
    // Check if profile already exists
    console.log('🔍 Checking if profile already exists...');
    try {
      const existing = await databases.getDocument(
        DATABASE_ID,
        THERAPIST_COLLECTION_ID,
        THERAPIST_USER_ID
      );
      
      console.log('ℹ️  Therapist profile already exists!');
      console.log('📋 Current profile:');
      console.log('   Name:', existing.name);
      console.log('   Specialization:', existing.specialization);
      console.log('   Status:', existing.status);
      console.log('');
      console.log('✅ Profile ready for testing!');
      return;
    } catch (notFoundError) {
      if (notFoundError.code !== 404) {
        throw notFoundError;
      }
      // Profile doesn't exist, continue to create it
      console.log('✅ No existing profile found. Creating new profile...');
    }

    // Create the profile
    console.log('\n📝 Creating therapist profile...');
    const profile = await databases.createDocument(
      DATABASE_ID,
      THERAPIST_COLLECTION_ID,
      THERAPIST_USER_ID,
      THERAPIST_DATA
    );

    console.log('✅ Therapist profile created successfully!');
    console.log('');
    console.log('📋 Profile Details:');
    console.log('─'.repeat(60));
    console.log('Document ID:', profile.$id);
    console.log('Name:', profile.name);
    console.log('Email:', profile.email);
    console.log('Specialization:', profile.specialization);
    console.log('Experience:', profile.experience, 'years');
    console.log('Rating:', profile.rating);
    console.log('Status:', profile.status);
    console.log('Bank Account:', profile.bankName, '-', profile.bankAccountNumber);
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Failed to create therapist profile');
    console.error('');
    console.error('Error Details:');
    console.error('  Code:', error.code);
    console.error('  Message:', error.message);
    
    if (error.code === 401) {
      console.error('');
      console.error('💡 This might be a permissions issue.');
      console.error('   Try creating the profile manually in Appwrite Console:');
      console.error('');
      console.error('   1. Go to: https://syd.cloud.appwrite.io');
      console.error('   2. Navigate to Database → therapists_collection_id');
      console.error('   3. Click "Add Document"');
      console.error('   4. Set Document ID:', THERAPIST_USER_ID);
      console.error('   5. Add these fields:');
      console.error('');
      console.error(JSON.stringify(THERAPIST_DATA, null, 6));
    }
    
    throw error;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('🎯 Next Steps:');
  console.log('1. Verify profile in Appwrite Console');
  console.log('2. Run E2E tests: pnpm run test:e2e');
  console.log('3. Or use interactive mode: pnpm run test:e2e:ui');
  console.log('='.repeat(60));
}

// Run
createTherapistProfile()
  .then(() => {
    console.log('\n✅ Setup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed\n');
    process.exit(1);
  });
