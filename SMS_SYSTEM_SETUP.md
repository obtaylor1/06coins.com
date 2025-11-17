# SMS System Setup Guide

## Overview

The Alpha Phi Alpha Coin Shop includes a comprehensive SMS notification system powered by Twilio. This system sends transactional order updates and marketing messages to customers who opt in during checkout.

## Features

### Customer Features
- **Order Confirmation SMS**: Sent immediately after successful payment
- **Shipping Notification SMS**: Sent when admin marks order as shipped (includes tracking number)
- **Delivery Confirmation SMS**: Sent when admin marks order as delivered
- **Thank You Story SMS**: Sent 1-2 days after delivery (marketing opt-in required)
- **Review Request SMS**: Sent 5-7 days after delivery (marketing opt-in required)
- **Opt-Out Support**: Customers can reply STOP to any message to unsubscribe

### Admin Features
- **New Order Alerts**: SMS notification for all new orders
- **High-Value Order Alerts**: SMS for orders over $300 (configurable)
- **Problem Alerts**: SMS when issues occur with orders
- **SMS Logs**: Track all SMS messages sent per order in admin dashboard

### Safety & Compliance Features
- **Double Opt-In System**: Separate opt-ins for order updates vs. marketing messages
- **Quiet Hours**: No marketing SMS sent between 9 PM - 9 AM (configurable)
- **Rate Limiting**: Maximum 3 SMS per order per day (prevents spam)
- **Automatic Opt-Out Handling**: Webhook processes STOP/UNSUBSCRIBE keywords
- **E.164 Phone Format**: Automatic phone number validation and formatting
- **Comprehensive Logging**: All SMS tracked in database with timestamps and status
- **Error Handling**: Failed messages logged, don't block order processing

## Environment Variables

### Required (Twilio)
```bash
# Enable/disable SMS system
SMS_ENABLED=true

# Twilio credentials (from https://console.twilio.com)
SMS_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Alternative
SMS_AUTH_TOKEN=your_twilio_auth_token
TWILIO_AUTH_TOKEN=your_twilio_auth_token  # Alternative

# Twilio phone number (must be in E.164 format: +1XXXXXXXXXX)
SMS_FROM_NUMBER=+11234567890
TWILIO_PHONE_NUMBER=+11234567890  # Alternative
```

### Optional (Admin Alerts)
```bash
# Admin SMS alerts
SMS_ADMIN_ALERTS_ENABLED=true
SMS_ADMIN_NUMBER=+11234567890  # Your admin phone number
TWILIO_ADMIN_PHONE_NUMBER=+11234567890  # Alternative

# High-value alert threshold (in cents)
SMS_ADMIN_HIGH_VALUE_THRESHOLD=30000  # $300
```

### Optional (Customization)
```bash
# Quiet hours (24-hour format, no marketing SMS during these hours)
SMS_QUIET_HOURS_START=21:00  # 9 PM
SMS_QUIET_HOURS_END=08:00    # 8 AM

# Rate limiting (max SMS per order per day)
SMS_MAX_PER_ORDER_PER_DAY=3

# SMS provider (currently only Twilio supported)
SMS_PROVIDER=twilio
```

## Twilio Account Setup

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free trial account
3. Complete phone verification

### 2. Get Your Credentials
1. Log in to Twilio Console: https://console.twilio.com
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Copy these to your environment variables

### 3. Get a Phone Number
1. In Twilio Console, go to Phone Numbers → Manage → Buy a number
2. Select your country and search for available numbers
3. Purchase a number (free trial accounts get one free number)
4. Copy the number in E.164 format (e.g., +11234567890)
5. Add to `SMS_FROM_NUMBER` environment variable

### 4. Configure Messaging
1. Go to Phone Numbers → Manage → Active numbers
2. Click on your phone number
3. Scroll to "Messaging Configuration"
4. Under "A MESSAGE COMES IN", select "Webhook"
5. Enter your webhook URL:
   ```
   https://your-domain.repl.co/api/webhooks/sms
   ```
   Or for production:
   ```
   https://06coins.com/api/webhooks/sms
   ```
6. Set HTTP method to **POST**
7. Click Save

## Installation on Replit

### 1. Install Twilio SDK
The Twilio SDK is already included in package.json, but if you need to reinstall:
```bash
npm install twilio
```

### 2. Set Environment Variables
1. In Replit, click on "Secrets" (🔒 icon in left sidebar)
2. Add each environment variable listed above
3. Click "Add new secret" for each one

### 3. Restart Application
After setting environment variables:
```bash
# Workflow will auto-restart
# Or manually restart if needed
npm run dev
```

## Testing the SMS System

### Test Order Confirmation
1. Complete a test purchase with a valid phone number
2. Check both opt-in boxes during checkout
3. Submit payment
4. You should receive order confirmation SMS immediately

