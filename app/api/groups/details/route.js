import { NextResponse } from 'next/server';
import { db } from '@/db';
import { groups, userGroups, users, permissions } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { session, groupSlug } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const companyId = session.company_id;

        // 1. Fetch Group
        const fetchedGroups = await db.select()
            .from(groups)
            .where(and(eq(groups.companyId, companyId), eq(groups.id, groupSlug)));

        if (!fetchedGroups || fetchedGroups.length === 0) return NextResponse.json({ error: "Group not found" }, { status: 404 });
        
        // Map to snake_case for frontend
        const group = {
            id: fetchedGroups[0].id,
            company_id: fetchedGroups[0].companyId,
            name: fetchedGroups[0].name,
            description: fetchedGroups[0].description,
            created_by: fetchedGroups[0].createdBy,
            created_at: fetchedGroups[0].createdAt,
            updated_at: fetchedGroups[0].updatedAt,
            role: fetchedGroups[0].role,
            workspace_id: fetchedGroups[0].workspaceId,
        };

        // 2. Fetch Members
        const ugRows = await db.select({ userId: userGroups.userId })
            .from(userGroups)
            .where(eq(userGroups.groupId, group.id));
            
        const userIds = ugRows.map(r => r.userId);
        
        let members = [];
        if (userIds.length > 0) {
            const fetchedUsers = await db.select({
                id: users.id,
                name: users.name,
                email: users.email,
                phone_number: users.phoneNumber,
                status: users.status
            })
            .from(users)
            .where(
                and(
                    inArray(users.id, userIds),
                    eq(users.companyId, companyId)
                )
            );
            
            members = fetchedUsers;
        }

        // 3. Check Logged-in User's Permissions
        let canAddMembers = false;
        let canRemoveMembers = false;
        let canEditPermissions = false;

        if (session.role === 'super_admin') {
            canAddMembers = true;
            canRemoveMembers = true;
            canEditPermissions = true;
        } else {
            const myGroups = await db.select({ groupId: userGroups.groupId })
                .from(userGroups)
                .where(eq(userGroups.userId, session.id));
                
            const myGroupIds = myGroups.map(r => r.groupId);
            
            if (myGroupIds.length > 0) {
                const perms = await db.select({
                    can_add_members: permissions.canAddMembers,
                    can_remove_members: permissions.canRemoveMembers,
                    can_access_edit_permissions: permissions.canAccessEditPermissions
                })
                .from(permissions)
                .where(
                    and(
                        eq(permissions.companyId, companyId),
                        eq(permissions.scope, 'workspace'),
                        inArray(permissions.groupId, myGroupIds)
                    )
                );

                if (perms && perms.length > 0) {
                    canAddMembers = perms.some(p => p.can_add_members);
                    canRemoveMembers = perms.some(p => p.can_remove_members);
                    canEditPermissions = perms.some(p => p.can_access_edit_permissions);
                }
            }
        }

        return NextResponse.json({ success: true, group, members, canAddMembers, canRemoveMembers, canEditPermissions });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}