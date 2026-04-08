import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticateUser, AuthRequest } from '../middleware/auth';
import { analyzeImageWithClaudeVision, parseProductsWithAI, getBrandSuggestions } from '../services/ai-parser.service';
import prisma from '../config/database';
import { z } from 'zod';

const router = Router();

// Configure multer — accept images AND PDFs
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/slip-scans');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `slip_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    const isImage = file.mimetype.startsWith('image/');
    const isPDF = file.mimetype === 'application/pdf';
    if (isImage || isPDF) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP) and PDFs are allowed'));
    }
  },
});

/**
 * POST /api/slip-scanner/parse
 * Upload image or PDF and parse with Claude AI (Vision for images, text for PDFs)
 */
router.post('/parse', upload.single('image'), async (req: AuthRequest, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;

  try {
    let parsedData;
    const isPDF = req.file.mimetype === 'application/pdf';

    if (isPDF) {
      // Extract text from PDF then parse with Claude
      process.stdout.write(JSON.stringify({ level: 'info', event: 'slip_scanner_pdf_processing' }) + '\n');
      try {
        // Dynamic import to avoid startup cost
        const pdfParse = require('pdf-parse');
        const pdfBuffer = await fs.readFile(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        const extractedText = pdfData.text;

        if (!extractedText || extractedText.trim().length === 0) {
          return res.status(400).json({
            error: 'Could not extract text from PDF. Please ensure it is not scanned/image-based.',
          });
        }

        parsedData = await parseProductsWithAI(extractedText);
      } catch (pdfError: any) {
        console.error('PDF parsing error:', pdfError);
        return res.status(500).json({ error: 'Failed to read PDF. Try uploading as an image instead.' });
      }
    } else {
      // Use Claude Vision directly on the image — much more accurate than OCR
      process.stdout.write(JSON.stringify({ level: 'info', event: 'slip_scanner_image_processing' }) + '\n');
      parsedData = await analyzeImageWithClaudeVision(filePath);
    }

    // For items without a brand, attach brand suggestions
    const itemsWithSuggestions = await Promise.all(
      parsedData.items.map(async (item) => {
        if (!item.brand) {
          const brandSuggestions = await getBrandSuggestions(item.productName);
          return { ...item, brandSuggestions };
        }
        return item;
      })
    );

    parsedData.items = itemsWithSuggestions;

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Slip parsing error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse file',
    });
  } finally {
    // Clean up uploaded file after processing
    try {
      await fs.unlink(filePath);
    } catch (_) {}
  }
});

/**
 * GET /api/slip-scanner/brand-suggestions?productName=xxx
 * Get top 5 brand suggestions for a product name
 */
router.get('/brand-suggestions', async (req, res) => {
  const { productName } = req.query;
  if (!productName || typeof productName !== 'string') {
    return res.status(400).json({ error: 'productName query param is required' });
  }

  try {
    const suggestions = await getBrandSuggestions(productName);
    return res.json({ suggestions });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to get brand suggestions' });
  }
});

/**
 * POST /api/slip-scanner/create-inquiries
 * Create product inquiries from parsed slip data
 */
router.post('/create-inquiries', authenticateUser, async (req: AuthRequest, res) => {
  const schema = z.object({
    items: z.array(
      z.object({
        productName: z.string(),
        quantity: z.number().positive(),
        unit: z.string(),
        brand: z.string().optional(),
        notes: z.string().optional(),
      })
    ),
    customerName: z.string(),
    customerPhone: z.string(),
    deliveryCity: z.string(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request data', details: parsed.error });
  }

  try {
    const { items, customerName, customerPhone, deliveryCity } = parsed.data;
    const createdInquiries = [];

    for (const item of items) {
      const brandNote = item.brand ? `Brand: ${item.brand}` : 'Brand not specified — please suggest top brands';
      const inquiry = await prisma.productInquiry.create({
        data: {
          name: customerName,
          phone: customerPhone,
          email: null,
          deliveryCity,
          quantity: item.quantity,
          modelNumber: `${item.productName} (${item.unit})`,
          notes: `Slip scan: ${item.notes || ''}. ${brandNote}`.trim(),
          status: 'new',
        },
      });
      createdInquiries.push(inquiry);
    }

    return res.json({
      message: 'Inquiries created successfully',
      count: createdInquiries.length,
      inquiries: createdInquiries.map((inq) => ({
        id: inq.id,
        inquiryNumber: inq.inquiryNumber,
      })),
    });
  } catch (error: any) {
    console.error('Create inquiries error:', error);
    return res.status(500).json({ error: 'Failed to create inquiries' });
  }
});

export default router;
