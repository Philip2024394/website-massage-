/**
 * Enhanced Broadcast Service for Timeout Fallback System
 * Handles location-based broadcasting to all nearby therapists and places
 */

import { databases, Query } from '../lib/appwrite';
import { logger } from '../lib/logger';

export interface BroadcastRequest {
  bookingId: string;
  providerType: 'therapist' | 'massage_place' | 'skincare_clinic'; // Provider type filter
  bookingType: 'immediate' | 'scheduled'; // NEW: Booking type for timeout duration
  userLocation: {
    lat: number;
    lng: number;
  };
  serviceType: string;
  duration: number;
  price: number;
  customerName: string;
  isUrgent?: boolean;
  excludeProviderIds?: string[];
  maxRadius?: number; // in kilometers, default 10km
}

export interface BroadcastResult {
  success: boolean;
  providerCount: number;
  therapistCount: number;
  placeCount: number;
  message?: string;
  broadcastId: string;
}

export interface NearbyProvider {
  id: string;
  type: 'therapist' | 'place';
  name: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number; // in kilometers
  whatsappNumber?: string;
}

class EnhancedBroadcastService {
  private readonly DEFAULT_RADIUS = 10; // 10km default search radius
  private readonly URGENT_RADIUS = 15; // Expand radius for urgent bookings
  private readonly MAX_PROVIDERS = 50; // Limit broadcast to prevent spam
  
  // Provider-specific timeout durations (in seconds)
  private readonly TIMEOUT_DURATIONS = {
    // Book Now (immediate bookings)
    immediate: {
      therapist: 300,        // 5 minutes
      massage_place: 600,    // 10 minutes  
      skincare_clinic: 600   // 10 minutes
    },
    // Scheduled bookings
    scheduled: {
      therapist: 900,        // 15 minutes
      massage_place: 1800,   // 30 minutes
      skincare_clinic: 1800  // 30 minutes
    }
  };
  
  // Provider type to collection mapping
  private readonly PROVIDER_COLLECTIONS = {
    therapist: 'therapists',
    massage_place: 'places',
    skincare_clinic: 'places'
  };
  
  // Provider type filters for places collection
  private readonly PLACE_TYPE_FILTERS = {
    massage_place: ['massage', 'spa', 'wellness'],
    skincare_clinic: ['skincare', 'clinic', 'facial', 'beauty']
  };
  
  /**
   * Get timeout duration based on provider type and booking type
   */
  getTimeoutDuration(providerType: 'therapist' | 'massage_place' | 'skincare_clinic', bookingType: 'immediate' | 'scheduled'): number {
    return this.TIMEOUT_DURATIONS[bookingType][providerType];
  }
  
  /**
   * Main broadcast function for timeout fallback
   */
  async broadcastToNearbyProviders(request: BroadcastRequest): Promise<BroadcastResult> {
    try {
      const broadcastId = `broadcast_${request.bookingId}_${Date.now()}`;
      
      logger.info('🌍 Starting provider-type-specific broadcast:', {
        bookingId: request.bookingId,
        providerType: request.providerType,
        location: request.userLocation,
        radius: request.maxRadius || (request.isUrgent ? this.URGENT_RADIUS : this.DEFAULT_RADIUS)
      });
      
      // Get nearby providers
      const nearbyProviders = await this.findNearbyProviders(request);
      
      if (nearbyProviders.length === 0) {
        return {
          success: false,
          providerCount: 0,
          therapistCount: 0,
          placeCount: 0,
          message: 'No providers found in the area',
          broadcastId
        };
      }
      
      // Filter available providers
      const availableProviders = this.filterAvailableProviders(nearbyProviders, request.excludeProviderIds);
      
      if (availableProviders.length === 0) {
        return {
          success: false,
          providerCount: 0,
          therapistCount: 0,
          placeCount: 0,
          message: 'No available providers found',
          broadcastId
        };
      }
      
      // Send notifications to all available providers
      const notificationResults = await this.sendBroadcastNotifications(availableProviders, request, broadcastId);
      
      // Count by type
      const therapistCount = availableProviders.filter(p => p.type === 'therapist').length;
      const placeCount = availableProviders.filter(p => p.type === 'place').length;
      
      // Log broadcast results
      await this.logBroadcastResults(request, availableProviders, broadcastId);
      
      return {
        success: true,
        providerCount: availableProviders.length,
        therapistCount,
        placeCount,
        broadcastId
      };
      
    } catch (error) {
      logger.error('❌ Broadcast failed:', error);
      throw error;
    }
  }
  
