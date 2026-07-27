import nodemailer from 'nodemailer';
import type { Order } from '@shared/schema';
import { storage } from '../storage.js';
import { 
  orderConfirmationTemplate,
  shippingConfirmationTemplate,
  deliveryConfirmationTemplate,
  thankYouStoryTemplate,
  reviewRequestTemplate,
  inquiryReceivedTemplate
} from '../emails/templates/index.js';

// Email configuration from environment variables
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Alpha Phi Alpha Coin Shop <orders@06coins.com>',
  contactTo: process.env.CONTACT_TO_EMAIL || 'support@06coins.com',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  // Check if SMTP is configured
  if (!EMAIL_CONFIG.smtp.host || !EMAIL_CONFIG.smtp.auth.user || !EMAIL_CONFIG.smtp.auth.pass) {
    console.warn('[EMAIL] SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS environment variables.');
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);
  }
  return transporter;
}

// Core email sending utility
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

async function sendEmail({ to, subject, html, text }: SendEmailParams): Promise<boolean> {
  const transport = getTransporter();
  
  if (!transport) {
    console.error('[EMAIL] Cannot send email - SMTP not configured');
    return false;
  }

  try {
    const info = await transport.sendMail({
      from: EMAIL_CONFIG.from,
      to,
      subject,
      html,
      text,
    });

    console.log(`[EMAIL] ✓ Sent "${subject}" to ${to} (Message ID: ${info.messageId})`);
    return true;
  } catch (error: any) {
    console.error(`[EMAIL] ✗ Failed to send "${subject}" to ${to}:`, error.message);
    return false;
  }
}

// Email service functions for each type

export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.warn(`[EMAIL] Cannot send order confirmation - no email for order ${order.id}`);
    return false;
  }

  // Check if already sent
  if (order.emailConfirmationSent) {
    console.log(`[EMAIL] Order confirmation already sent for order ${order.id}`);
    return true;
  }

  const { html, text } = orderConfirmationTemplate(order);
  const subject = `Order Confirmed – Alpha Phi Alpha 120-Year Commemorative Coins (Order #${order.id.substring(0, 8).toUpperCase()})`;

  const sent = await sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
  });

  if (sent) {
    await storage.markEmailSent(order.id, 'confirmation');
    console.log(`[EMAIL] ✓ Order confirmation sent and marked for order ${order.id}`);
  }

  return sent;
}

export async function sendShippingConfirmationEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.warn(`[EMAIL] Cannot send shipping confirmation - no email for order ${order.id}`);
    return false;
  }

  // Check if already sent
  if (order.emailShippingSent) {
    console.log(`[EMAIL] Shipping confirmation already sent for order ${order.id}`);
    return true;
  }

  const { html, text } = shippingConfirmationTemplate(order);
  const subject = `Your Order is on the Way – Alpha Phi Alpha Commemorative Coins (Order #${order.id.substring(0, 8).toUpperCase()})`;

  const sent = await sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
  });

  if (sent) {
    await storage.markEmailSent(order.id, 'shipping');
    console.log(`[EMAIL] ✓ Shipping confirmation sent and marked for order ${order.id}`);
  }

  return sent;
}

export async function sendDeliveryConfirmationEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.warn(`[EMAIL] Cannot send delivery confirmation - no email for order ${order.id}`);
    return false;
  }

  // Check if already sent
  if (order.emailDeliverySent) {
    console.log(`[EMAIL] Delivery confirmation already sent for order ${order.id}`);
    return true;
  }

  const { html, text } = deliveryConfirmationTemplate(order);
  const subject = `Delivered – Your Alpha Phi Alpha Commemorative Coins`;

  const sent = await sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
  });

  if (sent) {
    await storage.markEmailSent(order.id, 'delivery');
    
    // Schedule thank you email for 1-2 days from now (36 hours)
    const thankYouDate = new Date();
    thankYouDate.setHours(thankYouDate.getHours() + 36);
    
    // Schedule review request email for 5-7 days from now (6 days = 144 hours)
    const reviewDate = new Date();
    reviewDate.setHours(reviewDate.getHours() + 144);
    
    await storage.updateOrder(order.id, {
      emailThankYouScheduledFor: thankYouDate,
      emailReviewScheduledFor: reviewDate,
    });
    
    console.log(`[EMAIL] ✓ Delivery confirmation sent and follow-up emails scheduled for order ${order.id}`);
  }

  return sent;
}

