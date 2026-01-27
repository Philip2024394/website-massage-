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
  
  // MALAYSIA - Kuala Lumpur
  {
    city: 'Kuala Lumpur',
    province: 'Federal Territory',
    areas: [
      { id: 'kl-bukit-bintang', name: 'Bukit Bintang', nameId: 'Bukit Bintang', popular: true },
      { id: 'kl-klcc', name: 'KLCC', nameId: 'KLCC', popular: true },
      { id: 'kl-bangsar', name: 'Bangsar', nameId: 'Bangsar', popular: true },
      { id: 'kl-mont-kiara', name: 'Mont Kiara', nameId: 'Mont Kiara', popular: true },
      { id: 'kl-chow-kit', name: 'Chow Kit', nameId: 'Chow Kit', popular: false },
      { id: 'kl-sentral', name: 'KL Sentral', nameId: 'KL Sentral', popular: true },
      { id: 'kl-desa-sri-hartamas', name: 'Desa Sri Hartamas', nameId: 'Desa Sri Hartamas', popular: false },
    ],
  },
  
  // MALAYSIA - Penang
  {
    city: 'Penang',
    province: 'Penang',
    areas: [
      { id: 'penang-georgetown', name: 'Georgetown', nameId: 'Georgetown', popular: true },
      { id: 'penang-batu-ferringhi', name: 'Batu Ferringhi', nameId: 'Batu Ferringhi', popular: true },
      { id: 'penang-gurney-drive', name: 'Gurney Drive', nameId: 'Gurney Drive', popular: true },
      { id: 'penang-tanjung-bungah', name: 'Tanjung Bungah', nameId: 'Tanjung Bungah', popular: true },
      { id: 'penang-teluk-bahang', name: 'Teluk Bahang', nameId: 'Teluk Bahang', popular: false },
    ],
  },
  
  // MALAYSIA - Johor Bahru
  {
    city: 'Johor Bahru',
    province: 'Johor',
    areas: [
      { id: 'jb-city-center', name: 'City Center', nameId: 'City Center', popular: true },
      { id: 'jb-danga-bay', name: 'Danga Bay', nameId: 'Danga Bay', popular: true },
      { id: 'jb-austin-heights', name: 'Austin Heights', nameId: 'Austin Heights', popular: false },
      { id: 'jb-mount-austin', name: 'Mount Austin', nameId: 'Mount Austin', popular: true },
      { id: 'jb-nusa-bestari', name: 'Nusa Bestari', nameId: 'Nusa Bestari', popular: false },
    ],
  },
  
  // THAILAND - Bangkok
  {
    city: 'Bangkok',
    province: 'Bangkok',
    areas: [
      { id: 'bangkok-sukhumvit', name: 'Sukhumvit', nameId: 'Sukhumvit', popular: true },
      { id: 'bangkok-silom', name: 'Silom', nameId: 'Silom', popular: true },
      { id: 'bangkok-sathorn', name: 'Sathorn', nameId: 'Sathorn', popular: true },
      { id: 'bangkok-thonglor', name: 'Thonglor', nameId: 'Thonglor', popular: true },
      { id: 'bangkok-ekkamai', name: 'Ekkamai', nameId: 'Ekkamai', popular: true },
      { id: 'bangkok-phrom-phong', name: 'Phrom Phong', nameId: 'Phrom Phong', popular: true },
      { id: 'bangkok-asoke', name: 'Asoke', nameId: 'Asoke', popular: true },
      { id: 'bangkok-nana', name: 'Nana', nameId: 'Nana', popular: false },
      { id: 'bangkok-siam', name: 'Siam', nameId: 'Siam', popular: true },
      { id: 'bangkok-riverside', name: 'Riverside', nameId: 'Riverside', popular: false },
    ],
  },
  
  // THAILAND - Phuket
  {
    city: 'Phuket',
    province: 'Phuket',
    areas: [
      { id: 'phuket-patong', name: 'Patong', nameId: 'Patong', popular: true },
      { id: 'phuket-kata', name: 'Kata', nameId: 'Kata', popular: true },
      { id: 'phuket-karon', name: 'Karon', nameId: 'Karon', popular: true },
      { id: 'phuket-kamala', name: 'Kamala', nameId: 'Kamala', popular: true },
      { id: 'phuket-bang-tao', name: 'Bang Tao', nameId: 'Bang Tao', popular: true },
      { id: 'phuket-surin', name: 'Surin', nameId: 'Surin', popular: false },
      { id: 'phuket-rawai', name: 'Rawai', nameId: 'Rawai', popular: false },
      { id: 'phuket-chalong', name: 'Chalong', nameId: 'Chalong', popular: false },
    ],
  },
  
  // THAILAND - Chiang Mai
  {
    city: 'Chiang Mai',
    province: 'Chiang Mai',
    areas: [
      { id: 'chiangmai-old-city', name: 'Old City', nameId: 'Old City', popular: true },
      { id: 'chiangmai-nimman', name: 'Nimman', nameId: 'Nimman', popular: true },
      { id: 'chiangmai-riverside', name: 'Riverside', nameId: 'Riverside', popular: true },
      { id: 'chiangmai-santitham', name: 'Santitham', nameId: 'Santitham', popular: false },
      { id: 'chiangmai-mae-rim', name: 'Mae Rim', nameId: 'Mae Rim', popular: false },
    ],
  },
  
  // THAILAND - Pattaya
  {
    city: 'Pattaya',
    province: 'Chonburi',
    areas: [
      { id: 'pattaya-central', name: 'Central Pattaya', nameId: 'Central Pattaya', popular: true },
      { id: 'pattaya-north', name: 'North Pattaya', nameId: 'North Pattaya', popular: true },
      { id: 'pattaya-south', name: 'South Pattaya', nameId: 'South Pattaya', popular: true },
      { id: 'pattaya-jomtien', name: 'Jomtien', nameId: 'Jomtien', popular: true },
      { id: 'pattaya-naklua', name: 'Naklua', nameId: 'Naklua', popular: false },
      { id: 'pattaya-pratumnak', name: 'Pratumnak Hill', nameId: 'Pratumnak Hill', popular: true },
    ],
  },
  
  // PHILIPPINES - Manila
  {
    city: 'Manila',
    province: 'Metro Manila',
    areas: [
      { id: 'manila-makati', name: 'Makati', nameId: 'Makati', popular: true },
      { id: 'manila-bgc', name: 'Bonifacio Global City (BGC)', nameId: 'BGC', popular: true },
      { id: 'manila-ortigas', name: 'Ortigas', nameId: 'Ortigas', popular: true },
      { id: 'manila-quezon-city', name: 'Quezon City', nameId: 'Quezon City', popular: true },
      { id: 'manila-malate', name: 'Malate', nameId: 'Malate', popular: true },
      { id: 'manila-ermita', name: 'Ermita', nameId: 'Ermita', popular: false },
      { id: 'manila-pasay', name: 'Pasay', nameId: 'Pasay', popular: false },
      { id: 'manila-manila-bay', name: 'Manila Bay', nameId: 'Manila Bay', popular: true },
    ],
  },
  
  // PHILIPPINES - Cebu
  {
    city: 'Cebu',
    province: 'Cebu',
    areas: [
      { id: 'cebu-city-center', name: 'Cebu City Center', nameId: 'Cebu City Center', popular: true },
      { id: 'cebu-it-park', name: 'IT Park', nameId: 'IT Park', popular: true },
      { id: 'cebu-lahug', name: 'Lahug', nameId: 'Lahug', popular: true },
      { id: 'cebu-mactan', name: 'Mactan', nameId: 'Mactan', popular: true },
      { id: 'cebu-mandaue', name: 'Mandaue', nameId: 'Mandaue', popular: false },
      { id: 'cebu-banilad', name: 'Banilad', nameId: 'Banilad', popular: false },
    ],
  },
  
  // PHILIPPINES - Boracay
  {
    city: 'Boracay',
    province: 'Aklan',
    areas: [
      { id: 'boracay-station-1', name: 'Station 1', nameId: 'Station 1', popular: true },
      { id: 'boracay-station-2', name: 'Station 2', nameId: 'Station 2', popular: true },
      { id: 'boracay-station-3', name: 'Station 3', nameId: 'Station 3', popular: true },
      { id: 'boracay-bulabog', name: 'Bulabog Beach', nameId: 'Bulabog Beach', popular: true },
      { id: 'boracay-diniwid', name: 'Diniwid', nameId: 'Diniwid', popular: false },
    ],
  },
  
  // VIETNAM - Ho Chi Minh City
  {
    city: 'Ho Chi Minh City',
    province: 'Ho Chi Minh',
    areas: [
      { id: 'hcmc-district-1', name: 'District 1', nameId: 'Quận 1', popular: true },
      { id: 'hcmc-district-2', name: 'District 2', nameId: 'Quận 2', popular: true },
      { id: 'hcmc-district-3', name: 'District 3', nameId: 'Quận 3', popular: true },
      { id: 'hcmc-phu-my-hung', name: 'Phu My Hung', nameId: 'Phú Mỹ Hưng', popular: true },
      { id: 'hcmc-thao-dien', name: 'Thao Dien', nameId: 'Thảo Điền', popular: true },
      { id: 'hcmc-binh-thanh', name: 'Binh Thanh', nameId: 'Bình Thạnh', popular: false },
      { id: 'hcmc-district-7', name: 'District 7', nameId: 'Quận 7', popular: true },
    ],
  },
  
  // VIETNAM - Hanoi
  {
    city: 'Hanoi',
    province: 'Hanoi',
    areas: [
      { id: 'hanoi-old-quarter', name: 'Old Quarter', nameId: 'Phố Cổ', popular: true },
      { id: 'hanoi-hoan-kiem', name: 'Hoan Kiem', nameId: 'Hoàn Kiếm', popular: true },
      { id: 'hanoi-tay-ho', name: 'Tay Ho', nameId: 'Tây Hồ', popular: true },
      { id: 'hanoi-ba-dinh', name: 'Ba Dinh', nameId: 'Ba Đình', popular: true },
      { id: 'hanoi-cau-giay', name: 'Cau Giay', nameId: 'Cầu Giấy', popular: false },
      { id: 'hanoi-dong-da', name: 'Dong Da', nameId: 'Đống Đa', popular: false },
    ],
  },
  
  // VIETNAM - Da Nang
  {
    city: 'Da Nang',
    province: 'Da Nang',
    areas: [
      { id: 'danang-my-khe', name: 'My Khe Beach', nameId: 'Bãi Biển Mỹ Khê', popular: true },
      { id: 'danang-son-tra', name: 'Son Tra', nameId: 'Sơn Trà', popular: true },
      { id: 'danang-hai-chau', name: 'Hai Chau', nameId: 'Hải Châu', popular: true },
      { id: 'danang-ngu-hanh-son', name: 'Ngu Hanh Son', nameId: 'Ngũ Hành Sơn', popular: true },
      { id: 'danang-thanh-khe', name: 'Thanh Khe', nameId: 'Thanh Khê', popular: false },
    ],
  },
  
  // VIETNAM - Nha Trang
  {
    city: 'Nha Trang',
    province: 'Khanh Hoa',
    areas: [
      { id: 'nhatrang-city-center', name: 'City Center', nameId: 'Trung Tâm', popular: true },
      { id: 'nhatrang-beach-area', name: 'Beach Area', nameId: 'Khu Bãi Biển', popular: true },
      { id: 'nhatrang-biet-thu', name: 'Biet Thu', nameId: 'Biệt Thự', popular: true },
      { id: 'nhatrang-vinh-nguyen', name: 'Vinh Nguyen', nameId: 'Vĩnh Nguyên', popular: false },
      { id: 'nhatrang-loc-tho', name: 'Loc Tho', nameId: 'Lộc Thọ', popular: false },
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
