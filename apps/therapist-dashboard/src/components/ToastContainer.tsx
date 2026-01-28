// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X, Loader2 } from 'lucide-react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ConfirmationToast {
  id: number;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmationToasts, setConfirmationToasts] = useState<ConfirmationToast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { message, type, duration = 4000, action, persistent = false } = event.detail;
      console.log('🍞 ToastContainer received:', message, type);
      const id = Date.now();
      
      setToasts(prev => [...prev, { id, message, type, duration, action, persistent }]);
      
      // Auto-remove after duration (unless persistent)
      if (!persistent) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
      }
    };

    const handleConfirmationToast = (event: CustomEvent) => {
      const { message, onConfirm, onCancel } = event.detail;
      const id = Date.now();
      
      setConfirmationToasts(prev => [...prev, { id, message, onConfirm, onCancel }]);
    };

    const handleUpdateToast = (event: CustomEvent) => {
      const { id, message, type } = event.detail;
      setToasts(prev => prev.map(toast => 
        toast.id === id ? { ...toast, message, type, persistent: false } : toast
      ));
    };

    console.log('🍞 Enhanced ToastContainer mounted and listening');
    window.addEventListener('show-toast' as any, handleToast);
    window.addEventListener('show-confirmation-toast' as any, handleConfirmationToast);
    window.addEventListener('update-toast' as any, handleUpdateToast);
    
    return () => {
      window.removeEventListener('show-toast' as any, handleToast);
      window.removeEventListener('show-confirmation-toast' as any, handleConfirmationToast);
      window.removeEventListener('update-toast' as any, handleUpdateToast);
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const removeConfirmationToast = (id: number) => {
    setConfirmationToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <XCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'loading': return <Loader2 className="w-5 h-5 animate-spin" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (toasts.length === 0 && confirmationToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {/* Regular Toasts */}
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            ${getColors(toast.type)} 
            border rounded-lg p-4 shadow-lg backdrop-blur-sm
            transform transition-all duration-300 ease-in-out
            animate-slide-in-right
          `}
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-5">{toast.message}</p>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-sm font-semibold underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Confirmation Toasts */}
      {confirmationToasts.map((confirmToast) => (
        <div
          key={confirmToast.id}
          className="bg-white border-2 border-orange-200 rounded-lg p-4 shadow-xl backdrop-blur-sm max-w-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`confirmation-${confirmToast.id}`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1">
              <p id={`confirmation-${confirmToast.id}`} className="text-sm font-medium text-gray-900 mb-3">
                {confirmToast.message}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    confirmToast.onConfirm();
                    removeConfirmationToast(confirmToast.id);
                  }}
                  className="px-3 py-1.5 bg-orange-500 text-white text-sm font-medium rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    confirmToast.onCancel();
                    removeConfirmationToast(confirmToast.id);
                  }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
