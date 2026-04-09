import { z } from 'zod';

export const createConversationSchema = z.object({
  title: z.string().max(200, 'Title must be at most 200 characters').optional(),
  type: z.string().default('direct'),
  referenceId: z.string().optional(),
  referenceType: z.string().optional(),
  participantId: z.string().uuid('Invalid participant ID'),
  participantType: z.enum(['user', 'dealer', 'admin']),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000, 'Message must be at most 5000 characters'),
  type: z.string().default('TEXT'),
  metadata: z.any().optional(),
});

export const conversationIdParamSchema = z.object({
  id: z.string().uuid('Invalid conversation ID'),
});
