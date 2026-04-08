# &sect;9 -- AGENTIC SYSTEMS ARCHITECTURE

> *Every agent described in this section ships now. No "Phase 2" hedging. Each agent has a defined model, tools, state machine, safety rails, cost budget, latency target, and fallback behavior. If the AI layer fails, the platform degrades gracefully -- never silently, never catastrophically.*

---

## 9.1 Agent Infrastructure Layer

All agents run on a shared infrastructure substrate. This section defines that substrate before specifying individual agents.

### 9.1.1 Runtime Environment

| Parameter | Value | Justification |
|-----------|-------|---------------|
| Orchestration Framework | LangChain.js v0.3+ (TypeScript) | Native streaming, tool calling, memory management, agent executor with built-in retry |
| Primary LLM Provider | Anthropic Claude API | Best tool-calling reliability, longest context window, lowest hallucination rate for structured output |
| LLM Client Library | `@anthropic-ai/sdk` v4+ | Direct SDK for fine-grained control over streaming, tool use, and token counting |
| State Store | PostgreSQL (`agent_sessions`, `agent_messages`, `negotiation_sessions`) | Durable, queryable, transactional -- survives server restarts |
| Hot State Cache | Redis (Upstash) with 24h TTL | Active session state for sub-10ms reads during live conversations |
| Message Queue | BullMQ on Redis | Async agent tasks: negotiation round processing, BOQ generation, price prediction batch |
| Observability | LangSmith (LangChain tracing) + Sentry | Full trace of every agent invocation: model calls, tool executions, token usage, latency per step |
| Cost Tracking | Custom `TokenLedger` service writing to `ai_token_usage` table | Per-user, per-agent, per-day token accounting with hard caps |

### 9.1.2 Model Tier Strategy

Every AI call is routed to the cheapest model that can handle the task. No exceptions. No "just use Opus for everything."

| Tier | Model | Cost (per 1M tokens) | Use Cases | Latency Target |
|------|-------|---------------------|-----------|----------------|
| Tier 1 -- Routing | claude-haiku-4-5-20251001 | Input: $0.80, Output: $2.40 | Intent classification, entity extraction, simple Q&A, input validation, conversation routing | < 500ms |
| Tier 2 -- Workhorse | claude-sonnet-4-20250514 | Input: $3.00, Output: $15.00 | Negotiation strategy, BOQ generation, complex product recommendations, counter-offer composition | < 2s |
| Tier 3 -- Expert | claude-opus-4-6 | Input: $15.00, Output: $75.00 | Dispute arbitration, complex multi-constraint optimization, edge-case reasoning that Sonnet fails on (auto-escalated only) | < 8s |

**Auto-escalation rule:** If Tier 1 returns confidence < 0.7 on classification, retry with Tier 2. If Tier 2 tool-call fails twice, escalate to Tier 3. Never start at Tier 3.

### 9.1.3 Token Budget System

```typescript
// packages/api/src/services/token-ledger.service.ts

interface TokenBudget {
  userId: string;
  dailyInputLimit: number;   // tokens
  dailyOutputLimit: number;  // tokens
  monthlyInputLimit: number;
  monthlyOutputLimit: number;
  currentDailyInput: number;
  currentDailyOutput: number;
  currentMonthlyInput: number;
  currentMonthlyOutput: number;
  resetAtUtc: string;        // daily reset time (midnight IST = 18:30 UTC)
}

// Budget tiers
const TOKEN_BUDGETS = {
  free_user:    { dailyInput: 50_000,  dailyOutput: 20_000,  monthlyInput: 500_000,   monthlyOutput: 200_000  },
  starter_dealer: { dailyInput: 100_000, dailyOutput: 40_000,  monthlyInput: 1_000_000, monthlyOutput: 400_000  },
  growth_dealer:  { dailyInput: 200_000, dailyOutput: 80_000,  monthlyInput: 3_000_000, monthlyOutput: 1_200_000 },
  premium_dealer: { dailyInput: 500_000, dailyOutput: 200_000, monthlyInput: 8_000_000, monthlyOutput: 3_200_000 },
  enterprise:     { dailyInput: -1,      dailyOutput: -1,      monthlyInput: -1,        monthlyOutput: -1       }, // unlimited
  admin:          { dailyInput: -1,      dailyOutput: -1,      monthlyInput: -1,        monthlyOutput: -1       },
} as const;
```

**Enforcement:** Every agent call passes through `TokenLedger.checkAndDebit(userId, estimatedTokens)` BEFORE the LLM request fires. If the budget is exhausted, the agent returns a structured `BUDGET_EXHAUSTED` response with a human-readable message: "You've used your AI allowance for today. It resets at midnight IST, or upgrade your plan for higher limits."

**Tracking table:**

```sql
CREATE TABLE ai_token_usage (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  agent_type    TEXT NOT NULL,          -- 'negotiation', 'copilot', 'chat', 'boq', 'price_predict'
  model         TEXT NOT NULL,          -- 'claude-haiku-4-5-20251001', 'claude-sonnet-4-20250514', 'claude-opus-4-6'
  input_tokens  INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  cache_hit     BOOLEAN DEFAULT FALSE,
  latency_ms    INTEGER NOT NULL,
  cost_usd      NUMERIC(10,6) NOT NULL, -- calculated server-side from token counts
  session_id    UUID,                   -- links to agent_sessions.id
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_token_usage_user_day ON ai_token_usage (user_id, created_at);
CREATE INDEX idx_token_usage_agent    ON ai_token_usage (agent_type, created_at);
CREATE INDEX idx_token_usage_model    ON ai_token_usage (model, created_at);
```

### 9.1.4 Response Caching Layer

Identical or near-identical queries must not trigger fresh LLM calls.

**Cache strategy:**

| Cache Level | Implementation | TTL | Hit Rate Target |
|-------------|---------------|-----|-----------------|
| Exact Match | Redis hash of `(agent_type + model + prompt_hash)` | 4 hours | 15-25% for FAQ-type queries |
| Semantic Match | pgvector similarity search on cached prompt embeddings (cosine > 0.95) | 24 hours | 5-10% for product queries |
| Static Knowledge | Pre-computed responses for top-100 queries per category | 7 days | 30%+ for common product questions |

```typescript
// packages/api/src/services/ai-cache.service.ts

interface CacheEntry {
  promptHash: string;        // SHA-256 of normalized prompt
  embedding: number[];       // 1536-dim from text-embedding-3-small
  response: string;
  model: string;
  agentType: string;
  hitCount: number;
  createdAt: Date;
  expiresAt: Date;
}

async function getCachedOrCompute(
  prompt: string,
  agentType: string,
  model: string,
  computeFn: () => Promise<LLMResponse>
): Promise<LLMResponse> {
  // 1. Check exact hash match in Redis (< 1ms)
  const hash = sha256(normalize(prompt));
  const exactHit = await redis.hget(`ai:cache:${agentType}`, hash);
  if (exactHit) {
    await trackCacheHit(agentType, 'exact');
    return JSON.parse(exactHit);
  }

  // 2. Check semantic similarity in pgvector (< 50ms)
  const embedding = await getEmbedding(prompt);
  const semanticHit = await db.query(`
    SELECT response FROM ai_cache
    WHERE agent_type = $1
      AND (embedding <=> $2::vector) < 0.05
      AND expires_at > now()
    ORDER BY (embedding <=> $2::vector)
    LIMIT 1
  `, [agentType, embedding]);
  if (semanticHit.rows.length > 0) {
    await trackCacheHit(agentType, 'semantic');
    return JSON.parse(semanticHit.rows[0].response);
  }

  // 3. Compute fresh
  const response = await computeFn();
  
  // 4. Store in both caches
  await redis.hset(`ai:cache:${agentType}`, hash, JSON.stringify(response));
  await redis.expire(`ai:cache:${agentType}`, 14400); // 4h
  await db.query(`
    INSERT INTO ai_cache (prompt_hash, embedding, response, agent_type, model, expires_at)
    VALUES ($1, $2, $3, $4, $5, now() + interval '24 hours')
  `, [hash, embedding, JSON.stringify(response), agentType, model]);

  return response;
}
```

### 9.1.5 Circuit Breaker

Every external AI call is wrapped in a circuit breaker to prevent cascading failures.

```typescript
// packages/api/src/services/circuit-breaker.service.ts

interface CircuitBreakerConfig {
  failureThreshold: number;    // consecutive failures before OPEN
  successThreshold: number;    // successes in HALF_OPEN before CLOSED
  timeout: number;             // ms before OPEN -> HALF_OPEN
  monitorInterval: number;     // ms between health checks
}

const AI_CIRCUIT_BREAKER: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30_000,       // 30s
  monitorInterval: 5_000, // 5s
};

// States: CLOSED (normal) -> OPEN (all calls rejected) -> HALF_OPEN (test calls)
// When OPEN: return cached response if available, else structured error:
// { status: 'ai_unavailable', message: 'Our AI assistant is temporarily busy. Your request has been queued.', retryAfterMs: 30000 }
```

**Fallback chain when circuit is OPEN:**
1. Return cached response if semantic match exists (any TTL)
2. Queue the request in BullMQ for processing when circuit closes
3. Return a structured fallback response directing user to browse catalog manually or contact support
4. Notify #alerts Slack channel

### 9.1.6 Agent Session Persistence

```sql
CREATE TABLE agent_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  agent_type      TEXT NOT NULL CHECK (agent_type IN (
    'procurement_copilot', 'negotiation', 'chat', 'boq_generator', 'price_predictor', 'conversation_intel'
  )),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed', 'timeout')),
  context         JSONB NOT NULL DEFAULT '{}',  -- agent-specific state (current step, accumulated data, etc.)
  metadata        JSONB DEFAULT '{}',           -- request source, device, etc.
  total_input_tokens  INTEGER DEFAULT 0,
  total_output_tokens INTEGER DEFAULT 0,
  total_cost_usd      NUMERIC(10,6) DEFAULT 0,
  message_count       INTEGER DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_sessions_user    ON agent_sessions (user_id, status);
CREATE INDEX idx_agent_sessions_type    ON agent_sessions (agent_type, status);
CREATE INDEX idx_agent_sessions_active  ON agent_sessions (status) WHERE status = 'active';

CREATE TABLE agent_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool_call', 'tool_result')),
  content       TEXT NOT NULL,
  tool_name     TEXT,                -- populated when role = 'tool_call' or 'tool_result'
  tool_input    JSONB,               -- tool call arguments
  tool_output   JSONB,               -- tool execution result
  model         TEXT,                -- which model generated this message
  input_tokens  INTEGER,
  output_tokens INTEGER,
  latency_ms    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_messages_session ON agent_messages (session_id, created_at);
```

---

## 9.2 Auto-Negotiation Agent

The flagship agentic feature. A multi-agent system that negotiates on behalf of buyers with dealers to reach optimal pricing. This is not a chatbot -- it is a strategic negotiation engine with defined economic reasoning.

### 9.2.1 Multi-Agent Architecture

```
                           +---------------------+
                           |  Orchestrator Agent  |
                           |  (claude-sonnet-4-20250514)  |
                           +----------+----------+
                                      |
                    +-----------------+-----------------+
                    |                 |                 |
            +-------+------+  +------+-------+  +------+-------+
            |   Material   |  |   Pricing    |  |  Logistics   |
            |   Planner    |  |   Engine     |  |   Agent      |
            | (haiku)      |  | (haiku+XGB)  |  | (haiku)      |
            +--------------+  +--------------+  +--------------+
                    |                 |                 |
                    +-----------------+-----------------+
                                      |
                           +----------+----------+
                           | Negotiation Agent   |
                           | (claude-sonnet-4-20250514)     |
                           +---------------------+
```

#### Orchestrator Agent

**Role:** Controls the negotiation flow, manages state transitions, enforces business rules, and decides when to invoke sub-agents.

**Model:** claude-sonnet-4-20250514

**System Prompt:**

```
You are the Hub4Estate Negotiation Orchestrator. You manage automated price negotiations 
between buyers and dealers on a construction materials marketplace.

YOUR RULES:
1. You NEVER reveal the buyer's maximum budget to the dealer.
2. You NEVER reveal the dealer's cost basis to the buyer.
3. You operate within the blind matching principle: neither party learns the other's 
   identity until a deal is confirmed.
4. Maximum 4 negotiation rounds. If no agreement after round 4, escalate to human.
5. Every counter-offer must be economically justified -- you never offer a price without 
   a rationale derived from market data.
6. You must request human approval for any deal exceeding INR 1,00,000.
7. If the spread between buyer's last offer and dealer's last ask is < 5%, recommend 
   splitting the difference and closing.

YOUR TOOLS:
- getInquiryDetails: Fetch full inquiry with product specs, quantity, delivery requirements
- getDealerQuotes: Get all submitted quotes for an inquiry
- getMarketPrice: Get current market price range for a product (min, median, max, MRP)
- getHistoricalDeals: Get past completed deals for similar products in the same city
- getDealerHistory: Get a dealer's past performance metrics (win rate, avg discount, reliability)
- sendCounterOffer: Send a counter-offer to buyer or dealer with justification
- requestHumanApproval: Pause negotiation and notify admin for manual review
- markAgreementReached: Record final agreed price and terms
- abortNegotiation: End negotiation with reason code

YOUR STATE:
You receive the current negotiation state as a JSON object with all rounds, offers, and 
counter-offers. You decide the next action based on this state.
```

**Tools (LangChain StructuredTool definitions):**

