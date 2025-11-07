/**
 * Membership Gate Component
 * 
 * Conditionally renders children based on membership system status
 * Used throughout the app to hide/show membership-related features
 */

import React, { ReactNode } from 'react';
import { useMembershipEnabled } from '../lib/appConfigService';

interface MembershipGateProps {
    children: ReactNode;
    fallback?: ReactNode;
    showWhenDisabled?: boolean; // If true, shows children when membership is disabled
    loading?: ReactNode;
}

/**
 * MembershipGate - Hide/show content based on membership system status
 * 
 * @param children - Content to show/hide
 * @param fallback - Content to show when membership is disabled (optional)
 * @param showWhenDisabled - If true, shows children when membership is OFF (default: false)
 * @param loading - Loading content while checking status
 */
export const MembershipGate: React.FC<MembershipGateProps> = ({ 
    children, 
    fallback = null, 
    showWhenDisabled = false,
    loading = null
}) => {
    const { enabled: membershipEnabled, loading: isLoading } = useMembershipEnabled();

    // Show loading state if provided
    if (isLoading && loading) {
        return <>{loading}</>;
    }

    // Normal behavior: show children when membership is enabled
    if (!showWhenDisabled) {
        return membershipEnabled ? <>{children}</> : <>{fallback}</>;
    }

    // Reverse behavior: show children when membership is disabled
    return !membershipEnabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * Hook to check if membership features should be shown
 */
export const useMembershipGate = () => {
    const { enabled: membershipEnabled, loading } = useMembershipEnabled();
    
    return {
        shouldShowMembership: membershipEnabled,
        shouldShowFreeOnly: !membershipEnabled,
        isLoading: loading
    };
};

/**
 * Higher-order component to wrap entire pages/components
 */
export const withMembershipGate = <P extends object>(
    Component: React.ComponentType<P>,
    fallbackComponent?: React.ComponentType<P>
) => {
    return (props: P) => {
        const { shouldShowMembership } = useMembershipGate();
        
        if (shouldShowMembership) {
            return <Component {...props} />;
        }
        
        if (fallbackComponent) {
            const FallbackComponent = fallbackComponent;
            return <FallbackComponent {...props} />;
        }
        
        return null;
    };
};

export default MembershipGate;