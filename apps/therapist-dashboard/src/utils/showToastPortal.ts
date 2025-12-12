/**
 * Toast notification utility for therapist dashboard
 */

type ToastType = 'success' | 'error' | 'info' | 'warning';

export function showToast(message: string, type: ToastType = 'info') {
  // Dispatch custom event for toast notifications
  window.dispatchEvent(new CustomEvent('show-toast', {
    detail: { message, type }
  }));
}