```typescript
// packages/api/src/agents/negotiation/tools/

// Tool 1: getInquiryDetails
const getInquiryDetailsTool = new DynamicStructuredTool({
  name: 'getInquiryDetails',
  description: 'Fetch complete inquiry details including product specifications, quantity, delivery location, and buyer preferences',
  schema: z.object({
    inquiryId: z.string().uuid(),
  }),
  func: async ({ inquiryId }) => {
    const inquiry = await prisma.inquiry.findUnique({
      where: { id: inquiryId },
      include: {
        items: { include: { product: true, brand: true } },
        deliveryAddress: true,
      },
    });
    // Strip buyer PII before returning to agent
    return JSON.stringify({
      id: inquiry.id,
      items: inquiry.items.map(i => ({
        productName: i.product.name,
        brand: i.brand?.name,
        specification: i.specification,
        quantity: i.quantity,
        unit: i.unit,
      })),
      deliveryCity: inquiry.deliveryAddress?.city,
      deliveryState: inquiry.deliveryAddress?.state,
      urgency: inquiry.urgency,
      budgetRange: inquiry.budgetRange, // { min, max } -- only min shared with dealer
      createdAt: inquiry.createdAt,
    });
  },
});

// Tool 2: getMarketPrice
const getMarketPriceTool = new DynamicStructuredTool({
  name: 'getMarketPrice',
  description: 'Get current market price range for a product in a given city. Returns min, median, max, and MRP based on recent transactions and dealer quotes.',
  schema: z.object({
    productId: z.string().uuid(),
    city: z.string(),
    quantity: z.number().positive(),
  }),
  func: async ({ productId, city, quantity }) => {
    // Query last 90 days of completed deals + active quotes
    const priceData = await pricingService.getMarketRange(productId, city, quantity);
    return JSON.stringify({
      mrp: priceData.mrp,
      marketMin: priceData.min,
      marketMedian: priceData.median,
      marketMax: priceData.max,
      sampleSize: priceData.sampleSize,
      lastUpdated: priceData.lastUpdated,
      trend: priceData.trend, // 'rising', 'stable', 'falling'
      confidenceScore: priceData.confidence, // 0-1 based on sample size + recency
    });
  },
});

// Tool 3: sendCounterOffer
const sendCounterOfferTool = new DynamicStructuredTool({
  name: 'sendCounterOffer',
  description: 'Send a counter-offer to either the buyer or the dealer. Includes the proposed price and a human-readable justification.',
  schema: z.object({
    negotiationId: z.string().uuid(),
    targetParty: z.enum(['buyer', 'dealer']),
    proposedPrice: z.number().positive(),
    proposedDeliveryDays: z.number().int().positive().optional(),
    justification: z.string().max(500),
    strategy: z.enum(['aggressive', 'balanced', 'relationship_preserving']),
  }),
  func: async ({ negotiationId, targetParty, proposedPrice, proposedDeliveryDays, justification, strategy }) => {
    const round = await negotiationService.createCounterOffer({
      negotiationId,
      targetParty,
      proposedPrice,
      proposedDeliveryDays,
      justification,
      strategy,
      generatedBy: 'agent',
    });
    // Send notification to target party
    await notificationService.sendNegotiationUpdate(round);
    return JSON.stringify({ success: true, roundNumber: round.roundNumber });
  },
});

// Tool 4: requestHumanApproval
const requestHumanApprovalTool = new DynamicStructuredTool({
  name: 'requestHumanApproval',
  description: 'Pause the negotiation and request manual review from a Hub4Estate operations team member. Use when deal exceeds INR 1,00,000, involves unusual products, or when the agent is uncertain.',
  schema: z.object({
    negotiationId: z.string().uuid(),
    reason: z.string().max(500),
    recommendedAction: z.enum(['approve_current', 'counter_lower', 'counter_higher', 'abort']),
    urgency: z.enum(['low', 'medium', 'high']),
  }),
  func: async ({ negotiationId, reason, recommendedAction, urgency }) => {
    await negotiationService.pauseForApproval(negotiationId, {
      reason,
      recommendedAction,
      urgency,
    });
    // Notify admin via in-app + WhatsApp
    await notificationService.sendAdminAlert({
      type: 'negotiation_approval_needed',
      negotiationId,
      reason,
      urgency,
    });
    return JSON.stringify({ success: true, status: 'paused_for_approval' });
  },
});

// Tool 5: getDealerHistory
const getDealerHistoryTool = new DynamicStructuredTool({
  name: 'getDealerHistory',
  description: 'Get a dealer performance profile: win rate, average discount from MRP, delivery reliability, response time, and dispute rate.',
  schema: z.object({
    dealerId: z.string().uuid(),
    productCategory: z.string().optional(),
  }),
  func: async ({ dealerId, productCategory }) => {
    const history = await dealerService.getPerformanceMetrics(dealerId, productCategory);
    return JSON.stringify({
      totalQuotesSubmitted: history.totalQuotes,
      winRate: history.winRate,                   // 0-1
      avgDiscountFromMrp: history.avgDiscount,    // percentage
      avgDeliveryDays: history.avgDeliveryDays,
      onTimeDeliveryRate: history.onTimeRate,      // 0-1
      disputeRate: history.disputeRate,            // 0-1
      avgResponseTimeMinutes: history.avgResponseTime,
      repeatBuyerRate: history.repeatRate,          // 0-1
      lastActiveAt: history.lastActiveAt,
    });
  },
});

// Tool 6: getHistoricalDeals
const getHistoricalDealsTool = new DynamicStructuredTool({
  name: 'getHistoricalDeals',
  description: 'Get completed deals for similar products in the same city from the last 90 days. Used to establish fair market value.',
  schema: z.object({
    productId: z.string().uuid(),
    city: z.string(),
    quantity: z.number().positive(),
    lookbackDays: z.number().int().default(90),
  }),
  func: async ({ productId, city, quantity, lookbackDays }) => {
    const deals = await dealService.getHistoricalDeals(productId, city, quantity, lookbackDays);
    return JSON.stringify({
      deals: deals.map(d => ({
        finalPrice: d.finalPrice,
        quantity: d.quantity,
        negotiationRounds: d.rounds,
        savingsPercent: d.savingsPercent,
        completedAt: d.completedAt,
      })),
      summary: {
        count: deals.length,
        avgPrice: deals.reduce((s, d) => s + d.finalPrice, 0) / deals.length,
        minPrice: Math.min(...deals.map(d => d.finalPrice)),
        maxPrice: Math.max(...deals.map(d => d.finalPrice)),
        avgSavings: deals.reduce((s, d) => s + d.savingsPercent, 0) / deals.length,
      },
    });
  },
});

// Tool 7: markAgreementReached
const markAgreementReachedTool = new DynamicStructuredTool({
  name: 'markAgreementReached',
  description: 'Record that both parties have agreed on a price. Transitions the negotiation to AGREEMENT state.',
  schema: z.object({
    negotiationId: z.string().uuid(),
    agreedPrice: z.number().positive(),
    agreedDeliveryDays: z.number().int().positive(),
    terms: z.string().max(1000).optional(),
  }),
  func: async ({ negotiationId, agreedPrice, agreedDeliveryDays, terms }) => {
    const result = await negotiationService.recordAgreement({
      negotiationId,
      agreedPrice,
      agreedDeliveryDays,
      terms,
    });
    // Reveal identities (blind matching ends here)
    await negotiationService.revealIdentities(negotiationId);
    // Notify both parties
    await notificationService.sendAgreementNotification(result);
    return JSON.stringify({ success: true, orderId: result.orderId });
  },
});

// Tool 8: abortNegotiation
const abortNegotiationTool = new DynamicStructuredTool({
  name: 'abortNegotiation',
  description: 'End the negotiation without a deal. Use when: 3 consecutive rejections, detected bad faith, or irreconcilable price gap.',
  schema: z.object({
    negotiationId: z.string().uuid(),
    reason: z.enum([
      'max_rounds_exceeded',
      'buyer_rejected_final',
      'dealer_rejected_final',
      'bad_faith_detected',
      'system_error',
      'timeout',
      'buyer_cancelled',
      'dealer_cancelled',
    ]),
    message: z.string().max(500),
  }),
  func: async ({ negotiationId, reason, message }) => {
    await negotiationService.abort(negotiationId, reason, message);
    // Share anonymized outcome with both parties
    await notificationService.sendNegotiationAborted(negotiationId, reason);
    return JSON.stringify({ success: true });
  },
});
```

#### Material Planner Agent

**Role:** Validates product specifications, checks compatibility, suggests alternatives when requested product is unavailable.

**Model:** claude-haiku-4-5-20251001

**Tools:**
- `searchProducts(query, filters)` -- full-text + filtered product catalog search
- `getProductSpecs(productId)` -- complete technical specifications
- `getAlternatives(productId, criteria)` -- BIS-compatible alternatives sorted by price/rating
- `checkCompatibility(productIds[])` -- verify products work together (e.g., MCB rating matches wire gauge)

**Invocation:** Called by Orchestrator when:
1. Inquiry contains vague product descriptions ("good quality MCB for home")
2. Requested product is out of stock with all dealers
3. Buyer asks for alternatives during negotiation

**System Prompt (excerpt):**

```
You are a construction materials expert specializing in the Indian electrical market.
You know BIS standards (IS 732, IS 3043, IS 8828, IS 694), brand hierarchies 
(Havells > Polycab > Anchor > Finolex for wires in North India), regional preferences, 
and product compatibility rules.

When suggesting alternatives:
1. ALWAYS match the original BIS rating or higher
2. NEVER suggest a lower-tier brand unless the buyer explicitly asks for budget options
3. Include the specification comparison in your response
4. Flag any compatibility concerns
```

#### Pricing Engine Agent

**Role:** Determines fair market value, calculates negotiation parameters, and recommends strategy.

**Model:** claude-haiku-4-5-20251001 for interpretation + XGBoost model for price prediction

**Computation Parameters:**

```typescript
interface NegotiationParameters {
  // BATNA: Best Alternative to Negotiated Agreement
  buyerBatna: number;   // lowest price buyer could get elsewhere (market min)
  dealerBatna: number;  // highest price dealer could sell elsewhere (market max)

  // ZOPA: Zone of Possible Agreement
  zopaMin: number;      // dealer's minimum acceptable price (estimated cost + minimum margin)
  zopaMax: number;      // buyer's maximum willingness to pay (stated budget or market median)
  zopaExists: boolean;  // if zopaMin > zopaMax, no deal is possible

  // Nash Bargaining Solution
  nashPrice: number;    // mathematically optimal fair price: sqrt(buyerBatna * dealerBatna)

  // Recommended opening offer
  openingOffer: number;
  openingJustification: string;

  // Concession strategy
  maxConcessionPerRound: number;  // percentage of remaining gap to concede per round
  targetPrice: number;             // ideal final price for buyer
  walkAwayPrice: number;           // absolute maximum (buyer side)
}
```

**XGBoost Model Features:**

| Feature | Type | Source |
|---------|------|--------|
| `product_category_encoded` | Categorical (one-hot) | Product catalog |
| `brand_tier` | Ordinal (1-5) | Brand master data |
| `quantity` | Continuous | Inquiry |
| `city_tier` | Ordinal (1-3) | City classification |
| `days_since_last_price_change` | Integer | Price history |
| `dealer_inventory_level` | Continuous (0-1) | Dealer data |
| `seasonal_demand_index` | Continuous | Historical volume by month |
| `competitor_quote_count` | Integer | Current inquiry quotes |
| `historical_avg_discount` | Continuous (%) | Past deals |
| `commodity_price_index` | Continuous | Copper/aluminum/PVC spot prices (external API) |

**Training:** Retrained weekly on all completed deals. Minimum training set: 500 deals (until this threshold is reached, fall back to rule-based pricing with market median +/- 10%).

#### Logistics Agent

**Role:** Delivery time estimation, route-based cost calculation, warehouse proximity matching.

**Model:** claude-haiku-4-5-20251001

**Tools:**
- `estimateDelivery(originCity, destCity, weight, volume)` -- returns estimated days and cost
- `getDealerWarehouseDistance(dealerId, deliveryPincode)` -- km + estimated transit time
- `checkDeliveryFeasibility(items[], deliveryDate)` -- can the order be delivered by the requested date?
- `optimizeShipping(items[], dealers[])` -- if buying from multiple dealers, find the cheapest shipping combination

**Invocation:** Called during counter-offer generation to include delivery cost in total price comparison, and when buyer specifies delivery urgency.

#### Negotiation Agent

**Role:** Generates human-readable counter-offer messages. Does NOT make strategic decisions -- the Orchestrator decides what to offer, the Negotiation Agent decides how to say it.

**Model:** claude-sonnet-4-20250514

**Strategy Modes:**

| Mode | Tone | Use When |
|------|------|----------|
| `aggressive` | Direct, data-driven, references market prices explicitly | Buyer has strong BATNA, multiple competing quotes, high quantity leverage |
| `balanced` | Professional, fair, acknowledges both sides | Standard negotiation, moderate competition |
| `relationship_preserving` | Warm, emphasizes long-term partnership, flexible on terms | Repeat dealer, high-value relationship, strategic category |

**System Prompt (excerpt):**

```
You write counter-offer messages for an Indian B2B construction materials marketplace.

RULES:
1. Write in professional but warm English. No corporate jargon. No AI-sounding phrases.
2. Always lead with data: "Based on X recent deals in [city], the market rate for [product] is..."
3. Never sound threatening or ultimatum-like. Always leave room for the other party to respond.
4. For Hindi-speaking markets (Rajasthan, UP, MP, Bihar), include a Hindi summary at the end.
5. Keep messages under 200 words.
6. Include the specific price, quantity, and delivery terms in every message.
7. Sign off as "Hub4Estate Procurement Team" -- never as an AI or bot.
```

**Example output:**

```
Subject: Counter-offer for 500x Havells MCB 32A (Inquiry #H4E-2026-0847)

Hi,

Thank you for your quote of Rs 185/piece (total Rs 92,500).

Based on 12 recent deals for Havells MCBs in Jaipur over the last 60 days, 
the average closing price has been Rs 168/piece for quantities of 400-600 units.

We'd like to propose Rs 172/piece (total Rs 86,000) with delivery by April 20. 
This represents a fair margin above the market average while reflecting the 
bulk quantity of this order.

If delivery can be completed by April 18 instead, we're flexible on moving 
to Rs 175/piece.

Looking forward to your response.

Hub4Estate Procurement Team

---
Saransh (Hindi): Aapka quote Rs 185/piece tha. Jaipur mein recent deals ke 
hisaab se market rate Rs 168/piece hai. Hum Rs 172/piece offer kar rahe hain 
500 units ke liye, April 20 tak delivery ke saath.
```

### 9.2.2 Negotiation State Machine

```
                                     +--------+
                                     |  INIT  |
                                     +---+----+
                                         |
                                         | Buyer selects quote + enables negotiation
                                         v
                                   +-----+------+
                                   |  ANALYZING  |
                                   +-----+------+
                                         |
                                         | Orchestrator computes BATNA/ZOPA/Nash
                                         | Material Planner validates specs
                                         | Pricing Engine sets parameters
                                         | Logistics Agent estimates delivery
                                         v
                              +----------+-----------+
                              | COUNTER_OFFER_BUYER  |
                              +----------+-----------+
                                         |
                                         | Agent generates counter-offer to dealer
                                         | Negotiation Agent formats message
                                         v
                              +----------+-----------+
                              |   WAITING_DEALER     |  <--- 24h timeout
                              +----------+-----------+
                                         |
                        +----------------+----------------+
                        |                |                |
                   Dealer accepts   Dealer counters   Dealer rejects/timeout
                        |                |                |
                        v                v                v
                   +----+----+  +--------+--------+  +---+----+
                   |AGREEMENT|  |COUNTER_OFFER_   |  | ABORT  |
                   +----+----+  |    DEALER       |  +--------+
                        |       +--------+--------+
                        |                |
                        |                | Agent evaluates dealer counter
                        |                v
                        |       +--------+--------+
                        |       |  WAITING_BUYER   |  <--- 24h timeout
                        |       +--------+--------+
                        |                |
                        |    +-----------+-----------+
                        |    |           |           |
                        |  Accepts    Counters    Rejects
                        |    |           |           |
                        |    v           |           v
                        | AGREEMENT     |        ABORT (if round 4)
                        |               |        or back to COUNTER_OFFER_BUYER
                        |               v
                        |    back to COUNTER_OFFER_BUYER
                        |    (max 4 rounds)
                        |
                        v
                  +-----+-------+
                  |HUMAN_APPROVAL| <--- if deal > Rs 1,00,000
                  +-----+-------+
                        |
                  +-----+-----+
                  |           |
              Approved    Rejected
                  |           |
                  v           v
             CONFIRMED     REJECTED
```

**State persistence:**

```sql
CREATE TABLE negotiation_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id          UUID NOT NULL REFERENCES inquiries(id),
  quote_id            UUID NOT NULL REFERENCES quotes(id),
  buyer_id            UUID NOT NULL REFERENCES users(id),
  dealer_id           UUID NOT NULL REFERENCES dealers(id),
  agent_session_id    UUID REFERENCES agent_sessions(id),
  
  status              TEXT NOT NULL DEFAULT 'init' CHECK (status IN (
    'init', 'analyzing', 'counter_offer_buyer', 'waiting_dealer',
    'counter_offer_dealer', 'waiting_buyer', 'agreement',
    'human_approval', 'confirmed', 'rejected', 'aborted', 'timeout'
  )),
  
  -- Pricing parameters (computed during ANALYZING)
  buyer_batna         NUMERIC(12,2),
  dealer_batna        NUMERIC(12,2),
  zopa_min            NUMERIC(12,2),
  zopa_max            NUMERIC(12,2),
  nash_price          NUMERIC(12,2),
  target_price        NUMERIC(12,2),
  walkaway_price      NUMERIC(12,2),
  
  -- Negotiation config
  strategy            TEXT NOT NULL DEFAULT 'balanced' CHECK (strategy IN ('aggressive', 'balanced', 'relationship_preserving')),
  max_rounds          INTEGER NOT NULL DEFAULT 4,
  current_round       INTEGER NOT NULL DEFAULT 0,
  timeout_hours       INTEGER NOT NULL DEFAULT 24,
  
  -- Outcome
  initial_quote_price NUMERIC(12,2) NOT NULL,
  final_agreed_price  NUMERIC(12,2),
  savings_amount      NUMERIC(12,2),
  savings_percent     NUMERIC(5,2),
  agreed_delivery_days INTEGER,
  
  -- Timestamps
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  timeout_at          TIMESTAMPTZ,  -- computed: last_activity_at + timeout_hours
  
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neg_sessions_inquiry ON negotiation_sessions (inquiry_id);
CREATE INDEX idx_neg_sessions_buyer   ON negotiation_sessions (buyer_id, status);
CREATE INDEX idx_neg_sessions_dealer  ON negotiation_sessions (dealer_id, status);
CREATE INDEX idx_neg_sessions_timeout ON negotiation_sessions (timeout_at) WHERE status IN ('waiting_dealer', 'waiting_buyer');

CREATE TABLE negotiation_rounds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id    UUID NOT NULL REFERENCES negotiation_sessions(id) ON DELETE CASCADE,
  round_number      INTEGER NOT NULL,
  
  -- Who made this offer
  offered_by        TEXT NOT NULL CHECK (offered_by IN ('agent_for_buyer', 'dealer', 'agent_for_dealer', 'buyer')),
  
  -- Offer details
  offered_price     NUMERIC(12,2) NOT NULL,
  offered_delivery_days INTEGER,
  justification     TEXT NOT NULL,                 -- human-readable explanation
  strategy_used     TEXT,                          -- aggressive/balanced/relationship_preserving
  
  -- Response
  response          TEXT CHECK (response IN ('accepted', 'countered', 'rejected', 'timeout', 'pending')),
  response_at       TIMESTAMPTZ,
  response_message  TEXT,
  
  -- Agent reasoning (private, never shown to users)
  agent_reasoning   JSONB,  -- { batna_analysis, zopa_check, concession_calc, confidence }
  
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_neg_rounds_session ON negotiation_rounds (negotiation_id, round_number);
```

### 9.2.3 Negotiation Strategy Engine

The 4-round concession strategy is pre-computed during the ANALYZING phase and adjusts dynamically based on dealer responses.

```typescript
// packages/api/src/agents/negotiation/strategy.ts

interface ConcessionPlan {
  rounds: {
    roundNumber: number;
    targetPrice: number;
    maxConcession: number;     // max percentage of remaining gap to concede
    escalationTrigger: string; // condition for escalating to next round
  }[];
}

function computeConcessionPlan(params: NegotiationParameters): ConcessionPlan {
  const gap = params.zopaMax - params.zopaMin;
  
  return {
    rounds: [
      {
        roundNumber: 1,
        targetPrice: params.zopaMin + (gap * 0.15), // start aggressive: 15% into ZOPA from dealer's minimum
        maxConcession: 0.10,                          // concede max 10% of remaining gap
        escalationTrigger: 'dealer_counters_above_median',
      },
      {
        roundNumber: 2,
        targetPrice: params.zopaMin + (gap * 0.30), // move to 30%
        maxConcession: 0.20,                          // concede up to 20%
        escalationTrigger: 'dealer_counters_above_round1',
      },
      {
        roundNumber: 3,
        targetPrice: params.nashPrice,                // converge to Nash solution
        maxConcession: 0.30,
        escalationTrigger: 'spread_less_than_10_percent',
      },
      {
        roundNumber: 4,
        targetPrice: params.nashPrice + (gap * 0.05), // slight concession above Nash
        maxConcession: 0.50,                            // final round: willing to split remaining
        escalationTrigger: 'final_take_it_or_leave_it',
      },
    ],
  };
}
```

