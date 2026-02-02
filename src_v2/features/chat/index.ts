// Chat UI Feature - Entry Point
// This exports the main chat UI components that use the Step 15 chat core

export { ChatContainer } from './ChatContainer';
export { ChatMessageComponent } from './components/ChatMessage';
export { ChatInput } from './components/ChatInput';

// Re-export types from core for convenience
export type { 
  ChatMessage,
  CreateMessageRequest,
  SendMessageResult 
} from '../../core/chat';