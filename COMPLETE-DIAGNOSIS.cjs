const { Client, Databases, Account, Query } = require('node-appwrite');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║          COMPLETE AUTHENTICATION FLOW DIAGNOSIS              ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

const client = new Client()
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const account = new Account(client);

async function completeDiagnosis() {
  console.log('STEP 1: Check Profile with Anonymous Session');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  try {
    await account.createAnonymousSession();
    console.log('✅ Anonymous session created');
    
    const profile = await databases.listDocuments(
      '68f76ee1000e64ca8d05',
      'therapists_collection_id',
      [Query.equal('email', 'indastreet1@gmail.com')]
    );
    
    if (profile.documents.length > 0) {
      const p = profile.documents[0];
      console.log('✅ Profile found:');
      console.log('   Name:', p.name);
      console.log('   Email:', p.email);
      console.log('   Profile ID:', p.$id);
      console.log('   agentId:', p.agentId);
      console.log('');
    } else {
      console.log('❌ Profile NOT found with anonymous session!');
      console.log('   This means the profile doesn\'t exist at all.');
      return;
    }
    
    await account.deleteSession('current');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    return;
  }
  
  console.log('\nSTEP 2: Check Appwrite Collection Settings');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Go to Appwrite Console:');
  console.log('https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05/collection-therapists_collection_id/settings\n');
  console.log('Check Settings → Permissions:\n');
  console.log('Required permissions:');
  console.log('  ✓ Role: Any → READ (for home page - public access)');
  console.log('  ✓ Role: Users → READ (for dashboard - authenticated access)');
  console.log('');
  console.log('❓ Do you see "Users" with READ permission? (yes/no)');
  console.log('');
  
  console.log('\nSTEP 3: Sign-In Flow Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('1. Clear browser cache and cookies');
  console.log('2. Go to: http://localhost:3001');
  console.log('3. Select: Massage Therapist');
  console.log('4. Enter: indastreet1@gmail.com');
  console.log('5. Enter: (your password)');
  console.log('6. Click Sign In');
  console.log('');
  console.log('Expected: Redirect to http://localhost:3003');
  console.log('');
  console.log('7. Open DevTools (F12) → Console');
  console.log('8. Look for these messages:\n');
  console.log('   ✅ "✅ Authenticated user: indastreet1@gmail.com"');
  console.log('   ✅ "✅ User ID: [some-id]"');
  console.log('   ✅ "🔍 Searching for therapist by email:"');
  console.log('   ✅ "🔍 Using database: 68f76ee1000e64ca8d05"');
  console.log('   ✅ "🔍 Using collection: therapists_collection_id"');
  console.log('   ✅ "📋 Found therapists with email: 1"');
  console.log('');
  console.log('   OR');
  console.log('');
  console.log('   ❌ "❌ Error finding therapist by email:"');
  console.log('   ❌ "🔐 PERMISSION DENIED"');
  console.log('');
  console.log('9. COPY ALL CONSOLE OUTPUT and send it\n');
  
  console.log('\nSTEP 4: Dev Servers Status');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Required servers:');
  console.log('  ✓ http://localhost:3001 (Auth App) - Sign in page');
  console.log('  ✓ http://localhost:3003 (Therapist Dashboard) - After sign-in');
  console.log('');
  console.log('Run: npm run dev:all');
  console.log('');
}

completeDiagnosis();
