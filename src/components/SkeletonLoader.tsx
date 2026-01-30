import React from 'react';
import '../styles/elite-therapist-dashboard.css';

export const SkeletonLoader: React.FC<{ width?: string | number; height?: string | number; style?: React.CSSProperties; className?: string }> = ({ width = '100%', height = 48, style, className = '' }) => (
  <div
    className={`elite-skeleton ${className}`}
    style={{ width, height, ...style }}
    aria-busy="true"
    aria-label="Loading..."
  />
);
