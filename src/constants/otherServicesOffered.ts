/**
 * Massage Home Service – "Other Services Offered" master list and plan limits.
 * Matches Massage City Places UI and upgrade restriction rules.
 * Free: 3, Middle (140k IDR): 8, Premium (200k IDR): unlimited (+ Featured badge option).
 */

export type TherapistPlanTier = 'free' | 'middle' | 'premium';

export interface OtherServiceItem {
  id: string;
  labelEn: string;
  labelId: string;
}

/** Master list of other services (Facial, Kerokan, Lulur, Cupping, Manicure, etc.) for filter and dashboard. */
export const OTHER_SERVICES_OFFERED_MASTER: OtherServiceItem[] = [
  { id: 'facial', labelEn: 'Facial', labelId: 'Facial' },
  { id: 'kerokan', labelEn: 'Kerokan', labelId: 'Kerokan' },
  { id: 'lulur', labelEn: 'Lulur', labelId: 'Lulur' },
  { id: 'cupping', labelEn: 'Cupping', labelId: 'Cupping' },
  { id: 'manicure', labelEn: 'Manicure', labelId: 'Manicure' },
  { id: 'pedicure', labelEn: 'Pedicure', labelId: 'Pedicure' },
  { id: 'body_scrub', labelEn: 'Body Scrub', labelId: 'Body Scrub' },
  { id: 'aromatherapy', labelEn: 'Aromatherapy', labelId: 'Aromatherapy' },
  { id: 'hot_stone', labelEn: 'Hot Stone', labelId: 'Hot Stone' },
  { id: 'reflexology', labelEn: 'Reflexology', labelId: 'Reflexology' },
  { id: 'prenatal', labelEn: 'Prenatal', labelId: 'Prenatal' },
  { id: 'sports_massage', labelEn: 'Sports Massage', labelId: 'Sports Massage' },
];

/** Plan limits for Other Services Offered. */
export const OTHER_SERVICES_LIMITS: Record<TherapistPlanTier, number> = {
  free: 3,
  middle: 8,
  premium: 999, // effectively unlimited
};

export function getOtherServicesLimit(plan: TherapistPlanTier): number {
  return OTHER_SERVICES_LIMITS[plan] ?? 3;
}

/** Derive plan from therapist (same logic as TherapistProfilePlaceStyle). */
export function getTherapistPlanTier(therapist: { plan?: string; membershipPlan?: string; membershipTier?: string } | null): TherapistPlanTier {
  if (!therapist) return 'free';
  const p = (therapist as any).plan ?? (therapist as any).membershipPlan ?? (therapist as any).membershipTier ?? '';
  const v = String(p).toLowerCase();
  if (v === 'premium' || v === 'elite') return 'premium';
  if (v === 'middle' || v === 'plus' || v === 'trusted') return 'middle';
  return 'free'; // pro, empty, or unknown
}

export function getOtherServiceLabel(serviceId: string, language: 'en' | 'id' = 'en'): string {
  const item = OTHER_SERVICES_OFFERED_MASTER.find((s) => s.id === serviceId);
  if (!item) return serviceId;
  return language === 'id' ? item.labelId : item.labelEn;
}
