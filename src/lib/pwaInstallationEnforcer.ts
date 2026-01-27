/**
 * PWA Installation Enforcer Service
 * Forces therapists to install the app before accessing main features
 */

export interface PWAInstallationStatus {
    isInstalled: boolean;
    canBypass: boolean;
    installMethod: 'chrome' | 'ios' | 'manual' | 'unknown';
    lastCheckTime: number;
}

export class PWAInstallationEnforcer {
    private static readonly STORAGE_KEY = 'pwa-installation-status';
    private static readonly BYPASS_KEY = 'pwa-bypass-allowed';
    private static readonly CHECK_INTERVAL = 5000; // 5 seconds

    /**
     * Check if PWA is properly installed
     */
    static checkInstallationStatus(): PWAInstallationStatus {
        // Check multiple installation indicators
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        const isInstallPromptUsed = localStorage.getItem('pwa-install-completed') === 'true';
        const hasHomeScreenIcon = localStorage.getItem('pwa-added-to-homescreen') === 'true';
        
        // Detect installation method
        let installMethod: PWAInstallationStatus['installMethod'] = 'unknown';
        if (isStandalone) installMethod = 'chrome';
        if (isInWebAppiOS) installMethod = 'ios';
        if (isInstallPromptUsed) installMethod = 'chrome';

        const isInstalled = isStandalone || isInWebAppiOS || isInstallPromptUsed || hasHomeScreenIcon;
        
        // Check if bypass is allowed (for testing or troubleshooting)
        const canBypass = localStorage.getItem(this.BYPASS_KEY) === 'true';

        const status: PWAInstallationStatus = {
            isInstalled,
            canBypass,
            installMethod,
            lastCheckTime: Date.now()
        };

        // Store status
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(status));
        
        console.log('🔍 PWA Installation Status:', status);
        return status;
    }

    /**
     * Force installation with aggressive blocking
     */
    static shouldBlockAccess(): boolean {
        const status = this.checkInstallationStatus();
        
        // Allow bypass for testing
        if (status.canBypass) {
            console.log('⚠️ PWA installation check bypassed for testing');
            return false;
        }

        return !status.isInstalled;
    }

    /**
     * Show installation blocking modal (DISABLED - using auto-trigger only)
     * No confusing modals or close buttons - clean UX
     */
    static showInstallationBlockingModal(): HTMLElement | null {
        console.log('ℹ️ Installation modal disabled - using auto-trigger only');
        console.log('💡 Native browser install prompt will appear automatically');
        return null;
    }

    /**
     * Trigger PWA install prompt (manual fallback - can be called from buttons)
     */
    static async triggerInstallPrompt(): Promise<boolean> {
        const deferredPrompt = (window as any).deferredPrompt;
        
        if (deferredPrompt) {
            try {
                console.log('🚀 Triggering PWA install prompt...');
                await deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                
                if (choiceResult.outcome === 'accepted') {
                    localStorage.setItem('pwa-install-completed', 'true');
                    console.log('✅ PWA installed successfully');
                    this.showSuccessMessage();
                    return true;
                } else {
                    console.log('❌ User declined installation');
                    return false;
                }
            } catch (error) {
                console.error('❌ PWA installation failed:', error);
                return false;
            }
        } else {
            console.log('⚠️ No install prompt available - prompt may have been consumed or browser doesn\'t support it');
            return false;
        }
    }

    /**
     * Show manual installation instructions
     */
    static showManualInstallInstructions(): void {
        alert(`📱 Manual Installation Instructions:

Chrome/Edge (Android & Desktop):
1. Look for "Install" icon in address bar
2. Or go to browser menu → "Install IndaStreet"
3. Confirm installation

Firefox:
1. Go to browser menu (⋮)
2. Select "Install"
3. Confirm installation

Samsung Internet:
1. Tap menu (☰)
2. Select "Add page to" → "Home screen"
3. Confirm

The app icon will appear on your home screen/desktop!`);
    }

    /**
     * Enable bypass for testing (developers only)
     */
    static enableBypass(): void {
        localStorage.setItem(this.BYPASS_KEY, 'true');
        console.log('⚠️ PWA installation bypass enabled');
    }

    /**
     * Disable bypass
     */
    static disableBypass(): void {
        localStorage.removeItem(this.BYPASS_KEY);
        console.log('✅ PWA installation bypass disabled');
    }

    /**
     * Start monitoring installation status with auto-trigger
     */
    static startMonitoring(): void {
        console.log('👁️ PWA installation monitoring started with auto-trigger');
        
        // Check immediately
        const status = this.checkInstallationStatus();
        if (!status.isInstalled && !status.canBypass) {
            console.log('🚀 PWA not installed - will show install prompt automatically');
        }

        // Listen for app install events
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed via browser event');
            localStorage.setItem('pwa-install-completed', 'true');
            const modal = document.getElementById('pwa-installation-blocker');
            if (modal) modal.remove();
            // Reload to refresh status
            setTimeout(() => window.location.reload(), 500);
        });

        // Auto-trigger install prompt when available
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            (window as any).deferredPrompt = e;
            console.log('💾 PWA install prompt available');
            
            // Check if not installed and not bypassed
            const currentStatus = this.checkInstallationStatus();
            if (!currentStatus.isInstalled && !currentStatus.canBypass) {
                console.log('🎯 Auto-triggering PWA install prompt...');
                // Auto-trigger after short delay to ensure page is loaded
                setTimeout(() => {
                    this.autoTriggerInstallPrompt(e);
                }, 1000);
            }
        });

        // Check periodically for non-installed users
        const checkInterval = setInterval(() => {
            const currentStatus = this.checkInstallationStatus();
            if (currentStatus.isInstalled) {
                clearInterval(checkInterval);
                console.log('✅ PWA installed - stopping monitoring');
            }
            // No modal shown - only auto-trigger on beforeinstallprompt event
        }, this.CHECK_INTERVAL);
    }

    /**
     * Auto-trigger installation prompt (one-click install)
     */
    static async autoTriggerInstallPrompt(promptEvent: any): Promise<void> {
        try {
            console.log('🚀 Showing PWA install prompt automatically...');
            
            // Show the browser's native install prompt
            await promptEvent.prompt();
            
            // Wait for user choice
            const choiceResult = await promptEvent.userChoice;
            
            if (choiceResult.outcome === 'accepted') {
                console.log('✅ User accepted PWA installation!');
                localStorage.setItem('pwa-install-completed', 'true');
                
                // Show success message
                this.showSuccessMessage();
                
                // Reload after short delay
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                console.log('❌ User declined PWA installation');
                // User declined - respect their choice, no confusing modals
                // They can install later via browser menu if needed
            }
        } catch (error) {
            console.error('❌ Auto-trigger PWA install failed:', error);
            // Show simple alert only if critical error
            console.log('💡 Tip: Use browser menu to install app manually');
        }
    }

    /**
     * Show success message after installation
     */
    static showSuccessMessage(): void {
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #10b981;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: bold;
            z-index: 999999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease-out;
        `;
        successDiv.textContent = '✅ App installed! Opening in app mode...';
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 2000);
    }

    /**
     * Force refresh installation status
     */
    static forceRefreshStatus(): void {
        localStorage.removeItem(this.STORAGE_KEY);
        const status = this.checkInstallationStatus();
        console.log('🔄 PWA installation status refreshed:', status);
        return status;
    }
}

export default PWAInstallationEnforcer;