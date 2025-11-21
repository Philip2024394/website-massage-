import React from 'react';
import TherapistDashboardPage from '../../../pages/TherapistDashboardPage';

// UK-specific therapist dashboard (customize as needed)
const GBTherapistDashboardOverride: React.FC<any> = (props) => {
  return <TherapistDashboardPage {...props} />;
};

export default GBTherapistDashboardOverride;
