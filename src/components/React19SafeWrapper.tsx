import React, { useEffect, useState, useRef, ReactNode } from 'react';

interface React19SafeWrapperProps {
    children: ReactNode;
    condition?: boolean;
    fallback?: ReactNode;
}

/**
 * React 19 Concurrent Rendering Safe Wrapper
 *
 * - Delays rendering until component is properly mounted.
 * - When condition becomes false (e.g. drawer close), delays unmount by one frame
 *   so portal/close handlers can finish without causing removeChild or state-update crashes.
 */
export const React19SafeWrapper: React.FC<React19SafeWrapperProps> = ({
    children,
    condition = true,
    fallback = null
}) => {
    const [isSafelyMounted, setIsSafelyMounted] = useState(false);
    const [keepChildMounted, setKeepChildMounted] = useState(condition);
    const prevConditionRef = useRef(condition);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSafelyMounted(true);
        }, 0);
        return () => {
            clearTimeout(timer);
            setIsSafelyMounted(false);
        };
    }, []);

    // When condition goes false, keep children mounted for one frame so close/portal teardown doesn't crash
    useEffect(() => {
        if (prevConditionRef.current && !condition) {
            const t = requestAnimationFrame(() => {
                setKeepChildMounted(false);
            });
            return () => cancelAnimationFrame(t);
        }
        prevConditionRef.current = condition;
        if (condition) setKeepChildMounted(true);
    }, [condition]);

    const shouldRender = isSafelyMounted && (condition || keepChildMounted);
    if (!shouldRender) {
        return <>{fallback}</>;
    }

    return <div style={{ position: 'relative' }}>{children}</div>;
};

export default React19SafeWrapper;