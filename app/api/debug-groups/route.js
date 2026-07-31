import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function GET() {
    const { data: groups } = await supabase.from('groups').select('*').limit(5);
    const { data: users } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5);
    const { data: user_groups } = await supabase.from('user_groups').select('*').order('created_at', { ascending: false }).limit(5);
    const { data: workspace_members } = await supabase.from('workspace_members').select('*').order('created_at', { ascending: false }).limit(5);
    const { data: invitations } = await supabase.from('invitations').select('*, groups(name,company_id,role,workspace_id)').order('created_at', { ascending: false }).limit(5);

    return NextResponse.json({ groups, users, user_groups, workspace_members, invitations });
}
