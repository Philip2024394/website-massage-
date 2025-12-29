/**
 * Check existing therapists for missing locationId fields
 * and provide migration data analysis
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67449e4a002f5e205dd8')
    .setKey('standard_0a9ff2646235d8dd067b3f7cab00e3fb21977a5d5aca23732d99ee0d07f888ae929c73f6c75fe27f4aba04b47b562b85dd5027dc9d7d564fcd446c8565a9ba5c9b52688286534228f188165d6b24fbb7b88af9b8e1e12d6b2d6dbc21ac964647da055b5806a7e104c0e994e4b528ecab44a29c55cfce99cd98dc454e27136ca0');

const databases = new Databases(client);

function convertLocationToId(location) {
    if (!location) return null;
    
    const normalized = location.toLowerCase().trim();
    
    // Yogyakarta aliases
    if (normalized.includes('yogyakarta') || normalized.includes('jogja') || normalized.includes('yogya')) {
        return 'yogyakarta';
    }
    
    // Bandung aliases
    if (normalized.includes('bandung')) {
        return 'bandung';
    }
    
    // Jakarta aliases
    if (normalized.includes('jakarta')) {
        return 'jakarta';
    }
    
    // Denpasar/Bali aliases
    if (normalized.includes('denpasar') || normalized.includes('bali')) {
        return 'denpasar';
    }
    
    // Ubud
    if (normalized.includes('ubud')) {
        return 'ubud';
    }
    
    // Canggu
    if (normalized.includes('canggu')) {
        return 'canggu';
    }
    
    // Default: convert to slug format
    return location.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function checkTherapistLocationIds() {
    try {
        console.log('🔍 Analyzing therapist locationId data...\n');
        
        // Get all therapists
        const response = await databases.listDocuments('674853ad00198e73fa74', 'therapists');
        const therapists = response.documents;
        
        console.log(`📊 Total therapists: ${therapists.length}\n`);
        
        // Analyze locationId coverage
        const withLocationId = therapists.filter(t => t.locationId && t.locationId.trim());
        const withoutLocationId = therapists.filter(t => !t.locationId || !t.locationId.trim());
        
        console.log(`✅ With locationId: ${withLocationId.length}`);
        console.log(`❌ Without locationId: ${withoutLocationId.length}\n`);
        
        // Show therapists without locationId
        if (withoutLocationId.length > 0) {
            console.log('🚨 Therapists missing locationId:');
            withoutLocationId.forEach((t, index) => {
                const suggestedId = convertLocationToId(t.location);
                console.log(`  ${index + 1}. ${t.name}`);
                console.log(`     📍 location: "${t.location || 'NULL'}"`);
                console.log(`     🎯 suggested locationId: "${suggestedId}"`);
                console.log(`     🔴 isLive: ${t.isLive}`);
                console.log('');
            });
        }
        
        // Show location distribution
        console.log('\n📋 Current location distribution:');
        const locationCounts = {};
        therapists.forEach(t => {
            const locationId = t.locationId || convertLocationToId(t.location) || 'unknown';
            locationCounts[locationId] = (locationCounts[locationId] || 0) + 1;
        });
        
        Object.entries(locationCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([locationId, count]) => {
                console.log(`  ${locationId}: ${count} therapists`);
            });
        
        // Generate migration preview
        console.log('\n🔄 Migration Preview:');
        const needsMigration = withoutLocationId.filter(t => t.location);
        console.log(`${needsMigration.length} therapists can be auto-migrated from location field\n`);
        
        needsMigration.slice(0, 5).forEach(t => {
            const suggestedId = convertLocationToId(t.location);
            console.log(`  ${t.name}: "${t.location}" → "${suggestedId}"`);
        });
        
        if (needsMigration.length > 5) {
            console.log(`  ... and ${needsMigration.length - 5} more`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkTherapistLocationIds();