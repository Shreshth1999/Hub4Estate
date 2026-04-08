# Hub4Estate Definitive PRD v2 -- Sections 23 & 24

> **Document**: section-23-24-search-filestructure
> **Version**: 2.0.0
> **Date**: 2026-04-08
> **Author**: CTO Office, Hub4Estate
> **Status**: Authoritative Reference
> **Classification**: Internal -- Engineering
> **Prerequisite Reading**: section-05-06-techstack-database.md, section-09-10-agents-design.md

---

# SECTION 23 -- SEARCH & KNOWLEDGE GRAPH ARCHITECTURE

> *Search is the spine of Hub4Estate. A user who cannot find the right MCB in under 2 seconds abandons. A dealer who cannot surface their inventory to the right buyer loses revenue. A BOQ generator that does not know what goes with what produces garbage. Every subsystem in this section ships now. No "Phase 2" hedging.*

---

## 23.1 Search Architecture

### 23.1.1 Elasticsearch Cluster Configuration

| Parameter | Development | Staging | Production |
|-----------|-------------|---------|------------|
| Version | 8.12.2 | 8.12.2 | 8.12.2 |
| Cluster Name | `h4e-dev` | `h4e-staging` | `h4e-prod` |
| Master Nodes | 1 (combined) | 1 (combined) | 1 (dedicated) |
| Data Nodes | 1 (combined) | 1 (combined) | 2 (dedicated, `r6g.large.search`) |
| Coordinating Nodes | 0 (same as data) | 0 (same as data) | 1 (dedicated, for search load balancing) |
| Hosting | Docker Compose (local) | AWS OpenSearch Serverless | AWS OpenSearch Service (managed) |
| Region | -- | ap-south-1 | ap-south-1 |
| Storage per Data Node | 10 GB (SSD) | 20 GB | 100 GB (gp3 EBS) |
| JVM Heap | 512 MB | 1 GB | 4 GB (50% of node RAM) |
| Authentication | None (local) | IAM-based | IAM + fine-grained access control |
| Encryption at Rest | No | Yes (AES-256) | Yes (AES-256, KMS-managed) |
| Encryption in Transit | No | TLS 1.3 | TLS 1.3 |
| Snapshot Schedule | None | Daily | Every 6 hours, retained 14 days |
| Access Policy | Open (localhost only) | VPC-restricted | VPC-restricted + IAM role whitelist |

**Why AWS OpenSearch over self-hosted Elasticsearch:**
- Managed upgrades, patching, and monitoring -- zero ops overhead for a team of 1-3 engineers.
- Native IAM integration with existing AWS infrastructure (EC2, VPC, S3).
- Automatic snapshots to S3 with point-in-time recovery.
- Cost: ~$150/month for production cluster at current scale (2 data nodes, 100K documents). Self-hosted on EC2 would cost the same in compute but add 10+ hours/month in maintenance.
- Lock-in risk: Minimal. OpenSearch is API-compatible with Elasticsearch 7.10+. Our queries use standard Elasticsearch DSL. Migration path: swap endpoint URL, adjust auth headers.

**Why not Algolia or Meilisearch:**
- Algolia: $0.50/1000 search requests at scale + record-based pricing. At 100K products and 50K searches/day, Algolia costs ~$750/month vs OpenSearch's ~$150/month.
- Meilisearch: No native vector search (needed for semantic search). No aggregations (needed for faceted navigation). Good for simple full-text, insufficient for our multi-signal search.
- Typesense: Similar to Meilisearch constraints. No dense_vector field type. No scripted scoring.

### 23.1.2 Index Architecture

Hub4Estate maintains **5 discrete indices** in Elasticsearch. Each index has its own mapping, settings, and lifecycle policy. No shared indices -- this allows independent scaling, tuning, and reindexing.

| Index Name | Purpose | Estimated Document Count (Year 1) | Shards | Replicas | Refresh Interval |
|------------|---------|-----------------------------------|--------|----------|-------------------|
| `h4e_products` | Product catalog search, faceting, autocomplete | 50,000-100,000 | 2 | 1 | 5s |
| `h4e_dealers` | Dealer discovery by city, brand, category, rating | 1,000-5,000 | 1 | 1 | 30s |
| `h4e_inquiries` | Search past inquiries (admin + analytics) | 10,000-50,000 | 1 | 1 | 30s |
| `h4e_community` | Community post full-text search | 5,000-20,000 | 1 | 1 | 60s |
| `h4e_knowledge` | Knowledge base article search | 500-2,000 | 1 | 0 | 300s |

**Shard sizing rationale:**
- Target: 10-50 GB per shard for optimal performance. At 100K products with rich mappings, each document averages ~2 KB. Total: ~200 MB. Two shards give us headroom to 50 GB (25M products) without re-sharding.
- Single-shard indices (`h4e_dealers`, `h4e_inquiries`, `h4e_community`, `h4e_knowledge`) stay under 1 GB for the foreseeable future. One shard avoids the overhead of shard coordination.
- Replicas: 1 for production indices that serve user-facing search (products, dealers). 0 for knowledge base (low traffic, can tolerate brief unavailability during node restart).

### 23.1.3 Product Index -- Complete Settings

```json
{
  "settings": {
    "index": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "5s",
      "max_result_window": 10000,
      "max_inner_result_window": 100,
      "mapping.total_fields.limit": 200,
      "highlight.max_analyzed_offset": 100000
    },
    "analysis": {
      "char_filter": {
        "special_char_filter": {
          "type": "pattern_replace",
          "pattern": "[^a-zA-Z0-9\\s\\u0900-\\u097F]",
          "replacement": " "
        },
        "model_number_filter": {
          "type": "pattern_replace",
          "pattern": "([a-zA-Z])(\\d)",
          "replacement": "$1 $2"
        }
      },
      "tokenizer": {
        "model_number_tokenizer": {
          "type": "pattern",
          "pattern": "[\\s\\-_/]+"
        }
      },
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 20,
          "preserve_original": true
        },
        "hindi_normalization": {
          "type": "icu_normalizer",
          "name": "nfc"
        },
        "hindi_stemmer": {
          "type": "stemmer",
          "language": "hindi"
        },
        "product_synonyms": {
          "type": "synonym_graph",
          "synonyms": [
            "mcb, miniature circuit breaker, circuit breaker, breaker",
            "rccb, residual current circuit breaker, earth leakage",
            "elcb, earth leakage circuit breaker",
            "mccb, moulded case circuit breaker",
            "spd, surge protection device, surge protector",
            "db, distribution board, panel board, mcb box",
            "acb, air circuit breaker",
            "led, light emitting diode",
            "cfl, compact fluorescent lamp",
            "wire, cable, conductor, wiring",
            "frls, fire retardant low smoke, fr wire",
            "hrfr, heat resistant flame retardant",
            "switch, modular switch, switchboard, switch plate",
            "socket, power socket, plug socket, outlet",
            "fan, ceiling fan, table fan, exhaust fan, pedestal fan",
            "geyser, water heater, instant geyser, storage geyser",
            "inverter, ups, power backup, home inverter",
            "stabilizer, voltage stabilizer, voltage regulator",
            "meter, energy meter, kwh meter, sub meter",
            "transformer, distribution transformer, step down",
            "capacitor, power capacitor, pf correction",
            "contactor, power contactor, magnetic contactor",
            "relay, overload relay, timer relay, protection relay",
            "starter, dol starter, star delta starter, motor starter",
            "changeover, changeover switch, transfer switch",
            "earthing, grounding, earth pit, earthing electrode",
            "conduit, pipe, pvc pipe, gi pipe, conduit pipe",
            "junction box, j box, jb, pull box",
            "cable tray, perforated tray, ladder tray",
            "busbar, bus bar, copper busbar, busbar chamber",
            "lugs, cable lugs, thimble, copper lugs, crimping lugs",
            "tape, insulation tape, pvc tape, electrical tape",
            "downlight, recessed light, cob light, spot light",
            "panel light, flat panel, surface panel, slim panel",
            "batten, tube light, linear light, t5, t8",
            "flood light, floodlight, outdoor light, halogen",
            "street light, pole light, solar street light",
            "strip, led strip, rope light, flexible strip",
            "bulb, lamp, led bulb, smart bulb",
            "dimmer, fan regulator, step regulator, electronic regulator",
            "bell, door bell, calling bell, buzzer",
            "cctv, camera, security camera, surveillance",
            "intercom, video door phone, vdp",
            "sensor, motion sensor, occupancy sensor, pir sensor",
            "timer, digital timer, analog timer, programmable timer",
            "amp, ampere, a",
            "volt, voltage, v",
            "watt, w",
            "sq mm, sqmm, square mm, square millimeter",
            "havells, havels, havels",
            "polycab, poly cab",
            "anchor, panasonic anchor, anchor panasonic",
            "legrand, le grand",
            "schneider, schneider electric, se",
            "siemens, seimens",
            "finolex, finolex cables",
            "crompton, crompton greaves, cg",
            "orient, orient electric",
            "bajaj, bajaj electricals"
          ]
        },
        "product_synonyms_search": {
          "type": "synonym_graph",
          "synonyms": [
            "3bhk, 3 bhk, three bhk, 3 bedroom",
            "2bhk, 2 bhk, two bhk, 2 bedroom",
            "1bhk, 1 bhk, one bhk, 1 bedroom",
            "flat, apartment, house, home",
            "shop, showroom, commercial, retail",
            "office, workplace, workspace",
            "factory, industrial, plant, warehouse",
            "bathroom, washroom, toilet, loo",
            "kitchen, modular kitchen, pantry",
            "bedroom, master bedroom, guest room"
          ]
        },
        "stop_words_en_hi": {
          "type": "stop",
          "stopwords": ["_english_", "ka", "ki", "ke", "ko", "se", "me", "hai", "hain", "tha", "the", "thi", "ye", "vo", "aur", "ya", "par", "bhi", "nahi"]
        }
      },
      "analyzer": {
        "product_analyzer": {
          "type": "custom",
          "char_filter": ["special_char_filter"],
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "hindi_normalization",
            "product_synonyms",
            "stop_words_en_hi",
            "edge_ngram_filter"
          ]
        },
        "product_search_analyzer": {
          "type": "custom",
          "char_filter": ["special_char_filter"],
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "hindi_normalization",
            "product_synonyms_search",
            "stop_words_en_hi"
          ]
        },
        "autocomplete_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase",
            "edge_ngram_filter"
          ]
        },
        "autocomplete_search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ]
        },
        "hindi_analyzer": {
          "type": "custom",
          "tokenizer": "icu_tokenizer",
          "filter": [
            "lowercase",
            "hindi_normalization",
            "hindi_stemmer"
          ]
        },
        "model_number_analyzer": {
          "type": "custom",
          "char_filter": ["model_number_filter"],
          "tokenizer": "model_number_tokenizer",
          "filter": [
            "lowercase"
          ]
        },
        "exact_analyzer": {
          "type": "custom",
          "tokenizer": "keyword",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  }
}
```

**Analyzer design rationale:**

| Analyzer | Index-time or Search-time | Purpose |
|----------|--------------------------|---------|
| `product_analyzer` | Index-time | Applies synonyms at index time (expands MCB into all variants), applies edge_ngram for prefix matching. Index size increases but search latency decreases. |
| `product_search_analyzer` | Search-time only | Applies use-case synonyms (3BHK, bathroom) at search time. Does NOT apply edge_ngram (would create false positives). |
| `autocomplete_analyzer` | Index-time | Edge ngrams for instant-as-you-type suggestions. Separate from product_analyzer to keep autocomplete simple and fast. |
| `autocomplete_search_analyzer` | Search-time only | No ngrams -- matches against the ngrams created at index time. |
| `hindi_analyzer` | Both | ICU tokenization for Devanagari. Handles mixed Hindi-English queries like "MCB ka price". |
| `model_number_analyzer` | Index-time | Splits model numbers like "?"QO116C10" into ["qo116c10", "qo116", "c10"] for partial match. |
| `exact_analyzer` | Both | Keyword tokenizer + lowercase. For exact-match fields where tokenization would break semantics (e.g., brand name, SKU). |

### 23.1.4 Product Index -- Complete Mapping

```json
{
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": {
        "type": "keyword",
        "doc_values": true
      },
      "name": {
        "type": "text",
        "analyzer": "product_analyzer",
        "search_analyzer": "product_search_analyzer",
        "fields": {
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "autocomplete_search_analyzer"
          },
          "keyword": {
            "type": "keyword",
            "normalizer": "lowercase"
          },
          "hindi": {
            "type": "text",
            "analyzer": "hindi_analyzer"
          },
          "exact": {
            "type": "text",
            "analyzer": "exact_analyzer"
          }
        }
      },
      "slug": {
        "type": "keyword"
      },
      "description": {
        "type": "text",
        "analyzer": "product_analyzer",
        "search_analyzer": "product_search_analyzer"
      },
      "brand": {
        "type": "keyword",
        "fields": {
          "text": {
            "type": "text",
            "analyzer": "product_analyzer",
            "search_analyzer": "product_search_analyzer"
          }
        }
      },
      "brandSlug": {
        "type": "keyword"
      },
      "brandSegment": {
        "type": "keyword"
      },
      "categoryName": {
        "type": "keyword",
        "fields": {
          "text": {
            "type": "text"
          }
        }
      },
      "categorySlug": {
        "type": "keyword"
      },
      "subCategoryName": {
        "type": "keyword",
        "fields": {
          "text": {
            "type": "text"
          }
        }
      },
      "subCategorySlug": {
        "type": "keyword"
      },
      "productTypeName": {
        "type": "keyword",
        "fields": {
          "text": {
            "type": "text"
          }
        }
      },
      "productTypeSlug": {
        "type": "keyword"
      },
      "categoryPath": {
        "type": "keyword"
      },
      "modelNumber": {
        "type": "text",
        "analyzer": "model_number_analyzer",
        "fields": {
          "keyword": {
            "type": "keyword"
          },
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "autocomplete_search_analyzer"
          }
        }
      },
      "sku": {
        "type": "keyword"
      },
      "specifications": {
        "type": "object",
        "enabled": true,
        "properties": {
          "voltage": { "type": "keyword" },
          "current_rating": { "type": "keyword" },
          "wattage": { "type": "keyword" },
          "wire_size": { "type": "keyword" },
          "material": { "type": "keyword" },
          "color": { "type": "keyword" },
          "poles": { "type": "keyword" },
          "breaking_capacity": { "type": "keyword" },
          "ip_rating": { "type": "keyword" },
          "warranty_years": { "type": "integer" },
          "isi_marked": { "type": "boolean" },
          "bis_certified": { "type": "boolean" }
        }
      },
      "specText": {
        "type": "text",
        "analyzer": "product_analyzer",
        "search_analyzer": "product_search_analyzer"
      },
      "certifications": {
        "type": "keyword"
      },
      "images": {
        "type": "keyword",
        "index": false,
        "doc_values": false
      },
      "thumbnailUrl": {
        "type": "keyword",
        "index": false,
        "doc_values": false
      },
      "mrp": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "minDealerPrice": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "maxDealerPrice": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "avgDealerPrice": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "bestPrice": {
        "type": "scaled_float",
        "scaling_factor": 100
      },
      "savingsPercent": {
        "type": "float"
      },
      "dealerCount": {
        "type": "integer"
      },
      "activeDealerCount": {
        "type": "integer"
      },
      "inquiryCount": {
        "type": "integer"
      },
      "quoteCount": {
        "type": "integer"
      },
      "avgRating": {
        "type": "float"
      },
      "reviewCount": {
        "type": "integer"
      },
      "popularityScore": {
        "type": "float"
      },
      "tags": {
        "type": "keyword"
      },
      "useCases": {
        "type": "keyword"
      },
      "compatibleProductIds": {
        "type": "keyword"
      },
      "alternativeProductIds": {
        "type": "keyword"
      },
      "frequentlyBoughtWithIds": {
        "type": "keyword"
      },
      "cityAvailability": {
        "type": "keyword"
      },
      "isActive": {
        "type": "boolean"
      },
      "isFeatured": {
        "type": "boolean"
      },
      "embedding": {
        "type": "dense_vector",
        "dims": 1536,
        "index": true,
        "similarity": "cosine",
        "index_options": {
          "type": "hnsw",
          "m": 16,
          "ef_construction": 100
        }
      },
      "createdAt": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      },
      "updatedAt": {
        "type": "date",
        "format": "strict_date_optional_time||epoch_millis"
      }
    }
  }
}
```

**Field-level design notes:**

| Field | Type Choice | Why |
|-------|-------------|-----|
| `id` | `keyword` | Exact match only. Never tokenized. Used for filtering and joins. |
| `name` | `text` (multi-field) | Primary search target. `autocomplete` sub-field for type-ahead. `keyword` for exact aggregations. `hindi` for Devanagari input. `exact` for phrase matching. |
| `brand` | `keyword` + `text` sub-field | `keyword` for faceted navigation (aggregation). `text` sub-field for fuzzy brand search ("havels" -> "havells"). |
| `categoryPath` | `keyword` | Stores full path like `electrical > protection > mcb`. Used for hierarchical faceting with `terms` aggregation. |
| `specifications` | `object` (enabled) | Structured fields allow range queries on numeric specs (e.g., current_rating >= 16A). Each spec key is explicitly mapped -- no dynamic mapping. |
| `specText` | `text` | Flattened string of all specifications for full-text search. "32A single pole MCB BIS certified" as a single searchable string. |
| `mrp`, `*Price` | `scaled_float` (factor 100) | Stores paisa internally (e.g., 58500 = Rs 585.00). Avoids floating-point rounding. scaling_factor=100 gives 2 decimal precision. |
| `popularityScore` | `float` | Pre-computed score: `0.4 * normalized_inquiry_count + 0.3 * normalized_dealer_count + 0.2 * normalized_rating + 0.1 * recency_decay`. Updated nightly. |
| `embedding` | `dense_vector` (1536 dims) | OpenAI `text-embedding-3-small` embeddings for semantic search. HNSW index with m=16, ef_construction=100 balances recall vs. memory. |
| `images`, `thumbnailUrl` | `keyword` (not indexed) | Stored but never searched. `index: false` saves disk and memory. |

### 23.1.5 Dealer Index -- Complete Mapping

