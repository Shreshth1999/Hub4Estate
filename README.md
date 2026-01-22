# Hub4Estate

Electronics & Electrical Procurement Platform for Real Estate.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database and API credentials

# Frontend (optional)
cp frontend/.env.example frontend/.env
```

### 3. Setup Database

```bash
cd backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
hub4estate/
├── backend/
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── config/      # Configuration
│   │   ├── middleware/  # Auth, validation
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── index.ts     # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── lib/         # API client, store
│   └── .env.example
└── package.json
```

## Features

- User authentication (Google OAuth, OTP)
- Product catalog with categories
- RFQ (Request for Quotation) system
- Dealer management and verification
- Quote comparison
- Admin dashboard
- AI-powered assistant
- Community forum
- Knowledge hub

## Deployment

Works on any platform (Replit, Railway, Render, etc.):

1. Set environment variables from `.env.example`
2. Run `npm run build`
3. Start with `npm start`

## License

Proprietary - All rights reserved
