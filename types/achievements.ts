export interface Achievement {
  $id: string;
  name: string;
  description: string;
  badgeUrl: string;
  category: 'professional_standards' | 'reliability_discipline' | 'quality_experience' | 'platform_engagement' | 'premium_growth' | 'specialty_badges';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  dateEarned: string;
  isVisible: boolean;
  requirementsMet?: string[];
}

export interface TherapistAchievement {
  $id: string;
  therapistId: string;
  achievementId: string;
  achievement: Achievement;
  dateAwarded: string;
  awardedBy: string; // admin ID
  isActive: boolean;
}

export interface AchievementCategory {
  name: string;
  description: string;
  badgeCount: number;
  achievements: Achievement[];
}

// Predefined achievement constants
export const ACHIEVEMENT_CATEGORIES = {
  professional_standards: {
    name: 'Professional Standards',
    description: 'EU/International standards for certified oils, hygiene, and licensed therapy',
    color: 'bg-blue-500'
  },
  reliability_discipline: {
    name: 'Reliability & Discipline',
    description: 'Time management, distance reliability, and booking commitment',
    color: 'bg-green-500'
  },
  quality_experience: {
    name: 'Quality & Experience',
    description: '5-star ratings, customer favorites, and advanced techniques',
    color: 'bg-purple-500'
  },
  platform_engagement: {
    name: 'Platform Engagement',
    description: 'Profile completeness, response time, and availability accuracy',
    color: 'bg-orange-500'
  },
  premium_growth: {
    name: 'Premium & Growth',
    description: 'Elite membership, continuous improvement, and platform trust',
    color: 'bg-yellow-500'
  },
  specialty_badges: {
    name: 'Specialty Badges',
    description: 'Traditional specialization, hotel approval, and wellness focus',
    color: 'bg-teal-500'
  }
} as const;

// Complete achievement badges based on your requirements
export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  // PROFESSIONAL STANDARDS
  {
    $id: 'certified-oils',
    name: 'Certified Oils',
    description: 'Uses certified, skin-safe massage oils. EU/International standard compliant. Builds customer trust & hygiene confidence.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/certified-oils-badge.png',
    category: 'professional_standards',
    rarity: 'rare',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'hygiene-approved',
    name: 'Hygiene Approved',
    description: 'Clean presentation, proper nail length, optional glove use where appropriate, high sanitation awareness.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/hygiene-badge.png',
    category: 'professional_standards',
    rarity: 'uncommon',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'licensed-therapist',
    name: 'Licensed Therapist',
    description: 'Holds valid local or international certification. Verified documents on file.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/licensed-badge.png',
    category: 'professional_standards',
    rarity: 'epic',
    dateEarned: '',
    isVisible: true
  },

  // RELIABILITY & DISCIPLINE
  {
    $id: 'time-keeper',
    name: 'Time Keeper',
    description: 'Always arrives on time. No late starts or cancellations. Strong booking discipline.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/time-keeper-badge.png',
    category: 'reliability_discipline',
    rarity: 'rare',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'distance-reliable',
    name: 'Distance Reliable',
    description: 'Consistently completes long-distance bookings. No last-minute refusals.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/distance-badge.png',
    category: 'reliability_discipline',
    rarity: 'uncommon',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'booking-commitment',
    name: 'Booking Commitment',
    description: 'Accepts and completes bookings responsibly. Low cancellation rate.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/commitment-badge.png',
    category: 'reliability_discipline',
    rarity: 'common',
    dateEarned: '',
    isVisible: true
  },

  // QUALITY & EXPERIENCE
  {
    $id: 'five-star-rated',
    name: '5-Star Rated',
    description: 'Consistently high customer reviews. Quality service confirmed by clients.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/five-star-badge.png',
    category: 'quality_experience',
    rarity: 'epic',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'customer-favorite',
    name: 'Customer Favorite',
    description: 'Frequently rebooked by customers. High repeat client rate.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/favorite-badge.png',
    category: 'quality_experience',
    rarity: 'rare',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'advanced-techniques',
    name: 'Advanced Techniques',
    description: 'Skilled in multiple massage styles. Traditional + modern methods.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/advanced-badge.png',
    category: 'quality_experience',
    rarity: 'rare',
    dateEarned: '',
    isVisible: true
  },

  // PLATFORM ENGAGEMENT
  {
    $id: 'profile-complete',
    name: 'Profile Complete',
    description: 'Full profile, photos, menu, pricing. Actively maintained dashboard.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/profile-complete-badge.png',
    category: 'platform_engagement',
    rarity: 'common',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'fast-responder',
    name: 'Fast Responder',
    description: 'Replies quickly to customer messages. High response score.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/fast-response-badge.png',
    category: 'platform_engagement',
    rarity: 'uncommon',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'verified-availability',
    name: 'Verified Availability',
    description: 'Online status accurate. Updates availability correctly.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/availability-badge.png',
    category: 'platform_engagement',
    rarity: 'common',
    dateEarned: '',
    isVisible: true
  },

  // PREMIUM & GROWTH
  {
    $id: 'elite-member',
    name: 'Elite Member',
    description: 'Premium or featured therapist. Consistently meets platform standards.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/elite-badge.png',
    category: 'premium_growth',
    rarity: 'legendary',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'growth-path',
    name: 'Growth Path',
    description: 'Shows continuous improvement. Increasing ratings & bookings over time.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/growth-badge.png',
    category: 'premium_growth',
    rarity: 'uncommon',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'platform-trusted',
    name: 'Platform Trusted',
    description: 'Long-term reliability. No policy violations. Strong professional record.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/trusted-badge.png',
    category: 'premium_growth',
    rarity: 'epic',
    dateEarned: '',
    isVisible: true
  },

  // SPECIALTY BADGES (OPTIONAL)
  {
    $id: 'traditional-specialist',
    name: 'Traditional Specialist',
    description: 'Expert in Indonesian traditional massage.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/traditional-badge.png',
    category: 'specialty_badges',
    rarity: 'rare',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'hotel-approved',
    name: 'Hotel-Approved',
    description: 'Experienced in hotel & spa environments.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/hotel-badge.png',
    category: 'specialty_badges',
    rarity: 'uncommon',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'long-session-expert',
    name: 'Long Session Expert',
    description: 'Comfortable with 90–120 min sessions.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/long-session-badge.png',
    category: 'specialty_badges',
    rarity: 'uncommon',
    dateEarned: '',
    isVisible: true
  },
  {
    $id: 'wellness-focused',
    name: 'Wellness Focused',
    description: 'Strong relaxation & recovery approach.',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/wellness-badge.png',
    category: 'specialty_badges',
    rarity: 'common',
    dateEarned: '',
    isVisible: true
  }
];