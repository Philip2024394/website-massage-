/**
 * PaymentFlowUI Component
 * Enhanced payment interface for booking flow
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  DollarSign,
  Lock,
  Shield,
  Check,
  AlertCircle,
  Info,
  Gift,
  Percent,
  Clock
} from 'lucide-react';

export type PaymentMethod = 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
  processingTime: string;
  fees?: string;
}

interface PricingBreakdown {
  servicePrice: number;
  travelFee?: number;
  tip?: number;
  discount?: number;
  promoCode?: string;
  total: number;
}

interface PaymentFlowUIProps {
  pricing: PricingBreakdown;
  selectedMethod?: PaymentMethod;
  onMethodSelect: (method: PaymentMethod) => void;
  onPaymentSubmit: (paymentData: any) => void;
  isProcessing?: boolean;
  showTipping?: boolean;
  allowPromoCode?: boolean;
  currency?: string;
}

export const PaymentFlowUI: React.FC<PaymentFlowUIProps> = ({
  pricing,
  selectedMethod,
  onMethodSelect,
  onPaymentSubmit,
  isProcessing = false,
  showTipping = true,
  allowPromoCode = true,
  currency = 'USD'
}) => {
  const [tipAmount, setTipAmount] = useState(pricing.tip || 0);
  const [promoCode, setPromoCode] = useState(pricing.promoCode || '');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const paymentOptions: PaymentOption[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa, Mastercard, American Express',
      available: true,
      processingTime: 'Instant',
      fees: 'No fees'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pay with your PayPal account',
      available: true,
      processingTime: 'Instant',
      fees: 'No fees'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Quick and secure payment',
      available: true,
      processingTime: 'Instant',
      fees: 'No fees'
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pay with Google',
      available: true,
      processingTime: 'Instant',
      fees: 'No fees'
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: <DollarSign className="w-6 h-6" />,
      description: 'Pay therapist directly in cash',
      available: true,
      processingTime: 'On arrival',
      fees: 'No fees'
    }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateTotal = () => {
    const subtotal = pricing.servicePrice + (pricing.travelFee || 0) + tipAmount;
    const discount = pricing.discount || 0;
    return Math.max(0, subtotal - discount);
  };

  const tipPresets = [15, 18, 20, 25]; // percentage presets

  const handleTipSelect = (percentage: number) => {
    const tip = Math.round((pricing.servicePrice * percentage) / 100);
    setTipAmount(tip);
  };

  const handlePaymentSubmit = () => {
    const paymentData = {
      method: selectedMethod,
      amount: calculateTotal(),
      tip: tipAmount,
      promoCode: promoCode,
      cardDetails: selectedMethod === 'card' ? cardDetails : undefined
    };
    
    onPaymentSubmit(paymentData);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mx-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <CreditCard className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-gray-800">Payment Details</h3>
          <p className="text-sm text-gray-600">Choose your preferred payment method</p>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-gray-800 mb-3">Pricing Summary</h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-gray-700">
            <span>Massage Service</span>
            <span>{formatCurrency(pricing.servicePrice)}</span>
          </div>
          
          {pricing.travelFee && pricing.travelFee > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Travel Fee</span>
              <span>{formatCurrency(pricing.travelFee)}</span>
            </div>
          )}
          
          {showTipping && (
            <div className="flex justify-between text-gray-700">
              <span>Tip</span>
              <span>{formatCurrency(tipAmount)}</span>
            </div>
          )}
          
          {pricing.discount && pricing.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="flex items-center gap-1">
                <Gift className="w-4 h-4" />
                Discount {promoCode && `(${promoCode})`}
              </span>
              <span>-{formatCurrency(pricing.discount)}</span>
            </div>
          )}
          
          <hr className="my-2" />
          
          <div className="flex justify-between font-bold text-lg text-gray-800">
            <span>Total</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
        </div>
      </div>

      {/* Tipping Section */}
      {showTipping && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="font-semibold text-gray-800">Add Tip</h4>
            <Info className="w-4 h-4 text-gray-400" title="Tips help support our therapists" />
          </div>
          
          <div className="flex gap-2 mb-3">
            {tipPresets.map(percentage => {
              const amount = Math.round((pricing.servicePrice * percentage) / 100);
              return (
                <button
                  key={percentage}
                  onClick={() => handleTipSelect(percentage)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    tipAmount === amount
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {percentage}%
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Custom:</span>
            <input
              type="number"
              value={tipAmount}
              onChange={(e) => setTipAmount(Number(e.target.value) || 0)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center"
              min="0"
            />
            <span className="text-sm text-gray-600">USD</span>
          </div>
        </div>
      )}

      {/* Promo Code */}
      {allowPromoCode && (
        <div className="mb-6">
          {!showPromoInput ? (
            <button
              onClick={() => setShowPromoInput(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Gift className="w-4 h-4" />
              Have a promo code?
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  // Apply promo code logic here
                  console.log('Applying promo code:', promoCode);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Payment Methods */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">Payment Method</h4>
        
        <div className="space-y-3">
          {paymentOptions.map(option => (
            <div
              key={option.id}
              onClick={() => option.available && onMethodSelect(option.id)}
              className={`p-4 border rounded-xl cursor-pointer transition-all ${
                selectedMethod === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : option.available
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={selectedMethod === option.id ? 'text-blue-600' : 'text-gray-600'}>
                    {option.icon}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800">{option.name}</h5>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <Clock className="w-3 h-3" />
                    {option.processingTime}
                  </div>
                  <div className="text-xs text-gray-500">{option.fees}</div>
                </div>
              </div>
              
              {selectedMethod === option.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {option.id === 'card' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Card number"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          placeholder="CVV"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Cardholder name"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                  
                  {option.id === 'cash' && (
                    <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Pay on arrival</span>
                      </div>
                      <p className="mt-1">
                        Please have exact change ready. The therapist will confirm payment before starting the service.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700 mb-2">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Secure Payment</span>
        </div>
        <p className="text-sm text-green-700">
          Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
        </p>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePaymentSubmit}
        disabled={!selectedMethod || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            Pay {formatCurrency(calculateTotal())}
          </>
        )}
      </button>
    </div>
  );
};