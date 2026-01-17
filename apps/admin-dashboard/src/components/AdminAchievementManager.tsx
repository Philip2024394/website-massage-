import React, { useState, useEffect } from 'react';
import { 
  Award, Plus, Edit3, Trash2, Eye, EyeOff, Save, X,
  Shield, Star, Zap, Users, Trophy, Search, Filter
} from 'lucide-react';
import { Achievement, TherapistAchievement, ACHIEVEMENT_CATEGORIES, SAMPLE_ACHIEVEMENTS } from '../../types/achievements';

interface AdminAchievementManagerProps {
  onBack: () => void;
}

const AdminAchievementManager: React.FC<AdminAchievementManagerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'assign'>('achievements');
  const [achievements, setAchievements] = useState<Achievement[]>(SAMPLE_ACHIEVEMENTS);
  const [therapistAchievements, setTherapistAchievements] = useState<TherapistAchievement[]>([]);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [therapists, setTherapists] = useState<any[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedAchievementToAssign, setSelectedAchievementToAssign] = useState<string>('');

  useEffect(() => {
    // Mock load therapists for assignment
    setTherapists([
      { $id: 'th-1', name: 'Sarah Johnson', profilePicture: null },
      { $id: 'th-2', name: 'Dewi Sari', profilePicture: null },
      { $id: 'th-3', name: 'Maria Santos', profilePicture: null }
    ]);
  }, []);

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateAchievement = () => {
    const newAchievement: Achievement = {
      $id: `ach-${Date.now()}`,
      name: '',
      description: '',
      badgeUrl: '',
      category: 'professional',
      rarity: 'common',
      dateEarned: new Date().toISOString().split('T')[0],
      isVisible: true
    };
    setEditingAchievement(newAchievement);
    setIsCreateMode(true);
  };

  const handleSaveAchievement = () => {
    if (!editingAchievement) return;
    
    if (isCreateMode) {
      setAchievements([...achievements, editingAchievement]);
    } else {
      setAchievements(achievements.map(a => 
        a.$id === editingAchievement.$id ? editingAchievement : a
      ));
    }
    
    setEditingAchievement(null);
    setIsCreateMode(false);
  };

  const handleDeleteAchievement = (achievementId: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      setAchievements(achievements.filter(a => a.$id !== achievementId));
    }
  };

  const handleAssignAchievement = () => {
    if (!selectedTherapist || !selectedAchievementToAssign) return;
    
    const achievement = achievements.find(a => a.$id === selectedAchievementToAssign);
    if (!achievement) return;
    
    const newAssignment: TherapistAchievement = {
      $id: `ta-${Date.now()}`,
      therapistId: selectedTherapist,
      achievementId: selectedAchievementToAssign,
      achievement: achievement,
      dateAwarded: new Date().toISOString().split('T')[0],
      awardedBy: 'admin-001', // Current admin
      isActive: true
    };
    
    setTherapistAchievements([...therapistAchievements, newAssignment]);
    setSelectedTherapist('');
    setSelectedAchievementToAssign('');
  };

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
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span> Achievement Manager
                  </h1>
                  <p className="text-gray-600">Manage professional standards and badges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'achievements'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Achievement Library
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assign'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assign Achievements
            </button>
          </nav>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'achievements' && (
          <>
            {/* Achievement Management Controls */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search achievements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleCreateAchievement}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Achievement
                </button>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <div key={achievement.$id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(achievement.category)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingAchievement(achievement)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAchievement(achievement.$id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <img
                        src={achievement.badgeUrl}
                        alt={achievement.name}
                        className="w-16 h-16 mx-auto mb-2 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/7grri5v7d/default-achievement-badge.png';
                        }}
                      />
                      <h3 className="font-semibold text-gray-800 mb-1">{achievement.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{achievement.description}</p>
                    </div>

                    <div className="text-xs text-gray-500 text-center">
                      Category: {ACHIEVEMENT_CATEGORIES[achievement.category].name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'assign' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Assign Achievement to Therapist</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Therapist</label>
                <select
                  value={selectedTherapist}
                  onChange={(e) => setSelectedTherapist(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose a therapist...</option>
                  {therapists.map((therapist) => (
                    <option key={therapist.$id} value={therapist.$id}>
                      {therapist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Achievement</label>
                <select
                  value={selectedAchievementToAssign}
                  onChange={(e) => setSelectedAchievementToAssign(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Choose an achievement...</option>
                  {achievements.map((achievement) => (
                    <option key={achievement.$id} value={achievement.$id}>
                      {achievement.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAssignAchievement}
                  disabled={!selectedTherapist || !selectedAchievementToAssign}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Assign Achievement
                </button>
              </div>
            </div>

            {/* Recent Assignments */}
            {therapistAchievements.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Assignments</h3>
                <div className="space-y-3">
                  {therapistAchievements.slice(-5).map((assignment) => (
                    <div key={assignment.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={assignment.achievement.badgeUrl}
                          alt={assignment.achievement.name}
                          className="w-8 h-8 object-contain"
                        />
                        <div>
                          <div className="font-medium">{assignment.achievement.name}</div>
                          <div className="text-sm text-gray-600">
                            Assigned to therapist {assignment.therapistId}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.dateAwarded}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Achievement Modal */}
      {editingAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {isCreateMode ? 'Create Achievement' : 'Edit Achievement'}
                </h3>
                <button
                  onClick={() => {
                    setEditingAchievement(null);
                    setIsCreateMode(false);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editingAchievement.name}
                    onChange={(e) => setEditingAchievement({...editingAchievement, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Achievement name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingAchievement.description}
                    onChange={(e) => setEditingAchievement({...editingAchievement, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Achievement description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Image URL</label>
                  <input
                    type="url"
                    value={editingAchievement.badgeUrl}
                    onChange={(e) => setEditingAchievement({...editingAchievement, badgeUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://example.com/badge.png"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editingAchievement.category}
                      onChange={(e) => setEditingAchievement({...editingAchievement, category: e.target.value as Achievement['category']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rarity</label>
                    <select
                      value={editingAchievement.rarity}
                      onChange={(e) => setEditingAchievement({...editingAchievement, rarity: e.target.value as Achievement['rarity']})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="epic">Epic</option>
                      <option value="legendary">Legendary</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={editingAchievement.isVisible}
                    onChange={(e) => setEditingAchievement({...editingAchievement, isVisible: e.target.checked})}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="isVisible" className="text-sm text-gray-700">
                    Visible to users
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingAchievement(null);
                    setIsCreateMode(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAchievement}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Save Achievement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAchievementManager;