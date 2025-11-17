import type { Order } from '@shared/schema';

export function reviewRequestTemplate(order: Order): { html: string; text: string } {
  const orderNumber = order.id.substring(0, 8).toUpperCase();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #121212; border: 1px solid #333;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); padding: 40px 30px; text-align: center; border-bottom: 2px solid #C8A856;">
              <h1 style="margin: 0; color: #C8A856; font-size: 26px; font-weight: bold; letter-spacing: 1px;">
                HOW DO YOU LIKE YOUR COINS?
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px;">
                We'd Love to Hear From You
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Dear ${order.customerName || 'Valued Customer'},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                It's been about a week since you received your Alpha Phi Alpha 120th Anniversary commemorative coins. We hope you're enjoying them!
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Your feedback is invaluable to us and helps other Brothers and collectors make informed decisions.
              </p>

              <!-- Feedback Request -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <h2 style="margin: 0 0 15px 0; color: #C8A856; font-size: 20px; font-weight: bold;">
                      Share Your Experience
                    </h2>
                    <p style="margin: 0 0 25px 0; color: #e0e0e0; font-size: 15px; line-height: 1.6;">
                      Your honest review helps us improve and assists other Brothers in their purchasing decisions.
                    </p>
                    <a href="https://06coins.com/shop-coins" style="display: inline-block; padding: 15px 40px; background-color: #C8A856; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Leave a Review
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What We'd Like to Know -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border-left: 4px solid #C8A856; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; color: #C8A856; font-weight: bold; font-size: 16px;">
                      What We'd Like to Know:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #e0e0e0; line-height: 1.8;">
                      <li>How would you rate the quality of the coins?</li>
                      <li>Was the packaging satisfactory?</li>
                      <li>How was your overall shopping experience?</li>
                      <li>Would you recommend this to other Brothers?</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Your feedback helps us continue to deliver commemorative pieces that honor the rich legacy of Alpha Phi Alpha with the excellence our Brotherhood deserves.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.6; color: #999; font-style: italic;">
                <strong>Order #${orderNumber}</strong> — If you have any concerns or issues with your order, please contact us at 
                <a href="mailto:support@06coins.com" style="color: #C8A856; text-decoration: none;">support@06coins.com</a> and we'll be happy to help.
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Thank you for being part of the Alpha legacy.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 30px; text-align: center; border-top: 2px solid #C8A856;">
              <p style="margin: 0 0 10px 0; color: #888; font-size: 14px;">
                Alpha Phi Alpha 120th Anniversary Commemorative Coin
              </p>
              <p style="margin: 0 0 10px 0; color: #888; font-size: 14px;">
                <a href="https://06coins.com" style="color: #C8A856; text-decoration: none;">06coins.com</a>
              </p>
              <p style="margin: 0; color: #666; font-size: 12px;">
                © 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
HOW DO YOU LIKE YOUR COINS?
We'd Love to Hear From You

Dear ${order.customerName || 'Valued Customer'},

It's been about a week since you received your Alpha Phi Alpha 120th Anniversary commemorative coins. We hope you're enjoying them!

Your feedback is invaluable to us and helps other Brothers and collectors make informed decisions.

SHARE YOUR EXPERIENCE
Your honest review helps us improve and assists other Brothers in their purchasing decisions.

Leave a review: https://06coins.com/shop-coins

WHAT WE'D LIKE TO KNOW:
- How would you rate the quality of the coins?
- Was the packaging satisfactory?
- How was your overall shopping experience?
- Would you recommend this to other Brothers?

Your feedback helps us continue to deliver commemorative pieces that honor the rich legacy of Alpha Phi Alpha with the excellence our Brotherhood deserves.

Order #${orderNumber} — If you have any concerns or issues with your order, please contact us at support@06coins.com and we'll be happy to help.

Thank you for being part of the Alpha legacy.

---
Alpha Phi Alpha 120th Anniversary Commemorative Coin
06coins.com
© 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
  `.trim();

  return { html, text };
}
