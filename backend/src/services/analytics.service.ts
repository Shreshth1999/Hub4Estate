import { env } from '../config/env';
import { logger } from '../lib/logger';

interface AnalyticsEvent {
  event: string;
  distinctId: string;
  properties?: Record<string, unknown>;
}

class AnalyticsService {
  private apiKey: string | undefined;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.apiKey = env.POSTHOG_API_KEY;
    if (this.apiKey) {
      // Batch flush every 30 seconds
      this.flushInterval = setInterval(() => this.flush(), 30_000);
      logger.info('analytics_init', { provider: 'posthog' });
    }
  }

  track(event: string, distinctId: string, properties?: Record<string, unknown>) {
    if (!this.apiKey) return;
    this.queue.push({ event, distinctId, properties: { ...properties, timestamp: new Date().toISOString() } });
    // Auto-flush if queue gets large
    if (this.queue.length >= 50) this.flush();
  }

  // Track key business events
  trackInquirySubmitted(userId: string, category?: string, city?: string) {
    this.track('inquiry_submitted', userId, { category, city });
  }

  trackQuoteReceived(inquiryId: string, dealerId: string, amount?: number) {
    this.track('quote_received', inquiryId, { dealerId, amount });
  }

  trackQuoteSelected(userId: string, quoteId: string, savings?: number) {
    this.track('quote_selected', userId, { quoteId, savings });
  }

  trackDealerOnboarded(dealerId: string, city?: string) {
    this.track('dealer_onboarded', dealerId, { city });
  }

  trackPaymentCompleted(userId: string, amount: number, method?: string) {
    this.track('payment_completed', userId, { amount, method });
  }

  trackSearchPerformed(userId: string, query: string, resultCount: number) {
    this.track('search_performed', userId, { query, resultCount });
  }

  trackAIChatMessage(sessionId: string, hasToolUse: boolean) {
    this.track('ai_chat_message', sessionId, { hasToolUse });
  }

  private async flush() {
    if (!this.apiKey || this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch('https://app.posthog.com/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          batch: batch.map(e => ({
            type: 'capture',
            event: e.event,
            distinct_id: e.distinctId,
            properties: e.properties,
          })),
        }),
      });

      if (!response.ok) {
        logger.warn('analytics_flush_failed', { status: response.status, count: batch.length });
      }
    } catch (err) {
      logger.warn('analytics_flush_error', { error: (err as Error).message, count: batch.length });
      // Re-queue failed events (limit to prevent memory leak)
      if (this.queue.length < 500) {
        this.queue.unshift(...batch);
      }
    }
  }

  async shutdown() {
    if (this.flushInterval) clearInterval(this.flushInterval);
    await this.flush();
  }
}

export const analytics = new AnalyticsService();
