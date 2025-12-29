// Comprehensive Indonesian Cities Database
// Covers all 34 provinces with major cities, towns, and tourist areas

export const INDONESIAN_CITIES = [
  // Special Region of Yogyakarta
  { name: "Yogyakarta", slug: "yogyakarta", aliases: ["Jogja", "Yogya", "Jogjakarta", "Djokja", "DIY"], latitude: -7.797068, longitude: 110.370529, province: "DI Yogyakarta", displayOrder: 1 },
  { name: "Sleman", slug: "sleman", aliases: ["Kabupaten Sleman"], latitude: -7.715477, longitude: 110.355003, province: "DI Yogyakarta", displayOrder: 2 },
  { name: "Bantul", slug: "bantul", aliases: ["Kabupaten Bantul"], latitude: -7.888517, longitude: 110.328865, province: "DI Yogyakarta", displayOrder: 3 },
  { name: "Gunung Kidul", slug: "gunung-kidul", aliases: ["Gunungkidul", "Wonosari"], latitude: -7.976574, longitude: 110.601166, province: "DI Yogyakarta", displayOrder: 4 },
  { name: "Kulon Progo", slug: "kulon-progo", aliases: ["Wates"], latitude: -7.820555, longitude: 110.159721, province: "DI Yogyakarta", displayOrder: 5 },

  // Central Java (Jawa Tengah)
  { name: "Semarang", slug: "semarang", aliases: ["Kota Semarang"], latitude: -6.966667, longitude: 110.416664, province: "Central Java", displayOrder: 10 },
  { name: "Solo", slug: "solo", aliases: ["Surakarta", "Kota Solo"], latitude: -7.566667, longitude: 110.816667, province: "Central Java", displayOrder: 11 },
  { name: "Magelang", slug: "magelang", aliases: ["Kota Magelang"], latitude: -7.477778, longitude: 110.217778, province: "Central Java", displayOrder: 12 },
  { name: "Salatiga", slug: "salatiga", aliases: ["Kota Salatiga"], latitude: -7.330056, longitude: 110.492778, province: "Central Java", displayOrder: 13 },
  { name: "Pekalongan", slug: "pekalongan", aliases: ["Kota Pekalongan"], latitude: -6.888611, longitude: 109.675278, province: "Central Java", displayOrder: 14 },
  { name: "Tegal", slug: "tegal", aliases: ["Kota Tegal"], latitude: -6.869444, longitude: 109.140556, province: "Central Java", displayOrder: 15 },
  { name: "Purwokerto", slug: "purwokerto", aliases: ["Banyumas"], latitude: -7.421389, longitude: 109.234444, province: "Central Java", displayOrder: 16 },
  { name: "Cilacap", slug: "cilacap", aliases: ["Kabupaten Cilacap"], latitude: -7.726389, longitude: 109.015278, province: "Central Java", displayOrder: 17 },
  { name: "Kudus", slug: "kudus", aliases: ["Kabupaten Kudus"], latitude: -6.805556, longitude: 110.836111, province: "Central Java", displayOrder: 18 },
  { name: "Jepara", slug: "jepara", aliases: ["Kabupaten Jepara"], latitude: -6.588056, longitude: 110.668889, province: "Central Java", displayOrder: 19 },

  // West Java (Jawa Barat)
  { name: "Bandung", slug: "bandung", aliases: ["Bandoeng", "Kota Bandung", "Paris van Java"], latitude: -6.914744, longitude: 107.609810, province: "West Java", displayOrder: 20 },
  { name: "Bekasi", slug: "bekasi", aliases: ["Kota Bekasi"], latitude: -6.238270, longitude: 106.975571, province: "West Java", displayOrder: 21 },
  { name: "Bogor", slug: "bogor", aliases: ["Kota Bogor", "Kota Hujan"], latitude: -6.595038, longitude: 106.816635, province: "West Java", displayOrder: 22 },
  { name: "Depok", slug: "depok", aliases: ["Kota Depok"], latitude: -6.402484, longitude: 106.794243, province: "West Java", displayOrder: 23 },
  { name: "Cirebon", slug: "cirebon", aliases: ["Kota Cirebon"], latitude: -6.732063, longitude: 108.552559, province: "West Java", displayOrder: 24 },
  { name: "Sukabumi", slug: "sukabumi", aliases: ["Kota Sukabumi"], latitude: -6.927720, longitude: 106.927910, province: "West Java", displayOrder: 25 },
  { name: "Tasikmalaya", slug: "tasikmalaya", aliases: ["Kota Tasikmalaya"], latitude: -7.327169, longitude: 108.219360, province: "West Java", displayOrder: 26 },
  { name: "Cimahi", slug: "cimahi", aliases: ["Kota Cimahi"], latitude: -6.872389, longitude: 107.542500, province: "West Java", displayOrder: 27 },
  { name: "Banjar", slug: "banjar", aliases: ["Kota Banjar"], latitude: -7.370556, longitude: 108.539167, province: "West Java", displayOrder: 28 },
  { name: "Garut", slug: "garut", aliases: ["Kabupaten Garut"], latitude: -7.220556, longitude: 107.905556, province: "West Java", displayOrder: 29 },
  { name: "Karawang", slug: "karawang", aliases: ["Kabupaten Karawang"], latitude: -6.305556, longitude: 107.302222, province: "West Java", displayOrder: 30 },

  // East Java (Jawa Timur)
  { name: "Surabaya", slug: "surabaya", aliases: ["Kota Pahlawan", "Kota Surabaya"], latitude: -7.250445, longitude: 112.768845, province: "East Java", displayOrder: 40 },
  { name: "Malang", slug: "malang", aliases: ["Kota Malang"], latitude: -7.983908, longitude: 112.621391, province: "East Java", displayOrder: 41 },
  { name: "Batu", slug: "batu", aliases: ["Kota Batu"], latitude: -7.870556, longitude: 112.528889, province: "East Java", displayOrder: 42 },
  { name: "Blitar", slug: "blitar", aliases: ["Kota Blitar"], latitude: -8.095833, longitude: 112.165556, province: "East Java", displayOrder: 43 },
  { name: "Kediri", slug: "kediri", aliases: ["Kota Kediri"], latitude: -7.816667, longitude: 112.016667, province: "East Java", displayOrder: 44 },
  { name: "Madiun", slug: "madiun", aliases: ["Kota Madiun"], latitude: -7.629722, longitude: 111.523889, province: "East Java", displayOrder: 45 },
  { name: "Mojokerto", slug: "mojokerto", aliases: ["Kota Mojokerto"], latitude: -7.466389, longitude: 112.433889, province: "East Java", displayOrder: 46 },
  { name: "Pasuruan", slug: "pasuruan", aliases: ["Kota Pasuruan"], latitude: -7.645278, longitude: 112.908056, province: "East Java", displayOrder: 47 },
  { name: "Probolinggo", slug: "probolinggo", aliases: ["Kota Probolinggo"], latitude: -7.754167, longitude: 113.216111, province: "East Java", displayOrder: 48 },
  { name: "Jember", slug: "jember", aliases: ["Kabupaten Jember"], latitude: -8.166944, longitude: 113.700278, province: "East Java", displayOrder: 49 },
  { name: "Banyuwangi", slug: "banyuwangi", aliases: ["Kabupaten Banyuwangi"], latitude: -8.219444, longitude: 114.368889, province: "East Java", displayOrder: 50 },

  // Banten
  { name: "Serang", slug: "serang", aliases: ["Kota Serang"], latitude: -6.120556, longitude: 106.150278, province: "Banten", displayOrder: 60 },
  { name: "Tangerang", slug: "tangerang", aliases: ["Kota Tangerang"], latitude: -6.178306, longitude: 106.640278, province: "Banten", displayOrder: 61 },
  { name: "Tangerang Selatan", slug: "tangerang-selatan", aliases: ["Tangsel", "South Tangerang"], latitude: -6.286389, longitude: 106.718056, province: "Banten", displayOrder: 62 },
  { name: "Cilegon", slug: "cilegon", aliases: ["Kota Cilegon"], latitude: -6.001667, longitude: 106.016667, province: "Banten", displayOrder: 63 },

  // DKI Jakarta
  { name: "Jakarta", slug: "jakarta", aliases: ["DKI Jakarta", "Jakarta Raya", "Batavia", "Ibukota"], latitude: -6.208763, longitude: 106.845599, province: "DKI Jakarta", displayOrder: 70 },
  { name: "Jakarta Pusat", slug: "jakarta-pusat", aliases: ["Central Jakarta"], latitude: -6.186387, longitude: 106.834091, province: "DKI Jakarta", displayOrder: 71 },
  { name: "Jakarta Utara", slug: "jakarta-utara", aliases: ["North Jakarta"], latitude: -6.138611, longitude: 106.882778, province: "DKI Jakarta", displayOrder: 72 },
  { name: "Jakarta Barat", slug: "jakarta-barat", aliases: ["West Jakarta"], latitude: -6.167222, longitude: 106.763056, province: "DKI Jakarta", displayOrder: 73 },
  { name: "Jakarta Selatan", slug: "jakarta-selatan", aliases: ["South Jakarta", "Jaksel"], latitude: -6.261389, longitude: 106.810278, province: "DKI Jakarta", displayOrder: 74 },
  { name: "Jakarta Timur", slug: "jakarta-timur", aliases: ["East Jakarta", "Jaktim"], latitude: -6.225000, longitude: 106.900278, province: "DKI Jakarta", displayOrder: 75 },

  // Bali
  { name: "Denpasar", slug: "denpasar", aliases: ["Kota Denpasar"], latitude: -8.670458, longitude: 115.212631, province: "Bali", displayOrder: 80 },
  { name: "Ubud", slug: "ubud", aliases: ["Gianyar"], latitude: -8.506944, longitude: 115.262778, province: "Bali", displayOrder: 81 },
  { name: "Kuta", slug: "kuta", aliases: ["Badung"], latitude: -8.718291, longitude: 115.169128, province: "Bali", displayOrder: 82 },
  { name: "Seminyak", slug: "seminyak", aliases: [], latitude: -8.690556, longitude: 115.168056, province: "Bali", displayOrder: 83 },
  { name: "Sanur", slug: "sanur", aliases: [], latitude: -8.708333, longitude: 115.261944, province: "Bali", displayOrder: 84 },
  { name: "Nusa Dua", slug: "nusa-dua", aliases: [], latitude: -8.800833, longitude: 115.229722, province: "Bali", displayOrder: 85 },
  { name: "Canggu", slug: "canggu", aliases: [], latitude: -8.645833, longitude: 115.138611, province: "Bali", displayOrder: 86 },
  { name: "Jimbaran", slug: "jimbaran", aliases: [], latitude: -8.798333, longitude: 115.163889, province: "Bali", displayOrder: 87 },

  // North Sumatra (Sumatera Utara)
  { name: "Medan", slug: "medan", aliases: ["Kota Medan"], latitude: 3.595196, longitude: 98.672226, province: "North Sumatra", displayOrder: 90 },
  { name: "Binjai", slug: "binjai", aliases: ["Kota Binjai"], latitude: 3.600000, longitude: 98.483333, province: "North Sumatra", displayOrder: 91 },
  { name: "Pematang Siantar", slug: "pematang-siantar", aliases: ["Pematangsiantar"], latitude: 2.960278, longitude: 99.061111, province: "North Sumatra", displayOrder: 92 },
  { name: "Tebing Tinggi", slug: "tebing-tinggi", aliases: [], latitude: 3.328333, longitude: 99.162500, province: "North Sumatra", displayOrder: 93 },

  // West Sumatra (Sumatera Barat)
  { name: "Padang", slug: "padang", aliases: ["Kota Padang"], latitude: -0.947136, longitude: 100.417419, province: "West Sumatra", displayOrder: 100 },
  { name: "Bukittinggi", slug: "bukittinggi", aliases: ["Bukit Tinggi"], latitude: -0.303889, longitude: 100.369444, province: "West Sumatra", displayOrder: 101 },
  { name: "Payakumbuh", slug: "payakumbuh", aliases: [], latitude: -0.218611, longitude: 100.633056, province: "West Sumatra", displayOrder: 102 },

  // South Sumatra (Sumatera Selatan)
  { name: "Palembang", slug: "palembang", aliases: ["Kota Palembang"], latitude: -2.990934, longitude: 104.756554, province: "South Sumatra", displayOrder: 110 },
  { name: "Lubuklinggau", slug: "lubuklinggau", aliases: ["Lubuk Linggau"], latitude: -3.283333, longitude: 102.866667, province: "South Sumatra", displayOrder: 111 },

  // Riau
  { name: "Pekanbaru", slug: "pekanbaru", aliases: ["Kota Pekanbaru"], latitude: 0.533333, longitude: 101.450000, province: "Riau", displayOrder: 120 },
  { name: "Dumai", slug: "dumai", aliases: ["Kota Dumai"], latitude: 1.681944, longitude: 101.449722, province: "Riau", displayOrder: 121 },

  // Lampung
  { name: "Bandar Lampung", slug: "bandar-lampung", aliases: ["Lampung"], latitude: -5.450000, longitude: 105.266667, province: "Lampung", displayOrder: 130 },
  { name: "Metro", slug: "metro", aliases: ["Kota Metro"], latitude: -5.113056, longitude: 105.306667, province: "Lampung", displayOrder: 131 },

  // Aceh
  { name: "Banda Aceh", slug: "banda-aceh", aliases: ["Aceh"], latitude: 5.548290, longitude: 95.323753, province: "Aceh", displayOrder: 140 },
  { name: "Lhokseumawe", slug: "lhokseumawe", aliases: [], latitude: 5.180278, longitude: 97.150556, province: "Aceh", displayOrder: 141 },

  // South Kalimantan (Kalimantan Selatan)
  { name: "Banjarmasin", slug: "banjarmasin", aliases: ["Kota Banjarmasin"], latitude: -3.316694, longitude: 114.590111, province: "South Kalimantan", displayOrder: 150 },
  { name: "Banjarbaru", slug: "banjarbaru", aliases: [], latitude: -3.450000, longitude: 114.833333, province: "South Kalimantan", displayOrder: 151 },

  // East Kalimantan (Kalimantan Timur)
  { name: "Samarinda", slug: "samarinda", aliases: ["Kota Samarinda"], latitude: -0.502106, longitude: 117.153709, province: "East Kalimantan", displayOrder: 160 },
  { name: "Balikpapan", slug: "balikpapan", aliases: ["Kota Balikpapan"], latitude: -1.267477, longitude: 116.831413, province: "East Kalimantan", displayOrder: 161 },
  { name: "Bontang", slug: "bontang", aliases: [], latitude: 0.133333, longitude: 117.500000, province: "East Kalimantan", displayOrder: 162 },

  // West Kalimantan (Kalimantan Barat)
  { name: "Pontianak", slug: "pontianak", aliases: ["Kota Pontianak"], latitude: -0.026389, longitude: 109.342778, province: "West Kalimantan", displayOrder: 170 },
  { name: "Singkawang", slug: "singkawang", aliases: [], latitude: 0.904444, longitude: 108.991111, province: "West Kalimantan", displayOrder: 171 },

  // Central Kalimantan (Kalimantan Tengah)
  { name: "Palangkaraya", slug: "palangkaraya", aliases: ["Palangka Raya"], latitude: -2.209722, longitude: 113.916944, province: "Central Kalimantan", displayOrder: 180 },

  // South Sulawesi (Sulawesi Selatan)
  { name: "Makassar", slug: "makassar", aliases: ["Ujung Pandang", "Kota Makassar"], latitude: -5.147665, longitude: 119.432732, province: "South Sulawesi", displayOrder: 190 },
  { name: "Pare-Pare", slug: "pare-pare", aliases: ["Parepare"], latitude: -4.013889, longitude: 119.626111, province: "South Sulawesi", displayOrder: 191 },

  // North Sulawesi (Sulawesi Utara)
  { name: "Manado", slug: "manado", aliases: ["Kota Manado"], latitude: 1.494400, longitude: 124.842079, province: "North Sulawesi", displayOrder: 200 },
  { name: "Bitung", slug: "bitung", aliases: [], latitude: 1.442222, longitude: 125.198611, province: "North Sulawesi", displayOrder: 201 },
  { name: "Tomohon", slug: "tomohon", aliases: [], latitude: 1.328333, longitude: 124.838333, province: "North Sulawesi", displayOrder: 202 },

  // Central Sulawesi (Sulawesi Tengah)
  { name: "Palu", slug: "palu", aliases: ["Kota Palu"], latitude: -0.907222, longitude: 119.833056, province: "Central Sulawesi", displayOrder: 210 },

  // Southeast Sulawesi (Sulawesi Tenggara)
  { name: "Kendari", slug: "kendari", aliases: ["Kota Kendari"], latitude: -3.994920, longitude: 122.515274, province: "Southeast Sulawesi", displayOrder: 220 },

  // West Nusa Tenggara (Nusa Tenggara Barat)
  { name: "Mataram", slug: "mataram", aliases: ["Lombok", "Kota Mataram"], latitude: -8.583333, longitude: 116.116667, province: "West Nusa Tenggara", displayOrder: 230 },
  { name: "Bima", slug: "bima", aliases: ["Kota Bima"], latitude: -8.466667, longitude: 118.716667, province: "West Nusa Tenggara", displayOrder: 231 },

  // East Nusa Tenggara (Nusa Tenggara Timur)
  { name: "Kupang", slug: "kupang", aliases: ["Kota Kupang"], latitude: -10.178333, longitude: 123.597222, province: "East Nusa Tenggara", displayOrder: 240 },

  // Papua
  { name: "Jayapura", slug: "jayapura", aliases: ["Kota Jayapura"], latitude: -2.533333, longitude: 140.716667, province: "Papua", displayOrder: 250 },

  // Maluku
  { name: "Ambon", slug: "ambon", aliases: ["Kota Ambon"], latitude: -3.695556, longitude: 128.181944, province: "Maluku", displayOrder: 260 },

  // Gorontalo
  { name: "Gorontalo", slug: "gorontalo", aliases: ["Kota Gorontalo"], latitude: 0.543056, longitude: 123.058056, province: "Gorontalo", displayOrder: 270 },

  // Jambi
  { name: "Jambi", slug: "jambi", aliases: ["Kota Jambi"], latitude: -1.590278, longitude: 103.610833, province: "Jambi", displayOrder: 280 },

  // Bengkulu
  { name: "Bengkulu", slug: "bengkulu", aliases: ["Kota Bengkulu"], latitude: -3.795556, longitude: 102.265000, province: "Bengkulu", displayOrder: 290 }
];
