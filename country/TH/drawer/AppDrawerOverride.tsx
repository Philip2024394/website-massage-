import React from 'react';
import { AppDrawer } from '../../../components/AppDrawer';

// Thailand-specific drawer override placeholder
const THAppDrawerOverride: React.FC<any> = (props) => {
  return <AppDrawer {...props} />;
};

export default THAppDrawerOverride;
