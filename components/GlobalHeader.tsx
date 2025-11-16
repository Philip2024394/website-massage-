import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from './icons/BurgerMenuIcon';
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

  if (!isStandalone) return null;
  if (hasPageHeader) return null;

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
                window.dispatchEvent(new CustomEvent('customer_dashboard_open_drawer'));
                window.dispatchEvent(new CustomEvent('toggleDrawer'));
              } catch {}
            }}
          >
            <BurgerMenuIcon className="w-6 h-6 text-gray-700" />
          </button>
          <span className="text-xl font-bold">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">street</span>
          </span>
        </div>
        <div className="text-sm text-gray-500">
          {resolvedTitle}
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
