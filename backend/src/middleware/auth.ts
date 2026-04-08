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

/**
 * Deny-by-default authentication middleware.
 * Verifies JWT, checks account exists AND is active in DB on every request.
 * Only allows specified account types through.
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

      // Deny-by-default: reject if token type not in allowed list
      if (!allowedTypes.includes(decoded.type)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // DB active check on EVERY request (fixes CRIT-05)
      if (decoded.type === 'user') {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true, status: true },
        });

        if (!user || user.status !== 'ACTIVE') {
          res.status(401).json({ error: 'Account not found or suspended' });
          return;
        }

        authReq.user = {
          id: user.id,
          email: user.email || '',
          type: 'user',
          role: user.role || '',
          status: user.status,
        };
      } else if (decoded.type === 'dealer') {
        const dealer = await prisma.dealer.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, status: true },
        });

        if (!dealer || dealer.status === 'DELETED' || dealer.status === 'SUSPENDED') {
          res.status(401).json({ error: 'Account not found or suspended' });
          return;
        }

        authReq.user = {
          id: dealer.id,
          email: dealer.email,
          type: 'dealer',
          role: dealer.status,
          status: dealer.status,
        };
      } else if (decoded.type === 'admin') {
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, role: true, isActive: true },
        });

        if (!admin || !admin.isActive) {
          res.status(401).json({ error: 'Account not found or inactive' });
          return;
        }

        authReq.user = {
          id: admin.id,
          email: admin.email,
          type: 'admin',
          role: admin.role,
          status: 'ACTIVE',
        };
      }

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
 * Optional auth — attaches user info if token present, but doesn't block.
 * Never throws 401.
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
      authReq.user = {
        ...decoded,
        role: '',
        status: 'ACTIVE',
      };
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
