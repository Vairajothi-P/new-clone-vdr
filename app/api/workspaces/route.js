import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const company_id = searchParams.get('company_id');
        const user_id = searchParams.get('user_id');
        const role = searchParams.get('role');

        if (!company_id || !user_id) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        if (role === 'super_admin') {
            // Super admins see all workspaces in their company
            const { data, error } = await supabaseAdmin
                .from('workspaces')
                .select('*')
                .eq('company_id', company_id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return NextResponse.json({ workspaces: data, success: true });
        } else {
            // Normal users see only workspaces they are members of
            const { data: memberData, error: memberError } = await supabaseAdmin
                .from('workspace_members')
                .select('workspace_id')
                .eq('user_id', user_id);

            if (memberError) throw memberError;

            const workspaceIds = memberData.map(m => m.workspace_id);

            if (workspaceIds.length === 0) {
                return NextResponse.json({ workspaces: [], success: true });
            }

            const { data, error } = await supabaseAdmin
                .from('workspaces')
                .select('*')
                .in('id', workspaceIds)
                .eq('status', 'Active')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return NextResponse.json({ workspaces: data, success: true });
        }
    } catch (err) {
        console.error('Workspaces GET error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, description, company_id, user_id, role } = body;

        if (role !== 'super_admin') {
            return NextResponse.json({ error: "Unauthorized. Only Super Admins can create workspaces." }, { status: 403 });
        }

        if (!name || !company_id) {
            return NextResponse.json({ error: "Name and company_id are required" }, { status: 400 });
        }

        // Insert new workspace
        const { data, error } = await supabaseAdmin
            .from('workspaces')
            .insert([
                { 
                    name, 
                    description: description || null, 
                    company_id, 
                    created_by: user_id 
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Automatically add the creator (super admin) as a member of this workspace
        const { error: memberError } = await supabaseAdmin
            .from('workspace_members')
            .insert([
                {
                    workspace_id: data.id,
                    user_id: user_id,
                    workspace_role: 'admin',
                    added_by: user_id
                }
            ]);
            
        if (memberError) {
             console.error('Failed to add creator as workspace member:', memberError);
             // We won't fail the whole request here, but log it
        }

        return NextResponse.json({ workspace: data, success: true });
    } catch (err) {
        console.error('Workspaces POST error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
