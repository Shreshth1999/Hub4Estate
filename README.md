# Hub4Estate

> Electronics & Electrical Procurement Platform for Real Estate

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20.x-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org)

Hub4Estate is a comprehensive B2B platform connecting real estate professionals (homeowners, contractors, architects, builders) with verified electrical and electronics product dealers. The platform streamlines product discovery, RFQ management, dealer matching, and quote comparison for construction and renovation projects.

## ✨ Features

### For Users
- **Google OAuth Authentication** - Secure, passwordless login
- **Product Catalog** - 5000+ electrical products with detailed specifications
- **Smart RFQ System** - Submit requests and receive competitive quotes from multiple dealers
- **Quote Comparison** - Side-by-side comparison of dealer quotes
- **Inquiry Tracking** - Track product inquiries with unique tracking codes
- **Community Forum** - Discuss products, share experiences, get advice
- **Knowledge Hub** - Educational articles about electrical products
- **AI Assistant** - Anthropic Claude-powered chatbot for product guidance

### For Dealers
- **Streamlined Onboarding** - Easy registration with document verification
- **RFQ Notifications** - Automatic matching to relevant RFQs based on location and expertise
- **Quote Management** - Submit and track quotes with performance analytics
- **Brand Authorization** - Register authorized brands with verification
- **Service Area Management** - Define serviceable pincodes
- **Performance Metrics** - Conversion rates, response times, and analytics

### For Admins
- **Dealer Verification** - Review and approve dealer registrations
- **Analytics Dashboard** - Real-time business intelligence and metrics
- **Inquiry Pipeline** - Manage customer inquiries with automated dealer matching
- **Fraud Detection** - Automated fraud flags and manual review system
- **CRM System** - B2B outreach and partnership management
- **Product Scraper** - Automated product data collection from brand websites
- **Content Management** - Manage knowledge base articles and categories

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: Passport.js (Google OAuth), JWT, OTP
- **Email**: Resend API
- **SMS**: MSG91 / Twilio
- **AI**: Anthropic Claude API
- **File Storage**: Local file system (uploads directory)
- **Security**: Helmet, CORS, Rate Limiting, Bcrypt

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation

### DevOps
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (production)
- **Version Control**: Git
- **CI/CD**: GitHub Actions (configured)

## 📋 Prerequisites