```json
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s"
    },
    "analysis": {
      "analyzer": {
        "dealer_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase", "edge_ngram_filter"]
        },
        "dealer_search_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": ["lowercase"]
        }
      },
      "filter": {
        "edge_ngram_filter": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 15
        }
      }
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "businessName": {
        "type": "text",
        "analyzer": "dealer_analyzer",
        "search_analyzer": "dealer_search_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "ownerName": {
        "type": "text",
        "analyzer": "dealer_analyzer",
        "search_analyzer": "dealer_search_analyzer"
      },
      "city": { "type": "keyword" },
      "state": { "type": "keyword" },
      "pincode": { "type": "keyword" },
      "location": {
        "type": "geo_point"
      },
      "serviceAreaPincodes": { "type": "keyword" },
      "dealerType": { "type": "keyword" },
      "status": { "type": "keyword" },
      "brands": { "type": "keyword" },
      "categories": { "type": "keyword" },
      "certifications": { "type": "keyword" },
      "isPremium": { "type": "boolean" },
      "yearsInOperation": { "type": "integer" },
      "conversionRate": { "type": "float" },
      "avgResponseTimeMinutes": { "type": "integer" },
      "totalQuotesSubmitted": { "type": "integer" },
      "totalConversions": { "type": "integer" },
      "avgRating": { "type": "float" },
      "reviewCount": { "type": "integer" },
      "description": {
        "type": "text",
        "analyzer": "standard"
      },
      "shopImages": {
        "type": "keyword",
        "index": false,
        "doc_values": false
      },
      "profileComplete": { "type": "boolean" },
      "verifiedAt": { "type": "date" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

**Dealer geo-search:** The `location` field is `geo_point`, populated from the dealer's shop address via Google Maps Geocoding API during onboarding. This enables "dealers within 25 km" queries for delivery zone matching and the buyer-side dealer map view.

### 23.1.6 Inquiry Index -- Complete Mapping

```json
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "30s"
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "inquiryNumber": { "type": "keyword" },
      "name": { "type": "text" },
      "phone": { "type": "keyword" },
      "email": { "type": "keyword" },
      "modelNumber": {
        "type": "text",
        "fields": { "keyword": { "type": "keyword" } }
      },
      "quantity": { "type": "integer" },
      "deliveryCity": { "type": "keyword" },
      "notes": { "type": "text" },
      "status": { "type": "keyword" },
      "categoryName": { "type": "keyword" },
      "brandName": { "type": "keyword" },
      "quotedPrice": { "type": "scaled_float", "scaling_factor": 100 },
      "totalPrice": { "type": "scaled_float", "scaling_factor": 100 },
      "assignedTo": { "type": "keyword" },
      "pipelineStatus": { "type": "keyword" },
      "dealerResponseCount": { "type": "integer" },
      "createdAt": { "type": "date" },
      "updatedAt": { "type": "date" }
    }
  }
}
```

### 23.1.7 Community Post Index -- Complete Mapping

```json
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "number_of_replicas": 1,
      "refresh_interval": "60s"
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "autocomplete_search_analyzer"
          }
        }
      },
      "content": { "type": "text", "analyzer": "standard" },
      "authorName": { "type": "keyword" },
      "authorId": { "type": "keyword" },
      "city": { "type": "keyword" },
      "category": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "upvotes": { "type": "integer" },
      "commentCount": { "type": "integer" },
      "status": { "type": "keyword" },
      "createdAt": { "type": "date" }
    }
  }
}
```

### 23.1.8 Knowledge Article Index -- Complete Mapping

```json
{
  "settings": {
    "index": {
      "number_of_shards": 1,
      "number_of_replicas": 0,
      "refresh_interval": "300s"
    }
  },
  "mappings": {
    "dynamic": "strict",
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "standard",
        "fields": {
          "autocomplete": {
            "type": "text",
            "analyzer": "autocomplete_analyzer",
            "search_analyzer": "autocomplete_search_analyzer"
          }
        }
      },
      "slug": { "type": "keyword" },
      "content": { "type": "text", "analyzer": "standard" },
      "category": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "views": { "type": "integer" },
      "isPublished": { "type": "boolean" },
      "publishedAt": { "type": "date" },
      "createdAt": { "type": "date" }
    }
  }
}
```

---

## 23.2 Search Query Implementation

Every search query below is defined as a TypeScript function in `packages/api/src/modules/search/search.queries.ts`. Each function builds an Elasticsearch request body, sends it via the `@elastic/elasticsearch` client, and returns a typed response.

### 23.2.1 Full-Text Product Search

The primary search experience. Accepts a query string, optional filters, sort, and pagination. Returns matching products with faceted aggregations and highlight snippets.

```typescript
// packages/api/src/modules/search/search.queries.ts

import { Client } from '@elastic/elasticsearch';
import { SearchRequest, SearchResponse } from '@elastic/elasticsearch/lib/api/types';

// ---- Types ----

interface ProductSearchParams {
  q: string;                        // User query string (required, min 1 char)
  brand?: string;                   // Exact brand name filter
  brands?: string[];                // Multi-select brand filter
  category?: string;                // Category slug filter
  subCategory?: string;             // Sub-category slug filter
  productType?: string;             // Product type slug filter
  priceMin?: number;                // Minimum avgDealerPrice (paisa)
  priceMax?: number;                // Maximum avgDealerPrice (paisa)
  city?: string;                    // City availability filter
  certifications?: string[];        // e.g., ['ISI', 'BIS']
  specifications?: Record<string, string>;  // e.g., { current_rating: '32A', poles: '1' }
  inStock?: boolean;                // Only products with activeDealerCount > 0
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'popularity' | 'newest' | 'rating';
  page?: number;                    // 1-indexed page number (default: 1)
  limit?: number;                   // Results per page (default: 20, max: 100)
}

interface ProductSearchResult {
  products: ProductHit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  facets: SearchFacets;
  query: string;
  appliedFilters: Record<string, unknown>;
  searchTimeMs: number;
  suggestion?: string;              // "Did you mean: ..." suggestion
}

interface ProductHit {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  subCategoryName: string;
  productTypeName: string;
  modelNumber: string | null;
  thumbnailUrl: string | null;
  mrp: number;
  bestPrice: number | null;
  avgDealerPrice: number | null;
  savingsPercent: number | null;
  dealerCount: number;
  avgRating: number | null;
  reviewCount: number;
  highlights: Record<string, string[]>;
  score: number;
}

interface SearchFacets {
  brands: FacetBucket[];
  categories: FacetBucket[];
  subCategories: FacetBucket[];
  productTypes: FacetBucket[];
  priceRanges: PriceRangeBucket[];
  certifications: FacetBucket[];
  cities: FacetBucket[];
  specifications: Record<string, FacetBucket[]>;
  avgRating: number;
  totalDealers: number;
}

interface FacetBucket {
  key: string;
  count: number;
}

interface PriceRangeBucket {
  key: string;
  from?: number;
  to?: number;
  count: number;
}

// ---- Query Builder ----

function buildProductSearchQuery(params: ProductSearchParams): SearchRequest {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 20));
  const from = (page - 1) * limit;

  // Build filter clauses
  const filterClauses: object[] = [
    { term: { isActive: true } }
  ];

  if (params.brand) {
    filterClauses.push({ term: { brand: params.brand } });
  }
  if (params.brands && params.brands.length > 0) {
    filterClauses.push({ terms: { brand: params.brands } });
  }
  if (params.category) {
    filterClauses.push({ term: { categorySlug: params.category } });
  }
  if (params.subCategory) {
    filterClauses.push({ term: { subCategorySlug: params.subCategory } });
  }
  if (params.productType) {
    filterClauses.push({ term: { productTypeSlug: params.productType } });
  }
  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    const range: Record<string, number> = {};
    if (params.priceMin !== undefined) range.gte = params.priceMin;
    if (params.priceMax !== undefined) range.lte = params.priceMax;
    filterClauses.push({ range: { avgDealerPrice: range } });
  }
  if (params.city) {
    filterClauses.push({ term: { cityAvailability: params.city } });
  }
  if (params.certifications && params.certifications.length > 0) {
    filterClauses.push({ terms: { certifications: params.certifications } });
  }
  if (params.inStock) {
    filterClauses.push({ range: { activeDealerCount: { gt: 0 } } });
  }
  if (params.specifications) {
    for (const [key, value] of Object.entries(params.specifications)) {
      filterClauses.push({ term: { [`specifications.${key}`]: value } });
    }
  }

  // Build sort clause
  const sortClause = buildSortClause(params.sort);

  // Build the query
  const body: Record<string, unknown> = {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query: params.q,
              fields: [
                'name^5',
                'name.exact^8',
                'modelNumber^6',
                'modelNumber.keyword^10',
                'brand.text^3',
                'specText^2',
                'description',
                'tags^2',
                'categoryName.text',
                'subCategoryName.text',
                'productTypeName.text'
              ],
              type: 'best_fields',
              fuzziness: 'AUTO',
              prefix_length: 2,
              max_expansions: 50,
              tie_breaker: 0.3,
              minimum_should_match: '75%'
            }
          }
        ],
        filter: filterClauses,
        should: [
          // Boost products with higher popularity
          {
            rank_feature: {
              field: 'popularityScore',
              boost: 1.5,
              saturation: {}
            }
          },
          // Boost products with more dealers (better availability)
          {
            range: {
              activeDealerCount: {
                gte: 3,
                boost: 1.2
              }
            }
          },
          // Boost featured products
          {
            term: {
              isFeatured: {
                value: true,
                boost: 2.0
              }
            }
          }
        ]
      }
    },
    sort: sortClause,
    from,
    size: limit,
    track_total_hits: true,
    highlight: {
      pre_tags: ['<mark>'],
      post_tags: ['</mark>'],
      fields: {
        'name': { number_of_fragments: 1, fragment_size: 200 },
        'description': { number_of_fragments: 2, fragment_size: 150 },
        'specText': { number_of_fragments: 1, fragment_size: 200 },
        'modelNumber': { number_of_fragments: 1, fragment_size: 100 }
      }
    },
    suggest: {
      text: params.q,
      product_suggest: {
        phrase: {
          field: 'name',
          size: 1,
          gram_size: 3,
          direct_generator: [
            {
              field: 'name',
              suggest_mode: 'popular',
              min_word_length: 3
            }
          ],
          highlight: {
            pre_tag: '<em>',
            post_tag: '</em>'
          }
        }
      }
    },
    aggs: {
      brands: {
        terms: { field: 'brand', size: 30, order: { _count: 'desc' } }
      },
      categories: {
        terms: { field: 'categoryName', size: 20 }
      },
      subCategories: {
        terms: { field: 'subCategoryName', size: 30 }
      },
      productTypes: {
        terms: { field: 'productTypeName', size: 30 }
      },
      priceRanges: {
        range: {
          field: 'avgDealerPrice',
          ranges: [
            { key: 'Under Rs 100', to: 10000 },
            { key: 'Rs 100 - Rs 500', from: 10000, to: 50000 },
            { key: 'Rs 500 - Rs 2,000', from: 50000, to: 200000 },
            { key: 'Rs 2,000 - Rs 5,000', from: 200000, to: 500000 },
            { key: 'Rs 5,000 - Rs 10,000', from: 500000, to: 1000000 },
            { key: 'Above Rs 10,000', from: 1000000 }
          ]
        }
      },
      certifications: {
        terms: { field: 'certifications', size: 15 }
      },
      cities: {
        terms: { field: 'cityAvailability', size: 50 }
      },
      avg_rating: {
        avg: { field: 'avgRating' }
      },
      total_dealers: {
        sum: { field: 'dealerCount' }
      },
      spec_voltage: {
        terms: { field: 'specifications.voltage', size: 20 }
      },
      spec_current_rating: {
        terms: { field: 'specifications.current_rating', size: 20 }
      },
      spec_wattage: {
        terms: { field: 'specifications.wattage', size: 20 }
      },
      spec_material: {
        terms: { field: 'specifications.material', size: 20 }
      },
      spec_color: {
        terms: { field: 'specifications.color', size: 20 }
      },
      spec_poles: {
        terms: { field: 'specifications.poles', size: 10 }
      }
    }
  };

  return {
    index: 'h4e_products',
    body
  };
}

function buildSortClause(sort?: string): object[] {
  switch (sort) {
    case 'price_asc':
      return [
        { avgDealerPrice: { order: 'asc', missing: '_last' } },
        { _score: { order: 'desc' } }
      ];
    case 'price_desc':
      return [
        { avgDealerPrice: { order: 'desc', missing: '_last' } },
        { _score: { order: 'desc' } }
      ];
    case 'popularity':
      return [
        { popularityScore: { order: 'desc' } },
        { _score: { order: 'desc' } }
      ];
    case 'newest':
      return [
        { createdAt: { order: 'desc' } },
        { _score: { order: 'desc' } }
      ];
    case 'rating':
      return [
        { avgRating: { order: 'desc', missing: '_last' } },
        { reviewCount: { order: 'desc' } },
        { _score: { order: 'desc' } }
      ];
    case 'relevance':
    default:
      return [
        { _score: { order: 'desc' } },
        { popularityScore: { order: 'desc' } }
      ];
  }
}
```

### 23.2.2 Autocomplete Query

Triggered on every keystroke after 2 characters. Must return in < 50ms. Returns up to 8 suggestions grouped by type: products, brands, categories.

```typescript
// packages/api/src/modules/search/search.queries.ts (continued)

interface AutocompleteParams {
  q: string;              // Partial query (min 2 chars)
  limit?: number;         // Max suggestions per group (default: 5)
  city?: string;          // Optional city filter for locality-aware suggestions
}

interface AutocompleteResult {
  products: AutocompleteItem[];
  brands: AutocompleteItem[];
  categories: AutocompleteItem[];
  recentSearches: string[];         // From user's search history (if authenticated)
  popularSearches: string[];        // Platform-wide popular queries
}

interface AutocompleteItem {
  id: string;
  text: string;
  subtitle?: string;     // brand for products, count for categories
  url: string;           // Direct navigation URL
  thumbnailUrl?: string; // Product thumbnail only
}

function buildAutocompleteQuery(params: AutocompleteParams): SearchRequest {
  const limit = Math.min(8, params.limit ?? 5);

  const filterClauses: object[] = [{ term: { isActive: true } }];
  if (params.city) {
    filterClauses.push({ term: { cityAvailability: params.city } });
  }

  return {
    index: 'h4e_products',
    body: {
      _source: ['id', 'name', 'slug', 'brand', 'brandSlug', 'categorySlug', 'thumbnailUrl', 'avgDealerPrice'],
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  // Prefix match on autocomplete sub-field (highest priority)
                  {
                    match: {
                      'name.autocomplete': {
                        query: params.q,
                        boost: 5
                      }
                    }
                  },
                  // Model number prefix match
                  {
                    match: {
                      'modelNumber.autocomplete': {
                        query: params.q,
                        boost: 8
                      }
                    }
                  },
                  // Brand text match
                  {
                    match: {
                      'brand.text': {
                        query: params.q,
                        boost: 3
                      }
                    }
                  },
                  // Fuzzy fallback for typos
                  {
                    match: {
                      'name': {
                        query: params.q,
                        fuzziness: 'AUTO',
                        prefix_length: 2,
                        boost: 1
                      }
                    }
                  }
                ],
                minimum_should_match: 1
              }
            }
          ],
          filter: filterClauses
        }
      },
      sort: [
        { _score: { order: 'desc' } },
        { popularityScore: { order: 'desc' } }
      ],
      size: limit,
      aggs: {
        top_brands: {
          terms: {
            field: 'brand',
            size: 5,
            order: { _count: 'desc' }
          }
        },
        top_categories: {
          terms: {
            field: 'categoryName',
            size: 5,
            order: { _count: 'desc' }
          }
        }
      }
    }
  };
}
```

### 23.2.3 Semantic Search (Vector Similarity)

Used when full-text search returns < 3 results or when the query is a natural language sentence (> 5 words). Also used by the AI assistant for product recommendation.

```typescript
// packages/api/src/modules/search/search.queries.ts (continued)

interface SemanticSearchParams {
  query: string;            // Natural language query
  embedding?: number[];     // Pre-computed embedding (if available)
  limit?: number;
  minScore?: number;        // Minimum cosine similarity threshold (default: 0.7)
  excludeIds?: string[];    // Products to exclude (already seen)
  filters?: {
    brand?: string;
    category?: string;
    priceMax?: number;
    city?: string;
  };
}

async function buildSemanticSearchQuery(
  params: SemanticSearchParams,
  embeddingService: EmbeddingService
): Promise<SearchRequest> {
  const limit = Math.min(50, params.limit ?? 10);
  const minScore = params.minScore ?? 0.70;

  // Get embedding for the query if not provided
  const embedding = params.embedding ?? await embeddingService.getEmbedding(params.query);

  const filterClauses: object[] = [{ term: { isActive: true } }];

  if (params.excludeIds && params.excludeIds.length > 0) {
    filterClauses.push({
      bool: { must_not: [{ terms: { id: params.excludeIds } }] }
    });
  }
  if (params.filters?.brand) {
    filterClauses.push({ term: { brand: params.filters.brand } });
  }
  if (params.filters?.category) {
    filterClauses.push({ term: { categorySlug: params.filters.category } });
  }
  if (params.filters?.priceMax) {
    filterClauses.push({ range: { avgDealerPrice: { lte: params.filters.priceMax } } });
  }
  if (params.filters?.city) {
    filterClauses.push({ term: { cityAvailability: params.filters.city } });
  }

  return {
    index: 'h4e_products',
    body: {
      query: {
        bool: {
          must: [
            {
              script_score: {
                query: {
                  bool: { filter: filterClauses }
                },
                script: {
                  source: "cosineSimilarity(params.queryVector, 'embedding') + 1.0",
                  params: {
                    queryVector: embedding
                  }
                }
              }
            }
          ]
        }
      },
      min_score: minScore + 1.0,  // +1.0 because script adds 1.0 to avoid negatives
      size: limit,
      _source: {
        excludes: ['embedding']   // Never return the 1536-dim vector in results
      }
    }
  };
}
```

### 23.2.4 Hybrid Search (Text + Vector, Weighted)

Combines full-text relevance with semantic similarity. Used for the primary search bar when the query is moderately complex (3-8 words).

```typescript
// packages/api/src/modules/search/search.queries.ts (continued)

interface HybridSearchParams {
  q: string;
  textWeight?: number;       // Weight for text score (default: 0.6)
  vectorWeight?: number;     // Weight for vector score (default: 0.4)
  page?: number;
  limit?: number;
  filters?: ProductSearchParams;  // Reuse filter params from full-text search
}

async function buildHybridSearchQuery(
  params: HybridSearchParams,
  embeddingService: EmbeddingService
): Promise<SearchRequest> {
  const textWeight = params.textWeight ?? 0.6;
  const vectorWeight = params.vectorWeight ?? 0.4;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, params.limit ?? 20);
  const from = (page - 1) * limit;

  const embedding = await embeddingService.getEmbedding(params.q);

  const filterClauses: object[] = [{ term: { isActive: true } }];
  // Apply same filters as full-text search if provided
  if (params.filters) {
    // ... same filter building logic as buildProductSearchQuery
  }

  return {
    index: 'h4e_products',
    body: {
      query: {
        bool: {
          should: [
            // Text component
            {
              multi_match: {
                query: params.q,
                fields: [
                  'name^5',
                  'name.exact^8',
                  'modelNumber^6',
                  'brand.text^3',
                  'specText^2',
                  'description',
                  'tags^2'
                ],
                type: 'best_fields',
                fuzziness: 'AUTO',
                boost: textWeight * 10  // Normalize to same scale as vector
              }
            },
            // Vector component
            {
              script_score: {
                query: { bool: { filter: filterClauses } },
                script: {
                  source: `(cosineSimilarity(params.queryVector, 'embedding') + 1.0) * params.weight`,
                  params: {
                    queryVector: embedding,
                    weight: vectorWeight * 10
                  }
                }
              }
            }
          ],
          filter: filterClauses,
          minimum_should_match: 1
        }
      },
      from,
      size: limit,
      _source: { excludes: ['embedding'] },
      track_total_hits: true
    }
  };
}
```

**When to use which search mode:**

| Query Characteristics | Search Mode | Example |
|----------------------|-------------|---------|
| 1-2 words, looks like a product name or brand | Full-text | "havells mcb" |
| 1-3 chars, user is typing | Autocomplete | "hav" |
| 3-8 words, mixed intent | Hybrid (0.6 text / 0.4 vector) | "32 amp mcb for home panel" |
| 8+ words, full sentence / natural language | Semantic (pure vector) | "I need circuit breakers for a 3BHK apartment electrical panel" |
| Full-text returns < 3 results | Fallback to semantic | Any query with poor text match |
| Exact model number pattern (regex: `/^[A-Z]{2,}\d+/i`) | Full-text with `modelNumber.keyword` boost x20 | "QO116C10" |

**Routing logic (implemented in `SearchService.search()`):**

```typescript
// packages/api/src/modules/search/search.service.ts

