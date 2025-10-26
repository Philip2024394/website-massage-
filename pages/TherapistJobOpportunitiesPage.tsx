import React, { useState, useEffect } from 'react';
import { Globe, MapPin, DollarSign, Home, Briefcase, CheckCircle, X, Info } from 'lucide-react';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface TherapistJobOpportunitiesPageProps {
    therapistId: string | number;
    therapistName: string;
    isActiveMember: boolean;
    onClose: () => void;
}

const TherapistJobOpportunitiesPage: React.FC<TherapistJobOpportunitiesPageProps> = ({
    therapistId,
    therapistName,
    isActiveMember,
    onClose
}) => {
    const [isOptedIn, setIsOptedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [formData, setFormData] = useState({
        listingId: 0,
        jobTitle: 'Massage Therapist - Job Opportunity',
        jobDescription: 'Seeking full-time massage therapy position',
        requiredLicenses: '',
        applicationDeadline: '',
        jobType: 'job-seeking' as string,
        location: '',
        willingToRelocateDomestic: false,
        willingToRelocateInternational: false,
        availability: 'full-time' as 'full-time' | 'part-time' | 'both',
        minimumSalary: '',
        preferredLocations: [] as string[],
        accommodation: 'required' as 'required' | 'preferred' | 'not-required',
        experienceYears: 0,
        specializations: [] as string[],
        languages: [] as string[],
        acceptTerms: false,
    });

    useEffect(() => {
        checkOptInStatus();
    }, [therapistId]);

    const checkOptInStatus = async () => {
        try {
            setIsLoading(true);
            // Check if therapist already opted in
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapistJobListings || 'therapist_job_listings',
                []
            );
            const existing = response.documents.find((doc: any) => doc.therapistId === therapistId.toString());
            if (existing) {
                setIsOptedIn(true);
                // Populate form with existing data
                setFormData({
                    listingId: existing.listingId || 0,
                    jobTitle: existing.jobTitle || 'Massage Therapist - Job Opportunity',
                    jobDescription: existing.jobDescription || 'Seeking full-time massage therapy position',
                    requiredLicenses: existing.requiredLicenses || '',
                    applicationDeadline: existing.applicationDeadline || '',
                    jobType: existing.jobType || 'job-seeking',
                    location: existing.location || '',
                    willingToRelocateDomestic: existing.willingToRelocateDomestic || false,
                    willingToRelocateInternational: existing.willingToRelocateInternational || false,
                    availability: existing.availability || 'full-time',
                    minimumSalary: existing.minimumSalary || '',
                    preferredLocations: existing.preferredLocations || [],
                    accommodation: existing.accommodation || 'required',
                    experienceYears: existing.experienceYears || 0,
                    specializations: existing.specializations || [],
                    languages: existing.languages || [],
                    acceptTerms: true,
                });
            }
        } catch (error) {
            console.error('Error checking opt-in status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!isActiveMember) {
            alert('You must be an active IndaStreet member to access job opportunities.');
            return;
        }

        if (!formData.acceptTerms) {
            alert('Please accept the terms and conditions.');
            return;
        }

        if (!isOptedIn) {
            // Show payment modal for new listings
            setShowPaymentModal(true);
        } else {
            // Update existing listing
            await saveJobListing();
        }
    };

    const saveJobListing = async () => {
        try {
            // Generate unique listingId
            const listingId = Date.now();
            
            const listingData = {
                listingId,
                jobTitle: formData.jobTitle,
                jobDescription: formData.jobDescription,
                requiredLicenses: formData.requiredLicenses || null,
                applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
                jobType: formData.jobType,
                location: formData.location || null,
                therapistId: therapistId.toString(),
                therapistName,
                willingToRelocateDomestic: formData.willingToRelocateDomestic,
                willingToRelocateInternational: formData.willingToRelocateInternational,
                availability: formData.availability,
                minimumSalary: formData.minimumSalary,
                preferredLocations: formData.preferredLocations,
                accommodation: formData.accommodation,
                experienceYears: formData.experienceYears || null,
                specializations: formData.specializations,
                languages: formData.languages,
                isActive: true,
                listingDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
            };

            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapistJobListings || 'therapist_job_listings',
                ID.unique(),
                listingData
            );

            setIsOptedIn(true);
            alert('Successfully registered for job opportunities!');
            setShowPaymentModal(false);
        } catch (error) {
            console.error('Error saving job listing:', error);
            alert('Failed to save listing. Please try again.');
        }
    };

    const handlePayment = async () => {
        // TODO: Integrate with payment gateway
        // For now, simulate payment
        const confirmPayment = confirm('Payment of Rp 200,000 for 1-year job listing.\n\nProceed to payment?');
        if (confirmPayment) {
            await saveJobListing();
        }
    };

    const indonesianCities = [
        'Bali', 'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta', 
        'Medan', 'Semarang', 'Makassar', 'Lombok', 'Ubud'
    ];

    const internationalLocations = [
        'Dubai, UAE', 'Singapore', 'Hong Kong', 'Thailand', 'Malaysia',
        'Maldives', 'Australia', 'Japan', 'South Korea', 'Europe'
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm px-4 py-3 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">
                            <span className="text-gray-900">Job</span>
                            <span className="text-orange-500"> Opportunities</span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Travel & work opportunities worldwide</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Membership Check */}
                {!isActiveMember && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-red-900">Active Membership Required</h3>
                                <p className="text-sm text-red-800 mt-1">
                                    You must have an active IndaStreet membership to access job opportunities. 
                                    Please renew your membership to continue.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Banner */}
                {isOptedIn && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-green-900">You're Listed!</h3>
                                <p className="text-sm text-green-800 mt-1">
                                    Your profile is visible to employers. Update your preferences below.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pricing Info */}
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <DollarSign className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="font-bold text-orange-900">Registration Fee</h3>
                            <p className="text-sm text-orange-800 mt-1">
                                <strong>Rp 200,000</strong> for 1-year job listing
                            </p>
                            <ul className="text-xs text-orange-700 mt-2 space-y-1">
                                <li>✓ Visible to hotels, spas, and employers worldwide</li>
                                <li>✓ Direct contact from interested employers</li>
                                <li>✓ Valid for 12 months</li>
                                <li>✓ Update preferences anytime</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-6">
                    <h2 className="text-lg font-bold text-gray-900">Your Preferences</h2>

                    {/* Job Title & Description */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Job Title / Looking For
                            </label>
                            <input
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                placeholder="e.g., Massage Therapist - Hotel Position"
                                maxLength={128}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Brief Description (Max 500 characters)
                            </label>
                            <textarea
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value.slice(0, 500) })}
                                placeholder="Describe your experience, skills, and what you're looking for..."
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.jobDescription.length}/500 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Licenses & Certifications (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.requiredLicenses}
                                onChange={(e) => setFormData({ ...formData, requiredLicenses: e.target.value })}
                                placeholder="e.g., Certified Thai Massage, SPA License"
                                maxLength={256}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Relocation Willingness */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.willingToRelocateDomestic}
                                onChange={(e) => setFormData({ ...formData, willingToRelocateDomestic: e.target.checked })}
                                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                            />
                            <MapPin className="w-5 h-5 text-orange-500" />
                            <span className="font-medium text-gray-900">Willing to relocate within Indonesia</span>
                        </label>

                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.willingToRelocateInternational}
                                onChange={(e) => setFormData({ ...formData, willingToRelocateInternational: e.target.checked })}
                                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                            />
                            <Globe className="w-5 h-5 text-orange-500" />
                            <span className="font-medium text-gray-900">Willing to work internationally</span>
                        </label>
                    </div>

                    {/* Availability */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            <Briefcase className="w-4 h-4 inline mr-1" />
                            Availability
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['full-time', 'part-time', 'both'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, availability: type })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                        formData.availability === type
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {type === 'full-time' ? 'Full-Time' : type === 'part-time' ? 'Part-Time' : 'Both'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Minimum Salary */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Minimum Expected Salary (Monthly)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                            <input
                                type="text"
                                value={formData.minimumSalary}
                                onChange={(e) => setFormData({ ...formData, minimumSalary: e.target.value })}
                                placeholder="5,000,000"
                                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Preferred Locations */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Preferred Locations
                        </label>
                        <div className="space-y-2">
                            {formData.willingToRelocateDomestic && (
                                <div>
                                    <p className="text-xs text-gray-600 mb-2">Indonesia:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {indonesianCities.map((city) => (
                                            <button
                                                key={city}
                                                onClick={() => {
                                                    const newLocations = formData.preferredLocations.includes(city)
                                                        ? formData.preferredLocations.filter(l => l !== city)
                                                        : [...formData.preferredLocations, city];
                                                    setFormData({ ...formData, preferredLocations: newLocations });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    formData.preferredLocations.includes(city)
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {formData.willingToRelocateInternational && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-600 mb-2">International:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {internationalLocations.map((location) => (
                                            <button
                                                key={location}
                                                onClick={() => {
                                                    const newLocations = formData.preferredLocations.includes(location)
                                                        ? formData.preferredLocations.filter(l => l !== location)
                                                        : [...formData.preferredLocations, location];
                                                    setFormData({ ...formData, preferredLocations: newLocations });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    formData.preferredLocations.includes(location)
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {location}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Accommodation */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            <Home className="w-4 h-4 inline mr-1" />
                            Accommodation Preference
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['required', 'preferred', 'not-required'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, accommodation: type })}
                                    className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                                        formData.accommodation === type
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {type === 'required' ? 'Required' : type === 'preferred' ? 'Preferred' : 'Not Required'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    <div className="border-t-2 border-gray-200 pt-4">
                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={formData.acceptTerms}
                                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 mt-0.5"
                            />
                            <span className="text-sm text-gray-700">
                                I accept the <strong>Terms & Conditions</strong> for job opportunity listings. 
                                I understand that employers will contact me directly, and IndaStreet acts as a platform only.
                                The Rp 200,000 registration fee is non-refundable and valid for 12 months.
                            </span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!isActiveMember || !formData.acceptTerms}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                            !isActiveMember || !formData.acceptTerms
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isOptedIn ? 'Update My Listing' : 'Register for Job Opportunities'}
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Payment</h3>
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-700">Registration Fee:</p>
                            <p className="text-3xl font-bold text-orange-600">Rp 200,000</p>
                            <p className="text-xs text-gray-600 mt-1">Valid for 12 months</p>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={handlePayment}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all"
                            >
                                Proceed to Payment
                            </button>
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TherapistJobOpportunitiesPage;
