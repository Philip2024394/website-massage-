import React from 'react';
import ConfettiAnimation from '../../components/ConfettiAnimation';

interface CoinNotificationProps {
  message: string;
  amount?: number;
}

const CoinNotification: React.FC<CoinNotificationProps> = ({ message, amount }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] bg-white border border-orange-200 shadow-lg rounded-xl p-4">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🪙</span>
        <div>
          <div className="font-semibold text-gray-900">{message}</div>
          {typeof amount === 'number' && (
            <div className="text-orange-600 font-semibold">+{amount} coins</div>
          )}
        </div>
      </div>
      <ConfettiAnimation active={true} />
    </div>
  );
};

export default CoinNotification;
