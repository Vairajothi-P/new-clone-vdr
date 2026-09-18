import { db } from '../../../../db';
import { dmsDealProposals, dmsTeasers, dmsProjects, users, dmsDeals } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get('buyerId');

    if (!buyerId) {
      return NextResponse.json({ error: 'Missing buyerId' }, { status: 400 });
    }

    // Fetch proposals for the buyer, join with teasers, projects, users and dmsDeals to get ndaStatus
    const proposals = await db.select({
      id: dmsDealProposals.id,
      status: dmsDealProposals.status,
      dateSubmitted: dmsDealProposals.createdAt,
      projectName: dmsProjects.name,
      projectId: dmsProjects.id,
      fullName: users.name,
      email: users.email,
      company: users.companyName,
      jobTitle: users.jobTitle,
      investorType: users.investorType,
      ndaStatus: dmsDeals.ndaStatus
    })
    .from(dmsDealProposals)
    .innerJoin(dmsTeasers, eq(dmsDealProposals.teaserId, dmsTeasers.id))
    .innerJoin(dmsProjects, eq(dmsTeasers.projectId, dmsProjects.id))
    .innerJoin(users, eq(dmsDealProposals.buyerId, users.id))
    .leftJoin(dmsDeals, eq(dmsDeals.proposalId, dmsDealProposals.id))
    .where(eq(dmsDealProposals.buyerId, buyerId));

    // Format the date to match what the UI expects (e.g. 'Oct 24, 2023')
    const formattedProposals = proposals.map(p => ({
      ...p,
      dateSubmitted: new Date(p.dateSubmitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      ndaStatus: p.ndaStatus || 'pending'
    }));

    return NextResponse.json({ requests: formattedProposals }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch tracker requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
