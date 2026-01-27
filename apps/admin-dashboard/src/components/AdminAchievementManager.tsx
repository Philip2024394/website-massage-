// @ts-nocheck - React 19 type compatibility
import React, { useState, useEffect } from 'react';
import { 
  Award, Plus, Edit3, Trash2, Eye, EyeOff, Save, X,
  Shield, Star, Zap, Users, Trophy, Search, Filter, Building
} from 'lucide-react';
import { Achievement, TherapistAchievement, ACHIEVEMENT_CATEGORIES, SAMPLE_ACHIEVEMENTS } from '../../../src/lib/appwrite';

interface AdminAchievementManagerProps {
  onBack: () => void;
}

const AdminAchievementManager: React.FC<AdminAchievementManagerProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'assign' | 'verification' | 'safe-pass'>('achievements');
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
    // Mock load therapists for assignment and verification
    setTherapists([
      { $id: 'th-1', name: 'Sarah Johnson', profilePicture: null, isVerified: true, verifiedAt: '2024-01-15' },
      { $id: 'th-2', name: 'Dewi Sari', profilePicture: null, isVerified: false },
      { $id: 'th-3', name: 'Maria Santos', profilePicture: null, isVerified: true, verifiedAt: '2024-02-01' }
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
      category: 'professional_standards',
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
      case 'professional_standards': return <Shield className="w-4 h-4" />;
      case 'reliability_discipline': return <Star className="w-4 h-4" />;
      case 'quality_experience': return <Trophy className="w-4 h-4" />;
      case 'platform_engagement': return <Users className="w-4 h-4" />;
      case 'premium_growth': return <Zap className="w-4 h-4" />;
      case 'specialty_badges': return <Award className="w-4 h-4" />;
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
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verification'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="inline w-4 h-4 mr-1" />
              Verification Manager
            </button>
            <button
              onClick={() => setActiveTab('safe-pass')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'safe-pass'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building className="inline w-4 h-4 mr-1" />
              Safe Pass Reviews
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

        {activeTab === 'verification' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              <Shield className="inline w-6 h-6 mr-2 text-green-600" />
              Therapist Verification Manager
            </h2>
            
            <div className="space-y-6">
              {/* Verification Actions */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Verify Therapist Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Therapist</label>
                    <select
                      value={selectedTherapist}
                      onChange={(e) => setSelectedTherapist(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Choose a therapist...</option>
                      {therapists.map((therapist) => (
                        <option key={therapist.$id} value={therapist.$id}>
                          {therapist.name} {therapist.isVerified ? '(✓ Verified)' : '(Unverified)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="identity">Identity Verification</option>
                      <option value="background">Background Check</option>
                      <option value="license">Professional License</option>
                      <option value="training">Training Certificate</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        if (selectedTherapist) {
                          // Toggle verification status
                          setTherapists(prev => prev.map(t => 
                            t.$id === selectedTherapist 
                              ? { ...t, isVerified: !t.isVerified, verifiedAt: !t.isVerified ? new Date().toLocaleDateString('en-GB') : undefined }
                              : t
                          ));
                          alert('Verification status updated successfully!');
                        }
                      }}
                      disabled={!selectedTherapist}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Toggle Verification
                    </button>
                  </div>
                </div>
              </div>

              {/* Verification Status List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Verification Status</h3>
                <div className="space-y-3">
                  {therapists.map((therapist) => (
                    <div key={therapist.$id} className={`flex items-center justify-between p-4 rounded-lg border ${
                      therapist.isVerified ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${therapist.isVerified ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="font-medium text-gray-900">{therapist.name}</div>
                          <div className="text-sm text-gray-600">
                            {therapist.isVerified 
                              ? `Verified on ${therapist.verifiedAt || 'Unknown date'}`
                              : 'Not verified - requires identity check'
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {therapist.isVerified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Shield className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unverified
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {therapists.length}
                  </div>
                  <div className="text-sm text-blue-800">Total Therapists</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {therapists.filter(t => t.isVerified).length}
                  </div>
                  <div className="text-sm text-green-800">Verified</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round((therapists.filter(t => t.isVerified).length / therapists.length) * 100)}%
                  </div>
                  <div className="text-sm text-orange-800">Verification Rate</div>
                </div>
              </div>
            </div>
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

      {/* Safe Pass Management Tab */}
      {activeTab === 'safe-pass' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hotel / Villa Safe Pass Reviews</h2>
              <p className="text-gray-600">Review and approve therapist Safe Pass applications</p>
            </div>
          </div>

          {/* Safe Pass Applications List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Pending Applications</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Mock Safe Pass applications - in production, fetch from Appwrite */}
              {[
                {
                  id: '1',
                  therapistName: 'Sarah Johnson',
                  therapistId: 'th-001',
                  submittedAt: '2024-01-15',
                  status: 'pending',
                  letters: [
                    { hotelName: 'Grand Hotel Bali', fileName: 'recommendation-1.pdf' },
                    { hotelName: 'Villa Paradise', fileName: 'recommendation-2.pdf' },
                    { hotelName: 'Resort Sunset', fileName: 'recommendation-3.pdf' }
                  ]
                },
                {
                  id: '2',
                  therapistName: 'Dewi Sari',
                  therapistId: 'th-002',
                  submittedAt: '2024-01-14',
                  status: 'pending',
                  letters: [
                    { hotelName: 'Hotel Marina', fileName: 'recommendation-1.jpg' },
                    { hotelName: 'Villa Ocean View', fileName: 'recommendation-2.jpg' },
                    { hotelName: 'Boutique Hotel Central', fileName: 'recommendation-3.pdf' }
                  ]
                }
              ].map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{application.therapistName}</h4>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                      </p>
                      
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        {application.letters.map((letter, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-sm">{letter.hotelName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{letter.fileName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button 
                      onClick={() => {
                        console.log('✅ [SAFE PASS APPROVED] Approving application for:', application.therapistName);
                        alert(`Approved Safe Pass for ${application.therapistName}`);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Application
                    </button>
                    <button 
                      onClick={() => {
                        const reason = prompt('Enter rejection reason:');
                        if (reason) {
                          console.log('❌ Safe Pass rejected for:', application.therapistName, 'Reason:', reason);
                          alert(`Rejected application: ${reason}`);
                        }
                      }}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Reject Application
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      View Therapist Profile
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Empty state */}
              <div className="p-8 text-center text-gray-500">
                <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No pending Safe Pass applications</p>
              </div>
            </div>
          </div>
          
          {/* Approved Applications */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Recently Approved</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {[
                {
                  id: '3',
                  therapistName: 'Maria Santos',
                  approvedAt: '2024-01-12',
                  status: 'active',
                  safePassId: 'SP-TH003-2024'
                },
                {
                  id: '4',
                  therapistName: 'Ahmad Rahman',
                  approvedAt: '2024-01-10',
                  status: 'approved',
                  safePassId: 'SP-TH004-2024'
                }
              ].map((approved) => (
                <div key={approved.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{approved.therapistName}</h4>
                        <p className="text-sm text-gray-600">Safe Pass ID: {approved.safePassId}</p>
                        <p className="text-xs text-gray-500">Approved on {new Date(approved.approvedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        approved.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {approved.status === 'active' ? '✅ Active' : '💳 Payment Pending'}
                      </span>
                      <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAchievementManager;