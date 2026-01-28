// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

// Enhanced toast utility with better UX
export const showToast = (message: string, type: ToastType = 'info', options: ToastOptions = {}) => {
  const event = new CustomEvent('show-toast', {
    detail: {
      message,
      type,
      duration: options.duration || 4000,
      action: options.action,
      persistent: options.persistent || false
    }
  });
  window.dispatchEvent(event);
};

// Elite UX notification for critical actions
export const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const event = new CustomEvent('show-confirmation-toast', {
    detail: {
      message,
      onConfirm,
      onCancel: onCancel || (() => {})
    }
  });
  window.dispatchEvent(event);
};

// Success notification with enhanced feedback
export const showSuccessToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'success', { duration: 3000, ...options });
};

// Error notification with support action
export const showErrorToast = (message: string, supportAction?: () => void) => {
  showToast(message, 'error', {
    duration: 6000,
    action: supportAction ? {
      label: 'Get Help',
      onClick: supportAction
    } : undefined
  });
};

// Warning notification
export const showWarningToast = (message: string, options?: ToastOptions) => {
  showToast(message, 'warning', { duration: 5000, ...options });
};

// Loading state notification
export const showLoadingToast = (message: string) => {
  return showToast(message, 'info', { persistent: true });
};

// Update existing toast (for loading -> success/error)
export const updateToast = (id: string, message: string, type: ToastType) => {
  const event = new CustomEvent('update-toast', {
    detail: { id, message, type }
  });
  window.dispatchEvent(event);
};
