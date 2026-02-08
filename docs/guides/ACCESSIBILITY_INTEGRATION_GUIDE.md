# 🔌 Accessibility Integration Guide

## Overview
This guide shows how to integrate the accessibility components with your existing Appwrite backend and therapist dashboard system.

## 🚨 Current Status

**What's Created:**
- ✅ 5 Complete accessibility UI components
- ✅ Appwrite integration hooks (`useAccessibilityAppwrite.ts`)
- ✅ Unified type definitions (`types.ts`)
- ✅ Integrated dashboard component (`IntegratedAccessibilityDashboard.tsx`)

**What's Missing:**
- ❌ Appwrite collections for accessibility data
- ❌ Integration with existing therapist dashboard
- ❌ Connection to live chat/booking systems

## 🏗️ Step 1: Create Appwrite Collections

You need to create these collections in your Appwrite console:

### Collection 1: `accessibility_settings`
```json
{
  "name": "Accessibility Settings",
  "id": "accessibility_settings",
  "attributes": [
    {"key": "therapistId", "type": "string", "size": 255, "required": false},
    {"key": "userId", "type": "string", "size": 255, "required": false},
    {"key": "userType", "type": "string", "size": 50, "required": true},
    {"key": "visualTheme", "type": "string", "size": 5000, "required": false},
    {"key": "highContrastMode", "type": "boolean", "required": false, "default": false},
    {"key": "darkMode", "type": "boolean", "required": false, "default": false},
    {"key": "fontSize", "type": "integer", "required": false, "default": 100},
    {"key": "reducedMotion", "type": "boolean", "required": false, "default": false},
    {"key": "colorBlindnessFilter", "type": "string", "size": 255, "required": false},
    {"key": "screenReaderEnabled", "type": "boolean", "required": false, "default": false},
    {"key": "voiceVolume", "type": "double", "required": false, "default": 0.7},
    {"key": "speechRate", "type": "double", "required": false, "default": 1.0},
    {"key": "announcements", "type": "string", "size": 10000, "required": false},
    {"key": "keyboardNavigationEnabled", "type": "boolean", "required": false, "default": false},
    {"key": "focusVisible", "type": "boolean", "required": false, "default": true},
    {"key": "customShortcuts", "type": "string", "size": 5000, "required": false},
    {"key": "wcagComplianceLevel", "type": "string", "size": 10, "required": false, "default": "AA"},
    {"key": "lastComplianceCheck", "type": "datetime", "required": false},
    {"key": "accessibilityIssues", "type": "string", "size": 10000, "required": false}
  ]
}
```

### Collection 2: `accessibility_analytics`
```json
{
  "name": "Accessibility Analytics",
  "id": "accessibility_analytics", 
  "attributes": [
    {"key": "therapistId", "type": "string", "size": 255, "required": false},
    {"key": "userId", "type": "string", "size": 255, "required": false},
    {"key": "userType", "type": "string", "size": 50, "required": true},
    {"key": "accessibilityFeaturesUsed", "type": "string", "size": 5000, "required": false},
    {"key": "screenReaderInteractions", "type": "integer", "required": false, "default": 0},
    {"key": "keyboardNavigationEvents", "type": "integer", "required": false, "default": 0},
    {"key": "complianceScoreHistory", "type": "string", "size": 10000, "required": false},
    {"key": "highContrastModeUsage", "type": "integer", "required": false, "default": 0},
    {"key": "voiceAnnouncementsUsed", "type": "integer", "required": false, "default": 0},
    {"key": "customShortcutsCreated", "type": "integer", "required": false, "default": 0},
    {"key": "pageLoadTimeWithA11y", "type": "double", "required": false, "default": 0},
    {"key": "interactionSuccessRate", "type": "double", "required": false, "default": 100},
    {"key": "lastAccessed", "type": "datetime", "required": false}
  ]
}
```

## 🏗️ Step 2: Update Appwrite Configuration

Add the new collections to your `src/lib/appwrite.config.ts`:

```typescript
export const APPWRITE_CONFIG = {
    // ... existing config
    collections: {
        // ... existing collections
        therapists: VALIDATED_COLLECTIONS.therapists,
        bookings: VALIDATED_COLLECTIONS.bookings,
        
        // NEW: Accessibility collections
        accessibilitySettings: 'accessibility_settings',
        accessibilityAnalytics: 'accessibility_analytics',
    }
};
```

## 🏗️ Step 3: Add to Therapist Dashboard

### Option A: Add as New Tab
In your `src/pages/therapist/TherapistDashboard.tsx` (or similar):

```tsx
import IntegratedAccessibilityDashboard from '../../components/accessibility/IntegratedAccessibilityDashboard';

const TherapistDashboard = ({ therapist }) => {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <div>
      {/* Your existing tabs */}
      <nav>
        <button onClick={() => setActiveTab('bookings')}>Bookings</button>
        <button onClick={() => setActiveTab('earnings')}>Earnings</button>
        <button onClick={() => setActiveTab('accessibility')}>Accessibility</button>
      </nav>

      {/* Tab content */}
      {activeTab === 'accessibility' && (
        <IntegratedAccessibilityDashboard 
          therapistId={therapist.$id}
          onComplianceUpdate={(score) => {
            console.log('Compliance updated:', score);
          }}
        />
      )}
    </div>
  );
};
```

### Option B: Add as Settings Section
In your settings/profile page:

```tsx
import { useAccessibilitySettings } from '../../hooks/useAccessibilityAppwrite';

const TherapistSettings = ({ therapistId }) => {
  const { settings, saveSettings } = useAccessibilitySettings(therapistId);

  return (
    <div>
      {/* Existing settings */}
      
      {/* Accessibility Settings Section */}
      <section className="bg-white p-6 rounded-lg">
        <h3>Accessibility Preferences</h3>
        
        <label>
          <input 
            type="checkbox" 
            checked={settings?.highContrastMode || false}
            onChange={async (e) => {
              await saveSettings({ highContrastMode: e.target.checked });
            }}
          />
          Enable High Contrast Mode
        </label>
        
        <label>
          <input 
            type="checkbox" 
            checked={settings?.screenReaderEnabled || false}
            onChange={async (e) => {
              await saveSettings({ screenReaderEnabled: e.target.checked });
            }}
          />
          Enable Screen Reader Support
        </label>
      </section>
    </div>
  );
};
```

## 🏗️ Step 4: Connect to Booking System

Add accessibility requirements to your booking flow:

```tsx
import { useBookingAccessibility } from '../../hooks/useAccessibilityAppwrite';

const BookingForm = ({ therapistId, onBookingCreate }) => {
  const [accessibilityNeeds, setAccessibilityNeeds] = useState([]);

  const handleBookingSubmit = async (bookingData) => {
    // Create booking with accessibility requirements
    const booking = await bookingService.create({
      ...bookingData,
      therapistId,
      accessibilityRequirements: JSON.stringify(accessibilityNeeds)
    });

    onBookingCreate(booking);
  };

  return (
    <form onSubmit={handleBookingSubmit}>
      {/* Existing booking fields */}
      
      {/* Accessibility Requirements */}
      <fieldset>
        <legend>Accessibility Accommodations</legend>
        
        <label>
          <input 
            type="checkbox" 
            value="visual-impairment"
            onChange={(e) => {
              if (e.target.checked) {
                setAccessibilityNeeds(prev => [...prev, e.target.value]);
              } else {
                setAccessibilityNeeds(prev => prev.filter(need => need !== e.target.value));
              }
            }}
          />
          Visual impairment support needed
        </label>
        
        <label>
          <input 
            type="checkbox" 
            value="hearing-impairment"
            onChange={(e) => {
              // Similar logic
            }}
          />
          Hearing impairment support needed
        </label>
      </fieldset>
    </form>
  );
};
```

## 🏗️ Step 5: Connect to Chat System

Add accessibility features to your chat:

```tsx
import { useAccessibilitySettings } from '../../hooks/useAccessibilityAppwrite';

const ChatWindow = ({ therapistId, customerId }) => {
  const { settings } = useAccessibilitySettings(therapistId);
  const [messages, setMessages] = useState([]);

  // Screen reader announcements for new messages
  useEffect(() => {
    if (settings?.screenReaderEnabled && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      const announcement = new SpeechSynthesisUtterance(
        `New message: ${latestMessage.content}`
      );
      announcement.volume = settings.voiceVolume || 0.7;
      announcement.rate = settings.speechRate || 1.0;
      speechSynthesis.speak(announcement);
    }
  }, [messages, settings]);

  return (
    <div className={`chat-window ${settings?.highContrastMode ? 'high-contrast' : ''}`}>
      {/* Chat messages with accessibility attributes */}
      <div 
        role="log" 
        aria-live="polite" 
        aria-label="Chat messages"
      >
        {messages.map(message => (
          <div 
            key={message.id}
            role="article"
            aria-label={`Message from ${message.senderName}`}
          >
            {message.content}
          </div>
        ))}
      </div>
      
      {/* Accessible message input */}
      <input 
        aria-label="Type your message"
        placeholder="Type your message..."
        style={{
          fontSize: settings?.fontSize ? `${settings.fontSize}%` : '100%'
        }}
      />
    </div>
  );
};
```

## 🚀 Step 6: Testing

1. **Create Collections**: Set up the Appwrite collections first
2. **Test Integration**: Add `IntegratedAccessibilityDashboard` to a test page
3. **Verify Data Flow**: Check that settings save to Appwrite
4. **Test Features**: Enable each accessibility feature and verify functionality

## 📱 Usage Example

```tsx
// In your therapist dashboard
import IntegratedAccessibilityDashboard from '../components/accessibility/IntegratedAccessibilityDashboard';

<IntegratedAccessibilityDashboard 
  therapistId={therapist.$id}
  onComplianceUpdate={(score) => {
    // Update therapist profile with compliance score
    therapistService.update(therapist.$id, { 
      accessibilityScore: score 
    });
  }}
  onFeatureUsage={(feature) => {
    // Track feature usage for analytics
    console.log(`Feature used: ${feature}`);
  }}
/>
```

## 🔧 Next Steps

1. Create the Appwrite collections
2. Test the integration with a single therapist
3. Add to your existing dashboard navigation
4. Connect to chat and booking systems
5. Test with real accessibility tools (screen readers, etc.)

The components are now ready to connect to your live data! 🚀