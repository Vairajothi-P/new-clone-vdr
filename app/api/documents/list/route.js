import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const company_id = searchParams.get('company_id');

        const { data, error } = await supabase
            .from('documents')
            .select('id, name, folder_id, index, mime_type, file_size_bytes, uploaded_by, created_at, security, is_deleted, is_bookmarked, is_downloaded')
            .eq('company_id', company_id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Fetch error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ documents: data });
    } catch (err) {
        console.error('Route crash:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}