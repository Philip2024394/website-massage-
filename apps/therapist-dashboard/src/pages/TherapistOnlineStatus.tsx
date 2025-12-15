// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Power, Clock, CheckCircle, XCircle, Crown } from "lucide-react";
import { therapistService } from "../../../../lib/appwriteService";
import { AvailabilityStatus } from "../../../../types";
import { devLog, devWarn } from "../../../../utils/devMode";

interface TherapistOnlineStatusProps {
  therapist: any;
  onBack: () => void;
}

type OnlineStatus = 'available' | 'busy' | 'offline' | 'active';

const TherapistOnlineStatus: React.FC<TherapistOnlineStatusProps> = ({ therapist, onBack }) => {
  const [status, setStatus] = useState<OnlineStatus>('offline');
  const [autoOfflineTime, setAutoOfflineTime] = useState<string>('22:00');
  const [saving, setSaving] = useState(false);
  const [isPremium] = useState(therapist?.membershipTier === 'premium' || false);

  useEffect(() => {
    devLog('🔍 TherapistOnlineStatus loaded with therapist:', {
      id: therapist?.$id,
      name: therapist?.name,
      email: therapist?.email,
      currentStatus: therapist?.status,
      currentAvailability: therapist?.availability,
      isLive: therapist?.isLive,
      autoOfflineTime: therapist?.autoOfflineTime,
      fullTherapistObject: therapist
    });
    
    // Load current status from therapist data (handle both formats for backward compatibility)
    const savedStatus = therapist?.status || therapist?.availability || therapist?.availabilityStatus || 'Offline';
    devLog('🔍 Status loading debug:', {
      savedStatus,
      therapistStatus: therapist?.status,
      therapistAvailability: therapist?.availability,
      therapistIsLive: therapist?.isLive
    });
    
    // Map Appwrite status values to UI status
    let uiStatus: OnlineStatus = 'offline';
    const statusStr = String(savedStatus).toLowerCase();
    if (statusStr === 'available' || statusStr === 'active') {
      uiStatus = 'available';
    } else if (statusStr === 'busy') {
      uiStatus = 'busy';
    } else if (statusStr === 'offline' || statusStr === 'null' || statusStr === 'undefined') {
      uiStatus = 'offline';
    } else {
      // Default for therapists who are isLive=true but have no explicit status
      uiStatus = therapist?.isLive === true ? 'available' : 'offline';
    }
    
    // Check localStorage backup if Appwrite status is outdated
    const backupStatus = localStorage.getItem(`therapist_status_${therapist?.$id}`);
    if (backupStatus && (uiStatus === 'offline' || !therapist?.status)) {
      const backupUIStatus = backupStatus.toLowerCase();
      if (backupUIStatus === 'available' || backupUIStatus === 'busy') {
        devLog('💾 Using backup status from localStorage:', backupStatus);
        uiStatus = backupUIStatus as OnlineStatus;
      }
    }
    
    devLog('⚙️ Setting UI status to:', uiStatus, 'from savedStatus:', savedStatus);
    setStatus(uiStatus);
    setAutoOfflineTime(therapist?.autoOfflineTime || '22:00');
  }, [therapist]);

  // Verify status persistence by refetching on mount
  useEffect(() => {
    const verifyStatusPersistence = async () => {
      if (!therapist?.$id) return;
      
      try {
        devLog('🔄 Verifying status persistence from Appwrite...');
        const freshData = await therapistService.getById(therapist.$id);
        devLog('📊 Fresh data from Appwrite:', {
          status: freshData?.status,
          availability: freshData?.availability,
          isLive: freshData?.isLive,
          isOnline: freshData?.isOnline
        });
        
        // Update UI if there's a discrepancy
        const freshStatus = freshData?.status || freshData?.availability || 'Offline';
        const freshUIStatus = freshStatus.toLowerCase();
        if (freshUIStatus !== status && (freshUIStatus === 'available' || freshUIStatus === 'busy' || freshUIStatus === 'offline')) {
          devLog('⚠️ Status discrepancy detected, updating UI:', freshUIStatus);
          setStatus(freshUIStatus as OnlineStatus);
        }
        
        // Auto-initialize status for therapists with isLive=true but no status set
        if ((!freshData?.status && !freshData?.availability) && freshData?.isLive === true) {
          devLog('🆕 Auto-initializing status to Available for active therapist');
          await handleStatusChange('available');
        }
      } catch (error) {
        console.error('❌ Failed to verify status persistence:', error);
      }
    };

    verifyStatusPersistence();
  }, []); // Run once on mount

  // Auto-offline timer - check every minute if it's time to go offline
  useEffect(() => {
    const checkAutoOffline = () => {
      if (!autoOfflineTime || status === 'offline') return;
      
      const now = new Date();
      const [hours, minutes] = autoOfflineTime.split(':').map(Number);
      const targetTime = new Date();
      targetTime.setHours(hours, minutes, 0, 0);
      
      // Check if current time matches or passed the auto-offline time
      if (now >= targetTime) {
        const lastCheck = localStorage.getItem('lastAutoOfflineCheck');
        const today = now.toDateString();
        
        // Only auto-offline once per day at the specified time
        if (lastCheck !== today) {
          devLog('⏰ Auto-offline time reached:', autoOfflineTime);
          handleStatusChange('offline');
          localStorage.setItem('lastAutoOfflineCheck', today);
        }
      }
    };
    
    // Check immediately on mount
    checkAutoOffline();
    
    // Then check every minute
    const interval = setInterval(checkAutoOffline, 60000);
    
    return () => clearInterval(interval);
  }, [autoOfflineTime, status]);

  const handleStatusChange = async (newStatus: OnlineStatus) => {
    setSaving(true);
    try {
      devLog('💾 Saving status to Appwrite:', {
        newStatus,
        therapistId: therapist.$id,
        therapistEmail: therapist.email,
        therapistName: therapist.name
      });
      
      // Update status in Appwrite (using proper AvailabilityStatus enum values)
      const properStatusValue = newStatus === 'available' ? AvailabilityStatus.Available :
                               newStatus === 'busy' ? AvailabilityStatus.Busy :
                               newStatus === 'active' ? AvailabilityStatus.Available : // Treat 'active' as Available
                               AvailabilityStatus.Offline;
      
      const updateData = {
        status: properStatusValue,
        availability: properStatusValue, // Use same proper enum value
        isLive: newStatus === 'available',
        isOnline: newStatus !== 'offline',
        // Clear conflicting timestamp fields based on new status
        busyUntil: newStatus === 'available' ? null : undefined,
        bookedUntil: newStatus === 'available' ? null : undefined,
        busy: newStatus === 'available' ? '' : (newStatus === 'busy' ? new Date().toISOString() : ''),
        available: newStatus === 'available' ? new Date().toISOString() : ''
      };
      
      devLog('📤 Update data:', updateData);
      
      const result = await therapistService.update(therapist.$id, updateData);
      
      devLog('✅ Appwrite update result:', result);
      
      // Update local state immediately for UI feedback
      setStatus(newStatus);
      
      // Verify the save by refetching from Appwrite
      const updatedTherapist = await therapistService.getById(therapist.$id);
      devLog('🔄 Verified saved status from Appwrite:', {
        status: updatedTherapist.status,
        availability: updatedTherapist.availability,
        isLive: updatedTherapist.isLive
      });
      
      // Show toast notification
      const statusMessages = {
        available: '✅ You are now AVAILABLE for bookings',
        active: '✅ You are now ACTIVE and ready for bookings',
        busy: '🟡 Status set to BUSY - customers can still view your profile',
        offline: '⚫ You are now OFFLINE - profile hidden from search'
      };
      
      devLog('✅ Status saved:', statusMessages[newStatus]);
      alert(statusMessages[newStatus]);
      
      // 🔄 Trigger global data refresh for HomePage to update therapist cards
      devLog('🔄 Triggering global data refresh after status update...');
      window.dispatchEvent(new CustomEvent('refreshTherapistData', {
        detail: { 
          source: 'therapist-dashboard-status-update',
          therapistId: therapist.$id,
          newStatus: properStatusValue,
          timestamp: new Date().toISOString()
        }
      }));
      
      // Store status in localStorage as backup
      localStorage.setItem(`therapist_status_${therapist.$id}`, properStatusValue);
      devLog('💾 Status backed up to localStorage');
      
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      
      // Revert UI status on error
      const revertStatus = status === 'available' ? 'offline' : 
                          status === 'busy' ? 'available' : 
                          status === 'offline' ? 'available' : 'offline';
      setStatus(revertStatus);
      alert('❌ Failed to update status. Please try again.');
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type
      });
      alert(`Failed to update status: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoOfflineTimeChange = async (time: string) => {
    setAutoOfflineTime(time);
    try {
      devLog('💾 Saving auto-offline time to Appwrite:', time);
      
      // Save to Appwrite
      const result = await therapistService.update(therapist.$id, {
        autoOfflineTime: time
      });
      
      devLog('✅ Auto-offline time saved:', result.autoOfflineTime);
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
        {/* Alert if not live */}
        {!therapist?.isLive && status === 'offline' && (
          <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">Your Profile is NOT Visible to Customers!</h3>
                <p className="text-red-800 mt-1">
                  Set your status to <strong>"Available"</strong> below to appear on the live site and start receiving bookings.
                </p>
              </div>
            </div>
          </div>
        )}
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
          <div className="flex items-center gap-4 mb-4">
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
          
          {/* Timer Status Indicator */}
          {status !== 'offline' && autoOfflineTime && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                ⏰ <strong>Timer Active:</strong> Will automatically go offline at {autoOfflineTime} ({new Date().toLocaleDateString()})
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Current time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </p>
            </div>
          )}
          
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
