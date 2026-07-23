import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { session, groupSlug } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const companyId = session.company_id;

        // 1. Fetch Group
        const { data: groups, error: groupsError } = await supabase
            .from("groups")
            .select("*")
            .eq("company_id", companyId)
            .eq("id", groupSlug);

        if (groupsError || !groups?.length) return NextResponse.json({ error: "Group not found" }, { status: 404 });
        const group = groups[0];

        // 2. Fetch Members
        const { data: ugRows } = await supabase.from("user_groups").select("user_id").eq("group_id", group.id);
        const userIds = ugRows?.map(r => r.user_id) || [];
        
        let members = [];
        if (userIds.length > 0) {
            const { data: users, error: usersError } = await supabase
                .from("users")
                .select("id, name, email, phone_number, status")
                .in("id", userIds)
                .eq("company_id", companyId);
            
            if (!usersError) members = users || [];
        }

        // 3. Check Logged-in User's Permissions (Can they add/remove members?)
        let canAddMembers = false;
        let canRemoveMembers = false;
        let canEditPermissions = false;

        if (session.role === 'super_admin') {
            canAddMembers = true;
            canRemoveMembers = true;
            canEditPermissions = true;
        } else {
            const { data: myGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
            const myGroupIds = myGroups?.map(r => r.group_id) || [];
            
            if (myGroupIds.length > 0) {
                const { data: perms } = await supabase
                    .from('permissions')
                    .select('can_add_members, can_remove_members, can_access_edit_permissions')
                    .eq('company_id', companyId)
                    .eq('scope', 'workspace')
                    .in('group_id', myGroupIds);

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