// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Power, Clock, CheckCircle, XCircle, Crown } from 'lucide-react';
import { therapistService } from '@shared/appwriteService';

interface TherapistOnlineStatusProps {
  therapist: any;
  onBack: () => void;
}

type OnlineStatus = 'available' | 'busy' | 'offline';

const TherapistOnlineStatus: React.FC<TherapistOnlineStatusProps> = ({ therapist, onBack }) => {
  const [status, setStatus] = useState<OnlineStatus>('offline');
  const [autoOfflineTime, setAutoOfflineTime] = useState<string>('22:00');
  const [saving, setSaving] = useState(false);
  const [isPremium] = useState(therapist?.membershipTier === 'premium' || false);

  useEffect(() => {
    // Load current status from therapist data
    setStatus((therapist?.availabilityStatus as OnlineStatus) || 'offline');
    setAutoOfflineTime(therapist?.autoOfflineTime || '22:00');
  }, [therapist]);

  const handleStatusChange = async (newStatus: OnlineStatus) => {
    setSaving(true);
    try {
      console.log('💾 Saving status to Appwrite:', newStatus);
      
      // Update status in Appwrite
      await therapistService.update(therapist.$id, {
        availabilityStatus: newStatus,
        isLive: newStatus === 'available'
      });
      
      setStatus(newStatus);
      
      // Show toast notification
      const statusMessages = {
        available: '✅ You are now AVAILABLE for bookings',
        busy: '🟡 Status set to BUSY - customers can still view your profile',
        offline: '⚫ You are now OFFLINE - profile hidden from search'
      };
      
      console.log('✅ Status saved:', statusMessages[newStatus]);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoOfflineTimeChange = async (time: string) => {
    setAutoOfflineTime(time);
    try {
      console.log('💾 Saving auto-offline time to Appwrite:', time);
      
      // Save to Appwrite
      await therapistService.update(therapist.$id, {
        autoOfflineTime: time
      });
      
      console.log('✅ Auto-offline time saved');
    } catch (error) {
      console.error('❌ Failed to save auto-offline time:', error);
      alert('Failed to save auto-offline time. Please try again.');
    }
  };

  const getStatusColor = (statusType: OnlineStatus) => {
    switch (statusType) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  const getStatusIcon = (statusType: OnlineStatus) => {
    switch (statusType) {
      case 'available': return <CheckCircle className="w-8 h-8" />;
      case 'busy': return <Clock className="w-8 h-8" />;
      case 'offline': return <XCircle className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      {/* Header */}
      <div className="w-full bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Power className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Online Status</h1>
              <p className="text-xs text-gray-500">Manage your availability</p>
            </div>
          </div>
          {isPremium && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">PREMIUM</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Current Status Display */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Current Status</h2>
            <div className={`${getStatusColor(status)} text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-md`}>
              {getStatusIcon(status)}
              <span className="font-bold uppercase text-sm">{status}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available */}
            <button
              onClick={() => handleStatusChange('available')}
              disabled={saving || status === 'available'}
              className={`p-6 rounded-xl border-2 transition-all ${
                status === 'available'
                  ? 'bg-green-50 border-green-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-green-400 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  status === 'available' ? 'bg-green-500' : 'bg-green-100'
                }`}>
                  <CheckCircle className={`w-8 h-8 ${status === 'available' ? 'text-white' : 'text-green-600'}`} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-800">Available</h3>
                  <p className="text-xs text-gray-600 mt-1">Ready for bookings</p>
                </div>
              </div>
            </button>

            {/* Busy */}
            <button
              onClick={() => handleStatusChange('busy')}
              disabled={saving || status === 'busy'}
              className={`p-6 rounded-xl border-2 transition-all ${
                status === 'busy'
                  ? 'bg-yellow-50 border-yellow-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-yellow-400 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  status === 'busy' ? 'bg-yellow-500' : 'bg-yellow-100'
                }`}>
                  <Clock className={`w-8 h-8 ${status === 'busy' ? 'text-white' : 'text-yellow-600'}`} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-800">Busy</h3>
                  <p className="text-xs text-gray-600 mt-1">Profile visible only</p>
                </div>
              </div>
            </button>

            {/* Offline */}
            <button
              onClick={() => handleStatusChange('offline')}
              disabled={saving || status === 'offline'}
              className={`p-6 rounded-xl border-2 transition-all ${
                status === 'offline'
                  ? 'bg-gray-50 border-gray-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  status === 'offline' ? 'bg-gray-500' : 'bg-gray-100'
                }`}>
                  <XCircle className={`w-8 h-8 ${status === 'offline' ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-800">Offline</h3>
                  <p className="text-xs text-gray-600 mt-1">Hidden from search</p>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Status Guide</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Available:</strong> Customers can see and book you instantly</li>
              <li><strong>Busy:</strong> Profile visible but booking disabled temporarily</li>
              <li><strong>Offline:</strong> Profile completely hidden from customer search</li>
            </ul>
          </div>
        </div>

        {/* Auto-Offline Scheduler */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Auto-Offline Timer</h2>
            <Clock className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Automatically switch to offline status at a specific time each day
          </p>
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Set Time:</label>
            <input
              type="time"
              value={autoOfflineTime}
              onChange={(e) => handleAutoOfflineTimeChange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={() => handleAutoOfflineTimeChange(autoOfflineTime)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-semibold transition-colors"
            >
              Save
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Example: Set to 22:00 to automatically go offline at 10 PM every night
          </p>
        </div>

        {/* Premium Feature Upsell */}
        {!isPremium && (
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Upgrade to Premium</h3>
                <p className="text-sm text-gray-600">200k IDR/month</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Best times analytics - know when to be available</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Verified badge on your profile</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Set discount badges to attract more customers</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Priority placement in search results</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all">
              Upgrade Now - 200k/month
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TherapistOnlineStatus;
