import React from 'react';
import { Smartphone, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    prompt(): Promise<void>;
    readonly userChoice: Promise<{outcome: 'accepted' | 'dismissed', platform: string}>;
}

interface PWAInstallerProps {
    deferredPrompt: BeforeInstallPromptEvent | null;
    isAppInstalled: boolean;
    handleInstallApp: () => void;
}

const PWAInstaller: React.FC<PWAInstallerProps> = ({
    deferredPrompt,
    isAppInstalled,
    handleInstallApp
}): JSX.Element => {
    return (
        <div className="fixed bottom-4 right-4 z-40">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 max-w-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isAppInstalled ? 'bg-gray-100' : 'bg-gradient-to-br from-orange-500 to-amber-500'
                    }`}>
                        {/* @ts-ignore - Lucide React 19 compat */}
                        <Smartphone className={`w-5 h-5 ${isAppInstalled ? 'text-gray-400' : 'text-white'}`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">
                            {isAppInstalled ? 'App Installed' : 'Download App'}
                        </h3>
                        <p className="text-xs text-gray-600">
                            {isAppInstalled 
                                ? 'IndaStreet app ready' 
                                : 'Better notifications'
                            }
                        </p>
                    </div>
                </div>
                
                <button
                    onClick={handleInstallApp}
                    disabled={isAppInstalled || !deferredPrompt}
                    className={`w-full py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        isAppInstalled 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : deferredPrompt
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-md'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {/* @ts-ignore - Lucide React 19 compat */}
                    <Download className="w-4 h-4" />
                    {isAppInstalled 
                        ? 'Installed ✓' 
                        : deferredPrompt 
                            ? 'Download'
                            : 'Available in Browser'
                    }
                </button>
            </div>
        </div>
    );
};

export default PWAInstaller;
