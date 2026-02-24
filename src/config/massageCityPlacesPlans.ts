/**
 * Massage City Places (Indonesia) – membership plans and commission config.
 * Strategy: Listing goes live first (Free), then "Increase Your Earnings" page for upgrades.
 */

export type MCPPlanId = 'free' | 'pro' | 'elite';

export interface MCPPlan {
  id: MCPPlanId;
  name: string;
  nameId?: string;
  priceIdr: number;
  priceLabel: string;
  commissionPercent: number;
  commissionLabel: string;
  badge?: string; // e.g. "Most Popular", "Best for Growing Spas"
  badgeId?: string;
  features: string[];
  featuresId?: string[];
  photoLimit: number;
  highlighted?: boolean;
}

export const MCP_PLANS: MCPPlan[] = [
  {
    id: 'free',
    name: 'Free Plan',
    nameId: 'Paket Gratis',
    priceIdr: 0,
    priceLabel: '0 IDR',
    commissionPercent: 25,
    commissionLabel: '25% per booking',
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
    commissionPercent: 10,
    commissionLabel: '10% per booking',
    badge: 'Most Popular',
    badgeId: 'Paling Populer',
    photoLimit: 15,
    highlighted: true,
    features: [
      '15 photos',
      'Higher search ranking',
      '"Verified" badge',
      'Access to booking dashboard',
      'Basic analytics',
    ],
    featuresId: [
      '15 foto',
      'Peringkat pencarian lebih tinggi',
      'Lencana "Verified"',
      'Akses dashboard booking',
      'Analitik dasar',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    nameId: 'Paket Elite',
    priceIdr: 190_000,
    priceLabel: '190.000 IDR / month',
    commissionPercent: 0,
    commissionLabel: '0%',
    badge: 'Best for Growing Spas',
    badgeId: 'Terbaik untuk Spa yang Berkembang',
    photoLimit: -1, // unlimited
    features: [
      'Top search placement',
      'Unlimited photos',
      'Featured placement in city page',
      'Full booking management',
      'Customer insights analytics',
      'Promotional tools',
      'Priority support',
    ],
    featuresId: [
      'Posisi teratas di pencarian',
      'Foto tak terbatas',
      'Tampilan unggulan di halaman kota',
      'Manajemen booking penuh',
      'Analitik wawasan pelanggan',
      'Alat promosi',
      'Dukungan prioritas',
    ],
  },
];

/** Default commission for Free plan (admin can set 20–25%). */
export const MCP_DEFAULT_FREE_COMMISSION_PERCENT = 25;

/** Admin-configurable free plan commission range. */
export const MCP_FREE_COMMISSION_MIN = 20;
export const MCP_FREE_COMMISSION_MAX = 25;

export function getMCPPlan(id: MCPPlanId): MCPPlan | undefined {
  return MCP_PLANS.find((p) => p.id === id);
}

export function getMCPPlanPhotoLimit(planId: MCPPlanId): number {
  const plan = getMCPPlan(planId);
  return plan ? plan.photoLimit : 5;
}

/** SessionStorage key: set when vendor signs up via Massage City Places flow; cleared when they publish. */
export const STORAGE_MCP_ONBOARDING = 'mcp_onboarding';
