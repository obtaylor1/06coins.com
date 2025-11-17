import type { Order } from '@shared/schema';

export function thankYouStoryTemplate(order: Order): { html: string; text: string } {
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
                THANK YOU FOR HONORING
              </h1>
              <h2 style="margin: 10px 0 0 0; color: #ffffff; font-size: 22px; font-weight: normal;">
                120 Years of Alpha Phi Alpha
              </h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Dear ${order.customerName || 'Brother'},
              </p>
              
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                We hope your commemorative coins have arrived safely and that you're as thrilled with them as we are to share this piece of history with you.
              </p>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Your support helps preserve the legacy of Alpha Phi Alpha Fraternity, Inc. — the first intercollegiate Greek-letter fraternity established for African Americans.
              </p>

              <!-- The Story -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      A Legacy 120 Years in the Making
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; color: #e0e0e0; line-height: 1.8; font-size: 15px;">
                    <p style="margin: 0 0 15px 0;">
                      On December 4, 1906, seven visionary men at Cornell University founded Alpha Phi Alpha. These pioneering Brothers — known as the <strong style="color: #C8A856;">Seven Jewels</strong> — created more than a fraternity; they established a movement dedicated to scholarship, service, and social justice.
                    </p>
                    <p style="margin: 0 0 15px 0;">
                      For 120 years, Alpha Phi Alpha has been at the forefront of the Civil Rights Movement, producing leaders like Dr. Martin Luther King Jr., Thurgood Marshall, and countless others who shaped our nation's history.
                    </p>
                    <p style="margin: 0;">
                      Your commemorative coin represents this incredible journey — a tangible reminder of excellence, brotherhood, and the enduring spirit of Alpha Phi Alpha.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center; font-style: italic; color: #C8A856;">
                "First of All, Servants of All, We Shall Transcend All"
              </p>

              <!-- Share Your Experience -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border-left: 4px solid #C8A856; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #C8A856; font-weight: bold; font-size: 16px;">
                      Share Your Brotherhood
                    </p>
                    <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                      We'd love to see photos of your coins! Share them on social media and tag your chapter. Let's celebrate this milestone together.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Complete Your Collection -->
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Looking to honor all Seven Jewels? Complete your collection with our exclusive 7-piece Founders' Set featuring each of our pioneering Brothers.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="https://06coins.com/shop-coins" style="display: inline-block; padding: 15px 40px; background-color: #C8A856; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Complete Your Collection
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Thank you for being part of the Alpha Phi Alpha legacy.
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
THANK YOU FOR HONORING
120 Years of Alpha Phi Alpha

Dear ${order.customerName || 'Brother'},

We hope your commemorative coins have arrived safely and that you're as thrilled with them as we are to share this piece of history with you.

Your support helps preserve the legacy of Alpha Phi Alpha Fraternity, Inc. — the first intercollegiate Greek-letter fraternity established for African Americans.

A LEGACY 120 YEARS IN THE MAKING
---------------------------------
On December 4, 1906, seven visionary men at Cornell University founded Alpha Phi Alpha. These pioneering Brothers — known as the Seven Jewels — created more than a fraternity; they established a movement dedicated to scholarship, service, and social justice.

For 120 years, Alpha Phi Alpha has been at the forefront of the Civil Rights Movement, producing leaders like Dr. Martin Luther King Jr., Thurgood Marshall, and countless others who shaped our nation's history.

Your commemorative coin represents this incredible journey — a tangible reminder of excellence, brotherhood, and the enduring spirit of Alpha Phi Alpha.

"First of All, Servants of All, We Shall Transcend All"

SHARE YOUR BROTHERHOOD
We'd love to see photos of your coins! Share them on social media and tag your chapter. Let's celebrate this milestone together.

COMPLETE YOUR COLLECTION
Looking to honor all Seven Jewels? Complete your collection with our exclusive 7-piece Founders' Set featuring each of our pioneering Brothers.

Visit: https://06coins.com/shop-coins

Thank you for being part of the Alpha Phi Alpha legacy.

---
Alpha Phi Alpha 120th Anniversary Commemorative Coin
06coins.com
© 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
  `.trim();

  return { html, text };
}
