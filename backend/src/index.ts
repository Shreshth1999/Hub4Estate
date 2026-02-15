import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import passportConfig from './config/passport';
import prisma from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';
import rfqRoutes from './routes/rfq.routes';
import quoteRoutes from './routes/quote.routes';
import dealerRoutes from './routes/dealer.routes';
import adminRoutes from './routes/admin.routes';
import communityRoutes from './routes/community.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import contactRoutes from './routes/contact.routes';
import chatRoutes from './routes/chat.routes';
import crmRoutes from './routes/crm.routes';
import scraperRoutes from './routes/scraper.routes';
import inquiryRoutes from './routes/inquiry.routes';
import inquiryPipelineRoutes from './routes/inquiry-pipeline.routes';
import brandDealerRoutes from './routes/brand-dealer.routes';
import databaseRoutes from './routes/database.routes';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration - supports localhost and any deployment URL
const allowedOrigins = env.FRONTEND_URL
  ? env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // Check if origin matches allowed origins or is a Replit/deployment URL
    const isAllowed = allowedOrigins.some(allowed => origin.includes(allowed)) ||
      origin.includes('.replit.dev') ||
      origin.includes('.repl.co') ||
      origin.includes('.vercel.app') ||
      origin.includes('hub4estate.com') ||
      origin.includes('localhost');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session setup
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport initialization
app.use(passportConfig.initialize());
app.use(passportConfig.session());

// Serve uploaded files (product photos, dealer documents)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'error', error: 'Database connection failed' });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/rfq', rfqRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/scraper', scraperRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use('/api/inquiry-pipeline', inquiryPipelineRoutes);
app.use('/api/brand-dealers', brandDealerRoutes);
app.use('/api/database', databaseRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  return res.status(err.status || 500).json({
    error: env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});

// Start server
const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} [${env.NODE_ENV}]`);
});

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
