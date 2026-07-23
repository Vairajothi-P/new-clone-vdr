import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { session } = await req.json();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (session.role === 'super_admin') return NextResponse.json({ hasDeleteAccess: true });

        const { data: myGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
        const groupIds = (myGroups || []).map(g => g.group_id);

        let hasDeleteAccess = false;
        if (groupIds.length > 0) {
            const { data: perms } = await supabase.from('permissions')
                .select('can_delete').in('group_id', groupIds).eq('can_delete', true).limit(1);
            if (perms && perms.length > 0) hasDeleteAccess = true;
        }

        return NextResponse.json({ hasDeleteAccess });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}