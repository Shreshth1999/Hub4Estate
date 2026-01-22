import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { validateBody } from '../middleware/validation';
import { optionalAuth, authenticateAdmin, AuthRequest } from '../middleware/auth';
import { generateChatResponse, ChatMessage } from '../services/ai.service';

const router = Router();

// ============================================
// PUBLIC CHAT ENDPOINTS
// ============================================

// Create new chat session
const createSessionSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional(),
});

router.post(
  '/sessions',
  optionalAuth,
  validateBody(createSessionSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId: req.user?.id,
          userEmail: req.body.email,
          userName: req.body.name,
        },
      });

      return res.status(201).json({ sessionId: session.id });
    } catch (error) {
      console.error('Create session error:', error);
      return res.status(500).json({ error: 'Failed to create chat session' });
    }
  }
);

// Send message and get AI response
const sendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(2000),
});

router.post(
  '/message',
  optionalAuth,
  validateBody(sendMessageSchema),
  async (req: AuthRequest, res: Response) => {
    try {
      const { sessionId, message } = req.body;

      // Verify session exists
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 20, // Last 20 messages for context
          },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Save user message
      await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'user',
          content: message,
        },
      });

      // Build message history for context
      const messageHistory: ChatMessage[] = session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      messageHistory.push({ role: 'user', content: message });

      // Generate AI response
      const { response, tokenCount } = await generateChatResponse(
        messageHistory,
        sessionId
      );

      // Save assistant message
      const assistantMessage = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content: response,
          tokenCount,
        },
      });

      // Update session metadata
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: {
          messageCount: { increment: 2 },
          lastMessageAt: new Date(),
          // Set title from first user message if not set
          title: session.title || message.slice(0, 50),
        },
      });

      return res.json({
        message: assistantMessage,
      });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: 'Failed to process message' });
    }
  }
);

// Get session messages
router.get(
  '/sessions/:sessionId/messages',
  optionalAuth,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });

      return res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
);

// ============================================
// ADMIN ENDPOINTS
// ============================================

// Get all chat sessions
router.get('/admin/sessions', authenticateAdmin, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' as const } },
            { userEmail: { contains: search as string, mode: 'insensitive' as const } },
            { userName: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [sessions, total] = await Promise.all([
      prisma.chatSession.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: parseInt(limit as string),
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.chatSession.count({ where }),
    ]);

    return res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get session details with all messages
router.get(
  '/admin/sessions/:sessionId',
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      return res.json({ session });
    } catch (error) {
      console.error('Get session error:', error);
      return res.status(500).json({ error: 'Failed to fetch session' });
    }
  }
);

// Get chat stats
router.get('/admin/stats', authenticateAdmin, async (_req: Request, res: Response) => {
  try {
    const [totalSessions, totalMessages, activeSessions, recentSessions] = await Promise.all([
      prisma.chatSession.count(),
      prisma.chatMessage.count(),
      prisma.chatSession.count({
        where: { status: 'active' },
      }),
      prisma.chatSession.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    return res.json({
      totalSessions,
      totalMessages,
      activeSessions,
      recentSessions,
      avgMessagesPerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Close/update session
router.patch(
  '/admin/sessions/:sessionId',
  authenticateAdmin,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { status } = req.body;

      const session = await prisma.chatSession.update({
        where: { id: sessionId },
        data: { status },
      });

      return res.json({ session });
    } catch (error) {
      console.error('Update session error:', error);
      return res.status(500).json({ error: 'Failed to update session' });
    }
  }
);

export default router;
