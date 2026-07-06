// import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';
// import nodemailer from 'nodemailer';
// import crypto from 'crypto';

// // Initialize Supabase admin client
// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// );

// // Configure Nodemailer transporter (Defaults to Ethereal mock SMTP if not configured)
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || 'smtp.ethereal.email',
//     port: parseInt(process.env.SMTP_PORT || '587'),
//     auth: {
//         user: process.env.SMTP_USER || '',
//         pass: process.env.SMTP_PASS || '',
//     },
// });

// export async function POST(request) {
//     try {
//         const { email, description, group_id, invited_by } = await request.json();

//         if (!email || !group_id || !invited_by) {
//             return NextResponse.json(
//                 { error: 'Missing required fields: email, group_id, or invited_by' },
//                 { status: 400 }
//             );
//         }

//         // 1. Generate a unique, secure invitation token
//         const token = crypto.randomUUID();

//         // Set expiration to 7 days from now
//         const expiresAt = new Date();
//         expiresAt.setDate(expiresAt.getDate() + 7);

//         // 2. Save invitation details into the 'invitations' table
//         const { data: invitation, error: inviteError } = await supabase
//             .from('invitations')
//             .insert({
//                 group_id,
//                 email,
//                 token,
//                 description,
//                 invited_by,
//                 status: 'pending',
//                 expires_at: expiresAt.toISOString(),
//             })
//             .select()
//             .single();

//         if (inviteError) {
//             console.error('Database Error inserting invitation:', inviteError);
//             return NextResponse.json({ error: inviteError.message }, { status: 500 });
//         }

//         // 3. Construct the registration URL
//         const host = request.headers.get('host') || 'localhost:3000';
//         const protocol = host.startsWith('localhost') ? 'http' : 'https';
//         const registrationUrl = `${protocol}://${host}/register?token=${token}`;

//         // Log the registration URL to terminal console for easy developer access/testing
//         console.log('\n--- GENERATED REGISTRATION URL FOR TESTING ---');
//         console.log(registrationUrl);
//         console.log('---------------------------------------------\n');

//         // 4. Set up email details
//         const mailOptions = {
//             from: '"Secure VDR" <no-reply@vdr.com>',
//             to: email,
//             subject: 'You have been invited to join the VDR Sector',
//             text: `You have been invited. Click the link to complete your registration: ${registrationUrl}\nMessage: ${description || 'No message provided.'}`,
//             html: `
//         <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
//           <h2 style="color: #0f172a;">Virtual Data Room Access</h2>
//           <p>You have been invited to join the Virtual Data Room.</p>
//           <p><strong>Description/Message:</strong> ${description || 'No message provided.'}</p>
//           <div style="margin: 30px 0;">
//             <a href="${registrationUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
//               Accept Invitation & Register
//             </a>
//           </div>
//           <p style="color: #64748b; font-size: 12px;">This invitation link will expire in 7 days.</p>
//         </div>
//       `,
//         };

//         // 5. Send Email if SMTP credentials exist, otherwise skip to keep testing active
//         try {
//             if (process.env.SMTP_USER) {
//                 await transporter.sendMail(mailOptions);
//             } else {
//                 console.log("SMTP environment variables not set. Invitation URL generated mock-successfully.");
//             }
//         } catch (mailError) {
//             console.error('Email sending failed, but invitation record was saved:', mailError);
//         }

//         return NextResponse.json({ success: true, invitation, registrationUrl });
//     } catch (error) {
//         console.error('Invite Server Error:', error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Configure Nodemailer transporter (Defaults to Ethereal mock SMTP if not configured)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request) {
  try {
    const { email, description, group_id, invited_by, requires_nda } = await request.json();

    if (!email || !group_id || !invited_by) {
      return NextResponse.json(
        { error: "Missing required fields: email, group_id, or invited_by" },
        { status: 400 },
      );
    }

    // Fetch group name to include in email
    const { data: group } = await supabase
      .from("groups")
      .select("name")
      .eq("id", group_id)
      .single();

    // 1. Generate a unique, secure invitation token
    const token = crypto.randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 2. Save invitation details into the 'invitations' table
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        group_id,
        email,
        token,
        description,
        invited_by,
        status: "pending",
        requires_nda: requires_nda,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Database Error inserting invitation:", inviteError);
      return NextResponse.json({ error: inviteError.message }, { status: 500 });
    }

    // 3. Construct the registration URL
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const registrationUrl = `${baseUrl}/register/${token}`;

    // Log the registration URL to terminal console for easy developer access/testing
    console.log("\n--- GENERATED REGISTRATION URL FOR TESTING ---");
    console.log(registrationUrl);
    console.log("---------------------------------------------\n");

    // 4. Set up email details
    const mailOptions = {
      from: `"Secure VDR" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Invitation to join ${group?.name} | Secure VDR`,
      text: `
Hello,

You have been invited to join the "${group?.name}" Virtual Data Room.

Message:
${description || "No message provided."}

Accept your invitation:
${registrationUrl}

This invitation expires in 7 days.

Regards,
Secure VDR Team
`,
      html: `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px;border:1px solid #ddd;border-radius:10px">
    <h2 style="color:#1e293b">Secure VDR Invitation</h2>

    <p>Hello,</p>

    <p>You have been invited to join the following Virtual Data Room.</p>

    <table style="margin:20px 0">
        <tr>
            <td><strong>Group</strong></td>
            <td>${group?.name}</td>
        </tr>
        <tr>
            <td><strong>Message</strong></td>
            <td>${description || "No message provided."}</td>
        </tr>
    </table>

    <p style="margin:30px 0">
        <a href="${registrationUrl}"
           style="background:#2563eb;color:#fff;padding:12px 24px;
           text-decoration:none;border-radius:6px;font-weight:bold">
           Accept Invitation
        </a>
    </p>

    <p>If the button doesn't work, copy and paste this link into your browser:</p>

    <p>
        <a href="${registrationUrl}">
            ${registrationUrl}
        </a>
    </p>

    <hr>

    <p style="font-size:13px;color:#666">
        This invitation expires in <strong>7 days</strong>.
    </p>

    <p style="font-size:13px;color:#666">
        Secure VDR Team
    </p>
</div>
`,
    };

    // 5. Send Email if SMTP credentials exist, otherwise skip to keep testing active
    try {
      if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
      } else {
        console.log(
          "SMTP environment variables not set. Invitation URL generated mock-successfully.",
        );
      }
    } catch (mailError) {
      console.error(
        "Email sending failed, but invitation record was saved:",
        mailError,
      );
    }

    return NextResponse.json({ success: true, invitation, registrationUrl });
  } catch (error) {
    console.error("Invite Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  };
}
