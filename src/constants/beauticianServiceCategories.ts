/**
 * Beautician Dashboard – Service Category Master List
 * Max 5 categories selectable per beautician.
 * Feature activations control which profile sections are enabled (nail chart, face map, hair chart, skin zone, etc.).
 */

export const BEAUTICIAN_CATEGORY_IDS = {
  NAIL_SERVICES: 'nail_services',
  MAKEUP_SERVICES: 'makeup_services',
  LASH_BROW: 'lash_brow',
  HAIR_BEAUTY: 'hair_beauty',
  WAXING_HAIR_REMOVAL: 'waxing_hair_removal',
  HEAD_SPA_SCALP: 'head_spa_scalp',
  FACIAL_TREATMENTS: 'facial_treatments',
} as const;

export type BeauticianCategoryId = (typeof BEAUTICIAN_CATEGORY_IDS)[keyof typeof BEAUTICIAN_CATEGORY_IDS];

export interface BeauticianCategoryItem {
  id: BeauticianCategoryId;
  labelEn: string;
  labelId: string;
  subServices: string[];
  /** Profile features to enable when this category is selected */
  featureActivation?: {
    nailColorChart?: boolean;
    faceFeatureMap?: boolean;
    beforeAfterGalleryPriority?: boolean;
    hairColorChart?: boolean;
    skinZoneDiagram?: boolean;
  };
}

export const BEAUTICIAN_SERVICE_CATEGORIES: BeauticianCategoryItem[] = [
  {
    id: BEAUTICIAN_CATEGORY_IDS.NAIL_SERVICES,
    labelEn: 'Nail Services',
    labelId: 'Layanan Kuku',
    subServices: ['Manicure', 'Pedicure', 'Gel Polish', 'Nail Extensions', 'Nail Art'],
    featureActivation: { nailColorChart: true },
  },
  {
    id: BEAUTICIAN_CATEGORY_IDS.MAKEUP_SERVICES,
    labelEn: 'Makeup Services',
    labelId: 'Layanan Makeup',
    subServices: ['Natural Makeup', 'Bridal Makeup', 'Glam Makeup', 'Event Makeup', 'Photoshoot Makeup'],
    featureActivation: { faceFeatureMap: true, beforeAfterGalleryPriority: true },
  },
  {
    id: BEAUTICIAN_CATEGORY_IDS.LASH_BROW,
    labelEn: 'Lash & Brow',
    labelId: 'Bulu Mata & Alis',
    subServices: ['Lash Extensions', 'Lash Lift', 'Brow Shaping', 'Brow Lamination', 'Tinting'],
  },
  {
    id: BEAUTICIAN_CATEGORY_IDS.HAIR_BEAUTY,
    labelEn: 'Hair Beauty Services',
    labelId: 'Layanan Rambut',
    subServices: ['Hair Styling', 'Hair Coloring', 'Hair Treatment', 'Blow Dry', 'Hair Spa'],
    featureActivation: { hairColorChart: true },
  },
  {
    id: BEAUTICIAN_CATEGORY_IDS.WAXING_HAIR_REMOVAL,
    labelEn: 'Waxing & Hair Removal',
    labelId: 'Waxing & Hair Removal',
    subServices: ['Face Wax', 'Body Wax', 'Threading', 'Bikini Wax'],
  },
  {
    id: BEAUTICIAN_CATEGORY_IDS.HEAD_SPA_SCALP,
    labelEn: 'Head Spa / Scalp Care',
    labelId: 'Head Spa / Perawatan Kulit Kepala',
    subServices: ['Scalp Detox', 'Head Massage (Beauty)', 'Hair Growth Treatment'],
  },
  {
    id: BEAUTICIAN_CATEGORY_IDS.FACIAL_TREATMENTS,
    labelEn: 'Facial Treatments',
    labelId: 'Perawatan Facial',
    subServices: ['Basic Facial', 'Acne Treatment', 'Anti-Aging Facial', 'Hydrating Facial', 'Chemical Peel (if certified)'],
    featureActivation: { skinZoneDiagram: true },
  },
];

export const MAX_BEAUTICIAN_CATEGORIES = 5;

export const FACIAL_THERAPIST_UPGRADE_FEE_IDR = 200_000;
export const FACIAL_THERAPIST_UPGRADE_DURATION_YEARS = 1;
