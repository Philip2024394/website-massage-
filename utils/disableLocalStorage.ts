// LocalStorage shim (inactive)
// Previously this module disabled localStorage globally. That behavior interfered
// with critical UX (e.g., country selection, language, session flags).
// The shim is now inactive and preserves the browser's native localStorage.
(() => {
  try {
    // If a hard-disable is ever required for debugging, flip this flag to true.
    const HARD_DISABLE = false;

    if (HARD_DISABLE && typeof globalThis !== 'undefined') {
      const disabled: Storage = {
        length: 0,
        clear: () => {},
        getItem: (_key: string) => null,
        key: (_index: number) => null,
        removeItem: (_key: string) => {},
        setItem: (_key: string, _value: string) => {}
      } as Storage;
      Object.defineProperty(globalThis, 'localStorage', {
        value: disabled,
        configurable: false,
        writable: false
      });
      console.log('[LocalStorage Shim] HARD_DISABLE enabled — persistence routed away.');
    } else {
      // No-op; use native localStorage.
      console.log('[LocalStorage Shim] Using native localStorage (shim inactive).');
    }
  } catch (e) {
    console.warn('[LocalStorage Shim Error]', e);
  }
})();
