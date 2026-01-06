#!/usr/bin/env node

/**
 * Database Collections Setup for Production Booking System
 * 
 * This script creates the required Appwrite collections for the booking system.
 * Run this ONCE in your Appwrite Console or via CLI before deploying.
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite'

const APPWRITE_CONFIG = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '68f23b11000d25eb3664',
  databaseId: '68f76ee1000e64ca8d05',
  apiKey: process.env.APPWRITE_API_KEY // Set this in your environment
}

async function setupCollections() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId)
    .setKey(APPWRITE_CONFIG.apiKey)

  const databases = new Databases(client)

  try {
    // 1. Bookings Collection
    console.log('📋 Creating bookings collection...')
    
    const bookingsCollection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'bookings',
      'Bookings',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    )

    // Bookings Attributes
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'userId', 50, true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'therapistId', 50, false)
    await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'status', 
      ['idle', 'registering', 'searching', 'pending_accept', 'active', 'cancelled', 'completed'], true)
    await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'serviceDuration',
      ['60', '90', '120'], true)
    await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'price', true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'location', 255, true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'coordinates', 100, false)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'customerName', 100, true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'customerWhatsApp', 20, true)
    await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'searchAttempts', true, 0, 10)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'createdAt', true)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'updatedAt', true)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'acceptedAt', false)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'cancelledAt', false)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'bookings', 'cancellationReason', 255, false)

    console.log('✅ Bookings collection created!')

    // 2. Therapist Matches Collection
    console.log('🔍 Creating therapist matches collection...')
    
    const matchesCollection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'therapist_matches',
      'Therapist Matches',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    )

    // Therapist Matches Attributes
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'bookingId', 50, true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'therapistId', 50, true)
    await databases.createFloatAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'distance', true)
    await databases.createIntegerAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'eta', true)
    await databases.createFloatAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'rating', true)
    await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'status',
      ['available', 'notified', 'accepted', 'declined'], true)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'therapist_matches', 'createdAt', true)

    console.log('✅ Therapist matches collection created!')

    // 3. Chat Sessions Collection  
    console.log('💬 Creating chat sessions collection...')
    
    const chatCollection = await databases.createCollection(
      APPWRITE_CONFIG.databaseId,
      'chat_sessions',
      'Chat Sessions',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any())
      ]
    )

    // Chat Sessions Attributes
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'chat_sessions', 'bookingId', 50, true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'chat_sessions', 'userId', 50, true)
    await databases.createStringAttribute(APPWRITE_CONFIG.databaseId, 'chat_sessions', 'therapistId', 50, false)
    await databases.createEnumAttribute(APPWRITE_CONFIG.databaseId, 'chat_sessions', 'status',
      ['active', 'ended'], true)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'chat_sessions', 'startedAt', true)
    await databases.createDatetimeAttribute(APPWRITE_CONFIG.databaseId, 'chat_sessions', 'endedAt', false)

    console.log('✅ Chat sessions collection created!')

    console.log('\n🎉 ALL COLLECTIONS CREATED SUCCESSFULLY!')
    console.log('\n📋 Summary:')
    console.log('  ✅ bookings - Main booking records')
    console.log('  ✅ therapist_matches - Search results and matching')  
    console.log('  ✅ chat_sessions - Active chat tracking')
    console.log('\n🚀 Your production booking system is ready!')

  } catch (error) {
    console.error('❌ Error setting up collections:', error.message)
    
    if (error.code === 409) {
      console.log('\n⚠️  Some collections may already exist. This is normal.')
    }
    
    process.exit(1)
  }
}

// Run setup if called directly
setupCollections()

export { setupCollections }