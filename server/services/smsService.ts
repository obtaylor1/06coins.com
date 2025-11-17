import { storage } from '../storage.js';
import type { Order } from '@shared/schema';

// SMS Configuration from environment variables
const SMS_CONFIG = {
  enabled: process.env.SMS_ENABLED === 'true',
  provider: process.env.SMS_PROVIDER || 'twilio',
  accountSid: process.env.SMS_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.SMS_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.SMS_FROM_NUMBER || process.env.TWILIO_PHONE_NUMBER,
  adminNumber: process.env.SMS_ADMIN_NUMBER,
  adminAlertsEnabled: process.env.SMS_ADMIN_ALERTS_ENABLED === 'true',
  quietHoursStart: process.env.SMS_QUIET_HOURS_START || '21:00',
  quietHoursEnd: process.env.SMS_QUIET_HOURS_END || '09:00',
  maxSmsPerOrderPerDay: parseInt(process.env.SMS_MAX_PER_ORDER_PER_DAY || '3'),
};

// Twilio client (lazy-loaded)
let twilioClient: any = null;

function getTwilioClient() {
  if (!twilioClient && SMS_CONFIG.enabled && SMS_CONFIG.accountSid && SMS_CONFIG.authToken) {
    try {
      const twilio = require('twilio');
      twilioClient = twilio(SMS_CONFIG.accountSid, SMS_CONFIG.authToken);
      console.log('[SMS] Twilio client initialized');
    } catch (error) {
      console.error('[SMS] Failed to initialize Twilio client:', error);
    }
  }
  return twilioClient;
}

// Check if SMS configuration is complete
export function isSmsConfigured(): boolean {
  return !!(
    SMS_CONFIG.enabled &&
    SMS_CONFIG.accountSid &&
    SMS_CONFIG.authToken &&
    SMS_CONFIG.fromNumber
  );
}

// Validate phone number format (basic E.164 check)
export function isValidPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;
  // E.164 format: +[country code][number] (e.g., +11234567890)
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  return e164Regex.test(phone.trim());
}

// Format phone number to E.164 if needed
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // If starts with 1 (US), add +
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // If 10 digits (US without country code), add +1
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  
  // Already has + or other format
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: add + and hope for the best
  return `+${cleaned}`;
}

// Check if current time is in quiet hours (local time)
export function isQuietHours(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  const [startHour] = SMS_CONFIG.quietHoursStart.split(':').map(Number);
  const [endHour] = SMS_CONFIG.quietHoursEnd.split(':').map(Number);
  
  // If quiet hours span midnight (e.g., 21:00 to 08:00)
  if (startHour > endHour) {
    return currentHour >= startHour || currentHour < endHour;
  }
  
  // Normal range (e.g., 02:00 to 06:00)
  return currentHour >= startHour && currentHour < endHour;
}

// Check if order has exceeded SMS rate limit for today
export async function checkRateLimit(orderId: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const order = await storage.getOrder(orderId);
    if (!order) {
      return { allowed: false, remaining: 0 };
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Reset counter if it's a new day
    if (order.smsLastSentDate !== today) {
      await storage.updateOrder(orderId, {
        smsSentToday: 0,
        smsLastSentDate: today,
      });
      return { allowed: true, remaining: SMS_CONFIG.maxSmsPerOrderPerDay };
    }
    
    const remaining = SMS_CONFIG.maxSmsPerOrderPerDay - (order.smsSentToday || 0);
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    };
  } catch (error) {
    console.error('[SMS] Error checking rate limit:', error);
    return { allowed: false, remaining: 0 };
  }
}

// Log SMS to order record
async function logSmsToOrder(orderId: string, type: string, status: 'sent' | 'failed', error?: string) {
  try {
    const order = await storage.getOrder(orderId);
    if (!order) return;
    
    const smsLog = (order.smsLog as any[]) || [];
    smsLog.push({
      type,
      timestamp: new Date().toISOString(),
      status,
      error: error || null,
    });
    
    const updates: any = {
      smsLog,
    };
    
    // Increment sent counter if successful
    if (status === 'sent') {
      updates.smsSentToday = (order.smsSentToday || 0) + 1;
      updates.smsLastSentDate = new Date().toISOString().split('T')[0];
    }
    
    // Mark error flag if failed
    if (status === 'failed') {
      updates.smsError = 1;
    }
    
    await storage.updateOrder(orderId, updates);
  } catch (error) {
    console.error('[SMS] Error logging SMS to order:', error);
  }
}

// Core SMS sending function
export async function sendSms({
  to,
  body,
  type = 'transactional',
  orderId,
  respectQuietHours = false,
}: {
  to: string;
  body: string;
  type?: 'transactional' | 'marketing' | 'admin';
  orderId?: string;
  respectQuietHours?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  // Check if SMS is enabled
  if (!isSmsConfigured()) {
    console.log('[SMS] SMS not configured, skipping send');
    return { success: false, error: 'SMS not configured' };
  }
  
  // Validate phone number
  const formattedPhone = formatPhoneNumber(to);
  if (!isValidPhoneNumber(formattedPhone)) {
    console.error('[SMS] Invalid phone number:', to);
    if (orderId) {
      await logSmsToOrder(orderId, type, 'failed', 'Invalid phone number');
    }
    return { success: false, error: 'Invalid phone number' };
  }
  
  // Check quiet hours for non-urgent messages
  if (respectQuietHours && isQuietHours()) {
    console.log('[SMS] Skipping send due to quiet hours:', type);
    return { success: false, error: 'Quiet hours - will retry later' };
  }
  
  // Check rate limit for transactional messages
  if (type === 'transactional' && orderId) {
    const rateLimitCheck = await checkRateLimit(orderId);
    if (!rateLimitCheck.allowed) {
      console.warn('[SMS] Rate limit exceeded for order:', orderId);
      await logSmsToOrder(orderId, type, 'failed', 'Rate limit exceeded');
      return { success: false, error: 'Rate limit exceeded' };
    }
  }
  
  try {
    const client = getTwilioClient();
    if (!client) {
      throw new Error('Twilio client not available');
    }
    
    // Send SMS via Twilio
    const message = await client.messages.create({
      body,
      from: SMS_CONFIG.fromNumber,
      to: formattedPhone,
    });
    
    console.log(`[SMS] Sent ${type} message to ${formattedPhone} (SID: ${message.sid})`);
    
    // Log success
    if (orderId) {
      await logSmsToOrder(orderId, type, 'sent');
    }
    
    return { success: true };
  } catch (error: any) {
    console.error(`[SMS] Error sending ${type} message:`, error.message);
    
    // Log failure
    if (orderId) {
      await logSmsToOrder(orderId, type, 'failed', error.message);
    }
    
    return { success: false, error: error.message };
  }
}

// Mark SMS as sent in database (to prevent duplicates)
export async function markSmsSent(orderId: string, smsType: string): Promise<void> {
  try {
    const fieldMap: { [key: string]: string } = {
      confirmation: 'smsConfirmationSent',
      shipping: 'smsShippingSent',
      delivery: 'smsDeliverySent',
      thankYou: 'smsThankYouSent',
      review: 'smsReviewSent',
      problem: 'smsProblemSent',
    };
    
    const field = fieldMap[smsType];
    if (field) {
      await storage.updateOrder(orderId, { [field]: 1 });
    }
  } catch (error) {
    console.error('[SMS] Error marking SMS as sent:', error);
  }
}
