import * as crypto from 'crypto';

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, {
  otp: string;
  hashedOtp: string;
  expiresAt: number;
  attempts: number;
}>();

const OTP_EXPIRY_TIME = 20 * 60 * 1000; // 20 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP for security
 */
function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Store OTP on server
 */
export function storeOTPServer(email: string, otp: string): void {
  const hashedOtp = hashOTP(otp);
  otpStore.set(email, {
    otp: otp, // Keep plain OTP for sending (remove after sending in production)
    hashedOtp,
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
    attempts: 0,
  });

  // Clean up after expiry
  setTimeout(() => {
    otpStore.delete(email);
  }, OTP_EXPIRY_TIME);
}

/**
 * Get OTP session
 */
export function getOTPSession(email: string): { otp: string; attempts: number } | null {
  const session = otpStore.get(email);
  
  if (!session) return null;
  
  // Check if expired
  if (Date.now() > session.expiresAt) {
    otpStore.delete(email);
    return null;
  }
  
  return {
    otp: session.otp,
    attempts: session.attempts,
  };
}

/**
 * Verify OTP
 */
export function verifyOTPServer(email: string, providedOtp: string): boolean {
  const session = otpStore.get(email);
  
  if (!session) {
    return false;
  }
  
  // Check if expired
  if (Date.now() > session.expiresAt) {
    otpStore.delete(email);
    return false;
  }
  
  // Check attempts
  if (session.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email);
    return false;
  }
  
  // Verify OTP
  const hashedProvidedOtp = hashOTP(providedOtp);
  if (session.hashedOtp !== hashedProvidedOtp) {
    session.attempts += 1;
    return false;
  }
  
  // OTP verified - clean up
  otpStore.delete(email);
  return true;
}

/**
 * Delete OTP session
 */
export function deleteOTPSession(email: string): void {
  otpStore.delete(email);
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(email: string): number {
  const session = otpStore.get(email);
  if (!session) return 0;
  return MAX_ATTEMPTS - session.attempts;
}