async search(params: ProductSearchParams): Promise<ProductSearchResult> {
  const queryType = classifyQuery(params.q);

  let searchRequest: SearchRequest;
  switch (queryType) {
    case 'model_number':
      searchRequest = buildModelNumberSearchQuery(params);
      break;
    case 'natural_language':
      searchRequest = await buildHybridSearchQuery(
        { q: params.q, filters: params },
        this.embeddingService
      );
      break;
    case 'standard':
    default:
      searchRequest = buildProductSearchQuery(params);
      break;
  }

  const response = await this.esClient.search(searchRequest);

  // Fallback: if text search returns < 3 results, try semantic
  if (
    queryType === 'standard' &&
    (response.hits.total as { value: number }).value < 3
  ) {
    const semanticRequest = await buildSemanticSearchQuery(
      { query: params.q, limit: params.limit ?? 20 },
      this.embeddingService
    );
    const semanticResponse = await this.esClient.search(semanticRequest);
    return this.mergeResults(response, semanticResponse, params);
  }

  return this.transformResponse(response, params);
}

function classifyQuery(q: string): 'model_number' | 'natural_language' | 'standard' {
  // Model number pattern: starts with 2+ letters followed by digits, or contains dashes/slashes
  if (/^[A-Za-z]{2,}\d+/.test(q.trim()) || /\d+[A-Za-z\-\/]\d+/.test(q.trim())) {
    return 'model_number';
  }
  // Natural language: more than 5 words or contains question words
  const words = q.trim().split(/\s+/);
  if (words.length > 5 || /^(what|which|how|find|suggest|recommend|need|want|looking)/i.test(q.trim())) {
    return 'natural_language';
  }
  return 'standard';
}
```

### 23.2.5 "Did You Mean?" Suggestions

Elasticsearch's phrase suggester handles misspelling correction. Already included in the full-text search query (see `suggest` block in 23.2.1). Response handling:

```typescript
// packages/api/src/modules/search/search.service.ts (continued)

function extractSuggestion(response: SearchResponse): string | undefined {
  const suggestions = response.suggest?.product_suggest;
  if (!suggestions || suggestions.length === 0) return undefined;

  const firstSuggestion = suggestions[0];
  if (!firstSuggestion.options || firstSuggestion.options.length === 0) return undefined;

  const topOption = firstSuggestion.options[0];
  if (topOption.score > 0.8) {
    return topOption.highlighted ?? topOption.text;
  }
  return undefined;
}
```

### 23.2.6 Faceted Navigation Query

When a user clicks a filter without typing a query, we need facets for the current category without a text query. This is a match-all with filters and aggregations.

```typescript
function buildFacetNavigationQuery(params: {
  category?: string;
  subCategory?: string;
  productType?: string;
  city?: string;
}): SearchRequest {
  const filterClauses: object[] = [{ term: { isActive: true } }];

  if (params.category) filterClauses.push({ term: { categorySlug: params.category } });
  if (params.subCategory) filterClauses.push({ term: { subCategorySlug: params.subCategory } });
  if (params.productType) filterClauses.push({ term: { productTypeSlug: params.productType } });
  if (params.city) filterClauses.push({ term: { cityAvailability: params.city } });

  return {
    index: 'h4e_products',
    body: {
      query: {
        bool: { filter: filterClauses }
      },
      size: 0,   // We only want aggregations, not documents
      aggs: {
        brands: { terms: { field: 'brand', size: 30 } },
        categories: { terms: { field: 'categoryName', size: 20 } },
        subCategories: { terms: { field: 'subCategoryName', size: 30 } },
        productTypes: { terms: { field: 'productTypeName', size: 30 } },
        priceRanges: {
          range: {
            field: 'avgDealerPrice',
            ranges: [
              { key: 'Under Rs 100', to: 10000 },
              { key: 'Rs 100 - Rs 500', from: 10000, to: 50000 },
              { key: 'Rs 500 - Rs 2,000', from: 50000, to: 200000 },
              { key: 'Rs 2,000 - Rs 5,000', from: 200000, to: 500000 },
              { key: 'Rs 5,000 - Rs 10,000', from: 500000, to: 1000000 },
              { key: 'Above Rs 10,000', from: 1000000 }
            ]
          }
        },
        certifications: { terms: { field: 'certifications', size: 15 } },
        spec_voltage: { terms: { field: 'specifications.voltage', size: 20 } },
        spec_current_rating: { terms: { field: 'specifications.current_rating', size: 20 } },
        spec_poles: { terms: { field: 'specifications.poles', size: 10 } },
        spec_color: { terms: { field: 'specifications.color', size: 20 } },
        price_stats: { stats: { field: 'avgDealerPrice' } },
        total_products: { value_count: { field: 'id' } }
      }
    }
  };
}
```

### 23.2.7 Dealer Search Query

```typescript
interface DealerSearchParams {
  q?: string;                // Business name or owner name search
  city?: string;             // Exact city filter
  brands?: string[];         // Dealers carrying these brands
  categories?: string[];     // Dealers in these categories
  dealerType?: string;       // RETAILER, DISTRIBUTOR, etc.
  minRating?: number;        // Minimum avgRating
  maxResponseTime?: number;  // Maximum avgResponseTimeMinutes
  isPremium?: boolean;       // Premium dealers only
  nearLocation?: {           // Geo-distance query
    lat: number;
    lon: number;
    radiusKm: number;
  };
  sort?: 'relevance' | 'rating' | 'response_time' | 'distance' | 'conversions';
  page?: number;
  limit?: number;
}

function buildDealerSearchQuery(params: DealerSearchParams): SearchRequest {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(50, params.limit ?? 20);
  const from = (page - 1) * limit;

  const mustClauses: object[] = [];
  const filterClauses: object[] = [
    { term: { status: 'VERIFIED' } },
    { term: { profileComplete: true } }
  ];

  if (params.q) {
    mustClauses.push({
      multi_match: {
        query: params.q,
        fields: ['businessName^3', 'ownerName^2', 'description'],
        type: 'best_fields',
        fuzziness: 'AUTO'
      }
    });
  }

  if (params.city) filterClauses.push({ term: { city: params.city } });
  if (params.brands?.length) filterClauses.push({ terms: { brands: params.brands } });
  if (params.categories?.length) filterClauses.push({ terms: { categories: params.categories } });
  if (params.dealerType) filterClauses.push({ term: { dealerType: params.dealerType } });
  if (params.isPremium !== undefined) filterClauses.push({ term: { isPremium: params.isPremium } });
  if (params.minRating) filterClauses.push({ range: { avgRating: { gte: params.minRating } } });
  if (params.maxResponseTime) filterClauses.push({ range: { avgResponseTimeMinutes: { lte: params.maxResponseTime } } });

  if (params.nearLocation) {
    filterClauses.push({
      geo_distance: {
        distance: `${params.nearLocation.radiusKm}km`,
        location: {
          lat: params.nearLocation.lat,
          lon: params.nearLocation.lon
        }
      }
    });
  }

  let sortClause: object[];
  switch (params.sort) {
    case 'rating':
      sortClause = [{ avgRating: 'desc' }, { reviewCount: 'desc' }];
      break;
    case 'response_time':
      sortClause = [{ avgResponseTimeMinutes: 'asc' }];
      break;
    case 'conversions':
      sortClause = [{ conversionRate: 'desc' }];
      break;
    case 'distance':
      if (params.nearLocation) {
        sortClause = [{
          _geo_distance: {
            location: { lat: params.nearLocation.lat, lon: params.nearLocation.lon },
            order: 'asc',
            unit: 'km'
          }
        }];
      } else {
        sortClause = [{ _score: 'desc' }];
      }
      break;
    default:
      sortClause = [{ _score: 'desc' }, { conversionRate: 'desc' }];
  }

  return {
    index: 'h4e_dealers',
    body: {
      query: {
        bool: {
          must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
          filter: filterClauses
        }
      },
      sort: sortClause,
      from,
      size: limit,
      aggs: {
        cities: { terms: { field: 'city', size: 50 } },
        brands: { terms: { field: 'brands', size: 30 } },
        categories: { terms: { field: 'categories', size: 20 } },
        dealerTypes: { terms: { field: 'dealerType', size: 10 } },
        avg_rating: { avg: { field: 'avgRating' } },
        avg_response_time: { avg: { field: 'avgResponseTimeMinutes' } }
      }
    }
  };
}
```

---

## 23.3 Search Performance Targets

| Operation | p50 Latency | p99 Latency | Max Acceptable | Measurement Point |
|-----------|-------------|-------------|----------------|-------------------|
| Autocomplete | < 30ms | < 80ms | 100ms | ES response time (excludes network to client) |
| Full-text product search | < 80ms | < 250ms | 400ms | ES response time |
| Full-text with aggregations | < 120ms | < 350ms | 500ms | ES response time |
| Semantic vector search | < 150ms | < 400ms | 600ms | ES response time (excludes embedding generation) |
| Hybrid search (text + vector) | < 200ms | < 500ms | 800ms | End-to-end including embedding |
| Embedding generation | < 100ms | < 200ms | 300ms | OpenAI API call |
| Dealer geo-search | < 50ms | < 150ms | 250ms | ES response time |
| Facet-only navigation | < 40ms | < 100ms | 200ms | ES response time |
| Full search API response (client-facing) | < 200ms | < 500ms | 1000ms | API endpoint response time |

**Monitoring:** Each search type has a Prometheus histogram tracking latency. Alert fires if p99 exceeds 2x the target for 5 consecutive minutes. Dashboard in Grafana shows live latency percentiles, cache hit rate, and query volume by type.

---

## 23.4 Knowledge Graph

### 23.4.1 Purpose and Scope

The knowledge graph models typed relationships between products, categories, specifications, brands, use cases, and construction standards. It powers:

1. **"Frequently Bought Together"** -- When a user adds MCBs to an inquiry, suggest matching distribution board, cable, and lugs.
2. **"You'll Also Need"** -- During BOQ creation, auto-suggest complementary products.
3. **"Alternatives"** -- Show equivalent products from different brands at different price points.
4. **"Compatible With"** -- Ensure recommended products are electrically and physically compatible.
5. **AI assistant's product knowledge** -- The procurement copilot traverses the graph to build structured recommendations.
6. **Category navigation enrichment** -- "People who looked at MCBs also looked at RCCBs."

### 23.4.2 Graph Schema

**Nodes:**

| Node Type | Source Table | Key Properties | Document Count (Year 1) |
|-----------|-------------|----------------|-------------------------|
| `Product` | `products` | id, name, brand, modelNumber, specifications | 50,000 - 100,000 |
| `Category` | `categories` | id, name, slug, level (1=root, 2=sub, 3=type) | ~200 |
| `Brand` | `brands` | id, name, slug, segment, qualityRating | ~50 |
| `Specification` | Derived from `products.specifications` JSON | key, value, unit | ~5,000 unique key-value pairs |
| `UseCase` | New table: `use_cases` | id, description, roomType, projectType, sqftEstimate | ~100 |
| `Standard` | New table: `electrical_standards` | id, code, name, version, authority | ~30 |

**Edges:**

| Edge Type | From | To | Properties | Cardinality |
|-----------|------|----|------------|-------------|
| `BELONGS_TO` | Product | Category (at type level) | -- | N:1 |
| `MADE_BY` | Product | Brand | -- | N:1 |
| `HAS_SPEC` | Product | Specification | -- | N:M |
| `COMPATIBLE_WITH` | Product | Product | compatibility_type (electrical, physical, protocol) | M:M |
| `ALTERNATIVE_TO` | Product | Product | price_delta_percent, quality_delta | M:M (symmetric) |
| `FREQUENTLY_BOUGHT_WITH` | Product | Product | co_occurrence_count, confidence, last_computed | M:M |
| `REQUIRED_FOR` | Product | UseCase | quantity_per_unit, unit (per room, per sqft, per point) | M:M |
| `COMPLIES_WITH` | Product | Standard | compliance_level (mandatory, optional) | M:M |
| `PARENT_OF` | Category | Category | -- | 1:N (tree) |
| `REQUIRES` | UseCase | Product (generic, not specific SKU) | min_quantity, max_quantity, notes | M:M |

### 23.4.3 Implementation -- PostgreSQL, Not Neo4j

**Decision: Store the knowledge graph in PostgreSQL using adjacency tables and materialized views. Do NOT use Neo4j.**

**Rationale:**

| Factor | PostgreSQL | Neo4j |
|--------|-----------|-------|
| Operational complexity | Zero additional infra. Already running PostgreSQL via RDS. | Separate cluster, separate backups, separate monitoring, separate expertise. |
| Query complexity | Most traversals are 1-2 hops. Recursive CTEs handle 3+ hops adequately at our scale. | Optimized for deep graph traversals (5+ hops). Overkill for "find me 10 related products." |
| Transaction consistency | Same database as source tables. Materialized views computed from live data. | Requires cross-database consistency (PostgreSQL -> Neo4j sync). Eventual consistency headaches. |
| Cost | $0 incremental. | $200-500/month for managed Neo4j AuraDB. |
| Scale limit | Comfortable to 10M edges. We'll have ~500K edges in Year 1. | Would be needed at 100M+ edges with deep traversals. |
| Full-text integration | Already have Elasticsearch. Neo4j's full-text is secondary. | Redundant search capability. |

**Schema tables:**

```sql
-- Adjacency table for all product-to-product relationships
CREATE TABLE product_relationships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,   -- 'COMPATIBLE_WITH', 'ALTERNATIVE_TO', 'FREQUENTLY_BOUGHT_WITH'
  weight            FLOAT DEFAULT 1.0,
  metadata          JSONB DEFAULT '{}',
  -- metadata examples:
  --   COMPATIBLE_WITH:        {"compatibility_type": "electrical", "notes": "Same DIN rail mount"}
  --   ALTERNATIVE_TO:         {"price_delta_percent": -15, "quality_delta": "comparable"}
  --   FREQUENTLY_BOUGHT_WITH: {"co_occurrence_count": 47, "confidence": 0.82}
  is_symmetric      BOOLEAN DEFAULT FALSE,
  computed_at       TIMESTAMPTZ DEFAULT now(),
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT product_relationship_unique UNIQUE (source_product_id, target_product_id, relationship_type),
  CONSTRAINT no_self_relationship CHECK (source_product_id != target_product_id)
);

CREATE INDEX idx_prod_rel_source ON product_relationships (source_product_id, relationship_type);
CREATE INDEX idx_prod_rel_target ON product_relationships (target_product_id, relationship_type);
CREATE INDEX idx_prod_rel_type   ON product_relationships (relationship_type);
CREATE INDEX idx_prod_rel_weight ON product_relationships (relationship_type, weight DESC);

-- Use cases (room types, project types)
CREATE TABLE use_cases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description   TEXT NOT NULL,             -- "3BHK residential wiring"
  room_type     TEXT,                      -- 'bedroom', 'kitchen', 'bathroom', 'living_room', 'balcony', 'full_house'
  project_type  TEXT NOT NULL,             -- 'residential', 'commercial', 'industrial'
  sqft_estimate INT,                       -- Typical area for this use case
  notes         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_use_cases_room ON use_cases (room_type);
CREATE INDEX idx_use_cases_project ON use_cases (project_type);

-- Product requirements per use case
CREATE TABLE use_case_products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_case_id     UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,  -- Generic category, not specific SKU
  product_type_id UUID REFERENCES product_types(id) ON DELETE SET NULL,       -- More specific if available
  quantity_per_unit FLOAT NOT NULL,        -- e.g., 1.5 MCBs per electrical point
  unit            TEXT NOT NULL,            -- 'per_room', 'per_sqft', 'per_point', 'per_floor', 'fixed'
  is_mandatory    BOOLEAN DEFAULT TRUE,     -- Must-have vs nice-to-have
  priority        INT DEFAULT 1,            -- 1=highest priority
  notes           TEXT,                     -- "6A for lighting, 16A for power sockets, 32A for AC"
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT use_case_product_unique UNIQUE (use_case_id, category_id, product_type_id)
);

CREATE INDEX idx_ucp_use_case ON use_case_products (use_case_id);
CREATE INDEX idx_ucp_category ON use_case_products (category_id);

-- Electrical standards
CREATE TABLE electrical_standards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT NOT NULL UNIQUE,      -- 'IS_732', 'NEC_2023', 'IEC_60898'
  name          TEXT NOT NULL,             -- 'Indian Standard for Electrical Wiring Installations'
  version       TEXT,                      -- '2019'
  authority     TEXT,                      -- 'BIS', 'IEC', 'IEEE'
  description   TEXT,
  url           TEXT,                      -- Link to standard document
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Product compliance with standards
CREATE TABLE product_standards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  standard_id     UUID NOT NULL REFERENCES electrical_standards(id) ON DELETE CASCADE,
  compliance_level TEXT DEFAULT 'mandatory',  -- 'mandatory', 'optional', 'recommended'
  certificate_url  TEXT,                       -- URL to compliance certificate
  verified_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT product_standard_unique UNIQUE (product_id, standard_id)
);

CREATE INDEX idx_prod_std_product ON product_standards (product_id);
CREATE INDEX idx_prod_std_standard ON product_standards (standard_id);
```

### 23.4.4 "Frequently Bought Together" Algorithm

Computed nightly by a BullMQ cron job. Analyzes co-occurrence of products within the same inquiry or RFQ.

```sql
-- packages/api/src/modules/search/knowledge-graph.queries.sql

-- Step 1: Compute co-occurrence from RFQ items
WITH co_occurrences AS (
  SELECT
    ri1.product_id AS source_id,
    ri2.product_id AS target_id,
    COUNT(DISTINCT ri1.rfq_id) AS rfq_co_count
  FROM rfq_items ri1
  JOIN rfq_items ri2
    ON ri1.rfq_id = ri2.rfq_id
    AND ri1.product_id < ri2.product_id   -- Avoid duplicates and self-joins
  JOIN rfqs r ON ri1.rfq_id = r.id
  WHERE r.status NOT IN ('CANCELLED', 'DRAFT')
    AND r.created_at > now() - INTERVAL '6 months'  -- Rolling 6-month window
  GROUP BY ri1.product_id, ri2.product_id
  HAVING COUNT(DISTINCT ri1.rfq_id) >= 2   -- Minimum co-occurrence threshold
),

-- Step 2: Add co-occurrence from Product Inquiries (same phone = same user)
inquiry_co_occurrences AS (
  SELECT
    pi1.id AS source_inquiry_id,
    pi2.id AS target_inquiry_id,
    pi1.phone,
    pi1.category_id AS source_category,
    pi2.category_id AS target_category
  FROM product_inquiries pi1
  JOIN product_inquiries pi2
    ON pi1.phone = pi2.phone
    AND pi1.id < pi2.id
    AND pi1.category_id IS NOT NULL
    AND pi2.category_id IS NOT NULL
    AND pi1.category_id != pi2.category_id
  WHERE pi1.created_at > now() - INTERVAL '6 months'
),

-- Step 3: Compute confidence scores
scored AS (
  SELECT
    c.source_id,
    c.target_id,
    c.rfq_co_count,
    c.rfq_co_count::FLOAT / GREATEST(
      (SELECT COUNT(DISTINCT rfq_id) FROM rfq_items WHERE product_id = c.source_id),
      1
    ) AS confidence_source,
    c.rfq_co_count::FLOAT / GREATEST(
      (SELECT COUNT(DISTINCT rfq_id) FROM rfq_items WHERE product_id = c.target_id),
      1
    ) AS confidence_target
  FROM co_occurrences c
)

