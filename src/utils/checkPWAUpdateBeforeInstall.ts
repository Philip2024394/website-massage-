/**
 * ELITE PWA: Check for app update before showing Install / "Download app to phone".
 * When user taps Install we trigger a service worker update check; if a new version
 * is available the app reloads so they get the latest version. If no update, we
 * proceed with the install prompt.
 */

declare global {
  interface Window {
    __PWA_UPDATE__?: {
      checkBeforeInstall: (onReady: () => void) => void;
    };
  }
}

/**
 * Call before showing the PWA install prompt (e.g. when user taps "Download app to phone").
 * Triggers a service worker update check; if an update is found the page will reload.
 * Otherwise calls proceedWithInstall() so you can show the native install prompt.
 */
export function checkPWAUpdateBeforeInstall(proceedWithInstall: () => void | Promise<void>): void {
  const api = (window as Window).__PWA_UPDATE__;
  if (api?.checkBeforeInstall) {
    api.checkBeforeInstall(() => {
      if (typeof proceedWithInstall === 'function') {
        const result = proceedWithInstall();
        if (result instanceof Promise) {
          result.catch(() => {});
        }
      }
    });
  } else {
    if (typeof proceedWithInstall === 'function') {
      const result = proceedWithInstall();
      if (result instanceof Promise) {
        result.catch(() => {});
      }
    }
  }
}
