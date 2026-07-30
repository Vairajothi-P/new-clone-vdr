import { NextResponse } from 'next/server';
import * as emailService from '@/services/emailService';
import { resend } from '@/lib/resend';

function isAuthorizedAdmin(role) {
  const allowedRoles = ['super_admin', 'business_owner', 'admin'];
  return role && allowedRoles.includes(role);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, payload, role } = body;

    // Validate authorization for sending administrative emails
    if (!isAuthorizedAdmin(role)) {
      return NextResponse.json(
        { error: "Unauthorized. Only Business Owner or Admin can trigger administrative emails." },
        { status: 403 }
      );
    }

    let result = null;
    if (action === 'request') {
      result = await emailService.sendRequestMailToAdmin(payload);
    } else if (action === 'approval') {
      result = await emailService.sendApprovalMailToUser(payload);
    } else if (action === 'rejection') {
      result = await emailService.sendRejectionMailToUser(payload);
    } else if (action === 'custom') {
      const { to, subject, html } = payload;
      const resendResult = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'VDR System <onboarding@resend.dev>',
        to,
        subject,
        html,
      });
      result = { success: true, result: resendResult };
    } else {
      return NextResponse.json({ error: `Unknown email action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /send-email] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
