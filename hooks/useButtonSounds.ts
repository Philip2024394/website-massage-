// React Hook for Button Sounds
// Easy integration with React components for UI feedback

import { useCallback, useEffect } from 'react';
import { buttonSoundService, ButtonSoundType } from '../lib/buttonSoundService';

export interface UseButtonSoundsOptions {
    enabled?: boolean;
    preload?: boolean;
    volume?: number;
}

export interface ButtonSoundHandlers {
    playClick: (volume?: number, pitch?: number) => Promise<void>;
    playHover: () => Promise<void>;
    playSuccess: () => Promise<void>;
    playError: () => Promise<void>;
    playNavigation: () => Promise<void>;
    playToggle: (isOn: boolean) => Promise<void>;
    playDelete: () => Promise<void>;
    playSubmit: () => Promise<void>;
    playCustom: (type: ButtonSoundType['type'], volume?: number, pitch?: number) => Promise<void>;
    testSound: (type?: ButtonSoundType['type']) => Promise<void>;
    setEnabled: (enabled: boolean) => void;
    isEnabled: boolean;
}

export function useButtonSounds(options: UseButtonSoundsOptions = {}): ButtonSoundHandlers {
    const {
        enabled = true,
        preload = true,
        volume
    } = options;

    // Initialize service
    useEffect(() => {
        if (enabled !== undefined) {
            buttonSoundService.setEnabled(enabled);
        }
        
        if (volume !== undefined) {
            buttonSoundService.setGlobalVolume(volume);
        }
        
        if (preload) {
            buttonSoundService.preloadButtonSounds().catch(error => {
                console.warn('Failed to preload button sounds:', error);
            });
        }
    }, [enabled, preload, volume]);

    // Sound handlers
    const playClick = useCallback(async (volume?: number, pitch?: number) => {
        await buttonSoundService.playClick(volume, pitch);
    }, []);

    const playHover = useCallback(async () => {
        await buttonSoundService.playHover();
    }, []);

    const playSuccess = useCallback(async () => {
        await buttonSoundService.playSuccess();
    }, []);

    const playError = useCallback(async () => {
        await buttonSoundService.playError();
    }, []);

    const playNavigation = useCallback(async () => {
        await buttonSoundService.playNavigation();
    }, []);

    const playToggle = useCallback(async (isOn: boolean) => {
        await buttonSoundService.playToggle(isOn);
    }, []);

    const playDelete = useCallback(async () => {
        await buttonSoundService.playDelete();
    }, []);

    const playSubmit = useCallback(async () => {
        await buttonSoundService.playSubmit();
    }, []);

    const playCustom = useCallback(async (
        type: ButtonSoundType['type'], 
        volume?: number, 
        pitch?: number
    ) => {
        if (type === 'click') {
            await buttonSoundService.playClick(volume, pitch);
        } else if (type === 'hover') {
            await buttonSoundService.playHover();
        } else {
            await buttonSoundService.testButtonSound(type);
        }
    }, []);

    const testSound = useCallback(async (type: ButtonSoundType['type'] = 'click') => {
        await buttonSoundService.testButtonSound(type);
    }, []);

    const setEnabled = useCallback((enabled: boolean) => {
        buttonSoundService.setEnabled(enabled);
    }, []);

    return {
        playClick,
        playHover,
        playSuccess,
        playError,
        playNavigation,
        playToggle,
        playDelete,
        playSubmit,
        playCustom,
        testSound,
        setEnabled,
        isEnabled: buttonSoundService.isButtonSoundsEnabled()
    };
}

export default useButtonSounds;