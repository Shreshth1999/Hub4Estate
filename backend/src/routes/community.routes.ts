import { Router } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { authenticateUser, optionalAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// Get community posts
router.get('/posts', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { city, category, page = '1', limit = '20' } = req.query;

    const where: any = { status: 'PUBLISHED' };

    if (city) {
      where.city = city;
    }

    if (category) {
      where.category = category;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [posts, total] = await Promise.all([
      prisma.communityPost.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              role: true,
              city: true,
              profileImage: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
        },
        orderBy: [
          { upvotes: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: parseInt(limit as string),
      }),
      prisma.communityPost.count({ where }),
    ]);

    const postsWithCounts = posts.map((post) => ({
      ...post,
      commentCount: post.comments.length,
      comments: undefined,
    }));

    return res.json({
      posts: postsWithCounts,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post with comments
router.get('/posts/:id', optionalAuth, async (req, res) => {
  try {
    const post = await prisma.communityPost.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            name: true,
            role: true,
            city: true,
            profileImage: true,
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                name: true,
                role: true,
                city: true,
                profileImage: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    name: true,
                    role: true,
                    city: true,
                    profileImage: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: [
            { upvotes: 'desc' },
            { createdAt: 'desc' },
          ],
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post
const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().min(10),
  city: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

router.post('/posts', authenticateUser, validateBody(createPostSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const post = await prisma.communityPost.create({
      data: {
        ...req.body,
        userId,
        status: 'PUBLISHED',
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
            city: true,
            profileImage: true,
          },
        },
      },
    });

    return res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
});

// Create comment
const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().min(2),
  parentId: z.string().uuid().optional(),
});

router.post('/comments', authenticateUser, validateBody(createCommentSchema), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const post = await prisma.communityPost.findUnique({
      where: { id: req.body.postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await prisma.communityComment.create({
      data: {
        postId: req.body.postId,
        userId,
        content: req.body.content,
        parentId: req.body.parentId,
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
            city: true,
            profileImage: true,
          },
        },
      },
    });

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Upvote post
router.post('/posts/:id/upvote', authenticateUser, async (req, res) => {
  try {
    const post = await prisma.communityPost.update({
      where: { id: req.params.id },
      data: {
        upvotes: { increment: 1 },
      },
    });

    return res.json({ upvotes: post.upvotes });
  } catch (error) {
    console.error('Upvote post error:', error);
    return res.status(500).json({ error: 'Failed to upvote post' });
  }
});

export default router;
