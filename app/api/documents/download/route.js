import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { generateSecureHtmlWrapper } from '@/utils/vdrEngine';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { docId, actionType, session } = await req.json();

        if (!session || !session.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Handle listing downloads
        if (actionType === 'list_my_downloads') {
            const { data: logs, error: logsErr } = await supabase
                .from('document_edit_logs')
                .select('*')
                .eq('user_id', session.id)
                .in('action_type', ['DOWNLOAD_ORIGINAL', 'DOWNLOAD_PDF'])
                .order('created_at', { ascending: false });

            if (logsErr) throw new Error("Failed to fetch downloads: " + logsErr.message);
            
            const docIds = [...new Set((logs || []).map(log => log.document_id))];
            let docs = [];
            
            if (docIds.length > 0) {
                const { data: fetchedDocs, error: docsErr } = await supabase
                    .from('documents')
                    .select('id, name, mime_type, file_size_bytes')
                    .in('id', docIds);
                if (!docsErr && fetchedDocs) {
                    docs = fetchedDocs;
                }
            }
            
            const downloads = (logs || []).map(log => {
                const doc = docs.find(d => d.id === log.document_id);
                return {
                    id: log.id,
                    action_type: log.action_type,
                    created_at: log.created_at,
                    document: doc || null
                };
            });
            
            return NextResponse.json({ success: true, downloads });
        }

        // 1. Fetch Document Metadata
        const { data: doc, error: docErr } = await supabase.from('documents').select('*').eq('id', docId).single();
        if (docErr || !doc) throw new Error("Document not found");

        if (!doc.is_downloaded) {
            await supabase.from('documents').update({ is_downloaded: true }).eq('id', docId);
        }

        // 2. Handle ORIGINAL Download
        if (actionType === 'original') {
            if (!doc.original_file_path) throw new Error("Original file not available.");

            const { data, error } = await supabase.storage.from('original-files').download(doc.original_file_path);
            if (error) throw new Error("Storage Error: " + error.message);

            // Log download edit action
            await supabase.from('document_edit_logs').insert([{
                user_id: session.id,
                document_id: doc.id,
                action_type: 'DOWNLOAD_ORIGINAL'
            }]);

            const buffer = Buffer.from(await data.arrayBuffer());
            return new NextResponse(buffer, {
                status: 200,
                headers: {
                    'Content-Type': doc.mime_type || 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${doc.name}"`
                }
            });
        }
        // 3. Handle SECURE HTML Download
        else {
            const { data, error } = await supabase.storage.from('vault-files').download(doc.file_path);
            if (error) throw new Error("Storage Error: " + error.message);

            const encryptedPayload = await data.text();
            const fileExt = doc.name.split('.').pop().toLowerCase();

            const backendUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

            // Generate the HTML
            const htmlContent = generateSecureHtmlWrapper(doc.id, doc.name, fileExt, encryptedPayload, backendUrl);

            // Log download edit action
            await supabase.from('document_edit_logs').insert([{
                user_id: session.id,
                document_id: doc.id,
                action_type: 'DOWNLOAD_PDF'
            }]);

            
            return new NextResponse(htmlContent, {
                status: 200,
                headers: {
                    'Content-Type': 'text/html',
                    'Content-Disposition': `attachment; filename="${doc.name.split('.')[0]}_Secure.html"`
                }
            });
        }

    } catch (err) {
        console.error('Download API crash:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}