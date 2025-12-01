import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, MapPin, Phone, Mail, Globe, CheckCircle, Building2, User, Hotel, Home } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawer';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FlyingButterfly from '../components/FlyingButterfly';
import { databases, ID } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

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
        propertyType: '' as 'hotel' | 'villa' | '',
        businessName: '',
        whatsappNumber: '',
        location: '',
        address: '',
        description: '',
        amenities: [] as string[],
        mainImage: '',
        profileImage: '',
        numberOfRooms: '',
        checkInTime: '',
        petsAllowed: false,
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
    const [partnershipImages, setPartnershipImages] = useState({
        headerBg: 'https://ik.imagekit.io/7grri5v7d/indastreet%20villa.png',
        hotelImage: 'https://ik.imagekit.io/7grri5v7d/hotel%20indonisea.png',
        villaImage: 'https://ik.imagekit.io/7grri5v7d/villa%20indonisea.png'
    });

    useEffect(() => {
        const fetchPartnershipImages = async () => {
            try {
                const response = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    []
                );
                
                const images = response.documents;
                const newImages = { ...partnershipImages };
                
                images.forEach((doc: any) => {
                    if (doc.page === 'partnership' || doc.assetType === 'partnership') {
                        if (doc.name?.includes('header') || doc.name?.includes('background')) {
                            newImages.headerBg = doc.imageUrl;
                        } else if (doc.name?.includes('hotel')) {
                            newImages.hotelImage = doc.imageUrl;
                        } else if (doc.name?.includes('villa')) {
                            newImages.villaImage = doc.imageUrl;
                        }
                    }
                });
                
                setPartnershipImages(newImages);
            } catch (error) {
                console.log('Using fallback partnership images');
            }
        };
        
        fetchPartnershipImages();
    }, []);

    const hotelAmenities = [
        { name: 'WiFi', icon: '📶' },
        { name: 'Pool', icon: '🏊' },
        { name: 'Spa', icon: '💆' },
        { name: 'Restaurant', icon: '🍽️' },
        { name: 'Bar', icon: '🍸' },
        { name: 'Gym', icon: '💪' },
        { name: 'Service', icon: '🛎️' },
        { name: 'Conference', icon: '👔' },
        { name: 'Shuttle', icon: '✈️' },
        { name: 'Parking', icon: '🅿️' },
        { name: 'AC', icon: '❄️' },
        { name: 'Laundry', icon: '🧺' },
        { name: 'Concierge', icon: '🎩' },
        { name: 'Business', icon: '💼' },
        { name: 'Reception', icon: '🏨' },
        { name: 'Pets', icon: '🐕' },
        { name: 'Rooftop', icon: '🌇' },
        { name: 'Kids', icon: '🎈' },
        { name: 'Casino', icon: '🎰' },
        { name: 'Beach', icon: '🏖️' },
        { name: 'Movies', icon: '📺' },
        { name: 'Prayer', icon: '🕌' }
    ];

    const villaAmenities = [
        { name: 'Pool', icon: '🏊' },
        { name: 'Kitchen', icon: '🍳' },
        { name: 'Garden', icon: '🌳' },
        { name: 'BBQ', icon: '🔥' },
        { name: 'Dining', icon: '🍽️' },
        { name: 'WiFi', icon: '📶' },
        { name: 'AC', icon: '❄️' },
        { name: 'Beach', icon: '🏖️' },
        { name: 'Butler', icon: '🤵' },
        { name: 'Jacuzzi', icon: '🛁' },
        { name: 'Theater', icon: '📺' },
        { name: 'Games', icon: '🎮' },
        { name: 'Gym', icon: '💪' },
        { name: 'Chef', icon: '👨‍🍳' },
        { name: 'Housekeeping', icon: '🧹' },
        { name: 'Mountain', icon: '⛰️' },
        { name: 'Ocean', icon: '🌊' },
        { name: 'Security', icon: '🔒' },
        { name: 'Parking', icon: '🅿️' },
        { name: 'Balcony', icon: '🏡' },
        { name: 'Laundry', icon: '🧺' },
        { name: 'Movies', icon: '📺' },
        { name: 'Prayer', icon: '🕌' }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => {
                const parentObj = prev[parent as keyof typeof prev];
                const validParentObj = (typeof parentObj === 'object' && parentObj !== null) ? parentObj as Record<string, any> : {};
                return {
                    ...prev,
                    [parent]: {
                        ...validParentObj,
                        [child]: value
                    }
                };
            });
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

    const handleAmenityToggle = (amenityName: string) => {
        setFormData(prev => {
            const isCurrentlySelected = prev.amenities.includes(amenityName);
            
            if (isCurrentlySelected) {
                // Remove if already selected
                return {
                    ...prev,
                    amenities: prev.amenities.filter(a => a !== amenityName)
                };
            } else {
                // Check if already at max 5
                if (prev.amenities.length >= 5) {
                    alert('You can select a maximum of 5 amenities');
                    return prev;
                }
                // Add if under limit
                return {
                    ...prev,
                    amenities: [...prev.amenities, amenityName]
                };
            }
        });
    };

    const handleFileUpload = (fileType: string, file: File | File[]) => {
        setFiles(prev => ({
            ...prev,
            [fileType]: file
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.propertyType) {
            alert('Please select a property type (Hotel or Villa)');
            return;
        }
        
        if (!formData.businessName || !formData.whatsappNumber || !formData.location) {
            alert('Please fill in all required fields (Name, WhatsApp, Location)');
            return;
        }
        
        if (!formData.agreeToTerms) {
            alert('Please agree to the terms and conditions');
            return;
        }
        
        setIsSubmitting(true);

        try {
            // Save to hotels collection (villas are saved with type: 'villa')
            const collectionId = APPWRITE_CONFIG.collections.hotels;
            
            const documentData: any = {
                name: formData.businessName,
                hotelName: formData.businessName,
                whatsappNumber: formData.whatsappNumber,
                contactNumber: formData.whatsappNumber,
                phone: formData.whatsappNumber,
                location: formData.location,
                address: formData.address || formData.location,
                description: formData.description || '',
                specialties: JSON.stringify(formData.amenities),
                type: formData.propertyType,
                imageUrl: formData.mainImage || '',
                mainImage: formData.mainImage || '',
                profileImage: formData.profileImage || '',
                numberOfRooms: formData.numberOfRooms || '0',
                checkInTime: formData.checkInTime || '',
                petsAllowed: formData.petsAllowed || false,
                status: 'pending',
                applicationDate: new Date().toISOString(),
                addedDate: new Date().toISOString(),
                approved: false,
                isLive: false,
                verified: false
            };

            // Save to Appwrite
            let savedDocumentId = '';
            if (collectionId && collectionId !== '') {
                const response = await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    collectionId,
                    ID.unique(),
                    documentData
                );
                
                savedDocumentId = response.$id;
                console.log('✅ Hotel/Villa partnership application saved to Appwrite:', response);
            } else {
                console.warn('⚠️ Hotels collection not configured');
                throw new Error('Collection not available');
            }
            
            // Redirect to partners page to see their card once it's live
            if (onHotelPortalClick && formData.propertyType === 'hotel') {
                onHotelPortalClick();
            } else if (onVillaPortalClick && formData.propertyType === 'villa') {
                onVillaPortalClick();
            } else {
                setSubmitted(true);
            }
        } catch (error) {
            console.error('❌ Submission error:', error);
            alert(`Failed to submit application. ${error instanceof Error ? error.message : 'Please try again or contact support.'}`);
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
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Header with Burger Menu */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Home Button */}
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('home');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" 
                            title="Home"
                        >
                            <Home className="w-5 h-5" />
                        </button>

                        <button onClick={() => {
                            console.log('🍔 Burger menu clicked! Current isMenuOpen:', isMenuOpen);
                            console.log('🍔 Setting isMenuOpen to true');
                            setIsMenuOpen(true);
                            console.log('🍔 After setting - isMenuOpen should be true');
                        }} title="Menu" style={{ zIndex: 9999, position: 'relative' }}>
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Global App Drawer */}
            <React19SafeWrapper condition={isMenuOpen}>
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => {
                        console.log('🍔 AppDrawer onClose called');
                        setIsMenuOpen(false);
                    }}
                    t={t}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onNavigate={onNavigate}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    therapists={therapists}
                    places={places}
                />
            </React19SafeWrapper>

            {/* Partnership Application Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div 
                    className="rounded-lg shadow-lg p-8 mb-6 text-white relative overflow-hidden"
                    style={{
                        backgroundImage: `url(${partnershipImages.headerBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold mb-4">
                            <span className="text-white">Inda</span>
                            <span className="text-orange-500">street Partnership</span>
                        </h1>
                        <p className="text-lg leading-relaxed">
                            Transform your property into a premium wellness destination! Join the exclusive Indastreet Massage Hub network 
                            and watch your listing go LIVE in minutes. Attract more guests, boost your revenue, and stand out from the competition. 
                            All we need is a quick confirmation to place a small, elegant Indastreet display in your rooms—completely FREE, 
                            with zero costs forever. Let's grow together!
                        </p>
                    </div>
                </div>

                {/* Application Form Section */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Form</h2>
                    <p className="text-gray-600">Complete the form below to join our network of accommodation partners</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Property Type Selection - FIRST */}
                    <div 
                        className="bg-white rounded-lg shadow-sm p-6"
                        style={{
                            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/vill%20sketch%20indonise.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Accommodation Type <span className="text-red-500">*</span></h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, propertyType: 'hotel', amenities: [] }))}
                                className="relative rounded-xl border-2 transition-all overflow-hidden h-64"
                                style={{
                                    borderColor: formData.propertyType === 'hotel' ? '#22c55e' : '#e5e7eb'
                                }}
                            >
                                <img 
                                    src={partnershipImages.hotelImage}
                                    alt="Hotel"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <div className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                                        formData.propertyType === 'hotel'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                    }`}>
                                        Hotel
                                    </div>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, propertyType: 'villa', amenities: [] }))}
                                className="relative rounded-xl border-2 transition-all overflow-hidden h-64"
                                style={{
                                    borderColor: formData.propertyType === 'villa' ? '#22c55e' : '#e5e7eb'
                                }}
                            >
                                <img 
                                    src={partnershipImages.villaImage}
                                    alt="Villa"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                    <div className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${
                                        formData.propertyType === 'villa'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                    }`}>
                                        Villa
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Only show rest of form if property type is selected */}
                    {formData.propertyType && (
                        <>
                            {/* Premises Details */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                    Premises Details
                                </h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {formData.propertyType === 'hotel' ? 'Hotel' : 'Villa'} Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder={`Enter your ${formData.propertyType} name`}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Rooms <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="numberOfRooms"
                                            value={formData.numberOfRooms}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="e.g., 25"
                                            min="1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Check-in Time <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            name="checkInTime"
                                            value={formData.checkInTime}
                                            onChange={handleInputChange}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            required
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Standard check-in time for guests</p>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                name="petsAllowed"
                                                checked={formData.petsAllowed}
                                                onChange={handleInputChange}
                                                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    🐕 Pets Allowed
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">Check if your property accepts pets</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            WhatsApp Number <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                            <span className="absolute left-12 top-3.5 text-gray-700 font-medium">+62</span>
                                            <input
                                                type="tel"
                                                name="whatsappNumber"
                                                value={formData.whatsappNumber}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    handleInputChange({
                                                        ...e,
                                                        target: { ...e.target, value }
                                                    });
                                                }}
                                                className="w-full border border-gray-300 rounded-lg pl-20 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                placeholder="812 3456 7890"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Guests will contact you via WhatsApp for reservations</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location (City/Area) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                                    placeholder="e.g., Seminyak, Bali"
                                                    required
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    if (navigator.geolocation) {
                                                        navigator.geolocation.getCurrentPosition(
                                                            async (position) => {
                                                                const { latitude, longitude } = position.coords;
                                                                try {
                                                                    // Use reverse geocoding to get location name
                                                                    const response = await fetch(
                                                                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                                                                    );
                                                                    const data = await response.json();
                                                                    const location = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Location detected';
                                                                    setFormData(prev => ({ ...prev, location }));
                                                                } catch (error) {
                                                                    alert('Could not get location name. Please enter manually.');
                                                                }
                                                            },
                                                            (error) => {
                                                                alert('Please enable location services to use this feature.');
                                                            }
                                                        );
                                                    } else {
                                                        alert('Geolocation is not supported by your browser.');
                                                    }
                                                }}
                                                className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap flex items-center gap-2"
                                            >
                                                <MapPin className="w-4 h-4" />
                                                Set Location
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Click "Set Location" to use your current location from phone/device</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder="Enter complete street address with landmarks"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">This will help guests find your property using Google Maps</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            rows={5}
                                            maxLength={350}
                                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            placeholder={`Describe your ${formData.propertyType}, unique features, atmosphere, and what makes it special...`}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.description.length}/350 characters
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Amenities */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    {formData.propertyType === 'hotel' ? 'Hotel' : 'Villa'} Amenities
                                </h2>
                                <p className="text-sm text-gray-600 mb-2">Select up to 5 amenities available at your property</p>
                                <p className="text-xs text-orange-600 mb-6">
                                    {formData.amenities.length}/5 selected
                                </p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {(formData.propertyType === 'hotel' ? hotelAmenities : villaAmenities).map((amenity) => (
                                        <label
                                            key={amenity.name}
                                            className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={formData.amenities.includes(amenity.name)}
                                                onChange={() => handleAmenityToggle(amenity.name)}
                                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                            />
                                            <span className="text-lg">{amenity.icon}</span>
                                            <span className="text-sm text-gray-700">{amenity.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Image</h2>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Main Property Image <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        name="mainImage"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                // Store file temporarily - in production, upload to storage
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        mainImage: reader.result as string
                                                    }));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Upload your main property photo (JPG, PNG - recommended: 1200x600px)</p>
                                    {formData.mainImage && (
                                        <div className="mt-3">
                                            <img src={formData.mainImage} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                        </div>
                                    )}
                                    <p className="text-xs text-blue-600 mt-2">ℹ️ Profile image will be set by the Indastreet admin team</p>
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="agreeToTerms"
                                        checked={formData.agreeToTerms}
                                        onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
                                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 mt-0.5"
                                        required
                                    />
                                    <span className="text-sm text-gray-700">
                                        I agree to the terms and conditions and confirm that all information provided is accurate and complete. 
                                        I understand that my application will be reviewed by the Indastreet team before approval. 
                                        I acknowledge that any future edits or changes will require team approval and may take up to 
                                        <span className="font-bold"> 72 hours</span> to process, so I have carefully reviewed all details 
                                        before submitting to avoid delays.
                                    </span>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-4 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting Application...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Submit Partnership Application
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PartnershipApplicationPage;