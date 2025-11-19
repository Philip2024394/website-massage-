export interface RewardBanner {
  title: string;
  message: string;
}

export const rewardBannerService = {
  getDefaultBanners(): RewardBanner[] {
    return [
      { title: 'Welcome', message: 'Earn coins by booking massages and referring friends.' },
      { title: 'Special', message: 'Limited-time bonus events will appear here.' },
    ];
  },
};
