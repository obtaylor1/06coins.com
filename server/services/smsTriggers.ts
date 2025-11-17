import type { Order } from '@shared/schema';
import { sendSms, markSmsSent, isValidPhoneNumber, isSmsConfigured } from './smsService.js';
import { smsTemplates } from './smsTemplates.js';
import { storage } from '../storage.js';

// Environment config
const ADMIN_HIGH_VALUE_THRESHOLD = parseInt(process.env.SMS_ADMIN_HIGH_VALUE_THRESHOLD || '30000'); // $300 in cents
const SMS_ADMIN_ALERTS_ENABLED = process.env.SMS_ADMIN_ALERTS_ENABLED === 'true';
const SMS_ADMIN_NUMBER = process.env.SMS_ADMIN_NUMBER || process.env.TWILIO_ADMIN_PHONE_NUMBER;

// Helper: Check if customer has opted in for order updates
function hasOrderUpdatesOptIn(order: Order): boolean {
  return order.smsOrderUpdatesOptIn === 1 && !order.smsOptedOutAt;
}

// Helper: Check if customer has opted in for marketing
function hasMarketingOptIn(order: Order): boolean {
  return order.smsMarketingOptIn === 1 && !order.smsOptedOutAt;
}

// 1. Send order confirmation SMS (triggered after successful payment)
export async function sendOrderConfirmationSms(order: Order): Promise<void> {
  if (!isSmsConfigured()) return;
  
  // Check if already sent
  if (order.smsConfirmationSent === 1) {
    console.log('[SMS] Order confirmation already sent for order:', order.id);
    return;
  }
  
  // Check opt-in and phone validity
  if (!hasOrderUpdatesOptIn(order)) {
    console.log('[SMS] Customer has not opted in for order updates:', order.id);
    return;
  }
  
  if (!isValidPhoneNumber(order.customerPhone)) {
    console.log('[SMS] Invalid phone number for order:', order.id);
    return;
  }
  
  try {
    const message = smsTemplates.orderConfirmation(order);
    const result = await sendSms({
      to: order.customerPhone!,
      body: message,
      type: 'transactional',
      orderId: order.id,
      respectQuietHours: false, // Send immediately
    });
    
    if (result.success) {
      await markSmsSent(order.id, 'confirmation');
      console.log('[SMS] Order confirmation sent successfully:', order.id);
    }
  } catch (error: any) {
    console.error('[SMS] Error sending order confirmation:', error);
  }
}

// 2. Send shipping confirmation SMS (triggered when admin marks order as shipped)
export async function sendShippingConfirmationSms(order: Order): Promise<void> {
  if (!isSmsConfigured()) return;
  
  // Check if already sent
  if (order.smsShippingSent === 1) {
    console.log('[SMS] Shipping confirmation already sent for order:', order.id);
    return;
  }
  
  // Check opt-in and phone validity
  if (!hasOrderUpdatesOptIn(order)) {
    console.log('[SMS] Customer has not opted in for order updates:', order.id);
    return;
  }
  
  if (!isValidPhoneNumber(order.customerPhone)) {
    console.log('[SMS] Invalid phone number for order:', order.id);
    return;
  }
  
  try {
    const message = smsTemplates.shippingConfirmation(order);
    const result = await sendSms({
      to: order.customerPhone!,
      body: message,
      type: 'transactional',
      orderId: order.id,
      respectQuietHours: false, // Send immediately
    });
    
    if (result.success) {
      await markSmsSent(order.id, 'shipping');
      console.log('[SMS] Shipping confirmation sent successfully:', order.id);
    }
  } catch (error: any) {
    console.error('[SMS] Error sending shipping confirmation:', error);
  }
}

