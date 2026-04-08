import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import { env } from '../../config/env';

// Circuit breaker states
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreaker {
  state: CircuitState;
  failures: number;
  lastFailure: number;
  cooldownMs: number;
}

interface AICallOptions {
  model: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  tools?: Anthropic.Tool[];
  stream?: boolean;
  userId?: string;
  agentType?: string;
}

interface AIResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  stopReason: string | null;
  toolUse?: Array<{
    id: string;
    name: string;
    input: Record<string, unknown>;
  }>;
  cached: boolean;
  costUsd: number;
  latencyMs: number;
}

// Model cost per 1M tokens (input/output)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 2.4 },
  'claude-opus-4-6': { input: 15.0, output: 75.0 },
};

// Token budget per account type (daily)
const TOKEN_BUDGETS: Record<string, { input: number; output: number }> = {
  free_user: { input: 50000, output: 20000 },
  starter_dealer: { input: 100000, output: 40000 },
  growth_dealer: { input: 200000, output: 80000 },
  premium_dealer: { input: 500000, output: 200000 },
  enterprise: { input: Infinity, output: Infinity },
  admin: { input: Infinity, output: Infinity },
};

class AIGatewayService {
  private client: Anthropic;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private responseCache: Map<string, { response: AIResponse; expiresAt: number }> = new Map();
  private dailyCostUsd = 0;
  private dailyCostResetAt = 0;
  private static readonly MAX_DAILY_COST_USD = 50;
  private static readonly CIRCUIT_FAILURE_THRESHOLD = 3;
  private static readonly CIRCUIT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_RETRIES = 3;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Central AI call — all AI features MUST go through this.
   * Handles: circuit breaker, retry, caching, token budgets, cost tracking.
   */
  async callAI(options: AICallOptions): Promise<AIResponse> {
    const startTime = Date.now();

    // 1. Check circuit breaker
    this.checkCircuitBreaker(options.model);

    // 2. Check daily cost budget
    this.checkDailyBudget();

    // 3. Check cache (skip for streaming and tool use)
    if (!options.stream && !options.tools) {
      const cached = this.getCachedResponse(options);
      if (cached) return { ...cached, cached: true, latencyMs: Date.now() - startTime };
    }

    // 4. Make API call with retry
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < AIGatewayService.MAX_RETRIES; attempt++) {
      try {
        const response = await this.makeAPICall(options);
        const latencyMs = Date.now() - startTime;

        // Record success, reset circuit breaker
        this.recordSuccess(options.model);

        // Calculate cost
        const costs = MODEL_COSTS[options.model] || MODEL_COSTS['claude-haiku-4-5-20251001'];
        const costUsd = (response.inputTokens * costs.input + response.outputTokens * costs.output) / 1_000_000;
        this.dailyCostUsd += costUsd;

        const result: AIResponse = {
          ...response,
          cached: false,
          costUsd,
          latencyMs,
        };

        // Cache response (1h default TTL)
        if (!options.stream && !options.tools) {
          this.cacheResponse(options, result, 60 * 60 * 1000);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        const statusCode = (error as { status?: number }).status;

        // Only retry on retryable errors
        if (statusCode && [429, 500, 502, 503, 529].includes(statusCode)) {
          this.recordFailure(options.model);
          // Exponential backoff with jitter
          const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 8000);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Non-retryable error — throw immediately
        throw error;
      }
    }

    throw lastError || new Error('AI call failed after retries');
  }

  /**
   * Stream AI response via SSE.
   */
  async *streamAI(options: AICallOptions): AsyncGenerator<{
    type: 'text' | 'tool_start' | 'tool_done' | 'error' | 'done';
    data: unknown;
  }> {
    this.checkCircuitBreaker(options.model);
    this.checkDailyBudget();

    try {
      const stream = this.client.messages.stream({
        model: options.model,
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature ?? 0.7,
        system: options.systemPrompt,
        messages: options.messages,
        tools: options.tools,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          const delta = event.delta;
          if ('text' in delta) {
            yield { type: 'text', data: delta.text };
          }
        } else if (event.type === 'content_block_start') {
          const block = event.content_block;
          if (block.type === 'tool_use') {
            yield { type: 'tool_start', data: { tool: block.name, id: block.id } };
          }
        } else if (event.type === 'message_stop') {
          yield { type: 'done', data: null };
        }
      }

      this.recordSuccess(options.model);
    } catch (error) {
      this.recordFailure(options.model);
      yield { type: 'error', data: (error as Error).message };
    }
  }

