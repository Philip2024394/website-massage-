import React, { useState, useEffect } from 'react';
import { Query } from 'appwrite';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

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

interface MassageJobsPageProps {
    onBack: () => void;
    onPostJob: () => void;
}

const MassageJobsPage: React.FC<MassageJobsPageProps> = ({ onBack, onPostJob }) => {
    const [jobPostings, setJobPostings] = useState<EmployerJobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    useEffect(() => {
        fetchJobPostings();
    }, []);

    const fetchJobPostings = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.employerJobPostings,
                [
                    Query.equal('isActive', true),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            setJobPostings(response.documents as unknown as EmployerJobPosting[]);
        } catch (error) {
            console.error('Error fetching job postings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPostings = jobPostings.filter(posting => {
        const matchesSearch = 
            posting.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            posting.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            posting.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            posting.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = selectedType === 'all' || posting.businessType === selectedType;
        
        return matchesSearch && matchesType;
    });

    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const handleContactWhatsApp = (whatsapp: string, jobTitle: string, businessName: string) => {
        const message = encodeURIComponent(`Hi, I'm interested in the ${jobTitle} position at ${businessName} posted on IndaStreet.`);
        window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    };

    const businessTypes = ['all', 'hotel', 'spa', 'wellness-center', 'resort', 'home-service', 'other'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Massage Jobs
                                </h1>
                                <p className="text-sm text-gray-600">Browse available positions from employers</p>
                            </div>
                        </div>
                        <button
                            onClick={onPostJob}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Post a Job
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search by company, job title, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-blue-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {businessTypes.map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                    selectedType === type
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                }`}
                            >
                                {type === 'all' ? 'All Jobs' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Job Count */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <p className="text-gray-600">
                    <span className="font-bold text-blue-600">{filteredPostings.length}</span> job{filteredPostings.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4 font-medium">Loading job opportunities...</p>
                    </div>
                ) : filteredPostings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No job postings found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredPostings.map((posting) => (
                            <div key={posting.$id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-blue-500">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{posting.jobTitle}</h3>
                                            <p className="text-blue-600 font-semibold">{posting.businessName}</p>
                                            <p className="text-sm text-gray-500">{posting.businessType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold rounded-full">
                                            {posting.employmentType}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 mb-4 line-clamp-3">{posting.jobDescription}</p>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">{posting.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">
                                                {formatSalary(posting.salaryRangeMin)} - {formatSalary(posting.salaryRangeMax)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">{posting.numberOfPositions} position{posting.numberOfPositions > 1 ? 's' : ''} available</span>
                                        </div>
                                        {posting.accommodationProvided && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                <span className="text-orange-700 font-semibold">Accommodation Provided</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Benefits */}
                                    {posting.benefits.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">BENEFITS:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {posting.benefits.slice(0, 4).map((benefit, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                        {benefit}
                                                    </span>
                                                ))}
                                                {posting.benefits.length > 4 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        +{posting.benefits.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Apply Button */}
                                    <button
                                        onClick={() => handleContactWhatsApp(posting.contactWhatsApp, posting.jobTitle, posting.businessName)}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        Apply via WhatsApp
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MassageJobsPage;
