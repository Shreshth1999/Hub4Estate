/**
 * Hub4Estate — k6 Quick Check (2 minutes)
 *
 * Fast sanity test — run before and after optimizations to compare.
 * Run: k6 run load-tests/quick-check.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const categoryDuration = new Trend('category_duration', true);
const brandDuration = new Trend('brand_duration', true);
const searchDuration = new Trend('search_duration', true);

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    errors: ['rate<0.05'],
  },
};

export default function () {
  // Categories
  let res = http.get(`${BASE_URL}/api/products/categories`, { timeout: '10s' });
  check(res, { 'categories 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  categoryDuration.add(res.timings.duration);

  // Brands
  res = http.get(`${BASE_URL}/api/products/brands/list`, { timeout: '10s' });
  check(res, { 'brands 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  brandDuration.add(res.timings.duration);

  // Search
  const terms = ['havells', 'mcb', 'wire', 'led', 'switch'];
  const q = terms[Math.floor(Math.random() * terms.length)];
  res = http.get(`${BASE_URL}/api/products/search/query?q=${q}`, { timeout: '10s' });
  check(res, { 'search 200': (r) => r.status === 200 });
  errorRate.add(res.status !== 200);
  searchDuration.add(res.timings.duration);

  sleep(1);
}
