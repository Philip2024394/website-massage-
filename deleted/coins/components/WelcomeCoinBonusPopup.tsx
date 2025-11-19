import React from 'react';

interface WelcomeCoinBonusPopupProps {
  bonus: number;
  open: boolean;
  onClose?: () => void;
}

const WelcomeCoinBonusPopup: React.FC<WelcomeCoinBonusPopupProps> = ({ bonus, open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-orange-100">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2">Welcome Bonus</h3>
        <p className="text-gray-700">You've received <span className="text-orange-600 font-semibold">{bonus} coins</span> as a welcome gift.</p>
        {onClose && (
          <button className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white" onClick={onClose}>Great!</button>
        )}
      </div>
    </div>
  );
};

export default WelcomeCoinBonusPopup;
