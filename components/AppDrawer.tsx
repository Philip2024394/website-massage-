/**
 * Shim: delegate legacy AppDrawer to the clean implementation
 */
import React from 'react';

// Placeholder AppDrawer component
export const AppDrawer = ({ children }: { children?: React.ReactNode }) => {
    return <div>{children}</div>;
};
