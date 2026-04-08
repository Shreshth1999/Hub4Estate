# Hub4Estate Definitive PRD v2 -- Sections 17 & 18

> **Document**: section-17-18-realtime-payment  
> **Version**: 2.0.0  
> **Date**: 2026-04-08  
> **Author**: CTO Office, Hub4Estate  
> **Status**: Authoritative Reference  
> **Classification**: Internal -- Engineering  
> **Prerequisite Reading**: section-05-06-techstack-database.md (Models: Payment, Invoice, Conversation, Message, Notification, DealerSubscription, SubscriptionPlan), section-07-08-security-ai.md (Authentication, JWT structure), section-09-10-agents-design.md (Token budgets, BullMQ patterns)

---

# SECTION 17 -- REAL-TIME SYSTEMS ARCHITECTURE

> *Every real-time feature in this section is production-grade. No "Phase 2" hedging. Each subsystem defines its transport, authentication, event schema, scaling strategy, failure mode, and recovery behavior. If the real-time layer goes down, the platform degrades to polling -- never to data loss, never to inconsistent state.*

---

## 17.1 Socket.io Architecture

### 17.1.1 Server Configuration

Socket.io runs as an attached server on the same Express HTTP process. It shares the same port (3001) and the same EC2 instances managed by PM2 in cluster mode. This avoids a separate deployment unit while still allowing horizontal scaling via the Redis adapter.

```typescript
// packages/api/src/realtime/socket-server.ts

import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'ioredis';
import http from 'http';
import { config } from '../config/env';
import { verifySocketToken } from './middleware/socket-auth';
import { socketRateLimiter } from './middleware/socket-rate-limit';
import { registerEventHandlers } from './handlers';
import { logger } from '../utils/logger';

export function createSocketServer(httpServer: http.Server): Server {
  const io = new Server(httpServer, {
    // CORS: only allow production domains and local dev
    cors: {
      origin: [
        'https://hub4estate.com',
        'https://app.hub4estate.com',
        'https://www.hub4estate.com',
        ...(config.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:5173'] : []),
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },

    // Transport priority: WebSocket first, long-polling as fallback
    transports: ['websocket', 'polling'],

    // Upgrade timeout: how long to wait for WebSocket upgrade before falling back
    upgradeTimeout: 10000, // 10s

    // Heartbeat: server sends ping every 25s, expects pong within 60s
    pingInterval: 25000,
    pingTimeout: 60000,

    // Max message size: 1MB (prevents abuse via large payloads)
    maxHttpBufferSize: 1e6, // 1,048,576 bytes

    // Connection state recovery: if a client disconnects and reconnects within 2 minutes,
    // the server replays missed events from a Redis-backed buffer.
    // This prevents the "I refreshed the page and missed 3 quotes" problem.
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: false, // Always re-authenticate on recovery
    },

    // Adapter: Redis for multi-instance support (PM2 cluster mode, future horizontal scaling)
    // Configured below after pubClient/subClient initialization.

    // Compression: enabled for polling transport (WebSocket frames are already small)
    httpCompression: {
      threshold: 1024, // Only compress responses > 1KB
    },

    // Cookie: disabled (we use JWT, not session cookies)
    cookie: false,

    // Allow EIO3 clients: false (no legacy Socket.io v2 clients)
    allowEIO3: false,

    // Path: explicit to avoid collision with Express routes
    path: '/socket.io',

    // Serve client: false (client served from CDN/Vite bundle, not from backend)
    serveClient: false,
  });

  return io;
}
```

**Configuration parameter justification:**

| Parameter | Value | Why |
|-----------|-------|-----|
| `pingInterval` | 25,000ms | Detect dead connections within 85s worst case. AWS ALB idle timeout is 60s -- this keeps connection alive. |
| `pingTimeout` | 60,000ms | Generous timeout for mobile users on poor 3G/4G connections in Tier 2/3 Indian cities. |
| `maxHttpBufferSize` | 1MB | Chat messages are text-only (images go through S3). 1MB covers the largest possible JSON event payload. |
| `connectionStateRecovery` | 2 min | Covers page refreshes, brief network drops (entering elevator, switching WiFi). Beyond 2 min, client should refetch full state via REST. |
| `transports` | `['websocket', 'polling']` | WebSocket-first for low latency. Long-polling fallback for corporate proxies and older networks that block WebSocket. |
| `httpCompression.threshold` | 1KB | Small events (typing indicators, read receipts) skip compression overhead. Quote updates with metadata benefit from compression. |

### 17.1.2 Redis Adapter for Multi-Instance Scaling

Every PM2 worker (currently 2 on EC2 `t3.medium`) runs its own Socket.io instance. The Redis adapter ensures that an event emitted from Worker 1 reaches clients connected to Worker 2.

```typescript
// packages/api/src/realtime/redis-adapter.ts

import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { config } from '../config/env';
import { logger } from '../utils/logger';

// Dedicated Redis connections for Socket.io pub/sub
// These use Redis DB 5 (separate from session/cache/queue/ai-cache on DBs 0-4)
const SOCKET_REDIS_DB = 5;

export async function setupRedisAdapter(io: Server): Promise<void> {
  const redisOptions = {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD || undefined,
    db: SOCKET_REDIS_DB,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error('Socket.io Redis adapter: max retries exceeded, giving up');
        return null; // Stop retrying -- Socket.io falls back to in-memory adapter (single-instance only)
      }
      return Math.min(times * 200, 5000); // 200ms, 400ms, 600ms... max 5s
    },
    lazyConnect: false,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
    connectTimeout: 10000,
  };

  const pubClient = new Redis(redisOptions);
  const subClient = new Redis(redisOptions);

  pubClient.on('error', (err) => logger.error('Socket.io Redis pub error', { error: err.message }));
  subClient.on('error', (err) => logger.error('Socket.io Redis sub error', { error: err.message }));
  pubClient.on('connect', () => logger.info('Socket.io Redis pub connected'));
  subClient.on('connect', () => logger.info('Socket.io Redis sub connected'));

  await Promise.all([pubClient.ping(), subClient.ping()]);

  io.adapter(createAdapter(pubClient, subClient, {
    // Key prefix to avoid collision with other Redis usage
    key: 'h4e:socket',

    // Request timeout for adapter operations
    requestsTimeout: 5000,
  }));

  logger.info('Socket.io Redis adapter initialized', { db: SOCKET_REDIS_DB });
}
```

**Redis DB allocation (canonical reference -- extends table from section-05-06):**

| DB | Purpose | Eviction Policy |
|----|---------|-----------------|
| 0 | Sessions (express-session) | volatile-lru |
| 1 | Application cache (API responses, product data) | allkeys-lru |
| 2 | Rate limiting (express-rate-limit, socket rate limit) | volatile-ttl |
| 3 | Job queues (BullMQ) | noeviction |
| 4 | AI response cache | allkeys-lru |
| 5 | Socket.io pub/sub adapter | noeviction |
| 6 | Presence system (online/offline, typing, last-seen) | volatile-ttl |

### 17.1.3 Authentication Middleware

Every Socket.io connection must be authenticated. No anonymous connections. No exceptions.

```typescript
// packages/api/src/realtime/middleware/socket-auth.ts

import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userType: 'user' | 'dealer' | 'admin';
  role: string;
  tokenExp: number;
  deviceId: string;
}

/**
 * Socket.io authentication middleware.
 * Runs ONCE on connection handshake. Verifies JWT from:
 *   1. auth.token (Socket.io auth option -- preferred)
 *   2. query.token (fallback for environments where auth option is stripped)
 *
 * On success: attaches userId, userType, role to socket.
 * On failure: rejects connection with error code and human-readable message.
 */
export function verifySocketToken(
  socket: Socket,
  next: (err?: ExtendedError) => void
): void {
  const token =
    socket.handshake.auth?.token ||
    socket.handshake.query?.token as string;

  if (!token) {
    logger.warn('Socket auth failed: no token', {
      ip: socket.handshake.address,
      transport: socket.conn.transport.name,
    });
    return next(new Error('AUTHENTICATION_REQUIRED'));
  }

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET, {
      algorithms: ['RS256'],
      issuer: 'hub4estate',
      audience: 'hub4estate-api',
    }) as {
      sub: string;
      type: 'user' | 'dealer' | 'admin';
      role: string;
      exp: number;
      jti: string;
    };

    // Check if token is not expired (jwt.verify does this, but be explicit)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return next(new Error('TOKEN_EXPIRED'));
    }

    // Attach identity to socket
    const authSocket = socket as AuthenticatedSocket;
    authSocket.userId = payload.sub;
    authSocket.userType = payload.type;
    authSocket.role = payload.role;
    authSocket.tokenExp = payload.exp;
    authSocket.deviceId = socket.handshake.auth?.deviceId || 'unknown';

    logger.debug('Socket authenticated', {
      userId: payload.sub,
      userType: payload.type,
      socketId: socket.id,
    });

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new Error('TOKEN_EXPIRED'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new Error('TOKEN_INVALID'));
    }
    logger.error('Socket auth unexpected error', { error: err.message });
    return next(new Error('AUTHENTICATION_FAILED'));
  }
}
```

**Token expiry during active connection:**

JWT access tokens expire after 15 minutes (defined in section-07-08). A socket connection may live for hours. The server handles this:

```typescript
// packages/api/src/realtime/middleware/socket-token-refresh.ts

import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket-auth';
import { logger } from '../../utils/logger';

/**
 * Periodic token expiry check.
 * Every 60 seconds, scan all connected sockets.
 * If a socket's token expires within the next 2 minutes, emit 'auth:token_expiring'.
 * The client must respond with 'auth:refresh' containing a new token within 120 seconds.
 * If no refresh arrives, disconnect the socket.
 */
export function setupTokenExpiryMonitor(io: Server): void {
  const CHECK_INTERVAL_MS = 60_000;          // Check every 60s
  const EXPIRY_WARNING_WINDOW_S = 120;       // Warn 2 minutes before expiry
  const GRACE_PERIOD_AFTER_EXPIRY_S = 30;    // Allow 30s past expiry for refresh

  setInterval(() => {
    const now = Math.floor(Date.now() / 1000);

    io.sockets.sockets.forEach((socket) => {
      const authSocket = socket as AuthenticatedSocket;
      if (!authSocket.tokenExp) return;

      const timeUntilExpiry = authSocket.tokenExp - now;

      if (timeUntilExpiry <= 0 && Math.abs(timeUntilExpiry) > GRACE_PERIOD_AFTER_EXPIRY_S) {
        // Token expired beyond grace period -- disconnect
        logger.info('Socket disconnected: token expired beyond grace', {
          userId: authSocket.userId,
          socketId: socket.id,
          expiredAgo: Math.abs(timeUntilExpiry),
        });
        socket.emit('auth:expired', { reason: 'Token expired. Please reconnect.' });
        socket.disconnect(true);
      } else if (timeUntilExpiry > 0 && timeUntilExpiry <= EXPIRY_WARNING_WINDOW_S) {
        // Token expiring soon -- warn client
        socket.emit('auth:token_expiring', {
          expiresIn: timeUntilExpiry,
          message: 'Your session token is expiring. Send auth:refresh with a new token.',
        });
      }
    });
  }, CHECK_INTERVAL_MS);

  // Handle refresh event from client
  io.on('connection', (socket) => {
    socket.on('auth:refresh', async (data: { token: string }) => {
      try {
        const jwt = await import('jsonwebtoken');
        const payload = jwt.verify(data.token, process.env.JWT_ACCESS_SECRET!, {
          algorithms: ['RS256'],
          issuer: 'hub4estate',
          audience: 'hub4estate-api',
        }) as { sub: string; type: string; role: string; exp: number };

        const authSocket = socket as AuthenticatedSocket;

        // Verify same user -- prevent token swap attacks
        if (payload.sub !== authSocket.userId) {
          socket.emit('auth:refresh_failed', { reason: 'User mismatch' });
          socket.disconnect(true);
          return;
        }

        // Update token expiry on socket
        authSocket.tokenExp = payload.exp;
        socket.emit('auth:refresh_success', { expiresAt: payload.exp });

        logger.debug('Socket token refreshed', {
          userId: authSocket.userId,
          socketId: socket.id,
          newExp: payload.exp,
        });
      } catch {
        socket.emit('auth:refresh_failed', { reason: 'Invalid token' });
        // Don't disconnect immediately -- let grace period handle it
      }
    });
  });
}
```

**Client-side authentication flow:**

```typescript
// packages/web/src/lib/socket/socket-client.ts

import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket?.connected) return socket;

  const { accessToken, refreshAccessToken } = useAuthStore.getState();

  socket = io(import.meta.env.VITE_BACKEND_API_URL.replace('/api', ''), {
    path: '/socket.io',
    auth: {
      token: accessToken,
      deviceId: getDeviceId(), // Fingerprint from localStorage
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,       // Start at 1s
    reconnectionDelayMax: 30000,   // Cap at 30s
    randomizationFactor: 0.5,      // Jitter: 50%
    timeout: 20000,                // Connection timeout: 20s
    autoConnect: true,
  });

  // Handle token expiring
  socket.on('auth:token_expiring', async () => {
    const newToken = await refreshAccessToken();
    if (newToken && socket) {
      socket.emit('auth:refresh', { token: newToken });
    }
  });

  // Handle token expired -- full reconnect
  socket.on('auth:expired', () => {
    socket?.disconnect();
    // Trigger re-auth flow in UI
    useAuthStore.getState().handleSessionExpiry();
  });

  // Handle connection errors
  socket.on('connect_error', (err) => {
    if (err.message === 'TOKEN_EXPIRED' || err.message === 'AUTHENTICATION_REQUIRED') {
      // Try refreshing token before reconnect
      refreshAccessToken().then((newToken) => {
        if (newToken && socket) {
          socket.auth = { token: newToken, deviceId: getDeviceId() };
          socket.connect();
        }
      });
    }
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('h4e_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('h4e_device_id', deviceId);
  }
  return deviceId;
}
```

### 17.1.4 Namespace and Room Strategy

Hub4Estate uses a single namespace (`/`) with a structured room hierarchy. Namespaces are unnecessary overhead for this scale -- rooms provide all the isolation needed.

```
/ (default namespace)
│
├── user:{userId}                    # Personal channel for authenticated user
│   ├── Receives: notification:new, notification:count, order:status, price:alert, inquiry:awarded
│   └── Auto-joined on connection, auto-left on disconnect
│
├── inquiry:{inquiryId}              # Real-time updates for a specific inquiry/RFQ
│   ├── Receives: quote:new, quote:updated, quote:withdrawn, inquiry:expired, inquiry:awarded
│   ├── Joined by: buyer who created the inquiry
│   ├── Joined by: dealers who have submitted quotes (but they only see their own + aggregates)
│   └── NOTE: dealers see { quoteCount, bestPrice } but NOT other dealers' identities or individual bids
│
├── conversation:{conversationId}    # Chat messages for a conversation
│   ├── Receives: message:new, message:read, typing:start, typing:stop
│   ├── Joined by: conversation participants only (verified against ConversationParticipant table)
│   └── Context: tied to an RFQ, inquiry, or general support thread
│
├── dealer:dashboard:{dealerId}      # Live dashboard updates for a dealer
│   ├── Receives: dashboard:metric, new inquiry notifications matching dealer's categories/zones
│   ├── Joined by: the dealer (verified: socket.userId === dealerId AND socket.userType === 'dealer')
│   └── Updates: new matching inquiries, quote status changes, subscription alerts
│
├── admin:dashboard                  # Admin-only real-time metrics
│   ├── Receives: dashboard:metric (platform-wide), system alerts, moderation queue updates
│   ├── Joined by: admin users only (verified: socket.userType === 'admin')
│   └── Updates: every 5 seconds (aggregated metrics), instant for critical events
│
└── presence:{contextId}             # Online/offline presence for chat contexts
    ├── Receives: presence:join, presence:leave, presence:status
    ├── Joined by: users viewing a conversation or inquiry
    └── Data stored in Redis DB 6 with 60s TTL (refreshed on activity)
```

**Room authorization middleware:**

```typescript
// packages/api/src/realtime/middleware/room-auth.ts

import { AuthenticatedSocket } from './socket-auth';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

interface RoomJoinResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Validates whether a socket is authorized to join a specific room.
 * Called on every 'room:join' event. Prevents:
 *   - Room enumeration attacks (guessing inquiry IDs to snoop on bids)
 *   - Cross-user data leakage (dealer A joining dealer B's dashboard)
 *   - Unauthorized admin access
 */
export async function authorizeRoomJoin(
  socket: AuthenticatedSocket,
  room: string
): Promise<RoomJoinResult> {
  // Parse room type from room name
  const [roomType, ...idParts] = room.split(':');
  const roomId = idParts.join(':'); // Handles UUIDs with colons (they don't have them, but defensive)

  switch (roomType) {
    case 'user': {
      // Users can only join their own personal room
      if (roomId !== socket.userId) {
        return { allowed: false, reason: 'Cannot join another user\'s personal room' };
      }
      return { allowed: true };
    }

    case 'inquiry': {
      // Buyer: must be the inquiry creator
      // Dealer: must have submitted a quote OR be in matching categories/zones
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: roomId },
        select: { userId: true, status: true },
      });

      if (!inquiry) {
        return { allowed: false, reason: 'Inquiry not found' };
      }

      if (socket.userType === 'user' && inquiry.userId === socket.userId) {
        return { allowed: true };
      }

      if (socket.userType === 'dealer') {
        // Dealer can join if they have an active quote on this inquiry
        const quote = await prisma.dealerQuoteResponse.findFirst({
          where: { inquiryId: roomId, dealerId: socket.userId },
          select: { id: true },
        });
        if (quote) {
          return { allowed: true };
        }
        // Or if the inquiry is in PUBLISHED state and matches dealer's categories
        if (inquiry.status === 'PUBLISHED') {
          return { allowed: true }; // Matching logic handled at notification level
        }
      }

      if (socket.userType === 'admin') {
        return { allowed: true };
      }

      return { allowed: false, reason: 'Not authorized for this inquiry' };
    }

    case 'conversation': {
      // Must be a participant in the conversation
      const participant = await prisma.conversationParticipant.findFirst({
        where: {
          conversationId: roomId,
          OR: [
            { userId: socket.userType === 'user' ? socket.userId : undefined },
            { dealerId: socket.userType === 'dealer' ? socket.userId : undefined },
          ],
        },
        select: { id: true, isMuted: true },
      });

      if (!participant) {
        // Admins can join any conversation (for moderation)
        if (socket.userType === 'admin') {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Not a participant in this conversation' };
      }
      return { allowed: true };
    }

    case 'dealer': {
      // dealer:dashboard:{dealerId} -- dealer can only join their own dashboard
      const subParts = idParts; // ['dashboard', '{dealerId}']
      if (subParts[0] === 'dashboard') {
        const dashboardDealerId = subParts[1];
        if (socket.userType === 'dealer' && socket.userId === dashboardDealerId) {
          return { allowed: true };
        }
        if (socket.userType === 'admin') {
          return { allowed: true };
        }
        return { allowed: false, reason: 'Cannot access another dealer\'s dashboard' };
      }
      return { allowed: false, reason: 'Unknown dealer room type' };
    }

    case 'admin': {
      if (socket.userType !== 'admin') {
        return { allowed: false, reason: 'Admin rooms require admin role' };
      }
      return { allowed: true };
    }

    case 'presence': {
      // Presence rooms follow the same auth as the parent context
      // presence:{conversationId} requires being a conversation participant
      // For now, allow if user is authenticated (presence is low-risk)
      return { allowed: true };
    }

    default: {
      logger.warn('Unknown room type requested', { room, userId: socket.userId });
      return { allowed: false, reason: 'Unknown room type' };
    }
  }
}
```

### 17.1.5 Event Catalog -- Complete Schema

Every socket event in the system is defined here with its exact TypeScript payload type, direction, authorization rule, and processing behavior.

#### Server-to-Client Events

