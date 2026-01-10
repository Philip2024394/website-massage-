import React from 'react';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

// Enhanced form field with validation feedback
export const EnhancedFormField = ({ 
  label, 
  error, 
  success, 
  required = false, 
  children, 
  ...props 
}) => {
  const hasValue = children?.props?.value && children.props.value.trim().length > 0;
  const showSuccess = success || (hasValue && !error);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {/* Clone children to add enhanced styling */}
        {React.cloneElement(children, {
          ...children.props,
          className: `${children.props.className} ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
              : showSuccess
              ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
              : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
          } transition-all duration-200`
        })}
        
        {/* Success/Error Icons */}
        {(showSuccess || error) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : showSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>
      
      {/* Enhanced error message */}
      {error && (
        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs animate-shake">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      
      {/* Success message */}
      {success && (
        <div className="mt-1 flex items-center gap-1 text-green-600 text-xs">
          <CheckCircle className="w-3 h-3" />
          {success}
        </div>
      )}
    </div>
  );
};

// Enhanced status badge with animations
export const StatusBadge = ({ status, animated = true, size = 'sm' }) => {
  const statusConfig = {
    pending: { 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      pulse: true,
      label: 'Pending'
    },
    confirmed: { 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      pulse: false,
      label: 'Confirmed'
    },
    completed: { 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircle,
      pulse: false,
      label: 'Completed'
    },
    cancelled: { 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: XCircle,
      pulse: false,
      label: 'Cancelled'
    },
    'booking-in-progress': {
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      icon: Clock,
      pulse: true,
      label: 'In Progress'
    },
    searching: {
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Clock,
      pulse: true,
      label: 'Searching'
    }
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  return (
    <div className={`
      inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full font-medium border
      ${config.color}
      ${animated && config.pulse ? 'animate-pulse' : ''}
      transition-all duration-200 hover:shadow-sm
    `}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
      {config.label}
    </div>
  );
};

// Enhanced notification badge for booking counts
export const NotificationBadge = ({ count, color = 'orange' }) => {
  if (!count || count === 0) return null;
  
  const colorClasses = {
    orange: 'bg-orange-500 text-white',
    red: 'bg-red-500 text-white',
    green: 'bg-green-500 text-white',
    blue: 'bg-blue-500 text-white'
  };
  
  return (
    <div className={`
      inline-flex items-center justify-center min-w-[1.25rem] h-5 
      ${colorClasses[color]} text-xs font-bold rounded-full px-1
      animate-bounce shadow-sm
    `}>
      {count > 99 ? '99+' : count}
    </div>
  );
};

// Booking priority indicator
export const PriorityBadge = ({ priority = 'normal', isUrgent = false }) => {
  if (priority === 'normal' && !isUrgent) return null;
  
  const priorityConfig = {
    urgent: {
      color: 'bg-red-100 text-red-800 border-red-200',
      label: '🚨 URGENT',
      pulse: true
    },
    high: {
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      label: '⚡ High Priority',
      pulse: false
    },
    normal: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Normal',
      pulse: false
    }
  };
  
  const config = isUrgent ? priorityConfig.urgent : priorityConfig[priority];
  
  return (
    <div className={`
      inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border
      ${config.color}
      ${config.pulse ? 'animate-pulse' : ''}
    `}>
      {config.label}
    </div>
  );
};

// Connection status indicator
export const ConnectionStatus = ({ isConnected, isReconnecting = false }) => {
  if (isConnected && !isReconnecting) return null;
  
  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full
      ${isReconnecting 
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 animate-pulse' 
        : 'bg-red-100 text-red-800 border-red-200'
      }
    `}>
      <div className={`w-2 h-2 rounded-full ${
        isReconnecting ? 'bg-yellow-500' : 'bg-red-500'
      }`} />
      {isReconnecting ? 'Reconnecting...' : 'Offline'}
    </div>
  );
};