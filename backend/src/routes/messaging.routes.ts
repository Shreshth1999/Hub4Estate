import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createConversationSchema,
  sendMessageSchema,
  conversationIdParamSchema,
} from '../validators/messaging.validators';

const router = Router();

// All messaging routes require authentication
router.use(authenticateToken);

// ============================================
// GET /conversations — list user's conversations
// ============================================
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const accountId = authReq.user?.id || authReq.dealer?.id || authReq.admin?.id;
    const accountType = authReq.user ? 'user' : authReq.dealer ? 'dealer' : 'admin';

    if (!accountId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const participantRecords = await prisma.conversationParticipant.findMany({
      where: { accountId, accountType },
      include: {
        conversation: {
          include: {
            participants: true,
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const conversations = participantRecords.map((p) => {
      const conv = p.conversation;
      const lastMessage = conv.messages[0] || null;
      const otherParticipants = conv.participants.filter(
        (part) => part.accountId !== accountId
      );
      const unreadCount = lastMessage && p.lastReadAt
        ? (new Date(lastMessage.createdAt) > new Date(p.lastReadAt) ? 1 : 0)
        : lastMessage ? 1 : 0;

      return {
        id: conv.id,
        title: conv.title,
        type: conv.type,
        referenceId: conv.referenceId,
        referenceType: conv.referenceType,
        participants: otherParticipants.map((op) => ({
          id: op.accountId,
          type: op.accountType,
        })),
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          senderType: lastMessage.senderType,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt,
        } : null,
        unreadCount,
        isMuted: p.isMuted,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
      };
    });

    return res.json({ conversations });
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// ============================================
// POST /conversations — create a new conversation
// ============================================
router.post('/conversations', validate({ body: createConversationSchema }), async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const accountId = authReq.user?.id || authReq.dealer?.id || authReq.admin?.id;
    const accountType = authReq.user ? 'user' : authReq.dealer ? 'dealer' : 'admin';

    if (!accountId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { title, type = 'direct', referenceId, referenceType, participantId, participantType } = req.body;

    if (!participantId || !participantType) {
      return res.status(400).json({ error: 'participantId and participantType are required' });
    }

    // Check if a direct conversation already exists between these two
    if (type === 'direct') {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: 'direct',
          AND: [
            { participants: { some: { accountId, accountType } } },
            { participants: { some: { accountId: participantId, accountType: participantType } } },
          ],
        },
        include: { participants: true },
      });

      if (existing) {
        return res.json({ conversation: existing, existed: true });
      }
    }

    const conversation = await prisma.conversation.create({
      data: {
        title: title || null,
        type,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        participants: {
          create: [
            { accountId, accountType },
            { accountId: participantId, accountType: participantType },
          ],
        },
      },
      include: { participants: true },
    });

    return res.status(201).json({ conversation, existed: false });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// ============================================
// GET /conversations/:id/messages — get messages for a conversation
// ============================================
router.get('/conversations/:id/messages', async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const accountId = authReq.user?.id || authReq.dealer?.id || authReq.admin?.id;

    if (!accountId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { cursor, limit = '50' } = req.query;
    const take = Math.min(parseInt(limit as string, 10) || 50, 100);

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_accountId: { conversationId: id, accountId } },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant in this conversation' });
    }

    const where: any = { conversationId: id };
    if (cursor) {
      where.createdAt = { lt: new Date(cursor as string) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });

    // Mark as read
    await prisma.conversationParticipant.update({
      where: { conversationId_accountId: { conversationId: id, accountId } },
      data: { lastReadAt: new Date() },
    });

    return res.json({
      messages: messages.reverse(), // Return in chronological order
      hasMore: messages.length === take,
      cursor: messages.length > 0 ? messages[0].createdAt.toISOString() : null,
    });
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ============================================
// POST /conversations/:id/messages — send a message
// ============================================
router.post('/conversations/:id/messages', validate({ body: sendMessageSchema, params: conversationIdParamSchema }), async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const accountId = authReq.user?.id || authReq.dealer?.id || authReq.admin?.id;
    const accountType = authReq.user ? 'user' : authReq.dealer ? 'dealer' : 'admin';

    if (!accountId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { content, type = 'TEXT', metadata } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_accountId: { conversationId: id, accountId } },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant in this conversation' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: accountId,
        senderType: accountType,
        type,
        content: content.trim(),
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Update sender's lastReadAt
    await prisma.conversationParticipant.update({
      where: { conversationId_accountId: { conversationId: id, accountId } },
      data: { lastReadAt: new Date() },
    });

    return res.status(201).json({ message });
  } catch (error) {
    console.error('Failed to send message:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// ============================================
// PATCH /conversations/:id/read — mark conversation as read
// ============================================
router.patch('/conversations/:id/read', async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const accountId = authReq.user?.id || authReq.dealer?.id || authReq.admin?.id;

    if (!accountId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;

    await prisma.conversationParticipant.update({
      where: { conversationId_accountId: { conversationId: id, accountId } },
      data: { lastReadAt: new Date() },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to mark as read:', error);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// ============================================
// PATCH /conversations/:id/mute — toggle mute
// ============================================
router.patch('/conversations/:id/mute', async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const accountId = authReq.user?.id || authReq.dealer?.id || authReq.admin?.id;

    if (!accountId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const { muted } = req.body;

    const updated = await prisma.conversationParticipant.update({
      where: { conversationId_accountId: { conversationId: id, accountId } },
      data: { isMuted: !!muted },
    });

    return res.json({ success: true, isMuted: updated.isMuted });
  } catch (error) {
    console.error('Failed to update mute status:', error);
    return res.status(500).json({ error: 'Failed to update mute status' });
  }
});

export default router;
