/**
 * Indonesian Cities and Tourist Destinations
 * Organized by major islands and regions for location-based matching
 */

export interface CityLocation {
  name: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isMainCity: boolean;
  isTouristDestination: boolean;
  aliases?: string[]; // Alternative names for matching
}

export interface CityCategory {
  category: string;
  cities: CityLocation[];
}

export const INDONESIAN_CITIES_CATEGORIZED: CityCategory[] = [
  {
    category: "🏝️ Bali - Tourist Destinations",
    cities: [
      {
        name: "Denpasar",
        province: "Bali",
        coordinates: { lat: -8.6705, lng: 115.2126 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Denpasar Bali", "Bali Capital"]
      },
      {
        name: "Ubud",
        province: "Bali",
        coordinates: { lat: -8.5069, lng: 115.2625 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Ubud Bali", "Cultural Center Bali"]
      },
      {
        name: "Canggu",
        province: "Bali",
        coordinates: { lat: -8.6482, lng: 115.1436 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Canggu Beach", "Surf Bali"]
      },
      {
        name: "Seminyak",
        province: "Bali",
        coordinates: { lat: -8.6953, lng: 115.1668 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Seminyak Beach", "Luxury Bali"]
      },
      {
        name: "Kuta",
        province: "Bali",
        coordinates: { lat: -8.7205, lng: 115.1693 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Kuta Beach", "Airport Bali"]
      },
      {
        name: "Sanur",
        province: "Bali",
        coordinates: { lat: -8.6882, lng: 115.2613 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Sanur Beach", "Sunrise Beach Bali"]
      },
      {
        name: "Nusa Dua",
        province: "Bali",
        coordinates: { lat: -8.7968, lng: 115.2285 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Resort Area Bali", "Luxury Hotels Bali"]
      },
      {
        name: "Jimbaran",
        province: "Bali",
        coordinates: { lat: -8.7679, lng: 115.1668 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Jimbaran Beach", "Seafood Bali"]
      }
    ]
  },
  {
    category: "🏙️ Java - Major Cities",
    cities: [
      {
        name: "Jakarta",
        province: "DKI Jakarta",
        coordinates: { lat: -6.2088, lng: 106.8456 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Jakarta Capital", "DKI Jakarta", "Betawi"]
      },
      {
        name: "Surabaya",
        province: "East Java",
        coordinates: { lat: -7.2575, lng: 112.7521 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Surabaya East Java", "City of Heroes"]
      },
      {
        name: "Bandung",
        province: "West Java",
        coordinates: { lat: -6.9175, lng: 107.6191 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Paris of Java", "Bandung West Java"]
      },
      {
        name: "Yogyakarta",
        province: "DI Yogyakarta",
        coordinates: { lat: -7.7956, lng: 110.3695 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Jogja", "Yogya", "Cultural Capital"]
      },
      {
        name: "Semarang",
        province: "Central Java",
        coordinates: { lat: -6.9667, lng: 110.4167 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Semarang Central Java"]
      },
      {
        name: "Malang",
        province: "East Java",
        coordinates: { lat: -7.9666, lng: 112.6326 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Apple City", "Malang East Java"]
      },
      {
        name: "Bogor",
        province: "West Java",
        coordinates: { lat: -6.5944, lng: 106.7892 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Rain City", "Bogor West Java"]
      }
    ]
  },
  {
    category: "🌊 Lombok & Gili Islands",
    cities: [
      {
        name: "Mataram",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.5833, lng: 116.1167 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Lombok Capital"]
      },
      {
        name: "Senggigi",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.4864, lng: 116.0447 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Senggigi Beach", "Lombok Beach"]
      },
      {
        name: "Gili Trawangan",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.3486, lng: 116.0289 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Gili T", "Party Island"]
      },
      {
        name: "Gili Air",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.3586, lng: 116.0339 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Gili A"]
      },
      {
        name: "Gili Meno",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.3531, lng: 116.0306 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Gili M", "Quiet Island"]
      }
    ]
  },
  {
    category: "🦎 Flores & Komodo",
    cities: [
      {
        name: "Labuan Bajo",
        province: "East Nusa Tenggara",
        coordinates: { lat: -8.4964, lng: 119.8877 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Komodo Gateway", "Flores Airport"]
      },
      {
        name: "Ende",
        province: "East Nusa Tenggara",
        coordinates: { lat: -8.8432, lng: 121.6616 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Ende Flores"]
      },
      {
        name: "Maumere",
        province: "East Nusa Tenggara",
        coordinates: { lat: -8.6167, lng: 122.2167 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Maumere Flores"]
      }
    ]
  },
  {
    category: "🦀 Sumatra - Main Cities",
    cities: [
      {
        name: "Medan",
        province: "North Sumatra",
        coordinates: { lat: 3.5952, lng: 98.6722 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Medan North Sumatra"]
      },
      {
        name: "Palembang",
        province: "South Sumatra",
        coordinates: { lat: -2.9761, lng: 104.7754 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Palembang South Sumatra"]
      },
      {
        name: "Padang",
        province: "West Sumatra",
        coordinates: { lat: -0.9492, lng: 100.3543 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Padang West Sumatra", "Minang"]
      },
      {
        name: "Pekanbaru",
        province: "Riau",
        coordinates: { lat: 0.5333, lng: 101.4500 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Pekanbaru Riau"]
      },
      {
        name: "Bandar Lampung",
        province: "Lampung",
        coordinates: { lat: -5.4292, lng: 105.2610 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Lampung Capital"]
      },
      {
        name: "Lake Toba",
        province: "North Sumatra",
        coordinates: { lat: 2.6845, lng: 98.8756 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Danau Toba", "Toba Lake", "Batak Land"]
      }
    ]
  },
  {
    category: "🐨 Kalimantan - Borneo",
    cities: [
      {
        name: "Banjarmasin",
        province: "South Kalimantan",
        coordinates: { lat: -3.3194, lng: 114.5906 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Banjarmasin South Kalimantan"]
      },
      {
        name: "Balikpapan",
        province: "East Kalimantan",
        coordinates: { lat: -1.2379, lng: 116.8529 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Balikpapan East Kalimantan"]
      },
      {
        name: "Pontianak",
        province: "West Kalimantan",
        coordinates: { lat: -0.0263, lng: 109.3425 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Pontianak West Kalimantan", "Equator City"]
      },
      {
        name: "Palangka Raya",
        province: "Central Kalimantan",
        coordinates: { lat: -2.2136, lng: 113.9209 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Palangka Raya Central Kalimantan"]
      }
    ]
  },
  {
    category: "🏝️ Eastern Indonesia",
    cities: [
      {
        name: "Makassar",
        province: "South Sulawesi",
        coordinates: { lat: -5.1477, lng: 119.4327 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Makassar South Sulawesi", "Ujung Pandang"]
      },
      {
        name: "Manado",
        province: "North Sulawesi",
        coordinates: { lat: 1.4748, lng: 124.8421 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Manado North Sulawesi", "Bunaken Gateway"]
      },
      {
        name: "Jayapura",
        province: "Papua",
        coordinates: { lat: -2.5489, lng: 140.7197 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Jayapura Papua"]
      },
      {
        name: "Ambon",
        province: "Maluku",
        coordinates: { lat: -3.6954, lng: 128.1814 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Ambon Maluku", "Spice Islands"]
      },
      {
        name: "Raja Ampat",
        province: "West Papua",
        coordinates: { lat: -0.2481, lng: 130.5176 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Four Kings", "Diving Paradise"]
      }
    ]
  },
  {
    category: "🏖️ Popular Beach Destinations",
    cities: [
      {
        name: "Bintan Island",
        province: "Riau Islands",
        coordinates: { lat: 1.1377, lng: 104.4553 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Bintan", "Singapore Gateway"]
      },
      {
        name: "Batam",
        province: "Riau Islands",
        coordinates: { lat: 1.1307, lng: 104.0530 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Batam Island"]
      },
      {
        name: "Belitung",
        province: "Bangka Belitung",
        coordinates: { lat: -2.7410, lng: 107.6398 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Belitung Island", "Laskar Pelangi"]
      },
      {
        name: "Karimunjawa",
        province: "Central Java",
        coordinates: { lat: -5.8406, lng: 110.4203 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Karimun Java", "Marine Park"]
      }
    ]
  }
];

// Flatten all cities for easy searching
export const ALL_INDONESIAN_CITIES: CityLocation[] = INDONESIAN_CITIES_CATEGORIZED.flatMap(category => category.cities);

// Get tourist destinations only
export const TOURIST_DESTINATIONS: CityLocation[] = ALL_INDONESIAN_CITIES.filter(city => city.isTouristDestination);

// Get main cities only
export const MAIN_CITIES: CityLocation[] = ALL_INDONESIAN_CITIES.filter(city => city.isMainCity);

/**
 * Find city by name (including aliases)
 */
export function findCityByName(searchName: string): CityLocation | null {
  const normalized = searchName.toLowerCase().trim();
  
  return ALL_INDONESIAN_CITIES.find(city => {
    if (city.name.toLowerCase() === normalized) return true;
    if (city.aliases?.some(alias => alias.toLowerCase() === normalized)) return true;
    return false;
  }) || null;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) * Math.cos(coord2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

/**
 * Find nearest cities to user location
 */
export function findNearestCities(
  userLocation: { lat: number; lng: number },
  maxDistance: number = 50, // km
  limit: number = 5
): CityLocation[] {
  return ALL_INDONESIAN_CITIES
    .map(city => ({
      ...city,
      distance: calculateDistance(userLocation, city.coordinates)
    }))
    .filter(city => city.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ distance, ...city }) => city);
}

/**
 * Match provider location to nearest city
 */
export function matchProviderToCity(
  providerLocation: { lat: number; lng: number },
  maxDistance: number = 25 // km
): CityLocation | null {
  const nearestCities = findNearestCities(providerLocation, maxDistance, 1);
  return nearestCities.length > 0 ? nearestCities[0] : null;
}

/**
 * Find closest Indonesian city by coordinates (for auto-detection)
 */
export function findCityByCoordinates(
  lat: number,
  lng: number,
  maxDistance: number = 50 // km - larger radius for auto-detection
): CityLocation | null {
  return matchProviderToCity({ lat, lng }, maxDistance);
}