```typescript
// packages/shared/types/socket-events.ts

// ─────────────────────────────────────────
// QUOTE EVENTS (emitted to inquiry:{inquiryId} room)
// ─────────────────────────────────────────

/**
 * A new quote was submitted on an inquiry.
 * Sent to BUYER: shows aggregate data only (no dealer identity -- blind matching).
 * Sent to QUOTING DEALER: confirms their own submission.
 * NOT sent to other dealers.
 */
export interface QuoteNewEvent {
  inquiryId: string;
  quoteCount: number;           // Total quotes received so far
  bestPrice: number | null;     // Lowest total price in paisa (null if only 1 quote and no comparison)
  priceRange: {                 // Min/max range across all quotes
    min: number;                // Paisa
    max: number;                // Paisa
  } | null;
  averageDeliveryDays: number;  // Average promised delivery across all quotes
  timestamp: string;            // ISO 8601
}

/**
 * An existing quote was updated (price or delivery changed).
 * Sent to BUYER only. quoteId is the internal ID (buyer can see ranked list).
 * Dealer identities remain hidden.
 */
export interface QuoteUpdatedEvent {
  inquiryId: string;
  quoteId: string;              // The specific quote that was updated
  previousPrice: number;        // Paisa
  newPrice: number;             // Paisa
  previousDeliveryDays: number;
  newDeliveryDays: number;
  quoteCount: number;           // May not change
  bestPrice: number;            // Paisa (recalculated)
  timestamp: string;
}

/**
 * A quote was withdrawn by the dealer.
 * Sent to BUYER only.
 */
export interface QuoteWithdrawnEvent {
  inquiryId: string;
  quoteCount: number;           // Decremented
  bestPrice: number | null;     // Recalculated (null if 0 quotes remain)
  timestamp: string;
}

// ─────────────────────────────────────────
// NOTIFICATION EVENTS (emitted to user:{userId} room)
// ─────────────────────────────────────────

/**
 * A new notification created for this user.
 * Maps directly to the Notification model (section-05-06, Model 59).
 */
export interface NotificationNewEvent {
  id: string;                   // Notification.id
  type: NotificationType;       // Categorizes the notification for icon/color
  title: string;                // Short title: "New quote on your inquiry"
  body: string;                 // Detail: "3 dealers have quoted on 'MCB 32A x500'. Best price: Rs 45,000"
  data: Record<string, any> | null; // Deep-link payload: { screen: 'inquiry', inquiryId: '...' }
  createdAt: string;            // ISO 8601
}

export type NotificationType =
  | 'quote_received'            // Buyer: new quote on their inquiry
  | 'quote_selected'            // Dealer: their quote was selected
  | 'quote_rejected'            // Dealer: inquiry was awarded to someone else
  | 'inquiry_expired'           // Buyer/Dealer: inquiry deadline passed
  | 'inquiry_match'             // Dealer: new inquiry matches their categories
  | 'payment_received'          // Dealer: payment for subscription/lead pack
  | 'payment_failed'            // Dealer: subscription payment failed
  | 'subscription_expiring'     // Dealer: subscription expiring in 3 days
  | 'order_status_update'       // Buyer/Dealer: order status changed
  | 'message_received'          // User: new chat message
  | 'review_received'           // Dealer: new review posted
  | 'price_alert_triggered'     // User: tracked product hit target price
  | 'kyc_status_update'         // Dealer: KYC approved/rejected
  | 'system_announcement'       // All: platform announcement
  | 'lead_credit_low'           // Dealer: lead credits below 3
  | 'lead_credit_depleted';     // Dealer: 0 credits remaining

/**
 * Updated unread notification count.
 * Emitted after every notification:new AND after notification:read.
 */
export interface NotificationCountEvent {
  unreadCount: number;
}

// ─────────────────────────────────────────
// CHAT EVENTS (emitted to conversation:{conversationId} room)
// ─────────────────────────────────────────

/**
 * New message in a conversation.
 * Maps to Message model (section-05-06, Model 34).
 * NOTE: senderName is included ONLY if identity has been revealed
 * (inquiry awarded). Before award, sender is "Dealer" or "Buyer" (generic).
 */
export interface MessageNewEvent {
  id: string;                   // Message.id
  conversationId: string;
  senderId: string;             // userId or dealerId
  senderType: 'user' | 'dealer' | 'system';
  senderName: string | null;    // Real name if post-award; null/generic if pre-award
  content: string;
  type: 'TEXT' | 'IMAGE' | 'SYSTEM' | 'TOOL_RESULT';
  metadata: Record<string, any> | null; // Image URL, tool result data
  createdAt: string;
}

/**
 * Message read receipt.
 */
export interface MessageReadEvent {
  conversationId: string;
  userId: string;               // Who read the messages
  readAt: string;               // ISO 8601
  lastReadMessageId: string;    // Up to which message they've read
}

/**
 * Typing indicator: user started typing.
 */
export interface TypingStartEvent {
  conversationId: string;
  userId: string;
  userType: 'user' | 'dealer';
  userName: string | null;      // Null if pre-reveal
}

/**
 * Typing indicator: user stopped typing.
 */
export interface TypingStopEvent {
  conversationId: string;
  userId: string;
}

// ─────────────────────────────────────────
// ORDER EVENTS (emitted to user:{userId} room)
// ─────────────────────────────────────────

/**
 * Order status changed.
 * Sent to both buyer and dealer (via their respective user rooms).
 */
export interface OrderStatusEvent {
  orderId: string;
  previousStatus: string;
  status: string;               // 'CREATED' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'
  timestamp: string;
  message: string;              // Human-readable: "Your order has been shipped"
}

/**
 * Order delivery tracking update.
 */
export interface OrderTrackingEvent {
  orderId: string;
  location: string | null;      // "Jaipur Distribution Center"
  estimatedDelivery: string;    // ISO 8601 date
  trackingUrl: string | null;   // External tracking URL
  carrier: string | null;       // "Delhivery" | "Porter"
  timestamp: string;
}

// ─────────────────────────────────────────
// INQUIRY LIFECYCLE EVENTS (emitted to inquiry:{inquiryId} room)
// ─────────────────────────────────────────

/**
 * Inquiry was awarded to a dealer.
 * THIS IS THE IDENTITY REVEAL MOMENT.
 *
 * Sent to BUYER: includes winning dealer's full info (name, business, contact).
 * Sent to WINNING DEALER: includes buyer's full info.
 * Sent to LOSING DEALERS: generic "Inquiry has been awarded to another dealer."
 */
export interface InquiryAwardedEvent {
  inquiryId: string;
  // Fields below are populated differently per recipient:
  awardedTo: {
    dealerId?: string;          // Only for buyer
    dealerName?: string;        // Only for buyer
    businessName?: string;      // Only for buyer
    phone?: string;             // Only for buyer
    email?: string;             // Only for buyer
  } | null;
  awardedFrom: {
    userId?: string;            // Only for winning dealer
    userName?: string;          // Only for winning dealer
    phone?: string;             // Only for winning dealer
    email?: string;             // Only for winning dealer
  } | null;
  winningQuoteId: string | null; // Only for buyer and winning dealer
  finalPrice: number | null;     // Paisa -- only for buyer and winning dealer
  timestamp: string;
}

/**
 * Inquiry expired without award.
 */
export interface InquiryExpiredEvent {
  inquiryId: string;
  reason: 'deadline_passed' | 'cancelled_by_buyer' | 'no_quotes_received';
  message: string;
  timestamp: string;
}

// ─────────────────────────────────────────
// PRICE ALERT EVENTS (emitted to user:{userId} room)
// ─────────────────────────────────────────

export interface PriceAlertEvent {
  alertId: string;
  productId: string;
  productName: string;
  brandName: string;
  currentPrice: number;         // Paisa
  targetPrice: number;          // Paisa (user-set threshold)
  previousPrice: number;        // Paisa
  direction: 'below_target' | 'above_target';
  changePercent: number;        // e.g., -12.5 for 12.5% drop
  timestamp: string;
}

// ─────────────────────────────────────────
// DASHBOARD EVENTS
// ─────────────────────────────────────────

/**
 * Real-time metric update for dashboard.
 * Emitted to dealer:dashboard:{dealerId} or admin:dashboard rooms.
 */
export interface DashboardMetricEvent {
  metric: string;               // 'active_inquiries' | 'quotes_today' | 'revenue_mtd' | 'platform_gmv' | ...
  value: number;
  previousValue: number;
  delta: number;                // Absolute change
  deltaPercent: number;         // Percentage change
  period: 'realtime' | 'daily' | 'weekly' | 'monthly';
  timestamp: string;
}

// ─────────────────────────────────────────
// SYSTEM EVENTS (emitted to all connected sockets)
// ─────────────────────────────────────────

export interface SystemMaintenanceEvent {
  message: string;              // "Scheduled maintenance in 30 minutes. Expected duration: 15 minutes."
  scheduledAt: string;          // ISO 8601
  estimatedDuration: number;    // Minutes
  severity: 'info' | 'warning'; // 'warning' for imminent maintenance
}

export interface SystemAnnouncementEvent {
  id: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl: string | null;     // Link to more info
  expiresAt: string | null;     // Auto-dismiss after this time
}
```

#### Client-to-Server Events

```typescript
// packages/shared/types/socket-events-client.ts

/**
 * Client requests to join a room.
 * Server validates authorization before adding socket to room.
 */
export interface RoomJoinRequest {
  room: string;                 // e.g., 'inquiry:abc-123', 'conversation:xyz-456'
}

/**
 * Client requests to leave a room.
 */
export interface RoomLeaveRequest {
  room: string;
}

/**
 * Client sends a chat message.
 * Server persists to database, then broadcasts to conversation room.
 */
export interface MessageSendRequest {
  conversationId: string;
  content: string;              // Max 5,000 characters
  type: 'TEXT' | 'IMAGE';
  metadata?: {
    imageUrl?: string;          // S3 pre-signed URL for image messages
    replyToMessageId?: string;  // Thread/reply support
  };
  clientMessageId: string;      // UUID generated client-side for deduplication
}

/**
 * Client started typing in a conversation.
 */
export interface TypingStartRequest {
  conversationId: string;
}

/**
 * Client stopped typing in a conversation.
 */
export interface TypingStopRequest {
  conversationId: string;
}

/**
 * Client marks a notification as read.
 */
export interface NotificationReadRequest {
  notificationId: string;
}

/**
 * Client marks all notifications as read.
 */
export interface NotificationReadAllRequest {
  // No payload -- marks all for the authenticated user
}

/**
 * Client refreshes authentication token.
 */
export interface AuthRefreshRequest {
  token: string;                // New JWT access token
}
```

### 17.1.6 Event Handler Registration

```typescript
// packages/api/src/realtime/handlers/index.ts

import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socket-auth';
import { authorizeRoomJoin } from '../middleware/room-auth';
import { socketRateLimiter } from '../middleware/socket-rate-limit';
import { handleMessageSend } from './message.handler';
import { handleTyping } from './typing.handler';
import { handleNotificationRead } from './notification.handler';
import { presenceService } from '../../services/presence.service';
import { logger } from '../../utils/logger';

export function registerEventHandlers(io: Server): void {
  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthenticatedSocket;

    logger.info('Socket connected', {
      userId: socket.userId,
      userType: socket.userType,
      socketId: socket.id,
      transport: socket.conn.transport.name,
    });

    // ── Auto-join personal room ──
    socket.join(`user:${socket.userId}`);

    // ── Track connection count (max 5 per user) ──
    trackConnectionCount(io, socket);

    // ── Update presence ──
    presenceService.setOnline(socket.userId, socket.userType);

    // ── Room management ──
    socket.on('room:join', async (data: { room: string }) => {
      const result = await authorizeRoomJoin(socket, data.room);
      if (result.allowed) {
        socket.join(data.room);
        logger.debug('Socket joined room', { userId: socket.userId, room: data.room });

        // If joining a presence room, broadcast join
        if (data.room.startsWith('presence:')) {
          io.to(data.room).emit('presence:join', {
            userId: socket.userId,
            userType: socket.userType,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        socket.emit('room:join_error', {
          room: data.room,
          error: result.reason || 'Access denied',
        });
        logger.warn('Room join denied', {
          userId: socket.userId,
          room: data.room,
          reason: result.reason,
        });
      }
    });

    socket.on('room:leave', (data: { room: string }) => {
      // Cannot leave personal room
      if (data.room === `user:${socket.userId}`) return;

      socket.leave(data.room);
      logger.debug('Socket left room', { userId: socket.userId, room: data.room });

      if (data.room.startsWith('presence:')) {
        io.to(data.room).emit('presence:leave', {
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // ── Chat events ──
    socket.on('message:send', (data) => {
      if (!socketRateLimiter.check(socket.userId, 'message:send', 30, 60)) {
        socket.emit('error:rate_limit', { event: 'message:send', retryAfter: 60 });
        return;
      }
      handleMessageSend(io, socket, data);
    });

    socket.on('typing:start', (data) => {
      if (!socketRateLimiter.check(socket.userId, 'typing:start', 10, 60)) return; // Silently drop
      handleTyping(io, socket, data, true);
    });

    socket.on('typing:stop', (data) => {
      handleTyping(io, socket, data, false);
    });

    // ── Notification events ──
    socket.on('notification:read', (data) => {
      handleNotificationRead(io, socket, data);
    });

    socket.on('notification:read_all', () => {
      handleNotificationRead(io, socket, { all: true });
    });

    // ── Disconnect ──
    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', {
        userId: socket.userId,
        socketId: socket.id,
        reason,
      });
      presenceService.setOffline(socket.userId, socket.userType);
    });

    // ── Error handling ──
    socket.on('error', (err) => {
      logger.error('Socket error', {
        userId: socket.userId,
        socketId: socket.id,
        error: err.message,
      });
    });
  });
}

/**
 * Enforce max 5 concurrent connections per user.
 * If a 6th connection arrives, disconnect the oldest.
 */
async function trackConnectionCount(io: Server, socket: AuthenticatedSocket): Promise<void> {
  const userRoom = `user:${socket.userId}`;
  const sockets = await io.in(userRoom).fetchSockets();

  if (sockets.length > 5) {
    // Find the oldest connection (lowest socket.conn.id or earliest handshake)
    const oldest = sockets.reduce((prev, curr) =>
      prev.handshake.issued < curr.handshake.issued ? prev : curr
    );
    oldest.emit('error:max_connections', {
      message: 'Maximum 5 simultaneous connections allowed. This session has been disconnected.',
    });
    oldest.disconnect(true);
    logger.info('Evicted oldest socket due to connection limit', {
      userId: socket.userId,
      evictedSocketId: oldest.id,
    });
  }
}
```

### 17.1.7 Message Handler -- Complete Implementation

```typescript
// packages/api/src/realtime/handlers/message.handler.ts

import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socket-auth';
import { MessageSendRequest, MessageNewEvent } from '@shared/types/socket-events';
import { prisma } from '../../lib/prisma';
import { sanitizeHtml } from '../../utils/sanitize';
import { logger } from '../../utils/logger';
import { notificationQueue } from '../../jobs/queues';

const MAX_MESSAGE_LENGTH = 5000;
const PROCESSED_MESSAGE_IDS = new Map<string, boolean>(); // In-memory dedup (short-lived)

export async function handleMessageSend(
  io: Server,
  socket: AuthenticatedSocket,
  data: MessageSendRequest
): Promise<void> {
  try {
    // ── 1. Validate payload ──
    if (!data.conversationId || !data.content || !data.clientMessageId) {
      socket.emit('message:error', {
        clientMessageId: data.clientMessageId,
        error: 'Missing required fields: conversationId, content, clientMessageId',
      });
      return;
    }

    if (data.content.length > MAX_MESSAGE_LENGTH) {
      socket.emit('message:error', {
        clientMessageId: data.clientMessageId,
        error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
      });
      return;
    }

    // ── 2. Deduplication ──
    if (PROCESSED_MESSAGE_IDS.has(data.clientMessageId)) {
      return; // Silently ignore duplicate
    }
    PROCESSED_MESSAGE_IDS.set(data.clientMessageId, true);
    // Clean up after 60s (prevent memory leak)
    setTimeout(() => PROCESSED_MESSAGE_IDS.delete(data.clientMessageId), 60_000);

    // ── 3. Verify sender is participant ──
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: data.conversationId,
        ...(socket.userType === 'user'
          ? { userId: socket.userId }
          : { dealerId: socket.userId }),
      },
      select: { id: true, isMuted: true },
    });

    if (!participant) {
      socket.emit('message:error', {
        clientMessageId: data.clientMessageId,
        error: 'Not a participant in this conversation',
      });
      return;
    }

    // ── 4. Sanitize content ──
    const sanitizedContent = sanitizeHtml(data.content, {
      allowedTags: [],           // Strip all HTML
      allowedAttributes: {},
    });

    // ── 5. Persist to database ──
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderUserId: socket.userType === 'user' ? socket.userId : null,
        senderDealerId: socket.userType === 'dealer' ? socket.userId : null,
        isSystem: false,
        type: data.type || 'TEXT',
        content: sanitizedContent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
      include: {
        senderUser: { select: { id: true, name: true } },
        senderDealer: { select: { id: true, businessName: true } },
      },
    });

    // ── 6. Update conversation lastMessageAt ──
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() },
    });

    // ── 7. Determine sender display name (blind matching rules) ──
    // If conversation is tied to an inquiry that hasn't been awarded,
    // sender name is generic ("Buyer" / "Dealer").
    // If awarded or general conversation, show real name.
    const senderName = await resolveSenderName(
      data.conversationId,
      socket.userId,
      socket.userType,
      message.senderUser?.name || message.senderDealer?.businessName || null
    );

    // ── 8. Broadcast to conversation room ──
    const event: MessageNewEvent = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: socket.userId,
      senderType: socket.userType,
      senderName,
      content: message.content,
      type: message.type as MessageNewEvent['type'],
      metadata: data.metadata || null,
      createdAt: message.createdAt.toISOString(),
    };

    io.to(`conversation:${data.conversationId}`).emit('message:new', event);

    // ── 9. Acknowledge to sender ──
    socket.emit('message:sent', {
      clientMessageId: data.clientMessageId,
      serverId: message.id,
      createdAt: message.createdAt.toISOString(),
    });

    // ── 10. Increment unread count for other participants ──
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: data.conversationId,
        NOT: {
          ...(socket.userType === 'user'
            ? { userId: socket.userId }
            : { dealerId: socket.userId }),
        },
      },
      data: { unreadCount: { increment: 1 } },
    });

    // ── 11. Queue offline notifications for participants not in room ──
    const allParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId: data.conversationId,
        isMuted: false,
      },
      select: { userId: true, dealerId: true },
    });

    const roomSockets = await io.in(`conversation:${data.conversationId}`).fetchSockets();
    const onlineUserIds = new Set(
      roomSockets.map((s) => (s as unknown as AuthenticatedSocket).userId)
    );

    for (const p of allParticipants) {
      const participantId = p.userId || p.dealerId;
      if (participantId && participantId !== socket.userId && !onlineUserIds.has(participantId)) {
        // Participant is offline -- queue push notification
        await notificationQueue.add('send-notification', {
          userId: participantId,
          userType: p.userId ? 'user' : 'dealer',
          type: 'message_received',
          title: `New message from ${senderName || 'Hub4Estate'}`,
          body: sanitizedContent.substring(0, 100) + (sanitizedContent.length > 100 ? '...' : ''),
          data: { screen: 'conversation', conversationId: data.conversationId },
          channels: ['push', 'in_app'], // Don't send SMS/WhatsApp for chat messages
        });
      }
    }

    logger.debug('Message sent', {
      messageId: message.id,
      conversationId: data.conversationId,
      senderId: socket.userId,
    });

  } catch (err: any) {
    logger.error('Message send failed', {
      userId: socket.userId,
      error: err.message,
      conversationId: data.conversationId,
    });
    socket.emit('message:error', {
      clientMessageId: data.clientMessageId,
      error: 'Failed to send message. Please try again.',
    });
  }
}

/**
 * Resolve sender display name based on blind matching rules.
 * Pre-award: "Buyer" or "Dealer" (generic).
 * Post-award or non-inquiry conversations: real name.
 */
async function resolveSenderName(
  conversationId: string,
  senderId: string,
  senderType: 'user' | 'dealer' | 'admin',
  realName: string | null
): Promise<string | null> {
  // Check if conversation is tied to an inquiry
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { contextType: true, contextId: true },
  });

  if (!conversation || conversation.contextType !== 'rfq' || !conversation.contextId) {
    // General or support conversation -- show real name
    return realName;
  }

  // Check if the inquiry has been awarded
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: conversation.contextId },
    select: { status: true },
  });

  if (!inquiry) return realName;

  // Status AWARDED, COMPLETED, etc. = identity revealed
  const revealedStatuses = ['AWARDED', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED'];
  if (revealedStatuses.includes(inquiry.status)) {
    return realName;
  }

  // Pre-award: return generic label
  return senderType === 'dealer' ? 'Dealer' : 'Buyer';
}
```

### 17.1.8 Rate Limiting for Socket Events

```typescript
// packages/api/src/realtime/middleware/socket-rate-limit.ts

import Redis from 'ioredis';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  db: 2, // Rate limiting DB
});

/**
 * Socket event rate limiter using Redis sliding window.
 *
 * Rate limits per event type:
 *   message:send   → 30 events per 60 seconds per user
 *   typing:start   → 10 events per 60 seconds per user
 *   room:join      → 50 events per 60 seconds per user
 *   room:leave     → 50 events per 60 seconds per user
 *   notification:read → 60 events per 60 seconds per user
 *   auth:refresh   → 5 events per 60 seconds per user
 */

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'message:send':     { maxRequests: 30, windowSeconds: 60 },
  'typing:start':     { maxRequests: 10, windowSeconds: 60 },
  'typing:stop':      { maxRequests: 10, windowSeconds: 60 },
  'room:join':        { maxRequests: 50, windowSeconds: 60 },
  'room:leave':       { maxRequests: 50, windowSeconds: 60 },
  'notification:read': { maxRequests: 60, windowSeconds: 60 },
  'notification:read_all': { maxRequests: 5, windowSeconds: 60 },
  'auth:refresh':     { maxRequests: 5, windowSeconds: 60 },
};

class SocketRateLimiter {
  /**
   * Check if an event is within rate limits.
   * Returns true if allowed, false if rate-limited.
   * Uses Redis sorted set with sliding window algorithm.
   */
  async check(userId: string, event: string, maxOverride?: number, windowOverride?: number): Promise<boolean> {
    const config = RATE_LIMITS[event] || { maxRequests: 100, windowSeconds: 60 };
    const max = maxOverride || config.maxRequests;
    const window = windowOverride || config.windowSeconds;

    const key = `rl:socket:${userId}:${event}`;
    const now = Date.now();
    const windowStart = now - (window * 1000);

    const pipeline = redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart); // Remove expired entries
    pipeline.zadd(key, now.toString(), `${now}:${Math.random()}`); // Add current
    pipeline.zcard(key); // Count entries in window
    pipeline.expire(key, window + 1); // TTL = window + 1s buffer

    const results = await pipeline.exec();
    if (!results) return true; // Redis error -- fail open

    const count = results[2]?.[1] as number;

    if (count > max) {
      logger.warn('Socket rate limit exceeded', { userId, event, count, max });
      return false;
    }

    return true;
  }
}

export const socketRateLimiter = new SocketRateLimiter();
```

### 17.1.9 Security Hardening

```typescript
// packages/api/src/realtime/middleware/socket-security.ts

import { Server, Socket } from 'socket.io';
import { AuthenticatedSocket } from './socket-auth';
import { logger } from '../../utils/logger';

/**
 * Security middleware applied to all incoming socket events.
 */
export function applySecurityMiddleware(io: Server): void {
  io.use((socket: Socket, next) => {
    const authSocket = socket as AuthenticatedSocket;

    // ── 1. Payload size validation ──
    // maxHttpBufferSize handles transport-level limits.
    // This validates individual event payloads.
    socket.use(([event, data], next) => {
      const payloadSize = JSON.stringify(data || {}).length;
      if (payloadSize > 50_000) { // 50KB per event payload
        logger.warn('Socket event payload too large', {
          userId: authSocket.userId,
          event,
          size: payloadSize,
        });
        return next(new Error('PAYLOAD_TOO_LARGE'));
      }
      next();
    });

    // ── 2. Event whitelist ──
    // Only allow known events. Prevents injection of arbitrary events.
    const ALLOWED_EVENTS = new Set([
      'room:join', 'room:leave',
      'message:send',
      'typing:start', 'typing:stop',
      'notification:read', 'notification:read_all',
      'auth:refresh',
      'disconnect', 'error',
    ]);

    socket.use(([event], next) => {
      if (!ALLOWED_EVENTS.has(event)) {
        logger.warn('Unknown socket event rejected', {
          userId: authSocket.userId,
          event,
        });
        return next(new Error('UNKNOWN_EVENT'));
      }
      next();
    });

    // ── 3. Input sanitization ──
    socket.use(([event, data], next) => {
      if (data && typeof data === 'object') {
        // Deep sanitize string values to prevent XSS
        sanitizeObject(data);
      }
      next();
    });

    next();
  });
}

/**
 * Recursively sanitize all string values in an object.
 * Strips HTML tags and dangerous characters.
 */
function sanitizeObject(obj: Record<string, any>): void {
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === 'string') {
      // Remove HTML tags
      obj[key] = obj[key].replace(/<[^>]*>/g, '');
      // Remove null bytes
      obj[key] = obj[key].replace(/\0/g, '');
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}
```

**Audit logging for sensitive socket events:**

```typescript
// packages/api/src/realtime/middleware/socket-audit.ts

import { Server } from 'socket.io';
import { AuthenticatedSocket } from './socket-auth';
import { prisma } from '../../lib/prisma';

const AUDITED_EVENTS = new Set([
  'room:join',      // Track who joins which inquiry rooms
  'message:send',   // Track message activity
]);

export function setupSocketAuditLog(io: Server): void {
  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;

    socket.onAny((event, data) => {
      if (AUDITED_EVENTS.has(event)) {
        // Fire-and-forget -- don't block the event
        prisma.userActivity.create({
          data: {
            actorType: authSocket.userType,
            actorId: authSocket.userId,
            activityType: 'CHAT_MESSAGE_SENT', // Or map from event
            description: `Socket event: ${event}`,
            metadata: JSON.stringify({
              socketId: socket.id,
              room: data?.room || data?.conversationId || null,
              transport: socket.conn.transport.name,
            }),
            ipAddress: socket.handshake.address,
            userAgent: socket.handshake.headers['user-agent'] || null,
          },
        }).catch(() => {}); // Swallow audit log errors -- never block real-time
      }
    });
  });
}
```

---

## 17.2 Server-Sent Events (SSE) for Read-Only Streams

For scenarios where the client only receives data (no bidirectional communication), SSE is lighter than Socket.io. Lower memory, no WebSocket upgrade, works through all proxies and CDNs.

### 17.2.1 Use Cases

| Stream | URL | Data | Update Frequency | Consumers |
|--------|-----|------|------------------|-----------|
| Price index | `GET /api/v1/sse/price-index` | Category-level price indices | Every 60 seconds | Public catalog pages |
| System status | `GET /api/v1/sse/system-status` | Platform health, maintenance | On change | All pages (header banner) |
| Inquiry countdown | `GET /api/v1/sse/inquiry/:id/countdown` | Time remaining on active inquiry | Every 1 second (client-side timer, SSE for sync corrections) | Inquiry detail page |

### 17.2.2 Implementation

