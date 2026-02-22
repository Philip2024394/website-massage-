import React, { useState, useEffect } from 'react';
import { Download, Phone as Smartphone, Check, X, AlertCircle} from 'lucide-react';
import { PWAInstallationStatusChecker } from '../utils/pwaInstallationStatus';

interface UniversalPWAInstallProps {
  className?: string;
  variant?: 'button' | 'card' | 'banner';
  size?: 'sm' | 'md' | 'lg';
  onInstallSuccess?: () => void;
  onInstallError?: (error: string) => void;
  showInstructions?: boolean;
  autoHideWhenInstalled?: boolean;
}

export const UniversalPWAInstall: React.FC<UniversalPWAInstallProps> = ({
  className = '',
  variant = 'button',
  size = 'md',
  onInstallSuccess,
  onInstallError,
  showInstructions = true,
  autoHideWhenInstalled = true
}) => {
  const [status, setStatus] = useState(PWAInstallationStatusChecker.checkStatus());
  const [installing, setInstalling] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(PWAInstallationStatusChecker.checkStatus());
    };

    // Listen for PWA events
    window.addEventListener('beforeinstallprompt', updateStatus);
    window.addEventListener('appinstalled', updateStatus);
    window.addEventListener('pwa-install-available', updateStatus);
    
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', updateStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', updateStatus);
      window.removeEventListener('appinstalled', updateStatus);
      window.removeEventListener('pwa-install-available', updateStatus);
      mediaQuery.removeEventListener('change', updateStatus);
    };
  }, []);

  const handleInstall = async () => {
    if (installing) return;
    
    setInstalling(true);
    
    try {
      const result = await PWAInstallationStatusChecker.triggerInstallation();
      
      if (result.success) {
        if (result.result === 'accepted') {
          onInstallSuccess?.();
          // Show success notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('App Installed!', {
              body: '🎉 IndaStreet has been added to your home screen.',
              icon: '/pwa-icon-192.png'
            });
          }
        } else if (result.result === 'manual-instructions-shown') {
          // Manual instructions were shown
          onInstallSuccess?.();
        }
      } else {
        onInstallError?.(result.error || 'Installation failed');
        if (showInstructions && status.installMethod === 'manual') {
          setShowInstructionsModal(true);
        }
      }
    } catch (error) {
      onInstallError?.((error as Error).message);
    } finally {
      setInstalling(false);
      setStatus(PWAInstallationStatusChecker.checkStatus());
    }
  };

  // Don't render if installed and auto-hide is enabled
  if (status.isInstalled && autoHideWhenInstalled) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-3 py-2 text-sm';
      case 'lg': return 'px-6 py-4 text-lg';
      default: return 'px-4 py-3 text-base';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={handleInstall}
          disabled={installing || (!status.canInstall && !status.isInstalled)}
          className={`
            inline-flex items-center gap-2 font-semibold rounded-lg transition-all
            ${status.isInstalled 
              ? 'bg-green-500 text-white cursor-default' 
              : status.canInstall
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${getSizeClasses()}
            ${installing ? 'opacity-50 cursor-wait' : ''}
            ${className}
          `}
        >
          {installing ? (
            <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${getIconSize()}`} />
          ) : status.isInstalled ? (
            <Check className={getIconSize()} />
          ) : (
            <Download className={getIconSize()} />
          )}
          
          {status.isInstalled 
            ? 'Installed' 
            : installing 
              ? 'Installing...' 
              : 'Download App'
          }
        </button>
        
        {showInstructionsModal && (
          <InstructionsModal 
            status={status}
            onClose={() => setShowInstructionsModal(false)}
          />
        )}
      </>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="flex items-start gap-4">
          <div className={`
            rounded-full flex items-center justify-center flex-shrink-0
            ${status.isInstalled 
              ? 'bg-green-100 text-green-600' 
              : status.canInstall
                ? 'bg-amber-100 text-amber-600'
                : 'bg-gray-100 text-gray-400'
            }
            ${size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12'}
          `}>
            {status.isInstalled ? (
              <Check className={getIconSize()} />
            ) : (
              <Smartphone className={getIconSize()} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-gray-900 ${size === 'lg' ? 'text-lg' : 'text-base'}`}>
              {status.isInstalled ? 'App Installed' : 'Download Mobile App'}
            </h3>
            <p className={`text-gray-600 ${size === 'lg' ? 'text-base' : 'text-sm'} mt-1`}>
              {status.isInstalled 
                ? 'Ready to use with notifications enabled'
                : 'Get instant booking notifications and offline access'
              }
            </p>
            
            {!status.isInstalled && (
              <button
                onClick={handleInstall}
                disabled={installing || !status.canInstall}
                className={`
                  mt-3 inline-flex items-center gap-2 font-semibold rounded-lg transition-all
                  min-h-[44px] touch-manipulation
                  ${status.canInstall
                    ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-md hover:shadow-lg active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                  ${getSizeClasses()}
                  ${installing ? 'opacity-50 cursor-wait' : ''}
                `}
                style={{
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  fontSize: '16px' // Prevent iOS zoom
                }}
              >
                {installing ? (
                  <div className={`animate-spin rounded-full border-2 border-white border-t-transparent ${getIconSize()}`} />
                ) : (
                  <Download className={getIconSize()} />
                )}
                
                {installing ? 'Installing...' : 'Install Now'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-4 shadow-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8" />
            <div>
              <h3 className="font-semibold text-lg">
                {status.isInstalled ? 'App Ready!' : 'Get the App'}
              </h3>
              <p className="text-amber-100 text-sm">
                {status.isInstalled 
                  ? 'Notifications enabled and ready'
                  : 'Install for better experience'
                }
              </p>
            </div>
          </div>
          
          {!status.isInstalled && (
            <button
              onClick={handleInstall}
              disabled={installing || !status.canInstall}
              className={`
                bg-white text-amber-600 px-4 py-2 rounded-lg font-semibold
                hover:bg-amber-50 active:bg-amber-100 transition-all flex items-center gap-2
                min-h-[44px] touch-manipulation
                ${installing ? 'opacity-50 cursor-wait' : ''}
                ${!status.canInstall ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              style={{
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                fontSize: '16px'
              }}
            >
              {installing ? (
                <div className="animate-spin rounded-full border-2 border-amber-500 border-t-transparent w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              
              {installing ? 'Installing...' : 'Install'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};

const InstructionsModal: React.FC<{
  status: ReturnType<typeof PWAInstallationStatusChecker.checkStatus>;
  onClose: () => void;
}> = ({ status, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Install Instructions</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {!status.canInstall && (
            <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <strong>Installation not available:</strong>
                <br />
                {PWAInstallationStatusChecker.getInstallationInstructions(status)}
              </div>
            </div>
          )}
          
          {status.canInstall && (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>To install this app:</strong></p>
              <div className="bg-gray-50 p-3 rounded-lg">
                {PWAInstallationStatusChecker.getInstallationInstructions(status)}
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 bg-amber-500 text-white py-2 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

export default UniversalPWAInstall;