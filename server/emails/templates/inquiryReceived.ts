interface ContactSubmission {
  name: string;
  email: string;
  phone?: string;
  chapter?: string;
  subject: string;
  message: string;
  inquiryType?: string;
}

export function inquiryReceivedTemplate(submission: ContactSubmission): { html: string; text: string } {
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
                MESSAGE RECEIVED
              </h1>
              <p style="margin: 15px 0 0 0; color: #ffffff; font-size: 16px;">
                We'll Be In Touch Soon
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Dear ${submission.name},
              </p>
              
              <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #e0e0e0;">
                Thank you for contacting the Alpha Phi Alpha 120th Anniversary Commemorative Coin Campaign. We've received your message and will respond within <strong style="color: #C8A856;">24-48 hours</strong>.
              </p>

              <!-- Message Copy -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #333; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px; border-bottom: 2px solid #C8A856;">
                    <h2 style="margin: 0; color: #C8A856; font-size: 18px; font-weight: bold;">
                      Your Message
                    </h2>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Subject:</strong> ${submission.subject}
                    </p>
                    <p style="margin: 0 0 15px 0; color: #e0e0e0;">
                      <strong style="color: #C8A856;">Inquiry Type:</strong> ${submission.inquiryType || 'General'}
                    </p>
                    <p style="margin: 0 0 5px 0; color: #C8A856; font-weight: bold;">
                      Message:
                    </p>
                    <p style="margin: 0; color: #e0e0e0; line-height: 1.6; white-space: pre-line;">
                      ${submission.message}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Contact Information -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border-left: 4px solid #C8A856; background-color: #1a1a1a;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #C8A856; font-weight: bold;">
                      Need Immediate Assistance?
                    </p>
                    <p style="margin: 0 0 10px 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                      <strong>General Inquiries & Orders:</strong><br>
                      <a href="mailto:orders@06coins.com" style="color: #C8A856; text-decoration: none;">orders@06coins.com</a>
                    </p>
                    <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.6;">
                      <strong>Support & Shipping Issues:</strong><br>
                      <a href="mailto:support@06coins.com" style="color: #C8A856; text-decoration: none;">support@06coins.com</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td align="center">
                    <a href="https://06coins.com" style="display: inline-block; padding: 15px 40px; background-color: #C8A856; color: #000000; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 4px;">
                      Return to 06coins.com
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #e0e0e0; text-align: center;">
                Thank you for your interest in Alpha Phi Alpha Fraternity, Inc.
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
MESSAGE RECEIVED
We'll Be In Touch Soon

Dear ${submission.name},

Thank you for contacting the Alpha Phi Alpha 120th Anniversary Commemorative Coin Campaign. We've received your message and will respond within 24-48 hours.

YOUR MESSAGE
------------
Subject: ${submission.subject}
Inquiry Type: ${submission.inquiryType || 'General'}

Message:
${submission.message}

NEED IMMEDIATE ASSISTANCE?
General Inquiries & Orders: orders@06coins.com
Support & Shipping Issues: support@06coins.com

Return to 06coins.com: https://06coins.com

Thank you for your interest in Alpha Phi Alpha Fraternity, Inc.

---
Alpha Phi Alpha 120th Anniversary Commemorative Coin
06coins.com
© 2024 Alpha Phi Alpha Fraternity, Inc. All rights reserved.
  `.trim();

  return { html, text };
}
