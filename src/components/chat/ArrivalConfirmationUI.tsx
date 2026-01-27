/**
 * ArrivalConfirmationUI Component
 * UI for when therapist has arrived with service preparation
 */

import React, { useState } from 'react';
import { CheckCircle, MapPin, Clock, CreditCard, Phone, AlertCircle, Sparkles } from 'lucide-react';
import { formatTime, formatPrice } from "../../modules/chat/utils/chatHelpers";

export interface ArrivalConfirmationUIProps {
  therapist: {
    id: string;
    name: string;
    image?: string;
    phone?: string;
  };
  booking: {
    serviceType: string;
    duration: number;
    totalPrice: number;
    arrivedAt?: string;
    location?: string;
  };
  onStartService: () => void;
  onContactTherapist: () => void;
  onEmergencyContact: () => void;
  onConfirmPaymentMethod: (method: 'cash' | 'bank_transfer') => void;
}

export const ArrivalConfirmationUI: React.FC<ArrivalConfirmationUIProps> = ({
  therapist,
  booking,
  onStartService,
  onContactTherapist,
  onEmergencyContact,
  onConfirmPaymentMethod
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const arrivedTime = booking.arrivedAt ? new Date(booking.arrivedAt) : new Date();

  const handleStartService = () => {
    if (!paymentMethod) {
      alert('Please select payment method first');
      return;
    }
    onConfirmPaymentMethod(paymentMethod);
    onStartService();
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 m-4 shadow-lg">
      {/* Arrival Header */}
      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-purple-800 text-xl mb-1">🎉 Therapist Has Arrived!</h3>
        <p className="text-purple-600 text-sm">
          {therapist.name} is here • Arrived {formatTime(arrivedTime)}
        </p>
      </div>

      {/* Therapist Card */}
      <div className="bg-white rounded-xl p-4 border border-purple-100 mb-4">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <img 
              src={therapist.image || '/placeholder-avatar.jpg'} 
              alt={therapist.name}
              className="w-16 h-16 rounded-full object-cover border-3 border-purple-400"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-lg">{therapist.name}</h4>
            <p className="text-sm text-gray-600">Ready to begin your massage</p>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-purple-600">{booking.location || 'At your location'}</span>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <button
          onClick={onContactTherapist}
          className="w-full bg-purple-100 text-purple-700 font-semibold py-2 rounded-lg hover:bg-purple-200 transition-all flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Contact Therapist
        </button>
      </div>

      {/* Service Details */}
      <div className="bg-purple-100 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h5 className="font-semibold text-purple-800">Service Details</h5>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-purple-700">Service:</span>
            <span className="font-semibold text-purple-900">{booking.serviceType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">Duration:</span>
            <span className="font-semibold text-purple-900">{booking.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">Total:</span>
            <span className="font-bold text-purple-900 text-lg">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-4">
        <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Select Payment Method
        </h5>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-3 rounded-xl border-2 transition-all ${
              paymentMethod === 'cash'
                ? 'border-purple-500 bg-purple-100 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">💵</div>
              <div className="font-semibold">Cash</div>
              <div className="text-xs text-gray-500">Pay after service</div>
            </div>
          </button>
          
          <button
            onClick={() => setPaymentMethod('bank_transfer')}
            className={`p-3 rounded-xl border-2 transition-all ${
              paymentMethod === 'bank_transfer'
                ? 'border-purple-500 bg-purple-100 text-purple-700'
                : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🏦</div>
              <div className="font-semibold">Bank Transfer</div>
              <div className="text-xs text-gray-500">Digital payment</div>
            </div>
          </button>
        </div>
      </div>

      {/* Preparation Checklist */}
      <div className="bg-white rounded-xl p-4 border border-purple-100 mb-4">
        <h5 className="font-semibold text-purple-800 mb-3">✓ Pre-Service Checklist</h5>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="clean-area" 
              defaultChecked 
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="clean-area" className="text-sm text-gray-700">Massage area is clean and prepared</label>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="towels-ready" 
              defaultChecked 
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="towels-ready" className="text-sm text-gray-700">Clean towels are available</label>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="payment-ready" 
              checked={paymentMethod !== null} 
              onChange={() => {}} 
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="payment-ready" className="text-sm text-gray-700">Payment method selected</label>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="ready-to-start" 
              checked={isReady} 
              onChange={(e) => setIsReady(e.target.checked)} 
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="ready-to-start" className="text-sm text-gray-700 font-semibold">I'm ready to begin the massage</label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleStartService}
          disabled={!paymentMethod || !isReady}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Sparkles className="w-5 h-5" />
          Start My Massage Session
        </button>

        {/* Emergency Contact */}
        <button
          onClick={onEmergencyContact}
          className="w-full bg-red-50 border-2 border-red-200 text-red-600 font-semibold py-2 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Emergency Contact
        </button>
      </div>

      {/* Safety Notice */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-yellow-800">
            <p className="font-semibold mb-1">Safety Reminder:</p>
            <p>Your therapist is a licensed professional. Feel free to communicate any preferences or concerns before the session begins.</p>
          </div>
        </div>
      </div>
    </div>
  );
};