### Test Shipping Notification
1. Log in to admin dashboard (`/admin`)
2. Find your test order
3. Click "Mark as Shipped"
4. Enter tracking number and carrier
5. Submit - you should receive shipping confirmation SMS

### Test Delivery Notification
1. In admin dashboard, find shipped order
2. Click "Mark as Delivered"
3. Submit - you should receive delivery confirmation SMS
4. Thank you and review SMS will be scheduled for future delivery

### Test Opt-Out
1. Reply to any SMS with "STOP"
2. Check admin dashboard - order should show opted out
3. Future SMS will not be sent to that number

### Test Admin Alerts (if enabled)
1. Make sure `SMS_ADMIN_ALERTS_ENABLED=true` and `SMS_ADMIN_NUMBER` is set
2. Place a new order
3. Admin phone should receive new order alert
4. Place an order over $300
5. Admin phone should receive high-value alert

## Scheduled SMS Processing

The system includes scheduled follow-up messages (thank you story, review requests) that are sent after delivery. These require a cron job to process.

### Manual Processing
To manually process scheduled SMS, make an authenticated request to:
```bash
curl -X POST https://your-domain.repl.co/api/admin/process-scheduled-sms \
  -H "Cookie: connect.sid=YOUR_SESSION_COOKIE"
```

### Automated Cron Setup (Recommended)

**Option 1: Replit Scheduled Runs**
1. In Replit, go to your Repl settings
2. Under "Scheduled Runs", click "Add Job"
3. Set schedule: `0 */6 * * *` (every 6 hours)
4. Command: `curl -X POST http://localhost:5000/api/admin/process-scheduled-sms -H "Authorization: Bearer ADMIN_TOKEN"`

**Option 2: External Cron Service (e.g., cron-job.org)**
1. Sign up at https://cron-job.org
2. Create new cron job
3. URL: `https://06coins.com/api/admin/process-scheduled-sms`
4. Schedule: Every 6 hours
5. Add basic auth or session cookie

**Option 3: GitHub Actions**
Create `.github/workflows/scheduled-sms.yml`:
```yaml
name: Process Scheduled SMS
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  process-sms:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger SMS Processing
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/admin/process-scheduled-sms \
            -H "Authorization: Bearer ${{ secrets.ADMIN_TOKEN }}"
```

## SMS Flow Reference

### Transactional SMS (Requires Order Updates Opt-In)
```
Order Placed
    ↓
Order Confirmation SMS (immediate)
    ↓
Order Shipped (admin action)
    ↓
Shipping Confirmation SMS (immediate)
    ↓
Order Delivered (admin action)
    ↓
Delivery Confirmation SMS (immediate)
```

### Marketing SMS (Requires Marketing Opt-In + Respects Quiet Hours)
```
Order Delivered
    ↓
Thank You Story SMS (scheduled 1-2 days later)
    ↓
Review Request SMS (scheduled 5-7 days after delivery)
```

### Admin SMS (Always Sent if Enabled)
```
New Order → Admin New Order Alert
High-Value Order ($300+) → Admin High-Value Alert
Problem Detected → Admin Problem Alert
```

## Database Schema

The SMS system adds the following fields to the `orders` table:

```typescript
// Customer contact
customerPhone: text("customer_phone")

// Opt-in preferences
smsOrderUpdatesOptIn: integer("sms_order_updates_opt_in").default(0).notNull()
smsMarketingOptIn: integer("sms_marketing_opt_in").default(0).notNull()
smsOptedOutAt: timestamp("sms_opted_out_at")

// SMS tracking flags (prevent duplicates)
smsConfirmationSent: integer("sms_confirmation_sent").default(0).notNull()
smsShippingSent: integer("sms_shipping_sent").default(0).notNull()
smsDeliverySent: integer("sms_delivery_sent").default(0).notNull()
smsThankYouSent: integer("sms_thank_you_sent").default(0).notNull()
smsReviewSent: integer("sms_review_sent").default(0).notNull()
smsProblemSent: integer("sms_problem_sent").default(0).notNull()

// Scheduled SMS timestamps
smsThankYouScheduledFor: timestamp("sms_thank_you_scheduled_for")
smsReviewScheduledFor: timestamp("sms_review_scheduled_for")

// Rate limiting
smsSentToday: integer("sms_sent_today").default(0).notNull()
smsLastSentDate: text("sms_last_sent_date")

// Error tracking
smsError: integer("sms_error").default(0).notNull()
smsLog: jsonb("sms_log")  // Array of {type, timestamp, status, error}
```

## Troubleshooting

### SMS Not Sending

