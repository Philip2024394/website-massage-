/**
 * TherapistSimplePageLayout - Simple page structure (no TherapistLayout wrapper)
 *
 * Use for therapist dashboard pages to avoid white space at top.
 * Provides: page container, header with Menu button, EnhancedNavigation side drawer.
 *
 * @see docs/guides/WHITE_SPACE_FIX_QUICK_REFERENCE.md
 */
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import TherapistPageHeader from './TherapistPageHeader';
import EnhancedNavigation from './EnhancedNavigation';
import { getTherapistSidebarPage } from '../../config/therapistSidebarConfig';

interface TherapistSimplePageLayoutProps {
  title: string;
  subtitle?: string;
  onBackToStatus: () => void;
  onNavigate?: (page: string) => void;
  therapist?: any;
  currentPage: string;
  language?: string;
  onLogout?: () => void;
  icon?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  /** Override container bg (default: bg-gray-50) */
  containerClassName?: string;
}

const TherapistSimplePageLayout: React.FC<TherapistSimplePageLayoutProps> = ({
  title,
  subtitle,
  onBackToStatus,
  onNavigate,
  therapist,
  currentPage,
  language = 'id',
  onLogout,
  icon,
  headerActions,
  children,
  containerClassName = 'min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50',
}) => {
  const [showNav, setShowNav] = useState(false);

  const handleNavigate = (pageId: string) => {
    onNavigate?.(getTherapistSidebarPage(pageId));
    setShowNav(false);
  };

  const menuButton = (
    <button
      onClick={() => setShowNav(!showNav)}
      className={`p-2 rounded-lg transition-colors ${
        showNav ? 'bg-orange-100 text-orange-600' : 'hover:bg-orange-50'
      }`}
      aria-label={showNav ? 'Close menu' : 'Open menu'}
      aria-expanded={showNav}
    >
      <Menu className="w-5 h-5 text-orange-600" />
    </button>
  );

  const actions = headerActions ? (
    <div className="flex items-center gap-2">
      {headerActions}
      {menuButton}
    </div>
  ) : (
    menuButton
  );

  return (
    <>
      <div
        className={containerClassName}
        style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}
      >
        <TherapistPageHeader
          title={title}
          subtitle={subtitle}
          onBackToStatus={onBackToStatus}
          icon={icon}
          actions={actions}
        />
        {children}
      </div>

      {showNav && (
        <div
          className="fixed inset-0 z-[120] flex flex-row-reverse"
          style={{
            paddingTop: 'env(safe-area-inset-top, 0px)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/50 z-[121]"
            onClick={() => setShowNav(false)}
          />
          <div className="relative z-[122] w-full max-w-sm h-full overflow-y-auto bg-white shadow-2xl elite-slide-in-right">
            <EnhancedNavigation
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onClose={() => setShowNav(false)}
              language={language}
              therapistData={{ ...therapist, pendingBookings: 2 }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default TherapistSimplePageLayout;
