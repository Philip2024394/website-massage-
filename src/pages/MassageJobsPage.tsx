// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import { Home, SlidersHorizontal, Search } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

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
}

interface MassageJobsPageProps {
    onBack: () => void;
    onPostJob: () => void;
    onNavigateToPayment?: (jobId?: string) => void;
    onApplyForJob?: (jobId: string) => void;
    onCreateTherapistProfile?: () => void;
    onNavigate?: (page: string) => void;
    t?: any;
}

// Premium card style - matches homepage/HowItWorks
const cardClass = 'rounded-[20px] shadow-lg border border-slate-200/80 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden';
const LISTING_FEE_THERAPIST = 150000;
const LISTING_FEE_EMPLOYER = 250000;

const MassageJobsPage: React.FC<MassageJobsPageProps> = ({ 
    onBack, 
    onPostJob, 
    onNavigateToPayment, 
    onApplyForJob,
    onCreateTherapistProfile,
    onNavigate,
    t
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
            const queries = [
                Query.equal('status', 'active'),
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
                Query.equal('isActive', true),
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

            let mockListings: TherapistJobListing[] = [];
            try {
                const therapistsRes = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.therapists || 'therapists_collection_id',
                    [Query.limit(5)]
                );
                // 5 mock listings from real therapists – View Profile works (uses therapist ID from therapists collection)
                mockListings = (therapistsRes.documents || []).slice(0, 5).map((t: any) => ({
                $id: `mock-${t.$id}`,
                therapistId: t.$id,
                therapistName: t.name || t.email?.split('@')[0] || 'Therapist',
                hasSafePass: t.hotelVillaSafePassStatus === 'active' || t.hasSafePassVerification === true,
                jobTitle: t.specialization || 'Massage Therapist',
                jobDescription: t.description || 'Experienced massage therapist seeking opportunities.',
                jobType: t.specialization || 'Massage Therapist',
                listingId: Math.floor(Math.random() * 900000) + 100000,
                minimumSalary: 'Negotiable',
                availability: 'full-time',
                willingToRelocateDomestic: true,
                willingToRelocateInternational: false,
                accommodation: 'not-required',
                preferredLocations: (t.location || t.city || 'Bali, Indonesia') as string,
                isActive: true,
                listingDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                profileImage: t.profilePicture || t.mainImage || 'https://ik.imagekit.io/7grri5v7d/massage%20solo.png',
                experienceLevel: 'Experienced' as const,
                massageTypes: (t.specialization ? [t.specialization] : ['Balinese Massage', 'Swedish Massage']),
                isVerified: t.isVerified ?? true,
                isFeatured: true,
                $createdAt: t.$createdAt || new Date().toISOString(),
                $updatedAt: t.$updatedAt || new Date().toISOString(),
            }));
            } catch (_e) {
                // Therapists fetch failed – skip mock listings
            }

            setTherapistListings([...mockListings, ...listings]);
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
                                    onPostJob();
                                } else if (onCreateTherapistProfile) {
                                    onCreateTherapistProfile();
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
                        <button onClick={onPostJob} className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all">
                            {t?.jobs?.postJob || 'Post a Job'}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPostings.map((posting) => {
                            const jobImageUrl = (posting as any).imageurl || (posting as any).imageUrl || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';
                            
                            return (
                            <div key={posting.$id} className={cardClass}>
                                {/* Image + Top corner tag NEW/VERIFIED/URGENT */}
                                <div className="relative w-full h-40 overflow-hidden rounded-t-[20px] bg-slate-100">
                                    <img src={jobImageUrl} alt={posting.businessName} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {posting.isUrgent && <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg">URGENT</span>}
                                        {posting.isVerified && <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">VERIFIED</span>}
                                        {!posting.isVerified && !posting.isUrgent && (
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

                                    {/* Apply Button */}
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

                        {/* Therapists Looking for Work - List availability CTA */}
                        <div className="mb-6 rounded-[20px] shadow-lg border border-slate-200/80 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{t?.jobs?.therapistsLookingForWork || 'Therapists Looking for Work'}</h3>
                                <p className="text-sm text-slate-600">{t?.jobs?.ctaDescription || `Create your professional profile and connect with employers. Listing fee: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(LISTING_FEE_THERAPIST)}`}</p>
                            </div>
                            <button
                                onClick={() => onCreateTherapistProfile?.()}
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
                                        onClick={() => onCreateTherapistProfile?.()}
                                        className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-all"
                                    >
                                        {t?.jobs?.listAvailability || 'List Availability'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredTherapistListings.map((listing) => {
                                    const profileImg = listing.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(listing.therapistName || '?')}&background=f97316&color=fff&size=256`;
                                    return (
                                    <div key={listing.$id} className={cardClass}>
                                        {/* Profile image only – circular avatar, no main image */}
                                        <div className="p-5 pb-0 flex items-center gap-4">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-200/80">
                                                    <img src={profileImg} alt={listing.therapistName} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 flex flex-wrap gap-1 max-w-[140px] justify-end">
                                                    {listing.isVerified && <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded">VERIFIED</span>}
                                                    {listing.hasSafePass && <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded">SAFE PASS</span>}
                                                    {listing.isFeatured && !listing.isVerified && <span className="px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded">FEATURED</span>}
                                                    {!listing.isVerified && !listing.isFeatured && !listing.hasSafePass && <span className="px-2 py-0.5 bg-slate-600 text-white text-[10px] font-semibold rounded">PENDING</span>}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-slate-900 truncate">{listing.therapistName}</h3>
                                                <p className="text-sm text-slate-600 mt-0.5 flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    <span className="truncate">{listing.location || listing.preferredLocations || '—'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="p-5 pt-4">
                                            {/* Specialty / Job title */}
                                            <p className="text-base font-semibold text-primary-600 mb-2">{listing.jobTitle || (listing.massageTypes?.[0] || 'Professional')}</p>
                                            
                                            {/* Experience + availability – similar to job type */}
                                            <p className="text-sm text-slate-600 mb-2">
                                                {listing.experienceYears !== undefined ? `${listing.experienceYears} years` : ''}
                                                {listing.experienceYears !== undefined && listing.experienceLevel ? ' • ' : ''}
                                                {listing.experienceLevel || ''}
                                                {listing.availability ? ` • ${listing.availability}` : ''}
                                            </p>

                                            {/* Specialties – max 3 tags */}
                                            {(listing.massageTypes && listing.massageTypes.length > 0) && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {listing.massageTypes.slice(0, 3).map((type, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/80">
                                                            {type}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Short intro – 2 lines, same as Post Job description */}
                                            {(listing.jobDescription || listing.availability) && (
                                                <p className="text-sm text-slate-600 mb-3 line-clamp-2 leading-relaxed">{listing.jobDescription || listing.availability}</p>
                                            )}

                                            {/* Verification hint */}
                                            {!listing.isVerified && (
                                                <p className="text-xs text-slate-500 mb-3">{t?.jobs?.livePendingVerification || 'Live – Pending Admin Verification'}</p>
                                            )}

                                            {/* View Profile + Contact – single View Profile when no WhatsApp */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        const therapistId = listing.therapistId || listing.$id;
                                                        const slug = (listing.therapistName || 'therapist').toLowerCase().replace(/\s+/g, '-');
                                                        window.history.pushState({}, '', `/#/therapist-profile/${therapistId}-${slug}`);
                                                        onNavigate?.('shared-therapist-profile');
                                                    }}
                                                    className="flex-1 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-all duration-200"
                                                >
                                                    {t?.jobs?.viewProfile || 'View Profile'}
                                                </button>
                                                {listing.contactWhatsApp && (
                                                    <button
                                                        onClick={() => window.open(`https://wa.me/${listing.contactWhatsApp.replace(/\D/g, '')}`, '_blank')}
                                                        className="flex-1 py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-all duration-200"
                                                    >
                                                        {t?.jobs?.contact || 'Contact'}
                                                    </button>
                                                )}
                                            </div>
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
        </div>
    );
};

export default MassageJobsPage;

