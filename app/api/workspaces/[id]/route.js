// import { createClient } from '@supabase/supabase-js';
// import { NextResponse } from 'next/server';

// const supabaseAdmin = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// export async function PUT(req, { params }) {
//     try {
//         const { id } = await params;
//         const body = await req.json();
//         const { status } = body;

//         if (!id) {
//             return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
//         }

//         const { data, error } = await supabaseAdmin
//             .from('workspaces')
//             .update({ status })
//             .eq('id', id)
//             .select()
//             .single();

//         if (error) throw error;

//         return NextResponse.json({ workspace: data, success: true });
//     } catch (err) {
//         console.error('Workspace PUT error:', err);
//         return NextResponse.json({ error: err.message }, { status: 500 });
//     }
// }

// export async function DELETE(req, { params }) {
//     try {
//         const { id } = await params;

//         if (!id) {
//             return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
//         }

//         const { error } = await supabaseAdmin
//             .from('workspaces')
//             .update({ status: 'Deleted' })
//             .eq('id', id);

//         if (error) throw error;

//         return NextResponse.json({ success: true });
//     } catch (err) {
//         console.error('Workspace DELETE error:', err);
//         return NextResponse.json({ error: err.message }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaces } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        if (!id) {
            return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
        }

        const updatedData = await db.update(workspaces)
            .set({ status })
            .where(eq(workspaces.id, id))
            .returning();

        const ws = updatedData[0];

        const formattedWorkspace = ws ? {
            id: ws.id,
            company_id: ws.companyId,
            name: ws.name,
            description: ws.description,
            status: ws.status,
            created_by: ws.createdBy,
            created_at: ws.createdAt,
            updated_at: ws.updatedAt
        } : null;

        return NextResponse.json({ workspace: formattedWorkspace, success: true });
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

        await db.update(workspaces)
            .set({ status: 'Deleted' })
            .where(eq(workspaces.id, id));

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Workspace DELETE error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
