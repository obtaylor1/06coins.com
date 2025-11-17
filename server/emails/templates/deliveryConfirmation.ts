import type { Order } from '@shared/schema';

export function deliveryConfirmationTemplate(order: Order): { html: string; text: string } {
  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const deliveryDate = order.deliveredAt 
    ? new Date(order.deliveredAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

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
              <h1 style="margin: 0; color: #C8A856; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                YOUR ORDER HAS BEEN DELIVERED
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px;">
                Order #${orderNumber}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Dear ${order.customerName || 'Valued Customer'},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Your Alpha Phi Alpha 120th Anniversary commemorative coins have been delivered on <strong style="color: #C8A856;">${deliveryDate}</strong>.
              </p>

              <!-- Delivery Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      Delivery Confirmation
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Delivery Date:</strong> ${deliveryDate}
                    </p>
                    <p style="margin: 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Order Number:</strong> #${orderNumber}
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Please inspect your package carefully. If you notice any damage or if items are missing, please contact us immediately at 
                <a href="mailto:support@06coins.com" style="color: #C8A856; text-decoration: none;">support@06coins.com</a>
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                We hope you enjoy your commemorative coins! These limited-edition pieces represent 120 years of excellence, leadership, and brotherhood.
              </p>

              <!-- Important Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border-left: 4px solid #C8A856; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #C8A856; font-weight: bold;">
                      Didn't receive your package?
                    </p>
                    <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                      Sometimes packages are left in a secure location or with a neighbor. Please check around your delivery area. If you still can't locate it, contact us right away.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://06coins.com/shop-coins" style="display: inline-block; padding: 15px 40px; background-color: #C8A856; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Shop More Coins
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Thank you for supporting Alpha Phi Alpha Fraternity, Inc.
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
YOUR ORDER HAS BEEN DELIVERED
Order #${orderNumber}

Dear ${order.customerName || 'Valued Customer'},

Your Alpha Phi Alpha 120th Anniversary commemorative coins have been delivered on ${deliveryDate}.

DELIVERY CONFIRMATION
---------------------
Delivery Date: ${deliveryDate}
Order Number: #${orderNumber}

Please inspect your package carefully. If you notice any damage or if items are missing, please contact us immediately at support@06coins.com

We hope you enjoy your commemorative coins! These limited-edition pieces represent 120 years of excellence, leadership, and brotherhood.

DIDN'T RECEIVE YOUR PACKAGE?
Sometimes packages are left in a secure location or with a neighbor. Please check around your delivery area. If you still can't locate it, contact us right away.

Shop more coins: https://06coins.com/shop-coins

Thank you for supporting Alpha Phi Alpha Fraternity, Inc.

---
Alpha Phi Alpha 120th Anniversary Commemorative Coin
06coins.com
© 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
  `.trim();

  return { html, text };
}
