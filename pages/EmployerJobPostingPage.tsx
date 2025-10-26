import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Home, Briefcase, Users, Phone, Mail, X } from 'lucide-react';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const EmployerJobPostingPage: React.FC = () => {
    const [formData, setFormData] = useState({
        jobTitle: 'Massage Therapist Position',
        jobDescription: '',
        employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'freelance',
        location: '',
        salaryRangeMin: 0,
        salaryRangeMax: 0,
        applicationDeadline: '',
        businessName: '',
        businessType: 'hotel' as 'hotel' | 'spa' | 'wellness-center' | 'home-service' | 'resort' | 'other',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        country: 'Indonesia',
        city: '',
        positionTitle: 'Massage Therapist',
        numberOfPositions: 1,
        salaryMin: '',
        salaryMax: '',
        accommodationProvided: false,
        accommodationDetails: '',
        workType: 'full-time' as 'full-time' | 'part-time' | 'contract',
        requirements: [] as string[],
        benefits: [] as string[],
        startDate: '',
        status: 'active',
        views: 0,
        applications: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const businessTypes = [
        { value: 'hotel', label: 'Hotel' },
        { value: 'spa', label: 'Spa & Wellness' },
        { value: 'wellness-center', label: 'Wellness Center' },
        { value: 'resort', label: 'Resort' },
        { value: 'home-service', label: 'Home Service' },
        { value: 'other', label: 'Other' },
    ];

    const indonesianCities = [
        'Bali', 'Jakarta', 'Surabaya', 'Bandung', 'Yogyakarta',
        'Medan', 'Semarang', 'Makassar', 'Lombok', 'Ubud'
    ];

    const internationalLocations = [
        'Dubai, UAE', 'Singapore', 'Hong Kong', 'Phuket, Thailand', 'Kuala Lumpur, Malaysia',
        'Maldives', 'Sydney, Australia', 'Tokyo, Japan', 'Seoul, South Korea'
    ];

    const commonRequirements = [
        'Certified massage therapist',
        'Minimum 2 years experience',
        'English speaking',
        'Balinese massage expertise',
        'Professional appearance',
        'Customer service skills',
    ];

    const commonBenefits = [
        'Accommodation provided',
        'Meals included',
        'Health insurance',
        'Visa sponsorship',
        'Performance bonuses',
        'Training & development',
        'Paid vacation',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.businessName || !formData.contactEmail || !formData.city || !formData.jobTitle || !formData.jobDescription) {
            alert('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                ID.unique(),
                {
                    jobTitle: formData.jobTitle,
                    jobDescription: formData.jobDescription,
                    employmentType: formData.employmentType,
                    location: formData.location || null,
                    salaryRangeMin: formData.salaryRangeMin || null,
                    salaryRangeMax: formData.salaryRangeMax || null,
                    applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline).toISOString() : null,
                    businessName: formData.businessName,
                    businessType: formData.businessType,
                    contactPerson: formData.contactPerson,
                    contactEmail: formData.contactEmail,
                    contactPhone: formData.contactPhone || null,
                    country: formData.country,
                    city: formData.city,
                    positionTitle: formData.positionTitle,
                    numberOfPositions: formData.numberOfPositions,
                    salaryMin: formData.salaryMin || null,
                    salaryMax: formData.salaryMax || null,
                    accommodationProvided: formData.accommodationProvided,
                    accommodationDetails: formData.accommodationDetails || null,
                    workType: formData.workType,
                    requirements: formData.requirements,
                    benefits: formData.benefits,
                    startDate: formData.startDate || null,
                    postedDate: new Date().toISOString(),
                    status: formData.status || null,
                    views: formData.views,
                    applications: formData.applications,
                }
            );

            setSubmitSuccess(true);
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
        } catch (error) {
            console.error('Error posting job:', error);
            alert('Failed to post job. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white border-2 border-green-300 rounded-2xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
                    <p className="text-gray-600 mb-4">
                        Your job opening is now visible to qualified therapists on IndaStreet.
                    </p>
                    <p className="text-sm text-gray-500">
                        Redirecting to homepage...
                    </p>
                </div>
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
                            <span className="text-gray-900">Post Job</span>
                            <span className="text-orange-500"> Opening</span>
                        </h1>
                        <p className="text-xs text-gray-500 mt-0.5">Find qualified massage therapists</p>
                    </div>
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Job Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            Job Information
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                placeholder="e.g., Massage Therapist"
                                maxLength={128}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Job Description * (Max 1000 characters)
                            </label>
                            <textarea
                                required
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value.slice(0, 1000) })}
                                placeholder="Describe the role, responsibilities, and requirements..."
                                rows={6}
                                maxLength={1000}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.jobDescription.length}/1000 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Employment Type *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(['full-time', 'part-time', 'contract', 'freelance'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, employmentType: type })}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all capitalize ${
                                            formData.employmentType === type
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type.replace('-', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Salary Range Min (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.salaryRangeMin || ''}
                                    onChange={(e) => setFormData({ ...formData, salaryRangeMin: parseInt(e.target.value) || 0 })}
                                    placeholder="e.g., 5000000"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Salary Range Max (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.salaryRangeMax || ''}
                                    onChange={(e) => setFormData({ ...formData, salaryRangeMax: parseInt(e.target.value) || 0 })}
                                    placeholder="e.g., 8000000"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Application Deadline (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.applicationDeadline}
                                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Business Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-orange-500" />
                            Business Information
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="e.g., Paradise Resort & Spa"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Business Type *
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {businessTypes.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, businessType: type.value as any })}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                            formData.businessType === type.value
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-orange-500" />
                            Contact Information
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Contact Person *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                placeholder="HR Manager name"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    placeholder="hr@company.com"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    <Phone className="w-4 h-4 inline mr-1" />
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.contactPhone}
                                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                    placeholder="+62 xxx xxx xxx"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            Location
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Country</label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value, city: '' })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="Indonesia">Indonesia</option>
                                <option value="international">International</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                City / Location *
                            </label>
                            {formData.country === 'Indonesia' ? (
                                <div className="flex flex-wrap gap-2">
                                    {indonesianCities.map((city) => (
                                        <button
                                            key={city}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, city })}
                                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                                formData.city === city
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {internationalLocations.map((location) => (
                                        <button
                                            key={location}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, city: location })}
                                            className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                                formData.city === location
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {location}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Position Details */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            Position Details
                        </h2>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Position Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.positionTitle}
                                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Number of Positions
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.numberOfPositions}
                                    onChange={(e) => setFormData({ ...formData, numberOfPositions: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Work Type</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['full-time', 'part-time', 'contract'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, workType: type })}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                            formData.workType === type
                                                ? 'bg-orange-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type === 'full-time' ? 'Full-Time' : type === 'part-time' ? 'Part-Time' : 'Contract'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                <DollarSign className="w-4 h-4 inline mr-1" />
                                Salary Range (Monthly)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                                    <input
                                        type="text"
                                        value={formData.salaryMin}
                                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                        placeholder="Min"
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                                    <input
                                        type="text"
                                        value={formData.salaryMax}
                                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                        placeholder="Max"
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Accommodation */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Home className="w-5 h-5 text-orange-500" />
                            Accommodation
                        </h2>

                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.accommodationProvided}
                                onChange={(e) => setFormData({ ...formData, accommodationProvided: e.target.checked })}
                                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                            />
                            <span className="font-medium text-gray-900">Accommodation Provided</span>
                        </label>

                        {formData.accommodationProvided && (
                            <textarea
                                value={formData.accommodationDetails}
                                onChange={(e) => setFormData({ ...formData, accommodationDetails: e.target.value })}
                                placeholder="Describe accommodation details (e.g., shared room, meals included, etc.)"
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        )}
                    </div>

                    {/* Requirements & Benefits */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Requirements</h2>
                        <div className="flex flex-wrap gap-2">
                            {commonRequirements.map((req) => (
                                <button
                                    key={req}
                                    type="button"
                                    onClick={() => {
                                        const newReqs = formData.requirements.includes(req)
                                            ? formData.requirements.filter(r => r !== req)
                                            : [...formData.requirements, req];
                                        setFormData({ ...formData, requirements: newReqs });
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        formData.requirements.includes(req)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {req}
                                </button>
                            ))}
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 mt-6">Benefits</h2>
                        <div className="flex flex-wrap gap-2">
                            {commonBenefits.map((benefit) => (
                                <button
                                    key={benefit}
                                    type="button"
                                    onClick={() => {
                                        const newBenefits = formData.benefits.includes(benefit)
                                            ? formData.benefits.filter(b => b !== benefit)
                                            : [...formData.benefits, benefit];
                                        setFormData({ ...formData, benefits: newBenefits });
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        formData.benefits.includes(benefit)
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {benefit}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Job Description */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Job Description</h2>
                        <textarea
                            value={formData.jobDescription}
                            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                            placeholder="Describe the role, responsibilities, and what makes this opportunity special..."
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                            isSubmitting
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        {isSubmitting ? 'Posting Job...' : 'Post Job Opening'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmployerJobPostingPage;
