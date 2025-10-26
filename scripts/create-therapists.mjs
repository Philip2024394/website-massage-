import { Client, Databases, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const COLLECTION_ID = 'therapist_job_listings';

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
        jobDescription: 'Experienced Balinese massage therapist with 8 years of expertise in traditional techniques, deep tissue, and hot stone massage.',
        requiredLicenses: 'Certified Massage Therapist',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'full-time',
        minimumSalary: 'IDR 6,000,000/month',
        preferredLocations: 'Bali, Jakarta',
        accommodation: 'preferred',
        specializations: ['Balinese Massage', 'Deep Tissue', 'Hot Stone'],
        languages: ['Indonesian', 'English', 'Japanese'],
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
        jobDescription: 'Highly skilled therapist specializing in reflexology and traditional Balinese treatments. 10+ years experience.',
        requiredLicenses: 'International Spa Certification',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: false,
        availability: 'full-time',
        minimumSalary: 'IDR 7,500,000/month',
        preferredLocations: 'Bali, Jakarta',
        accommodation: 'required',
        specializations: ['Reflexology', 'Balinese Massage'],
        languages: ['Indonesian', 'English', 'Chinese'],
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
        jobDescription: 'Professional massage therapist with expertise in sports therapy and deep tissue work.',
        requiredLicenses: 'Sports Massage Certificate',
        willingToRelocateDomestic: false,
        willingToRelocateInternational: false,
        availability: 'part-time',
        minimumSalary: 'IDR 5,000,000/month',
        preferredLocations: 'Bali, Jakarta',
        accommodation: 'not-required',
        specializations: ['Sports Massage', 'Deep Tissue'],
        languages: ['Indonesian', 'English'],
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
        jobDescription: 'Gentle therapist specializing in aromatherapy and prenatal massage.',
        requiredLicenses: 'Aromatherapy Certification',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'both',
        minimumSalary: 'IDR 5,500,000/month',
        preferredLocations: 'Bali, Jakarta',
        accommodation: 'preferred',
        specializations: ['Aromatherapy', 'Prenatal Massage'],
        languages: ['Indonesian', 'English'],
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
        jobDescription: 'Master therapist trained in traditional Balinese healing arts and luxury spa services.',
        requiredLicenses: 'Traditional Healer Certificate',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        availability: 'full-time',
        minimumSalary: 'IDR 8,000,000/month',
        preferredLocations: 'Bali, Jakarta',
        accommodation: 'required',
        specializations: ['Traditional Balinese', 'Hot Stone'],
        languages: ['Indonesian', 'English', 'Russian'],
        isActive: true
    }
];

async function createListings() {
    console.log('🚀 Creating therapist listings...');
    
    for (const listing of therapistListings) {
        try {
            const doc = await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID,
                ID.unique(),
                listing
            );
            console.log(`✅ Created: ${listing.therapistName} (${doc.$id})`);
        } catch (error) {
            console.error(`❌ ${listing.therapistName}: ${error.message}`);
        }
    }
}

createListings();
