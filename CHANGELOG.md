# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Inquiry tracking system with pipeline management
- Brand dealer partnership management routes and functionality
- Activity logging service for tracking user and system activities
- Database management utility routes for admin operations
- Admin analytics page for business intelligence
- Admin fraud detection page for security monitoring
- Admin inquiry management pages
- Admin brand-dealer management interface
- Product type categorization pages
- Enhanced dealer onboarding workflow
- Comprehensive seed data for realistic product catalog

### Changed
- Restructured codebase for production readiness
- Enhanced documentation and configuration files
- Improved security with updated .gitignore patterns
- Reorganized seed files into dedicated scripts directory
- Consolidated utility scripts into proper locations
- Updated environment variable management

### Fixed
- Environment variable documentation in .env.example files
- File organization and directory structure
- TypeScript compilation configuration

## [1.0.0] - 2025-01-19

### Added
- User authentication system with Google OAuth 2.0
- OTP-based phone verification for additional security
- Comprehensive product catalog with categories and subcategories
- RFQ (Request for Quotation) system for buyers
- Quote management system for dealers
- Dealer registration and verification workflow
- Admin dashboard with dealer management
- AI-powered assistant using Anthropic Claude
- Email notifications using Resend
- SMS notifications support (MSG91 and Twilio)
- Community forum for user engagement
- Knowledge hub for product information
- Live chat functionality
- CRM features for dealer management
- Web scraper for product data collection
- Contact form for inquiries
- File upload support for dealer documents and product photos
- Rate limiting for API security
- Session management with secure cookies
- PostgreSQL database with Prisma ORM
- Docker containerization for easy deployment
- Frontend built with React 18, TypeScript, and Tailwind CSS
- Backend built with Express.js and TypeScript
- Comprehensive API documentation
- Health check endpoints

### Security
- Helmet.js for security headers
- CORS configuration for cross-origin requests
- JWT-based authentication
- Bcrypt password hashing
- Session secret management
- Rate limiting to prevent abuse
- Input validation using express-validator

### Infrastructure
- Monorepo structure with workspaces
- Docker Compose for local development
- Multi-stage Docker builds for production
- Nginx configuration for frontend serving
- Database migrations with Prisma
- Seed scripts for initial data population
