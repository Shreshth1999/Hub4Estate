/**
 * Hub4Estate Accelerator Digest Sender
 * ─────────────────────────────────────
 * Sends a full digest of ALL open programs right now.
 * Run once to get the complete picture, then let tracker.ts handle daily reminders.
 *
 * Usage: npx tsx scripts/accelerator-tracker/send-digest.ts
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Program {
  id: string;
  name: string;
  type: string;
  deadline: string;
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

const GMAIL_USER = process.env.TRACKER_GMAIL_USER || 'agarwalshreshth1204@gmail.com';
const GMAIL_PASS = process.env.TRACKER_GMAIL_APP_PASSWORD;
const NOTIFY_EMAIL = process.env.TRACKER_NOTIFY_EMAIL || 'shreshth.agarwal@hub4estate.com';
const PROGRAMS_FILE = path.resolve(__dirname, 'programs.json');

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(dateStr);
  deadline.setHours(0, 0, 0, 0);
  return Math.round((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function deadlineBadge(days: number, dateStr: string): string {
  if (days <= 3) return `<span style="background:#fef2f2;color:#dc2626;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">🚨 ${days}d left</span>`;
  if (days <= 7) return `<span style="background:#fff7ed;color:#ea580c;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">⚠️ ${days}d left</span>`;
  if (days <= 30) return `<span style="background:#fffbeb;color:#d97706;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">📅 ${days}d · ${formatDate(dateStr)}</span>`;
  return `<span style="background:#eff6ff;color:#2563eb;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">📌 ${formatDate(dateStr)}</span>`;
}

function categoryLabel(category: string): string {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    global_top_tier:   { label: 'Global Top Tier', color: '#7c3aed', bg: '#f5f3ff' },
    india_top_tier:    { label: 'India Top Tier',  color: '#0891b2', bg: '#ecfeff' },
    india_incubator:   { label: 'India Incubator', color: '#059669', bg: '#f0fdf4' },
    india_women_focused: { label: 'Women-Led Program', color: '#db2777', bg: '#fdf2f8' },
    government:        { label: 'Government',       color: '#16a34a', bg: '#f0fdf4' },
    global_tier_2:     { label: 'Global Tier 2',   color: '#2563eb', bg: '#eff6ff' },
    global_b2b_focused: { label: 'B2B Focused',    color: '#d97706', bg: '#fffbeb' },
    cloud_credits:     { label: 'Free Credits',     color: '#0369a1', bg: '#f0f9ff' },
    student_vc:        { label: 'Young Founder VC', color: '#7c3aed', bg: '#f5f3ff' },
    europe_b2b:        { label: 'Europe B2B',       color: '#374151', bg: '#f9fafb' },
    india_corporate:   { label: 'Corporate',        color: '#b45309', bg: '#fffbeb' },
    vc_fellowship:     { label: 'VC Fellowship',    color: '#4f46e5', bg: '#eef2ff' },
    government_loan:   { label: 'Govt Loan',        color: '#15803d', bg: '#f0fdf4' },
    government_grant:  { label: 'Govt Grant',       color: '#15803d', bg: '#f0fdf4' },
  };
  const c = map[category] || { label: category, color: '#374151', bg: '#f9fafb' };
  return `<span style="background:${c.bg};color:${c.color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">${c.label}</span>`;
}

function buildDigestEmail(programs: Program[]): { subject: string; html: string } {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Sort: by days until deadline (most urgent first), rolling/upcoming last
  const withDays = programs.map((p) => ({
    ...p,
    daysLeft: p.deadline ? daysUntil(p.deadline) : 999,
  }));
  withDays.sort((a, b) => a.daysLeft - b.daysLeft);

  // Buckets
  const urgent = withDays.filter((p) => p.daysLeft <= 30 && p.daysLeft >= 0);
  const upcoming = withDays.filter((p) => p.daysLeft > 30);
  const rolling = programs.filter((p) => p.status === 'rolling');

  const subject = `Hub4Estate Accelerator Digest — ${withDays.filter(p => p.daysLeft <= 30 && p.daysLeft >= 0).length} programs closing within 30 days`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:700px;margin:0 auto;padding:24px 16px;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#1e40af,#7c3aed);border-radius:12px;padding:32px;text-align:center;margin-bottom:20px;">
    <div style="color:rgba(255,255,255,0.7);font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Hub4Estate</div>
    <div style="color:white;font-size:26px;font-weight:800;margin-bottom:8px;">Accelerator Master Digest</div>
    <div style="color:rgba(255,255,255,0.85);font-size:14px;">${today}</div>
    <div style="margin-top:20px;display:inline-flex;gap:16px;">
      <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;text-align:center;">
        <div style="color:white;font-size:24px;font-weight:800;">${programs.length}</div>
        <div style="color:rgba(255,255,255,0.8);font-size:12px;">Total Programs</div>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;text-align:center;">
        <div style="color:#fbbf24;font-size:24px;font-weight:800;">${urgent.length}</div>
        <div style="color:rgba(255,255,255,0.8);font-size:12px;">Closing &lt;30 Days</div>
      </div>
      <div style="background:rgba(255,255,255,0.15);border-radius:8px;padding:12px 20px;text-align:center;">
        <div style="color:#34d399;font-size:24px;font-weight:800;">${rolling.length}</div>
        <div style="color:rgba(255,255,255,0.8);font-size:12px;">Rolling Open</div>
      </div>
    </div>
  </div>

  <!-- Priority Action Box -->
  <div style="background:#fef2f2;border:2px solid #fca5a5;border-radius:12px;padding:20px;margin-bottom:20px;">
    <div style="font-size:15px;font-weight:800;color:#991b1b;margin-bottom:12px;">🚨 Priority Actions Right Now</div>
    <div style="display:grid;gap:8px;">
      ${urgent.slice(0, 5).map((p, i) => `
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="background:#dc2626;color:white;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${i + 1}</div>
          <div style="flex:1;font-size:13px;color:#7f1d1d;">
            <strong>${p.name}</strong> — ${p.daysLeft <= 0 ? 'TODAY' : `${p.daysLeft} days`}
          </div>
          <a href="${p.applicationUrl}" style="background:#dc2626;color:white;text-decoration:none;padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700;flex-shrink:0;">Apply →</a>
        </div>
      `).join('')}
    </div>
  </div>

  ${urgent.length > 0 ? buildSection('Closing Within 30 Days', urgent) : ''}
  ${upcoming.length > 0 ? buildSection('Upcoming Deadlines (30+ Days)', upcoming) : ''}

  <!-- Footer -->
  <div style="text-align:center;padding:20px;font-size:12px;color:#9ca3af;">
    Hub4Estate Accelerator Tracker · Daily reminders automatically sent at 9:00 AM<br>
    Run <code>npx tsx scripts/accelerator-tracker/tracker.ts</code> to check today's reminders
  </div>

</div>
</body>
</html>
  `.trim();

  return { subject, html };
}

function buildSection(title: string, programs: ReturnType<typeof Array.prototype.map>): string {
  return `
  <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
    <div style="font-size:15px;font-weight:800;color:#111827;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #f3f4f6;">${title}</div>
    ${programs.map((p: any) => buildProgramRow(p)).join('')}
  </div>
  `;
}

function buildProgramRow(p: any): string {
  return `
  <div style="padding:16px 0;border-bottom:1px solid #f9fafb;display:flex;gap:16px;">
    <div style="flex:1;min-width:0;">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
        <span style="font-size:15px;font-weight:700;color:#111827;">${p.name}</span>
        ${categoryLabel(p.category)}
        ${p.deadline ? deadlineBadge(p.daysLeft, p.deadline) : '<span style="background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;">Rolling Open</span>'}
      </div>
      <div style="font-size:13px;color:#374151;margin-bottom:6px;">
        <strong>Investment:</strong> ${p.investment} &nbsp;|&nbsp; <strong>Equity:</strong> ${p.equity} &nbsp;|&nbsp; <strong>Location:</strong> ${p.location}
      </div>
      <div style="font-size:13px;color:#6b7280;line-height:1.5;margin-bottom:8px;">${p.notes.slice(0, 180)}${p.notes.length > 180 ? '...' : ''}</div>
      <div style="display:flex;gap:8px;align-items:center;">
        <a href="${p.applicationUrl}" style="background:#1e40af;color:white;text-decoration:none;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:700;">Apply →</a>
        <div style="font-size:12px;color:#9ca3af;">Relevance: ${'★'.repeat(p.relevanceScore)}${'☆'.repeat(10 - p.relevanceScore)}</div>
      </div>
    </div>
  </div>
  `;
}

async function run() {
  if (!GMAIL_PASS) {
    console.error('\n❌ TRACKER_GMAIL_APP_PASSWORD not set in backend/.env');
    console.error('\nSetup steps:');
    console.error('1. Enable 2-Step Verification on your Google account');
    console.error('2. Go to: myaccount.google.com → Security → App Passwords');
    console.error('3. Create app password: Mail → Other → name it "Hub4Estate Tracker"');
    console.error('4. Copy the 16-character password');
    console.error('5. Add to backend/.env:');
    console.error('   TRACKER_GMAIL_USER=agarwalshreshth1204@gmail.com');
    console.error('   TRACKER_GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx');
    console.error('   TRACKER_NOTIFY_EMAIL=shreshth.agarwal@hub4estate.com\n');
    process.exit(1);
  }

  const programs: Program[] = JSON.parse(fs.readFileSync(PROGRAMS_FILE, 'utf-8'));

  console.log(`\n── Hub4Estate Accelerator Digest ──`);
  console.log(`Programs loaded: ${programs.length}`);
  console.log(`Sending digest to: ${NOTIFY_EMAIL}`);

  const { subject, html } = buildDigestEmail(programs);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Hub4Estate Tracker" <${GMAIL_USER}>`,
    to: NOTIFY_EMAIL,
    subject,
    html,
  });

  console.log(`\n✓ Digest sent: "${subject}"`);
  console.log('\nCheck your inbox at:', NOTIFY_EMAIL);
  console.log('\nNext step: Set up daily cron for tracker.ts\n');
}

run().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
