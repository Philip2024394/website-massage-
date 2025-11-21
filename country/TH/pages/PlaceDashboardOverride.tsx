import React from 'react';
import PlaceDashboardPage from '../../../pages/PlaceDashboardPage';

// Thailand-specific place dashboard (customize as needed)
const THPlaceDashboardOverride: React.FC<any> = (props) => {
  return <PlaceDashboardPage {...props} />;
};

export default THPlaceDashboardOverride;
