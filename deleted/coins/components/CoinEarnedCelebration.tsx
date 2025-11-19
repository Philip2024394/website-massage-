import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoinEarnedCelebrationProps {
  amount: number;
  visible: boolean;
  onClose?: () => void;
}

const CoinEarnedCelebration: React.FC<CoinEarnedCelebrationProps> = ({ amount, visible, onClose }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] pointer-events-none"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-50/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 border border-orange-100 text-center"
            >
              <div className="text-6xl mb-4">🪙</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">You earned coins!</h3>
              <p className="text-xl text-orange-600 font-semibold">+{amount} coins</p>
              {onClose && (
                <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl bg-orange-600 text-white pointer-events-auto">Close</button>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoinEarnedCelebration;
