// Accept Therapist Function - Confirms therapist selection and updates booking status

import { Client, Databases, ID, Query } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  // CORS headers for production
  if (req.method === 'OPTIONS') {
    return res.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
  }

  try {
    const { bookingId, therapistId } = JSON.parse(req.body || '{}')
    
    // Input validation
    if (!bookingId || !therapistId) {
      return res.json(
        { success: false, error: 'Missing bookingId or therapistId' },
        400,
        { 'Access-Control-Allow-Origin': '*' }
      )
    }

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664')
      .setKey(process.env.APPWRITE_API_KEY)

    const databases = new Databases(client)
    const databaseId = process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05'
    
    // Update booking with therapist acceptance
    const booking = await databases.updateDocument(
      databaseId,
      'bookings',
      bookingId,
      {
        therapistId: therapistId,
        status: 'active',
        acceptedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )

    log('✅ Therapist accepted for booking:', bookingId)

    return res.json({
      success: true,
      booking: {
        id: booking.$id,
        status: booking.status,
        therapistId: booking.therapistId,
        acceptedAt: booking.acceptedAt
      }
    }, 200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    })

  } catch (err) {
    error('❌ Accept therapist error:', err)
    
    return res.json({
      success: false,
      error: 'Failed to accept therapist',
      details: err.message
    }, 500, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    })
  }
}