-- Step 4: Upsert into product_relationships
INSERT INTO product_relationships (
  source_product_id, target_product_id, relationship_type, weight, metadata, is_symmetric, computed_at
)
SELECT
  source_id,
  target_id,
  'FREQUENTLY_BOUGHT_WITH',
  rfq_co_count,
  jsonb_build_object(
    'co_occurrence_count', rfq_co_count,
    'confidence', ROUND(GREATEST(confidence_source, confidence_target)::NUMERIC, 3),
    'confidence_source', ROUND(confidence_source::NUMERIC, 3),
    'confidence_target', ROUND(confidence_target::NUMERIC, 3)
  ),
  TRUE,
  now()
FROM scored
WHERE GREATEST(confidence_source, confidence_target) >= 0.1  -- Min 10% confidence
ON CONFLICT (source_product_id, target_product_id, relationship_type)
  DO UPDATE SET
    weight = EXCLUDED.weight,
    metadata = EXCLUDED.metadata,
    computed_at = EXCLUDED.computed_at,
    updated_at = now();
```

**Query to retrieve "Frequently Bought Together" for a given product:**

```sql
-- Given product_id $1, return top 10 frequently bought together products
SELECT
  CASE
    WHEN pr.source_product_id = $1 THEN pr.target_product_id
    ELSE pr.source_product_id
  END AS related_product_id,
  p.name AS related_product_name,
  p.brand_id,
  b.name AS brand_name,
  (pr.metadata->>'co_occurrence_count')::INT AS co_occurrence_count,
  (pr.metadata->>'confidence')::FLOAT AS confidence
FROM product_relationships pr
JOIN products p ON p.id = CASE
  WHEN pr.source_product_id = $1 THEN pr.target_product_id
  ELSE pr.source_product_id
END
JOIN brands b ON b.id = p.brand_id
WHERE pr.relationship_type = 'FREQUENTLY_BOUGHT_WITH'
  AND (pr.source_product_id = $1 OR pr.target_product_id = $1)
  AND p.is_active = TRUE
ORDER BY (pr.metadata->>'co_occurrence_count')::INT DESC
LIMIT 10;
```

### 23.4.5 "Alternative Products" Algorithm

Alternatives are products that serve the same function but differ in brand, price, or specs. Computed from:
1. **Same product type** (same `productTypeId` in Prisma schema).
2. **Similar specifications** (matching key specs like voltage, current rating, poles).
3. **Different brand** (alternatives by definition cross brand boundaries).

```sql
-- Compute alternatives for product $1
INSERT INTO product_relationships (
  source_product_id, target_product_id, relationship_type, weight, metadata, is_symmetric
)
SELECT
  $1 AS source_product_id,
  p2.id AS target_product_id,
  'ALTERNATIVE_TO',
  -- Weight = similarity score based on matching specs
  (
    CASE WHEN p1_specs->>'voltage' = p2_specs->>'voltage' THEN 0.3 ELSE 0 END +
    CASE WHEN p1_specs->>'current_rating' = p2_specs->>'current_rating' THEN 0.3 ELSE 0 END +
    CASE WHEN p1_specs->>'poles' = p2_specs->>'poles' THEN 0.2 ELSE 0 END +
    CASE WHEN p1_specs->>'material' = p2_specs->>'material' THEN 0.1 ELSE 0 END +
    CASE WHEN p1_specs->>'ip_rating' = p2_specs->>'ip_rating' THEN 0.1 ELSE 0 END
  ),
  jsonb_build_object(
    'price_delta_percent', ROUND(
      ((COALESCE(p2_avg_price, 0) - COALESCE(p1_avg_price, 0))::NUMERIC / NULLIF(p1_avg_price, 0) * 100)::NUMERIC, 1
    ),
    'brand_source', b1.name,
    'brand_target', b2.name,
    'segment_source', b1.price_segment,
    'segment_target', b2.price_segment
  ),
  TRUE   -- Symmetric: if A is alternative to B, B is alternative to A
FROM products p1
CROSS JOIN LATERAL (
  SELECT
    p.id, p.brand_id,
    p.specifications::JSONB AS p2_specs,
    (SELECT AVG(avg_dealer_price) FROM product_price_cache WHERE product_id = p.id) AS p2_avg_price
  FROM products p
  WHERE p.product_type_id = p1.product_type_id
    AND p.brand_id != p1.brand_id
    AND p.is_active = TRUE
    AND p.id != $1
) p2
JOIN brands b1 ON b1.id = p1.brand_id
JOIN brands b2 ON b2.id = p2.brand_id
CROSS JOIN LATERAL (
  SELECT
    p1.specifications::JSONB AS p1_specs,
    (SELECT AVG(avg_dealer_price) FROM product_price_cache WHERE product_id = p1.id) AS p1_avg_price
) p1_data
WHERE p1.id = $1
  AND (
    CASE WHEN p1_specs->>'voltage' = p2_specs->>'voltage' THEN 0.3 ELSE 0 END +
    CASE WHEN p1_specs->>'current_rating' = p2_specs->>'current_rating' THEN 0.3 ELSE 0 END +
    CASE WHEN p1_specs->>'poles' = p2_specs->>'poles' THEN 0.2 ELSE 0 END
  ) >= 0.5  -- Minimum 50% spec similarity
ON CONFLICT (source_product_id, target_product_id, relationship_type)
  DO UPDATE SET
    weight = EXCLUDED.weight,
    metadata = EXCLUDED.metadata,
    updated_at = now();
```

### 23.4.6 BOQ Knowledge Base

The BOQ (Bill of Quantities) knowledge base is the structured data that powers the AI BOQ generator (see section 9). It defines what electrical materials are needed for each room type and project type, with quantities normalized per unit area or per electrical point.

**Seed data structure:**

```typescript
// packages/api/prisma/seed/boq-knowledge.ts

interface BOQTemplate {
  useCase: string;
  roomType: string;
  projectType: 'residential' | 'commercial' | 'industrial';
  typicalSqft: number;
  items: BOQItem[];
}

interface BOQItem {
  categorySlug: string;
  productTypeSlug?: string;
  description: string;
  quantity: number;
  unit: 'per_room' | 'per_sqft' | 'per_point' | 'per_floor' | 'fixed';
  isMandatory: boolean;
  notes?: string;
  specRequirements?: Record<string, string>;  // Min specs for this use case
}

const BOQ_TEMPLATES: BOQTemplate[] = [
  {
    useCase: '2BHK Residential Apartment',
    roomType: 'full_house',
    projectType: 'residential',
    typicalSqft: 800,
    items: [
      // Distribution Board
      { categorySlug: 'distribution-boards', description: 'SPN Distribution Board (8-way minimum)', quantity: 1, unit: 'fixed', isMandatory: true, notes: 'Main DB near meter. Minimum 8-way for 2BHK.', specRequirements: { poles: '8', type: 'SPN' } },
      // MCBs
      { categorySlug: 'mcb', description: 'MCB 6A SP (Lighting circuits)', quantity: 4, unit: 'fixed', isMandatory: true, notes: '1 per room lighting circuit. 6A for LED lighting loads.' },
      { categorySlug: 'mcb', description: 'MCB 16A SP (Power socket circuits)', quantity: 3, unit: 'fixed', isMandatory: true, notes: '1 per room power circuit. 16A for general socket loads (TV, fridge, mixer).' },
      { categorySlug: 'mcb', description: 'MCB 20A SP (Kitchen heavy circuit)', quantity: 1, unit: 'fixed', isMandatory: true, notes: 'Dedicated for kitchen heavy appliances (microwave, dishwasher).' },
      { categorySlug: 'mcb', description: 'MCB 32A DP (AC circuit)', quantity: 2, unit: 'fixed', isMandatory: true, notes: 'One per AC unit. 32A DP for 1.5-2 ton split AC.' },
      { categorySlug: 'mcb', description: 'MCB 32A DP (Geyser circuit)', quantity: 2, unit: 'fixed', isMandatory: true, notes: 'Dedicated for each geyser.' },
      // RCCB
      { categorySlug: 'rccb', description: 'RCCB 40A 30mA DP', quantity: 1, unit: 'fixed', isMandatory: true, notes: 'Mandatory earth leakage protection per IS 732. 30mA sensitivity for human safety.' },
      // Wires
      { categorySlug: 'wires-cables', productTypeSlug: 'house-wires', description: 'FRLS 1.5 sq mm (Lighting)', quantity: 3, unit: 'per_sqft', isMandatory: true, notes: '3 meters per sqft is standard for lighting circuits. Red + Black + Green.' },
      { categorySlug: 'wires-cables', productTypeSlug: 'house-wires', description: 'FRLS 2.5 sq mm (Power sockets)', quantity: 2, unit: 'per_sqft', isMandatory: true, notes: '2 meters per sqft for power socket circuits.' },
      { categorySlug: 'wires-cables', productTypeSlug: 'house-wires', description: 'FRLS 4 sq mm (AC, Geyser)', quantity: 0.5, unit: 'per_sqft', isMandatory: true, notes: 'Dedicated runs for heavy loads. ~0.5m per sqft total.' },
      // Switches and Sockets
      { categorySlug: 'switches-sockets', description: 'Modular switch plate (6M)', quantity: 2, unit: 'per_room', isMandatory: true, notes: '2 per room average. 6-module plates for bedroom, 12-module for kitchen.' },
      { categorySlug: 'switches-sockets', description: '16A power socket with switch', quantity: 4, unit: 'per_room', isMandatory: true, notes: '4 power points per room average. More in kitchen (6-8).' },
      { categorySlug: 'switches-sockets', description: '6A switch', quantity: 3, unit: 'per_room', isMandatory: true, notes: 'Lighting switches. 3 per room average.' },
      // Conduit
      { categorySlug: 'conduit-accessories', description: 'PVC conduit 25mm', quantity: 4, unit: 'per_sqft', isMandatory: true, notes: '4 meters per sqft for concealed wiring.' },
      // Ceiling Fan
      { categorySlug: 'fans', productTypeSlug: 'ceiling-fans', description: 'Ceiling fan 1200mm', quantity: 1, unit: 'per_room', isMandatory: false, notes: 'One per room. 1200mm standard for 10x10 room.' },
      // LED Lighting
      { categorySlug: 'lighting', productTypeSlug: 'panel-lights', description: 'LED panel light 15W', quantity: 1, unit: 'per_room', isMandatory: false, notes: 'Main ceiling light. 15W for bedroom, 18W for living room.' },
      // Earthing
      { categorySlug: 'earthing', description: 'GI Earth electrode + accessories', quantity: 1, unit: 'fixed', isMandatory: true, notes: 'Mandatory per IS 3043. At least 1 earth pit for residential.' },
    ]
  },
  {
    useCase: '3BHK Residential Apartment',
    roomType: 'full_house',
    projectType: 'residential',
    typicalSqft: 1200,
    items: [
      // Same structure but with higher quantities
      { categorySlug: 'distribution-boards', description: 'SPN Distribution Board (12-way minimum)', quantity: 1, unit: 'fixed', isMandatory: true, notes: 'Main DB. 12-way for 3BHK to accommodate more circuits.' },
      { categorySlug: 'mcb', description: 'MCB 6A SP (Lighting circuits)', quantity: 5, unit: 'fixed', isMandatory: true },
      { categorySlug: 'mcb', description: 'MCB 16A SP (Power socket circuits)', quantity: 4, unit: 'fixed', isMandatory: true },
      { categorySlug: 'mcb', description: 'MCB 20A SP (Kitchen heavy circuit)', quantity: 1, unit: 'fixed', isMandatory: true },
      { categorySlug: 'mcb', description: 'MCB 32A DP (AC circuit)', quantity: 3, unit: 'fixed', isMandatory: true },
      { categorySlug: 'mcb', description: 'MCB 32A DP (Geyser circuit)', quantity: 2, unit: 'fixed', isMandatory: true },
      { categorySlug: 'rccb', description: 'RCCB 63A 30mA DP', quantity: 1, unit: 'fixed', isMandatory: true, notes: '63A for higher total load in 3BHK.' },
      { categorySlug: 'wires-cables', productTypeSlug: 'house-wires', description: 'FRLS 1.5 sq mm (Lighting)', quantity: 3, unit: 'per_sqft', isMandatory: true },
      { categorySlug: 'wires-cables', productTypeSlug: 'house-wires', description: 'FRLS 2.5 sq mm (Power sockets)', quantity: 2, unit: 'per_sqft', isMandatory: true },
      { categorySlug: 'wires-cables', productTypeSlug: 'house-wires', description: 'FRLS 4 sq mm (AC, Geyser)', quantity: 0.5, unit: 'per_sqft', isMandatory: true },
      { categorySlug: 'switches-sockets', description: 'Modular switch plate (6M)', quantity: 2, unit: 'per_room', isMandatory: true },
      { categorySlug: 'switches-sockets', description: '16A power socket with switch', quantity: 4, unit: 'per_room', isMandatory: true },
      { categorySlug: 'conduit-accessories', description: 'PVC conduit 25mm', quantity: 4, unit: 'per_sqft', isMandatory: true },
      { categorySlug: 'fans', productTypeSlug: 'ceiling-fans', description: 'Ceiling fan 1200mm', quantity: 1, unit: 'per_room', isMandatory: false },
      { categorySlug: 'lighting', productTypeSlug: 'panel-lights', description: 'LED panel light 15W', quantity: 1, unit: 'per_room', isMandatory: false },
      { categorySlug: 'earthing', description: 'GI Earth electrode + accessories', quantity: 2, unit: 'fixed', isMandatory: true, notes: '2 earth pits recommended for 3BHK.' },
    ]
  },
  // Additional templates: 1BHK, Studio, Shop/Showroom, Office, Warehouse
  // ... defined similarly
];
```

### 23.4.7 Graph Traversal Queries

**"You'll also need" (1-hop from category to related categories):**

```sql
-- Given a product, find products from OTHER categories that are frequently bought together
SELECT DISTINCT
  c.name AS suggested_category,
  c.slug AS category_slug,
  pt.name AS product_type,
  COUNT(DISTINCT pr.id) AS relationship_count,
  AVG(pr.weight) AS avg_strength
FROM product_relationships pr
JOIN products p_related ON p_related.id = CASE
  WHEN pr.source_product_id = $1 THEN pr.target_product_id
  ELSE pr.source_product_id
END
JOIN product_types pt ON pt.id = p_related.product_type_id
JOIN sub_categories sc ON sc.id = pt.sub_category_id
JOIN categories c ON c.id = sc.category_id
WHERE (pr.source_product_id = $1 OR pr.target_product_id = $1)
  AND pr.relationship_type = 'FREQUENTLY_BOUGHT_WITH'
  AND c.id != (
    SELECT c2.id FROM products p2
    JOIN product_types pt2 ON pt2.id = p2.product_type_id
    JOIN sub_categories sc2 ON sc2.id = pt2.sub_category_id
    JOIN categories c2 ON c2.id = sc2.category_id
    WHERE p2.id = $1
  )
  AND p_related.is_active = TRUE
GROUP BY c.name, c.slug, pt.name
ORDER BY relationship_count DESC, avg_strength DESC
LIMIT 5;
```

**Category hierarchy traversal (recursive CTE):**

```sql
-- Get full category tree from a given category to root
WITH RECURSIVE category_tree AS (
  -- Base case: the given category
  SELECT
    c.id,
    c.name,
    c.slug,
    1 AS level,
    ARRAY[c.name] AS path
  FROM categories c
  WHERE c.slug = $1

  UNION ALL

  -- Recursive: get subcategories and product types
  SELECT
    sc.id,
    sc.name,
    sc.slug,
    ct.level + 1,
    ct.path || sc.name
  FROM sub_categories sc
  JOIN category_tree ct ON sc.category_id = ct.id
  WHERE ct.level = 1
)
SELECT * FROM category_tree ORDER BY level, name;
```

---

## 23.5 Indexing Pipeline

### 23.5.1 Event-Driven Incremental Indexing

Every write to a searchable table triggers an Elasticsearch index update. This is implemented via Prisma middleware, not database triggers, to keep the pipeline in the application layer where it's testable and debuggable.

```typescript
// packages/api/src/modules/search/search-indexer.middleware.ts

import { Prisma } from '@prisma/client';
import { searchIndexQueue } from '../queues/search-index.queue';

const INDEXABLE_MODELS = ['Product', 'Dealer', 'ProductInquiry', 'CommunityPost', 'KnowledgeArticle'];
const INDEXABLE_ACTIONS = ['create', 'update', 'delete', 'upsert'];

export function searchIndexMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    const result = await next(params);

    // Only process indexable models and actions
    if (
      params.model &&
      INDEXABLE_MODELS.includes(params.model) &&
      params.action &&
      INDEXABLE_ACTIONS.includes(params.action)
    ) {
      const entityId = result?.id ?? params.args?.where?.id;
      if (entityId) {
        await searchIndexQueue.add(
          `index-${params.model}-${entityId}`,
          {
            model: params.model,
            action: params.action === 'delete' ? 'delete' : 'upsert',
            entityId,
            timestamp: Date.now(),
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: 100,
            removeOnFail: 500,
            priority: params.action === 'delete' ? 1 : 2,  // Deletes processed first
          }
        );
      }
    }

    return result;
  };
}
```

**BullMQ Worker:**

```typescript
// packages/api/src/modules/search/search-index.worker.ts

import { Worker, Job } from 'bullmq';
import { Client } from '@elastic/elasticsearch';

interface IndexJob {
  model: string;
  action: 'upsert' | 'delete';
  entityId: string;
  timestamp: number;
}

const INDEX_MAP: Record<string, string> = {
  Product: 'h4e_products',
  Dealer: 'h4e_dealers',
  ProductInquiry: 'h4e_inquiries',
  CommunityPost: 'h4e_community',
  KnowledgeArticle: 'h4e_knowledge',
};

const worker = new Worker<IndexJob>('search-index', async (job: Job<IndexJob>) => {
  const { model, action, entityId } = job.data;
  const indexName = INDEX_MAP[model];
  if (!indexName) throw new Error(`Unknown model for indexing: ${model}`);

  if (action === 'delete') {
    await esClient.delete({ index: indexName, id: entityId, refresh: false });
    return { action: 'deleted', entityId };
  }

  // Fetch full entity from database with all relations
  const document = await buildIndexDocument(model, entityId);
  if (!document) {
    // Entity was deleted between event and processing
    await esClient.delete({ index: indexName, id: entityId, refresh: false }).catch(() => {});
    return { action: 'skipped_deleted', entityId };
  }

  await esClient.index({
    index: indexName,
    id: entityId,
    document,
    refresh: false,  // Don't force refresh on every doc -- rely on refresh_interval
  });

  return { action: 'indexed', entityId };
}, {
  connection: redisConnection,
  concurrency: 10,          // Process 10 index jobs concurrently
  limiter: {
    max: 100,               // Max 100 ES operations per 10 seconds
    duration: 10_000,
  },
});
```

### 23.5.2 Full Reindex (Nightly Cron)

Full reindex runs nightly at 02:00 IST via BullMQ repeatable job. It rebuilds all indices from scratch to ensure consistency with the database.

```typescript
// packages/api/src/modules/search/search-reindex.job.ts

