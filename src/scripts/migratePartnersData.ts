/**
 * ============================================================================
 * 🏨 PARTNERS DATA MIGRATION SCRIPT
 * ============================================================================
 * 
 * Script to migrate existing hotel and villa data to Appwrite Partners collection
 * Run this script once to populate the database with initial partner data
 */

import { indastreetPartnersService, PartnerData } from '../services/indastreetPartnersService';

// ============================================================================
// EXISTING PARTNER DATA FROM INDASTREETPARTNERSPAGE
// ============================================================================

const existingPartnersData: PartnerData[] = [
    // Hotels
    {
        name: 'Majestic Hotel Group',
        websiteUrl: 'https://majestichotelgroup.com',
        websiteTitle: 'Luxury Hotel Management Company',
        description: 'Hotel management company with over 100 years of experience in the tourism industry. Specializing in luxury and lifestyle hotels with unique personalities, integrated into local culture and aesthetics. Comprehensive hotel services including spa facilities, wellness programs, and premium accommodations.',
        category: 'hotel',
        location: 'International Hotel Management',
        phone: '+34 971 123 456',
        verified: true,
        rating: 4.8,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20itay.png?updatedAt=1762571418409',
        specialties: ['Luxury Hotel Management', 'Lifestyle Hotels', 'Spa & Wellness', '100+ Years Experience', 'Cultural Integration', 'Premium Services'],
        priceRange: 'luxury',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=majestichotelgroup.com&viewport=1440x900&width=400'
    },
    {
        name: 'La Finca Resort',
        websiteUrl: 'https://www.lafincaresort.com/',
        websiteTitle: 'Paraíso Escondido en la Costa Blanca',
        description: 'Luxury 5-star resort in Costa Blanca featuring La Finca Spa with 10% discount on treatments and massages. Includes two 18-hole golf courses, sports facilities (tennis, paddle, gym), and gourmet restaurants. Bright rooms with terraces overlooking golf, pool, or gardens.',
        category: 'hotel',
        location: 'Algorfa, Alicante, Costa Blanca, Spain',
        phone: '+34 966 729 055',
        verified: true,
        rating: 4.8,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20spein.png?updatedAt=1762571516859',
        specialties: ['5-Star Resort', 'La Finca Spa', '10% Spa Discount', 'Golf Courses', 'Premium Amenities', 'Costa Blanca'],
        priceRange: 'luxury',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=lafincaresort.com&viewport=1440x900&width=400'
    },
    {
        name: 'Marbella Club Hotel',
        websiteUrl: 'https://marbellaclub.com/',
        websiteTitle: 'Iconic Beach Resort & Spa',
        description: 'Legendary beachfront resort in Marbella\'s Golden Mile featuring award-winning spa, multiple restaurants, private beach access, and Mediterranean luxury. Historic property with modern amenities and personalized service.',
        category: 'hotel',
        location: 'Marbella, Costa del Sol, Spain',
        phone: '+34 952 822 211',
        verified: true,
        rating: 4.9,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/hotel%20spein.png?updatedAt=1762571516859',
        specialties: ['Beachfront Resort', 'Award-Winning Spa', 'Golden Mile', 'Mediterranean Luxury', 'Private Beach', 'Historic Property'],
        priceRange: 'luxury',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=marbellaclub.com&viewport=1440x900&width=400'
    },
    
    // Massage Places
    {
        name: 'Massage London SW1',
        websiteUrl: 'https://massagelondonsw1.com/',
        websiteTitle: 'Premium Thai Massage in Westminster',
        description: 'Authentic Thai massage studio in the heart of Westminster, London offering traditional Thai massage, deep tissue treatments, and relaxation therapies. Professional certified therapists in a serene environment.',
        category: 'massage-place',
        location: 'Westminster, London, UK',
        phone: '+44 20 7123 4567',
        verified: true,
        rating: 4.7,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20london.png?updatedAt=1762569055961',
        specialties: ['Authentic Thai Massage', 'Deep Tissue', 'Westminster Location', 'Certified Therapists', 'Traditional Treatments', 'Relaxation Therapy'],
        priceRange: 'mid-range',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=massagelondonsw1.com&viewport=1440x900&width=400'
    },
    {
        name: 'Vabali Spa Berlin',
        websiteUrl: 'https://www.vabali.de/en/berlin/',
        websiteTitle: 'Balinese Wellness Oasis in Berlin',
        description: 'A world-class Balinese wellness resort in the heart of Berlin featuring 10 saunas, 3 steam baths, 4 pools, massage services, and Indonesian-inspired ambience. Complete wellness destination with restaurant and relaxation facilities.',
        category: 'massage-place',
        location: 'Berlin, Germany',
        phone: '+49 30 12345678',
        verified: true,
        rating: 4.9,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20gemany.png?updatedAt=1762569055961',
        specialties: ['Balinese Wellness', '10 Saunas', '3 Steam Baths', '4 Pools', 'Massage Services', 'Indonesian Spa', 'Wellness Resort'],
        priceRange: 'luxury',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=vabali.de&viewport=1440x900&width=400'
    },
    {
        name: "Let's Relax Spa Xi'an",
        websiteUrl: 'https://letsrelaxspa.com/branch/xi-an-china',
        websiteTitle: 'Modern Contemporary Thai-Chinese Spa',
        description: 'Premium spa located in Great Tang All Day Mall, Xi\'an, featuring modern contemporary design with Thai-Chinese touch. Urban retreat offering traditional Thai massage, foot massage, spa packages and wellness treatments with earth tone ambiance.',
        category: 'massage-place',
        location: 'Qujiang New District, Xi\'an, Shaanxi, China',
        phone: '+86 29 8888 9999',
        verified: true,
        rating: 4.6,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20china.png?updatedAt=1762571516859',
        specialties: ['Modern Contemporary Design', 'Thai-Chinese Spa', 'Traditional Thai Massage', 'Foot Massage', 'Urban Retreat', 'Earth Tone Ambiance'],
        priceRange: 'mid-range',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=letsrelaxspa.com&viewport=1440x900&width=400'
    },
    {
        name: 'Banyan Tree Spa',
        websiteUrl: 'https://www.banyantree.com/en/spas',
        websiteTitle: 'Award-Winning Luxury Spa Treatments',
        description: 'World-renowned luxury spa brand offering holistic wellness experiences with traditional Asian healing philosophies. Features signature treatments, aromatherapy, and personalized wellness journeys in tranquil settings.',
        category: 'massage-place',
        location: 'Multiple International Locations',
        phone: '+65 6849 5888',
        verified: true,
        rating: 4.8,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/spa%20banyan.png?updatedAt=1762571516859',
        specialties: ['Award-Winning Spa', 'Traditional Asian Healing', 'Signature Treatments', 'Aromatherapy', 'Wellness Journeys', 'Luxury Brand'],
        priceRange: 'luxury',
        websitePreview: 'https://api.screenshotlayer.com/api/capture?access_key=demo&url=banyantree.com&viewport=1440x900&width=400'
    }
];

