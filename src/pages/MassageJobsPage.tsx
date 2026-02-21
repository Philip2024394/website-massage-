// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import { Home, SlidersHorizontal, Search, X } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { EMPLOYER_ACCESS_FEE_IDR } from '../constants/businessLogic';
import { ViewProfileButton } from '../components/ViewProfileButton';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;
const POSITION_FILLED_BADGE_URL = 'https://ik.imagekit.io/7grri5v7d/position%20filled.png?updatedAt=1771076784587';

interface EmployerJobPosting {
    $id: string;
    employerId: string;
    jobTitle: string;
    jobDescription: string;
    employmentType: string;
    location: string;
    salaryRangeMin: number;
    salaryRangeMax: number;
    applicationDeadline?: string;
    cvRequired?: boolean;
    businessName: string;
    businessType: string;
    numberOfPositions: number;
    accommodationProvided: boolean;
    transportationProvided?: string;
    requirements: string[];
    benefits: string[];
    massageTypes?: string[];
    requiredLanguages?: string[];
    contactWhatsApp?: string;
    isActive: boolean;
    imageUrl?: string;
    country?: string;
    flightsPaidByEmployer?: boolean;
    visaArrangedByEmployer?: boolean;
    $createdAt: string;
    isVerified?: boolean;
    isUrgent?: boolean;
}

// Status for job seeking: available, busy, filled
type TherapistJobStatus = 'available' | 'busy' | 'filled';

interface TherapistJobListing {
    $id: string;
    therapistId: string;
    therapistName: string;
    gender?: string;
    age?: number;
    religion?: string;
    listingId: number;
    jobTitle: string;
    jobDescription: string;
    jobType: string;
    location?: string;
    requiredLicenses: string;
    applicationDeadline?: string;
    willingToRelocateDomestic: boolean;
    willingToRelocateInternational: boolean;
    availability: string;
    minimumSalary: string;
    preferredLocations: string;
    accommodation: string;
    experienceYears?: number;
    specializations?: string[];
    languages?: string[];
    massageTypes?: string[];
    requiredLanguages?: string[];
    workedAbroadBefore?: boolean;
    hasReferences?: boolean;
    currentlyWorking?: boolean;
    contactWhatsApp?: string;
    isActive: boolean;
    listingDate: string;
    expiryDate: string;
    profileImage?: string;
    mainImage?: string;
    experienceLevel?: 'Experienced' | 'Basic Skill' | 'Require Training';
    $createdAt: string;
    $updatedAt: string;
    isVerified?: boolean;
    isFeatured?: boolean;
    hasSafePass?: boolean;
    isMock?: boolean;
    // New fields for Trust & Performance card display
    rating?: number;
    totalReviews?: number;
    completedSessions?: number;
    yearsExperience?: number;
    status?: TherapistJobStatus;
    idVerified?: boolean;
    topRated?: boolean;
    jobSeekingActive?: boolean;
    cvFileUrl?: string;
    cvFileType?: string;
    priorityScore?: number;
}

