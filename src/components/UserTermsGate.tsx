/**
 * Gate for consumer (user) content: show Terms & Conditions + Privacy Policy in a modal once.
 * After the user accepts, children are shown and the modal is not shown again.
 * Design: black backdrop, container with orange border, scrollable content, accept button outside scroll.
 */
import React, { useState } from 'react';
import { getUserTermsAgreed, setUserTermsAgreed } from '../lib/termsAgreementStorage';
import UserTermsModal from './UserTermsModal';

interface UserTermsGateProps {
  userId: string | undefined | null;
  t: any;
  children: React.ReactNode;
}

export const UserTermsGate: React.FC<UserTermsGateProps> = ({ userId, t, children }) => {
  const [agreed, setAgreedState] = useState(() => getUserTermsAgreed(userId));

  if (agreed) {
    return <>{children}</>;
  }

  const handleAccept = () => {
    setUserTermsAgreed(userId);
    setAgreedState(true);
  };

  return <UserTermsModal t={t} onAccept={handleAccept} />;
};

export default UserTermsGate;
