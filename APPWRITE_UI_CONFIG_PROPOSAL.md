# Appwrite UI Configuration System - Proposal

## 🎯 **Problem Statement**

Current issues with hardcoded UI behavior:
- ❌ Popups appear unexpectedly causing layout shifts
- ❌ Cannot disable features without code deployment
- ❌ No A/B testing capability
- ❌ Cannot adjust timing/behavior remotely
- ❌ Hard to rollback UI changes quickly

## ✅ **Solution: Appwrite UI Config Collection**

### **Collection Structure**

#### **1. `ui_config` Collection**

```typescript
{
  $id: "app_ui_config",
  configKey: string,           // "welcome_popup", "location_modal", etc.
  enabled: boolean,             // Master switch
  settings: JSON,               // Configuration object
  priority: number,             // Display order (1 = highest)
  lastUpdated: datetime,
  updatedBy: string
}
```

#### **Example Documents:**

```json
// Welcome Popup Configuration
{
  "$id": "welcome_popup_config",
  "configKey": "welcome_popup",
  "enabled": true,
  "settings": {
    "delayMs": 1000,
    "showOnce": true,
    "dismissable": true,
    "coinAmount": 100,
    "animationType": "confetti"
  },
  "priority": 1
}

// Location Modal Configuration
{
  "$id": "location_modal_config",
  "configKey": "location_modal",
  "enabled": true,
  "settings": {
    "triggerOnLoad": true,
    "required": false,
    "delayMs": 2000,
    "dismissable": true,
    "reminder": {
      "enabled": true,
      "intervalDays": 7
    }
  },
  "priority": 2
}

// Feature Flags
{
  "$id": "feature_flags",
  "configKey": "features",
  "enabled": true,
  "settings": {
    "showDiscountBadges": true,
    "enableAnimations": true,
    "enableCoinSystem": true,
    "enableReviewPopup": true,
    "maintenanceMode": false,
    "minAppVersion": "2.0.0"
  },
  "priority": 100
}

// Layout Configuration
{
  "$id": "layout_config",
  "configKey": "layout",
  "enabled": true,
  "settings": {
    "cardSpacing": 16,
    "bannerHeight": 192,
    "imageQuality": "medium",
    "lazyLoadThreshold": 200,
    "animationDuration": 300
  },
  "priority": 99
}
```

---

## 🏗️ **Implementation**

### **1. Create Appwrite Collection**

```bash
# In Appwrite Console:
Database: indastreet_db
Collection: ui_config

Attributes:
- configKey (string, 50, required, unique)
- enabled (boolean, required, default: true)
- settings (string, 10000, required) // JSON string
- priority (integer, required, default: 50)
- lastUpdated (datetime, required)
- updatedBy (string, 100)

Permissions:
- Read: Any
- Create/Update/Delete: Admin only
```

### **2. Create Config Service**

```typescript
// lib/services/uiConfigService.ts
import { Client, Databases } from 'appwrite';
import { APP_CONFIG } from '../../config';

const client = new Client()
    .setEndpoint(APP_CONFIG.APPWRITE.ENDPOINT)
    .setProject(APP_CONFIG.APPWRITE.PROJECT_ID);

const databases = new Databases(client);

export interface UIConfig {
    configKey: string;
    enabled: boolean;
    settings: any; // Parsed JSON
    priority: number;
}

class UIConfigService {
    private cache: Map<string, UIConfig> = new Map();
    private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
    private lastFetch: number = 0;

    async getConfig(key: string): Promise<UIConfig | null> {
        // Check cache first
        if (this.cache.has(key) && Date.now() - this.lastFetch < this.cacheExpiry) {
            return this.cache.get(key)!;
        }

        try {
            const response = await databases.getDocument(
                APP_CONFIG.APPWRITE.DATABASE_ID,
                'ui_config',
                key
            );

            const config: UIConfig = {
                configKey: response.configKey,
                enabled: response.enabled,
                settings: JSON.parse(response.settings),
                priority: response.priority
            };

            this.cache.set(key, config);
            this.lastFetch = Date.now();
            
            return config;
        } catch (error) {
            console.error(`Failed to fetch UI config for ${key}:`, error);
            return null;
        }
    }

    async getAllConfigs(): Promise<UIConfig[]> {
        try {
            const response = await databases.listDocuments(
                APP_CONFIG.APPWRITE.DATABASE_ID,
                'ui_config'
            );

            return response.documents
                .map(doc => ({
                    configKey: doc.configKey,
                    enabled: doc.enabled,
                    settings: JSON.parse(doc.settings),
                    priority: doc.priority
                }))
                .sort((a, b) => a.priority - b.priority);
        } catch (error) {
            console.error('Failed to fetch all UI configs:', error);
            return [];
        }
    }

    clearCache() {
        this.cache.clear();
        this.lastFetch = 0;
    }
}

export const uiConfigService = new UIConfigService();
```

### **3. Create React Hook**

```typescript
// hooks/useUIConfig.ts
import { useState, useEffect } from 'react';
import { uiConfigService, UIConfig } from '../lib/services/uiConfigService';

export function useUIConfig(configKey: string, defaultSettings?: any) {
    const [config, setConfig] = useState<UIConfig | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadConfig() {
            setLoading(true);
            const fetchedConfig = await uiConfigService.getConfig(configKey);
            
            if (fetchedConfig) {
                setConfig(fetchedConfig);
            } else if (defaultSettings) {
                // Fallback to defaults
                setConfig({
                    configKey,
                    enabled: true,
                    settings: defaultSettings,
                    priority: 50
                });
            }
            
            setLoading(false);
        }

        loadConfig();
    }, [configKey]);

    return {
        config,
        loading,
        enabled: config?.enabled ?? false,
        settings: config?.settings ?? defaultSettings ?? {}
    };
}
```

### **4. Update Components to Use Config**

```typescript
// components/WelcomeCoinBonusPopup.tsx
import { useUIConfig } from '../hooks/useUIConfig';

export const WelcomeCoinBonusPopup = ({ user, onClose }: Props) => {
    const { enabled, settings, loading } = useUIConfig('welcome_popup', {
        delayMs: 1000,
        showOnce: true,
        dismissable: true,
        coinAmount: 100
    });

    const [show, setShow] = useState(false);

    useEffect(() => {
        if (!enabled || loading) return;

        // Check if already shown
        const popupSeen = localStorage.getItem('indastreet_welcome_popup_seen');
        if (settings.showOnce && popupSeen) return;

        // Show after delay
        const timer = setTimeout(() => {
            setShow(true);
        }, settings.delayMs);

        return () => clearTimeout(timer);
    }, [enabled, loading, settings]);

    if (!show || !enabled) return null;

    // Rest of component...
};
```

```typescript
// components/LocationModal.tsx
import { useUIConfig } from '../hooks/useUIConfig';

export const LocationModal = () => {
    const { enabled, settings } = useUIConfig('location_modal', {
        triggerOnLoad: true,
        required: false,
        delayMs: 2000
    });

    if (!enabled) return null;

    // Rest of component logic...
};
```

### **5. Update HomePage to Load Configs**

```typescript
// pages/HomePage.tsx
import { useEffect } from 'react';
import { uiConfigService } from '../lib/services/uiConfigService';

export const HomePage = () => {
    useEffect(() => {
        // Preload all UI configs on page load
        uiConfigService.getAllConfigs();
    }, []);

    // Rest of homepage...
};
```

---

## 📊 **Benefits**

### ✅ **Instant Control**
- Disable any popup/feature without deployment
- Adjust timing and behavior in real-time
- Emergency kill switch for problematic features

### ✅ **No Layout Shifts**
- Control when popups appear
- Proper sequencing and timing
- Prevent multiple popups at once

### ✅ **A/B Testing Ready**
```json
{
  "welcome_popup_variant_a": {
    "delayMs": 1000,
    "coinAmount": 100
  },
  "welcome_popup_variant_b": {
    "delayMs": 3000,
    "coinAmount": 150
  }
}
```

### ✅ **Analytics Integration**
```typescript
// Track which configs are active
analytics.track('ui_config_loaded', {
  configKey: 'welcome_popup',
  enabled: true,
  variant: settings.variant
});
```

### ✅ **Maintenance Mode**
```typescript
const { enabled: maintenanceMode } = useUIConfig('maintenance');
if (maintenanceMode) {
  return <MaintenancePage />;
}
```

---

## 🚀 **Migration Plan**

### Phase 1: Setup (30 min)
1. ✅ Create `ui_config` collection in Appwrite
2. ✅ Seed with current configurations
3. ✅ Create `uiConfigService`
4. ✅ Create `useUIConfig` hook

### Phase 2: Critical Popups (1 hour)
1. ✅ Migrate `WelcomeCoinBonusPopup`
2. ✅ Migrate `LocationModal`
3. ✅ Migrate `RegisterPromptPopup`
4. ✅ Test popup sequencing

### Phase 3: Feature Flags (30 min)
1. ✅ Migrate discount badges
2. ✅ Migrate animation toggles
3. ✅ Add maintenance mode

### Phase 4: Advanced (Future)
1. ⏳ Add A/B testing framework
2. ⏳ Add analytics tracking
3. ⏳ Build admin dashboard for config management

---

## 🎯 **Priority Configs to Migrate**

### High Priority (Do Now)
1. **welcome_popup** - First login popup
2. **location_modal** - Location permission
3. **feature_flags** - Master feature switches
4. **maintenance_mode** - Emergency disable

### Medium Priority
1. **review_popup** - Review prompts
2. **discount_badges** - Discount visibility
3. **booking_confirmation** - Booking modals

### Low Priority
1. **layout_config** - Spacing/sizing
2. **animation_config** - Animation settings
3. **theme_config** - Color schemes

---

## 🛡️ **Fallback Strategy**

Always provide defaults in case Appwrite is unreachable:

```typescript
const DEFAULT_CONFIGS = {
  welcome_popup: {
    enabled: true,
    delayMs: 1000,
    showOnce: true
  },
  location_modal: {
    enabled: true,
    delayMs: 2000
  },
  features: {
    maintenanceMode: false,
    showDiscountBadges: true
  }
};

// Use defaults if fetch fails
const config = await uiConfigService.getConfig('welcome_popup') 
  ?? DEFAULT_CONFIGS.welcome_popup;
```

---

## 📝 **Admin Interface**

Create simple admin page to manage configs:

```typescript
// pages/AdminUIConfigPage.tsx
export const AdminUIConfigPage = () => {
    const [configs, setConfigs] = useState([]);

    const updateConfig = async (key: string, settings: any) => {
        await databases.updateDocument(
            DATABASE_ID,
            'ui_config',
            key,
            { settings: JSON.stringify(settings) }
        );
        uiConfigService.clearCache();
    };

    return (
        <div>
            <h1>UI Configuration Manager</h1>
            {configs.map(config => (
                <ConfigEditor 
                    key={config.configKey}
                    config={config}
                    onSave={updateConfig}
                />
            ))}
        </div>
    );
};
```

---

## ✅ **Next Steps**

**Would you like me to:**
1. ✅ Create the Appwrite collection schema
2. ✅ Build the `uiConfigService` and `useUIConfig` hook
3. ✅ Migrate the welcome popup as a proof-of-concept
4. ✅ Build the admin interface for managing configs

This will give you **complete control** over UI behavior without code deployments!