- Node.js 20.x ([Download](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm))
- npm 10.x (comes with Node.js)
- PostgreSQL 14+ ([Download](https://www.postgresql.org/download/))
- Git ([Download](https://git-scm.com/downloads))

## 🛠️ Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/hub4estate.git
cd hub4estate
```

### 2. Install Dependencies

```bash
# Install all dependencies (frontend + backend)
npm run install:all
```

### 3. Configure Environment

#### Backend Configuration

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hub4estate?schema=public"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Authentication (generate secure random strings)
SESSION_SECRET=your-super-secret-session-key-min-32-chars
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Optional: Anthropic AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Optional: Email (Resend)
RESEND_API_KEY=your-resend-api-key
NOTIFICATION_EMAIL=noreply@yourdomain.com
```

#### Frontend Configuration

```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001
```

### 4. Setup Database

```bash
# Generate Prisma client
cd backend
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed

# Return to root
cd ..
```

### 5. Run Development Server

```bash
# Start both frontend and backend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

### 6. Open Prisma Studio (Optional)

```bash
npm run db:studio
```

Access Prisma Studio at http://localhost:5555 to view and edit database records.

## 📁 Project Structure

```
hub4estate/
├── backend/                   # Express.js backend
│   ├── src/
│   │   ├── config/           # Database, env, passport configuration
│   │   ├── middleware/       # Auth, validation middleware
│   │   ├── routes/           # API route handlers (16 modules)
│   │   ├── services/         # Business logic layer
│   │   └── index.ts          # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── scripts/
│   │   ├── seeds/            # Database seed files
│   │   └── utilities/        # Utility scripts
│   ├── uploads/              # File uploads directory
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                  # React frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── layouts/      # Layout wrappers
│   │   │   └── ui/           # Base UI components (shadcn)
│   │   ├── pages/            # Page components
│   │   │   ├── admin/        # Admin pages
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── dealer/       # Dealer portal
│   │   │   ├── products/     # Product pages
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts        # API client
│   │   │   └── store.ts      # Zustand store
│   │   └── App.tsx           # Root component
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docs/                      # Documentation
│   ├── api/                  # API documentation
│   │   └── API.md
│   ├── architecture/         # Architecture docs
│   │   ├── ARCHITECTURE.md
│   │   └── DATABASE_SCHEMA.md
│   ├── assets/               # Documentation assets
│   ├── CONTRIBUTING.md
│   ├── DEPLOYMENT.md
│   └── SECURITY.md
│
├── scripts/                   # Utility scripts
│   └── generators/           # Data generation scripts
│
├── .github/                   # GitHub configuration
│   ├── workflows/            # CI/CD workflows
│   └── ISSUE_TEMPLATE/       # Issue templates
│
├── docker-compose.yml        # Multi-container setup
├── .gitignore
├── .prettierrc               # Code formatting
├── .editorconfig             # Editor configuration
├── .eslintrc.json            # Linting rules
├── .nvmrc                    # Node version
├── CHANGELOG.md              # Version history
├── LICENSE                   # Proprietary license
└── README.md                 # This file
```

## 📚 Documentation

- **[API Documentation](docs/api/API.md)** - Complete API reference with examples
- **[Architecture Guide](docs/architecture/ARCHITECTURE.md)** - System design and patterns
- **[Database Schema](docs/architecture/DATABASE_SCHEMA.md)** - Database structure and relationships
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Contributing Guide](docs/CONTRIBUTING.md)** - Development guidelines
- **[Security Policy](docs/SECURITY.md)** - Security measures and reporting

## 🔧 Available Scripts

### Root Level

```bash
npm run install:all      # Install all dependencies
npm run dev              # Start frontend and backend
npm run build            # Build frontend and backend
npm run lint             # Lint all code
npm run format           # Format all code with Prettier
npm run format:check     # Check code formatting
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database
npm run db:studio        # Open Prisma Studio
```

### Backend

```bash
cd backend
npm run dev              # Start development server
npm run build            # Build TypeScript
npm start                # Start production server
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database
npm run db:studio        # Prisma Studio
npm run db:generate      # Generate Prisma Client
```

### Frontend

```bash
cd frontend
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint TypeScript/React
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npm run db:migrate

# Seed database (first time only)
docker-compose exec backend npm run db:seed

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [Deployment Guide](docs/DEPLOYMENT.md) for production deployment instructions.

## 🔐 Authentication Setup

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URI:
   - Development: `http://localhost:3001/api/auth/google/callback`
   - Production: `https://api.yourdomain.com/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### JWT Secret Generation

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run linting and tests (`npm run lint && npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 🐛 Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `psql -U postgres`
- Check DATABASE_URL format in `.env`
- Ensure database exists: `createdb hub4estate`

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Prisma Client Not Found

```bash
cd backend
npm run db:generate
```

### Build Errors

```bash
# Clean node_modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install:all
```

## 📝 License

This project is proprietary software. All rights reserved. See [LICENSE](LICENSE) for details.

Unauthorized copying, modification, distribution, or use of this software is strictly prohibited.

## 🙏 Acknowledgments

- [Prisma](https://www.prisma.io/) - Database ORM
- [React](https://reactjs.org/) - UI library
- [Express](https://expressjs.com/) - Backend framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Anthropic](https://www.anthropic.com/) - AI assistant
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## 📧 Contact

For questions, issues, or partnership inquiries:

- **Website**: https://hub4estate.com
- **Email**: contact@hub4estate.com
- **Security**: security@hub4estate.com
- **GitHub Issues**: [Report a bug](https://github.com/YOUR_USERNAME/hub4estate/issues)

---

**Built with ❤️ for the Real Estate Industry**
