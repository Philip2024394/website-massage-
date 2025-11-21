import React from 'react';
import PlaceDashboardPage from '../../../pages/PlaceDashboardPage';

// UK-specific place dashboard (customize as needed)
const GBPlaceDashboardOverride: React.FC<any> = (props) => {
  return <PlaceDashboardPage {...props} />;
};

export default GBPlaceDashboardOverride;