```typescript
// packages/api/src/routes/sse.routes.ts

import { Router, Request, Response } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { cacheRedis } from '../lib/redis';
import { logger } from '../utils/logger';

const router = Router();

/**
 * SSE: Price Index Stream
 * Public endpoint -- no auth required.
 * Sends price indices for all tracked categories every 60 seconds.
 */
router.get('/price-index', optionalAuth, (req: Request, res: Response) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable Nginx buffering
  });

  // Send initial data immediately
  sendPriceIndex(res);

  // Send updates every 60 seconds
  const interval = setInterval(() => sendPriceIndex(res), 60_000);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30_000);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    logger.debug('SSE price-index client disconnected');
  });
});

async function sendPriceIndex(res: Response): Promise<void> {
  try {
    const indices = await cacheRedis.get('price-index:latest');
    if (indices) {
      res.write(`event: price-index\n`);
      res.write(`data: ${indices}\n\n`);
    }
  } catch (err: any) {
    logger.error('SSE price-index send failed', { error: err.message });
  }
}

/**
 * SSE: System Status Stream
 * Public endpoint.
 */
router.get('/system-status', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Subscribe to Redis pub/sub for system status updates
  const subscriber = cacheRedis.duplicate();
  subscriber.subscribe('system:status');

  subscriber.on('message', (channel: string, message: string) => {
    if (channel === 'system:status') {
      res.write(`event: system-status\n`);
      res.write(`data: ${message}\n\n`);
    }
  });

  // Send current status immediately
  cacheRedis.get('system:status:current').then((status) => {
    if (status) {
      res.write(`event: system-status\n`);
      res.write(`data: ${status}\n\n`);
    }
  });

  const heartbeat = setInterval(() => res.write(':heartbeat\n\n'), 30_000);

  req.on('close', () => {
    clearInterval(heartbeat);
    subscriber.unsubscribe('system:status');
    subscriber.quit();
  });
});

export default router;
```

**Client-side SSE consumer:**

```typescript
// packages/web/src/lib/sse/price-index-stream.ts

export function subscribeToPriceIndex(
  onUpdate: (data: PriceIndexData) => void,
  onError?: (error: Event) => void
): () => void {
  const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
  const eventSource = new EventSource(`${apiUrl}/sse/price-index`);

  eventSource.addEventListener('price-index', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as PriceIndexData;
      onUpdate(data);
    } catch {
      // Malformed data -- ignore
    }
  });

  eventSource.onerror = (event) => {
    onError?.(event);
    // EventSource auto-reconnects with exponential backoff
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

interface PriceIndexData {
  timestamp: string;
  indices: Array<{
    categoryId: string;
    categoryName: string;
    indexValue: number;       // Base 100 = start of tracking
    changePercent24h: number;
    changePercent7d: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}
```

---

## 17.3 Real-Time Dashboard Architecture

### 17.3.1 Dashboard Update Strategy

| Dashboard | Update Trigger | Transport | Frequency | Data Source |
|-----------|---------------|-----------|-----------|-------------|
| Admin: Platform Metrics | Scheduled | Socket.io (admin:dashboard room) | Every 5 seconds | Redis cache (aggregated by BullMQ job) |
| Admin: Critical Alerts | Event-driven | Socket.io (admin:dashboard room) | Instant | Direct emit from event handlers |
| Dealer: Active Inquiries | Event-driven | Socket.io (dealer:dashboard:{id} room) | Instant on new matching inquiry | Inquiry creation handler |
| Dealer: Quote Status | Event-driven | Socket.io (dealer:dashboard:{id} room) | Instant on status change | Quote lifecycle handler |
| Dealer: Revenue | Scheduled | Socket.io (dealer:dashboard:{id} room) | Every 30 seconds | Redis cache |
| Buyer: My Inquiries | Event-driven | Socket.io (inquiry:{id} rooms) | Instant on new quote | Quote submission handler |
| Buyer: Order Status | Event-driven | Socket.io (user:{id} room) | Instant on status change | Order lifecycle handler |

### 17.3.2 Admin Dashboard Metrics Aggregation Job

```typescript
// packages/api/src/jobs/processors/dashboard-metrics.processor.ts

import { Job } from 'bullmq';
import { prisma } from '../../lib/prisma';
import { cacheRedis } from '../../lib/redis';
import { getIO } from '../../realtime/socket-server';
import { logger } from '../../utils/logger';

interface DashboardMetrics {
  timestamp: string;
  platform: {
    totalUsers: number;
    totalDealers: number;
    activeInquiries: number;
    quotesToday: number;
    gmvToday: number;             // Paisa
    gmvMtd: number;               // Paisa
    avgResponseTime: number;      // Minutes -- avg time from inquiry publish to first quote
  };
  health: {
    apiLatencyP99: number;        // ms
    errorRate: number;            // Percentage
    activeConnections: number;    // Socket.io connections
    queueDepth: number;           // BullMQ pending jobs
  };
}

/**
 * Runs every 5 seconds via BullMQ repeatable job.
 * Aggregates platform metrics from database + Redis counters.
 * Emits to admin:dashboard room.
 */
export async function processDashboardMetrics(job: Job): Promise<void> {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for speed
    const [
      totalUsers,
      totalDealers,
      activeInquiries,
      quotesToday,
      gmvToday,
      gmvMtd,
    ] = await Promise.all([
      // Use Redis counters for hot data (incremented on registration)
      cacheRedis.get('counter:total_users').then((v) => parseInt(v || '0')),
      cacheRedis.get('counter:total_dealers').then((v) => parseInt(v || '0')),

      // Active inquiries: count from DB (cached 10s in Redis)
      getCachedCount('active_inquiries', () =>
        prisma.inquiry.count({ where: { status: 'PUBLISHED' } })
      ),

      // Quotes today
      getCachedCount('quotes_today', () =>
        prisma.dealerQuoteResponse.count({
          where: { createdAt: { gte: todayStart } },
        })
      ),

      // GMV today (sum of payments completed today)
      getCachedSum('gmv_today', () =>
        prisma.payment.aggregate({
          where: { status: 'COMPLETED', paidAt: { gte: todayStart } },
          _sum: { amountPaisa: true },
        }).then((r) => r._sum.amountPaisa || 0)
      ),

      // GMV month-to-date
      getCachedSum('gmv_mtd', () =>
        prisma.payment.aggregate({
          where: { status: 'COMPLETED', paidAt: { gte: monthStart } },
          _sum: { amountPaisa: true },
        }).then((r) => r._sum.amountPaisa || 0)
      ),
    ]);

    const io = getIO();
    const activeConnections = io?.engine?.clientsCount || 0;

    const metrics: DashboardMetrics = {
      timestamp: now.toISOString(),
      platform: {
        totalUsers,
        totalDealers,
        activeInquiries,
        quotesToday,
        gmvToday,
        gmvMtd,
        avgResponseTime: await getAvgResponseTime(),
      },
      health: {
        apiLatencyP99: await getApiLatency(),
        errorRate: await getErrorRate(),
        activeConnections,
        queueDepth: await getQueueDepth(),
      },
    };

    // Cache latest metrics
    await cacheRedis.set('dashboard:admin:latest', JSON.stringify(metrics), 'EX', 10);

    // Emit to admin dashboard room
    if (io) {
      io.to('admin:dashboard').emit('dashboard:metrics', metrics);
    }

  } catch (err: any) {
    logger.error('Dashboard metrics aggregation failed', { error: err.message });
    // Non-fatal -- next run will succeed
  }
}

async function getCachedCount(key: string, queryFn: () => Promise<number>): Promise<number> {
  const cached = await cacheRedis.get(`dashboard:cache:${key}`);
  if (cached) return parseInt(cached);
  const value = await queryFn();
  await cacheRedis.set(`dashboard:cache:${key}`, value.toString(), 'EX', 10);
  return value;
}

async function getCachedSum(key: string, queryFn: () => Promise<number>): Promise<number> {
  const cached = await cacheRedis.get(`dashboard:cache:${key}`);
  if (cached) return parseInt(cached);
  const value = await queryFn();
  await cacheRedis.set(`dashboard:cache:${key}`, value.toString(), 'EX', 10);
  return value;
}

async function getAvgResponseTime(): Promise<number> {
  const cached = await cacheRedis.get('dashboard:cache:avg_response_time');
  if (cached) return parseFloat(cached);
  // Calculate from last 24h of inquiries with at least 1 quote
  // (time between inquiry.publishedAt and first quote.createdAt)
  return 0; // Placeholder -- computed by separate analytics job
}

async function getApiLatency(): Promise<number> {
  const val = await cacheRedis.get('metrics:api_latency_p99');
  return val ? parseFloat(val) : 0;
}

async function getErrorRate(): Promise<number> {
  const val = await cacheRedis.get('metrics:error_rate');
  return val ? parseFloat(val) : 0;
}

async function getQueueDepth(): Promise<number> {
  const val = await cacheRedis.get('metrics:queue_depth');
  return val ? parseInt(val) : 0;
}
```

### 17.3.3 React Hook for Real-Time Dashboard

```typescript
// packages/web/src/hooks/useRealtimeDashboard.ts

import { useEffect, useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket/socket-client';
import { useQueryClient } from '@tanstack/react-query';
import type { DashboardMetrics } from '@shared/types/socket-events';

/**
 * Hook that subscribes to real-time dashboard updates.
 * Used in admin and dealer dashboards.
 *
 * @param room - The dashboard room to join (e.g., 'admin:dashboard', 'dealer:dashboard:{id}')
 * @param onMetrics - Callback for metric updates (optional -- can also use React Query invalidation)
 */
export function useRealtimeDashboard(
  room: string,
  onMetrics?: (metrics: DashboardMetrics) => void
): {
  isConnected: boolean;
} {
  const queryClient = useQueryClient();
  const connectedRef = useRef(false);

  const handleMetrics = useCallback(
    (metrics: DashboardMetrics) => {
      onMetrics?.(metrics);
      // Also invalidate relevant React Query caches so components re-render
      queryClient.setQueryData(['dashboard', 'metrics'], metrics);
    },
    [onMetrics, queryClient]
  );

  useEffect(() => {
    const socket = getSocket();

    socket.emit('room:join', { room });
    connectedRef.current = true;

    socket.on('dashboard:metrics', handleMetrics);

    socket.on('room:join_error', (data: { room: string; error: string }) => {
      if (data.room === room) {
        console.error(`[Dashboard] Failed to join ${room}:`, data.error);
        connectedRef.current = false;
      }
    });

    return () => {
      socket.emit('room:leave', { room });
      socket.off('dashboard:metrics', handleMetrics);
      connectedRef.current = false;
    };
  }, [room, handleMetrics]);

  return { isConnected: connectedRef.current };
}
```

---

## 17.4 Presence System

### 17.4.1 Architecture

Presence tracks whether a user is online, idle, or offline. Stored in Redis DB 6 with TTLs. Never persisted to PostgreSQL (ephemeral by nature).

```typescript
// packages/api/src/services/presence.service.ts

import Redis from 'ioredis';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  db: 6, // Presence DB
});

export interface PresenceData {
  userId: string;
  userType: 'user' | 'dealer' | 'admin';
  status: 'online' | 'idle' | 'offline';
  lastSeen: string;           // ISO 8601
  deviceCount: number;        // Number of active connections
}

const ONLINE_TTL = 65;        // 65 seconds (refreshed every 25s by ping, 60s timeout + 5s buffer)
const IDLE_THRESHOLD = 300;   // 5 minutes of no activity -> idle
const LAST_SEEN_TTL = 86400;  // 24 hours retention for "last seen" display

class PresenceService {
  /**
   * Mark user as online. Called on socket connection.
   * Sets a Redis key with TTL that auto-expires if not refreshed.
   */
  async setOnline(userId: string, userType: 'user' | 'dealer' | 'admin'): Promise<void> {
    const key = `presence:${userId}`;
    const data: PresenceData = {
      userId,
      userType,
      status: 'online',
      lastSeen: new Date().toISOString(),
      deviceCount: 1,
    };

    // Increment device count if already online
    const existing = await redis.get(key);
    if (existing) {
      const parsed = JSON.parse(existing) as PresenceData;
      data.deviceCount = parsed.deviceCount + 1;
    }

    await redis.set(key, JSON.stringify(data), 'EX', ONLINE_TTL);
    await redis.set(`last-seen:${userId}`, new Date().toISOString(), 'EX', LAST_SEEN_TTL);
  }

  /**
   * Mark user as offline. Called on socket disconnect.
   * Decrements device count. Only removes presence when last device disconnects.
   */
  async setOffline(userId: string, userType: 'user' | 'dealer' | 'admin'): Promise<void> {
    const key = `presence:${userId}`;
    const existing = await redis.get(key);

    if (existing) {
      const parsed = JSON.parse(existing) as PresenceData;
      if (parsed.deviceCount > 1) {
        // Still has other active connections
        parsed.deviceCount -= 1;
        await redis.set(key, JSON.stringify(parsed), 'EX', ONLINE_TTL);
      } else {
        // Last connection -- remove presence
        await redis.del(key);
      }
    }

    await redis.set(`last-seen:${userId}`, new Date().toISOString(), 'EX', LAST_SEEN_TTL);
  }

  /**
   * Refresh presence TTL. Called on every heartbeat (ping/pong).
   */
  async refresh(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    const existing = await redis.get(key);
    if (existing) {
      const parsed = JSON.parse(existing) as PresenceData;
      parsed.lastSeen = new Date().toISOString();
      parsed.status = 'online'; // Reset from idle
      await redis.set(key, JSON.stringify(parsed), 'EX', ONLINE_TTL);
    }
  }

  /**
   * Mark as idle. Called when client sends idle signal (no mouse/keyboard for 5 min).
   */
  async setIdle(userId: string): Promise<void> {
    const key = `presence:${userId}`;
    const existing = await redis.get(key);
    if (existing) {
      const parsed = JSON.parse(existing) as PresenceData;
      parsed.status = 'idle';
      await redis.set(key, JSON.stringify(parsed), 'EX', ONLINE_TTL);
    }
  }

  /**
   * Get presence status for a single user.
   */
  async getPresence(userId: string): Promise<PresenceData | null> {
    const key = `presence:${userId}`;
    const data = await redis.get(key);
    if (data) return JSON.parse(data);

    // Offline -- return last seen
    const lastSeen = await redis.get(`last-seen:${userId}`);
    return {
      userId,
      userType: 'user', // Default -- caller should know the type
      status: 'offline',
      lastSeen: lastSeen || 'unknown',
      deviceCount: 0,
    };
  }

  /**
   * Get presence status for multiple users (batch query).
   * Used in conversation participant lists.
   */
  async getPresenceBatch(userIds: string[]): Promise<Map<string, PresenceData>> {
    if (userIds.length === 0) return new Map();

    const pipeline = redis.pipeline();
    for (const id of userIds) {
      pipeline.get(`presence:${id}`);
    }
    const results = await pipeline.exec();

    const presenceMap = new Map<string, PresenceData>();
    for (let i = 0; i < userIds.length; i++) {
      const data = results?.[i]?.[1] as string | null;
      if (data) {
        presenceMap.set(userIds[i], JSON.parse(data));
      } else {
        presenceMap.set(userIds[i], {
          userId: userIds[i],
          userType: 'user',
          status: 'offline',
          lastSeen: 'unknown',
          deviceCount: 0,
        });
      }
    }

    return presenceMap;
  }
}

export const presenceService = new PresenceService();
```

### 17.4.2 Typing Indicators

```typescript
// packages/api/src/realtime/handlers/typing.handler.ts

import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../middleware/socket-auth';
import Redis from 'ioredis';

const redis = new Redis({ db: 6 }); // Presence DB

// Typing state in Redis: key = typing:{conversationId}:{userId}, TTL = 5s
// If no typing:stop received within 5s, Redis auto-expires the key.

export async function handleTyping(
  io: Server,
  socket: AuthenticatedSocket,
  data: { conversationId: string },
  isTyping: boolean
): Promise<void> {
  if (!data.conversationId) return;

  const key = `typing:${data.conversationId}:${socket.userId}`;
  const room = `conversation:${data.conversationId}`;

  if (isTyping) {
    // Set typing flag with 5s auto-expire
    await redis.set(key, '1', 'EX', 5);

    // Broadcast to other participants in the conversation
    socket.to(room).emit('typing:start', {
      conversationId: data.conversationId,
      userId: socket.userId,
      userType: socket.userType,
    });
  } else {
    await redis.del(key);

    socket.to(room).emit('typing:stop', {
      conversationId: data.conversationId,
      userId: socket.userId,
    });
  }
}
```

**Client-side typing with debounce:**

```typescript
// packages/web/src/hooks/useTypingIndicator.ts

import { useRef, useCallback } from 'react';
import { getSocket } from '@/lib/socket/socket-client';

/**
 * Hook that manages typing indicator for a conversation.
 *
 * Usage in ChatInput component:
 *   const { onKeyDown } = useTypingIndicator(conversationId);
 *   <textarea onKeyDown={onKeyDown} />
 *
 * Behavior:
 *   - Sends typing:start on first keystroke
 *   - Does NOT send again while typing continues
 *   - Sends typing:stop after 3 seconds of inactivity
 *   - Sends typing:stop on blur (leaving input)
 */
export function useTypingIndicator(conversationId: string) {
  const isTypingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      getSocket().emit('typing:start', { conversationId });
    }

    // Reset the stop timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      getSocket().emit('typing:stop', { conversationId });
    }, 3000); // 3 seconds of inactivity
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      getSocket().emit('typing:stop', { conversationId });
    }
  }, [conversationId]);

  const onKeyDown = useCallback(() => {
    startTyping();
  }, [startTyping]);

  return { onKeyDown, stopTyping };
}
```

---

## 17.5 Offline Queue and Reconnection

### 17.5.1 Client-Side Offline Queue

When the socket is disconnected, outgoing events (messages, room joins) are queued in localStorage and replayed on reconnection.

```typescript
// packages/web/src/lib/socket/offline-queue.ts

interface QueuedEvent {
  id: string;                    // UUID for deduplication
  event: string;                 // 'message:send', etc.
  data: any;                     // Event payload
  timestamp: number;             // When it was queued
  retryCount: number;
}

const QUEUE_KEY = 'h4e_socket_offline_queue';
const MAX_QUEUE_SIZE = 50;       // Don't queue more than 50 events
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes -- older events are stale

class OfflineQueue {
  private queue: QueuedEvent[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Add an event to the offline queue.
   * Only queues events that make sense to replay (messages, not typing indicators).
   */
  enqueue(event: string, data: any): void {
    const QUEUEABLE_EVENTS = new Set(['message:send', 'notification:read']);
    if (!QUEUEABLE_EVENTS.has(event)) return;

    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Drop oldest event
      this.queue.shift();
    }

    this.queue.push({
      id: crypto.randomUUID(),
      event,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    });

    this.saveToStorage();
  }

  /**
   * Replay all queued events through the socket.
   * Called on reconnection.
   */
  async replay(socket: import('socket.io-client').Socket): Promise<void> {
    const now = Date.now();
    const validEvents = this.queue.filter(
      (e) => now - e.timestamp < MAX_AGE_MS
    );

    // Sort by timestamp (oldest first)
    validEvents.sort((a, b) => a.timestamp - b.timestamp);

    for (const event of validEvents) {
      socket.emit(event.event, event.data);
      // Small delay between replays to avoid flooding
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Clear queue after replay
    this.queue = [];
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      this.queue = stored ? JSON.parse(stored) : [];
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch {
      // localStorage full or unavailable -- drop queue
      this.queue = [];
    }
  }
}

export const offlineQueue = new OfflineQueue();
```

### 17.5.2 Reconnection Strategy

```typescript
// Integration with socket-client.ts (extends getSocket() from section 17.1.3)

socket.on('disconnect', (reason) => {
  console.warn('[Socket] Disconnected:', reason);

  if (reason === 'io server disconnect') {
    // Server forcefully disconnected -- likely auth issue
    // Do NOT auto-reconnect; trigger re-auth
    useAuthStore.getState().handleSessionExpiry();
  }
  // For all other reasons, Socket.io's built-in reconnection handles it:
  //   - 'transport close': network loss -> auto-reconnect with backoff
  //   - 'transport error': proxy/CDN issue -> auto-reconnect
  //   - 'ping timeout': heartbeat missed -> auto-reconnect
});

socket.on('connect', () => {
  console.info('[Socket] Connected:', socket.id);

  // Re-join rooms that were active before disconnect
  const activeRooms = useSocketStore.getState().activeRooms;
  for (const room of activeRooms) {
    socket.emit('room:join', { room });
  }

  // Replay offline queue
  offlineQueue.replay(socket);
});

// Connection state recovery: if reconnected within 2 minutes,
// Socket.io automatically replays missed server->client events.
// Beyond 2 minutes, client should refetch full state via REST API.
socket.on('connect', () => {
  if (!socket.recovered) {
    // Connection NOT recovered -- need to refetch state
    console.info('[Socket] Connection not recovered, refetching state');
    queryClient.invalidateQueries(); // Refetch all React Query data
  } else {
    console.info('[Socket] Connection recovered, events replayed');
  }
});
```

### 17.5.3 Server-Side Deduplication

Messages replayed from the offline queue or delivered during connection state recovery may be duplicates. The server deduplicates using `clientMessageId`.

```typescript
// Server-side dedup (already shown in message.handler.ts, section 17.1.7)
// Additional Redis-backed dedup for durability:

async function isDuplicate(clientMessageId: string): Promise<boolean> {
  const key = `dedup:msg:${clientMessageId}`;
  // SET NX returns 1 if key was set (new message), 0 if already exists (duplicate)
  const result = await redis.set(key, '1', 'EX', 300, 'NX'); // 5-minute dedup window
  return result === null; // null = key already existed = duplicate
}
```

---

## 17.6 Performance Targets and Monitoring

### 17.6.1 Real-Time System SLAs

| Metric | Target | Measurement | Alert Threshold |
|--------|--------|-------------|-----------------|
| Event delivery latency (server emit to client receive) | < 100ms p95 | Client-side timestamp comparison | > 200ms |
| Message persistence latency (emit to DB committed) | < 50ms p95 | Server instrumentation | > 100ms |
| Connection establishment time | < 2s p95 | Client-side measurement | > 5s |
| Reconnection time (after network drop) | < 5s p95 | Client-side measurement | > 10s |
| Concurrent connections per instance | 10,000 max | Socket.io engine metric | > 8,000 (scale out) |
| Memory per connection | < 10KB average | Node.js heap profiling | > 15KB |
| Redis adapter pub/sub latency | < 5ms p99 | Redis SLOWLOG | > 10ms |
| Missed events (during recovery window) | 0% | Server-side audit | Any miss |

### 17.6.2 Load Testing Scenarios

```typescript
// k6 load test script for Socket.io

import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

const messagesReceived = new Counter('messages_received');

export const options = {
  scenarios: {
    connections: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },   // Ramp to 100 connections
        { duration: '5m', target: 500 },   // Ramp to 500 connections
        { duration: '5m', target: 1000 },  // Ramp to 1000 connections
        { duration: '5m', target: 1000 },  // Sustain 1000 connections
        { duration: '2m', target: 0 },     // Ramp down
      ],
    },
  },
};

export default function () {
  const token = getTestToken(); // Pre-generated JWT for load test users
  const url = `wss://api.hub4estate.com/socket.io/?EIO=4&transport=websocket`;

  const res = ws.connect(url, {
    headers: { Authorization: `Bearer ${token}` },
  }, function (socket) {
    socket.on('message', (msg) => {
      messagesReceived.add(1);
    });

    // Simulate user activity
    socket.send(JSON.stringify({ event: 'room:join', data: { room: 'inquiry:test-123' } }));

    sleep(30); // Hold connection for 30 seconds
    socket.close();
  });

  check(res, { 'status is 101 (WebSocket upgrade)': (r) => r && r.status === 101 });
}
```

---

## 17.7 Graceful Degradation

When the real-time layer is unavailable (Redis down, Socket.io server overloaded), the platform MUST continue functioning via REST API fallbacks.

| Feature | Real-Time (normal) | Fallback (degraded) | User Impact |
|---------|-------------------|---------------------|-------------|
| New quote notification | Socket event → instant | React Query polling every 30s | 0-30s delay |
| Chat messages | Socket event → instant | React Query polling every 5s | 0-5s delay |
| Dashboard metrics | Socket event → 5s intervals | React Query polling every 30s | Less granular |
| Typing indicators | Socket event → instant | Disabled (hidden) | Minor UX loss |
| Presence (online/offline) | Redis presence → instant | All users show "offline" | Minor UX loss |
| Order status | Socket event → instant | React Query polling every 60s | 0-60s delay |
| Price alerts | Socket event → instant | Email/SMS fallback (always sent) | No loss (async anyway) |

**Detection and switchover:**

```typescript
// packages/web/src/hooks/useSocketHealth.ts

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket/socket-client';

/**
 * Tracks socket connection health.
 * When disconnected for > 10 seconds, activates polling fallback.
 */
