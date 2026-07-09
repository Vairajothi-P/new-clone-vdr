// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';
// import fernet from 'fernet';

// const supabase = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // 🔥 ADD THESE CORS HEADERS! This stops the "Failed to Fetch" error.
// const corsHeaders = {
//     'Access-Control-Allow-Origin': '*', // Allows requests from the local downloaded HTML file
//     'Access-Control-Allow-Methods': 'POST, OPTIONS',
//     'Access-Control-Allow-Headers': 'Content-Type, Authorization',
// };

// // Handle Preflight requests for CORS
// export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

// export async function POST(req) {
//     try {
//         const body = await req.json();
//         const { doc_id, new_encrypted_payload } = body;

//         const { data: doc, error: fetchErr } = await supabase.from('documents')
//             .select('file_path, original_file_path, dek_ref')
//             .eq('id', doc_id).single();

//         if (fetchErr) throw fetchErr;

//         const { error: uploadErr } = await supabase.storage.from('vault-files').upload(doc.file_path, Buffer.from(new_encrypted_payload), {
//             contentType: 'text/plain',
//             upsert: true
//         });
//         if (uploadErr) throw uploadErr;

//         if (doc.original_file_path) {
//             const secret = new fernet.Secret(doc.dek_ref);
//             const token = new fernet.Token({ token: new_encrypted_payload, secret, ttl: 0 });
//             const decryptedBase64 = token.decode();

//             const fileBuffer = Buffer.from(decryptedBase64, 'base64');
//             await supabase.storage.from('original-files').upload(doc.original_file_path, fileBuffer, {
//                 upsert: true
//             });
//         }

//         await supabase.from('documents').update({ updated_at: new Date().toISOString() }).eq('id', doc_id);

//         // 🔥 SEND HEADERS WITH SUCCESS RESPONSE
//         return NextResponse.json({ success: true, message: "Sync Complete" }, { headers: corsHeaders });
//     } catch (error) {
//         console.error('Update Error:', error);
//         // 🔥 SEND HEADERS WITH ERROR RESPONSE
//         return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
//     }
// }










// // import { createClient } from '@supabase/supabase-js';
// // import { NextResponse } from 'next/server';
// // import fernet from 'fernet';

// // const supabase = createClient(
// //     process.env.NEXT_PUBLIC_SUPABASE_URL,
// //     process.env.SUPABASE_SERVICE_ROLE_KEY
// // );

// // export async function POST(req) {
// //     try {
// //         const body = await req.json();
// //         const { doc_id, new_encrypted_payload } = body;

// //         // 1. Get current file paths & the Fernet Decryption Key
// //         const { data: doc, error: fetchErr } = await supabase.from('documents')
// //             .select('file_path, original_file_path, dek_ref')
// //             .eq('id', doc_id).single();

// //         if (fetchErr) throw fetchErr;

// //         // 2. Overwrite the Encrypted Vault File
// //         const { error: uploadErr } = await supabase.storage.from('vault-files').upload(doc.file_path, Buffer.from(new_encrypted_payload), {
// //             contentType: 'text/plain',
// //             upsert: true // 🔥 Overwrites the old file!
// //         });
// //         if (uploadErr) throw uploadErr;

// //         // 3. DECRYPT THE FILE ON THE SERVER (To update the Original Bucket)
// //         if (doc.original_file_path) {
// //             const secret = new fernet.Secret(doc.dek_ref);
// //             const token = new fernet.Token({ token: new_encrypted_payload, secret, ttl: 0 });
// //             const decryptedBase64 = token.decode();

// //             // 4. Overwrite the Raw Original File!
// //             const fileBuffer = Buffer.from(decryptedBase64, 'base64');
// //             await supabase.storage.from('original-files').upload(doc.original_file_path, fileBuffer, {
// //                 upsert: true
// //             });
// //         }

// //         // 5. Update DB timestamp
// //         await supabase.from('documents').update({ updated_at: new Date().toISOString() }).eq('id', doc_id);

// //         return NextResponse.json({ success: true, message: "Both Vault & Original Sync Complete!" });
// //     } catch (error) {
// //         console.error('Update Error:', error);
// //         return NextResponse.json({ error: error.message }, { status: 500 });
// //     }
// // }










// // import { createClient } from '@supabase/supabase-js';
// // import { NextResponse } from 'next/server';

// // const supabase = createClient(
// //     process.env.NEXT_PUBLIC_SUPABASE_URL,
// //     process.env.SUPABASE_SERVICE_ROLE_KEY
// // );

// // export async function POST(req) {
// //     try {
// //         const body = await req.json();
// //         const { doc_id, new_encrypted_payload } = body;

// //         // 1. Get current file paths
// //         const { data: doc, error: fetchErr } = await supabase.from('documents').select('file_path').eq('id', doc_id).single();
// //         if (fetchErr) throw fetchErr;

// //         // 2. Overwrite the Encrypted Vault File
// //         const { error: uploadErr } = await supabase.storage.from('vault-files').upload(doc.file_path, Buffer.from(new_encrypted_payload), {
// //             contentType: 'text/plain',
// //             upsert: true // 🔥 Overwrites the old file!
// //         });
// //         if (uploadErr) throw uploadErr;

// //         // 3. Update DB timestamp & version
// //         await supabase.from('documents').update({ updated_at: new Date().toISOString() }).eq('id', doc_id);

// //         return NextResponse.json({ success: true, message: "Vault Sync Complete" });
// //     } catch (error) {
// //         console.error('Update Error:', error);
// //         return NextResponse.json({ error: error.message }, { status: 500 });
// //     }
// // }