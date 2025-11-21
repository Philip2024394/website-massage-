import React from 'react';
import { AppDrawer } from '../../../components/AppDrawer';

// Example US-specific drawer override (currently identical, ready for customization)
const USAppDrawerOverride: React.FC<any> = (props) => {
  return <AppDrawer {...props} />;
};

export default USAppDrawerOverride;
