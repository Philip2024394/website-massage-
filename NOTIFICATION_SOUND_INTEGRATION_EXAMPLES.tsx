/**
 * QUICK INTEGRATION EXAMPLE
 * How to integrate PWA notification sound system into existing dashboards
 * 
 * COPY-PASTE READY CODE
 * 
 * NOTE: This is a documentation/example file. Some placeholder components are used
 * for illustration purposes. Replace with your actual components when implementing.
 */

import React, { useEffect } from 'react';
import NotificationSoundSettings from './src/components/NotificationSoundSettings';
import IOSNotificationPrompt from './src/components/IOSNotificationPrompt';
import { pwaNotificationSoundHandler } from './src/services/pwaNotificationSoundHandler';
import { notificationSoundSettings } from './src/services/notificationSoundSettings';

// Placeholder components for examples (replace with your actual components)
const BookingsList = () => <div>Your BookingsList component</div>;
const MessagesList = () => <div>Your MessagesList component</div>;
const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="sidebar">{children}</div>;
const BookingRequests = () => <div>Your BookingRequests component</div>;

// =============================================================================
// EXAMPLE 1: THERAPIST DASHBOARD INTEGRATION
// =============================================================================

export const TherapistDashboardWithNotifications = () => {
  // Auto-initialize sound handler on mount
  useEffect(() => {
    // Sound handler is already initialized on import
    // This is just for logging
    console.log('✅ PWA Notification Sound System ready');
  }, []);

  return (
    <div>
      {/* iOS Permission Prompt - Shows automatically on iOS PWA */}
      <IOSNotificationPrompt 
        autoShow={true}
        onPermissionGranted={() => {
          console.log('✅ Therapist granted notification permission');
          // Optional: Track in analytics
        }}
        onPermissionDenied={() => {
          console.log('⚠️ Therapist denied notification permission');
          // Optional: Show alternative guidance
        }}
      />

      {/* Main Dashboard Content */}
      <div className="p-6">
        <h1>Therapist Dashboard</h1>
        
        {/* Existing dashboard components */}
        <BookingsList />
        <MessagesList />
        
        {/* Settings Page/Modal */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
          <NotificationSoundSettings 
            showVolumeControl={true}
            showVibrationControl={true}
          />
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// EXAMPLE 2: PLACE DASHBOARD INTEGRATION
// =============================================================================

export const PlaceDashboardWithNotifications = () => {
  return (
    <div>
      {/* Compact iOS prompt for place owners */}
      <IOSNotificationPrompt autoShow={false} />

      <div className="p-6">
        <h1>Place Dashboard</h1>
        
        {/* Settings in sidebar/dropdown */}
        <Sidebar>
          <NotificationSoundSettings className="p-4" />
        </Sidebar>
        
        <BookingRequests />
      </div>
    </div>
  );
};

// =============================================================================
// EXAMPLE 3: MINIMAL INTEGRATION (Just import in App.tsx)
// =============================================================================

// In your main App.tsx or index.tsx:
/*
import { pwaNotificationSoundHandler } from './services/pwaNotificationSoundHandler';
import { notificationSoundSettings } from './services/notificationSoundSettings';

// Services auto-initialize - no additional code needed!
// Sound handler listens for Service Worker messages automatically
*/

// =============================================================================
// EXAMPLE 4: PROGRAMMATIC SOUND TEST
// =============================================================================

export const TestNotificationSound = () => {
  const handleTestSound = async () => {
    // Test booking notification sound
    await pwaNotificationSoundHandler.testSound('booking');
    
    // Test urgent sound
    await pwaNotificationSoundHandler.testSound('urgent');
  };

  return (
    <button onClick={handleTestSound}>
      🧪 Test Notification Sound
    </button>
  );
};

// =============================================================================
// EXAMPLE 5: USER SETTINGS PAGE
// =============================================================================

export const UserSettingsPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Account Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        {/* Account settings components */}
      </section>

      {/* Notification Sound Settings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <NotificationSoundSettings 
          showVolumeControl={true}
          showVibrationControl={true}
          className="space-y-4"
        />
      </section>

      {/* Other Settings */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Privacy</h2>
        {/* Privacy settings */}
      </section>
    </div>
  );
};

// =============================================================================
// EXAMPLE 6: CHECK SOUND STATUS PROGRAMMATICALLY
// =============================================================================

export const NotificationStatusChecker = () => {
  const isSoundEnabled = notificationSoundSettings.isSoundEnabled();
  const volume = notificationSoundSettings.getVolume();
  
  return (
    <div className="bg-gray-100 p-4 rounded">
      <p>Sound: {isSoundEnabled ? '✅ Enabled' : '🔇 Disabled'}</p>
      <p>Volume: {Math.round(volume * 100)}%</p>
    </div>
  );
};

// =============================================================================
// EXAMPLE 7: CONDITIONAL iOS PROMPT (ONLY SHOW ONCE)
// =============================================================================

export const SmartIOSPrompt = () => {
  const [hasSeenPrompt, setHasSeenPrompt] = React.useState(() => {
    return localStorage.getItem('ios_notification_prompt_seen') === 'true';
  });

  const handlePermissionGranted = () => {
    localStorage.setItem('ios_notification_prompt_seen', 'true');
    setHasSeenPrompt(true);
  };

  if (hasSeenPrompt) {
    return null; // Don't show again
  }

  return (
    <IOSNotificationPrompt 
      autoShow={true}
      onPermissionGranted={handlePermissionGranted}
    />
  );
};

// =============================================================================
// EXAMPLE 8: ADMIN DASHBOARD - DISABLE SOUNDS FOR ADMIN USERS
// =============================================================================

export const AdminDashboard = () => {
  useEffect(() => {
    // Admins might want sounds off by default
    const isAdmin = true; // Check actual admin status
    if (isAdmin) {
      // Optionally disable sounds for admin users
      // notificationSoundSettings.setSoundEnabled(false);
    }
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Admin can still enable sounds via settings if they want */}
      <NotificationSoundSettings />
    </div>
  );
};

// =============================================================================
// READY TO USE
// =============================================================================
/*
DEPLOYMENT STEPS:

1. Copy relevant example above to your dashboard file

2. Import components:
   import NotificationSoundSettings from '../components/NotificationSoundSettings';
   import IOSNotificationPrompt from '../components/IOSNotificationPrompt';

3. Services auto-initialize on import (no additional code needed)

4. Deploy and test on:
   - Android PWA (Chrome)
   - iOS PWA (Safari)
   - Desktop browser

5. Verify:
   ✅ Sound plays when notification arrives (screen locked)
   ✅ Sound plays when app is closed
   ✅ Settings toggle works
   ✅ iOS permission prompt appears
   ✅ Volume control works

6. Done! 🎉
*/