**Check 1: Environment Variables**
```bash
# Verify all required variables are set
echo $SMS_ENABLED  # Should be "true"
echo $SMS_ACCOUNT_SID  # Should start with "AC"
echo $SMS_FROM_NUMBER  # Should be in E.164 format (+1...)
```

**Check 2: Twilio Console**
1. Go to https://console.twilio.com/us1/monitor/logs/sms
2. Check for recent message attempts
3. Look for error codes (see Twilio Error Codes below)

**Check 3: Server Logs**
```bash
# Look for SMS-related logs
grep -i "sms" /tmp/logs/*.log
```

**Check 4: Database**
```sql
-- Check if SMS preferences are set
SELECT 
  id, 
  customer_phone, 
  sms_order_updates_opt_in,
  sms_marketing_opt_in,
  sms_log
FROM orders 
WHERE customer_phone IS NOT NULL;
```

### Common Twilio Error Codes

- **21211**: Invalid 'To' phone number → Check E.164 format
- **21608**: Number not reachable → Customer's phone is off/blocked
- **21610**: Message blocked by carrier → Carrier spam filter
- **30007**: Message filtered → Twilio spam filter
- **30008**: Unknown destination → Invalid number
- **21614**: Invalid number → Not a mobile number

### Opt-Out Not Working

**Check 1: Webhook URL**
1. Verify webhook is configured in Twilio Console
2. Test webhook endpoint:
   ```bash
   curl -X POST https://your-domain.repl.co/api/webhooks/sms \
     -d "From=+11234567890&Body=STOP"
   ```

**Check 2: Database**
```sql
-- Verify opt-out was recorded
SELECT 
  customer_phone,
  sms_order_updates_opt_in,
  sms_marketing_opt_in,
  sms_opted_out_at
FROM orders
WHERE customer_phone = '+11234567890';
```

### Rate Limiting Issues

If customers report not receiving SMS:
1. Check `smsSentToday` counter in database
2. Increase `SMS_MAX_PER_ORDER_PER_DAY` if needed
3. Check if `smsLastSentDate` needs reset

### Quiet Hours Issues

If marketing SMS sent during quiet hours:
1. Verify `SMS_QUIET_HOURS_START` and `SMS_QUIET_HOURS_END`
2. Check server timezone settings
3. Review `isQuietHours()` function in `smsService.ts`

## Cost Management

### Twilio Pricing (as of 2024)
- **SMS (US/Canada)**: $0.0079 per message
- **SMS (International)**: Varies by country ($0.01 - $0.15)
- **Trial Account**: $15.50 credit (enough for ~1,900 US SMS)

### Cost Estimation
For 1000 orders with full opt-in:
- Order confirmations: 1000 × $0.0079 = $7.90
- Shipping notifications: 1000 × $0.0079 = $7.90
- Delivery notifications: 1000 × $0.0079 = $7.90
- Thank you messages: 1000 × $0.0079 = $7.90
- Review requests: 1000 × $0.0079 = $7.90
- **Total**: ~$39.50 for 5000 SMS

### Cost Reduction Strategies
1. **Email First**: Use SMS only for critical updates, email for marketing
2. **Opt-In Only**: Require explicit opt-in (already implemented)
3. **Rate Limiting**: Limit messages per customer (already implemented)
4. **Consolidate**: Combine multiple updates into single message
5. **Monitor Usage**: Check Twilio Console regularly

## Production Checklist

Before going live with SMS:

- [ ] Twilio account fully verified (not trial)
- [ ] Production phone number purchased
- [ ] All environment variables set in production
- [ ] Webhook URL updated to production domain (06coins.com)
- [ ] SMS opt-in checkboxes tested on checkout page
- [ ] Test all SMS flows (order, shipping, delivery)
- [ ] Test opt-out flow (reply STOP)
- [ ] Verify admin alerts work
- [ ] Set up cron job for scheduled SMS
- [ ] Monitor first week of production usage
- [ ] Budget alert set in Twilio Console

## Support

For issues or questions:
- **Twilio Support**: https://support.twilio.com
- **Twilio Docs**: https://www.twilio.com/docs/sms
- **Error Codes**: https://www.twilio.com/docs/api/errors

## Architecture Files

### Backend
- `server/services/smsService.ts` - Core SMS sending logic, validation, rate limiting
- `server/services/smsTemplates.ts` - All SMS message templates
- `server/services/smsTriggers.ts` - SMS trigger functions for order lifecycle
- `server/routes.ts` - API endpoints (decrement, admin actions, webhooks)

### Frontend
- `client/src/pages/checkout.tsx` - Phone input and opt-in checkboxes

### Database
- `shared/schema.ts` - Order schema with SMS fields
- `server/storage.ts` - Database operations

### Documentation
- `SMS_SYSTEM_SETUP.md` (this file) - Complete setup guide
- `replit.md` - Project overview with SMS system notes