export function useSocketHealth() {
  const [isRealTimeAvailable, setIsRealTimeAvailable] = useState(true);
  const [disconnectedSince, setDisconnectedSince] = useState<number | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setIsRealTimeAvailable(true);
      setDisconnectedSince(null);
    };

    const onDisconnect = () => {
      setDisconnectedSince(Date.now());
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Check every 5s if we've been disconnected too long
    const interval = setInterval(() => {
      if (disconnectedSince && Date.now() - disconnectedSince > 10_000) {
        setIsRealTimeAvailable(false);
      }
    }, 5000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      clearInterval(interval);
    };
  }, [disconnectedSince]);

  return { isRealTimeAvailable };
}
```

```typescript
// Usage in React Query hooks -- enable polling when socket is down
// packages/web/src/hooks/queries/useInquiryQuotes.ts

import { useQuery } from '@tanstack/react-query';
import { useSocketHealth } from '@/hooks/useSocketHealth';
import { api } from '@/lib/api';

export function useInquiryQuotes(inquiryId: string) {
  const { isRealTimeAvailable } = useSocketHealth();

  return useQuery({
    queryKey: ['inquiry', inquiryId, 'quotes'],
    queryFn: () => api.get(`/inquiries/${inquiryId}/quotes`),
    // Poll only when real-time is unavailable
    refetchInterval: isRealTimeAvailable ? false : 30_000,
    // Stale time: 5 minutes when real-time is working (events update cache)
    // 0 when polling (always refetch)
    staleTime: isRealTimeAvailable ? 5 * 60 * 1000 : 0,
  });
}
```

---

---

# SECTION 18 -- PAYMENT AND SUBSCRIPTION SYSTEM

> *Every rupee that flows through Hub4Estate is tracked, verified, reconciled, and auditable. This section defines the complete payment architecture from checkout button click to bank settlement, covering subscriptions, lead credits, transaction escrow, GST compliance, refunds, disputes, fraud prevention, and financial reporting. Every amount is in paisa. Every timestamp is IST-aware. Every webhook is idempotent.*

---

## 18.1 Payment Architecture Overview

### 18.1.1 Payment Gateway: Razorpay

| Parameter | Value |
|-----------|-------|
| Provider | Razorpay |
| Plan | Standard |
| Integration Type | Razorpay Standard Checkout (pre-built modal UI) |
| Marketplace | Razorpay Route (for future escrow/split payments) |
| Currency | INR only |
| Amount Unit | Paisa (1 Rupee = 100 paisa) -- all amounts in database and API are paisa |
| API Version | v1 |
| SDK | `razorpay` npm package v2.9+ |
| Dashboard | dashboard.razorpay.com |
| Test Mode | Enabled for staging environment (test API keys) |
| Webhook Endpoint | `POST /api/v1/webhooks/razorpay` |

**Why Razorpay over alternatives:**

| Criterion | Razorpay | Cashfree | PayU | Stripe (India) |
|-----------|----------|----------|------|-----------------|
| UPI support | Native, 0% fee | Native, 0% fee | Yes | Limited |
| Route (marketplace splits) | Yes | Payouts API | Partial | Connect |
| Subscription billing | Built-in | Manual | Manual | Built-in |
| India compliance | Full | Full | Full | Partial |
| NPM SDK quality | Good | Good | Poor | Excellent |
| Onboarding time | 2-3 days | 3-5 days | 5-7 days | 7-14 days |
| **Decision** | **Selected** | Backup | No | Not yet for India B2B |

### 18.1.2 Fund Flow Architecture

There are three distinct payment flows in Hub4Estate, each with a different fund routing path:

```
FLOW 1: DEALER SUBSCRIPTION PAYMENT
Dealer → Razorpay Subscription → Hub4Estate bank account (100%)
No splits. Full amount to platform.

FLOW 2: LEAD CREDIT PURCHASE
Dealer → Razorpay Standard Order → Hub4Estate bank account (100%)
No splits. Full amount to platform.

FLOW 3: TRANSACTION PAYMENT (FUTURE -- Phase 3)
Buyer → Razorpay Route Order → Held in escrow →
  On delivery confirmation:
    Platform commission (1-2%) → Hub4Estate bank account
    Remainder → Dealer's linked Razorpay account
```

**Current implementation priority:**
- Flow 1 (Subscription): **Ships now** -- primary revenue stream
- Flow 2 (Lead Credits): **Ships now** -- secondary revenue stream
- Flow 3 (Transaction Escrow): **Phase 3** -- requires Razorpay Route activation, dealer KYC linked accounts, and regulatory compliance review

### 18.1.3 Core Dependencies

```typescript
// packages/api/package.json (relevant dependencies)
{
  "razorpay": "^2.9.4",        // Razorpay Node.js SDK
  "crypto": "builtin",          // For webhook signature verification
  "bullmq": "^5.30.0",         // Async job processing (invoice generation, notifications)
  "pdfkit": "^0.15.0",         // PDF invoice generation
  "handlebars": "^4.7.8",      // Invoice HTML template rendering
}
```

---

## 18.2 Razorpay Integration Layer

### 18.2.1 Client Initialization

```typescript
// packages/api/src/integrations/razorpay/client.ts

import Razorpay from 'razorpay';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';

let razorpayClient: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!razorpayClient) {
    if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
      throw new Error(
        'RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables'
      );
    }

    razorpayClient = new Razorpay({
      key_id: config.RAZORPAY_KEY_ID,
      key_secret: config.RAZORPAY_KEY_SECRET,
    });

    logger.info('Razorpay client initialized', {
      keyId: config.RAZORPAY_KEY_ID.substring(0, 12) + '...', // Log partial key for debugging
      mode: config.RAZORPAY_KEY_ID.startsWith('rzp_test_') ? 'test' : 'live',
    });
  }

  return razorpayClient;
}

// Environment variable names (stored in AWS SSM Parameter Store):
// RAZORPAY_KEY_ID          = rzp_live_xxxxxxxxxxxx   (or rzp_test_xxxx for staging)
// RAZORPAY_KEY_SECRET      = xxxxxxxxxxxxxxxxxxxxxxxx
// RAZORPAY_WEBHOOK_SECRET  = xxxxxxxxxxxxxxxxxxxxxxxx (separate from API secret)
```

### 18.2.2 Payment Signature Verification

```typescript
// packages/api/src/integrations/razorpay/verify.ts

import crypto from 'crypto';
import { config } from '../../config/env';

/**
 * Verify Razorpay payment signature after checkout completion.
 * This MUST be called before updating order status to PAID.
 *
 * @param razorpayOrderId - The order ID created by our backend
 * @param razorpayPaymentId - The payment ID returned by Razorpay checkout
 * @param razorpaySignature - The signature returned by Razorpay checkout
 * @returns true if signature is valid, false otherwise
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const body = razorpayOrderId + '|' + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(razorpaySignature, 'hex')
  );
}

/**
 * Verify Razorpay webhook signature.
 * Used in the webhook endpoint to ensure the request is from Razorpay.
 *
 * @param body - Raw request body (string)
 * @param signature - X-Razorpay-Signature header value
 * @returns true if valid
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false; // Signature length mismatch or invalid hex
  }
}

/**
 * Verify Razorpay subscription authentication.
 * Called after subscription checkout completes.
 */
export function verifySubscriptionSignature(
  razorpayPaymentId: string,
  razorpaySubscriptionId: string,
  razorpaySignature: string
): boolean {
  const body = razorpayPaymentId + '|' + razorpaySubscriptionId;

  const expectedSignature = crypto
    .createHmac('sha256', config.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(razorpaySignature, 'hex')
  );
}
```

### 18.2.3 Idempotency Key System

Every payment operation uses an idempotency key to prevent duplicate charges.

```typescript
// packages/api/src/integrations/razorpay/idempotency.ts

import { cacheRedis } from '../../lib/redis';
import { logger } from '../../utils/logger';

const IDEMPOTENCY_TTL = 86400; // 24 hours

/**
 * Check if a payment operation has already been processed.
 * Uses Redis for fast lookup, with 24-hour retention.
 *
 * Key format: idempotency:{type}:{referenceId}
 * Example: idempotency:subscription:dealer_abc_plan_growth_monthly
 *
 * @returns The result of the previous operation, or null if first attempt
 */
export async function checkIdempotency(key: string): Promise<string | null> {
  return await cacheRedis.get(`idempotency:${key}`);
}

/**
 * Record a completed payment operation for idempotency.
 */
export async function recordIdempotency(key: string, result: object): Promise<void> {
  await cacheRedis.set(
    `idempotency:${key}`,
    JSON.stringify(result),
    'EX',
    IDEMPOTENCY_TTL
  );
}

/**
 * Generate an idempotency key for a payment operation.
 * Must be deterministic for the same logical operation.
 */
export function generateIdempotencyKey(
  type: 'subscription' | 'lead_pack' | 'order',
  dealerId: string,
  context: string // planName, packSize, orderId
): string {
  return `${type}:${dealerId}:${context}:${new Date().toISOString().split('T')[0]}`; // Date-scoped
}
```

---

## 18.3 Subscription Billing

### 18.3.1 Subscription Plans -- Canonical Definition

The source of truth for plan definitions is the `SubscriptionPlan` Prisma model (section-05-06, Model 16). These constants mirror the database seed and are used for runtime plan resolution.

```typescript
// packages/api/src/config/subscription-plans.ts

export interface PlanDefinition {
  name: string;                    // Database key: 'starter' | 'growth' | 'premium' | 'enterprise'
  displayName: string;             // UI display: 'Starter' | 'Growth' | 'Premium' | 'Enterprise'
  monthlyPricePaisa: number;       // ₹999 = 99900 paisa
  annualPricePaisa: number;        // ₹9,990 = 999000 paisa
  leadsPerMonth: number;           // Included leads
  quotesPerMonth: number;          // Included quote submissions
  features: string[];              // Feature keys for access control
  razorpayMonthlyPlanId: string | null; // Set after Razorpay plan creation
  razorpayAnnualPlanId: string | null;
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDefinition> = {
  starter: {
    name: 'starter',
    displayName: 'Starter',
    monthlyPricePaisa: 99900,           // ₹999/month
    annualPricePaisa: 999000,           // ₹9,990/year (≈ ₹832.50/month, 2 months free)
    leadsPerMonth: 10,
    quotesPerMonth: 20,
    features: [
      'basic_profile',                  // Standard dealer profile page
      'manual_quoting',                 // Submit quotes on inquiries
      'city_visibility',                // Visible in one city
      'email_support',                  // Email support (48h response)
      'basic_analytics',                // Views and impressions count
    ],
    razorpayMonthlyPlanId: null,        // Populated during Razorpay plan sync
    razorpayAnnualPlanId: null,
  },

  growth: {
    name: 'growth',
    displayName: 'Growth',
    monthlyPricePaisa: 249900,          // ₹2,499/month
    annualPricePaisa: 2499000,          // ₹24,990/year (≈ ₹2,082.50/month, 2 months free)
    leadsPerMonth: 30,
    quotesPerMonth: 60,
    features: [
      'basic_profile',
      'manual_quoting',
      'city_visibility',
      'email_support',
      'basic_analytics',
      'priority_matching',              // Higher ranking in inquiry matching
      'brand_badges',                   // Verified brand badges on profile
      'chat_support',                   // In-app chat support (24h response)
      'quote_templates',                // Save and reuse quote templates
      'multi_city',                     // Visible in up to 3 cities
    ],
    razorpayMonthlyPlanId: null,
    razorpayAnnualPlanId: null,
  },

  premium: {
    name: 'premium',
    displayName: 'Premium',
    monthlyPricePaisa: 499900,          // ₹4,999/month
    annualPricePaisa: 4999000,          // ₹49,990/year (≈ ₹4,165.83/month, 2 months free)
    leadsPerMonth: 75,
    quotesPerMonth: 150,
    features: [
      'basic_profile',
      'manual_quoting',
      'city_visibility',
      'email_support',
      'basic_analytics',
      'priority_matching',
      'brand_badges',
      'chat_support',
      'quote_templates',
      'multi_city',
      'ai_insights',                    // AI-powered pricing recommendations
      'auto_quote',                     // Auto-generate quotes based on templates + AI
      'performance_dashboard',          // Advanced analytics (conversion rates, competitive analysis)
      'priority_support',               // Phone + chat support (4h response)
      'bulk_operations',                // Bulk update prices, bulk quote
      'api_access',                     // REST API access for inventory/price sync
      'statewide_visibility',           // Visible across entire state
    ],
    razorpayMonthlyPlanId: null,
    razorpayAnnualPlanId: null,
  },

  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    monthlyPricePaisa: 0,               // Custom pricing -- not self-serve
    annualPricePaisa: 0,                // Custom pricing
    leadsPerMonth: -1,                  // Unlimited (represented as -1)
    quotesPerMonth: -1,                 // Unlimited
    features: [
      // All features from Premium, plus:
      'white_label',                    // White-label profile page
      'dedicated_support',              // Dedicated account manager
      'multi_location',                 // Unlimited locations
      'custom_integrations',            // ERP/SAP integration
      'sla_guarantee',                  // 99.9% uptime SLA with penalty
      'priority_listing',               // Top position in all matching results
      'data_export',                    // Full data export (CSV, API)
      'custom_branding',                // Custom branding on quotes/invoices
    ],
    razorpayMonthlyPlanId: null,        // No Razorpay plan -- manual invoicing
    razorpayAnnualPlanId: null,
  },
};

/**
 * Check if a plan includes a specific feature.
 */
export function planHasFeature(planName: string, feature: string): boolean {
  const plan = SUBSCRIPTION_PLANS[planName];
  if (!plan) return false;
  if (planName === 'enterprise') return true; // Enterprise has everything
  return plan.features.includes(feature);
}

/**
 * Get the effective leads limit for a plan.
 * Returns Infinity for unlimited (-1 in database).
 */
export function getLeadsLimit(planName: string): number {
  const plan = SUBSCRIPTION_PLANS[planName];
  if (!plan) return 0;
  return plan.leadsPerMonth === -1 ? Infinity : plan.leadsPerMonth;
}
```

### 18.3.2 Razorpay Plan Synchronization

Plans must be created in Razorpay before subscriptions can be sold. This script runs once during setup and on plan changes.

```typescript
// packages/api/src/scripts/sync-razorpay-plans.ts

import { getRazorpay } from '../integrations/razorpay/client';
import { prisma } from '../lib/prisma';
import { SUBSCRIPTION_PLANS } from '../config/subscription-plans';
import { logger } from '../utils/logger';

/**
 * Sync subscription plans to Razorpay.
 * Creates Razorpay plans for any SubscriptionPlan record that doesn't have razorpayPlanIds set.
 *
 * Run: npx tsx src/scripts/sync-razorpay-plans.ts
 * Idempotent: safe to run multiple times.
 */
async function syncPlans(): Promise<void> {
  const razorpay = getRazorpay();

  for (const [planKey, planDef] of Object.entries(SUBSCRIPTION_PLANS)) {
    if (planKey === 'enterprise') {
      logger.info(`Skipping ${planKey} (custom pricing, no Razorpay plan)`);
      continue;
    }

    const dbPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: planKey },
    });

    if (!dbPlan) {
      logger.error(`Plan "${planKey}" not found in database. Run seed first.`);
      continue;
    }

    // Create monthly plan if not exists
    if (!dbPlan.razorpayMonthlyPlanId) {
      try {
        const monthlyPlan = await razorpay.plans.create({
          period: 'monthly',
          interval: 1,
          item: {
            name: `Hub4Estate ${planDef.displayName} - Monthly`,
            amount: planDef.monthlyPricePaisa,
            currency: 'INR',
            description: `${planDef.displayName} plan with ${planDef.leadsPerMonth} leads/month`,
          },
          notes: {
            hub4estate_plan: planKey,
            billing_cycle: 'monthly',
          },
        });

        await prisma.subscriptionPlan.update({
          where: { id: dbPlan.id },
          data: { razorpayMonthlyPlanId: monthlyPlan.id },
        });

        logger.info(`Created Razorpay monthly plan for ${planKey}`, {
          razorpayPlanId: monthlyPlan.id,
        });
      } catch (err: any) {
        logger.error(`Failed to create monthly plan for ${planKey}`, { error: err.message });
      }
    }

    // Create annual plan if not exists
    if (!dbPlan.razorpayAnnualPlanId) {
      try {
        const annualPlan = await razorpay.plans.create({
          period: 'yearly',
          interval: 1,
          item: {
            name: `Hub4Estate ${planDef.displayName} - Annual`,
            amount: planDef.annualPricePaisa,
            currency: 'INR',
            description: `${planDef.displayName} plan - annual billing (2 months free)`,
          },
          notes: {
            hub4estate_plan: planKey,
            billing_cycle: 'annual',
          },
        });

        await prisma.subscriptionPlan.update({
          where: { id: dbPlan.id },
          data: { razorpayAnnualPlanId: annualPlan.id },
        });

        logger.info(`Created Razorpay annual plan for ${planKey}`, {
          razorpayPlanId: annualPlan.id,
        });
      } catch (err: any) {
        logger.error(`Failed to create annual plan for ${planKey}`, { error: err.message });
      }
    }
  }

  logger.info('Razorpay plan sync complete');
}

syncPlans().catch(console.error).finally(() => process.exit(0));
```

### 18.3.3 Subscription Creation Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│   Dealer     │    │   Frontend   │    │     Backend      │    │   Razorpay   │
│  Dashboard   │    │   (React)    │    │    (Express)     │    │     API      │
└──────┬───────┘    └──────┬───────┘    └───────┬──────────┘    └──────┬───────┘
       │                    │                     │                      │
       │  Click "Subscribe" │                     │                      │
       │───────────────────>│                     │                      │
       │                    │                     │                      │
       │                    │  POST /api/v1/      │                      │
       │                    │  subscriptions/     │                      │
       │                    │  create             │                      │
       │                    │────────────────────>│                      │
       │                    │                     │                      │
       │                    │                     │  razorpay.            │
       │                    │                     │  subscriptions.       │
       │                    │                     │  create()             │
       │                    │                     │─────────────────────>│
       │                    │                     │                      │
       │                    │                     │  { id, short_url,    │
       │                    │                     │    status }           │
       │                    │                     │<─────────────────────│
       │                    │                     │                      │
       │                    │  { subscriptionId,  │                      │
       │                    │    razorpaySubId,   │                      │
       │                    │    keyId }          │                      │
       │                    │<────────────────────│                      │
       │                    │                     │                      │
       │  Open Razorpay     │                     │                      │
       │  Checkout Modal    │                     │                      │
       │<───────────────────│                     │                      │
       │                    │                     │                      │
       │  Complete Payment  │                     │                      │
       │  (UPI/Card/NB)     │                     │                      │
       │───────────────────>│                     │                      │
       │                    │                     │                      │
       │                    │  POST /api/v1/      │                      │
       │                    │  subscriptions/     │                      │
       │                    │  verify             │                      │
       │                    │────────────────────>│                      │
       │                    │                     │                      │
       │                    │                     │  Verify signature    │
       │                    │                     │  Update DB status    │
       │                    │                     │  Queue invoice job   │
       │                    │                     │  Send notification   │
       │                    │                     │                      │
       │                    │  { success: true,   │                      │
       │                    │    subscription }   │                      │
       │                    │<────────────────────│                      │
       │                    │                     │                      │
       │  "Subscription     │                     │                      │
       │   Activated!"      │                     │                      │
       │<───────────────────│                     │                      │
```

### 18.3.4 Subscription Service -- Complete Implementation

