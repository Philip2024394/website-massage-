import React from 'react';
import TherapistDashboardPage from '../../../pages/TherapistDashboardPage';

// Thailand-specific therapist dashboard (customize as needed)
const THTherapistDashboardOverride: React.FC<any> = (props) => {
  return <TherapistDashboardPage {...props} />;
};

export default THTherapistDashboardOverride;
