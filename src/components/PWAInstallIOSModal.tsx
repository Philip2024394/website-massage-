import React, { useState } from 'react';

interface PWAInstallIOSModalProps {
  visible: boolean;
  onClose: () => void;
}

const DONT_SHOW_KEY = 'ios_a2hs_dismissed';

const PWAInstallIOSModal: React.FC<PWAInstallIOSModalProps> = ({ visible, onClose }) => {
  const [dontShow, setDontShow] = useState(false);

  if (!visible) return null;

  const handleClose = () => {
    try {
      if (dontShow) localStorage.setItem(DONT_SHOW_KEY, '1');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative z-10 w-[92%] max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="px-5 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <h3 className="text-lg font-bold">Add to Home Screen</h3>
          <p className="text-xs opacity-90">Install the app for a full-screen experience</p>
        </div>
        <div className="p-5 text-white">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open this page in Safari on iPhone.</li>
            <li>Tap the Share icon at the bottom.</li>
            <li>Choose <span className="font-semibold text-orange-400">Add to Home Screen</span>.</li>
            <li>Confirm the name, then tap <span className="font-semibold text-orange-400">Add</span>.</li>
          </ol>
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-300">
            <input
              id="dont-show-ios"
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-orange-500"
            />
            <label htmlFor="dont-show-ios">Don’t show these tips again</label>
          </div>
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={handleClose}
            className="w-full bg-black text-white py-2.5 rounded-lg font-semibold hover:bg-gray-900 transition"
            type="button"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallIOSModal;
