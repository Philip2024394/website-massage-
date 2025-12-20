/**
 * Pricing Section Component
 * Handles pricing configuration, hotel/villa pricing, and discount management
 * Max size: 15KB (Facebook/Amazon standard)
 */


import CustomCheckbox from '../../../../../components/CustomCheckbox';
import CurrencyRpIcon from '../../../../../components/icons/CurrencyRpIcon';

interface Pricing {
  '60': number;
  '90': number;
  '120': number;
}

interface PricingSectionProps {
  pricing: Pricing;
  setPricing: (value: Pricing) => void;
  hotelVillaPricing: Pricing;
  setHotelVillaPricing: (value: Pricing) => void;
  useSamePricing: boolean;
  setUseSamePricing: (value: boolean) => void;
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
  discountDuration: number;
  setDiscountDuration: (value: number) => void;
  isDiscountActive: boolean;
  setIsDiscountActive: (value: boolean) => void;
  discountEndTime: string;
  setDiscountEndTime: (value: string) => void;
  handlePriceChange: (duration: keyof Pricing, value: string) => void;
  handleHotelVillaPriceChange: (duration: keyof Pricing, value: string) => void;
  handleUseSamePricingChange: (checked: boolean) => void;
  formatPriceForDisplay: (value: number) => string;
  t: any;
}

const PricingSection = ({
  pricing,
  handlePriceChange,
  hotelVillaPricing,
  handleHotelVillaPriceChange,
  useSamePricing,
  handleUseSamePricingChange,
  discountPercentage,
  setDiscountPercentage,
  formatPriceForDisplay,
  t,
}: PricingSectionProps): JSX.Element => {
  return (
    <div className="space-y-6">
      {/* Regular Pricing */}
      <div>
        <h3 className="text-md font-medium text-gray-800">{t?.pricingTitle || 'Pricing'}</h3>
        <p className="text-xs text-gray-500 mt-1">Set your online massage prices</p>

        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <label className="block text-xs font-semibold text-orange-800 text-center mb-1">
              {t?.['60min'] || '60 min'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <CurrencyRpIcon className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                value={formatPriceForDisplay(pricing['60'])}
                onChange={(e) => handlePriceChange('60', e.target.value)}
                placeholder="345k"
                className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
              />
            </div>
            {pricing['60'] > 0 && (
              <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                Rp {pricing['60'].toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <label className="block text-xs font-semibold text-blue-800 text-center mb-1">
              {t?.['90min'] || '90 min'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <CurrencyRpIcon className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                value={formatPriceForDisplay(pricing['90'])}
                onChange={(e) => handlePriceChange('90', e.target.value)}
                placeholder="450k"
                className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
              />
            </div>
            {pricing['90'] > 0 && (
              <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                Rp {pricing['90'].toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <label className="block text-xs font-semibold text-green-800 text-center mb-1">
              {t?.['120min'] || '120 min'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <CurrencyRpIcon className="h-3 w-3 text-gray-400" />
              </div>
              <input
                type="text"
                value={formatPriceForDisplay(pricing['120'])}
                onChange={(e) => handlePriceChange('120', e.target.value)}
                placeholder="550k"
                className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
              />
            </div>
            {pricing['120'] > 0 && (
              <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                Rp {pricing['120'].toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Hotel/Villa Pricing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-md font-medium text-gray-800">
              🏨 Hotel/Villa Pricing
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Special pricing for hotel & villa partnerships
            </p>
          </div>
          <CustomCheckbox
            label="Same as regular"
            checked={useSamePricing}
            onChange={() => handleUseSamePricingChange(!useSamePricing)}
          />
        </div>

        {!useSamePricing && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <label className="block text-xs font-semibold text-purple-800 text-center mb-1">
                  60 min
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <CurrencyRpIcon className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatPriceForDisplay(hotelVillaPricing['60'])}
                    onChange={(e) => handleHotelVillaPriceChange('60', e.target.value)}
                    placeholder="345k"
                    className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
                  />
                </div>
                {hotelVillaPricing['60'] > 0 && (
                  <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                    Rp {hotelVillaPricing['60'].toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <label className="block text-xs font-semibold text-purple-800 text-center mb-1">
                  90 min
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <CurrencyRpIcon className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatPriceForDisplay(hotelVillaPricing['90'])}
                    onChange={(e) => handleHotelVillaPriceChange('90', e.target.value)}
                    placeholder="450k"
                    className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
                  />
                </div>
                {hotelVillaPricing['90'] > 0 && (
                  <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                    Rp {hotelVillaPricing['90'].toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <label className="block text-xs font-semibold text-purple-800 text-center mb-1">
                  120 min
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <CurrencyRpIcon className="h-3 w-3 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formatPriceForDisplay(hotelVillaPricing['120'])}
                    onChange={(e) => handleHotelVillaPriceChange('120', e.target.value)}
                    placeholder="550k"
                    className="block w-full pl-7 pr-1 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 font-mono text-sm"
                  />
                </div>
                {hotelVillaPricing['120'] > 0 && (
                  <p className="text-[10px] text-gray-600 mt-0.5 text-center">
                    Rp {hotelVillaPricing['120'].toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              ℹ️ Hotel/Villa pricing can be max 20% higher than regular pricing
            </p>
          </>
        )}
      </div>

      {/* Discount Configuration */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-4">
        <h3 className="text-md font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-xl">🏷️</span>
          Promotional Discount
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Offer temporary discounts to attract more customers
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount Percentage
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
              className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-orange-500 text-gray-900"
              placeholder="Enter discount % (max 50%)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum discount: 50%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
