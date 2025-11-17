# Email System Setup Guide

## Overview

The Alpha Phi Alpha 120th Anniversary Coin Shop includes a comprehensive transactional email system that automatically sends emails throughout the customer journey. This guide explains how to configure and use the email system.

## Email Flow

The system sends 6 types of transactional emails:

1. **Order Confirmation** - Sent immediately after successful payment
2. **Shipping Confirmation** - Sent when admin marks order as shipped (includes tracking info)
3. **Delivery Confirmation** - Sent when admin marks order as delivered
4. **Thank You Story** - Sent 1-2 days after delivery (shares fraternity heritage)
5. **Review Request** - Sent 5-7 days after delivery (requests product review)
6. **Contact Inquiry Auto-Reply** - Sent when customer submits contact form

Additionally, an internal notification is sent to `support@06coins.com` for each contact form submission.

## Required Environment Variables

Add these environment variables to your Replit Secrets:

```bash
# Email Service Configuration
SMTP_HOST=smtp.gmail.com                    # Your SMTP server host
SMTP_PORT=587                               # SMTP port (usually 587 for TLS)
SMTP_USER=your-email@gmail.com              # SMTP username (usually your email)
SMTP_PASS=your-app-password                 # SMTP password or app-specific password
EMAIL_FROM=Alpha Phi Alpha Coin Shop <orders@06coins.com>  # From address for all emails
CONTACT_TO_EMAIL=support@06coins.com        # Internal notification recipient
```

### Gmail Configuration Example

If using Gmail:

1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Create an App Password:
   - Go to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=orders@06coins.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # Your 16-character app password
EMAIL_FROM=Alpha Phi Alpha Coin Shop <orders@06coins.com>
CONTACT_TO_EMAIL=support@06coins.com
```

### Custom Domain Email Configuration

If using a custom email service (Sendgrid, Mailgun, etc.):

1. **SendGrid**:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

2. **Mailgun**:
   ```bash
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@yourdomain.com
   SMTP_PASS=your-mailgun-password
   ```

3. **AWS SES**:
   ```bash
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-ses-smtp-username
   SMTP_PASS=your-ses-smtp-password
   ```

## Email Triggers

### Automatic Triggers

1. **Order Confirmation Email**
   - Triggered by: Successful payment via `/api/inventory/decrement`
   - Sent to: Customer email from Stripe payment
   - Contains: Order details, items purchased, total amount, shipping address
   - Database flag: `emailConfirmationSent`

2. **Contact Form Auto-Reply**
   - Triggered by: Contact form submission via `/api/contact`
   - Sent to: Customer's submitted email
   - Contains: Acknowledgment of inquiry, response time estimate
   - Also sends internal notification to `support@06coins.com`

### Admin-Triggered Emails

These emails are triggered when admins update order status in the admin dashboard:

3. **Shipping Confirmation Email**
   - Triggered by: Admin marking order as "shipped" via `/api/admin/orders/:id/ship`
   - Required info: Tracking number, carrier name
   - Sent to: Customer email
   - Contains: Tracking number, carrier, estimated delivery
   - Database flag: `emailShippingSent`

4. **Delivery Confirmation Email**
   - Triggered by: Admin marking order as "delivered" via `/api/admin/orders/:id/deliver`
   - Sent to: Customer email
   - Contains: Delivery confirmation, care instructions
   - Database flag: `emailDeliverySent`

### Scheduled Emails (Cron Job)

These emails are sent on a schedule after delivery:

5. **Thank You Story Email**
   - Sent: 1-2 days after delivery
   - Processed by: `/api/admin/process-scheduled-emails` endpoint
   - Contains: Fraternity heritage story, fraternity values
   - Database flag: `emailThankYouSent`

6. **Review Request Email**
   - Sent: 5-7 days after delivery
   - Processed by: `/api/admin/process-scheduled-emails` endpoint
   - Contains: Request for product review, optional review link
   - Database flag: `emailReviewSent`

## Setting Up Scheduled Emails (Cron Job)

The scheduled emails (thank you and review request) require a cron job to run periodically.

### Option 1: Replit Scheduled Jobs (Recommended)

1. In your Replit project, go to the "Tools" panel
2. Click "Schedule a job" or use the Deployments tab
3. Set up a cron job to call the endpoint:
   ```bash
   curl -X POST https://your-repl-url.replit.dev/api/admin/process-scheduled-emails \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```
4. Schedule it to run once or twice daily (e.g., `0 */12 * * *` for every 12 hours)

