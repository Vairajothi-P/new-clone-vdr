import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!id) {
            return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('workspaces')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ workspace: data, success: true });
    } catch (err) {
        console.error('Workspace PUT error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('workspaces')
            .update({ status: 'Deleted' })
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Workspace DELETE error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
