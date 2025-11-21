import React from 'react';
import PlaceDashboardPage from '../../../pages/PlaceDashboardPage';

// US-specific place dashboard (customize as needed)
const USPlaceDashboardOverride: React.FC<any> = (props) => {
  return <PlaceDashboardPage {...props} />;
};

export default USPlaceDashboardOverride;