### Option 2: External Cron Service

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier available)
- **GitHub Actions** (if code is on GitHub)

Example GitHub Actions workflow (`.github/workflows/scheduled-emails.yml`):

```yaml
name: Process Scheduled Emails
on:
  schedule:
    - cron: '0 */12 * * *'  # Every 12 hours

jobs:
  process-emails:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scheduled email processing
        run: |
          curl -X POST https://your-repl-url.replit.dev/api/admin/process-scheduled-emails \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}"
```

## Email Template Customization

All email templates are located in `server/emails/templates/`:

- `orderConfirmation.ts` - Order confirmation email
- `shippingConfirmation.ts` - Shipping notification
- `deliveryConfirmation.ts` - Delivery notification
- `thankYouStory.ts` - Thank you email with fraternity story
- `reviewRequest.ts` - Review request email
- `inquiryReceived.ts` - Contact form auto-reply

Each template exports:
- `getSubject(data)` - Email subject line generator
- `getHtmlContent(data)` - HTML email body
- `getTextContent(data)` - Plain text fallback

To customize, edit the template files directly. All templates use the luxury black/gold aesthetic matching the site design.

## Testing the Email System

### Test Order Confirmation Email

1. Complete a test purchase on the site
2. Check the customer email for order confirmation
3. Verify the email contains correct order details and branding

### Test Admin-Triggered Emails

1. Log in to admin dashboard at `/admin`
2. Navigate to "Orders" tab
3. Click on an order in "Processing" status
4. Click "Mark as Shipped" and enter tracking info
5. Check customer email for shipping confirmation
6. Click "Mark as Delivered"
7. Check customer email for delivery confirmation

### Test Contact Form Emails

1. Go to `/contact` page
2. Fill out and submit the contact form
3. Check:
   - Customer receives auto-reply at their email
   - `support@06coins.com` receives internal notification

### Test Scheduled Emails

Manually trigger the scheduled email processor:

```bash
curl -X POST http://localhost:5000/api/admin/process-scheduled-emails \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

Or use the admin dashboard (if you add a manual trigger button).

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**: Ensure all SMTP variables are set correctly in Replit Secrets
2. **Check logs**: Look for `[EMAIL]` prefixed messages in server logs
3. **Verify SMTP credentials**: Test login to your SMTP server separately
4. **Check email quotas**: Some providers (Gmail) have daily sending limits
5. **Review spam filters**: Check recipient spam/junk folders

### Common Error Messages

- `Error: Invalid login` - SMTP username or password is incorrect
- `Error: Connection timeout` - SMTP host or port is incorrect
- `Error: Self signed certificate` - Set `rejectUnauthorized: false` for development (not recommended for production)
- `[EMAIL] Email configuration not complete` - Environment variables are missing

### Email Tracking Flags Not Updating

If emails send but database flags don't update:

1. Check that `markEmailSent()` is called in `emailService.ts`
2. Verify database connection is working
3. Check server logs for database update errors

## Production Recommendations

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES) instead of Gmail for reliability
2. **Set up SPF, DKIM, and DMARC** records for your domain to improve deliverability
3. **Monitor bounce rates** and unsubscribe requests
4. **Implement rate limiting** to avoid hitting SMTP quotas
5. **Add email tracking** (open rates, click rates) if desired
6. **Set up email backup** (BCC all emails to an archive address)
7. **Test thoroughly** before going live

## Email Deliverability Best Practices

1. **Use a verified domain**: `orders@06coins.com` instead of `noreply@gmail.com`
2. **Include unsubscribe link**: Required for transactional emails in some jurisdictions
3. **Personalize emails**: Use customer name, order details
4. **Keep subject lines clear**: Avoid spam trigger words
5. **Provide plain text alternative**: Always include `text` version alongside `html`
6. **Test across email clients**: Gmail, Outlook, Apple Mail, mobile

## Security Considerations

1. **Never commit SMTP credentials** to the repository
2. **Use app-specific passwords** for Gmail, never your main password
3. **Enable 2FA** on all email accounts
4. **Rotate credentials** periodically
5. **Monitor for unauthorized access** to SMTP account
6. **Use TLS encryption** (port 587) for all SMTP connections

## Support

For issues with the email system:

1. Check server logs for `[EMAIL]` prefixed messages
2. Review this documentation
3. Verify all environment variables are set
4. Test SMTP credentials independently
5. Contact support@06coins.com if issues persist
