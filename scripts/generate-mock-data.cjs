/**
 * Mock Data Generator for Global Markets
 * Creates 3 therapists and 3 massage places for each country
 * 
 * INSTRUCTIONS:
 * 1. Run: node scripts/generate-mock-data.cjs
 * 2. Output saved to: scripts/mock-data-template.json
 * 3. Edit the JSON file with real details (names, photos, descriptions)
 * 4. Import to Appwrite using the admin dashboard or API
 */

const fs = require('fs');
const path = require('path');

// All supported countries
const COUNTRIES = [
  { code: 'ID', name: 'Indonesia', city: 'Jakarta', currency: 'IDR', multiplier: 1000 },
  { code: 'GB', name: 'United Kingdom', city: 'London', currency: 'GBP', multiplier: 1 },
  { code: 'US', name: 'United States', city: 'New York', currency: 'USD', multiplier: 1 },
  { code: 'AU', name: 'Australia', city: 'Sydney', currency: 'AUD', multiplier: 1 },
  { code: 'SG', name: 'Singapore', city: 'Singapore', currency: 'SGD', multiplier: 1 },
  { code: 'MY', name: 'Malaysia', city: 'Kuala Lumpur', currency: 'MYR', multiplier: 1 },
  { code: 'TH', name: 'Thailand', city: 'Bangkok', currency: 'THB', multiplier: 1 },
  { code: 'PH', name: 'Philippines', city: 'Manila', currency: 'PHP', multiplier: 1 },
  { code: 'CN', name: 'China', city: 'Beijing', currency: 'CNY', multiplier: 1 },
  { code: 'JP', name: 'Japan', city: 'Tokyo', currency: 'JPY', multiplier: 100 },
  { code: 'KR', name: 'South Korea', city: 'Seoul', currency: 'KRW', multiplier: 1000 },
  { code: 'RU', name: 'Russia', city: 'Moscow', currency: 'RUB', multiplier: 1 },
  { code: 'CA', name: 'Canada', city: 'Toronto', currency: 'CAD', multiplier: 1 },
  { code: 'IN', name: 'India', city: 'Delhi', currency: 'INR', multiplier: 1 },
];

