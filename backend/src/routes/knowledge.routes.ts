import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

// Get published articles
router.get('/articles', async (req, res) => {
  try {
    const { category, search, page = '1', limit = '20' } = req.query;

    const where: any = { isPublished: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [articles, total] = await Promise.all([
      prisma.knowledgeArticle.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          tags: true,
          coverImage: true,
          metaDescription: true,
          views: true,
          publishedAt: true,
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.knowledgeArticle.count({ where }),
    ]);

    return res.json({
      articles,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get articles error:', error);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Get single article
router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await prisma.knowledgeArticle.findUnique({
      where: { slug: req.params.slug, isPublished: true },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return res.json({ article });
  } catch (error) {
    console.error('Get article error:', error);
    return res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// Get article categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.knowledgeArticle.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
    });

    const categoryList = categories.map((c) => c.category);

    return res.json({ categories: categoryList });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
