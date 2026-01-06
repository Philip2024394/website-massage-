/**
 * UNIFIED BOOKING CREATION SERVICE
 * 
 * Single function used by ALL booking flows:
 * - Book Now (BookingPopup)
 * - Scheduled Booking (ScheduleBookingPopup)
 * - Price Slider (TherapistCard → BookingPopup)
 * 
 * Ensures consistency, validation, and zero Appwrite errors
 */

import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import { 
  validateBookingPayload, 
  validateUserInput,
  normalizeWhatsApp,
  generateBookingId,
  calculateResponseDeadline,
  logValidation,
  logPayload,
  logAppwriteResponse
} from './bookingValidationService';

export interface BookingInput {
  // User Info
  customerName: string;
  customerWhatsApp: string;
  countryCode?: string;
  
  // Provider Info
  providerId: string;
  providerName: string;
  providerType: 'therapist' | 'place';
  
  // Booking Details
  duration: number; // 60, 90, or 120
  price: number; // Full price in IDR
  bookingType: 'immediate' | 'scheduled';
  scheduledTime?: Date;
  
  // Auth
  userId: string;
  
  // Optional Location
  hotelId?: string;
  hotelGuestName?: string;
  hotelRoomNumber?: string;
}

export interface BookingResult {
  success: boolean;
  bookingId?: string;
  booking?: any;
  error?: string;
  errors?: string[];
}

/**
 * CREATE BOOKING - Single source of truth
 * 
 * @param input - Validated user input
 * @returns BookingResult with success status and booking data or errors
 */
export async function createBooking(input: BookingInput): Promise<BookingResult> {
  try {
    // ===== STEP 1: PRE-FLIGHT VALIDATION =====
    const userInputValidation = validateUserInput({
      customerName: input.customerName,
      customerWhatsApp: input.customerWhatsApp,
      duration: input.duration,
      price: input.price
    });

    if (!userInputValidation.valid) {
      logValidation('User Input Validation Failed', userInputValidation.errors);
      return {
        success: false,
        errors: userInputValidation.errors
      };
    }

    // ===== STEP 2: GENERATE BOOKING DATA =====
    const now = new Date();
    const bookingId = generateBookingId();
    const responseDeadline = calculateResponseDeadline();
    const normalizedWhatsApp = normalizeWhatsApp(
      `${input.countryCode || '+62'}${input.customerWhatsApp}`
    );

    const rawBookingData: any = {
      // REQUIRED FIELDS
      bookingId,
      bookingDate: now.toISOString(),
      userId: input.userId,
      status: 'Pending',
      duration: input.duration,
      providerId: input.providerId,
      providerType: input.providerType,
      providerName: input.providerName,
      service: String(input.duration), // '60', '90', or '120'
      startTime: input.scheduledTime ? input.scheduledTime.toISOString() : now.toISOString(),
      price: Math.round(input.price / 1000), // Convert IDR to thousands
      createdAt: now.toISOString(),
      responseDeadline: responseDeadline.toISOString(),
      
      // OPTIONAL FIELDS
      therapistId: input.providerId, // Backward compatibility
      therapistName: input.providerName, // Backward compatibility
      therapistType: input.providerType, // Backward compatibility
      bookingType: input.bookingType,
      totalCost: input.price,
      paymentMethod: 'Unpaid',
      customerName: input.customerName.trim(),
      customerWhatsApp: normalizedWhatsApp,
      scheduledTime: input.scheduledTime ? input.scheduledTime.toISOString() : undefined
    };

    // Add optional hotel/villa fields
    if (input.hotelId) {
      rawBookingData.hotelId = input.hotelId;
    }
    if (input.hotelGuestName) {
      rawBookingData.hotelGuestName = input.hotelGuestName;
    }
    if (input.hotelRoomNumber) {
      rawBookingData.hotelRoomNumber = input.hotelRoomNumber;
    }

    // ===== STEP 3: VALIDATE AGAINST SCHEMA =====
    const validation = validateBookingPayload(rawBookingData);

    if (!validation.valid) {
      logValidation('Schema Validation Failed', validation.errors);
      return {
        success: false,
        errors: validation.errors
      };
    }

    const bookingData = validation.payload!;
    logPayload(bookingData);

    // ===== STEP 4: CHECK COLLECTION EXISTS =====
    if (!APPWRITE_CONFIG.collections.bookings || APPWRITE_CONFIG.collections.bookings === '') {
      console.warn('⚠️ Bookings collection disabled - simulating booking creation');
      return {
        success: false,
        error: 'Bookings collection is not configured'
      };
    }

    // ===== STEP 5: CREATE DOCUMENT IN APPWRITE =====
    console.log('📤 Creating booking document in Appwrite...');
    
    const booking = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.bookings,
      bookingId,
      bookingData
    );

    logAppwriteResponse(booking);

    return {
      success: true,
      bookingId: booking.$id,
      booking
    };

  } catch (error: any) {
    console.error('❌ Booking creation failed:', error);
    
    // Parse Appwrite error
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    
    // Check for attribute errors
    if (errorMessage.includes('Missing required attribute') || 
        errorMessage.includes('Invalid document structure')) {
      return {
        success: false,
        error: 'Booking data validation failed. Please contact support.',
        errors: [errorMessage]
      };
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * QUICK HELPER - For immediate "Book Now" flows
 */
export async function createImmediateBooking(
  userId: string,
  providerId: string,
  providerName: string,
  providerType: 'therapist' | 'place',
  duration: number,
  price: number,
  customerName: string,
  customerWhatsApp: string,
  options?: {
    hotelId?: string;
    hotelGuestName?: string;
    hotelRoomNumber?: string;
  }
): Promise<BookingResult> {
  return createBooking({
    userId,
    providerId,
    providerName,
    providerType,
    duration,
    price,
    customerName,
    customerWhatsApp,
    bookingType: 'immediate',
    ...options
  });
}

/**
 * QUICK HELPER - For scheduled bookings
 */
export async function createScheduledBooking(
  userId: string,
  providerId: string,
  providerName: string,
  providerType: 'therapist' | 'place',
  duration: number,
  price: number,
  customerName: string,
  customerWhatsApp: string,
  scheduledTime: Date,
  options?: {
    hotelId?: string;
    hotelGuestName?: string;
    hotelRoomNumber?: string;
  }
): Promise<BookingResult> {
  return createBooking({
    userId,
    providerId,
    providerName,
    providerType,
    duration,
    price,
    customerName,
    customerWhatsApp,
    bookingType: 'scheduled',
    scheduledTime,
    ...options
  });
}
