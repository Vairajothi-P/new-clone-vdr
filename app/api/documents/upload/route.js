import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fernet from 'fernet';
import crypto from 'crypto'; // Native Node.js crypto

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // 🔒 Service Role required for backend storage!
);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const company_id = formData.get('company_id');
        let folder_id = formData.get('folder_id');
        const uploaded_by = formData.get('uploaded_by');
        const index = formData.get('index');

        if (!file) throw new Error("No file provided");

        // Convert the uploaded file into a raw Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 1. Define Dual Bucket Paths
        const timestamp = Date.now();
        const originalStoragePath = `${company_id}/original_${timestamp}_${file.name}`;
        const secureStoragePath = `${company_id}/secure_${timestamp}_${file.name}`;

        // 2. Upload RAW Original to the 'original-files' bucket
        const { error: origErr } = await supabase.storage
            .from('original-files')
            .upload(originalStoragePath, buffer, { contentType: file.type || 'application/octet-stream' });
        if (origErr) throw new Error("Original Upload Failed: " + origErr.message);

        // 3. Encrypt for the Secure Vault
        // Generate a true random 32-byte AES key
        const randomBytes = crypto.randomBytes(32);
        const fernetKey = randomBytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const secret = new fernet.Secret(fernetKey);
        const token = new fernet.Token({ secret: secret });

        // Fernet requires Base64 text to encrypt, so we convert the raw buffer to Base64 first
        const base64Data = buffer.toString('base64');
        const encryptedString = token.encode(base64Data);

        // 4. Upload Encrypted text to 'vault-files' bucket
        const { error: secureErr } = await supabase.storage
            .from('vault-files')
            .upload(secureStoragePath, Buffer.from(encryptedString), { contentType: 'text/plain' });
        if (secureErr) throw new Error("Secure Upload Failed: " + secureErr.message);

        // 5. Save all metadata to the Postgres Database
        if (folder_id === '') folder_id = null; // Clean up empty strings

        const { data: docData, error: dbErr } = await supabase.from('documents').insert({
            company_id: company_id,
            folder_id: folder_id,
            uploaded_by: uploaded_by,
            name: file.name,
            file_path: secureStoragePath,
            original_file_path: originalStoragePath,
            mime_type: file.type || 'application/octet-stream',
            file_size_bytes: file.size,
            dek_ref: fernetKey,
            index: index,
            security: 'Fernet Encrypted',
            version: 1
        }).select('id').single();

        if (dbErr) throw new Error("Database sync failed: " + dbErr.message);

        return NextResponse.json({ success: true, id: docData.id });

    } catch (e) {
        console.error("Upload API Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}






// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';
// import fernet from 'fernet';
// import crypto from 'crypto';

// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function POST(req) {
//     try {
//         const formData = await req.formData();
//         const file = formData.get('file');
//         const company_id = formData.get('company_id');
//         const folder_id = formData.get('folder_id') || null;
//         const uploaded_by = formData.get('uploaded_by');
//         const index = formData.get('index') || '1';

//         if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

//         const originalName = file.name;
//         const timestamp = Date.now();

//         const originalStoragePath = `${company_id}/original_${timestamp}_${originalName}`;
//         const secureStoragePath = `${company_id}/secure_${timestamp}_${originalName}`;

//         const fileBuffer = Buffer.from(await file.arrayBuffer());

//         // 1. Upload Original File Directly
//         await supabase.storage.from('original-files').upload(originalStoragePath, fileBuffer, { contentType: file.type });

//         // 2. Generate a valid Fernet Key (Must be 32 bytes/44 chars Base64)
//         const randomBytes = crypto.randomBytes(32);
//         // 🔥 CRITICAL: We keep the '=' padding so Fernet generates valid headers!
//         const fernetKey = randomBytes.toString('base64');

//         const secret = new fernet.Secret(fernetKey);
//         const token = new fernet.Token({ secret });

//         // 3. Encrypt Data
//         const base64Data = fileBuffer.toString('base64');
//         const encryptedString = token.encode(base64Data);

//         // 4. Upload Encrypted Data to Vault (as Text)
//         await supabase.storage.from('vault-files').upload(secureStoragePath, encryptedString, { contentType: 'text/plain' });

//         // 5. Insert Database Row
//         const { data: dbData, error: dbErr } = await supabase.from('documents').insert({
//             company_id: company_id,
//             folder_id: folder_id,
//             uploaded_by: uploaded_by,
//             name: originalName,
//             file_path: secureStoragePath,
//             original_file_path: originalStoragePath,
//             mime_type: file.type,
//             file_size_bytes: file.size,
//             dek_ref: fernetKey, // Saved with padding
//             index,
//             security: 'Fernet Encrypted',
//             is_deleted: false,
//             is_bookmarked: false,
//             is_downloaded: false,
//             version: 1
//         }).select('id').single();

//         if (dbErr) throw dbErr;
//         return NextResponse.json({ success: true, id: dbData.id });

//     } catch (error) {
//         console.error('Upload Error:', error);
//         return NextResponse.json({ error: error.message }, { status: 500 });
//     }
// }



