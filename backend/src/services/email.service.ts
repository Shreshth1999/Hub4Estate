import { Resend } from 'resend';
import { env } from '../config/env';

let resendClient: Resend | null = null;

if (env.RESEND_API_KEY) {
  resendClient = new Resend(env.RESEND_API_KEY);
}

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailParams): Promise<boolean> {
  if (!resendClient) {
    console.warn('Email service not configured - RESEND_API_KEY missing');
    return false;
  }

  try {
    // Use Resend's test email for development (until domain is verified)
    // After verifying your domain in Resend, change this to your domain
    const fromEmail = env.NODE_ENV === 'production'
      ? 'Hub4Estate <noreply@hub4estate.com>'
      : 'Hub4Estate <onboarding@resend.dev>';

    const result = await resendClient.emails.send({
      from: fromEmail,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    process.stdout.write(JSON.stringify({ level: 'info', event: 'email_sent', result }) + '\n');
    return true;
  } catch (error: any) {
    console.error('[Email] Send error:', error?.message || error);
    if (error?.statusCode === 403) {
      console.error('[Email] Domain not verified. Please verify your domain in Resend dashboard.');
    }
    return false;
  }
}

// Contact form notification template
export function getContactNotificationEmail(data: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  message: string;
}): { subject: string; html: string } {
  return {
    subject: `New Contact Form Submission - ${data.name} (${data.role})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #171717; color: white; padding: 20px;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e5e5;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: bold;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
                <a href="mailto:${data.email}">${data.email}</a>
              </td>
            </tr>
            ${data.phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: bold;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">
                <a href="tel:${data.phone}">${data.phone}</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5; font-weight: bold;">Role:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e5e5;">${data.role}</td>
            </tr>
          </table>
          <div style="margin-top: 20px;">
            <strong>Message:</strong>
            <div style="margin-top: 10px; padding: 15px; background: #f5f5f5; border-radius: 4px;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
        <div style="padding: 15px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
          Hub4Estate - India's B2B Electrical Marketplace
        </div>
      </div>
    `,
  };
}

// OTP Email template
export function getOTPEmail(otp: string, type: 'login' | 'signup'): { subject: string; html: string } {
  const subject = type === 'signup'
    ? 'Welcome to Hub4Estate - Verify Your Email'
    : 'Hub4Estate - Your Login OTP';

  return {
    subject,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border: 2px solid #171717;">
          <tr>
            <td style="background-color: #171717; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">⚡ Hub4Estate</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #171717; font-size: 20px; font-weight: 700;">
                ${type === 'signup' ? 'Verify Your Email' : 'Your Login Code'}
              </h2>
              <p style="margin: 0 0 24px 0; color: #525252; font-size: 16px; line-height: 1.6;">
                ${type === 'signup'
                  ? 'Welcome to Hub4Estate! Use the verification code below to complete your registration.'
                  : 'Use this code to securely log in to your Hub4Estate account.'}
              </p>
              <div style="background-color: #f5f5f5; border: 2px solid #171717; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; color: #525252; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <p style="margin: 0; color: #171717; font-size: 36px; font-weight: 900; letter-spacing: 8px; font-family: monospace;">
                  ${otp}
                </p>
              </div>
              <p style="margin: 0 0 8px 0; color: #737373; font-size: 14px;">⏱️ This code expires in <strong>10 minutes</strong></p>
              <p style="margin: 0; color: #737373; font-size: 14px;">🔒 Never share this code with anyone.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f5f5f5; padding: 24px 32px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0 0 8px 0; color: #737373; font-size: 12px; text-align: center;">
                If you didn't request this code, please ignore this email.
              </p>
              <p style="margin: 0; color: #a3a3a3; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Hub4Estate. India's #1 Electrical Products Marketplace.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

// Quote compilation email for inquiry pipeline
export function getQuoteCompilationEmail(data: {
  customerName: string;
  inquiryNumber: string;
  productDescription: string;
  quantity: number;
  quotes: Array<{
    dealerName: string;
    city: string;
    price: number;
    shippingCost: number;
    totalPrice: number;
    deliveryDays?: number | null;
    warrantyInfo?: string | null;
  }>;
}): { subject: string; html: string } {
  const quoteRows = data.quotes
    .map(
      (q, i) => `
        <tr style="${i === 0 ? 'background-color: #fef3c7;' : ''}">
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; font-weight: ${i === 0 ? '700' : '400'};">
            ${i === 0 ? '⭐ ' : ''}${q.dealerName}
            <br><span style="color: #737373; font-size: 12px;">${q.city}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
            ₹${q.price.toLocaleString('en-IN')}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
            ${q.shippingCost > 0 ? '₹' + q.shippingCost.toLocaleString('en-IN') : 'Free'}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-weight: 700;">
            ₹${q.totalPrice.toLocaleString('en-IN')}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
            ${q.deliveryDays ? q.deliveryDays + ' days' : '-'}
          </td>
        </tr>`
    )
    .join('');

  return {
    subject: `Hub4Estate - Quotes Ready for ${data.productDescription} (${data.inquiryNumber})`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border: 2px solid #171717;">
          <tr>
            <td style="background-color: #171717; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;">⚡ Hub4Estate</h1>
              <p style="margin: 8px 0 0; color: #a3a3a3; font-size: 14px;">Your Quotes Are Ready!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 8px; color: #171717; font-size: 16px;">Dear ${data.customerName},</p>
              <p style="margin: 0 0 20px; color: #525252; font-size: 15px; line-height: 1.6;">
                We've sourced the best prices for your inquiry <strong>${data.inquiryNumber}</strong>:
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 4px; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Product</p>
                <p style="margin: 0; color: #171717; font-size: 16px; font-weight: 700;">${data.productDescription}</p>
                <p style="margin: 4px 0 0; color: #525252; font-size: 14px;">Quantity: ${data.quantity}</p>
              </div>

              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e5e5; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #171717;">
                    <th style="padding: 12px; color: #ffffff; text-align: left; font-size: 13px;">Dealer</th>
                    <th style="padding: 12px; color: #ffffff; text-align: right; font-size: 13px;">Price</th>
                    <th style="padding: 12px; color: #ffffff; text-align: right; font-size: 13px;">Shipping</th>
                    <th style="padding: 12px; color: #ffffff; text-align: right; font-size: 13px;">Total</th>
                    <th style="padding: 12px; color: #ffffff; text-align: center; font-size: 13px;">Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  ${quoteRows}
                </tbody>
              </table>

              <div style="margin-top: 24px; padding: 16px; background: #ecfdf5; border: 1px solid #86efac; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 4px; color: #166534; font-size: 14px; font-weight: 700;">Best Price</p>
                <p style="margin: 0; color: #166534; font-size: 24px; font-weight: 900;">
                  ₹${data.quotes[0]?.totalPrice.toLocaleString('en-IN') || 'N/A'}
                </p>
                <p style="margin: 4px 0 0; color: #15803d; font-size: 13px;">from ${data.quotes[0]?.dealerName || 'N/A'}</p>
              </div>

              <p style="margin: 24px 0 16px; color: #525252; font-size: 15px; line-height: 1.6;">
                Interested in proceeding? Simply reply to this email or call us at
                <strong>+91 76900 01999</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px 32px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0 0 4px; color: #737373; font-size: 12px;">
                Hub4Estate LLP - India's #1 Electrical Products Marketplace
              </p>
              <p style="margin: 0; color: #a3a3a3; font-size: 11px;">
                © ${new Date().getFullYear()} Hub4Estate. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

// Send OTP Email
export async function sendOTPEmail(email: string, otp: string, type: 'login' | 'signup'): Promise<boolean> {
  const { subject, html } = getOTPEmail(otp, type);
  return sendEmail({ to: email, subject, html });
}

// Auto-reply template for contact form
export function getContactAutoReplyEmail(name: string): { subject: string; html: string } {
  return {
    subject: 'Thank you for contacting Hub4Estate',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #171717; color: white; padding: 20px;">
          <h1 style="margin: 0; font-size: 24px;">Thank You for Reaching Out!</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${name},</p>
          <p>Thank you for contacting Hub4Estate. We've received your message and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to explore our platform:</p>
          <ul>
            <li><a href="https://hub4estate.com/categories">Browse Products</a></li>
            <li><a href="https://hub4estate.com/ai-assistant">Chat with our AI Assistant</a></li>
            <li><a href="https://hub4estate.com/knowledge">Electrical Knowledge Base</a></li>
          </ul>
          <p>Best regards,<br>Shreshth Agarwal<br>Founder, Hub4Estate<br>+91 76900 01999</p>
        </div>
        <div style="padding: 15px; background: #f5f5f5; text-align: center; font-size: 12px; color: #666;">
          Hub4Estate LLP - India's B2B Electrical Marketplace
        </div>
      </div>
    `,
  };
}
