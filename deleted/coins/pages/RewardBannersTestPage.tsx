import React from 'react';
import RewardBannerDisplay from '../components/RewardBannerDisplay';

const RewardBannersTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Reward Banners Preview</h1>
        <RewardBannerDisplay />
      </div>
    </div>
  );
};

export default RewardBannersTestPage;
