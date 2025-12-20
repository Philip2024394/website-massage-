import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt(): Promise<void>;
    readonly userChoice: Promise<{outcome: 'accepted' | 'dismissed', platform: string}>;
}

interface UsePWAReturn {
    deferredPrompt: BeforeInstallPromptEvent | null;
    isAppInstalled: boolean;
    handleInstallApp: () => void;
}

export const usePWA = (): UsePWAReturn => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsAppInstalled(true);
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        // Listen for appinstalled event
        const handleAppInstalled = () => {
            setIsAppInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallApp = async () => {
        if (!deferredPrompt) {
            console.log('No install prompt available');
            return;
        }

        try {
            // Show the install prompt
            await deferredPrompt.prompt();
            
            // Wait for the user's response
            const choiceResult = await deferredPrompt.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                setIsAppInstalled(true);
            } else {
                console.log('User dismissed the install prompt');
            }
            
            // Clear the deferred prompt
            setDeferredPrompt(null);
        } catch (error) {
            console.error('Error installing app:', error);
        }
    };

    return {
        deferredPrompt,
        isAppInstalled,
        handleInstallApp
    };
};
