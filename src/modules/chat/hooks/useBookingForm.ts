/**
 * Booking Form State Hook
 * Extracted from PersistentChatWindow.tsx - preserving all functionality
 */

import { useState, useEffect } from 'react';

export interface CustomerForm {
  name: string;
  countryCode: string;
  whatsApp: string;
  location: string;
  locationType: string;
  coordinates: { lat: number; lng: number } | null;
  hotelVillaName: string;
  roomNumber: string;
  massageFor: string;
  address1?: string; // ✅ Street address, building name
  address2?: string; // ✅ Area/District (Seminyak, Kuta, etc.)
}

export interface DiscountValidation {
  valid: boolean;
  percentage?: number;
  message: string;
  codeData?: any;
}

export const useBookingForm = (isMinimized: boolean, bookingStep: string, therapistId?: string) => {
  const [customerForm, setCustomerForm] = useState<CustomerForm>({
    name: '',
    countryCode: '+62',
    whatsApp: '',
    location: '',
    locationType: '',
    coordinates: null,
    hotelVillaName: '',
    roomNumber: '',
    massageFor: '',
    address1: '',
    address2: '',
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<DiscountValidation | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [clientMismatchError, setClientMismatchError] = useState<string | null>(null);

  // Reset form when minimized or step changes
  useEffect(() => {
    if (isMinimized || bookingStep === 'duration') {
      setCustomerForm({
        name: '',
        countryCode: '+62',
        whatsApp: '',
        location: '',
        locationType: '',
        coordinates: null,
        hotelVillaName: '',
        roomNumber: '',
        massageFor: '',
        address1: '',
        address2: '',
      });
      setClientMismatchError(null);
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [isMinimized, bookingStep]);

  // Reset form when therapist changes
  useEffect(() => {
    setCustomerForm({
      name: '',
      countryCode: '+62',
      whatsApp: '',
      location: '',
      locationType: '',
      coordinates: null,
      hotelVillaName: '',
      roomNumber: '',
      massageFor: '',
      address1: '',
      address2: '',
    });
    setClientMismatchError(null);
    setSelectedDate('');
    setSelectedTime('');
    setDiscountCode('');
    setDiscountValidation(null);
  }, [therapistId]);

  const resetForm = () => {
    setCustomerForm({
      name: '',
      countryCode: '+62',
      whatsApp: '',
      location: '',
      locationType: '',
      coordinates: null,
      hotelVillaName: '',
      roomNumber: '',
      massageFor: '',
      address1: '',
      address2: '',
    });
    setSelectedDate('');
    setSelectedTime('');
    setDiscountCode('');
    setDiscountValidation(null);
    setClientMismatchError(null);
  };

  return {
    // Form state
    customerForm,
    setCustomerForm,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    
    // Discount state
    discountCode,
    setDiscountCode,
    discountValidation,
    setDiscountValidation,
    isValidatingDiscount,
    setIsValidatingDiscount,
    
    // Error state
    clientMismatchError,
    setClientMismatchError,
    
    // Actions
    resetForm
  };
};