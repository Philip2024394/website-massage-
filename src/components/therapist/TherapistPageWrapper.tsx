/**
 * TherapistPageWrapper - Therapist Page Contract Lock
 * 
 * CRITICAL: This component enforces the Therapist Dashboard page contract.
 * All therapist pages MUST use this wrapper to ensure:
 * - Consistent layout structure
 * - Required header components
 * - Help icon presence
 * - Navigation integrity
 * 
 * CONTRACT RULES:
 * ✅ LOCKED (Cannot be removed):
 *    - TherapistLayout wrapper
 *    - TherapistPageHeader component
 *    - HelpTooltip component
 *    - Navigation structure
 * 
 * ✅ FLEXIBLE (Can be changed):
 *    - UI styling
 *    - Feature logic
 *    - Content sections
 *    - API connections
 * 
 * @example
 * ```tsx
 * <TherapistPageWrapper
 *   title="My Page"
 *   subtitle="Page description"
 *   helpId="myPageHelp.overview"
 *   icon={<Icon />}
 *   currentPage="my-page"
 *   therapist={therapist}
 *   onNavigate={handleNavigate}
 * >
 *   <div>Your flexible content here</div>
 * </TherapistPageWrapper>
 * ```
 */

import React, { useEffect } from 'react';
import TherapistLayout from './TherapistLayout';
import TherapistPageHeader from './TherapistPageHeader';
import HelpTooltip from './HelpTooltip';
import { Therapist } from '../../types';
import { getHelpContent, validatePageContract, logPageRender } from './pageContractUtils';

interface TherapistPageWrapperProps {
  // LOCKED PROPS (Required for contract)
  title: string;
  subtitle?: string;
  helpId: string; // e.g., "dashboardHelp.overview"
  currentPage: string; // For navigation highlighting
  
  // LAYOUT PROPS
  therapist: Therapist | null;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
  
  // HEADER PROPS (Optional customization)
  icon?: React.ReactNode;
  onBackToStatus?: () => void;
  actions?: React.ReactNode; // Additional actions alongside help icon
  
  // CONTENT (Fully flexible)
  children: React.ReactNode;
  
  // LAYOUT OPTIONS
  useLayout?: boolean; // Default: true. Set false for pages with custom layouts
  useHeader?: boolean; // Default: true. Set false for pages with custom headers
  
  // DEBUG
  pageName?: string; // For error logging
}

const TherapistPageWrapper: React.FC<TherapistPageWrapperProps> = ({
  title,
  subtitle,
  helpId,
  currentPage,
  therapist,
  onNavigate,
  onLogout,
  language = 'id',
  icon,
  onBackToStatus,
  actions,
  children,
  useLayout = true,
  useHeader = true,
  pageName = 'Unknown Page'
}) => {
  
  // RUNTIME SAFEGUARDS - Log errors for contract violations
  useEffect(() => {
    validatePageContract(pageName, { title, helpId, currentPage, therapist });
    logPageRender(pageName, { title, helpId, currentPage, therapist });
  }, [title, helpId, currentPage, therapist, pageName]);

  // LOCKED: Help icon must always be present
  const helpContentData = getHelpContent(helpId);
  const helpTooltip = <HelpTooltip {...helpContentData} position="bottom" size="md" />;
  
  // Combine help icon with any additional actions
  const combinedActions = actions ? (
    <div className="help-actions-container">
      {actions}
      {helpTooltip}
    </div>
  ) : (
    <div className="help-actions-container">
      {helpTooltip}
    </div>
  );

  // LOCKED: Header must always be rendered (unless explicitly disabled for custom layouts)
  const header = useHeader ? (
    <TherapistPageHeader
      title={title}
      subtitle={subtitle}
      onBackToStatus={onBackToStatus}
      icon={icon}
      actions={combinedActions}
    />
  ) : null;

  // FLEXIBLE: Content can be anything
  const content = (
    <>
      {header}
      {children}
    </>
  );

  // LOCKED: Layout must always wrap content (unless explicitly disabled)
  if (useLayout) {
    return (
      <TherapistLayout
        therapist={therapist}
        currentPage={currentPage}
        onNavigate={onNavigate}
        language={language}
        onLogout={onLogout}
      >
        {content}
      </TherapistLayout>
    );
  }

  // FALLBACK: If useLayout=false, still enforce header presence
  return (
    <div className="min-h-screen bg-gray-50">
      {content}
    </div>
  );
};

export default TherapistPageWrapper;

/**
 * USAGE GUIDELINES:
 * 
 * DO ✅:
 * - Use this wrapper for ALL therapist dashboard pages
 * - Customize content section freely
 * - Add custom UI components
 * - Update styling and features
 * - Pass custom actions alongside help icon
 * 
 * DON'T ❌:
 * - Remove the wrapper from any page
 * - Skip required props (title, helpId, currentPage)
 * - Bypass the layout or header
 * - Change route configurations through this component
 * - Remove help icon functionality
 * 
 * MIGRATION CHECKLIST:
 * □ Page wrapped with TherapistPageWrapper
 * □ Title prop provided
 * □ HelpId prop provided (matches helpContent.ts)
 * □ CurrentPage prop provided (matches route key)
 * □ Therapist prop passed through
 * □ Navigation handlers connected
 * □ Content moved inside children
 * □ No TypeScript errors
 * □ No runtime errors in console
 * □ Help icon visible and functional
 */
