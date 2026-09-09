import { NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const channelId = searchParams.get('channelId');

        if (!channelId) {
            return NextResponse.json({ error: "Channel ID is required" }, { status: 400 });
        }

        const channelMessages = await db.select()
            .from(messages)
            .where(eq(messages.channelId, channelId))
            .orderBy(asc(messages.createdAt));

        return NextResponse.json({ success: true, messages: channelMessages });
    } catch (error) {
        console.error("Fetch Messages API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const payload = await req.json();
        const { channelId, senderId, messageText, messageType = 'text', attachments = [] } = payload;

        if (!channelId || !senderId || !messageText) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const [newMessage] = await db.insert(messages).values({
            channelId,
            senderId,
            messageText,
            messageType,
            attachments
        }).returning();

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error) {
        console.error("Send Message API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
