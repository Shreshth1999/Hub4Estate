import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import prisma from '../config/database';
import { env } from '../config/env';
import { validateBody } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';
import { sendOTPEmail } from '../services/email.service';
import { sendOTPSMS } from '../services/sms.service';

const router = Router();

// ============================================
// OTP-BASED AUTH (Phone/Email)
// ============================================

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP (Phone or Email)
const sendOTPSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  type: z.enum(['login', 'signup']),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required',
});

router.post('/send-otp', validateBody(sendOTPSchema), async (req, res) => {
  try {
    const { phone, email, type } = req.body;
    const identifier = phone || email;

    if (!identifier) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }

    // Check if user exists for login, or doesn't exist for signup
    const existingUser = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
    });

    if (type === 'login' && !existingUser) {
      return res.status(404).json({ error: 'No account found. Please sign up first.' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this identifier
    await prisma.oTP.deleteMany({
      where: { identifier },
    });

    // Create new OTP
    await prisma.oTP.create({
      data: {
        identifier,
        code: otpCode,
        type,
        expiresAt,
      },
    });

    // Send OTP via Email or SMS
    let sent = false;
    let method = '';

    if (email) {
      sent = await sendOTPEmail(email, otpCode, type);
      method = 'email';
      if (sent) {
        console.log(`[OTP] Email sent to ${email}`);
      } else {
        console.log(`[OTP] Email failed, OTP for ${email}: ${otpCode}`);
      }
    } else if (phone) {
      const smsResult = await sendOTPSMS(phone, otpCode);
      sent = smsResult.success;
      method = 'phone';
      if (sent) {
        console.log(`[OTP] SMS sent to ${phone}`);
      } else {
        console.log(`[OTP] SMS failed (${smsResult.error}), OTP for ${phone}: ${otpCode}`);
      }
    }

    return res.json({
      message: method === 'email'
        ? (sent ? 'OTP sent to your email' : 'OTP generated (check console in dev mode)')
        : (sent ? 'OTP sent to your phone' : 'OTP generated (check console in dev mode)'),
      // In development, always return OTP for testing
      debug_otp: env.NODE_ENV === 'development' ? otpCode : undefined,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP
const verifyOTPSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  otp: z.string().length(6),
  type: z.enum(['login', 'signup']),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required',
});

router.post('/verify-otp', validateBody(verifyOTPSchema), async (req, res) => {
  try {
    const { phone, email, otp, type } = req.body;
    const identifier = phone || email;

    if (!identifier) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }

    // Find OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        identifier,
        type,
        verified: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.oTP.delete({ where: { id: otpRecord.id } });
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await prisma.oTP.delete({ where: { id: otpRecord.id } });
      return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Find or check user
    let user = await prisma.user.findFirst({
      where: phone ? { phone } : { email },
    });

    if (type === 'signup' && !user) {
      // New user - return flag to complete profile
      return res.json({
        requiresProfile: true,
        identifier,
        identifierType: phone ? 'phone' : 'email',
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update verification status
    await prisma.user.update({
      where: { id: user.id },
      data: phone ? { isPhoneVerified: true } : { isEmailVerified: true },
    });

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        type: 'user',
        role: user.role,
        city: user.city,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Clean up OTP
    await prisma.oTP.delete({ where: { id: otpRecord.id } });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        city: user.city || '',
        type: 'user',
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// User Signup (after OTP verification)
const userSignupSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
}).refine(data => data.phone || data.email, {
  message: 'Either phone or email is required',
});

router.post('/user/signup', validateBody(userSignupSchema), async (req, res) => {
  try {
    const { name, phone, email, city } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          phone ? { phone } : {},
          email ? { email } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Account already exists with this phone/email' });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        city: city || null,
        isPhoneVerified: !!phone,
        isEmailVerified: !!email,
      },
    });

    // Generate token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        type: 'user',
        role: user.role,
        city: user.city,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        city: user.city || '',
        type: 'user',
      },
    });
  } catch (error) {
    console.error('User signup error:', error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

// ============================================
// GET CURRENT USER (/auth/me)
// ============================================

router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.type;

    if (userType === 'user') {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          city: true,
          profileImage: true,
          isPhoneVerified: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const profileComplete = !!user.city && user.city !== 'Not Set';

      return res.json({
        user: {
          ...user,
          type: 'user',
          profileComplete,
        },
      });
    }

    if (userType === 'dealer') {
      const dealer = await prisma.dealer.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          businessName: true,
          phone: true,
          city: true,
          status: true,
        },
      });

      if (!dealer) {
        return res.status(404).json({ error: 'Dealer not found' });
      }

      return res.json({
        user: {
          id: dealer.id,
          email: dealer.email,
          name: dealer.businessName,
          phone: dealer.phone,
          city: dealer.city,
          type: 'dealer',
          status: dealer.status,
          profileComplete: true,
        },
      });
    }

    if (userType === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      return res.json({
        user: {
          ...admin,
          type: 'admin',
          profileComplete: true,
        },
      });
    }

    return res.status(400).json({ error: 'Invalid user type' });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

// ============================================
// GOOGLE OAUTH
// ============================================

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('[Google OAuth] Callback received');
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        console.error('[Google OAuth] Authentication error:', err.message || err);
        const errorMsg = encodeURIComponent(err.message || 'auth_failed');
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=${errorMsg}`);
      }
      if (!user) {
        console.error('[Google OAuth] No user returned. Info:', info);
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=no_user`);
      }
      console.log(`[Google OAuth] User authenticated: ${user.email}`);
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.error('[Google OAuth] No user in request after authentication');
        return res.redirect(`${env.FRONTEND_URL}/auth/callback?error=no_user`);
      }

      const profileComplete = user.city && user.city !== 'Not Set';
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          type: 'user',
          role: user.role,
          city: user.city,
          profileComplete,
        },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`[Google OAuth] Token generated successfully for ${user.email}, profileComplete: ${profileComplete}`);
      res.redirect(`${env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error: any) {
      console.error('[Google OAuth] Token generation error:', error.message || error);
      res.redirect(`${env.FRONTEND_URL}/auth/callback?error=token_failed`);
    }
  }
);

// ============================================
// PROFILE COMPLETION
// ============================================

const completeProfileSchema = z.object({
  role: z.enum([
    'INDIVIDUAL_HOME_BUILDER',
    'RENOVATION_HOMEOWNER',
    'ARCHITECT',
    'INTERIOR_DESIGNER',
    'CONTRACTOR',
    'ELECTRICIAN',
    'SMALL_BUILDER',
    'DEVELOPER',
  ]).optional(),
  city: z.string().min(2).optional(),
  purpose: z.string().optional(),
  phone: z.string().optional(),
});

router.post('/complete-profile', authenticateToken, validateBody(completeProfileSchema), async (req: any, res) => {
  try {
    const userId = req.user.id;

    const updateData: any = {};
    if (req.body.role) updateData.role = req.body.role;
    if (req.body.city) updateData.city = req.body.city;
    if (req.body.purpose) updateData.purpose = req.body.purpose;
    if (req.body.phone) updateData.phone = req.body.phone;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        city: true,
        purpose: true,
        profileImage: true,
      },
    });

    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        type: 'user',
        role: user.role,
        city: user.city,
        profileComplete: true,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        city: user.city,
        purpose: user.purpose,
        profileImage: user.profileImage,
        type: 'user',
      },
      token: newToken,
    });
  } catch (error) {
    console.error('Profile completion error:', error);
    return res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// ============================================
// DEALER AUTH
// ============================================

const dealerRegistrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Business name is required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  gstNumber: z.string().length(15, 'GST number must be exactly 15 characters'),
  panNumber: z.string().length(10, 'PAN number must be exactly 10 characters'),
  shopAddress: z.string().min(5, 'Shop address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be exactly 6 digits'),
});

router.post('/dealer/register', validateBody(dealerRegistrationSchema), async (req, res) => {
  try {
    const existingDealer = await prisma.dealer.findUnique({
      where: { email: req.body.email },
    });

    if (existingDealer) {
      return res.status(400).json({ error: 'Dealer already exists with this email' });
    }

    const existingGST = await prisma.dealer.findUnique({
      where: { gstNumber: req.body.gstNumber },
    });

    if (existingGST) {
      return res.status(400).json({ error: 'GST number already registered' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, env.BCRYPT_ROUNDS);

    const dealer = await prisma.dealer.create({
      data: {
        ...req.body,
        password: hashedPassword,
        status: 'PENDING_VERIFICATION',
      },
      select: {
        id: true,
        email: true,
        businessName: true,
        status: true,
      },
    });

    return res.status(201).json({
      message: 'Dealer registration submitted. Verification pending.',
      dealer,
    });
  } catch (error) {
    console.error('Dealer registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

const dealerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/dealer/login', validateBody(dealerLoginSchema), async (req, res) => {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { email: req.body.email },
    });

    if (!dealer || !dealer.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, dealer.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (dealer.status === 'PENDING_VERIFICATION') {
      return res.status(403).json({ error: 'Account pending verification' });
    }

    if (dealer.status === 'REJECTED' || dealer.status === 'SUSPENDED' || dealer.status === 'DELETED') {
      return res.status(403).json({ error: 'Account access denied' });
    }

    const token = jwt.sign(
      { id: dealer.id, email: dealer.email, type: 'dealer' },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      dealer: {
        id: dealer.id,
        email: dealer.email,
        businessName: dealer.businessName,
        city: dealer.city,
        status: dealer.status,
      },
    });
  } catch (error) {
    console.error('Dealer login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================
// ADMIN AUTH
// ============================================

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/admin/login', validateBody(adminLoginSchema), async (req, res) => {
  try {
    const admin = await prisma.admin.findUnique({
      where: { email: req.body.email },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(req.body.password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, type: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
