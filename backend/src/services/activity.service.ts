import prisma from '../config/database';
import { ActivityType } from '@prisma/client';
import { Request } from 'express';

interface LogActivityParams {
  actorType: 'user' | 'dealer' | 'admin' | 'anonymous';
  actorId?: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any> | null;
  entityType?: string | null;
  entityId?: string | null;
  req?: Request;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const ipAddress = params.req
      ? (params.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        params.req.socket.remoteAddress ||
        null
      : null;

    const userAgent = params.req?.headers['user-agent'] || null;

    await prisma.userActivity.create({
      data: {
        actorType: params.actorType,
        actorId: params.actorId || null,
        actorEmail: params.actorEmail || null,
        actorName: params.actorName || null,
        activityType: params.activityType,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        entityType: params.entityType || null,
        entityId: params.entityId || null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('[Activity Log] Failed to log activity:', error);
  }
}

export { ActivityType };
