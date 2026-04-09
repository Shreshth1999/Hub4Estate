const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
}

const eventQueue: AnalyticsEvent[] = [];

function flushEvents() {
  if (!POSTHOG_KEY || eventQueue.length === 0) return;

  const batch = [...eventQueue];
  eventQueue.length = 0;

  fetch('https://app.posthog.com/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      batch: batch.map(e => ({
        type: 'capture',
        event: e.event,
        distinct_id: 'anonymous',
        properties: { ...e.properties, $current_url: window.location.href },
      })),
    }),
  }).catch(() => {});
}

// Flush every 30 seconds
if (POSTHOG_KEY) {
  setInterval(flushEvents, 30_000);
  window.addEventListener('beforeunload', flushEvents);
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY) return;
  eventQueue.push({ event, properties: { ...properties, timestamp: new Date().toISOString() } });
  if (eventQueue.length >= 20) flushEvents();
}

export function useAnalytics() {
  return {
    trackPageView: (page: string) => trackEvent('$pageview', { page }),
    trackClick: (element: string) => trackEvent('click', { element }),
    trackSearch: (query: string) => trackEvent('search', { query }),
    trackInquiry: (product: string) => trackEvent('inquiry_started', { product }),
  };
}