// 3 fixed mock therapist job listings from Indonesia (Bali, Jakarta, Surabaya) – realistic data, status busy, one Position Filled
const MOCK_THERAPIST_LISTINGS: TherapistJobListing[] = [
    {
        $id: '674a0101000e64ca8d01',
        therapistId: '674a0101000e64ca8d01',
        therapistName: 'Ni Made Sari',
        listingId: 101001,
        jobTitle: 'Balinese Massage Therapist',
        jobDescription: 'Certified Balinese massage therapist with 6 years experience. Specialized in traditional Boreh and Urut techniques. Currently at a luxury spa in Ubud, seeking new opportunities in wellness resorts.',
        jobType: 'Massage Therapist',
        location: 'Ubud, Bali',
        requiredLicenses: 'Certified',
        minimumSalary: 'Rp 6.000.000',
        availability: 'full-time',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        accommodation: 'required',
        preferredLocations: 'Bali, Lombok, Jakarta',
        experienceYears: 6,
        yearsExperience: 6,
        massageTypes: ['Balinese Massage', 'Swedish Massage', 'Hot Stone', 'Aromatherapy'],
        languages: ['Indonesian', 'English', 'Balinese'],
        workedAbroadBefore: false,
        hasReferences: true,
        currentlyWorking: true,
        contactWhatsApp: '6281234567801',
        isActive: false,
        status: 'filled',
        listingDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: 'https://ik.imagekit.io/7grri5v7d/therapist%205.png',
        experienceLevel: 'Experienced',
        isVerified: true,
        isFeatured: true,
        hasSafePass: true,
        idVerified: true,
        topRated: true,
        jobSeekingActive: false,
        rating: 4.7,
        totalReviews: 48,
        completedSessions: 87,
        isMock: true,
        $createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        $updatedAt: new Date().toISOString(),
    },
    {
        $id: '674a0101000e64ca8d02',
        therapistId: '674a0101000e64ca8d02',
        therapistName: 'Budi Santoso',
        listingId: 101002,
        jobTitle: 'Sports & Deep Tissue Massage Therapist',
        jobDescription: 'Experienced sports massage therapist. Worked with athletes and corporate wellness programs. Seeking full-time position at hotel spa or fitness center in Jakarta or surrounding areas.',
        jobType: 'Massage Therapist',
        location: 'Jakarta, Indonesia',
        requiredLicenses: 'Certified',
        minimumSalary: 'Rp 7.500.000',
        availability: 'full-time',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: false,
        accommodation: 'not-required',
        preferredLocations: 'Jakarta, Tangerang, Bogor, Bandung',
        experienceYears: 5,
        yearsExperience: 5,
        massageTypes: ['Deep Tissue', 'Sports Massage', 'Swedish Massage', 'Trigger Point'],
        languages: ['Indonesian', 'English'],
        workedAbroadBefore: false,
        hasReferences: true,
        currentlyWorking: true,
        contactWhatsApp: '6281234567802',
        isActive: true,
        status: 'busy',
        jobSeekingActive: true,
        listingDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 83 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: 'https://ik.imagekit.io/7grri5v7d/therapist%203.png',
        experienceLevel: 'Experienced',
        isVerified: true,
        isFeatured: true,
        idVerified: true,
        topRated: false,
        rating: 4.8,
        totalReviews: 32,
        completedSessions: 112,
        isMock: true,
        $createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        $updatedAt: new Date().toISOString(),
    },
    {
        $id: '674a0101000e64ca8d03',
        therapistId: '674a0101000e64ca8d03',
        therapistName: 'Dewi Kusuma',
        listingId: 101003,
        jobTitle: 'Thai & Reflexology Therapist',
        jobDescription: 'Certified Thai massage and reflexology therapist. 4 years in luxury hotel spas. Open to domestic relocation. Experienced with international guests.',
        jobType: 'Massage Therapist',
        location: 'Surabaya, East Java',
        requiredLicenses: 'Certified',
        minimumSalary: 'Rp 5.500.000',
        availability: 'part-time',
        willingToRelocateDomestic: true,
        willingToRelocateInternational: true,
        accommodation: 'preferred',
        preferredLocations: 'Surabaya, Bali, Jakarta, Malang',
        experienceYears: 4,
        yearsExperience: 4,
        massageTypes: ['Thai Massage', 'Reflexology', 'Swedish Massage', 'Aromatherapy'],
        languages: ['Indonesian', 'English', 'Javanese'],
        workedAbroadBefore: false,
        hasReferences: true,
        currentlyWorking: true,
        contactWhatsApp: '6281234567803',
        isActive: true,
        status: 'busy',
        jobSeekingActive: true,
        listingDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 87 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: 'https://ik.imagekit.io/7grri5v7d/therapist%204.png',
        experienceLevel: 'Experienced',
        isVerified: true,
        isFeatured: false,
        idVerified: true,
        topRated: false,
        rating: 4.5,
        totalReviews: 18,
        completedSessions: 45,
        isMock: true,
        $createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        $updatedAt: new Date().toISOString(),
    },
];

interface MassageJobsPageProps {
    onBack: () => void;
    onPostJob: () => void;
    onNavigateToPayment?: (jobId?: string) => void;
    onApplyForJob?: (jobId: string) => void;
    onCreateTherapistProfile?: () => void;
    onNavigate?: (page: string) => void;
    t?: any;
    user?: { type?: string } | null;
    loggedInProvider?: { type?: string } | null;
}

// Premium card style - matches homepage/HowItWorks
const cardClass = 'rounded-[20px] shadow-lg border border-slate-200/80 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden';
const LISTING_FEE_THERAPIST = 150000;
const LISTING_FEE_EMPLOYER = 170000;

