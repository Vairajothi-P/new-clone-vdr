import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fernet from 'fernet';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // 🔒 Safe on Backend
);

export async function POST(req, context) {
    try {
        // 🔥 NEXT.JS 15 FIX: You must await params!
        const params = await context.params;
        const docId = params.id;

        // The frontend sends the user info in the body
        const { userId, role, isHistoricalVersion } = await req.json();

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Get the document metadata
        const tableName = isHistoricalVersion ? 'document_versions' : 'documents';
        const { data: doc, error: docErr } = await supabase
            .from(tableName)
            .select('*')
            .eq('id', docId)
            .single();

        if (docErr || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
        
        const targetDocumentId = isHistoricalVersion ? doc.document_id : docId;

        // 2. Iron Wall Security Check
        let hasAccess = false;
        if (role === 'super_admin' || (doc.uploaded_by === userId && !doc.creator_revoked)) {
            hasAccess = true;
        } else {
            const { data: userGroups } = await supabase.from('user_groups').select('group_id').eq('user_id', userId);
            if (userGroups && userGroups.length > 0) {
                const groupIds = userGroups.map(g => g.group_id);
                const { data: perms } = await supabase.from('permissions').select('can_view, scope, document_id, folder_id').in('group_id', groupIds);

                const docPerms = perms.filter(p => p.scope === 'document' && p.document_id === targetDocumentId);
                const folderPerms = perms.filter(p => p.scope === 'folder' && p.folder_id === doc.folder_id);

                if (docPerms.some(p => p.can_view) || folderPerms.some(p => p.can_view)) hasAccess = true;
            }
        }

        if (!hasAccess) return NextResponse.json({ error: "Access Denied" }, { status: 403 });

        // 3. Download & Decrypt in Server Memory
        const { data: fileData, error: fileErr } = await supabase.storage.from('vault-files').download(doc.file_path);
        if (fileErr || !fileData) return NextResponse.json({ error: "Vault file not found" }, { status: 404 });

        const encryptedText = await fileData.text();
        const secret = new fernet.Secret(doc.dek_ref);
        const token = new fernet.Token({ token: encryptedText, secret, ttl: 0 });
        const decryptedBase64 = token.decode();

        const fileBuffer = Buffer.from(decryptedBase64, 'base64');

        // 4. Send raw bytes to frontend
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-Document-Name': doc.name,
                'X-Document-Ext': doc.name.split('.').pop().toLowerCase(),
                'Cache-Control': 'no-store, max-age=0'
            }
        });

    } catch (e) {
        console.error("View API Error:", e);
        return NextResponse.json({ error: "Failed to decrypt document" }, { status: 500 });
    }
}



// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';
// import fernet from 'fernet';

// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// export async function POST(req, { params }) {
//     try {
//         const docId = params.id;

//         // 1. Get the document metadata
//         const { data: doc, error: docErr } = await supabase
//             .from('documents')
//             .select('file_path, dek_ref')
//             .eq('id', docId)
//             .single();

//         if (docErr || !doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

//         // 2. Download the Encrypted File from the Vault
//         const { data: fileData, error: fileErr } = await supabase.storage
//             .from('vault-files')
//             .download(doc.file_path);

//         if (fileErr || !fileData) return NextResponse.json({ error: "Vault file not found" }, { status: 404 });

//         // 3. Decrypt the file on the server
//         const encryptedText = await fileData.text();
//         const secret = new fernet.Secret(doc.dek_ref);
//         const token = new fernet.Token({ token: encryptedText, secret, ttl: 0 });
//         const decryptedBase64 = token.decode();

//         // Convert Base64 string to a raw Buffer
//         const fileBuffer = Buffer.from(decryptedBase64, 'base64');

//         // 4. Send the raw bytes back to the browser viewer
//         return new NextResponse(fileBuffer, {
//             status: 200,
//             headers: {
//                 'Content-Type': 'application/octet-stream',
//                 'Cache-Control': 'no-store, max-age=0' // Prevent browser caching
//             }
//         });

//     } catch (e) {
//         console.error("Decrypt API Error:", e);
//         return NextResponse.json({ error: "Failed to decrypt document" }, { status: 500 });
//     }
// }