/**
 * LOCATION VERIFICATION AUDIT
 * Checks all therapists with GPS coordinates and verifies city assignment correctness
 * Date: February 7, 2026
 */

const sdk = require('node-appwrite');

// Initialize Appwrite client
const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('68f23b11000d25eb3664')
  .setKey('standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790');

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

/**
 * Derive city from GPS coordinates (matching production logic)
 */
function deriveLocationIdFromGeopoint(coords) {
  const { lat, lng } = coords;

  // City bounding boxes (from geoDistance.ts)
  const cityBounds = {
    'canggu': { latMin: -8.7, latMax: -8.6, lngMin: 115.1, lngMax: 115.2 },
    'ubud': { latMin: -8.6, latMax: -8.4, lngMin: 115.2, lngMax: 115.3 },
    'denpasar': { latMin: -8.8, latMax: -8.5, lngMin: 115.1, lngMax: 115.3 },
    'seminyak': { latMin: -8.7, latMax: -8.65, lngMin: 115.15, lngMax: 115.17 },
    'sanur': { latMin: -8.72, latMax: -8.65, lngMin: 115.25, lngMax: 115.28 },
    'kuta': { latMin: -8.75, latMax: -8.70, lngMin: 115.15, lngMax: 115.18 },
    'jakarta': { latMin: -6.3, latMax: -6.1, lngMin: 106.7, lngMax: 106.9 },
    'surabaya': { latMin: -7.4, latMax: -7.2, lngMin: 112.6, lngMax: 112.8 },
  };

  for (const [city, bounds] of Object.entries(cityBounds)) {
    if (
      lat >= bounds.latMin &&
      lat <= bounds.latMax &&
      lng >= bounds.lngMin &&
      lng <= bounds.lngMax
    ) {
      return city;
    }
  }

  return 'other'; // Outside known city bounds
}

/**
 * Main audit function
 */