### 9.2.4 Safety Rails

| Rail | Implementation | Action on Violation |
|------|---------------|-------------------|
| Dealer margin floor | Never propose a price below `dealer.estimatedCost * 1.05` (5% minimum margin) | Agent refuses to send counter-offer, explains to buyer that price floor reached |
| Buyer budget cap | Never propose a price above `inquiry.budgetRange.max` (if set) | Agent refuses to escalate, recommends alternative products or dealers |
| Human approval gate | Any deal where `agreedPrice > 100000` (INR 1 lakh) | Pause negotiation, notify admin, wait for approval/rejection |
| First-time dealer gate | Dealer has < 3 completed transactions on platform | Human approval required regardless of deal size |
| Unusual product gate | Product category has < 10 historical deals in this city | Human approval required -- insufficient pricing data |
| Bad faith detection | 3 consecutive counter-rejections without any concession from one party | Abort negotiation with `bad_faith_detected` reason |
| Timeout enforcement | No response within `timeout_hours` from either party | Auto-abort with `timeout` reason, notify both parties |
| Anti-collusion | Same dealer submits near-identical quotes across 5+ unrelated inquiries within 24h | Flag for admin review, do NOT auto-negotiate |
| Cost runaway | Single negotiation exceeds 50,000 output tokens | Force-complete with best available offer or abort |

### 9.2.5 Notification Flow

| Event | Buyer Notification | Dealer Notification | Admin Notification |
|-------|-------------------|--------------------|--------------------|
| Negotiation started | In-app + email: "We're negotiating on your behalf" | In-app: "A counter-offer has been received" | -- |
| Counter-offer sent (to dealer) | In-app: "Counter-offer sent, waiting for response" | In-app + WhatsApp: "New counter-offer -- respond within 24h" | -- |
| Counter-offer sent (to buyer) | In-app + email: "Dealer responded -- review the offer" | In-app: "Your counter-offer was sent" | -- |
| Agreement reached | In-app + email + WhatsApp: "Deal confirmed! Savings: Rs X" | In-app + WhatsApp: "Deal confirmed! Order incoming" | Dashboard metric update |
| Human approval needed | In-app: "Deal under review by our team" | -- | In-app + WhatsApp: "Approval needed for deal #X" |
| Negotiation aborted | In-app + email: "Negotiation ended -- here's what happened" | In-app: "Negotiation ended" | If bad_faith: escalation alert |
| Timeout warning (4h before) | In-app: "Awaiting dealer response" | WhatsApp: "Respond in 4 hours or negotiation expires" | -- |

### 9.2.6 API Endpoints

```
POST   /api/v1/negotiations
  Auth: Bearer JWT (role: buyer)
  Body: { inquiryId: UUID, quoteId: UUID, strategy?: 'aggressive'|'balanced'|'relationship_preserving' }
  Response 201: { negotiationId: UUID, status: 'analyzing', estimatedCompletionMinutes: 5 }
  Rate: 5/hour per user

GET    /api/v1/negotiations/:id
  Auth: Bearer JWT (role: buyer | dealer -- sees own side only)
  Response 200: { id, status, currentRound, rounds[], agreedPrice?, savings? }

POST   /api/v1/negotiations/:id/respond
  Auth: Bearer JWT (role: dealer)
  Body: { response: 'accept'|'counter'|'reject', counterPrice?: number, message?: string }
  Response 200: { status: 'updated', nextStep: string }
  Rate: 10/hour per dealer

POST   /api/v1/negotiations/:id/buyer-respond
  Auth: Bearer JWT (role: buyer)
  Body: { response: 'accept'|'counter'|'reject', counterPrice?: number, message?: string }
  Response 200: { status: 'updated', nextStep: string }

POST   /api/v1/negotiations/:id/approve
  Auth: Bearer JWT (role: admin)
  Body: { decision: 'approve'|'reject', notes?: string }
  Response 200: { status: 'confirmed'|'rejected' }

GET    /api/v1/negotiations/active
  Auth: Bearer JWT
  Query: ?role=buyer|dealer&page=1&limit=20
  Response 200: { negotiations: [...], total: number, page: number }

GET    /api/v1/negotiations/analytics
  Auth: Bearer JWT (role: admin)
  Query: ?from=ISO_DATE&to=ISO_DATE
  Response 200: { totalNegotiations, avgSavingsPercent, avgRounds, successRate, totalSavingsInr }
```

---

## 9.3 Procurement Copilot

An end-to-end AI workflow that takes a natural language project description and produces a fully quoted, negotiated procurement package.

### 9.3.1 Pipeline Architecture

```
User Input                  Agent Step              Output
----------                  ----------              ------
"I'm wiring a               Requirements            Structured project:
3BHK flat in                 Gathering Agent         { type: '3BHK', city: 'Bangalore',
Bangalore, budget            (Sonnet)                rooms: [...], budget: 500000 }
around 5 lakh"                    |
                                  v
                             BOQ Generator           Bill of Quantities:
                             (Sonnet + BIS           [ { product: 'FRLS 2.5mm wire',
                              standards DB)            qty: 800m, spec: 'IS 694' }, ... ]
                                  |
                                  v
                             User Review +           User edits/approves BOQ
                             Edit Loop               (interactive, not automated)
                                  |
                                  v
                             Bulk Inquiry            Creates N inquiries
                             Creator                 (one per BOQ line item)
                             (programmatic)          Matches to eligible dealers
                                  |
                                  v
                             Quote                   Waits for dealer quotes
                             Collection              (48h window)
                             (async, event-driven)   Sends reminders at 24h
                                  |
                                  v
                             Comparison              Comparison matrix:
                             Engine                  Product x Dealer x Price x Delivery
                             (programmatic +         Best package recommendation
                              Haiku for summary)
                                  |
                                  v
                             User Approval           User selects preferred quotes
                                  |                  or accepts AI recommendation
                                  v
                             Auto-Negotiation        Negotiation Agent activates
                             (see 9.2)               per selected quote
                                  |
                                  v
                             Package                 Consolidated order:
                             Optimizer               Total cost, total savings,
                             (Haiku)                 delivery schedule, payment plan
                                  |
                                  v
                             Order + Track           Order created, delivery tracked
```

### 9.3.2 Requirements Gathering Agent

**Model:** claude-sonnet-4-20250514

**System Prompt:**

```
You are a construction procurement specialist for Hub4Estate. A user is describing 
a project and you need to extract structured requirements for generating a Bill of 
Quantities (BOQ).

GATHER:
1. Project type (residential/commercial, new build/renovation, specific room types)
2. Location (city + pincode if possible -- affects product availability and shipping)
3. Scale (number of rooms, square footage, number of points per room)
4. Budget (total or per-room -- ask if not provided)
5. Brand preferences (or "no preference" / "best value")
6. Quality tier (economy/standard/premium -- map to brand tiers)
7. Timeline (when do they need materials delivered?)
8. Special requirements (smart home, solar prep, industrial grade, etc.)

RULES:
1. Ask a MAXIMUM of 4 clarifying questions. If the user provides vague answers, 
   use reasonable defaults for Indian residential construction.
2. Default assumptions (always state them explicitly so user can correct):
   - 3BHK = 3 bedrooms + 1 drawing room + 1 kitchen + 2 bathrooms + balcony
   - Standard quality tier unless stated otherwise
   - Havells/Polycab brand range for standard tier
   - 6 electrical points per bedroom, 8 per drawing room, 6 per kitchen, 
     3 per bathroom, 2 per balcony
   - 2 fan points per bedroom, 1 per drawing room
3. ALWAYS confirm your understanding before generating the BOQ.
4. Respond in the user's language. If they write in Hindi, respond in Hindi.
```

**Conversation Example:**

```
User: "mere ghar ka wiring karna hai, 3bhk flat hai koramangala mein"

Agent: "Namaste! Aapke 3BHK flat ke liye electrical materials ki planning karte hain.

Main yeh samajh raha hoon:
- 3BHK flat, Koramangala, Bangalore
- Standard quality (Havells/Polycab range)
- 3 bedrooms + drawing room + kitchen + 2 bathrooms + balcony

Kuch sawal:
1. Budget kitna hai approximately? (ya fir best value chahiye?)
2. Smart switches chahiye ya normal modular?
3. Kab tak chahiye materials?"

User: "5 lakh ke andar, normal hi, next month"

Agent: "Perfect. Main BOQ generate kar raha hoon:
- Budget: Rs 5,00,000
- Quality: Standard (Havells/Polycab/Anchor)
- Delivery: By [date - 30 days from now]
- Rooms: 3 BR + 1 DR + 1 Kitchen + 2 Bath + Balcony
- Total estimated points: 41

Ek minute, BOQ aa raha hai..."
```

### 9.3.3 BOQ Generation Engine

**Model:** claude-sonnet-4-20250514

**Knowledge Base (fed as system context):**

| Standard | Coverage | Source |
|----------|----------|--------|
| IS 732:2019 | Wiring installations | Bureau of Indian Standards |
| IS 3043:2018 | Earthing code of practice | BIS |
| IS 694:2010 | PVC insulated cables | BIS |
| IS 8828:1996 | MCB specification | BIS |
| IS 3854:1988 | Switches for domestic use | BIS |
| National Electrical Code 2011 | Overall electrical safety | BIS/SP 30 |
| National Building Code 2016 | Building requirements | BIS |

**BOQ Output Schema:**

```typescript
interface BOQOutput {
  projectSummary: {
    type: string;
    location: string;
    totalRooms: number;
    totalElectricalPoints: number;
    estimatedBudget: number;
    qualityTier: 'economy' | 'standard' | 'premium';
  };
  rooms: {
    name: string;            // "Master Bedroom", "Kitchen", etc.
    area_sqft: number;
    electricalPoints: number;
    fanPoints: number;
    lightPoints: number;
    acPoints: number;
    items: BOQLineItem[];
  }[];
  commonItems: BOQLineItem[];  // main panel, earthing, distribution board
  totalItems: number;
  estimatedCost: {
    min: number;
    max: number;
    recommended: number;
  };
  notes: string[];             // important warnings, code compliance notes
  confidence: number;          // 0-1, lower if unusual project type
}

interface BOQLineItem {
  id: string;                  // temporary ID for user editing
  category: string;            // 'wires', 'switches', 'mcb', 'lighting', etc.
  productType: string;         // 'FRLS 2.5mm² single core'
  specification: string;       // 'IS 694, flame retardant, copper conductor'
  suggestedBrand: string;      // 'Havells Lifeline'
  quantity: number;
  unit: string;                // 'meters', 'pieces', 'sets'
  estimatedUnitPrice: {
    min: number;
    max: number;
  };
  estimatedTotalPrice: {
    min: number;
    max: number;
  };
  bisStandard: string;         // 'IS 694:2010'
  isRequired: boolean;         // true = safety-critical, cannot be removed
  alternatives: {
    brand: string;
    model: string;
    priceRange: { min: number; max: number };
  }[];
}
```

**Validation Rules (hard-coded, not AI-dependent):**

```typescript
// packages/api/src/agents/copilot/boq-validator.ts

const BOQ_VALIDATION_RULES = {
  // Wire gauge rules
  'lighting_circuit': { minGauge: 1.5, maxGauge: 1.5, unit: 'mm²' },
  'power_socket_circuit': { minGauge: 2.5, maxGauge: 2.5, unit: 'mm²' },
  'ac_circuit': { minGauge: 4.0, maxGauge: 4.0, unit: 'mm²' },
  'geyser_circuit': { minGauge: 4.0, maxGauge: 6.0, unit: 'mm²' },
  'main_supply': { minGauge: 6.0, maxGauge: 10.0, unit: 'mm²' },
  
  // MCB rating rules
  'lighting_mcb': { minRating: 6, maxRating: 10, unit: 'A' },
  'socket_mcb': { minRating: 16, maxRating: 20, unit: 'A' },
  'ac_mcb': { minRating: 20, maxRating: 32, unit: 'A' },
  'geyser_mcb': { minRating: 20, maxRating: 25, unit: 'A' },
  'main_mcb': { minRating: 32, maxRating: 63, unit: 'A' },
  
  // Earthing
  'earthing_required': true,    // every project MUST include earthing
  'rccb_required': true,         // every project MUST include RCCB
  'elcb_for_bathroom': true,     // bathrooms MUST have ELCB
  
  // Wire length estimation
  'wire_multiplier': 1.15,       // add 15% for routing, bends, wastage
  'conduit_multiplier': 1.10,    // add 10% for conduit lengths
  
  // Point-to-wire conversion (meters of wire per point, average)
  'meters_per_point': {
    'bedroom': 12,
    'drawing_room': 14,
    'kitchen': 10,
    'bathroom': 8,
    'balcony': 6,
  },
} as const;
```

### 9.3.4 Comparison Engine

After quotes are collected for all BOQ line items, the comparison engine produces a unified view.

```typescript
interface ComparisonMatrix {
  lineItems: {
    boqItemId: string;
    productType: string;
    quantity: number;
    quotes: {
      dealerId: string;       // anonymized until selection
      dealerAlias: string;    // "Dealer A", "Dealer B", etc.
      unitPrice: number;
      totalPrice: number;
      deliveryDays: number;
      dealerMetrics: {
        conversionRate: number;
        avgResponseTime: string;
        completedDeals: number;
      };
      score: number;          // weighted composite: price(40%) + delivery(25%) + rating(20%) + history(15%)
    }[];
    bestQuote: {
      dealerAlias: string;
      totalPrice: number;
      savingsVsAvg: number;
    };
  }[];
  packages: {
    name: string;             // "Lowest Cost", "Fastest Delivery", "Best Rated", "AI Recommended"
    totalCost: number;
    avgDeliveryDays: number;
    avgDealerScore: number;
    selections: { boqItemId: string; dealerAlias: string; price: number }[];
    savingsVsBuyingAll: number;
  }[];
  aiRecommendation: {
    packageName: string;
    reasoning: string;
    confidenceScore: number;
  };
}
```

### 9.3.5 API Endpoints

```
POST   /api/v1/copilot/sessions
  Auth: Bearer JWT (role: buyer)
  Body: { projectDescription: string, language?: 'en'|'hi' }
  Response 201: { sessionId: UUID, status: 'gathering_requirements' }
  Rate: 3/hour per user

POST   /api/v1/copilot/sessions/:id/message
  Auth: Bearer JWT (role: buyer, session owner)
  Body: { content: string }
  Response 200: { agentResponse: string, stage: string, boq?: BOQOutput }
  Streaming: SSE via Accept: text/event-stream

PUT    /api/v1/copilot/sessions/:id/boq
  Auth: Bearer JWT (role: buyer, session owner)
  Body: { lineItems: BOQLineItem[] }  // user-edited BOQ
  Response 200: { boq: BOQOutput, validation: { errors: [], warnings: [] } }

POST   /api/v1/copilot/sessions/:id/generate-inquiries
  Auth: Bearer JWT (role: buyer, session owner)
  Body: { boqId: UUID, deliveryAddress: Address }
  Response 201: { inquiryIds: UUID[], status: 'quotes_collecting' }

GET    /api/v1/copilot/sessions/:id/comparison
  Auth: Bearer JWT (role: buyer, session owner)
  Response 200: ComparisonMatrix
  Note: Returns partial results while quotes are still coming in

POST   /api/v1/copilot/sessions/:id/select-package
  Auth: Bearer JWT (role: buyer, session owner)
  Body: { packageName: string } OR { selections: { boqItemId: string, quoteId: string }[] }
  Response 200: { negotiationIds: UUID[], status: 'negotiating' }

GET    /api/v1/copilot/sessions/:id/summary
  Auth: Bearer JWT (role: buyer, session owner)
  Response 200: { totalCost, totalSavings, orders: [...], deliverySchedule: [...] }
```

---

## 9.4 Conversation Intelligence Agent

A passive agent that analyzes every buyer-dealer conversation and AI chat session in real time, extracting structured insights.

### 9.4.1 Architecture

**Model:** claude-haiku-4-5-20251001 (cheapest tier -- runs on every message)

**Trigger:** Every new message in a conversation or AI chat session fires a BullMQ job `conversation.analyze`.

**Extraction Schema:**

