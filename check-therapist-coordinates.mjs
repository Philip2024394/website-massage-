/**
 * Diagnostic Script: Check Therapist Coordinates
 * Verifies all therapists have valid GPS coordinates saved in Appwrite
 */

import { Client, Databases, Query } from 'node-appwrite';

// Appwrite configuration
const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';

console.log('🔍 Starting therapist coordinates verification...\n');
console.log('=' .repeat(80));

async function checkTherapistCoordinates() {
    try {
        // Fetch all therapists
        console.log('📋 Fetching all therapists from Appwrite...\n');
        const response = await databases.listDocuments(
            DATABASE_ID,
            THERAPISTS_COLLECTION_ID,
            [Query.limit(500)]
        );

        const therapists = response.documents;
        console.log(`✅ Found ${therapists.length} therapists\n`);
        console.log('=' .repeat(80));

        let withCoordinates = 0;
        let withoutCoordinates = 0;
        let invalidCoordinates = 0;
        const issues = [];

        therapists.forEach((therapist, index) => {
            const num = index + 1;
            const name = therapist.name || 'Unnamed';
            const id = therapist.$id;
            const coordinates = therapist.coordinates;

            console.log(`\n${num}. ${name} (ID: ${id})`);
            console.log('-'.repeat(80));

            // Check if coordinates exist
            if (!coordinates) {
                console.log('   ❌ Status: NO COORDINATES');
                console.log('   📍 Coordinates field: undefined/null');
                withoutCoordinates++;
                issues.push({
                    id,
                    name,
                    issue: 'Missing coordinates field',
                    coordinates: null
                });
                return;
            }

            // Parse coordinates based on format
            let lat, lng;
            let coordFormat = 'unknown';

            // Handle GeoJSON Point format [lng, lat]
            if (Array.isArray(coordinates) && coordinates.length === 2) {
                coordFormat = 'GeoJSON Point [lng, lat]';
                lng = coordinates[0];
                lat = coordinates[1];
            }
            // Handle object format {lat, lng}
            else if (typeof coordinates === 'object' && coordinates.lat && coordinates.lng) {
                coordFormat = 'Object {lat, lng}';
                lat = coordinates.lat;
                lng = coordinates.lng;
            }
            // Handle string format (JSON string)
            else if (typeof coordinates === 'string') {
                coordFormat = 'JSON String';
                try {
                    const parsed = JSON.parse(coordinates);
                    if (parsed.lat && parsed.lng) {
                        lat = parsed.lat;
                        lng = parsed.lng;
                    } else if (Array.isArray(parsed) && parsed.length === 2) {
                        lng = parsed[0];
                        lat = parsed[1];
                    }
                } catch (e) {
                    coordFormat = 'Invalid JSON String';
                }
            }

            console.log(`   📍 Format: ${coordFormat}`);
            console.log(`   📍 Raw value: ${JSON.stringify(coordinates)}`);

            // Validate coordinates
            if (lat !== undefined && lng !== undefined) {
                const validLat = lat >= -90 && lat <= 90;
                const validLng = lng >= -180 && lng <= 180;

                if (validLat && validLng) {
                    console.log(`   ✅ Status: VALID COORDINATES`);
                    console.log(`   🌍 Latitude: ${lat}`);
                    console.log(`   🌍 Longitude: ${lng}`);
                    withCoordinates++;
                } else {
                    console.log(`   ⚠️  Status: INVALID COORDINATE VALUES`);
                    console.log(`   🌍 Latitude: ${lat} ${validLat ? '✓' : '✗ (out of range)'}`);
                    console.log(`   🌍 Longitude: ${lng} ${validLng ? '✓' : '✗ (out of range)'}`);
                    invalidCoordinates++;
                    issues.push({
                        id,
                        name,
                        issue: 'Invalid coordinate values (out of range)',
                        coordinates: { lat, lng }
                    });
                }
            } else {
                console.log(`   ❌ Status: UNPARSEABLE COORDINATES`);
                console.log(`   ⚠️  Could not extract lat/lng from the data`);
                invalidCoordinates++;
                issues.push({
                    id,
                    name,
                    issue: 'Coordinates exist but cannot be parsed',
                    coordinates
                });
            }

            // Additional location info
            if (therapist.location) {
                console.log(`   📍 Location: ${therapist.location}`);
            }
            if (therapist.locationId) {
                console.log(`   🏷️  Location ID: ${therapist.locationId}`);
            }
        });

        // Summary Report
        console.log('\n' + '='.repeat(80));
        console.log('📊 SUMMARY REPORT');
        console.log('='.repeat(80));
        console.log(`\n📈 Total Therapists: ${therapists.length}`);
        console.log(`✅ With Valid Coordinates: ${withCoordinates} (${((withCoordinates/therapists.length)*100).toFixed(1)}%)`);
        console.log(`❌ Without Coordinates: ${withoutCoordinates} (${((withoutCoordinates/therapists.length)*100).toFixed(1)}%)`);
        console.log(`⚠️  Invalid Coordinates: ${invalidCoordinates} (${((invalidCoordinates/therapists.length)*100).toFixed(1)}%)`);

        if (issues.length > 0) {
            console.log('\n' + '='.repeat(80));
            console.log('🔧 ISSUES REQUIRING ATTENTION');
            console.log('='.repeat(80));
            issues.forEach((issue, idx) => {
                console.log(`\n${idx + 1}. ${issue.name} (ID: ${issue.id})`);
                console.log(`   Issue: ${issue.issue}`);
                console.log(`   Data: ${JSON.stringify(issue.coordinates)}`);
            });
        }

        console.log('\n' + '='.repeat(80));
        if (withCoordinates === therapists.length) {
            console.log('🎉 SUCCESS! All therapists have valid coordinates!');
        } else {
            console.log('⚠️  ACTION REQUIRED: Some therapists need coordinate updates');
            console.log('\n💡 To fix issues:');
            console.log('   1. Go to Appwrite Console → Database → therapists_collection_id');
            console.log('   2. For each therapist listed above, add coordinates in GeoJSON format:');
            console.log('      [longitude, latitude]  (e.g., [110.4197, -7.8269])');
            console.log('   3. Ensure latitude is between -90 and 90');
            console.log('   4. Ensure longitude is between -180 and 180');
        }
        console.log('='.repeat(80));

    } catch (error) {
        console.error('\n❌ Error checking therapist coordinates:', error);
        if (error.code) {
            console.error('   Error Code:', error.code);
        }
        if (error.message) {
            console.error('   Message:', error.message);
        }
    }
}

checkTherapistCoordinates();
