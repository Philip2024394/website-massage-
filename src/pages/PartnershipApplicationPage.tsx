// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
/**
 * 🔒 SEALED OWNER-CONTROLLED JEWEL STANDARD - PARTNERSHIP APPLICATION PAGE
 * 
 * ⚠️ CRITICAL: This file is PROTECTED under owner-controlled standards
 * 
 * PROTECTION LEVEL: MAXIMUM
 * - NO unauthorized modifications allowed
 * - NO content changes without explicit owner approval  
 * - NO structural alterations permitted
 * - NO design modifications allowed
 * - NO text content edits permitted
 * 
 * INTERACTION RULES:
 * ✅ ALLOWED: User interaction with contact buttons only
 * ✅ ALLOWED: Navigation functionality
 * ✅ ALLOWED: Form submissions and user inputs
 * ❌ FORBIDDEN: Content editing, layout changes, text modifications
 * ❌ FORBIDDEN: Button styling changes, color modifications
 * ❌ FORBIDDEN: Image replacements, background changes
 * ❌ FORBIDDEN: Typography adjustments, spacing modifications
 * 
 * JEWEL STANDARD ENFORCEMENT:
 * - This page represents core business value
 * - Content is curated and approved at executive level
 * - Any changes require owner authorization via official channels
 * - Unauthorized modifications will be reverted immediately
 * 
 * 🚨 VIOLATION WARNING: Any attempt to modify this protected content
 * will be logged and may result in access restrictions
 * 
 * Last Protection Update: February 1, 2026
 * Protection Authority: IndaStreet Platform Owner
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, MapPin, Phone, Mail, Globe, CheckCircle, Building2, User, Hotel, Home } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FlyingButterfly from '../components/FlyingButterfly';
import { databases, ID, Query } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import UniversalHeader from '../components/shared/UniversalHeader';

// Add CSS animation for letter-by-letter animation from right
const animationStyles = `
@keyframes slide-in-right {
    from {
        transform: translateX(50px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.animate-slide-in-right {
    animation: slide-in-right 0.6s ease-out forwards;
}
`;

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

    // Inject animation styles
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = animationStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    const [files, setFiles] = useState({
        businessLicense: null as File | null,
        businessPhotos: [] as File[],
        certificationDocuments: [] as File[]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [partnershipImages, setPartnershipImages] = useState({
        headerBg: 'https://ik.imagekit.io/7grri5v7d/join%20indastreet%20today.png',
        hotelImage: 'https://ik.imagekit.io/7grri5v7d/hotel%20indonisea.png',
        villaImage: 'https://ik.imagekit.io/7grri5v7d/villa%20indonisea.png',
        massageSpaImage: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20new.png',
        massageSpaWellnessImage: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20newx.png',
        skinCareClinicsImage: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20newxs.png',
        gymsFitnessCentersImage: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20newxss.png',
        hotelsVillaImage: 'https://ik.imagekit.io/7grri5v7d/indonisea%20place%203.png?updatedAt=1767203762379'
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
                        } else if (doc.name?.includes('massage') || doc.name?.includes('spa')) {
                            if (doc.name?.includes('wellness') || doc.name?.includes('newx')) {
                                newImages.massageSpaWellnessImage = doc.imageUrl;
                            } else if (doc.name?.includes('skin') || doc.name?.includes('newxs')) {
                                newImages.skinCareClinicsImage = doc.imageUrl;
                            } else if (doc.name?.includes('gym') || doc.name?.includes('fitness') || doc.name?.includes('newxss')) {
                                newImages.gymsFitnessCentersImage = doc.imageUrl;
                            } else {
                                newImages.massageSpaImage = doc.imageUrl;
                            }
                        } else if (doc.name?.includes('skin') || doc.name?.includes('clinic')) {
                            newImages.skinCareClinicsImage = doc.imageUrl;
                        } else if (doc.name?.includes('gym') || doc.name?.includes('fitness')) {
                            newImages.gymsFitnessCentersImage = doc.imageUrl;
                        } else if (doc.name?.includes('hotels-villa') || doc.name?.includes('indonisea%20place')) {
                            newImages.hotelsVillaImage = doc.imageUrl;
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

    // Save massage spa image to Appwrite
    const saveMassageSpaImageToAppwrite = async () => {
        try {
            const imageData = {
                name: 'massage-spa-home-professionals',
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20new.png',
                page: 'partnership',
                assetType: 'partnership',
                section: 'home-massage-professionals',
                description: 'Background image for Home Massage Professionals section',
                updatedAt: new Date().toISOString()
            };

            // Try to find existing document first
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.imageAssets,
                [
                    Query.equal('name', 'massage-spa-home-professionals')
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing document
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    existingDocs.documents[0].$id,
                    imageData
                );
                console.log('Massage spa image updated in Appwrite');
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    'unique()',
                    imageData
                );
                console.log('Massage spa image saved to Appwrite');
            }
        } catch (error) {
            console.error('Error saving massage spa image to Appwrite:', error);
        }
    };

    // Save massage spa wellness image to Appwrite
    const saveMassageSpaWellnessImageToAppwrite = async () => {
        try {
            const imageData = {
                name: 'massage-spa-wellness-centers',
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20newx.png',
                page: 'partnership',
                assetType: 'partnership',
                section: 'massage-spas-wellness-centers',
                description: 'Background image for Massage Spas & Wellness Centers section',
                updatedAt: new Date().toISOString()
            };

            // Try to find existing document first
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.imageAssets,
                [
                    Query.equal('name', 'massage-spa-wellness-centers')
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing document
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    existingDocs.documents[0].$id,
                    imageData
                );
                console.log('Massage spa wellness image updated in Appwrite');
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    'unique()',
                    imageData
                );
                console.log('Massage spa wellness image saved to Appwrite');
            }
        } catch (error) {
            console.error('Error saving massage spa wellness image to Appwrite:', error);
        }
    };

    // Save skin care clinics image to Appwrite
    const saveSkinCareClinicsImageToAppwrite = async () => {
        try {
            const imageData = {
                name: 'skin-care-clinics-aesthetic-centers',
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20newxs.png',
                page: 'partnership',
                assetType: 'partnership',
                section: 'skin-care-clinics-aesthetic-centers',
                description: 'Background image for Skin Care Clinics & Aesthetic Centers section',
                updatedAt: new Date().toISOString()
            };

            // Try to find existing document first
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.imageAssets,
                [
                    Query.equal('name', 'skin-care-clinics-aesthetic-centers')
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing document
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    existingDocs.documents[0].$id,
                    imageData
                );
                console.log('Skin care clinics image updated in Appwrite');
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    'unique()',
                    imageData
                );
                console.log('Skin care clinics image saved to Appwrite');
            }
        } catch (error) {
            console.error('Error saving skin care clinics image to Appwrite:', error);
        }
    };

    // Save gyms fitness centers image to Appwrite
    const saveGymsFitnessCentersImageToAppwrite = async () => {
        try {
            const imageData = {
                name: 'gyms-fitness-centers',
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20spa%20newxss.png',
                page: 'partnership',
                assetType: 'partnership',
                section: 'gyms-fitness-centers',
                description: 'Background image for Gyms & Fitness Centers section',
                updatedAt: new Date().toISOString()
            };

            // Try to find existing document first
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.imageAssets,
                [
                    Query.equal('name', 'gyms-fitness-centers')
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing document
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    existingDocs.documents[0].$id,
                    imageData
                );
                console.log('Gyms fitness centers image updated in Appwrite');
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    'unique()',
                    imageData
                );
                console.log('Gyms fitness centers image saved to Appwrite');
            }
        } catch (error) {
            console.error('Error saving gyms fitness centers image to Appwrite:', error);
        }
    };

    // Save hotels villa image to Appwrite
    const saveHotelsVillaImageToAppwrite = async () => {
        try {
            const imageData = {
                name: 'hotels-villa-partners',
                imageUrl: 'https://ik.imagekit.io/7grri5v7d/indonisea%20place%203.png?updatedAt=1767203762379',
                page: 'partnership',
                assetType: 'partnership',
                section: 'hotels-villa-partners',
                description: 'Background image for Hotels & Villa Partners section',
                updatedAt: new Date().toISOString()
            };

            // Try to find existing document first
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.imageAssets,
                [
                    Query.equal('name', 'hotels-villa-partners')
                ]
            );

            if (existingDocs.documents.length > 0) {
                // Update existing document
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    existingDocs.documents[0].$id,
                    imageData
                );
                console.log('Hotels villa image updated in Appwrite');
            } else {
                // Create new document
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.imageAssets,
                    'unique()',
                    imageData
                );
                console.log('Hotels villa image saved to Appwrite');
            }
        } catch (error) {
            console.error('Error saving hotels villa image to Appwrite:', error);
        }
    };

    // Save the image data when component mounts
    useEffect(() => {
        saveMassageSpaImageToAppwrite();
        saveMassageSpaWellnessImageToAppwrite();
        saveSkinCareClinicsImageToAppwrite();
        saveGymsFitnessCentersImageToAppwrite();
        saveHotelsVillaImageToAppwrite();
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
        
        if (!formData.businessName.trim()) {
            alert('Please enter your business name');
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
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
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
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}>
            {/* 🔒 SEALED OWNER-CONTROLLED CONTENT PROTECTION ACTIVE */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 text-xs font-medium text-center shadow-lg">
                <span className="inline-flex items-center gap-2">
                    🔐 PROTECTED CONTENT - SEALED OWNER-CONTROLLED JEWEL STANDARD
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">READ-ONLY MODE</span>
                </span>
            </div>
            
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            {/* Universal Header - Same as HomePage */}
            <UniversalHeader 
                onMenuClick={() => setIsMenuOpen(true)}
                showCityInfo={false}
            />
            
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
            <div className="max-w-4xl mx-auto px-4 py-8 pt-16">
                {/* Header Section */}
                <div 
                    className="rounded-lg shadow-lg p-8 mb-6 text-white relative overflow-hidden mt-8"
                    style={{
                        backgroundImage: `url(${partnershipImages.headerBg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '350px'
                    }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10">
                        <h1 className="text-5xl font-bold mb-4">
                            <span className="text-orange-500">Inda</span>
                            <span className="text-white">Street</span>
                        </h1>
                        <p className="text-lg leading-relaxed">
                            IndaStreetMassage is built to remove uncertainty from wellness services.
                            We verify, assess, and structure every professional on the platform so partners and clients can trust the service being delivered.
                        </p>
                    </div>
                </div>

                {/* Why Join Section */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            {"Why Join IndaStreetMassage".split("").map((letter, index) => (
                                <span
                                    key={index}
                                    className="inline-block animate-slide-in-right"
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        animationFillMode: 'both',
                                        transform: 'translateX(50px)',
                                        opacity: 0
                                    }}
                                >
                                    {letter === " " ? "\u00A0" : letter}
                                </span>
                            ))}
                        </h2>
                        <div className="max-w-3xl mx-auto">
                            <p className="text-xl text-gray-700 leading-relaxed mb-4">
                                Whether you are a therapist, clinic, spa, gym, or hospitality partner —
                            </p>
                            <p className="text-xl font-bold text-orange-600">
                                IndaStreetMassage does the hard work, so you don't have to.
                            </p>
                        </div>
                    </div>

                    {/* Professional Verification Standard */}
                    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-3xl p-8 shadow-xl mb-12">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565" 
                                    alt="Professional Verification" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Professional Verification Standard</h3>
                            <p className="text-gray-700 mb-6">
                                Every massage therapist and wellness provider on IndaStreetMassage is put through a structured verification process.
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-gray-700">Qualification and skill checks</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-gray-700">Professional profile review</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-gray-700">Service clarity and treatment scope alignment</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <span className="text-gray-700">Ongoing platform standards</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 bg-gradient-to-r from-gray-900/10 to-black/10 rounded-xl p-6 border border-gray-200">
                            <p className="text-gray-800 font-medium text-center">
                                This means establishments can confidently offer services knowing guests and members are being treated <span className="text-orange-600">professionally, safely, and with care.</span>
                            </p>
                        </div>
                    </div>

                    {/* Partner Categories */}
                    <div className="space-y-8">
                        {/* Home Massage Professionals */}
                        <div className="relative group">
                            <div 
                                className="relative rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                                style={{
                                    backgroundImage: `url(${partnershipImages.massageSpaImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-black/30"></div>
                                
                                <div className="relative z-10">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg relative overflow-hidden">
                                            <span className="relative inline-block text-white">
                                                Home Massage Professionals
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent animate-pulse"></div>
                                            </span>
                                        </h3>
                                        <p className="text-white/90 mb-4 drop-shadow">For independent, mobile massage therapists.</p>
                                    </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">What IndaStreetMassage does for you:</h4>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div><span className="text-white/90 drop-shadow">Free professional profile creation</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div><span className="text-white/90 drop-shadow">Platform trust through verification</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div><span className="text-white/90 drop-shadow">Client demand without agency control</span></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">How you pay:</h4>
                                                <ul className="space-y-2 mb-4">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div><span className="text-white/90 drop-shadow">No sign-up fees</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div><span className="text-white/90 drop-shadow">No monthly charges</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div><span className="text-white/90 drop-shadow">Small percentage only when you receive a booking</span></li>
                                                </ul>
                                                <div className="bg-orange-900/60 backdrop-blur-sm rounded-lg p-3 border border-orange-400/30">
                                                    <p className="text-orange-100 font-medium text-sm">You stay independent. While we are processing your bookings.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Join Now Glass Container */}
                                        <div className="mt-6 text-center">
                                            <div 
                                                onClick={() => onNavigate && onNavigate('role-selection')}
                                                className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-black/50 hover:border-white/30 transition-all shadow-2xl cursor-pointer group mx-auto max-w-sm"
                                            >
                                                <p className="text-white font-bold text-lg mb-2 group-hover:text-orange-300 transition-colors">Join Now - Live in 5 Minutes</p>
                                                <p className="text-white/80 text-sm">Create your professional profile instantly</p>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                        {/* Massage Spas & Wellness Centers */}
                        <div className="relative group">
                            <div 
                                className="relative rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                                style={{
                                    backgroundImage: `url(${partnershipImages.massageSpaWellnessImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-black/30"></div>
                                
                                <div className="relative z-10">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg relative overflow-hidden">
                                            <span className="relative inline-block text-white">
                                                Massage Spas & Wellness Centers
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent animate-pulse"></div>
                                            </span>
                                        </h3>
                                        <p className="text-white/90 mb-4 drop-shadow">For established spa businesses.</p>
                                    </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">What IndaStreetMassage does for you:</h4>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div><span className="text-white/90 drop-shadow">Positions your spa within a verified wellness network</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div><span className="text-white/90 drop-shadow">Helps clients trust your services before they arrive</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div><span className="text-white/90 drop-shadow">Brings additional bookings without discount pressure</span></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">How you pay:</h4>
                                                <ul className="space-y-2 mb-4">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div><span className="text-white/90 drop-shadow">Free to join and list</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div><span className="text-white/90 drop-shadow">Pay only when bookings are received</span></li>
                                                </ul>
                                                <div className="bg-yellow-900/60 backdrop-blur-sm rounded-lg p-3 border border-yellow-400/30">
                                                    <p className="text-yellow-100 font-medium text-sm">Your spa keeps its standards. We support your growth.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Join Now Glass Container */}
                                        <div className="mt-6 text-center">
                                            <div 
                                                onClick={() => onNavigate && onNavigate('role-selection')}
                                                className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-black/50 hover:border-white/30 transition-all shadow-2xl cursor-pointer group mx-auto max-w-sm"
                                            >
                                                <p className="text-white font-bold text-lg mb-2 group-hover:text-yellow-300 transition-colors">Join Now - Live in 5 Minutes</p>
                                                <p className="text-white/80 text-sm">Launch your spa on our verified network instantly</p>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                        {/* Skin Care Clinics & Aesthetic Centers */}
                        <div className="relative group">
                            <div 
                                className="relative rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                                style={{
                                    backgroundImage: `url(${partnershipImages.skinCareClinicsImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-black/30"></div>
                                
                                <div className="relative z-10">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg relative overflow-hidden">
                                            <span className="relative inline-block text-white">
                                                Skin Care Clinics & Aesthetic Centers
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-400/60 to-transparent animate-pulse"></div>
                                            </span>
                                        </h3>
                                        <p className="text-white/90 mb-4 drop-shadow">For licensed clinics and professional skin care providers.</p>
                                    </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">What IndaStreetMassage does for you:</h4>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div><span className="text-white/90 drop-shadow">Filters out unqualified operators</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div><span className="text-white/90 drop-shadow">Aligns your clinic with regulated, professional services</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-pink-400 rounded-full"></div><span className="text-white/90 drop-shadow">Helps clients choose with confidence</span></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <div className="bg-gradient-to-r from-pink-900/60 to-purple-800/60 backdrop-blur-sm rounded-lg p-4 border border-pink-400/30">
                                                    <p className="text-white font-medium text-sm mb-2 drop-shadow">Professional credibility stays intact.</p>
                                                    <p className="text-pink-200 font-medium text-sm drop-shadow">Commission applies only on confirmed bookings.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Partnership Application Glass Container */}
                                        <div className="mt-6 text-center">
                                            <div 
                                                onClick={() => onNavigate && onNavigate('role-selection')}
                                                className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-black/50 hover:border-white/30 transition-all shadow-2xl cursor-pointer group mx-auto max-w-sm"
                                            >
                                                <p className="text-white font-bold text-lg mb-2 group-hover:text-pink-300 transition-colors">Join Now - Live in 5 Minutes</p>
                                                <p className="text-white/80 text-sm">Start offering skincare services on our platform immediately</p>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                        {/* Hotels & Villa Partners */}
                        <div className="relative group">
                            <div 
                                className="relative rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                                style={{
                                    backgroundImage: `url(${partnershipImages.hotelsVillaImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-black/30"></div>
                                
                                <div className="relative z-10">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg relative overflow-hidden">
                                            <span className="relative inline-block text-white">
                                                Hotels & Villa Partners
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent animate-pulse"></div>
                                            </span>
                                        </h3>
                                        <p className="text-white/90 mb-4 drop-shadow">For hotels and private villas offering guest wellness services.</p>
                                    </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">What IndaStreetMassage does for you:</h4>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div><span className="text-white/90 drop-shadow">Screens and verifies massage therapists</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div><span className="text-white/90 drop-shadow">Ensures service quality aligns with guest expectations</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div><span className="text-white/90 drop-shadow">Reduces operational and reputational risk</span></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <div className="bg-gradient-to-r from-orange-900/60 to-yellow-800/60 backdrop-blur-sm rounded-lg p-4 border border-orange-400/30">
                                                    <p className="text-white font-medium text-sm mb-2 drop-shadow">You focus on hospitality.</p>
                                                    <p className="text-orange-200 font-medium text-sm drop-shadow">We manage therapist quality.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Partnership Application Glass Container */}
                                        <div className="mt-6 text-center">
                                            <div 
                                                onClick={() => {
                                                    const contactSection = document.getElementById('contact-section');
                                                    contactSection?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-black/50 hover:border-white/30 transition-all shadow-2xl cursor-pointer group mx-auto max-w-sm"
                                            >
                                                <p className="text-white font-bold text-lg mb-2 group-hover:text-orange-300 transition-colors">Apply for Partnership</p>
                                                <p className="text-white/80 text-sm">Let's discuss how we can enhance your guest experience</p>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>

                        {/* Gyms & Fitness Centers */}
                        <div className="relative group">
                            <div 
                                className="relative rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all overflow-hidden"
                                style={{
                                    backgroundImage: `url(${partnershipImages.gymsFitnessCentersImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                    minHeight: '400px'
                                }}
                            >
                                {/* Dark overlay for text readability */}
                                <div className="absolute inset-0 bg-black/30"></div>
                                
                                <div className="relative z-10">
                                    <div className="text-center mb-6">
                                        <h3 className="text-2xl font-bold mb-3 drop-shadow-lg relative overflow-hidden">
                                            <span className="relative inline-block text-white">
                                                Gyms & Fitness Centers
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent animate-pulse"></div>
                                            </span>
                                        </h3>
                                        <p className="text-white/90 mb-4 drop-shadow">For gyms requiring sports recovery and injury-focused massage.</p>
                                    </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <h4 className="font-semibold text-white mb-3 drop-shadow">What IndaStreetMassage does for you:</h4>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div><span className="text-white/90 drop-shadow">Connects you with therapists experienced in sports and recovery</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div><span className="text-white/90 drop-shadow">Ensures professional conduct with members</span></li>
                                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div><span className="text-white/90 drop-shadow">Supports wellness programs without internal staffing complexity</span></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <div className="bg-gradient-to-r from-yellow-900/60 to-gray-800/60 backdrop-blur-sm rounded-lg p-4 border border-yellow-400/30">
                                                    <p className="text-white font-medium text-sm mb-2 drop-shadow">Your members get proper care.</p>
                                                    <p className="text-yellow-200 font-medium text-sm drop-shadow">You gain a stronger service offering.</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Partnership Application Glass Container */}
                                        <div className="mt-6 text-center">
                                            <div 
                                                onClick={() => {
                                                    const contactSection = document.getElementById('contact-section');
                                                    contactSection?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-black/50 hover:border-white/30 transition-all shadow-2xl cursor-pointer group mx-auto max-w-sm"
                                            >
                                                <p className="text-white font-bold text-lg mb-2 group-hover:text-yellow-300 transition-colors">Apply for Partnership</p>
                                                <p className="text-white/80 text-sm">Let's explore how we can support your members' wellness goals</p>
                                            </div>
                                        </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* One Platform Section */}
                    <div className="relative mt-12 mb-12">
                        <div 
                            className="relative rounded-3xl p-8 shadow-xl overflow-hidden"
                            style={{
                                backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea.png?updatedAt=1761591108161')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                minHeight: '500px'
                            }}
                        >
                            {/* Dark overlay for text readability */}
                            <div className="absolute inset-0 bg-black/40"></div>
                            
                            <div className="relative z-10">
                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold mb-4 drop-shadow-lg relative overflow-hidden">
                                        <span className="relative inline-block text-white">
                                            One Directory With One Standard
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent animate-pulse"></div>
                                        </span>
                                    </h3>
                                    <p className="text-white/90 mb-6 drop-shadow">IndaStreetMassage is built on:</p>
                                </div>
                                
                                <div className="grid md:grid-cols-3 gap-6 mb-8">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="font-semibold text-white mb-2 drop-shadow">Professional Verification</h4>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="font-semibold text-white mb-2 drop-shadow">Clear Service Accountability</h4>
                                    </div>
                                    
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
                                            <CheckCircle className="w-6 h-6 text-white" />
                                        </div>
                                        <h4 className="font-semibold text-white mb-2 drop-shadow">Performance-Based</h4>
                                    </div>
                                </div>
                                
                                {/* Review Containers */}
                                <div className="grid md:grid-cols-2 gap-8 text-center">
                                    <div className="bg-yellow-500/90 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/50 shadow-xl relative overflow-hidden">
                                        {/* Animated Decorative Elements */}
                                        <div className="absolute -left-4 top-4 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3s'}}>
                                            <span className="text-green-600 text-2xl opacity-70 transform rotate-12">🌿</span>
                                        </div>
                                        <div className="absolute -left-2 bottom-8 animate-pulse" style={{animationDelay: '1.2s', animationDuration: '4s'}}>
                                            <span className="text-green-500 text-lg opacity-60 transform -rotate-45">🍃</span>
                                        </div>
                                        <div className="absolute -left-6 top-16 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}>
                                            <span className="text-green-700 text-xl opacity-50 transform rotate-90">🌱</span>
                                        </div>
                                        <div className="absolute left-1 top-2 animate-pulse" style={{animationDelay: '0.8s', animationDuration: '2.5s'}}>
                                            <span className="text-yellow-600 text-sm opacity-40 transform rotate-45">✨</span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Jakarta, Indonesia</h3>
                                        <p className="text-gray-800 font-medium mb-6">"The massage therapists from IndaStreet are incredibly professional. Our members love the convenience and quality of service."</p>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">FitLife Gym & Wellness</h4>
                                        <p className="text-gray-700 text-sm mb-4">Premium Fitness Center</p>
                                        <div className="absolute bottom-3 left-4">
                                            <div className="italic text-gray-700 text-sm font-medium">~ Michael Chen</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-yellow-500/90 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/50 shadow-xl relative overflow-hidden">
                                        {/* Animated Decorative Elements */}
                                        <div className="absolute -right-4 top-6 animate-bounce" style={{animationDelay: '1s', animationDuration: '3.2s'}}>
                                            <span className="text-green-600 text-2xl opacity-70 transform -rotate-12">🌿</span>
                                        </div>
                                        <div className="absolute -right-2 bottom-12 animate-pulse" style={{animationDelay: '0.3s', animationDuration: '4.5s'}}>
                                            <span className="text-green-500 text-lg opacity-60 transform rotate-45">🍃</span>
                                        </div>
                                        <div className="absolute -right-6 top-12 animate-bounce" style={{animationDelay: '1.8s', animationDuration: '2.8s'}}>
                                            <span className="text-green-700 text-xl opacity-50 transform -rotate-90">🌱</span>
                                        </div>
                                        <div className="absolute right-1 top-3 animate-pulse" style={{animationDelay: '2.5s', animationDuration: '3.8s'}}>
                                            <span className="text-yellow-600 text-sm opacity-40 transform -rotate-45">✨</span>
                                        </div>
                                        <div className="absolute -right-3 bottom-6 animate-bounce" style={{animationDelay: '0.7s', animationDuration: '3.3s'}}>
                                            <span className="text-green-400 text-lg opacity-55 transform rotate-30">🍂</span>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Bali, Indonesia</h3>
                                        <p className="text-gray-800 font-medium mb-6">"Our guests absolutely love the spa services. IndaStreet ensures we only get the best therapists for our luxury accommodations."</p>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">Tropical Paradise Villa</h4>
                                        <p className="text-gray-700 text-sm mb-4">Luxury Resort & Spa</p>
                                        <div className="absolute bottom-3 right-4">
                                            <div className="italic text-gray-700 text-sm font-medium">~ Sarah Williams</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Call to Action */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-gray-900/20 rounded-3xl blur-3xl"></div>
                        <div 
                            className="relative rounded-3xl p-12 text-white text-center shadow-2xl overflow-hidden"
                            style={{
                                backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/indastreet%20apps.png?updatedAt=1761568212865')`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                minHeight: '400px'
                            }}
                        >
                            {/* Dark overlay for text readability */}
                            <div className="absolute inset-0 bg-black/50"></div>
                            
                            <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-6">
                                <span className="text-white">Join </span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">IndaStreetMassage</span>
                            </h2>
                            
                            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                                If you value <span className="text-orange-500 font-semibold">professionalism, safety, and sustainable growth</span>,
                                <br />IndaStreetMassage is your platform.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto mb-8">
                                <div className="flex items-center gap-3 text-gray-300">
                                    <span className="text-lg">•</span>
                                    <span>Create your profile</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-300">
                                    <span className="text-lg">•</span>
                                    <span>Get verified</span>
                                </div>
                            </div>
                            
                            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                                <span className="text-orange-500 font-semibold">Offer trusted wellness services with confidence</span>
                            </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Links & Social Media Section */}
                <div 
                    className="relative rounded-3xl p-8 shadow-xl mb-6 overflow-hidden"
                    style={{
                        backgroundImage: `url('https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        minHeight: '400px'
                    }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-lg">Connect With Us</h2>
                            <p className="text-white/90 drop-shadow">Follow our social media and explore our services</p>
                        </div>
                    
                    {/* Social Media Icons */}
                    <div className="flex justify-center gap-6 mb-8">
                        <a 
                            href="https://instagram.com/indastreet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>
                        
                        <a 
                            href="https://facebook.com/indastreet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>
                        
                        <a 
                            href="https://twitter.com/indastreet" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </a>
                        
                        <a 
                            href="https://wa.me/6281234567890" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                        </a>
                    </div>
                    
                    {/* SEO Page Links */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <a 
                            href="/massage-services" 
                            className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all shadow-2xl group cursor-pointer"
                        >
                            <h3 className="font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">💆 Massage Services</h3>
                            <p className="text-white/80 text-sm">Professional massage therapy at your location</p>
                        </a>
                        
                        <a 
                            href="/spa-wellness" 
                            className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all shadow-2xl group cursor-pointer"
                        >
                            <h3 className="font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">🧘 Spa & Wellness</h3>
                            <p className="text-white/80 text-sm">Relaxation and wellness treatments</p>
                        </a>
                        
                        <a 
                            href="/beauty-skincare" 
                            className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all shadow-2xl group cursor-pointer"
                        >
                            <h3 className="font-bold text-white mb-2 group-hover:text-pink-300 transition-colors">💄 Beauty & Skincare</h3>
                            <p className="text-white/80 text-sm">Professional beauty and skincare services</p>
                        </a>
                        
                        <a 
                            href="/hotel-partnerships" 
                            className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all shadow-2xl group cursor-pointer"
                        >
                            <h3 className="font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">🏨 Hotel Partnerships</h3>
                            <p className="text-white/80 text-sm">Wellness services for hospitality partners</p>
                        </a>
                        
                        <a 
                            href="/about-us" 
                            className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all shadow-2xl group cursor-pointer"
                        >
                            <h3 className="font-bold text-white mb-2 group-hover:text-green-300 transition-colors">ℹ️ About IndaStreet</h3>
                            <p className="text-white/80 text-sm">Learn about our mission and values</p>
                        </a>
                        
                        <a 
                            href="/contact" 
                            className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-black/70 hover:border-white/30 transition-all shadow-2xl group cursor-pointer"
                        >
                            <h3 className="font-bold text-white mb-2 group-hover:text-gray-300 transition-colors">📞 Contact Us</h3>
                            <p className="text-white/80 text-sm">Get in touch with our team</p>
                        </a>
                    </div>
                    
                    {/* Call-to-Action */}
                    <div className="text-center mt-8 pt-8 border-t border-white/30">
                        <p className="text-lg text-white/90 mb-4 drop-shadow">
                            Ready to join our verified wellness network?
                        </p>
                        <button 
                            onClick={() => onNavigate && onNavigate('role-selection')}
                            className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-3 mx-auto"
                            style={{ userSelect: 'auto', WebkitUserSelect: 'auto', MozUserSelect: 'auto' }}
                        >
                            <CheckCircle className="w-6 h-6" />
                            Start Your Application
                        </button>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

PartnershipApplicationPage.displayName = 'PartnershipApplicationPage';

export default PartnershipApplicationPage;