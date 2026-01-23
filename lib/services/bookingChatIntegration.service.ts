/**
 * 🎪 BOOKING CHAT INTEGRATION SERVICE - Production Ready
 * 
 * Purpose: Connects booking system with chat window for seamless user experience
 * Features:
 * - Real Appwrite booking data integration
 * - Live countdown timers for booking acceptance deadlines
 * - User authentication integration
 * - Notification system for booking status changes
 * - Production-ready error handling
 */

import { databases, account, DATABASE_ID, COLLECTIONS } from '../appwrite';
import { ID, Query } from 'appwrite';
import { resolveBookingIdentity, validateBookingIdentity } from '../utils/bookingIdentityResolver';

export interface BookingChatData {
  bookingId: string;
  chatRoomId: string;
  customerId: string;
  customerName: string;
  customerWhatsApp?: string;
  therapistId: string;
  therapistName: string;
  therapistPhoto?: string;
  serviceType: string;
  serviceDuration: number;
  bookingDate: string;
  bookingTime: string;
  bookingType: 'book_now' | 'scheduled';
  status: 'pending' | 'accepted' | 'confirmed' | 'completed' | 'cancelled';
  pricing: Record<string, number>;
  responseDeadline: string; // ISO timestamp when therapist must respond
  totalPrice: number;
  location?: string;
  coordinates?: { lat: number; lng: number };
}

export interface ChatRoomWithBooking {
  $id: string;
  bookingId?: string;
  providerId: string;
  providerName: string;
  providerImage: string | null;
  customerId?: string;
  customerName?: string;
  customerWhatsApp?: string;
  status: string;
  pricing: Record<string, number>;
  createdAt: string;
  lastMessageAt?: string;
  unreadCount?: number;
  duration?: number;
  // Booking data
  serviceDate?: string;
  serviceTime?: string;
  serviceDuration?: string;
  serviceType?: string;
  bookingType?: 'book_now' | 'scheduled';
  therapistPhoto?: string;
  responseDeadline?: string;
  bookingStatus?: string;
}

class BookingChatIntegrationService {
  
  /**
   * Get authenticated user or create anonymous session
   */
  private async getCurrentUser() {
    try {
      return await account.get();
    } catch {
      console.log('🔑 Creating anonymous session for booking chat...');
      try {
        await account.createAnonymousSession();
        return await account.get();
      } catch (anonError) {
        console.warn('⚠️ Could not create anonymous session:', anonError);
        return null;
      }
    }
  }

  /**
   * Fetch chat rooms with enriched booking data for the current user
   */
  async fetchUserChatRoomsWithBookings(): Promise<ChatRoomWithBooking[]> {
    try {
      console.log('📊 Fetching chat rooms with booking data...');
      
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        console.warn('⚠️ No authenticated user - cannot fetch chat rooms');
        return [];
      }

      // Check if chat_sessions collection exists
      if (!COLLECTIONS.CHAT_SESSIONS) {
        console.warn('⚠️ Chat sessions collection not configured');
        return [];
      }

      // Fetch chat rooms where user is involved
      const queries = [
        Query.or([
          Query.equal('customerId', currentUser.$id),
          Query.equal('therapistId', currentUser.$id)
        ]),
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ];

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        queries
      );

      console.log(`📋 Found ${response.documents.length} chat rooms`);

