// ============================================
// AI & Agentic System Types
// ============================================

export enum AgentType {
  PROCUREMENT_COPILOT = 'PROCUREMENT_COPILOT',
  NEGOTIATION = 'NEGOTIATION',
  CHAT = 'CHAT',
  BOQ_GENERATOR = 'BOQ_GENERATOR',
  PRICE_PREDICTOR = 'PRICE_PREDICTOR',
  CONVERSATION_INTEL = 'CONVERSATION_INTEL',
}

export enum AgentSessionStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum NegotiationStatus {
  INIT = 'INIT',
  ANALYZING = 'ANALYZING',
  COUNTER_OFFER_BUYER = 'COUNTER_OFFER_BUYER',
  WAITING_DEALER = 'WAITING_DEALER',
  COUNTER_OFFER_DEALER = 'COUNTER_OFFER_DEALER',
  WAITING_BUYER = 'WAITING_BUYER',
  AGREEMENT = 'AGREEMENT',
  HUMAN_APPROVAL = 'HUMAN_APPROVAL',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  ABORTED = 'ABORTED',
  TIMED_OUT = 'TIMED_OUT',
}

export enum NegotiationStrategy {
  AGGRESSIVE = 'AGGRESSIVE',
  BALANCED = 'BALANCED',
  RELATIONSHIP_PRESERVING = 'RELATIONSHIP_PRESERVING',
}

export interface AgentSession {
  id: string;
  userId: string | null;
  dealerId: string | null;
  agentType: AgentType;
  status: AgentSessionStatus;
  /** JSON string: conversation context */
  context: string | null;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentMessage {
  id: string;
  sessionId: string;
  /** "user", "assistant", "system", or "tool" */
  role: string;
  content: string;
  toolName: string | null;
  /** JSON string: tool call input */
  toolInput: string | null;
  /** JSON string: tool call output */
  toolOutput: string | null;
  /** Model used, e.g. "claude-sonnet-4-20250514" */
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  /** Response latency in milliseconds */
  latencyMs: number | null;
  createdAt: string;
}

export interface AITokenUsage {
  id: string;
  userId: string | null;
  dealerId: string | null;
  agentType: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheHit: boolean;
  /** Response latency in milliseconds */
  latencyMs: number | null;
  costUsd: number | null;
  sessionId: string | null;
  createdAt: string;
}

export interface AICache {
  id: string;
  /** SHA-256 hash of the prompt */
  promptHash: string;
  agentType: string;
  model: string;
  response: string;
  expiresAt: string;
  createdAt: string;
}

export interface NegotiationSession {
  id: string;
  inquiryId: string | null;
  quoteId: string | null;
  buyerId: string | null;
  dealerId: string | null;
  agentSessionId: string | null;
  status: NegotiationStatus;
  strategy: NegotiationStrategy;

  /** Best Alternative to Negotiated Agreement for buyer (paise) */
  buyerBatna: number | null;
  /** Best Alternative to Negotiated Agreement for dealer (paise) */
  dealerBatna: number | null;
  /** Zone of Possible Agreement minimum (paise) */
  zopaMin: number | null;
  /** Zone of Possible Agreement maximum (paise) */
  zopaMax: number | null;
  /** Nash equilibrium price (paise) */
  nashPrice: number | null;
  /** Target price for negotiation (paise) */
  targetPrice: number | null;
  /** Walk-away price threshold (paise) */
  walkawayPrice: number | null;

  maxRounds: number;
  currentRound: number;
  /** Initial quote price in paise */
  initialQuotePrice: number | null;
  /** Final agreed price in paise */
  finalAgreedPrice: number | null;
  /** Total savings in paise */
  savingsAmount: number | null;
  /** Savings as a percentage */
  savingsPercent: number | null;

  timeoutAt: string | null;
  completedAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface NegotiationRound {
  id: string;
  negotiationId: string;
  roundNumber: number;
  /** "buyer", "dealer", or "agent" */
  offeredBy: string;
  /** Offered price in paise */
  offeredPrice: number;
  offeredDeliveryDays: number | null;
  justification: string | null;
  /** Strategy used for this round */
  strategyUsed: string | null;
  /** "accept", "counter", or "reject" */
  response: string | null;
  responseAt: string | null;
  responseMessage: string | null;
  /** JSON string: agent's internal reasoning */
  agentReasoning: string | null;
  createdAt: string;
}

// ============================================
// Chat Session Types (Simpler AI chat, separate from AgentSession)
// ============================================

export interface ChatSession {
  id: string;
  userId: string | null;
  /** For anonymous users who provide email */
  userEmail: string | null;
  userName: string | null;
  /** Auto-generated from first message */
  title: string | null;
  /** "active" or "closed" */
  status: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  /** "user" or "assistant" */
  role: string;
  content: string;
  /** Token count for API usage tracking */
  tokenCount: number | null;
  createdAt: string;
}
