import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invitations, groups, users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
        }

        // Fetch invitation using Drizzle ORM
        const invRows = await db.select({
            id: invitations.id,
            group_id: invitations.groupId,
            email: invitations.email,
            token: invitations.token,
            description: invitations.description,
            invited_by: invitations.invitedBy,
            status: invitations.status,
            requires_nda: invitations.requiresNda,
            workspace_id: invitations.workspaceId,
            group_name: groups.name,
            company_id: groups.companyId,
            group_role: groups.role,
            group_workspace_id: groups.workspaceId,
            inviter_company_id: users.companyId
        })
        .from(invitations)
        .leftJoin(groups, eq(invitations.groupId, groups.id))
        .leftJoin(users, eq(invitations.invitedBy, users.id))
        .where(eq(invitations.token, token));

        if (!invRows || invRows.length === 0) {
            return NextResponse.json({ error: "Invalid Invitation" }, { status: 404 });
        }

        const row = invRows[0];

        // Format to match what the frontend expects
        const formattedInvitation = {
            id: row.id,
            group_id: row.group_id,
            email: row.email,
            token: row.token,
            description: row.description,
            invited_by: row.invited_by,
            status: row.status,
            requires_nda: row.requires_nda,
            workspace_id: row.workspace_id,
            groups: {
                name: row.group_name,
                company_id: row.company_id,
                role: row.group_role,
                workspace_id: row.group_workspace_id
            },
            inviter: {
                company_id: row.inviter_company_id
            }
        };

        return NextResponse.json({ success: true, invitation: formattedInvitation });

    } catch (error) {
        console.error("Verify Invitation Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
