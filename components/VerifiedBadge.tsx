import React from 'react';
import { Shield } from 'lucide-react';
import './VerifiedBadge.css';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ 
  size = 'medium', 
  showLabel = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'verified-badge-small',
    medium: 'verified-badge-medium',
    large: 'verified-badge-large'
  };

  return (
    <div className={`verified-badge ${sizeClasses[size]} ${className}`}>
      <Shield className="verified-icon" />
      {showLabel && <span className="verified-label">VERIFIED</span>}
    </div>
  );
};

export default VerifiedBadge;
