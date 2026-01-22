import axios from 'axios';
import { env } from '../config/env';

// SMS Service - Supports MSG91 (India) and Twilio (International)
// For development, OTPs are logged to console

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

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
      console.log(`[SMS] MSG91 sent to ${phone}`);
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

    console.log(`[SMS] Twilio sent to ${phone}, SID: ${response.data.sid}`);
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

  // Log in development mode
  console.log(`[SMS] Sending OTP to ${normalizedPhone}: ${otp}`);

  // Check if it's an Indian number (+91)
  const isIndianNumber = normalizedPhone.startsWith('+91');

  // Try MSG91 first for Indian numbers
  if (isIndianNumber && env.MSG91_AUTH_KEY) {
    const result = await sendViaMSG91(normalizedPhone, otp);
    if (result.success) return result;
    console.log('[SMS] MSG91 failed, trying fallback...');
  }

  // Try Twilio as fallback or for international numbers
  if (env.TWILIO_ACCOUNT_SID) {
    const result = await sendViaTwilio(normalizedPhone, otp);
    if (result.success) return result;
  }

  // In development without SMS providers configured
  if (env.NODE_ENV === 'development') {
    console.log(`[SMS] Development mode - OTP for ${normalizedPhone}: ${otp}`);
    return { success: true, messageId: 'dev-mode' };
  }

  return { success: false, error: 'No SMS provider configured' };
}

export default {
  sendOTPSMS,
};
