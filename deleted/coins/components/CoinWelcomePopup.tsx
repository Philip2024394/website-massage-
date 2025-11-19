import React from 'react';

interface CoinWelcomePopupProps {
  visible: boolean;
  onClose?: () => void;
}

const CoinWelcomePopup: React.FC<CoinWelcomePopupProps> = ({ visible, onClose }) => {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center border border-orange-100">
        <div className="text-5xl mb-3">🪙</div>
        <h3 className="text-xl font-bold mb-2">Welcome Bonus</h3>
        <p className="text-gray-600 mb-4">Thanks for joining! Enjoy your starting coins.</p>
        {onClose && (
          <button className="px-4 py-2 rounded-xl bg-orange-600 text-white" onClick={onClose}>Close</button>
        )}
      </div>
    </div>
  );
};

export default CoinWelcomePopup;
