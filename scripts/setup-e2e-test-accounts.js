/**
 * 🔧 E2E TEST ACCOUNT SETUP SCRIPT
 * 
 * Purpose: Creates 3 test accounts in Appwrite for E2E testing:
 * - user@test.com (customer)
 * - therapist@test.com (service provider)
 * - admin@test.com (platform admin)
 * 
 * Usage: node scripts/setup-e2e-test-accounts.js
 */

import { Client, Account, Databases, ID, Query } from 'appwrite';

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const DATABASE_ID = '68f76ee1000e64ca8d05';

// Test accounts
const TEST_ACCOUNTS = [
  {
    email: 'user@test.com',
    password: 'Test123456!',
    name: 'Test User',
    role: 'customer'
  },
  {
    email: 'therapist@test.com',
    password: 'Test123456!',
    name: 'Test Therapist',
    role: 'therapist'
  },
  {
    email: 'admin@test.com',
    password: 'Test123456!',
    name: 'Test Admin',
    role: 'admin'
  }
];

/**
 * Create Appwrite client for admin operations
 */
function createAdminClient() {
  const client = new Client();
  client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);
  
  return client;
}

/**
 * Create test account
 */
async function createTestAccount(accountData) {
  const client = createAdminClient();
  const account = new Account(client);
  const databases = new Databases(client);

  try {
    console.log(`\n📝 Creating account: ${accountData.email}...`);

    // Create account
    const user = await account.create(
      ID.unique(),
      accountData.email,
      accountData.password,
      accountData.name
    );

    console.log(`✅ Account created: ${user.$id}`);

    // Create session to add profile data
    try {
      await account.createEmailPasswordSession(accountData.email, accountData.password);
      console.log(`✅ Session created for ${accountData.email}`);

      // If therapist, create therapist profile
      if (accountData.role === 'therapist') {
        try {
          const therapistProfile = await databases.createDocument(
            DATABASE_ID,
            'therapists_collection_id',
            user.$id,
            {
              name: accountData.name,
              email: accountData.email,
              phone: '+6281234567890',
              city: 'Jakarta',
              area: 'Central Jakarta',
              specialization: 'Swedish Massage', // Required field
              experience: 5, // Years of experience
              rating: 4.8,
              completedSessions: 0,
              status: 'available',
              verified: true,
              bankName: 'BCA',
              bankAccountNumber: '1234567890',
              bankAccountName: accountData.name,
              profileImage: 'https://via.placeholder.com/150',
              bio: 'Professional massage therapist with 5 years of experience',
              pricing: JSON.stringify({ 60: 150000, 90: 200000, 120: 250000 }),
              createdAt: new Date().toISOString()
            }
          );
          console.log(`✅ Therapist profile created: ${therapistProfile.$id}`);
        } catch (profileError) {
          if (profileError.code === 409) {
            console.log(`ℹ️  Therapist profile already exists for ${accountData.email}`);
          } else {
            console.warn(`⚠️  Failed to create therapist profile: ${profileError.message}`);
          }
        }
      }

      // Delete session after setup
      await account.deleteSession('current');

    } catch (sessionError) {
      console.warn(`⚠️  Session creation failed: ${sessionError.message}`);
    }

    return user;

  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  Account ${accountData.email} already exists`);
      return null;
    } else {
      console.error(`❌ Failed to create account: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Main setup function
 */
async function setupTestAccounts() {
  console.log('='.repeat(60));
  console.log('🎭 E2E TEST ACCOUNTS SETUP');
  console.log('='.repeat(60));
  console.log('\nCreating 3 test accounts in Appwrite...');
  console.log(`Endpoint: ${APPWRITE_ENDPOINT}`);
  console.log(`Project: ${APPWRITE_PROJECT_ID}`);
  console.log(`Database: ${DATABASE_ID}`);

  const results = [];

  for (const accountData of TEST_ACCOUNTS) {
    try {
      const user = await createTestAccount(accountData);
      results.push({
        email: accountData.email,
        role: accountData.role,
        success: true,
        userId: user?.$id
      });
    } catch (error) {
      results.push({
        email: accountData.email,
        role: accountData.role,
        success: false,
        error: error.message
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SETUP SUMMARY');
  console.log('='.repeat(60));

  console.log('\n✅ Test Accounts:');
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.email} (${result.role})`);
    if (result.userId) {
      console.log(`   User ID: ${result.userId}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  }

  console.log('\n📋 Credentials (save these for testing):');
  console.log('─'.repeat(60));
  for (const account of TEST_ACCOUNTS) {
    console.log(`${account.role.toUpperCase()}:`);
    console.log(`  Email: ${account.email}`);
    console.log(`  Password: ${account.password}`);
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('🎯 Next Steps:');
  console.log('1. Verify accounts exist in Appwrite Console');
  console.log('2. Run E2E tests: pnpm run test:e2e');
  console.log('3. Or use interactive mode: pnpm run test:e2e:ui');
  console.log('='.repeat(60));
}

// Run setup
setupTestAccounts()
  .then(() => {
    console.log('\n✅ Test account setup complete!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  });
