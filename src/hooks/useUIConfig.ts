// hooks/useUIConfig.ts
import { useState, useEffect } from 'react';
import { uiConfigService, UIConfig } from '../lib/services/uiConfigService';

interface UseUIConfigReturn {
    config: UIConfig | null;
    loading: boolean;
    enabled: boolean;
    settings: any;
    refresh: () => Promise<void>;
}

export function useUIConfig(configKey: string): UseUIConfigReturn {
    const [config, setConfig] = useState<UIConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const fetchedConfig = await uiConfigService.getConfig(configKey);
            setConfig(fetchedConfig);
        } catch (error) {
            console.error(`Error loading config ${configKey}:`, error);
            // Use default config
            const defaultConfig = uiConfigService.getDefaultConfig(configKey);
            setConfig(defaultConfig);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, [configKey]);

    const refresh = async () => {
        uiConfigService.clearCache();
        await loadConfig();
    };

    return {
        config,
        loading,
        enabled: config?.enabled ?? true,
        settings: config?.settings ?? {},
        refresh
    };
}
