/**
 * Location Data Helpers - Serialize/deserialize location data for Appwrite
 * Handles conversion between frontend arrays and Appwrite JSON strings
 */

import type { Therapist, Place } from '../types';

/**
 * Serialize service areas array to JSON string for Appwrite
 */
export function serializeServiceAreas(serviceAreas: string[]): string {
  return JSON.stringify(serviceAreas);
}

/**
 * Deserialize service areas JSON string to array
 */
export function deserializeServiceAreas(serviceAreasString: string | string[]): string[] {
  // Handle already-array case (shouldn't happen but defensive)
  if (Array.isArray(serviceAreasString)) {
    return serviceAreasString;
  }

  // Handle null/undefined
  if (!serviceAreasString) {
    return [];
  }

  // Parse JSON string
  try {
    const parsed = JSON.parse(serviceAreasString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to parse serviceAreas:', serviceAreasString, error);
    return [];
  }
}

/**
 * Get service areas from therapist/place (handles both string and array)
 */
export function getServiceAreas(provider: Therapist | Place): string[] {
  // Check if provider has serviceAreas property (only Therapist has this)
  if (!('serviceAreas' in provider) || !provider.serviceAreas) {
    return [];
  }

  return deserializeServiceAreas(provider.serviceAreas);
}

/**
 * Check if provider serves a specific area
 */
export function servesArea(provider: Therapist | Place, areaId: string): boolean {
  const serviceAreas = getServiceAreas(provider);
  return serviceAreas.includes(areaId);
}

/**
 * Check if provider serves a specific city
 */
export function servesCity(provider: Therapist | Place, city: string): boolean {
  return provider.city === city;
}

/**
 * Get travel distance for provider (handles string conversion)
 */
export function getMaxTravelDistance(provider: Therapist | Place): number | null {
  // Check if provider has maxTravelDistance property (only Therapist has this)
  if (!('maxTravelDistance' in provider) || !provider.maxTravelDistance) {
    return null;
  }

  const distance = typeof provider.maxTravelDistance === 'string' 
    ? parseFloat(provider.maxTravelDistance) 
    : provider.maxTravelDistance;

  return isNaN(distance) ? null : distance;
}

/**
 * Prepare therapist data for Appwrite save (converts arrays to JSON strings)
 */
export function prepareTherapistForSave(therapist: Partial<Therapist>): Partial<Therapist> {
  const prepared = { ...therapist };

  // Convert serviceAreas array to JSON string if needed
  if (prepared.serviceAreas && Array.isArray(prepared.serviceAreas)) {
    prepared.serviceAreas = serializeServiceAreas(prepared.serviceAreas as any);
  }

  // Ensure maxTravelDistance is a string
  if (prepared.maxTravelDistance && typeof prepared.maxTravelDistance === 'number') {
    prepared.maxTravelDistance = String(prepared.maxTravelDistance);
  }

  // Set default country
  if (!prepared.country) {
    prepared.country = 'Indonesia';
  }

  return prepared;
}

/**
 * Prepare therapist data from Appwrite (converts JSON strings to arrays)
 */
export function prepareTherapistFromAppwrite(therapist: any): Therapist {
  const prepared = { ...therapist };

  // Parse serviceAreas if it's a string
  if (prepared.serviceAreas && typeof prepared.serviceAreas === 'string') {
    try {
      prepared.serviceAreas = JSON.parse(prepared.serviceAreas);
    } catch (error) {
      console.warn('Failed to parse serviceAreas:', prepared.serviceAreas);
      prepared.serviceAreas = [];
    }
  }

  return prepared as Therapist;
}

/**
 * Validate location data before saving
 */
export function validateLocationData(data: {
  city?: string;
  serviceAreas?: string | string[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.city) {
    errors.push('City is required');
  }

  if (!data.serviceAreas) {
    errors.push('At least one service area is required');
  } else {
    const areas = typeof data.serviceAreas === 'string' 
      ? deserializeServiceAreas(data.serviceAreas) 
      : data.serviceAreas;
    
    if (!Array.isArray(areas) || areas.length === 0) {
      errors.push('At least one service area must be selected');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
