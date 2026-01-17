export interface Achievement {
  $id: string;
  name: string;
  description: string;
  badgeUrl: string;
  category: 'professional' | 'experience' | 'specialization' | 'community' | 'verified' | 'performance';
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
  professional: {
    name: 'Professional Certification',
    description: 'Verified professional credentials and certifications',
    color: 'bg-blue-500'
  },
  experience: {
    name: 'Experience Level',
    description: 'Years of experience and service milestones',
    color: 'bg-green-500'
  },
  specialization: {
    name: 'Specialization',
    description: 'Expertise in specific massage techniques',
    color: 'bg-purple-500'
  },
  community: {
    name: 'Community',
    description: 'Contribution to the Indastreet community',
    color: 'bg-orange-500'
  },
  verified: {
    name: 'Verification',
    description: 'Identity and service verification badges',
    color: 'bg-teal-500'
  },
  performance: {
    name: 'Performance',
    description: 'Outstanding service and customer satisfaction',
    color: 'bg-yellow-500'
  }
} as const;

// Sample achievement badges
export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    $id: 'cert-professional',
    name: 'Certified Professional',
    description: 'Verified professional massage therapy certification',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565',
    category: 'professional',
    rarity: 'uncommon',
    dateEarned: '2024-01-15',
    isVisible: true
  },
  {
    $id: 'exp-5years',
    name: '5 Years Experience',
    description: 'Successfully completed 5 years of massage therapy service',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/experience-badge.png',
    category: 'experience',
    rarity: 'rare',
    dateEarned: '2024-03-20',
    isVisible: true
  },
  {
    $id: 'verified-identity',
    name: 'Identity Verified',
    description: 'Government ID verified and authenticated',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/id-verified-badge.png',
    category: 'verified',
    rarity: 'common',
    dateEarned: '2024-01-10',
    isVisible: true
  },
  {
    $id: 'top-rated',
    name: 'Top Rated Therapist',
    description: 'Maintained 4.8+ average rating with 50+ reviews',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/top-rated-badge.png',
    category: 'performance',
    rarity: 'epic',
    dateEarned: '2024-06-15',
    isVisible: true
  },
  {
    $id: 'balinese-expert',
    name: 'Balinese Massage Expert',
    description: 'Specialized training in traditional Balinese massage techniques',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/balinese-expert-badge.png',
    category: 'specialization',
    rarity: 'rare',
    dateEarned: '2024-02-28',
    isVisible: true
  },
  {
    $id: 'community-leader',
    name: 'Community Leader',
    description: 'Active contributor to therapist community and mentorship',
    badgeUrl: 'https://ik.imagekit.io/7grri5v7d/community-leader-badge.png',
    category: 'community',
    rarity: 'legendary',
    dateEarned: '2024-07-01',
    isVisible: true
  }
];