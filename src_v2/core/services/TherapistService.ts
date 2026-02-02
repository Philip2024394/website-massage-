/**
 * ============================================================================
 * 👨‍⚕️ THERAPIST SERVICE - PROVIDER MANAGEMENT
 * ============================================================================
 * 
 * Unified therapist and provider management service.
 * 
 * ============================================================================
 */

import { 
  databases, 
  DATABASE_ID, 
  COLLECTION_IDS, 
  ID, 
  Query 
} from '../clients/appwrite';

export interface TherapistProfile {
  id?: string;
  name: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  avatar?: string;
  
  // Professional details
  experience: number;
  specializations: string[];
  certifications: string[];
  languages: string[];
  
  // Location and availability
  location: {
    address: string;
    coordinates?: { lat: number; lng: number };
    serviceRadius: number; // in km
  };
  availability: {
    days: string[]; // ['monday', 'tuesday', etc.]
    hours: { start: string; end: string; };
    flexible: boolean;
  };
  
  // Ratings and performance
  rating: number;
  reviewCount: number;
  completedBookings: number;
  responseTime: number; // average in minutes
  
  // Pricing
  rates: {
    massage60: number;
    massage90: number;
    massage120: number;
    travelFee?: number;
  };
  
  // Status
  status: 'active' | 'busy' | 'offline' | 'suspended';
  verified: boolean;
  lastActive?: Date;
  
  // Settings
  settings: {
    autoAcceptBookings: boolean;
    maxDailyBookings: number;
    requireDeposit: boolean;
    instantBooking: boolean;
  };
}

export class TherapistService {
  
  /**
   * Get therapist profile
   */
  static async getProfile(therapistId: string): Promise<TherapistProfile | null> {
    try {
      const therapist = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.therapists,
        therapistId
      );

      return {
        id: therapist.$id,
        name: therapist.name,
        email: therapist.email,
        phone: therapist.phone,
        whatsapp: therapist.whatsapp,
        avatar: therapist.avatar,
        experience: therapist.experience || 0,
        specializations: therapist.specializations || [],
        certifications: therapist.certifications || [],
        languages: therapist.languages || ['Indonesian'],
        location: therapist.location || { address: '', serviceRadius: 10 },
        availability: therapist.availability || { days: [], hours: { start: '09:00', end: '21:00' }, flexible: true },
        rating: therapist.rating || 0,
        reviewCount: therapist.reviewCount || 0,
        completedBookings: therapist.completedBookings || 0,
        responseTime: therapist.responseTime || 15,
        rates: therapist.rates || { massage60: 300000, massage90: 450000, massage120: 600000 },
        status: therapist.status || 'active',
        verified: therapist.verified || false,
        lastActive: therapist.lastActive ? new Date(therapist.lastActive) : undefined,
        settings: therapist.settings || {
          autoAcceptBookings: false,
          maxDailyBookings: 5,
          requireDeposit: false,
          instantBooking: false
        }
      };
    } catch (error) {
      console.error('❌ [THERAPIST] Failed to get profile:', error);
      return null;
    }
  }

  /**
   * Update therapist profile
   */
  static async updateProfile(therapistId: string, updates: Partial<TherapistProfile>): Promise<TherapistProfile | null> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Remove id from updates
      delete updateData.id;

      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.therapists,
        therapistId,
        updateData
      );

      console.log('✅ [THERAPIST] Profile updated:', therapistId);
      return await TherapistService.getProfile(therapistId);
    } catch (error) {
      console.error('❌ [THERAPIST] Failed to update profile:', error);
      return null;
    }
  }

  /**
   * Find available therapists
   */
  static async findAvailable(criteria: {
    location?: { lat: number; lng: number; radius?: number };
    serviceType?: string;
    duration?: number;
    datetime?: Date;
    specialization?: string;
  }): Promise<TherapistProfile[]> {
    try {
      const queries = [
        Query.equal('status', 'active'),
        Query.equal('verified', true),
        Query.orderDesc('rating')
      ];

      if (criteria.specialization) {
        queries.push(Query.contains('specializations', criteria.specialization));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.therapists,
        queries
      );

      const therapists = await Promise.all(
        response.documents.map(doc => TherapistService.getProfile(doc.$id))
      );

      return therapists.filter(t => t !== null) as TherapistProfile[];
    } catch (error) {
      console.error('❌ [THERAPIST] Failed to find available therapists:', error);
      return [];
    }
  }

  /**
   * Update therapist availability
   */
  static async updateAvailability(therapistId: string, availability: TherapistProfile['availability']): Promise<boolean> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.therapists,
        therapistId,
        {
          availability,
          updatedAt: new Date().toISOString()
        }
      );

      console.log('✅ [THERAPIST] Availability updated:', therapistId);
      return true;
    } catch (error) {
      console.error('❌ [THERAPIST] Failed to update availability:', error);
      return false;
    }
  }

  /**
   * Update therapist status
   */
  static async updateStatus(therapistId: string, status: TherapistProfile['status']): Promise<boolean> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.therapists,
        therapistId,
        {
          status,
          lastActive: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );

      console.log(`✅ [THERAPIST] Status updated to ${status}:`, therapistId);
      return true;
    } catch (error) {
      console.error('❌ [THERAPIST] Failed to update status:', error);
      return false;
    }
  }

  /**
   * Get therapist statistics
   */
  static async getStatistics(therapistId: string): Promise<{
    bookingsToday: number;
    bookingsThisWeek: number;
    bookingsThisMonth: number;
    earningsToday: number;
    earningsThisWeek: number;
    earningsThisMonth: number;
    averageRating: number;
    responseTime: number;
  }> {
    try {
      // TODO: Implement actual statistics calculation
      // For now, return mock data
      return {
        bookingsToday: 3,
        bookingsThisWeek: 12,
        bookingsThisMonth: 45,
        earningsToday: 900000,
        earningsThisWeek: 5400000,
        earningsThisMonth: 22500000,
        averageRating: 4.8,
        responseTime: 8
      };
    } catch (error) {
      console.error('❌ [THERAPIST] Failed to get statistics:', error);
      return {
        bookingsToday: 0,
        bookingsThisWeek: 0,
        bookingsThisMonth: 0,
        earningsToday: 0,
        earningsThisWeek: 0,
        earningsThisMonth: 0,
        averageRating: 0,
        responseTime: 0
      };
    }
  }
}

// Export convenience functions
export const getTherapistProfile = TherapistService.getProfile;
export const updateTherapistProfile = TherapistService.updateProfile;
export const findAvailableTherapists = TherapistService.findAvailable;
export const updateTherapistAvailability = TherapistService.updateAvailability;
export const updateTherapistStatus = TherapistService.updateStatus;
export const getTherapistStatistics = TherapistService.getStatistics;

console.log('👨‍⚕️ [CORE] TherapistService loaded');