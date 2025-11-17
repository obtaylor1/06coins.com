import type { Order } from '@shared/schema';

export function orderConfirmationTemplate(order: Order): { html: string; text: string } {
  const orderNumber = order.id.substring(0, 8).toUpperCase();
  const formattedTotal = (order.totalAmount / 100).toFixed(2);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Parse cart items or use legacy quantity
  let itemsList = '';
  let textItemsList = '';
  
  if (order.cartItems && Array.isArray(order.cartItems)) {
    const items = order.cartItems as Array<{ id: string; name: string; quantity: number; price: number }>;
    itemsList = items
      .map(
        item => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #333;">
              <strong>${item.name}</strong>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">
              $${(item.price / 100).toFixed(2)}
            </td>
          </tr>
        `
      )
      .join('');
    
    textItemsList = items
      .map(item => `  - ${item.name} (Qty: ${item.quantity}) - $${(item.price / 100).toFixed(2)}`)
      .join('\n');
  } else {
    // Legacy format
    itemsList = `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #333;">
          <strong>120-Year Anniversary Commemorative Coin</strong>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #333; text-align: center;">
          ${order.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right;">
          $${formattedTotal}
        </td>
      </tr>
    `;
    
    textItemsList = `  - 120-Year Anniversary Commemorative Coin (Qty: ${order.quantity}) - $${formattedTotal}`;
  }

  // Format shipping address
  let shippingAddressHtml = '';
  let shippingAddressText = '';
  
  if (order.shippingAddress && typeof order.shippingAddress === 'object') {
    const addr = order.shippingAddress as any;
    shippingAddressHtml = `
      ${order.customerName || ''}<br>
      ${addr.line1 || ''}<br>
      ${addr.line2 ? `${addr.line2}<br>` : ''}
      ${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}<br>
      ${addr.country || ''}
    `;
    
    shippingAddressText = `
${order.customerName || ''}
${addr.line1 || ''}
${addr.line2 ? `${addr.line2}\n` : ''}${addr.city || ''}, ${addr.state || ''} ${addr.postal_code || ''}
${addr.country || ''}
    `.trim();
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
                ORDER CONFIRMED
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px;">
                Alpha Phi Alpha 120th Anniversary
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
                Thank you for your order! We're honored that you've chosen to commemorate 120 years of Alpha Phi Alpha Fraternity, Inc. with this exclusive collector's edition.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Your order has been successfully received and is being prepared for shipment.
              </p>

              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      Order Details
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Order Number:</strong> #${orderNumber}
                    </p>
                    <p style="margin: 0 0 10px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Order Date:</strong> ${orderDate}
                    </p>
                    <p style="margin: 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Order Total:</strong> $${formattedTotal} USD
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Items Ordered -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td colspan="3" style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      Items Ordered
                    </h2>
                  </td>
                </tr>
                <tr style="background-color: #0a0a0a;">
                  <td style="padding: 12px; border-bottom: 1px solid #333; color: #C8A856; font-weight: bold;">
                    Item
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #333; color: #C8A856; font-weight: bold; text-align: center;">
                    Quantity
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #333; color: #C8A856; font-weight: bold; text-align: right;">
                    Price
                  </td>
                </tr>
                ${itemsList}
                <tr style="background-color: #0a0a0a;">
                  <td colspan="2" style="padding: 15px; border-top: 2px solid #C8A856; text-align: right; font-weight: bold; color: #C8A856;">
                    Total:
                  </td>
                  <td style="padding: 15px; border-top: 2px solid #C8A856; text-align: right; font-weight: bold; color: #C8A856; font-size: 18px;">
                    $${formattedTotal}
                  </td>
                </tr>
              </table>

              ${shippingAddressHtml ? `
              <!-- Shipping Address -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      Shipping Address
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; color: #e0e0e0; line-height: 1.6;">
                    ${shippingAddressHtml}
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                You'll receive a shipping confirmation email with tracking information once your order ships.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                If you have any questions about your order, please contact us at 
                <a href="mailto:orders@06coins.com" style="color: #C8A856; text-decoration: none;">orders@06coins.com</a>
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://06coins.com" style="display: inline-block; padding: 15px 40px; background-color: #C8A856; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      View Our Collection
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
ORDER CONFIRMED
Alpha Phi Alpha 120th Anniversary

Dear ${order.customerName || 'Valued Customer'},

Thank you for your order! We're honored that you've chosen to commemorate 120 years of Alpha Phi Alpha Fraternity, Inc. with this exclusive collector's edition.

Your order has been successfully received and is being prepared for shipment.

ORDER DETAILS
-------------
Order Number: #${orderNumber}
Order Date: ${orderDate}
Order Total: $${formattedTotal} USD

ITEMS ORDERED
-------------
${textItemsList}

Total: $${formattedTotal}

${shippingAddressText ? `
SHIPPING ADDRESS
----------------
${shippingAddressText}
` : ''}

You'll receive a shipping confirmation email with tracking information once your order ships.

If you have any questions about your order, please contact us at orders@06coins.com

Visit our collection: https://06coins.com

Thank you for supporting Alpha Phi Alpha Fraternity, Inc.

---
Alpha Phi Alpha 120th Anniversary Commemorative Coin
06coins.com
© 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
  `.trim();

  return { html, text };
}
