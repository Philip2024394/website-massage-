import { databases } from '../../lib/appwrite';
import { COIN_CONFIG } from '../../lib/coinConfig';

export const providerRewardsService = {
  async awardWelcomeBonus(userId: string) {
    console.log('[archived] awardWelcomeBonus', userId, COIN_CONFIG.WELCOME_BONUS);
  },
  async awardReferral(referrerId: string, referredId: string) {
    console.log('[archived] awardReferral', { referrerId, referredId, amount: COIN_CONFIG.REFERRAL_BONUS });
  },
};
