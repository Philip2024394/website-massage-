// 🎯 AUTO-FIXED: Mobile scroll architecture violations (10 fixes)
import React, { useState, useEffect, useRef } from 'react';
import { Power, Clock, CheckCircle, XCircle, Crown, Download, Badge, AlertTriangle, X, Lock, Menu } from "lucide-react";
import { therapistService } from '../../lib/appwriteService';
import { AvailabilityStatus } from "../../types";
import { devLog, devWarn } from "../../utils/devMode";
// Temporarily comment out potentially problematic imports
// import { EnhancedNotificationService } from "../../lib/enhancedNotificationService";
// import { PWAInstallationEnforcer } from "../../lib/pwaInstallationEnforcer";
// import { useLanguage } from '../../hooks/useLanguage';
// import { useTranslations } from '../../lib/useTranslations';
import { FloatingChatWindow } from '../../chat/FloatingChatWindow';
import { useChatContext } from '../../context/ChatProvider';
import EnhancedNavigation from '../../components/therapist/EnhancedNavigation';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import BookingRequestCard from '../../components/therapist/BookingRequestCard';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { onlineStatusHelp, dashboardHelp } from './constants/helpContent';
import { TherapistHelpModal } from '../../components/therapist/TherapistHelpModal';
import { useHelpModal } from '../../hooks/useHelpModal';
import { getTherapistSidebarPage } from '../../config/therapistSidebarConfig';
import { showToast, showErrorToast, showWarningToast, showConfirmationToast } from '../../lib/toastUtils';
import { checkPWAUpdateBeforeInstall } from '../../utils/checkPWAUpdateBeforeInstall';
import UniversalPWAInstall from '../../components/UniversalPWAInstall';
import IOSInstallInstructions from '../../components/IOSInstallInstructions';
import { pwaNotificationSoundHandler } from '../../services/pwaNotificationSoundHandler';
import { isEmergencyWindowActive, triggerEmergencyAlert, type BookingForEmergency } from '../../services/emergencyAlertService';

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
  onLogout?: () => void;
  language?: 'en' | 'id';
}

type OnlineStatus = 'available' | 'busy' | 'active'; // Home services: Available only (no Offline)

