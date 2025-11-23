import { useState, useCallback, useEffect } from 'react';
import type { Therapist, Pricing, UserLocation } from '../../types';
import { AvailabilityStatus } from '../../types';
import { therapistService } from '../../lib/appwriteService';
import { 
    parsePricing, 
    parseCoordinates, 
    parseMassageTypes, 
    parseLanguages,
    stringifyPricing,
    stringifyCoordinates,
    stringifyMassageTypes,
    stringifyLanguages,
    stringifyAnalytics
} from '../../utils/appwriteHelpers';

export interface UseTherapistDataReturn {
    // State
    therapist: Therapist | null;
    isLoading: boolean;
    isSaving: boolean;
    
    // Form fields
    name: string;
    description: string;
    profilePicture: string;
    whatsappNumber: string;
    yearsOfExperience: number;
    massageTypes: string[];
    languages: string[];
    pricing: Pricing;
    hotelVillaPricing: Pricing;
    location: string;
    coordinates: { lat: number; lng: number };
    serviceRadius: number;
    status: AvailabilityStatus;
    discountPercentage: number;
    discountDuration: number;
    discountEndTime: Date | null;
    isDiscountActive: boolean;
    selectedDiscountPercentage: number;
    selectedDiscountDuration: number;
    busyUntil: Date | null;
    
    // Bank details
    bankName: string;
    bankAccountNumber: string;
    bankAccountName: string;
    mobilePaymentNumber: string;
    mobilePaymentType: string;
    preferredPaymentMethod: 'bank_transfer' | 'cash' | 'mobile_payment';
    paymentInstructions: string;
    
    // Setters
    setName: (value: string) => void;
    setDescription: (value: string) => void;
    setProfilePicture: (value: string) => void;
    setWhatsappNumber: (value: string) => void;
    setYearsOfExperience: (value: number) => void;
    setMassageTypes: (value: string[]) => void;
    setLanguages: (value: string[]) => void;
    setPricing: (value: Pricing) => void;
    setHotelVillaPricing: (value: Pricing) => void;
    setLocation: (value: string) => void;
    setCoordinates: (value: { lat: number; lng: number }) => void;
    setServiceRadius: (value: number) => void;
    setStatus: (value: AvailabilityStatus) => void;
    setDiscountPercentage: (value: number) => void;
    setDiscountDuration: (value: number) => void;
    setDiscountEndTime: (value: Date | null) => void;
    setIsDiscountActive: (value: boolean) => void;
    setSelectedDiscountPercentage: (value: number) => void;
    setSelectedDiscountDuration: (value: number) => void;
    setBusyUntil: (value: Date | null) => void;
    setBankName: (value: string) => void;
    setBankAccountNumber: (value: string) => void;
    setBankAccountName: (value: string) => void;
    setMobilePaymentNumber: (value: string) => void;
    setMobilePaymentType: (value: string) => void;
    setPreferredPaymentMethod: (value: 'bank_transfer' | 'cash' | 'mobile_payment') => void;
    setPaymentInstructions: (value: string) => void;
    
    // Methods
    fetchTherapistData: () => Promise<void>;
    saveTherapist: (onSave: (data: any) => Promise<void>) => Promise<void>;
}

