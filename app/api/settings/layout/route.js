import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { session } = await req.json();
        if (!session || !session.company_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Super Admin bypass
        if (session.role === 'super_admin') {
            return NextResponse.json({
                success: true,
                perms: { settings: true, branding: true, watermark: true, nda: true }
            });
        }

        // 2. Fetch User Groups
        const { data: ugRows } = await supabase
            .from('user_groups')
            .select('group_id')
            .eq('user_id', session.id);

        const groupIds = ugRows?.map(r => r.group_id) || [];

        if (groupIds.length === 0) {
            return NextResponse.json({ success: true, perms: { settings: false } });
        }

        // 3. Fetch Permissions from DB
        const { data: dbPerms } = await supabase
            .from('permissions')
            .select('can_access_settings, can_access_branding, can_access_watermarks, can_access_nda')
            .eq('scope', 'workspace')
            .in('group_id', groupIds);

        const hasSettings = dbPerms?.some(p => p.can_access_settings);
        const hasBranding = dbPerms?.some(p => p.can_access_branding);
        const hasWatermark = dbPerms?.some(p => p.can_access_watermarks);
        const hasNda = dbPerms?.some(p => p.can_access_nda);

        return NextResponse.json({
            success: true,
            perms: {
                settings: !!hasSettings,
                branding: !!hasBranding,
                watermark: !!hasWatermark,
                nda: !!hasNda
            }
        });

    } catch (err) {
        console.error("Settings Layout API Error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}