const MassageJobsPage: React.FC<MassageJobsPageProps> = ({ 
    onBack, 
    onPostJob, 
    onNavigateToPayment, 
    onApplyForJob,
    onCreateTherapistProfile,
    onNavigate,
    t,
    user,
    loggedInProvider,
}) => {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'find-professionals' | 'post-job'>('find-professionals');
    const [jobPostings, setJobPostings] = useState<EmployerJobPosting[]>([]);
    const [therapistListings, setTherapistListings] = useState<TherapistJobListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filtersOpen, setFiltersOpen] = useState(false);
    // Filters for Find Professionals (therapists)
    const [filterLocation, setFilterLocation] = useState<string>('all');
    const [filterExperience, setFilterExperience] = useState<string>('all');
    const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
    const [filterMassageType, setFilterMassageType] = useState<string>('all');
    const [filterAvailability, setFilterAvailability] = useState<string>('all');
    // Filters for Post a Job (employer jobs)
    const [filterJobLocation, setFilterJobLocation] = useState<string>('all');
    const [filterJobType, setFilterJobType] = useState<string>('all');
    const [filterSalaryRange, setFilterSalaryRange] = useState<string>('all');
    const [filterVerifiedEmployers, setFilterVerifiedEmployers] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authModalContext, setAuthModalContext] = useState<'employer' | 'therapist'>('employer');
    
    const isEmployer = !!user && (user as any).type === 'employer';
    const isServicePersonnel = !!(user && ((user as any).type === 'therapist' || (user as any).type === 'place')) || 
        !!(loggedInProvider && ((loggedInProvider as any).type === 'therapist' || (loggedInProvider as any).type === 'place'));
    
    const handlePostJobClick = () => {
        if (!isEmployer) {
            setAuthModalContext('employer');
            setShowAuthModal(true);
        } else {
            onPostJob();
        }
    };
    const handleListAvailabilityClick = () => {
        if (!isServicePersonnel) {
            setAuthModalContext('therapist');
            setShowAuthModal(true);
        } else {
            onCreateTherapistProfile?.();
        }
    };
    
    // Mock job posting data for display
    const mockJobPosting: EmployerJobPosting = {
        $id: 'mock-job-001',
        employerId: 'mock-employer-001',
        jobTitle: 'Senior Balinese Massage Therapist',
        jobDescription: 'Join our luxury resort spa team in beautiful Ubud, Bali. We are seeking an experienced massage therapist specialized in traditional Balinese healing techniques. Perfect for those who want to work in a serene environment with international guests.',
        employmentType: 'full-time',
        location: 'Ubud, Bali',
        salaryRangeMin: 8000000,
        salaryRangeMax: 12000000,
        applicationDeadline: undefined,
        cvRequired: true,
        businessName: 'Sanctuary Spa Resort Bali',
        businessType: 'resort',
        numberOfPositions: 2,
        accommodationProvided: true,
        transportationProvided: 'flight',
        requirements: ['Certified massage therapist', 'Balinese massage expertise', 'English speaking', 'Minimum 3 years experience'],
        benefits: ['Accommodation provided', 'Meals included', 'Flight tickets paid', 'Health insurance', 'Professional development'],
        massageTypes: ['Traditional Balinese', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'],
        requiredLanguages: ['English', 'Indonesian (Bahasa Indonesia)'],
        contactWhatsApp: '6281234567890',
        isActive: true,
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea.png?updatedAt=1761591108161',
        country: 'Indonesia',
        flightsPaidByEmployer: true,
        visaArrangedByEmployer: false,
        $createdAt: new Date().toISOString()
    };
    
    useEffect(() => {
        fetchJobPostings();
    }, [filterJobType, filterVerifiedEmployers]);

    useEffect(() => {
        fetchTherapistListings();
    }, [filterExperience, filterAvailability, filterVerifiedOnly]);

    const fetchJobPostings = async () => {
        setIsLoading(true);
        try {
            // Fetch active and filled (filled = deactivated by employer, show with "Position Filled" badge)
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(100),
            ];
            if (filterJobType !== 'all') {
                queries.push(Query.equal('employmentType', filterJobType));
            }
            if (filterVerifiedEmployers) {
                queries.push(Query.equal('isVerified', true));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.employerJobPostings,
                queries
            );
            const postings = response.documents as unknown as EmployerJobPosting[];
            setJobPostings(postings);
        } catch (error: any) {
            if (error?.code === 401 || error?.code === 404) {
                console.warn('Appwrite: Ensure employer_job_postings exists with read(any) permission');
                setJobPostings([]);
            } else {
                console.error('Error fetching job postings:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTherapistListings = async () => {
        setIsLoading(true);
        try {
            const queries = [
                Query.orderDesc('$createdAt'),
                Query.limit(100),
            ];
            if (filterExperience !== 'all') {
                queries.push(Query.equal('experienceLevel', filterExperience));
            }
            if (filterAvailability !== 'all') {
                queries.push(Query.equal('availability', filterAvailability));
            }
            if (filterVerifiedOnly) {
                queries.push(Query.equal('isVerified', true));
            }

            const listingsRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.therapistJobListings, queries);
            const listings = listingsRes.documents as unknown as TherapistJobListing[];

            // Real listings first, then 3 fixed mock listings (Bali, Jakarta, Surabaya) – mocks move down when real ones exist
            setTherapistListings([...listings, ...MOCK_THERAPIST_LISTINGS]);
        } catch (error: any) {
            if (error?.code === 401 || error?.code === 404) {
                console.warn('Appwrite: Ensure therapist_job_listings exists with read(any) permission');
                setTherapistListings([]);
            } else {
                console.error('Error fetching therapist listings:', error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPostings = [mockJobPosting, ...jobPostings.filter(posting => {
        const status = (posting as any).status;
        if (status === 'pending_payment' || status === 'pending_approval') return false;
        const matchesSearch = !searchQuery.trim() ||
            posting.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            posting.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            posting.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (posting.location || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterJobType === 'all' || posting.employmentType === filterJobType || posting.businessType === filterJobType;
        const matchesLocation = filterJobLocation === 'all' || (posting.location || '').toLowerCase().includes(filterJobLocation.toLowerCase());
        const matchesVerified = !filterVerifiedEmployers || posting.isVerified === true;
        const maxSal = posting.salaryRangeMax || 0;
        const matchesSalary = filterSalaryRange === 'all' ||
            (filterSalaryRange === 'low' && maxSal < 5_000_000) ||
            (filterSalaryRange === 'mid' && maxSal >= 5_000_000 && maxSal <= 15_000_000) ||
            (filterSalaryRange === 'high' && maxSal > 15_000_000);
        return matchesSearch && matchesType && matchesLocation && matchesVerified && matchesSalary;
    })];
    const activePostings = filteredPostings.filter(p => (p as any).status !== 'filled');
    const filledPostings = filteredPostings.filter(p => (p as any).status === 'filled');

    const filteredTherapistListings = therapistListings.filter(listing => {
        const matchesSearch = !searchQuery.trim() ||
            (listing.therapistName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (listing.jobTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (listing.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (listing.massageTypes || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesLocation = filterLocation === 'all' || (listing.location || listing.preferredLocations || '').toLowerCase().includes(filterLocation.toLowerCase());
        const matchesExperience = filterExperience === 'all' || listing.experienceLevel === filterExperience;
        const matchesVerified = !filterVerifiedOnly || listing.isVerified === true;
        const matchesMassageType = filterMassageType === 'all' || (listing.massageTypes || []).some((t: string) => t.toLowerCase().includes(filterMassageType.toLowerCase()));
        const matchesAvailability = filterAvailability === 'all' || (listing.availability || '').toLowerCase().includes(filterAvailability.toLowerCase());
        
        return matchesSearch && matchesLocation && matchesExperience && matchesVerified && matchesMassageType && matchesAvailability;
    });

    // When 5+ real therapist job listings exist, all mocks show Position Filled + deactivated View Profile
    const realListingCount = therapistListings.filter(l => !l.isMock).length;
    const isEffectivelyDeactivated = (listing: TherapistJobListing) =>
        listing.status === 'filled' || !listing.isActive || (listing.isMock && realListingCount >= 5);

    // Sorting: real first, jobSeekingActive, higher rating, higher completedSessions, newest, mocks last
    const sortedTherapistListings = [...filteredTherapistListings].sort((a, b) => {
        if (a.isMock && !b.isMock) return 1;
        if (!a.isMock && b.isMock) return -1;
        const aActive = a.jobSeekingActive !== false;
        const bActive = b.jobSeekingActive !== false;
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        const aRating = a.rating ?? 0;
        const bRating = b.rating ?? 0;
        if (aRating !== bRating) return bRating - aRating;
        const aSessions = a.completedSessions ?? 0;
        const bSessions = b.completedSessions ?? 0;
        if (aSessions !== bSessions) return bSessions - aSessions;
        const aDate = new Date(a.$createdAt || 0).getTime();
        const bDate = new Date(b.$createdAt || 0).getTime();
        return bDate - aDate;
    });

    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const LOCATIONS = [
        { value: 'all', label: 'All locations' },
        { value: 'Bali', label: 'Bali' }, { value: 'Ubud', label: 'Ubud' }, { value: 'Seminyak', label: 'Seminyak' },
        { value: 'Jakarta', label: 'Jakarta' }, { value: 'Surabaya', label: 'Surabaya' }, { value: 'Lombok', label: 'Lombok' },
    ];
    const EXPERIENCE_OPTIONS = [
        { value: 'all', label: 'All levels' },
        { value: 'Experienced', label: 'Experienced' },
        { value: 'Basic Skill', label: 'Basic Skill' },
        { value: 'Require Training', label: 'Require Training' },
    ];
    const JOB_TYPES = [
        { value: 'all', label: 'All types' },
        { value: 'full-time', label: 'Full-time' },
        { value: 'part-time', label: 'Part-time' },
        { value: 'contract', label: 'Contract' },
    ];
    const MASSAGE_TYPES = [
        { value: 'all', label: 'All types' },
        { value: 'Balinese', label: 'Balinese' }, { value: 'Swedish', label: 'Swedish' },
        { value: 'Deep Tissue', label: 'Deep Tissue' }, { value: 'Hot Stone', label: 'Hot Stone' },
    ];

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
            {/* Header - Same as Home Page */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span><span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <button 
                        onClick={() => onNavigate && onNavigate('home')}
                        className="p-2 hover:bg-orange-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Home"
                    >
                        <Home className="w-6 h-6 text-orange-600" />
                    </button>
                </div>
            </header>

            {/* Global App Drawer - Reuse HomePage drawer */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={onNavigate}
                    language={language as 'en' | 'id' | 'gb'}
                />
            </React19SafeWrapper>

            <main className="p-4 bg-white min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
                <div className="max-w-7xl mx-auto">

                    {/* Professional Positioning Text - Work Marketplace */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            {t?.jobs?.workMarketplace || 'Work Marketplace'}
                        </h2>
                        <p className="text-lg text-primary-600 font-medium mb-2">
                            {t?.jobs?.connectingWellness || 'Connecting Wellness Businesses with Qualified Professionals.'}
                        </p>
                        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-2">
                            {t?.jobs?.marketplaceSubtext || 'Post opportunities or showcase your availability in a structured, professional environment designed for the global massage and skin care industry.'}
                        </p>
                        <p className="text-xs text-slate-500">
                            {t?.jobs?.listingFees || `Therapist listing: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(LISTING_FEE_THERAPIST)} • Employer job: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(LISTING_FEE_EMPLOYER)}`}
                        </p>
                    </div>

                    {/* Main Tab Navigation - Find Professionals | Post a Job */}
                    <div className="flex bg-slate-100 p-2 rounded-[20px] mb-6 gap-2">
                        <button
                            onClick={() => setActiveTab('find-professionals')}
                            className={`flex-1 py-3 px-6 rounded-[18px] text-sm font-semibold transition-all ${activeTab === 'find-professionals' ? 'bg-white text-primary-600 shadow-md border border-slate-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {t?.jobs?.findProfessionals || 'Find Professionals'}
                        </button>
                        <button
                            onClick={() => setActiveTab('post-job')}
                            className={`flex-1 py-3 px-6 rounded-[18px] text-sm font-semibold transition-all ${activeTab === 'post-job' ? 'bg-white text-primary-600 shadow-md border border-slate-200/80' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                            {t?.jobs?.postJob || 'Post a Job'}
                        </button>
                    </div>

                    {/* Hero Action - Post Job / List Availability */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={() => {
                                if (activeTab === 'post-job') {
                                    handlePostJobClick();
                                } else if (onCreateTherapistProfile) {
                                    handleListAvailabilityClick();
                                }
                            }}
                            className="flex items-center gap-2 py-3 px-6 bg-primary-500 text-white shadow-lg rounded-full transition-all duration-200 text-sm font-semibold whitespace-nowrap hover:bg-primary-600 hover:shadow-xl"
                        >
                            <span>{activeTab === 'post-job' ? (t?.jobs?.postJob || 'Post a Job') : (t?.jobs?.listAvailability || 'List Availability')}</span>
                        </button>
                    </div>

                    {/* Search + Filters */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'find-professionals' ? (t?.jobs?.searchProfessionals || 'Search professionals...') : (t?.jobs?.searchJobs || 'Search jobs...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                            />
                        </div>
                        <button
                            onClick={() => setFiltersOpen(!filtersOpen)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-all ${filtersOpen ? 'bg-primary-50 border-primary-200 text-primary-600' : 'bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                            {t?.jobs?.filters || 'Filters'}
                        </button>
                    </div>

                    {/* Filter Panel - collapses on mobile */}
                    {filtersOpen && (
                        <div className="mb-6 p-5 rounded-[20px] border border-slate-200/80 bg-slate-50/50">
                            {activeTab === 'find-professionals' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.location || 'Location'}</label>
                                        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            {LOCATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.experienceLevel || 'Experience'}</label>
                                        <select value={filterExperience} onChange={(e) => setFilterExperience(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            {EXPERIENCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.massageType || 'Massage type'}</label>
                                        <select value={filterMassageType} onChange={(e) => setFilterMassageType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            {MASSAGE_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.availability || 'Availability'}</label>
                                        <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            <option value="all">{t?.jobs?.all || 'All'}</option>
                                            <option value="available">Available</option>
                                            <option value="part-time">Part-time</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={filterVerifiedOnly} onChange={(e) => setFilterVerifiedOnly(e.target.checked)} className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                                            <span className="text-sm font-medium text-slate-700">{t?.jobs?.verifiedOnly || 'Verified only'}</span>
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.location || 'Location'}</label>
                                        <select value={filterJobLocation} onChange={(e) => setFilterJobLocation(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            {LOCATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.jobType || 'Job type'}</label>
                                        <select value={filterJobType} onChange={(e) => setFilterJobType(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            {JOB_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">{t?.jobs?.salaryRange || 'Salary range'}</label>
                                        <select value={filterSalaryRange} onChange={(e) => setFilterSalaryRange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm">
                                            <option value="all">{t?.jobs?.all || 'All'}</option>
                                            <option value="low">Under 5M IDR</option>
                                            <option value="mid">5M - 15M IDR</option>
                                            <option value="high">Over 15M IDR</option>
                                        </select>
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={filterVerifiedEmployers} onChange={(e) => setFilterVerifiedEmployers(e.target.checked)} className="rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
                                            <span className="text-sm font-medium text-slate-700">{t?.jobs?.verifiedEmployersOnly || 'Verified employers only'}</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

            {/* Content - Tab-specific */}
            <div className="pb-8">
                {/* Find Professionals: therapist listings | Post a Job: employer job postings */}
                {activeTab === 'post-job' ? (
                    /* Post a Job - Employer Job Listings */
                    <>
            <div className="py-4">
                <p className="text-slate-700 text-sm sm:text-base font-medium">
                    <span className="font-bold text-primary-600 text-lg">{filteredPostings.length}</span> {filteredPostings.length !== 1 ? (t?.jobs?.jobsFoundPlural || 'jobs') : (t?.jobs?.jobsFound || 'job')} {t?.jobs?.found || 'found'}
                </p>
            </div>
                {isLoading ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
                        <p className="text-gray-700 mt-4 font-medium">{t?.jobs?.loadingJobs || 'Loading job opportunities...'}</p>
                    </div>
                ) : filteredPostings.length === 0 ? (
                    <div className="text-center py-16 rounded-[20px] border border-slate-200/80 bg-white shadow-lg">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">{t?.jobs?.noJobsYet || 'Be the first to post in this area.'}</h3>
                        <p className="text-slate-600 mb-6">{t?.jobs?.noJobsDesc || 'Post your job listing and connect with qualified professionals.'}</p>
                        <button onClick={handlePostJobClick} className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all">
                            {t?.jobs?.postJob || 'Post a Job'}
                        </button>
                    </div>
                ) : (
                    <>
                    {/* Active listings */}
                    {activePostings.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-slate-800 mb-3">{t?.jobs?.activeListings ?? 'Active listings'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePostings.map((posting) => {
                            const jobImageUrl = (posting as any).imageurl || (posting as any).imageUrl || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';
                            const isPositionFilled = (posting as any).status === 'filled';
                            return (
                            <div key={posting.$id} className={cardClass}>
                                <div className="relative w-full h-40 overflow-hidden rounded-t-[20px] bg-slate-100">
                                    <img src={jobImageUrl} alt={posting.businessName} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
                                        {posting.isUrgent && <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">URGENT</span>}
                                        {posting.isVerified && <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">VERIFIED</span>}
                                        {!posting.isVerified && !posting.isUrgent && (
                                            <span className="px-2.5 py-1 bg-slate-700 text-white text-xs font-semibold rounded-lg">NEW</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{posting.businessName}</h3>
                                    <p className="text-sm text-slate-600 mb-2 flex items-center gap-1">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                        {posting.location}
                                    </p>
                                    <p className="text-base font-semibold text-primary-600 mb-2">{posting.jobTitle}</p>
                                    <p className="text-sm text-slate-600 mb-2">
                                        {posting.employmentType?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        {posting.numberOfPositions > 0 && ` • ${posting.numberOfPositions} ${posting.numberOfPositions > 1 ? (t?.jobs?.positionsPlural || 'positions') : (t?.jobs?.positions || 'position')}`}
                                    </p>
                                    {(posting.salaryRangeMin > 0 || posting.salaryRangeMax > 0) && (
                                        <p className="text-sm font-medium text-slate-800 mb-2">
                                            {formatSalary(posting.salaryRangeMin)} – {formatSalary(posting.salaryRangeMax)}
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{posting.jobDescription}</p>
                                    {posting.$createdAt && (
                                        <p className="text-xs text-slate-500 mb-3">
                                            {new Date(posting.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    )}
                                    {!posting.isVerified && (
                                        <p className="text-xs text-slate-500 mb-3">{t?.jobs?.livePendingVerification || 'Live – Pending Admin Verification'}</p>
                                    )}
                                    <button
                                        onClick={() => onApplyForJob?.(posting.$id)}
                                        className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200"
                                    >
                                        {t?.jobs?.apply || 'Apply'}
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    )}
                    {/* Position filled listings */}
                    {filledPostings.length > 0 && (
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 mb-3">{t?.jobs?.positionFilled ?? 'Position filled'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filledPostings.map((posting) => {
                            const jobImageUrl = (posting as any).imageurl || (posting as any).imageUrl || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';
                            const isPositionFilled = (posting as any).status === 'filled';
                            return (
                            <div key={posting.$id} className={`${cardClass} ${isPositionFilled ? 'opacity-90' : ''}`}>
                                {/* Image + Top corner tag: Position Filled badge or NEW/VERIFIED/URGENT */}
                                <div className="relative w-full h-40 overflow-hidden rounded-t-[20px] bg-slate-100">
                                    <img src={jobImageUrl} alt={posting.businessName} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 flex gap-2 flex-wrap justify-end">
                                        {isPositionFilled && (
                                            <img src={POSITION_FILLED_BADGE_URL} alt={t?.jobs?.positionFilled ?? 'Position Filled'} className="h-8 w-auto object-contain" title={t?.jobs?.positionFilled ?? 'Position Filled'} />
                                        )}
                                        {!isPositionFilled && posting.isUrgent && <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">URGENT</span>}
                                        {!isPositionFilled && posting.isVerified && <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">VERIFIED</span>}
                                        {!isPositionFilled && !posting.isVerified && !posting.isUrgent && (
                                            <span className="px-2.5 py-1 bg-slate-700 text-white text-xs font-semibold rounded-lg">NEW</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="p-5">
                                    {/* Company name + Location */}
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 truncate">{posting.businessName}</h3>
                                    <p className="text-sm text-slate-600 mb-2 flex items-center gap-1">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                        {posting.location}
                                    </p>

                                    {/* Position title + Job type */}
                                    <p className="text-base font-semibold text-primary-600 mb-2">{posting.jobTitle}</p>
                                    <p className="text-sm text-slate-600 mb-2">
                                        {posting.employmentType?.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        {posting.numberOfPositions > 0 && ` • ${posting.numberOfPositions} ${posting.numberOfPositions > 1 ? (t?.jobs?.positionsPlural || 'positions') : (t?.jobs?.positions || 'position')}`}
                                    </p>

                                    {/* Salary range (optional) */}
                                    {(posting.salaryRangeMin > 0 || posting.salaryRangeMax > 0) && (
                                        <p className="text-sm font-medium text-slate-800 mb-2">
                                            {formatSalary(posting.salaryRangeMin)} – {formatSalary(posting.salaryRangeMax)}
                                        </p>
                                    )}

                                    {/* Short description preview - 2 lines */}
                                    <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{posting.jobDescription}</p>

                                    {/* Posted time */}
                                    {posting.$createdAt && (
                                        <p className="text-xs text-slate-500 mb-3">
                                            {new Date(posting.$createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    )}

                                    {/* Verification hint for unverified */}
                                    {!posting.isVerified && (
                                        <p className="text-xs text-slate-500 mb-3">{t?.jobs?.livePendingVerification || 'Live – Pending Admin Verification'}</p>
                                    )}

                                    {/* Apply Button or Position Filled */}
                                    {isPositionFilled ? (
                                        <div className="w-full py-2.5 px-4 bg-slate-300 text-slate-600 font-semibold rounded-xl text-center cursor-not-allowed">
                                            {t?.jobs?.positionFilled ?? 'Position Filled'}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => onApplyForJob?.(posting.$id)}
                                            className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-all duration-200"
                                        >
                                            {t?.jobs?.apply || 'Apply'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </div>
                    )}
                    </>
                )}
                </>
                ) : (
                /* Find Professionals - Therapist Listings */
                    <div className="max-w-7xl mx-auto px-4 pb-8">
                        <div className="py-4 mb-4">
                            <p className="text-slate-700 text-sm sm:text-base font-medium">
                                <span className="font-bold text-primary-600 text-lg">{filteredTherapistListings.length}</span> {filteredTherapistListings.length !== 1 ? (t?.jobs?.professionalsFound || 'professionals') : (t?.jobs?.professionalFound || 'professional')} {t?.jobs?.found || 'found'}
                            </p>
                        </div>

                        {/* Employer: Contact all professionals – 250k for 1 month */}
                        <div className="mb-6 rounded-[20px] shadow-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{t?.jobs?.employerAccessTitle || 'Want to hire? Contact every professional on this page'}</h3>
                            <p className="text-sm text-slate-700 mb-4 leading-relaxed">
                                {t?.jobs?.employerAccessDescription || 'One-time fee for 1 month. You get full access to every job seeker listed here: detailed professional profiles, experience and skills, direct WhatsApp number for each therapist, and in most cases their CV or resume. Reach out to as many as you need to find the right fit.'}
                            </p>
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xs font-medium text-slate-500 uppercase">{t?.jobs?.employerAccessFeeLabel || 'One-time fee'}</span>
                                    <span className="text-xl font-bold text-orange-600">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(EMPLOYER_ACCESS_FEE_IDR)}
                                    </span>
                                    <span className="text-sm text-slate-600">/ {t?.jobs?.employerAccessDuration || '1 month'}</span>
                                </div>
                                <a
                                    href="https://wa.me/6281392000050?text=Hi%2C%20I%20would%20like%20to%20get%20access%20to%20contact%20all%20professionals%20on%20the%20Massage%20Jobs%20page%20(250k%20for%201%20month)."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all whitespace-nowrap inline-flex items-center gap-2"
                                >
                                    {t?.jobs?.employerAccessCta || 'Get access'}
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* Therapists Looking for Work - List availability CTA */}
                        <div className="mb-6 rounded-[20px] shadow-lg border border-slate-200/80 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{t?.jobs?.therapistsLookingForWork || 'Therapists Looking for Work'}</h3>
                                <p className="text-sm text-slate-600">{t?.jobs?.ctaDescription || `Create your professional profile and connect with employers. Listing fee: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(LISTING_FEE_THERAPIST)}`}</p>
                            </div>
                            <button
                                onClick={handleListAvailabilityClick}
                                className="px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all whitespace-nowrap"
                            >
                                {t?.jobs?.listAvailability || 'List Availability'}
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">{t?.jobs?.loadingProfiles || 'Loading therapist profiles...'}</p>
                            </div>
                        ) : filteredTherapistListings.length === 0 ? (
                            <div className="text-center py-16 rounded-[20px] border border-slate-200/80 bg-white shadow-lg">
                                <div className="max-w-md mx-auto px-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{t?.jobs?.noTherapistsYet || 'Be the first to post in this area.'}</h3>
                                    <p className="text-slate-600 mb-6">
                                        {t?.jobs?.noTherapistsDesc || 'List your availability and connect with wellness employers.'}
                                    </p>
                                    <button
                                        onClick={handleListAvailabilityClick}
                                        className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
                                    >
                                        {t?.jobs?.listAvailability || 'List Availability'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sortedTherapistListings.map((listing) => {
                                    const profileImg = listing.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.therapistName || '?')}&background=f97316&color=fff&size=256`;
                                    const deactivated = isEffectivelyDeactivated(listing);
                                    const effectiveStatus: TherapistJobStatus = deactivated ? 'filled' : (listing.status || (listing.currentlyWorking ? 'busy' : 'available'));
                                    const yearsExp = listing.yearsExperience ?? listing.experienceYears ?? 0;
                                    const primarySpec = listing.jobTitle || listing.massageTypes?.[0] || 'Professional';
                                    return (
                                    <div key={listing.$id} className={`${cardClass} ${deactivated ? 'opacity-85 saturate-75' : ''}`}>
                                        {/* TOP: Profile Image, Full Name, Location, Primary Specialization */}
                                        <div className="p-5 pb-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-200/80">
                                                    <img src={profileImg} alt={listing.therapistName} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">{listing.therapistName}</h3>
                                                <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <span className="truncate">{listing.location || listing.preferredLocations || 'Indonesia'}</span>
                                                </p>
                                                <p className="text-sm font-semibold text-primary-600 mt-1">{primarySpec}</p>
                                            </div>
                                            {deactivated && (
                                                <img src="https://ik.imagekit.io/7grri5v7d/position%20filled.png" alt="Position Filled" className="w-14 h-14 flex-shrink-0 object-contain" title="Position Filled" />
                                            )}
                                        </div>

                                        {/* TRUST & PERFORMANCE: Rating, Sessions, Years */}
                                        <div className="px-5 py-3 flex flex-wrap gap-3 text-sm text-slate-600">
                                            {listing.totalReviews && listing.totalReviews > 0 && (listing.rating ?? 0) > 0 ? (
                                                <span className="flex items-center gap-1">⭐ {listing.rating?.toFixed(1)} ({listing.totalReviews} {t?.jobs?.reviews || 'Reviews'})</span>
                                            ) : (
                                                <span className="text-amber-600 font-medium">{t?.jobs?.newTherapist || 'New Therapist'}</span>
                                            )}
                                            {(listing.completedSessions ?? 0) > 0 && (
                                                <span className="flex items-center gap-1">🧾 {listing.completedSessions} {t?.jobs?.sessionsCompleted || 'Sessions Completed'}</span>
                                            )}
                                            {yearsExp > 0 && (
                                                <span className="flex items-center gap-1">⏳ {yearsExp} {t?.jobs?.yearsExperience || 'Years Experience'}</span>
                                            )}
                                        </div>

                                        {/* VERIFICATION BADGES – small icons row */}
                                        <div className="px-5 pb-2 flex flex-wrap gap-2">
                                            {listing.isVerified && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded" title="Verified Therapist">✓ Verified</span>}
                                            {listing.idVerified && <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">ID Verified</span>}
                                            {listing.topRated && <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded">Top Rated</span>}
                                            {listing.hasSafePass && <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded">Safe Pass</span>}
                                            {!listing.isVerified && !listing.idVerified && !listing.topRated && !listing.hasSafePass && (
                                                <span className="px-2 py-0.5 bg-slate-500 text-white text-[10px] font-semibold rounded">Pending</span>
                                            )}
                                        </div>

                                        {/* STATUS BADGE – clear & visible */}
                                        <div className="px-5 pb-3">
                                            {effectiveStatus === 'available' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-sm rounded-full">🟢 {t?.jobs?.available || 'Available'}</span>
                                            )}
                                            {effectiveStatus === 'busy' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 font-semibold text-sm rounded-full">🟡 {t?.jobs?.busy || 'Busy'}</span>
                                            )}
                                            {effectiveStatus === 'filled' && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 font-semibold text-sm rounded-full">🔴 {t?.jobs?.positionFilled || 'Position Filled'}</span>
                                            )}
                                        </div>
                                        
                                        <div className="p-5 pt-0">
                                            {/* Short intro – 2 lines */}
                                            {(listing.jobDescription || listing.availability) && (
                                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">{listing.jobDescription || listing.availability}</p>
                                            )}
                                            {!listing.isVerified && (
                                                <p className="text-xs text-slate-500 mb-3">{t?.jobs?.livePendingVerification || 'Live – Pending Admin Verification'}</p>
                                            )}

                                            {/* View Profile – disabled when filled */}
                                            <ViewProfileButton
                                                onClick={() => {
                                                    if (deactivated) return;
                                                    const therapistId = listing.therapistId || listing.$id;
                                                    const slug = (listing.therapistName || 'therapist').toLowerCase().replace(/\s+/g, '-');
                                                    window.history.pushState({}, '', `/#/therapist-profile/${therapistId}-${slug}`);
                                                    onNavigate?.('shared-therapist-profile');
                                                }}
                                                disabled={deactivated}
                                                className={`w-full py-2.5 px-4 text-sm rounded-xl ${deactivated ? 'bg-slate-300 cursor-not-allowed' : ''}`}
                                                ariaLabel={t?.jobs?.viewProfile || 'View Profile'}
                                            />
                                            {listing.contactWhatsApp && !deactivated && (
                                                <button
                                                    onClick={() => window.open(`https://wa.me/${listing.contactWhatsApp.replace(/\D/g, '')}`, '_blank')}
                                                    className="w-full mt-2 py-2 px-4 border border-primary-500 text-primary-600 font-semibold text-sm rounded-xl hover:bg-primary-50 transition-colors"
                                                >
                                                    {t?.jobs?.contact || 'Contact'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
                </div>
            </div>
            </main>

            {/* Auth Required Modal - Create Account / Login */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAuthModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-500"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-slate-900 mb-3 pr-8">Create Your Professional Account</h3>
                        <p className="text-slate-600 text-sm mb-6">
                            To maintain platform integrity and protect both employers and professionals, job listings can only be posted by registered IndaStreet members.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setShowAuthModal(false);
                                    onNavigate?.(authModalContext === 'employer' ? 'create-account-employer' : 'createAccount');
                                }}
                                className="w-full py-3 px-4 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
                            >
                                Create Account
                            </button>
                            <button
                                onClick={() => {
                                    setShowAuthModal(false);
                                    onNavigate?.(authModalContext === 'employer' ? 'employer-job-posting' : 'therapist-job-registration');
                                }}
                                className="w-full py-3 px-4 border-2 border-primary-500 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MassageJobsPage;