const TherapistOnlineStatus: React.FC<TherapistOnlineStatusProps> = ({ therapist, onBack, onRefresh, onNavigate, onLogout, language: propLanguage = 'id' }) => {
  // Help modal state
  const { isHelpOpen, currentHelpKey, openHelp, closeHelp } = useHelpModal();
  // Booking system status for Install App card (green dot = active, red = reconnecting)
  const { subscriptionActive } = useChatContext();

  try {
    // Completely simplified static translations to prevent initialization errors
    const dict = {
      therapistDashboard: {
        currentStatus: 'Status Saat Ini',
        available: 'Tersedia',
        busy: 'Sibuk', 
        offline: 'Offline',
        active: 'Aktif',
        updateStatus: 'Update Status',
        lastSeen: 'Terakhir Terlihat',
        onlineFor: 'Online Selama',
        totalEarnings: 'Total Pendapatan',
        todayEarnings: 'Pendapatan Hari Ini',
        totalClients: 'Total Klien',
        premium: 'Premium',
        settings: 'Pengaturan',
        downloadApp: 'Download Aplikasi',
        notifications: 'Notifikasi',
        testNotifications: 'Test Notifikasi',
        installApp: 'Install Aplikasi',
        back: 'Kembali',
        thisMonth: 'Bulan Ini',
        // Auto-offline removed for home services
        setTime: 'Set Waktu',
        saveTimer: 'Simpan Timer',
        cancelTimer: 'Batal Timer',
        discountBadge: 'Badge Diskon',
        discountBadgeDesc: 'Tampilkan badge diskon',
        discountBadgeExplanation: 'Badge diskon akan ditampilkan di profil Anda',
        discountPercentage: 'Persentase Diskon',
        duration: 'Durasi',
        startDiscount: 'Mulai Diskon',
        upgradeToPremium: 'Upgrade ke Premium',
        removeDiscount: 'Hapus Diskon',
        preview: 'Preview',
        appInstallRequired: 'Aplikasi Perlu Diinstall',
        loading: 'Memuat...'
      }
    };
    
    const loading = false;
    const language = 'id';
    
    // Safety check for translations loading
    if (loading) {
      return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50  " style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-2"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }
  
  // Safety check - redirect if no therapist data
  if (!therapist) {
    console.error('❌ No therapist data provided to TherapistOnlineStatus');
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50  " style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
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
  
  // Home services: Available only (no Offline).
  const [status, setStatus] = useState<OnlineStatus>(() => {
    const savedStatus = localStorage.getItem(`therapist-status-${therapist?.$id}`);
    if (savedStatus === 'available' || savedStatus === 'active') return savedStatus as OnlineStatus;
    const therapistStatus = therapist?.status || therapist?.availability || 'available';
    const statusStr = String(therapistStatus).toLowerCase();
    if (statusStr === 'available' || statusStr === 'active') return 'available';
    return 'available'; // Default to available for home services (no offline)
  });
  // Auto-offline removed for home services (no offline feature)
  const [saving, setSaving] = useState(false);
  // All therapists have access to all features - no premium restrictions
  const isPremium = true;
  const [onlineHoursThisMonth, setOnlineHoursThisMonth] = useState<number>(0);
  const [countdownHoursRemaining, setCountdownHoursRemaining] = useState<number>(12);
  const [availableStartTime, setAvailableStartTime] = useState<string | null>(null);
  const [busyStartTime, setBusyStartTime] = useState<string | null>(therapist?.busyStartTime || null);
  const [busyTimeRemaining, setBusyTimeRemaining] = useState<number | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  
  // Discount badge states
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [discountDuration, setDiscountDuration] = useState<number>(0);
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  
  const [showEnhancedNav, setShowEnhancedNav] = useState(false);

  // PWA Install states
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(() => {
    // Initialize from localStorage or PWA detection
    if (localStorage.getItem('pwa-installed') === 'true') return true;
    
    // Detect if running as PWA (standalone mode)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-method', 'manual-detected');
      return true;
    }
    
    return false;
  });
  const [isIOS, setIsIOS] = useState(false);
  const [pwaEnforcementActive, setPwaEnforcementActive] = useState(false);
  const [forceReinstall, setForceReinstall] = useState(false);
  const [showPWAInstallSection, setShowPWAInstallSection] = useState(() => {
    // Hide install section if already running as PWA
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      return false;
    }
    return true;
  });
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  // Emergency button: 3 taps in 4s to trigger; active during booking windows
  const [providerBookings, setProviderBookings] = useState<BookingForEmergency[]>([]);
  const [emergencyTapCount, setEmergencyTapCount] = useState(0);
  const emergencyTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [emergencySending, setEmergencySending] = useState(false);
  const [localEmergencyActive, setLocalEmergencyActive] = useState(false); // true after alert sent: flashing + MP3 until 3-tap again
  const emergencyAudioRef = useRef<HTMLAudioElement | null>(null);
  const isEmergencyActive = isEmergencyWindowActive(providerBookings);
  const canUseEmergency = isEmergencyActive || localEmergencyActive; // button works when in window OR when clearing active emergency

  // Fetch provider bookings for emergency window
  useEffect(() => {
    if (!therapist?.$id) return;
    let cancelled = false;
    (async () => {
      try {
        const { bookingService } = await import('../../lib/appwrite/services/booking.service');
        const list = await bookingService.getByProvider(therapist.$id, 'therapist');
        if (!cancelled) setProviderBookings(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setProviderBookings([]);
      }
    })();
    return () => { cancelled = true; };
  }, [therapist?.$id]);

  const handleEmergencyTap = () => {
    if (!canUseEmergency || emergencySending) return;
    const newCount = emergencyTapCount + 1;
    setEmergencyTapCount(newCount);
    if (emergencyTapTimeoutRef.current) clearTimeout(emergencyTapTimeoutRef.current);
    if (newCount >= 3) {
      setEmergencyTapCount(0);

      // Already in active emergency: second 3-tap = stop sound and clear
      if (localEmergencyActive) {
        if (emergencyAudioRef.current) {
          emergencyAudioRef.current.pause();
          emergencyAudioRef.current.currentTime = 0;
          emergencyAudioRef.current = null;
        }
        setLocalEmergencyActive(false);
        showToast(propLanguage === 'en' ? 'Emergency cleared. Sound stopped.' : 'Darurat dibatalkan. Suara dihentikan.', 'success');
        return;
      }

      // First 3-tap: send alert, then set active + start music
      (async () => {
        setEmergencySending(true);
        try {
          const pos = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
            navigator.geolocation.getCurrentPosition(
              (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              reject,
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          });
          const now = new Date().toISOString();
          const relevant = providerBookings[0];
          const result = await triggerEmergencyAlert({
            therapistId: therapist.$id,
            therapistName: therapist.name || 'Therapist',
            providerType: 'therapist',
            lat: pos.lat,
            lng: pos.lng,
            triggeredAt: now,
            bookingId: relevant?.$id,
            customerName: relevant?.customerName || relevant?.userName,
            bookingSummary: relevant ? `${relevant.customerName || relevant.userName || 'Customer'} • ${relevant.duration || 60} min` : undefined
          });
          if (result.success) {
            setLocalEmergencyActive(true); // triggers flashing + MP3 in useEffect
            showToast(propLanguage === 'en' ? 'Emergency alert sent. Tap 3x again to stop sound.' : 'Alert darurat terkirim. Ketuk 3x lagi untuk hentikan suara.', 'success');
          } else {
            showErrorToast(result.error || (propLanguage === 'en' ? 'Failed to send alert' : 'Gagal mengirim alert'));
          }
        } catch (e: any) {
          showErrorToast(e?.message || (propLanguage === 'en' ? 'Could not get location or send alert' : 'Lokasi atau pengiriman alert gagal'));
        } finally {
          setEmergencySending(false);
        }
      })();
      return;
    }
    emergencyTapTimeoutRef.current = setTimeout(() => setEmergencyTapCount(0), 4000);
  };

  // When local emergency is active: start MP3 loop; when cleared: stop
  useEffect(() => {
    if (!localEmergencyActive) return;
    try {
      const audio = new Audio('/sounds/alert-notification.mp3');
      audio.loop = true;
      audio.volume = 0.9;
      audio.play().catch(() => {});
      emergencyAudioRef.current = audio;
      return () => {
        audio.pause();
        audio.currentTime = 0;
        emergencyAudioRef.current = null;
      };
    } catch {
      // ignore
    }
  }, [localEmergencyActive]);

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
      fullTherapistObject: therapist
    });
    
    // Initialize Enhanced Notification System
    // EnhancedNotificationService.initialize(); // Temporarily disabled
    
    // Initialize 12-hour countdown timer from therapist data
    if (therapist.availableStartTime && status === 'available') {
      const now = new Date();
      const startTime = new Date(therapist.availableStartTime);
      const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const hoursRemaining = Math.max(0, 12 - hoursElapsed);
      
      setAvailableStartTime(therapist.availableStartTime);
      setCountdownHoursRemaining(hoursRemaining);
      
      devLog('⏰ Initializing countdown timer with', hoursRemaining.toFixed(2), 'hours remaining');
      
      if (hoursRemaining <= 0) {
        devLog('⏰ Timer expired on page load - keeping available (home services: no offline)');
      }
    } else if (status !== 'available') {
      setAvailableStartTime(null);
      setCountdownHoursRemaining(12);
    } else if (therapist.countdownHoursRemaining !== undefined) {
      setCountdownHoursRemaining(therapist.countdownHoursRemaining);
    }
    
    // Initialize PWA state from localStorage and browser detection
    const storedInstallStatus = localStorage.getItem('pwa-installed') === 'true';
    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isManualPWA = isStandalone && !storedInstallStatus;
    
    if (isManualPWA) {
      // User manually installed PWA but haven't activated enhanced features yet
      setIsAppInstalled(true);
      localStorage.setItem('pwa-installed', 'true');
      localStorage.setItem('pwa-install-method', 'manual-standalone');
      
      // Check if user was guided to return for enhanced features
      if (localStorage.getItem('manual-pwa-install-guided') === 'true') {
        setTimeout(() => {
          showToast('🎉 PWA Detected! Activate enhanced features now?', 'success', { 
            duration: 8000 
          });
          
          // Offer to activate enhanced features
          setTimeout(() => {
            if (confirm('🚀 Activate Enhanced Features?\n\n• 🔔 Instant notifications\n• 🎵 Notification sounds\n• 📳 Vibration alerts\n• 💬 Real-time chat\n\nClick OK to enable now!')) {
              activateEnhancedPWAFeatures();
            }
          }, 2000);
        }, 1000);
        localStorage.removeItem('manual-pwa-install-guided');
      }
    } else {
      setIsAppInstalled(storedInstallStatus);
    }
    
    // Only enforce PWA if not installed and not running as standalone
    setPwaEnforcementActive(!storedInstallStatus && !isStandalone);
    
    console.log('📱 PWA status initialized:', { isInstalled: storedInstallStatus, enforceInstall: !storedInstallStatus });
    
    // Start PWA monitoring for critical notifications
    // PWAInstallationEnforcer.startMonitoring(); // Temporarily disabled
    
    // Load discount settings
    if (therapist?.discountPercentage) setDiscountPercentage(therapist.discountPercentage);
    if (therapist?.discountDuration) setDiscountDuration(therapist.discountDuration);
    if (therapist?.isDiscountActive !== undefined) setIsDiscountActive(therapist.isDiscountActive);
    
    // Load online hours this month
    if (therapist?.onlineHoursThisMonth !== undefined) {
      setOnlineHoursThisMonth(therapist.onlineHoursThisMonth);
    }
    
    // Auto-offline removed for home services
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
        
        // Home services: Available only (no Offline). Stored busy/offline → show as available.
        const freshStatus = freshData?.status || freshData?.availability || 'Available';
        const freshUIStatus = String(freshStatus).toLowerCase();
        devLog('✅ Setting status from Appwrite:', freshUIStatus === 'available' || freshUIStatus === 'active' ? 'available' : 'available (default)');
        setStatus('available');
      } catch (error) {
        console.error('❌ Failed to load fresh status:', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    loadFreshStatus();
  }, []); // Run once on mount

  // ❌ DISABLED: Auto-offline timer (THERAPIST_AUTO_OFFLINE_TIMER_DISABLED.md)
  // Therapists now control their status manually - no automatic deactivation
  // useEffect(() => {
  //   const checkAutoOffline = () => {
  //     if (!autoOfflineTime || status === 'offline') return;
  //     
  //     const now = new Date();
  //     const [hours, minutes] = autoOfflineTime.split(':').map(Number);
  //     const targetTime = new Date();
  //     targetTime.setHours(hours, minutes, 0, 0);
  //     
  //     // Check if current time matches or passed the auto-offline time
  //     if (now >= targetTime) {
  //       const lastCheck = localStorage.getItem('lastAutoOfflineCheck');
  //       const today = now.toDateString();
  //       
  //       // Only auto-offline once per day at the specified time
  //       if (lastCheck !== today) {
  //         devLog('⏰ Auto-offline time reached:', autoOfflineTime);
  //         handleStatusChange('offline');
  //         localStorage.setItem('lastAutoOfflineCheck', today);
  //       }
  //     }
  //   };
  //   
  //   // Check immediately on mount
  //   checkAutoOffline();
  //   
  //   // Then check every minute
  //   const interval = setInterval(checkAutoOffline, 60000);
  //   
  //   return () => clearInterval(interval);
  // }, [autoOfflineTime, status]);

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
      // const pwaStatus = PWAInstallationEnforcer.checkInstallationStatus();
      const pwaStatus = { canInstall: false, isInstalled: false }; // Fallback
      setIsAppInstalled(pwaStatus.isInstalled);
      setPwaEnforcementActive(!pwaStatus.isInstalled);
      
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

  // ❌ DISABLED: 12-hour countdown timer (THERAPIST_AUTO_OFFLINE_TIMER_DISABLED.md)
  // Therapists can now stay "Available" indefinitely until they manually change status
  // No automatic transition from Available → Busy after 12 hours
  // useEffect(() => {
  //   if (!therapist?.$id) return;
  //   
  //   const updateCountdownTimer = async () => {
  //     // Only count down when status is available
  //     if (status !== 'available' || !availableStartTime) return;
  //     
  //     const now = new Date();
  //     const startTime = new Date(availableStartTime);
  //     
  //     // Calculate hours elapsed since becoming available
  //     const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  //     const hoursRemaining = Math.max(0, 12 - hoursElapsed);
  //     
  //     setCountdownHoursRemaining(hoursRemaining);
  //     
  //     // Auto-change to busy when timer reaches 0
  //     if (hoursRemaining <= 0 && status === 'available') {
  //       console.log('⏰ 12-hour timer expired - changing status to busy');
  //       try {
  //         await therapistService.update(therapist.$id, {
  //           status: 'busy',
  //           availability: 'busy',
  //           availableStartTime: null,
  //           countdownHoursRemaining: 0
  //         });
  //         setStatus('busy');
  //         setAvailableStartTime(null);
  //         setBusyStartTime(now.toISOString());
  //       } catch (error) {
  //         console.error('Failed to auto-change status to busy:', error);
  //       }
  //       return;
  //     }
  //     
  //     // Update database every 5 minutes to reduce writes
  //     const minutesElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60);
  //     if (Math.floor(minutesElapsed) % 5 === 0) {
  //       try {
  //         await therapistService.update(therapist.$id, {
  //           countdownHoursRemaining: hoursRemaining,
  //           lastTimerUpdate: now.toISOString()
  //         });
  //         devLog('⏱️ Updated countdown timer:', hoursRemaining.toFixed(2), 'hours remaining');
  //       } catch (error) {
  //         console.error('Failed to update countdown timer:', error);
  //       }
  //     }
  //   };
  //   
  //   // Update immediately on mount if available
  //   if (status === 'available' && availableStartTime) {
  //     updateCountdownTimer();
  //   }
  //   
  //   // Then update every minute while available
  //   const interval = setInterval(() => {
  //     if (status === 'available' && availableStartTime) {
  //       updateCountdownTimer();
  //     }
  //   }, 60000); // Every 1 minute
  //   
  //   return () => clearInterval(interval);
  // }, [therapist?.$id, status, availableStartTime]);

  // ❌ DISABLED: Busy time limit monitoring (THERAPIST_AUTO_OFFLINE_TIMER_DISABLED.md)
  // Therapists can now stay "Busy" indefinitely - no automatic transition to Offline
  // useEffect(() => {
  //   if (!therapist?.$id || isPremium || status !== 'busy' || !busyStartTime) return;
  //   
  //   const checkBusyTimeLimit = async () => {
  //     const startTime = new Date(busyStartTime);
  //     const now = new Date();
  //     const minutesElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60);
  //     const hoursElapsed = minutesElapsed / 60;
  //     const hoursRemaining = Math.max(0, 3 - hoursElapsed);
  //     
  //     // Round up to nearest hour for display (so it shows 3h, 2h, 1h)
  //     const displayHours = Math.ceil(hoursRemaining);
  //     setBusyTimeRemaining(displayHours);
  //     
  //     // If 3 hours exceeded, auto-reset to offline
  //     if (hoursElapsed >= 3) {
  //       devLog('⏰ Pro account busy time limit (3h) exceeded - auto-resetting to offline');
  //       await handleStatusChange('offline');
  //       // All accounts have unlimited busy time (premium feature)
  //       setBusyStartTime(null);
  //       setBusyTimeRemaining(null);
  //     }
  //   };
  //   
  //   // Check immediately
  //   checkBusyTimeLimit();
  //   
  //   // Then check every minute
  //   const interval = setInterval(checkBusyTimeLimit, 60000);
  //   
  //   return () => clearInterval(interval);
  // }, [therapist?.$id, isPremium, status, busyStartTime]);

  const handleStatusChange = async (newStatus: OnlineStatus) => {
    // Prevent multiple rapid clicks
    if (saving || isLoadingStatus) return;
    
    // Save to localStorage immediately for persistence across page changes
    localStorage.setItem(`therapist-status-${therapist.$id}`, newStatus);
    
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
      
      // Home services: Available only (no Offline).
      const properStatusValue = AvailabilityStatus.Available;
      const now = new Date().toISOString();
      devLog('✅ Status set to Available (home services: no offline)');
      const updateData = {
        status: properStatusValue,
        availability: properStatusValue,
        isLive: true,
        isOnline: true,
        busyUntil: null,
        bookedUntil: null,
        busy: '',
        available: now
      };
      
      // ❌ Busy timer removed - therapists control their status manually
      
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
      
      const statusMessages: Record<string, string> = {
        available: language === 'id' 
          ? '✅ Anda sekarang TERSEDIA untuk booking' 
          : '✅ You are now AVAILABLE for bookings',
        active: language === 'id' 
          ? '✅ Anda sekarang AKTIF dan siap untuk booking' 
          : '✅ You are now ACTIVE and ready for bookings'
      };
      
      devLog('✅ Status saved:', statusMessages[newStatus]);
      showToast(statusMessages[newStatus], 'success');
      
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      
      try {
        const freshData = await therapistService.getById(therapist.$id);
        const revertStatus = String(freshData?.status || 'Available').toLowerCase();
        setStatus(revertStatus === 'available' || revertStatus === 'active' ? 'available' : 'available');
        devLog('🔄 Status reverted to database value');
      } catch (revertError) {
        console.error('❌ Failed to revert status:', revertError);
        setStatus('available');
      }
      showErrorToast(language === 'id' ? '❌ Gagal memperbarui status. Silakan coba lagi.' : '❌ Failed to update status. Please try again.');
      console.error('❌ Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type
      });
      showErrorToast(`Failed to update status: ${error?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDiscount = async () => {
    if (!isPremium) {
      // Discount badges available for all accounts (premium feature)
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
      showToast(`✅ ${discountPercentage}% discount badge activated for ${discountDuration} hours!`, 'success');
      
      // Don't refresh here - it causes button jumping when clicking OK on alert
    } catch (error) {
      console.error('❌ Failed to save discount:', error);
      showErrorToast('Failed to save discount. Please try again.');
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
      showToast('✅ Discount badge removed', 'success');
      
      // Don't refresh here - it causes button jumping when clicking OK on alert
    } catch (error) {
      console.error('❌ Failed to cancel discount:', error);
      showErrorToast('Failed to cancel discount. Please try again.');
    }
  };

  const handleTestNotifications = async () => {
    try {
      // Request permission first
      // const hasPermission = await EnhancedNotificationService.requestPermission();
      const hasPermission = 'granted'; // Temporary fallback
      
      if (hasPermission) {
        // Import and test ULTIMATE notification system
        // const { UltimateNotificationUtils } = await import('../../../../src/lib/ultimateNotificationUtils');
        // await UltimateNotificationUtils.testUltimateNotification();
        console.log('Test notifications temporarily disabled');
        
        // Also test the escalating notifications
        // await EnhancedNotificationService.testEnhancedNotifications(); // Temporarily disabled
        
        showToast(
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
          '  • System default sound will play',
          'success', 
          { duration: 8000 }
        );
      } else {
        showErrorToast('⚠️ Notification permission required!\n\nPlease allow notifications in your browser settings and try again.');
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
      showErrorToast('❌ Failed to test notifications. Please ensure the app is properly installed.');
    }
  };

  const handleSimpleDownload = async () => {
    try {
      console.log('📱 Enhanced PWA download initiated...');
      
      // Check if already installed
      if (isAppInstalled) {
        showToast('✅ App is already installed!', 'success', { duration: 3000 });
        return;
      }

      // Immediate feedback so user knows the button was pressed
      showToast('📱 Preparing app installation...', 'info', { duration: 2000 });

      // Play download initiation sound
      try {
        await pwaNotificationSoundHandler.playNotificationSound('booking');
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      } catch (soundError) {
        console.log('🔇 Sound play failed (normal on some browsers):', soundError);
      }
      
      // iOS: Show custom instructions modal (iOS doesn't support beforeinstallprompt)
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOSDevice) {
        console.log('📱 iOS detected - showing install instructions modal');
        setShowIOSInstructions(true);
        showToast('📱 Follow the instructions below to add the app to your home screen', 'info', { duration: 5000 });
        return;
      }
      
      // Android/Desktop Chrome: Try native PWA install prompt
      if (deferredPrompt) {
        console.log('📱 Native PWA prompt available - triggering...');
        showToast('📱 Installing app with enhanced features...', 'info', { duration: 2000 });
        
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === 'accepted') {
          await activateEnhancedPWAFeatures();
          setIsAppInstalled(true);
          localStorage.setItem('pwa-installed', 'true');
          localStorage.setItem('pwa-install-completed', 'true');
          localStorage.setItem('pwa-enhanced-features', 'true');
          setDeferredPrompt(null);
          
          // Success notification with sound and vibration
          showToast('✅ App installed successfully! Enhanced features activated:', 'success', { duration: 8000 });
          console.log('✅ Enhanced PWA installation completed!');
          
          return;
        } else {
          console.log('❌ User declined installation');
          showToast('Installation cancelled. You can install anytime!', 'info', { duration: 3000 });
          return;
        }
      }
      
      // Rock-solid fallback: use central installer (shows Android/iOS/Desktop modal, no toast-only)
      console.log('ℹ️ Native PWA prompt not available - showing manual install modal');
      const { PWAInstallationStatusChecker } = await import('../../utils/pwaInstallationStatus');
      const result = await PWAInstallationStatusChecker.triggerInstallation();
      if (result.success && result.result === 'manual-instructions-shown') {
        setTimeout(() => {
          localStorage.setItem('manual-pwa-install-guided', 'true');
          showToast('💡 After installing, open the app from your home screen for notifications!', 'info', { duration: 5000 });
        }, 500);
      } else if (!result.success && result.error) {
        showToast(result.error, 'info', { duration: 8000 });
      }
    } catch (error) {
      console.error('❌ Enhanced download error:', error);
      showToast('❌ Failed to install app. Please try again or use Chrome/Safari.', 'error', { duration: 4000 });
    }
  };

  // Activate enhanced PWA features after successful installation
  const activateEnhancedPWAFeatures = async () => {
    try {
      console.log('🚀 Activating enhanced PWA features...');
      
      // 1. Request notification permission with enhanced messaging
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
          
          // Play success sound and vibrate
          try {
            await pwaNotificationSoundHandler.playNotificationSound('booking');
            if ('vibrate' in navigator) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
          } catch (e) { /* Silent fail for sound */ }
          
          // Show welcome notification
          setTimeout(() => {
            new Notification('IndaStreet Therapist 🏝️', {
              body: '🎉 App installed! Enhanced features:\n• 🔔 Instant booking alerts\n• 🎵 Notification sounds\n• 💬 Live chat notifications\n• 📳 Vibration alerts',
              icon: '/pwa-icon-192.png',
              badge: '/pwa-badge-72.png',
              tag: 'install-success',
              requireInteraction: true,
              vibrate: [300, 100, 300]
            });
          }, 1000);
        }
      }
      
      // 2. Initialize professional chat notification service
      try {
        // Initialize chat notifications through the existing chat window
        console.log('✅ Professional chat notifications will be activated with chat window');
      } catch (chatError) {
        console.log('💬 Chat notifications will be initialized when needed:', chatError);
      }
      
      // 3. Enable background sync for offline functionality
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready;
          // Background sync requires HTTPS or localhost and browser support
          if ('sync' in registration && registration.sync) {
            await (registration as any).sync.register('background-sync');
            console.log('✅ Background sync enabled');
          }
        } catch (syncError) {
          console.log('🔄 Background sync not available:', syncError);
        }
      }
      
      // 4. Initialize notification sound handler (check if method exists)
      if (typeof (pwaNotificationSoundHandler as any).initialize === 'function') {
        try {
          (pwaNotificationSoundHandler as any).initialize();
        } catch (soundError) {
          console.log('🔊 Sound handler initialization skipped:', soundError);
        }
      }
      
      // 5. Store enhanced features flag and ensure chat window is ready
      localStorage.setItem('therapist-dashboard-enhanced', 'true');
      localStorage.setItem('notification-music-enabled', 'true');
      localStorage.setItem('chat-notifications-enabled', 'true');
      localStorage.setItem('vibration-enabled', 'true');
      localStorage.setItem('floating-chat-activated', 'true');
      
      console.log('🎆 All enhanced PWA features activated successfully!');
      
    } catch (error) {
      console.error('❌ Error activating enhanced features:', error);
    }
  };

  // Reset PWA installation state (for testing/debugging)
  const handleResetPWAState = () => {
    localStorage.removeItem('pwa-installed');
    localStorage.removeItem('pwa-install-completed');
    setIsAppInstalled(false);
    showToast('🔄 PWA installation state reset. You can now test the download button again.', 'info', { duration: 4000 });
    console.log('🔄 PWA state reset for testing');
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
      showConfirmationToast(
        '📱 APP ALREADY DETECTED\n\n' +
        'If you\'re having notification issues:\n' +
        '• Click OK to FORCE REINSTALL\n' +
        '• This ensures you have the latest notification sounds\n' +
        '• Cancel if notifications are working fine',
        () => {
          // onConfirm
          setForceReinstall(true);
          setIsAppInstalled(false);
          localStorage.removeItem('pwa-installed');
          localStorage.removeItem('pwa-install-completed');
          // PWAInstallationEnforcer.forceRefreshStatus(); // Temporarily disabled
          showToast('⚙️ Now tap the DOWNLOAD button again to reinstall with enhanced notifications!', 'info');
        },
        () => {
          // onCancel - do nothing, just close toast
        }
      );
      return;
    }
    
    console.log('🚀 Install App button clicked - triggering native PWA install...');
    
    // Try to get the deferred prompt from window object first
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    
    // AUTO-TRIGGER: ELITE – check for update first, then native browser installation
    if (promptEvent) {
      checkPWAUpdateBeforeInstall(async () => {
        try {
          console.log('✅ Found deferred prompt - showing native install dialog...');
          await promptEvent.prompt();
          const choiceResult = await promptEvent.userChoice;
          
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted PWA installation!');
            setIsAppInstalled(true);
            localStorage.setItem('pwa-installed', 'true');
            localStorage.setItem('pwa-install-completed', 'true');
            
            // Request notification permission immediately after install
            setTimeout(async () => {
              if ('Notification' in window && Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                  new Notification('IndaStreet Therapist', {
                    body: '🎉 App installed successfully! Notifications are now enabled.',
                    icon: '/pwa-icon-192.png',
                    tag: 'install-success'
                  });
                }
              }
            }, 1000);
          } else {
            console.log('❌ User declined PWA installation');
          }
        } catch (error) {
          console.error('❌ Error with native install prompt:', error);
        }
      });
      return;
    }
    
    // FALLBACK: Try to trigger beforeinstallprompt event manually
    console.log('⚠️ No native prompt available, attempting to trigger beforeinstallprompt...');
    
    // Dispatch a custom event to potentially trigger any cached prompts
    window.dispatchEvent(new Event('beforeinstallprompt'));
    
    // Wait a moment to see if a prompt becomes available
    setTimeout(async () => {
      const newPrompt = (window as any).deferredPrompt;
      if (newPrompt) {
        console.log('✅ Found new deferred prompt after trigger...');
        try {
          await newPrompt.prompt();
          const result = await newPrompt.userChoice;
          if (result.outcome === 'accepted') {
            setIsAppInstalled(true);
            localStorage.setItem('pwa-installed', 'true');
            localStorage.setItem('pwa-install-completed', 'true');
          }
          return;
        } catch (error) {
          console.error('Error with triggered prompt:', error);
        }
      }
      
      // FINAL FALLBACK: Show browser-specific instructions only if everything else fails
      if (isIOS) {
        // iOS specific instructions popup
        showToast(
          '📱 TO INSTALL ON iPhone/iPad:\n\n' +
          '1. Tap the Share button (⬆️) at the bottom of Safari\n' +
          '2. Scroll down and tap "Add to Home Screen"\n' +
          '3. Tap "Add" to confirm\n\n' +
          '✅ The app will appear on your home screen with full notification support!',
          'info',
          { duration: 10000 }
        );
      } else {
        // Show Android/Desktop instructions
        showToast(
          '📱 TO INSTALL THE APP:\n\n' +
          '🔹 Chrome/Edge:\n' +
          '   • Look for install icon (⬇️) in address bar\n' +
          '   • OR: Menu (⋮) → "Install app"\n\n' +
          '🔹 Firefox:\n' +
          '   • Menu (⋮) → "Install"\n\n' +
          '🔹 Other browsers:\n' +
          '   • Add to home screen from browser menu\n\n' +
          '✅ Once installed, you\'ll get enhanced notifications!',
          'info',
          { duration: 10000 }
        );
      }
    }, 500);
  };

  const getStatusColor = (statusType: OnlineStatus) => {
    switch (statusType) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusIcon = (statusType: OnlineStatus) => {
    switch (statusType) {
      case 'available': return <CheckCircle className="w-8 h-8" />;
      case 'busy': return <Clock className="w-8 h-8" />;
      case 'active': return <CheckCircle className="w-8 h-8" />;
      default: return <CheckCircle className="w-8 h-8" />;
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

  // Handle navigation - resolve sidebar ids to canonical page
  const handleNavigate = (pageId: string) => {
    if (onNavigate) {
      onNavigate(getTherapistSidebarPage(pageId));
    }
  };

  return (
    <>
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      <TherapistPageHeader
        title={dict.therapistDashboard.currentStatus}
        subtitle={dict.therapistDashboard.updateStatus}
        onBackToStatus={onBack}
        icon={<Clock className="w-6 h-6 text-orange-600" />}
        actions={
          <button
            onClick={() => setShowEnhancedNav(!showEnhancedNav)}
            className={`p-2 rounded-lg transition-colors ${
              showEnhancedNav ? 'bg-orange-100 text-orange-600' : 'hover:bg-orange-50'
            }`}
            aria-label={showEnhancedNav ? 'Close menu' : 'Open menu'}
            aria-expanded={showEnhancedNav}
          >
            <Menu className="w-5 h-5 text-orange-600" />
          </button>
        }
      />
      <div className="bg-white max-w-sm mx-auto px-4 pt-0 pb-3 space-y-4">
        {/* Home services: Available only. No Offline option. */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-bold text-gray-900">{dict.therapistDashboard.currentStatus}</h2>
            <HelpTooltip 
              {...onlineStatusHelp.availabilityToggle}
              position="right"
              size="md"
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => handleStatusChange('available')}
              disabled={saving || status === 'available'}
              className={`w-full max-w-xs p-4 rounded-xl border-2 transition-all ${
                status === 'available'
                  ? 'bg-green-600 border-green-600 shadow-lg text-white'
                  : 'bg-white border-gray-300 hover:border-green-500 hover:shadow-md'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className={`w-8 h-8 ${status === 'available' ? 'text-white' : 'text-green-600'}`} />
                <h3 className={`text-sm font-bold ${status === 'available' ? 'text-white' : 'text-gray-800'}`}>{dict.therapistDashboard.available}</h3>
              </div>
            </button>
          </div>

          {/* Emergency button – active during bookings; 3 taps to send (then flashing + MP3 until 3 taps again to stop) */}
          <div className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 p-4">
            <button
              type="button"
              onClick={handleEmergencyTap}
              disabled={!canUseEmergency || emergencySending}
              className={`w-full py-4 rounded-xl border-2 font-bold text-lg flex flex-col items-center justify-center gap-2 transition-all ${
                localEmergencyActive
                  ? 'bg-red-600 border-red-700 text-white animate-pulse shadow-lg shadow-red-400/50'
                  : canUseEmergency && !emergencySending
                    ? 'bg-red-600 border-red-700 text-white hover:bg-red-700 active:scale-[0.98]'
                    : 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <AlertTriangle className="w-10 h-10" />
              <span>
                {emergencySending
                  ? (propLanguage === 'en' ? 'Sending…' : 'Mengirim…')
                  : localEmergencyActive
                    ? (propLanguage === 'en' ? 'ACTIVE EMERGENCY — Tap 3x to stop sound' : 'DARURAT AKTIF — Ketuk 3x hentikan suara')
                    : isEmergencyActive
                      ? (propLanguage === 'en' ? 'EMERGENCY — Tap 3 times' : 'DARURAT — Ketuk 3 kali')
                      : (propLanguage === 'en' ? 'Emergency (active during bookings)' : 'Darurat (aktif saat ada booking)')}
              </span>
              {canUseEmergency && emergencyTapCount > 0 && !localEmergencyActive && (
                <span className="text-sm opacity-90">{emergencyTapCount}/3</span>
              )}
              {localEmergencyActive && (
                <span className="text-sm opacity-90">{(propLanguage === 'en' ? 'Music playing' : 'Musik menyala')} — 3x to stop</span>
              )}
            </button>
            <p className="text-xs text-center text-gray-600 mt-2">
              {localEmergencyActive
                ? (propLanguage === 'en'
                  ? 'Tap the button 3 times within 4 seconds to stop the sound and clear active emergency.'
                  : 'Ketuk tombol 3 kali dalam 4 detik untuk hentikan suara dan batalkan darurat aktif.')
                : propLanguage === 'en'
                  ? 'Active 1h before, during, and 3h after each booking. Admin is notified. After sending, music plays until you tap 3x again.'
                  : 'Aktif 1 jam sebelum, selama, dan 3 jam setelah setiap booking. Admin diberitahu. Setelah kirim, musik menyala sampai Anda ketuk 3x lagi.'}
            </p>
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-[11px] text-center text-gray-700 leading-relaxed">
                {propLanguage === 'en' ? (
                  <>To activate: tap the emergency button <strong>3 times within 4 seconds</strong>. IndaStreet is notified <strong>immediately</strong> with your location and GPS coordinates. Police may be contacted and/or IndaStreet representatives are on the way. Tap 3 times again to stop the alert sound and clear.</>
                ) : (
                  <>Untuk mengaktifkan: ketuk tombol darurat <strong>3 kali dalam 4 detik</strong>. IndaStreet diberitahu <strong>segera</strong> dengan lokasi dan koordinat GPS Anda. Polisi dapat dihubungi dan/atau perwakilan IndaStreet sedang dalam perjalanan. Ketuk 3 kali lagi untuk hentikan suara dan batalkan.</>
                )}
              </p>
            </div>
          </div>
        </div>
        
        {/* Install App on Mobile Device - at end of Status page */}
        {(() => {
          const statusLabel = isAppInstalled ? 'App downloaded' : 'Install app on mobile device';
          const statusDot = isAppInstalled ? 'bg-green-500' : 'bg-red-500';
          const statusBg = isAppInstalled ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
          const statusText = isAppInstalled ? 'text-green-800' : 'text-red-800';
          return (
        <div className="rounded-xl p-6 border-2 bg-white border-orange-200 shadow-lg">
          {/* Status indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${statusBg}`}>
            <span className={`w-3 h-3 rounded-full flex-shrink-0 ${statusDot} ${isAppInstalled ? 'animate-pulse' : ''}`} />
            <span className={`text-sm font-semibold ${statusText}`}>{statusLabel}</span>
          </div>

          {/* Booking system active – green dot when connected, red when reconnecting */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 ${
            subscriptionActive ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}>
            <span
              className={`relative flex h-3 w-3 flex-shrink-0 ${subscriptionActive ? 'text-green-500' : 'text-amber-500'}`}
              aria-label={subscriptionActive ? 'Booking system active' : 'Booking system reconnecting'}
            >
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                subscriptionActive ? 'bg-green-500 animate-ping' : 'bg-amber-500 animate-pulse'
              }`} />
              <span className={`relative inline-flex h-3 w-3 rounded-full ${
                subscriptionActive ? 'bg-green-500' : 'bg-amber-500'
              }`} />
            </span>
            <span className={`text-sm font-semibold ${subscriptionActive ? 'text-green-800' : 'text-amber-800'}`}>
              💬 {subscriptionActive ? (propLanguage === 'en' ? 'Booking system active' : 'Sistem booking aktif') : (propLanguage === 'en' ? 'Reconnecting…' : 'Menghubungkan…')}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${
              isAppInstalled ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
            }`}>
              {isAppInstalled ? <Lock className="w-6 h-6 text-white" /> : <Download className="w-6 h-6 text-white" />}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${
                isAppInstalled ? 'text-green-800' : 'text-orange-800'
              }`}>
                {isAppInstalled ? 'Aplikasi Terunduh' : 'Install App on Mobile Device'}
              </h3>
              <p className={`text-sm font-medium ${
                isAppInstalled ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isAppInstalled 
                  ? 'App ready – notifications, sound & vibration enabled'
                  : 'Download for Android/iOS – notifications, sound, chat'
                }
              </p>
            </div>
          </div>
          
          {/* Download App button */}
          <button
            onClick={handleSimpleDownload}
            disabled={isAppInstalled}
            className={`w-full rounded-xl py-4 px-6 flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isAppInstalled
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl hover:from-orange-600 hover:to-orange-700'
            }`}
          >
            {isAppInstalled ? (
              <>
                <Lock className="w-6 h-6" />
                <span>App downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                <span>Download App</span>
              </>
            )}
          </button>
          
          {/* Enhanced Features Info */}
          {!isAppInstalled && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1 text-orange-700">
                  <span>🔔</span>
                  <span className="font-medium">Notifikasi Instan</span>
                </div>
                <div className="flex items-center gap-1 text-orange-700">
                  <span>🎵</span>
                  <span className="font-medium">Suara Notifikasi</span>
                </div>
                <div className="flex items-center gap-1 text-orange-700">
                  <span>📳</span>
                  <span className="font-medium">Getaran Alert</span>
                </div>
                <div className="flex items-center gap-1 text-orange-700">
                  <span>💬</span>
                  <span className="font-medium">Chat Real-time</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Debug: Reset PWA State Button (only show when app is marked as installed) */}
          {isAppInstalled && (
            <button
              onClick={handleResetPWAState}
              className="mt-3 w-full py-2 text-xs text-orange-600 hover:text-orange-800 border border-orange-300 rounded-lg hover:bg-orange-50 transition-all"
              title="Reset download state for testing"
            >
              🔄 Reset Download State (Dev)
            </button>
          )}
        </div>
          );
        })()}
      </div>
    </div>

    {showEnhancedNav && (
      <div className="fixed inset-0 z-[120] flex flex-row-reverse">
        <button
          type="button"
          aria-label="Close menu"
          className="absolute inset-0 bg-black/50 z-[121]"
          onClick={() => setShowEnhancedNav(false)}
        />
        <div className="relative z-[122] w-full max-w-sm h-full overflow-y-auto bg-white shadow-2xl elite-slide-in-right">
          <EnhancedNavigation
            currentPage="status"
            onNavigate={(page) => { handleNavigate(page); setShowEnhancedNav(false); }}
            onClose={() => setShowEnhancedNav(false)}
            language={language}
            therapistData={{ ...therapist, pendingBookings: 2 }}
          />
        </div>
      </div>
    )}
    
    {/* iOS Install Instructions Modal */}
    <IOSInstallInstructions 
      isOpen={showIOSInstructions}
      onClose={() => setShowIOSInstructions(false)}
    />
    
    {/* Therapist Help Modal */}
    <TherapistHelpModal 
      isOpen={isHelpOpen}
      onClose={closeHelp}
      helpKey={currentHelpKey}
      content={dashboardHelp[currentHelpKey as keyof typeof dashboardHelp]}
      language="id"
    />
    
    {/* Booking Request Floating Window - Shows countdown timer and accept/reject buttons */}
    <BookingRequestCard 
      therapistId={therapist?.$id || therapist?.id}
      membershipTier="plus"
    />
    
    {/* Floating Chat Window - Always mounted, internally manages visibility */}
    <FloatingChatWindow
      userId={therapist?.id || therapist?.id || 'therapist'}
      userName={therapist?.name || 'Therapist'}
      userRole="therapist"
    />
    </>
    );
  } catch (error) {
    console.error('TherapistOnlineStatus render error:', error);
    return (
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] flex items-center justify-center bg-gray-50  " style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
        <div className="text-center p-6 max-w-md mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">Unable to load therapist dashboard. Please try refreshing the page.</p>
          <button
            onClick={async () => {
              try {
                const { softRecover } = await import('../../utils/softNavigation');
                softRecover();
              } catch {
                window.location.reload();
              }
            }}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Refresh Page
          </button>
          <div className="mt-4">
            <button
              onClick={onBack}
              className="text-orange-500 hover:text-orange-600 underline"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default TherapistOnlineStatus;

