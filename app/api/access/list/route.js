import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { session } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let groupQuery = supabase.from('groups').select('*').eq('company_id', session.company_id).eq('workspace_id', session.active_workspace_id).order('created_at', { ascending: false });
        if (session.role !== 'super_admin') groupQuery = groupQuery.eq('created_by', session.id);

        const [
            { data: groupsData }, { data: foldersData }, { data: docsData },
            { data: permsData }, { data: userGroups }, { data: usersData }
        ] = await Promise.all([
            groupQuery,
            supabase.from('folders').select('*').eq('company_id', session.company_id).eq('workspace_id', session.active_workspace_id).eq('is_deleted', false),
            supabase.from('documents').select('id, name, folder_id, index, uploaded_by, creator_revoked').eq('company_id', session.company_id).eq('workspace_id', session.active_workspace_id).eq('is_deleted', false).order('created_at', { ascending: true }),
            supabase.from('permissions').select('id, document_id, folder_id, scope, group_id, can_view, can_edit, can_upload, can_download_secure, can_download_original, can_delete, can_redact').eq('company_id', session.company_id),
            supabase.from('user_groups').select('user_id, group_id'),
            supabase.from('users').select('id, name, email').eq('workspace_id', session.active_workspace_id)
        ]);

        // 🔥 CALCULATE ACCESS (Exactly like your old code, but super fast on the server)
        let myGroupIds = [];
        if (session.role !== 'super_admin' && userGroups) {
            myGroupIds = userGroups.filter(ug => ug.user_id === session.id).map(ug => ug.group_id);
        }

        const myPerms = {};
        if (session.role !== 'super_admin' && permsData) {
            permsData.forEach(p => {
                if (myGroupIds.includes(p.group_id)) {
                    if (p.scope === 'document' && p.document_id) myPerms[`doc_${p.document_id}`] = p;
                    if (p.scope === 'folder' && p.folder_id) myPerms[`fol_${p.folder_id}`] = p;
                }
            });
        }

        const allowedFolders = (foldersData || []).filter(f => {
            if (session.role === 'super_admin') return true;
            if (f.created_by === session.id && f.creator_revoked !== true) return true;
            return myPerms[`fol_${f.id}`]?.can_view === true;
        });

        const allowedDocs = (docsData || []).filter(doc => {
            if (session.role === 'super_admin') return true;
            if (doc.uploaded_by === session.id && doc.creator_revoked !== true) return true;
            if (myPerms[`doc_${doc.id}`]?.can_view === true) return true;
            if (doc.folder_id && myPerms[`fol_${doc.folder_id}`]?.can_view === true) return true;
            return false;
        }).map((doc, idx) => ({ ...doc, displayIndex: (idx + 1).toString() }));

        const membersMap = {};
        if (userGroups && usersData) {
            const userDict = {};
            usersData.forEach(u => userDict[u.id] = u);
            userGroups.forEach(ug => {
                if (!membersMap[ug.group_id]) membersMap[ug.group_id] = [];
                if (userDict[ug.user_id]) membersMap[ug.group_id].push(userDict[ug.user_id]);
            });
        }

        const map = {};
        (permsData || []).forEach(p => {
            if (p.scope === 'document' && p.document_id) map[`${p.group_id}_doc_${p.document_id}`] = p;
            else if (p.scope === 'folder' && p.folder_id) map[`${p.group_id}_fol_${p.folder_id}`] = p;
        });

        return NextResponse.json({ success: true, groups: groupsData || [], folders: allowedFolders, documents: allowedDocs, permissions: map, groupMembers: membersMap });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}