import React, { useState } from 'react';
import ServiceTermsPage from '../pages/ServiceTermsPage';
import { getTermsAgreed, setTermsAgreed } from '../lib/termsAgreementStorage';

interface DashboardTermsGateProps {
  userId: string | undefined | null;
  t: any;
  /** Dashboard to show after user agrees to terms */
  ChildComponent: React.ComponentType<any>;
  childProps: Record<string, unknown>;
  onAgreedAfter?: () => void;
}

/**
 * For place/facial dashboards: show full Terms & Conditions once; after user agrees, show dashboard and never show terms again.
 */
export const DashboardTermsGate: React.FC<DashboardTermsGateProps> = ({
  userId,
  t,
  ChildComponent,
  childProps,
  onAgreedAfter
}) => {
  const [agreed, setAgreedState] = useState(() => getTermsAgreed(userId));

  if (!userId) {
    return <ChildComponent {...childProps} />;
  }

  if (agreed) {
    return <ChildComponent {...childProps} />;
  }

  const handleAccept = () => {
    setTermsAgreed(userId);
    setAgreedState(true);
    onAgreedAfter?.();
  };

  return (
    <ServiceTermsPage
      t={t}
      acceptMode
      onAccept={handleAccept}
    />
  );
};

export default DashboardTermsGate;
