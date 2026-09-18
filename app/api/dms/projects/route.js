import { NextResponse } from 'next/server';
import { db } from '@/db';
import { dmsProjects } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    const projects = await db.select().from(dmsProjects).where(eq(dmsProjects.companyId, companyId));
    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, companyId } = await req.json();

    if (!name || !companyId) {
      return NextResponse.json({ error: 'Missing name or companyId' }, { status: 400 });
    }

    const [newProject] = await db.insert(dmsProjects).values({
      name,
      companyId,
      status: 'ACTIVE'
    }).returning();

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
