import { db } from '../../../../db';
import { dmsTeasers } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const [teaser] = await db.select().from(dmsTeasers).where(eq(dmsTeasers.projectId, projectId));
    
    return NextResponse.json({ teaser: teaser || null }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch teaser:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { projectId, dealName, sector, geography, companyOverview, revenue, ebitda, yoyGrowth, employees, status } = data;

    if (!projectId || !dealName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if teaser already exists
    const [existingTeaser] = await db.select().from(dmsTeasers).where(eq(dmsTeasers.projectId, projectId));

    if (existingTeaser) {
      // Update
      const [updatedTeaser] = await db.update(dmsTeasers).set({
        dealName,
        sector,
        geography,
        companyOverview,
        revenue,
        ebitda,
        yoyGrowth,
        employees,
        status: status || 'draft',
        updatedAt: new Date()
      }).where(eq(dmsTeasers.projectId, projectId)).returning();
      
      return NextResponse.json({ teaser: updatedTeaser, message: 'Updated successfully' }, { status: 200 });
    } else {
      // Insert
      const [newTeaser] = await db.insert(dmsTeasers).values({
        projectId,
        dealName,
        sector,
        geography,
        companyOverview,
        revenue,
        ebitda,
        yoyGrowth,
        employees,
        status: status || 'draft'
      }).returning();
      
      return NextResponse.json({ teaser: newTeaser, message: 'Created successfully' }, { status: 201 });
    }
  } catch (error) {
    console.error('Failed to save teaser:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    // Instead of completely deleting, we can just set status back to 'draft' or 'inactive'
    // This removes it from the Marketplace but keeps the seller's data
    await db.update(dmsTeasers)
      .set({ status: 'draft', updatedAt: new Date() })
      .where(eq(dmsTeasers.projectId, projectId));
    
    return NextResponse.json({ success: true, message: 'Teaser removed from marketplace' }, { status: 200 });
  } catch (error) {
    console.error('Failed to remove teaser:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