async function fullReindex(indexName: string): Promise<ReindexResult> {
  const tempIndex = `${indexName}_${Date.now()}`;
  const aliasName = indexName;  // We use aliases, not direct index names

  // Step 1: Create new index with current settings and mappings
  await esClient.indices.create({
    index: tempIndex,
    body: getIndexConfig(aliasName),  // Returns settings + mappings
  });

  // Step 2: Bulk index all documents in batches of 500
  let totalIndexed = 0;
  let cursor: string | undefined;

  while (true) {
    const batch = await fetchBatch(aliasName, cursor, 500);
    if (batch.documents.length === 0) break;

    const bulkBody = batch.documents.flatMap((doc) => [
      { index: { _index: tempIndex, _id: doc.id } },
      doc,
    ]);

    const bulkResponse = await esClient.bulk({ body: bulkBody, refresh: false });
    if (bulkResponse.errors) {
      const errorItems = bulkResponse.items.filter((item) => item.index?.error);
      logger.error('Bulk index errors', { count: errorItems.length, sample: errorItems.slice(0, 3) });
    }

    totalIndexed += batch.documents.length;
    cursor = batch.nextCursor;
    logger.info(`Reindex progress: ${totalIndexed} documents indexed for ${aliasName}`);
  }

  // Step 3: Refresh the new index
  await esClient.indices.refresh({ index: tempIndex });

  // Step 4: Atomic alias swap
  await esClient.indices.updateAliases({
    body: {
      actions: [
        { remove: { index: `${aliasName}_*`, alias: aliasName } },
        { add: { index: tempIndex, alias: aliasName } },
      ],
    },
  });

  // Step 5: Delete old indices (except the new one)
  const oldIndices = await esClient.cat.indices({ index: `${aliasName}_*`, format: 'json' });
  for (const idx of oldIndices) {
    if (idx.index !== tempIndex) {
      await esClient.indices.delete({ index: idx.index! }).catch(() => {});
    }
  }

  return { index: aliasName, totalIndexed, tempIndex, durationMs: Date.now() - startTime };
}
```

### 23.5.3 Embedding Generation Pipeline

Product embeddings are generated via OpenAI `text-embedding-3-small` (1536 dimensions) and stored both in PostgreSQL (pgvector) and Elasticsearch (dense_vector). Embeddings are computed on product create/update.

```typescript
// packages/api/src/modules/search/embedding.service.ts

import OpenAI from 'openai';

export class EmbeddingService {
  private openai: OpenAI;
  private cache: Map<string, number[]> = new Map();

  constructor() {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  async getEmbedding(text: string): Promise<number[]> {
    const cacheKey = text.toLowerCase().trim();
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536,
    });

    const embedding = response.data[0].embedding;
    this.cache.set(cacheKey, embedding);
    return embedding;
  }

  buildProductEmbeddingText(product: {
    name: string;
    brand: string;
    category: string;
    subCategory: string;
    productType: string;
    specifications: Record<string, unknown>;
    description?: string;
  }): string {
    // Structured text optimized for embedding quality
    const specs = Object.entries(product.specifications)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    return [
      product.name,
      `Brand: ${product.brand}`,
      `Category: ${product.category} > ${product.subCategory} > ${product.productType}`,
      specs ? `Specifications: ${specs}` : '',
      product.description ?? '',
    ]
      .filter(Boolean)
      .join('. ');
  }
}
```

**Cost projection:**

| Scale | Products | Embedding Calls (full reindex) | Cost per Reindex | Monthly (daily incremental ~5% new/updated) |
|-------|----------|-------------------------------|------------------|---------------------------------------------|
| Current | 5,000 | 5,000 | ~$0.05 | ~$0.75 |
| Year 1 | 100,000 | 100,000 | ~$1.00 | ~$15.00 |
| Year 2 | 500,000 | 500,000 | ~$5.00 | ~$75.00 |

Negligible cost. OpenAI `text-embedding-3-small` is $0.02 per 1M tokens. Average product embedding text is ~100 tokens = $0.000002 per product.

---

## 23.6 Search Analytics

### 23.6.1 What We Track

Every search interaction is logged to the `search_analytics` table for offline analysis and search quality improvement.

```sql
CREATE TABLE search_analytics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID,                    -- Browser session for anonymous users
  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  query           TEXT NOT NULL,            -- Raw query string
  query_normalized TEXT NOT NULL,           -- Lowercased, trimmed, stopwords removed
  search_type     TEXT NOT NULL,            -- 'full_text', 'autocomplete', 'semantic', 'hybrid', 'facet_nav'
  result_count    INT NOT NULL,             -- Total hits from ES
  results_shown   INT NOT NULL,             -- How many results rendered on page
  facets_applied  JSONB DEFAULT '{}',       -- Filters used: {"brand": "Havells", "priceMax": 50000}
  sort_applied    TEXT,                     -- 'relevance', 'price_asc', etc.
  search_time_ms  INT NOT NULL,             -- ES response time
  total_time_ms   INT NOT NULL,             -- Full API response time
  clicked_result_id    UUID,               -- Product ID the user clicked (null if no click)
  clicked_result_rank  INT,                -- Position of clicked result (1-indexed)
  clicked_at           TIMESTAMPTZ,        -- Timestamp of click
  suggestion_shown     TEXT,               -- "Did you mean" suggestion if shown
  suggestion_accepted  BOOLEAN,            -- Did user click the suggestion
  device_type     TEXT,                     -- 'mobile', 'tablet', 'desktop'
  city            TEXT,                     -- User's city (from profile or IP geolocation)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_analytics_query ON search_analytics (query_normalized, created_at);
CREATE INDEX idx_search_analytics_no_results ON search_analytics (result_count, created_at) WHERE result_count = 0;
CREATE INDEX idx_search_analytics_user ON search_analytics (user_id, created_at);
CREATE INDEX idx_search_analytics_type ON search_analytics (search_type, created_at);
CREATE INDEX idx_search_analytics_click ON search_analytics (clicked_result_id) WHERE clicked_result_id IS NOT NULL;
```

### 23.6.2 Key Metrics Dashboard

| Metric | SQL/Computation | Target | Alert Threshold |
|--------|----------------|--------|-----------------|
| **Search Volume** | `COUNT(*) WHERE search_type = 'full_text' GROUP BY date` | Growing week-over-week | > 20% drop from previous week |
| **Zero-Result Rate** | `COUNT(*) WHERE result_count = 0 / COUNT(*)` | < 5% | > 10% |
| **Click-Through Rate (CTR)** | `COUNT(*) WHERE clicked_result_id IS NOT NULL / COUNT(*)` | > 30% | < 15% |
| **Mean Reciprocal Rank (MRR)** | `AVG(1.0 / clicked_result_rank) WHERE clicked_result_rank IS NOT NULL` | > 0.5 (clicked in top 2 on average) | < 0.3 |
| **Search Abandonment** | Sessions with search but no click and no filter change | < 40% | > 60% |
| **Autocomplete Acceptance** | Autocomplete suggestions clicked / shown | > 25% | < 10% |
| **Average Search Latency** | `AVG(total_time_ms) WHERE search_type = 'full_text'` | < 300ms | > 600ms |
| **Top No-Result Queries** | `query_normalized, COUNT(*) WHERE result_count = 0 GROUP BY query_normalized ORDER BY count DESC LIMIT 20` | Weekly review, add synonyms or products | -- |
| **Top Queries** | `query_normalized, COUNT(*) GROUP BY query_normalized ORDER BY count DESC LIMIT 50` | Weekly review | -- |

### 23.6.3 Search Quality Feedback Loop

1. **Weekly**: Export top 20 zero-result queries. Add synonyms to `product_synonyms` filter or flag missing product categories.
2. **Weekly**: Review top 50 queries by volume. Ensure they return relevant results in top 3 positions.
3. **Monthly**: A/B test ranking algorithm changes (e.g., adjust `popularityScore` weight) using interleaved ranking.
4. **Monthly**: Review autocomplete suggestions quality. Add popular queries to a curated suggestion list.
5. **Quarterly**: Full search relevance audit. Sample 100 queries, manually judge top-5 results, compute NDCG@5.

---

---

# SECTION 24 -- COMPLETE FILE & FOLDER STRUCTURE

> *Every file in this section exists or will exist in the Hub4Estate monorepo. No dead files. No placeholder files. No "TODO" files. If a file is listed here, it has a defined purpose, known imports, known exports, and at least one dependent. This is the definitive reference for navigating the codebase.*

> *The structure reflects the CURRENT state of the codebase (React 18 + Vite frontend, Node.js + Express backend, both in the same repo) evolving toward the TARGET state (pnpm monorepo with packages/web, packages/api, packages/shared, packages/mobile). Both states are documented. Files marked with [TARGET] do not exist yet but are planned. Files without a marker exist today.*

---

## 24.1 Monorepo Root

```
hub4estate/
├── README.md                              # Project overview, quick-start commands, architecture diagram link
├── CLAUDE.md                              # AI assistant context: system prompt, constraints, platform overview
├── CONTRIBUTING.md                        # [TARGET] Contribution guidelines, PR process, code style
├── LICENSE                                # LLP proprietary license
├── .gitignore                             # Git ignore: node_modules, dist, .env, .DS_Store, *.log
├── .gitattributes                         # Git LFS rules for large binary files (PDFs, images)
├── .editorconfig                          # Editor config: indent_size=2, charset=utf-8, insert_final_newline
├── .nvmrc                                 # Node.js version: 20 (used by nvm/fnm for automatic switching)
├── .prettierrc                            # Prettier: printWidth=100, singleQuote=true, trailingComma='all', semi=true
├── .eslintrc.json                         # ESLint: extends recommended, TypeScript strict, React hooks rules
├── package.json                           # Root: workspaces definition, shared devDependencies, root scripts
├── package-lock.json                      # [CURRENT] npm lockfile (migrates to pnpm-lock.yaml at monorepo stage)
├── pnpm-workspace.yaml                    # [TARGET] Workspace: packages/web, packages/api, packages/shared, packages/mobile
├── turbo.json                             # [TARGET] Turborepo: pipeline for build, test, lint, typecheck, dev
├── tsconfig.base.json                     # [TARGET] Base TypeScript config inherited by all packages
├── docker-compose.yml                     # Local dev: PostgreSQL 15 + Redis 7 + Elasticsearch 8.12 + MinIO (S3-compat)
├── docker-compose.prod.yml                # [TARGET] Production compose for self-hosted fallback
├── Makefile                               # [TARGET] Common commands: make dev, make test, make build, make seed, make lint
├── amplify.yml                            # AWS Amplify build config (current deployment pipeline)
│
├── .github/                               # GitHub configuration
│   ├── workflows/
│   │   ├── ci.yml                         # PR checks: lint + typecheck + unit tests + build verification
│   │   ├── deploy-staging.yml             # [TARGET] Auto-deploy to staging on merge to develop
│   │   ├── deploy-production.yml          # [TARGET] Manual deploy to production on merge to main (with approval)
│   │   ├── security-scan.yml              # [TARGET] Daily: npm audit + gitleaks + OWASP ZAP baseline scan
│   │   └── stale.yml                      # [TARGET] Auto-close stale issues/PRs after 30 days inactivity
│   ├── PULL_REQUEST_TEMPLATE.md           # [TARGET] PR template: summary, type, testing checklist, screenshots
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md                  # [TARGET] Bug report template with repro steps
│   │   ├── feature_request.md             # [TARGET] Feature request template with user story format
│   │   └── config.yml                     # [TARGET] Issue template chooser config
│   └── CODEOWNERS                         # [TARGET] Review requirements: Shreshth approves all, CTO approves backend
│
├── .claude/                               # Claude Code configuration
│   └── settings.json                      # Claude Code project settings, hooks, commands
│
├── docs/                                  # All documentation lives here
│   ├── prd/
│   │   ├── DEFINITIVE-PRD-v2/             # This PRD, split into sections
│   │   │   ├── section-01-executive-foundation.md        # Company, founder, vision, traction
│   │   │   ├── section-02-audit-gap-analysis.md          # Current state audit, gap analysis
│   │   │   ├── section-03-04-market-architecture.md      # Market sizing, system architecture
│   │   │   ├── section-05-06-techstack-database.md       # Tech stack, database schema
│   │   │   ├── section-07-08-security-ai.md              # Security architecture, AI layer overview
│   │   │   ├── section-09-10-agents-design.md            # Agentic systems, design system
│   │   │   └── section-23-24-search-filestructure.md     # THIS FILE: search architecture, file structure
│   │   ├── pdf/                           # [TARGET] Generated PDF exports
│   │   └── generate-definitive-pdf.js     # [TARGET] Script to compile sections into single PDF
│   ├── architecture/
│   │   ├── ARCHITECTURE.md                # [TARGET] Architecture overview with Mermaid diagrams
│   │   ├── diagrams/                      # [TARGET] Mermaid source files for architecture diagrams
│   │   └── decisions/                     # [TARGET] Individual Architecture Decision Records (ADRs)
│   ├── api/
│   │   ├── API.md                         # [TARGET] API documentation overview and conventions
│   │   └── postman/                       # [TARGET] Postman/Insomnia collection for manual testing
│   ├── deployment/
│   │   ├── DEPLOYMENT.md                  # [TARGET] Deployment runbook: step-by-step for each environment
│   │   ├── ROLLBACK.md                    # [TARGET] Rollback procedures per service
│   │   └── INCIDENT_RESPONSE.md           # [TARGET] Incident classification, response SLA, communication template
│   ├── security/
│   │   ├── SECURITY.md                    # [TARGET] Security policies: auth, encryption, compliance
│   │   └── THREAT_MODEL.md               # [TARGET] STRIDE threat model for all surfaces
│   └── onboarding/
│       └── ONBOARDING.md                  # [TARGET] New engineer onboarding: setup, codebase tour, first PR
│
├── scripts/                               # Utility scripts (run from root)
│   ├── check-hub4estate.sh                # EC2 health check: API, RDS, SSL, HSTS, OAuth, port 3001
│   ├── seed-database.ts                   # [TARGET] Comprehensive seed: categories, brands, products, test dealers
│   ├── migrate.ts                         # [TARGET] Safe migration runner with backup + rollback
│   ├── generate-types.ts                  # [TARGET] Auto-generate TS types from Prisma schema
│   ├── reindex-elasticsearch.ts           # [TARGET] Manual full reindex trigger for all ES indices
│   └── backup-database.sh                 # [TARGET] pg_dump to S3 with encryption and retention
│
├── infrastructure/                        # [TARGET] Infrastructure as Code
│   ├── terraform/
│   │   ├── main.tf                        # Provider config: AWS ap-south-1, state in S3
│   │   ├── variables.tf                   # Input variables: environment, instance sizes, domain
│   │   ├── outputs.tf                     # Output values: endpoint URLs, security group IDs
│   │   ├── vpc.tf                         # VPC: 2 public subnets + 2 private subnets, NAT gateway
│   │   ├── rds.tf                         # PostgreSQL 15 RDS: db.t3.medium, 100GB gp3, multi-AZ staging/prod
│   │   ├── elasticache.tf                 # Redis 7 cluster: cache.t3.micro, 1 node dev, 2 nodes prod
│   │   ├── opensearch.tf                  # OpenSearch 8.12: r6g.large.search, 2 data nodes prod
│   │   ├── ecs.tf                         # ECS Fargate: API service + worker service, task definitions
│   │   ├── s3.tf                          # S3 buckets: uploads, backups, static assets + lifecycle policies
│   │   ├── cloudfront.tf                  # CDN: distribution for frontend + S3 assets
│   │   ├── route53.tf                     # DNS: hub4estate.com, api.hub4estate.com, admin.hub4estate.com
│   │   ├── iam.tf                         # IAM roles: ECS task role, Lambda role, CI/CD role
│   │   ├── alarms.tf                      # CloudWatch alarms: CPU, memory, 5xx rate, queue depth
│   │   ├── secrets.tf                     # AWS Secrets Manager: API keys, OAuth secrets, DB credentials
│   │   └── terraform.tfvars.example       # Template for variable values (NO actual secrets)
│   ├── docker/
│   │   ├── Dockerfile.api                 # Multi-stage: node:20-alpine build -> node:20-alpine runtime
│   │   ├── Dockerfile.worker              # Same as API but runs worker process instead of HTTP server
│   │   └── nginx.conf                     # [TARGET] Reverse proxy: SSL termination, rate limiting, gzip
│   └── scripts/
│       ├── setup-local.sh                 # One-command local setup: install deps, docker-compose up, migrate, seed
│       ├── deploy-api.sh                  # [TARGET] Build + push Docker image + update ECS service
│       └── health-check.sh                # [TARGET] Production health check: API, DB, ES, Redis, S3
│
├── generate_complete_spec.py              # Legacy: Python script that generated initial technical spec PDF
├── generate_product_specification.py      # Legacy: Python script for product spec PDF
├── generate_technical_spec.py             # Legacy: Python script for technical spec PDF
├── generate_ultra_detailed_spec.py        # Legacy: Python script for ultra-detailed spec PDF
├── Hub4Estate Internship.pdf              # Internship program document
├── Hub4Estate_Complete_Technical_Spec.pdf  # Generated technical spec (reference only)
├── Hub4Estate_Product_Specification.pdf   # Generated product spec (reference only)
├── Hub4Estate_Technical_Specification.pdf # Generated technical spec v1 (reference only)
├── Hub4Estate_Ultra_Detailed_Spec.pdf     # Generated ultra-detailed spec (reference only)
│
├── hub4estate-dealer-landing.html         # Standalone: Dealer-facing landing page (single-file HTML)
├── hub4estate-investor-v2.html            # Standalone: Investor pitch deck v2 (single-file HTML)
├── hub4estate-investor.html               # Standalone: Investor pitch deck v1 (single-file HTML)
├── hub4estate-pitch.html                  # Standalone: Original pitch deck (single-file HTML)
├── hub4estate-internship.html             # Standalone: Internship program page (single-file HTML)
│
├── frontend/                              # React 18 + Vite frontend application
│   └── (see 24.2)
│
└── backend/                               # Node.js + Express API server
    └── (see 24.3)