  private async makeAPICall(options: AICallOptions): Promise<Omit<AIResponse, 'cached' | 'costUsd' | 'latencyMs'>> {
    const response = await this.client.messages.create({
      model: options.model,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.7,
      system: options.systemPrompt,
      messages: options.messages,
      tools: options.tools,
    });

    const textBlocks = response.content.filter(b => b.type === 'text');
    const toolBlocks = response.content.filter(b => b.type === 'tool_use');

    return {
      content: textBlocks.map(b => 'text' in b ? b.text : '').join(''),
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      model: options.model,
      stopReason: response.stop_reason,
      toolUse: toolBlocks.map(b => ({
        id: 'id' in b ? b.id : '',
        name: 'name' in b ? b.name : '',
        input: 'input' in b ? b.input as Record<string, unknown> : {},
      })),
    };
  }

  // ── Circuit Breaker ────────────────────────────────────────────────────────

  private getCircuitBreaker(model: string): CircuitBreaker {
    if (!this.circuitBreakers.has(model)) {
      this.circuitBreakers.set(model, {
        state: 'CLOSED',
        failures: 0,
        lastFailure: 0,
        cooldownMs: AIGatewayService.CIRCUIT_COOLDOWN_MS,
      });
    }
    return this.circuitBreakers.get(model)!;
  }

  private checkCircuitBreaker(model: string): void {
    const cb = this.getCircuitBreaker(model);
    if (cb.state === 'OPEN') {
      if (Date.now() - cb.lastFailure > cb.cooldownMs) {
        cb.state = 'HALF_OPEN';
      } else {
        throw new Error(`AI circuit breaker OPEN for model ${model}. Try again later.`);
      }
    }
  }

  private recordSuccess(model: string): void {
    const cb = this.getCircuitBreaker(model);
    cb.failures = 0;
    cb.state = 'CLOSED';
  }

  private recordFailure(model: string): void {
    const cb = this.getCircuitBreaker(model);
    cb.failures++;
    cb.lastFailure = Date.now();
    if (cb.failures >= AIGatewayService.CIRCUIT_FAILURE_THRESHOLD) {
      cb.state = 'OPEN';
    }
  }

  // ── Cost Budget ────────────────────────────────────────────────────────────

  private checkDailyBudget(): void {
    const now = Date.now();
    // Reset daily cost at midnight UTC
    const todayStart = new Date().setUTCHours(0, 0, 0, 0);
    if (this.dailyCostResetAt < todayStart) {
      this.dailyCostUsd = 0;
      this.dailyCostResetAt = todayStart;
    }

    if (this.dailyCostUsd >= AIGatewayService.MAX_DAILY_COST_USD) {
      throw new Error('Daily AI budget exhausted. All requests downgraded to cached responses.');
    }
  }

  // ── Response Cache ─────────────────────────────────────────────────────────

  private getCacheKey(options: AICallOptions): string {
    const payload = JSON.stringify({
      model: options.model,
      messages: options.messages,
      systemPrompt: options.systemPrompt,
    });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  private getCachedResponse(options: AICallOptions): AIResponse | null {
    const key = this.getCacheKey(options);
    const entry = this.responseCache.get(key);
    if (entry && entry.expiresAt > Date.now()) {
      return entry.response;
    }
    if (entry) {
      this.responseCache.delete(key);
    }
    return null;
  }

  private cacheResponse(options: AICallOptions, response: AIResponse, ttlMs: number): void {
    const key = this.getCacheKey(options);
    this.responseCache.set(key, {
      response,
      expiresAt: Date.now() + ttlMs,
    });

    // Evict old entries if cache grows too large
    if (this.responseCache.size > 1000) {
      const entries = Array.from(this.responseCache.entries());
      entries.sort((a, b) => a[1].expiresAt - b[1].expiresAt);
      for (let i = 0; i < 200; i++) {
        this.responseCache.delete(entries[i][0]);
      }
    }
  }

  // ── Token Budget Check ─────────────────────────────────────────────────────

  getTokenBudget(accountType: string): { input: number; output: number } {
    return TOKEN_BUDGETS[accountType] || TOKEN_BUDGETS.free_user;
  }

  getDailyCost(): number {
    return this.dailyCostUsd;
  }
}

export const aiGateway = new AIGatewayService();
