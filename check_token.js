import { db } from './db/index.js';
import { invitations } from './db/schema.js';
import { eq } from 'drizzle-orm';

async function checkToken() {
    const token = '0bac49ab-1247-41d1-9eee-792d1c5b2c6b';
    try {
        const inv = await db.select().from(invitations).where(eq(invitations.token, token));
        console.log("Invitation data:", inv);
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit(0);
}
checkToken();