// 3. Send delivery confirmation SMS (triggered when admin marks order as delivered)
export async function sendDeliveryConfirmationSms(order: Order): Promise<void> {
  if (!isSmsConfigured()) return;
  
  // Check if already sent
  if (order.smsDeliverySent === 1) {
    console.log('[SMS] Delivery confirmation already sent for order:', order.id);
    return;
  }
  
  // Check opt-in and phone validity
  if (!hasOrderUpdatesOptIn(order)) {
    console.log('[SMS] Customer has not opted in for order updates:', order.id);
    return;
  }
  
  if (!isValidPhoneNumber(order.customerPhone)) {
    console.log('[SMS] Invalid phone number for order:', order.id);
    return;
  }
  
  try {
    const message = smsTemplates.deliveryConfirmation(order);
    const result = await sendSms({
      to: order.customerPhone!,
      body: message,
      type: 'transactional',
      orderId: order.id,
      respectQuietHours: false, // Send immediately
    });
    
    if (result.success) {
      await markSmsSent(order.id, 'delivery');
      
      // Schedule thank you and review SMS
      const now = new Date();
      const thankYouDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days later
      const reviewDate = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days later
      
      await storage.updateOrder(order.id, {
        smsThankYouScheduledFor: thankYouDate,
        smsReviewScheduledFor: reviewDate,
      });
      
      console.log('[SMS] Delivery confirmation sent and follow-ups scheduled:', order.id);
    }
  } catch (error: any) {
    console.error('[SMS] Error sending delivery confirmation:', error);
  }
}

// 4. Send order problem SMS (triggered when there's an issue)
export async function sendOrderProblemSms(order: Order, issue: string = 'issue'): Promise<void> {
  if (!isSmsConfigured()) return;
  
  // Don't spam with problem messages
  if (order.smsProblemSent === 1) {
    console.log('[SMS] Problem SMS already sent for order:', order.id);
    return;
  }
  
  // Check opt-in and phone validity
  if (!hasOrderUpdatesOptIn(order)) {
    return;
  }
  
  if (!isValidPhoneNumber(order.customerPhone)) {
    return;
  }
  
  try {
    const message = smsTemplates.orderProblem(order, issue);
    const result = await sendSms({
      to: order.customerPhone!,
      body: message,
      type: 'transactional',
      orderId: order.id,
      respectQuietHours: false, // Send immediately for problems
    });
    
    if (result.success) {
      await markSmsSent(order.id, 'problem');
      console.log('[SMS] Problem notification sent:', order.id);
    }
  } catch (error: any) {
    console.error('[SMS] Error sending problem notification:', error);
  }
}

// 5. Send thank you story SMS (scheduled 1-2 days after delivery)
export async function sendThankYouStorySms(order: Order): Promise<void> {
  if (!isSmsConfigured()) return;
  
  // Check if already sent
  if (order.smsThankYouSent === 1) {
    return;
  }
  
  // Check opt-in (marketing message, requires marketing opt-in)
  if (!hasMarketingOptIn(order)) {
    console.log('[SMS] Customer has not opted in for marketing:', order.id);
    return;
  }
  
  if (!isValidPhoneNumber(order.customerPhone)) {
    return;
  }
  
  try {
    const message = smsTemplates.thankYouStory(order);
    const result = await sendSms({
      to: order.customerPhone!,
      body: message,
      type: 'marketing',
      orderId: order.id,
      respectQuietHours: true, // Respect quiet hours for marketing
    });
    
    if (result.success) {
      await markSmsSent(order.id, 'thankYou');
      console.log('[SMS] Thank you story sent:', order.id);
    }
  } catch (error: any) {
    console.error('[SMS] Error sending thank you story:', error);
  }
}

// 6. Send review request SMS (scheduled 5-7 days after delivery)
export async function sendReviewRequestSms(order: Order): Promise<void> {
  if (!isSmsConfigured()) return;
  
  // Check if already sent
  if (order.smsReviewSent === 1) {
    return;
  }
  
  // Check opt-in (marketing message, requires marketing opt-in)
  if (!hasMarketingOptIn(order)) {
    console.log('[SMS] Customer has not opted in for marketing:', order.id);
    return;
  }
  
  if (!isValidPhoneNumber(order.customerPhone)) {
    return;
  }
  
  try {
    const message = smsTemplates.reviewRequest(order);
    const result = await sendSms({
      to: order.customerPhone!,
      body: message,
      type: 'marketing',
      orderId: order.id,
      respectQuietHours: true, // Respect quiet hours for marketing
    });
    
    if (result.success) {
      await markSmsSent(order.id, 'review');
      console.log('[SMS] Review request sent:', order.id);
    }
  } catch (error: any) {
    console.error('[SMS] Error sending review request:', error);
  }
}