// City coordinates (approximate city centers)
const CITY_COORDS = {
  'Jakarta': { lat: -6.2088, lng: 106.8456 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Kuala Lumpur': { lat: 3.1390, lng: 101.6869 },
  'Bangkok': { lat: 13.7563, lng: 100.5018 },
  'Manila': { lat: 14.5995, lng: 120.9842 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Seoul': { lat: 37.5665, lng: 126.9780 },
  'Moscow': { lat: 55.7558, lng: 37.6173 },
  'Toronto': { lat: 43.6532, lng: -79.3832 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
};

/**
 * Generate mock therapist data
 */
function generateTherapist(country, index) {
  const coords = CITY_COORDS[country.city];
  const basePrice = 50; // Base price in local currency equivalent
  
  return {
    name: `Therapist ${index + 1} - ${country.city}`,
    email: `therapist${index + 1}.${country.code.toLowerCase()}@indastreet.com`,
    profilePicture: `https://ui-avatars.com/api/?name=Therapist+${index + 1}&background=random&size=200`,
    mainImage: 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188',
    description: `Professional massage therapist in ${country.city}, ${country.name}. Specializing in traditional and modern massage techniques. Available for home service and hotel outcalls.`,
    status: index === 0 ? 'available' : (index === 1 ? 'busy' : 'offline'),
    price60: String(Math.round(basePrice * country.multiplier)),
    price90: String(Math.round(basePrice * 1.5 * country.multiplier)),
    price120: String(Math.round(basePrice * 2 * country.multiplier)),
    whatsappNumber: `+${country.code}1234567${index}`,
    rating: (4.5 + (index * 0.2)).toFixed(1),
    reviewCount: 15 + (index * 5),
    massageTypes: JSON.stringify(['Swedish Massage', 'Deep Tissue', 'Sports Massage', 'Thai Massage']),
    isLive: true,
    location: `${country.city}, ${country.name}`,
    coordinates: JSON.stringify({ lat: coords.lat + (index * 0.01), lng: coords.lng + (index * 0.01) }),
    city: country.city,
    countryCode: country.code,
    country: country.name,
    activeMembershipDate: new Date().toISOString(),
    membershipStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    analytics: JSON.stringify({
      impressions: 0,
      views: 0,
      profileViews: 0,
      whatsapp_clicks: 0,
      whatsappClicks: 0,
      phone_clicks: 0,
      directions_clicks: 0,
      bookings: 0
    }),
    isVerified: index === 0,
    yearsOfExperience: 5 + index,
    languages: ['en'],
  };
}

/**
 * Generate mock massage place data
 */
function generatePlace(country, index) {
  const coords = CITY_COORDS[country.city];
  const basePrice = 60;
  
  return {
    name: `Wellness Spa ${index + 1} - ${country.city}`,
    email: `spa${index + 1}.${country.code.toLowerCase()}@indastreet.com`,
    description: `Premium wellness spa in ${country.city} offering traditional and modern massage therapies. Professional therapists, clean facilities, and relaxing atmosphere.`,
    mainImage: 'https://ik.imagekit.io/7grri5v7d/spa-interior-luxury.jpg?updatedAt=1761583264188',
    thumbnailImages: JSON.stringify([
      'https://ik.imagekit.io/7grri5v7d/spa-room-1.jpg',
      'https://ik.imagekit.io/7grri5v7d/spa-room-2.jpg',
      'https://ik.imagekit.io/7grri5v7d/spa-room-3.jpg'
    ]),
    pricing: JSON.stringify({
      "60": Math.round(basePrice * country.multiplier * 1000),
      "90": Math.round(basePrice * 1.5 * country.multiplier * 1000),
      "120": Math.round(basePrice * 2 * country.multiplier * 1000)
    }),
    whatsappNumber: `+${country.code}9876543${index}`,
    rating: (4.3 + (index * 0.2)).toFixed(1),
    reviewCount: 25 + (index * 10),
    massageTypes: JSON.stringify(['Aromatherapy', 'Hot Stone', 'Reflexology', 'Couples Massage']),
    isLive: true,
    location: `${country.city}, ${country.name}`,
    coordinates: JSON.stringify({ lat: coords.lat + (index * 0.015), lng: coords.lng - (index * 0.015) }),
    city: country.city,
    countryCode: country.code,
    country: country.name,
    openingTime: '09:00',
    closingTime: '22:00',
    activeMembershipDate: new Date().toISOString(),
    analytics: JSON.stringify({
      impressions: 0,
      views: 0,
      profileViews: 0,
      whatsapp_clicks: 0,
      whatsappClicks: 0,
      phone_clicks: 0,
      directions_clicks: 0,
      bookings: 0
    }),
    isVerified: index === 0,
    isLicensed: true,
  };
}

/**
 * Generate all mock data
 */
function generateAllMockData() {
  const mockData = {
    therapists: [],
    places: [],
    metadata: {
      generatedAt: new Date().toISOString(),
      totalCountries: COUNTRIES.length,
      totalTherapists: COUNTRIES.length * 3,
      totalPlaces: COUNTRIES.length * 3,
      instructions: [
        '1. Review and edit each entry (names, photos, descriptions)',
        '2. Update whatsappNumber with real numbers',
        '3. Replace placeholder images with actual photos',
        '4. Customize descriptions for each market',
        '5. Import to Appwrite therapists and places collections'
      ]
    }
  };

  COUNTRIES.forEach(country => {
    // Generate 3 therapists per country
    for (let i = 0; i < 3; i++) {
      mockData.therapists.push(generateTherapist(country, i));
    }

    // Generate 3 places per country
    for (let i = 0; i < 3; i++) {
      mockData.places.push(generatePlace(country, i));
    }
  });

  return mockData;
}

/**
 * Save mock data to file
 */
function saveMockData() {
  const mockData = generateAllMockData();
  const outputPath = path.join(__dirname, 'mock-data-template.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2), 'utf8');
  
  console.log('✅ Mock data generated successfully!');
  console.log(`📄 Output: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   • Countries: ${mockData.metadata.totalCountries}`);
  console.log(`   • Therapists: ${mockData.metadata.totalTherapists}`);
  console.log(`   • Massage Places: ${mockData.metadata.totalPlaces}`);
  console.log(`\n📝 Next Steps:`);
  mockData.metadata.instructions.forEach((step, i) => {
    console.log(`   ${step}`);
  });
}

// Run generator
if (require.main === module) {
  saveMockData();
}

module.exports = { generateAllMockData, generateTherapist, generatePlace };
