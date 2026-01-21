/**
 * Indonesian Cities and Tourist Destinations
 * Organized by major islands and regions for location-based matching
 */

export interface CityLocation {
  name: string;
  locationId: string; // Canonical ID for filtering (e.g., 'yogyakarta', 'bandung', 'denpasar')
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
    category: "🏝️ Bali",
    cities: [
      {
        name: "Denpasar",
        locationId: "denpasar",
        province: "Bali",
        coordinates: { lat: -8.6705, lng: 115.2126 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Denpasar Bali", "Bali Capital"]
      },
      {
        name: "Ubud",
        locationId: "ubud",
        province: "Bali",
        coordinates: { lat: -8.5069, lng: 115.2625 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Ubud Bali", "Cultural Center Bali"]
      },
      {
        name: "Canggu",
        locationId: "canggu",
        province: "Bali",
        coordinates: { lat: -8.6482, lng: 115.1436 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Canggu Beach", "Surf Bali"]
      },
      {
        name: "Seminyak",
        locationId: "seminyak",
        province: "Bali",
        coordinates: { lat: -8.6953, lng: 115.1668 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Seminyak Beach", "Luxury Bali"]
      },
      {
        name: "Kuta",
        locationId: "kuta",
        province: "Bali",
        coordinates: { lat: -8.7205, lng: 115.1693 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Kuta Beach", "Airport Bali"]
      },
      {
        name: "Sanur",
        locationId: "sanur",
        province: "Bali",
        coordinates: { lat: -8.6882, lng: 115.2613 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Sanur Beach", "Sunrise Beach Bali"]
      },
      {
        name: "Nusa Dua",
        locationId: "nusa-dua",
        province: "Bali",
        coordinates: { lat: -8.7968, lng: 115.2285 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Resort Area Bali", "Luxury Hotels Bali"]
      },
      {
        name: "Jimbaran",
        locationId: "jimbaran",
        province: "Bali",
        coordinates: { lat: -8.7679, lng: 115.1668 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Jimbaran Beach", "Seafood Bali"]
      }
    ]
  },
  {
    category: "🌋 Java",
    cities: [
      {
        name: "Jakarta Pusat",
        locationId: "jakarta-pusat",
        province: "DKI Jakarta",
        coordinates: { lat: -6.1862, lng: 106.8341 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Central Jakarta", "Jakarta Central"]
      },
      {
        name: "Jakarta Barat",
        locationId: "jakarta-barat",
        province: "DKI Jakarta",
        coordinates: { lat: -6.1675, lng: 106.7600 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["West Jakarta", "Jakarta West"]
      },
      {
        name: "Jakarta Selatan",
        locationId: "jakarta-selatan",
        province: "DKI Jakarta",
        coordinates: { lat: -6.2615, lng: 106.8106 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["South Jakarta", "Jakarta South"]
      },
      {
        name: "Jakarta Timur",
        locationId: "jakarta-timur",
        province: "DKI Jakarta",
        coordinates: { lat: -6.2250, lng: 106.9000 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["East Jakarta", "Jakarta East"]
      },
      {
        name: "Jakarta Utara",
        locationId: "jakarta-utara",
        province: "DKI Jakarta",
        coordinates: { lat: -6.1385, lng: 106.8827 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["North Jakarta", "Jakarta North"]
      },
      {
        name: "Jakarta",
        locationId: "jakarta",
        province: "DKI Jakarta",
        coordinates: { lat: -6.2088, lng: 106.8456 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Jakarta Capital", "DKI Jakarta", "Betawi"]
      },
      {
        name: "Surabaya",
        locationId: "surabaya",
        province: "East Java",
        coordinates: { lat: -7.2575, lng: 112.7521 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Surabaya East Java", "City of Heroes"]
      },
      {
        name: "Bandung",
        locationId: "bandung",
        province: "West Java",
        coordinates: { lat: -6.9175, lng: 107.6191 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Paris of Java", "Bandung West Java"]
      },
      {
        name: "Yogyakarta",
        locationId: "yogyakarta",
        province: "DI Yogyakarta",
        coordinates: { lat: -7.7956, lng: 110.3695 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Jogja", "Yogya", "Cultural Capital"]
      },
      {
        name: "Semarang",
        locationId: "semarang",
        province: "Central Java",
        coordinates: { lat: -6.9667, lng: 110.4167 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Semarang Central Java"]
      },
      {
        name: "Solo",
        locationId: "solo",
        province: "Central Java",
        coordinates: { lat: -7.5755, lng: 110.8243 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Surakarta", "Solo Surakarta", "Solo Central Java"]
      },
      {
        name: "Malang",
        locationId: "malang",
        province: "East Java",
        coordinates: { lat: -7.9666, lng: 112.6326 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Apple City", "Malang East Java"]
      },
      {
        name: "Bekasi",
        locationId: "bekasi",
        province: "West Java",
        coordinates: { lat: -6.2349, lng: 106.9896 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Bekasi West Java", "Bekasi City"]
      },
      {
        name: "Depok",
        locationId: "depok",
        province: "West Java",
        coordinates: { lat: -6.4025, lng: 106.7942 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Depok West Java", "Depok City"]
      },
      {
        name: "Bogor",
        locationId: "bogor",
        province: "West Java",
        coordinates: { lat: -6.5944, lng: 106.7892 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Rain City", "Bogor West Java"]
      },
      {
        name: "Banyuwangi",
        locationId: "banyuwangi",
        province: "East Java",
        coordinates: { lat: -8.2191, lng: 114.3689 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Ijen", "Gateway to Bali", "Sunrise Java", "Blue Fire"]
      },
      {
        name: "Bromo Area",
        locationId: "bromo-area",
        province: "East Java",
        coordinates: { lat: -7.9425, lng: 112.9531 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Mount Bromo", "Bromo Tengger Semeru", "Probolinggo"]
      },
      {
        name: "Karimunjawa",
        locationId: "karimunjawa",
        province: "Central Java",
        coordinates: { lat: -5.8406, lng: 110.4203 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Karimun Java", "Marine Park", "Island Paradise"]
      }
    ]
  },
  {
    category: "🌊 Lombok & Gili",
    cities: [
      {
        name: "Mataram",
        locationId: "mataram",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.5833, lng: 116.1167 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Lombok Capital"]
      },
      {
        name: "Senggigi",
        locationId: "senggigi",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.4864, lng: 116.0447 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Senggigi Beach", "Lombok Beach"]
      },
      {
        name: "Gili Trawangan",
        locationId: "gili-trawangan",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.3486, lng: 116.0289 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Gili T", "Party Island"]
      },
      {
        name: "Gili Air",
        locationId: "gili-air",
        province: "West Nusa Tenggara",
        coordinates: { lat: -8.3586, lng: 116.0339 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Gili A"]
      },
      {
        name: "Gili Meno",
        locationId: "gili-meno",
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
        locationId: "labuan-bajo",
        province: "East Nusa Tenggara",
        coordinates: { lat: -8.4964, lng: 119.8877 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Komodo Gateway", "Flores Airport"]
      },
      {
        name: "Ende",
        locationId: "ende",
        province: "East Nusa Tenggara",
        coordinates: { lat: -8.8432, lng: 121.6616 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Ende Flores"]
      },
      {
        name: "Maumere",
        locationId: "maumere",
        province: "East Nusa Tenggara",
        coordinates: { lat: -8.6167, lng: 122.2167 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Maumere Flores"]
      }
    ]
  },
  {
    category: "🦀 Sumatra",
    cities: [
      {
        name: "Medan",
        locationId: "medan",
        province: "North Sumatra",
        coordinates: { lat: 3.5952, lng: 98.6722 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Medan North Sumatra"]
      },
      {
        name: "Palembang",
        locationId: "palembang",
        province: "South Sumatra",
        coordinates: { lat: -2.9761, lng: 104.7754 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Palembang South Sumatra"]
      },
      {
        name: "Padang",
        locationId: "padang",
        province: "West Sumatra",
        coordinates: { lat: -0.9492, lng: 100.3543 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Padang West Sumatra", "Minang"]
      },
      {
        name: "Pekanbaru",
        locationId: "pekanbaru",
        province: "Riau",
        coordinates: { lat: 0.5333, lng: 101.4500 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Pekanbaru Riau"]
      },
      {
        name: "Bandar Lampung",
        locationId: "bandar-lampung",
        province: "Lampung",
        coordinates: { lat: -5.4292, lng: 105.2610 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Lampung Capital"]
      },
      {
        name: "Lake Toba",
        locationId: "lake-toba",
        province: "North Sumatra",
        coordinates: { lat: 2.6845, lng: 98.8756 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Danau Toba", "Toba Lake", "Batak Land"]
      },
      {
        name: "Banda Aceh",
        locationId: "banda-aceh",
        province: "Aceh",
        coordinates: { lat: 5.5483, lng: 95.3238 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Aceh Capital", "Tsunami Memorial", "Baiturrahman Mosque"]
      },
      {
        name: "Sabang (Weh Island)",
        locationId: "sabang",
        province: "Aceh",
        coordinates: { lat: 5.8933, lng: 95.3194 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Weh Island", "Sabang", "Diving Aceh", "Iboih Beach"]
      },
      {
        name: "Nias Island",
        locationId: "nias-island",
        province: "North Sumatra",
        coordinates: { lat: 1.0833, lng: 97.6167 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Nias", "Surf Island", "Nias Surf", "Lagundri Bay"]
      },
      {
        name: "Bukittinggi",
        locationId: "bukittinggi",
        province: "West Sumatra",
        coordinates: { lat: -0.3055, lng: 100.3693 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Bukittinggi Minang", "Jam Gadang", "Fort de Kock"]
      },
      {
        name: "Jambi",
        locationId: "jambi",
        province: "Jambi",
        coordinates: { lat: -1.6101, lng: 103.6131 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Jambi Capital"]
      },
      {
        name: "Bengkulu",
        locationId: "bengkulu",
        province: "Bengkulu",
        coordinates: { lat: -3.7928, lng: 102.2608 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Bengkulu Capital"]
      },
      {
        name: "Dumai",
        locationId: "dumai",
        province: "Riau",
        coordinates: { lat: 1.6851, lng: 101.4500 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Dumai Riau", "Oil City"]
      },
      {
        name: "Batam",
        locationId: "batam-sumatra",
        province: "Riau Islands",
        coordinates: { lat: 1.1307, lng: 104.0530 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Batam Island", "Singapore Gateway"]
      },
      {
        name: "Tanjung Pinang",
        locationId: "tanjung-pinang",
        province: "Riau Islands",
        coordinates: { lat: 0.9167, lng: 104.4500 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Tanjung Pinang Riau Islands"]
      },
      {
        name: "Pangkal Pinang",
        locationId: "pangkal-pinang",
        province: "Bangka Belitung",
        coordinates: { lat: -2.1316, lng: 106.1170 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Bangka Belitung Capital"]
      },
      {
        name: "Binjai",
        locationId: "binjai",
        province: "North Sumatra",
        coordinates: { lat: 3.6000, lng: 98.4833 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Binjai North Sumatra"]
      },
      {
        name: "Pematang Siantar",
        locationId: "pematang-siantar",
        province: "North Sumatra",
        coordinates: { lat: 2.9667, lng: 99.0667 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Pematang Siantar North Sumatra"]
      },
      {
        name: "Lubuklinggau",
        locationId: "lubuklinggau",
        province: "South Sumatra",
        coordinates: { lat: -3.3000, lng: 102.8667 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Lubuklinggau South Sumatra"]
      },
      {
        name: "Mentawai Islands",
        locationId: "mentawai-islands",
        province: "West Sumatra",
        coordinates: { lat: -1.8833, lng: 99.1000 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Mentawai", "Surf Paradise", "Siberut Island"]
      }
    ]
  },
  {
    category: "🐨 Kalimantan",
    cities: [
      {
        name: "Banjarmasin",
        locationId: "banjarmasin",
        province: "South Kalimantan",
        coordinates: { lat: -3.3194, lng: 114.5906 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Banjarmasin South Kalimantan"]
      },
      {
        name: "Balikpapan",
        locationId: "balikpapan",
        province: "East Kalimantan",
        coordinates: { lat: -1.2379, lng: 116.8529 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Balikpapan East Kalimantan"]
      },
      {
        name: "Pontianak",
        locationId: "pontianak",
        province: "West Kalimantan",
        coordinates: { lat: -0.0263, lng: 109.3425 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Pontianak West Kalimantan", "Equator City"]
      },
      {
        name: "Palangka Raya",
        locationId: "palangka-raya",
        province: "Central Kalimantan",
        coordinates: { lat: -2.2136, lng: 113.9209 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Palangka Raya Central Kalimantan"]
      },
      {
        name: "Samarinda",
        locationId: "samarinda",
        province: "East Kalimantan",
        coordinates: { lat: -0.5017, lng: 117.1536 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Samarinda East Kalimantan"]
      },
      {
        name: "Tarakan",
        locationId: "tarakan",
        province: "North Kalimantan",
        coordinates: { lat: 3.3000, lng: 117.6333 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Tarakan North Kalimantan"]
      },
      {
        name: "Singkawang",
        locationId: "singkawang",
        province: "West Kalimantan",
        coordinates: { lat: 0.9083, lng: 108.9750 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Singkawang Beach", "Chinese Heritage Kalimantan"]
      }
    ]
  },
  {
    category: "🦅 Sulawesi",
    cities: [
      {
        name: "Makassar",
        locationId: "makassar",
        province: "South Sulawesi",
        coordinates: { lat: -5.1477, lng: 119.4327 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Ujung Pandang", "Makassar South Sulawesi"]
      },
      {
        name: "Manado",
        locationId: "manado",
        province: "North Sulawesi",
        coordinates: { lat: 1.4748, lng: 124.8421 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Manado North Sulawesi", "Bunaken Gateway"]
      },
      {
        name: "Palu",
        locationId: "palu",
        province: "Central Sulawesi",
        coordinates: { lat: -0.8917, lng: 119.8707 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Palu Central Sulawesi"]
      },
      {
        name: "Kendari",
        locationId: "kendari",
        province: "Southeast Sulawesi",
        coordinates: { lat: -3.9450, lng: 122.4989 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Kendari Southeast Sulawesi"]
      },
      {
        name: "Mamuju",
        locationId: "mamuju",
        province: "West Sulawesi",
        coordinates: { lat: -2.6794, lng: 118.8889 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Mamuju West Sulawesi"]
      },
      {
        name: "Gorontalo",
        locationId: "gorontalo",
        province: "Gorontalo",
        coordinates: { lat: 0.5435, lng: 123.0664 },
        isMainCity: true,
        isTouristDestination: false,
        aliases: ["Gorontalo Province"]
      },
      {
        name: "Bunaken",
        locationId: "bunaken",
        province: "North Sulawesi",
        coordinates: { lat: 1.6167, lng: 124.7833 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Bunaken Island", "Diving Paradise", "Marine Park Manado"]
      },
      {
        name: "Toraja (Rantepao)",
        locationId: "toraja",
        province: "South Sulawesi",
        coordinates: { lat: -2.9667, lng: 119.9000 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Tana Toraja", "Rantepao", "Traditional Culture", "Tongkonan"]
      },
      {
        name: "Wakatobi",
        locationId: "wakatobi",
        province: "Southeast Sulawesi",
        coordinates: { lat: -5.4833, lng: 123.6000 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Wakatobi Islands", "Diving Sulawesi", "Marine Reserve"]
      },
      {
        name: "Bitung",
        locationId: "bitung",
        province: "North Sulawesi",
        coordinates: { lat: 1.4500, lng: 125.1833 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Bitung Port", "North Sulawesi Port"]
      }
    ]
  },
  {
    category: "🏛️ Papua & Maluku",
    cities: [
      {
        name: "Jayapura",
        locationId: "jayapura",
        province: "Papua",
        coordinates: { lat: -2.5355, lng: 140.7166 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Jayapura Papua", "Papua Capital"]
      },
      {
        name: "Sorong",
        locationId: "sorong",
        province: "West Papua",
        coordinates: { lat: -0.8833, lng: 131.2500 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Sorong West Papua", "Raja Ampat Gateway"]
      },
      {
        name: "Raja Ampat",
        locationId: "raja-ampat",
        province: "West Papua",
        coordinates: { lat: -0.2333, lng: 130.5167 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Four Kings", "Diving Mecca", "Marine Biodiversity", "Waisai"]
      },
      {
        name: "Ambon",
        locationId: "ambon",
        province: "Maluku",
        coordinates: { lat: -3.6954, lng: 128.1814 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Ambon Maluku", "Spice Islands"]
      },
      {
        name: "Ternate",
        locationId: "ternate",
        province: "North Maluku",
        coordinates: { lat: 0.7833, lng: 127.3667 },
        isMainCity: true,
        isTouristDestination: true,
        aliases: ["Ternate North Maluku", "Clove Island"]
      },
      {
        name: "Merauke",
        locationId: "merauke",
        province: "Papua",
        coordinates: { lat: -8.4667, lng: 140.3167 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Merauke Papua", "Easternmost Indonesia"]
      },
      {
        name: "Manokwari",
        locationId: "manokwari",
        province: "West Papua",
        coordinates: { lat: -0.8700, lng: 134.0839 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Manokwari West Papua", "Cenderawasih Bay"]
      },
      {
        name: "Banda Islands",
        locationId: "banda-islands",
        province: "Maluku",
        coordinates: { lat: -4.5167, lng: 129.8833 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Banda Naira", "Nutmeg Islands", "Historic Spice Trade"]
      }
    ]
  },
  {
    category: "🌴 More Java Cities",
    cities: [
      {
        name: "Tasikmalaya",
        locationId: "tasikmalaya",
        province: "West Java",
        coordinates: { lat: -7.3506, lng: 108.2111 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Tasikmalaya West Java"]
      },
      {
        name: "Cirebon",
        locationId: "cirebon",
        province: "West Java",
        coordinates: { lat: -6.7063, lng: 108.5571 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Cirebon West Java", "Batik City"]
      },
      {
        name: "Sukabumi",
        locationId: "sukabumi",
        province: "West Java",
        coordinates: { lat: -6.9175, lng: 106.9269 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Sukabumi West Java"]
      },
      {
        name: "Purwokerto",
        locationId: "purwokerto",
        province: "Central Java",
        coordinates: { lat: -7.4197, lng: 109.2342 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Purwokerto Central Java", "Banyumas"]
      },
      {
        name: "Tegal",
        locationId: "tegal",
        province: "Central Java",
        coordinates: { lat: -6.8694, lng: 109.1402 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Tegal Central Java"]
      },
      {
        name: "Magelang",
        locationId: "magelang",
        province: "Central Java",
        coordinates: { lat: -7.4830, lng: 110.2181 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Magelang Central Java", "Borobudur Gateway"]
      },
      {
        name: "Salatiga",
        locationId: "salatiga",
        province: "Central Java",
        coordinates: { lat: -7.3318, lng: 110.4920 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Salatiga Central Java"]
      },
      {
        name: "Jember",
        locationId: "jember",
        province: "East Java",
        coordinates: { lat: -8.1721, lng: 113.7038 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Jember East Java"]
      },
      {
        name: "Kediri",
        locationId: "kediri",
        province: "East Java",
        coordinates: { lat: -7.8186, lng: 112.0169 },
        isMainCity: false,
        isTouristDestination: false,
        aliases: ["Kediri East Java"]
      },
      {
        name: "Blitar",
        locationId: "blitar",
        province: "East Java",
        coordinates: { lat: -8.0956, lng: 112.1681 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Blitar East Java", "Soekarno Grave"]
      },
      {
        name: "Probolinggo",
        locationId: "probolinggo",
        province: "East Java",
        coordinates: { lat: -7.7543, lng: 113.2159 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Probolinggo East Java", "Bromo Gateway"]
      },
      {
        name: "Mount Bromo",
        locationId: "mount-bromo",
        province: "East Java",
        coordinates: { lat: -7.9425, lng: 112.9530 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Bromo", "Bromo Tengger Semeru", "Cemoro Lawang"]
      },
      {
        name: "Karimunjawa",
        locationId: "karimunjawa",
        province: "Central Java",
        coordinates: { lat: -5.8333, lng: 110.4167 },
        isMainCity: false,
        isTouristDestination: true,
        aliases: ["Karimunjawa Islands", "Java Sea Paradise"]
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
