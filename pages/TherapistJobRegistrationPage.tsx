import React, { useState } from 'react';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTIONS = APPWRITE_CONFIG.collections;

interface TherapistJobRegistrationPageProps {
    jobId?: string;
    onBack: () => void;
    onSuccess?: () => void;
    onNavigate?: (page: any) => void;
    t?: any;
}

const indonesianCities = [
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Tangerang', 'Depok', 'Batam', 'Denpasar', 'Bandar Lampung', 'Padang', 'Malang',
    'Bogor', 'Pekanbaru', 'Yogyakarta', 'Bekasi', 'Banjarmasin', 'Solo', 'Balikpapan',
    'Manado', 'Pontianak', 'Samarinda', 'Cimahi', 'Jambi', 'Mataram', 'Serang',
    'Tasikmalaya', 'Kupang', 'Sukabumi', 'Cirebon', 'Bengkulu', 'Palu', 'Ambon',
    'Kediri', 'Kendari', 'Pematangsiantar', 'Tegal', 'Binjai', 'Jayapura', 'Pangkalpinang',
    'Bitung', 'Tarakan', 'Tanjungpinang', 'Gorontalo', 'Dumai', 'Magelang', 'Sorong',
    'Batu', 'Baubau', 'Ternate', 'Mojokerto', 'Pasuruan', 'Probolinggo', 'Lubuklinggau'
];

const massageTypes = [
    'Swedish Massage',
    'Deep Tissue Massage',
    'Thai Massage',
    'Balinese Massage',
    'Shiatsu',
    'Hot Stone Massage',
    'Aromatherapy Massage',
    'Sports Massage',
    'Reflexology',
    'Traditional Indonesian Massage',
    'Prenatal Massage',
    'Couples Massage',
    'Four Hands Massage',
    'Head Massage'
];

