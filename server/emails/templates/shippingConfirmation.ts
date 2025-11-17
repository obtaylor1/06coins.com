import type { Order } from '@shared/schema';

export function shippingConfirmationTemplate(order: Order): { html: string; text: string } {
  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const trackingNumber = order.trackingNumber || 'Processing...';
  const carrier = order.carrier || 'USPS';
  
  // Generate tracking URL based on carrier
  let trackingUrl = '';
  if (order.trackingNumber) {
    if (carrier.toLowerCase().includes('usps')) {
      trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
    } else if (carrier.toLowerCase().includes('ups')) {
      trackingUrl = `https://www.ups.com/track?tracknum=${order.trackingNumber}`;
    } else if (carrier.toLowerCase().includes('fedex')) {
      trackingUrl = `https://www.fedex.com/fedextrack/?tracknumbers=${order.trackingNumber}`;
    }
  }

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
                YOUR ORDER IS ON THE WAY
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
                Great news! Your Alpha Phi Alpha 120th Anniversary commemorative coins have been shipped and are on their way to you.
              </p>

              <!-- Tracking Information -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      Shipping Information
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 15px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Carrier:</strong> ${carrier}
                    </p>
                    <p style="margin: 0 0 15px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Tracking Number:</strong> ${trackingNumber}
                    </p>
                    ${trackingUrl ? `
                    <p style="margin: 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Track Your Package:</strong><br>
                      <a href="${trackingUrl}" style="color: #C8A856; text-decoration: underline; word-break: break-all;">
                        ${trackingUrl}
                      </a>
                    </p>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              ${trackingUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" style="display: inline-block; padding: 15px 40px; background-color: #C8A856; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Track Your Package
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Your commemorative coins are carefully packaged to ensure they arrive in pristine condition. Estimated delivery is typically 3-7 business days.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                If you have any questions, please don't hesitate to contact us at 
                <a href="mailto:orders@06coins.com" style="color: #C8A856; text-decoration: none;">orders@06coins.com</a>
              </p>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center; font-style: italic;">
                Thank you for honoring 120 years of brotherhood and excellence.
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
YOUR ORDER IS ON THE WAY
Order #${orderNumber}

Dear ${order.customerName || 'Valued Customer'},

Great news! Your Alpha Phi Alpha 120th Anniversary commemorative coins have been shipped and are on their way to you.

SHIPPING INFORMATION
--------------------
Carrier: ${carrier}
Tracking Number: ${trackingNumber}
${trackingUrl ? `Track Your Package: ${trackingUrl}` : ''}

Your commemorative coins are carefully packaged to ensure they arrive in pristine condition. Estimated delivery is typically 3-7 business days.

If you have any questions, please don't hesitate to contact us at orders@06coins.com

Thank you for honoring 120 years of brotherhood and excellence.

---
Alpha Phi Alpha 120th Anniversary Commemorative Coin
06coins.com
© 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
  `.trim();

  return { html, text };
}
