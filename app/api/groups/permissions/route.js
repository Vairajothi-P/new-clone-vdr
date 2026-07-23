import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { action, session, groupId, permissionsPayload } = await req.json();
        
        if (!session || !session.company_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ─── ACTION: FETCH PERMISSIONS ───
        if (action === 'fetch') {
            const { data, error } = await supabase
                .from("permissions")
                .select("*")
                .eq("group_id", groupId)
                .eq("company_id", session.company_id);

            if (error) throw error;
            return NextResponse.json({ success: true, rawPermissions: data || [] });
        }

        // ─── ACTION: SAVE PERMISSIONS ───
        if (action === 'save') {
            const { toDeleteIds, toUpsert } = permissionsPayload;

            // 1. Process Deletions (Modules turned off)
            if (toDeleteIds?.length > 0) {
                const { error: delErr } = await supabase
                    .from("permissions")
                    .delete()
                    .in("id", toDeleteIds);
                if (delErr) throw delErr;
            }

            // 2. Process Saves (Split to avoid the "null ID" Postgres crash)
            if (toUpsert?.length > 0) {
                // Filter items that ALREADY have an ID (Updates)
                const toUpdate = toUpsert.filter(p => p.id);
                // Filter items that DO NOT have an ID (New Inserts)
                const toInsert = toUpsert.filter(p => !p.id);

                if (toUpdate.length > 0) {
                    const { error: upErr } = await supabase.from('permissions').upsert(toUpdate);
                    if (upErr) throw upErr;
                }

                if (toInsert.length > 0) {
                    const { error: inErr } = await supabase.from('permissions').insert(toInsert);
                    if (inErr) throw inErr;
                }
            }

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    } catch (error) {
        console.error("Permissions API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}