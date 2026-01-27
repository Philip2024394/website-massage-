// Lightweight portal-based toast utility used by TherapistPortalPage
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  const container = document.getElementById('overlay-root') || document.body;
  if (!container) return;
  const toast = document.createElement('div');
  const base = 'text-white px-4 py-2 rounded shadow-md text-sm font-medium mb-2 transition-opacity duration-300';
  const color = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  toast.className = `${base} ${color}`;
  toast.textContent = message;
  if (container.id === 'overlay-root') {
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.right = '0';
    container.style.zIndex = '9999';
    container.style.padding = '0.75rem';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    container.style.pointerEvents = 'none';
  }
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 320);
  }, 3500);
};
