/**
 * 🔒 SAFE PAGE WRAPPER COMPONENT
 * 
 * Implements the mandatory scroll architecture pattern for mobile compatibility.
 * Use this wrapper for ALL page components to ensure consistent scroll behavior.
 * 
 * ✅ SAFE FEATURES:
 * - Body scrolling preserved
 * - No height: 100vh usage
 * - Mobile keyboard safe
 * - Respects ONE SCROLL AUTHORITY
 * 
 * ❌ FORBIDDEN FEATURES:
 * - Never locks body scroll
 * - Never uses h-screen or min-h-screen
 * - Never sets position: fixed on page wrapper
 */

import React from 'react';
import { ScrollArchitecture } from '../../utils/scrollArchitecture';

interface SafePageWrapperProps {
  children: React.ReactNode;
  className?: string;
  componentName?: string;
  allowHeaderFixed?: boolean;
}

/**
 * SafePageWrapper - The official scroll-safe page wrapper
 * 
 * USAGE:
 * ```tsx
 * <SafePageWrapper componentName="HomePage">
 *   <Header />
 *   <main>
 *     {content}
 *   </main>
 * </SafePageWrapper>
 * ```
 */
export const SafePageWrapper: React.FC<SafePageWrapperProps> = ({ 
  children, 
  className = '', 
  componentName = 'Page',
  allowHeaderFixed = true
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      // Validate scroll architecture compliance
      const isValid = ScrollArchitecture.validateElement(ref.current, componentName);
      if (!isValid && process.env.NODE_ENV === 'development') {
        console.warn(`🚫 ${componentName} has scroll architecture violations`);
      }
    }
  }, [componentName]);

  return (
    <div 
      ref={ref}
      className={`safe-page-wrapper min-h-full w-full overflow-x-hidden ${className}`}
      style={{
        // ENFORCED: Never use 100vh or h-screen
        minHeight: 'auto', // Let content grow naturally
        overflow: 'visible', // Never hide scroll
        position: 'relative' // Never use fixed positioning on page wrapper
      }}
    >
      {children}
    </div>
  );
};

/**
 * SafeChatContainer - For chat message lists that need internal scrolling
 * 
 * USAGE:
 * ```tsx
 * <SafeChatContainer maxHeight="60vh">
 *   {messages}
 * </SafeChatContainer>
 * ```
 */
interface SafeChatContainerProps {
  children: React.ReactNode;
  maxHeight?: string;
  className?: string;
}

export const SafeChatContainer: React.FC<SafeChatContainerProps> = ({ 
  children, 
  maxHeight = '60vh',
  className = '' 
}) => {
  return (
    <div 
      className={`safe-chat-container ${className}`}
      style={{
        maxHeight, // Use maxHeight instead of height: 100vh
        overflowY: 'auto', // Allow internal scrolling
        WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
        // NEVER set body overflow to hidden globally
      }}
    >
      {children}
    </div>
  );
};

/**
 * SafeModal - Modal component that respects global scroll architecture
 * 
 * USAGE:
 * ```tsx
 * <SafeModal isOpen={true} onClose={handleClose}>
 *   <ModalContent />
 * </SafeModal>
 * ```
 */
interface SafeModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SafeModal: React.FC<SafeModalProps> = ({ 
  children, 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - allows page scrolling behind it */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal Content - scrollable if needed */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto w-full max-w-md ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>
  );
};

/**
 * Development utility to check if current page violates scroll architecture
 */
export const useScrollArchitectureValidator = (componentName: string) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const checkGlobalState = () => {
        ScrollArchitecture.validateGlobalScrollState();
        
        // Check for common violations
        const body = document.body;
        const html = document.documentElement;
        
        if (getComputedStyle(body).overflow === 'hidden') {
          console.error(`🚨 ${componentName}: Body overflow is hidden! This breaks mobile scrolling.`);
        }
        
        if (getComputedStyle(html).overflow === 'hidden') {
          console.error(`🚨 ${componentName}: HTML overflow is hidden! This violates scroll architecture.`);
        }
        
        // Check for viewport height violations
        const vhElements = document.querySelectorAll('[style*="100vh"], [class*="h-screen"], [class*="min-h-screen"]');
        if (vhElements.length > 0) {
          console.warn(`⚠️ ${componentName}: Found ${vhElements.length} elements using forbidden viewport heights:`, vhElements);
        }
      };
      
      checkGlobalState();
      
      // Recheck periodically during development
      const interval = setInterval(checkGlobalState, 5000);
      return () => clearInterval(interval);
    }
  }, [componentName]);
};

export default SafePageWrapper;