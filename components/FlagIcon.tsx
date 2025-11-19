import React from 'react';

type Props = {
  code?: string;
  title?: string;
  className?: string;
  squared?: boolean;
};

export const FlagIcon: React.FC<Props> = ({ code, title, className = '', squared = true }) => {
  if (!code) return null;
  const cc = code.toLowerCase();
  const base = squared ? 'fis' : 'fi';
  return (
    <span
      className={`${base} fi-${cc} rounded-full inline-block align-middle ${className}`}
      aria-label={title || `Flag of ${code}`}
      title={title}
    />
  );
};

export default FlagIcon;
