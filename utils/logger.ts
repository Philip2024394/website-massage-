export const logger = {
  debug: (...args: any[]) => {
    const enabled = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_DEBUG === '1') || (typeof process !== 'undefined' && process.env?.VITE_DEBUG === '1');
    if (enabled) console.log(...args);
  },
  info: (...args: any[]) => console.info(...args),
  warn: (...args: any[]) => console.warn(...args),
  error: (...args: any[]) => console.error(...args)
};
