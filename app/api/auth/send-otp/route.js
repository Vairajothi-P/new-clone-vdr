import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

    // 1. Save OTP to Database
    const { error: dbError } = await supabaseAdmin
      .from('email_otps')
      .upsert({ email, otp, expires_at: expiresAt });

    if (dbError) {
      console.error("Database error saving OTP:", dbError);
      return NextResponse.json({ error: "Failed to generate OTP. Make sure email_otps table exists." }, { status: 500 });
    }

    // 2. Log OTP to terminal (crucial for local testing if email fails)
    console.log(`\n\n========================================`);
    console.log(`🔑 OTP GENERATED FOR ${email}`);
    console.log(`OTP CODE: ${otp}`);
    console.log(`========================================\n\n`);

    // 3. Send Email using NodeMailer (only if configured)
    const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL;
    const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // or your preferred service
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: `"VDR Registration" <${smtpUser}>`,
        to: email,
        subject: 'Your VDR Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <h2 style="color: #0f172a;">Verify Your Email Address</h2>
            <p style="color: #475569; font-size: 16px;">Please use the verification code below to complete your organization's registration:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #020617;">${otp}</span>
            </div>
            <p style="color: #94a3b8; font-size: 14px;">This code will expire in 10 minutes.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } else {
      console.warn("⚠️ SMTP_USER or SMTP_PASS not set in .env. Email was not sent, but OTP was printed above.");
    }

    return NextResponse.json({ success: true, message: "OTP Sent" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
