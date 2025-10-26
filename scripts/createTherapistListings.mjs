import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'therapist_job_listings';

// Helper to get expiry date (30 days from now)
const getExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString();
};

const therapistListings = [
    {
        therapistId: 'therapist_001',
        therapistName: 'Ayu Prameswari',
        listingId: 1001,
        jobTitle: 'Certified Balinese Massage Therapist',
        jobType: 'contract',
        listingDate: new Date().toISOString(),
        expiryDate: getExpiryDate(),
        jobDescription: 'Experienced Balinese massage therapist with 8 years of expertise in traditional techniques, deep tissue, and hot stone massage. Passionate about wellness and providing exceptional guest experiences.',
        requiredLicenses: 'Certified Massage Therapist, Balinese Traditional Massage Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'full-time',
        minimumSalary: 'IDR 6,000,000/month',
        preferredLocations: ['Bali', 'Jakarta', 'Lombok'],
        accommodation: 'preferred',
        specializations: ['Balinese Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy', 'Swedish'],
        languages: ['Indonesian', 'English', 'Japanese'],
        whatsapp: '+6281234567890',
        isActive: true
    },
    {
        therapistId: 'therapist_002',
        therapistName: 'Made Santika',
        listingId: 1002,
        jobTitle: 'Senior Wellness & Spa Therapist',
        jobType: 'contract',
        listingDate: new Date().toISOString(),
        expiryDate: getExpiryDate(),
        jobDescription: 'Highly skilled therapist specializing in reflexology and traditional Balinese treatments. 10+ years experience in luxury resorts and wellness centers. Committed to holistic healing.',
        requiredLicenses: 'International Spa Certification, Reflexology Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: false,
        availability: 'full-time',
        minimumSalary: 'IDR 7,500,000/month',
        preferredLocations: ['Bali', 'Yogyakarta', 'Surabaya'],
        accommodation: 'required',
        specializations: ['Reflexology', 'Balinese Massage', 'Deep Tissue', 'Thai Massage'],
        languages: ['Indonesian', 'English', 'Chinese', 'Korean'],
        whatsapp: '+6281234567891',
        isActive: true
    },
    {
        therapistId: 'therapist_003',
        therapistName: 'Wayan Suartika',
        listingId: 1003,
        jobTitle: 'Sports & Therapeutic Massage Specialist',
        jobType: 'contract',
        listingDate: new Date().toISOString(),
        expiryDate: getExpiryDate(),
        jobDescription: 'Professional massage therapist with expertise in sports therapy, injury recovery, and deep tissue work. Certified in multiple modalities and dedicated to client wellness.',
        requiredLicenses: 'Sports Massage Certificate, Deep Tissue Specialist',
        willingToRelocateDomestic: false,
        willingToRelocateInternational: false,
        availability: 'part-time',
        minimumSalary: 'IDR 5,000,000/month',
        preferredLocations: ['Bali'],
        accommodation: 'not-required',
        specializations: ['Sports Massage', 'Deep Tissue', 'Trigger Point Therapy', 'Swedish'],
        languages: ['Indonesian', 'English'],
        whatsapp: '+6281234567892',
        isActive: true
    },
    {
        therapistId: 'therapist_004',
        therapistName: 'Komang Dewi',
        listingId: 1004,
        jobTitle: 'Aromatherapy & Relaxation Therapist',
        jobType: 'contract',
        listingDate: new Date().toISOString(),
        expiryDate: getExpiryDate(),
        jobDescription: 'Gentle and nurturing therapist specializing in aromatherapy, prenatal massage, and relaxation techniques. Creating peaceful healing experiences for guests.',
        requiredLicenses: 'Aromatherapy Certification, Prenatal Massage Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'both',
        minimumSalary: 'IDR 5,500,000/month',
        preferredLocations: ['Bali', 'Jakarta', 'Singapore', 'Thailand'],
        accommodation: 'preferred',
        specializations: ['Aromatherapy', 'Prenatal Massage', 'Swedish', 'Balinese', 'Relaxation'],
        languages: ['Indonesian', 'English', 'Mandarin'],
        whatsapp: '+6281234567893',
        isActive: true
    },
    {
        therapistId: 'therapist_005',
        therapistName: 'Nyoman Agung',
        listingId: 1005,
        jobTitle: 'Traditional Healing & Spa Expert',
        jobType: 'contract',
        listingDate: new Date().toISOString(),
        expiryDate: getExpiryDate(),
        jobDescription: 'Master therapist trained in traditional Balinese healing arts, herbal treatments, and luxury spa services. Bringing ancient wisdom to modern wellness.',
        requiredLicenses: 'Traditional Healer Certificate, Advanced Spa Therapist',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'full-time',
        minimumSalary: 'IDR 8,000,000/month',
        preferredLocations: ['Bali', 'Jakarta', 'Dubai', 'Maldives'],
        accommodation: 'required',
        specializations: ['Traditional Balinese', 'Herbal Treatments', 'Hot Stone', 'Deep Tissue', 'Ayurvedic'],
        languages: ['Indonesian', 'English', 'Russian', 'Japanese'],
        whatsapp: '+6281234567894',
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
            } catch (error) {
                console.error(`❌ Error creating listing for ${listing.therapistName}:`, error.message);
            }
        }
        
        console.log('🎉 All therapist listings created successfully!');
    } catch (error) {
        console.error('❌ Error in createTherapistListings:', error.message);
    }
}

// Run the script
createTherapistListings();
