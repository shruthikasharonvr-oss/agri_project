// OTP Service - Manages OTP generation, storage, and verification

export interface OTPSession {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

const OTP_STORAGE_KEY = '_otp_sessions';
const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in localStorage
 */
export function storeOTP(email: string, otp: string): void {
  const sessions = getAllOTPSessions();
  const expiresAt = Date.now() + OTP_EXPIRY_TIME;
  
  sessions[email] = {
    email,
    otp,
    expiresAt,
    attempts: 0,
  };
  
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * Get all OTP sessions
 */
export function getAllOTPSessions(): Record<string, OTPSession> {
  try {
    const stored = localStorage.getItem(OTP_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Get OTP session by email
 */
export function getOTPSession(email: string): OTPSession | null {
  const sessions = getAllOTPSessions();
  const session = sessions[email];
  
  if (!session) return null;
  
  // Check if expired
  if (Date.now() > session.expiresAt) {
    deleteOTPSession(email);
    return null;
  }
  
  return session;
}

/**
 * Verify OTP
 */
export function verifyOTP(email: string, otp: string): boolean {
  const session = getOTPSession(email);
  
  if (!session) {
    return false;
  }
  
  // Check attempts
  if (session.attempts >= MAX_ATTEMPTS) {
    deleteOTPSession(email);
    return false;
  }
  
  // Check OTP
  if (session.otp !== otp) {
    session.attempts += 1;
    const sessions = getAllOTPSessions();
    sessions[email] = session;
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessions));
    return false;
  }
  
  return true;
}

/**
 * Delete OTP session
 */
export function deleteOTPSession(email: string): void {
  const sessions = getAllOTPSessions();
  delete sessions[email];
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(sessions));
}

/**
 * Get remaining time for OTP (in seconds)
 */
export function getOTPRemainingTime(email: string): number {
  const session = getOTPSession(email);
  if (!session) return 0;
  
  const remaining = Math.max(0, Math.ceil((session.expiresAt - Date.now()) / 1000));
  return remaining;
}

/**
 * Get remaining attempts
 */
export function getRemainingAttempts(email: string): number {
  const session = getOTPSession(email);
  if (!session) return MAX_ATTEMPTS;
  
  return Math.max(0, MAX_ATTEMPTS - session.attempts);
}
