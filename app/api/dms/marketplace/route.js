import { db } from '../../../../db';
import { dmsTeasers, dmsProjects } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const activeTeasers = await db
      .select({
        id: dmsTeasers.id,
        projectId: dmsTeasers.projectId,
        projectName: dmsProjects.name,
        name: dmsTeasers.dealName,
        sector: dmsTeasers.sector,
        geography: dmsTeasers.geography,
        overview: dmsTeasers.companyOverview,
        revenue: dmsTeasers.revenue,
        ebitda: dmsTeasers.ebitda,
        growth: dmsTeasers.yoyGrowth,
        employees: dmsTeasers.employees,
        status: dmsTeasers.status
      })
      .from(dmsTeasers)
      .innerJoin(dmsProjects, eq(dmsTeasers.projectId, dmsProjects.id))
      .where(eq(dmsTeasers.status, 'Active'));

    return NextResponse.json({ teasers: activeTeasers }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch marketplace teasers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
