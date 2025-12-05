/**
 * Cities Service - Manage location data in Appwrite
 */

import { databases } from './appwrite.ts';
import { APPWRITE_CONFIG } from './appwrite.config.ts';
import { INDONESIAN_CITIES_CATEGORIZED, CityLocation } from '../constants/indonesianCities.ts';

export const citiesService = {
  /**
   * Fetch all cities from Appwrite
   */
  async getAllCities(): Promise<CityLocation[]> {
    try {
      console.log('🏙️ Fetching cities from Appwrite...');
      
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.cities
      );
      
      console.log('✅ Fetched cities from Appwrite:', response.documents.length);
      
      // Convert Appwrite documents to CityLocation format (support multiple schemas)
      const cities = response.documents.map((doc: any) => {
        // Name and province field compatibility
        const name = doc.cityName || doc.name || '';
        const province = doc.state || doc.province || '';

        // Coordinates compatibility: can be [lng,lat], {lat,lng}, or JSON string of either
        let lat = 0;
        let lng = 0;

        let coords: any = doc.coordinates;
        if (typeof coords === 'string') {
          try {
            coords = JSON.parse(coords);
          } catch (_) {
            coords = null;
          }
        }

        if (Array.isArray(coords) && coords.length >= 2) {
          // Appwrite Point stored as [lng, lat]
          lat = coords[1];
          lng = coords[0];
        } else if (coords && typeof coords === 'object') {
          // Object form { lat, lng } or { latitude, longitude }
          lat = coords.lat ?? coords.latitude ?? 0;
          lng = coords.lng ?? coords.longitude ?? 0;
        }

        // Aliases compatibility: string "a, b" or array
        let aliases: string[] = [];
        if (Array.isArray(doc.aliases)) {
          aliases = doc.aliases.map((a: any) => String(a).trim()).filter(Boolean);
        } else if (typeof doc.aliases === 'string') {
          aliases = doc.aliases.split(',').map((a: string) => a.trim()).filter(Boolean);
        }

        return {
          name,
          province,
          coordinates: { lat, lng },
          isMainCity: !!doc.isMainCity,
          isTouristDestination: !!doc.isTouristDestination,
          aliases
        } as CityLocation;
      });
      
      return cities;
    } catch (error) {
      console.error('❌ Failed to fetch cities from Appwrite:', error);
      
      // Fallback to static data if Appwrite fails
      console.log('🔄 Using fallback static cities data');
      const allCities: CityLocation[] = [];
      INDONESIAN_CITIES_CATEGORIZED.forEach(category => {
        allCities.push(...category.cities);
      });
      
      return allCities;
    }
  },

  /**
   * Get cities organized by categories (for dropdown UI)
   */
  async getCitiesByCategory(): Promise<any[]> {
    try {
      const cities = await this.getAllCities();
      
      // Group cities by category
      const categorizedCities: { [key: string]: CityLocation[] } = {};
      
      cities.forEach(city => {
        // Determine category based on province and type
        let category = '';
        
        if (city.province === 'Bali') {
          category = '🏝️ Bali - Tourist Destinations';
        } else if (city.province === 'DKI Jakarta' || city.province === 'West Java' || city.province === 'Central Java' || city.province === 'East Java') {
          category = '🏙️ Java - Major Cities';
        } else if (city.isTouristDestination) {
          category = '🏖️ Popular Beach Destinations';
        } else {
          category = '🌴 Other Indonesian Cities';
        }
        
        if (!categorizedCities[category]) {
          categorizedCities[category] = [];
        }
        categorizedCities[category].push(city);
      });
      
      // Convert to array format for dropdown
      const result = Object.entries(categorizedCities).map(([category, cities]) => ({
        category,
        cities
      }));
      
      console.log('🗂️ Organized cities into', result.length, 'categories');
      return result;
    } catch (error) {
      console.error('❌ Failed to organize cities:', error);
      
      // Fallback to static data
      return INDONESIAN_CITIES_CATEGORIZED;
    }
  },

  /**
   * Seed static cities data to Appwrite (one-time setup)
   */
  async seedCitiesToAppwrite(): Promise<void> {
    try {
      console.log('🌱 Starting cities data seeding to Appwrite...');
      
      let totalSeeded = 0;
      
      for (const categoryData of INDONESIAN_CITIES_CATEGORIZED) {
        console.log(`📂 Processing category: ${categoryData.category}`);
        
        for (const city of categoryData.cities) {
          try {
            await databases.createDocument(
              APPWRITE_CONFIG.databaseId,
              APPWRITE_CONFIG.collections.cities,
              'unique()',
              {
                name: city.name,
                province: city.province,
                category: categoryData.category,
                coordinates: JSON.stringify(city.coordinates),
                isMainCity: city.isMainCity,
                isTouristDestination: city.isTouristDestination,
                aliases: city.aliases ? city.aliases.join(', ') : ''
              }
            );
            
            totalSeeded++;
            console.log(`  ✅ Added: ${city.name}`);
          } catch (error: any) {
            console.error(`  ❌ Failed to add ${city.name}:`, error.message);
          }
        }
      }
      
      console.log(`🎉 Seeding complete! Added ${totalSeeded} cities to Appwrite`);
    } catch (error) {
      console.error('❌ Failed to seed cities data:', error);
      throw error;
    }
  }
};