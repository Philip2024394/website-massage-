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
     * Show installation blocking modal
     */
    static showInstallationBlockingModal(): HTMLElement {
        // Remove existing modal if any
        const existingModal = document.getElementById('pwa-installation-blocker');
        if (existingModal) {
            existingModal.remove();
        }

        // Create blocking modal
        const modal = document.createElement('div');
        modal.id = 'pwa-installation-blocker';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            border-radius: 20px;
            padding: 32px;
            max-width: 400px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            position: relative;
        `;

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        content.innerHTML = `
            <button id="pwa-modal-close-btn" style="
                position: absolute;
                top: 12px;
                right: 12px;
                width: 36px;
                height: 36px;
                background: #f97316;
                color: white;
                border: 2px solid white;
                border-radius: 50%;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                transition: all 0.2s;
                z-index: 10;
            " onmouseover="this.style.background='#ea580c'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='#f97316'; this.style.transform='scale(1)';" title="Close">✕</button>
            <div style="font-size: 60px; margin-bottom: 20px;">📱</div>
            <h2 style="color: #f97316; margin: 0 0 16px 0; font-size: 24px; font-weight: bold;">
                🚨 APP INSTALLATION REQUIRED
            </h2>
            <p style="color: #666; margin: 0 0 24px 0; line-height: 1.5;">
                <strong>You MUST install the IndaStreet app to receive booking notifications with sound!</strong>
            </p>
            <div style="background: #fef3e2; border: 2px solid #f97316; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left;">
                <h4 style="color: #f97316; margin: 0 0 8px 0; font-size: 14px;">🔊 Why this is critical:</h4>
                <ul style="color: #666; margin: 0; padding-left: 20px; font-size: 13px;">
                    <li>Custom notification sounds work ONLY in installed app</li>
                    <li>Background notifications when phone is locked</li>
                    <li>Stronger vibration patterns for urgent bookings</li>
                    <li>Faster app loading and better performance</li>
                </ul>
            </div>
            
            ${isIOS ? `
                <div style="background: #e6f7ff; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left;">
                    <h4 style="color: #1890ff; margin: 0 0 8px 0; font-size: 14px;">📱 iOS Installation Steps:</h4>
                    <ol style="color: #666; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.4;">
                        <li>Tap the <strong>Share button (⬆️)</strong> at bottom of Safari</li>
                        <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                        <li>Tap <strong>"Add"</strong> to confirm</li>
                        <li>Open the app from your home screen</li>
                    </ol>
                </div>
                <button id="pwa-ios-install-btn" style="
                    width: 100%;
                    background: #f97316;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 16px;
                ">I've Added It to Home Screen ✅</button>
            ` : `
                <button id="pwa-install-btn" style="
                    width: 100%;
                    background: #f97316;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 16px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin: 16px 0;
                ">📥 Install App Now</button>
                <button id="pwa-manual-install-btn" style="
                    width: 100%;
                    background: #6b7280;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px;
                    font-size: 14px;
                    cursor: pointer;
                ">📋 Show Manual Instructions</button>
            `}
            
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0;">
                This ensures you never miss important booking notifications!
            </p>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        // Add close button event listener
        const closeBtn = document.getElementById('pwa-modal-close-btn');
        closeBtn?.addEventListener('click', () => {
            // Enable bypass so modal doesn't reappear
            localStorage.setItem(this.BYPASS_KEY, 'true');
            console.log('✅ PWA installation modal closed - bypass enabled');
            modal.remove();
        });

        // Add event listeners
        if (isIOS) {
            const iosBtn = document.getElementById('pwa-ios-install-btn');
            iosBtn?.addEventListener('click', () => {
                localStorage.setItem('pwa-added-to-homescreen', 'true');
                modal.remove();
                window.location.reload();
            });
        } else {
            const installBtn = document.getElementById('pwa-install-btn');
            const manualBtn = document.getElementById('pwa-manual-install-btn');
            
            installBtn?.addEventListener('click', async () => {
                const success = await this.triggerInstallPrompt();
                if (success) {
                    modal.remove();
                }
            });

            manualBtn?.addEventListener('click', () => {
                this.showManualInstallInstructions();
            });
        }

        return modal;
    }

    /**
     * Trigger PWA install prompt
     */
    static async triggerInstallPrompt(): Promise<boolean> {
        const deferredPrompt = (window as any).deferredPrompt;
        
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                
                if (choiceResult.outcome === 'accepted') {
                    localStorage.setItem('pwa-install-completed', 'true');
                    console.log('✅ PWA installed successfully');
                    return true;
                }
            } catch (error) {
                console.error('❌ PWA installation failed:', error);
            }
        } else {
            // No install prompt available, show manual instructions
            this.showManualInstallInstructions();
        }
        
        return false;
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
     * Start monitoring installation status
     */
    static startMonitoring(): void {
        // Check immediately
        if (this.shouldBlockAccess()) {
            this.showInstallationBlockingModal();
        }

        // Check periodically
        setInterval(() => {
            if (this.shouldBlockAccess()) {
                this.showInstallationBlockingModal();
            }
        }, this.CHECK_INTERVAL);

        // Listen for app install events
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed via browser event');
            localStorage.setItem('pwa-install-completed', 'true');
            const modal = document.getElementById('pwa-installation-blocker');
            if (modal) modal.remove();
        });

        // Store deferred prompt for manual triggering
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            (window as any).deferredPrompt = e;
            console.log('💾 PWA install prompt stored');
        });

        console.log('👁️ PWA installation monitoring started');
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