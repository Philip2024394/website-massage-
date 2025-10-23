import { useState, useEffect } from 'react';
import { backgroundService } from '../services/backgroundService';

export const useBackground = (area: string) => {
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const [backgroundClass, setBackgroundClass] = useState<string>('');

  useEffect(() => {
    const updateBackground = () => {
      const style = backgroundService.getBackgroundStyle(area);
      const defaultClass = backgroundService.getDefaultGradient(area);
      
      setBackgroundStyle(style);
      setBackgroundClass(Object.keys(style).length === 0 ? defaultClass : '');
    };

    updateBackground();

    // Listen for background changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_backgrounds') {
        updateBackground();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for direct updates in the same window
    const handleDirectUpdate = () => updateBackground();
    window.addEventListener('backgroundUpdate', handleDirectUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('backgroundUpdate', handleDirectUpdate);
    };
  }, [area]);

  return { backgroundStyle, backgroundClass };
};