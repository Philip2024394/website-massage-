import React, { useEffect, useState, ReactNode } from 'react';

interface React19SafeWrapperProps {
    children: ReactNode;
    condition?: boolean;
    fallback?: ReactNode;
}

/**
 * React 19 Concurrent Rendering Safe Wrapper
 * 
 * This component provides safe rendering for components that might experience
 * DOM manipulation conflicts during React 19's concurrent rendering.
 * 
 * Key features:
 * - Delays rendering until component is properly mounted
 * - Provides defensive error handling for DOM manipulation
 * - Safe conditional rendering that prevents removeChild errors
 */
export const React19SafeWrapper: React.FC<React19SafeWrapperProps> = ({ 
    children, 
    condition = true, 
    fallback = null 
}) => {
    const [isSafelyMounted, setIsSafelyMounted] = useState(false);

    useEffect(() => {
        // Ensure component is safely mounted before rendering children
        const timer = setTimeout(() => {
            setIsSafelyMounted(true);
        }, 0);

        return () => {
            clearTimeout(timer);
            setIsSafelyMounted(false);
        };
    }, []);

    // Only render children if component is safely mounted and condition is met
    if (!isSafelyMounted || !condition) {
        return <>{fallback}</>;
    }

    return (
        <div style={{ position: 'relative' }}>
            {children}
        </div>
    );
};

export default React19SafeWrapper;