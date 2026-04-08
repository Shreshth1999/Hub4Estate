import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { validateBody } from '../middleware/validation';
import { optionalAuth, authenticateAdmin, AuthRequest } from '../middleware/auth';
import { generateChatResponse, streamChatResponse, parseDealerQuoteFromText, ChatMessage } from '../services/ai.service';

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
            orderBy: { createdAt: 'desc' },
            take: 20,
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

      // Build message history for context (reverse to get chronological order)
      const messageHistory: ChatMessage[] = session.messages.reverse().map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      messageHistory.push({ role: 'user', content: message });

      // Build user context from authenticated session
      const userContext = req.user ? {
        name: (req.user as any).name,
        phone: (req.user as any).phone,
        email: (req.user as any).email,
        city: (req.user as any).city,
      } : undefined;

      // Generate AI response with tool support
      const { response, tokenCount, toolResults } = await generateChatResponse(
        messageHistory,
        sessionId,
        userContext,
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
          title: session.title || message.slice(0, 50),
        },
      });

      return res.json({
        message: assistantMessage,
        toolResults: toolResults || [],
      });
    } catch (error) {
      console.error('Send message error:', error);
      return res.status(500).json({ error: 'Failed to process message' });
    }
  }
);

// ============================================
// STREAMING CHAT ENDPOINT (SSE)
// ============================================

router.post(
  '/message/stream',
  optionalAuth,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { sessionId, message } = req.body;

    if (!sessionId || !message || typeof message !== 'string' || message.length < 1 || message.length > 2000) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const emit = (data: object) => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    };

    try {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
        },
      });

      if (!session) {
        emit({ type: 'error', error: 'Session not found' });
        res.end();
        return;
      }

      // Save user message
      await prisma.chatMessage.create({
        data: { sessionId, role: 'user', content: message },
      });

      // Build message history (reverse to get chronological order)
      const messageHistory: ChatMessage[] = session.messages.reverse().map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
      messageHistory.push({ role: 'user', content: message });

      // Build user context
      const userContext = req.user
        ? {
            name: (req.user as any).name,
            phone: (req.user as any).phone,
            email: (req.user as any).email,
            city: (req.user as any).city,
          }
        : undefined;

      // Build dealer context if applicable
      const dealerContext =
        (req.user as any)?.type === 'dealer'
          ? {
              businessName: (req.user as any).name,
              city: (req.user as any).city,
              id: (req.user as any).id,
            }
          : undefined;

      // Stream the response
      let fullResponse = '';

      for await (const event of streamChatResponse(messageHistory, userContext, dealerContext)) {
        emit(event);
        if (event.type === 'text') {
          fullResponse += event.text;
        }
      }

      // Save assistant message to DB
      if (fullResponse) {
        const assistantMessage = await prisma.chatMessage.create({
          data: { sessionId, role: 'assistant', content: fullResponse },
        });

        await prisma.chatSession.update({
          where: { id: sessionId },
          data: {
            messageCount: { increment: 2 },
            lastMessageAt: new Date(),
            title: session.title || message.slice(0, 50),
          },
        });

        emit({ type: 'done', messageId: assistantMessage.id });
      } else {
        emit({ type: 'done' });
      }
    } catch (error) {
      console.error('[Stream] Error:', error);
      emit({ type: 'error', error: 'Server error. Please try again.' });
    }

    res.end();
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
// DEALER QUOTE PARSER (voice/text → structured quote)
// ============================================

router.post(
  '/parse-quote',
  optionalAuth,
  async (req: AuthRequest, res: Response) => {
    const { rawText } = req.body;

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 3) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    try {
      const parsed = await parseDealerQuoteFromText(rawText.trim());
      return res.json(parsed);
    } catch (error) {
      console.error('[parse-quote] Error:', error);
      return res.status(500).json({ error: 'Failed to parse quote' });
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
