import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Home, Briefcase, Phone, Mail, X } from 'lucide-react';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';

interface EmployerJobPostingPageProps {
    onNavigateToPayment?: (jobId: string) => void;
    onOpenMenu?: () => void;
}

const EmployerJobPostingPage: React.FC<EmployerJobPostingPageProps> = ({ onNavigateToPayment, onOpenMenu }) => {
    // Array of professional massage/spa images - will cycle through all before repeating
    const jobPostingImages = [
        'https://ik.imagekit.io/7grri5v7d/jungle%20massage.png?updatedAt=1761594798827',
        'https://ik.imagekit.io/7grri5v7d/massage%20solo.png?updatedAt=1761593342541',
        'https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea%20new%20job.png?updatedAt=1761591600248',
        'https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea.png?updatedAt=1761591108161',
        'https://ik.imagekit.io/7grri5v7d/bali%20massage.png?updatedAt=1761590994932',
        'https://ik.imagekit.io/7grri5v7d/massage%20villa%20service%20indonisea.png?updatedAt=1761583264188',
        'https://ik.imagekit.io/7grri5v7d/massage%20online.png?updatedAt=1761582970960',
        'https://ik.imagekit.io/7grri5v7d/massage%20jobs.png?updatedAt=1761571942696',
        'https://ik.imagekit.io/7grri5v7d/massage%20places%20indonisea.png?updatedAt=1761571657409',
        'https://ik.imagekit.io/7grri5v7d/hotel%20massage%20indoniseas.png?updatedAt=1761154913720',
        'https://ik.imagekit.io/7grri5v7d/massage%20room.png?updatedAt=1760975249566',
        'https://ik.imagekit.io/7grri5v7d/massage%20agents.png?updatedAt=1760968250776',
        'https://ik.imagekit.io/7grri5v7d/massage%20hoter%20villa.png?updatedAt=1760965742264',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2016.png?updatedAt=1760187700624',
        'https://ik.imagekit.io/7grri5v7d/massage%20image%2014.png?updatedAt=1760187606823',
    ];

    // Function to get sequential image based on timestamp to ensure variety
    const getRandomImage = () => {
        const timestamp = Date.now();
        const index = timestamp % jobPostingImages.length;
        return jobPostingImages[index];
    };

    const [formData, setFormData] = useState({
        jobTitle: '',
        jobDescription: '',
        employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'freelance',
        location: '',
        salaryRangeMin: 0,
        salaryRangeMax: 0,
        applicationDeadline: '',
        cvRequired: false,
        businessName: '',
        businessType: 'hotel' as 'hotel' | 'spa' | 'wellness-center' | 'home-service' | 'resort' | 'other',
        customBusinessType: '',
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
        transportationProvided: 'none' as 'none' | 'flight' | 'local-transport' | 'both',
        workType: 'full-time' as 'full-time' | 'part-time' | 'contract',
        requirements: [] as string[],
        benefits: [] as string[],
        massageTypes: [] as string[],
        requiredLanguages: [] as string[],
        startDate: '',
        status: 'active',
        views: 0,
        applications: 0,
        imageUrl: getRandomImage(),
        thumbnailImages: [] as string[],
        flightsPaidByEmployer: false,
        visaArrangedByEmployer: false,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>([]);
    const [showRequirementsDropdown, setShowRequirementsDropdown] = useState(false);
    const [showBenefitsDropdown, setShowBenefitsDropdown] = useState(false);
    const [showMassageTypesDropdown, setShowMassageTypesDropdown] = useState(false);
    const [showLanguagesDropdown, setShowLanguagesDropdown] = useState(false);

    const businessTypes = [
        { value: 'hotel', label: 'Hotel' },
        { value: 'spa', label: 'Spa & Wellness' },
        { value: 'wellness-center', label: 'Wellness Center' },
        { value: 'resort', label: 'Resort' },
        { value: 'home-service', label: 'Home Service' },
        { value: 'other', label: 'Other' },
    ];

    const indonesianCities = [
        // Java
        'Jakarta', 'Surabaya', 'Bandung', 'Semarang', 'Yogyakarta', 'Malang', 'Solo', 'Bogor', 'Depok', 'Tangerang', 'Bekasi', 'Cirebon',
        // Bali
        'Denpasar', 'Ubud', 'Seminyak', 'Kuta', 'Sanur', 'Nusa Dua', 'Canggu', 'Jimbaran',
        // Sumatra
        'Medan', 'Palembang', 'Pekanbaru', 'Padang', 'Bandar Lampung', 'Batam', 'Jambi', 'Bengkulu',
        // Sulawesi
        'Makassar', 'Manado', 'Palu', 'Kendari', 'Gorontalo',
        // Kalimantan
        'Balikpapan', 'Banjarmasin', 'Pontianak', 'Samarinda', 'Palangkaraya',
        // Lombok & Nusa Tenggara
        'Mataram', 'Lombok', 'Kupang', 'Labuan Bajo',
        // Other
        'Maluku', 'Jayapura', 'Manokwari', 'Sorong'
    ];

    const commonRequirements = [
        'Certified massage therapist',
        'Minimum 2 years experience',
        'Balinese massage expertise',
        'Professional appearance',
        'Customer service skills',
        'Letter From Last Employer',
        'Police Report',
        'Own Transport',
        'Own Accommodation',
    ];

    const commonBenefits = [
        'Competitive & Transparent Earnings',
        'Accommodation',
        'Transportation',
        'Daily Meals',
        'Living Allowances',
        'Training',
        'Professional Development',
        'Registered Employment',
        'Safety & Security',
        'Target Bonus',
        'Equipment & Supplies',
        'Sick Pay',
        'Uniform',
    ];

    const massageTypes = [
        'Traditional Indonesian Massage',
        'Balinese Massage',
        'Javanese Massage',
        'Boreh (Balinese Body Scrub)',
        'Urut Traditional Massage',
        'Traditional Massage',
        'Sports Massage',
        'Deep Tissue',
        'Swedish Massage',
        'Thai Massage',
        'Hot Stone',
        'Aromatherapy',
        'Reflexology',
        'Shiatsu',
        'Prenatal',
        'Trigger Point',
        'Lymphatic Drainage',
        'Myofascial Release',
        'Lomi Lomi',
        'Indian Head',
        'Cupping',
        'Oil Massage',
        'Four Hands',
    ];

    const availableLanguages = [
        'English',
        'Indonesian (Bahasa Indonesia)',
        'Mandarin Chinese',
        'Japanese',
        'Korean',
        'French',
        'German',
        'Spanish',
        'Russian',
        'Arabic',
        'Dutch',
        'Italian',
        'Thai',
        'Vietnamese',
    ];

    // Handle main image upload
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle thumbnail images upload
    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const remainingSlots = 5 - thumbnailPreviews.length;
        const filesToAdd = files.slice(0, remainingSlots);
        
        if (filesToAdd.length > 0) {
            // Create previews
            filesToAdd.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setThumbnailPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    // Remove thumbnail
    const removeThumbnail = (index: number) => {
        setThumbnailPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Remove main image
    const removeMainImage = () => {
        setMainImagePreview('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.businessName || !formData.contactEmail || !formData.city || !formData.jobTitle || !formData.jobDescription) {
            alert('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            console.log('Submitting job with massage types:', formData.massageTypes);
            console.log('Submitting job with languages:', formData.requiredLanguages);
            
            // Always use getRandomImage() for now since imageurl field only accepts strings up to 255 chars
            // Base64 images are too long. In production, upload to Appwrite Storage first and use those URLs
            const finalMainImage = getRandomImage();
            
            // NOTE: In production, upload images to Appwrite Storage first and get URLs
            // For now, using auto-generated image URLs only (base64 is too long for imageurl field)
            
            // NOTE: All Appwrite attributes have been added! Sending complete data.
            // Appwrite field names (lowercase): whatsappsent, whatsappsentat, massagetypes
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                ID.unique(),
                {
                    // ✅ Core required fields
                    jobTitle: formData.jobTitle,
                    jobDescription: formData.jobDescription,
                    businessName: formData.businessName,
                    contactEmail: formData.contactEmail,
                    country: formData.country,
                    city: formData.city,
                    status: 'pending_payment',
                    postedDate: new Date().toISOString(),
                    whatsappsentat: '', // Required string field (not datetime) - will be updated when WhatsApp is clicked
                    
                    // ✅ Required fields with defaults
                    businessType: formData.businessType === 'other' ? formData.customBusinessType : formData.businessType,
                    positionTitle: formData.positionTitle || formData.jobTitle,
                    workType: formData.workType || 'full-time',
                    employmentType: formData.employmentType || 'full-time',
                    contactPerson: formData.contactPerson || 'HR Manager',
                    numberOfPositions: formData.numberOfPositions || 1,
                    accommodationProvided: formData.accommodationProvided || false,
                    imageurl: finalMainImage,
                    
                    // ✅ Optional fields
                    ...(formData.location && { location: formData.location }),
                    ...(formData.contactPhone && { contactPhone: formData.contactPhone }),
                    ...(formData.salaryMin && { salaryMin: formData.salaryMin }),
                    ...(formData.salaryMax && { salaryMax: formData.salaryMax }),
                    ...(formData.accommodationDetails && { accommodationDetails: formData.accommodationDetails }),
                    ...(formData.startDate && { startDate: formData.startDate }),
                    ...(formData.applicationDeadline && { applicationDeadline: new Date(formData.applicationDeadline).toISOString() }),
                    
                    // ✅ Array fields (use lowercase Appwrite names)
                    ...(formData.massageTypes && formData.massageTypes.length > 0 && { massagetypes: formData.massageTypes }),
                    ...(formData.requirements && formData.requirements.length > 0 && { requirements: formData.requirements }),
                    ...(formData.benefits && formData.benefits.length > 0 && { benefits: formData.benefits }),
                    ...(formData.requiredLanguages && formData.requiredLanguages.length > 0 && { requiredLanguages: formData.requiredLanguages }),
                    
                    // ✅ Salary range fields (integer type in Appwrite)
                    ...(formData.salaryRangeMin && { salaryRangeMin: formData.salaryRangeMin }),
                    ...(formData.salaryRangeMax && { salaryRangeMax: formData.salaryRangeMax }),
                    
                    // ✅ Analytics fields (defaults)
                    views: 0,
                    applications: 0,
                }
            );

            console.log('Job posted successfully!', response.$id);
            
            // Navigate to payment page instead of showing success
            if (onNavigateToPayment) {
                onNavigateToPayment(response.$id);
            } else {
                alert('✅ Job posted successfully! Job ID: ' + response.$id);
                // Reset form
                window.location.reload();
            }
        } catch (error: any) {
            console.error('Error posting job:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            
            // Show more specific error message
            let errorMessage = 'Failed to post job. ';
            if (error.message) {
                errorMessage += error.message;
            } else if (error.response) {
                errorMessage += JSON.stringify(error.response);
            } else {
                errorMessage += 'Please check console for details.';
            }
            
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - HomePage Style */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={onOpenMenu} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Let's Find A Team Member */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-orange-500" />
                            Let's Find A Team Member
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Job Title (Therapist Specialty) *
                            </label>
                            <select
                                required
                                value={formData.jobTitle}
                                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                            >
                                <option value="">Select a therapist specialty...</option>
                                <option value="Traditional Massage Therapist">Traditional Massage Therapist</option>
                                <option value="Sports Massage Therapist">Sports Massage Therapist</option>
                                <option value="Deep Tissue Massage Therapist">Deep Tissue Massage Therapist</option>
                                <option value="Swedish Massage Therapist">Swedish Massage Therapist</option>
                                <option value="Thai Massage Therapist">Thai Massage Therapist</option>
                                <option value="Hot Stone Massage Therapist">Hot Stone Massage Therapist</option>
                                <option value="Aromatherapy Massage Therapist">Aromatherapy Massage Therapist</option>
                                <option value="Reflexology Therapist">Reflexology Therapist</option>
                                <option value="Shiatsu Massage Therapist">Shiatsu Massage Therapist</option>
                                <option value="Prenatal Massage Therapist">Prenatal Massage Therapist</option>
                                <option value="Balinese Massage Therapist">Balinese Massage Therapist</option>
                                <option value="Trigger Point Therapist">Trigger Point Therapist</option>
                                <option value="Lymphatic Drainage Therapist">Lymphatic Drainage Therapist</option>
                                <option value="Myofascial Release Therapist">Myofascial Release Therapist</option>
                                <option value="Lomi Lomi Massage Therapist">Lomi Lomi Massage Therapist</option>
                                <option value="Indian Head Massage Therapist">Indian Head Massage Therapist</option>
                                <option value="Cupping Therapist">Cupping Therapist</option>
                                <option value="Oil Massage Therapist">Oil Massage Therapist</option>
                                <option value="Four Hands Massage Therapist">Four Hands Massage Therapist</option>
                                <option value="Spa Therapist (Multi-Skilled)">Spa Therapist (Multi-Skilled)</option>
                                <option value="Wellness Therapist">Wellness Therapist</option>
                            </select>
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
                                {(formData.country !== 'Indonesia' 
                                    ? (['full-time', 'contract'] as const)
                                    : (['full-time', 'part-time', 'contract', 'freelance'] as const)
                                ).map((type) => (
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

                        {/* Salary Range Section */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                Salary Range (Monthly in Indonesian Rupiah)
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Minimum Salary
                                    </label>
                                    <select
                                        value={formData.salaryRangeMin || ''}
                                        onChange={(e) => setFormData({ ...formData, salaryRangeMin: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Select minimum salary</option>
                                        <option value="0">To be discussed</option>
                                        <option value="3000000">Rp 3,000,000</option>
                                        <option value="4000000">Rp 4,000,000</option>
                                        <option value="5000000">Rp 5,000,000</option>
                                        <option value="6000000">Rp 6,000,000</option>
                                        <option value="7000000">Rp 7,000,000</option>
                                        <option value="8000000">Rp 8,000,000</option>
                                        <option value="9000000">Rp 9,000,000</option>
                                        <option value="10000000">Rp 10,000,000</option>
                                        <option value="11000000">Rp 11,000,000</option>
                                        <option value="12000000">Rp 12,000,000+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Maximum Salary
                                    </label>
                                    <select
                                        value={formData.salaryRangeMax || ''}
                                        onChange={(e) => setFormData({ ...formData, salaryRangeMax: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="">Select maximum salary</option>
                                        <option value="0">To be discussed</option>
                                        <option value="3000000">Rp 3,000,000</option>
                                        <option value="4000000">Rp 4,000,000</option>
                                        <option value="5000000">Rp 5,000,000</option>
                                        <option value="6000000">Rp 6,000,000</option>
                                        <option value="7000000">Rp 7,000,000</option>
                                        <option value="8000000">Rp 8,000,000</option>
                                        <option value="9000000">Rp 9,000,000</option>
                                        <option value="10000000">Rp 10,000,000</option>
                                        <option value="11000000">Rp 11,000,000</option>
                                        <option value="12000000">Rp 12,000,000+</option>
                                    </select>
                                </div>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                CV Required? *
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="cvRequired"
                                        checked={formData.cvRequired === true}
                                        onChange={() => setFormData({ ...formData, cvRequired: true })}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-gray-700 font-medium">Yes</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="cvRequired"
                                        checked={formData.cvRequired === false}
                                        onChange={() => setFormData({ ...formData, cvRequired: false })}
                                        className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                    />
                                    <span className="text-gray-700 font-medium">No</span>
                                </label>
                            </div>
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
                                Business Name * <span className="text-gray-500 text-xs">(Max 23 characters)</span>
                            </label>
                            <input
                                type="text"
                                required
                                maxLength={23}
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                placeholder="e.g., Paradise Resort"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">{formData.businessName.length}/23 characters</p>
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
                                        onClick={() => setFormData({ ...formData, businessType: type.value as any, customBusinessType: '' })}
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
                            {formData.businessType === 'other' && (
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        required
                                        value={formData.customBusinessType}
                                        onChange={(e) => setFormData({ ...formData, customBusinessType: e.target.value })}
                                        placeholder="Enter your business type..."
                                        maxLength={50}
                                        className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Business Images */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Business Images
                        </h2>
                        <p className="text-sm text-gray-600">
                            Upload images to showcase your business. Main image is displayed on job cards.
                            <br />
                            <span className="text-orange-600 font-medium">💡 If no main image is uploaded, we'll use professional massage imagery.</span>
                        </p>

                        {/* Main Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Main Image (Optional)
                            </label>
                            {mainImagePreview ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                                    <img 
                                        src={mainImagePreview} 
                                        alt="Main preview" 
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeMainImage}
                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageChange}
                                        className="hidden"
                                    />
                                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <p className="text-sm font-medium">Click to upload main image</p>
                                        <p className="text-xs">PNG, JPG up to 10MB</p>
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Thumbnail Images Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Additional Images (Up to 5)
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                {thumbnailPreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                                        <img 
                                            src={preview} 
                                            alt={`Thumbnail ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeThumbnail(index)}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {thumbnailPreviews.length < 5 && (
                                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleThumbnailChange}
                                            className="hidden"
                                        />
                                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <p className="text-xs mt-1">Add</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {thumbnailPreviews.length}/5 images uploaded
                            </p>
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

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                <Phone className="w-4 h-4 inline mr-1" />
                                Phone Number *
                            </label>
                            <div className="flex gap-2">
                                <div className="w-20 px-4 py-3 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center font-medium text-gray-700">
                                    +62
                                </div>
                                <input
                                    type="tel"
                                    required
                                    value={formData.contactPhone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, contactPhone: value });
                                    }}
                                    placeholder="812 3456 7890"
                                    maxLength={15}
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Enter number without country code (e.g., 812 3456 7890)</p>
                        </div>

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
                    </div>

                    {/* Location */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            Location
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Country *</label>
                            <select
                                required
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value, city: '' })}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="Indonesia">Indonesia</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Malaysia">Malaysia</option>
                                <option value="Thailand">Thailand</option>
                                <option value="Philippines">Philippines</option>
                                <option value="Vietnam">Vietnam</option>
                                <option value="Cambodia">Cambodia</option>
                                <option value="Myanmar">Myanmar</option>
                                <option value="Laos">Laos</option>
                                <option value="Brunei">Brunei</option>
                                <option value="Australia">Australia</option>
                                <option value="New Zealand">New Zealand</option>
                                <option value="Japan">Japan</option>
                                <option value="South Korea">South Korea</option>
                                <option value="China">China</option>
                                <option value="Hong Kong">Hong Kong</option>
                                <option value="Taiwan">Taiwan</option>
                                <option value="India">India</option>
                                <option value="United Arab Emirates">United Arab Emirates</option>
                                <option value="Saudi Arabia">Saudi Arabia</option>
                                <option value="Qatar">Qatar</option>
                                <option value="Maldives">Maldives</option>
                                <option value="United Kingdom">United Kingdom</option>
                                <option value="United States">United States</option>
                                <option value="Canada">Canada</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                City / Location *
                            </label>
                            {formData.country === 'Indonesia' ? (
                                <select
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select a city</option>
                                    {indonesianCities.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Enter city name (e.g., Bangkok, Dubai, Singapore)"
                                    maxLength={85}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.country === 'Indonesia' 
                                    ? 'Select a city from the options above' 
                                    : `Maximum 85 characters (${formData.city.length}/85)`}
                            </p>
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
                                <select
                                    value={formData.positionTitle}
                                    onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">Select position type</option>
                                    <optgroup label="General Positions">
                                        <option value="Therapist">Therapist</option>
                                        <option value="Specialist">Specialist</option>
                                        <option value="Training Provided">Training Provided</option>
                                        <option value="Freelance">Freelance</option>
                                    </optgroup>
                                    <optgroup label="Specialized Roles">
                                        <option value="Lead / Senior Therapist">Lead / Senior Therapist</option>
                                        <option value="Spa & Wellness Therapist">Spa & Wellness Therapist</option>
                                        <option value="Mobile Therapist">Mobile Therapist</option>
                                        <option value="Resident / In-House Therapist">Resident / In-House Therapist</option>
                                        <option value="Clinical / Medical Therapist">Clinical / Medical Therapist</option>
                                    </optgroup>
                                    <optgroup label="Management & Supervision">
                                        <option value="Management & Supervision">Management & Supervision</option>
                                    </optgroup>
                                </select>
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
                                Salary Range (Monthly in Indonesian Rupiah)
                            </label>
                            {formData.country !== 'Indonesia' && (
                                <p className="text-sm text-orange-600 mb-2 font-medium">
                                    ⚠️ Please convert your currency to Indonesian Rupiah using Google Currency Converter
                                </p>
                            )}
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

                        {/* Transportation/Flight Options */}
                        <div className="pt-4 border-t-2 border-gray-200">
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Transportation Provided
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transportationProvided: 'none' })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                        formData.transportationProvided === 'none'
                                            ? 'bg-gray-400 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    None
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transportationProvided: 'flight' })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                        formData.transportationProvided === 'flight'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Flight Paid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transportationProvided: 'local-transport' })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                        formData.transportationProvided === 'local-transport'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Local Transport Paid
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, transportationProvided: 'both' })}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all ${
                                        formData.transportationProvided === 'both'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    Both Flight & Transport
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Select if you provide flight tickets or transportation for therapist traveling across Indonesia
                            </p>
                        </div>

                        {/* International Position Benefits - Only show for non-Indonesia */}
                        {formData.country !== 'Indonesia' && (
                            <div className="space-y-3 pt-4 border-t-2 border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-3">International Benefits</p>
                                
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.flightsPaidByEmployer}
                                        onChange={(e) => setFormData({ ...formData, flightsPaidByEmployer: e.target.checked })}
                                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <span className="font-medium text-gray-900">Flights Paid By Employer</span>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.visaArrangedByEmployer}
                                        onChange={(e) => setFormData({ ...formData, visaArrangedByEmployer: e.target.checked })}
                                        className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
                                    />
                                    <span className="font-medium text-gray-900">Visa Arranged By Employer</span>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Requirements & Benefits */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Requirements</h2>
                        
                        {/* Selected Requirements Tags */}
                        {formData.requirements.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.requirements.map((req) => (
                                    <div key={req} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm">
                                        <span>{req}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    requirements: formData.requirements.filter(r => r !== req) 
                                                });
                                            }}
                                            className="ml-1 hover:bg-orange-600 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowRequirementsDropdown(!showRequirementsDropdown)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-orange-400"
                            >
                                <span className="text-gray-700">Select Requirements</span>
                                <svg className={`w-5 h-5 transition-transform ${showRequirementsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showRequirementsDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {/* Close Button */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowRequirementsDropdown(false)}
                                            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
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
                                            className={`w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center justify-between ${
                                                formData.requirements.includes(req) ? 'bg-orange-100' : ''
                                            }`}
                                        >
                                            <span className="text-sm">{req}</span>
                                            {formData.requirements.includes(req) && (
                                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <h2 className="text-lg font-bold text-gray-900 mt-6">Benefits</h2>
                        
                        {/* Selected Benefits Tags */}
                        {formData.benefits.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.benefits.map((benefit) => (
                                    <div key={benefit} className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm">
                                        <span>{benefit}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    benefits: formData.benefits.filter(b => b !== benefit) 
                                                });
                                            }}
                                            className="ml-1 hover:bg-orange-600 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowBenefitsDropdown(!showBenefitsDropdown)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-orange-400"
                            >
                                <span className="text-gray-700">Select Benefits</span>
                                <svg className={`w-5 h-5 transition-transform ${showBenefitsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showBenefitsDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {/* Close Button */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowBenefitsDropdown(false)}
                                            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
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
                                            className={`w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center justify-between ${
                                                formData.benefits.includes(benefit) ? 'bg-orange-100' : ''
                                            }`}
                                        >
                                            <span className="text-sm">{benefit}</span>
                                            {formData.benefits.includes(benefit) && (
                                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Massage Types Required */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Massage Types Required</h2>
                        <p className="text-sm text-gray-600">Select the massage types the therapist must be skilled in</p>
                        
                        {/* Selected Massage Types Tags */}
                        {formData.massageTypes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.massageTypes.map((type) => (
                                    <div key={type} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm">
                                        <span>{type}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    massageTypes: formData.massageTypes.filter(t => t !== type) 
                                                });
                                            }}
                                            className="ml-1 hover:bg-blue-600 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowMassageTypesDropdown(!showMassageTypesDropdown)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-orange-400"
                            >
                                <span className="text-gray-700">Select Massage Types</span>
                                <svg className={`w-5 h-5 transition-transform ${showMassageTypesDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showMassageTypesDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {/* Close Button */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowMassageTypesDropdown(false)}
                                            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {massageTypes.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                const newTypes = formData.massageTypes.includes(type)
                                                    ? formData.massageTypes.filter(t => t !== type)
                                                    : [...formData.massageTypes, type];
                                                setFormData({ ...formData, massageTypes: newTypes });
                                            }}
                                            className={`w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center justify-between ${
                                                formData.massageTypes.includes(type) ? 'bg-orange-100' : ''
                                            }`}
                                        >
                                            <span className="text-sm">{type}</span>
                                            {formData.massageTypes.includes(type) && (
                                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Languages Required */}
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Languages Required</h2>
                        <p className="text-sm text-gray-600">Select the languages the therapist must speak</p>
                        
                        {/* Selected Languages Tags */}
                        {formData.requiredLanguages.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.requiredLanguages.map((lang) => (
                                    <div key={lang} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm">
                                        <span>{lang}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData({ 
                                                    ...formData, 
                                                    requiredLanguages: formData.requiredLanguages.filter(l => l !== lang) 
                                                });
                                            }}
                                            className="ml-1 hover:bg-green-600 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowLanguagesDropdown(!showLanguagesDropdown)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-orange-400"
                            >
                                <span className="text-gray-700">Select Languages</span>
                                <svg className={`w-5 h-5 transition-transform ${showLanguagesDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showLanguagesDropdown && (
                                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                    {/* Close Button */}
                                    <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowLanguagesDropdown(false)}
                                            className="w-6 h-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {availableLanguages.map((lang) => (
                                        <button
                                            key={lang}
                                            type="button"
                                            onClick={() => {
                                                const newLangs = formData.requiredLanguages.includes(lang)
                                                    ? formData.requiredLanguages.filter(l => l !== lang)
                                                    : [...formData.requiredLanguages, lang];
                                                setFormData({ ...formData, requiredLanguages: newLangs });
                                            }}
                                            className={`w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center justify-between ${
                                                formData.requiredLanguages.includes(lang) ? 'bg-orange-100' : ''
                                            }`}
                                        >
                                            <span className="text-sm">{lang}</span>
                                            {formData.requiredLanguages.includes(lang) && (
                                                <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        {isSubmitting ? 'Submitting...' : 'Post Job'}
                    </button>
                </form>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }
                
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default EmployerJobPostingPage;
