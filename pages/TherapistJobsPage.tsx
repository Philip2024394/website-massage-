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

interface TherapistJobsPageProps {
    onBack: () => void;
    onRegisterListing: () => void;
}

const TherapistJobsPage: React.FC<TherapistJobsPageProps> = ({ onBack, onRegisterListing }) => {
    const [therapistListings, setTherapistListings] = useState<TherapistJobListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
    const [selectedRelocation, setSelectedRelocation] = useState<string>('all');

    useEffect(() => {
        fetchTherapistListings();
    }, []);

    const fetchTherapistListings = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.therapistJobListings,
                [
                    Query.equal('isActive', true),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100)
                ]
            );
            setTherapistListings(response.documents as unknown as TherapistJobListing[]);
        } catch (error) {
            console.error('Error fetching therapist listings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredListings = therapistListings.filter(listing => {
        const matchesSearch = 
            listing.therapistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.jobDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.specializations.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesAvailability = selectedAvailability === 'all' || listing.availability === selectedAvailability;
        
        const matchesRelocation = 
            selectedRelocation === 'all' ||
            (selectedRelocation === 'domestic' && listing.willingToRelocateDomestic) ||
            (selectedRelocation === 'international' && listing.willingToRelocateInternational) ||
            (selectedRelocation === 'local' && !listing.willingToRelocateDomestic && !listing.willingToRelocateInternational);
        
        return matchesSearch && matchesAvailability && matchesRelocation;
    });

    const handleContactWhatsApp = (whatsapp: string, therapistName: string) => {
        const message = encodeURIComponent(`Hi ${therapistName}, I found your profile on IndaStreet and I'm interested in discussing a job opportunity.`);
        window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
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
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                    Therapists Looking for Jobs
                                </h1>
                                <p className="text-sm text-gray-600">Find qualified massage therapists seeking opportunities</p>
                            </div>
                        </div>
                        <button
                            onClick={onRegisterListing}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-105"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Register Your Profile
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search by name, skills, or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-green-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filters */}
                    <div className="space-y-2">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['all', 'full-time', 'part-time', 'both'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedAvailability(type)}
                                    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                        selectedAvailability === type
                                            ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    {type === 'all' ? 'All Availability' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {['all', 'local', 'domestic', 'international'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedRelocation(type)}
                                    className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                        selectedRelocation === type
                                            ? 'bg-gradient-to-r from-teal-500 to-green-600 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Therapist Count */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <p className="text-gray-600">
                    <span className="font-bold text-green-600">{filteredListings.length}</span> therapist{filteredListings.length !== 1 ? 's' : ''} available
                </p>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4 font-medium">Loading therapist profiles...</p>
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <p className="text-gray-500 text-lg">No therapist profiles found</p>
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map((listing) => (
                            <div key={listing.$id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-green-500">
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">{listing.therapistName}</h3>
                                            <p className="text-green-600 font-semibold text-sm">{listing.jobTitle}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-600 text-white text-xs font-semibold rounded-full">
                                            Available
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{listing.jobDescription}</p>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">{listing.availability}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">
                                                {listing.willingToRelocateInternational ? 'International' : listing.willingToRelocateDomestic ? 'Domestic' : 'Local'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">{listing.yearsOfExperience} years exp.</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">Min: {listing.minimumSalary}</span>
                                        </div>
                                    </div>

                                    {/* Specializations */}
                                    {listing.specializations.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">SPECIALIZATIONS:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {listing.specializations.slice(0, 3).map((spec, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                                                        {spec}
                                                    </span>
                                                ))}
                                                {listing.specializations.length > 3 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        +{listing.specializations.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Languages */}
                                    {listing.languages.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-semibold text-gray-500 mb-2">LANGUAGES:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {listing.languages.map((lang, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Button */}
                                    <button
                                        onClick={() => handleContactWhatsApp(listing.contactWhatsApp, listing.therapistName)}
                                        className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        Contact via WhatsApp
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

export default TherapistJobsPage;
