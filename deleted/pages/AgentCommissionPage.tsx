import React from 'react';

// Deprecated: Agent commission view has been retired.
// Legacy agent routes are redirected to Indastreet Partner (villa) portal.
const AgentCommissionPage: React.FC = () => {
  if (typeof console !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn('AgentCommissionPage is deprecated and no longer used.');
  }
  return null;
};

export default AgentCommissionPage;

