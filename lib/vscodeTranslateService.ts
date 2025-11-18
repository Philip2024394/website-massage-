/**
 * VS Code Google Translate Integration Service
 * Automatically activates translation when English or Indonesian is selected
 */

import { LanguageCode } from '../services/autoTranslationService';
import type { Language } from '../types/pageTypes';

declare global {
    interface Window {
        vscode?: {
            postMessage: (message: any) => void;
        };
    }
}

interface VSCodeTranslateConfig {
    sourceLanguage: LanguageCode;
    targetLanguage: LanguageCode;
    autoActivate: boolean;
    showPopup: boolean;
}

class VSCodeTranslateService {
    private currentConfig: VSCodeTranslateConfig = {
        sourceLanguage: 'en',
        targetLanguage: 'id',
        autoActivate: true,
        showPopup: false
    };

    private currentGlobalLanguage: Language = 'en';

    /**
     * Initialize VS Code Google Translate integration
     */
    init() {
        console.log('🔧 Initializing VS Code Google Translate integration...');
        
        // Check if running in VS Code environment
        if (this.isVSCodeEnvironment()) {
            this.setupTranslateCommands();
            this.activateTranslateExtension();
            this.setupGlobalLanguageStorage();
        }
    }

    /**
     * Setup global language storage and retrieval
     */
    private setupGlobalLanguageStorage() {
        // Get stored language preference
        try {
            const stored = localStorage.getItem('vscode_current_language');
            if (stored === 'en' || stored === 'id' || stored === 'zh-CN' || stored === 'ru' || stored === 'ja' || stored === 'ko') {
                this.currentGlobalLanguage = stored as Language;
                this.activateOnLanguageChange(stored as Language);
            }
        } catch {
            console.log('No stored language preference found');
        }
    }

    /**
     * Check if running in VS Code environment
     */
    private isVSCodeEnvironment(): boolean {
        return typeof window !== 'undefined' && 
               (window.vscode !== undefined || 
                window.location.hostname === 'localhost' ||
                process.env.NODE_ENV === 'development');
    }

    /**
     * Activate Google Translate extension when language is selected
     */
    activateOnLanguageChange(selectedLanguage: Language) {
        console.log(`🌐 Language changed to: ${selectedLanguage}`);
        
        // Store globally for cross-component consistency
        this.currentGlobalLanguage = selectedLanguage;
        try {
            localStorage.setItem('vscode_current_language', selectedLanguage);
        } catch {
            console.log('Could not store language preference');
        }
        
        if (!this.isVSCodeEnvironment()) {
            console.log('🔧 Not in VS Code environment, skipping translation activation');
            return;
        }

        // Configure translation direction based on selected language
        if (selectedLanguage === 'en') {
            this.currentConfig = {
                sourceLanguage: 'id',
                targetLanguage: 'en',
                autoActivate: true,
                showPopup: true
            };
            this.activateTranslation('Indonesian to English mode activated');
        } else if (selectedLanguage === 'id') {
            this.currentConfig = {
                sourceLanguage: 'en',
                targetLanguage: 'id',
                autoActivate: true,
                showPopup: true
            };
            this.activateTranslation('English to Indonesian mode activated');
        } else {
            // Other languages default to English UI with no auto-translate (placeholder)
            this.currentConfig = {
                sourceLanguage: 'en',
                targetLanguage: 'en',
                autoActivate: false,
                showPopup: false
            };
        }

        // Store language preference for VS Code
        this.updateVSCodeSettings();
        
        // Propagate to other components if needed
        this.notifyLanguageChange(selectedLanguage);
    }

    /**
     * Activate translation with current configuration
     */
    private activateTranslation(message: string) {
        console.log(`🔤 ${message}`);
        
        // Send configuration to VS Code extension if available
        if (window.vscode) {
            window.vscode.postMessage({
                command: 'activateTranslation',
                config: this.currentConfig,
                message: message
            });
        }

        // Show notification in browser console for development
        // this.showTranslationStatus(message); // Disabled: User requested to stop language change notifications
    }

    /**
     * Setup custom translate commands
     */
    private setupTranslateCommands() {
        // Add global translation functions for development
        (window as any).translateToIndonesian = (text: string) => {
            return this.quickTranslate(text, 'en', 'id');
        };

        (window as any).translateToEnglish = (text: string) => {
            return this.quickTranslate(text, 'id', 'en');
        };

        console.log('🔧 Translation commands available: translateToIndonesian() and translateToEnglish()');
    }

    /**
     * Quick translate function for development
     */
    private async quickTranslate(
        text: string, 
        from: LanguageCode, 
        to: LanguageCode
    ): Promise<string> {
        try {
            // Use your existing autoTranslationService
            const { autoTranslationService } = await import('../services/autoTranslationService');
            const result = await autoTranslationService.translateText(text, to, from);
            console.log(`🔤 Translated "${text}" (${from} → ${to}): "${result}"`);
            return result;
        } catch (error) {
            console.error('🚫 Translation error:', error);
            return text;
        }
    }

    /**
     * Update VS Code settings for Google Translate extension
     */
    private updateVSCodeSettings() {
        const settings = {
            'goog-translate.defaultSource': this.currentConfig.sourceLanguage,
            'goog-translate.defaultTarget': this.currentConfig.targetLanguage,
            'goog-translate.showPopupAfterSelection': this.currentConfig.showPopup,
            'goog-translate.autoDetectSource': true
        };

        if (window.vscode) {
            window.vscode.postMessage({
                command: 'updateSettings',
                settings: settings
            });
        }

        console.log('🔧 Updated VS Code translation settings:', settings);
    }

    /**
     * Activate Google Translate extension
     */
    private activateTranslateExtension() {
        if (window.vscode) {
            window.vscode.postMessage({
                command: 'activateExtension',
                extensionId: 'funkyremi.vscode-google-translate'
            });
        }

        console.log('🔧 Requested Google Translate extension activation');
    }

    /**
     * Get current translation configuration
     */
    getCurrentConfig(): VSCodeTranslateConfig {
        return { ...this.currentConfig };
    }

    /**
     * Get current global language
     */
    getCurrentLanguage(): Language {
        return this.currentGlobalLanguage;
    }

    /**
     * Notify other components of language change
     */
    private notifyLanguageChange(language: Language) {
        // Dispatch custom event for other components to listen
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('vscode-language-changed', {
                detail: { language }
            }));
        }
    }

    /**
     * Manual translation activation for specific text
     */
    translateSelection(text: string) {
        console.log(`🔤 Translating selection: "${text}"`);
        
        if (window.vscode) {
            window.vscode.postMessage({
                command: 'translateSelection',
                text: text,
                config: this.currentConfig
            });
        }
    }
}

// Create and export singleton instance
export const vscodeTranslateService = new VSCodeTranslateService();

// Initialize on module load
if (typeof window !== 'undefined') {
    vscodeTranslateService.init();
}

export default vscodeTranslateService;