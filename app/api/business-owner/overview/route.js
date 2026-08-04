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

    // 1. Fetch real companies/organizations from database
    const { data: companies, error: compErr } = await supabase
      .from('companies')
      .select('*');

    if (compErr) {
      console.warn('Error fetching companies for BO overview:', compErr);
    }
    const orgList = companies || [];
    const totalOrganizations = orgList.length;
    const activeOrgs = orgList.filter(c => c.status === 'active' || !c.status).length;
    const trialOrgs = orgList.filter(c => c.status === 'trial' || c.status === 'pending').length;

    // 2. Fetch real users count from database
    const { data: users, error: usersErr } = await supabase
      .from('users')
      .select('id, company_id, status');

    if (usersErr) {
      console.warn('Error fetching users for BO overview:', usersErr);
    }
    const totalUsers = (users || []).length;

    // 3. Fetch real plans from database
    const { data: plans, error: plansErr } = await supabase
      .from('plans')
      .select('*');

    if (plansErr) {
      console.warn('Error fetching plans for BO overview:', plansErr);
    }
    const activePlansCount = (plans || []).filter(p => p.status === 'active' || !p.status).length || (plans || []).length || 3;

    // 4. Calculate Plan distribution counts
    const planCounts = {};
    orgList.forEach((c) => {
      const p = c.plan_name || 'Standard VDR';
      planCounts[p] = (planCounts[p] || 0) + 1;
    });

    // 5. Fetch real storage usage from documents table & limits from subscriptions
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
      totalLimitMb = totalOrganizations * 100000; // default 100 GB per organization
    } else if (totalLimitMb === 0) {
      totalLimitMb = 100000;
    }
    const storageLimitGb = Math.max(1, Math.round(totalLimitMb / 1024));
    const storagePercentage = Math.min(100, Math.round((storageUsedGb / storageLimitGb) * 100));

    // 6. Generate real recent activity stream from recently created/updated companies
    const recentActivity = [];
    const sortedCompanies = [...orgList]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);

    sortedCompanies.forEach((comp, index) => {
      recentActivity.push({
        id: `comp-log-${comp.id || index}`,
        action: comp.status === 'active' ? 'Organization Active' : 'Organization Registered',
        description: `Tenant '${comp.name}' provisioned with ${comp.plan_name || 'Standard VDR'} plan.`,
        timestamp: comp.created_at ? new Date(comp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        iconType: 'org',
      });
    });

    if (recentActivity.length === 0) {
      recentActivity.push({
        id: 'log-default',
        action: 'System Ready',
        description: 'VDR Command Center initialized and connected to live Supabase database.',
        timestamp: 'Now',
        iconType: 'security',
      });
    }

    return NextResponse.json({
      totalOrganizations,
      activeOrgs,
      trialOrgs,
      totalUsers,
      storageUsedGb,
      storageLimitGb,
      storagePercentage,
      activePlansCount,
      planCounts,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching real BO overview stats from Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