// ============================================================================
// MIGRATION FUNCTIONS
// ============================================================================

/**
 * Run the migration to populate partners database
 */
export async function migratePartnersData(): Promise<void> {
    console.log('🚀 Starting Partners Data Migration...');
    console.log(`📊 Migrating ${existingPartnersData.length} partners to Appwrite`);
    
    try {
        // Initialize the service
        const initialized = await indastreetPartnersService.initializePartnersSystem();
        
        if (!initialized) {
            console.error('❌ Failed to initialize partners service');
            console.log('📋 Please create the Appwrite collection first:');
            console.log('Collection ID: indastreet_partners');
            console.log('Required attributes:', indastreetPartnersService.getRequiredAttributes());
            return;
        }
        
        // Check if partners already exist
        const existingPartners = await indastreetPartnersService.getPartners({ limit: 1 });
        if (existingPartners.length > 0) {
            console.log('⚠️ Partners already exist in database. Skipping migration.');
            console.log('To force re-migration, delete existing partners first.');
            return;
        }
        
        // Bulk import partners
        const result = await indastreetPartnersService.bulkImportPartners(existingPartnersData);
        
        console.log('\n🎉 Migration Results:');
        console.log(`✅ Successfully imported: ${result.success} partners`);
        console.log(`❌ Failed imports: ${result.failed} partners`);
        
        if (result.errors.length > 0) {
            console.log('\n❌ Errors:');
            result.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        console.log('\n✅ Partners Migration Complete!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

/**
 * Verify migration results
 */
export async function verifyMigration(): Promise<void> {
    console.log('🔍 Verifying Partners Migration...');
    
    try {
        const partners = await indastreetPartnersService.getPartners();
        
        console.log(`📊 Total partners in database: ${partners.length}`);
        
        const categories = {
            hotel: partners.filter(p => p.category === 'hotel').length,
            villa: partners.filter(p => p.category === 'villa').length,
            'massage-place': partners.filter(p => p.category === 'massage-place').length,
            therapist: partners.filter(p => p.category === 'therapist').length
        };
        
        console.log('📈 Partners by category:');
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`   ${category}: ${count}`);
        });
        
        const verified = partners.filter(p => p.verified).length;
        const withImages = partners.filter(p => p.imageUrl).length;
        
        console.log(`✅ Verified partners: ${verified}/${partners.length}`);
        console.log(`🖼️ Partners with images: ${withImages}/${partners.length}`);
        
        console.log('\n✅ Migration Verification Complete!');
        
    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

// ============================================================================
// EXPORT MIGRATION SCRIPT
// ============================================================================

// Run migration if called directly
if (typeof window === 'undefined') {
    // Node.js environment
    migratePartnersData().then(() => {
        console.log('🏁 Migration script completed');
    });
}