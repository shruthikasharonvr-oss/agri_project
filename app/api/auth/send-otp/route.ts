import { NextRequest, NextResponse } from 'next/server';
import { generateOTP } from '../../../lib/otpService';
import { storeOTPServer } from '../../../lib/otpServiceServer';
import { sendOTPEmail } from '../../../lib/emailService';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const { email, username, name } = await request.json();

    if (!email || !username || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP on server with security (SHA256 hashing, 5-min expiry, attempt tracking)
    storeOTPServer(email, otp);

    // Send OTP email with formatted template
    const emailSent = await sendOTPEmail(email, name, otp);

    if (!emailSent) {
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: 'OTP sent successfully to your email', email },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
