import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { version_id, session } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Fetch the historical version
        const { data: historicalVersion, error: fetchErr } = await supabase
            .from('document_versions')
            .select('*')
            .eq('id', version_id)
            .single();

        if (fetchErr || !historicalVersion) throw new Error("Historical version not found");

        const documentId = historicalVersion.document_id;

        // 2. Fetch the current document
        const { data: currentDoc, error: currentErr } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (currentErr || !currentDoc) throw new Error("Current document not found");

        // 3. Move current document into document_versions to preserve it
        const { error: archiveErr } = await supabase.from('document_versions').insert({
            document_id: currentDoc.id,
            version_number: currentDoc.version || 1,
            name: currentDoc.name,
            file_path: currentDoc.file_path,
            original_file_path: currentDoc.original_file_path,
            storage_bucket: 'vault-files', 
            mime_type: currentDoc.mime_type,
            file_size_bytes: currentDoc.file_size_bytes,
            workspace_id: currentDoc.workspace_id,
            company_id: currentDoc.company_id,
            folder_id: currentDoc.folder_id,
            dek_ref: currentDoc.dek_ref,
            security: currentDoc.security,
            creator_revoked: currentDoc.creator_revoked,
            is_redacted: currentDoc.is_redacted,
            index: currentDoc.index,
            file_data: currentDoc.file_data,
            uploaded_by: currentDoc.uploaded_by,
            created_at: currentDoc.created_at,
            upload_comment: currentDoc.upload_comment
        });

        if (archiveErr) throw new Error("Failed to archive current version: " + archiveErr.message);

        // 4. Promote the historical version to be the current document
        const nextVersionNumber = (currentDoc.version || 1) + 1;
        const { error: promoteErr } = await supabase.from('documents').update({
            name: historicalVersion.name,
            file_path: historicalVersion.file_path,
            original_file_path: historicalVersion.original_file_path,
            mime_type: historicalVersion.mime_type,
            file_size_bytes: historicalVersion.file_size_bytes,
            dek_ref: historicalVersion.dek_ref,
            security: historicalVersion.security,
            is_redacted: historicalVersion.is_redacted,
            file_data: historicalVersion.file_data,
            version: nextVersionNumber,
            upload_comment: `Restored from version ${historicalVersion.version_number}`,
            updated_at: new Date().toISOString()
        }).eq('id', documentId);

        if (promoteErr) throw new Error("Failed to promote historical version: " + promoteErr.message);

        // 5. Update the restored_at and restored_by on the historical version row (audit log)
        await supabase.from('document_versions').update({
            restored_at: new Date().toISOString(),
            restored_by: session.id
        }).eq('id', version_id);

        return NextResponse.json({ success: true, document_id: documentId });

    } catch (e) {
        console.error("Restore Version API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
