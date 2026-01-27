/**
 * Test script to verify email configuration
 * Run this with: npm run test-email
 */

import { sendWaitlistConfirmation, verifyEmailConfig } from './src/services/emailService';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  console.log('🧪 Testing Email Configuration...\n');
  
  // Check if SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ ERROR: SMTP credentials not found in .env file');
    console.error('Please configure SMTP_USER and SMTP_PASSWORD in your .env file\n');
    process.exit(1);
  }

  console.log('📧 SMTP Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Password: ${'*'.repeat(process.env.SMTP_PASSWORD?.length || 0)}\n`);

  // Verify transporter
  console.log('🔍 Verifying SMTP connection...');
  const isValid = await verifyEmailConfig();
  
  if (!isValid) {
    console.error('\n❌ Email configuration failed!');
    console.error('Please check your SMTP credentials and try again.');
    process.exit(1);
  }

  console.log('✅ SMTP connection successful!\n');

  // Send test email
  const testEmailAddress = process.env.SMTP_USER; // Send to yourself
  console.log(`📨 Sending test email to: ${testEmailAddress}...`);
  
  const result = await sendWaitlistConfirmation({
    email: testEmailAddress,
    name: 'Test User'
  });

  if (result.success) {
    console.log('\n✅ SUCCESS! Test email sent successfully!');
    console.log(`📬 Check your inbox at ${testEmailAddress}`);
  } else {
    console.error('\n❌ FAILED to send test email');
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
}

testEmail()
  .then(() => {
    console.log('\n✨ Email test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Email test failed:', error.message);
    process.exit(1);
  });
