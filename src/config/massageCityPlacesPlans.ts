/**
 * Massage City Places (Indonesia) – membership plans and commission config.
 * Commission 25–30% for massage places (Free). Pro/Elite get calendar, visibility, trials.
 */

export type MCPPlanId = 'free' | 'pro' | 'elite';

export interface MCPPlan {
  id: MCPPlanId;
  name: string;
  nameId?: string;
  priceIdr: number;
  priceLabel: string;
  /** Annual price (IDR). When set, show "Pay yearly, get 2 months free" or similar. */
  priceYearlyIdr?: number;
  priceYearlyLabel?: string;
  priceYearlyLabelId?: string;
  commissionPercent: number;
  commissionLabel: string;
  badge?: string;
  badgeId?: string;
  features: string[];
  featuresId?: string[];
  photoLimit: number;
  highlighted?: boolean;
  /** 7 or 14 day trial for paid plans. */
  trialDays?: number;
  /** Concrete outcome e.g. "Elite places get ~40% more profile views" */
  outcomeStatement?: string;
  outcomeStatementId?: string;
}

export const MCP_PLANS: MCPPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    nameId: 'Paket Gratis',
    priceIdr: 0,
    priceLabel: '0 IDR',
    commissionPercent: 30,
    commissionLabel: '25–30% per booking',
    photoLimit: 5,
    features: [
      'Basic listing',
      '5 photos',
      'Standard visibility',
      'WhatsApp booking',
      'Admin scheduling support',
    ],
    featuresId: [
      'Listing dasar',
      '5 foto',
      'Visibilitas standar',
      'Booking WhatsApp',
      'Dukungan jadwal dari admin',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    nameId: 'Paket Pro',
    priceIdr: 149_000,
    priceLabel: '149.000 IDR / month',
    priceYearlyIdr: 1_490_000,
    priceYearlyLabel: 'Pay yearly – 2 months free',
    priceYearlyLabelId: 'Bayar tahunan – 2 bulan gratis',
    commissionPercent: 10,
    commissionLabel: '10% per booking',
    badge: 'Most Popular',
    badgeId: 'Paling Populer',
    photoLimit: 15,
    highlighted: true,
    trialDays: 14,
    outcomeStatement: 'Pro places get ~25% more profile views and verified badge.',
    outcomeStatementId: 'Tempat Pro dapat ~25% lebih banyak tampilan profil dan lencana verified.',
    features: [
      '15 photos',
      'Higher search ranking',
      '"Verified" badge',
      'Pro badge on profile',
      'Booking calendar in dashboard',
      'Basic analytics',
    ],
    featuresId: [
      '15 foto',
      'Peringkat pencarian lebih tinggi',
      'Lencana "Verified"',
      'Lencana Pro di profil',
      'Kalender booking di dashboard',
      'Analitik dasar',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    nameId: 'Paket Elite',
    priceIdr: 190_000,
    priceLabel: '190.000 IDR / month',
    priceYearlyIdr: 1_900_000,
    priceYearlyLabel: 'Pay yearly – 2 months free',
    priceYearlyLabelId: 'Bayar tahunan – 2 bulan gratis',
    commissionPercent: 0,
    commissionLabel: '0%',
    badge: 'Best for Growing Spas',
    badgeId: 'Terbaik untuk Spa yang Berkembang',
    photoLimit: -1,
    trialDays: 7,
    outcomeStatement: 'Elite places get ~40% more profile views and featured placement.',
    outcomeStatementId: 'Tempat Elite dapat ~40% lebih banyak tampilan profil dan tampilan unggulan.',
    features: [
      'Top search placement',
      'Unlimited photos',
      'Featured placement in city page',
      'Full booking calendar & management',
      'Customer insights analytics',
      'Promotional tools',
      'Priority support',
    ],
    featuresId: [
      'Posisi teratas di pencarian',
      'Foto tak terbatas',
      'Tampilan unggulan di halaman kota',
      'Kalender booking penuh & manajemen',
      'Analitik wawasan pelanggan',
      'Alat promosi',
      'Dukungan prioritas',
    ],
  },
];

/** Default commission for Free plan (25–30%). */
export const MCP_DEFAULT_FREE_COMMISSION_PERCENT = 27;

/** Admin-configurable free plan commission range. */
export const MCP_FREE_COMMISSION_MIN = 25;
export const MCP_FREE_COMMISSION_MAX = 30;

export function getMCPPlan(id: MCPPlanId): MCPPlan | undefined {
  return MCP_PLANS.find((p) => p.id === id);
}

export function getMCPPlanPhotoLimit(planId: MCPPlanId): number {
  const plan = getMCPPlan(planId);
  return plan ? plan.photoLimit : 5;
}

/** SessionStorage key: set when vendor signs up via Massage City Places flow; cleared when they publish. */
export const STORAGE_MCP_ONBOARDING = 'mcp_onboarding';