  /**
   * Find nearby providers of specific type within radius
   */
  private async findNearbyProviders(request: BroadcastRequest): Promise<NearbyProvider[]> {
    const radius = request.maxRadius || (request.isUrgent ? this.URGENT_RADIUS : this.DEFAULT_RADIUS);
    const providers: NearbyProvider[] = [];
    
    try {
      if (request.providerType === 'therapist') {
        // Find therapists only
        const therapists = await this.findTherapists(request.userLocation, radius, request.excludeProviderIds);
        providers.push(...therapists);
      } else {
        // Find places (massage places or skincare clinics)
        const places = await this.findPlacesByType(request.providerType, request.userLocation, radius, request.excludeProviderIds);
        providers.push(...places);
      }
      
      // Sort by distance
      return providers.sort((a, b) => a.distance - b.distance);
      
    } catch (error) {
      logger.error('❌ Error finding nearby providers:', error);
      return [];
    }
  }
  
  /**
   * Filter providers based on availability and exclusions
   */
  private filterAvailableProviders(providers: NearbyProvider[], excludeIds: string[] = []): NearbyProvider[] {
    return providers.filter(provider => {
      // Exclude specific provider IDs
      if (excludeIds.includes(provider.id)) {
        return false;
      }
      
      // Include available and busy providers (first-come-first-serve)
      const availableStatuses = ['available', 'busy', 'active', 'open'];
      return availableStatuses.some(status => 
        provider.status.toLowerCase().includes(status.toLowerCase())
      );
    });
  }
  
  /**
   * Send broadcast notifications to all providers
   */
  private async sendBroadcastNotifications(
    providers: NearbyProvider[],
    request: BroadcastRequest,
    broadcastId: string
  ): Promise<any[]> {
    const notifications = providers.map(async (provider) => {
      try {
        // Create notification record in database
        const notification = await databases.createDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          'broadcast_notifications', // Collection for broadcast notifications
          broadcastId + '_' + provider.id,
          {
            broadcastId,
            bookingId: request.bookingId,
            providerId: provider.id,
            providerType: provider.type,
            providerName: provider.name,
            customerName: request.customerName,
            serviceType: request.serviceType,
            serviceDuration: request.duration,
            servicePrice: request.price,
            bookingType: request.bookingType, // NEW: Include booking type
            distance: Math.round(provider.distance * 100) / 100, // Round to 2 decimal places
            isUrgent: request.isUrgent || false,
            status: 'sent',
            sentAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.getTimeoutDuration(request.providerType, request.bookingType) * 1000).toISOString(),
          }
        );
        
        return notification;
      } catch (error) {
        console.error(`Failed to send notification to ${provider.name}:`, error);
        return null;
      }
    });
    
    return Promise.allSettled(notifications);
  }
  
  /**
   * Find therapists within radius
   */
  private async findTherapists(userLocation: {lat: number, lng: number}, radius: number, excludeIds: string[] = []): Promise<NearbyProvider[]> {
    const providers: NearbyProvider[] = [];
    
    const therapists = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'therapists',
      [
        Query.isNotNull('latitude'),
        Query.isNotNull('longitude'),
        Query.notEqual('status', 'offline'),
        Query.notEqual('status', 'inactive'),
        Query.limit(this.MAX_PROVIDERS)
      ]
    );
    
    therapists.documents.forEach((therapist: any) => {
      if (excludeIds.includes(therapist.$id)) return;
      
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        therapist.latitude,
        therapist.longitude
      );
      
      if (distance <= radius) {
        providers.push({
          id: therapist.$id,
          type: 'therapist',
          name: therapist.name,
          status: therapist.status,
          location: {
            lat: therapist.latitude,
            lng: therapist.longitude
          },
          distance,
          whatsappNumber: therapist.whatsappNumber
        });
      }
    });
    
    return providers;
  }
  
  /**
   * Find places by type (massage places or skincare clinics)
   */
  private async findPlacesByType(
    providerType: 'massage_place' | 'skincare_clinic', 
    userLocation: {lat: number, lng: number}, 
    radius: number, 
    excludeIds: string[] = []
  ): Promise<NearbyProvider[]> {
    const providers: NearbyProvider[] = [];
    const typeFilters = this.PLACE_TYPE_FILTERS[providerType];
    
    // Build queries for each type filter
    const typeQueries = typeFilters.map(filter => 
      Query.search('type', filter)
    );
    
    const places = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      'places',
      [
        Query.isNotNull('latitude'),
        Query.isNotNull('longitude'),
        Query.notEqual('status', 'closed'),
        Query.notEqual('status', 'inactive'),
        Query.or(typeQueries), // Filter by place type
        Query.limit(this.MAX_PROVIDERS)
      ]
    );
    
    places.documents.forEach((place: any) => {
      if (excludeIds.includes(place.$id)) return;
      
      const distance = this.calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.latitude,
        place.longitude
      );
      
      if (distance <= radius) {
        providers.push({
          id: place.$id,
          type: 'place',
          name: place.name,
          status: place.status,
          location: {
            lat: place.latitude,
            lng: place.longitude
          },
          distance,
          whatsappNumber: place.whatsappNumber
        });
      }
    });
    
    return providers;
  }
  private async sendRealtimeNotification(
    provider: NearbyProvider,
    request: BroadcastRequest,
    broadcastId: string
  ): Promise<void> {
    // This would integrate with your real-time notification system
    // For now, we'll use a database update to trigger client-side polling
    
    try {
      // Update provider's notification queue
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'provider_notifications',
        broadcastId + '_notification_' + provider.id,
        {
          providerId: provider.id,
          providerType: provider.type,
          notificationType: 'urgent_booking_request',
          bookingId: request.bookingId,
          broadcastId,
          title: 'Urgent Booking Request',
          message: `${request.customerName} needs ${request.serviceType} service (${request.duration} min) - ${provider.distance.toFixed(1)}km away`,
          isUrgent: true,
          actionRequired: true,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      );
      
    } catch (error) {
      logger.warn(`⚠️ Failed to send real-time notification to ${provider.id}:`, error);
    }
  }
  
  /**
   * Log broadcast results for analytics
   */
  private async logBroadcastResults(
    request: BroadcastRequest,
    providers: NearbyProvider[],
    broadcastId: string
  ): Promise<void> {
    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'broadcast_logs',
        broadcastId,
        {
          bookingId: request.bookingId,
          broadcastId,
          userLocation: JSON.stringify(request.userLocation),
          serviceType: request.serviceType,
          totalProviders: providers.length,
          therapistCount: providers.filter(p => p.type === 'therapist').length,
          placeCount: providers.filter(p => p.type === 'place').length,
          isUrgent: request.isUrgent || false,
          maxRadius: request.maxRadius || this.DEFAULT_RADIUS,
          createdAt: new Date().toISOString(),
          providers: JSON.stringify(providers.map(p => ({
            id: p.id,
            name: p.name,
            type: p.type,
            distance: p.distance
          })))
        }
      );
    } catch (error) {
      logger.warn('⚠️ Failed to log broadcast results:', error);
    }
  }
  
  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Handle provider acceptance (first-come-first-serve)
   */
  async handleProviderAcceptance(broadcastId: string, providerId: string, providerType: 'therapist' | 'place'): Promise<boolean> {
    try {
      // Check if broadcast is still active
      const broadcastLog = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'broadcast_logs',
        broadcastId
      );
      
      if (!broadcastLog) {
        return false; // Broadcast expired
      }
      
      // Mark as accepted and cancel other notifications
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'broadcast_logs',
        broadcastId,
        {
          acceptedBy: providerId,
          acceptedByType: providerType,
          acceptedAt: new Date().toISOString(),
          status: 'accepted'
        }
      );
      
      // Cancel other pending notifications
      const notifications = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'broadcast_notifications',
        [Query.equal('broadcastId', broadcastId)]
      );
      
      const cancelPromises = notifications.documents
        .filter((n: any) => n.providerId !== providerId && n.status === 'sent')
        .map((n: any) => 
          databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            'broadcast_notifications',
            n.$id,
            { status: 'cancelled' }
          )
        );
      
      await Promise.allSettled(cancelPromises);
      
      return true;
      
    } catch (error) {
      logger.error('❌ Error handling provider acceptance:', error);
      return false;
    }
  }
}

export const enhancedBroadcastService = new EnhancedBroadcastService();

// Export helper function for easy use in components
export async function broadcastToNearbyProviders(request: BroadcastRequest): Promise<BroadcastResult> {
  return enhancedBroadcastService.broadcastToNearbyProviders(request);
}

// Export helper function to get timeout duration
export function getProviderTimeoutDuration(providerType: 'therapist' | 'massage_place' | 'skincare_clinic', bookingType: 'immediate' | 'scheduled'): number {
  return enhancedBroadcastService.getTimeoutDuration(providerType, bookingType);
}