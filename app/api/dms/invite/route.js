import { db } from '../../../../db';
import { dmsDealInvitations } from '../../../../db/schema';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const data = await req.json();
    const { email, projectId } = data;

    if (!email || !projectId) {
      return NextResponse.json({ error: 'Missing email or projectId' }, { status: 400 });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const inviteLink = `${appUrl}/dms/register?inviteToken=${token}&projectId=${projectId}`;

    // Save to database
    await db.insert(dmsDealInvitations).values({
      projectId,
      email,
      token,
      status: 'pending'
    });

    // Try sending email if nodemailer is available
    try {
      const nodemailer = require('nodemailer');
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Secure DMS" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "You have been invited to a Deal on Secure DMS",
          html: `
            <h2>You're Invited!</h2>
            <p>You have been invited to access a confidential deal on Secure DMS.</p>
            <p>Click the secure link below to create your buyer account and access the deal room directly:</p>
            <a href="${inviteLink}" style="display:inline-block;padding:10px 20px;background:#00c875;color:white;text-decoration:none;border-radius:5px;">Access Deal Room</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p>${inviteLink}</p>
          `,
        });
      }
    } catch (mailError) {
      console.warn("Nodemailer failed or is not installed. Returning link directly.", mailError);
    }

    // Always return the inviteLink so the frontend can display it in a "Copy Link" UI
    return NextResponse.json({ success: true, inviteLink }, { status: 200 });
  } catch (error) {
    console.error('Failed to create invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