```typescript
interface ConversationIntelligence {
  messageId: string;
  sessionId: string;
  
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;       // -1.0 to 1.0
  
  intent: 
    | 'product_inquiry'         // asking about a specific product
    | 'price_inquiry'           // asking about pricing
    | 'availability_check'      // checking if product is in stock
    | 'delivery_inquiry'        // asking about delivery timeline/cost
    | 'complaint'               // negative feedback about product/service/delivery
    | 'feedback'                // neutral/positive feedback
    | 'negotiation'             // trying to get a better price
    | 'support_request'         // needs help with platform features
    | 'general_chat'            // casual conversation
    | 'escalation_request';     // explicitly asking for human support
  
  topics: string[];             // extracted: ['havells mcb', '32a', 'delivery to jaipur']
  
  buyerReadiness: number;       // 0-100 score: how close to purchase
  // 0-20: browsing, 20-40: researching, 40-60: comparing, 60-80: ready to buy, 80-100: urgent need
  
  entities: {
    products: { name: string; brand?: string; model?: string }[];
    quantities: { value: number; unit: string }[];
    prices: { value: number; context: string }[];     // "quoted at 185 per piece"
    locations: string[];
    dates: string[];
  };
  
  escalationNeeded: boolean;
  escalationReason?: string;
}
```

### 9.4.2 Escalation Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| Explicit request | User says "talk to human", "speak to someone", "connect me to support" | Create support ticket, notify ops team |
| Repeated negative sentiment | 3+ consecutive messages with `sentiment: 'negative'` | Flag conversation, notify ops team |
| Failed tool calls | AI agent fails 3+ consecutive tool calls in a session | Graceful handoff message + support ticket |
| High-value stall | `buyerReadiness > 70` but no action taken in 24h | Notify sales team for manual follow-up |
| Complaint pattern | `intent: 'complaint'` + specific dealer/product mentioned | Log to dealer review pipeline, notify admin |

### 9.4.3 Data Outputs

| Consumer | Data Used | Purpose |
|----------|-----------|---------|
| Admin Dashboard | Aggregated sentiment, topic clouds, escalation rates | Monitor platform health |
| Dealer Scoring | Per-dealer sentiment trends, complaint frequency | Factor into dealer tier calculation |
| Product Feedback | Product-specific sentiment, common complaints/praises | Inform catalog curation |
| Sales Pipeline | High-readiness buyers not converting | Manual outreach targets |
| AI Training | Anonymized conversation patterns | Improve agent responses |

### 9.4.4 Privacy

- All conversation intelligence data is stored with `user_id` reference but conversation content is NOT stored in the intelligence table -- only the extracted structured data.
- Raw conversation content lives in `agent_messages` and `messages` tables with standard access controls.
- Intelligence data is aggregated at the city/category/brand level for reports -- never exposed as individual user behavior.

---

## 9.5 AI Chat Assistant (Volt)

The user-facing conversational interface. Available on every authenticated page as a floating widget.

### 9.5.1 System Prompt

```
You are Volt, Hub4Estate's procurement assistant. You help people find the best prices 
on construction materials -- starting with electrical products.

IDENTITY:
- You are Volt, not ChatGPT, not Claude, not an AI. You work for Hub4Estate.
- You speak like a knowledgeable friend who happens to be an expert in electrical supplies.
- You use simple language. If the user writes in Hindi, you respond in Hindi.
- You NEVER say "as an AI" or "I'm an AI language model." You say "I'm Volt."
- Keep responses SHORT. Under 150 words unless generating a BOQ or detailed comparison.

CAPABILITIES (via tool calling):
1. Product search and recommendations
2. Price lookup and comparison
3. Dealer availability check
4. BOQ generation for projects
5. Inquiry creation on behalf of the user
6. Order tracking
7. General electrical knowledge (wire gauge, MCB ratings, etc.)

LIMITATIONS:
- You CANNOT process payments
- You CANNOT override dealer pricing
- You CANNOT reveal dealer identities before quote selection
- You CANNOT guarantee specific prices (you show ranges and current quotes)
- You CANNOT provide advice on electrical installation (liability) -- always say "consult a licensed electrician"

SAFETY:
- If asked about non-electrical/non-construction topics, politely redirect
- If asked to compare Hub4Estate with competitors, be factual and brief -- never trash-talk
- If you don't know something, say so and offer to connect with support
- NEVER fabricate pricing data. If market data is unavailable, say "I don't have enough 
  pricing data for this product in your area yet."
```

### 9.5.2 Tool Definitions

```typescript
const voltTools = [
  {
    name: 'searchProducts',
    description: 'Search the product catalog by name, brand, category, or specification',
    schema: z.object({
      query: z.string(),
      category: z.string().optional(),
      brand: z.string().optional(),
      priceRange: z.object({ min: z.number(), max: z.number() }).optional(),
      limit: z.number().default(5),
    }),
  },
  {
    name: 'getProductPrice',
    description: 'Get current price range for a specific product in a city',
    schema: z.object({
      productId: z.string().uuid(),
      city: z.string(),
      quantity: z.number().default(1),
    }),
  },
  {
    name: 'checkDealerAvailability',
    description: 'Check how many verified dealers can supply a product in a given city',
    schema: z.object({
      productId: z.string().uuid(),
      city: z.string(),
    }),
  },
  {
    name: 'createInquiry',
    description: 'Create a new procurement inquiry on behalf of the user. Requires user confirmation before executing.',
    schema: z.object({
      items: z.array(z.object({
        productId: z.string().uuid().optional(),
        productDescription: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        brandPreference: z.string().optional(),
      })),
      deliveryCity: z.string(),
      urgency: z.enum(['low', 'medium', 'high']),
      notes: z.string().optional(),
    }),
    requiresConfirmation: true,  // agent must ask user "should I create this inquiry?" before executing
  },
  {
    name: 'trackInquiry',
    description: 'Get the status of an existing inquiry by ID',
    schema: z.object({
      inquiryId: z.string(),
    }),
  },
  {
    name: 'generateBOQ',
    description: 'Generate a Bill of Quantities for a described project',
    schema: z.object({
      projectType: z.string(),
      rooms: z.array(z.object({ name: z.string(), area_sqft: z.number().optional() })),
      qualityTier: z.enum(['economy', 'standard', 'premium']),
      location: z.string(),
    }),
  },
  {
    name: 'getElectricalAdvice',
    description: 'Answer general electrical product questions (wire gauge, MCB ratings, standards)',
    schema: z.object({
      question: z.string(),
    }),
  },
];
```

### 9.5.3 Streaming Architecture

```typescript
// packages/api/src/routes/ai.routes.ts

router.post('/api/v1/chat/message', authenticate, rateLimit({ max: 30, window: '1m' }), async (req, res) => {
  const { sessionId, content } = req.body;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Check token budget
  const budgetCheck = await tokenLedger.checkBudget(req.user.id);
  if (!budgetCheck.allowed) {
    res.write(`data: ${JSON.stringify({ type: 'error', code: 'BUDGET_EXHAUSTED', message: budgetCheck.message })}\n\n`);
    res.end();
    return;
  }
  
  // Route to appropriate model
  const intent = await classifyIntent(content); // Haiku call
  const model = intent.complexity === 'simple' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514';
  
  // Stream response
  const stream = await anthropic.messages.create({
    model,
    max_tokens: 2048,
    system: VOLT_SYSTEM_PROMPT,
    messages: await getSessionMessages(sessionId),
    tools: voltTools,
    stream: true,
  });
  
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      res.write(`data: ${JSON.stringify({ type: 'text', content: event.delta.text })}\n\n`);
    }
    if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
      res.write(`data: ${JSON.stringify({ type: 'tool_start', tool: event.content_block.name })}\n\n`);
    }
    // ... handle tool results, stream them back as structured events
  }
  
  // Record token usage
  await tokenLedger.debit(req.user.id, stream.usage.input_tokens, stream.usage.output_tokens, model, 'chat');
  
  res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  res.end();
});
```

### 9.5.4 Memory Management

| Memory Type | Storage | TTL | Purpose |
|-------------|---------|-----|---------|
| Session messages | `agent_messages` table | Session lifetime (24h inactivity timeout) | Conversation continuity |
| User preferences | `user_preferences` JSONB field | Permanent | "I always want Havells brand" |
| Past inquiries | Fetched from `inquiries` table on session start | Real-time | Context: "your last inquiry for MCBs got 4 quotes" |
| Product knowledge | Embedded in system prompt + tool results | Static | Product specs, standards |

**Context window management:** When session message count exceeds 40 messages, the oldest messages are summarized by Haiku into a 500-token summary that replaces the original messages. The summary + last 10 messages are sent to the model.

---

## 9.6 Price Prediction Agent

### 9.6.1 Architecture

Hybrid approach: XGBoost for numeric prediction + Claude Haiku for interpretation.

**Input Features (same as 9.2.4 Pricing Engine but expanded):**

| Feature | Type | Update Frequency |
|---------|------|-----------------|
| `historical_price_30d` | Array[float] | Daily |
| `historical_price_90d` | Array[float] | Daily |
| `historical_price_365d` | Array[float] | Weekly |
| `copper_spot_price_inr` | Float | Daily (MCX API) |
| `aluminum_spot_price_inr` | Float | Daily |
| `pvc_price_index` | Float | Weekly |
| `city_demand_index` | Float (0-1) | Weekly (from platform transaction volume) |
| `seasonal_index` | Float (0-1) | Static (pre-computed from 2 years of data) |
| `brand_price_tier` | Integer (1-5) | Static |
| `product_category_one_hot` | Vector | Static |
| `active_dealer_count` | Integer | Daily |
| `pending_inquiry_count` | Integer | Daily |
| `festival_proximity_days` | Integer | Daily (Diwali, Navratri = high demand for electrical) |

**Output:**

```typescript
interface PricePrediction {
  productId: string;
  city: string;
  currentMedianPrice: number;
  predictions: {
    days7: { price: number; confidence: number; direction: 'up' | 'down' | 'stable' };
    days14: { price: number; confidence: number; direction: 'up' | 'down' | 'stable' };
    days30: { price: number; confidence: number; direction: 'up' | 'down' | 'stable' };
  };
  recommendation: 'buy_now' | 'wait' | 'no_recommendation';
  reasoning: string;   // Claude Haiku-generated explanation
  lastUpdated: string;
}
```

### 9.6.2 API Endpoints

```
GET    /api/v1/prices/predict
  Auth: Bearer JWT
  Query: ?productId=UUID&city=string&quantity=number
  Response 200: PricePrediction
  Cache: Redis, 6h TTL
  Rate: 20/hour per user

GET    /api/v1/prices/index
  Auth: Bearer JWT (optional -- public with limited data)
  Query: ?category=string&city=string
  Response 200: { category, city, currentIndex, change7d, change30d, trend, products: [...] }
  Cache: Redis, 1h TTL

POST   /api/v1/prices/alerts
  Auth: Bearer JWT
  Body: { productId: UUID, city: string, targetPrice: number, direction: 'below'|'above' }
  Response 201: { alertId: UUID }
  
GET    /api/v1/prices/alerts
  Auth: Bearer JWT
  Response 200: { alerts: [...] }

DELETE /api/v1/prices/alerts/:id
  Auth: Bearer JWT
  Response 204
```

### 9.6.3 Alert System

When a price prediction crosses a user's alert threshold:
1. BullMQ job `price.alert.check` runs every 6 hours
2. For each active alert, compare current prediction with target
3. If triggered: in-app notification + email + WhatsApp (if opted in)
4. Auto-disable alert after 3 triggers (prevent spam) -- user must re-enable

---

## 9.7 Agent Monitoring & Observability

### 9.7.1 Metrics Dashboard (Admin)

| Metric | Source | Refresh |
|--------|--------|---------|
| Total AI spend (USD) today/week/month | `ai_token_usage` aggregate | Real-time |
| Spend by agent type | `ai_token_usage` group by agent_type | Real-time |
| Spend by model | `ai_token_usage` group by model | Real-time |
| Cache hit rate | Redis + `ai_cache` stats | 5 min |
| Average latency by agent | `ai_token_usage.latency_ms` p50/p95/p99 | 5 min |
| Circuit breaker state | Redis circuit breaker keys | Real-time |
| Active negotiation count | `negotiation_sessions` WHERE status IN ('analyzing', 'waiting_*') | Real-time |
| Negotiation success rate (30d rolling) | `negotiation_sessions` | Hourly |
| Average savings per negotiation | `negotiation_sessions.savings_percent` | Hourly |
| Copilot completion rate | `agent_sessions` WHERE agent_type='procurement_copilot' | Hourly |
| Escalation rate | `conversation_intelligence` WHERE escalation_needed=true | Hourly |
| Budget exhaustion events | `ai_token_usage` overflow logs | Real-time |

### 9.7.2 Alerts

| Alert | Condition | Channel |
|-------|-----------|---------|
| High AI spend | Daily spend > $50 USD | Slack #alerts + email to Shreshth |
| Circuit breaker OPEN | Any agent circuit trips | Slack #alerts + PagerDuty |
| Negotiation timeout spike | > 30% of active negotiations timing out in 24h | Slack #alerts |
| Escalation spike | > 20% of conversations escalating in 1h | Slack #alerts |
| Model error rate | > 5% of requests returning errors in 15min window | Slack #alerts + PagerDuty |
| Cache hit rate drop | Cache hit rate drops below 10% for 1h | Slack #alerts |

---

---

# &sect;10 -- UI/UX DESIGN SYSTEM

> *This is the complete design specification for Hub4Estate. Every token, every component, every animation, every responsive pattern. This is law. No designer, developer, or AI agent may deviate from these specifications without written approval from Shreshth. The aesthetic is: neobrutalist confidence softened by warm Mediterranean light -- think Jony Ive designed a construction marketplace on a bright summer day in Santorini.*

---

## 10.1 Design Philosophy

### Constitutional Principles (Shreshth's mandates -- these are LAW)

