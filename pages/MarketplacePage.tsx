import React from 'react';
import type { UserLocation } from '../types';
import { lazyCountryOverride, hasCountryOverride } from '../lib/countryOverrides';
import MarketplacePageBase from './MarketplacePageBase';

type Props = {
  onBack: () => void;
  t: any;
  userLocation?: UserLocation | null;
  onNavigate?: (page: string) => void;
  onSetUserLocation?: (location: UserLocation) => void;
};

const MarketplacePage: React.FC<Props> = (props) => {
  const country = props.userLocation?.countryCode;
  const Override = lazyCountryOverride<Props>(country, 'MarketplacePage');

  if (Override && hasCountryOverride(country, 'MarketplacePage')) {
    return (
      <React.Suspense fallback={<div className="p-4">Loading…</div>}>
        <Override {...props} />
      </React.Suspense>
    );
  }
  return <MarketplacePageBase {...props} />;
};

export default MarketplacePage;
