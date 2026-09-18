import { db } from '../../../../db';
import { users } from '../../../../db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const buyersList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      companyName: users.companyName
    })
    .from(users)
    .where(eq(users.dmsRole, 'buyer'));

    return NextResponse.json({ buyers: buyersList }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch buyers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
