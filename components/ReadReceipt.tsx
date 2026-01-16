/**
 * ReadReceipt Component
 * WhatsApp/Facebook style checkmarks for message status
 * ✓ = sent, ✓✓ = delivered, ✓✓ (blue) = read
 */

import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

interface ReadReceiptProps {
  status: 'sent' | 'delivered' | 'read' | 'none';
  size?: number;
  className?: string;
}

export const ReadReceipt: React.FC<ReadReceiptProps> = ({
  status,
  size = 16,
  className = ''
}) => {
  if (status === 'none') return null;

  const iconClasses = status === 'read' ? 'text-blue-500' : 'text-gray-400';

  return (
    <div className={`flex items-center ${className}`}>
      {status === 'sent' && (
        <Check size={size} className={iconClasses} />
      )}
      {(status === 'delivered' || status === 'read') && (
        <CheckCheck size={size} className={iconClasses} />
      )}
    </div>
  );
};