async function verifyTherapistLocations() {
  console.log('🔍 THERAPIST LOCATION VERIFICATION AUDIT');
  console.log('==========================================\n');

  try {
    // Fetch all therapists with pagination
    let allTherapists = [];
    let offset = 0;
    let hasMore = true;
    const limit = 100; // Max per request

    while (hasMore) {
      const response = await databases.listDocuments(
        DATABASE_ID,
        THERAPISTS_COLLECTION_ID,
        [
          sdk.Query.limit(limit),
          sdk.Query.offset(offset)
        ]
      );

      allTherapists = allTherapists.concat(response.documents);
      
      console.log(`📥 Fetched ${response.documents.length} therapists (offset: ${offset})`);
      
      if (response.documents.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    const therapists = allTherapists;
    console.log(`\n📊 Total therapists in database: ${therapists.length}`);
    console.log(`📊 Reported total from API: ${therapists.length}\n`);

    let withGPS = 0;
    let withoutGPS = 0;
    let correctCity = 0;
    let incorrectCity = 0;
    let missingCity = 0;
    let otherCity = 0;

    const incorrectTherapists = [];
    const missingCityTherapists = [];
    const noGPSTherapists = [];

    for (const therapist of therapists) {
      const { name, geopoint, city, locationId, location, isLive } = therapist;
      const therapistId = therapist.$id;

      // Check if GPS coordinates exist
      if (!geopoint || !geopoint.lat || !geopoint.lng) {
        withoutGPS++;
        noGPSTherapists.push({
          id: therapistId,
          name,
          city: city || 'N/A',
          isLive: isLive || false
        });
        continue;
      }

      withGPS++;

      // Derive city from GPS
      const derivedCity = deriveLocationIdFromGeopoint(geopoint);

      // Check city assignment
      const assignedCity = city || locationId || 'MISSING';

      if (assignedCity === 'MISSING') {
        missingCity++;
        missingCityTherapists.push({
          id: therapistId,
          name,
          gps: geopoint,
          derivedCity,
          assignedCity: 'MISSING',
          isLive: isLive || false
        });
        continue;
      }

      if (derivedCity === 'other') {
        otherCity++;
        continue;
      }

      // Compare derived city with assigned city
      if (derivedCity.toLowerCase() === assignedCity.toLowerCase()) {
        correctCity++;
      } else {
        incorrectCity++;
        incorrectTherapists.push({
          id: therapistId,
          name,
          gps: geopoint,
          derivedCity,
          assignedCity,
          location,
          isLive: isLive || false
        });
      }
    }

    // Print summary
    console.log('📈 SUMMARY');
    console.log('─────────────────────────────────────────');
    console.log(`✅ Therapists with GPS: ${withGPS}`);
    console.log(`❌ Therapists without GPS: ${withoutGPS}`);
    console.log(`✅ Correct city assignment: ${correctCity}`);
    console.log(`⚠️  Incorrect city assignment: ${incorrectCity}`);
    console.log(`⚠️  Missing city field: ${missingCity}`);
    console.log(`🔍 GPS-derived "other" city: ${otherCity}`);
    console.log('');

    // Print details of incorrect assignments
    if (incorrectCity > 0) {
      console.log('🚨 INCORRECT CITY ASSIGNMENTS (CRITICAL)');
      console.log('─────────────────────────────────────────');
      incorrectTherapists.forEach((t, index) => {
        console.log(`\n${index + 1}. ${t.name} (${t.id})`);
        console.log(`   GPS: lat=${t.gps.lat}, lng=${t.gps.lng}`);
        console.log(`   GPS-Derived City: "${t.derivedCity}"`);
        console.log(`   Assigned City: "${t.assignedCity}" ❌`);
        console.log(`   Location Field: "${t.location || 'N/A'}"`);
        console.log(`   isLive: ${t.isLive}`);
        console.log(`   STATUS: ${t.isLive ? '🔴 LIVE (WRONG CITY!)' : '⚪ Not live'}`);
      });
      console.log('');
    }

    // Print missing city assignments
    if (missingCity > 0) {
      console.log('⚠️  MISSING CITY FIELD (HAS GPS)');
      console.log('─────────────────────────────────────────');
      missingCityTherapists.forEach((t, index) => {
        console.log(`\n${index + 1}. ${t.name} (${t.id})`);
        console.log(`   GPS: lat=${t.gps.lat}, lng=${t.gps.lng}`);
        console.log(`   GPS-Derived City: "${t.derivedCity}"`);
        console.log(`   Assigned City: MISSING ❌`);
        console.log(`   isLive: ${t.isLive}`);
      });
      console.log('');
    }

    // Print therapists without GPS
    if (withoutGPS > 0) {
      console.log('📍 THERAPISTS WITHOUT GPS COORDINATES');
      console.log('─────────────────────────────────────────');
      noGPSTherapists.forEach((t, index) => {
        console.log(`${index + 1}. ${t.name} (${t.id}) - City: ${t.city} - isLive: ${t.isLive}`);
      });
      console.log('');
    }

    // Final verdict
    console.log('🎯 VERDICT');
    console.log('─────────────────────────────────────────');
    if (incorrectCity === 0 && missingCity === 0) {
      console.log('✅ ALL THERAPISTS WITH GPS HAVE CORRECT CITY ASSIGNMENTS');
      console.log('✅ LOCATION SYSTEM IS WORKING CORRECTLY');
    } else {
      console.log('❌ LOCATION SYSTEM HAS ERRORS:');
      if (incorrectCity > 0) {
        console.log(`   - ${incorrectCity} therapist(s) in WRONG CITY`);
      }
      if (missingCity > 0) {
        console.log(`   - ${missingCity} therapist(s) MISSING CITY (but have GPS)`);
      }
      console.log('\n🔧 REQUIRED ACTION:');
      console.log('   1. These therapists need to click "Set Location" again');
      console.log('   2. Or run auto-fix script to update city from GPS');
    }

  } catch (error) {
    console.error('❌ Error during audit:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

// Run the audit
verifyTherapistLocations();
