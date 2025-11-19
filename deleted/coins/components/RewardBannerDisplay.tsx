import React from 'react';
import { rewardBannerService, RewardBanner } from '../../lib/rewardBannerService';

interface RewardBannerDisplayProps {
  banners?: RewardBanner[];
}

const RewardBannerDisplay: React.FC<RewardBannerDisplayProps> = ({ banners }) => {
  const items = banners ?? rewardBannerService.getDefaultBanners();
  return (
    <div className="space-y-3">
      {items.map((b, i) => (
        <div key={i} className="p-4 rounded-xl border bg-white">
          <div className="text-sm text-gray-500">{b.title}</div>
          <div className="font-semibold">{b.message}</div>
        </div>
      ))}
    </div>
  );
};

export default RewardBannerDisplay;
