import type { Therapist } from '../types';
import { getDisplayRating } from '../utils/ratingUtils';

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
  const openChat = (mode: 'immediate' | 'scheduled', selectedService?: ChatEventDetail['selectedService']) => {
    const normalizedStatus = displayStatus.toLowerCase() as 'available' | 'busy' | 'offline';

    const detail: ChatEventDetail = {
      therapistId: typeof therapist.id === 'string' ? therapist.id : therapist.id?.toString() || '',
      therapistName: therapist.name,
      therapistType: 'therapist',
      therapistStatus: normalizedStatus,
      pricing: pricing,
      profilePicture: (therapist as any).profilePicture || (therapist as any).mainImage,
      providerRating: getDisplayRating(therapist.rating, therapist.reviewCount),
      discountPercentage: therapist.discountPercentage || 0,
      discountActive: isDiscountActive,
      mode: mode,
      ...(selectedService && { selectedService }),
    };

    window.dispatchEvent(new CustomEvent('openChat', { detail }));
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
