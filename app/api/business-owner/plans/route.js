import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assignPlanToOrganization } from '@/lib/business-owner/store';

// Helper to create Supabase client
const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Map DB columns to what the frontend expects
    const plans = data.map(plan => ({
      id: plan.id,
      name: plan.name,
      price: plan.price || 'Custom',
      storageLimitMb: plan.storage_limit_mb || 0,
      maxUsers: plan.users_limit,
      description: plan.description || '',
      features: plan.features || [],
      status: plan.status,
    }));

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.name || !body.price) {
      return NextResponse.json({ error: 'Plan name and price are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        name: body.name,
        price: body.price,
        storage_limit_mb: body.storageLimitMb,
        users_limit: body.maxUsers,
        description: body.description,
        features: body.features || [],
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, plan: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('plans')
      .update({
        name: body.name,
        price: body.price,
        storage_limit_mb: body.storageLimitMb,
        users_limit: body.maxUsers,
        description: body.description,
        features: body.features || [],
      })
      .eq('id', body.planId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, plan: data });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json();
    if (body.action === 'assign') {
      const { orgId, planName } = body;
      if (!orgId || !planName) {
        return NextResponse.json({ error: 'orgId and planName are required' }, { status: 400 });
      }
      // Note: organizations are still using the dummy store for now.
      const updatedOrg = await assignPlanToOrganization(orgId, planName);
      return NextResponse.json({ success: true, organization: updatedOrg });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error in plans patch:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
