import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);


export async function POST(req) {
    console.log("DEBUG: URL is set?", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("DEBUG: Key is set?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();

    // 🔥 FIX: Ensure file_size_bytes is a real integer
    const fileSize = parseInt(body.file_size_bytes, 10);

    const { data, error } = await supabase
        .from('documents')
        .insert({
            company_id: body.company_id,
            folder_id: body.folder_id || null,
            uploaded_by: body.uploaded_by,
            name: body.name,
            file_path: body.file_path || 'vault_storage_path', // Ensure this isn't null
            mime_type: body.mime_type,
            file_size_bytes: fileSize, // 🔥 NOW AN INTEGER
            dek_ref: body.dek_ref,
            index: body.index,
            security: body.security,
            is_deleted: body.is_deleted || false,
            is_bookmarked: body.is_bookmarked || false,
            is_downloaded: body.is_downloaded || false,
            version: body.version || 1,
            file_data: body.file_data,
        })
        .select('id')
        .single();

    if (error) {
        console.error('Supabase insert error:', error);
        return NextResponse.json({
            error: error.message,
            details: error.details,
            hint: error.hint
        }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
}





// export async function POST(req) {
//     const body = await req.json();

//     const { data, error } = await supabase
//         .from('documents')
//         .insert({
//             company_id:      body.company_id,
//             folder_id:       body.folder_id,
//             uploaded_by:     body.uploaded_by,
//             name:            body.name,
//             file_path:       body.file_data,
//             mime_type:       body.mime_type,
//             file_size_bytes: body.file_size_bytes,
//             dek_ref:         body.dek_ref,
//             index:           body.index,
//             security:        body.security,
//             is_deleted:      body.is_deleted,
//             is_bookmarked:   body.is_bookmarked,
//             is_downloaded:   body.is_downloaded,
//             version:         body.version,
//             file_data:       body.file_data,
//         })
//         .select('id')
//         .single();

//     if (error) {
//         console.error('Supabase insert error:', error);
//         return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 });
//     }
//     return NextResponse.json({ id: data.id });
// }