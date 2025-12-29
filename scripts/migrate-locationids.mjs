/**
 * One-time migration to populate locationId from legacy location field
 */

import { therapistService } from '../lib/appwriteService.js';

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
    
    // Seminyak
    if (normalized.includes('seminyak')) {
        return 'seminyak';
    }
    
    // Surabaya
    if (normalized.includes('surabaya')) {
        return 'surabaya';
    }
    
    // Semarang
    if (normalized.includes('semarang')) {
        return 'semarang';
    }
    
    // Default: convert to slug format
    return location.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function migrateTherapistLocationIds() {
    try {
        console.log('🔄 Starting locationId migration...\n');
        
        // Get all therapists
        const therapists = await therapistService.getAll();
        
        console.log(`📊 Total therapists: ${therapists.length}`);
        
        // Filter therapists that need migration
        const needsMigration = therapists.filter(t => 
            (!t.locationId || t.locationId.trim() === '') && t.location
        );
        
        console.log(`🎯 Therapists needing migration: ${needsMigration.length}\n`);
        
        if (needsMigration.length === 0) {
            console.log('✅ No therapists need locationId migration!');
            return;
        }
        
        // Preview first 5 migrations
        console.log('📋 Migration Preview:');
        needsMigration.slice(0, 5).forEach(t => {
            const locationId = convertLocationToId(t.location);
            console.log(`  ${t.name}: "${t.location}" → "${locationId}"`);
        });
        
        if (needsMigration.length > 5) {
            console.log(`  ... and ${needsMigration.length - 5} more\n`);
        }
        
        // Perform migration
        let migrated = 0;
        let errors = 0;
        
        for (const therapist of needsMigration) {
            try {
                const locationId = convertLocationToId(therapist.location);
                
                if (locationId) {
                    await therapistService.update(therapist.$id, {
                        locationId: locationId
                    });
                    
                    console.log(`✅ Migrated ${therapist.name}: locationId="${locationId}"`);
                    migrated++;
                } else {
                    console.log(`⚠️ Skipped ${therapist.name}: could not determine locationId from "${therapist.location}"`);
                }
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Failed to migrate ${therapist.name}:`, error.message);
                errors++;
            }
        }
        
        console.log(`\n🎉 Migration Complete!`);
        console.log(`✅ Successfully migrated: ${migrated}`);
        console.log(`❌ Errors: ${errors}`);
        
        // Verify migration
        console.log('\n🔍 Verifying migration...');
        const updatedTherapists = await therapistService.getAll();
        const withLocationId = updatedTherapists.filter(t => t.locationId && t.locationId.trim());
        const withoutLocationId = updatedTherapists.filter(t => !t.locationId || !t.locationId.trim());
        
        console.log(`📊 After migration:`);
        console.log(`  ✅ With locationId: ${withLocationId.length}`);
        console.log(`  ❌ Without locationId: ${withoutLocationId.length}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrateTherapistLocationIds();