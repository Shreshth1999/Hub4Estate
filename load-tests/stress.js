/**
 * Hub4Estate — k6 Stress Test
 *
 * Pushes the system to find the exact breaking point.
 * Ramps from 0 → 2000 VUs gradually, measuring when errors spike.
 * Run: k6 run load-tests/stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const reqDuration = new Trend('req_duration', true);
const totalReqs = new Counter('total_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Warm-up
    { duration: '3m', target: 100 },   // Hold — baseline
    { duration: '2m', target: 300 },   // Ramp
    { duration: '3m', target: 300 },   // Hold — moderate
    { duration: '2m', target: 500 },   // Ramp
    { duration: '3m', target: 500 },   // Hold — heavy
    { duration: '2m', target: 1000 },  // Ramp — stress
    { duration: '3m', target: 1000 },  // Hold — stress
    { duration: '2m', target: 2000 },  // Ramp — extreme
    { duration: '2m', target: 2000 },  // Hold — extreme (breaking point?)
    { duration: '3m', target: 0 },     // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.3'], // Allow up to 30% errors to find breaking point
    http_req_failed: ['rate<0.3'],
  },
};

const ENDPOINTS = [
  '/health',
  '/api/products/categories',
  '/api/products/brands/list',
  '/api/products/search/query?q=havells',
  '/api/products/search/query?q=mcb',
  '/api/products/search/query?q=wire',
  '/api/products/search/query?q=led',
  '/api/products/search/query?q=switch',
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  const endpoint = randomFrom(ENDPOINTS);
  const url = `${BASE_URL}${endpoint}`;

  const res = http.get(url, { timeout: '30s' });

  totalReqs.add(1);
  reqDuration.add(res.timings.duration);

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response < 5s': (r) => r.timings.duration < 5000,
  });

  errorRate.add(!success);

  // Minimal think time for stress test
  sleep(Math.random() * 0.5 + 0.2);
}
