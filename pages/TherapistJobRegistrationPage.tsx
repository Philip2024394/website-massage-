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

            // Validate profile image requirement
            if (!formData.profileImageUrl || formData.profileImageUrl.trim() === '') {
                throw new Error('Profile Image Required!\n\nYou must provide a profile image URL before submitting your registration.\n\nPlease add:\n• A clear front or side view of your face\n• Well-lit, professional appearance\n• Recent photo (within 6 months)\n\nThis helps employers identify you and builds trust.');
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
        <div className="min-h-screen bg-gray-50">
            {/* Header - Same as HomePage */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-20">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Go back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Page Title Section */}
            <div className="bg-gray-50 py-6 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
                        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Register Your Profile
                    </h2>
                    <p className="text-gray-600 mb-4">Post your profile and find work opportunities</p>
                    
                    {/* Massage Table Image */}
                    <div className="flex justify-center">
                        <img 
                            src="https://ik.imagekit.io/7grri5v7d/massage_table-removebg-preview.png?updatedAt=1762490531609"
                            alt="Massage Table"
                            className="w-32 h-32 object-contain"
                        />
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
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h2>
                        
                        <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Gender
                                </label>
                                <select
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    aria-label="Select gender"
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
                                    aria-label="Select religion"
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
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
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
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
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
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Professional Details
                        </h2>

                        <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
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
                                    aria-label="Select experience level"
                                >
                                    <option value="Experienced">Experienced</option>
                                    <option value="Basic Skill">Basic Skill</option>
                                    <option value="Require Training">Require Training</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
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
                            <label className="flex items-center gap-1 text-sm font-semibold text-gray-700 mb-2">
                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Availability
                            </label>
                            <select
                                value={formData.availability}
                                onChange={(e) => handleInputChange('availability', e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                aria-label="Select availability"
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
                                aria-label="Select accommodation requirement"
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
                        <div className="p-4 pb-20 bg-blue-50 border border-blue-200 rounded-lg">
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

