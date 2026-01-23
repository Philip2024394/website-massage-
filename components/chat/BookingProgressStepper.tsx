/**
 * BookingProgressStepper Component
 * Visual progress indicator for booking flow stages
 */

import React from 'react';
import { Check, Clock, Car, Home, Sparkles, CreditCard, Star } from 'lucide-react';

export type BookingProgressStep = 
  | 'requested' 
  | 'accepted' 
  | 'confirmed' 
  | 'preparing' 
  | 'en_route' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed';

interface BookingProgressStepperProps {
  currentStep: BookingProgressStep;
  variant?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showTimes?: boolean;
  stepTimes?: Record<BookingProgressStep, Date | null>;
}

export const BookingProgressStepper: React.FC<BookingProgressStepperProps> = ({
  currentStep,
  variant = 'horizontal',
  showLabels = true,
  showTimes = false,
  stepTimes = {}
}) => {
  const steps: Array<{
    key: BookingProgressStep;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      key: 'requested',
      label: 'Requested',
      icon: <Clock className="w-4 h-4" />,
      description: 'Booking sent to therapist'
    },
    {
      key: 'accepted',
      label: 'Accepted',
      icon: <Check className="w-4 h-4" />,
      description: 'Therapist accepted request'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      icon: <Check className="w-4 h-4" />,
      description: 'Booking confirmed by customer'
    },
    {
      key: 'preparing',
      label: 'Preparing',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Therapist preparing equipment'
    },
    {
      key: 'en_route',
      label: 'En Route',
      icon: <Car className="w-4 h-4" />,
      description: 'Therapist traveling to location'
    },
    {
      key: 'arrived',
      label: 'Arrived',
      icon: <Home className="w-4 h-4" />,
      description: 'Therapist has arrived'
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Massage session active'
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: <Star className="w-4 h-4" />,
      description: 'Service completed successfully'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepColors = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-green-500',
          border: 'border-green-500',
          text: 'text-green-500',
          bgLight: 'bg-green-100'
        };
      case 'active':
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-500',
          text: 'text-blue-500',
          bgLight: 'bg-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-300',
          border: 'border-gray-300',
          text: 'text-gray-400',
          bgLight: 'bg-gray-100'
        };
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (variant === 'vertical') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 mx-4 mb-4">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Booking Progress
        </h4>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const colors = getStepColors(status);
            const time = stepTimes[step.key];
            
            return (
              <div key={step.key} className="flex items-start gap-4">
                {/* Step Icon */}
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full border-2 ${colors.border} ${colors.bg} flex items-center justify-center text-white`}>
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <div className={status === 'active' ? 'text-white' : 'text-gray-400'}>
                        {step.icon}
                      </div>
                    )}
                  </div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-5 top-10 w-0.5 h-8 ${status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-center justify-between">
                    <h5 className={`font-semibold ${colors.text}`}>{step.label}</h5>
                    {showTimes && time && (
                      <span className="text-xs text-gray-500">{formatTime(time)}</span>
                    )}
                  </div>
                  {showLabels && (
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                  )}
                  
                  {/* Active Step Animation */}
                  {status === 'active' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mx-4 mb-4">
      <h4 className="font-semibold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        Booking Progress
      </h4>
      
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const colors = getStepColors(status);
          const time = stepTimes[step.key];
          
          return (
            <React.Fragment key={step.key}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full border-2 ${colors.border} ${colors.bg} flex items-center justify-center text-white mb-2 relative`}>
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <div className={status === 'active' ? 'text-white' : 'text-gray-400'}>
                      {step.icon}
                    </div>
                  )}
                  
                  {/* Active Pulse */}
                  {status === 'active' && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping"></div>
                  )}
                </div>
                
                {/* Label */}
                {showLabels && (
                  <div className="text-center">
                    <p className={`text-xs font-medium ${colors.text}`}>{step.label}</p>
                    {showTimes && time && (
                      <p className="text-xs text-gray-400 mt-1">{formatTime(time)}</p>
                    )}
                  </div>
                )}
                
                {/* Active Status */}
                {status === 'active' && (
                  <div className="mt-2 flex items-center gap-1">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={`flex-shrink-0 h-0.5 w-8 mx-1 ${status === 'completed' ? 'bg-green-300' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Current Status Description */}
      <div className="mt-4 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          getStepColors(getStepStatus(getCurrentStepIndex())).bgLight
        }`}>
          <div className={getStepColors(getStepStatus(getCurrentStepIndex())).text}>
            {steps[getCurrentStepIndex()]?.icon}
          </div>
          <span className={`text-sm font-medium ${
            getStepColors(getStepStatus(getCurrentStepIndex())).text
          }`}>
            {steps[getCurrentStepIndex()]?.description}
          </span>
        </div>
      </div>
    </div>
  );
};