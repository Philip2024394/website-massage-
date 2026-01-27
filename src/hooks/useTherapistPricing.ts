import { useState } from 'react';
import type { Therapist } from '../types';
import { parsePricing } from '../utils/appwriteHelpers';

export const useTherapistPricing = (therapist: Therapist) => {
  const getPricing = () => {
    // Try new separate fields first (preferred format)
    if (therapist.price60 !== undefined || therapist.price90 !== undefined || therapist.price120 !== undefined) {
      return {
        '60': therapist.price60 ? parseInt(therapist.price60) * 1000 : 0,
        '90': therapist.price90 ? parseInt(therapist.price90) * 1000 : 0,
        '120': therapist.price120 ? parseInt(therapist.price120) * 1000 : 0,
      };
    }

    // Fallback to old JSON format - multiply by 1000 to get full IDR amounts
    const parsedPricing = parsePricing(therapist.pricing) || { '60': 0, '90': 0, '120': 0 };
    return {
      '60': parsedPricing['60'] * 1000,
      '90': parsedPricing['90'] * 1000,
      '120': parsedPricing['120'] * 1000,
    };
  };

  const pricing = getPricing();

  const isDiscountActive = (): boolean => {
    const hasDiscountData = !!(
      therapist.discountPercentage &&
      therapist.discountPercentage > 0 &&
      therapist.discountEndTime &&
      therapist.isDiscountActive === true
    );

    if (!hasDiscountData) return false;

    // Check if discount hasn't expired
    const now = new Date();
    const endTime = therapist.discountEndTime ? new Date(therapist.discountEndTime) : null;

    if (!endTime || isNaN(endTime.getTime())) return false;

    return endTime > now;
  };

  return {
    pricing,
    isDiscountActive: isDiscountActive(),
    discountPercentage: therapist.discountPercentage || 0,
  };
};
