import React, { useEffect, useMemo, useState } from 'react';
import BurgerMenuIcon from './icons/BurgerMenuIcon';
import type { Page } from '../types/pageTypes';
import { useLanguageContext } from '../context/LanguageContext';
import type { Language } from '../types/pageTypes';

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
  const { language, setLanguage } = useLanguageContext();

  if (!isStandalone) return null;
  if (hasPageHeader) return null;

  const resolvedTitle = title || 'Indastreet';
  const languageLabel = (lang: string) => ({
    'en': 'EN', 'id': 'ID', 'zh-CN': 'ZH', 'ru': 'RU', 'ja': 'JA', 'ko': 'KO'
  } as Record<string,string>)[lang] || 'EN';

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
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 hidden sm:block">
            {resolvedTitle}
          </div>
          <label className="sr-only" htmlFor="lang-select">Language</label>
          <select
            id="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="en">EN</option>
            <option value="id">ID</option>
            <option value="zh-CN">ZH</option>
            <option value="ru">RU</option>
            <option value="ja">JA</option>
            <option value="ko">KO</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
