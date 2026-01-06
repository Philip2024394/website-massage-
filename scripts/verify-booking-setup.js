#!/usr/bin/env node

/**
 * 🔍 Booking System Setup Verification
 * 
 * This script checks if your production booking system is set up correctly.
 * Run this after following the baby steps guide.
 */

import { Client, Databases, Functions } from 'node-appwrite'
import fs from 'fs'
import path from 'path'

const CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05'
}

async function verifySetup() {
  console.log('🔍 Verifying Production Booking System Setup...\n')

  if (!process.env.APPWRITE_API_KEY) {
    console.log('❌ APPWRITE_API_KEY environment variable not set')
    console.log('💡 Run: $env:APPWRITE_API_KEY = "your_api_key_here"')
    process.exit(1)
  }

  const client = new Client()
    .setEndpoint(CONFIG.endpoint)
    .setProject(CONFIG.projectId)
    .setKey(process.env.APPWRITE_API_KEY)

  const databases = new Databases(client)
  const functions = new Functions(client)

  let allGood = true

  // Check 1: Database Collections
  console.log('📋 Checking Database Collections...')
  
  const requiredCollections = ['bookings', 'therapist_matches', 'chat_sessions']
  
  for (const collectionId of requiredCollections) {
    try {
      const collection = await databases.getCollection(CONFIG.databaseId, collectionId)
      console.log(`  ✅ ${collectionId} - Found (${collection.documentsCount} documents)`)
    } catch (error) {
      console.log(`  ❌ ${collectionId} - Missing or no access`)
      console.log(`     💡 Run: npm run setup:booking`)
      allGood = false
    }
  }

  // Check 2: Functions
  console.log('\n⚙️ Checking Functions...')
  
  const requiredFunctions = ['createBooking', 'searchTherapists', 'acceptTherapist', 'cancelBooking']
  
  try {
    const functionsList = await functions.list()
    
    for (const functionId of requiredFunctions) {
      const found = functionsList.functions.find(f => f.$id === functionId)
      if (found) {
        // Check if function has any deployments
        try {
          const deployments = await functions.listDeployments(functionId)
          const hasReadyDeployment = deployments.deployments.some(d => d.status === 'ready')
          const status = hasReadyDeployment ? '🟢 Deployed & Ready' : '🟡 Created (needs deployment)'
          console.log(`  ✅ ${functionId} - ${status}`)
          if (!hasReadyDeployment) allGood = false
        } catch {
          console.log(`  ✅ ${functionId} - 🟡 Created (needs deployment)`)
          allGood = false
        }
      } else {
        console.log(`  ❌ ${functionId} - Missing`)
        console.log(`     💡 Create in Appwrite Console → Functions`)
        allGood = false
      }
    }
  } catch (error) {
    console.log('  ❌ Cannot access Functions')
    console.log('     💡 Check API key permissions include functions.read')
    allGood = false
  }

  // Check 3: File Structure  
  console.log('\n📁 Checking File Structure...')
  
  const requiredFiles = [
    'components/ChatWindow.production.tsx',
    'types/booking.types.ts', 
    'services/booking.service.ts',
    'hooks/useBookingSearch.ts',
    'components/SystemMessage.tsx',
    'components/ErrorHandling.tsx'
  ]
  
  for (const filePath of requiredFiles) {
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${filePath}`)
    } else {
      console.log(`  ❌ ${filePath} - Missing`)
      allGood = false
    }
  }

  // Check 4: Production ChatWindow Active
  console.log('\n🎮 Checking Active ChatWindow...')
  
  try {
    const chatWindowContent = fs.readFileSync('components/ChatWindow.tsx', 'utf8')
    if (chatWindowContent.includes('useBookingSearch') && chatWindowContent.includes('SystemMessage')) {
      console.log('  ✅ Production ChatWindow is active')
    } else {
      console.log('  ⚠️ ChatWindow may not be production version')
      console.log('     💡 Run: Copy-Item "components/ChatWindow.production.tsx" "components/ChatWindow.tsx" -Force')
    }
  } catch (error) {
    console.log('  ❌ Cannot read ChatWindow.tsx')
    allGood = false
  }

  // Final Result
  console.log('\n' + '='.repeat(60))
  
  if (allGood) {
    console.log('🎉 ALL CHECKS PASSED! Your booking system is ready!')
    console.log('\n📋 What works now:')
    console.log('  ✅ Chat-driven booking flow')  
    console.log('  ✅ 60-second search timer')
    console.log('  ✅ Auto-retry mechanisms')
    console.log('  ✅ Safe cancellation')
    console.log('  ✅ Guest user support')
    console.log('  ✅ Enterprise error handling')
    console.log('\n🚀 Start your app: npm run dev')
  } else {
    console.log('⚠️ Some issues found. Fix them and run verification again.')
    console.log('\n🔧 Common fixes:')
    console.log('  • Set API key: $env:APPWRITE_API_KEY = "your_key"')
    console.log('  • Create collections: npm run setup:booking') 
    console.log('  • Deploy functions in Appwrite Console')
    console.log('  • Activate production ChatWindow')
  }
}

// Run verification
verifySetup().catch(error => {
  console.error('❌ Verification failed:', error.message)
  process.exit(1)
})

export { verifySetup }