| # | Mandate | Implementation |
|---|---------|---------------|
| 1 | "I HATE dark UI" | White (#FFFFFF) or warm neutral (#faf9f7, #f5f3ef) backgrounds ONLY. No dark mode. No dark sections. No dark cards. No dark hero sections. `prefers-color-scheme: dark` is IGNORED. |
| 2 | "Clean but futuristic" | Neobrutalist confidence: hard 2px borders, bold shadows, uppercase tracking-wide labels. Softened by warm Mediterranean palette: beige, terracotta, amber, cream. |
| 3 | "Simple and peaceful" | One primary action per screen. Progressive disclosure. Information hierarchy: title > subtitle > body > metadata. A homeowner in Sri Ganganagar should feel CALM using this. |
| 4 | "But with animations" | Every state change communicates through motion. Hover, focus, active, loading, success, error -- all animated. Motion serves meaning, not decoration. |
| 5 | "MOBILE FIRST" | 360px starting canvas. Touch targets 44px minimum (48px recommended). Bottom-sticky CTAs. No hover-only interactions. Everything works with a thumb. |
| 6 | "Apple-grade polish" | The 404 page is designed. The empty state has an illustration. The loading skeleton matches the final layout. The error state has a retry button. EVERYTHING is finished. |
| 7 | "Budget is unlimited for quality" | Use the best fonts (Inter, Playfair Display, JetBrains Mono -- all Google Fonts, $0 cost). Use the best icons (Lucide -- $0 cost). Pixel-perfect at every breakpoint. |

### Design DNA

**Neobrutalist + Mediterranean = Hub4Estate**

Neobrutalist gives us: hard borders, bold shadows, strong typography, confidence, "this means business."

Mediterranean gives us: warmth, terracotta, cream, amber, light, calm, "you're in good hands."

The combination: **a marketplace that looks serious about saving you money but feels like a warm handshake.**

Anti-patterns (NEVER do this):
- Glassmorphism (frosted glass effects)
- Neon/cyberpunk color schemes
- Dark gradients as backgrounds
- Skeleton loaders with dark backgrounds
- Cards with dark backgrounds
- Any element where text is light on a dark background (except: nav header on primary-950, badges with dark backgrounds where contrast ratio exceeds 4.5:1)

---

## 10.2 Color System

### 10.2.1 Primary Palette (Warm Beige/Tan)

Every shade has a defined purpose. No shade is used arbitrarily.

| Token | Hex | RGB | Usage | Tailwind Class |
|-------|-----|-----|-------|---------------|
| `primary-50` | `#f5f0eb` | 245, 240, 235 | Page backgrounds, subtle fills, hover bg on white cards | `bg-primary-50` |
| `primary-100` | `#ede5db` | 237, 229, 219 | Card backgrounds, input backgrounds, sidebar bg | `bg-primary-100` |
| `primary-200` | `#e0d5c5` | 224, 213, 197 | Borders, dividers, separator lines | `border-primary-200` |
| `primary-300` | `#d4cdc0` | 212, 205, 192 | Disabled state backgrounds, disabled input borders | `bg-primary-300` |
| `primary-400` | `#b8ad9a` | 184, 173, 154 | Placeholder text, disabled text, muted icons | `text-primary-400` |
| `primary-500` | `#9c8e78` | 156, 142, 120 | Brand color base, secondary text, icon default | `text-primary-500` |
| `primary-600` | `#8a7a62` | 138, 122, 98 | Active borders, focused input borders | `border-primary-600` |
| `primary-700` | `#726452` | 114, 100, 82 | Headings on light backgrounds, strong labels | `text-primary-700` |
| `primary-800` | `#5e5345` | 94, 83, 69 | Body text on light backgrounds | `text-primary-800` |
| `primary-900` | `#4d4439` | 77, 68, 57 | Strong emphasis text, important labels | `text-primary-900` |
| `primary-950` | `#2a2418` | 42, 36, 24 | Maximum contrast text on light backgrounds, nav header bg | `text-primary-950` |

### 10.2.2 Accent Palette (Terracotta/Warm Orange)

| Token | Hex | RGB | Usage | Tailwind Class |
|-------|-----|-----|-------|---------------|
| `accent-50` | `#fdf8f5` | 253, 248, 245 | Accent section backgrounds, highlight fills | `bg-accent-50` |
| `accent-100` | `#faeee8` | 250, 238, 232 | Hover state on accent elements | `hover:bg-accent-100` |
| `accent-200` | `#f5dcd0` | 245, 220, 208 | Light accent fills, progress bar backgrounds | `bg-accent-200` |
| `accent-300` | `#edc4b0` | 237, 196, 176 | Accent borders, tag backgrounds | `bg-accent-300` |
| `accent-400` | `#e3a688` | 227, 166, 136 | Accent icons (non-interactive) | `text-accent-400` |
| `accent-500` | `#d3815e` | 211, 129, 94 | Accent color base, secondary CTA, links | `text-accent-500` |
| `accent-600` | `#c4724f` | 196, 114, 79 | Accent hover state | `hover:text-accent-600` |
| `accent-700` | `#a85f42` | 168, 95, 66 | Accent text on light backgrounds | `text-accent-700` |
| `accent-800` | `#8c4e37` | 140, 78, 55 | Dark accent text | `text-accent-800` |
| `accent-900` | `#74412f` | 116, 65, 47 | Darkest accent, used sparingly | `text-accent-900` |
| `accent-950` | `#3d2118` | 61, 33, 24 | Accent maximum contrast | `text-accent-950` |

### 10.2.3 CTA Palette (Amber)

The only interactive color. Every clickable button that drives revenue uses amber.

| Token | Hex | RGB | Usage | Tailwind Class |
|-------|-----|-----|-------|---------------|
| `amber-50` | `#FFFBEB` | 255, 251, 235 | CTA hover backgrounds (ghost variant) | `hover:bg-amber-50` |
| `amber-100` | `#FEF3C7` | 254, 243, 199 | Icon hover backgrounds | `group-hover:bg-amber-100` |
| `amber-200` | `#FDE68A` | 253, 230, 138 | Progress bar fills, rating stars | `bg-amber-200` |
| `amber-500` | `#F59E0B` | 245, 158, 11 | CTA backgrounds (secondary), badges, highlights | `bg-amber-500` |
| `amber-600` | `#D97706` | 217, 119, 6 | **PRIMARY CTA** -- all main action buttons | `bg-amber-600` |
| `amber-700` | `#B45309` | 180, 83, 9 | CTA hover state | `hover:bg-amber-700` |
| `amber-800` | `#92400E` | 146, 64, 14 | CTA active/pressed state | `active:bg-amber-800` |

### 10.2.4 Semantic Colors

| Token | Hex | BG Hex | Text Hex | Usage |
|-------|-----|--------|----------|-------|
| `success` | `#22C55E` | `#DCFCE7` | `#166534` | Verified badges, deal confirmed, delivery complete, savings indicators |
| `warning` | `#F59E0B` | `#FEF3C7` | `#92400E` | Pending states, quote expiring, low stock, budget warnings |
| `error` | `#EF4444` | `#FEE2E2` | `#991B1B` | Validation errors, failed payments, rejected quotes, critical alerts |
| `info` | `#3B82F6` | `#DBEAFE` | `#1E40AF` | Informational badges, links, help tooltips, new feature indicators |

### 10.2.5 Special Colors

| Token | Hex | Usage | RESTRICTIONS |
|-------|-----|-------|-------------|
| `navy` | `#0B1628` | Display headings, monospace text, high-contrast text | **NEVER** as background. NEVER as card fill. NEVER as section bg. Text and small UI elements ONLY. |
| `white` | `#FFFFFF` | Primary page background | Default bg for all pages |
| `warm-white` | `#faf9f7` | Alternate section background (for visual rhythm) | Alternating sections: white > warm-white > white |
| `cream` | `#f5f3ef` | Card backgrounds, input field fills, sidebar bg | Cards on white bg, inputs on white bg |
| `light-beige` | `#e8e4db` | Borders, dividers, subtle separation | Never as text color (insufficient contrast) |

### 10.2.6 CSS Custom Properties

```css
:root {
  /* Primary */
  --color-primary-50: #f5f0eb;
  --color-primary-100: #ede5db;
  --color-primary-200: #e0d5c5;
  --color-primary-300: #d4cdc0;
  --color-primary-400: #b8ad9a;
  --color-primary-500: #9c8e78;
  --color-primary-600: #8a7a62;
  --color-primary-700: #726452;
  --color-primary-800: #5e5345;
  --color-primary-900: #4d4439;
  --color-primary-950: #2a2418;

  /* Accent */
  --color-accent-50: #fdf8f5;
  --color-accent-100: #faeee8;
  --color-accent-200: #f5dcd0;
  --color-accent-300: #edc4b0;
  --color-accent-400: #e3a688;
  --color-accent-500: #d3815e;
  --color-accent-600: #c4724f;
  --color-accent-700: #a85f42;
  --color-accent-800: #8c4e37;
  --color-accent-900: #74412f;
  --color-accent-950: #3d2118;

  /* CTA */
  --color-cta: #D97706;
  --color-cta-hover: #B45309;
  --color-cta-active: #92400E;
  --color-cta-light: #F59E0B;

  /* Semantic */
  --color-success: #22C55E;
  --color-success-bg: #DCFCE7;
  --color-success-text: #166534;
  --color-warning: #F59E0B;
  --color-warning-bg: #FEF3C7;
  --color-warning-text: #92400E;
  --color-error: #EF4444;
  --color-error-bg: #FEE2E2;
  --color-error-text: #991B1B;
  --color-info: #3B82F6;
  --color-info-bg: #DBEAFE;
  --color-info-text: #1E40AF;

  /* Special */
  --color-navy: #0B1628;
  --color-white: #FFFFFF;
  --color-warm-white: #faf9f7;
  --color-cream: #f5f3ef;
  --color-light-beige: #e8e4db;

  /* Backgrounds */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #faf9f7;
  --color-bg-tertiary: #f5f3ef;
  --color-bg-input: #f5f3ef;

  /* Text */
  --color-text-primary: #2a2418;
  --color-text-secondary: #5e5345;
  --color-text-tertiary: #9c8e78;
  --color-text-placeholder: #b8ad9a;
  --color-text-disabled: #d4cdc0;

  /* Borders */
  --color-border-default: #e0d5c5;
  --color-border-strong: #b8ad9a;
  --color-border-focus: #8a7a62;
}
```

### 10.2.7 Color Contrast Compliance (WCAG 2.1 AA)

Every text/background combination used in the platform must pass these ratios:

| Text Color | Background Color | Contrast Ratio | Passes AA? | Usage |
|-----------|-----------------|---------------|-----------|-------|
| `primary-950` (#2a2418) | `white` (#FFFFFF) | 14.8:1 | YES | Headings on white |
| `primary-800` (#5e5345) | `white` (#FFFFFF) | 7.3:1 | YES | Body text on white |
| `primary-700` (#726452) | `white` (#FFFFFF) | 5.6:1 | YES | Subheadings on white |
| `primary-500` (#9c8e78) | `white` (#FFFFFF) | 3.3:1 | NO (large text only) | Metadata, captions (18px+ only) |
| `primary-950` (#2a2418) | `cream` (#f5f3ef) | 12.7:1 | YES | Headings on cream cards |
| `primary-800` (#5e5345) | `cream` (#f5f3ef) | 6.3:1 | YES | Body text on cream cards |
| `white` (#FFFFFF) | `amber-600` (#D97706) | 3.1:1 | YES (large text) | Button text on CTA -- use bold 16px+ |
| `primary-950` (#2a2418) | `amber-600` (#D97706) | 4.8:1 | YES | Alternative: dark text on CTA |
| `error-text` (#991B1B) | `error-bg` (#FEE2E2) | 7.2:1 | YES | Error messages |
| `success-text` (#166534) | `success-bg` (#DCFCE7) | 7.8:1 | YES | Success messages |
| `warning-text` (#92400E) | `warning-bg` (#FEF3C7) | 5.9:1 | YES | Warning messages |
| `info-text` (#1E40AF) | `info-bg` (#DBEAFE) | 6.4:1 | YES | Info messages |

**Rule:** If a combination fails AA at normal text size (< 18px), it may ONLY be used at 18px+ bold or 24px+ regular. If it fails at large text too, it is BANNED.

---

## 10.3 Typography

### 10.3.1 Font Stack

| Font | Weight Range | Role | Fallback Chain | Loading Strategy |
|------|-------------|------|---------------|-----------------|
| **Inter** | 300-900 | All interface text: headings, body, labels, buttons, navigation | `system-ui`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, `Roboto`, `sans-serif` | `font-display: swap`, preload 400+700 weights |
| **Playfair Display** | 400-900 | Hero headlines on marketing/landing pages ONLY. Never in app UI. | `Georgia`, `'Times New Roman'`, `serif` | `font-display: swap`, load async |
| **JetBrains Mono** | 400-700 | Inquiry numbers (H4E-2026-XXXX), prices (Rs 1,85,000), product model numbers, technical specs | `'Fira Code'`, `'Source Code Pro'`, `monospace` | `font-display: swap`, load async |

### 10.3.2 Type Scale

Every text element maps to exactly one scale step. No arbitrary font sizes.

**Display Scale (marketing pages, hero sections):**

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|---------------|-------|
| `display-2xl` | 72px (4.5rem) | 1.0 | 900 (Black) | -0.02em | Landing page hero headline |
| `display-xl` | 60px (3.75rem) | 1.0 | 800 (ExtraBold) | -0.02em | Section hero headlines |
| `display-lg` | 48px (3rem) | 1.1 | 800 (ExtraBold) | -0.02em | Major section titles |
| `display-md` | 36px (2.25rem) | 1.2 | 700 (Bold) | -0.01em | Sub-section heroes |
| `display-sm` | 30px (1.875rem) | 1.2 | 700 (Bold) | -0.01em | Feature section titles |

**Heading Scale (app UI):**

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `heading-xl` | 24px (1.5rem) | 1.3 | 700 | Page titles, dashboard headers |
| `heading-lg` | 20px (1.25rem) | 1.3 | 700 | Card titles, section headers |
| `heading-md` | 18px (1.125rem) | 1.4 | 600 | Sub-section headers, modal titles |
| `heading-sm` | 16px (1rem) | 1.4 | 600 | Widget headers, sidebar section labels |

**Body Scale:**

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `body-lg` | 16px (1rem) | 1.6 | 400 | Primary body text, paragraph content |
| `body-md` | 14px (0.875rem) | 1.5 | 400 | Secondary body text, table cells, form descriptions |
| `body-sm` | 12px (0.75rem) | 1.5 | 400 | Metadata, timestamps, fine print |

**Utility Scale:**

| Token | Size | Line Height | Weight | Additional | Usage |
|-------|------|-------------|--------|-----------|-------|
| `caption` | 11px (0.6875rem) | 1.4 | 500 | -- | Image captions, footnotes |
| `label` | 12-14px | 1.4 | 700 | `text-transform: uppercase; letter-spacing: 0.05em;` | Form labels, badge text, section eyebrows, tab labels |
| `mono-price` | 16-24px | 1.2 | 700 | `font-family: JetBrains Mono` | All price displays: Rs 1,85,000 |
| `mono-code` | 13px | 1.5 | 400 | `font-family: JetBrains Mono` | Inquiry numbers, model numbers, technical specs |

### 10.3.3 Responsive Typography

Font sizes scale down on mobile to maintain readability without horizontal overflow.

| Token | Desktop (1024px+) | Tablet (640-1023px) | Mobile (<640px) |
|-------|--------------------|---------------------|-----------------|
| `display-2xl` | 72px | 56px | 40px |
| `display-xl` | 60px | 48px | 36px |
| `display-lg` | 48px | 40px | 32px |
| `display-md` | 36px | 30px | 24px |
| `display-sm` | 30px | 24px | 20px |
| `heading-xl` | 24px | 22px | 20px |
| All others | No change | No change | No change |

Implementation via Tailwind responsive prefixes:

```html
<h1 class="text-[40px] sm:text-[56px] lg:text-display-2xl font-black leading-none tracking-tight">
  Save Up to 40% on Electrical Materials
</h1>
```

### 10.3.4 Signature Typography Patterns

These patterns recur throughout the platform and must be applied consistently:

**Section Eyebrow:**
```html
<span class="text-xs font-bold uppercase tracking-widest text-amber-600">
  How It Works
</span>
```

**Stat Number:**
```html
<span class="font-mono text-4xl font-black text-primary-950">
  40<span class="text-amber-600">%</span>
</span>
```

**Inquiry Number:**
```html
<code class="font-mono text-sm font-medium text-primary-700 bg-cream px-2 py-0.5 rounded border border-primary-200">
  H4E-2026-0847
</code>
```

**Price Display:**
```html
<span class="font-mono text-xl font-bold text-primary-950">
  <span class="text-sm font-medium text-primary-500">Rs</span> 1,85,000
</span>
```

---

## 10.4 Spacing System

### 10.4.1 Base Unit: 4px

Every spacing value is a multiple of 4px. No arbitrary padding/margins.

| Token | Value | Tailwind | Common Usage |
|-------|-------|----------|-------------|
| `space-0` | 0px | `p-0`, `m-0` | Reset |
| `space-0.5` | 2px | `p-0.5` | Tight inline spacing, icon-to-text micro-gap |
| `space-1` | 4px | `p-1`, `gap-1` | Inline element spacing, badge padding |
| `space-1.5` | 6px | `p-1.5` | Small button padding (vertical) |
| `space-2` | 8px | `p-2`, `gap-2` | Icon padding, tight component gaps |
| `space-3` | 12px | `p-3`, `gap-3` | Standard component padding (small cards) |
| `space-4` | 16px | `p-4`, `gap-4` | Standard card padding, input padding, page gutter (mobile) |
| `space-5` | 20px | `p-5`, `gap-5` | Medium card padding |
| `space-6` | 24px | `p-6`, `gap-6` | Standard card padding (desktop), page gutter (desktop) |
| `space-8` | 32px | `p-8`, `gap-8` | Section internal padding |
| `space-10` | 40px | `p-10` | Large section padding |
| `space-12` | 48px | `p-12` | Section vertical padding (mobile) |
| `space-16` | 64px | `p-16` | Section vertical padding (desktop) |
| `space-20` | 80px | `p-20` | Major section breaks |
| `space-24` | 96px | `p-24` | Hero section top/bottom padding |

### 10.4.2 Grid System

| Parameter | Value |
|-----------|-------|
| Columns | 12 |
| Max width | 1280px (`max-w-7xl`) |
| Gutter (mobile) | 16px (`px-4`) |
| Gutter (tablet) | 20px (`px-5`) |
| Gutter (desktop) | 24px (`px-6`) |
| Column gap | 16px mobile, 24px desktop (`gap-4 lg:gap-6`) |

**Container:**
```html
<div class="mx-auto max-w-7xl px-4 sm:px-5 lg:px-6">
  <!-- 12-column grid content -->
</div>
```

**Common column layouts:**

| Layout | Mobile | Tablet | Desktop | Usage |
|--------|--------|--------|---------|-------|
| Full | 1 col | 1 col | 1 col | Forms, detail pages |
| Split | 1 col | 2 col | 2 col | Comparison, side-by-side |
| Thirds | 1 col | 2 col | 3 col | Product cards, feature grid |
| Quarters | 1 col | 2 col | 4 col | Stat cards, category tiles |
| Sidebar | 1 col (stacked) | 1 col (stacked) | 3+9 or 4+8 | Dashboard, settings |

---

## 10.5 Shadow System

### 10.5.1 Neobrutalist Shadows

Hard-edge shadows with zero blur. These say "this element is interactive" and "this is serious."

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `brutal-sm` | `2px 2px 0 rgba(0,0,0,1)` | Active/pressed state (element appears pushed down) |
| `brutal` | `4px 4px 0 rgba(0,0,0,1)` | Default interactive state: buttons on hover, interactive cards |
| `brutal-lg` | `6px 6px 0 rgba(0,0,0,1)` | Emphasized interactive elements, featured cards |
| `brutal-xl` | `8px 8px 0 rgba(0,0,0,1)` | Hero cards, primary CTA on landing page, modals |
| `inner-brutal` | `inset 2px 2px 0 rgba(0,0,0,0.1)` | Input fields on focus (pressed-in effect) |

### 10.5.2 Soft Shadows

Standard elevation shadows for non-neobrutalist contexts (dropdowns, tooltips, floating elements).

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `soft` | `0 4px 20px -2px rgba(0,0,0,0.08)` | Cards at rest, subtle elevation |
| `soft-lg` | `0 8px 30px -4px rgba(0,0,0,0.12)` | Cards on hover, dropdowns, popovers |
| `soft-xl` | `0 16px 48px -8px rgba(0,0,0,0.15)` | Modals, overlays, sticky headers |

### 10.5.3 Glow Shadows

Warm accent glow for CTA emphasis.

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `glow` | `0 0 40px rgba(211,129,94,0.3)` | CTA button glow on hover |
| `glow-lg` | `0 0 60px rgba(211,129,94,0.4)` | Hero CTA glow, spotlight effect |
| `glow-amber` | `0 0 40px rgba(245,158,11,0.3)` | Amber CTA glow variant |

### 10.5.4 Shadow Interaction Pattern

```
Rest state:      shadow-none (or shadow-soft for elevated cards)
                      |
                      | hover
                      v
Hover state:     shadow-brutal + translate(0, -2px)
                      |
                      | mousedown
                      v
Active state:    shadow-brutal-sm + translate(2px, 2px)
                      |
                      | mouseup
                      v
Back to rest:    shadow-none + translate(0, 0)
```

CSS implementation:

```css
.card-interactive {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 rgba(0,0,0,1);
}
.card-interactive:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 rgba(0,0,0,1);
}
```

---

## 10.6 Border System

### 10.6.1 Border Widths

| Token | Value | Usage |
|-------|-------|-------|
| `border` | 1px | Default borders: cards, inputs, dividers |
| `border-2` | 2px | Neobrutalist borders: interactive cards, buttons, focused inputs |
| `border-3` | 3px | Heavy emphasis: selected tabs, active state indicators |
| `border-4` | 4px | Maximum emphasis: hero cards, primary focus ring |

### 10.6.2 Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `radius-sm` | 4px | `rounded-sm` | Badges, small tags, code inline |
| `radius-md` | 6px | `rounded-md` | Inputs, small buttons, table cells |
| `radius-default` | 8px | `rounded-lg` | Standard cards, buttons, dropdowns |
| `radius-xl` | 12px | `rounded-xl` | Large cards, modals, feature sections |
| `radius-2xl` | 16px | `rounded-2xl` | Hero cards, marketing sections |
| `radius-3xl` | 24px | `rounded-3xl` | Pills, rounded containers |
| `radius-4xl` | 32px | `rounded-4xl` | Large pills, floating elements |
| `radius-5xl` | 40px | `rounded-5xl` | Decorative rounded elements |
| `radius-full` | 9999px | `rounded-full` | Avatars, circular buttons, status dots |

### 10.6.3 Border Colors

| Context | Color | Tailwind |
|---------|-------|----------|
| Default | `primary-200` (#e0d5c5) | `border-primary-200` |
| Strong | `primary-400` (#b8ad9a) | `border-primary-400` |
| Focus | `primary-600` (#8a7a62) | `focus:border-primary-600` |
| Error | `error` (#EF4444) | `border-error-500` |
| Success | `success` (#22C55E) | `border-success-500` |
| Neobrutalist | `primary-950` (#2a2418) | `border-primary-950` |

---

## 10.7 Component Library

Every component is specified with: variants, sizes, all states, accessibility requirements, and exact Tailwind classes.

### 10.7.1 Button

The most important component. Every button on the platform maps to one of these variants.

**Variants:**

| Variant | Background | Text | Border | Shadow | Usage |
|---------|-----------|------|--------|--------|-------|
| `primary` | `amber-600` | `white` | `2px solid primary-950` | `brutal` on hover | Primary CTA: "Submit Inquiry", "Place Order", "Get Quotes" |
| `secondary` | `white` | `primary-800` | `2px solid primary-300` | `brutal` on hover | Secondary actions: "Save Draft", "Compare", "View Details" |
| `accent` | `accent-500` | `white` | `2px solid primary-950` | `brutal` on hover | Accent CTA: "Start Negotiation", "Generate BOQ" |
| `ghost` | `transparent` | `primary-700` | `none` | `none` | Tertiary actions: "Cancel", "Back", "Skip" |
| `destructive` | `error-500` | `white` | `2px solid error-900` | `brutal` on hover | Dangerous: "Delete", "Reject", "Cancel Order" |

**Sizes:**

| Size | Height | Padding | Font | Icon Size | Min Width |
|------|--------|---------|------|-----------|----------|
| `sm` | 32px | `px-3 py-1.5` | 12px, 600 weight | 14px | 64px |
| `md` | 40px | `px-4 py-2` | 14px, 600 weight | 16px | 80px |
| `lg` | 48px | `px-6 py-3` | 16px, 600 weight | 18px | 96px |

**States:**

| State | Visual Change |
|-------|--------------|
| Default | As defined per variant |
| Hover | `shadow-brutal` + `translateY(-1px)` + darker bg (amber-700 for primary) |
| Active | `shadow-brutal-sm` + `translate(2px, 2px)` + darkest bg (amber-800 for primary) |
| Focus | `outline: 2px solid primary-950` + `outline-offset: 2px` (ALWAYS visible, never hidden) |
| Disabled | `opacity-50` + `cursor-not-allowed` + no shadow + no transform |
| Loading | Content replaced with spinner (14px for sm, 16px for md, 18px for lg) + text "..." or spinner animation. `aria-busy="true"`, `disabled` |

**Accessibility:**
- All buttons have `role="button"` (implicit for `<button>`, explicit for `<a>` styled as button)
- Icon-only buttons MUST have `aria-label` describing the action
- Loading state: `aria-busy="true"` + `aria-label="Loading, please wait"`
- Disabled state: `aria-disabled="true"` (prefer over `disabled` attribute for screen reader announcement)
- Keyboard: `Enter` and `Space` trigger click. Focus ring always visible on `:focus-visible`.

**Implementation:**

```tsx
// packages/web/src/components/ui/Button.tsx

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive';
  size: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: `
    bg-amber-600 text-white border-2 border-primary-950
    hover:bg-amber-700 hover:shadow-brutal hover:-translate-y-0.5
    active:bg-amber-800 active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5
    focus-visible:outline-2 focus-visible:outline-primary-950 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0
  `,
  secondary: `
    bg-white text-primary-800 border-2 border-primary-300
    hover:border-primary-500 hover:shadow-brutal hover:-translate-y-0.5
    active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5
    focus-visible:outline-2 focus-visible:outline-primary-950 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  accent: `
    bg-accent-500 text-white border-2 border-primary-950
    hover:bg-accent-600 hover:shadow-brutal hover:-translate-y-0.5
    active:bg-accent-700 active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5
    focus-visible:outline-2 focus-visible:outline-primary-950 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    bg-transparent text-primary-700
    hover:bg-primary-50 hover:text-primary-900
    active:bg-primary-100
    focus-visible:outline-2 focus-visible:outline-primary-950 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  destructive: `
    bg-error-500 text-white border-2 border-error-900
    hover:bg-error-600 hover:shadow-brutal hover:-translate-y-0.5
    active:bg-error-700 active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5
    focus-visible:outline-2 focus-visible:outline-primary-950 focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

const sizeClasses = {
  sm: 'h-8 px-3 py-1.5 text-xs font-semibold gap-1.5',
  md: 'h-10 px-4 py-2 text-sm font-semibold gap-2',
  lg: 'h-12 px-6 py-3 text-base font-semibold gap-2.5',
};
```

### 10.7.2 Input

**Variants:**

| Variant | Description |
|---------|------------|
| `default` | Standard text input |
| `search` | With search icon left, clear button right |
| `password` | With eye toggle right |
| `phone` | With +91 country code prefix |
| `currency` | With Rs prefix, formatted number input |
| `textarea` | Multi-line, auto-resize |

**Sizes:**

| Size | Height | Font | Padding |
|------|--------|------|---------|
| `sm` | 36px | 14px | `px-3 py-2` |
| `md` | 44px | 16px | `px-4 py-2.5` |
| `lg` | 52px | 16px | `px-4 py-3` |

**States:**

| State | Border | Background | Additional |
|-------|--------|-----------|-----------|
| Default | `border-primary-200` | `bg-cream` (#f5f3ef) | -- |
| Hover | `border-primary-400` | `bg-cream` | -- |
| Focus | `border-primary-600` + `shadow-inner-brutal` | `bg-white` | `outline: 2px solid primary-600; outline-offset: -1px;` |
| Error | `border-error-500` | `bg-error-50` | Error icon + message below |
| Disabled | `border-primary-200` + `opacity-60` | `bg-primary-100` | `cursor-not-allowed` |
| Read-only | `border-primary-200` | `bg-primary-50` | `cursor-default` |

**Accessibility:**
- Every input MUST have a visible `<label>` linked via `htmlFor`/`id`
- Error messages linked via `aria-describedby`
- Required fields: `aria-required="true"` + visual asterisk in label
- Autocomplete attributes on all relevant fields (`autocomplete="email"`, `autocomplete="tel"`, etc.)

### 10.7.3 OTPInput

```typescript
interface OTPInputProps {
  length: 6;                    // always 6 digits for Hub4Estate
  onComplete: (otp: string) => void;
  autoFocus: boolean;
  disabled: boolean;
  error?: string;
}
```

**Behavior:**
- 6 individual digit inputs, each 48px x 56px
- Auto-advance: typing a digit moves focus to next input
- Backspace: clears current and moves focus to previous
- Paste support: pasting "123456" fills all 6 fields
- Auto-submit: fires `onComplete` when all 6 digits filled
- Mobile: `inputmode="numeric"` + `autocomplete="one-time-code"` (enables SMS autofill on iOS/Android)

**Visual:**
- Border: `2px solid primary-300` (default), `2px solid primary-600` (focused), `2px solid error-500` (error)
- Background: `cream` (default), `white` (focused)
- Font: JetBrains Mono, 24px, 700 weight, centered
- Gap between inputs: 8px

### 10.7.4 Select

Built on Radix UI `<Select>` for accessibility.

**Visual:** Same as Input (border, bg, sizing). Chevron icon right-aligned. Dropdown appears below with `shadow-soft-lg`, `border-2 border-primary-200`, `bg-white`, max-height 300px with scroll.

**Option styling:** `px-4 py-2.5 text-sm`, hover `bg-primary-50`, selected `bg-amber-50 text-amber-800 font-medium`.

### 10.7.5 Checkbox & Radio

- Size: 20px x 20px (touch target: 44px via padding)
- Border: `2px solid primary-400` (default), `2px solid primary-600` (hover)
- Checked: `bg-amber-600 border-amber-600` with white checkmark/dot
- Focus: `outline: 2px solid primary-950; outline-offset: 2px;`
- Label: 14px, `text-primary-800`, clickable (wraps input)

### 10.7.6 Switch (Toggle)

- Track: 44px x 24px, `bg-primary-300` (off), `bg-amber-600` (on)
- Thumb: 20px circle, `bg-white`, `shadow-brutal-sm`
- Transition: 150ms `cubic-bezier(0.4, 0, 0.2, 1)`
- Focus: `outline: 2px solid primary-950; outline-offset: 2px;` on track
- `role="switch"` + `aria-checked`

### 10.7.7 Slider

- Track: 4px height, `bg-primary-200` (unfilled), `bg-amber-600` (filled)
- Thumb: 24px circle, `bg-white`, `border-2 border-amber-600`, `shadow-brutal-sm`
- Hover: thumb grows to 28px
- Labels: min/max values below track ends, current value above thumb
- `role="slider"` + `aria-valuemin` + `aria-valuemax` + `aria-valuenow`

### 10.7.8 Modal

Built on Radix UI `<Dialog>` for accessibility.

**Sizes:**

| Size | Width | Usage |
|------|-------|-------|
| `sm` | 400px max | Confirmation dialogs, simple forms |
| `md` | 560px max | Standard forms, detail views |
| `lg` | 720px max | Complex forms, comparison views |
| `xl` | 900px max | Data tables, full editors |

**Mobile behavior:** All modals become bottom sheets on screens < 640px:
- Slide up from bottom with `animation: slideUp 300ms ease-out`
- Max height: 85vh
- Drag handle at top (8px x 40px, `bg-primary-300`, `rounded-full`)
- Swipe down to dismiss

**Desktop behavior:**
- Centered, `shadow-soft-xl`
- Backdrop: `bg-black/40` with `backdrop-blur-sm`
- Enter: `scale-in` animation (scale 0.95 > 1.0, opacity 0 > 1, 200ms)
- Exit: reverse

**Structure:**
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-description">
  <div class="modal-header">
    <h2 id="modal-title">...</h2>
    <button aria-label="Close dialog">
      <X />
    </button>
  </div>
  <div class="modal-body" id="modal-description">...</div>
  <div class="modal-footer">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </div>
</div>
```

**Accessibility:**
- `role="dialog"` + `aria-modal="true"`
- Focus trap: Tab cycles within modal only
- `aria-labelledby` pointing to title
- Escape key closes
- Focus returns to trigger element on close
- Background scroll locked (`overflow: hidden` on `<body>`)

### 10.7.9 Card System

| Card Type | Border | Shadow | Background | Hover | Usage |
|-----------|--------|--------|-----------|-------|-------|
| `product-card` | `2px solid primary-200` | `soft` | `white` | `-translate-y-1` + `shadow-soft-lg` + amber bottom line | Product catalog grid |
| `dealer-card` | `2px solid primary-200` | `soft` | `white` | Same as product | Dealer listings |
| `inquiry-card` | `2px solid primary-200` | `none` | `cream` | `border-amber-500` | Inquiry list items |
| `quote-card` | `2px solid primary-200` | `none` | `white` | `shadow-brutal` + `-translate-y-1` | Quote comparison |
| `stat-card` | `2px solid primary-200` | `none` | `white` | -- (non-interactive) | Dashboard stats |
| `feature-card` | `2px solid primary-950` | `brutal` | `white` | `brutal-lg` + `-translate-y-1` | Landing page features |

**Amber bottom line hover effect (signature pattern):**

```css
.card-hover-line::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: #D97706;
  transform: scaleX(0);
  transition: transform 200ms ease-out;
  transform-origin: center;
}
.card-hover-line:hover::after {
  transform: scaleX(1);
}
```

### 10.7.10 Badge System

| Badge Type | Background | Text Color | Border | Font | Usage |
|------------|-----------|-----------|--------|------|-------|
| `status-active` | `success-bg` | `success-text` | `1px solid success` | 11px, 600 weight, uppercase | Active inquiries, online dealers |
| `status-pending` | `warning-bg` | `warning-text` | `1px solid warning` | Same | Pending quotes, awaiting approval |
| `status-closed` | `primary-100` | `primary-600` | `1px solid primary-300` | Same | Completed, archived |
| `status-error` | `error-bg` | `error-text` | `1px solid error` | Same | Rejected, failed, expired |
| `trust-verified` | `success-bg` | `success-text` | `1px solid success` | Same + checkmark icon | GST verified, KYC complete |
| `trust-premium` | `amber-50` | `amber-800` | `1px solid amber-600` | Same + star icon | Premium dealers |
| `urgency-high` | `error-bg` | `error-text` | `1px solid error` | Same + clock icon | Urgent inquiries |
| `urgency-medium` | `warning-bg` | `warning-text` | `1px solid warning` | Same | Standard urgency |
| `urgency-low` | `info-bg` | `info-text` | `1px solid info` | Same | Low urgency |
| `category` | `accent-50` | `accent-700` | `1px solid accent-300` | Same | Product category tags |
| `count` | `primary-950` | `white` | none | Same | Notification counts, item counts |
| `new` | `amber-600` | `white` | none | Same + pulse animation | New features, new quotes |

### 10.7.11 Table

**Desktop (>1024px):** Standard HTML table with:
- Header: `bg-primary-50`, `text-xs font-bold uppercase tracking-wider text-primary-600`, `border-b-2 border-primary-200`
- Row: `border-b border-primary-100`, hover `bg-primary-50`
- Cell: `px-4 py-3 text-sm text-primary-800`
- Sticky header on scroll: `position: sticky; top: 0; z-index: 10;`

**Mobile (<1024px):** Table transforms to card list:
- Each row becomes a card
- Table headers become inline labels (bold, 11px, uppercase)
- Values displayed next to labels
- No horizontal scroll ever

**Accessibility:**
- `<table>` with `<thead>`, `<tbody>`, `<th scope="col">`
- Sortable columns: `aria-sort="ascending"` / `"descending"` / `"none"`
- `caption` or `aria-label` describing table contents

### 10.7.12 Tabs

- Style: Bottom border with active indicator
- Active: `border-b-3 border-amber-600 text-primary-900 font-semibold`
- Inactive: `border-b-3 border-transparent text-primary-500 font-medium`
- Hover (inactive): `text-primary-700 border-primary-300`
- With count badge: `<span class="ml-1.5 bg-primary-950 text-white text-xs px-1.5 py-0.5 rounded-full">12</span>`
- `role="tablist"` + `role="tab"` + `role="tabpanel"` + `aria-selected` + arrow key navigation

### 10.7.13 Breadcrumb

```html
<nav aria-label="Breadcrumb">
  <ol class="flex items-center gap-1.5 text-sm text-primary-500">
    <li><a href="/" class="hover:text-primary-800">Home</a></li>
    <li><ChevronRight class="w-3 h-3" /></li>
    <li><a href="/catalog" class="hover:text-primary-800">Catalog</a></li>
    <li><ChevronRight class="w-3 h-3" /></li>
    <li><span class="text-primary-800 font-medium" aria-current="page">MCBs</span></li>
  </ol>
</nav>
```

### 10.7.14 Stepper (Multi-step forms)

- Horizontal on desktop, vertical on mobile
- Step states: completed (green check), active (amber filled circle), upcoming (grey outline circle)
- Connecting line: `bg-primary-200` (incomplete), `bg-success` (completed)
- Active step number: white text on `bg-amber-600` circle (28px diameter)
- Step label: 12px, uppercase, tracking-wide

### 10.7.15 Pagination

- Page numbers in 36px x 36px squares
- Active: `bg-amber-600 text-white border-2 border-primary-950`
- Inactive: `bg-white text-primary-700 border border-primary-200`
- Hover: `shadow-brutal-sm`
- Prev/Next: icon-only buttons with `aria-label="Previous page"` / `aria-label="Next page"`
- Ellipsis: "..." in `text-primary-400`
- Mobile: simplified -- "Page 3 of 12" with Prev/Next only

### 10.7.16 Toast (Notification)

Built on Radix UI `<Toast>` or Sonner for stacking.

| Type | Icon | Border Left | Background |
|------|------|-------------|-----------|
| `success` | CheckCircle (green) | `4px solid success` | `success-bg` |
| `error` | AlertCircle (red) | `4px solid error` | `error-bg` |
| `warning` | AlertTriangle (amber) | `4px solid warning` | `warning-bg` |
| `info` | Info (blue) | `4px solid info` | `info-bg` |

**Behavior:**
- Position: top-right on desktop, top-center on mobile
- Auto-dismiss: 5 seconds (success/info), 8 seconds (warning), manual dismiss only (error)
- Stacking: max 3 visible, oldest dismissed first
- Enter: slide-in from right (desktop), slide-down from top (mobile)
- Exit: fade-out + slide-up
- Close button: always visible, `aria-label="Dismiss notification"`
- `role="alert"` for errors, `role="status"` for success/info

### 10.7.17 Skeleton Loader

| Variant | Shape | Usage |
|---------|-------|-------|
| `skeleton-text` | Rectangle, height matches text size (14px for body, 20px for heading), rounded-sm | Text content loading |
| `skeleton-text-paragraph` | 3-4 lines of `skeleton-text` with last line at 60% width | Paragraph loading |
| `skeleton-avatar` | Circle (40px default) | User avatars loading |
| `skeleton-card` | Full card shape: image area (200px height) + text lines + badge area | Product/dealer card loading |
| `skeleton-table-row` | Full row with column-width rectangles | Table data loading |
| `skeleton-stat` | Large number (32px height) + label below (12px height) | Stat card loading |

**Animation:** Pulse shimmer from `bg-primary-100` to `bg-primary-200` and back, 1.5s infinite:

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.skeleton {
  animation: skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: var(--color-primary-100);
  border-radius: 4px;
}
```

### 10.7.18 EmptyState

Used when a list/table/section has zero items.

**Structure:**
```html
<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="w-48 h-48 mb-6">
    <!-- SVG illustration specific to context -->
  </div>
  <h3 class="text-heading-lg text-primary-900 mb-2">No inquiries yet</h3>
  <p class="text-body-md text-primary-500 max-w-md mb-6">
    Create your first inquiry to start getting quotes from verified dealers.
  </p>
  <Button variant="primary" size="lg">Create Inquiry</Button>
</div>
```

**Illustrations (one per context):**
- Empty inbox: open mailbox illustration
- No inquiries: clipboard with magnifying glass
- No quotes: speech bubbles
- No products: empty shelf
- No dealers: store with "coming soon" sign
- Search no results: magnifying glass with question mark

### 10.7.19 ErrorState

```html
<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="w-32 h-32 mb-6 text-error-400">
    <AlertTriangle class="w-full h-full" />
  </div>
  <h3 class="text-heading-lg text-primary-900 mb-2">Something went wrong</h3>
  <p class="text-body-md text-primary-500 max-w-md mb-6">
    We couldn't load this page. This has been reported to our team.
  </p>
  <div class="flex gap-3">
    <Button variant="primary" size="md" onClick={retry}>Try Again</Button>
    <Button variant="ghost" size="md" onClick={goHome}>Go Home</Button>
  </div>
</div>
```

### 10.7.20 LoadingSpinner & PageLoader

**Spinner:** 
- SVG circle with `stroke-amber-600`, `stroke-dasharray` animation
- Sizes: `sm` (16px), `md` (24px), `lg` (32px), `xl` (48px)
- `role="status"` + `aria-label="Loading"`

**PageLoader (full-page):**
- Centered vertically and horizontally
- Hub4Estate logo (48px) + "Loading..." text below
- Pulse animation on logo
- `bg-white` full viewport

### 10.7.21 Avatar

| Size | Diameter | Font | Usage |
|------|----------|------|-------|
| `xs` | 24px | 10px | Inline mentions, tight lists |
| `sm` | 32px | 12px | Comment authors, message senders |
| `md` | 40px | 14px | Card headers, navigation |
| `lg` | 56px | 18px | Profile headers |
| `xl` | 80px | 24px | Profile pages, dealer profiles |

**Fallback:** When no image: show initials (first letter of first + last name) on `bg-amber-100` with `text-amber-800`.

**Ring:** Online indicator: 8px green dot at bottom-right, `border: 2px solid white`.

### 10.7.22 Tooltip & Popover

**Tooltip:**
- Trigger: hover (desktop) or long-press (mobile)
- Delay: 300ms before show, 100ms before hide
- Background: `primary-950`, text: `white`, `text-xs`, `px-2 py-1`, `rounded-md`
- Max width: 200px
- Arrow: 6px CSS triangle
- `role="tooltip"` + `aria-describedby` on trigger

**Popover:**
- Trigger: click
- Background: `white`, border: `1px solid primary-200`, `shadow-soft-lg`, `rounded-xl`
- Close on click outside, Escape key
- `role="dialog"` (if interactive content inside)

### 10.7.23 Dropdown

Built on Radix UI `<DropdownMenu>`.

- Trigger: click on button/icon
- Container: `bg-white`, `border border-primary-200`, `shadow-soft-lg`, `rounded-lg`, min-width 180px
- Item: `px-3 py-2 text-sm text-primary-700`, hover `bg-primary-50 text-primary-900`
- Separator: `border-t border-primary-100 my-1`
- Destructive item: `text-error-600`, hover `bg-error-50 text-error-700`
- Keyboard: arrow keys navigate, Enter selects, Escape closes

### 10.7.24 ImagePreview & ImageGallery

**ImagePreview:**
- Click/tap on image opens lightbox
- Pinch-to-zoom on mobile (Hammer.js or native CSS `touch-action: manipulation`)
- Desktop: scroll wheel to zoom, drag to pan
- Close: X button + Escape key + click outside

**ImageGallery:**
- Horizontal scroll strip of thumbnails (60px x 60px) below main image
- Arrow navigation (keyboard + click)
- Swipe on mobile
- Counter: "3 / 8" in bottom-right corner

### 10.7.25 ElectricWireDivider

Custom SVG section divider that evokes electrical wiring -- the brand signature.

```tsx
// packages/web/src/components/ui/ElectricWireDivider.tsx

export function ElectricWireDivider({ className }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden ${className}`} role="separator" aria-hidden="true">
      <svg viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-6">
        {/* Horizontal wire line */}
        <path d="M0 12 H480 Q490 12 495 4 Q500 -4 505 4 Q510 12 515 12 Q520 12 525 20 Q530 28 535 20 Q540 12 545 12 H720" 
              stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Connection node (circle) */}
        <circle cx="720" cy="12" r="4" fill="#D97706" />
        {/* Continuing wire */}
        <path d="M724 12 H1200" stroke="#D97706" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
```

### 10.7.26 AIAssistantWidget

Floating chat widget available on all authenticated pages.

**Collapsed state:**
- Fixed position: bottom-right, `right-4 bottom-4` (desktop), `right-3 bottom-3` (mobile)
- Circular button: 56px diameter, `bg-amber-600`, `shadow-brutal`, sparkle icon (Lucide `Sparkles`)
- Pulse ring animation when user hasn't interacted yet
- Badge: red dot if there's an unread response

**Expanded state:**
- Desktop: 400px wide x 600px tall, `shadow-soft-xl`, `border-2 border-primary-200`, `rounded-2xl`, bottom-right anchored
- Mobile: full-screen bottom sheet (100vw x 85vh) with drag handle
- Header: "Volt" label + minimize button + close button
- Message area: scrollable, `bg-warm-white`
- User messages: right-aligned, `bg-amber-50`, `border border-amber-200`, `rounded-xl rounded-br-sm`
- Agent messages: left-aligned, `bg-white`, `border border-primary-200`, `rounded-xl rounded-bl-sm`
- Input: sticky bottom, auto-resize textarea, send button (`primary` variant, icon-only, `aria-label="Send message"`)
- Streaming: agent text appears character by character with a blinking cursor
- Tool calls: shown as collapsible cards ("Searching products...", "Checking prices...")
- **Markdown rendering: react-markdown + rehype-sanitize (fixes CRIT-02). NEVER use dangerouslySetInnerHTML.**

---

## 10.8 Animation System

### 10.8.1 Timing Functions

| Token | CSS Value | Usage |
|-------|-----------|-------|
| `ease-smooth` | `cubic-bezier(0.16, 1, 0.3, 1)` | Standard transitions: fades, slides, transforms |
| `ease-bounce` | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful entrances: badges, notifications, success states |
| `ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Card hovers, button presses |
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Micro-interactions: color changes, opacity |

### 10.8.2 Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `instant` | 0ms | Immediate (no animation) |
| `fast` | 100ms | Color changes, opacity shifts |
| `normal` | 200ms | Standard transitions, hover effects |
| `moderate` | 300ms | Modal enter/exit, slide transitions |
| `slow` | 500ms | Page transitions, scroll reveals |
| `dramatic` | 800ms | Hero animations, celebratory effects |

### 10.8.3 Keyframe Animations

```css
/* Slide animations */
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slideDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes slideLeft {
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
@keyframes slideRight {
  from { transform: translateX(-30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Scale animations */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { transform: scale(1); opacity: 1; }
}

/* Fade */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Count-up (for stat numbers) */
@keyframes countUp {
  from { --num: 0; }
  to { --num: var(--target); }
}

/* Pulse for notifications */
@keyframes pulse-ring {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.5); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(217, 119, 6, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(217, 119, 6, 0); }
}

/* Marquee (for brand logos or announcements) */
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}
```

### 10.8.4 Tailwind Animation Presets

```javascript
// tailwind.config.ts extend.animation
animation: {
  'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'slide-down': 'slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'slide-left': 'slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'slide-right': 'slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'fade-in': 'fadeIn 0.4s ease-out forwards',
  'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'marquee': 'marquee 25s linear infinite',
  'spin-slow': 'spin 8s linear infinite',
  'shimmer': 'shimmer 2s linear infinite',
},
```

### 10.8.5 Scroll Reveal System

Uses IntersectionObserver via a `useInView` hook. Elements animate in when they enter the viewport.

```tsx
// packages/web/src/hooks/useScrollReveal.ts

import { useRef, useEffect, useState } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;     // 0-1, default 0.1
  triggerOnce?: boolean;  // default true
  rootMargin?: string;    // default '0px 0px -50px 0px' (trigger 50px before fully in view)
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.triggerOnce !== false) observer.disconnect();
        }
      },
      { threshold: options.threshold ?? 0.1, rootMargin: options.rootMargin ?? '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  
  return { ref, isVisible };
}
```

**Staggered reveal for lists:**

```tsx
// Usage in a grid of cards
{items.map((item, index) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      key={item.id}
      className={`transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <ProductCard product={item} />
    </div>
  );
})}
```

### 10.8.6 Count-Up Animation (Stat Numbers)

```tsx
// packages/web/src/hooks/useCountUp.ts

export function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollReveal({ triggerOnce: true });
  
  useEffect(() => {
    if (!isVisible) return;
    const startTime = performance.now();
    
    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for decelerating count
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easedProgress * target));
      if (progress < 1) requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
  }, [isVisible, target, duration]);
  
  return { ref, count };
}
```

### 10.8.7 Button Interaction Animation

```css
.btn-interactive {
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-interactive:hover {
  transform: translateY(-1px);
  /* shadow applied via Tailwind variant class */
}
.btn-interactive:active {
  transform: translate(2px, 2px);
  transition-duration: 50ms; /* snappy press */
}
```

### 10.8.8 Card Hover Animation (Signature)

```css
.card-h4e {
  position: relative;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.card-h4e::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-cta);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 200ms ease-out;
}
.card-h4e:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px -4px rgba(0,0,0,0.12);
}
.card-h4e:hover::after {
  transform: scaleX(1);
}
```

### 10.8.9 Icon Hover Pattern (Hub4Estate Signature)

When a card is hovered, its icon transitions from a subtle state to a bold amber state:

```css
.icon-h4e {
  transition: all 200ms ease;
  background: rgba(245, 158, 11, 0.05); /* amber-50 equivalent */
  color: var(--color-primary-500);
  padding: 8px;
  border-radius: 8px;
}
.group:hover .icon-h4e {
  background: var(--color-cta); /* amber-600 */
  color: white;
}
```

### 10.8.10 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .skeleton {
    animation: none;
    opacity: 0.7;
  }
}
```

This is enforced globally. No exceptions. Users who configure reduced motion in their OS get instant state changes with zero animation.

---

## 10.9 Layout Components

### 10.9.1 PublicLayout (Marketing/Landing Pages)

Used for: Homepage, pricing page, about page, login/register, catalog browsing (unauthenticated).

```
+-------------------------------------------------------+
| Announcement Bar (optional)                            |
| "Save up to 40% on electricals — Join free"  [X close] |
+-------------------------------------------------------+
| HEADER (sticky, bg-white, border-b, shadow-soft)       |
|  Logo     Nav Links              [Login] [Get Started] |
|           Products  How It Works  Pricing              |
+-------------------------------------------------------+
|                                                         |
|  PAGE CONTENT                                           |
|  (full-width sections, alternating bg-white/bg-warm-   |
|   white, max-w-7xl content within)                      |
|                                                         |
+-------------------------------------------------------+
| FOOTER (4-column, bg-cream, border-t)                   |
|  Col1: Logo + tagline + social icons                    |
|  Col2: Product (Features, Pricing, Categories)          |
|  Col3: Company (About, Careers, Contact, Blog)          |
|  Col4: Legal (Terms, Privacy, Refund)                   |
|  Bottom: (c) 2026 Hub4Estate | Language switcher        |
+-------------------------------------------------------+
| AI Widget (floating, bottom-right)                      |
+-------------------------------------------------------+
```

**Header behavior:**
- Sticky on scroll (`position: sticky; top: 0; z-index: 50`)
- Background transitions from transparent to `bg-white/95 backdrop-blur-md` after 100px scroll
- Mobile: hamburger menu (24px, Lucide `Menu`), opens full-screen overlay with nav items + auth buttons
- Language switcher: `EN | HI` toggle (right side of header on desktop, bottom of mobile menu)

### 10.9.2 UserLayout (Buyer Dashboard)

Used for: All authenticated buyer pages.

```
+--------------------------------------------------+
| HEADER (sticky, h-14, bg-white, border-b)         |
|  [Menu] Logo       Search Bar       [Bell] [User] |
+--------------------------------------------------+
| SIDEBAR (240px, bg-cream)  |  MAIN CONTENT        |
|                            |                       |
| Home                       |  Page content here    |
| --- section: Requests ---  |  (max-w-5xl, px-6)   |
| + New Request (amber bg)   |                       |
| My Requests                |                       |
| --- section: Tools ---     |                       |
| Spark AI                   |                       |
| Browse Products            |                       |
| Messages                   |                       |
| --- section: Resources --- |                       |
| Track Request              |                       |
| Guides                     |                       |
| Community                  |                       |
|                            |                       |
| --- bottom ---             |                       |
| User name                  |                       |
| Logout                     |                       |
+--------------------------------------------------+
| AI Widget (floating)                              |
+--------------------------------------------------+
```

**Sidebar behavior:**
- Desktop (>1024px): always visible, 240px width
- Tablet (768-1024px): collapsible, icon-only (56px) by default, expand on hover or click
- Mobile (<768px): hidden by default, slides in from left as overlay on hamburger click

**Active state:** `bg-white border-l-3 border-amber-600 text-primary-900 font-semibold`

**"New Request" button:** Highlighted with `bg-amber-50 text-amber-800 border border-amber-200` -- stands out from other nav items.

### 10.9.3 DealerLayout

```
+--------------------------------------------------+
| HEADER (sticky, h-14, bg-white, border-b)         |
|  [Menu] Logo   "Dealer Portal"   [Bell] [Profile] |
+--------------------------------------------------+
| SIDEBAR (240px, bg-primary-950) | MAIN CONTENT    |
| (dark sidebar for dealers to    |                  |
|  visually distinguish from user |                  |
|  layout -- this is the ONLY     |                  |
|  dark element in the entire     |                  |
|  platform)                      |                  |
|                                 |                  |
| Dashboard                       |                  |
| Inquiries (with count badge)    |                  |
| RFQs                           |                  |
| My Quotes                      |                  |
| Messages                       |                  |
| Profile                        |                  |
|                                 |                  |
| --- bottom ---                  |                  |
| Tier badge (Bronze/Silver/etc)  |                  |
| Dealer name                     |                  |
| Logout                          |                  |
+--------------------------------------------------+
| AI Widget (floating)                              |
+--------------------------------------------------+
```

**Note on dark sidebar:** The dealer sidebar uses `bg-primary-950` (#2a2418) -- this is the ONE exception to the "no dark backgrounds" rule because it provides clear visual separation between buyer and dealer interfaces. It uses warm dark brown (not cold black or grey). Text: `text-primary-300` (inactive), `text-white` (active). Active indicator: `bg-white/10` background.

### 10.9.4 AdminLayout

```
+--------------------------------------------------+
| HEADER (sticky, h-14, bg-white, border-b)         |
|  [Menu] Logo   "Admin"   [Alerts] [Search] [User] |
+--------------------------------------------------+
| SIDEBAR (260px, bg-white, border-r) | MAIN        |
|                                     |              |
| Dashboard                           | Page content |
| --- Operations ---                  | (full width) |
| Dealers (badge: pending count)      |              |
| Professionals                       |              |
| Leads                              |              |
| Inquiries                          |              |
| Brand Dealers                      |              |
| RFQs                              |              |
| --- Insights ---                   |              |
| AI Chats                          |              |
| CRM                               |              |
| Analytics                         |              |
| Fraud Flags (badge: count, red)   |              |
| --- Catalog ---                    |              |
| Categories                        |              |
| Products                          |              |
| Brands                           |              |
| --- System ---                    |              |
| Settings                         |              |
| Database                         |              |
| Feature Flags                    |              |
+--------------------------------------------------+
```

**Pending badges:** Red dot or count badge next to nav items that have pending actions:
- Dealers: `pendingDealers` count
- Fraud Flags: `openFraudFlags` count (red badge)
- RFQs: `pendingRFQs` count

### 10.9.5 ProfessionalLayout (Architects, Contractors)

```
+--------------------------------------------------+
| HEADER (sticky, h-14, bg-white, border-b)         |
|  [Menu] Logo   Pro Badge    [Bell] [Profile]      |
+--------------------------------------------------+
| SIDEBAR (240px, bg-cream)  |  MAIN CONTENT        |
|                            |                       |
| Overview                   |  Page content         |
| --- Work ---               |                       |
| My Projects                |                       |
| Inquiries                  |                       |
| Saved Products             |                       |
| --- Profile ---            |                       |
| Portfolio                  |                       |
| Certifications             |                       |
| Reviews                    |                       |
| Settings                   |                       |
+--------------------------------------------------+
| AI Widget (floating)                              |
+--------------------------------------------------+
```

### 10.9.6 Mobile Bottom Navigation

On mobile (<768px), authenticated layouts show a bottom tab bar instead of sidebar:

```
+---------------------------------------------+
| [Home] [Requests] [+New] [Messages] [More]  |
+---------------------------------------------+
```

- Height: 56px + safe area bottom inset
- Background: `bg-white`, `border-t border-primary-200`
- Active icon: `text-amber-600`
- Inactive icon: `text-primary-400`
- "+New" center button: `bg-amber-600 text-white`, elevated circle (48px), `-translate-y-4`
- Labels: 10px below icons, `text-[10px] font-medium`
- `position: fixed; bottom: 0; z-index: 40;`

Page content gets `pb-20` (80px) on mobile to prevent bottom nav overlap.

---

## 10.10 Accessibility (WCAG 2.1 AA)

This section directly addresses CRIT-12 from the audit. Every requirement is mandatory.

### 10.10.1 Color & Contrast

- All text on all backgrounds meets 4.5:1 ratio (normal text) or 3:1 (large text: 18px+ bold, 24px+ regular)
- Contrast ratios verified per 10.2.7 table
- Color is NEVER the only means of conveying information (e.g., error states use icon + text + border color, not just red text)
- Focus indicators are visible against all backgrounds: `2px solid primary-950` with `2px offset`

### 10.10.2 Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus forward through interactive elements |
| `Shift + Tab` | Move focus backward |
| `Enter` | Activate buttons, links, select dropdown items |
| `Space` | Activate buttons, toggle checkboxes, toggle switches |
| `Escape` | Close modals, dropdowns, popovers, tooltips |
| `Arrow Up/Down` | Navigate within dropdowns, select options, tab lists (vertical) |
| `Arrow Left/Right` | Navigate tab lists (horizontal), adjust sliders |
| `Home / End` | Jump to first/last item in lists, sliders |

**Focus management rules:**
1. Focus is NEVER invisible. `outline: 2px solid var(--color-primary-950); outline-offset: 2px;` on ALL interactive elements on `:focus-visible`.
2. `:focus` (not just `:focus-visible`) MUST have a visible indicator for keyboard users on older browsers.
3. No `outline: none` without a visible replacement.
4. Custom cursor (`* { cursor: none }`) is REMOVED (was CRIT-12). Cursor behavior is left to the OS. Custom cursors MAY be added ONLY behind `@media (pointer: fine)` and ONLY as a non-essential enhancement, never removing the native cursor.

### 10.10.3 Screen Reader Support

**Semantic HTML (mandatory):**

```html
<body>
  <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amber-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md">
    Skip to main content
  </a>
  <header role="banner">...</header>
  <nav aria-label="Main navigation">...</nav>
  <aside aria-label="Sidebar navigation">...</aside>
  <main id="main" role="main">
    <section aria-labelledby="section-heading-1">
      <h2 id="section-heading-1">...</h2>
      ...
    </section>
  </main>
  <footer role="contentinfo">...</footer>
</body>
```

**ARIA requirements per component:**

| Component | Required ARIA |
|-----------|--------------|
| Icon-only button | `aria-label="descriptive action"` (e.g., `aria-label="Close dialog"`) |
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap |
| Tab list | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls` |
| Dropdown | `role="menu"`, `role="menuitem"`, `aria-expanded`, `aria-haspopup` |
| Toast/Alert | `role="alert"` (error/warning) or `role="status"` (success/info) |
| Loading | `aria-busy="true"` on loading container, `aria-live="polite"` on status text |
| Form error | `aria-invalid="true"` on input, `aria-describedby` pointing to error message `<span>` |
| Progress | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Breadcrumb | `nav` with `aria-label="Breadcrumb"`, `aria-current="page"` on current item |
| Live regions | `aria-live="polite"` for non-urgent updates, `aria-live="assertive"` for critical alerts |
| Images | `alt` text on all `<img>`. Decorative images: `alt=""` + `aria-hidden="true"`. Product images: descriptive alt. |

### 10.10.4 Form Accessibility

```html
<!-- Every input follows this pattern -->
<div class="space-y-1.5">
  <label for="email" class="text-sm font-semibold text-primary-800">
    Email address <span class="text-error-500" aria-hidden="true">*</span>
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError ? "true" : undefined}
    aria-describedby={hasError ? "email-error" : "email-help"}
    autocomplete="email"
    class="..."
  />
  {hasError ? (
    <span id="email-error" class="text-xs text-error-600 flex items-center gap-1" role="alert">
      <AlertCircle class="w-3 h-3" />
      Please enter a valid email address
    </span>
  ) : (
    <span id="email-help" class="text-xs text-primary-400">
      We'll send quote notifications to this address
    </span>
  )}
</div>
```

### 10.10.5 Focus Trap (Modals, Drawers, Bottom Sheets)

```typescript
// packages/web/src/hooks/useFocusTrap.ts

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = containerRef.current.querySelectorAll(focusableSelector);
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element on open
    firstElement?.focus();
    
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
  
  return containerRef;
}
```

### 10.10.6 Testing Requirements

| Test Type | Tool | Frequency |
|-----------|------|-----------|
| Automated audit | axe-core (via @axe-core/react in dev) | Every build (CI) |
| Color contrast | axe-core + manual spot checks | Every new component |
| Keyboard navigation | Manual testing | Every new page/flow |
| Screen reader | VoiceOver (macOS), NVDA (Windows) | Every release |
| Focus order | Manual tab-through | Every new page/flow |
| Zoom | Browser 200% zoom test | Every release |

---

## 10.11 Responsive Strategy

### 10.11.1 Breakpoints

| Breakpoint | Width | Tailwind Prefix | Target Devices |
|-----------|-------|----------------|---------------|
| Base | 0-639px | (none) | All phones: iPhone SE (375px), iPhone 14 (390px), Samsung Galaxy (360px) |
| `sm` | 640-767px | `sm:` | Large phones in landscape, small tablets |
| `md` | 768-1023px | `md:` | iPad Mini (768px), iPad Air (820px) |
| `lg` | 1024-1279px | `lg:` | iPad Pro (1024px), small laptops |
| `xl` | 1280-1535px | `xl:` | Standard laptops and desktops |
| `2xl` | 1536px+ | `2xl:` | Large monitors |

**Starting canvas: 360px (Samsung Galaxy S series).** If it works on 360px, it works everywhere.

### 10.11.2 Mobile Patterns (<640px)

| Pattern | Desktop | Mobile |
|---------|---------|--------|
| Navigation | Sidebar | Bottom tab bar (fixed) |
| Tables | Standard table | Card list (each row = card) |
| Modals | Centered dialog | Bottom sheet (slide up from bottom) |
| CTAs | Inline in content | Bottom-sticky bar (`position: fixed; bottom: 56px;` -- above tab bar) |
| Multi-column grid | 3-4 columns | 1 column (stacked) |
| Search | Search bar in header | Full-screen search overlay on tap |
| Filters | Sidebar panel | Bottom sheet filter panel |
| Product images | Gallery with thumbnails | Swipeable full-width carousel |
| Stats | 4-col grid | 2-col grid |
| Tabs | Horizontal, all visible | Horizontal scroll with fade-out edges |
| Form sections | Side-by-side | Stacked vertically |
| Long dropdowns | Standard dropdown | Full-screen select sheet |
| Date picker | Calendar popup | Native `<input type="date">` on iOS/Android |

### 10.11.3 Tablet Patterns (640-1024px)

- Sidebar: collapsed (icons only, 56px), expand on hover/click
- Grid layouts: 2 columns (instead of 3-4 on desktop)
- Modals: centered dialogs (not bottom sheets)
- Touch targets: 44px minimum (same as mobile)

### 10.11.4 Desktop Patterns (>1024px)

- Full sidebar (240px+)
- Hover effects active (shadow-brutal, translate-y, card hover line)
- Custom cursor allowed (ONLY behind `@media (pointer: fine)`, ONLY as enhancement)
- Keyboard shortcuts enabled (? for help, / for search, n for new inquiry)
- Tooltips show on hover (300ms delay)

### 10.11.5 Safe Area Handling (Notch Devices)

```css
/* Bottom navigation avoids notch/home indicator */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* Modals/bottom sheets respect safe areas */
.bottom-sheet {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}

/* Content doesn't hide behind notch */
body {
  padding-top: env(safe-area-inset-top, 0px);
}
```

---

## 10.12 Brand Signature Patterns

These are the unique visual patterns that make Hub4Estate recognizable. Apply them consistently.

### 10.12.1 Icon Hover Transition

When a card or list item is hovered, its icon transitions from muted to bold amber:

```html
<div class="group cursor-pointer">
  <div class="p-2 rounded-lg bg-amber-50 text-primary-500 transition-all duration-200 group-hover:bg-amber-500 group-hover:text-white">
    <Zap class="w-5 h-5" />
  </div>
</div>
```

### 10.12.2 Card Hover (Amber Bottom Line)

```html
<div class="relative border-2 border-primary-200 rounded-xl bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg group">
  <!-- Card content -->
  <div class="absolute bottom-0 left-0 right-0 h-[3px] bg-amber-600 rounded-b-xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
</div>
```

### 10.12.3 Section Divider

Use `<ElectricWireDivider />` between major sections on marketing pages. On app pages, use standard `border-t border-primary-100`.

### 10.12.4 Category Tiles (Blueprint Grid)

Category browsing tiles use a subtle blueprint grid background:

```css
.blueprint-bg {
  background-color: #faf9f7;
  background-image: 
    linear-gradient(rgba(156, 142, 120, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(156, 142, 120, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### 10.12.5 Custom CSS Classes

```css
/* Primary CTA button with glow */
.btn-primary-glow {
  @apply bg-amber-600 text-white font-semibold border-2 border-primary-950 
         hover:bg-amber-700 hover:shadow-brutal hover:-translate-y-0.5
         active:bg-amber-800 active:shadow-brutal-sm active:translate-x-0.5 active:translate-y-0.5;
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.2);
}
.btn-primary-glow:hover {
  box-shadow: 0 0 60px rgba(245, 158, 11, 0.35), 4px 4px 0 rgba(0,0,0,1);
}

/* Gradient text (for marketing headings) */
.gradient-text-warm {
  background: linear-gradient(135deg, #d3815e 0%, #D97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Blueprint dark variant (for full-bleed sections) */
.blueprint-bg-dark {
  background-color: #f5f3ef;
  background-image: 
    linear-gradient(rgba(156, 142, 120, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(156, 142, 120, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* 3D card effect */
.card-3d {
  perspective: 1000px;
  transform-style: preserve-3d;
}
.card-3d:hover {
  transform: translateY(-4px) rotateX(2deg) rotateY(-1deg);
}

/* Stat number with counter animation */
.stat-counter {
  @apply font-mono font-black text-primary-950;
  font-variant-numeric: tabular-nums;
}

/* Noise texture overlay (subtle grain for sections) */
.noise-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,...") repeat; /* noise SVG from tailwind config */
  opacity: 0.03;
  pointer-events: none;
}
```

### 10.12.6 Page Background Rhythm

Marketing pages alternate section backgrounds for visual rhythm:

```
Section 1 (Hero):       bg-white
Section 2 (Features):   bg-warm-white (#faf9f7)
Section 3 (How It):     bg-white
Section 4 (Deals):      bg-cream (#f5f3ef)
Section 5 (Savings):    bg-white
Section 6 (CTA):        bg-warm-white + blueprint grid
Footer:                  bg-cream
```

App pages use `bg-warm-white` for the main content area with `bg-white` cards on top.

---

## 10.13 Iconography

### 10.13.1 Icon Library

**Primary:** Lucide React (lucide-react) -- 100% of icons. Zero custom SVGs except ElectricWireDivider and brand logo.

**Why Lucide:** Open source, MIT license, consistent 24px grid, 2px stroke width, designed for UI, tree-shakeable (only imported icons ship to client).

### 10.13.2 Icon Sizing

| Size Token | Pixel | Tailwind | Usage |
|-----------|-------|----------|-------|
| `icon-xs` | 12px | `w-3 h-3` | Inline with caption text, breadcrumb separators |
| `icon-sm` | 14px | `w-3.5 h-3.5` | Inline with body-sm text, badge icons |
| `icon-md` | 16px | `w-4 h-4` | Default: nav items, button icons, form icons |
| `icon-lg` | 20px | `w-5 h-5` | Card icons, section headers |
| `icon-xl` | 24px | `w-6 h-6` | Feature icons, hero section icons |
| `icon-2xl` | 32px | `w-8 h-8` | Empty state illustrations, large feature icons |
| `icon-3xl` | 48px | `w-12 h-12` | Page-level empty states, error states |

### 10.13.3 Icon Color Rules

| Context | Color | Tailwind |
|---------|-------|----------|
| In body text | `primary-500` | `text-primary-500` |
| In headings | `primary-800` | `text-primary-800` |
| Active nav item | `amber-600` (or white on dark sidebar) | `text-amber-600` |
| Inactive nav item | `primary-400` | `text-primary-400` |
| Semantic: success | `success` | `text-success-500` |
| Semantic: error | `error` | `text-error-500` |
| Semantic: warning | `warning` | `text-warning-500` |
| Icon-only button (default) | `primary-600` | `text-primary-600` |
| Icon-only button (hover) | `primary-900` | `hover:text-primary-900` |

---

## 10.14 Page-Specific Design Specifications

### 10.14.1 404 Page

```
+--------------------------------------------------+
| PublicLayout header                               |
+--------------------------------------------------+
|                                                    |
|  [center, py-24]                                   |
|                                                    |
|  Illustration: Unplugged electrical plug (SVG)     |
|  (120px x 120px, amber-500 accent color)           |
|                                                    |
|  "404"                                             |
|  font-mono, text-8xl, font-black, primary-200      |
|                                                    |
|  "Page not found"                                  |
|  heading-xl, primary-900                           |
|                                                    |
|  "The page you're looking for doesn't exist        |
|   or has been moved."                              |
|  body-md, primary-500, max-w-md                    |
|                                                    |
|  [Go Home] (primary button, lg)                    |
|  [Search Products] (ghost button)                  |
|                                                    |
+--------------------------------------------------+
| PublicLayout footer                               |
+--------------------------------------------------+
```

### 10.14.2 500 Error Page

Same layout as 404, but:
- Illustration: Broken circuit / sparking wire
- Title: "Something went wrong"
- Subtitle: "Our team has been notified. Please try again in a moment."
- Buttons: [Try Again] (primary) + [Go Home] (ghost)
- Auto-reports to Sentry

### 10.14.3 Offline Page (Mobile App / PWA)

- Illustration: Wi-Fi icon with X
- Title: "You're offline"
- Subtitle: "Check your internet connection and try again."
- Button: [Retry] (primary)
- Cached content (if available) shown below with "Last updated: X minutes ago" label

---

*This design system is the single source of truth for every pixel rendered by Hub4Estate. Any component, page, or feature not covered here must be designed following the principles, tokens, and patterns defined above. When in doubt: warm, bright, neobrutalist, accessible, mobile-first.*

*[CONTINUES IN NEXT SECTION -- Resume at &sect;11 Database Schema]*
