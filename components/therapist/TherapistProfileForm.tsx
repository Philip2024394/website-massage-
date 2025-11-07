import React from 'react';
import UserSolidIcon from '../icons/UserSolidIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import PhoneIcon from '../icons/PhoneIcon';
import MapPinIcon from '../icons/MapPinIcon';
import Button from '../Button';
import ImageUpload from '../ImageUpload';
import CustomCheckbox from '../CustomCheckbox';
import { MASSAGE_TYPES_CATEGORIZED } from '../../constants/rootConstants';
import CurrencyRpIcon from '../icons/CurrencyRpIcon';
import PageNumberBadge from '../PageNumberBadge';

interface TherapistProfileFormProps {
    // Profile data
    profilePicture: string;
    name: string;
    yearsOfExperience: number;
    description: string;
    whatsappNumber: string;
    massageTypes: string[];
    languages: string[];
    location: string;
    coordinates: { lat: number; lng: number };
    pricing: any;
    hotelVillaPricing: any;
    useSamePricing: boolean;
    isLicensed: boolean;
    licenseNumber: string;
    
    // Website fields for Partners directory
    websiteUrl?: string;
    websiteTitle?: string;
    websiteDescription?: string;
    
    // Setters
    setProfilePicture: (value: string) => void;
    setName: (value: string) => void;
    setYearsOfExperience: (value: number) => void;
    setDescription: (value: string) => void;
    setWhatsappNumber: (value: string) => void;
    setMassageTypes: (value: string[]) => void;
    setLanguages: (value: string[]) => void;
    setLocation: (value: string) => void;
    setCoordinates: (value: { lat: number; lng: number }) => void;
    setPricing: (value: any) => void;
    setHotelVillaPricing: (value: any) => void;
    setUseSamePricing: (value: boolean) => void;
    setLicenseNumber: (value: string) => void;
    
    // Website setters
    setWebsiteUrl?: (value: string) => void;
    setWebsiteTitle?: (value: string) => void;
    setWebsiteDescription?: (value: string) => void;
    
    // Modal state
    showImageRequirementModal: boolean;
    setShowImageRequirementModal: (value: boolean) => void;
    pendingImageUrl: string;
    setPendingImageUrl: (value: string) => void;
    
    // Additional props
    therapistId: string | number;
    t: any; // translations object
    locationInputRef: React.RefObject<HTMLInputElement | null>;
    mapsApiLoaded: boolean;
    setToast: (toast: any) => void;
    
    // Handlers
    handleSave: () => void;
    handleGoLive?: () => void;
    handleSetLocation: () => void;
    
    // Profile status
    isProfileReadyForSave?: boolean;
    isProfileLive?: boolean;
}

