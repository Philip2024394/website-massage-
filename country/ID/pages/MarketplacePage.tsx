import React from 'react';
import type { UserLocation } from '../../../types';
import MarketplacePageBase from '../../../pages/MarketplacePageBase';

// Simple Indonesia-specific wrapper to verify override branching works.
// Customize freely here: copy Base and adjust layout, strings, banners, etc.

type Props = {
  onBack: () => void;
  t: any;
  userLocation?: UserLocation | null;
  onNavigate?: (page: string) => void;
  onSetUserLocation?: (location: UserLocation) => void;
};

const IndonesiaMarketplacePage: React.FC<Props> = (props) => {
  // Use the base marketplace page with no extra banner/header overlay
  return <MarketplacePageBase {...props} />;
};

export default IndonesiaMarketplacePage;
