// Global window extensions for booking system
declare global {
  interface Window {
    openBookingPopup?: (
      providerName: string,
      whatsappNumber?: string,
      providerId?: string,
      providerType?: 'therapist' | 'place',
      hotelVillaId?: string,
      hotelVillaName?: string,
      hotelVillaType?: 'hotel' | 'villa'
    ) => void;
    openBookingStatusTracker?: (statusInfo: {
      bookingId: string;
      therapistName: string;
      duration: number;
      price: number;
      responseDeadline: Date;
    }) => void;
  }
}

export {};
