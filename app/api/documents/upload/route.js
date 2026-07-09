import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fernet from 'fernet';
import crypto from 'crypto';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const company_id = formData.get('company_id');
        const folder_id = formData.get('folder_id') || null;
        const uploaded_by = formData.get('uploaded_by');
        const index = formData.get('index') || '1';

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const originalName = file.name;
        const timestamp = Date.now();

        const originalStoragePath = `${company_id}/original_${timestamp}_${originalName}`;
        const secureStoragePath = `${company_id}/secure_${timestamp}_${originalName}`;

        const fileBuffer = Buffer.from(await file.arrayBuffer());

        // 1. Upload Original File Directly
        await supabase.storage.from('original-files').upload(originalStoragePath, fileBuffer, { contentType: file.type });

        // 2. Generate a valid Fernet Key (Must be 32 bytes/44 chars Base64)
        const randomBytes = crypto.randomBytes(32);
        // 🔥 CRITICAL: We keep the '=' padding so Fernet generates valid headers!
        const fernetKey = randomBytes.toString('base64');

        const secret = new fernet.Secret(fernetKey);
        const token = new fernet.Token({ secret });

        // 3. Encrypt Data
        const base64Data = fileBuffer.toString('base64');
        const encryptedString = token.encode(base64Data);

        // 4. Upload Encrypted Data to Vault (as Text)
        await supabase.storage.from('vault-files').upload(secureStoragePath, encryptedString, { contentType: 'text/plain' });

        // 5. Insert Database Row
        const { data: dbData, error: dbErr } = await supabase.from('documents').insert({
            company_id: company_id,
            folder_id: folder_id,
            uploaded_by: uploaded_by,
            name: originalName,
            file_path: secureStoragePath,
            original_file_path: originalStoragePath,
            mime_type: file.type,
            file_size_bytes: file.size,
            dek_ref: fernetKey, // Saved with padding
            index,
            security: 'Fernet Encrypted',
            is_deleted: false,
            is_bookmarked: false,
            is_downloaded: false,
            version: 1
        }).select('id').single();

        if (dbErr) throw dbErr;
        return NextResponse.json({ success: true, id: dbData.id });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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
//         const index = formData.get('index');

//         if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

//         const originalName = file.name;
//         const timestamp = Date.now();

//         // 1. Generate secure paths (Keeping original extensions!)
//         const originalStoragePath = `${company_id}/original_${timestamp}_${originalName}`;
//         const secureStoragePath = `${company_id}/secure_${timestamp}_${originalName}`;

//         // 2. Read File to Buffer
//         const fileBuffer = Buffer.from(await file.arrayBuffer());

//         // 3. Upload Original File Directly
//         await supabase.storage.from('original-files').upload(originalStoragePath, fileBuffer, { contentType: file.type });

//         // 4. Encrypt the file using Fernet
//         const randomBytes = crypto.randomBytes(32);
//         //const fernetKey = randomBytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
//         const fernetKey = randomBytes.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
//         const secret = new fernet.Secret(fernetKey);
//         const token = new fernet.Token({ secret: secret });

//         const base64Data = fileBuffer.toString('base64');
//         const encryptedString = token.encode(base64Data);

//         // 5. Upload Encrypted Data to Vault
//         await supabase.storage.from('vault-files').upload(secureStoragePath, Buffer.from(encryptedString), { contentType: 'text/plain' });

//         // 6. Insert Database Row
//         const { data: dbData, error: dbErr } = await supabase.from('documents').insert({
//             company_id: company_id,
//             folder_id: folder_id,
//             uploaded_by: uploaded_by,
//             name: originalName,
//             file_path: secureStoragePath,
//             original_file_path: originalStoragePath,
//             mime_type: file.type,
//             file_size_bytes: file.size,
//             dek_ref: fernetKey,
//             index: index,
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