// 7. Send admin alert for new order
export async function sendAdminNewOrderAlert(order: Order): Promise<void> {
  if (!isSmsConfigured() || !SMS_ADMIN_ALERTS_ENABLED || !SMS_ADMIN_NUMBER) {
    return;
  }
  
  try {
    const message = smsTemplates.adminNewOrderAlert(order);
    await sendSms({
      to: SMS_ADMIN_NUMBER,
      body: message,
      type: 'admin',
      respectQuietHours: false, // Send admin alerts immediately
    });
    
    console.log('[SMS] Admin new order alert sent:', order.id);
  } catch (error: any) {
    console.error('[SMS] Error sending admin alert:', error);
  }
}

// 8. Send admin alert for high-value order
export async function sendAdminHighValueAlert(order: Order): Promise<void> {
  if (!isSmsConfigured() || !SMS_ADMIN_ALERTS_ENABLED || !SMS_ADMIN_NUMBER) {
    return;
  }
  
  // Only send if over threshold
  if (order.totalAmount < ADMIN_HIGH_VALUE_THRESHOLD) {
    return;
  }
  
  try {
    const message = smsTemplates.adminHighValueAlert(order, ADMIN_HIGH_VALUE_THRESHOLD);
    await sendSms({
      to: SMS_ADMIN_NUMBER,
      body: message,
      type: 'admin',
      respectQuietHours: false,
    });
    
    console.log('[SMS] Admin high-value alert sent:', order.id);
  } catch (error: any) {
    console.error('[SMS] Error sending admin high-value alert:', error);
  }
}

// 9. Send admin alert for problem
export async function sendAdminProblemAlert(order: Order, problem: string): Promise<void> {
  if (!isSmsConfigured() || !SMS_ADMIN_ALERTS_ENABLED || !SMS_ADMIN_NUMBER) {
    return;
  }
  
  try {
    const message = smsTemplates.adminProblemAlert(order, problem);
    await sendSms({
      to: SMS_ADMIN_NUMBER,
      body: message,
      type: 'admin',
      respectQuietHours: false,
    });
    
    console.log('[SMS] Admin problem alert sent:', order.id);
  } catch (error: any) {
    console.error('[SMS] Error sending admin problem alert:', error);
  }
}

// Process scheduled SMS messages (called by cron job)
export async function processScheduledSms(): Promise<void> {
  if (!isSmsConfigured()) {
    console.log('[SMS] SMS not configured, skipping scheduled processing');
    return;
  }
  
  try {
    const orders = await storage.getAllOrders();
    const now = new Date();
    
    for (const order of orders) {
      // Process thank you SMS (1-2 days after delivery)
      if (
        order.smsThankYouScheduledFor &&
        new Date(order.smsThankYouScheduledFor) <= now &&
        order.smsThankYouSent === 0
      ) {
        await sendThankYouStorySms(order);
      }
      
      // Process review request SMS (5-7 days after delivery)
      if (
        order.smsReviewScheduledFor &&
        new Date(order.smsReviewScheduledFor) <= now &&
        order.smsReviewSent === 0
      ) {
        await sendReviewRequestSms(order);
      }
    }
    
    console.log('[SMS] Scheduled SMS processing complete');
  } catch (error: any) {
    console.error('[SMS] Error processing scheduled SMS:', error);
  }
}

export const smsTriggers = {
  sendOrderConfirmationSms,
  sendShippingConfirmationSms,
  sendDeliveryConfirmationSms,
  sendOrderProblemSms,
  sendThankYouStorySms,
  sendReviewRequestSms,
  sendAdminNewOrderAlert,
  sendAdminHighValueAlert,
  sendAdminProblemAlert,
  processScheduledSms,
};
