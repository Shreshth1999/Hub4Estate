import * as Sentry from '@sentry/node';
import { env } from './env';

export function initSentry() {
  if (!env.SENTRY_DSN) {
    console.log('[Sentry] DSN not configured — error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // PII scrubbing — remove user emails and phone numbers
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      // Scrub phone numbers from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(b => ({
          ...b,
          message: b.message?.replace(/(\+91|0)?\d{10}/g, '[REDACTED_PHONE]'),
        }));
      }
      return event;
    },
    ignoreErrors: [
      'Not allowed by CORS',
      'jwt expired',
      'invalid token',
    ],
  });
}

export { Sentry };
