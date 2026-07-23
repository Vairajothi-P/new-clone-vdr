import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // 🔒 Service Role: Full DB Access
);

export async function POST(req) {
    try {
        const { action, payload, session } = await req.json();

        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const companyId = session.company_id;
        const userId = session.id;

        switch (action) {
            case 'create_folder':
                const { parentId, name, index } = payload;
                const { error: cfErr } = await supabase.from('folders').insert({
                    company_id: companyId, parent_folder_id: parentId,
                    name: name, index_number: index, created_by: userId
                });
                if (cfErr) throw cfErr;
                break;

            case 'rename':
                const { itemId, type, newName, currentVersion } = payload;
                const table = type === 'folder' ? 'folders' : 'documents';
                const { error: renErr } = await supabase.from(table)
                    .update({ name: newName, version: currentVersion + 1 })
                    .eq('id', itemId).eq('company_id', companyId);
                if (renErr) throw renErr;
                break;

            case 'bookmark':
                const { id: bmId, itemType, isBookmarked } = payload;
                const bmTable = itemType === 'folder' ? 'folders' : 'documents';
                await supabase.from(bmTable).update({ is_bookmarked: !isBookmarked }).eq('id', bmId);
                break;

            case 'trash':
                const { docIds: tDocs, folderIds: tFolders } = payload;
                if (tDocs.length > 0) await supabase.from('documents').update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: userId }).in('id', tDocs);
                if (tFolders.length > 0) await supabase.from('folders').update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: userId }).in('id', tFolders);
                break;

            case 'recover':
                const { docIds: rDocs, folderIds: rFolders } = payload;
                if (rDocs.length > 0) await supabase.from('documents').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('id', rDocs);
                if (rFolders.length > 0) await supabase.from('folders').update({ is_deleted: false, deleted_at: null, deleted_by: null }).in('id', rFolders);
                break;

            case 'permanent_delete':
                const { docIds: pDocs, folderIds: pFolders } = payload;
                if (pDocs.length > 0) await supabase.from('documents').delete().in('id', pDocs);
                if (pFolders.length > 0) await supabase.from('folders').delete().in('id', pFolders);
                break;

            case 'move':
                const { docIds: mDocs, folderIds: mFolders, targetFolderId } = payload;
                if (mDocs.length > 0) await supabase.from('documents').update({ folder_id: targetFolderId }).in('id', mDocs);
                if (mFolders.length > 0) await supabase.from('folders').update({ parent_folder_id: targetFolderId }).in('id', mFolders);
                break;

            case 'reindex':
                // Handles the drag and drop re-ordering logic bulk updates
                const { folderUpdates, docUpdates } = payload;
                if (folderUpdates.length > 0) {
                    await Promise.all(folderUpdates.map(u => supabase.from('folders').update({ index_number: u.index_number }).eq('id', u.id)));
                }
                if (docUpdates.length > 0) {
                    await Promise.all(docUpdates.map(u => supabase.from('documents').update({ index: u.index }).eq('id', u.id)));
                }
                break;

            default:
                throw new Error("Unknown action");
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Action API crash:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}