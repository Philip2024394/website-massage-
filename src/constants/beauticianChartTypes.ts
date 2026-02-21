/**
 * Beautician Color & Design Chart types.
 * Each chart is shown as a dropdown on the profile when the linked category is selected.
 * Order: Nail (first), then Hair, then any future charts.
 * Therapist can upload custom image per chart or use default (when provided).
 */

import { BEAUTICIAN_CATEGORY_IDS } from './beauticianServiceCategories';
import type { BeauticianCategoryId } from './beauticianServiceCategories';

export const BEAUTICIAN_CHART_IDS = {
  NAIL_COLOUR: 'nail',
  HAIR_COLOUR: 'hair',
  HAIR_STYLES: 'hair_styles',
} as const;

export type BeauticianChartId = (typeof BEAUTICIAN_CHART_IDS)[keyof typeof BEAUTICIAN_CHART_IDS];

export interface BeauticianChartType {
  id: BeauticianChartId;
  labelEn: string;
  labelId: string;
  /** Category that activates this chart (when selected in dashboard). */
  categoryId: BeauticianCategoryId;
  /** Optional default/standard chart image URL (replace with your asset when ready). */
  defaultImageUrl?: string;
}

/** Ordered list: Nail first, then Hair. Add more here for future charts. */
export const BEAUTICIAN_CHART_TYPES: BeauticianChartType[] = [
  {
    id: BEAUTICIAN_CHART_IDS.NAIL_COLOUR,
    labelEn: 'Nail Colors',
    labelId: 'Warna Kuku',
    categoryId: BEAUTICIAN_CATEGORY_IDS.NAIL_SERVICES,
    defaultImageUrl: 'https://ik.imagekit.io/7grri5v7d/nail%20colors.png',
  },
  {
    id: BEAUTICIAN_CHART_IDS.HAIR_COLOUR,
    labelEn: 'Hair colour chart',
    labelId: 'Daftar warna rambut',
    categoryId: BEAUTICIAN_CATEGORY_IDS.HAIR_BEAUTY,
    defaultImageUrl: undefined,
  },
  {
    id: BEAUTICIAN_CHART_IDS.HAIR_STYLES,
    labelEn: 'Hair Styles',
    labelId: 'Gaya Rambut',
    categoryId: BEAUTICIAN_CATEGORY_IDS.HAIR_BEAUTY,
    /** Higher-res ImageKit transform (w-1200, q-90) for clearer display */
    defaultImageUrl: 'https://ik.imagekit.io/7grri5v7d/hait_styles_brown-removebg-preview.png?tr=w-1200,q-90',
  },
];

/** Therapist field key for custom image URL per chart (legacy single fields also used). */
export const CHART_FIELD_LEGACY: Record<BeauticianChartId, string> = {
  [BEAUTICIAN_CHART_IDS.NAIL_COLOUR]: 'nailChartImageUrl',
  [BEAUTICIAN_CHART_IDS.HAIR_COLOUR]: 'hairColorChartImageUrl',
  [BEAUTICIAN_CHART_IDS.HAIR_STYLES]: 'hairStylesChartImageUrl',
};
