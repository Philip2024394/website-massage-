/**
 * Service Area Definitions - City → Service Area Model
 * 
 * Architecture:
 * - Country: Indonesia (default, no selector exposed)
 * - Therapists select one primary city and one or more service areas (required)
 * - Therapists optionally set maximum travel distance
 * - Users select city first (required), then optionally filter by area
 * - No GPS/IP/Maps auto-expansion of service areas
 * - Manual selection only - Location Authority Rule enforced
 */

export interface ServiceArea {
  id: string;
  name: string;
  nameId: string; // Indonesian name
  description?: string;
  popular?: boolean;
}

export interface CityServiceAreas {
  city: string;
  province?: string; // For display purposes
  areas: ServiceArea[];
}

// MASTER DATASET: Indonesian Cities & Service Areas
// Based on MASTER VS CODE PROMPT — LOCATION + AREA SYSTEM
export const SERVICE_AREAS: CityServiceAreas[] = [
  // DKI Jakarta
  {
    city: 'Jakarta',
    province: 'DKI Jakarta',
    areas: [
      // Jakarta Selatan
      { id: 'jakarta-kemang', name: 'Kemang', nameId: 'Kemang', popular: true },
      { id: 'jakarta-senopati', name: 'Senopati', nameId: 'Senopati', popular: true },
      { id: 'jakarta-blok-m', name: 'Blok M', nameId: 'Blok M', popular: true },
      { id: 'jakarta-cilandak', name: 'Cilandak', nameId: 'Cilandak', popular: true },
      
      // Jakarta Pusat
      { id: 'jakarta-menteng', name: 'Menteng', nameId: 'Menteng', popular: true },
      { id: 'jakarta-tanah-abang', name: 'Tanah Abang', nameId: 'Tanah Abang', popular: false },
      
      // Jakarta Barat
      { id: 'jakarta-kebon-jeruk', name: 'Kebon Jeruk', nameId: 'Kebon Jeruk', popular: false },
      { id: 'jakarta-puri', name: 'Puri', nameId: 'Puri', popular: true },
      
      // Jakarta Utara
      { id: 'jakarta-kelapa-gading', name: 'Kelapa Gading', nameId: 'Kelapa Gading', popular: true },
      { id: 'jakarta-pluit', name: 'Pluit', nameId: 'Pluit', popular: false },
      
      // Jakarta Timur
      { id: 'jakarta-cibubur', name: 'Cibubur', nameId: 'Cibubur', popular: false },
      { id: 'jakarta-rawamangun', name: 'Rawamangun', nameId: 'Rawamangun', popular: false },
    ],
  },
  
  // Bali - Canggu
  {
    city: 'Canggu',
    province: 'Bali',
    areas: [
      { id: 'canggu-beach', name: 'Canggu Beach', nameId: 'Pantai Canggu', popular: true },
      { id: 'canggu-berawa', name: 'Berawa', nameId: 'Berawa', popular: true },
      { id: 'canggu-echo-beach', name: 'Echo Beach', nameId: 'Echo Beach', popular: true },
      { id: 'canggu-pererenan', name: 'Pererenan', nameId: 'Pererenan', popular: true },
      { id: 'canggu-batu-bolong', name: 'Batu Bolong', nameId: 'Batu Bolong', popular: true },
    ],
  },
  
  // Bali - Seminyak
  {
    city: 'Seminyak',
    province: 'Bali',
    areas: [
      { id: 'seminyak-center', name: 'Seminyak Center', nameId: 'Seminyak Tengah', popular: true },
      { id: 'seminyak-beach', name: 'Seminyak Beach', nameId: 'Pantai Seminyak', popular: true },
      { id: 'seminyak-petitenget', name: 'Petitenget', nameId: 'Petitenget', popular: true },
      { id: 'seminyak-oberoi', name: 'Oberoi', nameId: 'Oberoi', popular: true },
      { id: 'seminyak-double-six', name: 'Double Six', nameId: 'Double Six', popular: false },
    ],
  },
  
  // Bali - Kuta
  {
    city: 'Kuta',
    province: 'Bali',
    areas: [
      { id: 'kuta-beach', name: 'Kuta Beach', nameId: 'Pantai Kuta', popular: true },
      { id: 'kuta-legian', name: 'Legian', nameId: 'Legian', popular: true },
      { id: 'kuta-tuban', name: 'Tuban', nameId: 'Tuban', popular: false },
      { id: 'kuta-airport-area', name: 'Airport Area', nameId: 'Area Bandara', popular: true },
    ],
  },
  
  // Bali - Ubud
  {
    city: 'Ubud',
    province: 'Bali',
    areas: [
      { id: 'ubud-center', name: 'Ubud Center', nameId: 'Ubud Pusat', popular: true },
      { id: 'ubud-tegallalang', name: 'Tegallalang', nameId: 'Tegallalang', popular: true },
      { id: 'ubud-monkey-forest', name: 'Monkey Forest', nameId: 'Hutan Monyet', popular: true },
      { id: 'ubud-campuhan', name: 'Campuhan', nameId: 'Campuhan', popular: false },
      { id: 'ubud-payangan', name: 'Payangan', nameId: 'Payangan', popular: false },
    ],
  },
  
  // Bali - Sanur
  {
    city: 'Sanur',
    province: 'Bali',
    areas: [
      { id: 'sanur-beach', name: 'Sanur Beach', nameId: 'Pantai Sanur', popular: true },
      { id: 'sanur-center', name: 'Sanur Center', nameId: 'Sanur Pusat', popular: true },
      { id: 'sanur-north', name: 'North Sanur', nameId: 'Sanur Utara', popular: false },
      { id: 'sanur-bypass', name: 'Bypass Sanur', nameId: 'Bypass Sanur', popular: false },
    ],
  },
  
  // Bali - Nusa Dua
  {
    city: 'Nusa Dua',
    province: 'Bali',
    areas: [
      { id: 'nusa-dua-resort', name: 'Resort Complex', nameId: 'Kompleks Resor', popular: true },
      { id: 'nusa-dua-btdc', name: 'BTDC Area', nameId: 'Area BTDC', popular: true },
      { id: 'nusa-dua-sawangan', name: 'Sawangan', nameId: 'Sawangan', popular: false },
      { id: 'nusa-dua-benoa', name: 'Benoa', nameId: 'Benoa', popular: false },
    ],
  },
  
  // Bali - Jimbaran
  {
    city: 'Jimbaran',
    province: 'Bali',
    areas: [
      { id: 'jimbaran-beach', name: 'Jimbaran Beach', nameId: 'Pantai Jimbaran', popular: true },
      { id: 'jimbaran-center', name: 'Jimbaran Center', nameId: 'Jimbaran Pusat', popular: true },
      { id: 'jimbaran-kedonganan', name: 'Kedonganan', nameId: 'Kedonganan', popular: true },
      { id: 'jimbaran-uluwatu-road', name: 'Uluwatu Road', nameId: 'Jalan Uluwatu', popular: false },
    ],
  },
  
  // Bali - Denpasar
  {
    city: 'Denpasar',
    province: 'Bali',
    areas: [
      { id: 'denpasar-center', name: 'Denpasar Center', nameId: 'Denpasar Pusat', popular: true },
      { id: 'denpasar-renon', name: 'Renon', nameId: 'Renon', popular: true },
      { id: 'denpasar-sanglah', name: 'Sanglah', nameId: 'Sanglah', popular: false },
      { id: 'denpasar-sesetan', name: 'Sesetan', nameId: 'Sesetan', popular: false },
    ],
  },
  
  // DI Yogyakarta
  {
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    areas: [
      { id: 'yogya-sleman', name: 'Sleman', nameId: 'Sleman', popular: true },
      { id: 'yogya-kota', name: 'Kota Yogyakarta', nameId: 'Kota Yogyakarta', popular: true },
      { id: 'yogya-bantul', name: 'Bantul', nameId: 'Bantul', popular: false },
      { id: 'yogya-malioboro', name: 'Malioboro', nameId: 'Malioboro', popular: true },
      { id: 'yogya-prawirotaman', name: 'Prawirotaman', nameId: 'Prawirotaman', popular: true },
    ],
  },
  
  // Bandung (West Java)
  {
    city: 'Bandung',
    province: 'West Java',
    areas: [
      { id: 'bandung-dago', name: 'Dago', nameId: 'Dago', popular: true },
      { id: 'bandung-setiabudi', name: 'Setiabudi', nameId: 'Setiabudi', popular: true },
      { id: 'bandung-pasteur', name: 'Pasteur', nameId: 'Pasteur', popular: true },
      { id: 'bandung-antapani', name: 'Antapani', nameId: 'Antapani', popular: false },
      { id: 'bandung-cihampelas', name: 'Cihampelas', nameId: 'Cihampelas', popular: true },
    ],
  },
  
  // Surabaya (East Java)
  {
    city: 'Surabaya',
    province: 'East Java',
    areas: [
      { id: 'surabaya-barat', name: 'Surabaya Barat', nameId: 'Surabaya Barat', popular: true },
      { id: 'surabaya-timur', name: 'Surabaya Timur', nameId: 'Surabaya Timur', popular: true },
      { id: 'surabaya-selatan', name: 'Surabaya Selatan', nameId: 'Surabaya Selatan', popular: true },
      { id: 'surabaya-pusat', name: 'Surabaya Pusat', nameId: 'Surabaya Pusat', popular: true },
      { id: 'surabaya-gubeng', name: 'Gubeng', nameId: 'Gubeng', popular: false },
    ],
  },
  
  // Medan
  {
    city: 'Medan',
    province: 'North Sumatra',
    areas: [
      { id: 'medan-baru', name: 'Medan Baru', nameId: 'Medan Baru', popular: true },
      { id: 'medan-petisah', name: 'Medan Petisah', nameId: 'Medan Petisah', popular: true },
      { id: 'medan-johor', name: 'Medan Johor', nameId: 'Medan Johor', popular: true },
      { id: 'medan-polonia', name: 'Polonia', nameId: 'Polonia', popular: false },
    ],
  },
  
  // Makassar
  {
    city: 'Makassar',
    province: 'South Sulawesi',
    areas: [
      { id: 'makassar-panakkukang', name: 'Panakkukang', nameId: 'Panakkukang', popular: true },
      { id: 'makassar-tamalate', name: 'Tamalate', nameId: 'Tamalate', popular: true },
      { id: 'makassar-rappocini', name: 'Rappocini', nameId: 'Rappocini', popular: true },
      { id: 'makassar-mamajang', name: 'Mamajang', nameId: 'Mamajang', popular: false },
    ],
  },
  
  // Batam
  {
    city: 'Batam',
    province: 'Riau Islands',
    areas: [
      { id: 'batam-nagoya', name: 'Nagoya', nameId: 'Nagoya', popular: true },
      { id: 'batam-batu-ampar', name: 'Batu Ampar', nameId: 'Batu Ampar', popular: true },
      { id: 'batam-bengkong', name: 'Bengkong', nameId: 'Bengkong', popular: true },
      { id: 'batam-harbor-bay', name: 'Harbor Bay', nameId: 'Harbor Bay', popular: false },
    ],
  },
];

// Helper functions
export const getServiceAreasForCity = (city: string): ServiceArea[] => {
  const cityData = SERVICE_AREAS.find(c => c.city === city);
  return cityData?.areas || [];
};

export const getPopularAreasForCity = (city: string): ServiceArea[] => {
  const areas = getServiceAreasForCity(city);
  return areas.filter(area => area.popular);
};

export const getAreaById = (areaId: string): ServiceArea | undefined => {
  for (const cityData of SERVICE_AREAS) {
    const area = cityData.areas.find(a => a.id === areaId);
    if (area) return area;
  }
  return undefined;
};

export const getCityForArea = (areaId: string): string | undefined => {
  for (const cityData of SERVICE_AREAS) {
    if (cityData.areas.some(a => a.id === areaId)) {
      return cityData.city;
    }
  }
  return undefined;
};