export async function sendThankYouStoryEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.warn(`[EMAIL] Cannot send thank you email - no email for order ${order.id}`);
    return false;
  }

  // Check if already sent
  if (order.emailThankYouSent) {
    console.log(`[EMAIL] Thank you email already sent for order ${order.id}`);
    return true;
  }

  const { html, text } = thankYouStoryTemplate(order);
  const subject = `Thank You for Honoring 120 Years of Alpha Phi Alpha`;

  const sent = await sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
  });

  if (sent) {
    await storage.markEmailSent(order.id, 'thankYou');
    console.log(`[EMAIL] ✓ Thank you email sent and marked for order ${order.id}`);
  }

  return sent;
}

export async function sendReviewRequestEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.warn(`[EMAIL] Cannot send review request - no email for order ${order.id}`);
    return false;
  }

  // Check if already sent
  if (order.emailReviewSent) {
    console.log(`[EMAIL] Review request already sent for order ${order.id}`);
    return true;
  }

  const { html, text } = reviewRequestTemplate(order);
  const subject = `How Do You Like Your Commemorative Coin? Leave a Review.`;

  const sent = await sendEmail({
    to: order.customerEmail,
    subject,
    html,
    text,
  });

  if (sent) {
    await storage.markEmailSent(order.id, 'review');
    console.log(`[EMAIL] ✓ Review request sent and marked for order ${order.id}`);
  }

  return sent;
}

interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  chapter?: string;
  subject: string;
  message: string;
  inquiryType?: string;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]!);
}

export async function sendInquiryReceivedEmail(submission: ContactSubmission): Promise<boolean> {
  const { html, text } = inquiryReceivedTemplate(submission);
  const subject = `We've Received Your Message – Alpha Phi Alpha Coin Campaign`;

  const sent = await sendEmail({
    to: submission.email,
    subject,
    html,
    text,
  });

  if (sent) {
    console.log(`[EMAIL] ✓ Inquiry auto-reply sent to ${submission.email}`);
  }

  return sent;
}

export async function sendInternalContactNotification(submission: ContactSubmission): Promise<boolean> {
  const subject = `New Contact Form Submission: ${submission.subject.replace(/[\r\n]/g, ' ')}`;
  const safe = {
    name: escapeHtml(submission.name),
    email: escapeHtml(submission.email),
    phone: submission.phone ? escapeHtml(submission.phone) : '',
    chapter: submission.chapter ? escapeHtml(submission.chapter) : '',
    inquiryType: escapeHtml(submission.inquiryType || 'general'),
    subject: escapeHtml(submission.subject),
    message: escapeHtml(submission.message).replace(/\n/g, '<br>'),
  };
  
  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>From:</strong> ${safe.name} (${safe.email})</p>
    ${safe.phone ? `<p><strong>Phone:</strong> ${safe.phone}</p>` : ''}
    ${safe.chapter ? `<p><strong>Chapter:</strong> ${safe.chapter}</p>` : ''}
    <p><strong>Inquiry Type:</strong> ${safe.inquiryType}</p>
    <p><strong>Subject:</strong> ${safe.subject}</p>
    <p><strong>Message:</strong></p>
    <p>${safe.message}</p>
  `;

  const text = `
New Contact Form Submission

From: ${submission.name} (${submission.email})
${submission.phone ? `Phone: ${submission.phone}` : ''}
${submission.chapter ? `Chapter: ${submission.chapter}` : ''}
Inquiry Type: ${submission.inquiryType || 'general'}
Subject: ${submission.subject}

Message:
${submission.message}
  `;

  const sent = await sendEmail({
    to: EMAIL_CONFIG.contactTo,
    subject,
    html,
    text,
  });

  if (sent) {
    console.log(`[EMAIL] ✓ Internal notification sent to ${EMAIL_CONFIG.contactTo}`);
  }

  return sent;
}

// Scheduled email processor - to be called periodically (e.g., every 5 minutes via cron)
export async function processScheduledEmails(): Promise<void> {
  console.log('[EMAIL] Processing scheduled emails...');
  
  const orders = await storage.getOrdersNeedingScheduledEmails();
  
  if (orders.length === 0) {
    console.log('[EMAIL] No scheduled emails to send');
    return;
  }

  console.log(`[EMAIL] Found ${orders.length} scheduled emails to send`);

  for (const order of orders) {
    try {
      // Check if thank you email is due
      if (order.emailThankYouScheduledFor && 
          order.emailThankYouScheduledFor <= new Date() && 
          !order.emailThankYouSent) {
        await sendThankYouStoryEmail(order);
      }

      // Check if review request email is due
      if (order.emailReviewScheduledFor && 
          order.emailReviewScheduledFor <= new Date() && 
          !order.emailReviewSent) {
        await sendReviewRequestEmail(order);
      }
    } catch (error: any) {
      console.error(`[EMAIL] Error processing scheduled emails for order ${order.id}:`, error.message);
    }
  }

  console.log('[EMAIL] Finished processing scheduled emails');
}
