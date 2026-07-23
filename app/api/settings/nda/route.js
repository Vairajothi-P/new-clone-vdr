import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req) {
    try {
        const { action, session, payload } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const compId = session.company_id;

        // 1. Fetch Real Users
        if (action === 'fetch_users') {
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, created_at, nda_status, nda_accepted_at')
                .eq('company_id', compId);
            if (error) throw error;
            return NextResponse.json({ success: true, users: data || [] });
        }

        // 2. Force Old User to Sign NDA
        if (action === 'require_nda') {
            const { userId } = payload;
            const { error } = await supabase.from('users').update({ nda_status: 'pending' }).eq('id', userId).eq('company_id', compId);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        // 3. Fetch NDA Text
        if (action === 'fetch_text') {
            const { data, error } = await supabase.from('companies').select('nda_text').eq('id', compId).single();
            if (error && error.code !== 'PGRST116') throw error; // Ignore not found error if empty
            return NextResponse.json({ success: true, nda_text: data?.nda_text || '' });
        }

        // 4. Save NDA Text
        if (action === 'save_text') {
            const { text } = payload;
            const { error } = await supabase.from('companies').update({ nda_text: text }).eq('id', compId);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}