export const useTherapistData = (
    therapistId: number | string,
    existingTherapistData?: Therapist,
    userLocation?: UserLocation | null
): UseTherapistDataReturn => {
    const [therapist, setTherapist] = useState<Therapist | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Basic form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
    const [massageTypes, setMassageTypes] = useState<string[]>([]);
    const [languages, setLanguages] = useState<string[]>([]);
    const [pricing, setPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [hotelVillaPricing, setHotelVillaPricing] = useState<Pricing>({ 60: 0, 90: 0, 120: 0 });
    const [location, setLocation] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lng: 0 });
    const [serviceRadius, setServiceRadius] = useState<number>(50);
    const [status, setStatus] = useState<AvailabilityStatus>(AvailabilityStatus.Offline);
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const [discountDuration, setDiscountDuration] = useState<number>(0);
    const [discountEndTime, setDiscountEndTime] = useState<Date | null>(null);
    const [isDiscountActive, setIsDiscountActive] = useState(false);
    const [selectedDiscountPercentage, setSelectedDiscountPercentage] = useState<number>(0);
    const [selectedDiscountDuration, setSelectedDiscountDuration] = useState<number>(0);
    const [busyUntil, setBusyUntil] = useState<Date | null>(null);
    
    // Bank details
    const [bankName, setBankName] = useState('');
    const [bankAccountNumber, setBankAccountNumber] = useState('');
    const [bankAccountName, setBankAccountName] = useState('');
    const [mobilePaymentNumber, setMobilePaymentNumber] = useState('');
    const [mobilePaymentType, setMobilePaymentType] = useState('GoPay');
    const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<'bank_transfer' | 'cash' | 'mobile_payment'>('bank_transfer');
    const [paymentInstructions, setPaymentInstructions] = useState('');
    
    const fetchTherapistData = useCallback(async () => {
        setIsLoading(true);
        
        try {
            console.log('📖 Fetching therapist data for ID:', therapistId);
            
            let existingTherapist = null;
            
            // Priority 1: Use existingTherapistData from AppRouter
            if (existingTherapistData) {
                console.log('✅ Using existingTherapistData from AppRouter');
                existingTherapist = existingTherapistData;
            } else {
                // Priority 2: Try direct document lookup
                try {
                    existingTherapist = await therapistService.getById(therapistId.toString());
                    if (existingTherapist) {
                        console.log('✅ Found therapist by direct ID lookup');
                    }
                } catch (_directError) {
                    console.log('⚠️ Direct ID lookup failed');
                }
                
                // Priority 3: Get current user and find by email
                if (!existingTherapist) {
                    try {
                        const currentUser = await therapistService.getCurrentUser();
                        if (currentUser && currentUser.email) {
                            const therapistProfiles = await therapistService.getByEmail(currentUser.email);
                            if (therapistProfiles && therapistProfiles.length > 0) {
                                existingTherapist = therapistProfiles[0];
                                console.log('✅ Found therapist profile by email');
                            }
                        }
                    } catch (_emailError) {
                        console.error('❌ Email lookup failed');
                    }
                }
            }
            
            if (existingTherapist) {
                console.log('✅ Successfully loaded therapist data');
                setTherapist(existingTherapist);
                
                // Populate form fields
                setName(existingTherapist.name || '');
                setDescription(existingTherapist.description || '');
                setProfilePicture(existingTherapist.profilePicture || '');
                setWhatsappNumber(existingTherapist.whatsappNumber || '');
                setYearsOfExperience(existingTherapist.yearsOfExperience || 0);
                
                // Auto-fill location from userLocation if empty
                if (existingTherapist.location) {
                    setLocation(existingTherapist.location);
                } else if (userLocation?.address) {
                    setLocation(userLocation.address);
                    if (userLocation.lat && userLocation.lng) {
                        setCoordinates({ lat: userLocation.lat, lng: userLocation.lng });
                    }
                }
                
                // Load bank details
                setBankName(existingTherapist.bankName || '');
                setBankAccountNumber(existingTherapist.bankAccountNumber || '');
                setBankAccountName(existingTherapist.bankAccountName || '');
                setMobilePaymentNumber(existingTherapist.mobilePaymentNumber || '');
                setMobilePaymentType(existingTherapist.mobilePaymentType || 'GoPay');
                setPreferredPaymentMethod(existingTherapist.preferredPaymentMethod || 'bank_transfer');
                setPaymentInstructions(existingTherapist.paymentInstructions || '');
                
                // Parse complex fields
                if (existingTherapist.coordinates) {
                    setCoordinates(parseCoordinates(existingTherapist.coordinates));
                }
                
                setServiceRadius(existingTherapist.serviceRadius || 50);
                
                if (existingTherapist.pricing) {
                    setPricing(parsePricing(existingTherapist.pricing));
                }
                
                if (existingTherapist.hotelVillaPricing) {
                    setHotelVillaPricing(parsePricing(existingTherapist.hotelVillaPricing));
                }
                
                if (existingTherapist.massageTypes) {
                    setMassageTypes(parseMassageTypes(existingTherapist.massageTypes));
                }
                
                if (existingTherapist.languages) {
                    setLanguages(parseLanguages(existingTherapist.languages));
                }
                
                // Discount system
                setDiscountPercentage(existingTherapist.discountPercentage || 0);
                setDiscountDuration(existingTherapist.discountDuration || 0);
                
                if (existingTherapist.discountEndTime) {
                    const endTime = new Date(existingTherapist.discountEndTime);
                    setDiscountEndTime(endTime);
                    setIsDiscountActive(endTime > new Date());
                    
                    if (endTime > new Date()) {
                        setSelectedDiscountPercentage(existingTherapist.discountPercentage || 0);
                        setSelectedDiscountDuration(existingTherapist.discountDuration || 0);
                    }
                }
                
                // Status and busy timer
                setStatus(existingTherapist.status || AvailabilityStatus.Offline);
                
                if (existingTherapist.busyUntil) {
                    const busyEndTime = new Date(existingTherapist.busyUntil);
                    if (busyEndTime > new Date()) {
                        setBusyUntil(busyEndTime);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error fetching therapist data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [therapistId, existingTherapistData, userLocation]);
    
    const saveTherapist = useCallback(async (onSave: (data: any) => Promise<void>) => {
        setIsSaving(true);
        
        const therapistData = {
            name,
            description,
            profilePicture,
            whatsappNumber,
            yearsOfExperience,
            pricing: stringifyPricing(pricing),
            hotelVillaPricing: stringifyPricing(hotelVillaPricing),
            location,
            coordinates: stringifyCoordinates(coordinates),
            serviceRadius,
            status,
            discountPercentage,
            discountDuration,
            discountEndTime: discountEndTime?.toISOString() || undefined,
            isDiscountActive,
            distance: 0,
            analytics: stringifyAnalytics({ 
                impressions: 0, 
                views: 0, 
                profileViews: 0, 
                whatsapp_clicks: 0,
                whatsappClicks: 0,
                phone_clicks: 0,
                directions_clicks: 0,
                bookings: 0
            }),
            massageTypes: stringifyMassageTypes(massageTypes),
            languages: stringifyLanguages(languages),
            bankName,
            bankAccountNumber,
            bankAccountName,
            mobilePaymentNumber,
            mobilePaymentType,
            preferredPaymentMethod,
            paymentInstructions,
            busyUntil: busyUntil?.toISOString() || undefined
        };
        
        try {
            await onSave(therapistData as any);
        } finally {
            setIsSaving(false);
        }
    }, [
        name, description, profilePicture, whatsappNumber, yearsOfExperience,
        pricing, hotelVillaPricing, location, coordinates, serviceRadius,
        status, discountPercentage, discountDuration, discountEndTime,
        isDiscountActive, massageTypes, languages, bankName, bankAccountNumber,
        bankAccountName, mobilePaymentNumber, mobilePaymentType,
        preferredPaymentMethod, paymentInstructions, busyUntil
    ]);
    
    return {
        therapist,
        isLoading,
        isSaving,
        name,
        description,
        profilePicture,
        whatsappNumber,
        yearsOfExperience,
        massageTypes,
        languages,
        pricing,
        hotelVillaPricing,
        location,
        coordinates,
        serviceRadius,
        status,
        discountPercentage,
        discountDuration,
        discountEndTime,
        isDiscountActive,
        selectedDiscountPercentage,
        selectedDiscountDuration,
        busyUntil,
        bankName,
        bankAccountNumber,
        bankAccountName,
        mobilePaymentNumber,
        mobilePaymentType,
        preferredPaymentMethod,
        paymentInstructions,
        setName,
        setDescription,
        setProfilePicture,
        setWhatsappNumber,
        setYearsOfExperience,
        setMassageTypes,
        setLanguages,
        setPricing,
        setHotelVillaPricing,
        setLocation,
        setCoordinates,
        setServiceRadius,
        setStatus,
        setDiscountPercentage,
        setDiscountDuration,
        setDiscountEndTime,
        setIsDiscountActive,
        setSelectedDiscountPercentage,
        setSelectedDiscountDuration,
        setBusyUntil,
        setBankName,
        setBankAccountNumber,
        setBankAccountName,
        setMobilePaymentNumber,
        setMobilePaymentType,
        setPreferredPaymentMethod,
        setPaymentInstructions,
        fetchTherapistData,
        saveTherapist
    };
};
