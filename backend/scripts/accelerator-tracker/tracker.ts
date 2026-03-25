/**
 * Hub4Estate Accelerator Tracker
 * --------------------------------
 * Sends reminder emails for upcoming accelerator / grant deadlines.
 * Run daily via cron: `0 9 * * * cd /path/to/backend && npx tsx scripts/accelerator-tracker/tracker.ts`
 *
 * Setup (one-time):
 * 1. Go to Google Account → Security → 2-Step Verification → App Passwords
 * 2. Create app password for "Mail" → "Windows Computer" → copy 16-char password
 * 3. Add to backend/.env:
 *    TRACKER_GMAIL_USER=agarwalshreshth1204@gmail.com
 *    TRACKER_GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
 *    TRACKER_NOTIFY_EMAIL=shreshth.agarwal@hub4estate.com
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─── Types ──────────────────────────────────────────────────────────────────

interface Program {
  id: string;
  name: string;
  type: string;
  deadline: string; // YYYY-MM-DD or null for rolling
  status: string;
  applicationUrl: string;
  equity: string;
  investment: string;
  applicationMethod: string;
  location: string;
  remoteOk: boolean;
  relevanceScore: number;
  category: string;
  notes: string;
  applicationTips: string;
  keyStats: string;
}

interface ReminderState {
  sent: Record<string, string[]>; // programId → array of reminder types sent ("30d", "14d", "7d", "3d", "1d")
  lastRun: string;
}

// ─── Config ─────────────────────────────────────────────────────────────────

const REMINDER_DAYS = [30, 14, 7, 3, 1];
const GMAIL_USER = process.env.TRACKER_GMAIL_USER || 'agarwalshreshth1204@gmail.com';
const GMAIL_PASS = process.env.TRACKER_GMAIL_APP_PASSWORD;
const NOTIFY_EMAIL = process.env.TRACKER_NOTIFY_EMAIL || 'shreshth.agarwal@hub4estate.com';

const PROGRAMS_FILE = path.resolve(__dirname, 'programs.json');
const STATE_FILE = path.resolve(__dirname, 'reminder-state.json');

// ─── Hub4Estate Application Text (copy-paste into any form) ─────────────────

const APPLICATION_TEMPLATE = {
  oneLiner:
    'Hub4Estate is India\'s B2B marketplace digitizing the ₹50,000+ crore building materials supply chain — connecting verified dealers, brands, and bulk buyers through AI-powered procurement.',

  problem:
    "India's construction industry procures materials through completely fragmented, offline channels — no price transparency, no verified dealer network, no digital infrastructure. Builders and contractors waste hours calling 15+ dealers, getting inconsistent quotes, and dealing with counterfeit products. There is no digital equivalent of Amazon Business for India's industrial supplies market.",

  solution:
    "Hub4Estate connects verified authorized dealers, brand catalogs, and bulk buyers (builders, contractors, electricians) through a unified B2B marketplace. Core features: AI-powered product identification (upload photo → get matched product + nearby dealers), RFQ workflows (submit requirement → receive competitive quotes from verified dealers), dealer onboarding with GST/brand authorization verification, and a smart slip scanner that extracts product data from purchase receipts.",

  traction:
    'Full-stack MVP live (React + Node.js + PostgreSQL). Product catalog with 50+ Indian electrical brands (Havells, Polycab, Finolex, Schneider, Siemens, Legrand). Dealer onboarding system with verification workflow. AI slip scanner with OCR. Inquiry-to-quote pipeline. Company registered (HUB4ESTATE LLP, LLPIN: ACW-4269). DPIIT recognition in progress.',

  market:
    "India's building materials market is ₹50,000+ crore annually. Electrical supplies alone are ₹30,000+ crore. The market is 95% offline with zero dominant B2B digital platform. Comparable opportunities: IndiaMART ($3B market cap) serves general B2B; we're purpose-built for construction/industrial with vertical-specific features (dealer authorization verification, brand catalog, compliance tracking).",

  team:
    'Shreshth Agarwal (18, sole founder) — built entire platform solo. Business Management at Mesa School of Business (2025-2029) + BBA Marketing at NMIMS. Based in Sriganganagar, Rajasthan — a major trading hub for industrial supplies in North India, giving direct market insight.',

  businessModel:
    'B2B marketplace model: Dealer subscription fees (₹2,000-₹10,000/month for verified dealer listing + lead access), transaction commission (1-3% on completed orders), and premium brand catalog listings. Target: 500 verified dealers in Year 1 across 10 cities.',

  whyNow:
    "Post-COVID digitization wave in Indian B2B. India's construction sector growing at 7%+ annually. Government's infrastructure push (₹11 lakh crore capex budget) driving demand. No dominant B2B marketplace for industrial supplies despite IndiaMART's success proving the model.",

  vision:
    "India's most trusted B2B marketplace for industrial and building supplies — the infrastructure layer connecting India's fragmented dealer network with the builders, contractors, and developers driving India's construction boom.",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadPrograms(): Program[] {
  return JSON.parse(fs.readFileSync(PROGRAMS_FILE, 'utf-8'));
}

function loadState(): ReminderState {
  if (!fs.existsSync(STATE_FILE)) {
    return { sent: {}, lastRun: '' };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
}

function saveState(state: ReminderState): void {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function urgencyColor(days: number): string {
  if (days <= 3) return '#dc2626';  // red
  if (days <= 7) return '#ea580c';  // orange
  if (days <= 14) return '#d97706'; // amber
  return '#2563eb';                 // blue
}

function urgencyEmoji(days: number): string {
  if (days <= 3) return '🚨';
  if (days <= 7) return '⚠️';
  if (days <= 14) return '📅';
  return '📌';
}

// ─── Email Builder ───────────────────────────────────────────────────────────

function buildReminderEmail(program: Program, daysLeft: number): { subject: string; html: string } {
  const color = urgencyColor(daysLeft);
  const emoji = urgencyEmoji(daysLeft);
  const urgencyText = daysLeft === 1 ? 'LAST DAY' : `${daysLeft} DAYS LEFT`;

  const subject = `${emoji} ${urgencyText}: ${program.name} deadline — Hub4Estate Application`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">

    <!-- Header -->
    <div style="background:${color};border-radius:12px 12px 0 0;padding:24px;text-align:center;">
      <div style="font-size:40px;margin-bottom:8px;">${emoji}</div>
      <div style="color:white;font-size:28px;font-weight:800;letter-spacing:-0.5px;">${urgencyText}</div>
      <div style="color:rgba(255,255,255,0.9);font-size:16px;margin-top:4px;">until ${program.name}</div>
    </div>

    <!-- Main Card -->
    <div style="background:white;border-radius:0 0 12px 12px;padding:28px;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

      <!-- Program Info -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;width:35%;">Deadline</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;font-weight:600;">${formatDate(program.deadline)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;">Investment</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;">${program.investment}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;">Equity</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;">${program.equity}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#6b7280;">Location</td>
          <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;">${program.location}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:13px;color:#6b7280;">Relevance</td>
          <td style="padding:8px 0;font-size:14px;color:#111827;">${'⭐'.repeat(program.relevanceScore)} (${program.relevanceScore}/10)</td>
        </tr>
      </table>

      <!-- Strategy Note -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#92400e;margin-bottom:6px;">Strategy Note</div>
        <div style="font-size:14px;color:#78350f;line-height:1.6;">${program.notes}</div>
      </div>

      <!-- Application Tips -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin-bottom:24px;">
        <div style="font-size:13px;font-weight:700;color:#1e40af;margin-bottom:6px;">Application Tips</div>
        <div style="font-size:14px;color:#1e3a8a;line-height:1.6;">${program.applicationTips}</div>
      </div>

      <!-- Key Stats -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin-bottom:28px;">
        <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:6px;">Key Stats</div>
        <div style="font-size:14px;color:#14532d;line-height:1.6;">${program.keyStats}</div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:32px;">
        <a href="${program.applicationUrl}"
           style="display:inline-block;background:${color};color:white;text-decoration:none;
                  padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;
                  letter-spacing:0.3px;">
          Apply Now →
        </a>
      </div>

      <!-- Application Draft Section -->
      <div style="border-top:2px solid #e5e7eb;padding-top:24px;">
        <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:4px;">
          Pre-Written Application — Copy &amp; Paste
        </div>
        <div style="font-size:13px;color:#6b7280;margin-bottom:20px;">
          Use these answers directly in the application form. Adjust length as needed.
        </div>

        ${buildApplicationSection('One-Liner (10 words)', APPLICATION_TEMPLATE.oneLiner)}
        ${buildApplicationSection('Problem Statement', APPLICATION_TEMPLATE.problem)}
        ${buildApplicationSection('Solution', APPLICATION_TEMPLATE.solution)}
        ${buildApplicationSection('Market Size & Opportunity', APPLICATION_TEMPLATE.market)}
        ${buildApplicationSection('Traction / What Have You Built', APPLICATION_TEMPLATE.traction)}
        ${buildApplicationSection('Team', APPLICATION_TEMPLATE.team)}
        ${buildApplicationSection('Business Model', APPLICATION_TEMPLATE.businessModel)}
        ${buildApplicationSection('Why Now', APPLICATION_TEMPLATE.whyNow)}
        ${buildApplicationSection('Vision', APPLICATION_TEMPLATE.vision)}
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px;font-size:12px;color:#9ca3af;">
      Hub4Estate Accelerator Tracker · Automated by your system · Reply to this email with updates
    </div>

  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}

function buildApplicationSection(title: string, content: string): string {
  return `
    <div style="margin-bottom:20px;">
      <div style="font-size:12px;font-weight:700;color:#374151;text-transform:uppercase;
                  letter-spacing:0.8px;margin-bottom:6px;">${title}</div>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;
                  padding:14px;font-size:14px;color:#374151;line-height:1.6;
                  white-space:pre-wrap;">${content}</div>
    </div>
  `;
}

// ─── Mailer ──────────────────────────────────────────────────────────────────

function createTransporter() {
  if (!GMAIL_PASS) {
    throw new Error(
      'TRACKER_GMAIL_APP_PASSWORD not set in .env\n' +
      'Go to: Google Account → Security → 2-Step Verification → App Passwords\n' +
      'Create an app password and add it to backend/.env as TRACKER_GMAIL_APP_PASSWORD'
    );
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });
}

async function sendEmail(subject: string, html: string): Promise<void> {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Hub4Estate Tracker" <${GMAIL_USER}>`,
    to: NOTIFY_EMAIL,
    subject,
    html,
  });
  console.log(`  ✓ Sent: ${subject}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n── Hub4Estate Accelerator Tracker ──');
  console.log(`Date: ${new Date().toLocaleDateString('en-IN')}`);
  console.log(`Notifying: ${NOTIFY_EMAIL}\n`);

  const programs = loadPrograms();
  const state = loadState();
  let emailsSent = 0;
  const remindersTriggered: string[] = [];

  for (const program of programs) {
    if (!program.deadline || program.status === 'closed' || program.status === 'expired') {
      continue;
    }

    const days = daysUntil(program.deadline);

    // Skip if deadline already passed (more than 1 day ago)
    if (days < -1) {
      continue;
    }

    if (!state.sent[program.id]) {
      state.sent[program.id] = [];
    }

    for (const threshold of REMINDER_DAYS) {
      const reminderKey = `${threshold}d`;

      // Only send if we're at or within this threshold AND haven't sent it yet
      if (days <= threshold && !state.sent[program.id].includes(reminderKey)) {
        try {
          console.log(`Sending ${threshold}-day reminder for: ${program.name} (${days} days left)`);
          const { subject, html } = buildReminderEmail(program, days);
          await sendEmail(subject, html);
          state.sent[program.id].push(reminderKey);
          emailsSent++;
          remindersTriggered.push(`${program.name} (${days} days)`);
          // Small delay between emails
          await new Promise((r) => setTimeout(r, 1500));
        } catch (err) {
          console.error(`  ✗ Failed to send for ${program.name}:`, err);
        }
      }
    }
  }

  state.lastRun = new Date().toISOString();
  saveState(state);

  console.log(`\n── Summary ──`);
  if (emailsSent === 0) {
    console.log('No reminders needed today.');
  } else {
    console.log(`Sent ${emailsSent} reminder(s):`);
    remindersTriggered.forEach((r) => console.log(`  · ${r}`));
  }

  console.log('\nDone.\n');
}

run().catch((err) => {
  console.error('Tracker error:', err.message);
  process.exit(1);
});
