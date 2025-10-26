import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

interface TherapistJobListing {
    $id: string;
    therapistId: string;
    therapistName: string;
    listingId: number;
    jobTitle: string;
    jobDescription: string;
    requiredLicenses: string;
    willingToRelocateDomestic: boolean;
    willingToRelocateInternational: boolean;
    availability: 'full-time' | 'part-time' | 'both';
    minimumSalary: string;
    preferredLocations: string[];
    accommodation: 'required' | 'preferred' | 'not-required';
    specializations: string[];
    languages: string[];
    yearsOfExperience: number;
    contactWhatsApp: string;
    isActive: boolean;
    $createdAt: string;
}

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
    businessName: string;
    businessType: string;
    numberOfPositions: number;
    accommodationProvided: boolean;
    requirements: string[];
    benefits: string[];
    contactWhatsApp: string;
    isActive: boolean;
    $createdAt: string;
}

interface BrowseJobsPageProps {
    onBack: () => void;
    onPostJob: () => void;
    t?: any;
}

const BrowseJobsPage: React.FC<BrowseJobsPageProps> = ({ onBack, onPostJob }) => {
    const [viewMode, setViewMode] = useState<'listed' | 'wanted'>('listed'); // Jobs Listed vs Jobs Wanted
    const [therapistListings, setTherapistListings] = useState<TherapistJobListing[]>([]);
    const [employerPostings, setEmployerPostings] = useState<EmployerJobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    console.log('🔍 BrowseJobsPage mounted - viewMode:', viewMode);

    useEffect(() => {
        fetchListings();
    }, [viewMode]);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            if (viewMode === 'wanted') {
                // Fetch therapist job listings (therapists wanting jobs)
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.therapistJobListings,
                    [
                        Query.equal('isActive', true),
                        Query.orderDesc('$createdAt'),
                        Query.limit(50)
                    ]
                );
                setTherapistListings(response.documents as unknown as TherapistJobListing[]);
            } else {
                // Fetch employer job postings (companies listing jobs)
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.employerJobPostings,
                    [
                        Query.equal('isActive', true),
                        Query.orderDesc('$createdAt'),
                        Query.limit(50)
                    ]
                );
                setEmployerPostings(response.documents as unknown as EmployerJobPosting[]);
            }
        } catch (error) {
            console.error('Error fetching job listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredTherapistListings = therapistListings.filter(listing =>
        listing.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredEmployerPostings = employerPostings.filter(posting =>
        posting.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        posting.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleContactWhatsApp = (whatsapp: string, name: string) => {
        const message = encodeURIComponent(`Hi, I'm interested in your job listing on IndaStreet. My name is ${name}`);
        window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Job Marketplace</h1>
                            <p className="text-sm text-gray-600">Find therapists or post job openings</p>
                        </div>
                    </div>

                    {/* Toggle: Jobs Listed vs Jobs Wanted */}
                    <div className="flex justify-center mb-4">
                        <div className="inline-flex bg-gray-200 rounded-full p-1">
                            <button
                                onClick={() => setViewMode('listed')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${
                                    viewMode === 'listed'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Jobs Listed
                            </button>
                            <button
                                onClick={() => setViewMode('wanted')}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${
                                    viewMode === 'wanted'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Jobs Wanted
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons: Massage Jobs & Massage Offers */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onPostJob}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow-md transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Massage Jobs
                        </button>
                        <button
                            onClick={onPostJob}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-md transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Massage Offers
                        </button>
                    </div>
                </div>
            </header>

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={viewMode === 'listed' ? 'Search employer job postings...' : 'Search available therapists...'}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Loading listings...</p>
                    </div>
                ) : viewMode === 'wanted' ? (
                    // Jobs Wanted - Show Therapist Listings
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTherapistListings.map((listing) => (
                            <div key={listing.$id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{listing.therapistName}</h3>
                                        <p className="text-sm text-gray-600">{listing.jobTitle}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        Available
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{listing.jobDescription}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-gray-700">{listing.availability}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-gray-700">
                                            {listing.willingToRelocateInternational ? 'International' : listing.willingToRelocateDomestic ? 'Domestic' : 'Local'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-gray-700">Min: {listing.minimumSalary}</span>
                                    </div>
                                </div>

                                {listing.specializations.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-500 mb-2">Specializations:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {listing.specializations.slice(0, 3).map((spec, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                    {spec}
                                                </span>
                                            ))}
                                            {listing.specializations.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    +{listing.specializations.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleContactWhatsApp(listing.contactWhatsApp, listing.therapistName)}
                                    className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Contact via WhatsApp
                                </button>
                            </div>
                        ))}
                        {filteredTherapistListings.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500">No therapist listings found</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Jobs Listed - Show Employer Job Postings
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredEmployerPostings.map((posting) => (
                            <div key={posting.$id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{posting.jobTitle}</h3>
                                        <p className="text-sm text-gray-600">{posting.businessName}</p>
                                        <p className="text-xs text-gray-500">{posting.businessType}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                        {posting.employmentType}
                                    </span>
                                </div>

                                <p className="text-sm text-gray-700 mb-4 line-clamp-3">{posting.jobDescription}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        <span className="text-gray-700">{posting.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-gray-700">
                                            {formatSalary(posting.salaryRangeMin)} - {formatSalary(posting.salaryRangeMax)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <span className="text-gray-700">{posting.numberOfPositions} position{posting.numberOfPositions > 1 ? 's' : ''}</span>
                                    </div>
                                    {posting.accommodationProvided && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            <span className="text-green-700 font-medium">Accommodation Provided</span>
                                        </div>
                                    )}
                                </div>

                                {posting.benefits.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-500 mb-2">Benefits:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {posting.benefits.slice(0, 3).map((benefit, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                    {benefit}
                                                </span>
                                            ))}
                                            {posting.benefits.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                                    +{posting.benefits.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleContactWhatsApp(posting.contactWhatsApp, posting.businessName)}
                                    className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Apply via WhatsApp
                                </button>
                            </div>
                        ))}
                        {filteredEmployerPostings.length === 0 && (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-500">No job openings found</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseJobsPage;
