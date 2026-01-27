import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Global industry-standard page container: max width, centered, consistent padding
export const PageContainer: React.FC<PageContainerProps> = ({ children, className }) => {
  return (
    <div className={`w-full max-w-6xl mx-auto px-4 overflow-x-hidden ${className || ''}`}>
      {children}
    </div>
  );
};

export default PageContainer;