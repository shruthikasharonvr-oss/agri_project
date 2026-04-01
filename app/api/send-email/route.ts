import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-static';

// Configure your SMTP credentials in .env.local
// For Gmail, use an App Password if 2FA is enabled.
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or your preferred SMTP service
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

export async function POST(req: Request) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing Email Configuration in .env.local");
    return NextResponse.json({
      error: "Server email configuration is incomplete.",
      details: "Ensure EMAIL_USER and EMAIL_PASS are set in .env.local"
    }, { status: 500 });
  }

  console.log("Email API called with user:", process.env.EMAIL_USER);
  try {
    const { to, type, data } = await req.json();

    let subject = '';
    let html = '';

    if (type === 'otp') {
      subject = 'Your FarmToHome Verification Code: ' + data.otp;
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #15803d; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Verification Code 🌱</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff; text-align: center;">
            <h2 style="color: #333;">Hello ${data.name || 'User'},</h2>
            <p style="color: #555; line-height: 1.6;">
              Welcome to FarmToHome! Use the verification code below to complete your login.
            </p>
            <div style="background-color: #f0fdf4; border: 2px dashed #15803d; padding: 20px; margin: 30px auto; width: fit-content; border-radius: 10px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #15803d;">${data.otp}</span>
            </div>
            <p style="color: #888; font-size: 12px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p>&copy; ${new Date().getFullYear()} FarmToHome. All rights reserved.</p>
          </div>
        </div>
      `;
    } else if (type === 'welcome') {
      subject = 'Welcome to FarmToHome! 🌱';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #15803d; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to FarmToHome! 🌱</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333;">Hello ${data.name},</h2>
            <p style="color: #555; line-height: 1.6;">
              We are thrilled to have you join our community! At FarmToHome, we are dedicated to bringing you the freshest, locally sourced produce directly to your doorstep.
            </p>
            <p style="color: #555; line-height: 1.6;">
              By cutting out the middlemen, we ensure fair prices for our farmers and the highest quality for you.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.url}" style="background-color: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Marketplace</a>
            </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p>&copy; ${new Date().getFullYear()} FarmToHome. All rights reserved.</p>
          </div>
        </div>
      `;
    } else if (type === 'order_confirmation') {
      subject = 'Your FarmToHome Order is Confirmed! 📦';
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #15803d; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #333;">Hello ${data.name},</h2>
            <p style="color: #555; line-height: 1.6;">
              Thank you for your order! We have received it and our farmers are getting your fresh produce ready.
            </p>
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #166534;">Order Summary</h3>
              <p style="margin: 5px 0; color: #333;"><strong>Total Amount:</strong> ₹${data.totalAmount}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Delivery Address:</strong> ${data.address}</p>
            </div>
            <p style="color: #555; line-height: 1.6;">
              Your harvest will be dispatched from our community hub to ensure maximum freshness and minimum carbon footprint.
            </p>
          </div>
          <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #888;">
            <p>&copy; ${new Date().getFullYear()} FarmToHome. All rights reserved.</p>
          </div>
        </div>
      `;
    } else {
      return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    const mailOptions = {
      from: `"FarmToHome" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Detailed Email Error:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    return NextResponse.json({
      error: error.message,
      hint: "If using Gmail, ensure you use an 16-character App Password, not your regular password."
    }, { status: 500 });
  }
}
