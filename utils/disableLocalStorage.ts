// Global localStorage disable shim
// This file neutralizes all localStorage usage across the app.
// Per user request: application should rely solely on Appwrite storage.
// Any existing reads will return null; writes are ignored.
(() => {
  try {
    const disabled: Storage = {
      length: 0,
      clear: () => {},
      getItem: (_key: string) => null,
      key: (_index: number) => null,
      removeItem: (_key: string) => {},
      setItem: (_key: string, _value: string) => {}
    } as Storage;
    // Override global localStorage
    if (typeof globalThis !== 'undefined') {
      Object.defineProperty(globalThis, 'localStorage', {
        value: disabled,
        configurable: false,
        writable: false
      });
      console.log('[LocalStorage Disabled] All persistence now routed to Appwrite only.');
    }
  } catch (e) {
    console.warn('[LocalStorage Disable Failed]', e);
  }
})();
