# Waitlist Email Automation Setup

This guide will help you configure the email automation for sending confirmation emails when users join the waitlist.

## Overview

When a user joins the waitlist through the modal, a confirmation email is automatically sent from `support@noviai.xyz` to their email address.

## Files Added/Modified

### Backend
- **`src/services/emailService.ts`** - Email service using Nodemailer
- **`src/routes/api.ts`** - Added POST `/api/waitlist` endpoint
- **`.env.example`** - Added SMTP configuration variables

### Frontend
- **`src/components/landing/WaitlistModal.tsx`** - Updated to call the API endpoint

## Setup Instructions

### 1. Install Dependencies

The required package has already been installed:
```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 2. Configure Email Provider

You need to set up SMTP credentials. Here are the recommended options:

#### Option A: Gmail (Easiest for Testing)

1. **Enable 2-Factor Authentication** in your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. **Update your `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   ```

#### Option B: SendGrid (Recommended for Production)

1. Sign up at https://sendgrid.com
2. Create an API Key
3. Update `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   ```

#### Option C: Outlook/Hotmail

1. Enable 2FA and create app password
2. Update `.env`:
   ```env
   SMTP_HOST=smtp-mail.outlook.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@outlook.com
   SMTP_PASSWORD=your-app-password
   ```

#### Option D: Custom Domain with Mailgun/AWS SES

For using `support@noviai.xyz`, you'll need:
- A verified domain in your email provider
- SMTP credentials from your provider
- Update the SMTP settings accordingly

### 3. Update Environment Variables

Create or update `backend/.env` with your SMTP configuration:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
```

### 4. Update Sender Email (Optional)

If you want to use a different sender address, update [src/services/emailService.ts](../backend/src/services/emailService.ts#L32):

```typescript
from: '"Novi AI" <your-verified-email@domain.com>',
```

**Note**: Most SMTP providers require the `from` address to match the authenticated SMTP user, or be a verified domain.

### 5. Test the Setup

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the waitlist**:
   - Open the application
   - Click "Join Waitlist"
   - Enter your email
   - Check your inbox for the confirmation email

## API Endpoint

### POST `/api/waitlist`

Join the waitlist and receive a confirmation email.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe" // optional
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "You have been added to the waitlist! Check your email for confirmation.",
  "emailSent": true
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Valid email is required"
}
```

## Email Template

The confirmation email includes:
- Welcome message
- What to expect next
- Branded HTML design with gradients
- Plain text fallback

You can customize the template in [src/services/emailService.ts](../backend/src/services/emailService.ts).

## Troubleshooting

### Email not sending

1. **Check SMTP credentials** - Ensure they're correct in `.env`
2. **Check console logs** - Look for error messages in the terminal
3. **Verify email provider** - Some providers block less secure apps
4. **Check spam folder** - Confirmation emails might land in spam
5. **Try Gmail with App Password** - Easiest way to test

### Common Errors

- **"Invalid login"** - Wrong credentials or app password not enabled
- **"Connection timeout"** - Wrong SMTP host or port
- **"550 Authentication required"** - Need to authenticate with SMTP
- **"Sender address rejected"** - From address doesn't match authenticated user

### Using a Custom Domain

To send from `support@noviai.xyz`, you need to:
1. Verify domain ownership with your email provider
2. Set up proper DNS records (SPF, DKIM, DMARC)
3. Use SMTP credentials provided by your email service
4. Update the `from` address in the email service

Recommended providers for custom domains:
- **SendGrid** - Free tier available, easy setup
- **Mailgun** - Good for developers
- **AWS SES** - Cheapest for high volume
- **Google Workspace** - Best for custom Gmail

## Production Considerations

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Implement rate limiting** to prevent abuse
3. **Store waitlist emails** in a database
4. **Add unsubscribe functionality**
5. **Monitor email delivery rates**
6. **Set up proper DNS records** (SPF, DKIM, DMARC)
7. **Use environment-specific configurations**

## Next Steps

- [ ] Set up SMTP credentials
- [ ] Test email sending
- [ ] Add database storage for waitlist
- [ ] Implement duplicate email checking
- [ ] Add email verification
- [ ] Set up analytics/tracking
