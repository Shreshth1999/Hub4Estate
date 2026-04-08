// ============================================
// Messaging System Types
// ============================================

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SYSTEM = 'SYSTEM',
  TOOL_RESULT = 'TOOL_RESULT',
}

export interface Conversation {
  id: string;
  title: string | null;
  /** "direct", "inquiry", or "negotiation" */
  type: string;
  /** Inquiry ID, negotiation ID, etc. */
  referenceId: string | null;
  /** "inquiry", "negotiation", "rfq" */
  referenceType: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  /** User or dealer ID */
  accountId: string;
  /** "user", "dealer", or "admin" */
  accountType: string;
  lastReadAt: string | null;
  isMuted: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  /** "user", "dealer", "admin", or "system" */
  senderType: string;
  type: MessageType;
  content: string;
  /** JSON string: image URL, tool result, etc. */
  metadata: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}
