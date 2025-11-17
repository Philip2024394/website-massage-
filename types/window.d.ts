// Global window extensions for booking system
declare global {
  interface Window {
    openBookingPopup?: (
      providerName: string,
      whatsappNumber?: string,
      providerId?: string,
      providerType?: 'therapist' | 'place',
      partnerId?: string,
      partnerName?: string
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