      // Enrich with booking data
      const enrichedRooms = await Promise.all(
        response.documents.map(async (room: any) => {
          const enrichedRoom: ChatRoomWithBooking = {
            $id: room.$id,
            bookingId: room.bookingId,
            providerId: room.therapistId || room.providerId,
            providerName: room.therapistName || room.providerName,
            providerImage: room.therapistPhoto || room.providerImage,
            customerId: room.customerId,
            customerName: room.customerName,
            customerWhatsApp: room.customerWhatsApp,
            status: room.status || 'active',
            pricing: room.pricing || {},
            createdAt: room.$createdAt,
            lastMessageAt: room.lastMessageAt,
            unreadCount: room.unreadCount || 0,
            duration: room.duration
          };

          // Fetch booking data if bookingId exists
          if (room.bookingId && COLLECTIONS.BOOKINGS) {
            try {
              const booking = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.BOOKINGS,
                room.bookingId
              );

              // Calculate response deadline (5 min for book_now, 25 min for scheduled)
              const bookingCreatedAt = new Date(booking.$createdAt);
              const deadlineMinutes = booking.bookingType === 'book_now' ? 5 : 25;
              const responseDeadline = new Date(bookingCreatedAt.getTime() + deadlineMinutes * 60 * 1000);

              // Add booking data to chat room
              enrichedRoom.serviceDate = booking.bookingDate || booking.scheduledDate;
              enrichedRoom.serviceTime = booking.startTime || booking.scheduledTime;
              enrichedRoom.serviceDuration = String(booking.duration || 60);
              enrichedRoom.serviceType = booking.service || booking.serviceType || 'Massage';
              enrichedRoom.bookingType = booking.bookingType || (booking.scheduledDate ? 'scheduled' : 'book_now');
              enrichedRoom.therapistPhoto = room.therapistPhoto || room.providerImage;
              enrichedRoom.responseDeadline = responseDeadline.toISOString();
              enrichedRoom.bookingStatus = booking.status;

              console.log(`✅ Enriched chat room ${room.$id} with booking data`);

            } catch (bookingError) {
              console.warn(`⚠️ Could not fetch booking ${room.bookingId}:`, bookingError);
            }
          }

          return enrichedRoom;
        })
      );

      return enrichedRooms;

    } catch (error) {
      console.error('❌ Error fetching chat rooms with booking data:', error);
      return [];
    }
  }

  /**
   * Create a new booking and associated chat room
   */
  async createBookingWithChat(bookingData: {
    therapistId: string;
    therapistName: string;
    serviceType: string;
    duration: number;
    bookingType: 'book_now' | 'scheduled';
    scheduledDate?: string;
    scheduledTime?: string;
    location?: string;
    coordinates?: { lat: number; lng: number };
    totalPrice: number;
  }): Promise<BookingChatData | null> {
    try {
      console.log('🏗️ Creating booking with chat integration...');
      
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('Authentication required');
      }

      // 🚫 DO NOT MODIFY - CANONICAL IDENTITY RESOLUTION
      // Booking identity is resolved exclusively via resolveBookingIdentity().
      const identity = resolveBookingIdentity(currentUser);
      validateBookingIdentity(identity);

      // Create booking first
      const bookingId = ID.unique();
      const now = new Date();
      const deadlineMinutes = bookingData.bookingType === 'book_now' ? 5 : 25;
      const responseDeadline = new Date(now.getTime() + deadlineMinutes * 60 * 1000);

      const booking = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        bookingId,
        {
          bookingId,
          customerId: currentUser.$id,
          customerName: identity.customerName, // 🎯 CANONICAL IDENTITY FIELD
          userName: identity.userName, // 🎯 DERIVED COMPATIBILITY FIELD
          therapistId: bookingData.therapistId,
          therapistName: bookingData.therapistName,
          service: bookingData.serviceType,
          serviceType: bookingData.serviceType,
          duration: bookingData.duration,
          bookingType: bookingData.bookingType,
          bookingDate: bookingData.scheduledDate || now.toISOString().split('T')[0],
          startTime: bookingData.scheduledTime || now.toTimeString().split(' ')[0],
          scheduledDate: bookingData.scheduledDate,
          scheduledTime: bookingData.scheduledTime,
          status: 'pending',
          totalPrice: bookingData.totalPrice,
          totalCost: bookingData.totalPrice,
          location: bookingData.location,
          coordinates: bookingData.coordinates,
          responseDeadline: responseDeadline.toISOString(),
          providerType: 'therapist',
          providerId: bookingData.therapistId,
          providerName: bookingData.therapistName
        }
      );

      console.log('✅ Booking created:', booking.$id);

      // Create chat room
      const chatRoomId = ID.unique();
      const chatRoom = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.CHAT_SESSIONS,
        chatRoomId,
        {
          bookingId: booking.$id,
          customerId: currentUser.$id,
          customerName: currentUser.name || 'Customer',
          customerWhatsApp: '', // To be filled in chat
          therapistId: bookingData.therapistId,
          therapistName: bookingData.therapistName,
          therapistPhoto: '', // To be filled from therapist profile
          status: 'waiting', // Waiting for therapist response
          pricing: { [bookingData.duration]: bookingData.totalPrice },
          duration: bookingData.duration,
          serviceType: bookingData.serviceType,
          bookingType: bookingData.bookingType,
          responseDeadline: responseDeadline.toISOString()
        }
      );

      console.log('✅ Chat room created:', chatRoom.$id);

      // Return combined data
      const bookingChatData: BookingChatData = {
        bookingId: booking.$id,
        chatRoomId: chatRoom.$id,
        customerId: currentUser.$id,
        customerName: currentUser.name || 'Customer',
        customerWhatsApp: '',
        therapistId: bookingData.therapistId,
        therapistName: bookingData.therapistName,
        therapistPhoto: '',
        serviceType: bookingData.serviceType,
        serviceDuration: bookingData.duration,
        bookingDate: bookingData.scheduledDate || now.toISOString().split('T')[0],
        bookingTime: bookingData.scheduledTime || now.toTimeString().split(' ')[0],
        bookingType: bookingData.bookingType,
        status: 'pending',
        pricing: { [bookingData.duration]: bookingData.totalPrice },
        responseDeadline: responseDeadline.toISOString(),
        totalPrice: bookingData.totalPrice,
        location: bookingData.location,
        coordinates: bookingData.coordinates
      };

      return bookingChatData;

    } catch (error) {
      console.error('❌ Error creating booking with chat:', error);
      return null;
    }
  }

  /**
   * Update booking status and notify chat participants
   */
  async updateBookingStatus(bookingId: string, newStatus: string, reason?: string): Promise<boolean> {
    try {
      console.log(`🔄 Updating booking ${bookingId} status to: ${newStatus}`);
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.BOOKINGS,
        bookingId,
        {
          status: newStatus,
          updatedAt: new Date().toISOString(),
          ...(reason && { statusReason: reason })
        }
      );

      // Also update associated chat room
      try {
        const chatRooms = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.CHAT_SESSIONS,
          [Query.equal('bookingId', bookingId)]
        );

        if (chatRooms.documents.length > 0) {
          const chatRoom = chatRooms.documents[0];
          await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.CHAT_SESSIONS,
            chatRoom.$id,
            {
              status: newStatus === 'confirmed' ? 'active' : newStatus,
              lastStatusUpdate: new Date().toISOString()
            }
          );
        }
      } catch (chatError) {
        console.warn('⚠️ Could not update chat room status:', chatError);
      }

      console.log('✅ Booking status updated successfully');
      return true;

    } catch (error) {
      console.error('❌ Error updating booking status:', error);
      return false;
    }
  }

  /**
   * Calculate time remaining until booking response deadline
   */
  calculateTimeRemaining(responseDeadline: string): {
    timeRemaining: number; // seconds
    formatted: string;
    isExpired: boolean;
    isWithin5Minutes: boolean;
    isWithin2Minutes: boolean;
  } {
    const deadline = new Date(responseDeadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    const isExpired = diffSeconds <= 0;
    const isWithin5Minutes = diffSeconds <= 300;
    const isWithin2Minutes = diffSeconds <= 120;

    // Format time remaining
    let formatted = '';
    if (isExpired) {
      formatted = 'Expired';
    } else if (diffSeconds < 60) {
      formatted = `${diffSeconds}s`;
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      const seconds = diffSeconds % 60;
      formatted = seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(diffSeconds / 3600);
      const minutes = Math.floor((diffSeconds % 3600) / 60);
      formatted = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    return {
      timeRemaining: Math.max(0, diffSeconds),
      formatted,
      isExpired,
      isWithin5Minutes,
      isWithin2Minutes
    };
  }

}

export const bookingChatIntegrationService = new BookingChatIntegrationService();