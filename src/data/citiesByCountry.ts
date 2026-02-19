/**
 * Cities by country – single source for dashboard city dropdown and landing.
 * Each country has its own city list. Therapist, facial, and massage-place dashboards
 * use this so their city dropdown matches the main app / home page filter – location
 * match: providers appear when the user selects the same city.
 */

import { ALL_INDONESIAN_CITIES, type CityLocation } from './indonesianCities';

export interface CityOptionForCountry {
  locationId: string;
  name: string;
}

/** locationId for non-ID cities: match convertLocationStringToId (lowercase trim) */
function toLocationId(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Cities for non-Indonesia countries (same lists as MainLandingPage CITIES_BY_COUNTRY).
 * Each city's locationId = name.toLowerCase().trim() to match landing persistence.
 */
const CITIES_NON_ID: Record<string, Array<{ name: string }>> = {
  MY: [
    { name: 'Kuala Lumpur' }, { name: 'KLCC' }, { name: 'Bukit Bintang' }, { name: 'George Town' },
    { name: 'Johor Bahru' }, { name: 'Petaling Jaya' }, { name: 'Shah Alam' }, { name: 'Ipoh' },
    { name: 'Malacca City' }, { name: 'Kota Kinabalu' }, { name: 'Kuching' }, { name: 'Putrajaya' },
    { name: 'Cyberjaya' }, { name: 'Seremban' }, { name: 'Kuantan' }, { name: 'Kota Bharu' },
    { name: 'Alor Setar' }, { name: 'Kangar' }, { name: 'Subang Jaya' }, { name: 'Nilai' },
  ],
  SG: [
    { name: 'Singapore' }, { name: 'Marina Bay' }, { name: 'Orchard Road' }, { name: 'Chinatown' },
    { name: 'Sentosa' }, { name: 'Clarke Quay' }, { name: 'Bugis' }, { name: 'Raffles Place' },
    { name: 'Tampines' }, { name: 'Jurong East' }, { name: 'Little India' }, { name: 'Holland Village' },
    { name: 'Changi' }, { name: 'Tanglin' }, { name: 'Katong' },
  ],
  TH: [
    { name: 'Bangkok' }, { name: 'Sukhumvit' }, { name: 'Silom' }, { name: 'Siam' },
    { name: 'Phuket' }, { name: 'Patong' }, { name: 'Chiang Mai' }, { name: 'Pattaya' },
    { name: 'Krabi' }, { name: 'Koh Samui' }, { name: 'Hua Hin' }, { name: 'Chiang Rai' },
    { name: 'Koh Phangan' }, { name: 'Koh Tao' }, { name: 'Khao Lak' }, { name: 'Ayutthaya' },
    { name: 'Rayong' }, { name: 'Udon Thani' }, { name: 'Nakhon Ratchasima' }, { name: 'Surat Thani' },
  ],
  PH: [
    { name: 'Manila' }, { name: 'Makati' }, { name: 'Quezon City' }, { name: 'Pasig' },
    { name: 'Taguig (BGC)' }, { name: 'Cebu City' }, { name: 'Boracay' }, { name: 'Davao City' },
    { name: 'Puerto Princesa' }, { name: 'Baguio' }, { name: 'Iloilo City' }, { name: 'Mandaue' },
    { name: 'Lapu-Lapu' }, { name: 'Cagayan de Oro' }, { name: 'Bacolod' }, { name: 'Zamboanga City' },
    { name: 'Tagaytay' }, { name: 'Angeles City' }, { name: 'Naga' }, { name: 'Legazpi' },
    { name: 'Vigan' }, { name: 'Dumaguete' },
  ],
  VN: [
    { name: 'Ho Chi Minh City' }, { name: 'District 1' }, { name: 'District 3' }, { name: 'Hanoi' },
    { name: 'Old Quarter' }, { name: 'Da Nang' }, { name: 'Hoi An' }, { name: 'Nha Trang' },
    { name: 'Vung Tau' }, { name: 'Dalat' }, { name: 'Hue' }, { name: 'Can Tho' },
    { name: 'Hai Phong' }, { name: 'Phu Quoc' }, { name: 'Mui Ne' }, { name: 'Ninh Binh' },
    { name: 'Sapa' }, { name: 'Ha Long' },
  ],
  GB: [
    { name: 'London' }, { name: 'Westminster' }, { name: 'Camden' }, { name: 'Kensington' },
    { name: 'Shoreditch' }, { name: 'Canary Wharf' }, { name: 'Manchester' }, { name: 'Birmingham' },
    { name: 'Liverpool' }, { name: 'Leeds' }, { name: 'Glasgow' }, { name: 'Edinburgh' },
    { name: 'Bristol' }, { name: 'Newcastle' }, { name: 'Cardiff' }, { name: 'Brighton' },
    { name: 'Oxford' }, { name: 'Cambridge' }, { name: 'Nottingham' }, { name: 'Sheffield' },
    { name: 'Southampton' }, { name: 'Plymouth' }, { name: 'Leicester' }, { name: 'Coventry' },
    { name: 'Hull' }, { name: 'Aberdeen' }, { name: 'Belfast' }, { name: 'York' },
    { name: 'Bath' }, { name: 'Norwich' }, { name: 'Chester' }, { name: 'Inverness' },
  ],
  US: [
    { name: 'New York City' }, { name: 'Manhattan' }, { name: 'Brooklyn' }, { name: 'Queens' },
    { name: 'Los Angeles' }, { name: 'Hollywood' }, { name: 'Santa Monica' }, { name: 'Beverly Hills' },
    { name: 'Chicago' }, { name: 'Houston' }, { name: 'Phoenix' }, { name: 'Philadelphia' },
    { name: 'San Antonio' }, { name: 'San Diego' }, { name: 'Dallas' }, { name: 'San Francisco' },
    { name: 'Austin' }, { name: 'Seattle' }, { name: 'Denver' }, { name: 'Washington DC' },
    { name: 'Boston' }, { name: 'Las Vegas' }, { name: 'Miami' }, { name: 'Orlando' },
    { name: 'Atlanta' }, { name: 'Portland' }, { name: 'Nashville' }, { name: 'New Orleans' },
    { name: 'San Jose' }, { name: 'Detroit' }, { name: 'Minneapolis' }, { name: 'Tampa' },
    { name: 'Sacramento' }, { name: 'Charlotte' }, { name: 'Indianapolis' }, { name: 'Columbus' },
    { name: 'Jacksonville' }, { name: 'Memphis' }, { name: 'Kansas City' }, { name: 'Salt Lake City' },
    { name: 'Raleigh' }, { name: 'Milwaukee' }, { name: 'Cleveland' },
  ],
  AU: [
    { name: 'Sydney' }, { name: 'CBD Sydney' }, { name: 'Bondi' }, { name: 'Manly' },
    { name: 'Parramatta' }, { name: 'Melbourne' }, { name: 'CBD Melbourne' }, { name: 'St Kilda' },
    { name: 'Fitzroy' }, { name: 'Brisbane' }, { name: 'Gold Coast' }, { name: 'Perth' },
    { name: 'Adelaide' }, { name: 'Canberra' }, { name: 'Hobart' }, { name: 'Darwin' },
    { name: 'Cairns' }, { name: 'Newcastle' }, { name: 'Wollongong' }, { name: 'Geelong' },
    { name: 'Sunshine Coast' }, { name: 'Townsville' }, { name: 'Ballarat' }, { name: 'Bendigo' },
    { name: 'Launceston' }, { name: 'Alice Springs' }, { name: 'Coffs Harbour' }, { name: 'Byron Bay' },
  ],
  DE: [
    { name: 'Berlin' }, { name: 'Mitte' }, { name: 'Kreuzberg' }, { name: 'Friedrichshain' },
    { name: 'Charlottenburg' }, { name: 'Munich' }, { name: 'Hamburg' }, { name: 'Frankfurt' },
    { name: 'Cologne' }, { name: 'Stuttgart' }, { name: 'Düsseldorf' }, { name: 'Dortmund' },
    { name: 'Essen' }, { name: 'Leipzig' }, { name: 'Dresden' }, { name: 'Hanover' },
    { name: 'Nuremberg' }, { name: 'Bremen' }, { name: 'Heidelberg' }, { name: 'Freiburg' },
    { name: 'Münster' }, { name: 'Aachen' }, { name: 'Bonn' }, { name: 'Mainz' },
    { name: 'Mannheim' }, { name: 'Karlsruhe' }, { name: 'Würzburg' }, { name: 'Regensburg' },
    { name: 'Kiel' }, { name: 'Lübeck' },
  ],
};

/**
 * Returns cities for the given country code for use in dashboard (and any consumer that needs the same list).
 * - ID: uses ALL_INDONESIAN_CITIES (locationId from indonesianCities).
 * - Other countries: same city names as landing; locationId = name.toLowerCase().trim() to match convertLocationStringToId.
 */
export function getCitiesForCountry(countryCode: string): CityOptionForCountry[] {
  const code = (countryCode || 'ID').toUpperCase();
  if (code === 'ID') {
    return ALL_INDONESIAN_CITIES.map((c: CityLocation) => ({
      locationId: c.locationId,
      name: c.name,
    }));
  }
  const list = CITIES_NON_ID[code];
  if (!list || list.length === 0) return [];
  return list.map(({ name }) => ({
    locationId: toLocationId(name),
    name,
  }));
}

/** Country codes that have city lists defined (for dropdown fallback / labels). */
export const SUPPORTED_COUNTRY_CODES = ['ID', 'MY', 'SG', 'TH', 'PH', 'VN', 'GB', 'US', 'AU', 'DE'] as const;
