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
    const [unlockedListings, setUnlockedListings] = useState<Set<string>>(new Set());
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState<TherapistJobListing | null>(null);

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

    const handleUnlockContact = (listing: TherapistJobListing) => {
        setSelectedListing(listing);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = () => {
        if (selectedListing) {
            setUnlockedListings(prev => new Set(prev).add(selectedListing.$id));
            setShowPaymentModal(false);
            setSelectedListing(null);
        }
    };

    const handlePaymentCancel = () => {
        setShowPaymentModal(false);
        setSelectedListing(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-20">
                <div className="w-full px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Therapist For Contract
                                </h1>
                                <p className="text-sm text-gray-600">Find qualified massage therapists seeking opportunities</p>
                            </div>
                        </div>
                        <button
                            onClick={onRegisterListing}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all"
                        >
                            Register
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search by name, skills, or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <svg className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Filters */}
                    <div className="space-y-2">
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { value: 'all', label: 'All', icon: 'M4 6h16M4 12h16M4 18h16' },
                                { value: 'full-time', label: 'Full-Time', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { value: 'part-time', label: 'Part-Time', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { value: 'both', label: 'Both', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedAvailability(type.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all border-2 ${
                                        selectedAvailability === type.value
                                            ? 'bg-orange-100 text-orange-600 border-orange-500'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                                    </svg>
                                    <span className="text-sm">{type.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {[
                                { value: 'all', label: 'All Locations', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { value: 'local', label: 'Local', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
                                { value: 'domestic', label: 'Domestic', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                                { value: 'international', label: 'International', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setSelectedRelocation(type.value)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium whitespace-nowrap transition-all border-2 ${
                                        selectedRelocation === type.value
                                            ? 'bg-orange-100 text-orange-600 border-orange-500'
                                            : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-300'
                                    }`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                                    </svg>
                                    <span className="text-sm">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Therapist Count */}
            <div className="w-full px-4 py-4">
                <p className="text-gray-600">
                    <span className="font-bold text-orange-600">{filteredListings.length}</span> therapist{filteredListings.length !== 1 ? 's' : ''} available
                </p>
            </div>

            {/* Content */}
            <div className="w-full px-4 pb-8">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
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
                    <div className="grid grid-cols-1 gap-6">
                        {filteredListings.map((listing) => (
                            <div key={listing.$id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-orange-500">\n                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                {unlockedListings.has(listing.$id) ? listing.therapistName : "Register To Display"}
                                            </h3>
                                            <p className="text-orange-600 font-semibold text-sm">{listing.jobTitle}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                                            Available
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{listing.jobDescription}</p>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">{listing.availability}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                            </svg>
                                            <span className="text-gray-700 font-medium">
                                                {listing.willingToRelocateInternational ? 'International' : listing.willingToRelocateDomestic ? 'Domestic' : 'Local'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                    <span key={idx} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
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
                                                    <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Button */}
                                    {unlockedListings.has(listing.$id) ? (
                                        <a
                                            href={`https://wa.me/${listing.contactWhatsApp.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                            Contact via WhatsApp: {listing.contactWhatsApp}
                                        </a>
                                    ) : (
                                        <button
                                            onClick={() => handleUnlockContact(listing)}
                                            className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Unlock Contact - IDR 300,000
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedListing && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Modal Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Unlock Contact</h2>
                                    <p className="text-sm text-gray-500">Get full access to therapist profile</p>
                                </div>
                                <button
                                    onClick={handlePaymentCancel}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Profile Preview */}
                            <div className="bg-orange-50 rounded-xl p-4 mb-6 border border-orange-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900">{selectedListing.jobTitle}</h3>
                                        <p className="text-sm text-gray-600">{selectedListing.availability}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-gray-700">{selectedListing.specializations.join(', ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-gray-700">Min Salary: {selectedListing.minimumSalary}</span>
                                    </div>
                                </div>
                            </div>

                            {/* What You'll Get */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">What you'll get:</h3>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-gray-700">Full therapist name and profile details</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-gray-700">Direct WhatsApp contact number</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-gray-700">Unlimited access to contact information</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-sm text-gray-700">Complete work history and certifications</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Amount */}
                            <div className="bg-gradient-to-r from-orange-100 to-orange-50 rounded-xl p-4 mb-6 border-2 border-orange-300">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-700 font-medium">Unlock Fee:</span>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-orange-600">IDR 300,000</div>
                                        <div className="text-xs text-gray-500">One-time payment</div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Methods */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Payment Methods:</h3>
                                <div className="space-y-2">
                                    <button className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Credit/Debit Card</div>
                                            <div className="text-xs text-gray-500">Visa, Mastercard, JCB</div>
                                        </div>
                                    </button>
                                    <button className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">E-Wallet</div>
                                            <div className="text-xs text-gray-500">GoPay, OVO, Dana, LinkAja</div>
                                        </div>
                                    </button>
                                    <button className="w-full p-3 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Bank Transfer</div>
                                            <div className="text-xs text-gray-500">BCA, Mandiri, BNI, BRI</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePaymentCancel}
                                    className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePaymentSuccess}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg transform hover:scale-105"
                                >
                                    Proceed to Payment
                                </button>
                            </div>

                            {/* Disclaimer */}
                            <p className="text-xs text-gray-500 text-center mt-4">
                                🔒 Secure payment powered by Midtrans. Your payment information is encrypted and secure.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistJobsPage;
