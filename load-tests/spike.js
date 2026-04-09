/**
 * Hub4Estate — k6 Spike Test
 *
 * Simulates sudden traffic spikes (e.g., going viral, product launch).
 * Tests how the system handles sudden 10x load increase.
 * Run: k6 run load-tests/spike.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const totalReqs = new Counter('total_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const options = {
  stages: [
    { duration: '1m', target: 50 },    // Normal load
    { duration: '2m', target: 50 },    // Hold normal
    { duration: '10s', target: 500 },  // SPIKE! 10x in 10 seconds
    { duration: '2m', target: 500 },   // Hold spike
    { duration: '10s', target: 50 },   // Drop back to normal
    { duration: '2m', target: 50 },    // Recovery period
    { duration: '10s', target: 1000 }, // BIGGER SPIKE!
    { duration: '1m', target: 1000 },  // Hold
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    errors: ['rate<0.5'], // Generous — we expect errors during spikes
  },
};

const PAGES = [
  () => http.get(`${BASE_URL}/api/products/categories`),
  () => http.get(`${BASE_URL}/api/products/brands/list`),
  () => http.get(`${BASE_URL}/api/products/search/query?q=havells`),
  () => http.get(`${BASE_URL}/api/products/search/query?q=mcb`),
  () => http.get(`${BASE_URL}/health`),
];

export default function () {
  const action = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = action();

  totalReqs.add(1);

  const success = check(res, {
    'status 200': (r) => r.status === 200,
    'fast enough': (r) => r.timings.duration < 10000,
  });

  errorRate.add(!success);
  sleep(Math.random() * 0.5 + 0.1);
}
