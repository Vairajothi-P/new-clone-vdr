import { NextResponse } from 'next/server';
import * as workspaceService from '@/services/workspaceService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const email = searchParams.get('email');

    // If an email is provided, return the status for that email
    if (email) {
      const result = await workspaceService.getUserRequestStatusByEmail(email);
      return NextResponse.json({ success: true, ...result });
    }

    // Otherwise return requests list
    let requests;
    if (status && status !== 'all') {
      requests = await workspaceService.getWorkspaceRequestsByStatus(status);
    } else {
      requests = await workspaceService.getAllWorkspaceRequests();
    }

    return NextResponse.json({ success: true, requests: requests || [] });
  } catch (error) {
    console.error('[API /request-workspace GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch workspace requests' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { companyName, adminName, adminEmail, phone, planId, password } = body;

    if (!companyName || !adminName || !adminEmail || !planId) {
      return NextResponse.json({ error: "Missing required fields for workspace request" }, { status: 400 });
    }

    const result = await workspaceService.createWorkspaceRequest({
      companyName: companyName.trim(),
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      phone: (phone || '').trim(),
      planId,
      password
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error('[API /request-workspace POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to request workspace' }, { status: 500 });
  }
}
