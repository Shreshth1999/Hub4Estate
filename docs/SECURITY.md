# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Hub4Estate, please send an email to security@hub4estate.com. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (critical issues within 7 days)

## Security Measures

### Authentication & Authorization

- **Multi-Factor Authentication**: Google OAuth 2.0 integration
- **OTP Verification**: SMS-based one-time passwords for phone verification
- **JWT Tokens**: Secure token-based authentication with expiration
- **Session Management**: Secure HTTP-only cookies with 7-day expiration
- **Password Security**: Bcrypt hashing with 12 rounds
- **Role-Based Access Control**: User, Dealer, and Admin roles

### Data Protection

- **Encryption in Transit**: HTTPS/TLS for all API communications
- **Encryption at Rest**: Database-level encryption for sensitive data
- **Environment Variables**: Secure storage of API keys and secrets
- **Input Validation**: Express-validator for all user inputs
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM
- **XSS Protection**: React's built-in XSS protection + Helmet.js

### API Security

- **Rate Limiting**: 1000 requests per 15 minutes per IP
- **CORS**: Configured for specific origins only
- **Helmet.js**: Security headers (CSP, X-Frame-Options, etc.)
- **Request Size Limits**: 10MB max payload size
- **File Upload Validation**: Type and size restrictions (5MB max)

### Infrastructure Security

- **Docker Isolation**: Containerized services
- **Network Segmentation**: Separate frontend, backend, and database networks
- **Database Access**: Restricted to backend service only
- **Secrets Management**: Environment variables, never committed to git
- **Dependency Scanning**: Regular updates and vulnerability checks

### Monitoring & Logging

- **Activity Logging**: User and system activities tracked
- **Error Tracking**: Comprehensive error logging (production errors sanitized)
- **Access Logs**: API endpoint access monitoring
- **Failed Login Attempts**: Tracked and rate-limited

## Security Best Practices

### For Developers

1. **Never commit sensitive data** (.env files, API keys, secrets)
2. **Always use parameterized queries** (Prisma ORM handles this)
3. **Validate all user inputs** on both client and server
4. **Keep dependencies updated** regularly
5. **Use secure random strings** for secrets (minimum 32 characters)
6. **Enable 2FA** on all development accounts
7. **Review code** before merging (especially authentication/authorization)

### For Deployment

1. **Use HTTPS** in production (never HTTP)
2. **Set secure environment variables** (strong SESSION_SECRET and JWT_SECRET)
3. **Configure CORS** properly (specific origins, not wildcard)
4. **Enable database backups** with encryption
5. **Use latest Node.js LTS** version
6. **Monitor logs** for suspicious activity
7. **Regular security audits** of dependencies

## Known Security Considerations

### Google OAuth

- Client secrets should be rotated periodically
- Callback URLs must be whitelisted in Google Cloud Console
- Never expose client secrets in frontend code

### File Uploads

- Files are stored in `/backend/uploads/` directory
- Only specific file types allowed (PDF for documents, images for photos)
- File size limited to 5MB
- Files are not executed, only stored and served

### Database

- PostgreSQL connection string contains credentials
- Use SSL connection in production
- Regular backups recommended
- Connection pooling configured via Prisma

### Third-Party Integrations

- **Anthropic API**: Optional, API key required
- **Resend**: Email sending, API key required
- **MSG91/Twilio**: SMS sending, credentials required
- All API keys stored in environment variables

## Compliance

- **GDPR**: User data can be exported and deleted on request
- **Data Retention**: Configurable retention policies
- **Privacy**: See Privacy Policy for user data handling

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1). All users are strongly encouraged to update immediately.

Subscribe to security advisories:
- GitHub Security Advisories
- Email: security-advisories@hub4estate.com

## Responsible Disclosure

We practice responsible disclosure:

1. Vulnerability reported to security@hub4estate.com
2. We confirm receipt and begin investigation
3. We develop and test a fix
4. We release the security patch
5. We publicly disclose the vulnerability (after fix is deployed)

Thank you for helping keep Hub4Estate secure!
