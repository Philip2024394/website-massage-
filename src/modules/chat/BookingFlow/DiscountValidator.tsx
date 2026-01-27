/**
 * Discount Code Validator Component
 * Extracted from PersistentChatWindow.tsx for better maintainability
 * Preserves all UI design while splitting into focused component
 */

import React from 'react';
import { Tag, AlertTriangle } from 'lucide-react';

interface DiscountValidation {
  valid: boolean;
  percentage?: number;
  message: string;
  codeData?: any;
}

interface DiscountValidatorProps {
  discountCode: string;
  setDiscountCode: (code: string) => void;
  discountValidation: DiscountValidation | null;
  isValidatingDiscount: boolean;
  onValidateDiscount: () => Promise<void>;
}

export const DiscountValidator: React.FC<DiscountValidatorProps> = ({
  discountCode,
  setDiscountCode,
  discountValidation,
  isValidatingDiscount,
  onValidateDiscount
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-green-700">Discount Code</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
          placeholder="Enter discount code"
          className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          maxLength={20}
        />
        <button
          onClick={onValidateDiscount}
          disabled={!discountCode.trim() || isValidatingDiscount}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        >
          {isValidatingDiscount ? 'Checking...' : 'Apply'}
        </button>
      </div>
      
      {discountValidation && (
        <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-sm ${
          discountValidation.valid 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {discountValidation.valid ? (
            <Tag className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{discountValidation.message}</span>
        </div>
      )}
    </div>
  );
};