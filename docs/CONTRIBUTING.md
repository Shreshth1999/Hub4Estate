# Contributing to Hub4Estate

Thank you for your interest in contributing to Hub4Estate! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Development Setup

### Prerequisites

- Node.js 20.x (use nvm: `nvm use`)
- npm or yarn
- PostgreSQL 14+
- Git

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/hub4estate.git
cd hub4estate

# Install dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your local configuration
# - DATABASE_URL: Your PostgreSQL connection string
# - GOOGLE_CLIENT_ID/SECRET: From Google Cloud Console
# - Other API keys as needed

# Generate Prisma client
cd backend
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed

# Return to root
cd ..

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types when possible
- Use interfaces for object shapes
- Use enums for fixed sets of values
- Document complex types with JSDoc comments

### React Best Practices

- Use functional components with hooks
- Keep components small and focused
- Use meaningful component and variable names
- Extract reusable logic into custom hooks
- Use TypeScript interfaces for props

### Backend Best Practices

- Follow RESTful API design principles
- Use async/await instead of callbacks
- Handle errors consistently with try-catch
- Validate all inputs using express-validator
- Use Prisma for all database operations
- Never expose sensitive data in responses

### Code Style

We use Prettier and ESLint for code formatting:

```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

**Configuration:**
- **Prettier**: Single quotes, semicolons, 100 char line width
- **ESLint**: Based on recommended TypeScript rules
- **EditorConfig**: 2-space indentation, LF line endings

### File Naming

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Routes**: kebab-case with suffix (e.g., `auth.routes.ts`)
- **Services**: kebab-case with suffix (e.g., `email.service.ts`)

### Directory Structure

```
backend/src/
├── config/         # Configuration files
├── middleware/     # Express middleware
├── routes/         # API route definitions
├── services/       # Business logic
└── index.ts        # Entry point

frontend/src/
├── components/     # React components
├── pages/          # Page components
├── lib/            # Utilities and stores
└── App.tsx         # Root component
```

## Git Workflow

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Urgent production fixes
- `refactor/description` - Code refactoring
- `docs/description` - Documentation changes

Examples:
- `feature/dealer-verification`
- `bugfix/login-redirect`
- `refactor/api-error-handling`

### Commit Messages

Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add Google OAuth login

Implement Google OAuth 2.0 authentication flow with session management.

Closes #123
```

```
fix(dealer): correct verification status update

The dealer verification status was not being updated correctly due to
incorrect Prisma query. Updated to use the correct update syntax.

Fixes #456
```

### Commit Best Practices

- Write clear, concise commit messages
- Keep commits focused and atomic
- Reference issue numbers when applicable
- Use present tense ("add feature" not "added feature")
- Capitalize the first letter of the subject
- Don't end the subject line with a period

## Testing

### Writing Tests

- Write tests for all new features
- Update tests when modifying existing code
- Aim for meaningful test coverage
- Use descriptive test names

### Running Tests

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

**Backend (Jest):**
```typescript
describe('Auth Routes', () => {
  it('should login user with valid credentials', async () => {
    // Test implementation
  });
});
```

**Frontend (Vitest + React Testing Library):**
```typescript
describe('LoginPage', () => {
  it('should render login form', () => {
    // Test implementation
  });
});
```

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run quality checks**:
   ```bash
   npm run lint        # Check for linting errors
   npm run format      # Format code
   npm test            # Run all tests
   npm run build       # Ensure build succeeds
   ```

3. **Update documentation** if needed

4. **Add/update tests** for your changes

### Creating a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/your-feature
   ```

2. Open a Pull Request on GitHub

3. Fill out the PR template completely:
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

4. Ensure all CI checks pass

5. Request review from maintainers

### PR Review Process

- All PRs require at least one approval
- Address all review comments
- Keep PR focused (one feature/fix per PR)
- Rebase if requested to keep history clean

### After Approval

Once approved and all checks pass:
- Squash commits if requested
- Merge using "Squash and merge" or "Rebase and merge"
- Delete your branch after merging

## Database Migrations

### Creating a Migration

```bash
cd backend

# Create a migration
npx prisma migrate dev --name description_of_change

# Apply migration
npm run db:migrate
```

### Migration Best Practices

- Always test migrations locally first
- Write reversible migrations when possible
- Document any manual steps required
- Never modify existing migrations
- Include migration in your PR

## Code Review Guidelines

### As a Reviewer

- Be constructive and respectful
- Explain the "why" behind suggestions
- Approve when changes meet standards
- Test the changes locally if possible

### As an Author

- Respond to all comments
- Don't take criticism personally
- Ask for clarification if needed
- Thank reviewers for their time

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email security@hub4estate.com
- **Chat**: Join our Discord server (if available)

## License

By contributing to Hub4Estate, you agree that your contributions will be licensed under the same license as the project (Proprietary License).

---

Thank you for contributing to Hub4Estate! 🚀
