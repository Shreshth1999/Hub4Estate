import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    type: 'user' | 'dealer' | 'admin';
  };
}

export const authenticateUser: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      type: 'user' | 'dealer' | 'admin';
    };

    if (decoded.type === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, role: true, status: true },
      });

      if (!user || user.status !== 'ACTIVE') {
        res.status(401).json({ error: 'User not found or inactive' });
        return;
      }

      authReq.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'user',
      };
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateDealer: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      type: 'user' | 'dealer' | 'admin';
    };

    if (decoded.type !== 'dealer') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const dealer = await prisma.dealer.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, status: true },
    });

    if (!dealer || dealer.status === 'DELETED' || dealer.status === 'SUSPENDED') {
      res.status(401).json({ error: 'Dealer not found or inactive' });
      return;
    }

    authReq.user = {
      id: dealer.id,
      email: dealer.email,
      role: dealer.status,
      type: 'dealer',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authenticateAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      type: 'user' | 'dealer' | 'admin';
    };

    if (decoded.type !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      res.status(401).json({ error: 'Admin not found or inactive' });
      return;
    }

    authReq.user = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      type: 'admin',
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const optionalAuth: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        email: string;
        type: 'user' | 'dealer' | 'admin';
      };

      authReq.user = decoded as any;
    }

    next();
  } catch (error) {
    next();
  }
};

// Generic token authentication - works for any user type
export const authenticateToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      id: string;
      email: string;
      type: 'user' | 'dealer' | 'admin';
    };

    authReq.user = {
      id: decoded.id,
      email: decoded.email,
      role: '',
      type: decoded.type,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
