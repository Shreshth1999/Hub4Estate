import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import prisma from '../config/database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { env } from '../config/env';

const router = Router();

// ── Multer config for professional documents ──────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(env.UPLOAD_DIR, 'professional-docs');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const userId = (req as AuthRequest).user?.id || 'unknown';
    const ts = Date.now();
    const ext = path.extname(file.originalname);
    const safe = file.fieldname.replace(/[^a-z0-9]/gi, '_');
    cb(null, `${userId}_${safe}_${ts}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only PDF, JPG, and PNG allowed.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── All routes require user auth ──────────────────────────────────────────────
router.use(authenticateToken);

// ── GET /api/professional/profile ─────────────────────────────────────────────
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const profile = await prisma.professionalProfile.findUnique({
      where: { userId },
      include: { documents: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, city: true, profVerificationStatus: true },
    });

    res.json({ profile, user });
  } catch (err) {
    console.error('GET /professional/profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── POST /api/professional/onboarding ─────────────────────────────────────────
// Submit professional profile + documents for verification
router.post(
  '/onboarding',
  upload.fields([
    { name: 'document', maxCount: 1 },
    { name: 'additionalDoc', maxCount: 1 },
  ]),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const files = req.files as Record<string, Express.Multer.File[]>;
      const {
        role, businessName, registrationNo, city, state,
        yearsExperience, websiteUrl, bio,
      } = req.body;

      // Validate role
      const validRoles = ['ARCHITECT', 'INTERIOR_DESIGNER', 'CONTRACTOR', 'ELECTRICIAN', 'SMALL_BUILDER', 'DEVELOPER', 'INDIVIDUAL_HOME_BUILDER', 'RENOVATION_HOMEOWNER'];
      if (!role || !validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid or missing role' });
      }

      // Upsert professional profile
      const profile = await prisma.professionalProfile.upsert({
        where: { userId },
        create: {
          userId,
          businessName: businessName || null,
          registrationNo: registrationNo || null,
          city: city || null,
          state: state || null,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          websiteUrl: websiteUrl || null,
          bio: bio || null,
        },
        update: {
          businessName: businessName || null,
          registrationNo: registrationNo || null,
          city: city || null,
          state: state || null,
          yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
          websiteUrl: websiteUrl || null,
          bio: bio || null,
        },
      });

      // Save uploaded documents
      const baseUrl = `${env.BACKEND_URL || ''}/uploads/professional-docs`;

      if (files.document?.[0]) {
        const f = files.document[0];
        await prisma.professionalDocument.create({
          data: {
            profileId: profile.id,
            docType: 'primary',
            fileUrl: `${baseUrl}/${f.filename}`,
            fileName: f.originalname,
            fileSize: f.size,
            mimeType: f.mimetype,
          },
        });
      }

      if (files.additionalDoc?.[0]) {
        const f = files.additionalDoc[0];
        await prisma.professionalDocument.create({
          data: {
            profileId: profile.id,
            docType: 'additional',
            fileUrl: `${baseUrl}/${f.filename}`,
            fileName: f.originalname,
            fileSize: f.size,
            mimeType: f.mimetype,
          },
        });
      }

      // Update user role and verification status
      await prisma.user.update({
        where: { id: userId },
        data: {
          role: role as any,
          profVerificationStatus: 'UNDER_REVIEW',
        },
      });

      res.json({ success: true, profileId: profile.id, message: 'Submitted for review' });
    } catch (err) {
      console.error('POST /professional/onboarding error:', err);
      res.status(500).json({ error: 'Failed to submit onboarding' });
    }
  }
);

// ── POST /api/professional/portfolio ──────────────────────────────────────────
// Upload a portfolio image (or any additional document)
router.post(
  '/portfolio',
  upload.single('image'),
  async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
      if (!profile) return res.status(404).json({ error: 'Profile not found. Complete onboarding first.' });

      const baseUrl = `${env.BACKEND_URL || ''}/uploads/professional-docs`;
      const doc = await prisma.professionalDocument.create({
        data: {
          profileId: profile.id,
          docType: 'portfolio',
          fileUrl: `${baseUrl}/${req.file.filename}`,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
        },
      });

      res.status(201).json({ doc });
    } catch (err) {
      console.error('POST /professional/portfolio error:', err);
      res.status(500).json({ error: 'Failed to upload portfolio image' });
    }
  }
);

// ── DELETE /api/professional/documents/:id ────────────────────────────────────
router.delete('/documents/:id', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const profile = await prisma.professionalProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const doc = await prisma.professionalDocument.findFirst({
      where: { id: req.params.id, profileId: profile.id },
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Delete file from disk
    const filename = path.basename(doc.fileUrl);
    const filePath = path.join(env.UPLOAD_DIR, 'professional-docs', filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.professionalDocument.delete({ where: { id: doc.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /professional/documents/:id error:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// ── PATCH /api/professional/profile ───────────────────────────────────────────
router.patch('/profile', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { businessName, city, state, yearsExperience, websiteUrl, bio, registrationNo } = req.body;

    const profile = await prisma.professionalProfile.upsert({
      where: { userId },
      create: { userId, businessName, city, state, yearsExperience, websiteUrl, bio, registrationNo },
      update: { businessName, city, state, yearsExperience, websiteUrl, bio, registrationNo },
    });

    res.json({ success: true, profile });
  } catch (err) {
    console.error('PATCH /professional/profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
