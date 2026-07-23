import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fernet from 'fernet';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };

export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

export async function POST(req) {
    try {
        const { docId, newEncryptedPayload } = await req.json();

        const { data: doc } = await supabase.from('documents').select('file_path, original_file_path, dek_ref, version').eq('id', docId).single();
        if (!doc) throw new Error("Metadata not found");

        // 1. Sync Vault
        await supabase.storage.from('vault-files').upload(doc.file_path, Buffer.from(newEncryptedPayload), { contentType: 'text/plain', upsert: true });

        // 2. Sync Original
        if (doc.original_file_path) {
            const secret = new fernet.Secret(doc.dek_ref);
            const token = new fernet.Token({ token: newEncryptedPayload, secret, ttl: 0 });
            const decryptedBase64 = token.decode();
            await supabase.storage.from('original-files').upload(doc.original_file_path, Buffer.from(decryptedBase64, 'base64'), { upsert: true });
        }

        // 3. Update version in database
        await supabase.from('documents').update({ version: (doc.version || 1) + 1 }).eq('id', docId);

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500, headers: corsHeaders });
    }
}





// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';
// import fernet from 'fernet';

// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY // YOU MUST USE SERVICE ROLE KEY HERE
// );

// export async function POST(req) {
//     try {
//         const { docId, newEncryptedPayload } = await req.json();

//         // 1. Fetch paths from DB
//         const { data: doc, error: docErr } = await supabase
//             .from('documents')
//             .select('file_path, original_file_path, dek_ref')
//             .eq('id', docId)
//             .single();

//         if (docErr || !doc) throw new Error("Document metadata not found");

//         // 2. SYNC VAULT (Encrypted)
//         const { error: vaultErr } = await supabase.storage
//             .from('vault-files')
//             .upload(doc.file_path, Buffer.from(newEncryptedPayload), {
//                 contentType: 'text/plain',
//                 upsert: true
//             });
//         if (vaultErr) throw vaultErr;

//         // 3. SYNC ORIGINAL (Decrypted)
//         if (doc.original_file_path) {
//             const secret = new fernet.Secret(doc.dek_ref);
//             const token = new fernet.Token({ token: newEncryptedPayload, secret, ttl: 0 });
//             const decryptedBase64 = token.decode();
//             const fileBuffer = Buffer.from(decryptedBase64, 'base64');

//             const { error: origErr } = await supabase.storage
//                 .from('original-files')
//                 .upload(doc.original_file_path, fileBuffer, {
//                     upsert: true
//                 });
//             if (origErr) throw origErr;
//         }

//         return NextResponse.json({ success: true });
//     } catch (e) {
//         return NextResponse.json({ success: false, error: e.message }, { status: 500 });
//     }
// }