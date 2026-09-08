import { NextResponse } from 'next/server';
import { db } from '@/db';
import { communicationChannels } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const workspaceId = searchParams.get('workspaceId');
        
        if (!workspaceId) {
            return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
        }

        const channels = await db.select()
            .from(communicationChannels)
            .where(eq(communicationChannels.workspaceId, workspaceId));

        return NextResponse.json({ success: true, channels });
    } catch (error) {
        console.error("Fetch Channels API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const payload = await req.json();
        const { companyId, workspaceId, name, description, type, visibility, createdBy } = payload;

        if (!companyId || !name || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [newChannel] = await db.insert(communicationChannels).values({
            companyId,
            workspaceId,
            name,
            description,
            type,
            visibility,
            createdBy
        }).returning();

        return NextResponse.json({ success: true, channel: newChannel });
    } catch (error) {
        console.error("Create Channel API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
