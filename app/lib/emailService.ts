import * as nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter;

/**
 * Initialize Nodemailer transporter
 */
function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return transporter;
}

/**
 * Send OTP email
 */
export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<boolean> {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'FarmToHome - Your Login OTP',
      html: `
        <div style="font-family: 'Poppins', 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #10b981 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700;">🌾 FarmToHome</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">Fresh From Farms</p>
          </div>
          
          <div style="background: #f8fafc; padding: 40px 30px; border-radius: 0 0 12px 12px; text-align: center;">
            <p style="color: #1e293b; font-size: 18px; margin: 0 0 30px 0; font-weight: 600;">
              Hello <strong>${name}</strong>,
            </p>
            
            <p style="color: #475569; font-size: 14px; margin: 0 0 30px 0; line-height: 1.6;">
              Your One-Time Password (OTP) to login to FarmToHome is:
            </p>
            
            <div style="background: white; border: 3px solid #16a34a; padding: 30px; border-radius: 12px; margin: 0 0 30px 0;">
              <p style="font-size: 48px; font-weight: 900; color: #16a34a; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">
                ${otp}
              </p>
              <p style="color: #94a3b8; font-size: 13px; margin: 15px 0 0 0; font-weight: 500;">
                Valid for 20 minutes
              </p>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 0 0 30px 0; text-align: left;">
              <p style="color: #92400e; font-size: 13px; margin: 0; font-weight: 600;">⚠️ Security Notice</p>
              <ul style="color: #b45309; font-size: 12px; margin: 8px 0 0 16px; padding: 0;">
                <li>Never share this OTP with anyone</li>
                <li>FarmToHome staff will never ask for your OTP</li>
                <li>This OTP expires in 20 minutes</li>
              </ul>
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
              Didn't request this? You can safely ignore this email.
            </p>
          </div>
          
          <div style="background: #0f172a; padding: 20px 30px; border-radius: 0; text-align: center;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">
              © 2026 FarmToHome. All rights reserved. | 
              <a href="https://farmtohome.com/privacy" style="color: #22c55e; text-decoration: none;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

/**
 * Verify transporter connection (for testing)
 */
export async function verifyTransporter(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Transporter verification failed:', error);
    return false;
  }
}
