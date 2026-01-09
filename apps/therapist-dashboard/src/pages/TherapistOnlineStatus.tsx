// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Power, Clock, CheckCircle, XCircle, Crown, Download, Smartphone, Badge, AlertTriangle } from "lucide-react";
import { therapistService } from "../../../../lib/appwriteService";
import { AvailabilityStatus } from "../../../../types";
import { devLog, devWarn } from "../../../../utils/devMode";
import TherapistLayout from '../components/TherapistLayout';
import { EnhancedNotificationService } from "../../../../lib/enhancedNotificationService";
import { PWAInstallationEnforcer } from "../../../../lib/pwaInstallationEnforcer";
import { useLanguage } from '../../../../hooks/useLanguage';
import { useTranslations } from '../../../../lib/useTranslations';

// PWA Install interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{outcome: 'accepted' | 'dismissed', platform: string}>;
}

interface TherapistOnlineStatusProps {
  therapist: any;
  onBack: () => void;
  onRefresh?: () => Promise<void>;
  onNavigate?: (page: string) => void;
  language?: 'en' | 'id';
}

type OnlineStatus = 'available' | 'busy' | 'offline' | 'active';

const TherapistOnlineStatus: React.FC<TherapistOnlineStatusProps> = ({ therapist, onBack, onRefresh, onNavigate, language: propLanguage = 'id' }) => {
  // Get language from context (takes priority over prop)
  const { language: contextLanguage } = useLanguage();
  const language = contextLanguage || propLanguage;
  
  // Get translations
  const { dict, loading } = useTranslations(language);
  
  // Safety check for translations loading
  if (loading || !dict || !dict.therapistDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
          <p className="text-gray-600">Loading translations...</p>
        </div>
      </div>
    );
  }
  
  // Safety check - redirect if no therapist data
  if (!therapist) {
    console.error('❌ No therapist data provided to TherapistOnlineStatus');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{dict?.therapistDashboard?.loading || 'Loading therapist data...'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            {dict?.therapistDashboard?.back || 'Go Back'}
          </button>
        </div>
      </div>
    );
  }
  
  const [status, setStatus] = useState<OnlineStatus>(() => {
    // Initialize status from therapist prop on mount
    const savedStatus = therapist?.status || therapist?.availability || 'Offline';
    const statusStr = String(savedStatus).toLowerCase();
    if (statusStr === 'available' || statusStr === 'active') {
      return 'available';
    } else if (statusStr === 'busy') {
      return 'busy';
    }
    return 'offline';
  });
  const [autoOfflineTime, setAutoOfflineTime] = useState<string>('22:00');
  const [saving, setSaving] = useState(false);
  // All therapists have access to all features - no premium restrictions
  const isPremium = true;
  const [onlineHoursThisMonth, setOnlineHoursThisMonth] = useState<number>(0);
  const [busyStartTime, setBusyStartTime] = useState<string | null>(therapist?.busyStartTime || null);
  const [busyTimeRemaining, setBusyTimeRemaining] = useState<number | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  
  // Discount badge states
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [discountDuration, setDiscountDuration] = useState<number>(0);
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  
  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [pwaEnforcementActive, setPwaEnforcementActive] = useState(false);
  const [forceReinstall, setForceReinstall] = useState(false);

  // Load initial data once on mount
  useEffect(() => {
    if (!therapist?.$id) return;
    
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
    
    // Initialize Enhanced Notification System
    EnhancedNotificationService.initialize();
    
    // Initialize PWA Installation Enforcement
    const pwaStatus = PWAInstallationEnforcer.checkInstallationStatus();
    setPwaEnforcementActive(!pwaStatus.isInstalled && !pwaStatus.canBypass);
    setIsAppInstalled(pwaStatus.isInstalled);
    
    // Start PWA monitoring for critical notifications
    PWAInstallationEnforcer.startMonitoring();
    
    // Load discount settings
    if (therapist?.discountPercentage) setDiscountPercentage(therapist.discountPercentage);
    if (therapist?.discountDuration) setDiscountDuration(therapist.discountDuration);
    if (therapist?.isDiscountActive !== undefined) setIsDiscountActive(therapist.isDiscountActive);
    
    // Load online hours this month
    if (therapist?.onlineHoursThisMonth !== undefined) {
      setOnlineHoursThisMonth(therapist.onlineHoursThisMonth);
    }
    
    // Load auto-offline time
    setAutoOfflineTime(therapist?.autoOfflineTime || '22:00');
  }, []); // Only run once on mount

  // REMOVED: Sync effect that was causing button jumping
  // The status is loaded once on mount and updated locally when user clicks buttons
  // We don't need to sync with prop updates since we save directly to Appwrite
  
  // Load fresh status from Appwrite on mount (only once)
  useEffect(() => {
    const loadFreshStatus = async () => {
      if (!therapist?.$id || isLoadingStatus) return;
      
      setIsLoadingStatus(true);
      try {
        devLog('🔄 Loading fresh status from Appwrite...');
        const freshData = await therapistService.getById(therapist.$id);
        devLog('📊 Fresh data from Appwrite:', {
          status: freshData?.status,
          availability: freshData?.availability,
          isLive: freshData?.isLive,
          isOnline: freshData?.isOnline
        });
        
        // Update UI with fresh status
        const freshStatus = freshData?.status || freshData?.availability || 'Offline';
        const freshUIStatus = String(freshStatus).toLowerCase();
        if (freshUIStatus === 'available' || freshUIStatus === 'active') {
          devLog('✅ Setting status from Appwrite: available');
          setStatus('available');
        } else if (freshUIStatus === 'busy') {
          devLog('✅ Setting status from Appwrite: busy');
          setStatus('busy');
        } else {
          devLog('✅ Setting status from Appwrite: offline');
          setStatus('offline');
        }
      } catch (error) {
        console.error('❌ Failed to load fresh status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    loadFreshStatus();
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

  // PWA Install functionality with enhanced enforcement
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      (window as any).deferredPrompt = e; // Store for PWAInstallationEnforcer
    };
    
    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setPwaEnforcementActive(false);
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-completed', 'true');
      setDeferredPrompt(null);
      console.log('✅ PWA installed successfully');
    };
    
    const handleRequestInstall = () => {
      handleInstallApp();
    };
    
    // Check if app is already installed
    const checkIfInstalled = () => {
      const pwaStatus = PWAInstallationEnforcer.checkInstallationStatus();
      setIsAppInstalled(pwaStatus.isInstalled);
      setPwaEnforcementActive(!pwaStatus.isInstalled && !pwaStatus.canBypass);
      
      // Detect iOS device
      const isiOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(isiOSDevice);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('request-pwa-install', handleRequestInstall);
    checkIfInstalled();
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('request-pwa-install', handleRequestInstall);
    };
  }, []);

  // Track online hours - update every minute when online
  useEffect(() => {
    if (!therapist?.$id) return;
    
    const updateOnlineHours = async () => {
      // Only count time when status is available or busy
      if (status !== 'available' && status !== 'busy') return;
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Get last update time from localStorage
      const lastUpdateKey = `onlineHours_${therapist.$id}_${currentYear}_${currentMonth}`;
      const lastUpdateStr = localStorage.getItem(lastUpdateKey);
      const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr) : now;
      
      // Calculate hours since last update (in fractions of an hour)
      const hoursSinceLastUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      
      // Only update if we're in the same month
      if (lastUpdate.getMonth() === currentMonth && lastUpdate.getFullYear() === currentYear) {
        const newTotalHours = onlineHoursThisMonth + hoursSinceLastUpdate;
        setOnlineHoursThisMonth(newTotalHours);
        
        // Update in database every 5 minutes to reduce writes
        const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
        if (minutesSinceUpdate >= 5) {
          try {
            await therapistService.update(therapist.$id, {
              onlineHoursThisMonth: newTotalHours,
              lastOnlineHoursUpdate: now.toISOString()
            });
            localStorage.setItem(lastUpdateKey, now.toISOString());
            devLog('⏱️ Updated online hours:', newTotalHours.toFixed(2));
          } catch (error) {
            console.error('Failed to update online hours:', error);
          }
        }
      } else {
        // New month - reset counter
        setOnlineHoursThisMonth(0);
        localStorage.setItem(lastUpdateKey, now.toISOString());
        try {
          await therapistService.update(therapist.$id, {
            onlineHoursThisMonth: 0,
            lastOnlineHoursUpdate: now.toISOString()
          });
        } catch (error) {
          console.error('Failed to reset online hours:', error);
        }
      }
    };
    
    // Update immediately on mount if online
    if (status === 'available' || status === 'busy') {
      updateOnlineHours();
    }
    
    // Then update every minute while online
    const interval = setInterval(() => {
      if (status === 'available' || status === 'busy') {
        updateOnlineHours();
      }
    }, 60000); // Every 1 minute
    
    return () => clearInterval(interval);
  }, [therapist?.$id, status, onlineHoursThisMonth]);

  // Monitor busy time limit for non-premium accounts (3 hours max)
  useEffect(() => {
    if (!therapist?.$id || isPremium || status !== 'busy' || !busyStartTime) return;
    
    const checkBusyTimeLimit = async () => {
      const startTime = new Date(busyStartTime);
      const now = new Date();
      const minutesElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60);
      const hoursElapsed = minutesElapsed / 60;
      const hoursRemaining = Math.max(0, 3 - hoursElapsed);
      
      // Round up to nearest hour for display (so it shows 3h, 2h, 1h)
      const displayHours = Math.ceil(hoursRemaining);
      setBusyTimeRemaining(displayHours);
      
      // If 3 hours exceeded, auto-reset to offline
      if (hoursElapsed >= 3) {
        devLog('⏰ Pro account busy time limit (3h) exceeded - auto-resetting to offline');
        await handleStatusChange('offline');
        alert('⚠️ Your Busy status has expired (3 hour limit for Pro accounts). Status set to Offline. Upgrade to Premium for unlimited Busy time!');
        setBusyStartTime(null);
        setBusyTimeRemaining(null);
      }
    };
    
    // Check immediately
    checkBusyTimeLimit();
    
    // Then check every minute
    const interval = setInterval(checkBusyTimeLimit, 60000);
    
    return () => clearInterval(interval);
  }, [therapist?.$id, isPremium, status, busyStartTime]);

  const handleStatusChange = async (newStatus: OnlineStatus) => {
    // Prevent multiple rapid clicks
    if (saving || isLoadingStatus) return;
    
    setSaving(true);
    try {
      devLog('💾 Saving status to Appwrite:', {
        newStatus,
        therapistId: therapist.$id,
        therapistEmail: therapist.email,
        therapistName: therapist.name
      });
      
      // Update local state immediately for instant UI feedback
      setStatus(newStatus);
      
      // Update status in Appwrite (using proper AvailabilityStatus enum values)
      const properStatusValue = newStatus === 'available' ? AvailabilityStatus.Available :
                               newStatus === 'busy' ? AvailabilityStatus.Busy :
                               newStatus === 'active' ? AvailabilityStatus.Available : // Treat 'active' as Available
                               AvailabilityStatus.Offline;
      
      // Track busy start time for non-premium accounts
      const now = new Date().toISOString();
      const busyStartTimeValue = newStatus === 'busy' && !isPremium ? now : null;
      
      const updateData = {
        status: properStatusValue,
        availability: properStatusValue, // Use same proper enum value
        isLive: newStatus !== 'offline', // Show Available and Busy on home page, hide only Offline
        isOnline: newStatus !== 'offline',
        // Track busy start time for 3-hour limit on Pro accounts
        busyStartTime: busyStartTimeValue,
        // Clear conflicting timestamp fields based on new status
        busyUntil: newStatus === 'available' ? null : undefined,
        bookedUntil: newStatus === 'available' ? null : undefined,
        busy: newStatus === 'available' ? '' : (newStatus === 'busy' ? now : ''),
        available: newStatus === 'available' ? now : ''
      };
      
      // Update local state for busy timer
      if (newStatus === 'busy' && !isPremium) {
        setBusyStartTime(now);
        setBusyTimeRemaining(3);
      } else if (newStatus !== 'busy') {
        setBusyStartTime(null);
        setBusyTimeRemaining(null);
      }
      
      devLog('📤 Update data:', updateData);
      
      const result = await therapistService.update(therapist.$id, updateData);
      
      devLog('✅ Appwrite update result:', result);
      
      // Verify the save by refetching from Appwrite
      const updatedTherapist = await therapistService.getById(therapist.$id);
      devLog('🔄 Verified saved status from Appwrite:', {
        status: updatedTherapist.status,
        availability: updatedTherapist.availability,
        isLive: updatedTherapist.isLive
      });
      
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
      
      // DON'T refresh parent - it causes button jumping when clicking OK
      // The status is already saved to Appwrite and displayed correctly
      // Parent will refresh on next page load if needed
      
      // Show toast notification
      const statusMessages = {
        available: language === 'id' ? '✅ Anda sekarang TERSEDIA untuk booking' : '✅ You are now AVAILABLE for bookings',
        active: language === 'id' ? '✅ Anda sekarang AKTIF dan siap untuk booking' : '✅ You are now ACTIVE and ready for bookings',
        busy: language === 'id' ? '🟡 Status diset ke SIBUK - pelanggan masih bisa melihat profil Anda' : '🟡 Status set to BUSY - customers can still view your profile',
        offline: language === 'id' ? '⚫ Anda sekarang OFFLINE - profil tersembunyi dari pencarian' : '⚫ You are now OFFLINE - profile hidden from search'
      };
      
      devLog('✅ Status saved:', statusMessages[newStatus]);
      alert(statusMessages[newStatus]);
      
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      
      // Revert to database status on error
      try {
        const freshData = await therapistService.getById(therapist.$id);
        const revertStatus = String(freshData?.status || 'Offline').toLowerCase();
        if (revertStatus === 'available' || revertStatus === 'busy' || revertStatus === 'offline') {
          setStatus(revertStatus as OnlineStatus);
          devLog('🔄 Status reverted to database value:', revertStatus);
        }
      } catch (revertError) {
        console.error('❌ Failed to revert status:', revertError);
      }
      
      // Revert UI status on error
      const revertStatus = status === 'available' ? 'offline' : 
                          status === 'busy' ? 'available' : 
                          status === 'offline' ? 'available' : 'offline';
      setStatus(revertStatus);
      alert(language === 'id' ? '❌ Gagal memperbarui status. Silakan coba lagi.' : '❌ Failed to update status. Please try again.');
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
      alert('⏰ Auto-offline timer set for ' + time);
    } catch (error) {
      console.error('❌ Failed to save auto-offline time:', error);
      alert('Failed to save auto-offline time. Please try again.');
    }
  };

  const handleCancelTimer = async () => {
    try {
      devLog('🗑️ Cancelling auto-offline timer...');
      
      // Clear timer in Appwrite
      await therapistService.update(therapist.$id, {
        autoOfflineTime: null
      });
      
      setAutoOfflineTime('');
      devLog('✅ Auto-offline timer cancelled');
      alert('✅ Auto-offline timer cancelled');
    } catch (error) {
      console.error('❌ Failed to cancel timer:', error);
      alert('Failed to cancel timer. Please try again.');
    }
  };

  const handleSaveDiscount = async () => {
    if (!isPremium) {
      alert('⭐ Discount badges are a Premium feature. Upgrade to Premium to unlock!');
      return;
    }
    
    try {
      devLog('💾 Saving discount badge settings...');
      
      const discountEndTime = discountDuration > 0 
        ? new Date(Date.now() + discountDuration * 60 * 60 * 1000).toISOString()
        : null;
      
      await therapistService.update(therapist.$id, {
        discountPercentage,
        discountDuration,
        discountEndTime,
        isDiscountActive: true
      });
      
      setIsDiscountActive(true);
      devLog('✅ Discount badge activated');
      alert(`✅ ${discountPercentage}% discount badge activated for ${discountDuration} hours!`);
      
      // Don't refresh here - it causes button jumping when clicking OK on alert
    } catch (error) {
      console.error('❌ Failed to save discount:', error);
      alert('Failed to save discount. Please try again.');
    }
  };

  const handleCancelDiscount = async () => {
    try {
      devLog('🗑️ Cancelling discount badge...');
      
      await therapistService.update(therapist.$id, {
        discountPercentage: 0,
        discountDuration: 0,
        discountEndTime: null,
        isDiscountActive: false
      });
      
      setDiscountPercentage(0);
      setDiscountDuration(0);
      setIsDiscountActive(false);
      devLog('✅ Discount badge cancelled');
      alert('✅ Discount badge removed');
      
      // Don't refresh here - it causes button jumping when clicking OK on alert
    } catch (error) {
      console.error('❌ Failed to cancel discount:', error);
      alert('Failed to cancel discount. Please try again.');
    }
  };

  const handleTestNotifications = async () => {
    try {
      // Request permission first
      const hasPermission = await EnhancedNotificationService.requestPermission();
      
      if (hasPermission) {
        // Import and test ULTIMATE notification system
        const { UltimateNotificationUtils } = await import('../../../../lib/ultimateNotificationUtils');
        await UltimateNotificationUtils.testUltimateNotification();
        
        // Also test the escalating notifications
        await EnhancedNotificationService.testEnhancedNotifications();
        
        alert(
          '🚀 ULTIMATE NOTIFICATION TEST STARTED!\n\n' +
          '✅ Testing:\n' +
          '  • Maximum vibration (7 seconds)\n' +
          '  • Wake lock (screen stays on)\n' +
          '  • Badge counter update\n' +
          '  • 3 escalating notifications over 2 minutes\n\n' +
          '🔊 You should feel STRONG vibrations NOW!\n' +
          '👀 Watch for notifications to appear.\n\n' +
          'If phone is in standby/locked:\n' +
          '  • Notification WILL show on lock screen\n' +
          '  • Phone WILL vibrate strongly\n' +
          '  • System default sound will play'
        );
      } else {
        alert('⚠️ Notification permission required!\n\nPlease allow notifications in your browser settings and try again.');
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
      alert('❌ Failed to test notifications. Please ensure the app is properly installed.');
    }
  };

  const handleInstallApp = async () => {
    // If forcing reinstall, clear all installation markers first
    if (forceReinstall) {
      localStorage.removeItem('pwa-installed');
      localStorage.removeItem('pwa-install-completed');
      localStorage.removeItem('pwa-added-to-homescreen');
      console.log('🗑️ Cleared all PWA installation markers for forced reinstall');
    }
    
    if (isAppInstalled && !forceReinstall) {
      // Show force reinstall option
      const shouldForceReinstall = confirm(
        '📱 APP ALREADY DETECTED\n\n' +
        'If you\'re having notification issues:\n' +
        '• Click OK to FORCE REINSTALL\n' +
        '• This ensures you have the latest notification sounds\n' +
        '• Cancel if notifications are working fine'
      );
      
      if (shouldForceReinstall) {
        setForceReinstall(true);
        setIsAppInstalled(false);
        localStorage.removeItem('pwa-installed');
        localStorage.removeItem('pwa-install-completed');
        PWAInstallationEnforcer.forceRefreshStatus();
        alert('⚙️ Now tap the DOWNLOAD button again to reinstall with enhanced notifications!');
        return;
      }
      return;
    }
    if (isAppInstalled) {
      alert('App is already installed on your device!');
      return;
    }
    
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsAppInstalled(true);
          localStorage.setItem('pwa-installed', 'true');
        }
        setDeferredPrompt(null);
      } catch (error) {
        console.error('Error installing app:', error);
      }
    } else if (isIOS) {
      // iOS specific instructions
      alert(
        '📱 To install this app on your iPhone/iPad:\n\n' +
        '1. Tap the Share button (⬆️) at the bottom\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" to confirm\n\n' +
        'The app will appear on your home screen!'
      );
    } else {
      alert(
        '📱 To install this app:\n\n' +
        '• On Chrome: Look for the install icon (⬇️) in the address bar\n' +
        '• On Edge: Click the Apps menu and select "Install this site as an app"\n' +
        '• On other browsers: Add this page to bookmarks for quick access'
      );
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

  // Account health calculation
  const getAccountHealth = () => {
    if (therapist?.accountStatus === 'frozen' || therapist?.accountStatus === 'suspended') {
      return 'poor';
    }
    if (therapist?.pendingCommissionPayments && therapist.pendingCommissionPayments !== '0') {
      return 'fair';
    }
    return 'good';
  };

  const accountHealth = getAccountHealth();

  // Handle navigation from TherapistLayout menu
  const handleNavigate = (pageId: string) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <TherapistLayout 
      therapist={therapist} 
      currentPage="status" 
      onNavigate={handleNavigate}
      language={language}
    >
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-sm mx-auto px-4 py-5">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center">
                <Power className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-xl font-bold text-gray-900">{dict.therapistDashboard.onlineStatus}</h1>
                <p className="text-sm text-gray-500">{dict.therapistDashboard.manageAvailability}</p>
              </div>
              {isPremium && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-xs font-bold text-white">PREMIUM</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Health Indicator */}
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              {/* Health Dot */}
              <div className="relative">
                <div
                  className={`w-3 h-3 rounded-full ${
                    accountHealth === 'good'
                      ? 'bg-green-500'
                      : accountHealth === 'fair'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  } ${
                    accountHealth === 'poor' ? 'animate-pulse' : ''
                  }`}
                />
                {accountHealth === 'poor' && (
                  <div className="absolute inset-0 w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
                )}
              </div>
              
              {/* Health Text */}
              <span
                className={`text-xs font-semibold ${
                  accountHealth === 'good'
                    ? 'text-green-600'
                    : accountHealth === 'fair'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {dict.therapistDashboard.accountHealth}: {accountHealth.charAt(0).toUpperCase() + accountHealth.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Current Status Display */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{dict.therapistDashboard.currentStatus}</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(onlineHoursThisMonth || 0).toFixed(1)}h</span>
              <span className="text-xs text-gray-500">{dict.therapistDashboard.thisMonth}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Available */}
            <button
              onClick={() => handleStatusChange('available')}
              disabled={saving || status === 'available'}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'available'
                  ? 'bg-green-500 border-green-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-green-500 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className={`w-8 h-8 ${status === 'available' ? 'text-white' : 'text-green-600'}`} />
                <div className="text-center">
                  <h3 className={`text-sm font-bold ${status === 'available' ? 'text-white' : 'text-gray-800'}`}>{dict.therapistDashboard.available}</h3>
                </div>
              </div>
            </button>

            {/* Busy - Enhanced for Premium */}
            <button
              onClick={() => handleStatusChange('busy')}
              disabled={saving || status === 'busy'}
              className={`p-4 rounded-xl border-2 transition-all relative ${
                status === 'busy'
                  ? 'bg-amber-500 border-amber-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-amber-400 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {!isPremium && status === 'busy' && busyTimeRemaining !== null && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {Math.floor(busyTimeRemaining)}h
                </div>
              )}
              <div className="flex flex-col items-center gap-2">
                <Clock className={`w-8 h-8 ${status === 'busy' ? 'text-white' : 'text-yellow-600'}`} />
                <div className="text-center">
                  <h3 className={`text-sm font-bold ${status === 'busy' ? 'text-white' : 'text-gray-800'}`}>
                    {dict.therapistDashboard.busy}
                  </h3>
                </div>
              </div>
            </button>

            {/* Offline */}
            <button
              onClick={() => handleStatusChange('offline')}
              disabled={saving || status === 'offline'}
              className={`p-4 rounded-xl border-2 transition-all ${
                status === 'offline'
                  ? 'bg-red-500 border-red-500 shadow-lg'
                  : 'bg-white border-gray-300 hover:border-red-400 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-2">
                <XCircle className={`w-8 h-8 ${status === 'offline' ? 'text-white' : 'text-red-600'}`} />
                <div className="text-center">
                  <h3 className={`text-sm font-bold ${status === 'offline' ? 'text-white' : 'text-gray-800'}`}>{dict.therapistDashboard.offline}</h3>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">{dict.therapistDashboard.advancedOnlineStatus}</h4>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
            {!isPremium ? (
              <div className="space-y-2">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-900 font-semibold mb-1">📋 Pro Account (Current)</p>
                  <p className="text-xs text-gray-700 mb-2">Busy status limited to 3 hours each time you set it. After 3 hours, status automatically resets to Offline and your profile loses ranking visibility.</p>
                  <p className="text-xs text-gray-700">⚠️ Customer WhatsApp numbers are hidden to protect platform bookings. Upgrade to Premium for direct contact access.</p>
                </div>
                <div className="p-3 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <p className="text-sm text-yellow-900 font-semibold mb-1">⭐ Premium Account (Upgrade)</p>
                  <p className="text-xs text-yellow-900 mb-2">• <strong>Unlimited Busy status</strong> - Stay visible with high ranking as long as you want. Take breaks without losing your position.</p>
                  <p className="text-xs text-yellow-900 mb-2">• <strong>Auto-Offline Timer</strong> - Schedule automatic offline time. Set it once and relax - your status will auto-switch at your chosen time daily.</p>
                  <p className="text-xs text-yellow-900">• <strong>Customer WhatsApp Access</strong> - View and contact customers directly via WhatsApp from your bookings. Build relationships and get repeat business!</p>
                </div>
                <div className="mt-3 text-center">
                  <button
                    onClick={() => onNavigate?.('premium-upgrade')}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-bold rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all shadow-sm flex items-center gap-2 mx-auto"
                  >
                    <Crown className="w-4 h-4" />
                    {dict.therapistDashboard.upgradeToPremium}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-50 border-2 border-green-400 rounded-lg">
                <p className="text-sm text-green-900 font-semibold mb-1">⭐ Premium Account Active</p>
                <p className="text-xs text-green-900 mb-1">• Unlimited Busy status</p>
                <p className="text-xs text-green-900 mb-1">• Auto-Offline Timer unlocked</p>
                <p className="text-xs text-green-900">• Customer WhatsApp access</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-Offline Scheduler */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-orange-500'
              }`}>
                <Clock className={`w-6 h-6 ${isPremium ? 'text-white' : 'text-white'}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{dict.therapistDashboard.autoOfflineTimer}</h2>
                <p className="text-xs text-gray-500">{dict.therapistDashboard.autoOfflineTimerDesc}</p>
              </div>
            </div>
            {!isPremium && (
              <Crown className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          {!isPremium && (
            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl">
              <p className="text-sm text-yellow-900 font-semibold mb-2">⭐ Premium Feature</p>
              <p className="text-xs text-yellow-900 mb-3">Upgrade to Premium to schedule automatic offline time daily. Never worry about manually changing your status!</p>
              <button
                onClick={() => onNavigate?.('premium-upgrade')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm font-bold rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all shadow-sm flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Premium
              </button>
            </div>
          )}
          <p className="text-sm text-gray-600 mb-4">
            {dict.therapistDashboard.autoOfflineExplanation}
          </p>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <label className="text-sm font-semibold text-gray-800">{dict.therapistDashboard.setTime}:</label>
            <input
              type="time"
              value={autoOfflineTime}
              onChange={(e) => setAutoOfflineTime(e.target.value)}
              disabled={!isPremium}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none bg-gray-50 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => {
                if (!isPremium) {
                  alert('⭐ Auto-Offline Timer is a Premium feature. Upgrade to unlock!');
                  return;
                }
                handleAutoOfflineTimeChange(autoOfflineTime);
              }}
              disabled={!autoOfflineTime || !isPremium}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-semibold transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {dict.therapistDashboard.saveTimer}
            </button>
            {autoOfflineTime && isPremium && (
              <button
                onClick={handleCancelTimer}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold transition-colors shadow-sm hover:shadow-md"
              >
                {dict.therapistDashboard.cancelTimer}
              </button>
            )}
          </div>
          
          {/* Timer Status Indicator */}
          {status !== 'offline' && autoOfflineTime && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-900">
                ⏰ <strong>Timer Active:</strong> Will automatically go offline at {autoOfflineTime} ({new Date().toLocaleDateString()})
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Current time: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-3">
            Example: Set to 22:00 to automatically go offline at 10 PM every night
          </p>
        </div>

        {/* Discount Badge Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isPremium ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-orange-500'
              }`}>
                <Crown className={`w-6 h-6 ${isPremium ? 'text-white' : 'text-white'}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{dict.therapistDashboard.discountBadge}</h2>
                <p className="text-xs text-gray-500">{dict.therapistDashboard.discountBadgeDesc}</p>
              </div>
            </div>
            {isDiscountActive && (
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                {dict.therapistDashboard.active.toUpperCase()}
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {dict.therapistDashboard.discountBadgeExplanation}
          </p>

          {/* Discount Percentage Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">{dict.therapistDashboard.discountPercentage}</label>
            <div className="grid grid-cols-4 gap-3">
              {[5, 10, 15, 20].map((percent) => (
                <button
                  key={percent}
                  onClick={() => setDiscountPercentage(percent)}
                  disabled={!isPremium}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-lg transition-all ${
                    discountPercentage === percent
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
                  } ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {percent}%
                </button>
              ))}
            </div>
          </div>

          {/* Duration Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-3">{dict.therapistDashboard.duration} (Hours)</label>
            <div className="grid grid-cols-4 gap-3">
              {[1, 3, 6, 12].map((hours) => (
                <button
                  key={hours}
                  onClick={() => setDiscountDuration(hours)}
                  disabled={!isPremium}
                  className={`py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                    discountDuration === hours
                      ? 'border-yellow-500 bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-yellow-300'
                  } ${!isPremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={isPremium ? handleSaveDiscount : () => onNavigate?.('premium-upgrade')}
              disabled={isPremium && (discountPercentage === 0 || discountDuration === 0)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                isPremium 
                  ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600'
                  : 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white hover:from-yellow-500 hover:to-amber-600 cursor-pointer'
              }`}
            >
              {isPremium ? dict.therapistDashboard.startDiscount : `⭐ ${dict.therapistDashboard.upgradeToPremium}`}
            </button>
            {isDiscountActive && isPremium && (
              <button
                onClick={handleCancelDiscount}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold transition-colors shadow-sm hover:shadow-md"
              >
                {dict.therapistDashboard.removeDiscount}
              </button>
            )}
          </div>

          {/* Preview Badge */}
          {discountPercentage > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
              <p className="text-xs text-gray-600 mb-2 font-semibold">{dict.therapistDashboard.preview}:</p>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg shadow-md">
                {discountPercentage}% OFF
              </div>
            </div>
          )}
        </div>
        
        {/* CRITICAL: Download App Button - Enhanced for Notification Sounds */}
        <div className={`rounded-xl p-6 border-2 ${
          pwaEnforcementActive 
            ? 'bg-red-50 border-red-500' 
            : isAppInstalled 
              ? 'bg-green-50 border-green-500' 
              : 'bg-orange-50 border-orange-500'
        }`}>
          {/* Warning Banner for PWA Enforcement */}
          {pwaEnforcementActive && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-xl">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-bold text-sm">🚨 {dict.therapistDashboard.appInstallRequired}</span>
              </div>
              <p className="text-red-700 text-xs mt-1">
                {dict.therapistDashboard.mustInstallApp}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isAppInstalled ? 'bg-green-500' : pwaEnforcementActive ? 'bg-red-500' : 'bg-orange-500'
            }`}>
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${
                isAppInstalled ? 'text-green-900' : pwaEnforcementActive ? 'text-red-900' : 'text-orange-900'
              }`}>
                {isAppInstalled ? `✅ ${dict.therapistDashboard.appInstalledWithNotif}` : `📱 ${dict.therapistDashboard.installAppForSounds}`}
              </h3>
              <p className={`text-sm ${
                isAppInstalled ? 'text-green-700' : pwaEnforcementActive ? 'text-red-700' : 'text-orange-700'
              }`}>
                {isAppInstalled 
                  ? dict.therapistDashboard.readyToReceiveAlerts
                  : dict.therapistDashboard.customSoundsRequireInstall
                }
              </p>
            </div>
          </div>

          {/* Critical Notification Features List */}
          {!isAppInstalled && (
            <div className="mb-4 p-3 bg-white border border-gray-200 rounded-xl">
              <p className="font-semibold text-gray-900 text-sm mb-2">🔊 {dict.therapistDashboard.whyInstallCritical}</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• <strong>{dict.therapistDashboard.customMP3Sounds}</strong></li>
                <li>• <strong>{dict.therapistDashboard.backgroundNotif}</strong></li>
                <li>• <strong>{dict.therapistDashboard.strongerVibration}</strong></li>
                <li>• <strong>{dict.therapistDashboard.escalatingAlerts}</strong></li>
                <li>• <strong>{dict.therapistDashboard.neverMissBookings}</strong></li>
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Main Install/Reinstall Button */}
            <button
              onClick={handleInstallApp}
              className={`w-full py-4 font-bold text-lg rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 ${
                isAppInstalled
                  ? forceReinstall
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                  : pwaEnforcementActive
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              <Download className="w-6 h-6" />
              {isAppInstalled && !forceReinstall
                ? `🔄 ${dict.therapistDashboard.forceReinstallFix}`
                : isAppInstalled && forceReinstall
                  ? `📥 ${dict.therapistDashboard.reinstallWithSounds}`
                  : deferredPrompt 
                    ? `🚨 ${dict.therapistDashboard.installNowForSounds}`
                    : isIOS
                      ? `🍎 ${dict.therapistDashboard.addToHomeScreenIOS}`
                      : `📋 ${dict.therapistDashboard.getInstallInstructions}`
              }
            </button>

            {/* Test Notifications Button (only if installed) */}
            {isAppInstalled && (
              <button
                onClick={handleTestNotifications}
                className="w-full py-3 font-semibold rounded-xl border-2 border-green-500 text-green-700 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
              >
                <Badge className="w-5 h-5" />
                🧪 {dict.therapistDashboard.testNotificationSounds}
              </button>
            )}
          </div>

          {/* Installation Status & Instructions */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-600 text-center">
              {isAppInstalled 
                ? `✅ ${dict.therapistDashboard.appProperlyInstalled}`
                : `⚠️ ${dict.therapistDashboard.browserGenericSounds}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
    </TherapistLayout>
  );
};

export default TherapistOnlineStatus;
