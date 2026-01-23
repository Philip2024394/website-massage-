/**
 * E2E Test Data Setup - Create Test Therapist
 * 
 * Creates therapist document for E2E testing
 * Run: npx ts-node e2e-tests/setup/create-test-therapist.ts
 */

import { databases, DATABASE_ID, COLLECTIONS } from '../../lib/appwrite';

const TEST_THERAPIST_ID = '6971ccc9000f3c39f49c';

const TEST_THERAPIST_DATA = {
  name: 'Test Therapist',
  email: 'therapist@test.com',
  whatsappNumber: '+6281234567890',
  countryCode: '+62',
  location: 'Central Jakarta, Jakarta',
  city: 'Jakarta',
  coordinates: JSON.stringify({ lat: -6.2088, lng: 106.8456 }),
  specialization: 'Swedish Massage',
  massageTypes: JSON.stringify(['Swedish', 'Deep Tissue', 'Sports Massage']),
  languages: JSON.stringify(['English', 'Indonesian']),
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
  verified: true,
  description: 'Professional massage therapist with 5 years of experience. Available for home service massages.',
  profilePicture: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
  mainImage: 'https://ik.imagekit.io/7grri5v7d/avatar%201.png',
  clientPreferences: JSON.stringify(['Male', 'Female', 'Couple']),
  services: JSON.stringify([
    { name: 'Swedish Massage', duration: 60, price: 150 },
    { name: 'Deep Tissue', duration: 90, price: 200 },
    { name: 'Sports Massage', duration: 120, price: 250 }
  ])
};

async function createTestTherapist() {
  console.log('\n' + '='.repeat(80));
  console.log('🔧 E2E TEST DATA SETUP - Creating Test Therapist');
  console.log('='.repeat(80) + '\n');

  try {
    // Check if therapist already exists
    console.log('🔍 Checking if test therapist already exists...');
    try {
      const existing = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.THERAPISTS!,
        TEST_THERAPIST_ID
      );
      
      console.log('✅ Test therapist already exists!');
      console.log('   ID:', existing.$id);
      console.log('   Name:', existing.name);
      console.log('   Email:', existing.email);
      console.log('   Status:', existing.status);
      console.log('\n✅ Test data ready for E2E tests\n');
      return;
    } catch (notFoundError: any) {
      if (notFoundError.code === 404) {
        console.log('ℹ️  Test therapist does not exist, creating...\n');
      } else {
        throw notFoundError;
      }
    }

    // Create test therapist
    console.log('📝 Creating test therapist document...');
    console.log('   ID:', TEST_THERAPIST_ID);
    console.log('   Name:', TEST_THERAPIST_DATA.name);
    console.log('   Email:', TEST_THERAPIST_DATA.email);

    const therapist = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.THERAPISTS!,
      TEST_THERAPIST_ID,
      TEST_THERAPIST_DATA
    );

    console.log('\n✅ Test therapist created successfully!');
    console.log('   Document ID:', therapist.$id);
    console.log('   Name:', therapist.name);
    console.log('   Services:', JSON.parse(therapist.services || '[]').length, 'services');
    console.log('   Status:', therapist.status);
    console.log('\n✅ Test data ready for E2E tests\n');

  } catch (error: any) {
    console.error('\n❌ Failed to create test therapist:', error.message);
    if (error.response) {
      console.error('   Response:', error.response);
    }
    console.error('\n💡 Manual fix:');
    console.error('   1. Open Appwrite Console');
    console.error('   2. Go to database:', DATABASE_ID);
    console.error('   3. Open collection:', COLLECTIONS.THERAPISTS);
    console.error('   4. Create document with ID:', TEST_THERAPIST_ID);
    console.error('   5. Add required fields from TEST_THERAPIST_DATA\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createTestTherapist()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { createTestTherapist, TEST_THERAPIST_ID, TEST_THERAPIST_DATA };
