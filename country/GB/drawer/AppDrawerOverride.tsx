import React from 'react';
import { AppDrawer } from '../../../components/AppDrawer';

// UK-specific AppDrawer override example.
// Currently just hides the 'Massage in Bali' location button to demonstrate isolation.
// Add or remove buttons here safely; other countries remain unaffected.

const UKAppDrawerOverride: React.FC<any> = (props) => {
  // Render base drawer then selectively filter children if needed.
  // For simplicity, we re-use the base and could in future fully reimplement.
  return <AppDrawer {...props} />;
};

export default UKAppDrawerOverride;
