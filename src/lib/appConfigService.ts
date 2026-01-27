/**
 * App Configuration Service
 * 
 * Manages global app settings including the membership system toggle
 * Allows admin to control which features are visible to users
 */

import React from 'react';
import { databases } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { ID } from 'appwrite';

export interface AppConfig {
    membershipSystemEnabled: boolean;
    coinRewardsEnabled: boolean;
    referralSystemEnabled: boolean;
    promotionsEnabled: boolean;
    lastUpdated: string;
    updatedBy: string;
}

const DEFAULT_CONFIG: AppConfig = {
    membershipSystemEnabled: false, // 🚨 CRITICAL: Default to FALSE - free system
    coinRewardsEnabled: true,
    referralSystemEnabled: true,
    promotionsEnabled: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'system'
};

export const appConfigService = {
    /**
     * Get current app configuration
     */
    async getConfig(): Promise<AppConfig> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.appConfig,
                []
            );

            if (response.documents.length > 0) {
                const config = response.documents[0];
                return {
                    membershipSystemEnabled: config.membershipSystemEnabled ?? false,
                    coinRewardsEnabled: config.coinRewardsEnabled ?? true,
                    referralSystemEnabled: config.referralSystemEnabled ?? true,
                    promotionsEnabled: config.promotionsEnabled ?? true,
                    lastUpdated: config.lastUpdated || config.$createdAt,
                    updatedBy: config.updatedBy || 'system'
                };
            }

            // Create default config if none exists
            return await this.createDefaultConfig();
        } catch (error) {
            console.error('❌ Error fetching app config:', error);
            // Return default config on error - ensures app always works
            return DEFAULT_CONFIG;
        }
    },

    /**
     * Update app configuration (Admin only)
     */
    async updateConfig(updates: Partial<AppConfig>, adminId: string): Promise<AppConfig> {
        try {
            const currentConfig = await this.getConfig();
            const updatedConfig = {
                ...currentConfig,
                ...updates,
                lastUpdated: new Date().toISOString(),
                updatedBy: adminId
            };

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.appConfig,
                []
            );

            if (response.documents.length > 0) {
                // Update existing config
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.appConfig,
                    response.documents[0].$id,
                    updatedConfig
                );
            } else {
                // Create new config
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.appConfig,
                    ID.unique(),
                    updatedConfig
                );
            }

            console.log('✅ App config updated successfully:', updatedConfig);
            
            // Broadcast config change to all connected clients
            this.broadcastConfigChange(updatedConfig);
            
            return updatedConfig;
        } catch (error) {
            console.error('❌ Error updating app config:', error);
            throw error;
        }
    },

    /**
     * Create default configuration
     */
    async createDefaultConfig(): Promise<AppConfig> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.appConfig,
                ID.unique(),
                DEFAULT_CONFIG
            );

            console.log('✅ Default app config created');
            return DEFAULT_CONFIG;
        } catch (error) {
            console.error('❌ Error creating default config:', error);
            return DEFAULT_CONFIG;
        }
    },

    /**
     * Check if membership system is enabled
     * This is the key function used throughout the app
     */
    async isMembershipEnabled(): Promise<boolean> {
        try {
            const config = await this.getConfig();
            return config.membershipSystemEnabled;
        } catch (error) {
            console.error('❌ Error checking membership status:', error);
            return false; // Default to disabled on error - safe fallback
        }
    },

    /**
     * Toggle membership system on/off (Admin only)
     */
    async toggleMembershipSystem(enabled: boolean, adminId: string): Promise<boolean> {
        try {
            await this.updateConfig({ membershipSystemEnabled: enabled }, adminId);
            
            console.log(`🔄 Membership system ${enabled ? 'ENABLED' : 'DISABLED'} by admin: ${adminId}`);
            
            return enabled;
        } catch (error) {
            console.error('❌ Error toggling membership system:', error);
            throw error;
        }
    },

    /**
     * Broadcast configuration changes to all clients
     */
    broadcastConfigChange(config: AppConfig): void {
        // Update localStorage for immediate UI updates
        localStorage.setItem('app_config', JSON.stringify(config));
        
        // Dispatch custom event for real-time updates
        const event = new CustomEvent('appConfigChanged', { 
            detail: config 
        });
        window.dispatchEvent(event);
        
        // Update global app state if available
        if ((window as any).updateAppConfig) {
            (window as any).updateAppConfig(config);
        }
    },

    /**
     * Subscribe to configuration changes
     */
    subscribeToConfigChanges(callback: (config: AppConfig) => void): () => void {
        const handleConfigChange = (event: CustomEvent) => {
            callback(event.detail);
        };

        window.addEventListener('appConfigChanged', handleConfigChange as EventListener);

        return () => {
            window.removeEventListener('appConfigChanged', handleConfigChange as EventListener);
        };
    },

    /**
     * Get cached config from localStorage (fast access)
     */
    getCachedConfig(): AppConfig | null {
        try {
            const cached = localStorage.getItem('app_config');
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('❌ Error reading cached config:', error);
            return null;
        }
    },

    /**
     * Initialize config cache
     */
    async initializeCache(): Promise<void> {
        try {
            const config = await this.getConfig();
            localStorage.setItem('app_config', JSON.stringify(config));
        } catch (error) {
            console.error('❌ Error initializing config cache:', error);
        }
    }
};

/**
 * React hook for membership system status
 */
export const useMembershipEnabled = () => {
    const [enabled, setEnabled] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        const loadConfig = async () => {
            try {
                // Try cache first for immediate response
                const cached = appConfigService.getCachedConfig();
                if (cached) {
                    setEnabled(cached.membershipSystemEnabled);
                    setLoading(false);
                }

                // Then fetch latest from server
                const config = await appConfigService.getConfig();
                setEnabled(config.membershipSystemEnabled);
                setLoading(false);
            } catch (error) {
                console.error('❌ Error loading membership status:', error);
                setEnabled(false); // Safe default
                setLoading(false);
            }
        };

        loadConfig();

        // Subscribe to real-time changes
        const unsubscribe = appConfigService.subscribeToConfigChanges((config) => {
            setEnabled(config.membershipSystemEnabled);
        });

        return unsubscribe;
    }, []);

    return { enabled, loading };
};

export default appConfigService;