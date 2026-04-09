import axios from 'axios';
import { env } from '../config/env';

// SMS Service - Supports MSG91 (India) and Twilio (International)
// OTPs are NEVER logged in production. Phone numbers are masked outside development.

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Mask phone number for safe logging: +91XXXXXXX1999 -> ***1999
function maskPhone(phone: string): string {
  return '***' + phone.slice(-4);
}

const isDev = env.NODE_ENV === 'development';

// Send OTP via MSG91 (Popular in India)
async function sendViaMSG91(phone: string, otp: string): Promise<SMSResult> {
  if (!env.MSG91_AUTH_KEY || !env.MSG91_TEMPLATE_ID) {
    return { success: false, error: 'MSG91 not configured' };
  }

  try {
    // MSG91 Flow API
    const response = await axios.post(
      'https://control.msg91.com/api/v5/flow/',
      {
        template_id: env.MSG91_TEMPLATE_ID,
        short_url: '0',
        mobiles: phone.replace('+', ''),
        VAR1: otp, // OTP variable in template
      },
      {
        headers: {
          'authkey': env.MSG91_AUTH_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.type === 'success') {
      process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_msg91_sent', phone: isDev ? phone : maskPhone(phone) }) + '\n');
      return { success: true, messageId: response.data.request_id };
    } else {
      console.error('[SMS] MSG91 error:', response.data);
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    console.error('[SMS] MSG91 request failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Send OTP via Twilio (International)
async function sendViaTwilio(phone: string, otp: string): Promise<SMSResult> {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        To: phone,
        From: env.TWILIO_PHONE_NUMBER,
        Body: `Your Hub4Estate verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      }),
      {
        auth: {
          username: env.TWILIO_ACCOUNT_SID,
          password: env.TWILIO_AUTH_TOKEN,
        },
      }
    );

    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_twilio_sent', phone: isDev ? phone : maskPhone(phone), sid: response.data.sid }) + '\n');
    return { success: true, messageId: response.data.sid };
  } catch (error: any) {
    console.error('[SMS] Twilio request failed:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Main function to send OTP SMS
export async function sendOTPSMS(phone: string, otp: string): Promise<SMSResult> {
  // Normalize phone number
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  // Log OTP send attempt — mask phone in production, never log OTP value in production
  process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_otp_send_attempt', phone: isDev ? normalizedPhone : maskPhone(normalizedPhone) }) + '\n');

  // Check if it's an Indian number (+91)
  const isIndianNumber = normalizedPhone.startsWith('+91');

  // Try MSG91 first for Indian numbers
  if (isIndianNumber && env.MSG91_AUTH_KEY) {
    const result = await sendViaMSG91(normalizedPhone, otp);
    if (result.success) return result;
    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_msg91_fallback', phone: isDev ? normalizedPhone : maskPhone(normalizedPhone) }) + '\n');
  }

  // Try Twilio as fallback or for international numbers
  if (env.TWILIO_ACCOUNT_SID) {
    const result = await sendViaTwilio(normalizedPhone, otp);
    if (result.success) return result;
  }

  // In development without SMS providers configured
  if (env.NODE_ENV === 'development') {
    process.stdout.write(JSON.stringify({ level: 'info', event: 'sms_dev_mode_otp', phone: normalizedPhone, otp }) + '\n');
    return { success: true, messageId: 'dev-mode' };
  }

  return { success: false, error: 'No SMS provider configured' };
}

// Send a transactional (non-OTP) SMS message
export async function sendTransactionalSMS(phone: string, message: string): Promise<SMSResult> {
  const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

  process.stdout.write(JSON.stringify({
    level: 'info',
    event: 'sms_transactional_attempt',
    phone: isDev ? normalizedPhone : maskPhone(normalizedPhone),
  }) + '\n');

  const isIndianNumber = normalizedPhone.startsWith('+91');

  // Try MSG91 transactional template
  if (isIndianNumber && env.MSG91_AUTH_KEY && env.MSG91_TRANSACTIONAL_TEMPLATE_ID) {
    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/flow/',
        {
          template_id: env.MSG91_TRANSACTIONAL_TEMPLATE_ID,
          short_url: '0',
          mobiles: normalizedPhone.replace('+', ''),
          VAR1: message,
        },
        {
          headers: {
            'authkey': env.MSG91_AUTH_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.type === 'success') {
        return { success: true, messageId: response.data.request_id };
      }
      console.error('[SMS] MSG91 transactional error:', response.data);
    } catch (error: any) {
      console.error('[SMS] MSG91 transactional request failed:', error.message);
    }
  }

  // Try Twilio for international or as fallback
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
    try {
      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
        new URLSearchParams({
          To: normalizedPhone,
          From: env.TWILIO_PHONE_NUMBER,
          Body: message,
        }),
        {
          auth: {
            username: env.TWILIO_ACCOUNT_SID,
            password: env.TWILIO_AUTH_TOKEN,
          },
        }
      );
      return { success: true, messageId: response.data.sid };
    } catch (error: any) {
      console.error('[SMS] Twilio transactional failed:', error.response?.data || error.message);
    }
  }

  // Dev mode fallback
  if (isDev) {
    console.log(`[SMS Dev] To: ${normalizedPhone} | Message: ${message}`);
    return { success: true, messageId: 'dev-mode' };
  }

  return { success: false, error: 'No SMS provider configured for transactional SMS' };
}

export default {
  sendOTPSMS,
  sendTransactionalSMS,
};
