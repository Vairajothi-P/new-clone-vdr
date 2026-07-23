import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { session, changes, groupId } = await req.json();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let toUpsert = [];
        if (changes.length > 0) {
            const { data: existingPerms, error: fetchErr } = await supabase
                .from('permissions').select('id, scope, document_id, folder_id')
                .eq('company_id', session.company_id).eq('group_id', groupId);

            if (fetchErr) throw fetchErr;

            for (const change of changes) {
                const { targetId, type, updatedState } = change;
                const existing = (existingPerms || []).find(p =>
                    p.scope === (type === 'doc' ? 'document' : 'folder') &&
                    (type === 'doc' ? p.document_id === targetId : p.folder_id === targetId)
                );

                const payload = {
                    company_id: session.company_id,
                    group_id: groupId,
                    scope: type === 'doc' ? 'document' : 'folder',
                    document_id: type === 'doc' ? targetId : null,
                    folder_id: type === 'fol' ? targetId : null,
                    can_view: updatedState.can_view,
                    can_edit: updatedState.can_edit,
                    can_upload: updatedState.can_upload,
                    can_download_secure: updatedState.can_download_secure,
                    can_download_original: updatedState.can_download_original,
                    can_delete: updatedState.can_delete,
                    can_redact: updatedState.can_redact,
                    updated_at: new Date().toISOString()
                };

                if (existing) payload.id = existing.id;
                toUpsert.push(payload);
            }
        }

        if (toUpsert.length > 0) {
            const { error: upsertErr } = await supabase.from('permissions').upsert(toUpsert);
            if (upsertErr) throw upsertErr;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}