```typescript
// packages/api/src/services/subscription.service.ts

import { getRazorpay } from '../integrations/razorpay/client';
import { verifySubscriptionSignature } from '../integrations/razorpay/verify';
import { checkIdempotency, recordIdempotency, generateIdempotencyKey } from '../integrations/razorpay/idempotency';
import { SUBSCRIPTION_PLANS, getLeadsLimit } from '../config/subscription-plans';
import { prisma } from '../lib/prisma';
import { invoiceQueue, notificationQueue } from '../jobs/queues';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

// ──────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────

interface CreateSubscriptionInput {
  dealerId: string;
  planName: string;              // 'starter' | 'growth' | 'premium'
  billingCycle: 'monthly' | 'annual';
}

interface CreateSubscriptionResult {
  subscriptionId: string;        // Hub4Estate subscription ID
  razorpaySubscriptionId: string;
  razorpayKeyId: string;         // For frontend checkout
}

interface VerifySubscriptionInput {
  dealerId: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}

interface PlanChangeInput {
  dealerId: string;
  newPlanName: string;
  newBillingCycle: 'monthly' | 'annual';
}

// ──────────────────────────────────────────
// CREATE SUBSCRIPTION
// ──────────────────────────────────────────

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<CreateSubscriptionResult> {
  const { dealerId, planName, billingCycle } = input;

  // 1. Validate plan exists
  const planDef = SUBSCRIPTION_PLANS[planName];
  if (!planDef) {
    throw new AppError('INVALID_PLAN', `Plan "${planName}" does not exist`, 400);
  }

  if (planName === 'enterprise') {
    throw new AppError(
      'ENTERPRISE_CONTACT_SALES',
      'Enterprise plans require custom setup. Contact sales@hub4estate.com',
      400
    );
  }

  // 2. Check for existing active subscription
  const existingSubscription = await prisma.dealerSubscription.findFirst({
    where: {
      dealerId,
      status: { in: ['ACTIVE', 'GRACE_PERIOD'] },
    },
  });

  if (existingSubscription) {
    throw new AppError(
      'SUBSCRIPTION_EXISTS',
      'You already have an active subscription. Please cancel or change your existing plan.',
      409
    );
  }

  // 3. Get Razorpay plan ID
  const dbPlan = await prisma.subscriptionPlan.findUnique({
    where: { name: planName },
  });

  if (!dbPlan) {
    throw new AppError('PLAN_NOT_CONFIGURED', 'Plan not found in database', 500);
  }

  const razorpayPlanId = billingCycle === 'annual'
    ? dbPlan.razorpayAnnualPlanId
    : dbPlan.razorpayMonthlyPlanId;

  if (!razorpayPlanId) {
    throw new AppError(
      'RAZORPAY_PLAN_MISSING',
      `Razorpay plan ID not configured for ${planName} ${billingCycle}. Run sync script.`,
      500
    );
  }

  // 4. Idempotency check
  const idempotencyKey = generateIdempotencyKey('subscription', dealerId, `${planName}_${billingCycle}`);
  const existingResult = await checkIdempotency(idempotencyKey);
  if (existingResult) {
    return JSON.parse(existingResult);
  }

  // 5. Get dealer info for Razorpay
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { email: true, phone: true, businessName: true },
  });

  if (!dealer) {
    throw new AppError('DEALER_NOT_FOUND', 'Dealer not found', 404);
  }

  // 6. Create Razorpay subscription
  const razorpay = getRazorpay();

  let razorpaySubscription: any;
  try {
    razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      total_count: billingCycle === 'annual' ? 5 : 60,  // Max billing cycles (5 years annual, 5 years monthly)
      quantity: 1,
      customer_notify: 0,         // We handle notifications, not Razorpay
      notes: {
        dealerId,
        planName,
        billingCycle,
        hub4estate_env: process.env.NODE_ENV || 'production',
      },
      // No offer_id -- discounts handled at plan level
    });
  } catch (err: any) {
    logger.error('Razorpay subscription creation failed', {
      dealerId,
      planName,
      error: err.message,
      razorpayError: err.error,
    });
    throw new AppError(
      'RAZORPAY_ERROR',
      'Failed to create subscription with payment gateway. Please try again.',
      502
    );
  }

  // 7. Create subscription record in database (status: CREATED, not yet ACTIVE)
  const now = new Date();
  const periodEnd = billingCycle === 'annual'
    ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const subscription = await prisma.dealerSubscription.create({
    data: {
      dealerId,
      planId: dbPlan.id,
      status: 'ACTIVE',              // Will be confirmed on payment verification
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      razorpaySubscriptionId: razorpaySubscription.id,
      razorpayPlanId,
      leadsUsedThisPeriod: 0,
      leadsLimit: getLeadsLimit(planName) === Infinity ? -1 : getLeadsLimit(planName),
    },
  });

  const result: CreateSubscriptionResult = {
    subscriptionId: subscription.id,
    razorpaySubscriptionId: razorpaySubscription.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
  };

  // 8. Record idempotency
  await recordIdempotency(idempotencyKey, result);

  logger.info('Subscription created', {
    subscriptionId: subscription.id,
    dealerId,
    planName,
    billingCycle,
    razorpaySubId: razorpaySubscription.id,
  });

  return result;
}

// ──────────────────────────────────────────
// VERIFY SUBSCRIPTION PAYMENT
// ──────────────────────────────────────────

export async function verifySubscriptionPayment(
  input: VerifySubscriptionInput
): Promise<{ success: boolean; subscription: any }> {
  const { dealerId, razorpayPaymentId, razorpaySubscriptionId, razorpaySignature } = input;

  // 1. Verify signature
  const isValid = verifySubscriptionSignature(
    razorpayPaymentId,
    razorpaySubscriptionId,
    razorpaySignature
  );

  if (!isValid) {
    logger.error('Subscription payment signature verification failed', {
      dealerId,
      razorpaySubscriptionId,
    });
    throw new AppError('SIGNATURE_INVALID', 'Payment verification failed', 400);
  }

  // 2. Find the subscription
  const subscription = await prisma.dealerSubscription.findFirst({
    where: {
      dealerId,
      razorpaySubscriptionId,
    },
    include: { plan: true },
  });

  if (!subscription) {
    throw new AppError('SUBSCRIPTION_NOT_FOUND', 'Subscription not found', 404);
  }

  // 3. Update subscription status to ACTIVE
  const updatedSubscription = await prisma.dealerSubscription.update({
    where: { id: subscription.id },
    data: { status: 'ACTIVE' },
    include: { plan: true },
  });

  // 4. Create payment record
  const payment = await prisma.payment.create({
    data: {
      dealerId,
      amountPaisa: subscription.plan.monthlyPricePaisa, // TODO: check billing cycle
      currency: 'INR',
      description: `${subscription.plan.displayName} subscription - first payment`,
      paymentFor: 'subscription',
      referenceId: subscription.id,
      referenceType: 'dealer_subscription',
      razorpayOrderId: null,          // Subscriptions don't use orders
      razorpayPaymentId,
      razorpaySignature,
      status: 'COMPLETED',
      paidAt: new Date(),
    },
  });

  // 5. Queue invoice generation
  await invoiceQueue.add('generate-invoice', {
    paymentId: payment.id,
    type: 'subscription',
    dealerId,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });

  // 6. Queue notification
  await notificationQueue.add('send-notification', {
    userId: dealerId,
    userType: 'dealer',
    type: 'payment_received',
    title: 'Subscription Activated',
    body: `Your ${subscription.plan.displayName} plan is now active. You have ${subscription.leadsLimit === -1 ? 'unlimited' : subscription.leadsLimit} leads this month.`,
    data: { screen: 'dealer_subscription', subscriptionId: subscription.id },
    channels: ['in_app', 'email'],
  });

  // 7. Log activity
  await prisma.userActivity.create({
    data: {
      actorType: 'dealer',
      actorId: dealerId,
      activityType: 'SUBSCRIPTION_CREATED',
      description: `Subscribed to ${subscription.plan.displayName} plan`,
      metadata: JSON.stringify({
        planName: subscription.plan.name,
        razorpaySubscriptionId,
        razorpayPaymentId,
        amountPaisa: payment.amountPaisa,
      }),
    },
  });

  logger.info('Subscription payment verified and activated', {
    subscriptionId: subscription.id,
    dealerId,
    planName: subscription.plan.name,
    razorpayPaymentId,
  });

  return { success: true, subscription: updatedSubscription };
}

// ──────────────────────────────────────────
// CANCEL SUBSCRIPTION
// ──────────────────────────────────────────

export async function cancelSubscription(
  dealerId: string,
  reason: string
): Promise<{ effectiveDate: Date }> {
  // 1. Find active subscription
  const subscription = await prisma.dealerSubscription.findFirst({
    where: {
      dealerId,
      status: { in: ['ACTIVE', 'GRACE_PERIOD'] },
    },
    include: { plan: true },
  });

  if (!subscription) {
    throw new AppError('NO_ACTIVE_SUBSCRIPTION', 'No active subscription found', 404);
  }

  // 2. Cancel in Razorpay (end of billing cycle, not immediate)
  if (subscription.razorpaySubscriptionId) {
    const razorpay = getRazorpay();
    try {
      await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId, false);
      // false = cancel at end of billing cycle (not immediately)
    } catch (err: any) {
      logger.error('Razorpay subscription cancellation failed', {
        subscriptionId: subscription.id,
        error: err.message,
      });
      // Continue with local cancellation even if Razorpay fails
      // Webhook will catch up later
    }
  }

  // 3. Update local record
  const updated = await prisma.dealerSubscription.update({
    where: { id: subscription.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
    },
  });

  // 4. Notify dealer
  await notificationQueue.add('send-notification', {
    userId: dealerId,
    userType: 'dealer',
    type: 'subscription_expiring',
    title: 'Subscription Cancelled',
    body: `Your ${subscription.plan.displayName} plan will remain active until ${subscription.currentPeriodEnd.toLocaleDateString('en-IN')}. After that, you'll be on the free tier.`,
    data: { screen: 'dealer_subscription' },
    channels: ['in_app', 'email'],
  });

  // 5. Log activity
  await prisma.userActivity.create({
    data: {
      actorType: 'dealer',
      actorId: dealerId,
      activityType: 'SUBSCRIPTION_CANCELLED',
      description: `Cancelled ${subscription.plan.displayName} subscription. Reason: ${reason}`,
    },
  });

  logger.info('Subscription cancelled', {
    subscriptionId: subscription.id,
    dealerId,
    reason,
    effectiveDate: subscription.currentPeriodEnd,
  });

  return { effectiveDate: subscription.currentPeriodEnd };
}

// ──────────────────────────────────────────
// PLAN CHANGE (UPGRADE / DOWNGRADE)
// ──────────────────────────────────────────

export async function changePlan(input: PlanChangeInput): Promise<{
  action: 'upgrade' | 'downgrade';
  effectiveDate: Date;
  proratedCredit: number;  // Paisa
}> {
  const { dealerId, newPlanName, newBillingCycle } = input;

  // 1. Validate new plan
  const newPlanDef = SUBSCRIPTION_PLANS[newPlanName];
  if (!newPlanDef || newPlanName === 'enterprise') {
    throw new AppError('INVALID_PLAN', 'Invalid plan selected', 400);
  }

  // 2. Get current subscription
  const currentSub = await prisma.dealerSubscription.findFirst({
    where: { dealerId, status: 'ACTIVE' },
    include: { plan: true },
  });

  if (!currentSub) {
    throw new AppError('NO_ACTIVE_SUBSCRIPTION', 'No active subscription to change', 404);
  }

  // 3. Determine if upgrade or downgrade
  const planOrder = { starter: 1, growth: 2, premium: 3, enterprise: 4 };
  const currentTier = planOrder[currentSub.plan.name as keyof typeof planOrder] || 0;
  const newTier = planOrder[newPlanName as keyof typeof planOrder] || 0;

  const action: 'upgrade' | 'downgrade' = newTier > currentTier ? 'upgrade' : 'downgrade';

  if (currentSub.plan.name === newPlanName) {
    throw new AppError('SAME_PLAN', 'You are already on this plan', 400);
  }

  // 4. Calculate proration (for upgrades)
  let proratedCredit = 0;
  let effectiveDate: Date;

  if (action === 'upgrade') {
    // UPGRADE: Immediate. Prorated credit for remaining days on old plan.
    const now = new Date();
    const periodStart = currentSub.currentPeriodStart;
    const periodEnd = currentSub.currentPeriodEnd;
    const totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = totalDays - elapsedDays;

    const dailyRate = currentSub.plan.monthlyPricePaisa / 30; // Approximate
    proratedCredit = Math.round(dailyRate * remainingDays);

    effectiveDate = now;

    // Cancel old Razorpay subscription
    if (currentSub.razorpaySubscriptionId) {
      const razorpay = getRazorpay();
      try {
        await razorpay.subscriptions.cancel(currentSub.razorpaySubscriptionId, true);
        // true = cancel immediately
      } catch (err: any) {
        logger.error('Failed to cancel old Razorpay subscription during upgrade', {
          error: err.message,
        });
      }
    }

    // Mark old subscription as cancelled
    await prisma.dealerSubscription.update({
      where: { id: currentSub.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        cancelReason: `Upgraded to ${newPlanName}`,
      },
    });

    // The frontend will immediately trigger createSubscription() for the new plan
    // The prorated credit will be applied as a Razorpay offer or manual credit note

    logger.info('Plan upgrade initiated', {
      dealerId,
      from: currentSub.plan.name,
      to: newPlanName,
      proratedCredit,
    });

  } else {
    // DOWNGRADE: Effective at end of current billing period.
    effectiveDate = currentSub.currentPeriodEnd;

    // Schedule the downgrade (handled by subscription-lifecycle BullMQ job)
    await prisma.dealerSubscription.update({
      where: { id: currentSub.id },
      data: {
        // Store pending downgrade info in metadata
        cancelReason: `Pending downgrade to ${newPlanName} (cycle: ${newBillingCycle})`,
      },
    });

    logger.info('Plan downgrade scheduled', {
      dealerId,
      from: currentSub.plan.name,
      to: newPlanName,
      effectiveDate,
    });
  }

  // 5. Notify
  await notificationQueue.add('send-notification', {
    userId: dealerId,
    userType: 'dealer',
    type: action === 'upgrade' ? 'payment_received' : 'subscription_expiring',
    title: action === 'upgrade' ? 'Plan Upgraded' : 'Plan Downgrade Scheduled',
    body: action === 'upgrade'
      ? `You've been upgraded to ${newPlanDef.displayName}. Prorated credit: ₹${(proratedCredit / 100).toFixed(0)}.`
      : `Your plan will change to ${newPlanDef.displayName} on ${effectiveDate.toLocaleDateString('en-IN')}.`,
    data: { screen: 'dealer_subscription' },
    channels: ['in_app', 'email'],
  });

  return { action, effectiveDate, proratedCredit };
}
```

### 18.3.5 Subscription Lifecycle -- State Machine

```
┌──────────┐
│ CREATED  │ ─── Payment checkout opened, awaiting Razorpay payment
└────┬─────┘
     │ Payment verified (signature OK)
     ▼
┌──────────┐
│  ACTIVE  │ ─── Subscription running, features unlocked
└────┬─────┘
     │                           │                    │
     │ Renewal payment           │ Payment failed     │ Dealer cancels
     │ succeeds (webhook)        │ (webhook)          │ (API call)
     │                           ▼                    ▼
     │                    ┌──────────────┐    ┌───────────┐
     └────────────────────│ GRACE_PERIOD │    │ CANCELLED │
     (stays ACTIVE)       │   (3 days)   │    │           │
                          └──────┬───────┘    └─────┬─────┘
                                 │                   │
                    ┌────────────┼────────────┐      │ Period ends
                    │            │            │      ▼
                    ▼            ▼            ▼   ┌──────────┐
              Retry 1       Retry 2       Retry 3 │ EXPIRED  │ ─── Downgrade to free tier
              (Day 1)       (Day 2)       (Day 3) └──────────┘
                    │            │            │
                    │ Success    │ Success    │ All retries fail
                    ▼            ▼            ▼
              ┌──────────┐              ┌──────────┐
              │  ACTIVE  │              │ EXPIRED  │
              └──────────┘              └──────────┘
```

**State transition rules:**

| Current State | Event | New State | Action |
|---------------|-------|-----------|--------|
| CREATED | Payment verified | ACTIVE | Unlock features, generate invoice |
| CREATED | 24h timeout | EXPIRED | Delete subscription record |
| ACTIVE | Renewal payment success | ACTIVE | Reset period, reset leads counter |
| ACTIVE | Renewal payment fails | GRACE_PERIOD | Send email + in-app alert, retry in 24h |
| ACTIVE | Dealer cancels | CANCELLED | Keep access until period end |
| GRACE_PERIOD | Retry payment succeeds | ACTIVE | Clear grace state |
| GRACE_PERIOD | 3 days pass, all retries fail | EXPIRED | Downgrade to free tier |
| CANCELLED | Period end reached | EXPIRED | Downgrade to free tier |
| EXPIRED | Dealer resubscribes within 30 days | ACTIVE | Same plan at same price |
| EXPIRED | >30 days | -- | Must create new subscription (may have new pricing) |

### 18.3.6 Subscription Lifecycle BullMQ Job

```typescript
// packages/api/src/jobs/processors/subscription-lifecycle.processor.ts

import { Job } from 'bullmq';
import { prisma } from '../../lib/prisma';
import { notificationQueue } from '../queues';
import { logger } from '../../utils/logger';

/**
 * Runs every hour. Checks for:
 * 1. Subscriptions in GRACE_PERIOD that have exceeded 3 days -> EXPIRED
 * 2. CANCELLED subscriptions past their period end -> EXPIRED
 * 3. Subscriptions expiring in 3 days -> send warning notification
 * 4. Leads counter reset at period start
 */
export async function processSubscriptionLifecycle(job: Job): Promise<void> {
  const now = new Date();

  // ── 1. Expire grace period subscriptions (3+ days past payment failure) ──
  const gracePeriodExpired = await prisma.dealerSubscription.findMany({
    where: {
      status: 'GRACE_PERIOD',
      updatedAt: {
        lt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
    },
    include: { plan: true, dealer: { select: { id: true, email: true, businessName: true } } },
  });

  for (const sub of gracePeriodExpired) {
    await prisma.dealerSubscription.update({
      where: { id: sub.id },
      data: { status: 'EXPIRED' },
    });

    await notificationQueue.add('send-notification', {
      userId: sub.dealerId,
      userType: 'dealer',
      type: 'payment_failed',
      title: 'Subscription Expired',
      body: `Your ${sub.plan.displayName} subscription has expired due to payment failure. Resubscribe to restore your features.`,
      data: { screen: 'dealer_subscription' },
      channels: ['in_app', 'email', 'sms'],
    });

    logger.info('Subscription expired (grace period ended)', {
      subscriptionId: sub.id,
      dealerId: sub.dealerId,
    });
  }

  // ── 2. Expire cancelled subscriptions past period end ──
  const cancelledPastEnd = await prisma.dealerSubscription.findMany({
    where: {
      status: 'CANCELLED',
      currentPeriodEnd: { lt: now },
    },
    include: { plan: true },
  });

  for (const sub of cancelledPastEnd) {
    await prisma.dealerSubscription.update({
      where: { id: sub.id },
      data: { status: 'EXPIRED' },
    });

    logger.info('Cancelled subscription expired (period ended)', {
      subscriptionId: sub.id,
      dealerId: sub.dealerId,
    });
  }

  // ── 3. Send expiry warning (3 days before period end) ──
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const expiringSOon = await prisma.dealerSubscription.findMany({
    where: {
      status: 'ACTIVE',
      currentPeriodEnd: {
        gte: now,
        lte: threeDaysFromNow,
      },
    },
    include: { plan: true },
  });

  for (const sub of expiringSOon) {
    // Don't spam -- check if we already sent this notification today
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: sub.dealerId,
        userType: 'dealer',
        title: { contains: 'Subscription Expiring' },
        createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      },
    });

    if (!existingNotification) {
      await notificationQueue.add('send-notification', {
        userId: sub.dealerId,
        userType: 'dealer',
        type: 'subscription_expiring',
        title: 'Subscription Expiring Soon',
        body: `Your ${sub.plan.displayName} plan expires on ${sub.currentPeriodEnd.toLocaleDateString('en-IN')}. Renew now to avoid interruption.`,
        data: { screen: 'dealer_subscription' },
        channels: ['in_app', 'email'],
      });
    }
  }

  // ── 4. Reset leads counter for subscriptions starting new period ──
  const newPeriodSubs = await prisma.dealerSubscription.findMany({
    where: {
      status: 'ACTIVE',
      currentPeriodEnd: { lt: now },
      // These are subscriptions whose period just ended and Razorpay renewed them
      // The webhook handler updates currentPeriodEnd, but leads need resetting
    },
  });

  for (const sub of newPeriodSubs) {
    await prisma.dealerSubscription.update({
      where: { id: sub.id },
      data: { leadsUsedThisPeriod: 0 },
    });
  }

  logger.info('Subscription lifecycle job completed', {
    gracePeriodExpired: gracePeriodExpired.length,
    cancelledExpired: cancelledPastEnd.length,
    expiryWarnings: expiringSOon.length,
    leadsReset: newPeriodSubs.length,
  });
}
```

### 18.3.7 Subscription API Routes

```typescript
// packages/api/src/routes/subscription.routes.ts

import { Router } from 'express';
import { authenticate, requireDealer } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import * as subscriptionService from '../services/subscription.service';

const router = Router();

// All subscription routes require dealer authentication
router.use(authenticate, requireDealer);

/**
 * POST /api/v1/subscriptions/create
 * Create a new subscription (returns Razorpay checkout data)
 */
router.post(
  '/create',
  validate({
    body: z.object({
      planName: z.enum(['starter', 'growth', 'premium']),
      billingCycle: z.enum(['monthly', 'annual']),
    }),
  }),
  async (req, res, next) => {
    try {
      const result = await subscriptionService.createSubscription({
        dealerId: req.user!.sub,
        planName: req.body.planName,
        billingCycle: req.body.billingCycle,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/subscriptions/verify
 * Verify payment after Razorpay checkout completes
 */
router.post(
  '/verify',
  validate({
    body: z.object({
      razorpayPaymentId: z.string().min(1),
      razorpaySubscriptionId: z.string().min(1),
      razorpaySignature: z.string().min(1),
    }),
  }),
  async (req, res, next) => {
    try {
      const result = await subscriptionService.verifySubscriptionPayment({
        dealerId: req.user!.sub,
        ...req.body,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/subscriptions/cancel
 * Cancel current subscription (effective at end of billing period)
 */
router.post(
  '/cancel',
  validate({
    body: z.object({
      reason: z.string().min(5).max(500),
    }),
  }),
  async (req, res, next) => {
    try {
      const result = await subscriptionService.cancelSubscription(
        req.user!.sub,
        req.body.reason
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/v1/subscriptions/change-plan
 * Upgrade or downgrade subscription plan
 */
router.post(
  '/change-plan',
  validate({
    body: z.object({
      newPlanName: z.enum(['starter', 'growth', 'premium']),
      newBillingCycle: z.enum(['monthly', 'annual']),
    }),
  }),
  async (req, res, next) => {
    try {
      const result = await subscriptionService.changePlan({
        dealerId: req.user!.sub,
        newPlanName: req.body.newPlanName,
        newBillingCycle: req.body.newBillingCycle,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/v1/subscriptions/current
 * Get current subscription details
 */
router.get('/current', async (req, res, next) => {
  try {
    const subscription = await prisma.dealerSubscription.findFirst({
      where: {
        dealerId: req.user!.sub,
        status: { in: ['ACTIVE', 'GRACE_PERIOD', 'CANCELLED'] },
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) {
      return res.json({ success: true, data: null, message: 'No active subscription' });
    }

    res.json({
      success: true,
      data: {
        id: subscription.id,
        plan: {
          name: subscription.plan.name,
          displayName: subscription.plan.displayName,
          monthlyPrice: subscription.plan.monthlyPricePaisa,
          annualPrice: subscription.plan.annualPricePaisa,
          features: subscription.plan.features,
        },
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        leadsUsed: subscription.leadsUsedThisPeriod,
        leadsLimit: subscription.leadsLimit,
        cancelledAt: subscription.cancelledAt,
        cancelReason: subscription.cancelReason,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/subscriptions/plans
 * List all available subscription plans
 */
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
});

export default router;
```

---

## 18.4 Lead Credit System

### 18.4.1 Credit Packages

```typescript
// packages/api/src/config/lead-credit-packages.ts

export interface CreditPackage {
  id: string;                    // Stable identifier for the package
  credits: number;               // Number of lead credits
  pricePaisa: number;            // Total price in paisa
  perCreditPaisa: number;        // Price per credit in paisa
  discountPercent: number;       // Discount vs. single credit price (base: ₹500/credit)
  isPopular: boolean;            // Show "Popular" badge in UI
}

// Base price per credit: ₹500 (50000 paisa)
const BASE_CREDIT_PRICE = 50000;

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pack_5',
    credits: 5,
    pricePaisa: 225000,          // ₹2,250
    perCreditPaisa: 45000,       // ₹450/credit
    discountPercent: 10,
    isPopular: false,
  },
  {
    id: 'pack_10',
    credits: 10,
    pricePaisa: 425000,          // ₹4,250
    perCreditPaisa: 42500,       // ₹425/credit
    discountPercent: 15,
    isPopular: false,
  },
  {
    id: 'pack_25',
    credits: 25,
    pricePaisa: 875000,          // ₹8,750
    perCreditPaisa: 35000,       // ₹350/credit
    discountPercent: 30,
    isPopular: true,
  },
  {
    id: 'pack_50',
    credits: 50,
    pricePaisa: 1500000,         // ₹15,000
    perCreditPaisa: 30000,       // ₹300/credit
    discountPercent: 40,
    isPopular: false,
  },
  {
    id: 'pack_100',
    credits: 100,
    pricePaisa: 2500000,         // ₹25,000
    perCreditPaisa: 25000,       // ₹250/credit
    discountPercent: 50,
    isPopular: false,
  },
];

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}
```

### 18.4.2 Credit Purchase Flow

```typescript
// packages/api/src/services/lead-credit.service.ts

import { getRazorpay } from '../integrations/razorpay/client';
import { verifyPaymentSignature } from '../integrations/razorpay/verify';
import { getPackageById, CREDIT_PACKAGES } from '../config/lead-credit-packages';
import { prisma } from '../lib/prisma';
import { invoiceQueue, notificationQueue } from '../jobs/queues';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

// ──────────────────────────────────────────
// CREATE CREDIT PURCHASE ORDER
// ──────────────────────────────────────────

export async function createCreditPurchaseOrder(
  dealerId: string,
  packageId: string
): Promise<{
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountPaisa: number;
  currency: string;
}> {
  // 1. Validate package
  const pack = getPackageById(packageId);
  if (!pack) {
    throw new AppError('INVALID_PACKAGE', `Credit package "${packageId}" not found`, 400);
  }

  // 2. Create Razorpay order
  const razorpay = getRazorpay();

  const order = await razorpay.orders.create({
    amount: pack.pricePaisa,
    currency: 'INR',
    receipt: `credit_${dealerId}_${packageId}_${Date.now()}`,
    notes: {
      dealerId,
      packageId,
      credits: pack.credits.toString(),
      type: 'lead_credit_purchase',
    },
  });

  // 3. Create pending payment record
  await prisma.payment.create({
    data: {
      dealerId,
      amountPaisa: pack.pricePaisa,
      currency: 'INR',
      description: `${pack.credits} lead credits (₹${(pack.perCreditPaisa / 100).toFixed(0)}/credit)`,
      paymentFor: 'lead_pack',
      referenceId: packageId,
      referenceType: 'lead_credit_package',
      razorpayOrderId: order.id,
      status: 'PENDING',
    },
  });

  return {
    razorpayOrderId: order.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
    amountPaisa: pack.pricePaisa,
    currency: 'INR',
  };
}

// ──────────────────────────────────────────
// VERIFY CREDIT PURCHASE
// ──────────────────────────────────────────

export async function verifyCreditPurchase(
  dealerId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{
  creditsAdded: number;
  newBalance: number;
}> {
  // 1. Verify signature
  if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
    throw new AppError('SIGNATURE_INVALID', 'Payment verification failed', 400);
  }

  // 2. Find payment record
  const payment = await prisma.payment.findFirst({
    where: {
      dealerId,
      razorpayOrderId,
      status: 'PENDING',
    },
  });

  if (!payment) {
    throw new AppError('PAYMENT_NOT_FOUND', 'Payment record not found', 404);
  }

  // 3. Get package details
  const pack = getPackageById(payment.referenceId || '');
  if (!pack) {
    throw new AppError('PACKAGE_NOT_FOUND', 'Credit package not found', 500);
  }

  // 4. Update payment and add credits in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
      },
    });

    // Add credits to dealer
    const dealer = await tx.dealer.update({
      where: { id: dealerId },
      data: {
        leadCredits: { increment: pack.credits },
      },
      select: { leadCredits: true },
    });

    // Create credit transaction log
    await tx.leadCreditTransaction.create({
      data: {
        dealerId,
        amount: pack.credits,
        type: 'PURCHASE',
        balanceAfter: dealer.leadCredits,
        description: `Purchased ${pack.credits} credits (${pack.id})`,
        paymentId: payment.id,
      },
    });

    return { newBalance: dealer.leadCredits };
  });

  // 5. Queue invoice generation
  await invoiceQueue.add('generate-invoice', {
    paymentId: payment.id,
    type: 'lead_pack',
    dealerId,
  });

  // 6. Notify
  await notificationQueue.add('send-notification', {
    userId: dealerId,
    userType: 'dealer',
    type: 'payment_received',
    title: `${pack.credits} Credits Added`,
    body: `You now have ${result.newBalance} lead credits. Each credit lets you respond to one inquiry.`,
    data: { screen: 'dealer_credits' },
    channels: ['in_app'],
  });

  logger.info('Credit purchase completed', {
    dealerId,
    credits: pack.credits,
    amountPaisa: pack.pricePaisa,
    newBalance: result.newBalance,
  });

  return { creditsAdded: pack.credits, newBalance: result.newBalance };
}

// ──────────────────────────────────────────
// DEDUCT CREDIT (on quote submission)
// ──────────────────────────────────────────

export async function deductCredit(
  dealerId: string,
  inquiryId: string
): Promise<{
  success: boolean;
  remainingCredits: number;
}> {
  // Check if dealer has subscription with included leads first
  const subscription = await prisma.dealerSubscription.findFirst({
    where: { dealerId, status: 'ACTIVE' },
    include: { plan: true },
  });

  if (subscription) {
    // Check if subscription has leads remaining
    if (
      subscription.leadsLimit === -1 || // Unlimited
      subscription.leadsUsedThisPeriod < subscription.leadsLimit
    ) {
      // Deduct from subscription leads, not credits
      await prisma.dealerSubscription.update({
        where: { id: subscription.id },
        data: { leadsUsedThisPeriod: { increment: 1 } },
      });

      const remaining = subscription.leadsLimit === -1
        ? Infinity
        : subscription.leadsLimit - subscription.leadsUsedThisPeriod - 1;

      return { success: true, remainingCredits: remaining as number };
    }
  }

  // Fall through to credit deduction
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { leadCredits: true },
  });

  if (!dealer || dealer.leadCredits <= 0) {
    throw new AppError(
      'INSUFFICIENT_CREDITS',
      'You have no lead credits remaining. Purchase more credits or upgrade your subscription.',
      402 // 402 Payment Required
    );
  }

  // Deduct credit atomically
  const updated = await prisma.dealer.update({
    where: { id: dealerId },
    data: { leadCredits: { decrement: 1 } },
    select: { leadCredits: true },
  });

  // Log transaction
  await prisma.leadCreditTransaction.create({
    data: {
      dealerId,
      amount: -1,
      type: 'DEDUCTION',
      balanceAfter: updated.leadCredits,
      description: `Quote on inquiry ${inquiryId}`,
      inquiryId,
    },
  });

  // Low credit warning
  if (updated.leadCredits <= 3 && updated.leadCredits > 0) {
    await notificationQueue.add('send-notification', {
      userId: dealerId,
      userType: 'dealer',
      type: 'lead_credit_low',
      title: `Only ${updated.leadCredits} Credits Left`,
      body: 'You\'re running low on lead credits. Buy more to keep responding to inquiries.',
      data: { screen: 'dealer_credits' },
      channels: ['in_app', 'push'],
    });
  }

  if (updated.leadCredits === 0) {
    await notificationQueue.add('send-notification', {
      userId: dealerId,
      userType: 'dealer',
      type: 'lead_credit_depleted',
      title: 'No Credits Remaining',
      body: 'You have 0 lead credits. Purchase more to respond to new inquiries.',
      data: { screen: 'dealer_credits' },
      channels: ['in_app', 'email', 'push'],
    });
  }

  return { success: true, remainingCredits: updated.leadCredits };
}

// ──────────────────────────────────────────
// REFUND CREDIT (inquiry cancelled)
// ──────────────────────────────────────────

export async function refundCredit(
  dealerId: string,
  inquiryId: string,
  reason: string
): Promise<void> {
  // Only refund if the inquiry was cancelled before any quotes were selected
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { status: true },
  });

  if (!inquiry || !['CANCELLED', 'EXPIRED'].includes(inquiry.status)) {
    return; // No refund for completed inquiries
  }

  // Check if credit was actually deducted (not a subscription lead)
  const transaction = await prisma.leadCreditTransaction.findFirst({
    where: {
      dealerId,
      inquiryId,
      type: 'DEDUCTION',
    },
  });

  if (!transaction) return; // Was a subscription lead, not a paid credit

  // Refund
  const updated = await prisma.dealer.update({
    where: { id: dealerId },
    data: { leadCredits: { increment: 1 } },
    select: { leadCredits: true },
  });

  await prisma.leadCreditTransaction.create({
    data: {
      dealerId,
      amount: 1,
      type: 'REFUND',
      balanceAfter: updated.leadCredits,
      description: `Refund for cancelled inquiry ${inquiryId}: ${reason}`,
      inquiryId,
    },
  });

  logger.info('Lead credit refunded', { dealerId, inquiryId, newBalance: updated.leadCredits });
}
```

### 18.4.3 Lead Credit Transaction Model

This model is not yet defined in section-05-06. Adding it here as a new Prisma model.

```prisma
// Addition to schema.prisma

model LeadCreditTransaction {
  id            String   @id @default(uuid())
  dealerId      String
  
  amount        Int      // Positive for purchase/refund, negative for deduction
  type          String   // "PURCHASE" | "DEDUCTION" | "REFUND" | "ADJUSTMENT" | "BONUS"
  balanceAfter  Int      // Dealer's credit balance after this transaction
  
  description   String
  inquiryId     String?  // Set for DEDUCTION and REFUND
  paymentId     String?  // Set for PURCHASE
  
  dealer        Dealer   @relation(fields: [dealerId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  
  @@index([dealerId])                // All transactions for a dealer
  @@index([dealerId, createdAt])     // Sorted transaction history
  @@index([type])                    // Filter by type
  @@index([inquiryId])               // Find transactions for an inquiry
}
```

```typescript
interface LeadCreditTransaction {
  id: string;
  dealerId: string;
  amount: number;
  type: 'PURCHASE' | 'DEDUCTION' | 'REFUND' | 'ADJUSTMENT' | 'BONUS';
  balanceAfter: number;
  description: string;
  inquiryId: string | null;
  paymentId: string | null;
  createdAt: Date;
}
```

---

## 18.5 Webhook Handler -- Complete Implementation

### 18.5.1 Webhook Route

```typescript
// packages/api/src/routes/webhook.routes.ts

import { Router, Request, Response } from 'express';
import { verifyWebhookSignature } from '../integrations/razorpay/verify';
import { processWebhookEvent } from '../services/webhook.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/v1/webhooks/razorpay
 *
 * IMPORTANT:
 *   - This endpoint must NOT use JSON body parser middleware
 *     (we need the raw body for signature verification).
 *   - Must ALWAYS return 200 (Razorpay retries on non-200).
 *   - Must be idempotent (same webhook may be delivered multiple times).
 *   - Must NOT use authentication middleware (Razorpay doesn't send JWT).
 */
router.post(
  '/razorpay',
  // Raw body parser (Express middleware must be configured for this route)
  async (req: Request, res: Response) => {
    const startTime = Date.now();

    try {
      // 1. Get raw body for signature verification
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      const signature = req.headers['x-razorpay-signature'] as string;

      if (!signature) {
        logger.warn('Razorpay webhook: missing signature header');
        // Still return 200 to prevent Razorpay from retrying
        return res.status(200).json({ received: true, error: 'Missing signature' });
      }

      // 2. Verify webhook signature
      if (!verifyWebhookSignature(rawBody, signature)) {
        logger.error('Razorpay webhook: signature verification failed', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        });
        return res.status(200).json({ received: true, error: 'Invalid signature' });
      }

      // 3. Parse event
      const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      logger.info('Razorpay webhook received', {
        eventType: event.event,
        eventId: event.payload?.payment?.entity?.id || event.payload?.subscription?.entity?.id,
        webhookId: event.id || 'unknown',
      });

      // 4. Process event (idempotent)
      await processWebhookEvent(event);

      // 5. Always return 200
      const duration = Date.now() - startTime;
      logger.info('Razorpay webhook processed', {
        eventType: event.event,
        durationMs: duration,
      });

      return res.status(200).json({ received: true });
    } catch (err: any) {
      logger.error('Razorpay webhook processing error', {
        error: err.message,
        stack: err.stack,
      });
      // Still return 200 -- we'll process from the Razorpay dashboard if needed
      return res.status(200).json({ received: true, error: 'Processing error' });
    }
  }
);

export default router;
```

### 18.5.2 Webhook Event Processor

```typescript
// packages/api/src/services/webhook.service.ts

import { prisma } from '../lib/prisma';
import { cacheRedis } from '../lib/redis';
import { notificationQueue, invoiceQueue } from '../jobs/queues';
import { logger } from '../utils/logger';

// ──────────────────────────────────────────
// IDEMPOTENCY: Track processed webhook events
// ──────────────────────────────────────────

async function isAlreadyProcessed(eventId: string): Promise<boolean> {
  const key = `webhook:processed:${eventId}`;
  const result = await cacheRedis.set(key, '1', 'EX', 86400 * 7, 'NX'); // 7-day TTL
  return result === null; // null = already exists
}

// ──────────────────────────────────────────
// MAIN EVENT ROUTER
// ──────────────────────────────────────────

export async function processWebhookEvent(event: any): Promise<void> {
  const eventId = event.id || `${event.event}_${Date.now()}`;

  // Idempotency check
  if (await isAlreadyProcessed(eventId)) {
    logger.info('Webhook event already processed, skipping', { eventId, eventType: event.event });
    return;
  }

  switch (event.event) {
    // ── Payment Events ──
    case 'payment.captured':
      await handlePaymentCaptured(event.payload.payment.entity);
      break;

    case 'payment.failed':
      await handlePaymentFailed(event.payload.payment.entity);
      break;

    // ── Refund Events ──
    case 'refund.created':
      await handleRefundCreated(event.payload.refund.entity, event.payload.payment.entity);
      break;

    case 'refund.processed':
      await handleRefundProcessed(event.payload.refund.entity);
      break;

    case 'refund.failed':
      await handleRefundFailed(event.payload.refund.entity);
      break;

    // ── Subscription Events ──
    case 'subscription.activated':
      await handleSubscriptionActivated(event.payload.subscription.entity);
      break;

    case 'subscription.charged':
      await handleSubscriptionCharged(
        event.payload.subscription.entity,
        event.payload.payment.entity
      );
      break;

    case 'subscription.pending':
      await handleSubscriptionPending(event.payload.subscription.entity);
      break;

    case 'subscription.halted':
      await handleSubscriptionHalted(event.payload.subscription.entity);
      break;

    case 'subscription.cancelled':
      await handleSubscriptionCancelled(event.payload.subscription.entity);
      break;

    case 'subscription.completed':
      await handleSubscriptionCompleted(event.payload.subscription.entity);
      break;

    // ── Transfer Events (Route -- future) ──
    case 'transfer.processed':
      await handleTransferProcessed(event.payload.transfer.entity);
      break;

    case 'transfer.failed':
      await handleTransferFailed(event.payload.transfer.entity);
      break;

    default:
      logger.warn('Unhandled Razorpay webhook event', { eventType: event.event });
  }
}

// ──────────────────────────────────────────
// PAYMENT HANDLERS
// ──────────────────────────────────────────

async function handlePaymentCaptured(payment: any): Promise<void> {
  const razorpayOrderId = payment.order_id;
  const razorpayPaymentId = payment.id;

  if (!razorpayOrderId) {
    // Subscription payment -- handled by subscription.charged
    return;
  }

  // Find our payment record
  const dbPayment = await prisma.payment.findFirst({
    where: { razorpayOrderId },
  });

  if (!dbPayment) {
    logger.warn('Payment captured but no matching record found', { razorpayOrderId });
    return;
  }

  if (dbPayment.status === 'COMPLETED') {
    // Already processed (possibly by the verify endpoint)
    return;
  }

  // Update payment record
  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: 'COMPLETED',
      razorpayPaymentId,
      method: payment.method || null,
      bank: payment.bank || null,
      vpa: payment.vpa || null,
      paidAt: new Date(payment.created_at * 1000),
    },
  });

  logger.info('Payment captured via webhook', {
    paymentId: dbPayment.id,
    razorpayPaymentId,
    amountPaisa: payment.amount,
  });
}

async function handlePaymentFailed(payment: any): Promise<void> {
  const razorpayOrderId = payment.order_id;

  if (!razorpayOrderId) return;

  const dbPayment = await prisma.payment.findFirst({
    where: { razorpayOrderId, status: 'PENDING' },
  });

  if (!dbPayment) return;

  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: 'FAILED',
      razorpayPaymentId: payment.id,
      failureReason: payment.error_description || payment.error_reason || 'Payment failed',
    },
  });

  // Notify the dealer
  const dealerId = dbPayment.dealerId;
  if (dealerId) {
    await notificationQueue.add('send-notification', {
      userId: dealerId,
      userType: 'dealer',
      type: 'payment_failed',
      title: 'Payment Failed',
      body: `Your payment of ₹${(payment.amount / 100).toLocaleString('en-IN')} could not be processed. ${payment.error_description || 'Please try again.'}`,
      data: { screen: 'dealer_payments' },
      channels: ['in_app', 'email'],
    });
  }

  logger.info('Payment failed via webhook', {
    paymentId: dbPayment.id,
    reason: payment.error_description,
  });
}

// ──────────────────────────────────────────
// REFUND HANDLERS
// ──────────────────────────────────────────

async function handleRefundCreated(refund: any, payment: any): Promise<void> {
  const razorpayPaymentId = payment?.id || refund.payment_id;

  const dbPayment = await prisma.payment.findFirst({
    where: { razorpayPaymentId },
  });

  if (!dbPayment) {
    logger.warn('Refund created but no matching payment found', { razorpayPaymentId });
    return;
  }

  const refundAmount = refund.amount; // In paisa
  const isFullRefund = refundAmount >= dbPayment.amountPaisa;

  await prisma.payment.update({
    where: { id: dbPayment.id },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundAmountPaisa: refundAmount,
      refundedAt: new Date(),
    },
  });

  // Notify
  const recipientId = dbPayment.dealerId || dbPayment.userId;
  const recipientType = dbPayment.dealerId ? 'dealer' : 'user';
  if (recipientId) {
    await notificationQueue.add('send-notification', {
      userId: recipientId,
      userType: recipientType,
      type: 'payment_received',
      title: 'Refund Initiated',
      body: `A refund of ₹${(refundAmount / 100).toLocaleString('en-IN')} has been initiated. It will be credited within 5-7 business days.`,
      data: { screen: recipientType === 'dealer' ? 'dealer_payments' : 'user_payments' },
      channels: ['in_app', 'email'],
    });
  }

  logger.info('Refund created', {
    paymentId: dbPayment.id,
    refundAmount,
    isFullRefund,
  });
}

async function handleRefundProcessed(refund: any): Promise<void> {
  logger.info('Refund processed successfully', {
    refundId: refund.id,
    paymentId: refund.payment_id,
    amount: refund.amount,
  });
  // No action needed -- refund.created already updated the payment status
}

async function handleRefundFailed(refund: any): Promise<void> {
  logger.error('Refund failed', {
    refundId: refund.id,
    paymentId: refund.payment_id,
    reason: refund.status_detail?.reason,
  });
  // Alert admin team -- manual intervention needed
  await notificationQueue.add('send-notification', {
    userId: 'admin', // Admin notification channel
    userType: 'admin',
    type: 'system_announcement',
    title: 'ALERT: Refund Failed',
    body: `Refund ${refund.id} for payment ${refund.payment_id} failed. Manual intervention required.`,
    data: { screen: 'admin_payments', refundId: refund.id },
    channels: ['in_app', 'email'],
  });
}

// ──────────────────────────────────────────
// SUBSCRIPTION HANDLERS
// ──────────────────────────────────────────

async function handleSubscriptionActivated(subscription: any): Promise<void> {
  const razorpaySubId = subscription.id;

  const dbSub = await prisma.dealerSubscription.findFirst({
    where: { razorpaySubscriptionId: razorpaySubId },
  });

  if (!dbSub) {
    logger.warn('Subscription activated but no matching record', { razorpaySubId });
    return;
  }

  if (dbSub.status === 'ACTIVE') return; // Already active

  await prisma.dealerSubscription.update({
    where: { id: dbSub.id },
    data: { status: 'ACTIVE' },
  });

  logger.info('Subscription activated via webhook', {
    subscriptionId: dbSub.id,
    dealerId: dbSub.dealerId,
  });
}

async function handleSubscriptionCharged(subscription: any, payment: any): Promise<void> {
  const razorpaySubId = subscription.id;

  const dbSub = await prisma.dealerSubscription.findFirst({
    where: { razorpaySubscriptionId: razorpaySubId },
    include: { plan: true },
  });

  if (!dbSub) {
    logger.warn('Subscription charged but no matching record', { razorpaySubId });
    return;
  }

  // Calculate new period based on billing cycle
  const now = new Date();
  const currentEnd = dbSub.currentPeriodEnd;
  const isAnnual = subscription.notes?.billing_cycle === 'annual';

  const newPeriodStart = currentEnd > now ? currentEnd : now;
  const newPeriodEnd = isAnnual
    ? new Date(newPeriodStart.getFullYear() + 1, newPeriodStart.getMonth(), newPeriodStart.getDate())
    : new Date(newPeriodStart.getFullYear(), newPeriodStart.getMonth() + 1, newPeriodStart.getDate());

  // Update subscription period and reset leads
  await prisma.dealerSubscription.update({
    where: { id: dbSub.id },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: newPeriodStart,
      currentPeriodEnd: newPeriodEnd,
      leadsUsedThisPeriod: 0,
    },
  });

  // Create payment record for renewal
  const dbPayment = await prisma.payment.create({
    data: {
      dealerId: dbSub.dealerId,
      amountPaisa: payment.amount,
      currency: 'INR',
      description: `${dbSub.plan.displayName} subscription renewal`,
      paymentFor: 'subscription',
      referenceId: dbSub.id,
      referenceType: 'dealer_subscription',
      razorpayPaymentId: payment.id,
      status: 'COMPLETED',
      method: payment.method || null,
      paidAt: new Date(payment.created_at * 1000),
    },
  });

  // Queue invoice
  await invoiceQueue.add('generate-invoice', {
    paymentId: dbPayment.id,
    type: 'subscription',
    dealerId: dbSub.dealerId,
  });

  // Notify
  await notificationQueue.add('send-notification', {
    userId: dbSub.dealerId,
    userType: 'dealer',
    type: 'payment_received',
    title: 'Subscription Renewed',
    body: `Your ${dbSub.plan.displayName} plan has been renewed. Valid until ${newPeriodEnd.toLocaleDateString('en-IN')}.`,
    data: { screen: 'dealer_subscription' },
    channels: ['in_app'],
  });

  logger.info('Subscription renewal charged', {
    subscriptionId: dbSub.id,
    dealerId: dbSub.dealerId,
    newPeriodEnd,
  });
}

async function handleSubscriptionPending(subscription: any): Promise<void> {
  const razorpaySubId = subscription.id;

  const dbSub = await prisma.dealerSubscription.findFirst({
    where: { razorpaySubscriptionId: razorpaySubId },
    include: { plan: true },
  });

  if (!dbSub) return;

  // Payment is pending (e.g., UPI mandate approval). Don't change status yet.
  logger.info('Subscription payment pending', {
    subscriptionId: dbSub.id,
    dealerId: dbSub.dealerId,
  });
}

async function handleSubscriptionHalted(subscription: any): Promise<void> {
  const razorpaySubId = subscription.id;

  const dbSub = await prisma.dealerSubscription.findFirst({
    where: { razorpaySubscriptionId: razorpaySubId },
    include: { plan: true },
  });

  if (!dbSub) return;

  // Subscription halted = all payment retries failed
  await prisma.dealerSubscription.update({
    where: { id: dbSub.id },
    data: { status: 'GRACE_PERIOD' },
  });

  await notificationQueue.add('send-notification', {
    userId: dbSub.dealerId,
    userType: 'dealer',
    type: 'payment_failed',
    title: 'Subscription Payment Failed',
    body: `We couldn't process your ${dbSub.plan.displayName} plan renewal. Your account is in a 3-day grace period. Please update your payment method.`,
    data: { screen: 'dealer_subscription' },
    channels: ['in_app', 'email', 'sms'],
  });

  logger.warn('Subscription halted (payment failed)', {
    subscriptionId: dbSub.id,
    dealerId: dbSub.dealerId,
  });
}

async function handleSubscriptionCancelled(subscription: any): Promise<void> {
  const razorpaySubId = subscription.id;

  const dbSub = await prisma.dealerSubscription.findFirst({
    where: { razorpaySubscriptionId: razorpaySubId },
  });

  if (!dbSub) return;

  if (dbSub.status !== 'CANCELLED') {
    await prisma.dealerSubscription.update({
      where: { id: dbSub.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: dbSub.cancelReason || 'Cancelled via Razorpay',
      },
    });
  }

  logger.info('Subscription cancelled via webhook', {
    subscriptionId: dbSub.id,
    dealerId: dbSub.dealerId,
  });
}

async function handleSubscriptionCompleted(subscription: any): Promise<void> {
  const razorpaySubId = subscription.id;

  const dbSub = await prisma.dealerSubscription.findFirst({
    where: { razorpaySubscriptionId: razorpaySubId },
  });

  if (!dbSub) return;

  await prisma.dealerSubscription.update({
    where: { id: dbSub.id },
    data: { status: 'EXPIRED' },
  });

  logger.info('Subscription completed (all billing cycles exhausted)', {
    subscriptionId: dbSub.id,
    dealerId: dbSub.dealerId,
  });
}

// ──────────────────────────────────────────
// TRANSFER HANDLERS (FUTURE -- Route/Escrow)
// ──────────────────────────────────────────

async function handleTransferProcessed(transfer: any): Promise<void> {
  logger.info('Transfer processed', {
    transferId: transfer.id,
    amount: transfer.amount,
    recipient: transfer.recipient_settlement_id,
  });
  // TODO: Implement when Razorpay Route is activated
}

async function handleTransferFailed(transfer: any): Promise<void> {
  logger.error('Transfer failed', {
    transferId: transfer.id,
    reason: transfer.error?.description,
  });
  // TODO: Implement when Razorpay Route is activated
}
```

### 18.5.3 Webhook Configuration in Razorpay Dashboard

| Setting | Value |
|---------|-------|
| Webhook URL | `https://api.hub4estate.com/api/v1/webhooks/razorpay` |
| Secret | Stored in `RAZORPAY_WEBHOOK_SECRET` env var |
| Active Events | `payment.captured`, `payment.failed`, `refund.created`, `refund.processed`, `refund.failed`, `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`, `transfer.processed`, `transfer.failed` |
| Alert Email | tech@hub4estate.com |
| Retry Policy | Razorpay retries with exponential backoff: 5m, 30m, 1h, 3h, 6h, 12h, 24h |

---

## 18.6 GST Compliance

### 18.6.1 Tax Calculation Engine

```typescript
// packages/api/src/services/tax.service.ts

export interface TaxCalculation {
  subtotalPaisa: number;        // Amount before tax
  cgstRate: number;             // 0.09 for 9%
  sgstRate: number;             // 0.09 for 9%
  igstRate: number;             // 0.18 for 18% (OR cgst+sgst, never both)
  cgstPaisa: number;
  sgstPaisa: number;
  igstPaisa: number;
  totalTaxPaisa: number;
  totalPaisa: number;           // subtotal + tax
  isInterState: boolean;
  sacCode: string;
}

// Hub4Estate's registered state
const PLATFORM_STATE = 'Rajasthan'; // Registered at Sri Ganganagar, Rajasthan
const PLATFORM_GSTIN = 'XXXXXXXXXXXX'; // To be filled after GST registration

// Service Accounting Code for IT services
const PLATFORM_SAC_CODE = '998314'; // "IT consulting and support services"

/**
 * Calculate GST for a Hub4Estate platform charge.
 *
 * Rules:
 * - If buyer is in the same state as Hub4Estate (Rajasthan): CGST 9% + SGST 9% = 18%
 * - If buyer is in a different state: IGST 18%
 * - If buyer is unregistered (no GSTIN): same rules apply, just no ITC for them
 *
 * @param amountPaisa - Pre-tax amount in paisa
 * @param buyerState - Buyer's state (from their address or GSTIN)
 */
export function calculateGST(
  amountPaisa: number,
  buyerState: string
): TaxCalculation {
  const isInterState = buyerState.toLowerCase() !== PLATFORM_STATE.toLowerCase();
  const gstRate = 0.18; // 18% for IT services

  let cgstPaisa = 0;
  let sgstPaisa = 0;
  let igstPaisa = 0;

  if (isInterState) {
    igstPaisa = Math.round(amountPaisa * gstRate);
  } else {
    cgstPaisa = Math.round(amountPaisa * (gstRate / 2)); // 9%
    sgstPaisa = Math.round(amountPaisa * (gstRate / 2)); // 9%
  }

  const totalTaxPaisa = cgstPaisa + sgstPaisa + igstPaisa;

  return {
    subtotalPaisa: amountPaisa,
    cgstRate: isInterState ? 0 : 0.09,
    sgstRate: isInterState ? 0 : 0.09,
    igstRate: isInterState ? 0.18 : 0,
    cgstPaisa,
    sgstPaisa,
    igstPaisa,
    totalTaxPaisa,
    totalPaisa: amountPaisa + totalTaxPaisa,
    isInterState,
    sacCode: PLATFORM_SAC_CODE,
  };
}

/**
 * Determine state from GSTIN.
 * First 2 digits of GSTIN = state code.
 */
export function stateFromGSTIN(gstin: string): string {
  const STATE_CODES: Record<string, string> = {
    '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
    '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
    '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
    '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
    '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
    '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
    '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
    '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
    '25': 'Daman & Diu', '26': 'Dadra & Nagar Haveli',
    '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa',
    '31': 'Lakshadweep', '32': 'Kerala', '33': 'Tamil Nadu',
    '34': 'Puducherry', '35': 'Andaman & Nicobar', '36': 'Telangana',
    '37': 'Andhra Pradesh', '38': 'Ladakh',
  };

  const stateCode = gstin.substring(0, 2);
  return STATE_CODES[stateCode] || 'Unknown';
}

/**
 * HSN/SAC code mapping for product categories.
 * Used when Hub4Estate becomes a marketplace with product-level invoicing.
 */
export const HSN_CODES: Record<string, { code: string; description: string; gstRate: number }> = {
  mcb:       { code: '8536', description: 'Switchgear and protection devices', gstRate: 0.18 },
  rccb:      { code: '8536', description: 'Residual current devices', gstRate: 0.18 },
  wire:      { code: '8544', description: 'Insulated wire and cable', gstRate: 0.18 },
  cable:     { code: '8544', description: 'Insulated wire and cable', gstRate: 0.18 },
  switch:    { code: '8536', description: 'Electrical switches and sockets', gstRate: 0.18 },
  socket:    { code: '8536', description: 'Electrical switches and sockets', gstRate: 0.18 },
  led_light: { code: '9405', description: 'LED lamps and lighting fittings', gstRate: 0.18 },
  led_panel: { code: '9405', description: 'LED panel lights', gstRate: 0.18 },
  fan:       { code: '8414', description: 'Ceiling and exhaust fans', gstRate: 0.18 },
  db_box:    { code: '8537', description: 'Distribution boards', gstRate: 0.18 },
  conduit:   { code: '3917', description: 'PVC conduit pipes', gstRate: 0.18 },
  platform_service: { code: '998314', description: 'IT consulting and support services', gstRate: 0.18 },
};
```

### 18.6.2 Invoice Generation

```typescript
// packages/api/src/jobs/processors/invoice-generator.processor.ts

import { Job } from 'bullmq';
import { prisma } from '../../lib/prisma';
import { calculateGST, stateFromGSTIN } from '../../services/tax.service';
import { generateInvoicePDF } from '../../services/pdf.service';
import { uploadToS3 } from '../../lib/s3';
import { logger } from '../../utils/logger';

interface InvoiceJobData {
  paymentId: string;
  type: 'subscription' | 'lead_pack';
  dealerId: string;
}

/**
 * BullMQ job processor: generates GST-compliant tax invoice for a payment.
 * 
 * Invoice numbering format: H4E/{FY}/{TYPE}/{SEQ}
 *   FY = Financial year (2627 for April 2026 - March 2027)
 *   TYPE = INV (tax invoice), CN (credit note)
 *   SEQ = Zero-padded 5-digit sequential number
 * 
 * Example: H4E/2627/INV/00001
 */
export async function processInvoiceGeneration(job: Job<InvoiceJobData>): Promise<void> {
  const { paymentId, type, dealerId } = job.data;

  try {
    // 1. Fetch payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        dealer: {
          select: {
            businessName: true,
            email: true,
            phone: true,
            gstNumber: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
          },
        },
      },
    });

    if (!payment) {
      logger.error('Invoice generation: payment not found', { paymentId });
      return;
    }

    if (!payment.dealer) {
      logger.error('Invoice generation: dealer not found', { dealerId });
      return;
    }

    // 2. Check if invoice already exists (idempotent)
    const existingInvoice = await prisma.invoice.findFirst({
      where: { paymentId },
    });

    if (existingInvoice) {
      logger.info('Invoice already exists, skipping', { invoiceId: existingInvoice.id });
      return;
    }

    // 3. Determine buyer state
    const buyerState = payment.dealer.gstNumber
      ? stateFromGSTIN(payment.dealer.gstNumber)
      : payment.dealer.state || 'Rajasthan';

    // 4. Calculate tax
    const tax = calculateGST(payment.amountPaisa, buyerState);

    // 5. Generate invoice number
    const invoiceNumber = await generateNextInvoiceNumber('INV');

    // 6. Build line items
    const lineItems = buildLineItems(type, payment, tax);

    // 7. Create invoice record
    const invoice = await prisma.invoice.create({
      data: {
        paymentId,
        invoiceNumber,
        supplierGst: process.env.HUB4ESTATE_GSTIN || 'PENDING_REGISTRATION',
        buyerGst: payment.dealer.gstNumber || null,
        buyerName: payment.dealer.businessName,
        buyerAddress: formatAddress(payment.dealer),
        buyerState,
        buyerPincode: payment.dealer.pincode || null,
        lineItems: JSON.stringify(lineItems),
        subtotalPaisa: tax.subtotalPaisa,
        cgstPaisa: tax.cgstPaisa,
        sgstPaisa: tax.sgstPaisa,
        igstPaisa: tax.igstPaisa,
        totalPaisa: tax.totalPaisa,
        status: 'generated',
      },
    });

    // 8. Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      invoiceDate: new Date(),
      supplier: {
        name: 'HUB4ESTATE LLP',
        gstin: process.env.HUB4ESTATE_GSTIN || 'PENDING',
        address: '8-D-12, Jawahar Nagar, Sriganganagar, Ganganagar-335001, Rajasthan',
        pan: 'AATFH3466L',
        state: 'Rajasthan',
        stateCode: '08',
      },
      buyer: {
        name: payment.dealer.businessName,
        gstin: payment.dealer.gstNumber || 'Unregistered',
        address: formatAddress(payment.dealer),
        state: buyerState,
        stateCode: payment.dealer.gstNumber?.substring(0, 2) || '',
      },
      lineItems,
      subtotal: tax.subtotalPaisa,
      cgst: tax.cgstPaisa,
      sgst: tax.sgstPaisa,
      igst: tax.igstPaisa,
      total: tax.totalPaisa,
      isInterState: tax.isInterState,
      paymentMethod: payment.method || 'Online',
      razorpayPaymentId: payment.razorpayPaymentId || '',
    });

    // 9. Upload PDF to S3
    const s3Key = `invoices/${new Date().getFullYear()}/${invoiceNumber.replace(/\//g, '-')}.pdf`;
    const pdfUrl = await uploadToS3(pdfBuffer, s3Key, 'application/pdf');

    // 10. Update invoice with PDF URL
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl },
    });

    logger.info('Invoice generated', {
      invoiceId: invoice.id,
      invoiceNumber,
      paymentId,
      totalPaisa: tax.totalPaisa,
    });

  } catch (err: any) {
    logger.error('Invoice generation failed', {
      paymentId,
      error: err.message,
    });
    throw err; // BullMQ will retry
  }
}

/**
 * Generate the next sequential invoice number.
 * Uses a database sequence to ensure uniqueness under concurrency.
 */
async function generateNextInvoiceNumber(type: 'INV' | 'CN'): Promise<string> {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  // Indian financial year: April = start
  const fyStart = month >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fyEnd = fyStart + 1;
  const fy = `${fyStart.toString().slice(-2)}${fyEnd.toString().slice(-2)}`; // "2627"

  // Atomic counter in Redis
  const counterKey = `invoice:counter:${fy}:${type}`;
  const seq = await cacheRedis.incr(counterKey);

  // Set TTL to 2 years on first use
  if (seq === 1) {
    await cacheRedis.expire(counterKey, 63072000); // 2 years in seconds
  }

  const paddedSeq = seq.toString().padStart(5, '0');
  return `H4E/${fy}/${type}/${paddedSeq}`;
}

function buildLineItems(
  type: 'subscription' | 'lead_pack',
  payment: any,
  tax: any
): Array<{
  description: string;
  sacCode: string;
  qty: number;
  unitPricePaisa: number;
  taxRate: string;
  taxAmountPaisa: number;
  totalPaisa: number;
}> {
  return [{
    description: payment.description,
    sacCode: '998314',
    qty: 1,
    unitPricePaisa: tax.subtotalPaisa,
    taxRate: '18%',
    taxAmountPaisa: tax.totalTaxPaisa,
    totalPaisa: tax.totalPaisa,
  }];
}

function formatAddress(dealer: any): string {
  const parts = [dealer.address, dealer.city, dealer.state, dealer.pincode].filter(Boolean);
  return parts.join(', ');
}

// Import needed at top
import { cacheRedis } from '../../lib/redis';
```

### 18.6.3 Invoice PDF Service

```typescript
// packages/api/src/services/pdf.service.ts

import PDFDocument from 'pdfkit';
import { logger } from '../utils/logger';

interface InvoicePDFData {
  invoiceNumber: string;
  invoiceDate: Date;
  supplier: {
    name: string;
    gstin: string;
    address: string;
    pan: string;
    state: string;
    stateCode: string;
  };
  buyer: {
    name: string;
    gstin: string;
    address: string;
    state: string;
    stateCode: string;
  };
  lineItems: Array<{
    description: string;
    sacCode: string;
    qty: number;
    unitPricePaisa: number;
    taxRate: string;
    taxAmountPaisa: number;
    totalPaisa: number;
  }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  isInterState: boolean;
  paymentMethod: string;
  razorpayPaymentId: string;
}

/**
 * Generate a GST-compliant tax invoice PDF.
 * Returns a Buffer containing the PDF data.
 */
export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // ── Header ──
      doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice No: ${data.invoiceNumber}`, 50, 90);
      doc.text(`Date: ${data.invoiceDate.toLocaleDateString('en-IN')}`, 50, 105);
      doc.text(`Payment ID: ${data.razorpayPaymentId}`, 50, 120);

      // ── Supplier Details (left) ──
      doc.moveDown(2);
      const supplierY = doc.y;
      doc.font('Helvetica-Bold').text('Supplier:', 50, supplierY);
      doc.font('Helvetica').text(data.supplier.name, 50, supplierY + 15);
      doc.text(`GSTIN: ${data.supplier.gstin}`, 50, supplierY + 30);
      doc.text(`PAN: ${data.supplier.pan}`, 50, supplierY + 45);
      doc.text(data.supplier.address, 50, supplierY + 60, { width: 220 });
      doc.text(`State: ${data.supplier.state} (${data.supplier.stateCode})`, 50, supplierY + 90);

      // ── Buyer Details (right) ──
      doc.font('Helvetica-Bold').text('Buyer:', 320, supplierY);
      doc.font('Helvetica').text(data.buyer.name, 320, supplierY + 15);
      doc.text(`GSTIN: ${data.buyer.gstin}`, 320, supplierY + 30);
      doc.text(data.buyer.address, 320, supplierY + 45, { width: 220 });
      doc.text(`State: ${data.buyer.state} (${data.buyer.stateCode})`, 320, supplierY + 75);

      // ── Line Items Table ──
      const tableTop = supplierY + 120;
      drawTableHeader(doc, tableTop);

      let currentY = tableTop + 25;
      for (const item of data.lineItems) {
        drawTableRow(doc, currentY, item);
        currentY += 20;
      }

      // ── Totals ──
      currentY += 20;
      doc.font('Helvetica');
      doc.text('Subtotal:', 350, currentY);
      doc.text(formatINR(data.subtotal), 480, currentY, { align: 'right', width: 65 });
      currentY += 18;

      if (!data.isInterState) {
        doc.text(`CGST @ 9%:`, 350, currentY);
        doc.text(formatINR(data.cgst), 480, currentY, { align: 'right', width: 65 });
        currentY += 18;
        doc.text(`SGST @ 9%:`, 350, currentY);
        doc.text(formatINR(data.sgst), 480, currentY, { align: 'right', width: 65 });
        currentY += 18;
      } else {
        doc.text(`IGST @ 18%:`, 350, currentY);
        doc.text(formatINR(data.igst), 480, currentY, { align: 'right', width: 65 });
        currentY += 18;
      }

      // Total
      doc.moveTo(350, currentY).lineTo(545, currentY).stroke();
      currentY += 5;
      doc.font('Helvetica-Bold');
      doc.text('TOTAL:', 350, currentY);
      doc.text(formatINR(data.total), 480, currentY, { align: 'right', width: 65 });

      // ── Footer ──
      currentY += 40;
      doc.font('Helvetica').fontSize(8);
      doc.text(`Payment Method: ${data.paymentMethod}`, 50, currentY);
      doc.text('This is a computer-generated invoice and does not require a physical signature.', 50, currentY + 15);
      doc.text('Hub4Estate LLP | LLPIN: ACW-4269 | hub4estate.com', 50, currentY + 30);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function drawTableHeader(doc: PDFKit.PDFDocument, y: number): void {
  doc.font('Helvetica-Bold').fontSize(9);
  doc.text('Description', 50, y);
  doc.text('SAC', 250, y);
  doc.text('Qty', 310, y);
  doc.text('Rate', 360, y);
  doc.text('Tax', 420, y);
  doc.text('Amount', 480, y, { align: 'right', width: 65 });
  doc.moveTo(50, y + 15).lineTo(545, y + 15).stroke();
}

function drawTableRow(doc: PDFKit.PDFDocument, y: number, item: any): void {
  doc.font('Helvetica').fontSize(9);
  doc.text(item.description, 50, y, { width: 190 });
  doc.text(item.sacCode, 250, y);
  doc.text(item.qty.toString(), 310, y);
  doc.text(formatINR(item.unitPricePaisa), 360, y);
  doc.text(item.taxRate, 420, y);
  doc.text(formatINR(item.totalPaisa), 480, y, { align: 'right', width: 65 });
}

function formatINR(paisa: number): string {
  const rupees = paisa / 100;
  return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
```

---

## 18.7 Financial Reconciliation

### 18.7.1 Daily Reconciliation Job

```typescript
// packages/api/src/jobs/processors/reconciliation.processor.ts

import { Job } from 'bullmq';
import { getRazorpay } from '../../integrations/razorpay/client';
import { prisma } from '../../lib/prisma';
import { notificationQueue } from '../queues';
import { logger } from '../../utils/logger';

interface ReconciliationReport {
  date: string;
  totalTransactions: number;
  matched: number;
  mismatched: number;
  missingInRazorpay: number;
  missingInDatabase: number;
  totalAmountPaisa: number;
  discrepancies: Array<{
    type: 'missing_in_db' | 'missing_in_razorpay' | 'amount_mismatch' | 'status_mismatch';
    razorpayPaymentId: string;
    dbPaymentId: string | null;
    razorpayAmount: number;
    dbAmount: number | null;
    razorpayStatus: string;
    dbStatus: string | null;
  }>;
}

/**
 * Daily reconciliation job.
 * Runs at 02:00 IST (20:30 UTC previous day).
 * Compares all payments in Razorpay (previous day) with our database records.
 *
 * Schedule: cron('30 20 * * *') -- 8:30 PM UTC = 2:00 AM IST
 */
export async function processReconciliation(job: Job): Promise<void> {
  const razorpay = getRazorpay();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const fromTimestamp = Math.floor(yesterday.getTime() / 1000);
  const toTimestamp = Math.floor(todayStart.getTime() / 1000);

  logger.info('Starting daily reconciliation', {
    from: yesterday.toISOString(),
    to: todayStart.toISOString(),
  });

  // 1. Fetch all payments from Razorpay for the day
  let razorpayPayments: any[] = [];
  let skip = 0;
  const count = 100;

  while (true) {
    const batch = await razorpay.payments.all({
      from: fromTimestamp,
      to: toTimestamp,
      count,
      skip,
    });

    razorpayPayments = razorpayPayments.concat(batch.items);

    if (batch.items.length < count) break;
    skip += count;
  }

  // 2. Fetch all payments from our database for the day
  const dbPayments = await prisma.payment.findMany({
    where: {
      createdAt: {
        gte: yesterday,
        lt: todayStart,
      },
    },
  });

  // 3. Build lookup maps
  const razorpayMap = new Map(
    razorpayPayments.map((p) => [p.id, p])
  );
  const dbByRazorpayId = new Map(
    dbPayments.filter((p) => p.razorpayPaymentId).map((p) => [p.razorpayPaymentId!, p])
  );

  // 4. Reconcile
  const report: ReconciliationReport = {
    date: yesterday.toISOString().split('T')[0],
    totalTransactions: razorpayPayments.length,
    matched: 0,
    mismatched: 0,
    missingInRazorpay: 0,
    missingInDatabase: 0,
    totalAmountPaisa: 0,
    discrepancies: [],
  };

  // Check each Razorpay payment exists in our database
  for (const rzpPayment of razorpayPayments) {
    report.totalAmountPaisa += rzpPayment.amount;

    const dbPayment = dbByRazorpayId.get(rzpPayment.id);

    if (!dbPayment) {
      report.missingInDatabase++;
      report.discrepancies.push({
        type: 'missing_in_db',
        razorpayPaymentId: rzpPayment.id,
        dbPaymentId: null,
        razorpayAmount: rzpPayment.amount,
        dbAmount: null,
        razorpayStatus: rzpPayment.status,
        dbStatus: null,
      });
      continue;
    }

    // Check amount match
    if (dbPayment.amountPaisa !== rzpPayment.amount) {
      report.mismatched++;
      report.discrepancies.push({
        type: 'amount_mismatch',
        razorpayPaymentId: rzpPayment.id,
        dbPaymentId: dbPayment.id,
        razorpayAmount: rzpPayment.amount,
        dbAmount: dbPayment.amountPaisa,
        razorpayStatus: rzpPayment.status,
        dbStatus: dbPayment.status,
      });
      continue;
    }

    // Check status match
    const statusMap: Record<string, string> = {
      captured: 'COMPLETED',
      failed: 'FAILED',
      refunded: 'REFUNDED',
    };

    const expectedDbStatus = statusMap[rzpPayment.status];
    if (expectedDbStatus && dbPayment.status !== expectedDbStatus) {
      report.mismatched++;
      report.discrepancies.push({
        type: 'status_mismatch',
        razorpayPaymentId: rzpPayment.id,
        dbPaymentId: dbPayment.id,
        razorpayAmount: rzpPayment.amount,
        dbAmount: dbPayment.amountPaisa,
        razorpayStatus: rzpPayment.status,
        dbStatus: dbPayment.status,
      });
      continue;
    }

    report.matched++;
  }

  // Check for DB payments with no Razorpay match
  for (const dbPayment of dbPayments) {
    if (dbPayment.razorpayPaymentId && !razorpayMap.has(dbPayment.razorpayPaymentId)) {
      report.missingInRazorpay++;
      report.discrepancies.push({
        type: 'missing_in_razorpay',
        razorpayPaymentId: dbPayment.razorpayPaymentId!,
        dbPaymentId: dbPayment.id,
        razorpayAmount: 0,
        dbAmount: dbPayment.amountPaisa,
        razorpayStatus: 'not_found',
        dbStatus: dbPayment.status,
      });
    }
  }

  // 5. Store report
  // Store in a reconciliation_reports table or S3
  logger.info('Reconciliation complete', {
    date: report.date,
    total: report.totalTransactions,
    matched: report.matched,
    discrepancies: report.discrepancies.length,
    totalAmount: `₹${(report.totalAmountPaisa / 100).toLocaleString('en-IN')}`,
  });

  // 6. Alert on discrepancies
  if (report.discrepancies.length > 0) {
    await notificationQueue.add('send-notification', {
      userId: 'admin',
      userType: 'admin',
      type: 'system_announcement',
      title: `Reconciliation Alert: ${report.discrepancies.length} discrepancies`,
      body: `Daily reconciliation for ${report.date}: ${report.matched} matched, ${report.discrepancies.length} discrepancies found. Review in admin dashboard.`,
      data: {
        screen: 'admin_reconciliation',
        date: report.date,
        discrepancies: report.discrepancies.length,
      },
      channels: ['in_app', 'email'],
    });
  }
}
```

### 18.7.2 Settlement Tracking

```typescript
// packages/api/src/services/settlement.service.ts

/**
 * Settlement schedule:
 *   - Razorpay settles T+2 for standard (non-Route) payments
 *   - Route transfers: immediate after hold release
 *   - Platform commission: accumulated, settled to Hub4Estate bank weekly
 *
 * Hub4Estate bank details (for Razorpay settlement):
 *   Bank: HDFC | Branch: Jawahar Nagar SGR
 *   A/C: 59171100011000 | IFSC: HDFC0006167
 */

export interface SettlementSummary {
  date: string;
  subscriptionRevenue: number;   // Paisa
  creditRevenue: number;         // Paisa
  totalRevenue: number;          // Paisa
  pendingSettlement: number;     // Paisa (T+2 not yet received)
  settledAmount: number;         // Paisa (confirmed in bank)
  razorpayFees: number;          // Paisa (gateway fees deducted)
  netRevenue: number;            // Paisa (after fees)
}

export async function getDailySettlement(date: Date): Promise<SettlementSummary> {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const payments = await prisma.payment.findMany({
    where: {
      status: 'COMPLETED',
      paidAt: { gte: dayStart, lte: dayEnd },
    },
  });

  const subscriptionRevenue = payments
    .filter((p) => p.paymentFor === 'subscription')
    .reduce((sum, p) => sum + p.amountPaisa, 0);

  const creditRevenue = payments
    .filter((p) => p.paymentFor === 'lead_pack')
    .reduce((sum, p) => sum + p.amountPaisa, 0);

  const totalRevenue = subscriptionRevenue + creditRevenue;

  // Razorpay fees: 0% on UPI, 2% on cards/netbanking
  // Estimate based on payment methods
  const upiPayments = payments.filter((p) => p.method === 'upi');
  const nonUpiPayments = payments.filter((p) => p.method !== 'upi');
  const razorpayFees = Math.round(
    nonUpiPayments.reduce((sum, p) => sum + p.amountPaisa * 0.02, 0)
  );

  return {
    date: date.toISOString().split('T')[0],
    subscriptionRevenue,
    creditRevenue,
    totalRevenue,
    pendingSettlement: totalRevenue, // Simplified -- actual tracking via Razorpay settlement API
    settledAmount: 0, // Updated when Razorpay confirms settlement
    razorpayFees,
    netRevenue: totalRevenue - razorpayFees,
  };
}
```

### 18.7.3 Monthly GST Report

```typescript
// packages/api/src/jobs/processors/gst-report.processor.ts

import { Job } from 'bullmq';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';

/**
 * Monthly GST report generator.
 * Runs on 1st of every month at 06:00 IST.
 * Generates:
 *   - GSTR-1 data (outward supplies) for the previous month
 *   - Tax liability summary
 *   - Invoice-wise breakdown
 */
export async function processGSTReport(job: Job): Promise<void> {
  const now = new Date();
  const reportMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const reportMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const invoices = await prisma.invoice.findMany({
    where: {
      createdAt: { gte: reportMonth, lte: reportMonthEnd },
      status: { not: 'void' },
    },
    include: {
      payment: {
        select: { dealerId: true },
      },
    },
    orderBy: { invoiceNumber: 'asc' },
  });

  // Categorize by tax type
  const b2bInvoices = invoices.filter((inv) => inv.buyerGst && inv.buyerGst !== 'Unregistered');
  const b2cInvoices = invoices.filter((inv) => !inv.buyerGst || inv.buyerGst === 'Unregistered');

  const summary = {
    month: `${reportMonth.toLocaleString('en-IN', { month: 'long' })} ${reportMonth.getFullYear()}`,
    totalInvoices: invoices.length,
    b2bInvoices: b2bInvoices.length,
    b2cInvoices: b2cInvoices.length,
    totalTaxableValue: invoices.reduce((s, i) => s + i.subtotalPaisa, 0),
    totalCGST: invoices.reduce((s, i) => s + i.cgstPaisa, 0),
    totalSGST: invoices.reduce((s, i) => s + i.sgstPaisa, 0),
    totalIGST: invoices.reduce((s, i) => s + i.igstPaisa, 0),
    totalTax: invoices.reduce((s, i) => s + i.cgstPaisa + i.sgstPaisa + i.igstPaisa, 0),
    grandTotal: invoices.reduce((s, i) => s + i.totalPaisa, 0),
  };

  logger.info('GST monthly report generated', {
    month: summary.month,
    totalInvoices: summary.totalInvoices,
    totalTax: `₹${(summary.totalTax / 100).toLocaleString('en-IN')}`,
    grandTotal: `₹${(summary.grandTotal / 100).toLocaleString('en-IN')}`,
  });

  // Store report for admin dashboard
  await cacheRedis.set(
    `gst:report:${reportMonth.getFullYear()}-${(reportMonth.getMonth() + 1).toString().padStart(2, '0')}`,
    JSON.stringify(summary),
    'EX',
    86400 * 90 // 90 days
  );
}

import { cacheRedis } from '../../lib/redis';
```

---

## 18.8 Fraud Prevention

### 18.8.1 Payment Fraud Rules Engine

```typescript
// packages/api/src/services/fraud.service.ts

import { prisma } from '../lib/prisma';
import { cacheRedis } from '../lib/redis';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

interface FraudCheckResult {
  allowed: boolean;
  reason: string | null;
  riskScore: number;            // 0-100 (0 = safe, 100 = definite fraud)
  flags: string[];
}

/**
 * Run fraud checks before processing a payment.
 * Called BEFORE creating a Razorpay order.
 */
export async function checkPaymentFraud(
  dealerId: string,
  amountPaisa: number,
  ipAddress: string
): Promise<FraudCheckResult> {
  const flags: string[] = [];
  let riskScore = 0;

  // ── Rule 1: Velocity check -- max 5 payment attempts per hour ──
  const hourKey = `fraud:velocity:${dealerId}:${new Date().toISOString().slice(0, 13)}`;
  const attemptCount = await cacheRedis.incr(hourKey);
  await cacheRedis.expire(hourKey, 3600);

  if (attemptCount > 5) {
    flags.push('VELOCITY_EXCEEDED');
    riskScore += 40;
  } else if (attemptCount > 3) {
    flags.push('HIGH_VELOCITY');
    riskScore += 15;
  }

  // ── Rule 2: Amount limit -- max ₹10,00,000 per transaction ──
  if (amountPaisa > 10_00_000_00) { // ₹10 lakh in paisa
    flags.push('AMOUNT_EXCEEDS_LIMIT');
    return {
      allowed: false,
      reason: 'Transaction amount exceeds ₹10,00,000 limit. Please contact support for higher limits.',
      riskScore: 100,
      flags,
    };
  }

  // ── Rule 3: New dealer limit -- first 3 transactions max ₹50,000 each ──
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: { createdAt: true, status: true },
  });

  if (dealer) {
    const totalPayments = await prisma.payment.count({
      where: { dealerId, status: 'COMPLETED' },
    });

    if (totalPayments < 3 && amountPaisa > 50_000_00) { // ₹50,000 in paisa
      flags.push('NEW_DEALER_AMOUNT_LIMIT');
      riskScore += 30;
    }
  }

  // ── Rule 4: IP reputation check ──
  const ipKey = `fraud:ip:${ipAddress}`;
  const ipAttempts = await cacheRedis.incr(ipKey);
  await cacheRedis.expire(ipKey, 3600);

  if (ipAttempts > 20) { // 20 payment attempts from same IP in an hour
    flags.push('SUSPICIOUS_IP');
    riskScore += 25;
  }

  // ── Rule 5: Duplicate payment detection ──
  const recentDuplicate = await prisma.payment.findFirst({
    where: {
      dealerId,
      amountPaisa,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
      status: { in: ['PENDING', 'COMPLETED'] },
    },
  });

  if (recentDuplicate) {
    flags.push('POSSIBLE_DUPLICATE');
    riskScore += 20;
  }

  // ── Rule 6: Account status ──
  if (dealer?.status !== 'ACTIVE') {
    flags.push('INACTIVE_ACCOUNT');
    return {
      allowed: false,
      reason: 'Your account is not active. Please complete verification.',
      riskScore: 100,
      flags,
    };
  }

  // ── Decision ──
  const allowed = riskScore < 60; // Block if risk score >= 60

  if (!allowed) {
    logger.warn('Payment blocked by fraud rules', {
      dealerId,
      amountPaisa,
      riskScore,
      flags,
    });
  }

  return {
    allowed,
    reason: allowed ? null : `Payment blocked due to security check. Risk factors: ${flags.join(', ')}`,
    riskScore,
    flags,
  };
}
```

### 18.8.2 Chargeback Handling

```typescript
// packages/api/src/services/chargeback.service.ts

/**
 * Chargeback handling procedure:
 *
 * 1. Razorpay notifies us via webhook or dashboard alert
 * 2. Auto-freeze any pending escrow/transfers for the disputed payment
 * 3. Collect evidence from both parties (buyer, dealer)
 * 4. Submit evidence to Razorpay within 7 business days
 * 5. Track outcome and update records
 *
 * Chargeback rate MUST stay below 1% to maintain Razorpay account in good standing.
 *
 * Current implementation: manual process via admin dashboard.
 * Future: automated evidence collection and submission.
 */

export interface ChargebackRecord {
  razorpayPaymentId: string;
  razorpayDisputeId: string;
  amountPaisa: number;
  reason: string;
  status: 'open' | 'evidence_submitted' | 'won' | 'lost';
  evidenceDeadline: Date;
  dealerId: string;
  resolution: string | null;
}

// Chargeback rate monitoring
export async function getChargebackRate(): Promise<{
  totalTransactions: number;
  chargebacks: number;
  rate: number;
  isHealthy: boolean;
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalTransactions, chargebacks] = await Promise.all([
    prisma.payment.count({
      where: { status: 'COMPLETED', paidAt: { gte: thirtyDaysAgo } },
    }),
    prisma.payment.count({
      where: { status: 'REFUNDED', refundedAt: { gte: thirtyDaysAgo } },
      // Simplified -- actual chargebacks would be tracked separately
    }),
  ]);

  const rate = totalTransactions > 0 ? (chargebacks / totalTransactions) * 100 : 0;

  return {
    totalTransactions,
    chargebacks,
    rate: Math.round(rate * 100) / 100, // 2 decimal places
    isHealthy: rate < 1, // Must stay below 1%
  };
}
```

---

## 18.9 Transaction Escrow -- Phase 3 Architecture

This section documents the escrow architecture for when Hub4Estate processes buyer-dealer transactions (Phase 3). Not implemented yet, but architecture is defined for engineering readiness.

### 18.9.1 Razorpay Route Integration

```typescript
// packages/api/src/integrations/razorpay/route.ts
// PHASE 3 -- NOT YET ACTIVE

/**
 * Razorpay Route enables marketplace payment splits.
 * Workflow:
 * 1. Dealer creates a Linked Account (during enhanced KYC)
 * 2. Buyer pays via standard checkout
 * 3. Razorpay holds funds (on_hold: true)
 * 4. On delivery confirmation, Hub4Estate releases funds
 * 5. Platform commission goes to Hub4Estate, rest to dealer's linked account
 *
 * Requirements:
 * - Razorpay Route activation (contact Razorpay account manager)
 * - Each dealer needs a Linked Account with full KYC
 * - Hub4Estate needs a master merchant account
 */

interface EscrowOrder {
  buyerUserId: string;
  dealerId: string;
  orderId: string;
  amountPaisa: number;
  commissionPaisa: number;
  dealerPayoutPaisa: number;
  holdDays: number;             // Max 7 days per Razorpay Route limit
}

async function createEscrowOrder(input: EscrowOrder): Promise<any> {
  const razorpay = getRazorpay();

  // Get dealer's Razorpay linked account ID
  const dealer = await prisma.dealer.findUnique({
    where: { id: input.dealerId },
    select: { razorpayLinkedAccountId: true },
  });

  if (!dealer?.razorpayLinkedAccountId) {
    throw new AppError(
      'DEALER_NOT_ROUTE_ENABLED',
      'Dealer does not have a Razorpay linked account. Cannot process escrow.',
      400
    );
  }

  const order = await razorpay.orders.create({
    amount: input.amountPaisa,
    currency: 'INR',
    receipt: `order_${input.orderId}`,
    transfers: [{
      account: dealer.razorpayLinkedAccountId,
      amount: input.dealerPayoutPaisa,
      currency: 'INR',
      on_hold: true,                                                     // ESCROW HOLD
      on_hold_until: Math.floor(Date.now() / 1000) + (input.holdDays * 86400),
      notes: {
        orderId: input.orderId,
        commission: input.commissionPaisa.toString(),
      },
    }],
    notes: {
      orderId: input.orderId,
      buyerId: input.buyerUserId,
      dealerId: input.dealerId,
      type: 'marketplace_order',
    },
  });

  return order;
}

/**
 * Release escrow after delivery confirmation.
 */
async function releaseEscrow(
  razorpayPaymentId: string,
  transferId: string
): Promise<void> {
  const razorpay = getRazorpay();

  // Modify transfer to release hold
  await razorpay.payments.transfer(razorpayPaymentId).edit(transferId, {
    on_hold: false,
  });
}

/**
 * Commission calculation for transaction escrow.
 * Rate depends on dealer tier (from subscription plan).
 */
function calculateTransactionCommission(
  orderAmountPaisa: number,
  dealerPlanName: string
): { commissionPaisa: number; dealerPayoutPaisa: number; rate: number } {
  const COMMISSION_RATES: Record<string, number> = {
    starter:    0.020,   // 2.0%
    growth:     0.018,   // 1.8%
    premium:    0.015,   // 1.5%
    enterprise: 0.010,   // 1.0%
    free:       0.025,   // 2.5% (no subscription)
  };

  const rate = COMMISSION_RATES[dealerPlanName] || COMMISSION_RATES.free;
  const commissionPaisa = Math.round(orderAmountPaisa * rate);
  const dealerPayoutPaisa = orderAmountPaisa - commissionPaisa;

  return { commissionPaisa, dealerPayoutPaisa, rate };
}

import { getRazorpay } from './client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/errors';
```

### 18.9.2 Escrow State Machine

```
┌─────────┐
│ PENDING │ ─── Order created, checkout not yet completed
└────┬────┘
     │ Payment captured (webhook: payment.captured)
     ▼
┌─────────┐
│ FUNDED  │ ─── Funds held by Razorpay Route
└────┬────┘
     │ Transfer created with on_hold: true
     ▼
┌────────┐
│  HELD  │ ─── Escrow active. Waiting for delivery.
└────┬───┘
     │               │                    │
     │ Delivery      │ Buyer raises       │ 7-day auto-release
     │ confirmed     │ dispute            │ (no dispute filed)
     │ + 48h wait    │                    │
     │ + no dispute  │                    │
     ▼               ▼                    ▼
┌──────────┐  ┌───────────┐       ┌───────────────┐
│ RELEASED │  │ DISPUTED  │       │ AUTO_RELEASED  │
│ (normal) │  │           │       │ (7-day limit)  │
└──────────┘  └─────┬─────┘       └───────────────┘
                    │
             ┌──────┼──────┐
             │      │      │
             ▼      ▼      ▼
        Full     Partial   Dealer
        Refund   Refund    Wins
             │      │      │
             ▼      ▼      ▼
        ┌────────┐ ┌──────┐ ┌──────────┐
        │REFUNDED│ │SPLIT │ │ RELEASED │
        │        │ │      │ │ (dealer) │
        └────────┘ └──────┘ └──────────┘
```

---

## 18.10 Payment Security

### 18.10.1 Security Checklist

| Requirement | Implementation | Status |
|-------------|---------------|--------|
| No raw card data on our servers | Razorpay Standard Checkout (iframe) | Active |
| Webhook signature verification | HMAC-SHA256 with constant-time comparison | Active |
| Payment signature verification | HMAC-SHA256 on orderId + paymentId | Active |
| API keys not in code | AWS SSM Parameter Store + .env (never committed) | Active |
| PCI-DSS SAQ-A compliance | Self-assessment questionnaire annually | Scheduled |
| No PII in logs | Payment amounts, card details, UPI VPAs stripped from logs | Active |
| Idempotent webhook processing | Redis-backed event ID dedup | Active |
| Rate limiting on payment endpoints | 5 attempts/hour per dealer | Active |
| Fraud velocity checks | Redis sliding window counters | Active |
| Amount limits for new accounts | First 3 orders capped at ₹50,000 | Active |
| HTTPS only | TLS 1.2+ enforced, HSTS enabled | Active |
| Webhook IP allowlisting | Razorpay IP ranges (future enhancement) | Planned |

### 18.10.2 Key Rotation Schedule

| Key | Rotation Period | Procedure |
|-----|----------------|-----------|
| Razorpay API Key ID | Never (changes break integrations) | Only on compromise |
| Razorpay API Key Secret | Every 12 months | Generate new in dashboard, update SSM, verify, deprecate old |
| Razorpay Webhook Secret | Every 6 months | Generate new, update both dashboard and SSM simultaneously |
| JWT signing key (RS256) | Every 12 months | Generate new keypair, deploy both keys (old for verification only), phase out old after 30 days |

### 18.10.3 Monitoring and Alerting

| Metric | Threshold | Alert Channel | Action |
|--------|-----------|---------------|--------|
| Payment failure rate | > 10% in 1 hour | Slack #alerts + email | Investigate Razorpay status page, check our webhook handler |
| Chargeback rate | > 0.5% (30-day rolling) | Slack #alerts + email | Review recent orders, tighten fraud rules |
| Webhook processing time | > 5s p95 | Grafana alert | Scale webhook worker, check DB latency |
| Reconciliation discrepancies | > 0 | Daily email to finance | Manual review in admin dashboard |
| Failed subscription renewals | > 5 in 1 hour | Slack #alerts | Check Razorpay subscription status, contact affected dealers |
| Invoice generation failures | > 0 | Sentry alert | Check PDF generation, S3 access |

---

## 18.11 Frontend Payment Integration

### 18.11.1 Razorpay Checkout Component

```typescript
// packages/web/src/components/payment/RazorpayCheckout.tsx

import { useCallback, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from '@/components/ui/toast';

interface RazorpayCheckoutProps {
  // For subscriptions:
  type: 'subscription';
  planName: string;
  billingCycle: 'monthly' | 'annual';
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

interface RazorpayCheckoutCreditProps {
  // For lead credits:
  type: 'credit';
  packageId: string;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

type Props = RazorpayCheckoutProps | RazorpayCheckoutCreditProps;

declare global {
  interface Window {
    Razorpay: any;
  }
}

/**
 * Load Razorpay checkout script dynamically.
 * Script is loaded once and cached.
 */
function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  // Load script on mount
  useEffect(() => {
    loadRazorpayScript().catch(console.error);
  }, []);

  const openSubscriptionCheckout = useCallback(
    async (
      planName: string,
      billingCycle: 'monthly' | 'annual',
      onSuccess: (data: any) => void,
      onError: (error: string) => void
    ) => {
      try {
        await loadRazorpayScript();

        // 1. Create subscription on backend
        const response = await api.post('/subscriptions/create', {
          planName,
          billingCycle,
        });

        const { razorpaySubscriptionId, razorpayKeyId } = response.data.data;
        const { user } = useAuthStore.getState();

        // 2. Open Razorpay checkout
        const options = {
          key: razorpayKeyId,
          subscription_id: razorpaySubscriptionId,
          name: 'Hub4Estate',
          description: `${planName.charAt(0).toUpperCase() + planName.slice(1)} Plan - ${billingCycle}`,
          image: '/logo-square.png',
          handler: async (response: any) => {
            try {
              // 3. Verify payment on backend
              const verifyResult = await api.post('/subscriptions/verify', {
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySubscriptionId: response.razorpay_subscription_id,
                razorpaySignature: response.razorpay_signature,
              });
              onSuccess(verifyResult.data);
            } catch (err: any) {
              onError(err.response?.data?.error || 'Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: {
            color: '#B45309', // Hub4Estate amber/brown
          },
          modal: {
            ondismiss: () => {
              onError('Payment cancelled');
            },
            confirm_close: true,
            escape: false,
          },
          notes: {
            planName,
            billingCycle,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          onError(
            response.error?.description || 'Payment failed. Please try again.'
          );
        });
        rzp.open();
      } catch (err: any) {
        onError(err.message || 'Failed to initiate payment');
      }
    },
    []
  );

  const openCreditCheckout = useCallback(
    async (
      packageId: string,
      onSuccess: (data: any) => void,
      onError: (error: string) => void
    ) => {
      try {
        await loadRazorpayScript();

        // 1. Create order on backend
        const response = await api.post('/credits/purchase', { packageId });
        const { razorpayOrderId, razorpayKeyId, amountPaisa } = response.data.data;
        const { user } = useAuthStore.getState();

        // 2. Open Razorpay checkout
        const options = {
          key: razorpayKeyId,
          amount: amountPaisa,
          currency: 'INR',
          order_id: razorpayOrderId,
          name: 'Hub4Estate',
          description: 'Lead Credits Purchase',
          image: '/logo-square.png',
          handler: async (response: any) => {
            try {
              const verifyResult = await api.post('/credits/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              onSuccess(verifyResult.data);
            } catch (err: any) {
              onError(err.response?.data?.error || 'Payment verification failed');
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || '',
          },
          theme: { color: '#B45309' },
          modal: { ondismiss: () => onError('Payment cancelled'), confirm_close: true },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          onError(response.error?.description || 'Payment failed');
        });
        rzp.open();
      } catch (err: any) {
        onError(err.message || 'Failed to initiate payment');
      }
    },
    []
  );

  return { openSubscriptionCheckout, openCreditCheckout };
}
```

---

## 18.12 BullMQ Job Queue Registration

```typescript
// packages/api/src/jobs/queues.ts (additions for payment jobs)

import { Queue, Worker } from 'bullmq';
import { queueRedis } from '../lib/redis';
import { processInvoiceGeneration } from './processors/invoice-generator.processor';
import { processReconciliation } from './processors/reconciliation.processor';
import { processSubscriptionLifecycle } from './processors/subscription-lifecycle.processor';
import { processGSTReport } from './processors/gst-report.processor';

const connection = { connection: queueRedis };

// ── Queues ──
export const invoiceQueue = new Queue('invoice-generation', connection);
export const reconciliationQueue = new Queue('reconciliation', connection);
export const subscriptionLifecycleQueue = new Queue('subscription-lifecycle', connection);
export const gstReportQueue = new Queue('gst-report', connection);

// ── Workers ──
new Worker('invoice-generation', processInvoiceGeneration, {
  ...connection,
  concurrency: 3,
  limiter: { max: 10, duration: 60000 }, // Max 10 invoices/minute
});

new Worker('reconciliation', processReconciliation, {
  ...connection,
  concurrency: 1, // Only 1 reconciliation at a time
});

new Worker('subscription-lifecycle', processSubscriptionLifecycle, {
  ...connection,
  concurrency: 1,
});

new Worker('gst-report', processGSTReport, {
  ...connection,
  concurrency: 1,
});

// ── Scheduled Jobs ──

// Reconciliation: daily at 2:00 AM IST (20:30 UTC)
reconciliationQueue.add('daily-reconciliation', {}, {
  repeat: { pattern: '30 20 * * *' }, // Cron: 20:30 UTC = 02:00 IST
  removeOnComplete: { count: 30 },     // Keep last 30 runs
  removeOnFail: { count: 30 },
});

// Subscription lifecycle: every hour
subscriptionLifecycleQueue.add('hourly-check', {}, {
  repeat: { pattern: '0 * * * *' },    // Every hour on the hour
  removeOnComplete: { count: 48 },
  removeOnFail: { count: 48 },
});

// GST report: 1st of every month at 6:00 AM IST (00:30 UTC)
gstReportQueue.add('monthly-gst', {}, {
  repeat: { pattern: '30 0 1 * *' },
  removeOnComplete: { count: 12 },
  removeOnFail: { count: 12 },
});
```

---

## 18.13 Payment API Endpoints Summary

| Method | Path | Auth | Rate Limit | Description |
|--------|------|------|------------|-------------|
| `GET` | `/api/v1/subscriptions/plans` | Dealer | 30/min | List available plans |
| `GET` | `/api/v1/subscriptions/current` | Dealer | 30/min | Get current subscription |
| `POST` | `/api/v1/subscriptions/create` | Dealer | 5/min | Create subscription (returns Razorpay data) |
| `POST` | `/api/v1/subscriptions/verify` | Dealer | 10/min | Verify subscription payment |
| `POST` | `/api/v1/subscriptions/cancel` | Dealer | 3/min | Cancel subscription |
| `POST` | `/api/v1/subscriptions/change-plan` | Dealer | 3/min | Upgrade/downgrade plan |
| `GET` | `/api/v1/credits/packages` | Dealer | 30/min | List credit packages |
| `GET` | `/api/v1/credits/balance` | Dealer | 30/min | Get current credit balance |
| `GET` | `/api/v1/credits/transactions` | Dealer | 30/min | Get credit transaction history |
| `POST` | `/api/v1/credits/purchase` | Dealer | 5/min | Create credit purchase order |
| `POST` | `/api/v1/credits/verify` | Dealer | 10/min | Verify credit purchase payment |
| `POST` | `/api/v1/webhooks/razorpay` | None (signature) | 100/min | Razorpay webhook endpoint |
| `GET` | `/api/v1/payments/history` | Dealer | 30/min | Payment history with pagination |
| `GET` | `/api/v1/payments/:id` | Dealer | 30/min | Get payment details |
| `GET` | `/api/v1/invoices` | Dealer | 30/min | List invoices |
| `GET` | `/api/v1/invoices/:id/download` | Dealer | 10/min | Download invoice PDF |
| `GET` | `/api/v1/admin/payments/reconciliation` | Admin | 10/min | Reconciliation report |
| `GET` | `/api/v1/admin/payments/settlement` | Admin | 10/min | Settlement summary |
| `GET` | `/api/v1/admin/payments/gst-report` | Admin | 10/min | Monthly GST report |
| `GET` | `/api/v1/admin/payments/chargeback-rate` | Admin | 10/min | Chargeback rate metric |

---

*End of Sections 17 & 18. Next: Section 19 -- Notification Engine and Communication Hub.*
