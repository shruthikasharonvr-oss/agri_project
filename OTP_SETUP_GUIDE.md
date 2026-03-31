<<<<<<< HEAD
# FarmToHome OTP Authentication Setup Guide

## Overview
The OTP (One-Time Password) authentication system has been fully migrated from Firebase to **Nodemailer** with Gmail SMTP. This provides:
- ✅ Email-based OTP delivery
- ✅ Server-side secure storage with SHA256 hashing
- ✅ 20-minute OTP expiration
- ✅ 5 attempt limit with auto-lockout
- ✅ No Firebase dependency required

## Architecture

### Components Created

1. **`app/lib/emailService.ts`** - Email sending service
   - `sendOTPEmail(email, name, otp)` - Sends formatted OTP email via Nodemailer
   - `verifyTransporter()` - Test email service connectivity
   - Handles Gmail SMTP configuration and connection pooling

2. **`app/lib/otpServiceServer.ts`** - Server-side OTP management
   - `generateOTP()` - Creates 6-digit OTP
   - `hashOTP(otp)` - SHA256 hashing for security
   - `storeOTPServer(email, otp)` - Stores hashed OTP with 20-min expiry
   - `verifyOTPServer(email, otp)` - Validates OTP with attempt tracking
   - In-memory Map storage (auto-cleans on expiry)

3. **`app/api/auth/send-otp/route.ts`** - Send OTP endpoint
   - POST handler for OTP generation and email delivery
   - Validates email format
   - Returns: `{ success: true, email, message }`

4. **`app/api/auth/verify-otp/route.ts`** - Verify OTP endpoint
   - POST handler for OTP validation
   - Tracks failed attempts, prevents brute-force
   - Returns: `{ success: true, message, email }` or error with remaining attempts

## Setup Instructions

### Step 1: Gmail Configuration

1. **Enable 2-Factor Authentication (2FA)**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Confirm with your recovery email

2. **Generate App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character app password
   - Copy this password (you'll need it next)

### Step 2: Configure Environment Variables

1. **Create `.env.local` file** in project root (f:\farm_to_home\):
   ```bash
   copy .env.local.example .env.local
   ```

2. **Edit `.env.local`** and add your credentials:
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
   - Replace with your Gmail address
   - Replace with 16-char app password (copy exactly from Google, including spaces)

3. **Verify `.env.local` is in `.gitignore`**:
   ```
   .env.local
   ```

### Step 3: Install Dependencies

```bash
npm install
```

The following packages are already included:
- `nodemailer` - Email delivery
- `crypto` - SHA256 hashing (built-in Node.js module)

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

## Testing the OTP Flow

### Manual Test via cURL

**1. Request OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "test@example.com"
}
```

**2. Check Email:**
- Look for email from `EMAIL_USER` (your Gmail)
- Subject: "FarmToHome - Your Login OTP"
- OTP is valid for 20 minutes

**3. Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

Expected response (correct OTP):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "test@example.com"
}
```

Expected response (incorrect OTP):
```json
{
  "error": "Invalid OTP. 4 attempt(s) remaining.",
  "remaining": 4
}
```

### Test via Frontend

1. Navigate to login/signup page
2. Enter email address
3. Click "Send OTP"
4. Check email inbox
5. Copy OTP and enter in verification field
6. Submit to complete authentication

## Email Template Preview

The OTP email includes:
- FarmToHome branding header (green gradient)
- Personalized greeting with user name
- Large, easy-to-read 6-digit OTP
- Expiration notice (20 minutes)
- Security tips (never share, etc.)
- Footer with copyright info

## Troubleshooting

### ❌ "Failed to send OTP email" Error

**Cause 1: Missing/Incorrect Environment Variables**
- Check `.env.local` exists in project root
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Ensure no extra spaces in values (except in password)
- Restart dev server after changes: `npm run dev`