```

---

## 24.2 Frontend (`frontend/`)

### 24.2.1 Root Configuration Files

```
frontend/
├── package.json                           # Dependencies: react 18.3, react-dom, react-router-dom 6, zustand, @tanstack/react-query, axios, zod, lucide-react, recharts, framer-motion, tailwindcss
├── package-lock.json                      # npm lockfile
├── tsconfig.json                          # TypeScript: strict=true, paths @/* -> src/*, target ES2022, jsx react-jsx
├── tsconfig.node.json                     # TypeScript for Vite config file (node environment)
├── vite.config.ts                         # Vite 5.4: proxy /api -> localhost:3001, path aliases, chunk splitting (vendor-react, vendor-ui), build output to dist/
├── tailwind.config.js                     # Tailwind: custom colors (primary beige, accent terracotta), fonts (Inter, Playfair Display, JetBrains Mono), shadows (brutal-*, soft-*, glow), responsive breakpoints
├── postcss.config.js                      # PostCSS: tailwindcss + autoprefixer plugins
├── vercel.json                            # Vercel config: rewrites for SPA routing (/* -> /index.html)
├── index.html                             # Entry HTML: mounts React to #root, loads Inter + Playfair Display from Google Fonts
│
├── public/                                # Static assets (served as-is, not processed by Vite)
│   ├── favicon.ico                        # [TARGET] Hub4Estate favicon
│   ├── favicon.svg                        # [TARGET] SVG favicon for modern browsers
│   ├── apple-touch-icon.png               # [TARGET] iOS homescreen icon (180x180)
│   ├── manifest.json                      # [TARGET] PWA manifest: name, icons, theme_color, start_url
│   ├── robots.txt                         # [TARGET] Search engine crawling rules
│   └── sitemap.xml                        # [TARGET] XML sitemap for SEO
│
├── dist/                                  # Vite build output (gitignored in TARGET state, currently committed)
│   ├── index.html                         # Built HTML with hashed asset references
│   └── assets/                            # Hashed JS/CSS chunks
│       ├── index-*.js                     # Main app bundle
│       ├── index-*.css                    # Main CSS bundle (Tailwind output)
│       ├── vendor-react-*.js              # React + React DOM + React Router (split for caching)
│       ├── vendor-ui-*.js                 # UI libraries: recharts, framer-motion, lucide-react
│       ├── HomePage-*.js                  # Lazy-loaded page chunk
│       ├── AdminDashboard-*.js            # Lazy-loaded admin page chunk
│       └── ...                            # One chunk per lazy-loaded page
│
└── src/                                   # Source code
    ├── main.tsx                           # Entry: imports App, renders to #root with StrictMode
    ├── App.tsx                            # Root component: AuthProvider, React Router, Layout, all routes with lazy()
    ├── vite-env.d.ts                      # Vite environment type declarations (ImportMetaEnv)
    │
    ├── components/                        # Reusable components (not page-specific)
    │   ├── Layout.tsx                     # Main layout: Header (nav, auth state, mobile menu) + Footer + ScrollToTop
    │   ├── AuthProvider.tsx               # Auth context: Google OAuth flow, JWT management, user state, logout
    │   ├── ProtectedRoute.tsx             # Route guard: redirects to login if unauthenticated, checks role
    │   ├── ErrorBoundary.tsx              # React error boundary: catches render errors, shows fallback UI
    │   ├── AIAssistantWidget.tsx          # Floating AI chat button + expandable chat window (bottom-right)
    │   ├── AISection.tsx                  # Homepage section: animated AI demo cards, step flow
    │   ├── InteractiveCategoryGrid.tsx    # Homepage section: animated category cards (MCBs, Wires, Switches, etc.)
    │   ├── RFQChat.tsx                    # Chat-style RFQ creation interface with AI guidance
    │   ├── SmartSlipScanner.tsx           # Camera/upload component: captures dealer slip, sends to OCR service
    │   ├── ElectricWireDivider.tsx        # Decorative section divider (animated wire illustration)
    │   ├── ElectricalCursor.tsx           # Custom cursor effect (lightning bolt on hover)
    │   │
    │   ├── common/                        # Generic shared components
    │   │   ├── ImagePreview.tsx           # Image preview modal: zoom, pan, download
    │   │   └── UserBadge.tsx              # User avatar + name + role badge component
    │   │
    │   ├── layouts/                       # Layout shells for different user types
    │   │   ├── AdminLayout.tsx            # Admin sidebar + topbar + breadcrumbs + content area
    │   │   ├── DealerLayout.tsx           # Dealer sidebar (dashboard, inquiries, quotes, inventory, profile)
    │   │   ├── ProfessionalLayout.tsx     # Professional sidebar (dashboard, projects, onboarding, profile)
    │   │   ├── UserLayout.tsx             # User sidebar (dashboard, RFQs, messages, saved products)
    │   │   └── index.ts                   # Barrel export for all layout components
    │   │
    │   └── ui/                            # Base design system components
    │       ├── OTPInput.tsx               # 6-digit OTP input with auto-focus, paste support, countdown timer
    │       └── index.tsx                  # Barrel export + shared UI primitives (Button, Input, etc.)
    │
    ├── pages/                             # Page components (one per route, lazy-loaded via React.lazy)
    │   ├── HomePage.tsx                   # Landing page: hero, category grid, how-it-works, AI section, testimonials, CTA
    │   ├── AboutPage.tsx                  # Company story, founder section, mission, team
    │   ├── ContactPage.tsx                # Contact form (name, email, phone, role, message) -> POST /api/v1/contact
    │   ├── ComparePage.tsx                # Side-by-side product comparison (up to 4 products, spec diff highlighting)
    │   ├── TrackInquiryPage.tsx           # Public inquiry tracker: enter inquiry number -> see status timeline
    │   ├── AIAssistantPage.tsx            # Full-page AI chat: procurement assistant with rich product cards
    │   ├── SmartSlipScanPage.tsx          # Dedicated page for dealer slip scanning (camera + upload + result)
    │   ├── MessagesPage.tsx               # In-app messaging: conversation list + message thread
    │   ├── JoinTeamPage.tsx               # Internship/careers page with application form
    │   ├── PrivacyPage.tsx                # Privacy policy (static content)
    │   ├── TermsPage.tsx                  # Terms of service (static content)
    │   │
    │   ├── auth/                          # Authentication pages
    │   │   ├── UserAuthPage.tsx           # ACTIVE login page: Google OAuth button + phone OTP (replaces deleted LoginPage.tsx)
    │   │   ├── DealerLoginPage.tsx        # Dealer login: email + password + OTP verification
    │   │   ├── AdminLoginPage.tsx         # Admin login: email + password (no OAuth)
    │   │   ├── AuthCallback.tsx           # Google OAuth callback handler: exchanges code, stores JWT, redirects
    │   │   ├── RoleSelectionPage.tsx      # Post-registration: user selects role (homeowner, builder, architect, etc.)
    │   │   └── ProfileCompletionPage.tsx  # Post-role-selection: complete profile (city, phone, purpose)
    │   │
    │   ├── products/                      # Product catalog pages
    │   │   ├── CategoriesPage.tsx         # All categories grid: MCBs, Wires, Switches, Fans, Lighting, etc.
    │   │   ├── CategoryDetailPage.tsx     # Single category: subcategories, featured products, filters sidebar
    │   │   ├── ProductTypePage.tsx        # Product type listing: filterable product grid with facets
    │   │   └── ProductDetailPage.tsx      # Single product: gallery, specs table, price range, dealer count, alternatives, BOQ link
    │   │
    │   ├── rfq/                           # RFQ (Request for Quote) flow
    │   │   ├── CreateRFQPage.tsx          # Multi-step RFQ: select products, quantities, delivery, preferences, review, submit
    │   │   ├── MyRFQsPage.tsx             # List of user's RFQs with status badges, filters, sort
    │   │   └── RFQDetailPage.tsx          # Single RFQ: items, received quotes (blind), comparison, dealer selection
    │   │
    │   ├── user/                          # User dashboard
    │   │   └── UserDashboard.tsx          # Overview: active RFQs, recent quotes, saved products, spend summary
    │   │
    │   ├── dealer/                        # Dealer portal
    │   │   ├── DealerDashboard.tsx        # Overview: incoming inquiries, quote stats, conversion rate, revenue
    │   │   ├── DealerOnboarding.tsx       # Multi-step onboarding: business info, KYC docs, brands, service areas
    │   │   ├── DealerAvailableInquiriesPage.tsx  # Feed of inquiries matching dealer's brands/categories/service areas
    │   │   ├── DealerQuoteSubmitPage.tsx  # Submit quote for a specific inquiry: per-item pricing, delivery, notes
    │   │   ├── DealerQuotesPage.tsx       # All submitted quotes: status, win/loss, performance metrics
    │   │   ├── DealerRFQsPage.tsx         # RFQs matched to this dealer (from RFQ system)
    │   │   ├── DealerProfilePage.tsx      # Public dealer profile editor: description, photos, certifications
    │   │   └── DealerRegistrationStatus.tsx  # Post-registration: verification status, pending docs, next steps
    │   │
    │   ├── professional/                  # Professional portal (architects, contractors, electricians)
    │   │   ├── ProfessionalDashboard.tsx  # Overview: verification status, project count, activity feed
    │   │   ├── ProfessionalOnboarding.tsx # Onboarding: business info, documents, portfolio, verification
    │   │   └── ProfessionalProfilePage.tsx  # Public profile editor: bio, portfolio, certifications, reviews
    │   │
    │   ├── community/                     # Community forum
    │   │   ├── CommunityPage.tsx          # Feed: posts sorted by recent/popular, category filter, create post CTA
    │   │   └── PostDetailPage.tsx         # Single post: content, comments thread, upvote, share
    │   │
    │   ├── knowledge/                     # Knowledge base / educational content
    │   │   └── KnowledgePage.tsx          # Article listing: categories, search, featured articles
    │   │
    │   └── admin/                         # Admin panel (protected: role=admin or super_admin)
    │       ├── AdminDashboard.tsx         # Overview: GMV, users, dealers, inquiries, system health, recent activity
    │       ├── AdminDealersPage.tsx       # Dealer management: list, verify, reject, suspend, view details
    │       ├── AdminInquiriesPage.tsx     # Inquiry management: list, assign, respond, track pipeline
    │       ├── AdminInquiryPipelinePage.tsx  # Pipeline view: Kanban board (brand identified -> dealers found -> quoted -> sent)
    │       ├── AdminProductsPage.tsx      # Product catalog management: CRUD categories, products, brands
    │       ├── AdminBrandDealersPage.tsx   # External brand-dealer directory: manage scraped/manual dealer contacts
    │       ├── AdminRFQsPage.tsx          # RFQ management: list, flag, resolve disputes
    │       ├── AdminLeadsPage.tsx         # Contact form submissions: list, qualify, assign, track
    │       ├── AdminCRMPage.tsx           # CRM: companies, contacts, outreach tracking, pipeline stages
    │       ├── AdminChatsPage.tsx         # AI chat session viewer: browse user conversations, monitor AI quality
    │       ├── AdminProfessionalsPage.tsx # Professional verification: review docs, approve, reject
    │       ├── AdminFraudPage.tsx         # Fraud dashboard: flagged entities, severity, investigation status
    │       ├── AdminScraperPage.tsx       # Web scraper control: trigger brand-dealer scraping, view results
    │       ├── AdminAnalyticsPage.tsx     # Analytics: user growth, GMV, conversion funnels, search quality
    │       └── AdminSettingsPage.tsx      # System settings: feature flags, email templates, notification config
    │
    ├── hooks/                             # Custom React hooks
    │   └── useInView.ts                   # Intersection Observer hook for scroll-triggered animations
    │
    ├── contexts/                          # React contexts
    │   └── LanguageContext.tsx             # i18n context: language state, translation function, locale switching
    │
    ├── i18n/                              # Internationalization
    │   └── translations.ts                # Translation strings: English + Hindi key-value maps
    │
    ├── lib/                               # Utilities and service clients
    │   ├── api.ts                         # Axios instance: baseURL from VITE_BACKEND_API_URL, JWT interceptor, error handling, refresh token logic
    │   ├── store.ts                       # Zustand stores: authStore (user, tokens, login/logout), uiStore (sidebar, modals), inquiryBuilderStore (multi-step form state)
    │   └── analytics.ts                   # PostHog client: init, identify, track events, page views
    │
    ├── styles/
    │   └── (styles are in index.css)
    │
    └── index.css                          # Tailwind directives (@tailwind base/components/utilities), custom CSS: scrollbar styling, selection color, focus ring, animation keyframes
```

### 24.2.2 Target State Additions (packages/web/)

When migrating to the pnpm monorepo, the following new directories and files are added to the frontend:

```
packages/web/                              # [TARGET] Replaces frontend/
├── (all files from frontend/ above)
│
├── src/
│   ├── app/                               # [TARGET] Application shell (new directory)
│   │   ├── routes.tsx                     # Complete route tree with lazy imports (extracted from App.tsx)
│   │   ├── providers.tsx                  # Provider composition: QueryClient, Auth, Toast, Language
│   │   └── layouts/
│   │       ├── RootLayout.tsx             # Outermost: HTML head, global error boundary, scroll restoration
│   │       ├── PublicLayout.tsx           # Header + content + footer (for unauthenticated pages)
│   │       ├── DashboardLayout.tsx        # Generic dashboard shell: sidebar + topbar + content
│   │       └── AuthLayout.tsx             # Centered card layout for login/register screens
│   │
│   ├── components/
│   │   ├── ui/                            # [TARGET] Expanded design system (40+ components)
│   │   │   ├── Button.tsx                 # Variants: primary, secondary, outline, ghost, destructive. Sizes: sm, md, lg
│   │   │   ├── Input.tsx                  # Text input with label, helper text, error state, icon prefix/suffix
│   │   │   ├── Select.tsx                 # Native select with custom styling, searchable dropdown variant
│   │   │   ├── Textarea.tsx               # Multi-line input with char count, auto-resize
│   │   │   ├── Card.tsx                   # Card container: default, elevated, outlined, interactive (hover lift)
│   │   │   ├── Badge.tsx                  # Status badges: success, warning, error, info, neutral. Dot and pill variants
│   │   │   ├── Avatar.tsx                 # User avatar: image, initials fallback, status indicator
│   │   │   ├── Modal.tsx                  # Dialog overlay: title, body, footer actions, close on escape/backdrop
│   │   │   ├── Drawer.tsx                 # Slide-in panel: left or right, for filters and detail views
│   │   │   ├── Toast.tsx                  # Notification toasts: success, error, info, warning. Auto-dismiss
│   │   │   ├── Tooltip.tsx                # Hover tooltip: configurable placement, delay, content
│   │   │   ├── Dropdown.tsx               # Dropdown menu: items, separators, nested groups
│   │   │   ├── Table.tsx                  # Data table: sortable headers, row selection, pagination, empty state
│   │   │   ├── Tabs.tsx                   # Tab navigation: horizontal, vertical, with badges/counts
│   │   │   ├── Accordion.tsx              # Collapsible sections: single or multi-expand
│   │   │   ├── Skeleton.tsx               # Loading placeholder: text, card, avatar, table row variants
│   │   │   ├── EmptyState.tsx             # Empty state: illustration, title, description, action button
│   │   │   ├── Spinner.tsx                # Loading spinner: sizes sm/md/lg, color variants
│   │   │   ├── Progress.tsx               # Progress bar: determinate, indeterminate, circular
│   │   │   ├── Stepper.tsx                # Multi-step indicator: horizontal, numbered, with labels
│   │   │   ├── Rating.tsx                 # Star rating: display and interactive (1-5 stars)
│   │   │   ├── FileUpload.tsx             # Drag-and-drop file upload: image preview, size limit, type validation
│   │   │   ├── DatePicker.tsx             # Date picker: calendar popup, range selection, min/max dates
│   │   │   ├── SearchInput.tsx            # Search input: debounced onChange, clear button, loading indicator
│   │   │   ├── Pagination.tsx             # Page navigation: prev/next, page numbers, jump to page
│   │   │   ├── Breadcrumbs.tsx            # Breadcrumb navigation: auto-generated from route path
│   │   │   ├── Tag.tsx                    # Removable tag/chip: for multi-select, filter display
│   │   │   ├── Switch.tsx                 # Toggle switch: on/off with label
│   │   │   ├── Checkbox.tsx               # Checkbox: single, group, indeterminate state
│   │   │   ├── Radio.tsx                  # Radio group: horizontal, vertical layouts
│   │   │   ├── Divider.tsx                # Horizontal/vertical divider with optional label
│   │   │   ├── Alert.tsx                  # Alert banner: info, success, warning, error. Dismissible
│   │   │   └── index.ts                   # Barrel export for all UI components
│   │   │
│   │   ├── forms/                         # [TARGET] Domain-specific form components
│   │   │   ├── InquiryForm.tsx            # Product inquiry form: name, phone, product details, quantity, city
│   │   │   ├── QuoteForm.tsx              # Dealer quote submission: per-item pricing, delivery, terms
│   │   │   ├── DealerRegistrationForm.tsx # Multi-step dealer registration: business info, KYC, brands, areas
│   │   │   ├── ProductFilterForm.tsx      # Catalog filter sidebar: brand, price, specs, certifications
│   │   │   ├── ProfileForm.tsx            # User profile edit: name, phone, city, role, avatar
│   │   │   ├── AddressForm.tsx            # Address input: street, city, state, pincode with validation
│   │   │   └── KycUploadForm.tsx          # Document upload: GST cert, PAN card, trade license, shop photo
│   │   │
│   │   └── features/                      # [TARGET] Feature-specific component groups
│   │       ├── catalog/
│   │       │   ├── ProductCard.tsx         # Product tile: thumbnail, name, brand, price range, dealer count, CTA
│   │       │   ├── ProductGrid.tsx         # Responsive grid of ProductCards with loading skeleton
│   │       │   ├── ProductGallery.tsx      # Image gallery: thumbnails, zoom, fullscreen
│   │       │   ├── PriceChart.tsx          # Price history line chart (Recharts)
│   │       │   ├── SpecTable.tsx           # Two-column specification table with comparison highlight
│   │       │   └── CategoryTree.tsx        # Collapsible category navigation tree
│   │       ├── inquiry/
│   │       │   ├── InquiryCard.tsx         # Inquiry summary card: number, status, product, date
│   │       │   ├── InquiryItemBuilder.tsx  # Add/remove products to inquiry with quantity selector
│   │       │   ├── QuoteCard.tsx           # Single dealer quote display (blind: no dealer name shown to buyer)
│   │       │   ├── QuoteComparison.tsx     # Side-by-side quote comparison table
│   │       │   └── SavingsCalculator.tsx   # Visual: MRP vs Hub4Estate price with savings percentage
│   │       ├── dealer/
│   │       │   ├── DealerCard.tsx          # Dealer profile card: name, rating, response time, brands
│   │       │   ├── InventoryTable.tsx      # Editable inventory: products, quantities, pricing
│   │       │   ├── MetricsCard.tsx         # Single metric display: value, label, trend arrow, sparkline
│   │       │   └── KycStatusBanner.tsx     # Verification status banner: pending, under review, verified, rejected
│   │       ├── order/
│   │       │   ├── OrderCard.tsx           # Order summary card: items, total, status, tracking
│   │       │   ├── OrderTimeline.tsx       # Vertical timeline: order placed -> confirmed -> shipped -> delivered
│   │       │   └── PaymentSummary.tsx      # Payment breakdown: subtotal, shipping, tax, total
│   │       ├── messaging/
│   │       │   ├── ConversationList.tsx    # Sidebar: conversation threads with last message preview
│   │       │   ├── MessageBubble.tsx       # Single message: text, timestamp, read receipt, sender alignment
│   │       │   ├── MessageInput.tsx        # Message composer: text input, file attach, send button
│   │       │   └── ChatWindow.tsx          # Message thread container: messages + input + header
│   │       ├── ai/
│   │       │   ├── AiChatBubble.tsx        # Floating chat trigger button (bottom-right corner)
│   │       │   ├── AiChatWindow.tsx        # Expandable chat interface with message history
│   │       │   ├── AiMessageBubble.tsx     # AI message: markdown rendering, product cards, action buttons
│   │       │   └── SlipScanner.tsx         # Camera capture + OCR result display for dealer slips
│   │       ├── community/
│   │       │   ├── PostCard.tsx            # Community post card: title, preview, author, upvotes, comments
│   │       │   ├── CommentThread.tsx       # Nested comment tree with reply, upvote, collapse
│   │       │   ├── CreatePostForm.tsx      # New post: title, content (rich text), category, tags
│   │       │   └── PollWidget.tsx          # [TARGET] Embedded poll: options, vote, results bar chart
│   │       ├── analytics/
│   │       │   ├── StatCard.tsx            # Dashboard stat: icon, value, label, delta, trend
│   │       │   ├── LineChart.tsx           # Recharts wrapper: time series, responsive, tooltip
│   │       │   ├── BarChart.tsx            # Recharts wrapper: grouped/stacked bars, responsive
│   │       │   ├── PieChart.tsx            # Recharts wrapper: donut variant, legend, responsive
│   │       │   └── DataTable.tsx           # Advanced table: sorting, filtering, export, column resize
│   │       └── admin/
│   │           ├── UserTable.tsx           # Admin user list: search, filter by role, status actions
│   │           ├── KycReviewCard.tsx       # KYC document review: document viewer, approve/reject buttons
│   │           ├── DisputeCard.tsx         # Dispute detail: parties, timeline, resolution actions
│   │           └── SystemHealthCard.tsx    # System status: API, DB, ES, Redis health indicators
│   │
│   ├── hooks/                             # [TARGET] Expanded hooks library
│   │   ├── api/                           # React Query hooks (one per API domain)
│   │   │   ├── useProducts.ts             # Product list query with search, filter, pagination
│   │   │   ├── useProduct.ts              # Single product query by slug/ID
│   │   │   ├── useInquiries.ts            # User's inquiry list query
│   │   │   ├── useInquiry.ts              # Single inquiry detail query
│   │   │   ├── useQuotes.ts               # Quotes for an inquiry
│   │   │   ├── useOrders.ts               # Order list and detail queries
│   │   │   ├── useDealer.ts               # Dealer profile, stats, inventory queries
│   │   │   ├── useNotifications.ts        # Notification list, unread count, mark read mutation
│   │   │   ├── useConversations.ts        # Message conversations and threads
│   │   │   ├── useCommunity.ts            # Community posts, comments, votes
│   │   │   ├── useAnalytics.ts            # Dashboard analytics data queries
│   │   │   ├── useAdmin.ts                # Admin-specific queries: users, dealers, disputes
│   │   │   └── useAi.ts                   # AI chat: send message mutation, session history query
│   │   ├── ui/                            # UI utility hooks
│   │   │   ├── useMediaQuery.ts           # Responsive breakpoint detection
│   │   │   ├── useToast.ts                # Toast notification trigger
│   │   │   ├── useModal.ts                # Modal open/close state management
│   │   │   ├── useDebounce.ts             # Debounce value with configurable delay
│   │   │   ├── useInfiniteScroll.ts       # Intersection Observer for infinite scroll loading
│   │   │   └── useClickOutside.ts         # Detect clicks outside a ref element
│   │   └── auth/                          # Authentication hooks
│   │       ├── useAuth.ts                 # Current user, login, logout, isAuthenticated
│   │       ├── usePermissions.ts          # Role-based permission checks
│   │       └── useRequireAuth.ts          # Redirect to login if unauthenticated (used by ProtectedRoute)
│   │
│   ├── stores/                            # [TARGET] Zustand stores (extracted from lib/store.ts)
│   │   ├── authStore.ts                   # User state, tokens, login/logout actions
│   │   ├── inquiryBuilderStore.ts         # Multi-step inquiry creation state
│   │   ├── uiStore.ts                     # Sidebar collapse, active modal, mobile menu state
│   │   └── chatStore.ts                   # AI chat: messages, session ID, input state
│   │
│   ├── lib/                               # [TARGET] Expanded utilities
│   │   ├── api/
│   │   │   ├── client.ts                  # Axios instance with JWT interceptor, refresh logic, base URL
│   │   │   └── types.ts                   # API response wrapper types: ApiResponse<T>, PaginatedResponse<T>, ApiError
│   │   ├── utils/
│   │   │   ├── formatters.ts              # formatCurrency (INR), formatDate (IST), formatNumber, formatPhone
│   │   │   ├── validators.ts              # isValidPhone, isValidEmail, isValidGST, isValidPAN, isValidPincode
│   │   │   └── helpers.ts                 # slugify, debounce, throttle, classNames, generateId
│   │   ├── constants/
│   │   │   ├── routes.ts                  # Route path constants: ROUTES.HOME, ROUTES.CATALOG, ROUTES.ADMIN.DASHBOARD
│   │   │   ├── queryKeys.ts              # React Query key factories: queryKeys.products.list(filters), queryKeys.inquiry.detail(id)
│   │   │   └── config.ts                  # App config: API_URL, POSTHOG_KEY, feature flags
│   │   └── validations/
│   │       ├── auth.schema.ts             # Zod schemas: loginSchema, registerSchema, otpSchema
│   │       ├── inquiry.schema.ts          # Zod schemas: createInquirySchema, inquiryItemSchema
│   │       ├── dealer.schema.ts           # Zod schemas: dealerRegistrationSchema, kycSchema
│   │       ├── order.schema.ts            # Zod schemas: checkoutSchema, disputeSchema
│   │       └── common.schema.ts           # Zod schemas: addressSchema, phoneSchema, emailSchema
│   │
│   └── types/                             # [TARGET] TypeScript type definitions
│       ├── index.ts                       # Re-exports from @h4e/shared (when monorepo migrated)
│       ├── api.ts                         # API response types, request parameter types
│       └── ui.ts                          # UI-specific types: TableColumn, FilterOption, MenuItem
```

---

## 24.3 Backend (`backend/`)

### 24.3.1 Current Structure

```
backend/
├── package.json                           # Dependencies: express, prisma, @prisma/client, bcryptjs, jsonwebtoken, passport, passport-google-oauth20, cors, helmet, express-rate-limit, zod, @anthropic-ai/sdk, nodemailer, multer, sharp, bullmq, ioredis, @elastic/elasticsearch, msg91, winston
├── package-lock.json                      # npm lockfile
├── tsconfig.json                          # TypeScript: strict, outDir=dist, rootDir=src, paths
├── Dockerfile                             # [TARGET] Multi-stage build: install -> build -> runtime
├── .env.example                           # [TARGET] Template: DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, etc.
│
├── prisma/
│   ├── schema.prisma                      # COMPLETE Prisma schema: 35+ models, all enums, relations, indexes
│   └── migrations/                        # Prisma migration files (auto-generated, committed)
│       └── ...                            # Migration directories with SQL and metadata
│
├── dist/                                  # TypeScript build output (gitignored)
│   └── ...
│
└── src/
    ├── index.ts                           # Server entry: Express app, middleware chain, route mounting, port binding, graceful shutdown

    ├── config/
    │   ├── env.ts                         # Environment validation: loads .env, validates required vars with Zod, exports typed config object
    │   ├── database.ts                    # Prisma client singleton: connection pooling, logging config, middleware registration
    │   └── passport.ts                    # Passport.js: Google OAuth strategy config, serialize/deserialize user

    ├── middleware/
    │   ├── auth.ts                        # JWT verification: extracts Bearer token, verifies, attaches user to req. Separate flows for user/dealer/admin tokens
    │   ├── rateLimiter.ts                 # express-rate-limit: configurable windows per route group (auth: 5/min, search: 30/min, general: 60/min)
    │   ├── security.ts                    # Helmet config, CORS whitelist, CSP headers, HSTS. Fixed LDAP false positive that blocked OAuth
    │   └── validation.ts                  # Zod-based request validation middleware factory: validates body, query, params against schema

    ├── routes/
    │   ├── auth.routes.ts                 # POST /register, POST /login, POST /verify-otp, POST /send-otp, GET /google, GET /google/callback, POST /refresh, POST /logout, POST /dealer/login, POST /admin/login
    │   ├── products.routes.ts             # GET /categories, GET /categories/:slug, GET /categories/:slug/sub, GET /products, GET /products/:id, GET /products/search, POST /products/compare, GET /brands
    │   ├── inquiry.routes.ts              # POST /inquiries (create product inquiry from homepage form), GET /inquiries/:id, GET /inquiries/track/:number, PATCH /inquiries/:id/respond
    │   ├── rfq.routes.ts                  # POST /rfqs, GET /rfqs, GET /rfqs/:id, PATCH /rfqs/:id, POST /rfqs/:id/publish, POST /rfqs/:id/select-dealer
    │   ├── quote.routes.ts                # POST /quotes (dealer submits), GET /quotes/rfq/:rfqId, GET /quotes/dealer, PATCH /quotes/:id
    │   ├── dealer.routes.ts               # POST /dealers/register, GET /dealers/profile, PATCH /dealers/profile, POST /dealers/kyc, GET /dealers/dashboard, GET /dealers/available-inquiries
    │   ├── dealer-inquiry.routes.ts       # GET /dealer-inquiries (inquiries matched to dealer), POST /dealer-inquiries/:id/quote, PATCH /dealer-inquiries/:id/status
    │   ├── inquiry-pipeline.routes.ts     # GET /pipeline, POST /pipeline/:inquiryId/init, PATCH /pipeline/:id/status, POST /pipeline/:id/dealers, POST /pipeline/:id/send-to-customer
    │   ├── brand-dealer.routes.ts         # GET /brand-dealers, POST /brand-dealers, PATCH /brand-dealers/:id, DELETE /brand-dealers/:id (external dealer directory)
    │   ├── chat.routes.ts                 # POST /chat/message, GET /chat/sessions, GET /chat/sessions/:id, DELETE /chat/sessions/:id
    │   ├── community.routes.ts            # GET /community/posts, POST /community/posts, GET /community/posts/:id, POST /community/posts/:id/comments, POST /community/posts/:id/upvote
    │   ├── knowledge.routes.ts            # GET /knowledge/articles, GET /knowledge/articles/:slug, POST /knowledge/articles (admin)
    │   ├── notification.routes.ts         # GET /notifications, PATCH /notifications/:id/read, PATCH /notifications/read-all, GET /notifications/unread-count
    │   ├── contact.routes.ts              # POST /contact (contact form submission)
    │   ├── crm.routes.ts                  # CRUD /crm/companies, /crm/contacts, /crm/outreach, /crm/meetings, /crm/pipeline
    │   ├── scraper.routes.ts              # POST /scraper/brand-dealers/:brandSlug (trigger scraping), GET /scraper/status
    │   ├── slip-scanner.routes.ts         # POST /slip-scanner/scan (upload image -> OCR -> structured data)
    │   ├── database.routes.ts             # GET /database/health (DB connectivity check, admin only)
    │   ├── admin.routes.ts                # Admin-only routes: GET/PATCH /admin/dealers, /admin/users, /admin/inquiries, /admin/settings, /admin/analytics, /admin/fraud
    │   └── professional.routes.ts         # POST /professionals/register, PATCH /professionals/profile, POST /professionals/documents, GET /professionals/dashboard

    ├── services/
    │   ├── ai.service.ts                  # Claude API client: system prompt, tool definitions, message handling, token counting, response streaming
    │   ├── ai-parser.service.ts           # AI response parsing: extract product names, brands, quantities, prices from natural language
    │   ├── dealer-matching.service.ts     # Match inquiries to dealers: by brand, category, service area, capacity. Scoring and ranking logic
    │   ├── inquiry-pipeline.service.ts    # Pipeline orchestration: AI analysis -> dealer identification -> quote collection -> customer notification
    │   ├── activity.service.ts            # User activity tracking: log events (search, view, quote, purchase) to analytics tables
    │   ├── email.service.ts               # Nodemailer client: SMTP config, template rendering, HTML email construction, send queue
    │   ├── sms.service.ts                 # MSG91 client: OTP sending, transactional SMS, DLT template compliance
    │   ├── notification.service.ts        # Multi-channel notification dispatch: in-app, email, SMS, WhatsApp
    │   ├── ocr.service.ts                 # Dealer slip OCR: image preprocessing, Claude Vision API call, structured data extraction
    │   ├── token.service.ts               # JWT issuance: access token (15min RS256), refresh token (7-day opaque), revocation list in Redis
    │   └── scraper/
    │       ├── scraper.service.ts         # Web scraper: Puppeteer-based dealer directory scraping, rate limiting, dedup
    │       └── brands.config.ts           # Brand scraping config: URLs, selectors, mapping rules per brand website
