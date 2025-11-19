import React from 'react';
import { Award, TrendingUp, Users, Gift } from 'lucide-react';
import { COIN_CONFIG } from '../../lib/coinConfig';

interface ProviderRewardsDashboardProps {
  totalAwarded?: number;
  referrals?: number;
  recentAwards?: Array<{ user: string; amount: number; reason: string; date: string }>;
}

const ProviderRewardsDashboard: React.FC<ProviderRewardsDashboardProps> = ({ totalAwarded = 0, referrals = 0, recentAwards = [] }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500 text-xs">Total Awarded</div>
          <div className="text-xl font-bold">{totalAwarded} 🪙</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500 text-xs">Referrals</div>
          <div className="text-xl font-bold">{referrals}</div>
        </div>
        <div className="bg-white border rounded-xl p-4">
          <div className="text-gray-500 text-xs">Welcome Bonus</div>
          <div className="text-xl font-bold">{COIN_CONFIG.WELCOME_BONUS} 🪙</div>
        </div>
      </div>
      <div className="bg-white border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-orange-600" />
          <div className="font-semibold">Recent Awards</div>
        </div>
        <ul className="space-y-2">
          {recentAwards.length === 0 && <li className="text-sm text-gray-500">No awards yet.</li>}
          {recentAwards.map((a, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-orange-500" />
                <span>{a.user}</span>
              </div>
              <div className="text-gray-500">{a.reason}</div>
              <div className="font-semibold text-orange-600">+{a.amount} 🪙</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProviderRewardsDashboard;
