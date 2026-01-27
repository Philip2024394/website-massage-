// Development mode utility for conditional logging
// Set to false to disable console logs in production-like environments
export const DEV_MODE = import.meta.env.DEV && import.meta.env.MODE !== 'production';

// Conditional logger that only logs in development mode
export const devLog = (...args: any[]) => {
  if (DEV_MODE) {
    console.log(...args);
  }
};

export const devWarn = (...args: any[]) => {
  if (DEV_MODE) {
    console.warn(...args);
  }
};

export const devInfo = (...args: any[]) => {
  if (DEV_MODE) {
    console.info(...args);
  }
};
