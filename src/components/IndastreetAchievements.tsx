import React, { useState, useEffect } from 'react';
import { Award, Star, Shield, Zap, Users, Plus, Clock, Target, Sparkles, Activity, TrendingUp } from 'lucide-react';
import { Achievement, TherapistAchievement, ACHIEVEMENT_CATEGORIES, SAMPLE_ACHIEVEMENTS } from '../types/achievements';

interface IndastreetAchievementsProps {
  therapistId: string;
  therapistName?: string;    // Real therapist name
  isVerified?: boolean;      // Real verification status
  verifiedDate?: string;     // Real verification date
  mode?: 'authenticated' | 'shared' | 'public';
  achievements?: TherapistAchievement[];
  onViewAll?: () => void;
  language?: 'en' | 'id' | 'gb';  // Language for translations
}

const IndastreetAchievements: React.FC<IndastreetAchievementsProps> = ({
  therapistId,
  therapistName = 'Therapist',
  isVerified = false,
  verifiedDate,
  mode = 'public',
  achievements = [],
  onViewAll,
  language = 'en'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Mock achieved achievement IDs - In production, this would come from Appwrite
  const mockAchievedIds = [
    'certified-oils', // ✅ ALWAYS ACHIEVED - All therapists get certified oils rare container
    'hygiene-approved',
    'time-keeper',
    'booking-commitment',
    'profile-complete',
    'fast-responder',
    'growth-path'
  ];

  // Get all available achievements from sample data
  const allAchievements = SAMPLE_ACHIEVEMENTS;
  
  // Check which achievements are achieved
  const achievementsWithStatus = allAchievements.map(achievement => ({
    ...achievement,
    // ✅ BUSINESS RULE: Certified oils is always achieved for all therapists
    isAchieved: achievement.$id === 'certified-oils' ? true : mockAchievedIds.includes(achievement.$id)
  }));

  // Group by category
  const achievementsByCategory = Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, categoryInfo]) => {
    const categoryAchievements = achievementsWithStatus.filter(a => a.category === key);
    return {
      key,
      name: categoryInfo.name,
      color: categoryInfo.color,
      achievements: categoryAchievements
    };
  }).filter(category => category.achievements.length > 0);

  const displayCategories = isExpanded ? achievementsByCategory : achievementsByCategory.slice(0, 3);

  const getCategoryIcon = (category: Achievement['category']) => {
    switch (category) {
      case 'professional_standards': return <Shield className="w-4 h-4" />;
      case 'reliability_discipline': return <Clock className="w-4 h-4" />;
      case 'quality_experience': return <Star className="w-4 h-4" />;
      case 'platform_engagement': return <Activity className="w-4 h-4" />;
      case 'premium_growth': return <TrendingUp className="w-4 h-4" />;
      case 'specialty_badges': return <Star className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getBadgeStyle = (achievement: any) => {
    if (achievement.isAchieved) {
      // Achieved - white containers
      return 'border-gray-200 bg-white text-gray-800 shadow-sm';
    } else {
      // Not achieved - red containers
      return 'border-red-300 bg-red-100 text-red-700';
    }
  };

  const getBadgeIcon = (achievement: any) => {
    return achievement.isAchieved ? '✓' : '✗';
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-orange-800">
              {language === 'id' ? 'Pencapaian Indastreet' : 'Indastreet Achievements'}
            </h3>
            {isVerified && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-gray-700 font-medium">{therapistName}</span>
                  <span className="text-gray-600">{language === 'id' ? 'ID Terverifikasi' : 'Verified ID'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {achievementsByCategory.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
          >
            {isExpanded ? 'Show Less' : `View All`}
            <Plus className={`w-4 h-4 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-45' : ''}`} />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {displayCategories.map((category) => (
          <div key={category.key} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white">
                {getCategoryIcon(category.key as Achievement['category'])}
              </div>
              <h4 className="text-sm font-semibold text-orange-800">{category.name}</h4>
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-green-600 font-medium">
                  {category.achievements.filter(a => a.isAchieved).length}
                </span>
                <span className="text-xs text-orange-400">/</span>
                <span className="text-xs text-orange-600">
                  {category.achievements.length}
                </span>
              </div>
            </div>

            {/* Achievement Badges - Compact Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {category.achievements.map((achievement) => (
                <div
                  key={achievement.$id}
                  className={`
                    relative p-2 rounded-md border text-center cursor-pointer transition-all hover:shadow-sm
                    ${getBadgeStyle(achievement)}
                  `}
                  title={achievement.description}
                >
                  {/* Achievement Status Icon */}
                  <div className="flex items-center justify-center mb-1">
                    <span className={`text-lg ${achievement.isAchieved ? 'text-green-500' : 'text-red-500'}`}>
                      {getBadgeIcon(achievement)}
                    </span>
                  </div>

                  {/* Achievement Name */}
                  <h5 className="text-xs font-medium leading-tight mb-1">
                    {achievement.name}
                  </h5>

                  {/* Rarity Indicator */}
                  <div className="flex items-center justify-center">
                    <span className="text-xs opacity-75 capitalize">
                      {achievement.rarity}
                    </span>
                  </div>

                  {/* Legendary indicator */}
                  {achievement.rarity === 'legendary' && achievement.isAchieved && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-2 h-2 text-yellow-800 fill-current" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Achievement Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Achieved: {achievementsWithStatus.filter(a => a.isAchieved).length}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Pending: {achievementsWithStatus.filter(a => !a.isAchieved).length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-orange-500" />
              <span className="text-gray-600">Total: {allAchievements.length} standards</span>
            </div>
          </div>
          {mode === 'authenticated' && onViewAll && (
            <button
              onClick={onViewAll}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              Manage →
            </button>
          )}
        </div>
      </div>

      {/* Achievement Accountability Notice */}
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Achievement Accountability:</span> Any achievement displayed but not practiced during your massage session gives you the obligation to no payment. Indastreet takes pride in our badge achievements so you can too.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndastreetAchievements;