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
    settings: any;
    priority: number;
}

// Default configurations (fallback if Appwrite unavailable)
const DEFAULT_CONFIGS: Record<string, any> = {
    book_now_behavior: {
        type: 'whatsapp',              // 'whatsapp' | 'popup' | 'schedule'
        skipPopup: true,               // Never show popup
        message: "Hello! I'm interested in booking a massage session. Can you help me schedule an appointment?",
        openInNewTab: true
    },
    schedule_behavior: {
        type: 'whatsapp',              // 'whatsapp' | 'popup'
        skipPopup: true,
        message: "Hello! I'd like to schedule a massage appointment. What times are available?",
        openInNewTab: true
    },
    welcome_popup: {
        enabled: true,
        delayMs: 1000,
        showOnce: true,
        dismissable: true
    },
    location_modal: {
        enabled: true,
        triggerOnLoad: false,
        delayMs: 2000,
        dismissable: true
    },
    features: {
        showDiscountBadges: true,
        enableAnimations: true,
        enableCoinSystem: true,
        maintenanceMode: false
    }
};

class UIConfigService {
    private cache: Map<string, UIConfig> = new Map();
    private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
    private lastFetch: Map<string, number> = new Map();

    async getConfig(key: string): Promise<UIConfig> {
        // Check cache first
        const lastFetchTime = this.lastFetch.get(key) || 0;
        if (this.cache.has(key) && Date.now() - lastFetchTime < this.cacheExpiry) {
            console.log(`✅ Using cached config for: ${key}`);
            return this.cache.get(key)!;
        }

        try {
            console.log(`🔍 Fetching config from Appwrite: ${key}`);
            const response = await databases.getDocument(
                APP_CONFIG.APPWRITE.DATABASE_ID,
                'ui_config',
                key
            );

            const config: UIConfig = {
                configKey: response.configKey,
                enabled: response.enabled,
                settings: JSON.parse(response.settings),
                priority: response.priority || 50
            };

            this.cache.set(key, config);
            this.lastFetch.set(key, Date.now());
            
            console.log(`✅ Config loaded from Appwrite:`, config);
            return config;
        } catch (error) {
            console.warn(`⚠️ Failed to fetch UI config for ${key}, using defaults:`, error);
            
            // Return default config
            const defaultSettings = DEFAULT_CONFIGS[key] || {};
            const defaultConfig: UIConfig = {
                configKey: key,
                enabled: true,
                settings: defaultSettings,
                priority: 50
            };
            
            return defaultConfig;
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
                    priority: doc.priority || 50
                }))
                .sort((a, b) => a.priority - b.priority);
        } catch (error) {
            console.error('Failed to fetch all UI configs:', error);
            return [];
        }
    }

    clearCache() {
        this.cache.clear();
        this.lastFetch.clear();
        console.log('🗑️ UI Config cache cleared');
    }

    // Get default config without Appwrite call
    getDefaultConfig(key: string): UIConfig {
        const defaultSettings = DEFAULT_CONFIGS[key] || {};
        return {
            configKey: key,
            enabled: true,
            settings: defaultSettings,
            priority: 50
        };
    }
}

export const uiConfigService = new UIConfigService();
