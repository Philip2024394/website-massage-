import type { Therapist } from '../types';
import { getDisplayRating } from '../utils/ratingUtils';
import { useChatProvider } from './useChatProvider';

interface ChatEventDetail {
  therapistId: string;
  therapistName: string;
  therapistType: string;
  therapistStatus: 'available' | 'busy' | 'offline';
  pricing: { '60': number; '90': number; '120': number };
  profilePicture?: string;
  providerRating: number;
  discountPercentage: number;
  discountActive: boolean;
  mode: 'immediate' | 'scheduled';
  selectedService?: {
    name: string;
    duration: string;
    price: number;
  };
}

export const useTherapistChat = (
  therapist: Therapist,
  pricing: { '60': number; '90': number; '120': number },
  displayStatus: string,
  isDiscountActive: boolean
) => {
  // Use ChatProvider instead of event system
  const { addNotification } = useChatProvider();

  const openChat = (mode: 'immediate' | 'scheduled', selectedService?: ChatEventDetail['selectedService']) => {
    console.log(`🟢 Opening ${mode} chat for ${therapist.name}`);
    
    // For now, show a notification that the user should book to access chat
    // In a complete implementation, this would trigger a booking modal
    addNotification(
      'info',
      `${mode === 'immediate' ? 'Instant' : 'Scheduled'} Booking`,
      `Please complete booking with ${therapist.name} to start chatting`,
      { duration: 4000 }
    );
  };

  const openBookNowChat = () => {
    console.log('🟢 Book Now button clicked - opening chat window');
    openChat('immediate');
  };

  const openScheduleChat = () => {
    console.log('📅 Schedule button clicked - opening chat in scheduled mode');
    openChat('scheduled');
  };

  const openChatWithService = (serviceName: string, duration: string, price: number) => {
    openChat('immediate', {
      name: serviceName,
      duration: duration,
      price: price,
    });
  };

  return {
    openBookNowChat,
    openScheduleChat,
    openChatWithService,
  };
};
