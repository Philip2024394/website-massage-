/**
 * MassageTypeSelector Component
 * 
 * Purpose: Allow users to select massage type (male/female/children) for auto avatar assignment
 * Features: Race detection, avatar preview, smooth selection flow
 */

import React, { useState, useEffect } from 'react';
import { User, Users, Baby, Globe } from 'lucide-react';
import { getAutoAssignedAvatar, getAvatarsByType, type MassageSelection, type AvatarOption } from '../../constants/chatAvatars';

interface MassageTypeSelectorProps {
  onSelectionComplete: (selection: MassageSelection, avatar: AvatarOption) => void;
  customerName?: string;
  className?: string;
}

export const MassageTypeSelector: React.FC<MassageTypeSelectorProps> = ({
  onSelectionComplete,
  customerName,
  className = ''
}) => {
  const [selectedType, setSelectedType] = useState<'male' | 'female' | 'children' | null>(null);
  const [selectedRace, setSelectedRace] = useState<'asian' | 'caucasian' | 'african' | 'mixed'>('mixed');
  const [previewAvatar, setPreviewAvatar] = useState<AvatarOption | null>(null);
  const [showRaceSelector, setShowRaceSelector] = useState(false);

  // Auto-detect race based on location/browser language (optional)
  useEffect(() => {
    const detectUserRace = async () => {
      try {
        // Simple heuristic based on timezone/language
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const language = navigator.language.toLowerCase();
        
        if (timezone.includes('Asia') || language.includes('zh') || language.includes('ja') || language.includes('ko') || language.includes('id')) {
          setSelectedRace('asian');
        } else if (timezone.includes('Africa') || language.includes('af')) {
          setSelectedRace('african');
        } else if (timezone.includes('Europe') || timezone.includes('America')) {
          setSelectedRace('caucasian');
        }
      } catch (error) {
        // Default to mixed if detection fails
        setSelectedRace('mixed');
      }
    };

    detectUserRace();
  }, []);

  // Update preview avatar when type or race changes
  useEffect(() => {
    if (selectedType) {
      const selection: MassageSelection = {
        massageFor: selectedType,
        userRace: selectedRace,
        customerName
      };
      
      const avatar = getAutoAssignedAvatar(selection);
      setPreviewAvatar(avatar);
    }
  }, [selectedType, selectedRace, customerName]);

  const handleTypeSelection = (type: 'male' | 'female' | 'children') => {
    setSelectedType(type);
    setShowRaceSelector(true);
  };

  const handleConfirmSelection = () => {
    if (selectedType && previewAvatar) {
      const selection: MassageSelection = {
        massageFor: selectedType,
        userRace: selectedRace,
        customerName
      };
      
      onSelectionComplete(selection, previewAvatar);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Massage is for...</h3>
        <p className="text-sm text-gray-600">This helps us assign you a matching avatar</p>
      </div>

      {/* Type Selection */}
      {!selectedType && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => handleTypeSelection('male')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <User className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">Male</span>
          </button>
          
          <button
            onClick={() => handleTypeSelection('female')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all group"
          >
            <User className="w-8 h-8 text-pink-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-pink-700">Female</span>
          </button>
          
          <button
            onClick={() => handleTypeSelection('children')}
            className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <Baby className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-semibold text-gray-700 group-hover:text-green-700">Child</span>
          </button>
        </div>
      )}

      {/* Race Selection (Optional) */}
      {showRaceSelector && !previewAvatar && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-4 h-4 text-gray-500" />
            <label className="text-sm font-medium text-gray-700">Select your background (optional):</label>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'asian', label: 'Asian' },
              { id: 'caucasian', label: 'Caucasian' },
              { id: 'african', label: 'African' },
              { id: 'mixed', label: 'Mixed/Other' }
            ].map(race => (
              <button
                key={race.id}
                onClick={() => setSelectedRace(race.id as any)}
                className={`p-2 text-xs rounded-lg border-2 transition-all ${
                  selectedRace === race.id 
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {race.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Avatar Preview */}
      {previewAvatar && (
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-4 border-white shadow-lg">
              <img 
                src={previewAvatar.imageUrl} 
                alt={previewAvatar.label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.jpg';
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mb-1">Your chat avatar:</p>
            <p className="text-xs text-gray-500 font-medium">{previewAvatar.label}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedType && (
        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedType(null);
              setPreviewAvatar(null);
              setShowRaceSelector(false);
            }}
            className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Change
          </button>
          
          <button
            onClick={handleConfirmSelection}
            className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-semibold shadow-lg hover:shadow-xl"
            disabled={!previewAvatar}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};