/**
 * Appwrite Function: Search Therapists
 * Secure backend function for finding available therapists with matching logic
 * 
 * Runtime: Node.js 18
 * Permissions: Guest users allowed
 */

import { Client, Databases, Query } from 'node-appwrite'

// Environment configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID!
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!
const THERAPISTS_COLLECTION_ID = process.env.THERAPISTS_COLLECTION_ID!
const BOOKINGS_COLLECTION_ID = process.env.BOOKINGS_COLLECTION_ID!

interface SearchTherapistsRequest {
  bookingId: string
  searchConfig: {
    maxRadius: number
    maxSearchTime: number
    serviceDuration: string
    userLocation: {
      lat: number
      lng: number
    }
  }
  searchId: string
}

interface TherapistDocument {
  $id: string
  name: string
  photo: string
  rating: number
  specialties: string[]
  isAvailable: boolean
  location: string // JSON string of coordinates
  priceRange: string
}

/**
 * Main function handler
 */
export default async function handler(req: any, res: any) {
  try {
    console.log('🔍 Starting therapist search...')

    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY)

    const databases = new Databases(client)

    // Parse request
    const request: SearchTherapistsRequest = JSON.parse(req.body || '{}')
    
    // Validate input
    if (!request.bookingId || !request.searchConfig) {
      return res.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Booking ID and search config are required'
        }
      })
    }

    // Update booking with search attempt
    await updateBookingSearchAttempt(databases, request.bookingId)

    // Search for available therapists
    const therapists = await searchAvailableTherapists(
      databases, 
      request.searchConfig
    )

    if (therapists.length === 0) {
      console.log('⚠️ No therapists found')
      return res.json({
        success: false,
        error: 'No available therapists found in your area',
        searchId: request.searchId
      })
    }

    // For demo: simulate finding therapist after short delay
    setTimeout(async () => {
      try {
        const selectedTherapist = selectBestTherapist(therapists, request.searchConfig.userLocation)
        
        console.log('✅ Therapist found:', selectedTherapist.name)
        
        // In real implementation, notify the client via realtime/webhook
        // For now, store the result for polling
        
      } catch (error) {
        console.error('❌ Therapist selection failed:', error)
      }
    }, 3000) // 3 second delay

    return res.json({
      success: true,
      data: {
        searchId: request.searchId,
        message: 'Search initiated successfully'
      }
    })

  } catch (error) {
    console.error('❌ Therapist search failed:', error)

    return res.json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to search for therapists. Please try again.'
      }
    })
  }
}

/**
 * Search for available therapists
 */
async function searchAvailableTherapists(
  databases: Databases, 
  searchConfig: any
): Promise<TherapistDocument[]> {
  
  const queries = [
    Query.equal('isAvailable', true),
    Query.limit(20) // Limit results for performance
  ]

  // Add service-specific queries if needed
  if (searchConfig.serviceDuration) {
    // Filter therapists who offer this service duration
    queries.push(Query.contains('supportedDurations', searchConfig.serviceDuration))
  }

  const result = await databases.listDocuments(
    DATABASE_ID,
    THERAPISTS_COLLECTION_ID,
    queries
  )

  return result.documents as TherapistDocument[]
}

/**
 * Select best therapist based on criteria
 */
function selectBestTherapist(
  therapists: TherapistDocument[], 
  userLocation: { lat: number; lng: number }
) {
  // Score therapists based on rating, distance, etc.
  const scoredTherapists = therapists.map(therapist => {
    const location = JSON.parse(therapist.location)
    const distance = calculateDistance(userLocation, location)
    
    // Simple scoring: rating (40%) + distance (60%)
    const ratingScore = therapist.rating / 5 // Normalize to 0-1
    const distanceScore = Math.max(0, 1 - (distance / 50)) // Normalize distance (50km max)
    
    const totalScore = (ratingScore * 0.4) + (distanceScore * 0.6)
    
    return {
      therapist,
      distance,
      score: totalScore
    }
  })

  // Sort by score (descending)
  scoredTherapists.sort((a, b) => b.score - a.score)

  const best = scoredTherapists[0]
  
  return {
    id: best.therapist.$id,
    name: best.therapist.name,
    photo: best.therapist.photo,
    rating: best.therapist.rating,
    distance: Math.round(best.distance * 10) / 10, // Round to 1 decimal
    eta: Math.max(15, Math.round(best.distance * 2)), // Rough ETA calculation
    specialties: best.therapist.specialties,
    isAvailable: true
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat)
  const dLng = toRadians(point2.lng - point1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Update booking with search attempt count
 */
async function updateBookingSearchAttempt(databases: Databases, bookingId: string) {
  try {
    const booking = await databases.getDocument(DATABASE_ID, BOOKINGS_COLLECTION_ID, bookingId)
    
    await databases.updateDocument(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      bookingId,
      {
        searchAttempts: (booking.searchAttempts || 0) + 1,
        updatedAt: new Date().toISOString()
      }
    )
  } catch (error) {
    console.warn('⚠️ Failed to update search attempts:', error)
  }
}