export const TherapistProfileForm: React.FC<TherapistProfileFormProps> = ({
    profilePicture, name, yearsOfExperience, description, whatsappNumber,
    massageTypes, languages, location, coordinates, pricing, hotelVillaPricing,
    useSamePricing, isLicensed, licenseNumber,
    setProfilePicture, setName, setYearsOfExperience, setDescription, setWhatsappNumber,
    setMassageTypes, setLanguages, setLocation, setPricing,
    setHotelVillaPricing, setUseSamePricing, setLicenseNumber,
    showImageRequirementModal, setShowImageRequirementModal, pendingImageUrl, setPendingImageUrl,
    therapistId, t, locationInputRef, mapsApiLoaded, setToast,
    handleSave, handleGoLive, handleSetLocation,
    isProfileReadyForSave, isProfileLive
}) => {
    const therapistService = {
        getById: async (id: string) => {
            // Mock implementation - replace with actual service
            console.log('Getting therapist by ID:', id);
            return null;
        },
        update: async (id: string, data: any) => {
            // Mock implementation - replace with actual service
            console.log('Updating therapist:', id, data);
        }
    };

    const renderInput = (value: string, onChange: (value: string) => void, Icon: any, placeholder?: string) => (
        <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input 
                type="text" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={placeholder || "Enter value"}
                aria-label={placeholder || "Input field"}
                className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" 
            />
        </div>
    );

    const handleMassageTypeChange = (type: string) => {
        if (massageTypes.includes(type)) {
            // Remove if already selected
            setMassageTypes(massageTypes.filter(t => t !== type));
        } else {
            // Add only if less than 5 are selected
            if (massageTypes.length < 5) {
                setMassageTypes([...massageTypes, type]);
            }
            // Silently ignore if trying to select more than 5
        }
    };

    const handleLanguageChange = (langCode: string) => {
        if (languages.includes(langCode)) {
            setLanguages(languages.filter(l => l !== langCode));
        } else {
            setLanguages([...languages, langCode]);
        }
    };

    const formatPriceDisplay = (price: number): string => {
        if (price === 0) return '';
        return price.toLocaleString();
    };

    const handlePriceChange = (duration: string, value: string) => {
        const numericValue = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
        setPricing({ ...pricing, [duration]: numericValue });
        
        if (useSamePricing) {
            setHotelVillaPricing({ ...hotelVillaPricing, [duration]: numericValue });
        }
    };

    const handleHotelVillaPriceChange = (duration: string, value: string) => {
        const numericValue = parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
        const maxPrice = Math.floor(pricing[duration] * 1.2);
        
        if (numericValue <= maxPrice || pricing[duration] === 0) {
            setHotelVillaPricing({ ...hotelVillaPricing, [duration]: numericValue });
        }
    };

    const handleUseSamePricingChange = (checked: boolean) => {
        setUseSamePricing(checked);
        if (checked) {
            setHotelVillaPricing(pricing);
        }
    };

    const handleProfilePictureChange = (imageUrl: string) => {
        console.log('🖼️ Profile picture changed to:', imageUrl);
        console.log('🖼️ URL length:', imageUrl.length);
        setPendingImageUrl(imageUrl);
        setShowImageRequirementModal(true);
    };

    const handleAcceptImageRequirement = async () => {
        const newImageUrl = pendingImageUrl;
        setProfilePicture(newImageUrl);
        setShowImageRequirementModal(false);
        setPendingImageUrl('');
        
        try {
            console.log('💾 Auto-saving profile picture to database...');
            const therapistIdString = typeof therapistId === 'string' 
                ? therapistId 
                : therapistId.toString();
            
            const existingProfile = await therapistService.getById(therapistIdString);
            
            if (existingProfile) {
                await therapistService.update(therapistIdString, {
                    profilePicture: newImageUrl
                });
                console.log('✅ Profile picture auto-saved to existing profile!');
            } else {
                console.log('🔄 New profile detected - profile picture set, use Save Profile for full creation');
                setToast({ message: '📷 Profile picture set! Please click "Save Profile" to create your complete profile.', type: 'warning' });
                setTimeout(() => setToast(null), 4000);
                return;
            }
            
            setToast({ message: '✅ Profile picture saved automatically!', type: 'success' });
            setTimeout(() => setToast(null), 3000);
        } catch (error) {
            console.error('❌ Error auto-saving profile picture:', error);
            
            let errorMessage = '⚠️ Profile picture uploaded but auto-save failed. Please click "Save Profile" button.';
            
            if (error instanceof Error) {
                if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMessage = '🌐 Network error during auto-save. Please check connection and use "Save Profile" button.';
                } else if (error.message.includes('permission') || error.message.includes('auth')) {
                    errorMessage = '🔐 Permission error during auto-save. Please use "Save Profile" button.';
                } else if (error.message.includes('not found') || error.message.includes('404')) {
                    errorMessage = '📄 Profile not found. Please use "Save Profile" button to create your profile.';
                }
            }
            
            setToast({ message: errorMessage, type: 'error' });
            setTimeout(() => setToast(null), 6000);
        }
    };

    const handleRejectImageRequirement = () => {
        setShowImageRequirementModal(false);
        setPendingImageUrl('');
    };

    return (
        <div className="space-y-6">
            <PageNumberBadge pageNumber={23} pageName="TherapistProfile" isLocked={false} />
            {/* Profile Header */}
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your therapist profile information</p>
            </div>
            
            {/* Image Requirement Modal - Professional Design */}
            {showImageRequirementModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Profile Photo Requirements</h3>
                                    <p className="text-orange-100 text-sm">Please read carefully before uploading</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 space-y-4">
                            {/* Important Notice */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <p className="font-semibold text-orange-900 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Required for Active Account
                                </p>
                            </div>
                            
                            {/* Requirements Section */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <p className="font-semibold text-gray-900 text-sm">✓ Your photo must include:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Clear front or side view of your face</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Well-lit, professional appearance</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>Recent photo (within 6 months)</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Warning Section */}
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                                <p className="font-semibold text-red-900 text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                    </svg>
                                    Account Suspension Policy
                                </p>
                                <ul className="space-y-1.5 text-xs text-red-800">
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-red-600">•</span>
                                        <span>Logos, graphics, or unrelated images</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-red-600">•</span>
                                        <span>Photos not showing your face clearly</span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-red-600">•</span>
                                        <span>Using someone else's photo</span>
                                    </li>
                                </ul>
                                <p className="text-xs text-red-900 font-semibold pt-1">
                                    May result in immediate account suspension
                                </p>
                            </div>
                            
                            {/* Confirmation Text */}
                            <p className="text-xs text-gray-500 italic text-center pt-2">
                                By confirming, you verify this is a genuine photo of yourself that meets all requirements
                            </p>
                        </div>
                        
                        {/* Footer Buttons */}
                        <div className="bg-gray-50 px-6 py-4 flex gap-3">
                            <button
                                onClick={handleRejectImageRequirement}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAcceptImageRequirement}
                                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 shadow-md transition-all"
                            >
                                I Understand & Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ImageUpload
                id="profile-picture-upload"
                label={t.uploadProfilePic}
                currentImage={profilePicture}
                onImageChange={handleProfilePictureChange}
                variant="profile"
            />
            
            {/* Profile Picture Guidelines */}
            <div className="text-center -mt-2">
                <p className="text-xs text-gray-500">Your Image front or Side Photo !</p>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">{t.nameLabel}</label>
                {renderInput(name, setName, UserSolidIcon, "Enter your full name")}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setYearsOfExperience(Math.max(0, yearsOfExperience - 1))}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        title="Decrease years of experience"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1 text-center">
                        <span className="text-2xl font-bold text-gray-900">{yearsOfExperience}</span>
                        <span className="text-sm text-gray-500 ml-2">years</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => setYearsOfExperience(Math.min(50, yearsOfExperience + 1))}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        aria-label="Increase years of experience"
                        title="Increase years of experience"
                    >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <label className="text-sm font-semibold text-green-800">Qualified Therapist Badge</label>
                    </div>
                </div>
                <div className="bg-white/50 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-green-800">
                        <p className="font-semibold mb-2">Badge Requirements:</p>
                        <ul className="space-y-1 ml-4 list-disc">
                            <li>3 consecutive months of paid membership</li>
                            <li>Maximum 5-day grace period between renewals</li>
                            <li>Maintain a rating of 4.0 stars or higher</li>
                        </ul>
                    </div>
                    <div className="text-xs text-green-700 bg-green-100 rounded p-2 mt-2">
                        <p className="font-semibold">📢 Membership Reminder:</p>
                        <p className="mt-1">You will receive a WhatsApp notification 7 days before your membership expires with renewal instructions and badge status.</p>
                    </div>
                    {isLicensed && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                            <label className="block text-xs font-medium text-green-700 mb-1">License Number (Optional)</label>
                            <input
                                type="text"
                                value={licenseNumber}
                                onChange={e => setLicenseNumber(e.target.value)}
                                placeholder="Enter your license number"
                                className="block w-full px-3 py-2 bg-white border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-gray-900 text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t.descriptionLabel}</label>
                <div className="relative">
                    <div className="absolute top-3.5 left-0 pl-3 flex items-center pointer-events-none">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea 
                        value={description} 
                        onChange={e => {
                            if (e.target.value.length <= 250) {
                                setDescription(e.target.value);
                            }
                        }} 
                        rows={3} 
                        maxLength={250}
                        placeholder="Describe your massage expertise and specialties"
                        aria-label="Therapist description"
                        className="mt-1 block w-full pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {description.length}/250 characters
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">{t.whatsappLabel}</label>
                <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <span className="absolute inset-y-0 left-10 pl-2 flex items-center text-gray-500 text-sm pointer-events-none">+62</span>
                    <input type="tel" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="81234567890" className="block w-full pl-20 pr-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-orange focus:border-brand-orange text-gray-900" />
                </div>
                <Button 
                    onClick={() => {
                        const audio = new Audio('/sounds/success-notification.mp3');
                        audio.volume = 0.3;
                        audio.play().catch(err => console.log('Sound play failed:', err));
                        
                        const adminNumber = '6281392000050';
                        const message = `Hello IndaStreet Admin, this is a test message from therapist ${name || 'Therapist'} (ID: ${therapistId}). My WhatsApp number is +62${whatsappNumber}.`;
                        window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`, '_blank');
                    }}
                    variant="secondary" 
                    className="flex items-center justify-center gap-2 mt-2 text-sm py-2 bg-green-500 hover:bg-green-600 text-white border-0"
                >
                    <PhoneIcon className="w-4 h-4" />
                    <span>Test WhatsApp Connection</span>
                </Button>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    {t.massageTypesLabel}
                    <span className="text-xs text-gray-500 ml-2">
                        (Select up to 5 specialties - {massageTypes.length}/5 selected)
                    </span>
                </label>
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg space-y-4">
                    {MASSAGE_TYPES_CATEGORIZED.map((category: any) => (
                        <div key={category.category}>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category.category}</h4>
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                                {category.types.map((type: string) => (
                                    <CustomCheckbox
                                        key={type}
                                        label={type}
                                        checked={massageTypes.includes(type)}
                                        onChange={() => handleMassageTypeChange(type)}
                                        disabled={!massageTypes.includes(type) && massageTypes.length >= 5}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Languages Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Languages You Speak</label>
                <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {[
                            { code: 'en', flag: '🇬🇧', name: 'English' },
                            { code: 'id', flag: '🇮🇩', name: 'Indonesian' },
                            { code: 'zh', flag: '🇨🇳', name: 'Chinese' },
                            { code: 'ja', flag: '🇯🇵', name: 'Japanese' },
                            { code: 'ko', flag: '🇰🇷', name: 'Korean' },
                            { code: 'ru', flag: '🇷🇺', name: 'Russian' },
                            { code: 'fr', flag: '🇫🇷', name: 'French' },
                            { code: 'de', flag: '🇩🇪', name: 'German' },
                            { code: 'es', flag: '🇪🇸', name: 'Spanish' }
                        ].map(lang => (
                            <button
                                key={lang.code}
                                type="button"
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                    languages.includes(lang.code)
                                        ? 'bg-blue-50 border-blue-500 text-blue-900'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-lg">{lang.flag}</span>
                                <span className="text-sm font-medium">{lang.name}</span>
                                {languages.includes(lang.code) && (
                                    <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t.locationLabel || 'Location'}</label>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="relative mb-3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            ref={locationInputRef} 
                            type="text" 
                            value={location} 
                            onChange={e => setLocation(e.target.value)} 
                            placeholder={t.locationPlaceholder || 'Enter your location'} 
                            className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-gray-900 text-sm" 
                            readOnly={!mapsApiLoaded}
                        />
                    </div>
                    <Button 
                        onClick={handleSetLocation} 
                        variant="secondary" 
                        className={`w-full flex items-center justify-center gap-2 py-3 text-white border-0 ${
                            location ? 'bg-green-500 hover:bg-green-600' : 'bg-brand-orange hover:bg-orange-600'
                        }`}
                    >
                        <MapPinIcon className="w-5 h-5" />
                        <span className="font-semibold">{location ? 'Location Set ✓' : 'Set Location from Device'}</span>
                    </Button>
                    {location && (
                        <div className="mt-3 space-y-2">
                            <p className="text-xs text-gray-500 text-center">
                                📍 {location.substring(0, 50)}{location.length > 50 ? '...' : ''}
                            </p>
                            {coordinates.lat !== 0 && coordinates.lng !== 0 && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <p className="text-xs font-medium text-gray-700 mb-2">Location Coordinates:</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                        <div className="bg-white rounded p-2 border">
                                            <span className="text-gray-500">Lat:</span>
                                            <span className="font-mono ml-1 text-gray-900">{coordinates.lat.toFixed(6)}</span>
                                        </div>
                                        <div className="bg-white rounded p-2 border">
                                            <span className="text-gray-500">Lng:</span>
                                            <span className="font-mono ml-1 text-gray-900">{coordinates.lng.toFixed(6)}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded p-2 border">
                                        <span className="text-gray-500 text-xs">Map ID:</span>
                                        <div className="font-mono text-xs text-gray-900 mt-1 break-all">
                                            {coordinates.lat.toFixed(6)},{coordinates.lng.toFixed(6)}
                                        </div>
                                        <button
                                            onClick={() => {
                                                const coordString = `${coordinates.lat.toFixed(6)},${coordinates.lng.toFixed(6)}`;
                                                navigator.clipboard.writeText(coordString);
                                                setToast({ message: '📋 Coordinates copied to clipboard!', type: 'success' });
                                                setTimeout(() => setToast(null), 2000);
                                            }}
                                            className="mt-1 mr-3 text-xs text-orange-600 hover:text-orange-700 underline"
                                        >
                                            Copy Coordinates
                                        </button>
                                        <button
                                            onClick={() => {
                                                const mapsUrl = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
                                                window.open(mapsUrl, '_blank');
                                            }}
                                            className="mt-1 text-xs text-blue-600 hover:text-blue-700 underline"
                                        >
                                            View on Google Maps
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-sm sm:text-md font-medium text-gray-800 mb-1">Set Your Prices (Rp)</h3>
                <p className="text-xs text-gray-500 mb-3">These Prices Displayed On The App</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">{t['60min'] || '60min'}</label>
                       <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                           <input type="text" value={formatPriceDisplay(pricing["60"])} onChange={e => handlePriceChange("60", e.target.value)} placeholder="250k" className="block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm" />
                        </div>
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">{t['90min'] || '90min'}</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                           <input type="text" value={formatPriceDisplay(pricing["90"])} onChange={e => handlePriceChange("90", e.target.value)} placeholder="350k" className="block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm" />
                        </div>
                    </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">{t['120min'] || '120min'}</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                           <input type="text" value={formatPriceDisplay(pricing["120"])} onChange={e => handlePriceChange("120", e.target.value)} placeholder="450k" className="block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Hotel/Villa Special Pricing Section */}
            <div className="border-t border-gray-200 pt-4">
                <div className="mb-3">
                    <h3 className="text-sm sm:text-md font-medium text-gray-800">Hotel/Villa Live Menu Pricing</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Set special prices for hotel/villa guest Menu
                    </p>
                    <div className="mt-3">
                        <CustomCheckbox
                            label="Same as regular"
                            checked={useSamePricing}
                            onChange={() => handleUseSamePricingChange(!useSamePricing)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">{t['60min'] || '60min'}</label>
                       <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                           <input 
                               type="text" 
                               value={formatPriceDisplay(hotelVillaPricing["60"])} 
                               onChange={e => handleHotelVillaPriceChange("60", e.target.value)} 
                               placeholder="250k" 
                               disabled={useSamePricing}
                               className={`block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm ${
                                   useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                               }`}
                           />
                        </div>
                        {!useSamePricing && pricing["60"] > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Max: {formatPriceDisplay(Math.floor(pricing["60"] * 1.2))}
                            </p>
                        )}
                    </div>
                    <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">{t['90min'] || '90min'}</label>
                         <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                           <input 
                               type="text" 
                               value={formatPriceDisplay(hotelVillaPricing["90"])} 
                               onChange={e => handleHotelVillaPriceChange("90", e.target.value)} 
                               placeholder="350k" 
                               disabled={useSamePricing}
                               className={`block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm ${
                                   useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                               }`}
                           />
                        </div>
                        {!useSamePricing && pricing["90"] > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Max: {formatPriceDisplay(Math.floor(pricing["90"] * 1.2))}
                            </p>
                        )}
                    </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-600 mb-1">{t['120min'] || '120min'}</label>
                        <div className="relative">
                           <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none"><CurrencyRpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" /></div>
                           <input 
                               type="text" 
                               value={formatPriceDisplay(hotelVillaPricing["120"])} 
                               onChange={e => handleHotelVillaPriceChange("120", e.target.value)} 
                               placeholder="450k" 
                               disabled={useSamePricing}
                               className={`block w-full pl-6 sm:pl-9 pr-1 sm:pr-2 py-2 sm:py-3 border border-gray-300 rounded-md shadow-sm text-gray-900 text-xs sm:text-sm ${
                                   useSamePricing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                               }`}
                           />
                        </div>
                        {!useSamePricing && pricing["120"] > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                Max: {formatPriceDisplay(Math.floor(pricing["120"] * 1.2))}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="pt-4 space-y-3">
                {/* Save Profile Button - Always available for editing */}
                <Button 
                    onClick={handleSave} 
                    className="w-full py-3 text-base font-semibold"
                >
                    {t.saveButton || 'Save Profile'}
                </Button>
                
                {/* Go Live Button - Only show when profile is ready but not live */}
                {isProfileReadyForSave && !isProfileLive && handleGoLive && (
                    <div className="space-y-2">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-green-800">Profile Ready!</h3>
                            </div>
                            <p className="text-sm text-green-700 mb-3">
                                Your profile is complete and ready to go live. Activate it to start receiving bookings from customers.
                            </p>
                        </div>
                        
                        <Button 
                            onClick={handleGoLive}
                            className="w-full py-3 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        >
                            🚀 Go Live & Start Receiving Bookings
                        </Button>
                    </div>
                )}
                
                {/* Status Message for Live Profile */}
                {isProfileLive && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-blue-800">Profile is Live!</h3>
                        </div>
                        <p className="text-sm text-blue-700">
                            ✅ Your profile is active and customers can book your services. You can now set your availability status in the Status tab.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};