/**
 * Hub4Estate — k6 Load Test: Baseline
 *
 * Tests the platform's breaking point across all critical public endpoints.
 * Run: k6 run load-tests/baseline.js
 * With HTML report: k6 run load-tests/baseline.js --out json=results.json
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Custom Metrics ──────────────────────────────────────────────────────────

const errorRate = new Rate('errors');
const categoryDuration = new Trend('category_duration', true);
const brandDuration = new Trend('brand_duration', true);
const productTypeDuration = new Trend('product_type_duration', true);
const productDetailDuration = new Trend('product_detail_duration', true);
const searchDuration = new Trend('search_duration', true);
const healthDuration = new Trend('health_duration', true);
const totalRequests = new Counter('total_requests');

// ── Configuration ───────────────────────────────────────────────────────────

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

// Known slugs/IDs — update these after checking your DB
const CATEGORY_SLUGS = ['electrical', 'wires-cables', 'switches-sockets', 'lighting', 'switchgear'];
const PRODUCT_TYPE_SLUGS = ['mcb', 'led-panel-light', 'led-bulb', 'ceiling-fan', 'wire', 'switch', 'socket'];
const SEARCH_TERMS = ['havells', 'mcb', 'led', 'wire', 'switch', 'panel', 'polycab', 'anchor', 'fan', 'cable'];

// ── Test Stages ─────────────────────────────────────────────────────────────

export const options = {
  stages: [
    // Warm-up: ramp to 50 users over 1 min
    { duration: '1m', target: 50 },
    // Steady load: hold 50 users for 2 min
    { duration: '2m', target: 50 },
    // Ramp up: increase to 200 users over 2 min
    { duration: '2m', target: 200 },
    // Sustained load: hold 200 users for 3 min
    { duration: '3m', target: 200 },
    // Stress: push to 500 users over 2 min
    { duration: '2m', target: 500 },
    // Peak: hold 500 users for 2 min
    { duration: '2m', target: 500 },
    // Spike: push to 1000 users over 1 min
    { duration: '1m', target: 1000 },
    // Hold spike for 1 min
    { duration: '1m', target: 1000 },
    // Cool down
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95th < 2s, 99th < 5s
    errors: ['rate<0.1'], // Error rate below 10%
    http_req_failed: ['rate<0.1'],
    category_duration: ['p(95)<1000'],
    brand_duration: ['p(95)<1000'],
    product_type_duration: ['p(95)<2000'],
    search_duration: ['p(95)<3000'],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeRequest(name, url, customMetric) {
  const res = http.get(url, {
    tags: { name },
    timeout: '30s',
  });

  totalRequests.add(1);

  const success = check(res, {
    [`${name}: status 200`]: (r) => r.status === 200,
    [`${name}: response time < 5s`]: (r) => r.timings.duration < 5000,
    [`${name}: valid JSON`]: (r) => {
      try { JSON.parse(r.body); return true; } catch { return false; }
    },
  });

  errorRate.add(!success);
  if (customMetric) customMetric.add(res.timings.duration);

  return res;
}

// ── Main Test Scenario ──────────────────────────────────────────────────────

export default function () {
  // Simulate a realistic user session: browse categories → product types → search

  group('Health Check', () => {
    makeRequest('health', `${BASE_URL}/health`, healthDuration);
  });

  group('Browse Categories', () => {
    // Load all categories (every page load does this for nav)
    makeRequest('categories_list', `${BASE_URL}/api/products/categories`, categoryDuration);
    sleep(0.5);
  });

  group('Browse Brands', () => {
    makeRequest('brands_list', `${BASE_URL}/api/products/brands/list`, brandDuration);
    sleep(0.3);
  });

  group('Browse Product Type', () => {
    const slug = randomFrom(PRODUCT_TYPE_SLUGS);
    makeRequest('product_type', `${BASE_URL}/api/products/product-types/${slug}`, productTypeDuration);
    sleep(0.5);

    // Page 2
    makeRequest('product_type_p2', `${BASE_URL}/api/products/product-types/${slug}?page=2&limit=20`, productTypeDuration);
    sleep(0.3);
  });

  group('View Category Detail', () => {
    const slug = randomFrom(CATEGORY_SLUGS);
    makeRequest('category_detail', `${BASE_URL}/api/products/categories/${slug}`, categoryDuration);
    sleep(0.5);
  });

  group('Search Products', () => {
    const term = randomFrom(SEARCH_TERMS);
    makeRequest('search', `${BASE_URL}/api/products/search/query?q=${term}`, searchDuration);
    sleep(0.5);
  });

  group('View Product Detail', () => {
    // First get a product type to find real product IDs
    const slug = randomFrom(PRODUCT_TYPE_SLUGS);
    const res = http.get(`${BASE_URL}/api/products/product-types/${slug}`, { timeout: '10s' });

    if (res.status === 200) {
      try {
        const data = JSON.parse(res.body);
        if (data.products && data.products.length > 0) {
          const product = randomFrom(data.products);
          makeRequest('product_detail', `${BASE_URL}/api/products/${product.id}`, productDetailDuration);
        }
      } catch {}
    }
    sleep(0.5);
  });

  // Random think time between 1-3 seconds (simulates user reading)
  sleep(Math.random() * 2 + 1);
}

// ── Summary Output ──────────────────────────────────────────────────────────

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    totalRequests: data.metrics.total_requests ? data.metrics.total_requests.values.count : 0,
    errorRate: data.metrics.errors ? (data.metrics.errors.values.rate * 100).toFixed(2) + '%' : 'N/A',
    httpReqDuration: {
      avg: data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(0) + 'ms' : 'N/A',
      p95: data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(95)'].toFixed(0) + 'ms' : 'N/A',
      p99: data.metrics.http_req_duration ? data.metrics.http_req_duration.values['p(99)'].toFixed(0) + 'ms' : 'N/A',
    },
    endpoints: {},
  };

  const endpointMetrics = {
    categories: 'category_duration',
    brands: 'brand_duration',
    product_types: 'product_type_duration',
    product_detail: 'product_detail_duration',
    search: 'search_duration',
    health: 'health_duration',
  };

  for (const [name, metric] of Object.entries(endpointMetrics)) {
    if (data.metrics[metric]) {
      summary.endpoints[name] = {
        avg: data.metrics[metric].values.avg.toFixed(0) + 'ms',
        p95: data.metrics[metric].values['p(95)'].toFixed(0) + 'ms',
        p99: data.metrics[metric].values['p(99)'].toFixed(0) + 'ms',
        min: data.metrics[metric].values.min.toFixed(0) + 'ms',
        max: data.metrics[metric].values.max.toFixed(0) + 'ms',
      };
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('  HUB4ESTATE LOAD TEST RESULTS');
  console.log('='.repeat(60));
  console.log(JSON.stringify(summary, null, 2));
  console.log('='.repeat(60) + '\n');

  return {
    'load-tests/results/baseline-summary.json': JSON.stringify(summary, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

// k6 built-in text summary
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
