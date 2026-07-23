import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Enable CORS because the request comes from a local file (file://)
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

export async function POST(req) {
    try {
        const { email, password, docId } = await req.json();

        // 1. Verify User Credentials
        const { data: users } = await supabase.from('users').select('id, role, password_hash').eq('email', email);
        if (!users || users.length === 0 || users[0].password_hash !== password) {
            return NextResponse.json({ error: "Invalid email or password." }, { status: 401, headers: corsHeaders });
        }
        const user = users[0];

        // 2. Verify Document Access
        const { data: doc } = await supabase.from('documents').select('dek_ref, folder_id, uploaded_by, creator_revoked').eq('id', docId).single();
        if (!doc) return NextResponse.json({ error: "Document missing." }, { status: 404, headers: corsHeaders });

        let hasAccess = false;
        let canEdit = false;

        if (user.role === 'super_admin' || (doc.uploaded_by === user.id && !doc.creator_revoked)) {
            hasAccess = true; canEdit = true;
        } else {
            // Check specific permissions logic
            const { data: userGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', user.id);
            if (userGroups?.length > 0) {
                const groupIds = userGroups.map(g => g.group_id);
                const { data: perms } = await supabase.from('permissions').select('can_view, can_edit, document_id, folder_id').in('group_id', groupIds);

                const docPerms = perms.filter(p => p.document_id === docId);
                const folderPerms = perms.filter(p => p.folder_id === doc.folder_id);

                if (docPerms.some(p => p.can_view) || folderPerms.some(p => p.can_view)) hasAccess = true;
                if (docPerms.some(p => p.can_edit) || folderPerms.some(p => p.can_edit)) canEdit = true;
            }
        }

        if (!hasAccess) return NextResponse.json({ error: "Access Revoked." }, { status: 403, headers: corsHeaders });

        // 3. Return the Keys safely!
        return NextResponse.json({ success: true, dek_ref: doc.dek_ref, canEdit }, { headers: corsHeaders });

    } catch (e) {
        return NextResponse.json({ error: "Server Error" }, { status: 500, headers: corsHeaders });
    }
}