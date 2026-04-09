import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';

export interface AuthPayload {
  id: string;
  email: string;
  type: 'user' | 'dealer' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthPayload & {
    role: string;
    status: string;
  };
}

// Dealer statuses that are explicitly blocked from authentication.
// Any status NOT in this set (e.g. PENDING_VERIFICATION, DOCUMENTS_PENDING,
// UNDER_REVIEW, VERIFIED) is allowed through so dealers can complete onboarding.
const DEALER_BLOCKED_STATUSES = new Set(['SUSPENDED', 'DELETED', 'REJECTED']);

/**
 * Verify a decoded token against the database.
 * Returns the populated AuthRequest.user payload, or null if the account
 * does not exist / is inactive / is blocked.
 */
async function verifyAccountInDB(
  decoded: AuthPayload
): Promise<(AuthPayload & { role: string; status: string }) | null> {
  switch (decoded.type) {
    case 'user': {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, status: true },
      });
      if (!user || user.status !== 'ACTIVE') return null;
      return {
        id: user.id,
        email: user.email || '',
        type: 'user',
        role: user.role || '',
        status: user.status,
      };
    }
    case 'dealer': {
      const dealer = await prisma.dealer.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, status: true },
      });
      if (!dealer || DEALER_BLOCKED_STATUSES.has(dealer.status)) return null;
      return {
        id: dealer.id,
        email: dealer.email,
        type: 'dealer',
        role: dealer.status,
        status: dealer.status,
      };
    }
    case 'admin': {
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, isActive: true },
      });
      if (!admin || !admin.isActive) return null;
      return {
        id: admin.id,
        email: admin.email,
        type: 'admin',
        role: admin.role,
        status: 'ACTIVE',
      };
    }
    default:
      return null;
  }
}

/**
 * Deny-by-default authentication middleware.
 * Verifies JWT, checks account exists AND is active in DB on every request.
 * Only allows specified account types through.
 *
 * CRIT-04 fix: If token type does not match an allowed type, returns 403.
 *              Never calls next() without setting authReq.user.
 * CRIT-05 fix: Every request triggers a lightweight DB lookup to confirm the
 *              account still exists and is not suspended/deleted/inactive.
 *
 * Usage:
 *   authenticate('user')           - only users
 *   authenticate('dealer')         - only dealers
 *   authenticate('admin')          - only admins
 *   authenticate('user', 'dealer') - users or dealers
 */
export function authenticate(
  ...allowedTypes: Array<'user' | 'dealer' | 'admin'>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authReq = req as AuthRequest;
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      let decoded: AuthPayload;
      try {
        decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          res.status(401).json({ error: 'Token expired' });
          return;
        }
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // CRIT-04: Deny-by-default — reject if token type not in allowed list
      if (!allowedTypes.includes(decoded.type)) {
        res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        return;
      }

      // CRIT-05: DB active check on EVERY request
      const account = await verifyAccountInDB(decoded);
      if (!account) {
        res.status(401).json({ error: 'Account not found or suspended' });
        return;
      }

      // Safety: never call next() without populating authReq.user
      authReq.user = account;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

// Convenience wrappers
export const requireUser = authenticate('user');
export const requireDealer = authenticate('dealer');
export const requireAdmin = authenticate('admin');
export const requireAnyAuth = authenticate('user', 'dealer', 'admin');

/**
 * Optional auth — attaches user info if a valid token is present, but never blocks.
 * CRIT-05 fix: verifies account exists and is active in DB before trusting the token.
 * If token is missing, invalid, expired, or the account is suspended/deleted,
 * the request proceeds without auth (authReq.user remains undefined).
 */
export const optionalAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
      // Verify the account actually exists and is active before trusting the JWT
      const account = await verifyAccountInDB(decoded);
      if (account) {
        authReq.user = account;
      }
      // If account is null (suspended/deleted/missing), proceed without auth
    }
  } catch {
    // Token invalid or expired — proceed without auth
  }
  next();
};

// Legacy aliases for backward compatibility during migration
export const authenticateUser = requireUser;
export const authenticateDealer = requireDealer;
export const authenticateAdmin = requireAdmin;
export const authenticateToken = requireAnyAuth;
// PRD-required alias: accepts any valid, active user regardless of type
export const authenticateAny = requireAnyAuth;
