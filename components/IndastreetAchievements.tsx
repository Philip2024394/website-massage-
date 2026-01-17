import React, { useState, useEffect } from 'react';
import { Award, Star, Shield, Trophy, Zap, Users, ChevronRight } from 'lucide-react';
import { Achievement, TherapistAchievement, ACHIEVEMENT_CATEGORIES } from '../../types/achievements';

interface IndastreetAchievementsProps {
  therapistId: string;
  mode?: 'authenticated' | 'shared' | 'public';
  achievements?: TherapistAchievement[];
  onViewAll?: () => void;
}

const IndastreetAchievements: React.FC<IndastreetAchievementsProps> = ({
  therapistId,
  mode = 'public',
  achievements = [],
  onViewAll
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mock achievements data - In production, this would come from Appwrite
  const mockAchievements: TherapistAchievement[] = [
    {
      $id: 'ta-1',
      therapistId: therapistId,
      achievementId: 'verified-identity',
      achievement: {
        $id: 'verified-identity',
        name: 'Identity Verified',
        description: 'Government ID verified and authenticated by Indastreet',
        badgeUrl: 'https://ik.imagekit.io/7grri5v7d/verified-removebg-preview.png?updatedAt=1768015154565',
        category: 'verified',
        rarity: 'common',
        dateEarned: '2024-01-10',
        isVisible: true
      },
      dateAwarded: '2024-01-10',
      awardedBy: 'admin-001',
      isActive: true
    },
    {
      $id: 'ta-2',
      therapistId: therapistId,
      achievementId: 'cert-professional',
      achievement: {
        $id: 'cert-professional',
        name: 'Certified Professional',
        description: 'Verified professional massage therapy certification',
        badgeUrl: 'https://ik.imagekit.io/7grri5v7d/professional-cert-badge.png',
        category: 'professional',
        rarity: 'uncommon',
        dateEarned: '2024-01-15',
        isVisible: true
      },
      dateAwarded: '2024-01-15',
      awardedBy: 'admin-001',
      isActive: true
    },
    {
      $id: 'ta-3',
      therapistId: therapistId,
      achievementId: 'exp-3years',
      achievement: {
        $id: 'exp-3years',
        name: '3+ Years Experience',
        description: 'Successfully completed over 3 years of massage therapy service',
        badgeUrl: 'https://ik.imagekit.io/7grri5v7d/experience-3yr-badge.png',
        category: 'experience',
        rarity: 'uncommon',
        dateEarned: '2024-03-20',
        isVisible: true
      },
      dateAwarded: '2024-03-20',
      awardedBy: 'admin-001',
      isActive: true
    },
    {
      $id: 'ta-4',
      therapistId: therapistId,
      achievementId: 'balinese-specialist',
      achievement: {
        $id: 'balinese-specialist',
        name: 'Balinese Specialist',
        description: 'Expert in traditional Balinese massage techniques and therapy',
        badgeUrl: 'https://ik.imagekit.io/7grri5v7d/balinese-specialist-badge.png',
        category: 'specialization',
        rarity: 'rare',
        dateEarned: '2024-02-28',
        isVisible: true
      },
      dateAwarded: '2024-02-28',
      awardedBy: 'admin-001',
      isActive: true
    }
  ];

  const visibleAchievements = achievements?.length > 0 ? achievements : mockAchievements;
  const displayedAchievements = isExpanded ? visibleAchievements : visibleAchievements.slice(0, 6);

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'professional': return <Shield className="w-4 h-4" />;
      case 'experience': return <Star className="w-4 h-4" />;
      case 'specialization': return <Zap className="w-4 h-4" />;
      case 'community': return <Users className="w-4 h-4" />;
      case 'verified': return <Shield className="w-4 h-4" />;
      case 'performance': return <Trophy className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50';
      case 'uncommon': return 'border-green-300 bg-green-50';
      case 'rare': return 'border-blue-300 bg-blue-50';
      case 'epic': return 'border-purple-300 bg-purple-50';
      case 'legendary': return 'border-yellow-300 bg-yellow-50 ring-2 ring-yellow-200';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityTextColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'uncommon': return 'text-green-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (!visibleAchievements || visibleAchievements.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-orange-800">
              Indastreet Achievements
            </h3>
            <p className="text-sm text-orange-600">
              Standards verified by our team
            </p>
          </div>
        </div>
        
        {visibleAchievements.length > 6 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Show Less' : `View All (${visibleAchievements.length})`}
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedAchievements.map((therapistAchievement) => {
          const achievement = therapistAchievement.achievement;
          const categoryConfig = ACHIEVEMENT_CATEGORIES[achievement.category];
          
          return (
            <div
              key={therapistAchievement.$id}
              className={`
                relative p-4 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer
                ${getRarityColor(achievement.rarity)}
              `}
              title={achievement.description}
            >
              {/* Rarity indicator */}
              {achievement.rarity === 'legendary' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-yellow-800 fill-current" />
                </div>
              )}
              
              {/* Badge Image */}
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <img
                    src={achievement.badgeUrl}
                    alt={achievement.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/default-achievement-badge.png';
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className={`${categoryConfig.color} w-3 h-3 rounded-full flex items-center justify-center`}>
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-800 truncate">
                    {achievement.name}
                  </h4>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  {achievement.description}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <span className={`text-xs font-medium capitalize ${getRarityTextColor(achievement.rarity)}`}>
                    {achievement.rarity}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {new Date(achievement.dateEarned).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-orange-200">
        <div className="flex items-center justify-between text-xs text-orange-600">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>All badges verified by Indastreet standards</span>
          </div>
          {mode === 'authenticated' && onViewAll && (
            <button
              onClick={onViewAll}
              className="hover:text-orange-700 font-medium"
            >
              Manage Achievements →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndastreetAchievements;