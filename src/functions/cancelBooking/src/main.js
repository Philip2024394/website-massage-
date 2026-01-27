// Cancel Booking Function - Safely cancels booking and cleans up resources

import { Client, Databases } from 'node-appwrite'

export default async ({ req, res, log, error }) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return res.json({}, 200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
  }

  try {
    const { bookingId, reason = 'User cancelled' } = JSON.parse(req.body || '{}')
    
    if (!bookingId) {
      return res.json(
        { success: false, error: 'Missing bookingId' },
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
    
    // Update booking status to cancelled
    const booking = await databases.updateDocument(
      databaseId,
      'bookings',
      bookingId,
      {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    )

    log('✅ Booking cancelled:', bookingId, 'Reason:', reason)

    return res.json({
      success: true,
      booking: {
        id: booking.$id,
        status: booking.status,
        cancellationReason: booking.cancellationReason,
        cancelledAt: booking.cancelledAt
      }
    }, 200, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    })

  } catch (err) {
    error('❌ Cancel booking error:', err)
    
    return res.json({
      success: false,
      error: 'Failed to cancel booking',
      details: err.message
    }, 500, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    })
  }
}