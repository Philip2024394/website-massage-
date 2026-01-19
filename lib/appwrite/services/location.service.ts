/**
 * Location Service - Manages location data for therapists and places
 * Connects to Appwrite 'locations' collection
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export interface LocationData {
  $id?: string;
  locationId?: string;
  longitude?: number;
  latitude?: number;
  geopoint?: any; // Appwrite geopoint type
  altitude?: number;
  timestamp?: string;
  region?: string;
  name?: string;
  aliases?: string[]; // Array of alternative names
  country: string; // Always "Indonesia" for now
  isActive?: boolean;
  city: string; // REQUIRED - One of 15 Indonesian cities
  serviceAreas: string; // REQUIRED - JSON string of area IDs ["jakarta-kemang", "jakarta-senopati"]
  maxTravelDistance?: string; // Optional travel limit in km
  $createdAt?: string;
  $updatedAt?: string;
}

export const locationService = {
  /**
   * Create a new location record
   */
  async create(locationData: Partial<LocationData>): Promise<LocationData> {
    try {
      // Ensure required fields
      if (!locationData.city) {
        throw new Error('City is required');
      }
      if (!locationData.serviceAreas) {
        throw new Error('Service areas are required');
      }

      // Set defaults
      const data: any = {
        country: 'Indonesia',
        isActive: true,
        ...locationData,
        // Ensure serviceAreas is a string (JSON)
        serviceAreas: typeof locationData.serviceAreas === 'string' 
          ? locationData.serviceAreas 
          : JSON.stringify(locationData.serviceAreas),
      };

      const response = await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.locations || 'locations',
        ID.unique(),
        data
      );

      console.log('✅ Location created:', response.$id);
      return response as LocationData;
    } catch (error) {
      console.error('❌ Error creating location:', error);
      throw error;
    }
  },

  /**
   * Get location by ID
   */
  async getById(locationId: string): Promise<LocationData | null> {
    try {
      const response = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.locations || 'locations',
        locationId
      );
      return response as LocationData;
    } catch (error) {
      console.error('❌ Error fetching location:', error);
      return null;
    }
  },

  /**
   * Get all locations for a city
   */
  async getByCity(city: string): Promise<LocationData[]> {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.locations || 'locations',
        [
          Query.equal('city', city),
          Query.equal('isActive', true),
          Query.limit(500),
        ]
      );
      return response.documents as LocationData[];
    } catch (error) {
      console.error('❌ Error fetching locations by city:', error);
      return [];
    }
  },

  /**
   * Get locations by service area
   */
  async getByServiceArea(city: string, areaId: string): Promise<LocationData[]> {
    try {
      // Note: Appwrite doesn't support JSON array searching directly
      // We'll fetch all locations for the city and filter client-side
      const cityLocations = await this.getByCity(city);
      
      return cityLocations.filter(location => {
        try {
          const areas = JSON.parse(location.serviceAreas);
          return Array.isArray(areas) && areas.includes(areaId);
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error('❌ Error fetching locations by service area:', error);
      return [];
    }
  },

  /**
   * Update location
   */
  async update(locationId: string, updates: Partial<LocationData>): Promise<LocationData | null> {
    try {
      // Ensure serviceAreas is a string if provided
      if (updates.serviceAreas && typeof updates.serviceAreas !== 'string') {
        updates.serviceAreas = JSON.stringify(updates.serviceAreas);
      }

      const response = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.locations || 'locations',
        locationId,
        updates
      );

      console.log('✅ Location updated:', locationId);
      return response as LocationData;
    } catch (error) {
      console.error('❌ Error updating location:', error);
      return null;
    }
  },

  /**
   * Delete location (soft delete by setting isActive to false)
   */
  async delete(locationId: string): Promise<boolean> {
    try {
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.locations || 'locations',
        locationId,
        { isActive: false }
      );
      console.log('✅ Location deleted (soft):', locationId);
      return true;
    } catch (error) {
      console.error('❌ Error deleting location:', error);
      return false;
    }
  },

  /**
   * Create or update location for a therapist/place
   */
  async upsertForProvider(
    providerId: string,
    providerType: 'therapist' | 'place',
    locationData: Partial<LocationData>
  ): Promise<LocationData | null> {
    try {
      // Check if location already exists for this provider
      const existingLocation = await this.getByProviderId(providerId, providerType);

      if (existingLocation) {
        return await this.update(existingLocation.$id!, locationData);
      } else {
        return await this.create({
          ...locationData,
          locationId: `${providerType}-${providerId}`,
        });
      }
    } catch (error) {
      console.error('❌ Error upserting location:', error);
      return null;
    }
  },

  /**
   * Get location by provider ID
   */
  async getByProviderId(
    providerId: string,
    providerType: 'therapist' | 'place'
  ): Promise<LocationData | null> {
    try {
      const locationId = `${providerType}-${providerId}`;
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.locations || 'locations',
        [Query.equal('locationId', locationId), Query.limit(1)]
      );

      return response.documents.length > 0 ? (response.documents[0] as LocationData) : null;
    } catch (error) {
      console.error('❌ Error fetching location by provider:', error);
      return null;
    }
  },

  /**
   * Parse serviceAreas string to array
   */
  parseServiceAreas(serviceAreas: string): string[] {
    try {
      const parsed = JSON.parse(serviceAreas);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Serialize serviceAreas array to string
   */
  serializeServiceAreas(serviceAreas: string[]): string {
    return JSON.stringify(serviceAreas);
  },
};

export default locationService;
