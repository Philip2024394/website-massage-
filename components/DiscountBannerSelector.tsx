// @ts-nocheck
import React, { useState } from 'react';
import { Gift, X, Check, Tag } from 'lucide-react';

interface DiscountBannerSelectorProps {
  onSend: (percentage: number, bannerUrl: string) => void;
  onClose: () => void;
  memberName?: string;
}

const DiscountBannerSelector: React.FC<DiscountBannerSelectorProps> = ({ 
  onSend, 
  onClose,
  memberName 
}) => {
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState(
    'Thank you for your order and payment! Please accept this discount for your next booking 🎁'
  );

  // Banner URLs - Actual discount banner images
  const discountBanners = {
    5: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532',
    10: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896',
    15: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221',
    20: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034'
  };

  const handleSend = () => {
    if (selectedPercentage) {
      onSend(selectedPercentage, discountBanners[selectedPercentage]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Send Discount Banner</h3>
                <p className="text-sm text-orange-100">Thank your customer with a special offer</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Discount Options */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Select Discount Percentage
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[5, 10, 15, 20].map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => setSelectedPercentage(percentage)}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    selectedPercentage === percentage
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full ${
                      selectedPercentage === percentage
                        ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className="text-2xl font-bold">{percentage}%</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {percentage}% Off
                    </span>
                  </div>
                  {selectedPercentage === percentage && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview Banner */}
          {selectedPercentage && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Preview
              </label>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <img
                  src={discountBanners[selectedPercentage]}
                  alt={`${selectedPercentage}% discount banner`}
                  className="w-full rounded-lg"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-8 rounded-lg text-center">
                        <div class="text-6xl font-bold mb-2">${selectedPercentage}%</div>
                        <div class="text-xl font-semibold">DISCOUNT</div>
                        <div class="text-sm mt-2 opacity-90">Valid for 30 days</div>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          )}

          {/* Custom Message */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex gap-3">
              <Tag className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Discount Details:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Valid for 30 days from today</li>
                  <li>Can be used once per customer</li>
                  <li>Applies to their next booking</li>
                  <li>Unique code will be auto-generated</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedPercentage}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-semibold shadow-lg hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Send Discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountBannerSelector;
