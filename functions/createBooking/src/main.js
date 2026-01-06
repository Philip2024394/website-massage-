/**
 * Appwrite Function: Create Booking
 * Secure backend function for creating new bookings with validation
 * 
 * Runtime: Node.js 18
 * Permissions: Guest users allowed
 */

import { Client, Databases, ID } from 'node-appwrite'

// Environment configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID!
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID!
const BOOKINGS_COLLECTION_ID = process.env.BOOKINGS_COLLECTION_ID!

// Validation constants
const VALID_DURATIONS = ['60', '90', '120']
const MIN_PRICE = 100000 // IDR
const MAX_PRICE = 2000000 // IDR

interface CreateBookingRequest {
  userId: string
  serviceDuration: string
  location: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  customerDetails: {
    name: string
    whatsapp: string
  }
}

interface BookingDocument {
  id: string
  userId: string
  therapistId?: string
  status: string
  serviceDuration: string
  price: number
  location: string
  coordinates: string
  customerName: string
  customerWhatsApp: string
  searchAttempts: number
  createdAt: string
  updatedAt: string
}

/**
 * Main function handler
 */
export default async function handler(req: any, res: any) {
  try {
    console.log('📋 Creating new booking...')

    // Initialize Appwrite client with API key
    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY)

    const databases = new Databases(client)

    // Parse and validate request
    const request: CreateBookingRequest = JSON.parse(req.body || '{}')
    
    // Validate input
    const validation = validateBookingRequest(request)
    if (!validation.isValid) {
      return res.json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: validation.error!,
          details: validation.details
        }
      })
    }

    // Calculate price based on duration
    const price = calculatePrice(request.serviceDuration)

    // Create booking document
    const bookingId = ID.unique()
    const bookingData: Omit<BookingDocument, 'id'> = {
      userId: request.userId,
      status: 'searching',
      serviceDuration: request.serviceDuration,
      price,
      location: request.location.address,
      coordinates: JSON.stringify(request.location.coordinates),
      customerName: sanitizeInput(request.customerDetails.name),
      customerWhatsApp: sanitizePhoneNumber(request.customerDetails.whatsapp),
      searchAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Create booking in database
    const booking = await databases.createDocument(
      DATABASE_ID,
      BOOKINGS_COLLECTION_ID,
      bookingId,
      bookingData
    )

    console.log('✅ Booking created successfully:', bookingId)

    // Return booking data
    return res.json({
      success: true,
      data: {
        id: booking.$id,
        userId: booking.userId,
        status: booking.status,
        serviceDuration: booking.serviceDuration,
        price: booking.price,
        location: {
          address: booking.location,
          coordinates: JSON.parse(booking.coordinates)
        },
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }
    })

  } catch (error) {
    console.error('❌ Booking creation failed:', error)

    return res.json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Failed to create booking. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    })
  }
}

/**
 * Validate booking request
 */
function validateBookingRequest(request: CreateBookingRequest) {
  const errors: string[] = []

  // Validate user ID
  if (!request.userId || typeof request.userId !== 'string') {
    errors.push('User ID is required')
  }

  // Validate service duration
  if (!request.serviceDuration || !VALID_DURATIONS.includes(request.serviceDuration)) {
    errors.push('Valid service duration is required (60, 90, or 120 minutes)')
  }

  // Validate customer details
  if (!request.customerDetails) {
    errors.push('Customer details are required')
  } else {
    if (!request.customerDetails.name || request.customerDetails.name.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters')
    }

    if (!request.customerDetails.whatsapp || !isValidPhoneNumber(request.customerDetails.whatsapp)) {
      errors.push('Valid WhatsApp number is required')
    }
  }

  // Validate location
  if (!request.location) {
    errors.push('Location is required')
  } else {
    if (!request.location.address || request.location.address.trim().length < 5) {
      errors.push('Location address must be at least 5 characters')
    }

    if (!request.location.coordinates) {
      errors.push('Location coordinates are required')
    } else {
      const { lat, lng } = request.location.coordinates
      if (typeof lat !== 'number' || typeof lng !== 'number' || 
          Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        errors.push('Valid location coordinates are required')
      }
    }
  }

  return {
    isValid: errors.length === 0,
    error: errors.length > 0 ? errors[0] : null,
    details: errors.length > 1 ? errors : undefined
  }
}

/**
 * Calculate price based on service duration
 */
function calculatePrice(duration: string): number {
  const prices = {
    '60': 200000,   // Base price for 60 minutes
    '90': 300000,   // Price for 90 minutes
    '120': 400000   // Price for 120 minutes
  }

  return prices[duration as keyof typeof prices] || prices['60']
}

/**
 * Sanitize text input
 */
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"']/g, '') // Remove potential XSS characters
    .substring(0, 100) // Limit length
}

/**
 * Validate and sanitize phone number
 */
function isValidPhoneNumber(phone: string): boolean {
  // Indonesian phone number format validation
  const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/
  return phoneRegex.test(phone.replace(/[\s-]/g, ''))
}

function sanitizePhoneNumber(phone: string): string {
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Normalize to +62 format
  if (cleaned.startsWith('0')) {
    return '+62' + cleaned.substring(1)
  } else if (cleaned.startsWith('62')) {
    return '+' + cleaned
  } else if (!cleaned.startsWith('+62')) {
    return '+62' + cleaned
  }
  
  return cleaned
}