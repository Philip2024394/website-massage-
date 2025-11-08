import React, { useState } from 'react';
import { ArrowLeft, Upload, MapPin, Phone, Mail, Globe, Star, CheckCircle, Menu, Building2, User, Hotel, Home } from 'lucide-react';
import Header from '../components/Header';
import UnifiedFooter from '../components/UnifiedFooter';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface PartnershipApplicationPageProps {
    onBack: () => void;
    t?: any;
    // Navigation props for header and drawer
    onNavigate?: (page: any) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const PartnershipApplicationPage: React.FC<PartnershipApplicationPageProps> = ({ 
    onBack, 
    t,
    onNavigate,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: 'massage-place',
        websiteUrl: '',
        email: '',
        phone: '',
        location: '',
        address: '',
        description: '',
        specialties: [] as string[],
        yearsInBusiness: '',
        certifications: '',
        socialMediaLinks: {
            instagram: '',
            facebook: '',
            twitter: ''
        },
        agreeToTerms: false
    });

    const [files, setFiles] = useState({
        businessLicense: null as File | null,
        businessPhotos: [] as File[],
        certificationDocuments: [] as File[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const businessTypes = [
        { value: 'massage-place', label: 'Massage Place/Spa', icon: Building2 },
        { value: 'therapist', label: 'Individual Therapist', icon: User },
        { value: 'hotel', label: 'Hotel/Resort', icon: Hotel },
        { value: 'villa', label: 'Villa/Private Retreat', icon: Home }
    ];

    const specialtyOptions = [
        'Swedish Massage', 'Deep Tissue', 'Thai Massage', 'Hot Stone', 'Aromatherapy',
        'Sports Massage', 'Reflexology', 'Balinese Massage', 'Prenatal Massage',
        'Couples Massage', 'Spa Treatments', 'Wellness Programs', 'Yoga Classes',
        'Meditation', 'Acupuncture', 'Facials', 'Body Wraps'
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev],
                    [child]: value
                }
            }));
        } else if (type === 'checkbox') {
            const target = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                [name]: target.checked
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSpecialtyToggle = (specialty: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(specialty)
                ? prev.specialties.filter(s => s !== specialty)
                : [...prev.specialties, specialty]
        }));
    };

    const handleFileUpload = (fileType: string, file: File | File[]) => {
        setFiles(prev => ({
            ...prev,
            [fileType]: file
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API submission
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Here you would normally send the data to your backend/Appwrite
            console.log('Partnership application submitted:', {
                formData,
                files
            });
            
            setSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                    <div className="mb-8">
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">
                            Application Submitted Successfully!
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            Thank you for your interest in becoming an IndaStreet partner. We'll review your application and get back to you within 3-5 business days.
                        </p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold text-orange-800 mb-2">What happens next?</h3>
                        <ul className="text-left text-orange-700 space-y-2">
                            <li>• Our team will review your application and documents</li>
                            <li>• We'll verify your business credentials and certifications</li>
                            <li>• You'll receive an email with the review decision</li>
                            <li>• If approved, we'll guide you through the onboarding process</li>
                        </ul>
                    </div>

                    <button
                        onClick={onBack}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                    >
                        Return to Partnership Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                <span className="text-black">Inda</span><span className="text-orange-500">Street</span> Partnership Application
                            </h1>
                            <p className="text-gray-600">Join our network of verified wellness professionals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Business Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Enter your business name"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    required
                                >
                                    {businessTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website URL
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        name="websiteUrl"
                                        value={formData.websiteUrl}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="https://your-website.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Years in Business <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="yearsInBusiness"
                                    value={formData.yearsInBusiness}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="5"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Business Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="Describe your business, services, and what makes you unique..."
                                required
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="+1 (555) 000-0000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        placeholder="123 Main St, City, State, Country"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services & Specialties */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Services & Specialties</h2>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Select your specialties <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {specialtyOptions.map(specialty => (
                                    <label
                                        key={specialty}
                                        className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                                            formData.specialties.includes(specialty)
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.specialties.includes(specialty)}
                                            onChange={() => handleSpecialtyToggle(specialty)}
                                            className="text-orange-500 focus:ring-orange-500"
                                        />
                                        <span className="text-sm">{specialty}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Certifications & Qualifications
                            </label>
                            <textarea
                                name="certifications"
                                value={formData.certifications}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                placeholder="List your certifications, licenses, and qualifications..."
                            />
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Media (Optional)</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                                <input
                                    type="url"
                                    name="socialMediaLinks.instagram"
                                    value={formData.socialMediaLinks.instagram}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="https://instagram.com/yourbusiness"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                                <input
                                    type="url"
                                    name="socialMediaLinks.facebook"
                                    value={formData.socialMediaLinks.facebook}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="https://facebook.com/yourbusiness"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                                <input
                                    type="url"
                                    name="socialMediaLinks.twitter"
                                    value={formData.socialMediaLinks.twitter}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="https://twitter.com/yourbusiness"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business License/Registration <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Click to upload your business license or registration document
                                    </p>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload('businessLicense', e.target.files[0])}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Business Photos (up to 5)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        Upload photos of your business, facilities, or treatments
                                    </p>
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png"
                                        multiple
                                        onChange={(e) => e.target.files && handleFileUpload('businessPhotos', Array.from(e.target.files))}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Submit */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="mb-6">
                            <label className="flex items-start space-x-3">
                                <input
                                    type="checkbox"
                                    name="agreeToTerms"
                                    checked={formData.agreeToTerms}
                                    onChange={handleInputChange}
                                    className="mt-1 text-orange-500 focus:ring-orange-500"
                                    required
                                />
                                <span className="text-sm text-gray-700">
                                    I agree to the <a href="#" className="text-orange-500 hover:text-orange-600">Terms of Service</a> and <a href="#" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>. I confirm that all information provided is accurate and I have the authority to represent this business.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.agreeToTerms}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-colors"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Submitting Application...
                                </div>
                            ) : (
                                'Submit Partnership Application'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartnershipApplicationPage;