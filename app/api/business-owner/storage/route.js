import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data: companies } = await supabase.from('companies').select('id');
    const totalOrganizations = (companies || []).length;

    const { data: docs } = await supabase
      .from('documents')
      .select('file_size_bytes');

    const totalUsedBytes = (docs || []).reduce((acc, d) => acc + (Number(d.file_size_bytes) || 0), 0);
    const storageUsedGb = Math.max(0, Math.round(totalUsedBytes / (1024 * 1024 * 1024)));

    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('storage_limit_mb');

    let totalLimitMb = (subscriptions || []).reduce((acc, s) => acc + (Number(s.storage_limit_mb) || 0), 0);
    if (totalLimitMb === 0 && totalOrganizations > 0) {
      totalLimitMb = totalOrganizations * 100000;
    } else if (totalLimitMb === 0) {
      totalLimitMb = 100000;
    }
    const storageLimitGb = Math.max(1, Math.round(totalLimitMb / 1024));

    return NextResponse.json({
      storageUsedGb,
      storageLimitGb,
    });
  } catch (error) {
    console.error('Error fetching real storage stats from Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage stats' },
      { status: 500 }
    );
  }
}
