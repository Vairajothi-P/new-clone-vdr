import { NextResponse } from 'next/server';
import { db } from '@/db';
import { userGroups } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req) {
    try {
        const { session, groupId, userIdToRemove } = await req.json();
        if (!session || !session.company_id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await db.delete(userGroups)
            .where(
                and(
                    eq(userGroups.userId, userIdToRemove),
                    eq(userGroups.groupId, groupId)
                )
            );

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}