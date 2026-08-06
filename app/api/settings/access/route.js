import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { session } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (session.role === 'super_admin') {
            return NextResponse.json({ success: true, perms: { settings: true, branding: true, watermark: true, nda: true } });
        }

        const { data: ugRows } = await supabase.from('user_groups').select('group_id').eq('user_id', session.id);
        const groupIds = ugRows?.map(r => r.group_id) || [];

        let perms = { settings: false, branding: false, watermark: false, nda: false };

        if (groupIds.length > 0) {
            const { data: dbPerms } = await supabase
                .from('permissions')
                .select('can_access_settings, can_access_branding, can_access_watermarks, can_access_nda')
                .eq('scope', 'workspace')
                .in('group_id', groupIds);

            perms.settings = dbPerms?.some(p => p.can_access_settings) || false;
            perms.branding = dbPerms?.some(p => p.can_access_branding) || false;
            perms.watermark = dbPerms?.some(p => p.can_access_watermarks) || false;
            perms.nda = dbPerms?.some(p => p.can_access_nda) || false;
        }

        return NextResponse.json({ success: true, perms });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}