const TherapistJobRegistrationPage: React.FC<TherapistJobRegistrationPageProps> = ({ onBack, onSuccess }) => {
    const [formData, setFormData] = useState({
        therapistName: '',
        gender: '' as 'Male' | 'Female' | '',
        age: '',
        religion: '',
        jobTitle: '',
        jobDescription: '',
        yearsOfExperience: '',
        experienceLevel: 'Basic Skill' as 'Experienced' | 'Basic Skill' | 'Require Training',
        workedAbroadBefore: false,
        hasReferences: false,
        currentlyWorking: false,
        minimumSalary: '',
        contactWhatsApp: '',
        availability: 'full-time' as 'full-time' | 'part-time' | 'both',
        willingToRelocateDomestic: false,
        willingToRelocateInternational: false,
        accommodation: 'not-required' as 'required' | 'preferred' | 'not-required',
        requiredLicenses: '',
        languages: [] as string[],
        preferredLocations: [] as string[],
        massageTypes: [] as string[],
        specializations: [] as string[],
        profileImageUrl: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayToggle = (field: 'languages' | 'preferredLocations' | 'massageTypes' | 'specializations', value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.therapistName || !formData.jobTitle || !formData.jobDescription || !formData.contactWhatsApp) {
                throw new Error('Please fill in all required fields');
            }

            // Create job listing
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.therapistJobListings,
                ID.unique(),
                {
                    // Required fields
                    therapistId: ID.unique(), // In a real app, this would be the logged-in user ID
                    therapistName: formData.therapistName,
                    listingId: Math.floor(Math.random() * 1000000) + 1,
                    jobTitle: formData.jobTitle,
                    jobDescription: formData.jobDescription,
                    jobType: formData.jobTitle, // Using jobTitle as jobType for now
                    minimumSalary: formData.minimumSalary || 'Negotiable',
                    availability: formData.availability,
                    willingToRelocateDomestic: formData.willingToRelocateDomestic,
                    willingToRelocateInternational: formData.willingToRelocateInternational,
                    accommodation: formData.accommodation,
                    preferredLocations: formData.preferredLocations.join(', '), // Convert array to string
                    isActive: true,
                    listingDate: new Date().toISOString(),
                    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
                    
                    // Optional fields
                    requiredLicenses: formData.requiredLicenses || null,
                    gender: formData.gender || null,
                    age: formData.age ? parseInt(formData.age) : null,
                    religion: formData.religion || null,
                    experienceYears: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
                    workedAbroadBefore: formData.workedAbroadBefore || null,
                    hasReferences: formData.hasReferences || null,
                    currentlyWorking: formData.currentlyWorking || null,
                    languages: formData.languages.length > 0 ? formData.languages : null,
                    specializations: formData.massageTypes.length > 0 ? formData.massageTypes : null
                }
            );

            onSuccess?.();
        } catch (err: any) {
            console.error('Error creating therapist listing:', err);
            setError(err.message || 'Failed to create listing. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
            {/* Header */}
            <header className="bg-white shadow-md sticky top-0 z-20">
                <div className="w-full px-4 py-4">
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
                            <h1 className="text-2xl font-bold text-gray-900">Register Your Profile</h1>
                            <p className="text-sm text-gray-600">Post your profile and find work opportunities</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Promotional Banner */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="bg-white text-green-600 px-3 py-1 rounded-full text-sm font-bold">🎉 LIMITED TIME</span>
                        <span className="bg-yellow-400 text-green-800 px-3 py-1 rounded-full text-sm font-bold animate-pulse">FIRST 100 ONLY</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">
                        Start Your Professional Journey Today!
                    </h2>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
                        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                            <div className="text-3xl font-bold">Only IDR 5,000/day</div>
                            <div className="text-sm opacity-90">= IDR 150,000/month</div>
                        </div>
                        <div className="text-2xl font-bold">+</div>
                        <div className="bg-yellow-400 text-green-800 rounded-lg px-6 py-3">
                            <div className="text-2xl font-bold">FREE 1-Month Trial</div>
                            <div className="text-sm">For first 100 therapists</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">✅</span>
                            <span>Unlimited bookings</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">💰</span>
                            <span>Keep 100% of earnings</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-xl">🚀</span>
                            <span>Professional platform</span>
                        </div>
                    </div>
                    <div className="mt-4 text-sm opacity-90">
                        <strong>Break-even with just 1 session per month!</strong> • Much cheaper than commission-based platforms
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto p-6">
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.therapistName}
                                onChange={(e) => handleInputChange('therapistName', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => handleInputChange('age', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Age"
                                    min="18"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Religion
                                </label>
                                <select
                                    value={formData.religion}
                                    onChange={(e) => handleInputChange('religion', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Select religion</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Christianity">Christianity</option>
                                    <option value="Catholicism">Catholicism</option>
                                    <option value="Hinduism">Hinduism</option>
                                    <option value="Buddhism">Buddhism</option>
                                    <option value="Confucianism">Confucianism</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Job Title / Position <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.jobTitle}
                                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="e.g., Traditional Healing & Spa Expert"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.contactWhatsApp}
                                onChange={(e) => handleInputChange('contactWhatsApp', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="+62 xxx xxx xxxx"
                                required
                            />
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Professional Details</h2>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                About You / Job Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.jobDescription}
                                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                rows={4}
                                placeholder="Describe your experience, skills, and what you're looking for..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    value={formData.yearsOfExperience}
                                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Experience Level
                                </label>
                                <select
                                    value={formData.experienceLevel}
                                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="Experienced">Experienced</option>
                                    <option value="Basic Skill">Basic Skill</option>
                                    <option value="Require Training">Require Training</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Minimum Salary Expected (Monthly in IDR)
                            </label>
                            <input
                                type="text"
                                value={formData.minimumSalary}
                                onChange={(e) => handleInputChange('minimumSalary', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="e.g., Rp 5,000,000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Availability
                            </label>
                            <select
                                value={formData.availability}
                                onChange={(e) => handleInputChange('availability', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="both">Both</option>
                            </select>
                        </div>

                        {/* Work History */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Work History</h3>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.workedAbroadBefore}
                                    onChange={(e) => handleInputChange('workedAbroadBefore', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 font-medium">Has worked abroad before</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.hasReferences}
                                    onChange={(e) => handleInputChange('hasReferences', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 font-medium">Has references from previous employers</span>
                            </label>

                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.currentlyWorking}
                                    onChange={(e) => handleInputChange('currentlyWorking', e.target.checked)}
                                    className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700 font-medium">Currently working</span>
                            </label>
                        </div>
                    </div>

                    {/* Massage Skills */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">My Massage Skills</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {massageTypes.map((type) => (
                                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.massageTypes.includes(type)}
                                        onChange={() => handleArrayToggle('massageTypes', type)}
                                        className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                    />
                                    <span className="text-sm text-gray-700">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Preferred Locations */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Preferred Work Locations</h2>
                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {indonesianCities.map((city) => (
                                    <label key={city} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.preferredLocations.includes(city)}
                                            onChange={() => handleArrayToggle('preferredLocations', city)}
                                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm text-gray-700">{city}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Relocation & Accommodation */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Relocation & Accommodation</h2>
                        
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.willingToRelocateDomestic}
                                    onChange={(e) => handleInputChange('willingToRelocateDomestic', e.target.checked)}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">Willing to relocate within Indonesia</span>
                            </label>

                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.willingToRelocateInternational}
                                    onChange={(e) => handleInputChange('willingToRelocateInternational', e.target.checked)}
                                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                                />
                                <span className="text-sm text-gray-700">Willing to relocate internationally</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Accommodation Requirement
                            </label>
                            <select
                                value={formData.accommodation}
                                onChange={(e) => handleInputChange('accommodation', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            >
                                <option value="required">Required</option>
                                <option value="preferred">Preferred</option>
                                <option value="not-required">Not Required</option>
                            </select>
                        </div>
                    </div>

                    {/* Optional Information */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Additional Information (Optional)</h2>
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Licenses & Certifications
                            </label>
                            <input
                                type="text"
                                value={formData.requiredLicenses}
                                onChange={(e) => handleInputChange('requiredLicenses', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="e.g., Certified Massage Therapist, Spa License"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Profile Image URL
                            </label>
                            <input
                                type="url"
                                value={formData.profileImageUrl}
                                onChange={(e) => handleInputChange('profileImageUrl', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="https://example.com/profile.jpg"
                            />
                        </div>

                        {/* Note about main images */}
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <span className="font-medium">Note:</span> Main card images are automatically assigned from our curated collection to ensure consistent quality and design.
                            </p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                                isSubmitting 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-orange-500 hover:bg-orange-600'
                            }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TherapistJobRegistrationPage;
