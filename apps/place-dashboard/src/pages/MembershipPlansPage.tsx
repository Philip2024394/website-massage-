import React from 'react';

interface MembershipPlansPageProps {
  onBack: () => void;
  userType: string;
  currentPlan?: string;
}

const MembershipPlansPage: React.FC<MembershipPlansPageProps> = ({ onBack, userType, currentPlan }) => {
  return (
    <div className="membership-plans-page">
      <button onClick={onBack} className="back-button">
        Back
      </button>
      <h2>Membership Plans</h2>
      <p>Membership plans for {userType} coming soon...</p>
    </div>
  );
};

export default MembershipPlansPage;
