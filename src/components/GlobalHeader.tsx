import React, { useEffect, useMemo, useState } from 'react';
import { logger } from '../utils/logger';
import BurgerMenuIcon from './icons/BurgerMenuIcon';
import { useLanguage } from '../hooks/useLanguage';
import type { Page } from '../types/pageTypes';

interface GlobalHeaderProps {
  page: Page;
  title?: string;
}

const detectStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any)?.standalone === true
  );
};

const useHasPageHeader = (deps: any[]) => {
  const [hasHeader, setHasHeader] = useState(false);

  useEffect(() => {
    const check = () => {
      try {
        const container = document.querySelector('.content-landscape') || document.body;
        const existingHeader = container?.querySelector('header, [data-page-header="true"]');
        setHasHeader(!!existingHeader);
      } catch {
        setHasHeader(false);
      }
    };

    check();

    const mo = new MutationObserver(() => check());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, deps);

  return hasHeader;
};

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ page, title }) => {
  const isStandalone = useMemo(detectStandalone, []);
  const hasPageHeader = useHasPageHeader([page]);
  const { language, setLanguage } = useLanguage();

  logger.debug('🔍 GlobalHeader render check:', { 
    page, 
    isStandalone, 
    hasPageHeader, 
    shouldRender: isStandalone && !hasPageHeader 
  });

  // Never show on landing/home page - they have their own headers
  if (page === 'landing' || page === 'home') return null;
  
  // DISABLED: GlobalHeader causing issues on landing page - let components handle their own headers
  return null;
  
  // Original logic disabled to prevent header conflicts
  // if (!isStandalone) return null;
  // if (hasPageHeader) return null;

  const resolvedTitle = title || 'Indastreet';

  return (
    <header className="bg-white p-3 shadow-md sticky top-0 z-[9998]">
      <div className="max-w-screen-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="p-2 -m-2 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
            style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
            onClick={() => {
              try {
                logger.debug('🍔 GlobalHeader burger menu clicked!');
                logger.debug('🍔 Dispatching customer_dashboard_open_drawer event');
                window.dispatchEvent(new CustomEvent('customer_dashboard_open_drawer'));
                logger.debug('🍔 Dispatching toggleDrawer event');
                window.dispatchEvent(new CustomEvent('toggleDrawer'));
                logger.debug('🍔 Both events dispatched successfully');
              } catch (error) {
                logger.error('🍔 Error dispatching drawer events:', error);
              }
            }}
          >
            <BurgerMenuIcon className="w-6 h-6 text-gray-700" />
          </button>
          <button
            type="button"
            aria-label="Go to landing page"
            className="text-xl font-bold hover:opacity-80 transition-opacity cursor-pointer"
            style={{ WebkitTapHighlightColor: 'transparent' } as React.CSSProperties}
            onClick={() => {
              try {
                logger.debug('🏠 GlobalHeader logo clicked - navigating to landing page');
                window.dispatchEvent(new CustomEvent('navigateToLanding'));
              } catch (error) {
                logger.error('🏠 Error navigating to landing:', error);
              }
            }}
          >
            <span className="text-black">Inda</span>
            <span className="text-orange-500">street</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            {resolvedTitle}
          </div>
          {/* Language Switcher - Facebook Style with Flags */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
            {/* Indonesian Flag Button */}
            <button
              onClick={() => {
                const timestamp = new Date().toISOString();
                logger.debug(`🇮🇩 GlobalHeader [${timestamp}]: ID button clicked, current language:`, language);
                setLanguage('id');
                logger.debug(`🇮🇩 GlobalHeader [${timestamp}]: setLanguage("id") called`);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                language === 'id' 
                  ? 'bg-white shadow-sm text-gray-900 scale-105' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
              title="Bahasa Indonesia"
            >
              <span className="text-base">🇮🇩</span>
              <span className="hidden sm:inline">ID</span>
            </button>
            
            {/* GB/English Flag Button */}
            <button
              onClick={() => {
                const timestamp = new Date().toISOString();
                logger.debug(`🇬🇧 GlobalHeader [${timestamp}]: GB button clicked, current language:`, language);
                setLanguage('gb');
                logger.debug(`🇬🇧 GlobalHeader [${timestamp}]: setLanguage("gb") called`);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                language === 'gb' || language === 'en'
                  ? 'bg-white shadow-sm text-gray-900 scale-105' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
              title="English"
            >
              <span className="text-base">🇬🇧</span>
              <span className="hidden sm:inline">EN</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