**Cause 2: Gmail App Password Issues**
- Regenerate app password from [Google App Passwords](https://myaccount.google.com/apppasswords)
- Ensure 2FA is enabled on master account
- Use generated password exactly (includes spaces)
- Don't use regular Gmail password; use app password only

**Cause 3: Connection Issues**
- Check internet connectivity
- Verify Gmail account exists and is accessible
- Test with: `curl https://gmail.google.com`

### ❌ Invalid OTP After Using Correct Code

**Cause:** OTP expiry (20 minutes elapsed)
- Solution: Request new OTP and verify within 20 minutes

### ❌ Maximum Attempts Exceeded

**Cause:** User entered wrong OTP 5 times
- Solution: User must request new OTP via send-otp endpoint
- Server automatically clears old session

## Security Features

| Feature | Implementation |
|---------|-----------------|
| **OTP Storage** | SHA256 hashing (stored hash, not plain OTP) |
| **Expiration** | 20-minute auto-expiry with cleanup |
| **Brute Force** | Max 5 attempts per OTP, then locked |
| **Transport** | HTTPS (enforced for production) |
| **Email Source** | Gmail SMTP (OAuth via app password) |
| **Session Isolation** | Per-email in-memory Map, cleaned on expiry |

## Vercel Deployment

For production deployment on Vercel:

1. **Add Environment Variables:**
   - Go to Vercel Project Settings → Environment Variables
   - Add `EMAIL_USER` and `EMAIL_PASS`
   - Deploy

2. **Update Production URLs:**
   - Using custom domain? Update email footer URL
   - Configure CORS if frontend on different domain

3. **Monitor Email Quota:**
   - Gmail free tier: ~500 emails/day
   - For higher volume: Upgrade to paid Gmail or use SendGrid

## Admin Commands (Development)

### Clear All OTP Sessions
```javascript
// In browser console or Node REPL
const { otpSessions } = require('./app/lib/otpServiceServer');
otpSessions.clear();
```

### Check Active OTP Sessions
```javascript
const { otpSessions } = require('./app/lib/otpServiceServer');
console.log(otpSessions);
```

## Future Enhancements

- [ ] Database persistence (Supabase PostgreSQL)
- [ ] Rate limiting on send-otp (1 request per minute per email)
- [ ] SMS OTP fallback (Twilio integration)
- [ ] OTP analytics and audit logging
- [ ] Custom email templates per environment
- [ ] Multi-language email templates

## Support & Issues

If you encounter issues:

1. Check `.env.local` configuration
2. Review console logs: `npm run dev`
3. Test with cURL examples above
4. Verify Gmail app password is correct
5. Ensure 2FA is enabled on Gmail account

## Files Modified/Created

```
Created:
- app/lib/emailService.ts          (Email sending via Nodemailer)
- app/lib/otpServiceServer.ts      (Server-side OTP management)
- .env.local.example               (Environment variable template)
- OTP_SETUP_GUIDE.md              (This file)

Modified:
- app/api/auth/send-otp/route.ts   (Now uses emailService)
- app/api/auth/verify-otp/route.ts (Now uses otpServiceServer)
```

---

**Last Updated:** 2024
**Status:** Production Ready ✅
**Dependencies:** nodemailer (npm installed), Node.js crypto (built-in)
=======
# FarmToHome OTP Authentication Setup Guide

## Overview
The OTP (One-Time Password) authentication system has been fully migrated from Firebase to **Nodemailer** with Gmail SMTP. This provides:
- ✅ Email-based OTP delivery
- ✅ Server-side secure storage with SHA256 hashing
- ✅ 20-minute OTP expiration
- ✅ 5 attempt limit with auto-lockout
- ✅ No Firebase dependency required

## Architecture

### Components Created

1. **`app/lib/emailService.ts`** - Email sending service
   - `sendOTPEmail(email, name, otp)` - Sends formatted OTP email via Nodemailer
   - `verifyTransporter()` - Test email service connectivity
   - Handles Gmail SMTP configuration and connection pooling

2. **`app/lib/otpServiceServer.ts`** - Server-side OTP management
   - `generateOTP()` - Creates 6-digit OTP
   - `hashOTP(otp)` - SHA256 hashing for security
   - `storeOTPServer(email, otp)` - Stores hashed OTP with 20-min expiry
   - `verifyOTPServer(email, otp)` - Validates OTP with attempt tracking
   - In-memory Map storage (auto-cleans on expiry)

3. **`app/api/auth/send-otp/route.ts`** - Send OTP endpoint
   - POST handler for OTP generation and email delivery
   - Validates email format
   - Returns: `{ success: true, email, message }`

4. **`app/api/auth/verify-otp/route.ts`** - Verify OTP endpoint
   - POST handler for OTP validation
   - Tracks failed attempts, prevents brute-force
   - Returns: `{ success: true, message, email }` or error with remaining attempts

## Setup Instructions

### Step 1: Gmail Configuration

1. **Enable 2-Factor Authentication (2FA)**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification
   - Confirm with your recovery email

2. **Generate App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character app password
   - Copy this password (you'll need it next)

### Step 2: Configure Environment Variables

1. **Create `.env.local` file** in project root (f:\farm_to_home\):
   ```bash
   copy .env.local.example .env.local
   ```

2. **Edit `.env.local`** and add your credentials:
   ```env
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx
   ```
   - Replace with your Gmail address
   - Replace with 16-char app password (copy exactly from Google, including spaces)

3. **Verify `.env.local` is in `.gitignore`**:
   ```
   .env.local
   ```

### Step 3: Install Dependencies

```bash
npm install
```

The following packages are already included:
- `nodemailer` - Email delivery
- `crypto` - SHA256 hashing (built-in Node.js module)

### Step 4: Start Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

## Testing the OTP Flow

### Manual Test via cURL

**1. Request OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "name": "Test User"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "test@example.com"
}
```

**2. Check Email:**
- Look for email from `EMAIL_USER` (your Gmail)
- Subject: "FarmToHome - Your Login OTP"
- OTP is valid for 20 minutes

**3. Verify OTP:**
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

Expected response (correct OTP):
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "email": "test@example.com"
}
```

Expected response (incorrect OTP):
```json
{
  "error": "Invalid OTP. 4 attempt(s) remaining.",
  "remaining": 4
}
```

### Test via Frontend

1. Navigate to login/signup page
2. Enter email address
3. Click "Send OTP"
4. Check email inbox
5. Copy OTP and enter in verification field
6. Submit to complete authentication

## Email Template Preview

The OTP email includes:
- FarmToHome branding header (green gradient)
- Personalized greeting with user name
- Large, easy-to-read 6-digit OTP
- Expiration notice (20 minutes)
- Security tips (never share, etc.)
- Footer with copyright info

## Troubleshooting

### ❌ "Failed to send OTP email" Error

**Cause 1: Missing/Incorrect Environment Variables**
- Check `.env.local` exists in project root
- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- Ensure no extra spaces in values (except in password)
- Restart dev server after changes: `npm run dev`

**Cause 2: Gmail App Password Issues**
- Regenerate app password from [Google App Passwords](https://myaccount.google.com/apppasswords)
- Ensure 2FA is enabled on master account
- Use generated password exactly (includes spaces)
- Don't use regular Gmail password; use app password only

**Cause 3: Connection Issues**
- Check internet connectivity
- Verify Gmail account exists and is accessible
- Test with: `curl https://gmail.google.com`

### ❌ Invalid OTP After Using Correct Code

**Cause:** OTP expiry (20 minutes elapsed)
- Solution: Request new OTP and verify within 20 minutes

### ❌ Maximum Attempts Exceeded

**Cause:** User entered wrong OTP 5 times
- Solution: User must request new OTP via send-otp endpoint
- Server automatically clears old session

## Security Features

| Feature | Implementation |
|---------|-----------------|
| **OTP Storage** | SHA256 hashing (stored hash, not plain OTP) |
| **Expiration** | 20-minute auto-expiry with cleanup |
| **Brute Force** | Max 5 attempts per OTP, then locked |
| **Transport** | HTTPS (enforced for production) |
| **Email Source** | Gmail SMTP (OAuth via app password) |
| **Session Isolation** | Per-email in-memory Map, cleaned on expiry |

## Vercel Deployment

For production deployment on Vercel:

1. **Add Environment Variables:**
   - Go to Vercel Project Settings → Environment Variables
   - Add `EMAIL_USER` and `EMAIL_PASS`
   - Deploy

2. **Update Production URLs:**
   - Using custom domain? Update email footer URL
   - Configure CORS if frontend on different domain

3. **Monitor Email Quota:**
   - Gmail free tier: ~500 emails/day
   - For higher volume: Upgrade to paid Gmail or use SendGrid

## Admin Commands (Development)

### Clear All OTP Sessions
```javascript
// In browser console or Node REPL
const { otpSessions } = require('./app/lib/otpServiceServer');
otpSessions.clear();
```

### Check Active OTP Sessions
```javascript
const { otpSessions } = require('./app/lib/otpServiceServer');
console.log(otpSessions);
```

## Future Enhancements

- [ ] Database persistence (Supabase PostgreSQL)
- [ ] Rate limiting on send-otp (1 request per minute per email)
- [ ] SMS OTP fallback (Twilio integration)
- [ ] OTP analytics and audit logging
- [ ] Custom email templates per environment
- [ ] Multi-language email templates

## Support & Issues

If you encounter issues:

1. Check `.env.local` configuration
2. Review console logs: `npm run dev`
3. Test with cURL examples above
4. Verify Gmail app password is correct
5. Ensure 2FA is enabled on Gmail account

## Files Modified/Created

```
Created:
- app/lib/emailService.ts          (Email sending via Nodemailer)
- app/lib/otpServiceServer.ts      (Server-side OTP management)
- .env.local.example               (Environment variable template)
- OTP_SETUP_GUIDE.md              (This file)

Modified:
- app/api/auth/send-otp/route.ts   (Now uses emailService)
- app/api/auth/verify-otp/route.ts (Now uses otpServiceServer)
```

---

**Last Updated:** 2024
**Status:** Production Ready ✅
**Dependencies:** nodemailer (npm installed), Node.js crypto (built-in)
>>>>>>> b2633f978fb333335f250d6d88fadd17a67c2a69