```

### 24.3.2 Target State Additions (packages/api/)

```
packages/api/                              # [TARGET] Replaces backend/
├── (all files from backend/ above)
│
├── src/
│   ├── modules/                           # [TARGET] Domain modules (modular monolith pattern)
│   │   ├── auth/
│   │   │   ├── auth.routes.ts             # Route definitions
│   │   │   ├── auth.controller.ts         # Request handling, input validation, response formatting
│   │   │   ├── auth.service.ts            # Business logic: registration, login, OTP, OAuth flow, token management
│   │   │   ├── auth.middleware.ts         # JWT extraction, verification, role checking
│   │   │   ├── auth.schema.ts             # Zod schemas for auth endpoints
│   │   │   └── auth.types.ts              # TypeScript types: TokenPayload, TokenPair, AuthStrategy
│   │   │
│   │   ├── user/
│   │   │   ├── user.routes.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts            # Profile CRUD, role management, preferences, saved items
│   │   │   ├── user.schema.ts
│   │   │   └── user.types.ts
│   │   │
│   │   ├── dealer/
│   │   │   ├── dealer.routes.ts
│   │   │   ├── dealer.controller.ts
│   │   │   ├── dealer.service.ts          # Registration, KYC, onboarding, profile, dashboard data, inventory
│   │   │   ├── dealer.schema.ts
│   │   │   ├── dealer.types.ts
│   │   │   └── dealer-matching.service.ts # Inquiry-to-dealer matching algorithm
│   │   │
│   │   ├── catalog/
│   │   │   ├── catalog.routes.ts
│   │   │   ├── catalog.controller.ts
│   │   │   ├── catalog.service.ts         # Category CRUD, product CRUD, brand CRUD, spec management
│   │   │   ├── catalog.schema.ts
│   │   │   └── catalog.types.ts
│   │   │
│   │   ├── inquiry/
│   │   │   ├── inquiry.routes.ts
│   │   │   ├── inquiry.controller.ts
│   │   │   ├── inquiry.service.ts         # Product inquiry: create, respond, track, pipeline management
│   │   │   ├── inquiry.schema.ts
│   │   │   ├── inquiry.types.ts
│   │   │   └── inquiry-pipeline.service.ts # Pipeline orchestration: AI -> dealers -> quotes -> customer
│   │   │
│   │   ├── blind-match/
│   │   │   ├── blind-match.routes.ts
│   │   │   ├── blind-match.controller.ts
│   │   │   ├── blind-match.service.ts     # RFQ creation, quote submission, blind evaluation, dealer selection
│   │   │   ├── blind-match.schema.ts
│   │   │   └── blind-match.types.ts
│   │   │
│   │   ├── order/
│   │   │   ├── order.routes.ts
│   │   │   ├── order.controller.ts
│   │   │   ├── order.service.ts           # [TARGET] Order creation from awarded quote, status tracking, delivery confirmation
│   │   │   ├── order.schema.ts
│   │   │   └── order.types.ts
│   │   │
│   │   ├── payment/
│   │   │   ├── payment.routes.ts
│   │   │   ├── payment.controller.ts
│   │   │   ├── payment.service.ts         # [TARGET] Razorpay integration, escrow logic, refund processing
│   │   │   ├── payment.schema.ts
│   │   │   └── payment.types.ts
│   │   │
│   │   ├── messaging/
│   │   │   ├── messaging.routes.ts
│   │   │   ├── messaging.controller.ts
│   │   │   ├── messaging.service.ts       # Conversation management, message CRUD, read receipts
│   │   │   ├── messaging.schema.ts
│   │   │   └── messaging.types.ts
│   │   │
│   │   ├── notification/
│   │   │   ├── notification.routes.ts
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.service.ts    # Multi-channel dispatch: in-app, email, SMS, WhatsApp, push
│   │   │   ├── notification.schema.ts
│   │   │   └── notification.types.ts
│   │   │
│   │   ├── ai/
│   │   │   ├── ai.routes.ts
│   │   │   ├── ai.controller.ts
│   │   │   ├── ai.service.ts             # Claude API: system prompt, tool calling, streaming, token tracking
│   │   │   ├── ai-parser.service.ts       # Parse AI responses into structured product/price data
│   │   │   ├── ai.schema.ts
│   │   │   ├── ai.types.ts
│   │   │   ├── tools/                     # AI tool definitions (function calling)
│   │   │   │   ├── search-products.tool.ts      # Tool: search product catalog
│   │   │   │   ├── get-price-range.tool.ts      # Tool: get price range for a product
│   │   │   │   ├── find-dealers.tool.ts         # Tool: find dealers for a product + city
│   │   │   │   ├── create-inquiry.tool.ts       # Tool: create a product inquiry
│   │   │   │   ├── generate-boq.tool.ts         # Tool: generate Bill of Quantities
│   │   │   │   └── index.ts                     # Tool registry: all tools with schemas
│   │   │   └── agents/                    # Agent definitions (system prompts + tool sets)
│   │   │       ├── procurement-copilot.agent.ts   # Main chat agent: product discovery, pricing, recommendations
│   │   │       ├── negotiation.agent.ts           # [TARGET] Automated negotiation between buyer and dealer
│   │   │       ├── boq-generator.agent.ts         # BOQ generation agent: takes project desc, outputs material list
│   │   │       └── slip-analyzer.agent.ts         # Dealer slip analysis: OCR + structured extraction
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.routes.ts
│   │   │   ├── analytics.controller.ts
│   │   │   ├── analytics.service.ts       # Dashboard queries: user growth, GMV, conversion, search quality
│   │   │   ├── analytics.schema.ts
│   │   │   └── analytics.types.ts
│   │   │
│   │   ├── search/
│   │   │   ├── search.routes.ts           # GET /search/products, GET /search/autocomplete, GET /search/dealers
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts          # Query routing, result transformation, caching, fallback logic
│   │   │   ├── search.queries.ts          # Elasticsearch query builders (all queries from section 23.2)
│   │   │   ├── search.schema.ts           # Zod schemas for search parameters
│   │   │   ├── search.types.ts            # Search result types, facet types, autocomplete types
│   │   │   ├── search-indexer.middleware.ts # Prisma middleware: triggers ES index on write
│   │   │   ├── search-index.worker.ts     # BullMQ worker: processes index jobs
│   │   │   ├── search-reindex.job.ts      # Full reindex cron job (nightly)
│   │   │   ├── embedding.service.ts       # OpenAI embedding generation + caching
│   │   │   └── knowledge-graph.service.ts # Graph queries: frequently bought together, alternatives, BOQ data
│   │   │
│   │   ├── crm/
│   │   │   ├── crm.routes.ts
│   │   │   ├── crm.controller.ts
│   │   │   ├── crm.service.ts             # Company, contact, outreach, meeting, pipeline management
│   │   │   ├── crm.schema.ts
│   │   │   └── crm.types.ts
│   │   │
│   │   ├── community/
│   │   │   ├── community.routes.ts
│   │   │   ├── community.controller.ts
│   │   │   ├── community.service.ts       # Posts, comments, upvotes, moderation
│   │   │   ├── community.schema.ts
│   │   │   └── community.types.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.routes.ts
│   │       ├── admin.controller.ts
│   │       ├── admin.service.ts           # User mgmt, dealer verification, catalog admin, settings, fraud review
│   │       ├── admin.schema.ts
│   │       └── admin.types.ts
│   │
│   ├── jobs/                              # [TARGET] BullMQ job processors
│   │   ├── search-index.job.ts            # Process search indexing events
│   │   ├── search-reindex.job.ts          # Nightly full reindex
│   │   ├── notification.job.ts            # Async notification dispatch (email, SMS, WhatsApp)
│   │   ├── dealer-matching.job.ts         # Match new inquiries to eligible dealers
│   │   ├── price-update.job.ts            # [TARGET] Nightly price aggregation and popularityScore computation
│   │   ├── knowledge-graph.job.ts         # [TARGET] Nightly: compute frequently-bought-together, alternatives
│   │   ├── embedding-generation.job.ts    # [TARGET] Generate embeddings for new/updated products
│   │   └── cleanup.job.ts                 # [TARGET] Purge expired OTPs, old sessions, stale search analytics
│   │
│   ├── integrations/                      # [TARGET] Third-party service wrappers
│   │   ├── razorpay/
│   │   │   ├── razorpay.client.ts         # Razorpay SDK wrapper: order creation, payment verification, refund
│   │   │   └── razorpay.types.ts          # Razorpay webhook event types
│   │   ├── whatsapp/
│   │   │   ├── whatsapp.client.ts         # [TARGET] WhatsApp Business API: send template message, receive webhook
│   │   │   └── whatsapp.types.ts          # Message template types, webhook event types
│   │   ├── msg91/
│   │   │   ├── msg91.client.ts            # MSG91 SDK: send OTP, verify OTP, transactional SMS
│   │   │   └── msg91.types.ts             # SMS template types, delivery status types
│   │   ├── claude/
│   │   │   ├── claude.client.ts           # Anthropic SDK wrapper: create message, streaming, tool use
│   │   │   └── claude.types.ts            # Tool definition types, message types, usage types
│   │   ├── openai/
│   │   │   ├── openai.client.ts           # OpenAI SDK: embedding generation only (text-embedding-3-small)
│   │   │   └── openai.types.ts            # Embedding response types
│   │   ├── elasticsearch/
│   │   │   ├── es.client.ts               # Elasticsearch client: connection, auth, retry config
│   │   │   ├── es.indices.ts              # Index creation, settings, mappings for all 5 indices
│   │   │   └── es.types.ts                # Search request/response types
│   │   ├── s3/
│   │   │   ├── s3.client.ts               # AWS S3: upload, download, presigned URL, delete
│   │   │   └── s3.types.ts                # Upload options, bucket names, key patterns
│   │   ├── posthog/
│   │   │   ├── posthog.client.ts          # PostHog server-side: event tracking, feature flags
│   │   │   └── posthog.types.ts           # Event names, property types
│   │   └── google/
│   │       ├── geocoding.client.ts        # [TARGET] Google Maps Geocoding API: address -> lat/lng
│   │       └── geocoding.types.ts         # Geocoding response types
│   │
│   ├── queues/                            # [TARGET] BullMQ queue definitions
│   │   ├── search-index.queue.ts          # Queue: 'search-index', Redis connection, default job options
│   │   ├── notification.queue.ts          # Queue: 'notifications', priority-based processing
│   │   ├── dealer-matching.queue.ts       # Queue: 'dealer-matching'
│   │   └── index.ts                       # Queue registry: initialize all queues, dashboard setup
│   │
│   ├── utils/
│   │   ├── logger.ts                      # [TARGET] Winston structured logger: JSON format, correlation IDs, log levels
│   │   ├── errors.ts                      # [TARGET] Custom error classes: AppError, ValidationError, AuthError, NotFoundError, ForbiddenError
│   │   ├── response.ts                    # [TARGET] Standard response helpers: success(data), error(message), paginated(data, meta)
│   │   └── helpers.ts                     # [TARGET] Pure functions: generateId, slugify, sanitizeHtml, maskPhone, maskEmail
│   │
│   └── types/
│       ├── express.d.ts                   # Express type augmentation: req.user, req.dealer, req.admin
│       ├── auth.types.ts                  # TokenPayload, TokenPair, AuthStrategy enums
│       └── common.types.ts                # PaginationParams, SortParams, FilterParams
```

---

## 24.4 Shared Package (`packages/shared/`)

```
packages/shared/                           # [TARGET] Shared types, constants, validations
├── package.json                           # name: @h4e/shared, no runtime dependencies, only devDependencies (zod, typescript)
├── tsconfig.json                          # Extends ../../tsconfig.base.json, composite=true for project references
│
├── types/                                 # TypeScript interfaces shared between frontend and backend
│   ├── user.ts                            # User, UserRole, UserStatus, ProfessionalProfile
│   ├── dealer.ts                          # Dealer, DealerStatus, DealerType, DealerTier, DealerKyc
│   ├── product.ts                         # Product, Category, SubCategory, ProductType, Brand, Specification
│   ├── inquiry.ts                         # ProductInquiry, InquiryStatus, InquiryPipeline, InquiryDealerResponse
│   ├── quote.ts                           # Quote, QuoteItem, QuoteStatus, QuoteEvaluation
│   ├── rfq.ts                             # RFQ, RFQItem, RFQStatus, bid lifecycle types
│   ├── order.ts                           # Order, OrderItem, OrderStatus, DeliveryTracking
│   ├── payment.ts                         # Payment, PaymentStatus, EscrowAccount, PaymentMethod
│   ├── notification.ts                    # Notification, NotificationType, NotificationChannel, NotificationPreferences
│   ├── message.ts                         # Message, Conversation, ConversationParticipant
│   ├── community.ts                       # CommunityPost, CommunityComment, PostStatus, vote types
│   ├── search.ts                          # SearchParams, SearchResult, Facet, AutocompleteItem
│   ├── analytics.ts                       # DashboardMetrics, TimeSeriesData, FunnelData
│   └── index.ts                           # Barrel export: re-exports everything
│
├── constants/
│   ├── categories.ts                      # Category hierarchy: id, name, slug, subcategories, productTypes. Source of truth for taxonomy
│   ├── brands.ts                          # Known brands: id, name, slug, segment, qualityRating. ~50 electrical brands
│   ├── cities.ts                          # Supported cities: name, state, pincode ranges, coordinates. Starts with Sri Ganganagar, Jaipur
│   ├── permissions.ts                     # RBAC permission constants: PERMISSIONS.INQUIRY.CREATE, PERMISSIONS.DEALER.VERIFY, etc.
│   ├── enums.ts                           # Shared enums: UserRole, DealerStatus, InquiryStatus, etc. (mirrors Prisma enums)
│   ├── regex.ts                           # Validation regex: PHONE_REGEX, GST_REGEX, PAN_REGEX, EMAIL_REGEX, PINCODE_REGEX
│   └── index.ts                           # Barrel export
│
├── validations/
│   ├── auth.ts                            # Zod schemas: loginSchema, registerSchema, otpVerifySchema, passwordResetSchema
│   ├── inquiry.ts                         # Zod schemas: createInquirySchema, inquiryResponseSchema, inquiryFilterSchema
│   ├── dealer.ts                          # Zod schemas: dealerRegistrationSchema, kycUploadSchema, inventoryUpdateSchema
│   ├── product.ts                         # Zod schemas: productCreateSchema, productUpdateSchema, productSearchSchema
│   ├── common.ts                          # Zod schemas: phoneSchema, emailSchema, gstSchema, panSchema, pincodeSchema, addressSchema, paginationSchema
│   └── index.ts                           # Barrel export
│
├── utils/
│   ├── formatCurrency.ts                  # INR formatting: formatCurrency(58500) -> "Rs 585.00". Handles paisa conversion
│   ├── formatDate.ts                      # IST formatting: formatDate(iso) -> "8 Apr 2026, 2:35 PM IST". Relative: "2 hours ago"
│   ├── slugify.ts                         # URL-safe slug: slugify("Havells MCB 32A") -> "havells-mcb-32a"
│   ├── maskPii.ts                         # PII masking: maskPhone("+919024779018") -> "+91****9018", maskEmail -> "sh****@hub4estate.com"
│   └── index.ts                           # Barrel export
│
└── index.ts                               # Package root barrel: exports types, constants, validations, utils
```

**Dependency graph:**
- `packages/web` imports from `@h4e/shared` (types, constants, validations, utils)
- `packages/api` imports from `@h4e/shared` (types, constants, validations, utils)
- `packages/mobile` imports from `@h4e/shared` (types, constants, validations, utils)
- `@h4e/shared` has ZERO runtime dependencies. It is pure TypeScript types, Zod schemas, and utility functions.

---

## 24.5 Mobile Package (`packages/mobile/`)

```
packages/mobile/                           # [TARGET] React Native + Expo mobile app
├── package.json                           # Dependencies: expo 51+, react-native, expo-router, nativewind, @tanstack/react-query, zustand, zod, expo-camera, expo-image-picker
├── tsconfig.json                          # Extends ../../tsconfig.base.json, jsx=react-native
├── app.json                               # Expo config: name, slug, version, splash, icon, scheme
├── eas.json                               # EAS Build config: development, preview, production profiles
├── babel.config.js                        # Babel: preset expo, nativewind/babel
├── metro.config.js                        # Metro bundler: monorepo resolver for @h4e/shared
├── tailwind.config.js                     # NativeWind: same design tokens as web (shared from @h4e/shared)
├── global.css                             # NativeWind CSS entry point
│
├── assets/                                # Static assets
│   ├── icon.png                           # App icon (1024x1024)
│   ├── splash.png                         # Splash screen (1242x2436)
│   ├── adaptive-icon.png                  # Android adaptive icon
│   └── fonts/
│       └── Inter/                         # Self-hosted Inter font files (Regular, Medium, SemiBold, Bold)
│
├── app/                                   # Expo Router (file-based routing)
│   ├── _layout.tsx                        # Root layout: providers (QueryClient, Auth, Toast), global error boundary
│   ├── index.tsx                          # Home screen: hero, search bar, categories, recent inquiries
│   ├── (auth)/
│   │   ├── _layout.tsx                    # Auth layout: centered card
│   │   ├── login.tsx                      # Login: Google OAuth + Phone OTP
│   │   ├── verify-otp.tsx                 # OTP verification screen
│   │   └── complete-profile.tsx           # Profile completion: name, city, role
│   ├── (tabs)/
│   │   ├── _layout.tsx                    # Tab bar: Home, Search, Inquiries, Chat, Profile
│   │   ├── index.tsx                      # Home tab: dashboard for logged-in user, landing for anonymous
│   │   ├── search.tsx                     # Search tab: search bar + category browse + recent searches
│   │   ├── inquiries.tsx                  # Inquiries tab: my inquiries list
│   │   ├── chat.tsx                       # Chat tab: AI assistant
│   │   └── profile.tsx                    # Profile tab: user info, settings, logout
│   ├── catalog/
│   │   ├── [categorySlug].tsx             # Category detail screen
│   │   └── product/[id].tsx               # Product detail screen
│   ├── inquiry/
│   │   ├── create.tsx                     # Create inquiry flow
│   │   ├── [id].tsx                       # Inquiry detail with quotes
│   │   └── track.tsx                      # Track inquiry by number
│   ├── scanner/
│   │   └── index.tsx                      # Dealer slip scanner: camera, upload, OCR result
│   ├── dealer/                            # [TARGET] Dealer-specific screens (separate app or role-based)
│   │   ├── dashboard.tsx
│   │   ├── inquiries.tsx
│   │   └── quote/[id].tsx
│   └── settings/
│       ├── index.tsx                      # Settings list: notifications, language, privacy, about
│       ├── notifications.tsx              # Notification preferences
│       └── language.tsx                   # Language selection: English, Hindi
│
├── components/                            # Mobile-specific components
│   ├── ui/                                # Mobile design system (NativeWind-based)
│   │   ├── Button.tsx                     # Touchable button: variants, sizes, haptic feedback
│   │   ├── Input.tsx                      # Text input: label, error, icon
│   │   ├── Card.tsx                       # Card container
│   │   ├── Badge.tsx                      # Status badge
│   │   ├── Avatar.tsx                     # User avatar
│   │   ├── BottomSheet.tsx                # Bottom sheet modal (Gorhom bottom sheet)
│   │   ├── Toast.tsx                      # Toast notification
│   │   └── index.ts                       # Barrel export
│   ├── ProductCard.tsx                    # Product tile for list/grid view
│   ├── InquiryCard.tsx                    # Inquiry summary card
│   ├── QuoteCard.tsx                      # Dealer quote display
│   ├── SearchBar.tsx                      # Search input with autocomplete dropdown
│   ├── CategoryChip.tsx                   # Category pill button for horizontal scroll
│   └── AiChatMessage.tsx                  # AI message bubble with markdown support
│
├── hooks/
│   ├── useAuth.ts                         # Auth state, login, logout
│   ├── useApi.ts                          # API client setup (same Axios instance pattern as web)
│   └── useCamera.ts                       # Camera permission, capture, upload for slip scanner
│
├── lib/
│   ├── api.ts                             # Axios instance configured for mobile (AsyncStorage for token)
│   ├── storage.ts                         # AsyncStorage wrapper: getToken, setToken, clearToken
│   └── analytics.ts                       # PostHog React Native SDK: init, track, identify
│
└── stores/
    ├── authStore.ts                       # Zustand: user, tokens, login/logout (persisted to AsyncStorage)
    └── uiStore.ts                         # Zustand: bottom sheet state, active tab
```

---

## 24.6 Infrastructure (`infrastructure/`)

Full structure defined in 24.1 above. Additional detail on key files:

### 24.6.1 Docker Configuration

**`docker-compose.yml` (local development):**

```yaml
# hub4estate/docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: h4e-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: hub4estate
      POSTGRES_USER: hub4estate
      POSTGRES_PASSWORD: localdev123
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U hub4estate']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: h4e-redis
    ports:
      - '6379:6379'
    command: redis-server --maxmemory 100mb --maxmemory-policy allkeys-lru
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.12.2
    container_name: h4e-elasticsearch
    ports:
      - '9200:9200'
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - xpack.security.enrollment.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
      - cluster.name=h4e-dev
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ['CMD-SHELL', 'curl -s http://localhost:9200/_cluster/health | grep -q green']
      interval: 30s
      timeout: 10s
      retries: 5

  minio:
    image: minio/minio
    container_name: h4e-minio
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  elasticsearch_data:
  minio_data:
```

### 24.6.2 Dockerfile (API)

```dockerfile
# infrastructure/docker/Dockerfile.api

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
RUN npm ci --workspace=backend --include-workspace-root

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY . .
RUN cd backend && npx prisma generate && npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache dumb-init
ENV NODE_ENV=production
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/package.json ./
EXPOSE 3001
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

### 24.6.3 CI/CD Workflow

```yaml
# .github/workflows/ci.yml
name: CI
on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npx tsc --noEmit
      - run: cd backend && npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_DB: hub4estate_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: cd backend && npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/hub4estate_test
      - run: cd backend && npm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/hub4estate_test
          JWT_SECRET: test-secret-key
          NODE_ENV: test

  build:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: cd frontend && npm run build
      - run: cd backend && npm run build
```

---

## 24.7 File Dependency Map

This map shows critical dependency chains. When modifying a file on the left, all files on the right may be affected and must be regression-tested.

| Source File | Dependents |
|-------------|-----------|
| `backend/prisma/schema.prisma` | Every service file, every route file, `@h4e/shared/types/*`, search index mappings, seed scripts |
| `backend/src/config/env.ts` | Every service file (imports `config`), Dockerfile ENV declarations, `.env.example` |
| `backend/src/middleware/auth.ts` | Every protected route file, AuthProvider.tsx, api.ts (interceptor) |
| `frontend/src/lib/api.ts` | Every page component, every hook in `hooks/api/`, AuthProvider.tsx |
| `frontend/src/lib/store.ts` | App.tsx (authStore), Layout.tsx (uiStore), every page that reads auth state |
| `frontend/src/components/Layout.tsx` | App.tsx (wraps all routes), every page component (rendered within) |
| `@h4e/shared/types/index.ts` | Every file in web and api that imports shared types |
| `@h4e/shared/constants/categories.ts` | CategoriesPage, CategoryDetailPage, ProductFilterForm, catalog.service, search index mapping |
| `@h4e/shared/validations/common.ts` | Every form component, every route validation, dealer onboarding, inquiry creation |
| `docker-compose.yml` | Local dev setup, CI test job, `.env.example` (port numbers), backend config/database.ts |
| `search.queries.ts` | search.service.ts, search.controller.ts, search.routes.ts, AI tool definitions (search-products.tool.ts) |
| `knowledge-graph.service.ts` | boq-generator.agent.ts, ProductDetailPage (alternatives, frequently bought together), knowledge-graph.job.ts |

---

## 24.8 File Naming Conventions

| Convention | Pattern | Examples |
|-----------|---------|----------|
| React components | PascalCase.tsx | `ProductCard.tsx`, `AdminDashboard.tsx`, `KycReviewCard.tsx` |
| React pages | PascalCase + Page suffix | `CategoriesPage.tsx`, `DealerDashboard.tsx` (exception: dashboards) |
| React hooks | camelCase with use prefix | `useProducts.ts`, `useAuth.ts`, `useDebounce.ts` |
| Backend routes | kebab-case + .routes.ts | `auth.routes.ts`, `dealer-inquiry.routes.ts`, `brand-dealer.routes.ts` |
| Backend services | kebab-case + .service.ts | `ai.service.ts`, `dealer-matching.service.ts`, `inquiry-pipeline.service.ts` |
| Backend middleware | kebab-case + .middleware.ts | `auth.middleware.ts`, `rate-limiter.middleware.ts` |
| Shared types | kebab-case + .ts | `user.ts`, `dealer.ts`, `product.ts` |
| Shared validations | kebab-case + .ts | `auth.ts`, `inquiry.ts`, `common.ts` |
| Shared constants | kebab-case + .ts | `categories.ts`, `brands.ts`, `permissions.ts` |
| Zod schemas | camelCase + Schema suffix | `loginSchema`, `createInquirySchema`, `dealerRegistrationSchema` |
| Zustand stores | camelCase + Store suffix | `authStore`, `uiStore`, `inquiryBuilderStore` |
| BullMQ queues | kebab-case | `search-index`, `notifications`, `dealer-matching` |
| BullMQ workers | kebab-case + .worker.ts | `search-index.worker.ts`, `notification.worker.ts` |
| Database tables | snake_case (Prisma auto-maps from PascalCase) | `product_relationships`, `use_case_products`, `search_analytics` |
| ES indices | snake_case with h4e_ prefix | `h4e_products`, `h4e_dealers`, `h4e_inquiries` |
| Environment variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `JWT_SECRET`, `VITE_BACKEND_API_URL` |
| CSS classes | Tailwind utility classes (no custom class names except in index.css) | `bg-primary-50`, `text-accent-500`, `shadow-brutal` |

---

## 24.9 Dead File Prevention Rules

1. **No file without an import.** Every `.ts`/`.tsx` file must be imported by at least one other file or be an entry point (`main.tsx`, `index.ts`). CI lint check enforces this via `eslint-plugin-unused-imports`.
2. **No barrel exports of unused items.** `index.ts` barrel files must only re-export items that are actually consumed downstream.
3. **No commented-out code.** If code is commented out, it is dead. Delete it. Git history preserves everything.
4. **No `.example` or `.sample` files in `src/`.** Examples belong in `docs/` or inline comments.
5. **No `TODO` files.** TODOs go in issue tracker (GitHub Issues), not in source files.
6. **Weekly audit.** Run `npx ts-prune` to detect unused exports. Fix or delete within the same sprint.
7. **Legacy files** (`generate_*.py`, standalone HTML files) are in the repo root and are NOT part of the application. They are reference material only and should not be imported by any application code.

---

*End of Sections 23 & 24. This document is the definitive reference for Hub4Estate's search infrastructure and codebase structure. Every file, every index, every query, every directory has a defined purpose. A new engineer reads this and knows exactly where everything lives and how it connects.*
