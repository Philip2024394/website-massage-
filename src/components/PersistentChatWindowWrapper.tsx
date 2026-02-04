import React from 'react';
import PersistentChatWindow from './PersistentChatWindow';

/**
 * Wrapper component for PersistentChatWindow
 * Ensures single root element for React reconciliation
 * Prevents JSX closing tag mismatches
 */
export default function PersistentChatWindowWrapper(props: any) {
  return (
    <React.Fragment>
      <PersistentChatWindow {...props} />
    </React.Fragment>
  );
}
