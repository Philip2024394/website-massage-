import React from 'react';
import TherapistDashboardPage from '../../../pages/TherapistDashboardPage';

// US-specific therapist dashboard (customize as needed)
const USTherapistDashboardOverride: React.FC<any> = (props) => {
  return <TherapistDashboardPage {...props} />;
};

export default USTherapistDashboardOverride;
