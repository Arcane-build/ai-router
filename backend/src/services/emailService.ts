import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Production-ready email service using Resend
// Free tier: 3,000 emails/month, 100 emails/day
// Paid: $20/month for 50,000 emails
const resend = new Resend(process.env.RESEND_API_KEY);

interface WaitlistEmailData {
  email: string;
  name?: string;
}

/**
 * Send waitlist confirmation email
 */
export async function sendWaitlistConfirmation(data: WaitlistEmailData): Promise<{ 
  success: boolean; 
  error?: string;
  messageId?: string;
}> {
  try {
    const { email, name } = data;
    
    const { data: emailData, error: sendError } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'Novi AI <onboarding@resend.dev>',
      to: [email],
      replyTo: process.env.REPLY_TO_EMAIL || 'support@noviai.xyz',
      subject: 'Welcome to Novi AI Waitlist! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Novi AI</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 12px;
              padding: 40px;
              color: white;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 20px;
              text-align: center;
            }
            .content {
              background: white;
              color: #333;
              padding: 30px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .content h2 {
              color: #667eea;
              margin-top: 0;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: rgba(255, 255, 255, 0.8);
            }
            .highlight {
              background: #f7f7f7;
              padding: 15px;
              border-radius: 6px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">✨ NOVI AI</div>
            
            <div class="content">
              <h2>Welcome to the Future of AI! 🎉</h2>
              
              ${name ? `<p>Hi ${name},</p>` : '<p>Hi there,</p>'}
              
              <p>Thank you for joining the Novi AI waitlist! We're thrilled to have you on board as we build the next generation of AI task orchestration.</p>
              
              <div class="highlight">
                <strong>What's Next?</strong>
                <ul>
                  <li>🔔 You'll be among the first to know when we launch</li>
                  <li>🎁 Exclusive early access and special perks</li>
                  <li>📰 Regular updates on our progress</li>
                  <li>💡 Opportunities to shape the product with your feedback</li>
                </ul>
              </div>
              
              <p>We're working hard to create an amazing experience that will revolutionize how you work with AI. Stay tuned for updates!</p>
              
              <p>In the meantime, feel free to explore our website and learn more about what we're building.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Novi AI Team</strong>
              </p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${email} because you joined our waitlist.</p>
              <p>© ${new Date().getFullYear()} Novi AI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Novi AI Waitlist!

${name ? `Hi ${name},` : 'Hi there,'}

Thank you for joining the Novi AI waitlist! We're thrilled to have you on board as we build the next generation of AI task orchestration.

What's Next?
- You'll be among the first to know when we launch
- Exclusive early access and special perks
- Regular updates on our progress
- Opportunities to shape the product with your feedback

We're working hard to create an amazing experience that will revolutionize how you work with AI. Stay tuned for updates!

Best regards,
The Novi AI Team

---
This email was sent to ${email} because you joined our waitlist.
© ${new Date().getFullYear()} Novi AI. All rights reserved.
      `.trim(),
    });

    if (sendError) {
      console.error('❌ Email send failed:', {
        email: data.email,
        error: sendError.message,
        code: sendError.name
      });
      return { 
        success: false, 
        error: sendError.message || 'Failed to send confirmation email' 
      };
    }

    console.log(`✅ Email sent to ${data.email} | MessageID: ${emailData?.id}`);
    
    return { 
      success: true, 
      messageId: emailData?.id
    };
  } catch (error: any) {
    console.error('❌ Email send failed:', {
      email: data.email,
      error: error.message
    });
    return { 
      success: false, 
      error: error.message || 'Failed to send confirmation email' 
    };
  }
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'your-resend-api-key-here') {
      console.error('❌ RESEND_API_KEY not configured');
      return false;
    }
    console.log('✅ Resend API key configured');
    return true;
  } catch (error: any) {
    console.error('❌ Email config error:', error.message);
    return false;
  }
}
