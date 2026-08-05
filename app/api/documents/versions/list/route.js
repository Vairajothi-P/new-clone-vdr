import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { session } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch all historical versions for the company and workspace
        let query = supabase.from('document_versions')
            .select(`
                *,
                documents!inner(name, folder_id, is_deleted)
            `)
            .eq('company_id', session.company_id)
            .eq('documents.is_deleted', false);
            
        if (session.active_workspace_id) {
            query = query.eq('workspace_id', session.active_workspace_id);
        }
            
        const { data: versions, error } = await query;
        if (error) throw new Error(error.message);

        // Fetch users to map uploaded_by and restored_by
        const { data: users } = await supabase.from('users').select('id, name').eq('company_id', session.company_id);
        const userMap = {};
        if (users) {
            users.forEach(u => { userMap[u.id] = u.name; });
        }

        const mappedVersions = versions.map(v => ({
            ...v,
            uploaded_by_name: userMap[v.uploaded_by] || 'Unknown',
            restored_by_name: v.restored_by ? (userMap[v.restored_by] || 'Unknown') : null
        }));

        // Note: For a production ABAC system, you would filter `mappedVersions` 
        // to only include documents the user has `can_view` access to, similar to page.jsx.
        // We will pass the full list to the frontend and the frontend will use the 
        // same `myPerms` logic used in page.jsx to filter what they can see.

        return NextResponse.json({ success: true, versions: mappedVersions });
    } catch (e) {
        console.error("List Versions API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
