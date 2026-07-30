import { NextResponse } from 'next/server';
import * as workspaceService from '@/services/workspaceService';

function isAuthorizedAdmin(role) {
  const allowedRoles = ['super_admin', 'business_owner', 'admin'];
  return role && allowedRoles.includes(role);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { requestId, reason, adminUser } = body;

    if (!requestId) {
      return NextResponse.json({ error: "Missing Request ID" }, { status: 400 });
    }

    // Role-based access validation
    const role = adminUser?.role || body.role;
    if (!isAuthorizedAdmin(role)) {
      return NextResponse.json(
        { error: "Unauthorized. Only Business Owner or Admin can reject workspace requests." },
        { status: 403 }
      );
    }

    const result = await workspaceService.rejectWorkspaceRequest(requestId, reason, adminUser);

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('[API /reject-request] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reject workspace request' }, { status: 500 });
  }
}
