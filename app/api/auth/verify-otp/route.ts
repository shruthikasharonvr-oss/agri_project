import { NextRequest, NextResponse } from 'next/server';
import { deleteOTPSession, getRemainingAttempts, verifyOTPServer, getOTPSession } from '../../../lib/otpServiceServer';

export const dynamic = 'force-static';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    // Validate input
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Check if OTP session exists
    const session = getOTPSession(email);
    if (!session) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP using server-side verification with SHA256 hashing
    const isValid = verifyOTPServer(email, otp);

    if (!isValid) {
      const remaining = getRemainingAttempts(email);
      if (remaining === 0) {
        deleteOTPSession(email);
        return NextResponse.json(
          { error: 'Maximum attempts exceeded. Please request a new OTP.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { 
          error: `Invalid OTP. ${remaining} attempt(s) remaining.`,
          remaining,
        },
        { status: 400 }
      );
    }

    // OTP verified successfully - delete the session
    deleteOTPSession(email);

    return NextResponse.json(
      {
        success: true,
        message: 'OTP verified successfully',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
