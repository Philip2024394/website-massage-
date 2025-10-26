import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections.therapistJobListings;

const therapistListings = [
    {
        therapistId: 'therapist_001',
        therapistName: 'Ayu Prameswari',
        listingId: 1001,
        jobTitle: 'Certified Balinese Massage Therapist',
        jobDescription: 'Experienced Balinese massage therapist with 8 years of expertise in traditional techniques, deep tissue, and hot stone massage. Passionate about wellness and providing exceptional guest experiences.',
        requiredLicenses: 'Certified Massage Therapist, Balinese Traditional Massage Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'full-time' as const,
        minimumSalary: 'IDR 6,000,000/month',
        preferredLocations: ['Bali', 'Jakarta', 'Lombok'],
        accommodation: 'preferred' as const,
        specializations: ['Balinese Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy', 'Swedish'],
        languages: ['Indonesian', 'English', 'Japanese'],
        yearsOfExperience: 8,
        contactWhatsApp: '+6281234567890',
        isActive: true
    },
    {
        therapistId: 'therapist_002',
        therapistName: 'Made Santika',
        listingId: 1002,
        jobTitle: 'Senior Wellness & Spa Therapist',
        jobDescription: 'Highly skilled therapist specializing in reflexology and traditional Balinese treatments. 10+ years experience in luxury resorts and wellness centers. Committed to holistic healing.',
        requiredLicenses: 'International Spa Certification, Reflexology Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: false,
        availability: 'full-time' as const,
        minimumSalary: 'IDR 7,500,000/month',
        preferredLocations: ['Bali', 'Yogyakarta', 'Surabaya'],
        accommodation: 'required' as const,
        specializations: ['Reflexology', 'Balinese Massage', 'Deep Tissue', 'Thai Massage'],
        languages: ['Indonesian', 'English', 'Chinese', 'Korean'],
        yearsOfExperience: 10,
        contactWhatsApp: '+6281234567891',
        isActive: true
    },
    {
        therapistId: 'therapist_003',
        therapistName: 'Wayan Suartika',
        listingId: 1003,
        jobTitle: 'Sports & Therapeutic Massage Specialist',
        jobDescription: 'Professional massage therapist with expertise in sports therapy, injury recovery, and deep tissue work. Certified in multiple modalities and dedicated to client wellness.',
        requiredLicenses: 'Sports Massage Certificate, Deep Tissue Specialist',
        willingToRelocateDomestic: false,
        willingToRelocateInternational: false,
        availability: 'part-time' as const,
        minimumSalary: 'IDR 5,000,000/month',
        preferredLocations: ['Bali'],
        accommodation: 'not-required' as const,
        specializations: ['Sports Massage', 'Deep Tissue', 'Trigger Point Therapy', 'Swedish'],
        languages: ['Indonesian', 'English'],
        yearsOfExperience: 6,
        contactWhatsApp: '+6281234567892',
        isActive: true
    },
    {
        therapistId: 'therapist_004',
        therapistName: 'Komang Dewi',
        listingId: 1004,
        jobTitle: 'Aromatherapy & Relaxation Therapist',
        jobDescription: 'Gentle and nurturing therapist specializing in aromatherapy, prenatal massage, and relaxation techniques. Creating peaceful healing experiences for guests.',
        requiredLicenses: 'Aromatherapy Certification, Prenatal Massage Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'both' as const,
        minimumSalary: 'IDR 5,500,000/month',
        preferredLocations: ['Bali', 'Jakarta', 'Singapore', 'Thailand'],
        accommodation: 'preferred' as const,
        specializations: ['Aromatherapy', 'Prenatal Massage', 'Swedish', 'Balinese', 'Relaxation'],
        languages: ['Indonesian', 'English', 'Mandarin'],
        yearsOfExperience: 5,
        contactWhatsApp: '+6281234567893',
        isActive: true
    },
    {
        therapistId: 'therapist_005',
        therapistName: 'Nyoman Agung',
        listingId: 1005,
        jobTitle: 'Traditional Healing & Spa Expert',
        jobDescription: 'Master therapist trained in traditional Balinese healing arts, herbal treatments, and luxury spa services. Bringing ancient wisdom to modern wellness.',
        requiredLicenses: 'Traditional Healer Certificate, Advanced Spa Therapist',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'full-time' as const,
        minimumSalary: 'IDR 8,000,000/month',
        preferredLocations: ['Bali', 'Jakarta', 'Dubai', 'Maldives'],
        accommodation: 'required' as const,
        specializations: ['Traditional Balinese', 'Herbal Treatments', 'Hot Stone', 'Deep Tissue', 'Ayurvedic'],
        languages: ['Indonesian', 'English', 'Russian', 'Japanese'],
        yearsOfExperience: 12,
        contactWhatsApp: '+6281234567894',
        isActive: true
    }
];

async function createTherapistListings() {
    console.log('🚀 Starting to create therapist listings...');
    
    try {
        for (const listing of therapistListings) {
            try {
                const document = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    listing
                );
                console.log(`✅ Created listing for ${listing.therapistName}:`, document.$id);
            } catch (error: any) {
                console.error(`❌ Error creating listing for ${listing.therapistName}:`, error.message);
            }
        }
        
        console.log('🎉 All therapist listings created successfully!');
    } catch (error: any) {
        console.error('❌ Error in createTherapistListings:', error.message);
    }
}

// Run the script
createTherapistListings();

export { createTherapistListings };
