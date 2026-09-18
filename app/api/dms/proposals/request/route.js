import { db } from '../../../../../db';
import { dmsDealProposals, dmsTeasers, users } from '../../../../../db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    const { projectId, buyerId, message } = data;

    if (!projectId || !buyerId) {
      return NextResponse.json({ error: 'Missing required fields: projectId or buyerId' }, { status: 400 });
    }

    // Find the teaser for this project
    const [teaser] = await db.select().from(dmsTeasers).where(eq(dmsTeasers.projectId, projectId));
    if (!teaser) {
      return NextResponse.json({ error: 'Teaser not found for this project' }, { status: 404 });
    }

    // Check if proposal already exists for this buyer and teaser
    const [existingProposal] = await db.select().from(dmsDealProposals)
      .where(and(
        eq(dmsDealProposals.teaserId, teaser.id),
        eq(dmsDealProposals.buyerId, buyerId)
      ));

    if (existingProposal) {
      // Return 409 Conflict if already requested
      return NextResponse.json({ error: 'Access already requested' }, { status: 409 });
    }

    // Insert new proposal
    const [newProposal] = await db.insert(dmsDealProposals).values({
      teaserId: teaser.id,
      buyerId,
      status: 'pending',
      message
    }).returning();

    // Update the buyer's user profile with the provided details
    // If they already have these set, this will just overwrite them with their latest submission
    await db.update(users)
      .set({
        name: data.fullName || undefined,
        companyName: data.company || undefined,
        jobTitle: data.jobTitle || undefined,
        investorType: data.investorType || undefined,
        investmentRange: data.investmentRange || undefined,
        updatedAt: new Date()
      })
      .where(eq(users.id, buyerId));

    return NextResponse.json({ success: true, proposal: newProposal }, { status: 201 });
  } catch (error) {
    console.error('Failed to create deal proposal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const proposalId = searchParams.get('proposalId');

    if (!proposalId) {
      return NextResponse.json({ error: 'Missing proposalId' }, { status: 400 });
    }

    await db.delete(dmsDealProposals).where(eq(dmsDealProposals.id, proposalId));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete proposal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

