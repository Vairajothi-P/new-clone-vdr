import { NextResponse } from "next/server";
import { db } from "@/db";
import { groups, invitations } from "@/db/schema";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import crypto from "crypto";

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
    const fetchedGroups = await db
      .select({ name: groups.name })
      .from(groups)
      .where(eq(groups.id, group_id));
      
    const group = fetchedGroups[0];

    // 1. Generate a unique, secure invitation token
    const token = crypto.randomUUID();

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 2. Save invitation details into the 'invitations' table using Drizzle
    let invitation;
    try {
      const inserted = await db.insert(invitations).values({
        groupId: group_id,
        email: email,
        token: token,
        description: description,
        invitedBy: invited_by,
        status: "pending",
        requiresNda: requires_nda,
        expiresAt: expiresAt,
      }).returning();
      
      invitation = inserted[0];
    } catch (inviteError) {
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
      subject: `Invitation to join ${group?.name || 'Group'} | Secure VDR`,
      text: `
Hello,

You have been invited to join the "${group?.name || 'Group'}" Virtual Data Room.

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
            <td>${group?.name || 'Group'}</td>
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
</div>
`,
    };

    // 5. Send Email
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
      } else {
        console.log("SMTP credentials missing in .env, email skipped. Use the link in console.");
      }
    } catch (mailError) {
      console.error("Email sending failed, but invitation record was saved:", mailError);
    }

    return NextResponse.json({ success: true, invitation, registrationUrl });
  } catch (error) {
    console.error("Invite Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
