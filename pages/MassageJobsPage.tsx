import React, { useState, useEffect, useRef } from 'react';
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
    cvRequired?: boolean;
    businessName: string;
    businessType: string;
    numberOfPositions: number;
    accommodationProvided: boolean;
    requirements: string[];
    benefits: string[];
    massageTypes?: string[];
    requiredLanguages?: string[];
    contactWhatsApp: string;
    isActive: boolean;
    imageUrl?: string;
    $createdAt: string;
}

interface MassageJobsPageProps {
    onBack: () => void;
    onPostJob: () => void;
    onNavigateToPayment: () => void;
}

const MassageJobsPage: React.FC<MassageJobsPageProps> = ({ onBack, onPostJob, onNavigateToPayment }) => {
    const [jobPostings, setJobPostings] = useState<EmployerJobPosting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setShowTypeDropdown(false);
            }
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
                setShowLocationDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    Query.equal('status', 'active'),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            const postings = response.documents as unknown as EmployerJobPosting[];
            console.log('Fetched job postings:', postings);
            console.log('First posting massage types:', postings[0]?.massageTypes);
            console.log('First posting languages:', postings[0]?.requiredLanguages);
            setJobPostings(postings);
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
        const matchesLocation = selectedLocation === 'all' || posting.location.toLowerCase().includes(selectedLocation.toLowerCase());
        
        return matchesSearch && matchesType && matchesLocation;
    });

    const formatSalary = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const locations = [
        { value: 'all', label: 'All Locations' },
        // Bali Areas
        { value: 'Bali', label: '🏝️ All Bali' },
        { value: 'Seminyak', label: 'Seminyak' },
        { value: 'Canggu', label: 'Canggu' },
        { value: 'Ubud', label: 'Ubud' },
        { value: 'Nusa Dua', label: 'Nusa Dua' },
        { value: 'Jimbaran', label: 'Jimbaran' },
        { value: 'Sanur', label: 'Sanur' },
        { value: 'Uluwatu', label: 'Uluwatu' },
        // Jakarta Areas
        { value: 'Jakarta', label: '🏙️ All Jakarta' },
        { value: 'Jakarta Selatan', label: 'Jakarta Selatan' },
        { value: 'Jakarta Pusat', label: 'Jakarta Pusat' },
        { value: 'Jakarta Utara', label: 'Jakarta Utara' },
        // Other Cities
        { value: 'Surabaya', label: '🏢 Surabaya' },
        { value: 'Bandung', label: '⛰️ Bandung' },
        { value: 'Yogyakarta', label: '🏛️ Yogyakarta' },
        { value: 'Lombok', label: '🏖️ Lombok' },
        // Resort Areas
        { value: 'Gili Islands', label: '🏝️ Gili Islands' },
        { value: 'Bintan', label: '🏝️ Bintan' },
        { value: 'Labuan Bajo', label: '🦎 Labuan Bajo' },
    ];

    const businessTypes = ['all', 'hotel', 'spa', 'wellness-center', 'resort', 'home-service', 'other'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
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
                                <h1 className="text-2xl font-bold text-black">
                                    Massage Jobs
                                </h1>
                                <p className="text-sm text-gray-600">Browse available positions</p>
                            </div>
                        </div>
                        <button
                            onClick={onPostJob}
                            className="flex items-center gap-2 py-1.5 px-4 bg-orange-500 text-white shadow-lg rounded-lg transition-all duration-200 text-sm font-semibold whitespace-nowrap hover:bg-orange-600"
                        >
                            <span>Post Job</span>
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search by company, job title, or location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Dropdown Filters - Side by Side */}
                    <div className="flex gap-3 mb-4">
                        {/* Job Type Dropdown */}
                        <div className="relative flex-1" ref={typeDropdownRef}>
                            <button
                                onClick={() => {
                                    setShowTypeDropdown(!showTypeDropdown);
                                    setShowLocationDropdown(false);
                                }}
                                className="flex items-center gap-2 py-2.5 px-4 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all duration-200 text-sm font-semibold min-w-[160px]"
                            >
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700 flex-1">
                                    {selectedType === 'all' ? 'All Jobs' : selectedType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </span>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Job Type Dropdown Menu */}
                            {showTypeDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-30 max-h-96 overflow-y-auto">
                                    {businessTypes.map((type) => {
                                        const getIcon = (businessType: string) => {
                                            switch(businessType) {
                                                case 'all':
                                                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;
                                                case 'hotel':
                                                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
                                                case 'spa':
                                                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
                                                case 'wellness-center':
                                                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
                                                case 'clinic':
                                                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
                                                default:
                                                    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
                                            }
                                        };
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    setSelectedType(type);
                                                    setShowTypeDropdown(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors ${
                                                    selectedType === type ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                                }`}
                                            >
                                                <span className={selectedType === type ? 'text-orange-500' : 'text-gray-400'}>
                                                    {getIcon(type)}
                                                </span>
                                                <span>{type === 'all' ? 'All Jobs' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                                {selectedType === type && (
                                                    <svg className="w-4 h-4 ml-auto text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Location Dropdown */}
                        <div className="relative flex-1" ref={locationDropdownRef}>
                            <button
                                onClick={() => {
                                    setShowLocationDropdown(!showLocationDropdown);
                                    setShowTypeDropdown(false);
                                }}
                                className="flex items-center gap-2 py-2.5 px-4 bg-white border-2 border-orange-300 rounded-lg hover:bg-orange-50 transition-all duration-200 text-sm font-semibold w-full"
                            >
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700 flex-1">
                                    {locations.find(loc => loc.value === selectedLocation)?.label || 'All Locations'}
                                </span>
                                <svg className={`w-4 h-4 text-gray-500 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Location Dropdown Menu */}
                            {showLocationDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-30 max-h-96 overflow-y-auto">
                                    {locations.map((location) => (
                                        <button
                                            key={location.value}
                                            onClick={() => {
                                                setSelectedLocation(location.value);
                                                setShowLocationDropdown(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left ${
                                                selectedLocation === location.value ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                                            }`}
                                        >
                                            <span className="text-lg">{location.label}</span>
                                            {selectedLocation === location.value && (
                                                <svg className="w-4 h-4 ml-auto text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Job Count */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <p className="text-gray-600">
                    <span className="font-bold text-orange-600">{filteredPostings.length}</span> job{filteredPostings.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mx-auto"></div>
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
                        {filteredPostings.map((posting) => {
                            // Use mobile corporate massage image for job postings
                            const jobImageUrl = (posting as any).imageurl || 'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188';
                            
                            return (
                            <div key={posting.$id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 border-orange-500">
                                {/* Main Image - Full Width */}
                                <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                                    <img 
                                        src={jobImageUrl} 
                                        alt={posting.businessName}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Social Share Buttons - Left Side (Always Visible) */}
                                    <div className="absolute top-6 left-3 flex flex-col gap-2 z-10">
                                            {/* WhatsApp */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const text = `Check out this ${posting.jobTitle} position at ${posting.businessName}!`;
                                                    const url = window.location.href;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
                                                }}
                                                className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                                title="Share on WhatsApp"
                                            >
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                </svg>
                                            </button>

                                            {/* Facebook */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const url = window.location.href;
                                                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                                                }}
                                                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                                title="Share on Facebook"
                                            >
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                </svg>
                                            </button>

                                            {/* Instagram */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const text = `Check out this ${posting.jobTitle} position at ${posting.businessName}! ${window.location.href}`;
                                                    navigator.clipboard.writeText(text);
                                                    alert('Link copied! You can now paste it in Instagram.');
                                                }}
                                                className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                                title="Share on Instagram"
                                            >
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                                </svg>
                                            </button>

                                            {/* TikTok */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const text = `Check out this ${posting.jobTitle} position at ${posting.businessName}! ${window.location.href}`;
                                                    navigator.clipboard.writeText(text);
                                                    alert('Link copied! You can now paste it in TikTok.');
                                                }}
                                                className="w-8 h-8 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all"
                                                title="Share on TikTok"
                                            >
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                                                </svg>
                                            </button>
                                    </div>

                                    {/* Employment Type Badge - Top Right */}
                                    <div className="absolute top-4 right-4">
                                        <span className="px-4 py-2 bg-black/70 backdrop-blur-md text-white text-sm font-bold rounded-lg shadow-2xl border border-white/20">
                                            {posting.employmentType}
                                        </span>
                                    </div>

                                    {/* Location - Bottom Right */}
                                    <div className="absolute bottom-4 right-4 flex items-center gap-2 text-white drop-shadow-lg">
                                        <svg className="w-5 h-5 text-red-500 drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-semibold text-sm drop-shadow-md">{posting.location}</span>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{posting.jobTitle}</h3>
                                            <p className="text-orange-600 font-semibold">{posting.businessName}</p>
                                            <p className="text-sm text-gray-500">{posting.businessType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 mb-4 line-clamp-3">{posting.jobDescription}</p>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-1 gap-3 mb-4">
                                        <div className="text-sm">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">SALARY RANGE</p>
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
                                        {posting.cvRequired && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-blue-700 font-semibold">CV Required</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Massage Types Required - Show up to 4 */}
                                    {posting.massageTypes && posting.massageTypes.length > 0 ? (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">MASSAGE TYPES REQUIRED:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {posting.massageTypes.slice(0, 4).map((type, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                        {type}
                                                    </span>
                                                ))}
                                                {posting.massageTypes.length > 4 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-300">
                                                        +{posting.massageTypes.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-orange-500 mb-2">⚠️ No massage types specified for this posting</p>
                                        </div>
                                    )}

                                    {/* Languages Required - Show up to 3 */}
                                    {posting.requiredLanguages && posting.requiredLanguages.length > 0 ? (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">LANGUAGES REQUIRED:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {posting.requiredLanguages.slice(0, 3).map((lang, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                                        {lang}
                                                    </span>
                                                ))}
                                                {posting.requiredLanguages.length > 3 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-300">
                                                        +{posting.requiredLanguages.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-orange-500 mb-2">⚠️ No languages specified for this posting</p>
                                        </div>
                                    )}

                                    {/* Benefits */}
                                    {posting.benefits.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">BENEFITS:</p>
                                            <ul className="space-y-1.5">
                                                {posting.benefits.map((benefit, idx) => (
                                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <span className="text-orange-500 mt-1">•</span>
                                                        <span>{benefit}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Apply Button - Unlock with Upgrade */}
                                    <button
                                        onClick={onNavigateToPayment}
                                        className="relative w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all duration-300 hover:shadow-green-500/50 hover:shadow-2xl animate-pulse-glow"
                                        style={{
                                            boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), 0 0 40px rgba(34, 197, 94, 0.2)'
                                        }}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm9 13H6v-8h12v8z"/>
                                            <circle cx="12" cy="16" r="1.5"/>
                                        </svg>
                                        <span>Upgrade To Unlock Details</span>
                                    </button>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MassageJobsPage;
