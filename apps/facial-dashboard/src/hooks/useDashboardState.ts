/**
 * Facial Dashboard State Hook
 * Manages state for the facial place dashboard
 * Max size: 8KB (Facebook/Amazon standard for hooks)
 */

import { useState } from 'react';
import type { Place, Pricing } from '../types';

interface UseDashboardStateProps {
  placeProp?: Place | null;
  placeId?: string;
}

export const useDashboardState = ({ placeProp }: UseDashboardStateProps) => {
  // Core state
  const [place, setPlace] = useState<Place | null>(placeProp || null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [ownerWhatsApp, setOwnerWhatsApp] = useState('');
  
  // Pricing state
  const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
  const [hotelVillaPricing, setHotelVillaPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
  const [useSamePricing, setUseSamePricing] = useState(true);
  
  // Discount state
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [discountDuration, setDiscountDuration] = useState<number>(24);
  const [isDiscountActive, setIsDiscountActive] = useState<boolean>(false);
  const [discountEndTime, setDiscountEndTime] = useState<string>('');
  
  // Location state
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLocationManuallyEdited, setIsLocationManuallyEdited] = useState(false);
  
  // Services state
  const [facialTypes, setFacialTypes] = useState<string[]>([]);
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [therapistGender, setTherapistGender] = useState<string>('Unisex');
  const [languages, setLanguages] = useState<string[]>([]);
  const [yearsEstablished, setYearsEstablished] = useState<number>(1);
  
  // Hours state
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  
  // Gallery state
  const [galleryImages, setGalleryImages] = useState<Array<{ imageUrl: string; caption: string; description: string }>>([
    { imageUrl: '', caption: '', description: '' },
    { imageUrl: '', caption: '', description: '' },
    { imageUrl: '', caption: '', description: '' },
    { imageUrl: '', caption: '', description: '' },
    { imageUrl: '', caption: '', description: '' },
    { imageUrl: '', caption: '', description: '' }
  ]);
  
  // Website/social state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [websiteDescription, setWebsiteDescription] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookPageUrl, setFacebookPageUrl] = useState('');
  
  // UI state
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [showNotificationsView, setShowNotificationsView] = useState(false);
  const [showValidationPopup, setShowValidationPopup] = useState(false);
  const [validationMissingFields, setValidationMissingFields] = useState<string[]>([]);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [paymentPending, setPaymentPending] = useState(false);

  return {
    // Core state
    place, setPlace,
    isLoading, setIsLoading,
    activeTab, setActiveTab,
    
    // Profile state
    name, setName,
    description, setDescription,
    mainImage, setMainImage,
    profilePicture, setProfilePicture,
    contactNumber, setContactNumber,
    ownerWhatsApp, setOwnerWhatsApp,
    
    // Pricing state
    pricing, setPricing,
    hotelVillaPricing, setHotelVillaPricing,
    useSamePricing, setUseSamePricing,
    
    // Discount state
    discountPercentage, setDiscountPercentage,
    discountDuration, setDiscountDuration,
    isDiscountActive, setIsDiscountActive,
    discountEndTime, setDiscountEndTime,
    
    // Location state
    location, setLocation,
    coordinates, setCoordinates,
    selectedCity, setSelectedCity,
    isLocationManuallyEdited, setIsLocationManuallyEdited,
    
    // Services state
    facialTypes, setFacialTypes,
    additionalServices, setAdditionalServices,
    therapistGender, setTherapistGender,
    languages, setLanguages,
    yearsEstablished, setYearsEstablished,
    
    // Hours state
    openingTime, setOpeningTime,
    closingTime, setClosingTime,
    
    // Gallery state
    galleryImages, setGalleryImages,
    
    // Website/social state
    websiteUrl, setWebsiteUrl,
    websiteTitle, setWebsiteTitle,
    websiteDescription, setWebsiteDescription,
    instagramUrl, setInstagramUrl,
    facebookPageUrl, setFacebookPageUrl,
    
    // UI state
    showImageCropper, setShowImageCropper,
    isSideDrawerOpen, setIsSideDrawerOpen,
    showNotificationsView, setShowNotificationsView,
    showValidationPopup, setShowValidationPopup,
    validationMissingFields, setValidationMissingFields,
    
    // Payment state
    showPaymentModal, setShowPaymentModal,
    paymentProof, setPaymentProof,
    paymentProofPreview, setPaymentProofPreview,
    uploadingPayment, setUploadingPayment,
    paymentPending, setPaymentPending,
  };
};