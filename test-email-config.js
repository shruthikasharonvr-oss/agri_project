#!/usr/bin/env node

/**
 * Email Service Configuration Tester
 * 
 * Run this to verify your Nodemailer and Gmail setup
 * Usage: node test-email-config.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error('❌ ERROR: Missing EMAIL_USER or EMAIL_PASS in .env.local');
  console.error('\nSolution: Create .env.local with:');
  console.error('  EMAIL_USER=your_gmail@gmail.com');
  console.error('  EMAIL_PASS=xxxx xxxx xxxx xxxx');
  console.error('\nGet app password from: https://myaccount.google.com/apppasswords');
  process.exit(1);
}

console.log('🔍 Testing Email Configuration...\n');
console.log(`📧 Email User: ${emailUser}`);
console.log(`🔐 Password: ${emailPass.substring(0, 4)}...${emailPass.substring(emailPass.length - 4)}`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Test 1: Verify Transporter
console.log('\n📋 Test 1: Verifying transporter connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ FAILED:', error.message);
    console.error('\nCommon Issues:');
    console.error('  1. Gmail app password is incorrect');
    console.error('  2. 2FA not enabled on Gmail account');
    console.error('  3. Email address is incorrect');
    console.error('  4. Network connectivity issues');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS: SMTP connection verified!');

    // Test 2: Send Test Email
    console.log('\n📋 Test 2: Sending test email...');
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
      from: emailUser,
      to: emailUser, // Send to self
      subject: 'FarmToHome - Test OTP Email',
      html: `
        <div style="font-family: 'Poppins', 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #10b981 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🌾 FarmToHome</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Fresh From Farms</p>
          </div>
          
          <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #1e293b; font-size: 18px; margin: 0 0 30px 0; font-weight: 600;">
              Hello Test User,
            </p>
            
            <p style="color: #475569; font-size: 14px; margin: 0 0 30px 0; line-height: 1.6;">
              Your One-Time Password (OTP) to login to FarmToHome is:
            </p>
            
            <div style="background: white; border: 3px solid #16a34a; padding: 30px; border-radius: 12px; margin: 0 0 30px 0;">
              <p style="font-size: 48px; font-weight: 900; color: #16a34a; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${testOTP}
              </p>
              <p style="color: #94a3b8; font-size: 13px; margin: 15px 0 0 0; font-weight: 500;">
                Valid for 5 minutes
              </p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 0 0 30px 0; text-align: left;">
              <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">⚠️ This is a TEST EMAIL</p>
              <p style="color: #b45309; font-size: 12px; margin: 8px 0 0 0;">If you received this, your email service is working correctly!</p>
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
              This is a test email from FarmToHome OTP verification system.
            </p>
          </div>
          
          <div style="background: #0f172a; padding: 20px 30px; border-radius: 0; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © 2026 FarmToHome. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ FAILED:', error.message);
        process.exit(1);
      } else {
        console.log('✅ SUCCESS: Test email sent!');
        console.log(`   Message ID: ${info.messageId}`);
        console.log(`   Response: ${info.response}`);
        console.log('\n📬 Check your email inbox for the test message!');
        console.log('\n✨ Your email service is ready for production!');
        process.exit(0);
      }
    });
  }
});
